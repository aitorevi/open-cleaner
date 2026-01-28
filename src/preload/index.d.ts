import { ElectronAPI } from '@electron-toolkit/preload'
import { App, JunkFile } from '../shared/domain/App.entity'

interface UninstallReport {
  appName: string
  appPath: string
  mainAppDeleted: boolean
  junkFilesDeleted: Array<{ path: string; type: string; size: number }>
  totalSpaceFreed: number
  errors: string[]
}

interface ThemeChangeEvent {
  shouldUseDarkColors: boolean
  themeSource: string
}

interface OpenCleanerAPI {
  checkPermissions: () => Promise<{ hasPermissions: boolean }>
  scanApplications: () => Promise<App[]>
  findJunkFiles: (appName: string) => Promise<JunkFile[]>
  moveToTrash: (path: string) => Promise<{ success: boolean; error?: string }>
  uninstallApp: (
    appName: string,
    appPath: string,
    appSize: number
  ) => Promise<{ success: boolean; report?: UninstallReport; error?: string }>
  onThemeChange: (callback: (event: ThemeChangeEvent) => void) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: OpenCleanerAPI
  }
}
