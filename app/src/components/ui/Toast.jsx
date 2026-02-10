import { useState, useEffect, useCallback, createContext, useContext } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

const toastIcons = {
  success: Check,
  error: X,
  warning: AlertCircle,
  info: Info,
}

const toastStyles = {
  success: {
    bg: 'bg-brand-500/10 dark:bg-brand-500/10',
    border: 'border-brand-500/20',
    icon: 'bg-brand-500/20 text-brand-500',
    text: 'text-brand-700 dark:text-brand-400',
  },
  error: {
    bg: 'bg-red-500/10 dark:bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'bg-red-500/20 text-red-500',
    text: 'text-red-700 dark:text-red-400',
  },
  warning: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'bg-amber-500/20 text-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
  },
  info: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'bg-blue-500/20 text-blue-500',
    text: 'text-blue-700 dark:text-blue-400',
  },
}

const Toast = ({ id, type = 'success', message, onDismiss }) => {
  const Icon = toastIcons[type]
  const styles = toastStyles[type]

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${styles.bg} ${styles.border} shadow-lg backdrop-blur-xl min-w-[280px] max-w-md`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.icon}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className={`flex-1 text-sm font-medium ${styles.text}`}>{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="p-1 rounded-lg hover:bg-white/10 text-gray-400 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, message }])
    return id
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (message) => addToast('success', message),
    error: (message) => addToast('error', message),
    warning: (message) => addToast('warning', message),
    info: (message) => addToast('info', message),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence mode="sync">
          {toasts.map((t) => (
            <Toast
              key={t.id}
              id={t.id}
              type={t.type}
              message={t.message}
              onDismiss={dismissToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    // Return a no-op toast if used outside provider
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    }
  }
  return context
}
