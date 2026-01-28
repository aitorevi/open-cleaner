import React from 'react'
import { Search, X } from 'lucide-react'
import clsx from 'clsx'
import './SearchInput.css'

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void
}

export function SearchInput({ value, onClear, className, ...props }: SearchInputProps) {
  const hasValue = value && String(value).length > 0

  return (
    <div className={clsx('search-input', className)}>
      <Search className="search-input__icon" size={16} />
      <input
        type="text"
        className="search-input__field"
        value={value}
        {...props}
      />
      {hasValue && onClear && (
        <button
          type="button"
          className="search-input__clear"
          onClick={onClear}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
