import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecurringInvoices } from '../hooks/useRecurringInvoices'
import { useInvoices } from '../hooks/useInvoices'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui'
import {
  Plus,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Calendar,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatCurrency = (amount, currency = 'EUR') => {
  const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ' }
  return `${symbols[currency] || currency + ' '}${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const calculateTotal = (template) => {
  const items = template.line_items || template.lineItems || []
  return items.reduce((sum, item) => {
    const subtotal = (item.quantity || 0) * (item.price || 0)
    const vat = subtotal * ((item.vat || 0) / 100)
    return sum + subtotal + vat
  }, 0)
}

export const RecurringInvoices = () => {
  const navigate = useNavigate()
  const { recurringInvoices, loading, toggleActive, deleteRecurring, generateInvoice, getDueRecurringInvoices } = useRecurringInvoices()
  const { createInvoice } = useInvoices()
  const [generating, setGenerating] = useState(null)

  const dueRecurring = getDueRecurringInvoices()

  const handleGenerate = async (recurring) => {
    setGenerating(recurring.id)
    try {
      const newInvoice = await generateInvoice(recurring.id, createInvoice)
      if (newInvoice) {
        navigate(`/invoice/${newInvoice.id}`)
      }
    } catch (error) {
      console.error('Error generating invoice:', error)
      alert('Failed to generate invoice')
    } finally {
      setGenerating(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this recurring invoice?')) return
    await deleteRecurring(id)
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Recurring Invoices</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Set up automatic invoice generation
              </p>
            </div>
            <Button variant="dark" onClick={() => navigate('/invoice/new?recurring=true')}>
              <Plus className="w-4 h-4" />
              New Recurring
            </Button>
          </div>

          {/* Due Invoices Alert */}
          {dueRecurring.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    {dueRecurring.length} recurring invoice{dueRecurring.length !== 1 ? 's are' : ' is'} due
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Click "Generate" to create the invoices now.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recurring List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-gray-200 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 rounded-full mx-auto" />
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">Loading...</p>
              </div>
            ) : recurringInvoices.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                  No recurring invoices
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                  Set up recurring invoices to automatically bill clients on a schedule.
                </p>
                <Button variant="dark" onClick={() => navigate('/invoice/new?recurring=true')}>
                  <Plus className="w-4 h-4" />
                  Create Recurring Invoice
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {recurringInvoices.map((recurring) => {
                  const template = recurring.template
                  const total = calculateTotal(template)
                  const isDue = new Date(recurring.next_date) <= new Date()

                  return (
                    <div
                      key={recurring.id}
                      className={`p-5 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors ${!recurring.is_active ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                              {template.client_name || template.clientName || 'Unnamed Client'}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              recurring.is_active
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {recurring.is_active ? 'Active' : 'Paused'}
                            </span>
                            {isDue && recurring.is_active && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                                Due
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <RefreshCw className="w-3.5 h-3.5" />
                              {FREQUENCY_OPTIONS.find(f => f.value === recurring.frequency)?.label || recurring.frequency}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              Next: {formatDate(recurring.next_date)}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(total, template.currency)}
                            </span>
                          </div>

                          {recurring.last_generated && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 dark:text-gray-500">
                              <CheckCircle className="w-3 h-3" />
                              Last generated: {formatDate(recurring.last_generated)}
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              {recurring.generated_count || 0} total
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleGenerate(recurring)}
                            disabled={generating === recurring.id}
                            className="!px-3"
                          >
                            {generating === recurring.id ? (
                              <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                Generate
                              </>
                            )}
                          </Button>

                          <button
                            onClick={() => toggleActive(recurring.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
                            title={recurring.is_active ? 'Pause' : 'Resume'}
                          >
                            {recurring.is_active ? (
                              <Pause className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <Play className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(recurring.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              How recurring invoices work
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Create a recurring invoice template with client details and line items</li>
              <li>• Choose the frequency (weekly, monthly, quarterly, etc.)</li>
              <li>• When the next date arrives, click "Generate" to create the invoice</li>
              <li>• The generated invoice will be ready to send with updated dates</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
