import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={clsx(
        'button',
        `button--${variant}`,
        `button--${size}`,
        isLoading && 'button--loading',
        className
      )}
      disabled={disabled || isLoading}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {isLoading && (
        <span className="button__spinner">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="30 10"
            />
          </svg>
        </span>
      )}
      {!isLoading && leftIcon && <span className="button__icon button__icon--left">{leftIcon}</span>}
      <span className="button__text">{children}</span>
      {!isLoading && rightIcon && <span className="button__icon button__icon--right">{rightIcon}</span>}
    </motion.button>
  )
}
