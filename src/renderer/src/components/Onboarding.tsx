import './Onboarding.css'

interface OnboardingProps {
  onRecheck: () => void
  isChecking: boolean
}

export function Onboarding({ onRecheck, isChecking }: OnboardingProps) {
  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <h1>Welcome to OpenCleaner</h1>
        <p className="subtitle">
          OpenCleaner needs Full Disk Access to scan and remove applications and their related
          files.
        </p>

        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Open System Settings</h3>
              <p>Go to System Settings → Privacy & Security → Full Disk Access</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Add OpenCleaner</h3>
              <p>Click the + button and add OpenCleaner to the list</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Enable Access</h3>
              <p>Make sure the checkbox next to OpenCleaner is enabled</p>
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="recheck-button" onClick={onRecheck} disabled={isChecking}>
            {isChecking ? 'Checking...' : 'Check Again'}
          </button>
        </div>

        <div className="info">
          <p>
            <strong>Why do we need this?</strong>
          </p>
          <p>
            Full Disk Access allows OpenCleaner to find and remove application support files,
            caches, preferences, and other related data stored in protected system locations.
          </p>
        </div>
      </div>
    </div>
  )
}
