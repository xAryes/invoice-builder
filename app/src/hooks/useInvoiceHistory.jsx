import { createContext, useContext, useState, useEffect } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'

const InvoiceHistoryContext = createContext(null)

const STORAGE_KEY = 'invoice_history'

export const InvoiceHistoryProvider = ({ children }) => {
  const [history, setHistory] = useState(() => {
    // Load history from localStorage on initial render
    if (!isSupabaseConfigured() && typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error('Error loading invoice history:', e)
        }
      }
    }
    return []
  })

  // Save history to localStorage when it changes
  useEffect(() => {
    if (!isSupabaseConfigured() && history.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    }
  }, [history])

  const addHistoryEntry = (invoiceId, action, details = {}) => {
    const entry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      invoiceId,
      action,
      details,
      timestamp: new Date().toISOString(),
      user: 'demo@example.com', // In a real app, get from auth context
    }

    setHistory(prev => [entry, ...prev].slice(0, 500)) // Keep last 500 entries
    return entry
  }

  const getInvoiceHistory = (invoiceId) => {
    return history.filter(entry => entry.invoiceId === invoiceId)
  }

  const getRecentHistory = (limit = 50) => {
    return history.slice(0, limit)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  // Action types for tracking
  const actions = {
    CREATED: 'created',
    UPDATED: 'updated',
    STATUS_CHANGED: 'status_changed',
    EXPORTED_PDF: 'exported_pdf',
    EMAILED: 'emailed',
    PAYMENT_LINK_CREATED: 'payment_link_created',
    DELETED: 'deleted',
    DUPLICATED: 'duplicated',
  }

  return (
    <InvoiceHistoryContext.Provider
      value={{
        history,
        addHistoryEntry,
        getInvoiceHistory,
        getRecentHistory,
        clearHistory,
        actions,
      }}
    >
      {children}
    </InvoiceHistoryContext.Provider>
  )
}

export const useInvoiceHistory = () => {
  const context = useContext(InvoiceHistoryContext)
  if (!context) {
    throw new Error('useInvoiceHistory must be used within an InvoiceHistoryProvider')
  }
  return context
}
