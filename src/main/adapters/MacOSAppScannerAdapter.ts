import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { IAppScannerPort } from '../ports/IAppScannerPort';
import { App, JunkFile } from '../../shared/domain/App.entity';
import { IFileSystemPort } from '../ports/IFileSystemPort';

const execAsync = promisify(exec);

export class MacOSAppScannerAdapter implements IAppScannerPort {
  constructor(private fileSystem: IFileSystemPort) {}

  async scanApplications(appPath: string): Promise<App[]> {
    const apps: App[] = [];

    try {
      const entries = await this.fileSystem.readDirectory(appPath);

      for (const entry of entries) {
        if (entry.endsWith('.app')) {
          const fullPath = path.join(appPath, entry);
          const stats = await this.fileSystem.getStats(fullPath);

          if (stats.isDirectory) {
            const appName = entry.replace('.app', '');

            // Try to get app version from Info.plist
            let version: string | undefined;
            try {
              const infoPlistPath = path.join(fullPath, 'Contents', 'Info.plist');
              if (await this.fileSystem.checkAccess(infoPlistPath)) {
                // We could parse plist here, but for MVP we'll skip it
                version = undefined;
              }
            } catch (error) {
              console.warn(`Could not read Info.plist for ${appName}`);
            }

            // Calculate size using system's du command (handles symlinks correctly)
            const size = await this.getDirectorySizeWithDu(fullPath);

            apps.push({
              name: appName,
              path: fullPath,
              version,
              size
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning applications in ${appPath}:`, error);
    }

    return apps;
  }

  async findJunkFiles(appName: string): Promise<JunkFile[]> {
    const junkFiles: JunkFile[] = [];
    const homeDir = os.homedir();

    // Define locations to search for junk files
    const searchLocations = [
      { path: path.join(homeDir, 'Library', 'Application Support', appName), type: 'support' as const },
      { path: path.join(homeDir, 'Library', 'Caches', appName), type: 'cache' as const },
      { path: path.join(homeDir, 'Library', 'Preferences', `${appName}.plist`), type: 'preferences' as const },
      { path: path.join(homeDir, 'Library', 'Logs', appName), type: 'logs' as const },
      { path: path.join(homeDir, 'Library', 'WebKit', appName), type: 'cache' as const }
    ];

    for (const location of searchLocations) {
      try {
        if (await this.fileSystem.checkAccess(location.path)) {
          const stats = await this.fileSystem.getStats(location.path);

          let size = stats.size;
          if (stats.isDirectory) {
            size = await this.calculateDirectorySize(location.path);
          }

          junkFiles.push({
            path: location.path,
            type: location.type,
            size
          });
        }
      } catch (error) {
        console.warn(`Could not access ${location.path}:`, error);
      }
    }

    return junkFiles;
  }

  private async getDirectorySizeWithDu(dirPath: string): Promise<number> {
    try {
      // Use du command with -sk flag (size in KB, summarize)
      // Escape path for shell
      const escapedPath = dirPath.replace(/'/g, "'\\''");
      const { stdout } = await execAsync(`du -sk '${escapedPath}'`);

      // Parse output: "12345\t/path/to/app"
      const sizeInKB = parseInt(stdout.split('\t')[0], 10);

      // Convert KB to Bytes
      return sizeInKB * 1024;
    } catch (error) {
      console.warn(`Error calculating size for ${dirPath}:`, error);
      return 0;
    }
  }

  private async calculateDirectorySize(dirPath: string, depth: number = 0, visited: Set<string> = new Set()): Promise<number> {
    // Prevent infinite recursion
    if (depth > 10 || visited.has(dirPath)) {
      return 0;
    }

    visited.add(dirPath);
    let totalSize = 0;

    try {
      const entries = await this.fileSystem.readDirectory(dirPath);

      for (const entry of entries) {
        // Skip known problematic directories
        if (entry === 'XCContentsDir' || entry.startsWith('.')) {
          continue;
        }

        const fullPath = path.join(dirPath, entry);
        const stats = await this.fileSystem.getStats(fullPath);

        if (stats.isDirectory) {
          totalSize += await this.calculateDirectorySize(fullPath, depth + 1, visited);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Silently ignore errors
    }

    return totalSize;
  }
}
