import React from 'react'
import { Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import './DragDropZone.css'

interface DragDropZoneProps {
  isVisible: boolean
  isOver: boolean
  onDragEnter: () => void
  onDragLeave: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  appName?: string
}

export const DragDropZone = React.memo(function DragDropZone({
  isVisible,
  isOver,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  appName
}: DragDropZoneProps) {
  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className={clsx('drag-drop-zone', isOver && 'drag-drop-zone--active')}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="drag-drop-zone__content">
          <motion.div
            className="drag-drop-zone__icon"
            animate={{
              scale: isOver ? 1.1 : 1,
              rotate: isOver ? [0, -10, 10, -10, 0] : 0
            }}
            transition={{ duration: 0.3 }}
          >
            <Trash2 size={64} />
          </motion.div>

          <div className="drag-drop-zone__text">
            <h3 className="drag-drop-zone__title">
              {isOver ? 'Release to Uninstall' : 'Drop Here to Uninstall'}
            </h3>
            {appName && (
              <p className="drag-drop-zone__app-name">{appName}</p>
            )}
            <p className="drag-drop-zone__description">
              {isOver
                ? 'The application will be moved to trash'
                : 'Drag an app here to uninstall it'}
            </p>
          </div>
        </div>

        {/* Animated border */}
        <div className="drag-drop-zone__border" />
      </motion.div>
    </AnimatePresence>
  )
})
