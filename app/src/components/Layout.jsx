import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import {
  Sun,
  Moon,
  Plus,
  Receipt,
  FolderOpen,
  Settings,
} from 'lucide-react'

export const Layout = ({ children, wide = false }) => {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#0a0a0c] flex flex-col">
      {/* Top nav */}
      <header className="h-12 bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/5 flex items-center px-4 gap-1 flex-shrink-0 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 mr-3">
          <img src="/logo.svg" alt="Invoice Builder" className="w-6 h-6 flex-shrink-0" />
          <span className="font-semibold text-[13px] text-gray-900 dark:text-white hidden sm:block tracking-tight">
            Invoice Builder
          </span>
        </Link>

        <nav className="flex items-center gap-0.5">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors ${
              location.pathname === '/' || location.pathname.startsWith('/invoice')
                ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invoice</span>
          </Link>

          <Link
            to="/expense/new"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors ${
              isActive('/expense')
                ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expense</span>
          </Link>

          <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />

          <Link
            to="/documents"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors ${
              isActive('/documents')
                ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Documents</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors ${
              isActive('/settings')
                ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </nav>

        <div className="ml-auto">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className={`flex-1 ${wide ? '' : ''}`}>
        {children}
      </main>
    </div>
  )
}
