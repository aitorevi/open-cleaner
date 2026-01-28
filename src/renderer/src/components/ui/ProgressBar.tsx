import React from 'react'
import clsx from 'clsx'
import './ProgressBar.css'

export interface ProgressBarProps {
  value?: number // 0-100
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  indeterminate?: boolean
  className?: string
}

export function ProgressBar({
  value = 0,
  variant = 'default',
  size = 'md',
  indeterminate = false,
  className
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100)

  return (
    <div
      className={clsx(
        'progress-bar',
        `progress-bar--${variant}`,
        `progress-bar--${size}`,
        indeterminate && 'progress-bar--indeterminate',
        className
      )}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={indeterminate ? undefined : { width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
