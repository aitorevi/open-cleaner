import { useState, useCallback } from 'react'
import { App } from '../../../shared/domain/App.entity'

/**
 * Hook for managing drag and drop state
 * Handles dragging apps to a drop zone for uninstallation
 */
export function useDragDrop() {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedApp, setDraggedApp] = useState<App | null>(null)
  const [isOverDropZone, setIsOverDropZone] = useState(false)

  const handleDragStart = useCallback((app: App) => {
    setIsDragging(true)
    setDraggedApp(app)
  }, [])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setDraggedApp(null)
    setIsOverDropZone(false)
  }, [])

  const handleDragEnter = useCallback(() => {
    setIsOverDropZone(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsOverDropZone(false)
  }, [])

  const handleDrop = useCallback(() => {
    setIsOverDropZone(false)
    return draggedApp
  }, [draggedApp])

  return {
    isDragging,
    draggedApp,
    isOverDropZone,
    handleDragStart,
    handleDragEnd,
    handleDragEnter,
    handleDragLeave,
    handleDrop
  }
}
