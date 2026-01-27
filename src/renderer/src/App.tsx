import { usePermissions } from './hooks/usePermissions';
import { Onboarding } from './components/Onboarding';
import { AppList } from './components/AppList';
import './App.css';

function App(): React.JSX.Element {
  const { hasPermissions, isChecking, recheckPermissions } = usePermissions();

  // Loading state
  if (hasPermissions === null) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Checking permissions...</p>
      </div>
    );
  }

  // No permissions - show onboarding
  if (!hasPermissions) {
    return <Onboarding onRecheck={recheckPermissions} isChecking={isChecking} />;
  }

  // Has permissions - show app list
  return <AppList />;
}

export default App;
