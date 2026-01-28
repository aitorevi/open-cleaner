import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { formatBytes } from '../../../utils/formatters'
import './UninstallModal.css'

interface UninstallModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  appName: string
  appSize: number
  isUninstalling?: boolean
}

export const UninstallModal = React.memo(function UninstallModal({
  isOpen,
  onClose,
  onConfirm,
  appName,
  appSize,
  isUninstalling = false
}: UninstallModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      preventClose={isUninstalling}
      showCloseButton={!isUninstalling}
    >
      <div className="uninstall-modal">
        <div className="uninstall-modal__icon">
          <AlertTriangle size={48} />
        </div>

        <h2 className="uninstall-modal__title">Uninstall {appName}?</h2>

        <div className="uninstall-modal__description">
          <p>
            This will permanently delete the application and attempt to remove all associated files.
          </p>
          <div className="uninstall-modal__info">
            <span className="uninstall-modal__info-label">Space to be freed:</span>
            <span className="uninstall-modal__info-value">{formatBytes(appSize)}</span>
          </div>
          <p className="uninstall-modal__warning">
            ⚠️ This action cannot be undone.
          </p>
        </div>

        <div className="uninstall-modal__actions">
          <Button
            variant="secondary"
            size="lg"
            onClick={onClose}
            disabled={isUninstalling}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={onConfirm}
            isLoading={isUninstalling}
          >
            Uninstall
          </Button>
        </div>
      </div>
    </Modal>
  )
})
