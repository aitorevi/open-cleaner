import React, { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, File, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { formatBytes } from '../../../utils/formatters'
import './UninstallReport.css'

interface JunkFileDeleted {
  path: string
  type: string
  size: number
}

interface UninstallReportProps {
  isOpen: boolean
  onClose: () => void
  appName: string
  mainAppDeleted: boolean
  junkFilesDeleted: JunkFileDeleted[]
  totalSpaceFreed: number
  errors: string[]
}

export const UninstallReport = React.memo(function UninstallReport({
  isOpen,
  onClose,
  appName,
  mainAppDeleted,
  junkFilesDeleted,
  totalSpaceFreed,
  errors
}: UninstallReportProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Group files by type
  const groupedFiles = junkFilesDeleted.reduce((acc, file) => {
    if (!acc[file.type]) {
      acc[file.type] = []
    }
    acc[file.type].push(file)
    return acc
  }, {} as Record<string, JunkFileDeleted[]>)

  const typeColors: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
    'Cache': 'warning',
    'Logs': 'info',
    'Preferences': 'default',
    'Support': 'default',
    'Application Support': 'default'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
    >
      <div className="uninstall-report">
        {/* Success Icon with Animation */}
        <motion.div
          className="uninstall-report__icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5, delay: 0.2 }}
        >
          <CheckCircle2 size={64} />
        </motion.div>

        <h2 className="uninstall-report__title">
          Successfully Uninstalled
        </h2>
        <p className="uninstall-report__app-name">{appName}</p>

        {/* Summary Cards */}
        <div className="uninstall-report__summary">
          <div className="uninstall-report__card">
            <div className="uninstall-report__card-icon uninstall-report__card-icon--success">
              ✅
            </div>
            <div className="uninstall-report__card-content">
              <p className="uninstall-report__card-label">Main Application</p>
              <p className="uninstall-report__card-value">
                {mainAppDeleted ? 'Deleted' : 'Failed to delete'}
              </p>
            </div>
          </div>

          <div className="uninstall-report__card">
            <div className="uninstall-report__card-icon uninstall-report__card-icon--info">
              📁
            </div>
            <div className="uninstall-report__card-content">
              <p className="uninstall-report__card-label">Residual Files</p>
              <p className="uninstall-report__card-value">
                {junkFilesDeleted.length} removed
              </p>
            </div>
          </div>

          <div className="uninstall-report__card">
            <div className="uninstall-report__card-icon uninstall-report__card-icon--accent">
              💾
            </div>
            <div className="uninstall-report__card-content">
              <p className="uninstall-report__card-label">Space Freed</p>
              <p className="uninstall-report__card-value">
                {formatBytes(totalSpaceFreed)}
              </p>
            </div>
          </div>
        </div>

        {/* File Details (Expandable) */}
        {junkFilesDeleted.length > 0 && (
          <div className="uninstall-report__details">
            <button
              className="uninstall-report__toggle"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span>View deleted files ({junkFilesDeleted.length})</span>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {isExpanded && (
              <motion.div
                className="uninstall-report__files"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {Object.entries(groupedFiles).map(([type, files]) => (
                  <div key={type} className="uninstall-report__file-group">
                    <div className="uninstall-report__file-group-header">
                      <Badge variant={typeColors[type] || 'default'}>{type}</Badge>
                      <span className="uninstall-report__file-group-count">
                        {files.length} file{files.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="uninstall-report__file-list">
                      {files.map((file, index) => (
                        <div key={index} className="uninstall-report__file-item">
                          <File size={14} />
                          <span className="uninstall-report__file-name">
                            {file.path.split('/').pop()}
                          </span>
                          <span className="uninstall-report__file-size">
                            {formatBytes(file.size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="uninstall-report__errors">
            <div className="uninstall-report__errors-header">
              <AlertCircle size={20} />
              <span>Warnings ({errors.length})</span>
            </div>
            <div className="uninstall-report__errors-list">
              {errors.map((error, index) => (
                <p key={index} className="uninstall-report__error-item">
                  • {error}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="uninstall-report__actions">
          <Button variant="primary" size="lg" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
})
