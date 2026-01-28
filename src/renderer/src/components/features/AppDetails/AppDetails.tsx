import React, { useState } from 'react'
import { Folder, Info } from 'lucide-react'
import { App } from '../../../../../shared/domain/App.entity'
import { Button } from '../../ui/Button'
import { StorageChart } from './StorageChart'
import { JunkFilesList } from './JunkFilesList'
import { formatBytes } from '../../../utils/formatters'
import { motion } from 'framer-motion'
import './AppDetails.css'

interface AppDetailsProps {
  app: App
  onUninstall: (app: App) => void
}

export const AppDetails = React.memo(function AppDetails({ app, onUninstall }: AppDetailsProps) {
  const [junkSize, setJunkSize] = useState(0)

  return (
    <motion.div
      className="app-details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="app-details__header">
        <div className="app-details__header-icon">
          {app.icon ? (
            <img src={app.icon} alt={`${app.name} icon`} className="app-details__icon-img" />
          ) : (
            <Folder size={48} strokeWidth={1.5} />
          )}
        </div>
        <div className="app-details__header-info">
          <h2 className="app-details__name">{app.name}</h2>
          {app.version && (
            <p className="app-details__version">Version {app.version}</p>
          )}
        </div>
      </div>

      {/* Two Column Layout for Desktop */}
      <div className="app-details__content-grid">
        <div className="app-details__left-column">
          {/* Info Cards */}
          <div className="app-details__info-cards">
            <div className="app-details__info-card">
              <div className="app-details__info-card-icon">
                <Info size={20} />
              </div>
              <div className="app-details__info-card-content">
                <p className="app-details__info-card-label">Path</p>
                <p className="app-details__info-card-value" title={app.path}>
                  {app.path}
                </p>
              </div>
            </div>

            <div className="app-details__info-card">
              <div className="app-details__info-card-icon app-details__info-card-icon--accent">
                💾
              </div>
              <div className="app-details__info-card-content">
                <p className="app-details__info-card-label">Application Size</p>
                <p className="app-details__info-card-value app-details__info-card-value--large">
                  {formatBytes(app.size)}
                </p>
              </div>
            </div>
          </div>

          {/* Storage Chart */}
          <StorageChart appSize={app.size} junkSize={junkSize} appName={app.name} />
        </div>

        <div className="app-details__right-column">
          {/* Junk Files List */}
          <JunkFilesList appName={app.name} onJunkSizeChange={setJunkSize} />
        </div>
      </div>

      {/* Actions */}
      <div className="app-details__actions">
        <Button
          variant="destructive"
          size="lg"
          onClick={() => onUninstall(app)}
        >
          Uninstall Application
        </Button>
      </div>
    </motion.div>
  )
})
