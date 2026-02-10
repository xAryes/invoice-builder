import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { InvoiceProvider } from './hooks/useInvoices'
import { ProfileProvider } from './hooks/useProfiles'
import { ExpenseProvider } from './hooks/useExpenses'
import { ThemeProvider } from './hooks/useTheme'
import { ToastProvider } from './components/ui'
import { Layout } from './components/Layout'

const InvoiceForm = lazy(() => import('./pages/InvoiceForm').then(m => ({ default: m.InvoiceForm })))
const ExpenseForm = lazy(() => import('./pages/ExpenseForm').then(m => ({ default: m.ExpenseForm })))
const Documents = lazy(() => import('./pages/Documents').then(m => ({ default: m.Documents })))
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })))

function PageLoader() {
  return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-white rounded-full" />
      </div>
    </Layout>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<InvoiceForm />} />
        <Route path="/invoice/new" element={<InvoiceForm />} />
        <Route path="/invoice/:id" element={<InvoiceForm />} />
        <Route path="/expense/new" element={<ExpenseForm />} />
        <Route path="/expense/:id" element={<ExpenseForm />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <InvoiceProvider>
            <ProfileProvider>
              <ExpenseProvider>
                <AppRoutes />
              </ExpenseProvider>
            </ProfileProvider>
          </InvoiceProvider>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
