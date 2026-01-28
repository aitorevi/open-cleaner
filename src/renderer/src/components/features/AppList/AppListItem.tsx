import React from 'react'
import { Folder } from 'lucide-react'
import { motion } from 'framer-motion'
import { App } from '../../../../../shared/domain/App.entity'
import { formatBytes } from '../../../utils/formatters'
import clsx from 'clsx'
import './AppListItem.css'

interface AppListItemProps {
  app: App
  isSelected: boolean
  onClick: () => void
  onDragStart?: (app: App) => void
  onDragEnd?: () => void
  isDragging?: boolean
}

export const AppListItem = React.memo(function AppListItem({
  app,
  isSelected,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging = false
}: AppListItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/json', JSON.stringify(app))
    onDragStart?.(app)
  }

  const handleDragEnd = () => {
    onDragEnd?.()
  }

  return (
    <motion.div
      className={clsx(
        'app-list-item',
        isSelected && 'app-list-item--selected',
        isDragging && 'app-list-item--dragging'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="app-list-item__icon">
        {app.icon ? (
          <img src={app.icon} alt={`${app.name} icon`} className="app-list-item__icon-img" />
        ) : (
          <Folder size={32} strokeWidth={1.5} />
        )}
      </div>

      <div className="app-list-item__info">
        <h3 className="app-list-item__name">{app.name}</h3>
        <p className="app-list-item__size">{formatBytes(app.size)}</p>
      </div>
    </motion.div>
  )
})
