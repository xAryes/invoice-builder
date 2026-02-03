import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

export const useKeyboardShortcuts = (shortcuts = {}) => {
  const navigate = useNavigate()

  const handleKeyDown = useCallback((e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      // Allow Escape to blur inputs
      if (e.key === 'Escape') {
        e.target.blur()
      }
      return
    }

    const modKey = isMac ? e.metaKey : e.ctrlKey

    // Global shortcuts
    if (modKey && e.key === 'k') {
      e.preventDefault()
      // Focus search input
      const searchInput = document.querySelector('input[placeholder*="Search"]')
      if (searchInput) searchInput.focus()
      return
    }

    if (e.key === 'n' && !modKey && !e.shiftKey && !e.altKey) {
      e.preventDefault()
      navigate('/invoice/new')
      return
    }

    if (e.key === 'g' && !modKey && !e.shiftKey && !e.altKey) {
      e.preventDefault()
      navigate('/dashboard')
      return
    }

    if (e.key === 'c' && !modKey && !e.shiftKey && !e.altKey) {
      e.preventDefault()
      navigate('/clients')
      return
    }

    if (e.key === 's' && !modKey && !e.shiftKey && !e.altKey) {
      e.preventDefault()
      navigate('/settings')
      return
    }

    if (e.key === '?' && e.shiftKey) {
      e.preventDefault()
      shortcuts.onShowHelp?.()
      return
    }

    // Custom shortcuts
    if (shortcuts.onSave && modKey && e.key === 's') {
      e.preventDefault()
      shortcuts.onSave()
      return
    }

    if (shortcuts.onDelete && (e.key === 'Delete' || e.key === 'Backspace') && modKey) {
      e.preventDefault()
      shortcuts.onDelete()
      return
    }

    if (shortcuts.onEscape && e.key === 'Escape') {
      e.preventDefault()
      shortcuts.onEscape()
      return
    }

    if (shortcuts.onPrint && modKey && e.key === 'p') {
      e.preventDefault()
      shortcuts.onPrint()
      return
    }
  }, [navigate, shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export const KEYBOARD_SHORTCUTS = [
  { keys: ['N'], description: 'New invoice' },
  { keys: ['G'], description: 'Go to Dashboard' },
  { keys: ['C'], description: 'Go to Clients' },
  { keys: ['S'], description: 'Go to Settings' },
  { keys: [isMac ? '⌘' : 'Ctrl', 'K'], description: 'Focus search' },
  { keys: [isMac ? '⌘' : 'Ctrl', 'S'], description: 'Save (in editor)' },
  { keys: [isMac ? '⌘' : 'Ctrl', 'P'], description: 'Print (in editor)' },
  { keys: ['?'], description: 'Show shortcuts' },
  { keys: ['Esc'], description: 'Close modal / blur input' },
]
