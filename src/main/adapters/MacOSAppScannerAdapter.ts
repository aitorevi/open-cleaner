import * as path from 'path'
import * as os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'
import { IAppScannerPort } from '../ports/IAppScannerPort'
import { App, JunkFile } from '../../shared/domain/App.entity'
import { IFileSystemPort } from '../ports/IFileSystemPort'

const execAsync = promisify(exec)

export class MacOSAppScannerAdapter implements IAppScannerPort {
  constructor(private fileSystem: IFileSystemPort) {}

  async scanApplications(appPath: string): Promise<App[]> {
    const apps: App[] = []

    try {
      const entries = await this.fileSystem.readDirectory(appPath)

      for (const entry of entries) {
        if (entry.endsWith('.app')) {
          const fullPath = path.join(appPath, entry)
          const stats = await this.fileSystem.getStats(fullPath)

          if (stats.isDirectory) {
            const appName = entry.replace('.app', '')

            // Try to get app version from Info.plist
            let version: string | undefined
            try {
              const infoPlistPath = path.join(fullPath, 'Contents', 'Info.plist')
              if (await this.fileSystem.checkAccess(infoPlistPath)) {
                // We could parse plist here, but for MVP we'll skip it
                version = undefined
              }
            } catch (error) {
              console.warn(`Could not read Info.plist for ${appName}`)
            }

            // Calculate size using system's du command (handles symlinks correctly)
            const size = await this.getDirectorySizeWithDu(fullPath)

            // Extract app icon
            const icon = await this.extractAppIcon(fullPath, appName)

            apps.push({
              name: appName,
              path: fullPath,
              version,
              size,
              icon
            })
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning applications in ${appPath}:`, error)
    }

    return apps
  }

  private isOpenCleanerFile(filePath: string): boolean {
    // Exclude OpenCleaner's own files from search results
    const openCleanerPatterns = [
      'com.opencleaner.app',
      'com.opensource.opencleaner',
      'opencleaner.app',
      '/OpenCleaner/',
      'opencleaner-'
    ]

    const pathLower = filePath.toLowerCase()
    return openCleanerPatterns.some((pattern) => pathLower.includes(pattern.toLowerCase()))
  }

  private shouldExcludeFile(filePath: string, appName: string): boolean {
    // Exclude OpenCleaner's own files
    if (this.isOpenCleanerFile(filePath)) {
      return true
    }

    // Exclude app extensions (ShareExtension, Today Extension, etc.)
    // These are often in use and protected by the system
    const extensionPatterns = [
      '.ShareExtension',
      '.TelegramShare',
      '.NotificationServiceExtension',
      '.NotificationContentExtension',
      '.TodayExtension',
      '.MessagesExtension',
      '.IntentsExtension',
      '.IntentsUIExtension',
      'ShareExtension',
      'WidgetExtension'
    ]

    const pathLower = filePath.toLowerCase()
    if (extensionPatterns.some((pattern) => pathLower.includes(pattern.toLowerCase()))) {
      return true
    }

    // Exclude Group Containers (often shared between app and extensions)
    if (filePath.includes('/Group Containers/')) {
      return true
    }

    return false
  }

  async findJunkFiles(appName: string): Promise<JunkFile[]> {
    const junkFiles: JunkFile[] = []
    const homeDir = os.homedir()

    // Normalize app name for searching (remove spaces, lowercase for pattern matching)
    const appNameLower = appName.toLowerCase()
    const appNameNoSpaces = appName.replace(/\s+/g, '')

    // Define locations to search for junk files
    const searchLocations = [
      // Direct app name folders
      {
        path: path.join(homeDir, 'Library', 'Application Support', appName),
        type: 'support' as const
      },
      { path: path.join(homeDir, 'Library', 'Caches', appName), type: 'cache' as const },
      {
        path: path.join(homeDir, 'Library', 'Preferences', `${appName}.plist`),
        type: 'preferences' as const
      },
      { path: path.join(homeDir, 'Library', 'Logs', appName), type: 'logs' as const },
      { path: path.join(homeDir, 'Library', 'WebKit', appName), type: 'cache' as const },
      {
        path: path.join(homeDir, 'Library', 'Saved Application State', `${appName}.savedState`),
        type: 'cache' as const
      },
      // App name without spaces
      {
        path: path.join(homeDir, 'Library', 'Application Support', appNameNoSpaces),
        type: 'support' as const
      },
      { path: path.join(homeDir, 'Library', 'Caches', appNameNoSpaces), type: 'cache' as const }
    ]

    // Search for matching entries by pattern in common Library directories
    const librarySearchDirs = [
      { dir: path.join(homeDir, 'Library', 'Application Support'), type: 'support' as const },
      { dir: path.join(homeDir, 'Library', 'Caches'), type: 'cache' as const },
      { dir: path.join(homeDir, 'Library', 'Preferences'), type: 'preferences' as const },
      { dir: path.join(homeDir, 'Library', 'Logs'), type: 'logs' as const },
      { dir: path.join(homeDir, 'Library', 'Saved Application State'), type: 'cache' as const },
      { dir: path.join(homeDir, 'Library', 'HTTPStorages'), type: 'cache' as const },
      { dir: path.join(homeDir, 'Library', 'Containers'), type: 'support' as const },
      { dir: path.join(homeDir, 'Library', 'Group Containers'), type: 'support' as const }
    ]

    // Track already added paths to avoid duplicates
    const addedPaths = new Set<string>()

    // First, check direct paths
    for (const location of searchLocations) {
      if (addedPaths.has(location.path)) continue

      // Skip excluded files (OpenCleaner's own files, extensions, etc.)
      if (this.shouldExcludeFile(location.path, appName)) continue

      try {
        if (await this.fileSystem.checkAccess(location.path)) {
          const stats = await this.fileSystem.getStats(location.path)

          let size = stats.size
          if (stats.isDirectory) {
            size = await this.calculateDirectorySize(location.path)
          }

          junkFiles.push({
            path: location.path,
            type: location.type,
            size
          })
          addedPaths.add(location.path)
        }
      } catch (error) {
        // Silently ignore access errors
      }
    }

    // Then, search by pattern in Library directories
    for (const searchDir of librarySearchDirs) {
      try {
        if (!(await this.fileSystem.checkAccess(searchDir.dir))) continue

        const entries = await this.fileSystem.readDirectory(searchDir.dir)

        for (const entry of entries) {
          const entryLower = entry.toLowerCase()

          // Match patterns: exact name, bundleId patterns, or contains app name
          const matches =
            entryLower === appNameLower ||
            entryLower === `${appNameLower}.plist` ||
            entryLower.includes(`.${appNameLower}.`) ||
            entryLower.includes(`.${appNameLower}`) ||
            entryLower.endsWith(`.${appNameLower}`) ||
            entryLower.startsWith(`${appNameLower}.`) ||
            entryLower === appNameNoSpaces.toLowerCase() ||
            entryLower.includes(appNameNoSpaces.toLowerCase())

          if (matches) {
            const fullPath = path.join(searchDir.dir, entry)

            if (addedPaths.has(fullPath)) continue

            // Skip excluded files (OpenCleaner's own files, extensions, etc.)
            if (this.shouldExcludeFile(fullPath, appName)) continue

            try {
              const stats = await this.fileSystem.getStats(fullPath)
              let size = stats.size
              if (stats.isDirectory) {
                size = await this.calculateDirectorySize(fullPath)
              }

              junkFiles.push({
                path: fullPath,
                type: searchDir.type,
                size
              })
              addedPaths.add(fullPath)
            } catch (error) {
              // Silently ignore stat errors
            }
          }
        }
      } catch (error) {
        // Silently ignore directory access errors
      }
    }

    return junkFiles
  }

  private async extractAppIcon(appPath: string, appName: string): Promise<string | undefined> {
    try {
      // Look for icon file in Info.plist
      const infoPlistPath = path.join(appPath, 'Contents', 'Info.plist')

      if (!(await this.fileSystem.checkAccess(infoPlistPath))) {
        return undefined
      }

      // Get icon file name from Info.plist using PlistBuddy
      let iconFileName: string | undefined
      try {
        const { stdout } = await execAsync(
          `/usr/libexec/PlistBuddy -c "Print :CFBundleIconFile" "${infoPlistPath}"`
        )
        iconFileName = stdout.trim()
      } catch (error) {
        // If CFBundleIconFile doesn't exist, try common patterns
        iconFileName = undefined
      }

      // Common icon file patterns to try
      const resourcesPath = path.join(appPath, 'Contents', 'Resources')
      const iconsToTry: string[] = []

      if (iconFileName) {
        // Add the icon from plist (with and without .icns extension)
        iconsToTry.push(iconFileName)
        if (!iconFileName.endsWith('.icns')) {
          iconsToTry.push(`${iconFileName}.icns`)
        }
      }

      // Add common fallback patterns
      iconsToTry.push(
        'AppIcon.icns',
        'app.icns',
        `${appName}.icns`,
        'icon.icns'
      )

      // Try to find the icon file
      for (const iconFile of iconsToTry) {
        const iconPath = path.join(resourcesPath, iconFile)

        if (await this.fileSystem.checkAccess(iconPath)) {
          // Convert .icns to PNG using sips and return as base64
          return await this.convertIconToBase64(iconPath)
        }
      }

      // If no icon found, return undefined (will use fallback icon in UI)
      return undefined
    } catch (error) {
      console.warn(`Could not extract icon for ${appName}:`, error)
      return undefined
    }
  }

  private async convertIconToBase64(icnsPath: string): Promise<string | undefined> {
    try {
      // Use a safer temp directory with proper quoting
      const tempDir = os.tmpdir()
      const tempPngPath = path.join(tempDir, `opencleaner-${Date.now()}-icon.png`)

      // Escape paths for shell
      const escapedIcnsPath = icnsPath.replace(/'/g, "'\\''")
      const escapedTempPath = tempPngPath.replace(/'/g, "'\\''")

      // Convert .icns to PNG using sips (macOS built-in tool)
      // Use -Z instead of -z for better compatibility
      await execAsync(
        `sips -s format png -Z 128 '${escapedIcnsPath}' --out '${escapedTempPath}' 2>/dev/null`
      )

      // Read the PNG file and convert to base64
      const { stdout } = await execAsync(`base64 -i '${escapedTempPath}'`)
      const base64Data = stdout.trim()

      // Clean up temp file
      try {
        await execAsync(`rm '${escapedTempPath}'`)
      } catch (error) {
        // Ignore cleanup errors
      }

      // Return as data URL
      return `data:image/png;base64,${base64Data}`
    } catch (error) {
      // Silently fail - app will use fallback icon
      return undefined
    }
  }

  private async getDirectorySizeWithDu(dirPath: string): Promise<number> {
    try {
      // Use du command with -sk flag (size in KB, summarize)
      // Escape path for shell
      const escapedPath = dirPath.replace(/'/g, "'\\''")
      const { stdout } = await execAsync(`du -sk '${escapedPath}'`)

      // Parse output: "12345\t/path/to/app"
      const sizeInKB = parseInt(stdout.split('\t')[0], 10)

      // Convert KB to Bytes
      return sizeInKB * 1024
    } catch (error) {
      console.warn(`Error calculating size for ${dirPath}:`, error)
      return 0
    }
  }

  private async calculateDirectorySize(
    dirPath: string,
    depth: number = 0,
    visited: Set<string> = new Set()
  ): Promise<number> {
    // Prevent infinite recursion
    if (depth > 10 || visited.has(dirPath)) {
      return 0
    }

    visited.add(dirPath)
    let totalSize = 0

    try {
      const entries = await this.fileSystem.readDirectory(dirPath)

      for (const entry of entries) {
        // Skip known problematic directories
        if (entry === 'XCContentsDir' || entry.startsWith('.')) {
          continue
        }

        const fullPath = path.join(dirPath, entry)
        const stats = await this.fileSystem.getStats(fullPath)

        if (stats.isDirectory) {
          totalSize += await this.calculateDirectorySize(fullPath, depth + 1, visited)
        } else {
          totalSize += stats.size
        }
      }
    } catch (error) {
      // Silently ignore errors
    }

    return totalSize
  }
}
