import { useMemo } from 'react'

const formatCurrency = (amount, currency = 'EUR') => {
  const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ' }
  return `${symbols[currency] || currency + ' '}${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export const ClientBreakdown = ({ invoices, className = '' }) => {
  const clientData = useMemo(() => {
    const clients = {}

    invoices.forEach(inv => {
      const clientName = inv.client_name || inv.clientName || 'Unknown Client'
      const items = inv.line_items || inv.lineItems || []
      const total = items.reduce((sum, item) => {
        const subtotal = (item.quantity || 0) * (item.price || 0)
        const vat = subtotal * ((item.vat || 0) / 100)
        return sum + subtotal + vat
      }, 0)

      if (!clients[clientName]) {
        clients[clientName] = {
          name: clientName,
          revenue: 0,
          invoiceCount: 0,
          paidCount: 0,
          pendingCount: 0,
        }
      }

      clients[clientName].revenue += total
      clients[clientName].invoiceCount++

      const status = inv.status || 'draft'
      if (status === 'paid') {
        clients[clientName].paidCount++
      } else if (status === 'pending' || status === 'overdue') {
        clients[clientName].pendingCount++
      }
    })

    // Convert to array and sort by revenue
    return Object.values(clients)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5) // Top 5 clients
  }, [invoices])

  const maxRevenue = Math.max(...clientData.map(c => c.revenue), 1)

  if (clientData.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 p-5 ${className}`}>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Top Clients</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No client data yet</p>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top Clients</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">By revenue</p>
        </div>
      </div>

      <div className="space-y-4">
        {clientData.map((client, idx) => {
          const percentage = (client.revenue / maxRevenue) * 100

          return (
            <div key={client.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {client.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white flex-shrink-0 ml-2">
                  {formatCurrency(client.revenue)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="ml-7">
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 dark:bg-gray-100 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span>{client.invoiceCount} invoice{client.invoiceCount !== 1 ? 's' : ''}</span>
                  {client.paidCount > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {client.paidCount} paid
                    </span>
                  )}
                  {client.pendingCount > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                      {client.pendingCount} pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {clientData.length >= 5 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
          Showing top 5 clients
        </p>
      )}
    </div>
  )
}
