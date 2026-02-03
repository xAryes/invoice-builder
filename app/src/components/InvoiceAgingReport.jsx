import { useMemo } from 'react'
import { AlertCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

const formatCurrency = (amount, currency = 'EUR') => {
  const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ' }
  return `${symbols[currency] || currency + ' '}${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

const calculateTotal = (invoice) => {
  const items = invoice.line_items || invoice.lineItems || []
  return items.reduce((sum, item) => {
    const subtotal = (item.quantity || 0) * (item.price || 0)
    const vat = subtotal * ((item.vat || 0) / 100)
    return sum + subtotal + vat
  }, 0)
}

export const InvoiceAgingReport = ({ invoices, className = '' }) => {
  const agingData = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const aging = {
      current: { count: 0, amount: 0, label: 'Current', description: 'Not yet due', color: 'emerald' },
      upcoming: { count: 0, amount: 0, label: '1-15 days', description: 'Due soon', color: 'amber' },
      overdue30: { count: 0, amount: 0, label: '16-30 days', description: 'Overdue', color: 'orange' },
      overdue60: { count: 0, amount: 0, label: '31-60 days', description: 'Overdue', color: 'red' },
      overdue90: { count: 0, amount: 0, label: '60+ days', description: 'Severely overdue', color: 'red' },
    }

    // Only consider unpaid invoices (pending, draft, overdue)
    const unpaidInvoices = invoices.filter(inv => {
      const status = inv.status || 'draft'
      return status !== 'paid' && status !== 'cancelled'
    })

    unpaidInvoices.forEach(inv => {
      const dueDate = inv.due_date || inv.dueDate
      const total = calculateTotal(inv)

      if (!dueDate) {
        // No due date = current
        aging.current.count++
        aging.current.amount += total
        return
      }

      const due = new Date(dueDate)
      due.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) {
        // Not yet due
        if (diffDays >= -15) {
          // Due within 15 days
          aging.upcoming.count++
          aging.upcoming.amount += total
        } else {
          aging.current.count++
          aging.current.amount += total
        }
      } else if (diffDays <= 15) {
        aging.upcoming.count++
        aging.upcoming.amount += total
      } else if (diffDays <= 30) {
        aging.overdue30.count++
        aging.overdue30.amount += total
      } else if (diffDays <= 60) {
        aging.overdue60.count++
        aging.overdue60.amount += total
      } else {
        aging.overdue90.count++
        aging.overdue90.amount += total
      }
    })

    return aging
  }, [invoices])

  const totalOutstanding = Object.values(agingData).reduce((sum, bucket) => sum + bucket.amount, 0)
  const totalCount = Object.values(agingData).reduce((sum, bucket) => sum + bucket.count, 0)

  const getColorClasses = (color) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          text: 'text-emerald-600 dark:text-emerald-400',
          bar: 'bg-emerald-500 dark:bg-emerald-400',
        }
      case 'amber':
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/30',
          text: 'text-amber-600 dark:text-amber-400',
          bar: 'bg-amber-500 dark:bg-amber-400',
        }
      case 'orange':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          text: 'text-orange-600 dark:text-orange-400',
          bar: 'bg-orange-500 dark:bg-orange-400',
        }
      case 'red':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-600 dark:text-red-400',
          bar: 'bg-red-500 dark:bg-red-400',
        }
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-600 dark:text-gray-400',
          bar: 'bg-gray-500 dark:bg-gray-400',
        }
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Invoice Aging</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding receivables</p>
        </div>
        {totalOutstanding > 0 && (
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totalOutstanding)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {totalCount} invoice{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">All caught up!</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">No outstanding invoices</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(agingData).map(([key, bucket]) => {
            if (bucket.count === 0) return null

            const colors = getColorClasses(bucket.color)
            const percentage = totalOutstanding > 0 ? (bucket.amount / totalOutstanding) * 100 : 0

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${colors.bar}`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {bucket.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({bucket.count})
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${colors.text}`}>
                    {formatCurrency(bucket.amount)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${colors.bar}`}
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Warnings */}
      {(agingData.overdue60.count > 0 || agingData.overdue90.count > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-red-600 dark:text-red-400">
                {formatCurrency(agingData.overdue60.amount + agingData.overdue90.amount)}
              </span>
              {' '}is overdue by more than 30 days. Consider following up with these clients.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
