import { forwardRef } from 'react'

export const TextArea = forwardRef(({
  label,
  error,
  rows = 3,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`
          w-full px-3 py-2 border rounded-md text-sm resize-none
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent
          ${error ? 'border-red-300 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600'}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
})

TextArea.displayName = 'TextArea'
