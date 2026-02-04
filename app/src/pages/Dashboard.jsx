import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInvoices } from '../hooks/useInvoices'
import { useAuth } from '../hooks/useAuth'
import { StatusBadge, getInvoiceStatus, STATUS_OPTIONS, useToast } from '../components/ui'
import { Layout } from '../components/Layout'
import {
  Plus,
  FileText,
  Trash2,
  Edit2,
  Search,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react'

const formatCurrency = (amount, currency = 'EUR') => {
  const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ' }
  return `${symbols[currency] || currency + ' '}${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const generateInvoiceId = (invoice) => {
  const date = invoice.created_at ? new Date(invoice.created_at) : new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const seq = String(invoice.id).slice(-3).padStart(3, '0')
  return invoice.invoice_number || `INV-${year}${month}${day}-${seq}`
}

const calculateInvoiceTotal = (invoice) => {
  const items = invoice.line_items || invoice.lineItems || []
  return items.reduce((sum, item) => {
    const subtotal = (item.quantity || 0) * (item.price || 0)
    const vat = subtotal * ((item.vat || 0) / 100)
    return sum + subtotal + vat
  }, 0)
}

// Minimal stat display
const StatItem = ({ label, value, prefix = '' }) => (
  <div>
    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{prefix}{value}</p>
  </div>
)

export const Dashboard = () => {
  const { invoices, loading, deleteInvoice, updateInvoice, createInvoice } = useInvoices()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [deletingId, setDeletingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    setDeletingId(id)
    try {
      await deleteInvoice(id)
      toast.success('Invoice deleted')
    } catch (error) {
      toast.error('Failed to delete invoice')
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (invoice, newStatus) => {
    try {
      await updateInvoice(invoice.id, { ...invoice, status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDuplicate = async (invoice) => {
    try {
      const newInvoice = {
        invoice_number: `${invoice.invoice_number || 'INV'}-COPY`,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: invoice.due_date,
        currency: invoice.currency,
        status: 'draft',
        project_name: invoice.project_name,
        notes: invoice.notes,
        your_name: invoice.your_name,
        your_address: invoice.your_address,
        your_email: invoice.your_email,
        your_tax_id: invoice.your_tax_id,
        client_name: invoice.client_name,
        client_address: invoice.client_address,
        client_email: invoice.client_email,
        client_tax_id: invoice.client_tax_id,
        line_items: invoice.line_items,
        beneficiary: invoice.beneficiary,
        iban: invoice.iban,
        bic: invoice.bic,
        intermediary_bic: invoice.intermediary_bic,
      }
      const created = await createInvoice(newInvoice)
      toast.success('Invoice duplicated')
      navigate(`/invoice/${created.id}`)
    } catch (error) {
      toast.error('Failed to duplicate invoice')
    }
  }

  // Calculate simple stats
  const stats = useMemo(() => {
    let totalRevenue = 0
    let pendingAmount = 0
    const uniqueClients = new Set()

    invoices.forEach(inv => {
      const total = calculateInvoiceTotal(inv)
      const status = getInvoiceStatus(inv)

      if (status === 'paid') {
        totalRevenue += total
      }
      if (status === 'pending' || status === 'overdue') {
        pendingAmount += total
      }
      if (inv.client_name || inv.clientName) {
        uniqueClients.add(inv.client_name || inv.clientName)
      }
    })

    return {
      totalRevenue,
      pendingAmount,
      totalInvoices: invoices.length,
      totalClients: uniqueClients.size,
    }
  }, [invoices])

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      if (statusFilter !== 'all') {
        const status = getInvoiceStatus(invoice)
        if (status !== statusFilter) return false
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const clientName = (invoice.client_name || invoice.clientName || '').toLowerCase()
        const invoiceNum = (invoice.invoice_number || invoice.invoiceNumber || '').toLowerCase()
        if (!clientName.includes(query) && !invoiceNum.includes(query)) {
          return false
        }
      }

      return true
    }).sort((a, b) => {
      const aDate = new Date(a.issue_date || a.issueDate || a.created_at || 0).getTime()
      const bDate = new Date(b.issue_date || b.issueDate || b.created_at || 0).getTime()
      return bDate - aDate
    })
  }, [invoices, statusFilter, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredInvoices.slice(start, start + itemsPerPage)
  }, [filteredInvoices, currentPage, itemsPerPage])

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { all: invoices.length, draft: 0, pending: 0, paid: 0, overdue: 0 }
    invoices.forEach(inv => {
      const status = getInvoiceStatus(inv)
      if (counts[status] !== undefined) counts[status]++
    })
    return counts
  }, [invoices])

  return (
    <Layout>
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-light text-gray-900 dark:text-white mb-1">
              Invoices
            </h1>
            <p className="text-gray-400 dark:text-gray-500">
              Manage your invoices
            </p>
          </div>
          <Link to="/invoice/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition"
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </motion.button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-gray-100 dark:border-white/5">
          <StatItem
            label="Paid"
            value={formatCurrency(stats.totalRevenue, 'EUR')}
          />
          <StatItem
            label="Pending"
            value={formatCurrency(stats.pendingAmount, 'EUR')}
          />
          <StatItem
            label="Invoices"
            value={stats.totalInvoices}
          />
          <StatItem
            label="Clients"
            value={stats.totalClients}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Status Tabs */}
          <div className="flex gap-1">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  setStatusFilter(opt.value)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 text-sm rounded-md transition ${
                  statusFilter === opt.value
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
                <span className={`ml-1.5 ${statusFilter === opt.value ? 'text-gray-300 dark:text-gray-600' : 'text-gray-300 dark:text-gray-600'}`}>
                  {statusCounts[opt.value]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/20 w-64 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Invoice List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-gray-200 dark:border-white/10 border-t-gray-900 dark:border-t-white rounded-full mx-auto" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' ? 'No matching invoices' : 'No invoices yet'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/invoice/new">
                <button className="text-sm text-gray-900 dark:text-white underline underline-offset-4 hover:no-underline">
                  Create your first invoice
                </button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5">
                    <th className="text-left py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Invoice</th>
                    <th className="text-left py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Client</th>
                    <th className="text-left py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                    <th className="text-right py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide pl-6">Status</th>
                    <th className="text-right py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvoices.map((invoice) => {
                    const total = calculateInvoiceTotal(invoice)
                    const status = getInvoiceStatus(invoice)

                    return (
                      <tr
                        key={invoice.id}
                        className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="py-4">
                          <Link
                            to={`/invoice/${invoice.id}`}
                            className="text-sm font-medium text-gray-900 dark:text-white hover:underline flex items-center gap-1 group/link"
                          >
                            {generateInvoiceId(invoice)}
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </Link>
                        </td>
                        <td className="py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {invoice.client_name || invoice.clientName || '-'}
                          </span>
                        </td>
                        <td className="py-4 hidden md:table-cell">
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            {formatDate(invoice.issue_date || invoice.issueDate)}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(total, invoice.currency)}
                          </span>
                        </td>
                        <td className="py-4 pl-6">
                          <div className="relative inline-block">
                            <StatusBadge status={status} />
                            <select
                              value={status}
                              onChange={(e) => handleStatusChange(invoice, e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full"
                            >
                              <option value="draft">Draft</option>
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="overdue">Overdue</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/invoice/${invoice.id}`}>
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition" title="Edit">
                                <Edit2 className="w-4 h-4 text-gray-400" />
                              </button>
                            </Link>
                            <button
                              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition"
                              onClick={() => handleDuplicate(invoice)}
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition"
                              onClick={() => handleDelete(invoice.id)}
                              disabled={deletingId === invoice.id}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
