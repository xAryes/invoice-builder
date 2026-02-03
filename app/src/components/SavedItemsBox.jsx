import { Check, X } from 'lucide-react'

export const SavedItemsBox = ({ items, onLoad, onDelete, displayKey, secondaryKey = null }) => {
  if (!items || items.length === 0) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
      <p className="text-xs font-medium text-yellow-800 mb-2">Saved Items</p>
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-yellow-100 rounded px-2 py-1"
          >
            <span className="text-sm text-gray-700 truncate flex-1">
              {item[displayKey]}
              {secondaryKey && item[secondaryKey] ? ` - ${item[secondaryKey]}` : ''}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => onLoad(item)}
                className="text-green-600 hover:text-green-800 p-1"
                title="Load"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
