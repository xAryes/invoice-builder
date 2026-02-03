import { useState } from 'react'
import { useInvoiceHistory } from '../hooks/useInvoiceHistory'
import {
  Clock,
  FileText,
  Edit,
  CheckCircle,
  Download,
  Mail,
  CreditCard,
  Trash2,
  Copy,
  ChevronRight,
  History,
  Filter,
} from 'lucide-react'

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const mins = Math.floor(diff / (60 * 1000))
    return mins <= 1 ? 'Just now' : `${mins} minutes ago`
  }

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }

  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  // Otherwise, show full date
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const actionConfig = {
  created: {
    icon: FileText,
    label: 'Invoice created',
    color: 'text-green-600 bg-green-50',
    iconColor: 'text-green-500',
  },
  updated: {
    icon: Edit,
    label: 'Invoice updated',
    color: 'text-teal-600 bg-teal-50',
    iconColor: 'text-teal-500',
  },
  status_changed: {
    icon: CheckCircle,
    label: 'Status changed',
    color: 'text-purple-600 bg-purple-50',
    iconColor: 'text-purple-500',
  },
  exported_pdf: {
    icon: Download,
    label: 'Exported as PDF',
    color: 'text-gray-600 bg-gray-50',
    iconColor: 'text-gray-500',
  },
  emailed: {
    icon: Mail,
    label: 'Sent via email',
    color: 'text-indigo-600 bg-indigo-50',
    iconColor: 'text-indigo-500',
  },
  payment_link_created: {
    icon: CreditCard,
    label: 'Payment link created',
    color: 'text-emerald-600 bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  deleted: {
    icon: Trash2,
    label: 'Invoice deleted',
    color: 'text-red-600 bg-red-50',
    iconColor: 'text-red-500',
  },
  duplicated: {
    icon: Copy,
    label: 'Invoice duplicated',
    color: 'text-amber-600 bg-amber-50',
    iconColor: 'text-amber-500',
  },
}

export const InvoiceHistoryItem = ({ entry, showInvoiceLink = false }) => {
  const config = actionConfig[entry.action] || actionConfig.updated
  const Icon = config.icon

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className={`p-2 rounded-lg ${config.color} dark:bg-opacity-20`}>
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {config.label}
          </span>
          {showInvoiceLink && entry.details?.invoiceNumber && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {entry.details.invoiceNumber}
            </span>
          )}
        </div>
        {entry.details?.oldStatus && entry.details?.newStatus && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {entry.details.oldStatus} → {entry.details.newStatus}
          </p>
        )}
        {entry.details?.changes && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {entry.details.changes.join(', ')}
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTime(entry.timestamp)}
          {entry.user && (
            <span className="ml-2">by {entry.user.split('@')[0]}</span>
          )}
        </p>
      </div>
    </div>
  )
}

export const InvoiceHistoryPanel = ({ invoiceId, className = '' }) => {
  const { getInvoiceHistory } = useInvoiceHistory()
  const history = getInvoiceHistory(invoiceId)

  if (history.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">Activity Log</h3>
        </div>
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No activity yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-gray-500" />
        <h3 className="font-medium text-gray-900 dark:text-white">Activity Log</h3>
        <span className="text-xs text-gray-400 ml-auto">{history.length} events</span>
      </div>
      <div className="space-y-1">
        {history.slice(0, 10).map(entry => (
          <InvoiceHistoryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}

export const RecentActivityWidget = ({ limit = 10, className = '' }) => {
  const { getRecentHistory } = useInvoiceHistory()
  const [filter, setFilter] = useState('all')
  const history = getRecentHistory(50)

  const filteredHistory = filter === 'all'
    ? history.slice(0, limit)
    : history.filter(h => h.action === filter).slice(0, limit)

  const filterOptions = [
    { value: 'all', label: 'All Activity' },
    { value: 'created', label: 'Created' },
    { value: 'status_changed', label: 'Status Changes' },
    { value: 'exported_pdf', label: 'Exports' },
    { value: 'emailed', label: 'Emails' },
  ]

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 text-gray-600 dark:text-gray-300"
        >
          {filterOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="p-8 text-center">
          <Clock className="w-10 h-10 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Activity will appear here as you work with invoices
          </p>
        </div>
      ) : (
        <div className="p-4">
          {filteredHistory.map(entry => (
            <InvoiceHistoryItem key={entry.id} entry={entry} showInvoiceLink />
          ))}
        </div>
      )}
    </div>
  )
}
