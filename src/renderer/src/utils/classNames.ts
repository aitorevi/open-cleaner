import clsx, { ClassValue } from 'clsx'

/**
 * Utility for conditionally joining classNames together
 * Re-exports clsx for consistent usage across the app
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
