import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  checkPermissions: () => ipcRenderer.invoke('check-permissions'),
  scanApplications: () => ipcRenderer.invoke('scan-applications'),
  findJunkFiles: (appName: string) => ipcRenderer.invoke('find-junk-files', appName),
  moveToTrash: (path: string) => ipcRenderer.invoke('move-to-trash', path),
  uninstallApp: (appName: string, appPath: string) => ipcRenderer.invoke('uninstall-app', appName, appPath)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
