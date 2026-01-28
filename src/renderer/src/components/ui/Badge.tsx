import React from 'react'
import clsx from 'clsx'
import './Badge.css'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={clsx('badge', `badge--${variant}`, className)}>
      {children}
    </span>
  )
}
