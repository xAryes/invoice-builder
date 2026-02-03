import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../lib/supabase'

const STORAGE_KEY = 'recurring_invoices'

const RecurringInvoicesContext = createContext(null)

export const RecurringInvoicesProvider = ({ children }) => {
  const { user } = useAuth()
  const [recurringInvoices, setRecurringInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  // Load recurring invoices
  useEffect(() => {
    if (isSupabaseConfigured() && user) {
      // TODO: Implement Supabase table for recurring invoices
      // For now, use localStorage
      loadFromLocalStorage()
    } else {
      loadFromLocalStorage()
    }
  }, [user])

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setRecurringInvoices(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading recurring invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveToLocalStorage = (invoices) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
    } catch (error) {
      console.error('Error saving recurring invoices:', error)
    }
  }

  // Create a new recurring invoice template
  const createRecurring = async (templateData) => {
    const newRecurring = {
      id: `rec_${Date.now()}`,
      created_at: new Date().toISOString(),
      template: templateData,
      frequency: templateData.frequency || 'monthly', // 'weekly', 'monthly', 'quarterly', 'yearly'
      next_date: templateData.next_date || getNextDate(templateData.frequency || 'monthly'),
      is_active: true,
      last_generated: null,
      generated_count: 0,
    }

    const updated = [...recurringInvoices, newRecurring]
    setRecurringInvoices(updated)
    saveToLocalStorage(updated)

    return newRecurring
  }

  // Update a recurring invoice
  const updateRecurring = async (id, updates) => {
    const updated = recurringInvoices.map(r =>
      r.id === id ? { ...r, ...updates } : r
    )
    setRecurringInvoices(updated)
    saveToLocalStorage(updated)
  }

  // Delete a recurring invoice
  const deleteRecurring = async (id) => {
    const updated = recurringInvoices.filter(r => r.id !== id)
    setRecurringInvoices(updated)
    saveToLocalStorage(updated)
  }

  // Toggle active status
  const toggleActive = async (id) => {
    const updated = recurringInvoices.map(r =>
      r.id === id ? { ...r, is_active: !r.is_active } : r
    )
    setRecurringInvoices(updated)
    saveToLocalStorage(updated)
  }

  // Generate invoice from recurring template
  const generateInvoice = async (recurringId, createInvoice) => {
    const recurring = recurringInvoices.find(r => r.id === recurringId)
    if (!recurring) return null

    // Create a new invoice from the template
    const invoiceData = {
      ...recurring.template,
      invoice_number: generateInvoiceNumber(recurring),
      issue_date: new Date().toISOString().split('T')[0],
      due_date: calculateDueDate(recurring.template.payment_terms || 30),
      status: 'pending',
    }

    const newInvoice = await createInvoice(invoiceData)

    // Update the recurring invoice metadata
    const nextDate = getNextDate(recurring.frequency, new Date())
    const updated = recurringInvoices.map(r =>
      r.id === recurringId
        ? {
            ...r,
            next_date: nextDate,
            last_generated: new Date().toISOString(),
            generated_count: (r.generated_count || 0) + 1,
          }
        : r
    )
    setRecurringInvoices(updated)
    saveToLocalStorage(updated)

    return newInvoice
  }

  // Check for due recurring invoices
  const getDueRecurringInvoices = () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return recurringInvoices.filter(r => {
      if (!r.is_active) return false
      const nextDate = new Date(r.next_date)
      nextDate.setHours(0, 0, 0, 0)
      return nextDate <= now
    })
  }

  return (
    <RecurringInvoicesContext.Provider
      value={{
        recurringInvoices,
        loading,
        createRecurring,
        updateRecurring,
        deleteRecurring,
        toggleActive,
        generateInvoice,
        getDueRecurringInvoices,
      }}
    >
      {children}
    </RecurringInvoicesContext.Provider>
  )
}

export const useRecurringInvoices = () => {
  const context = useContext(RecurringInvoicesContext)
  if (!context) {
    throw new Error('useRecurringInvoices must be used within RecurringInvoicesProvider')
  }
  return context
}

// Helper functions
const getNextDate = (frequency, fromDate = new Date()) => {
  const date = new Date(fromDate)

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'biweekly':
      date.setDate(date.getDate() + 14)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
    default:
      date.setMonth(date.getMonth() + 1)
  }

  return date.toISOString().split('T')[0]
}

const calculateDueDate = (paymentTerms = 30) => {
  const date = new Date()
  date.setDate(date.getDate() + paymentTerms)
  return date.toISOString().split('T')[0]
}

const generateInvoiceNumber = (recurring) => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const count = String((recurring.generated_count || 0) + 1).padStart(3, '0')
  const clientPrefix = (recurring.template.client_name || 'CLT').substring(0, 3).toUpperCase()
  return `REC-${clientPrefix}-${year}${month}-${count}`
}
