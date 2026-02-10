import { createContext, useContext, useState, useCallback } from 'react'

const ExpenseContext = createContext({})

const LOCAL_STORAGE_KEY = 'invoice_builder_expenses'

const getLocalExpenses = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const setLocalExpenses = (expenses) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses))
  } catch { /* localStorage full or unavailable */ }
}

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState(() => getLocalExpenses())
  const loading = false

  const fetchExpenses = useCallback(() => {
    setExpenses(getLocalExpenses())
  }, [])

  const createExpense = (expenseData) => {
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [newExpense, ...getLocalExpenses()]
    setLocalExpenses(updated)
    setExpenses(updated)
    return newExpense
  }

  const updateExpense = (id, expenseData) => {
    const updated = getLocalExpenses().map(exp =>
      exp.id === id ? { ...exp, ...expenseData, updated_at: new Date().toISOString() } : exp
    )
    setLocalExpenses(updated)
    setExpenses(updated)
    return updated.find(exp => exp.id === id)
  }

  const deleteExpense = (id) => {
    const updated = getLocalExpenses().filter(exp => exp.id !== id)
    setLocalExpenses(updated)
    setExpenses(updated)
  }

  const getExpense = (id) => {
    return getLocalExpenses().find(exp => exp.id === id) || null
  }

  return (
    <ExpenseContext.Provider value={{
      expenses,
      loading,
      createExpense,
      updateExpense,
      deleteExpense,
      getExpense,
      refreshExpenses: fetchExpenses,
    }}>
      {children}
    </ExpenseContext.Provider>
  )
}

export const useExpenses = () => {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider')
  }
  return context
}
