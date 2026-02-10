import { createContext, useContext, useState, useCallback } from 'react'

const ProfileContext = createContext({})

const LOCAL_PROFILES_KEY = 'invoice_builder_profiles'
const LOCAL_CLIENTS_KEY = 'invoice_builder_clients'
const LOCAL_LINE_ITEMS_KEY = 'invoice_builder_line_items'
const LOCAL_SAVED_EXPENSES_KEY = 'invoice_builder_saved_expenses'

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
  } catch { /* localStorage full or unavailable */ }
}

export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState(() => getLocal(LOCAL_PROFILES_KEY))
  const [clients, setClients] = useState(() => getLocal(LOCAL_CLIENTS_KEY))
  const [lineItems, setLineItems] = useState(() => getLocal(LOCAL_LINE_ITEMS_KEY))
  const [savedExpenses, setSavedExpenses] = useState(() => getLocal(LOCAL_SAVED_EXPENSES_KEY))
  const loading = false

  const fetchData = useCallback(() => {
    setProfiles(getLocal(LOCAL_PROFILES_KEY))
    setClients(getLocal(LOCAL_CLIENTS_KEY))
    setLineItems(getLocal(LOCAL_LINE_ITEMS_KEY))
    setSavedExpenses(getLocal(LOCAL_SAVED_EXPENSES_KEY))
  }, [])

  // Profile CRUD
  const saveProfile = (profileData) => {
    const newProfile = { id: Date.now().toString(), ...profileData }
    const updated = [...getLocal(LOCAL_PROFILES_KEY), newProfile]
    setLocal(LOCAL_PROFILES_KEY, updated)
    setProfiles(updated)
    return newProfile
  }

  const updateProfile = (id, profileData) => {
    const updated = getLocal(LOCAL_PROFILES_KEY).map(p =>
      p.id === id ? { ...p, ...profileData } : p
    )
    setLocal(LOCAL_PROFILES_KEY, updated)
    setProfiles(updated)
    return updated.find(p => p.id === id)
  }

  const deleteProfile = (id) => {
    const updated = getLocal(LOCAL_PROFILES_KEY).filter(p => p.id !== id)
    setLocal(LOCAL_PROFILES_KEY, updated)
    setProfiles(updated)
  }

  // Client CRUD
  const saveClient = (clientData) => {
    const newClient = { id: Date.now().toString(), ...clientData }
    const updated = [...getLocal(LOCAL_CLIENTS_KEY), newClient]
    setLocal(LOCAL_CLIENTS_KEY, updated)
    setClients(updated)
    return newClient
  }

  const updateClient = (id, clientData) => {
    const updated = getLocal(LOCAL_CLIENTS_KEY).map(c =>
      c.id === id ? { ...c, ...clientData } : c
    )
    setLocal(LOCAL_CLIENTS_KEY, updated)
    setClients(updated)
    return updated.find(c => c.id === id)
  }

  const deleteClient = (id) => {
    const updated = getLocal(LOCAL_CLIENTS_KEY).filter(c => c.id !== id)
    setLocal(LOCAL_CLIENTS_KEY, updated)
    setClients(updated)
  }

  // Line Items CRUD
  const saveLineItem = (itemData) => {
    const newItem = { id: Date.now().toString(), ...itemData }
    const updated = [...getLocal(LOCAL_LINE_ITEMS_KEY), newItem]
    setLocal(LOCAL_LINE_ITEMS_KEY, updated)
    setLineItems(updated)
    return newItem
  }

  const deleteLineItem = (id) => {
    const updated = getLocal(LOCAL_LINE_ITEMS_KEY).filter(i => i.id !== id)
    setLocal(LOCAL_LINE_ITEMS_KEY, updated)
    setLineItems(updated)
  }

  // Saved Expense Templates CRUD
  const saveSavedExpense = (expenseData) => {
    const newItem = { id: Date.now().toString(), ...expenseData }
    const updated = [...getLocal(LOCAL_SAVED_EXPENSES_KEY), newItem]
    setLocal(LOCAL_SAVED_EXPENSES_KEY, updated)
    setSavedExpenses(updated)
    return newItem
  }

  const deleteSavedExpense = (id) => {
    const updated = getLocal(LOCAL_SAVED_EXPENSES_KEY).filter(e => e.id !== id)
    setLocal(LOCAL_SAVED_EXPENSES_KEY, updated)
    setSavedExpenses(updated)
  }

  return (
    <ProfileContext.Provider value={{
      profiles,
      clients,
      lineItems,
      savedExpenses,
      loading,
      saveProfile,
      updateProfile,
      deleteProfile,
      saveClient,
      updateClient,
      deleteClient,
      saveLineItem,
      deleteLineItem,
      saveSavedExpense,
      deleteSavedExpense,
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
