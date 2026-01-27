import { ipcMain } from 'electron'
import { NodeFileSystemAdapter } from '../adapters/NodeFileSystemAdapter'
import { MacOSAppScannerAdapter } from '../adapters/MacOSAppScannerAdapter'
import { CheckPermissionsUseCase } from '../usecases/CheckPermissions.usecase'
import { ScanApplicationsUseCase } from '../usecases/ScanApplications.usecase'
import { FindJunkFilesUseCase } from '../usecases/FindJunkFiles.usecase'
import { MoveToTrashUseCase } from '../usecases/MoveToTrash.usecase'

// Initialize adapters
const fileSystemAdapter = new NodeFileSystemAdapter()
const appScannerAdapter = new MacOSAppScannerAdapter(fileSystemAdapter)

// Initialize use cases
const checkPermissionsUseCase = new CheckPermissionsUseCase()
const scanApplicationsUseCase = new ScanApplicationsUseCase(appScannerAdapter)
const findJunkFilesUseCase = new FindJunkFilesUseCase(appScannerAdapter)
const moveToTrashUseCase = new MoveToTrashUseCase(fileSystemAdapter)

export function registerIpcHandlers(): void {
  // Check permissions handler
  ipcMain.handle('check-permissions', async () => {
    try {
      return await checkPermissionsUseCase.execute()
    } catch (error) {
      console.error('Error in check-permissions handler:', error)
      return { hasPermissions: false }
    }
  })

  // Scan applications handler
  ipcMain.handle('scan-applications', async () => {
    try {
      return await scanApplicationsUseCase.execute()
    } catch (error) {
      console.error('Error in scan-applications handler:', error)
      return []
    }
  })

  // Find junk files handler
  ipcMain.handle('find-junk-files', async (_event, appName: string) => {
    try {
      return await findJunkFilesUseCase.execute(appName)
    } catch (error) {
      console.error('Error in find-junk-files handler:', error)
      return []
    }
  })

  // Move to trash handler
  ipcMain.handle('move-to-trash', async (_event, path: string) => {
    try {
      await moveToTrashUseCase.execute(path)
      return { success: true }
    } catch (error) {
      console.error('Error in move-to-trash handler:', error)
      const errorMessage = (error as Error).message || 'Error desconocido al mover a la papelera'
      return { success: false, error: errorMessage }
    }
  })

  // Uninstall app with full report
  ipcMain.handle('uninstall-app', async (_event, appName: string, appPath: string) => {
    try {
      const report = {
        appName,
        appPath,
        mainAppDeleted: false,
        junkFilesDeleted: [] as Array<{ path: string; type: string; size: number }>,
        totalSpaceFreed: 0,
        errors: [] as string[]
      }

      // 1. Find junk files first (before deleting the app)
      console.log(`🔍 Searching junk files for: ${appName}`)
      const junkFiles = await findJunkFilesUseCase.execute(appName)
      console.log(`📁 Found ${junkFiles.length} junk files for ${appName}:`)
      junkFiles.forEach((jf, index) => {
        console.log(`   ${index + 1}. ${jf.path} (${jf.type}, ${jf.size} bytes)`)
      })

      // 2. Delete main app
      console.log(`🗑️ Attempting to delete main app: ${appPath}`)
      try {
        await moveToTrashUseCase.execute(appPath)
        report.mainAppDeleted = true
        console.log(`✅ Main app deleted: ${appPath}`)
      } catch (error) {
        const errorMsg = `No se pudo eliminar la aplicación principal: ${(error as Error).message}`
        report.errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }

      // 3. Delete junk files
      console.log(`🧹 Starting junk files deletion (${junkFiles.length} files)...`)
      for (let i = 0; i < junkFiles.length; i++) {
        const junkFile = junkFiles[i]
        console.log(`   Processing [${i + 1}/${junkFiles.length}]: ${junkFile.path}`)
        try {
          await moveToTrashUseCase.execute(junkFile.path)
          report.junkFilesDeleted.push({
            path: junkFile.path,
            type: junkFile.type,
            size: junkFile.size
          })
          report.totalSpaceFreed += junkFile.size
          console.log(`   ✅ Junk file deleted: ${junkFile.path}`)
        } catch (error) {
          const errorMsg = `No se pudo eliminar: ${junkFile.path} - ${(error as Error).message}`
          report.errors.push(errorMsg)
          console.error(`   ❌ ${errorMsg}`)
        }
      }

      console.log(`📊 Uninstall report for ${appName}:`)
      console.log(`   - Main app deleted: ${report.mainAppDeleted}`)
      console.log(`   - Junk files deleted: ${report.junkFilesDeleted.length}/${junkFiles.length}`)
      console.log(`   - Total space freed: ${report.totalSpaceFreed} bytes`)
      console.log(`   - Errors: ${report.errors.length}`)

      return { success: true, report }
    } catch (error) {
      console.error('Error in uninstall-app handler:', error)
      return {
        success: false,
        error: (error as Error).message || 'Error desconocido al desinstalar'
      }
    }
  })
}
