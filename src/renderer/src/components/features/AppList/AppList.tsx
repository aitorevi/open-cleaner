import React, { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { App } from '../../../../../shared/domain/App.entity'
import { useSearch } from '../../../hooks/useSearch'
import { useIsMobile, useIsDesktop } from '../../../hooks/useMediaQuery'
import { useDragDrop } from '../../../hooks/useDragDrop'
import { Button } from '../../ui/Button'
import { EmptyState } from '../../ui/EmptyState'
import { SearchBar } from '../SearchFilter/SearchBar'
import { FilterDropdown } from '../SearchFilter/FilterDropdown'
import { AppListItem } from './AppListItem'
import { AppListSkeleton } from './AppListSkeleton'
import { UninstallModal } from '../UninstallModal/UninstallModal'
import { UninstallProgress } from '../UninstallModal/UninstallProgress'
import { UninstallReport } from '../UninstallModal/UninstallReport'
import { AppDetails } from '../AppDetails/AppDetails'
import { DragDropZone } from '../DragDropZone/DragDropZone'
import { Toaster } from 'react-hot-toast'
import { showToast } from '../../../utils/toast'
import './AppList.css'

interface UninstallReport {
  appName: string
  appPath: string
  mainAppDeleted: boolean
  junkFilesDeleted: Array<{ path: string; type: string; size: number }>
  totalSpaceFreed: number
  errors: string[]
}

export function AppList() {
  const [apps, setApps] = useState<App[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Uninstall modal states
  const [showUninstallModal, setShowUninstallModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isUninstalling, setIsUninstalling] = useState(false)
  const [uninstallReport, setUninstallReport] = useState<UninstallReport | null>(null)
  const [appToUninstall, setAppToUninstall] = useState<App | null>(null)

  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()

  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    filteredApps,
    clearSearch
  } = useSearch(apps)

  const {
    isDragging,
    draggedApp,
    isOverDropZone,
    handleDragStart,
    handleDragEnd,
    handleDragEnter,
    handleDragLeave,
    handleDrop
  } = useDragDrop()

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = useCallback(async () => {
    if (apps.length > 0) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const applications = await window.api.scanApplications()
      setApps(applications)
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [apps.length])

  const handleUninstallClick = useCallback((app: App) => {
    setAppToUninstall(app)
    setShowUninstallModal(true)
  }, [])

  const handleConfirmUninstall = useCallback(async () => {
    if (!appToUninstall) return

    setIsUninstalling(true)
    setShowUninstallModal(false)
    setShowProgressModal(true)

    try {
      const result = await window.api.uninstallApp(appToUninstall.name, appToUninstall.path)

      setShowProgressModal(false)

      if (result.success && result.report) {
        setUninstallReport(result.report)
        setShowReportModal(true)
        showToast.success(`${appToUninstall.name} uninstalled successfully`)

        // Reload applications list
        await loadApplications()
        setSelectedApp(null)
      } else {
        showToast.error(result.error || 'Could not uninstall application')
      }
    } catch (error) {
      console.error('Error uninstalling app:', error)
      setShowProgressModal(false)
      showToast.error('Unexpected error while uninstalling application')
    } finally {
      setIsUninstalling(false)
      setAppToUninstall(null)
    }
  }, [appToUninstall, loadApplications])

  const handleCloseUninstallModal = useCallback(() => {
    if (!isUninstalling) {
      setShowUninstallModal(false)
      setAppToUninstall(null)
    }
  }, [isUninstalling])

  const handleCloseReportModal = useCallback(() => {
    setShowReportModal(false)
    setUninstallReport(null)
  }, [])

  const handleDropOnZone = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedApp = handleDrop()
    handleDragEnd()

    if (droppedApp) {
      handleUninstallClick(droppedApp)
    }
  }, [handleDrop, handleDragEnd, handleUninstallClick])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  if (isLoading) {
    return (
      <div className="app-list-container">
        <div className="app-list-loading">
          <AppListSkeleton count={8} />
        </div>
      </div>
    )
  }

  return (
    <div className="app-list-container">
      <Toaster position="top-right" />

      {/* Header */}
      <motion.header
        className="app-list-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="app-list-header__left">
          <h1 className="app-list-header__title">OpenCleaner</h1>
          <span className="app-list-header__count">{filteredApps.length} apps</span>
        </div>
        <div className="app-list-header__right">
          <Button
            variant="ghost"
            size="md"
            onClick={loadApplications}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
        </div>
      </motion.header>

      {/* Search and Filters */}
      <motion.div
        className="app-list-toolbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={clearSearch}
          placeholder="Search applications..."
        />
        <FilterDropdown
          filterBy={filterBy}
          sortBy={sortBy}
          onFilterChange={setFilterBy}
          onSortChange={setSortBy}
        />
      </motion.div>

      {/* Main Content */}
      <div className="app-list-content">
        {/* Apps List */}
        <div className="app-list-panel">
          {filteredApps.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No applications found"
              description={
                searchQuery
                  ? `No apps match "${searchQuery}". Try a different search term.`
                  : 'No applications to display. Try refreshing the list.'
              }
              action={
                searchQuery
                  ? {
                      label: 'Clear Search',
                      onClick: clearSearch
                    }
                  : undefined
              }
            />
          ) : (
            <motion.div
              className="app-list-scroll"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.03,
                    delayChildren: 0.1
                  }
                }
              }}
            >
              <AnimatePresence mode="popLayout">
                {filteredApps.map((app, index) => (
                  <motion.div
                    key={app.path}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 25
                    }}
                  >
                    <AppListItem
                      app={app}
                      isSelected={selectedApp?.path === app.path}
                      onClick={() => setSelectedApp(app)}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={isDragging && draggedApp?.path === app.path}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Details Panel */}
        <AnimatePresence mode="wait">
          {selectedApp && (isDesktop || !isMobile) && (
            <motion.div
              key={selectedApp.path}
              className="app-details-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <AppDetails app={selectedApp} onUninstall={handleUninstallClick} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Uninstall Modals */}
      {appToUninstall && (
        <>
          <UninstallModal
            isOpen={showUninstallModal}
            onClose={handleCloseUninstallModal}
            onConfirm={handleConfirmUninstall}
            appName={appToUninstall.name}
            appSize={appToUninstall.size}
            isUninstalling={isUninstalling}
          />

          <UninstallProgress
            isOpen={showProgressModal}
            appName={appToUninstall.name}
          />
        </>
      )}

      {uninstallReport && (
        <UninstallReport
          isOpen={showReportModal}
          onClose={handleCloseReportModal}
          appName={uninstallReport.appName}
          mainAppDeleted={uninstallReport.mainAppDeleted}
          junkFilesDeleted={uninstallReport.junkFilesDeleted}
          totalSpaceFreed={uninstallReport.totalSpaceFreed}
          errors={uninstallReport.errors}
        />
      )}

      {/* Drag & Drop Zone */}
      <DragDropZone
        isVisible={isDragging}
        isOver={isOverDropZone}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDropOnZone}
        appName={draggedApp?.name}
      />
    </div>
  )
}
