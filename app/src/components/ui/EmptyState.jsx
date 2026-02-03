import { motion } from 'framer-motion'
import { FileText, Users, Settings, RefreshCw, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

const illustrations = {
  invoices: (
    <div className="relative">
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-24 h-32 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 shadow-lg shadow-emerald-500/10 mx-auto transform -rotate-6"
      />
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute inset-0 w-24 h-32 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl mx-auto transform rotate-3"
      >
        <div className="p-3 space-y-2">
          <div className="h-2 w-12 bg-gray-200 dark:bg-white/10 rounded" />
          <div className="h-1.5 w-16 bg-gray-100 dark:bg-white/5 rounded" />
          <div className="h-1.5 w-10 bg-gray-100 dark:bg-white/5 rounded" />
          <div className="mt-4 space-y-1">
            <div className="h-1 w-full bg-gray-100 dark:bg-white/5 rounded" />
            <div className="h-1 w-full bg-gray-100 dark:bg-white/5 rounded" />
            <div className="h-1 w-2/3 bg-gray-100 dark:bg-white/5 rounded" />
          </div>
        </div>
      </motion.div>
    </div>
  ),
  clients: (
    <div className="relative flex justify-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${
            i === 0 ? 'from-teal-400 to-teal-500' :
            i === 1 ? 'from-purple-400 to-purple-500' :
            'from-emerald-400 to-emerald-500'
          } flex items-center justify-center text-white font-bold text-sm shadow-lg ${
            i === 0 ? '-mr-3 z-30' : i === 1 ? '-mr-3 z-20' : 'z-10'
          }`}
        >
          {['JD', 'MK', 'AS'][i]}
        </motion.div>
      ))}
    </div>
  ),
  settings: (
    <motion.div
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className="w-20 h-20 mx-auto"
    >
      <Settings className="w-full h-full text-gray-300 dark:text-gray-600" />
    </motion.div>
  ),
  recurring: (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      className="w-16 h-16 mx-auto"
    >
      <RefreshCw className="w-full h-full text-gray-300 dark:text-gray-600" />
    </motion.div>
  ),
}

export const EmptyState = ({
  type = 'invoices',
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
}) => {
  const defaults = {
    invoices: {
      title: 'No invoices yet',
      description: 'Create your first invoice to start tracking your business revenue.',
      actionLabel: 'Create Invoice',
      actionLink: '/invoice/new',
    },
    clients: {
      title: 'No clients yet',
      description: 'Add your first client to quickly populate invoices.',
      actionLabel: 'Add Client',
      actionLink: '/clients',
    },
    settings: {
      title: 'Complete your profile',
      description: 'Set up your business details to appear on invoices.',
      actionLabel: 'Go to Settings',
      actionLink: '/settings',
    },
    recurring: {
      title: 'No recurring invoices',
      description: 'Set up automatic billing for your subscription clients.',
      actionLabel: 'Create Recurring',
      actionLink: '/recurring',
    },
  }

  const config = defaults[type] || defaults.invoices
  const finalTitle = title || config.title
  const finalDescription = description || config.description
  const finalActionLabel = actionLabel || config.actionLabel
  const finalActionLink = actionLink || config.actionLink

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-16 px-6 text-center"
    >
      <div className="mb-6 h-32 flex items-center justify-center">
        {illustrations[type] || illustrations.invoices}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {finalTitle}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        {finalDescription}
      </p>
      {onAction ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
        >
          <Plus className="w-4 h-4" />
          {finalActionLabel}
        </motion.button>
      ) : (
        <Link to={finalActionLink}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
          >
            <Plus className="w-4 h-4" />
            {finalActionLabel}
          </motion.button>
        </Link>
      )}
    </motion.div>
  )
}

// Skeleton loader for lists
export const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 dark:bg-white/5 rounded-lg" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-32 bg-gray-200 dark:bg-white/5 rounded" />
      <div className="h-2 w-24 bg-gray-100 dark:bg-white/5 rounded" />
    </div>
    <div className="h-6 w-16 bg-gray-100 dark:bg-white/5 rounded-full" />
    <div className="h-8 w-20 bg-gray-100 dark:bg-white/5 rounded-lg" />
  </div>
)

export const SkeletonCard = () => (
  <div className="p-6 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-white/5 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-white/5 rounded-xl" />
      <div className="space-y-2">
        <div className="h-3 w-20 bg-gray-200 dark:bg-white/5 rounded" />
        <div className="h-2 w-16 bg-gray-100 dark:bg-white/5 rounded" />
      </div>
    </div>
    <div className="h-8 w-24 bg-gray-200 dark:bg-white/5 rounded" />
  </div>
)
