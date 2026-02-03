import { forwardRef } from 'react'

export const Select = forwardRef(({
  label,
  error,
  options = [],
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
      <select
        ref={ref}
        className={`
          w-full px-3 py-2 border rounded-md text-sm
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent
          ${error ? 'border-red-300 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600'}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white dark:bg-gray-700">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'
