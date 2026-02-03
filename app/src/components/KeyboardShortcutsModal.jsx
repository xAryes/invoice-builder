import { X } from 'lucide-react'
import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts'

export const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {KEYBOARD_SHORTCUTS.map((shortcut, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIdx) => (
                  <span key={keyIdx}>
                    <kbd className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                      {key}
                    </kbd>
                    {keyIdx < shortcut.keys.length - 1 && (
                      <span className="text-gray-400 dark:text-gray-500 mx-1">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  )
}
