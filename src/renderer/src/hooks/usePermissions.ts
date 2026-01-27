import { useState, useEffect } from 'react'

export function usePermissions() {
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkPermissions = async () => {
    setIsChecking(true)
    try {
      const result = await window.api.checkPermissions()
      setHasPermissions(result.hasPermissions)
    } catch (error) {
      console.error('Error checking permissions:', error)
      setHasPermissions(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkPermissions()
  }, [])

  return {
    hasPermissions,
    isChecking,
    recheckPermissions: checkPermissions
  }
}
