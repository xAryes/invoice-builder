import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { InvoiceProvider } from './hooks/useInvoices'
import { ProfileProvider } from './hooks/useProfiles'
import { ThemeProvider } from './hooks/useTheme'
import { RecurringInvoicesProvider } from './hooks/useRecurringInvoices'
import { InvoiceHistoryProvider } from './hooks/useInvoiceHistory'
import { ToastProvider } from './components/ui'
import { Login, Signup, ForgotPassword, Dashboard, InvoiceEditor, GuidedInvoiceEditor, Settings, Clients, RecurringInvoices, Welcome } from './pages'
import { isSupabaseConfigured } from './lib/supabase'

// Check if user needs onboarding
const needsOnboarding = () => {
  const completed = localStorage.getItem('onboarding_completed')
  return !completed
}

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    )
  }

  // In demo mode (no Supabase), allow access without authentication
  if (!isSupabaseConfigured()) {
    return children
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    )
  }

  // In demo mode, still show auth pages but allow navigation to dashboard
  if (user && isSupabaseConfigured()) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRoutes() {
  const { user } = useAuth()

  // Check if user has completed onboarding
  const hasCompletedOnboarding = () => {
    const status = localStorage.getItem('onboarding_completed')
    return !!status
  }

  return (
    <Routes>
      {/* Welcome page - FIRST thing users see (Google Auth) */}
      <Route
        path="/"
        element={
          user ? (
            hasCompletedOnboarding() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          ) : (
            <Welcome />
          )
        }
      />

      {/* Legacy auth routes (redirect to welcome) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Navigate to="/" replace />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Navigate to="/" replace />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* Redirect old pricing route to home */}
      <Route
        path="/pricing"
        element={<Navigate to="/" replace />}
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoice/:id"
        element={
          <ProtectedRoute>
            <InvoiceEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guided-invoice"
        element={
          <ProtectedRoute>
            <GuidedInvoiceEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recurring"
        element={
          <ProtectedRoute>
            <RecurringInvoices />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <InvoiceProvider>
              <ProfileProvider>
                <RecurringInvoicesProvider>
                  <InvoiceHistoryProvider>
                    <AppRoutes />
                  </InvoiceHistoryProvider>
                </RecurringInvoicesProvider>
              </ProfileProvider>
            </InvoiceProvider>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
