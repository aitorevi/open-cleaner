import { usePermissions } from './hooks/usePermissions'
import { Onboarding } from './components/features/Onboarding/Onboarding'
import { AppList } from './components/features/AppList/AppList'
import { ThemeProvider } from './contexts/ThemeContext'
import './App.css'

function AppContent(): React.JSX.Element {
  const { hasPermissions, isChecking, recheckPermissions } = usePermissions()

  // Loading state
  if (hasPermissions === null) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Checking permissions...</p>
      </div>
    )
  }

  // No permissions - show onboarding
  if (!hasPermissions) {
    return <Onboarding onRecheck={recheckPermissions} isChecking={isChecking} />
  }

  // Has permissions - show app list
  return <AppList />
}

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
