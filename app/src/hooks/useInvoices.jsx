import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from './useAuth'

const InvoiceContext = createContext({})

// Local storage fallback for demo mode
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
  } catch {}
}

export const InvoiceProvider = ({ children }) => {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true)

    if (!isSupabaseConfigured() || !user) {
      // Demo mode - use localStorage
      setInvoices(getLocalInvoices())
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // Create invoice
  const createInvoice = async (invoiceData) => {
    if (!isSupabaseConfigured() || !user) {
      // Demo mode
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

    const { data, error } = await supabase
      .from('invoices')
      .insert([{ ...invoiceData, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    setInvoices(prev => [data, ...prev])
    return data
  }

  // Update invoice
  const updateInvoice = async (id, invoiceData) => {
    if (!isSupabaseConfigured() || !user) {
      // Demo mode
      const updated = getLocalInvoices().map(inv =>
        inv.id === id ? { ...inv, ...invoiceData, updated_at: new Date().toISOString() } : inv
      )
      setLocalInvoices(updated)
      setInvoices(updated)
      return updated.find(inv => inv.id === id)
    }

    const { data, error } = await supabase
      .from('invoices')
      .update({ ...invoiceData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    setInvoices(prev => prev.map(inv => inv.id === id ? data : inv))
    return data
  }

  // Delete invoice
  const deleteInvoice = async (id) => {
    if (!isSupabaseConfigured() || !user) {
      // Demo mode
      const updated = getLocalInvoices().filter(inv => inv.id !== id)
      setLocalInvoices(updated)
      setInvoices(updated)
      return
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    setInvoices(prev => prev.filter(inv => inv.id !== id))
  }

  // Get single invoice
  const getInvoice = async (id) => {
    if (!isSupabaseConfigured() || !user) {
      return getLocalInvoices().find(inv => inv.id === id) || null
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return data
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
