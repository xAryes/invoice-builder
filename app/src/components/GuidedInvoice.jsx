import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Building2,
  User,
  List,
  CreditCard,
  FileSignature,
  Check,
  ChevronRight,
  Sparkles,
  PartyPopper,
  Lightbulb,
  ArrowRight,
  Circle,
} from 'lucide-react'

const STEPS = [
  {
    id: 'invoice',
    label: 'Invoice Details',
    icon: FileText,
    description: 'Set your invoice number, dates, and currency',
    fields: ['invoiceNumber', 'issueDate', 'dueDate', 'currency', 'projectName'],
    color: 'emerald',
  },
  {
    id: 'yourInfo',
    label: 'Your Business',
    icon: Building2,
    description: 'Add your company information',
    fields: ['yourName', 'yourAddress', 'yourEmail', 'yourTaxId'],
    color: 'teal',
  },
  {
    id: 'clientInfo',
    label: 'Client Info',
    icon: User,
    description: 'Who are you billing?',
    fields: ['clientName', 'clientAddress', 'clientEmail', 'clientTaxId'],
    color: 'cyan',
  },
  {
    id: 'lineItems',
    label: 'Line Items',
    icon: List,
    description: 'Add products or services',
    fields: ['lineItems'],
    color: 'blue',
  },
  {
    id: 'payment',
    label: 'Payment',
    icon: CreditCard,
    description: 'How should they pay?',
    fields: ['beneficiary', 'iban', 'bic'],
    color: 'violet',
  },
  {
    id: 'finish',
    label: 'Finish',
    icon: FileSignature,
    description: 'Review and save',
    fields: ['notes', 'signature'],
    color: 'purple',
  },
]

const StepIndicator = ({ steps, currentStep, completedSteps, onStepClick }) => {
  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = currentStep === index
        const isCompleted = completedSteps.includes(index)
        const isPast = index < currentStep

        return (
          <motion.button
            key={step.id}
            onClick={() => onStepClick?.(index)}
            initial={false}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                : isCompleted
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-white/20'
                  : isCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-500/20'
                  : 'bg-white dark:bg-white/10'
              }`}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
              ) : (
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className={`font-medium text-sm ${isActive ? 'text-white' : ''}`}>
                {step.label}
              </p>
              {isActive && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs text-white/80 truncate"
                >
                  {step.description}
                </motion.p>
              )}
            </div>
            {isActive && (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
              >
                <ChevronRight className="w-4 h-4 text-white/80" />
              </motion.div>
            )}
            {isCompleted && !isActive && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Done</span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

const ProgressRing = ({ progress }) => {
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          className="stroke-gray-100 dark:stroke-white/10"
          strokeWidth="10"
          fill="none"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={Math.round(progress)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-bold text-gray-900 dark:text-white"
        >
          {Math.round(progress)}%
        </motion.span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Complete</span>
      </div>
    </div>
  )
}

const Confetti = () => {
  const particles = Array.from({ length: 50 })

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: '50vw',
            y: '50vh',
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            scale: [0, 1, 0.5],
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: 2 + Math.random(),
            ease: 'easeOut',
          }}
          className={`absolute w-3 h-3 rounded-sm ${
            ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-amber-500', 'bg-rose-500'][
              i % 5
            ]
          }`}
        />
      ))}
    </div>
  )
}

const Tips = [
  { step: 0, tip: 'Use a consistent invoice number format like INV-YYYY-XXX for easy tracking.' },
  { step: 1, tip: 'Save your business profile to reuse it instantly in future invoices.' },
  { step: 2, tip: 'Client information is saved automatically for your next invoice.' },
  { step: 3, tip: 'Add clear descriptions and quantities for better client understanding.' },
  { step: 4, tip: 'Double-check your IBAN and BIC to avoid payment delays.' },
  { step: 5, tip: 'Adding a signature gives your invoice a professional touch!' },
]

export const GuidedSidebar = ({ currentSection, invoiceData, onComplete }) => {
  const [completedSteps, setCompletedSteps] = useState([])
  const [showConfetti, setShowConfetti] = useState(false)

  // Map section names to step indices
  const sectionToStep = {
    invoice: 0,
    template: 0,
    yourInfo: 1,
    clientInfo: 2,
    lineItems: 3,
    payment: 4,
    notes: 5,
    signature: 5,
  }

  const currentStep = sectionToStep[currentSection] ?? 0
  const currentTip = Tips.find(t => t.step === currentStep)?.tip || Tips[0].tip

  // Calculate progress based on filled fields
  useEffect(() => {
    const calculateProgress = () => {
      const requiredFields = [
        'invoiceNumber',
        'yourName',
        'clientName',
        'lineItems',
        'beneficiary',
      ]

      const filled = requiredFields.filter((field) => {
        const value = invoiceData[field]
        if (field === 'lineItems') {
          return value && value.some((item) => item.description)
        }
        return value && value.trim()
      })

      return (filled.length / requiredFields.length) * 100
    }

    const progress = calculateProgress()
    const completed = []

    // Check each step's completion
    STEPS.forEach((step, index) => {
      const stepFields = step.fields
      const isComplete = stepFields.every((field) => {
        if (field === 'lineItems') {
          return invoiceData.lineItems?.some((item) => item.description)
        }
        return invoiceData[field] && String(invoiceData[field]).trim()
      })
      if (isComplete) {
        completed.push(index)
      }
    })

    setCompletedSteps(completed)

    // Show confetti when 100% complete
    if (progress === 100 && !showConfetti) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [invoiceData, showConfetti])

  const progress = Math.min(
    100,
    (completedSteps.length / (STEPS.length - 1)) * 100
  )

  return (
    <>
      {showConfetti && <Confetti />}

      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/10 flex flex-col h-full"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white block">Invoice Wizard</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Step by step guide</span>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex justify-center mb-4">
            <ProgressRing progress={progress} />
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {progress < 100
              ? `${6 - completedSteps.length} steps remaining`
              : "You're all set! 🎉"}
          </p>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-auto p-4">
          <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-3 px-1">
            Invoice Sections
          </p>
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Complete Button */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-gray-100 dark:border-white/5"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onComplete}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
            >
              <PartyPopper className="w-5 h-5" />
              Complete Invoice
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* Tips */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-t border-amber-100 dark:border-amber-500/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Pro Tip</p>
                <p className="text-xs text-amber-600/80 dark:text-amber-300/80 leading-relaxed">
                  {currentTip}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  )
}

export default GuidedSidebar
