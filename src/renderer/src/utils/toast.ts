import toast from 'react-hot-toast'

/**
 * Toast utility with macOS-style notifications
 * Wraps react-hot-toast with consistent styling
 */

const defaultOptions = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: 'var(--color-surface-primary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border-secondary)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl)',
    padding: '12px 16px',
    fontSize: 'var(--font-size-sm)',
    fontFamily: 'var(--font-family-base)'
  }
}

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      ...defaultOptions,
      iconTheme: {
        primary: 'var(--color-success)',
        secondary: 'var(--color-text-inverse)'
      }
    })
  },

  error: (message: string) => {
    toast.error(message, {
      ...defaultOptions,
      iconTheme: {
        primary: 'var(--color-destructive)',
        secondary: 'var(--color-text-inverse)'
      }
    })
  },

  warning: (message: string) => {
    toast(message, {
      ...defaultOptions,
      icon: '⚠️'
    })
  },

  info: (message: string) => {
    toast(message, {
      ...defaultOptions,
      icon: 'ℹ️'
    })
  },

  loading: (message: string) => {
    return toast.loading(message, defaultOptions)
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  }
}
