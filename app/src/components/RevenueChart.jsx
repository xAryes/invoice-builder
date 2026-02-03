import { useMemo } from 'react'

const formatCurrency = (amount, currency = 'EUR') => {
  const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ' }
  return `${symbols[currency] || currency + ' '}${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const RevenueChart = ({ invoices, className = '' }) => {
  const chartData = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()

    // Get last 6 months of data
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, now.getMonth() - i, 1)
      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        label: MONTHS[date.getMonth()],
        revenue: 0,
        count: 0,
      })
    }

    // Calculate revenue per month
    invoices.forEach(inv => {
      const items = inv.line_items || inv.lineItems || []
      const total = items.reduce((sum, item) => {
        const subtotal = (item.quantity || 0) * (item.price || 0)
        const vat = subtotal * ((item.vat || 0) / 100)
        return sum + subtotal + vat
      }, 0)

      const invDate = new Date(inv.issue_date || inv.issueDate || inv.created_at)
      const monthData = months.find(m => m.month === invDate.getMonth() && m.year === invDate.getFullYear())
      if (monthData) {
        monthData.revenue += total
        monthData.count++
      }
    })

    const maxRevenue = Math.max(...months.map(m => m.revenue), 1)

    return { months, maxRevenue }
  }, [invoices])

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last 6 months</p>
        </div>
      </div>

      <div className="h-48 flex items-end gap-2">
        {chartData.months.map((month, idx) => {
          const heightPercent = chartData.maxRevenue > 0
            ? (month.revenue / chartData.maxRevenue) * 100
            : 0

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end h-36 relative group">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                    <p className="font-medium">{formatCurrency(month.revenue)}</p>
                    <p className="text-gray-300 dark:text-gray-600">{month.count} invoice{month.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Bar */}
                <div
                  className="w-full max-w-8 bg-gray-900 dark:bg-gray-100 rounded-t-md transition-all duration-300 hover:bg-gray-700 dark:hover:bg-gray-300 cursor-pointer"
                  style={{
                    height: `${Math.max(heightPercent, month.revenue > 0 ? 4 : 0)}%`,
                    minHeight: month.revenue > 0 ? '4px' : '0'
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{month.label}</span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(chartData.months.reduce((sum, m) => sum + m.revenue, 0))}
          </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Avg: <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(chartData.months.reduce((sum, m) => sum + m.revenue, 0) / 6)}
          </span>
        </div>
      </div>
    </div>
  )
}
