import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInvoices } from '../hooks/useInvoices'
import { useAuth } from '../hooks/useAuth'
import { Button, StatusBadge, getInvoiceStatus, STATUS_OPTIONS, useToast } from '../components/ui'
import { Layout } from '../components/Layout'
import { RevenueChart } from '../components/RevenueChart'
import { ClientBreakdown } from '../components/ClientBreakdown'
import { InvoiceAgingReport } from '../components/InvoiceAgingReport'
import { RecentActivityWidget } from '../components/InvoiceHistory'
import { OnboardingChecklist } from '../components/OnboardingChecklist'
import { useProfiles } from '../hooks/useProfiles'
import {
  Plus,
  FileText,
  Trash2,
  Edit2,
  Search,
  TrendingUp,
  TrendingDown,
  Users,
  Receipt,
  Copy,
  DollarSign,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  Sparkles,
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

// Animated counter hook
const useAnimatedCounter = (end, duration = 1500, startDelay = 0) => {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const startTimeRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (timestamp) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp
        const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        countRef.current = easeOutQuart * end
        setCount(countRef.current)

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate)
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }, startDelay)

    return () => {
      clearTimeout(timeout)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [end, duration, startDelay])

  return count
}

// Animated number display component
const AnimatedNumber = ({ value, prefix = '', suffix = '', decimals = 0, delay = 0 }) => {
  const numericValue = typeof value === 'string'
    ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
    : value || 0

  const animatedValue = useAnimatedCounter(numericValue, 1500, delay)

  const formattedValue = animatedValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return <>{prefix}{formattedValue}{suffix}</>
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp, subtitle, gradient, iconGradient, delay = 0, isCurrency = false, currencySymbol = '€' }) => {
  // Parse numeric value for animation
  const numericValue = typeof value === 'string'
    ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
    : value || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative overflow-hidden bg-white dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-white/5 group hover:shadow-xl hover:shadow-gray-100/50 dark:hover:shadow-none transition-all duration-300"
    >
      {/* Subtle gradient background */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient || 'bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-500/5 dark:to-transparent'}`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
            iconGradient || 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25'
          }`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold ${
              trendUp
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
            }`}>
              {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {isCurrency ? (
            <AnimatedNumber
              value={numericValue}
              prefix={currencySymbol}
              decimals={2}
              delay={delay * 1000}
            />
          ) : (
            <AnimatedNumber
              value={numericValue}
              decimals={0}
              delay={delay * 1000}
            />
          )}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  )
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50]

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
]

const getDateRange = (range) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  switch (range) {
    case 'this_month':
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0, 23, 59, 59)
      }
    case 'last_month':
      return {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 0, 23, 59, 59)
      }
    case 'this_quarter': {
      const quarterStart = Math.floor(month / 3) * 3
      return {
        start: new Date(year, quarterStart, 1),
        end: new Date(year, quarterStart + 3, 0, 23, 59, 59)
      }
    }
    case 'this_year':
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31, 23, 59, 59)
      }
    case 'last_year':
      return {
        start: new Date(year - 1, 0, 1),
        end: new Date(year - 1, 11, 31, 23, 59, 59)
      }
    default:
      return null
  }
}

const exportToCSV = (invoices, calculateTotal, generateId) => {
  const headers = ['Invoice #', 'Client', 'Email', 'Issue Date', 'Due Date', 'Amount', 'Currency', 'Status']
  const rows = invoices.map(inv => [
    generateId(inv),
    inv.client_name || inv.clientName || '',
    inv.client_email || inv.clientEmail || '',
    inv.issue_date || inv.issueDate || '',
    inv.due_date || inv.dueDate || '',
    calculateTotal(inv).toFixed(2),
    inv.currency || 'EUR',
    inv.status || 'draft'
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const SortHeader = ({ label, sortKey, sortConfig, onSort }) => {
  const isActive = sortConfig.key === sortKey
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
    >
      {label}
      <span className="text-gray-400 dark:text-gray-600">
        {isActive ? (
          sortConfig.direction === 'asc' ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )
        ) : (
          <ChevronsUpDown className="w-3.5 h-3.5" />
        )}
      </span>
    </button>
  )
}

// Get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// Get first name from full name or email
const getFirstName = (user) => {
  if (!user) return null
  // Check user metadata for name (from OAuth providers like Google)
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name.split(' ')[0]
  }
  if (user.user_metadata?.name) {
    return user.user_metadata.name.split(' ')[0]
  }
  // Fall back to email username
  if (user.email) {
    return user.email.split('@')[0]
  }
  return null
}

export const Dashboard = () => {
  const { invoices, loading, deleteInvoice, updateInvoice, createInvoice } = useInvoices()
  const { user } = useAuth()
  const { profiles, clients } = useProfiles()
  const navigate = useNavigate()
  const toast = useToast()
  const [deletingId, setDeletingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'issue_date', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [dateRange, setDateRange] = useState('all')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    setDeletingId(id)
    try {
      await deleteInvoice(id)
      toast.success('Invoice deleted successfully')
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
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(paginatedInvoices.map(inv => inv.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id, checked) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} invoice(s)?`)) return
    setBulkActionLoading(true)
    try {
      await Promise.all([...selectedIds].map(id => deleteInvoice(id)))
      toast.success(`${selectedIds.size} invoice(s) deleted`)
      setSelectedIds(new Set())
    } catch (error) {
      toast.error('Failed to delete some invoices')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkStatusChange = async (newStatus) => {
    setBulkActionLoading(true)
    try {
      const selectedInvoices = invoices.filter(inv => selectedIds.has(inv.id))
      await Promise.all(selectedInvoices.map(inv => updateInvoice(inv.id, { ...inv, status: newStatus })))
      toast.success(`${selectedIds.size} invoice(s) updated to ${newStatus}`)
      setSelectedIds(new Set())
    } catch (error) {
      toast.error('Failed to update some invoices')
    } finally {
      setBulkActionLoading(false)
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
      console.error('Error duplicating invoice:', error)
      toast.error('Failed to duplicate invoice')
    }
  }

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

    let totalRevenue = 0
    let thisMonthRevenue = 0
    let lastMonthRevenue = 0
    const uniqueClients = new Set()

    invoices.forEach(inv => {
      const total = calculateInvoiceTotal(inv)
      const date = new Date(inv.created_at)

      totalRevenue += total

      if (date.getMonth() === thisMonth && date.getFullYear() === thisYear) {
        thisMonthRevenue += total
      }
      if (date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear) {
        lastMonthRevenue += total
      }

      if (inv.client_name || inv.clientName) {
        uniqueClients.add(inv.client_name || inv.clientName)
      }
    })

    const revenueTrend = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : thisMonthRevenue > 0 ? 100 : 0

    return {
      totalRevenue,
      totalInvoices: invoices.length,
      totalClients: uniqueClients.size,
      revenueTrend,
      thisMonthCount: invoices.filter(inv => {
        const date = new Date(inv.created_at)
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear
      }).length,
    }
  }, [invoices])

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1)
  }

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    const range = getDateRange(dateRange)

    let result = invoices.filter(invoice => {
      // Date range filter
      if (range) {
        const invoiceDate = new Date(invoice.issue_date || invoice.issueDate || invoice.created_at)
        if (invoiceDate < range.start || invoiceDate > range.end) {
          return false
        }
      }

      if (statusFilter !== 'all') {
        const status = getInvoiceStatus(invoice)
        if (status !== statusFilter) return false
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const clientName = (invoice.client_name || invoice.clientName || '').toLowerCase()
        const clientEmail = (invoice.client_email || invoice.clientEmail || '').toLowerCase()
        const invoiceNum = (invoice.invoice_number || invoice.invoiceNumber || '').toLowerCase()
        if (!clientName.includes(query) && !clientEmail.includes(query) && !invoiceNum.includes(query)) {
          return false
        }
      }

      return true
    })

    // Sort
    result.sort((a, b) => {
      let aVal, bVal
      switch (sortConfig.key) {
        case 'client':
          aVal = (a.client_name || a.clientName || '').toLowerCase()
          bVal = (b.client_name || b.clientName || '').toLowerCase()
          break
        case 'issue_date':
          aVal = new Date(a.issue_date || a.issueDate || 0).getTime()
          bVal = new Date(b.issue_date || b.issueDate || 0).getTime()
          break
        case 'due_date':
          aVal = new Date(a.due_date || a.dueDate || 0).getTime()
          bVal = new Date(b.due_date || b.dueDate || 0).getTime()
          break
        case 'amount':
          aVal = calculateInvoiceTotal(a)
          bVal = calculateInvoiceTotal(b)
          break
        case 'status':
          aVal = getInvoiceStatus(a)
          bVal = getInvoiceStatus(b)
          break
        default:
          aVal = a[sortConfig.key] || ''
          bVal = b[sortConfig.key] || ''
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [invoices, statusFilter, searchQuery, sortConfig, dateRange])

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredInvoices.slice(start, start + itemsPerPage)
  }, [filteredInvoices, currentPage, itemsPerPage])

  // Reset page when filters change
  const handleFilterChange = (filter) => {
    setStatusFilter(filter)
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleDateRangeChange = (range) => {
    setDateRange(range)
    setCurrentPage(1)
  }

  // Status counts for tabs
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
      <div className="p-6 lg:p-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {getGreeting()}{getFirstName(user) ? `, ${getFirstName(user)}` : ''}! 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-500">
                Here's what's happening with your invoices today.
              </p>
            </div>
            <Link to="/invoice/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                New Invoice
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={DollarSign}
            iconGradient="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
            gradient="bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-500/5 dark:to-transparent"
            trend={stats.revenueTrend}
            trendUp={stats.revenueTrend >= 0}
            delay={0}
            isCurrency
            currencySymbol="€"
          />
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon={FileText}
            iconGradient="bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30"
            gradient="bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-500/5 dark:to-transparent"
            subtitle="All time"
            delay={0.1}
          />
          <StatCard
            title="Active Clients"
            value={stats.totalClients}
            icon={Users}
            iconGradient="bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-cyan-500/30"
            gradient="bg-gradient-to-br from-cyan-50 to-transparent dark:from-cyan-500/5 dark:to-transparent"
            subtitle="Unique clients"
            delay={0.2}
          />
          <StatCard
            title="This Month"
            value={stats.thisMonthCount}
            icon={Receipt}
            iconGradient="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30"
            gradient="bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-500/5 dark:to-transparent"
            subtitle="New invoices"
            delay={0.3}
          />
        </div>

        {/* Onboarding Checklist + Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 space-y-4">
            <OnboardingChecklist
              invoices={invoices}
              clients={clients}
              profile={profiles?.[0]}
            />
            <RevenueChart invoices={invoices} />
          </div>
          <ClientBreakdown invoices={invoices} />
        </div>

        {/* Aging Report and Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <InvoiceAgingReport invoices={invoices} className="lg:col-span-2" />
          <RecentActivityWidget limit={8} />
        </div>

        {/* Invoice List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#111113] rounded-2xl border border-gray-200/60 dark:border-white/5"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  Invoices
                  <span className="text-xs text-gray-400 dark:text-gray-600 font-normal">
                    {filteredInvoices.length} total
                  </span>
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-500">Manage and track your invoices</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Date Range Filter */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600" />
                  <select
                    value={dateRange}
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                    className="pl-9 pr-8 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition appearance-none cursor-pointer"
                  >
                    {DATE_RANGE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800">{opt.label}</option>
                    ))}
                  </select>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition w-48 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                </div>
                <button
                  onClick={() => exportToCSV(filteredInvoices, calculateInvoiceTotal, generateInvoiceId)}
                  disabled={filteredInvoices.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mt-5 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl"
              >
                <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  {selectedIds.size} selected
                </span>
                <div className="h-4 w-px bg-emerald-300 dark:bg-emerald-500/30" />
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusChange(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  className="px-2 py-1 text-sm border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  disabled={bulkActionLoading}
                >
                  <option value="">Change Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                  className="px-2 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 rounded-lg transition"
                >
                  Clear
                </button>
              </motion.div>
            )}

            {/* Status Tabs */}
            <div className="flex gap-1.5 mt-5 p-1 bg-gray-50 dark:bg-white/5 rounded-xl w-fit">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleFilterChange(opt.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    statusFilter === opt.value
                      ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {opt.label}
                  <span className={`ml-1.5 text-xs ${
                    statusFilter === opt.value
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {statusCounts[opt.value]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-gray-200 dark:border-white/10 border-t-emerald-500 rounded-full mx-auto" />
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-3">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No matching invoices' : 'No invoices yet'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 max-w-xs mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first invoice to start tracking your business'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link to="/invoice/new">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Invoice
                  </motion.button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5">
                    <th className="text-left py-4 px-5 w-10">
                      <input
                        type="checkbox"
                        checked={paginatedInvoices.length > 0 && paginatedInvoices.every(inv => selectedIds.has(inv.id))}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-500 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="text-left py-4 px-5">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">Invoice</span>
                    </th>
                    <th className="text-left py-4 px-5">
                      <SortHeader label="Client" sortKey="client" sortConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="text-left py-4 px-5">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">Email</span>
                    </th>
                    <th className="text-left py-4 px-5">
                      <SortHeader label="Issued" sortKey="issue_date" sortConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="text-left py-4 px-5">
                      <SortHeader label="Due" sortKey="due_date" sortConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="text-left py-4 px-5">
                      <SortHeader label="Amount" sortKey="amount" sortConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="text-left py-4 px-5">
                      <SortHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
                    </th>
                    <th className="text-right py-4 px-5 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {paginatedInvoices.map((invoice, index) => {
                    const total = calculateInvoiceTotal(invoice)
                    const status = getInvoiceStatus(invoice)

                    return (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group ${selectedIds.has(invoice.id) ? 'bg-emerald-50/50 dark:bg-emerald-500/5' : ''}`}
                      >
                        <td className="py-4 px-5">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(invoice.id)}
                            onChange={(e) => handleSelectOne(invoice.id, e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-500 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {generateInvoiceId(invoice)}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {invoice.client_name || invoice.clientName || '-'}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            {invoice.client_email || invoice.clientEmail || '-'}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            {formatDate(invoice.issue_date || invoice.issueDate)}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            {formatDate(invoice.due_date || invoice.dueDate)}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(total, invoice.currency)}
                          </span>
                        </td>
                        <td className="py-4 px-5">
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
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/invoice/${invoice.id}`}>
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition" title="Edit">
                                <Edit2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              </button>
                            </Link>
                            <button
                              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition"
                              onClick={() => handleDuplicate(invoice)}
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            </button>
                            <button
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                              onClick={() => handleDelete(invoice.id)}
                              disabled={deletingId === invoice.id}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {filteredInvoices.length > 0 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                    <span>Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="px-2 py-1.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <span>of {filteredInvoices.length} entries</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 text-sm rounded-lg transition ${
                            currentPage === pageNum
                              ? 'bg-emerald-500 text-white font-semibold'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  )
}
