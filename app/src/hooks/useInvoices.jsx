import { createContext, useContext, useState, useCallback } from 'react'

const InvoiceContext = createContext({})

const LOCAL_STORAGE_KEY = 'invoice_builder_invoices'

const getLocalInvoices = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const setLocalInvoices = (invoices) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(invoices))
  } catch { /* localStorage full or unavailable */ }
}

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState(() => getLocalInvoices())
  const loading = false

  const fetchInvoices = useCallback(() => {
    setInvoices(getLocalInvoices())
  }, [])

  const createInvoice = (invoiceData) => {
    const newInvoice = {
      id: Date.now().toString(),
      ...invoiceData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [newInvoice, ...getLocalInvoices()]
    setLocalInvoices(updated)
    setInvoices(updated)
    return newInvoice
  }

  const updateInvoice = (id, invoiceData) => {
    const updated = getLocalInvoices().map(inv =>
      inv.id === id ? { ...inv, ...invoiceData, updated_at: new Date().toISOString() } : inv
    )
    setLocalInvoices(updated)
    setInvoices(updated)
    return updated.find(inv => inv.id === id)
  }

  const deleteInvoice = (id) => {
    const updated = getLocalInvoices().filter(inv => inv.id !== id)
    setLocalInvoices(updated)
    setInvoices(updated)
  }

  const getInvoice = (id) => {
    return getLocalInvoices().find(inv => inv.id === id) || null
  }

  return (
    <InvoiceContext.Provider value={{
      invoices,
      loading,
      createInvoice,
      updateInvoice,
      deleteInvoice,
      getInvoice,
      refreshInvoices: fetchInvoices,
    }}>
      {children}
    </InvoiceContext.Provider>
  )
}

export const useInvoices = () => {
  const context = useContext(InvoiceContext)
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider')
  }
  return context
}
