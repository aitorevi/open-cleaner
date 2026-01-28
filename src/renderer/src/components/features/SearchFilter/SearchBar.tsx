import React from 'react'
import { SearchInput } from '../../ui/SearchInput'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
}

export const SearchBar = React.memo(function SearchBar({ value, onChange, onClear, placeholder = 'Search applications...' }: SearchBarProps) {
  return (
    <SearchInput
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClear={onClear}
      placeholder={placeholder}
    />
  )
})
