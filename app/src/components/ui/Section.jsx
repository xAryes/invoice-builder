import { ChevronDown } from 'lucide-react'

export const Section = ({ title, isOpen, onToggle, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg transition-colors"
    >
      <span className="font-semibold text-gray-800 dark:text-white">{title}</span>
      <ChevronDown
        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    {isOpen && (
      <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
        {children}
      </div>
    )}
  </div>
)
