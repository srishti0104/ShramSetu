import { useState, useEffect } from 'react'
import './App.css'
import './styles/global.css'

// Import providers
import { LanguageProvider } from './contexts/LanguageContext'
import { UserProfileProvider } from './contexts/UserProfileContext'

// Import onboarding flow
import OnboardingFlow from './components/onboarding/OnboardingFlow'

// Import role-based dashboards
import WorkerDashboard from './components/dashboard/WorkerDashboard'
import EmployerDashboard from './components/dashboard/EmployerDashboard'

// Import role manager utility
import { getRole, isValidRole, clearRole } from './utils/roleManager'

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [userRole, setUserRole] = useState(null)

  // Check if user has completed onboarding and has valid role
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboarding_complete')
    const role = getRole()
    
    if (onboardingComplete === 'true' && isValidRole(role)) {
      setIsOnboarded(true)
      setUserRole(role)
    } else {
      setIsOnboarded(false)
      setUserRole(null)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_complete', 'true')
    
    // Retrieve the saved role
    const role = getRole()
    if (isValidRole(role)) {
      setUserRole(role)
      setIsOnboarded(true)
      setShowOnboarding(false)
    } else {
      // If role is invalid, restart onboarding
      console.error('Invalid role after onboarding completion')
      setShowOnboarding(true)
    }
  }

  const handleStartOnboarding = () => {
    // Clear previous onboarding data and role
    localStorage.removeItem('onboarding_complete')
    localStorage.removeItem('onboarding_progress')
    sessionStorage.removeItem('active_tab')
    clearRole()
    
    setShowOnboarding(true)
    setIsOnboarded(false)
    setUserRole(null)
  }

  // Show onboarding flow if user hasn't completed it or explicitly requested
  if (showOnboarding || !isOnboarded) {
    return (
      <LanguageProvider>
        <UserProfileProvider>
          <div className="app">
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          </div>
        </UserProfileProvider>
      </LanguageProvider>
    )
  }

  // Route to appropriate dashboard based on role
  if (userRole === 'worker') {
    return (
      <LanguageProvider>
        <UserProfileProvider>
          <WorkerDashboard onRestartOnboarding={handleStartOnboarding} />
        </UserProfileProvider>
      </LanguageProvider>
    )
  }

  if (userRole === 'employer') {
    return (
      <LanguageProvider>
        <UserProfileProvider>
          <EmployerDashboard onRestartOnboarding={handleStartOnboarding} />
        </UserProfileProvider>
      </LanguageProvider>
    )
  }

  // Fallback: If no valid role, redirect to onboarding
  return (
    <LanguageProvider>
      <UserProfileProvider>
        <div className="app">
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </div>
      </UserProfileProvider>
    </LanguageProvider>
  )
}

export default App

