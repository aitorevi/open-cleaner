import { useState, useMemo, useCallback } from 'react'
import { App } from '../../../shared/domain/App.entity'

export type SortBy = 'name' | 'size'
export type FilterBy = 'all' | 'large' | 'medium' | 'small'

interface UseSearchOptions {
  initialSort?: SortBy
  initialFilter?: FilterBy
}

/**
 * Hook for searching, filtering, and sorting applications
 * @param apps - Array of applications to search/filter/sort
 * @param options - Initial configuration
 */
export function useSearch(apps: App[], options: UseSearchOptions = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>(options.initialSort || 'name')
  const [filterBy, setFilterBy] = useState<FilterBy>(options.initialFilter || 'all')

  const filteredAndSortedApps = useMemo(() => {
    let result = [...apps]

    // 1. Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((app) => app.name.toLowerCase().includes(query))
    }

    // 2. Apply size filter
    if (filterBy !== 'all') {
      const GB = 1024 * 1024 * 1024
      const MB = 1024 * 1024

      result = result.filter((app) => {
        switch (filterBy) {
          case 'large':
            return app.size >= GB // >= 1GB
          case 'medium':
            return app.size >= 100 * MB && app.size < GB // 100MB - 1GB
          case 'small':
            return app.size < 100 * MB // < 100MB
          default:
            return true
        }
      })
    }

    // 3. Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'size':
          return b.size - a.size // Descending (largest first)
        default:
          return 0
      }
    })

    return result
  }, [apps, searchQuery, sortBy, filterBy])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    filteredApps: filteredAndSortedApps,
    clearSearch
  }
}
