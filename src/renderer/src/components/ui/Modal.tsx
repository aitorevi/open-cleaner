import React, { useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import './Modal.css'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  showCloseButton?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  preventClose?: boolean
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  showCloseButton = true,
  size = 'md',
  preventClose = false,
  className
}: ModalProps) {
  // Prevent closing on escape if preventClose is true
  useEffect(() => {
    if (preventClose && isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [preventClose, isOpen])

  return (
    <Dialog.Root open={isOpen} onOpenChange={preventClose ? undefined : onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="modal__overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className={clsx('modal__content', `modal__content--${size}`, className)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {(title || showCloseButton) && (
                  <div className="modal__header">
                    {title && (
                      <Dialog.Title className="modal__title">{title}</Dialog.Title>
                    )}
                    {showCloseButton && !preventClose && (
                      <Dialog.Close asChild>
                        <button className="modal__close" aria-label="Close">
                          <X size={20} />
                        </button>
                      </Dialog.Close>
                    )}
                  </div>
                )}

                {description && (
                  <Dialog.Description className="modal__description">
                    {description}
                  </Dialog.Description>
                )}

                <div className="modal__body">{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
