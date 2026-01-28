import React from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Modal } from '../../ui/Modal'
import { ProgressBar } from '../../ui/ProgressBar'
import './UninstallProgress.css'

interface UninstallProgressProps {
  isOpen: boolean
  appName: string
  currentFile?: string
  filesDeleted?: number
}

export const UninstallProgress = React.memo(function UninstallProgress({
  isOpen,
  appName,
  currentFile,
  filesDeleted = 0
}: UninstallProgressProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Cannot close during uninstall
      size="md"
      preventClose={true}
      showCloseButton={false}
    >
      <div className="uninstall-progress">
        <div className="uninstall-progress__icon">
          <Trash2 size={40} />
          <div className="uninstall-progress__spinner">
            <Loader2 size={24} className="animate-spin" />
          </div>
        </div>

        <h2 className="uninstall-progress__title">Uninstalling {appName}</h2>

        <div className="uninstall-progress__content">
          <ProgressBar variant="default" size="md" indeterminate />

          <div className="uninstall-progress__status">
            {currentFile ? (
              <>
                <p className="uninstall-progress__current">
                  Deleting: {currentFile.split('/').pop()}
                </p>
                <p className="uninstall-progress__count">
                  {filesDeleted} file{filesDeleted !== 1 ? 's' : ''} removed
                </p>
              </>
            ) : (
              <p className="uninstall-progress__message">
                Scanning for files to remove...
              </p>
            )}
          </div>
        </div>

        <p className="uninstall-progress__notice">
          Please wait, this may take a moment...
        </p>
      </div>
    </Modal>
  )
})
