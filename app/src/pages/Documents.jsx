import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInvoices } from '../hooks/useInvoices'
import { useExpenses } from '../hooks/useExpenses'
import { Layout } from '../components/Layout'
import { useToast } from '../components/ui'
import {
  Search,
  FileText,
  Receipt,
  Copy,
  Trash2,
  ArrowUpRight,
  Plus,
  Download,
  Check,
  Calendar,
} from 'lucide-react'

const CURRENCY_SYMBOLS = { EUR: '€', USD: '$', GBP: '£', CHF: 'Fr.', CAD: 'C$', AUD: 'A$', JPY: '¥', CNY: '¥', INR: '₹', BRL: 'R$', MXN: 'MX$', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč' }

const formatCurrency = (amount, currency) => `${CURRENCY_SYMBOLS[currency] || currency + ' '}${Number(amount || 0).toFixed(2)}`

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length === 3) {
    const date = new Date(parts[0], parts[1] - 1, parts[2])
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return dateStr
}

export const Documents = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { invoices, createInvoice, deleteInvoice } = useInvoices()
  const { expenses, createExpense, deleteExpense } = useExpenses()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [downloaded, setDownloaded] = useState(() => {
    try { return JSON.parse(localStorage.getItem('invoice_builder_downloaded') || '[]') } catch { return [] }
  })

  const toggleDownloaded = (doc) => {
    const key = `${doc.type}-${doc.id}`
    setDownloaded(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      localStorage.setItem('invoice_builder_downloaded', JSON.stringify(next))
      return next
    })
  }

  const documents = useMemo(() => {
    const invDocs = invoices.map(inv => {
      const lineItems = inv.line_items || inv.lineItems || []
      const invExpenses = inv.expenses || []
      const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0)
      const vat = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0) * (Number(item.vat) || 0) / 100, 0)
      const expTotal = invExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
      return {
        id: inv.id, type: 'invoice',
        number: inv.invoice_number || inv.invoiceNumber || `INV-${inv.id}`,
        client: inv.client_name || inv.clientName || '',
        date: inv.issue_date || inv.issueDate || inv.created_at || '',
        amount: subtotal + vat + expTotal,
        currency: inv.currency || 'EUR',
        raw: inv,
      }
    })

    const expDocs = expenses.map(exp => {
      const expItems = exp.expenses || []
      const total = expItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
      return {
        id: exp.id, type: 'expense',
        number: exp.report_number || exp.reportNumber || `EXP-${exp.id}`,
        client: exp.client_name || exp.clientName || '',
        date: exp.date || exp.created_at || '',
        amount: total,
        currency: exp.currency || 'EUR',
        raw: exp,
      }
    })

    let all = [...invDocs, ...expDocs]
    if (filter === 'invoices') all = all.filter(d => d.type === 'invoice')
    if (filter === 'expenses') all = all.filter(d => d.type === 'expense')
    if (search.trim()) {
      const q = search.toLowerCase()
      all = all.filter(d => d.number.toLowerCase().includes(q) || d.client.toLowerCase().includes(q))
    }
    all.sort((a, b) => new Date(b.date) - new Date(a.date))
    return all
  }, [invoices, expenses, filter, search])

  // Group documents by month
  const groupedByMonth = useMemo(() => {
    const groups = []
    let currentKey = null
    let currentGroup = null

    for (const doc of documents) {
      const d = doc.date ? new Date(doc.date.split('T')[0]) : null
      const monthKey = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : 'undated'
      const monthLabel = d
        ? d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Undated'

      if (monthKey !== currentKey) {
        currentKey = monthKey
        currentGroup = { key: monthKey, label: monthLabel, docs: [] }
        groups.push(currentGroup)
      }
      currentGroup.docs.push(doc)
    }
    return groups
  }, [documents])

  // Monthly totals by currency
  const getMonthTotal = (docs) => {
    const byCurrency = {}
    for (const doc of docs) {
      const c = doc.currency || 'EUR'
      byCurrency[c] = (byCurrency[c] || 0) + doc.amount
    }
    return Object.entries(byCurrency).map(([c, a]) => formatCurrency(a, c)).join(' + ')
  }

  const handleDuplicate = (doc) => {
    if (doc.type === 'invoice') {
      const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = doc.raw
      createInvoice({ ...rest, invoice_number: `${doc.number}-copy` })
      toast.success('Invoice duplicated')
    } else {
      const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = doc.raw
      createExpense({ ...rest, report_number: `${doc.number}-copy` })
      toast.success('Expense report duplicated')
    }
  }

  const handleDelete = (doc) => {
    if (confirmDelete === `${doc.type}-${doc.id}`) {
      if (doc.type === 'invoice') { deleteInvoice(doc.id); toast.success('Deleted') }
      else { deleteExpense(doc.id); toast.success('Deleted') }
      setConfirmDelete(null)
    } else {
      setConfirmDelete(`${doc.type}-${doc.id}`)
      setTimeout(() => setConfirmDelete(prev => prev === `${doc.type}-${doc.id}` ? null : prev), 3000)
    }
  }

  const handleEdit = (doc) => navigate(doc.type === 'invoice' ? `/invoice/${doc.id}` : `/expense/${doc.id}`)

  return (
    <Layout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h1>
            <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">
              {documents.length} document{documents.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
              <Plus className="w-3.5 h-3.5" />
              New Invoice
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-[13px] bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 outline-none text-gray-900 dark:text-white transition placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>
          <div className="flex items-center gap-0.5 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-lg p-0.5">
            {[
              { value: 'all', label: 'All' },
              { value: 'invoices', label: 'Invoices' },
              { value: 'expenses', label: 'Expenses' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1 text-[12px] font-medium rounded-md transition ${
                  filter === f.value
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Document list grouped by month */}
        {documents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-[13px] text-gray-400 dark:text-gray-500">
              {search ? 'No documents match your search.' : 'No documents yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByMonth.map(group => (
              <div key={group.key}>
                {/* Month header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                    <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{group.label}</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md">{group.docs.length}</span>
                  </div>
                  <span className="text-[12px] font-mono text-gray-400 dark:text-gray-500">{getMonthTotal(group.docs)}</span>
                </div>

                {/* Documents in this month */}
                <div className="space-y-1.5">
                  {group.docs.map(doc => (
                    <div
                      key={`${doc.type}-${doc.id}`}
                      className="group flex items-center gap-4 px-4 py-3 bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/10 transition cursor-pointer"
                      onClick={() => handleEdit(doc)}
                    >
                      {/* Type icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        doc.type === 'invoice'
                          ? 'bg-blue-50 dark:bg-blue-500/10'
                          : 'bg-orange-50 dark:bg-orange-500/10'
                      }`}>
                        {doc.type === 'invoice'
                          ? <FileText className="w-4 h-4 text-blue-500" />
                          : <Receipt className="w-4 h-4 text-orange-500" />
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{doc.number}</span>
                          <ArrowUpRight className="w-3 h-3 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <div className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {doc.client || 'No client'} {doc.date && <span className="mx-1">&middot;</span>} {formatDate(doc.date)}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-[14px] font-semibold font-mono text-gray-900 dark:text-white">
                          {formatCurrency(doc.amount, doc.currency)}
                        </span>
                      </div>

                      {/* Downloaded indicator */}
                      {downloaded.includes(`${doc.type}-${doc.id}`) && (
                        <div className="flex-shrink-0" title="Downloaded">
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => toggleDownloaded(doc)}
                          className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition ${downloaded.includes(`${doc.type}-${doc.id}`) ? 'text-green-500 hover:text-gray-400' : 'text-gray-400 hover:text-green-500'}`}
                          title={downloaded.includes(`${doc.type}-${doc.id}`) ? 'Mark as not downloaded' : 'Mark as downloaded'}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDuplicate(doc)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition" title="Duplicate">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {confirmDelete === `${doc.type}-${doc.id}` ? (
                          <button onClick={() => handleDelete(doc)} className="px-2 py-0.5 text-[11px] font-medium bg-red-500 text-white rounded-md transition">
                            Confirm
                          </button>
                        ) : (
                          <button onClick={() => handleDelete(doc)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
