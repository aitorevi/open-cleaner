import React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, Check, Filter } from 'lucide-react'
import { FilterBy, SortBy } from '../../../hooks/useSearch'
import './FilterDropdown.css'

interface FilterDropdownProps {
  filterBy: FilterBy
  sortBy: SortBy
  onFilterChange: (filter: FilterBy) => void
  onSortChange: (sort: SortBy) => void
}

export const FilterDropdown = React.memo(function FilterDropdown({ filterBy, sortBy, onFilterChange, onSortChange }: FilterDropdownProps) {
  const filterOptions: { value: FilterBy; label: string }[] = [
    { value: 'all', label: 'All Apps' },
    { value: 'large', label: 'Large (>1GB)' },
    { value: 'medium', label: 'Medium (100MB-1GB)' },
    { value: 'small', label: 'Small (<100MB)' }
  ]

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'size', label: 'Size' }
  ]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="filter-dropdown__trigger">
          <Filter size={16} />
          <span>Filter & Sort</span>
          <ChevronDown size={16} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="filter-dropdown__content" align="end" sideOffset={8}>
          <div className="filter-dropdown__section">
            <DropdownMenu.Label className="filter-dropdown__label">Filter by Size</DropdownMenu.Label>
            {filterOptions.map((option) => (
              <DropdownMenu.Item
                key={option.value}
                className="filter-dropdown__item"
                onSelect={() => onFilterChange(option.value)}
              >
                <span className="filter-dropdown__item-indicator">
                  {filterBy === option.value && <Check size={16} />}
                </span>
                <span>{option.label}</span>
              </DropdownMenu.Item>
            ))}
          </div>

          <DropdownMenu.Separator className="filter-dropdown__separator" />

          <div className="filter-dropdown__section">
            <DropdownMenu.Label className="filter-dropdown__label">Sort by</DropdownMenu.Label>
            {sortOptions.map((option) => (
              <DropdownMenu.Item
                key={option.value}
                className="filter-dropdown__item"
                onSelect={() => onSortChange(option.value)}
              >
                <span className="filter-dropdown__item-indicator">
                  {sortBy === option.value && <Check size={16} />}
                </span>
                <span>{option.label}</span>
              </DropdownMenu.Item>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
})
