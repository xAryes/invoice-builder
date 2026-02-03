import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from './useAuth'

const ProfileContext = createContext({})

// Local storage keys for demo mode
const LOCAL_PROFILES_KEY = 'invoice_builder_profiles'
const LOCAL_CLIENTS_KEY = 'invoice_builder_clients'
const LOCAL_LINE_ITEMS_KEY = 'invoice_builder_line_items'

const getLocal = (key) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const setLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

export const ProfileProvider = ({ children }) => {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [clients, setClients] = useState([])
  const [lineItems, setLineItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all saved data
  const fetchData = useCallback(async () => {
    setLoading(true)

    if (!isSupabaseConfigured() || !user) {
      // Demo mode - use localStorage
      setProfiles(getLocal(LOCAL_PROFILES_KEY))
      setClients(getLocal(LOCAL_CLIENTS_KEY))
      setLineItems(getLocal(LOCAL_LINE_ITEMS_KEY))
      setLoading(false)
      return
    }

    try {
      const [profilesRes, clientsRes, lineItemsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id),
        supabase.from('clients').select('*').eq('user_id', user.id),
        supabase.from('saved_line_items').select('*').eq('user_id', user.id),
      ])

      setProfiles(profilesRes.data || [])
      setClients(clientsRes.data || [])
      setLineItems(lineItemsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Profile CRUD
  const saveProfile = async (profileData) => {
    if (!isSupabaseConfigured() || !user) {
      const newProfile = { id: Date.now().toString(), ...profileData }
      const updated = [...getLocal(LOCAL_PROFILES_KEY), newProfile]
      setLocal(LOCAL_PROFILES_KEY, updated)
      setProfiles(updated)
      return newProfile
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{ ...profileData, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    setProfiles(prev => [...prev, data])
    return data
  }

  const deleteProfile = async (id) => {
    if (!isSupabaseConfigured() || !user) {
      const updated = getLocal(LOCAL_PROFILES_KEY).filter(p => p.id !== id)
      setLocal(LOCAL_PROFILES_KEY, updated)
      setProfiles(updated)
      return
    }

    const { error } = await supabase.from('profiles').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    setProfiles(prev => prev.filter(p => p.id !== id))
  }

  // Client CRUD
  const saveClient = async (clientData) => {
    if (!isSupabaseConfigured() || !user) {
      const newClient = { id: Date.now().toString(), ...clientData }
      const updated = [...getLocal(LOCAL_CLIENTS_KEY), newClient]
      setLocal(LOCAL_CLIENTS_KEY, updated)
      setClients(updated)
      return newClient
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{ ...clientData, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    setClients(prev => [...prev, data])
    return data
  }

  const updateClient = async (id, clientData) => {
    if (!isSupabaseConfigured() || !user) {
      const updated = getLocal(LOCAL_CLIENTS_KEY).map(c =>
        c.id === id ? { ...c, ...clientData } : c
      )
      setLocal(LOCAL_CLIENTS_KEY, updated)
      setClients(updated)
      return updated.find(c => c.id === id)
    }

    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    setClients(prev => prev.map(c => c.id === id ? data : c))
    return data
  }

  const deleteClient = async (id) => {
    if (!isSupabaseConfigured() || !user) {
      const updated = getLocal(LOCAL_CLIENTS_KEY).filter(c => c.id !== id)
      setLocal(LOCAL_CLIENTS_KEY, updated)
      setClients(updated)
      return
    }

    const { error } = await supabase.from('clients').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    setClients(prev => prev.filter(c => c.id !== id))
  }

  // Line Items CRUD
  const saveLineItem = async (itemData) => {
    if (!isSupabaseConfigured() || !user) {
      const newItem = { id: Date.now().toString(), ...itemData }
      const updated = [...getLocal(LOCAL_LINE_ITEMS_KEY), newItem]
      setLocal(LOCAL_LINE_ITEMS_KEY, updated)
      setLineItems(updated)
      return newItem
    }

    const { data, error } = await supabase
      .from('saved_line_items')
      .insert([{ ...itemData, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    setLineItems(prev => [...prev, data])
    return data
  }

  const deleteLineItem = async (id) => {
    if (!isSupabaseConfigured() || !user) {
      const updated = getLocal(LOCAL_LINE_ITEMS_KEY).filter(i => i.id !== id)
      setLocal(LOCAL_LINE_ITEMS_KEY, updated)
      setLineItems(updated)
      return
    }

    const { error } = await supabase.from('saved_line_items').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    setLineItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <ProfileContext.Provider value={{
      profiles,
      clients,
      lineItems,
      loading,
      saveProfile,
      deleteProfile,
      saveClient,
      updateClient,
      deleteClient,
      saveLineItem,
      deleteLineItem,
      refreshData: fetchData,
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfiles = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider')
  }
  return context
}
