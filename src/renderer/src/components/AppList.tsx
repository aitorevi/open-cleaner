import { useState, useEffect } from 'react'
import { App } from '../../../shared/domain/App.entity'
import './AppList.css'

export function AppList() {
  const [apps, setApps] = useState<App[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<App | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setIsLoading(true)
    try {
      const applications = await window.api.scanApplications()
      setApps(applications)
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const handleUninstall = async (app: App) => {
    if (confirm(`¿Estás seguro de que quieres desinstalar ${app.name}?`)) {
      try {
        const result = await window.api.uninstallApp(app.name, app.path, app.size)

        if (result.success && result.report) {
          const report = result.report

          // Build detailed report message
          let reportMessage = `✅ Desinstalación completada: ${report.appName}\n\n`

          // Main app status
          if (report.mainAppDeleted) {
            reportMessage += `✅ Aplicación principal eliminada\n`
          } else {
            reportMessage += `❌ No se pudo eliminar la aplicación principal\n`
          }

          // Junk files
          if (report.junkFilesDeleted.length > 0) {
            reportMessage += `\n📁 Archivos residuales eliminados (${report.junkFilesDeleted.length}):\n`
            report.junkFilesDeleted.forEach((file) => {
              const fileName = file.path.split('/').pop()
              reportMessage += `  • ${fileName} (${formatSize(file.size)})\n`
            })
          } else {
            reportMessage += `\nℹ️ No se encontraron archivos residuales\n`
          }

          // Total space freed
          reportMessage += `\n💾 Espacio liberado: ${formatSize(report.totalSpaceFreed)}\n`

          // Errors
          if (report.errors.length > 0) {
            reportMessage += `\n⚠️ Advertencias:\n`
            report.errors.forEach((error) => {
              reportMessage += `  • ${error}\n`
            })
          }

          alert(reportMessage)

          // Reload applications list
          await loadApplications()
          setSelectedApp(null)
        } else {
          alert(`❌ Error: ${result.error || 'No se pudo desinstalar la aplicación'}`)
        }
      } catch (error) {
        console.error('Error uninstalling app:', error)
        alert('❌ Error inesperado al desinstalar la aplicación')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="app-list-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Scanning applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-list-container">
      <header className="app-header">
        <h1>OpenCleaner</h1>
        <button className="refresh-button" onClick={loadApplications}>
          Refresh
        </button>
      </header>

      <div className="app-content">
        <div className="app-list-panel">
          <div className="list-header">
            <h2>Applications ({apps.length})</h2>
          </div>
          <div className="app-list">
            {apps.map((app) => (
              <div
                key={app.path}
                className={`app-item ${selectedApp?.path === app.path ? 'selected' : ''}`}
                onClick={() => setSelectedApp(app)}
              >
                <div className="app-info">
                  <div className="app-name">{app.name}</div>
                  <div className="app-size">{formatSize(app.size)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedApp && (
          <div className="app-details-panel">
            <div className="details-header">
              <h2>{selectedApp.name}</h2>
            </div>
            <div className="details-content">
              <div className="detail-row">
                <span className="detail-label">Path:</span>
                <span className="detail-value">{selectedApp.path}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Size:</span>
                <span className="detail-value">{formatSize(selectedApp.size)}</span>
              </div>
              {selectedApp.version && (
                <div className="detail-row">
                  <span className="detail-label">Version:</span>
                  <span className="detail-value">{selectedApp.version}</span>
                </div>
              )}
            </div>
            <div className="details-actions">
              <button className="uninstall-button" onClick={() => handleUninstall(selectedApp)}>
                Uninstall
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
