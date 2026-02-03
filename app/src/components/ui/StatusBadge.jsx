const statusConfig = {
  draft: {
    label: 'Draft',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  paid: {
    label: 'Paid',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  overdue: {
    label: 'Overdue',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    dot: 'bg-gray-400',
  },
}

export const StatusBadge = ({ status = 'draft' }) => {
  const config = statusConfig[status] || statusConfig.draft

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  )
}

export const getInvoiceStatus = (invoice) => {
  // If status is explicitly set, use it
  if (invoice.status && invoice.status !== 'draft') {
    return invoice.status
  }

  // Auto-detect overdue
  if (invoice.due_date || invoice.dueDate) {
    const dueDate = new Date(invoice.due_date || invoice.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dueDate < today && invoice.status !== 'paid') {
      return 'overdue'
    }
  }

  return invoice.status || 'draft'
}

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Invoices' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
]
