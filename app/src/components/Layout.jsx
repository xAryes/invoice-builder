import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useInvoices } from '../hooks/useInvoices'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { isSupabaseConfigured } from '../lib/supabase'
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal'
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Search,
  ChevronRight,
  Users,
  Sun,
  Moon,
  Keyboard,
  RefreshCw,
  Plus,
  Bell,
  Sparkles,
  X,
  ChevronDown,
  User,
  HelpCircle,
  Zap,
  Copy,
  Send,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: RefreshCw, label: 'Recurring', path: '/recurring' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

// Global Search Modal Component
const GlobalSearchModal = ({ isOpen, onClose, invoices, navigate }) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const results = query.trim()
    ? invoices.filter(inv => {
        const q = query.toLowerCase()
        return (
          (inv.client_name || inv.clientName || '').toLowerCase().includes(q) ||
          (inv.client_email || inv.clientEmail || '').toLowerCase().includes(q) ||
          (inv.invoice_number || inv.invoiceNumber || '').toLowerCase().includes(q)
        )
      }).slice(0, 8)
    : []

  const quickActions = [
    { icon: Plus, label: 'Create New Invoice', action: () => navigate('/invoice/new'), kbd: 'N' },
    { icon: Users, label: 'View Clients', action: () => navigate('/clients'), kbd: 'C' },
    { icon: Settings, label: 'Settings', action: () => navigate('/settings'), kbd: 'S' },
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-white/5">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search invoices, clients, or type a command..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none text-base"
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {query.trim() ? (
              results.length > 0 ? (
                <div className="p-2">
                  <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2 uppercase tracking-wide font-medium">
                    Invoices
                  </p>
                  {results.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => {
                        navigate(`/invoice/${inv.id}`)
                        onClose()
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition text-left"
                    >
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {inv.invoice_number || inv.invoiceNumber || `INV-${inv.id}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                          {inv.client_name || inv.clientName || 'No client'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No results found</p>
                </div>
              )
            ) : (
              <div className="p-2">
                <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2 uppercase tracking-wide font-medium">
                  Quick Actions
                </p>
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      action.action()
                      onClose()
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition text-left"
                  >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center">
                      <action.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                      {action.label}
                    </span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-xs rounded font-mono">
                      {action.kbd}
                    </kbd>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
              <span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-white/10 rounded text-[10px] mr-1">↑↓</kbd>
                to navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-white/10 rounded text-[10px] mr-1">↵</kbd>
                to select
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-white/10 rounded text-[10px] mr-1">esc</kbd>
                to close
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Profile Dropdown Component
const ProfileDropdown = ({ user, onSignOut, theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || 'user@example.com'
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-emerald-500/20">
          {userInitials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
            {userName}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <Link
                to="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Profile Settings</span>
              </Link>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Help & Support</span>
              </a>
            </div>

            {/* Sign Out */}
            <div className="p-2 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => {
                  setIsOpen(false)
                  onSignOut()
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Quick Actions Dropdown Component
const QuickActionsDropdown = ({ navigate }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const actions = [
    { icon: FileText, label: 'New Invoice', path: '/invoice/new', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: Copy, label: 'Duplicate Last', action: () => {}, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10' },
    { icon: Send, label: 'Quick Send', action: () => {}, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: Users, label: 'Add Client', path: '/clients', color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
      >
        <Zap className="w-4 h-4" />
        <span className="hidden sm:inline">Quick</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50"
          >
            <div className="p-2">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    if (action.path) {
                      navigate(action.path)
                    } else if (action.action) {
                      action.action()
                    }
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const Layout = ({ children }) => {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { invoices } = useInvoices()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  useKeyboardShortcuts({
    onShowHelp: () => setShowShortcuts(true),
    onEscape: () => {
      setShowShortcuts(false)
      setShowSearch(false)
    },
  })

  // Cmd+K keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#0a0a0c] flex">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 h-screen bg-white dark:bg-[#111113] border-r border-gray-200/80 dark:border-white/5 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M9 15h6" />
                <path d="M9 11h6" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-gray-900 dark:text-white">Invoice Builder</span>
            )}
          </div>
        </div>

        {/* Quick Action */}
        {!sidebarCollapsed && (
          <div className="px-3 pt-4">
            <Link to="/invoice/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
              >
                <Plus className="w-4 h-4" />
                New Invoice
              </motion.button>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3">
          <p className={`text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600 font-semibold mb-2 ${sidebarCollapsed ? 'text-center' : 'px-3'}`}>
            {sidebarCollapsed ? '•••' : 'Menu'}
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      sidebarCollapsed ? 'justify-center' : ''
                    } ${
                      active
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-[18px] h-[18px] transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`} />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                    {active && !sidebarCollapsed && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full"
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-100 dark:border-white/5 p-3 space-y-1">
          <button
            onClick={() => setShowShortcuts(true)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300 transition-all w-full ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Keyboard Shortcuts' : undefined}
          >
            <Keyboard className="w-[18px] h-[18px]" />
            {!sidebarCollapsed && <span className="text-sm">Shortcuts</span>}
          </button>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300 transition-all w-full ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          >
            {theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
            {!sidebarCollapsed && <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300 transition-all w-full ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-[18px] h-[18px]" />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px]" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all w-full ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-[18px] h-[18px]" />
            {!sidebarCollapsed && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-[#111113] border-b border-gray-200/80 dark:border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-6 flex-1">
            {/* Search */}
            <button
              onClick={() => setShowSearch(true)}
              className="relative flex-1 max-w-md"
            >
              <div className="flex items-center gap-3 w-full pl-4 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition cursor-pointer">
                <Search className="w-4 h-4" />
                <span className="flex-1 text-left">Search invoices, clients...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-xs rounded-md font-mono">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {!isSupabaseConfigured() && (
              <span className="text-xs bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Demo
              </span>
            )}

            {/* Quick Actions */}
            <QuickActionsDropdown navigate={navigate} />

            {/* Notifications */}
            <button className="relative p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>

            {/* Profile Dropdown */}
            <ProfileDropdown
              user={user}
              onSignOut={handleSignOut}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <GlobalSearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        invoices={invoices || []}
        navigate={navigate}
      />
    </div>
  )
}
