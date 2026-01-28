import React, { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, File, Package, Settings, FolderOpen, Loader2 } from 'lucide-react'
import { JunkFile } from '../../../../../shared/domain/App.entity'
import { Badge } from '../../ui/Badge'
import { formatBytes } from '../../../utils/formatters'
import './JunkFilesList.css'

interface JunkFilesListProps {
  appName: string
  onJunkSizeChange?: (totalSize: number) => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Cache': <Package size={16} />,
  'Logs': <File size={16} />,
  'Preferences': <Settings size={16} />,
  'Support': <FolderOpen size={16} />,
  'Application Support': <FolderOpen size={16} />
}

const categoryVariants: Record<string, 'warning' | 'info' | 'default'> = {
  'Cache': 'warning',
  'Logs': 'info',
  'Preferences': 'default',
  'Support': 'default',
  'Application Support': 'default'
}

export const JunkFilesList = React.memo(function JunkFilesList({ appName, onJunkSizeChange }: JunkFilesListProps) {
  const [junkFiles, setJunkFiles] = useState<JunkFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadJunkFiles()
  }, [appName])

  const loadJunkFiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const files = await window.api.findJunkFiles(appName)
      setJunkFiles(files)

      // Calculate total junk size
      const totalSize = files.reduce((sum, file) => sum + file.size, 0)
      onJunkSizeChange?.(totalSize)
    } catch (error) {
      console.error('Error loading junk files:', error)
    } finally {
      setIsLoading(false)
    }
  }, [appName, onJunkSizeChange])

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Group files by type
  const groupedFiles = junkFiles.reduce((acc, file) => {
    if (!acc[file.type]) {
      acc[file.type] = []
    }
    acc[file.type].push(file)
    return acc
  }, {} as Record<string, JunkFile[]>)

  if (isLoading) {
    return (
      <div className="junk-files-list">
        <h3 className="junk-files-list__title">Residual Files</h3>
        <div className="junk-files-list__loading">
          <Loader2 size={24} className="animate-spin" />
          <p>Scanning for junk files...</p>
        </div>
      </div>
    )
  }

  if (junkFiles.length === 0) {
    return (
      <div className="junk-files-list">
        <h3 className="junk-files-list__title">Residual Files</h3>
        <div className="junk-files-list__empty">
          <p>✨ No residual files found</p>
          <span>This app is clean!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="junk-files-list">
      <div className="junk-files-list__header">
        <h3 className="junk-files-list__title">Residual Files</h3>
        <Badge variant="warning">{junkFiles.length} files</Badge>
      </div>

      <div className="junk-files-list__categories">
        {Object.entries(groupedFiles).map(([category, files]) => {
          const isExpanded = expandedCategories.has(category)
          const categorySize = files.reduce((sum, file) => sum + file.size, 0)

          return (
            <div key={category} className="junk-category">
              <button
                className="junk-category__header"
                onClick={() => toggleCategory(category)}
              >
                <div className="junk-category__header-left">
                  <div className="junk-category__icon">
                    {categoryIcons[category] || <File size={16} />}
                  </div>
                  <span className="junk-category__name">{category}</span>
                  <Badge variant={categoryVariants[category] || 'default'} className="junk-category__badge">
                    {files.length}
                  </Badge>
                </div>
                <div className="junk-category__header-right">
                  <span className="junk-category__size">{formatBytes(categorySize)}</span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {isExpanded && (
                <div className="junk-category__files">
                  {files.map((file, index) => (
                    <div key={index} className="junk-file">
                      <File size={14} className="junk-file__icon" />
                      <span className="junk-file__path" title={file.path}>
                        {file.path.split('/').pop()}
                      </span>
                      <span className="junk-file__size">{formatBytes(file.size)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
