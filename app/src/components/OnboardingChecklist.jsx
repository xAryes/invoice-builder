import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Circle,
  X,
  Sparkles,
  FileText,
  User,
  Users,
  CreditCard,
  Rocket,
  ChevronRight,
} from 'lucide-react'

const CHECKLIST_ITEMS = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add your business details',
    icon: User,
    link: '/settings',
    checkKey: 'profile_completed',
  },
  {
    id: 'first_client',
    title: 'Add your first client',
    description: 'Save a client for quick access',
    icon: Users,
    link: '/clients',
    checkKey: 'first_client_added',
  },
  {
    id: 'first_invoice',
    title: 'Create your first invoice',
    description: 'Send a professional invoice',
    icon: FileText,
    link: '/invoice/new',
    checkKey: 'first_invoice_created',
  },
  {
    id: 'payment',
    title: 'Set up payment method',
    description: 'Add bank or crypto details',
    icon: CreditCard,
    link: '/settings',
    checkKey: 'payment_setup',
  },
]

export const OnboardingChecklist = ({ invoices = [], clients = [], profile }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  // Calculate completion status
  const completedItems = {
    profile: profile?.name || profile?.your_name,
    first_client: clients.length > 0,
    first_invoice: invoices.length > 0,
    payment: profile?.iban || profile?.crypto_address,
  }

  const completedCount = Object.values(completedItems).filter(Boolean).length
  const totalItems = CHECKLIST_ITEMS.length
  const progressPercentage = (completedCount / totalItems) * 100
  const allCompleted = completedCount === totalItems

  // Check if checklist was dismissed
  useEffect(() => {
    const wasDismissed = localStorage.getItem('onboarding_checklist_dismissed')
    if (wasDismissed === 'true') {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      setDismissed(true)
      localStorage.setItem('onboarding_checklist_dismissed', 'true')
    }, 300)
  }

  // Don't show if all completed or dismissed
  if (dismissed || allCompleted) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#111113] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Getting Started
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {completedCount}/{totalItems}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Complete these steps to get the most out of Billflow
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-gray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {CHECKLIST_ITEMS.map((item, index) => {
              const isCompleted = completedItems[item.id]
              const Icon = item.icon

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={isCompleted ? '#' : item.link}
                    className={`flex items-center gap-4 p-4 transition ${
                      isCompleted
                        ? 'opacity-60'
                        : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                      isCompleted
                        ? 'bg-green-100 dark:bg-green-500/10'
                        : 'bg-gray-100 dark:bg-white/5'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-gray-500 dark:text-gray-500 line-through'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-600">
                        {item.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    {!isCompleted && (
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Footer */}
          {completedCount > 0 && completedCount < totalItems && (
            <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                {totalItems - completedCount} more step{totalItems - completedCount > 1 ? 's' : ''} to unlock all features
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
