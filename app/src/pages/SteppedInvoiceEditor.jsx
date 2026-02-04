import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useInvoices } from '../hooks/useInvoices'
import { useProfiles } from '../hooks/useProfiles'
import { exportToPDF } from '../lib/pdfExport'
import { INVOICE_TEMPLATES, DEFAULT_TEMPLATE, getTemplateStyles } from '../lib/invoiceTemplates'
import { InvoicePreview as PDFInvoicePreview } from '../components/InvoicePreview'
import {
  FileText,
  Building2,
  User,
  Package,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  X,
  Download,
  ArrowLeft,
  Sparkles,
  Upload,
  Hash,
  Calendar,
  Coins,
  Mail,
  MapPin,
  Receipt,
  Wallet,
  StickyNote,
  Palette,
} from 'lucide-react'

const defaultLineItem = { description: '', comment: '', quantity: 1, price: 0, vat: 0 }

// Premium animated background with noise texture and floating orbs
const PremiumBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    {/* Base gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 dark:from-[#0a0a0f] dark:via-[#0d0d14] dark:to-[#0f0f18]" />

    {/* Subtle grid pattern */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.4] dark:opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="currentColor" className="text-slate-300 dark:text-white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>

    {/* Animated gradient orbs - more vibrant */}
    <motion.div
      animate={{
        x: [0, 100, 0],
        y: [0, -50, 0],
        scale: [1, 1.2, 1],
        opacity: [0.6, 0.8, 0.6],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-emerald-400/25 via-teal-400/15 to-transparent rounded-full blur-[100px]"
    />
    <motion.div
      animate={{
        x: [0, -80, 0],
        y: [0, 60, 0],
        scale: [1, 1.1, 1],
        opacity: [0.5, 0.7, 0.5],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-violet-400/15 via-fuchsia-400/10 to-transparent rounded-full blur-[120px]"
    />

    {/* Additional floating accent */}
    <motion.div
      animate={{
        x: [0, 50, 0],
        y: [0, -30, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      className="absolute top-2/3 left-1/3 w-[300px] h-[300px] bg-gradient-to-br from-cyan-400/10 via-blue-400/5 to-transparent rounded-full blur-[80px]"
    />

    {/* Top fade */}
    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-50 dark:from-[#0a0a0f] to-transparent" />
  </div>
)

// Floating label input with premium styling
const FloatingInput = ({ label, icon: Icon, ...props }) => {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = props.value && props.value.length > 0

  return (
    <motion.div
      className="relative group"
      whileTap={{ scale: 0.998 }}
      initial={false}
      animate={isFocused ? { y: -2 } : { y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glow effect on focus */}
      <motion.div
        initial={false}
        animate={{ opacity: isFocused ? 1 : 0 }}
        className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl"
      />

      <motion.div
        className={`absolute left-4 transition-all duration-300 pointer-events-none flex items-center gap-2 z-10 ${
          isFocused || hasValue
            ? 'top-2 text-[10px] font-semibold tracking-wide uppercase'
            : 'top-1/2 -translate-y-1/2 text-sm'
        } ${
          isFocused
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        {Icon && (
          <motion.div
            animate={{ rotate: isFocused ? 360 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Icon className={`transition-all duration-300 ${isFocused || hasValue ? 'w-3 h-3' : 'w-4 h-4'}`} />
          </motion.div>
        )}
        <span>{label}</span>
      </motion.div>
      <input
        {...props}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        className={`relative w-full px-4 pt-6 pb-3 bg-white dark:bg-white/[0.03] border-2 rounded-2xl text-slate-900 dark:text-white transition-all duration-300 outline-none ${
          isFocused
            ? 'border-emerald-500/50 dark:border-emerald-500/30 shadow-xl shadow-emerald-500/15 dark:shadow-emerald-500/10'
            : 'border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.12] hover:shadow-md'
        } ${props.className || ''}`}
      />
      <motion.div
        initial={false}
        animate={{ scaleX: isFocused ? 1 : 0, opacity: isFocused ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 origin-left rounded-full"
      />
    </motion.div>
  )
}

// Floating textarea
const FloatingTextarea = ({ label, icon: Icon, ...props }) => {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = props.value && props.value.length > 0

  return (
    <motion.div
      className="relative group"
      whileTap={{ scale: 0.998 }}
      initial={false}
      animate={isFocused ? { y: -2 } : { y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glow effect on focus */}
      <motion.div
        initial={false}
        animate={{ opacity: isFocused ? 1 : 0 }}
        className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl"
      />

      <motion.div
        className={`absolute left-4 transition-all duration-300 pointer-events-none flex items-center gap-2 z-10 ${
          isFocused || hasValue
            ? 'top-2 text-[10px] font-semibold tracking-wide uppercase'
            : 'top-4 text-sm'
        } ${
          isFocused
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        {Icon && (
          <motion.div
            animate={{ rotate: isFocused ? 360 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Icon className={`transition-all duration-300 ${isFocused || hasValue ? 'w-3 h-3' : 'w-4 h-4'}`} />
          </motion.div>
        )}
        <span>{label}</span>
      </motion.div>
      <textarea
        {...props}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        className={`relative w-full px-4 pt-7 pb-3 bg-white dark:bg-white/[0.03] border-2 rounded-2xl text-slate-900 dark:text-white transition-all duration-300 outline-none resize-none ${
          isFocused
            ? 'border-emerald-500/50 dark:border-emerald-500/30 shadow-xl shadow-emerald-500/15 dark:shadow-emerald-500/10'
            : 'border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.12] hover:shadow-md'
        }`}
      />
      <motion.div
        initial={false}
        animate={{ scaleX: isFocused ? 1 : 0, opacity: isFocused ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 origin-left rounded-full"
      />
    </motion.div>
  )
}

// Premium step indicator with progress animation
const StepIndicator = ({ steps, currentStep, onStepClick }) => {
  const progressWidth = useSpring((currentStep / (steps.length - 1)) * 100, {
    stiffness: 100,
    damping: 20
  })

  return (
    <div className="mb-12">
      {/* Progress bar with glow */}
      <div className="relative h-2 bg-slate-200 dark:bg-white/[0.08] rounded-full mb-8 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full"
          style={{ width: useTransform(progressWidth, v => `${v}%`) }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full opacity-60 blur-sm"
          style={{ width: useTransform(progressWidth, v => `${v}%`) }}
        />
        {/* Shimmer effect */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{ width: useTransform(progressWidth, v => `${v * 0.3}%`) }}
        />
      </div>

      {/* Step buttons */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const Icon = step.icon

          return (
            <motion.button
              key={step.id}
              onClick={() => onStepClick(index)}
              className="relative flex flex-col items-center gap-3 group"
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Connector line glow for completed */}
              {isCompleted && index > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute right-full top-7 w-full h-0.5 bg-gradient-to-r from-emerald-500/30 to-emerald-500/50 -mr-7 z-0"
                />
              )}

              {/* Icon container */}
              <motion.div
                animate={{
                  scale: isActive ? 1 : 0.9,
                  opacity: isActive || isCompleted ? 1 : 0.5,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isActive
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30'
                    : isCompleted
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/20 ring-2 ring-emerald-500/30'
                    : 'bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                }`}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={isActive ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Icon className={`w-6 h-6 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`} />
                  </motion.div>
                )}

                {/* Pulse effect for active */}
                {isActive && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-emerald-500/30"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-teal-500/20"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    />
                  </>
                )}

                {/* Hover glow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl -z-10"
                />
              </motion.div>

              {/* Label with step number badge */}
              <div className="flex flex-col items-center gap-1">
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.7 }}
                  className={`text-xs font-medium tracking-wide transition-colors ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isCompleted
                      ? 'text-slate-600 dark:text-slate-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.label}
                </motion.span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// Premium invoice preview with 3D tilt effect
const InvoicePreview = ({ data, focusSection }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [8, -8])
  const rotateY = useTransform(x, [-100, 100], [-8, 8])

  const springConfig = { stiffness: 150, damping: 15 }
  const springRotateX = useSpring(rotateX, springConfig)
  const springRotateY = useSpring(rotateY, springConfig)

  // Get template styles with custom accent color
  const templateStyles = getTemplateStyles(data.template || 'minimal', data.accentColor)
  const accentColor = data.accentColor || templateStyles.accentColor || '#10b981'
  const isDarkTemplate = data.template === 'dark'

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const formatCurrency = (amount) => {
    const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'Fr.', CAD: 'C$', AUD: 'A$', JPY: '¥', CNY: '¥', INR: '₹', BRL: 'R$', MXN: 'MX$', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč' }
    return `${symbols[data.currency] || data.currency} ${Number(amount || 0).toFixed(2)}`
  }

  const subtotal = (data.lineItems || []).reduce((sum, item) =>
    sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0
  )
  const vatTotal = (data.lineItems || []).reduce((sum, item) => {
    const lineTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
    return sum + (lineTotal * (Number(item.vat) || 0) / 100)
  }, 0)
  const expensesTotal = (data.expenses || []).reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)
  const total = subtotal + vatTotal + expensesTotal

  const sectionHighlight = (section) =>
    focusSection === section
      ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900`
      : ''

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000"
    >
      <motion.div
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {/* Multiple shadow layers for depth */}
        <motion.div
          animate={{ backgroundColor: `${accentColor}15` }}
          className="absolute inset-4 rounded-3xl blur-3xl transform translate-y-6"
          style={{ backgroundColor: `${accentColor}20` }}
        />
        <motion.div
          animate={{ backgroundColor: `${accentColor}10` }}
          className="absolute inset-8 rounded-3xl blur-2xl transform translate-y-8"
          style={{ backgroundColor: `${accentColor}15` }}
        />

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden border shadow-2xl"
          style={{
            aspectRatio: '1/1.35',
            backgroundColor: isDarkTemplate ? '#0f172a' : '#ffffff',
            borderColor: isDarkTemplate ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }}
        >

          <div className="p-6 h-full flex flex-col">
            {/* Header - Clean style */}
            <motion.div
              layout
              className={`mb-6 p-3 -m-3 rounded-2xl transition-all duration-500 ${sectionHighlight('details')}`}
              style={focusSection === 'details' ? { ringColor: accentColor, backgroundColor: `${accentColor}08` } : {}}
            >
              <div className="flex justify-between items-start mb-4">
                <motion.div
                  className="text-2xl font-light tracking-tight"
                  style={{ color: isDarkTemplate ? '#f8fafc' : '#0f172a' }}
                >
                  Invoice
                </motion.div>
                {data.logo && (
                  <img src={data.logo} alt="Logo" className="h-10 w-auto object-contain" />
                )}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex">
                  <span
                    className="w-20 font-semibold"
                    style={{ color: isDarkTemplate ? '#94a3b8' : '#64748b' }}
                  >
                    Invoice no.
                  </span>
                  <span style={{ color: isDarkTemplate ? '#f8fafc' : '#0f172a' }}>
                    {data.invoiceNumber || 'INV-001'}
                  </span>
                </div>
                <div className="flex">
                  <span
                    className="w-20 font-semibold"
                    style={{ color: isDarkTemplate ? '#94a3b8' : '#64748b' }}
                  >
                    Issue date
                  </span>
                  <span style={{ color: isDarkTemplate ? '#f8fafc' : '#0f172a' }}>
                    {data.issueDate || '—'}
                  </span>
                </div>
                <div className="flex">
                  <span
                    className="w-20 font-semibold"
                    style={{ color: isDarkTemplate ? '#94a3b8' : '#64748b' }}
                  >
                    Due date
                  </span>
                  <span style={{ color: isDarkTemplate ? '#f8fafc' : '#0f172a' }}>
                    {data.dueDate || '—'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* From / To */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.div
                layout
                className={`p-3 -m-3 rounded-2xl transition-all duration-500 ${sectionHighlight('yourInfo')}`}
                style={focusSection === 'yourInfo' ? { backgroundColor: `${accentColor}08` } : {}}
              >
                <div
                  className="text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: accentColor }}
                >
                  From
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: isDarkTemplate ? '#f8fafc' : '#0f172a' }}
                >
                  {data.yourName || 'Your Name'}
                </div>
                <div
                  className="text-xs whitespace-pre-line mt-1 leading-relaxed"
                  style={{ color: isDarkTemplate ? '#94a3b8' : '#64748b' }}
                >
                  {data.yourAddress || 'Address'}
                </div>
              </motion.div>
              <motion.div
                layout
                className={`p-3 -m-3 rounded-2xl transition-all duration-500 ${sectionHighlight('clientInfo')}`}
                style={focusSection === 'clientInfo' ? { backgroundColor: `${accentColor}08` } : {}}
              >
                <div
                  className="text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: accentColor }}
                >
                  Bill To
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: isDarkTemplate ? '#f8fafc' : '#0f172a' }}
                >
                  {data.clientName || 'Client Name'}
                </div>
                <div
                  className="text-xs whitespace-pre-line mt-1 leading-relaxed"
                  style={{ color: isDarkTemplate ? '#94a3b8' : '#64748b' }}
                >
                  {data.clientAddress || 'Address'}
                </div>
              </motion.div>
            </div>

            {/* Line Items */}
            <motion.div
              layout
              className={`flex-1 p-3 -m-3 rounded-2xl transition-all duration-500 ${sectionHighlight('lineItems')}`}
              style={focusSection === 'lineItems' ? { backgroundColor: `${accentColor}08` } : {}}
            >
              <div
                className="border-t border-b py-3"
                style={{ borderColor: isDarkTemplate ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              >
                <div
                  className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: isDarkTemplate ? '#64748b' : '#94a3b8' }}
                >
                  <div className="col-span-6">Item</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                {(data.lineItems || []).slice(0, 3).map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="grid grid-cols-12 gap-2 py-2 text-xs"
                  >
                    <div
                      className="col-span-6 truncate font-medium"
                      style={{ color: isDarkTemplate ? '#e2e8f0' : '#334155' }}
                    >
                      {item.description || '—'}
                    </div>
                    <div
                      className="col-span-2 text-right font-mono"
                      style={{ color: isDarkTemplate ? '#94a3b8' : '#64748b' }}
                    >
                      {item.quantity || 0}
                    </div>
                    <div
                      className="col-span-2 text-right font-mono"
                      style={{ color: isDarkTemplate ? '#94a3b8' : '#64748b' }}
                    >
                      {formatCurrency(item.price)}
                    </div>
                    <div
                      className="col-span-2 text-right font-semibold font-mono"
                      style={{ color: isDarkTemplate ? '#f8fafc' : '#0f172a' }}
                    >
                      {formatCurrency((item.quantity || 0) * (item.price || 0))}
                    </div>
                  </motion.div>
                ))}
                {(data.lineItems || []).length > 3 && (
                  <div
                    className="text-[10px] mt-2 font-medium"
                    style={{ color: isDarkTemplate ? '#64748b' : '#94a3b8' }}
                  >
                    +{data.lineItems.length - 3} more items
                  </div>
                )}
              </div>
            </motion.div>

            {/* Total */}
            <div className="mt-auto pt-4">
              <div className="flex justify-end">
                <div className="text-right space-y-1">
                  <div
                    className="flex justify-between gap-12 text-xs"
                    style={{ color: isDarkTemplate ? '#94a3b8' : '#64748b' }}
                  >
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  {vatTotal > 0 && (
                    <div
                      className="flex justify-between gap-12 text-xs"
                      style={{ color: isDarkTemplate ? '#94a3b8' : '#64748b' }}
                    >
                      <span>VAT</span>
                      <span className="font-mono">{formatCurrency(vatTotal)}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between gap-12 pt-2 border-t"
                    style={{ borderColor: isDarkTemplate ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ color: isDarkTemplate ? '#f8fafc' : '#0f172a' }}
                    >
                      Total Due
                    </span>
                    <motion.span
                      key={total}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-black font-mono"
                      style={{ color: accentColor }}
                    >
                      {formatCurrency(total)}
                    </motion.span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {(data.iban || data.beneficiary) && (
              <motion.div
                layout
                className={`mt-4 pt-4 border-t p-3 -m-3 rounded-2xl transition-all duration-500 ${sectionHighlight('payment')}`}
                style={{
                  borderColor: isDarkTemplate ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  ...(focusSection === 'payment' ? { backgroundColor: `${accentColor}08` } : {}),
                }}
              >
                <div
                  className="text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: accentColor }}
                >
                  Payment Details
                </div>
                <div
                  className="text-xs space-y-0.5"
                  style={{ color: isDarkTemplate ? '#94a3b8' : '#64748b' }}
                >
                  {data.beneficiary && <div className="font-medium">{data.beneficiary}</div>}
                  {data.iban && <div className="font-mono text-[11px] tracking-wide">{data.iban}</div>}
                </div>
              </motion.div>
            )}

            {/* Notes */}
            {data.notes && (
              <motion.div
                layout
                className={`mt-4 pt-4 border-t p-3 -m-3 rounded-2xl transition-all duration-500 ${sectionHighlight('notes')}`}
                style={{
                  borderColor: isDarkTemplate ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  ...(focusSection === 'notes' ? { backgroundColor: `${accentColor}08` } : {}),
                }}
              >
                <div
                  className="text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: accentColor }}
                >
                  Notes
                </div>
                <div
                  className="text-xs leading-relaxed line-clamp-2"
                  style={{ color: isDarkTemplate ? '#94a3b8' : '#64748b' }}
                >
                  {data.notes}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Step content components with premium styling
const StepDetails = ({ data, onChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="space-y-8"
  >
    <div>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-black text-slate-900 dark:text-white tracking-tight"
      >
        Invoice Details
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-500 dark:text-slate-400 mt-2"
      >
        Let's start with the basics
      </motion.p>
    </div>

    <div className="grid grid-cols-2 gap-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="col-span-2 sm:col-span-1"
      >
        <FloatingInput
          label="Invoice Number"
          icon={Hash}
          type="text"
          value={data.invoiceNumber}
          onChange={(e) => onChange('invoiceNumber', e.target.value)}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="col-span-2 sm:col-span-1"
      >
        <div className="relative">
          <div className="absolute left-4 top-2 text-[10px] font-semibold tracking-wide uppercase text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <Coins className="w-3 h-3" />
            Currency
          </div>
          <select
            value={data.currency}
            onChange={(e) => onChange('currency', e.target.value)}
            className="w-full px-4 pt-6 pb-3 bg-white dark:bg-white/[0.03] border-2 border-slate-200/80 dark:border-white/[0.08] rounded-2xl text-slate-900 dark:text-white transition-all duration-300 outline-none appearance-none hover:border-slate-300 dark:hover:border-white/[0.12] focus:border-emerald-500/50 dark:focus:border-emerald-500/30 cursor-pointer"
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CHF">CHF (Fr.)</option>
            <option value="CAD">CAD ($)</option>
            <option value="AUD">AUD ($)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="CNY">CNY (¥)</option>
            <option value="INR">INR (₹)</option>
            <option value="BRL">BRL (R$)</option>
            <option value="MXN">MXN ($)</option>
            <option value="SEK">SEK (kr)</option>
            <option value="NOK">NOK (kr)</option>
            <option value="DKK">DKK (kr)</option>
            <option value="PLN">PLN (zł)</option>
            <option value="CZK">CZK (Kč)</option>
          </select>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FloatingInput
          label="Issue Date"
          icon={Calendar}
          type="date"
          value={data.issueDate}
          onChange={(e) => onChange('issueDate', e.target.value)}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <FloatingInput
          label="Due Date"
          icon={Calendar}
          type="date"
          value={data.dueDate}
          onChange={(e) => onChange('dueDate', e.target.value)}
        />
      </motion.div>
    </div>

    {/* Logo Upload */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Company Logo
      </label>
      {data.logo ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-6 p-5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border-2 border-slate-200/50 dark:border-white/[0.05]"
        >
          <img src={data.logo} alt="Logo" className="h-16 object-contain rounded-xl" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange('logo', '')}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </motion.div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 dark:border-white/[0.1] rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-all duration-300 group">
          <motion.div
            whileHover={{ y: -4 }}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 bg-slate-100 dark:bg-white/[0.05] rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/10 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Upload your logo
            </span>
            <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 500KB</span>
          </motion.div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (ev) => onChange('logo', ev.target?.result)
                reader.readAsDataURL(file)
              }
            }}
            className="hidden"
          />
        </label>
      )}
    </motion.div>
  </motion.div>
)

const StepYourInfo = ({ data, onChange, profiles, onLoadProfile }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="space-y-8"
  >
    <div>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-black text-slate-900 dark:text-white tracking-tight"
      >
        Your Details
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-500 dark:text-slate-400 mt-2"
      >
        Who's sending this invoice?
      </motion.p>
    </div>

    {profiles?.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-2"
      >
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick fill:</span>
        {profiles.map((profile, i) => (
          <motion.button
            key={profile.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLoadProfile(profile)}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl hover:from-emerald-500/20 hover:to-teal-500/20 transition-all border border-emerald-500/20"
          >
            {profile.your_name || profile.yourName}
          </motion.button>
        ))}
      </motion.div>
    )}

    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FloatingInput
          label="Name / Company"
          icon={Building2}
          type="text"
          value={data.yourName}
          onChange={(e) => onChange('yourName', e.target.value)}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <FloatingTextarea
          label="Address"
          icon={MapPin}
          value={data.yourAddress}
          onChange={(e) => onChange('yourAddress', e.target.value)}
          rows={3}
        />
      </motion.div>
      <div className="grid grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FloatingInput
            label="Email"
            icon={Mail}
            type="email"
            value={data.yourEmail}
            onChange={(e) => onChange('yourEmail', e.target.value)}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <FloatingInput
            label="Tax ID"
            icon={Receipt}
            type="text"
            value={data.yourTaxId}
            onChange={(e) => onChange('yourTaxId', e.target.value)}
          />
        </motion.div>
      </div>
    </div>
  </motion.div>
)

const StepClientInfo = ({ data, onChange, clients, onLoadClient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="space-y-8"
  >
    <div>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-black text-slate-900 dark:text-white tracking-tight"
      >
        Client Details
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-500 dark:text-slate-400 mt-2"
      >
        Who are you billing?
      </motion.p>
    </div>

    {clients?.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-2"
      >
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick fill:</span>
        {clients.map((client, i) => (
          <motion.button
            key={client.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLoadClient(client)}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:to-fuchsia-500/20 text-violet-700 dark:text-violet-400 rounded-xl hover:from-violet-500/20 hover:to-fuchsia-500/20 transition-all border border-violet-500/20"
          >
            {client.client_name || client.clientName}
          </motion.button>
        ))}
      </motion.div>
    )}

    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FloatingInput
          label="Client Name / Company"
          icon={User}
          type="text"
          value={data.clientName}
          onChange={(e) => onChange('clientName', e.target.value)}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <FloatingTextarea
          label="Address"
          icon={MapPin}
          value={data.clientAddress}
          onChange={(e) => onChange('clientAddress', e.target.value)}
          rows={3}
        />
      </motion.div>
      <div className="grid grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FloatingInput
            label="Email"
            icon={Mail}
            type="email"
            value={data.clientEmail}
            onChange={(e) => onChange('clientEmail', e.target.value)}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <FloatingInput
            label="Tax ID"
            icon={Receipt}
            type="text"
            value={data.clientTaxId}
            onChange={(e) => onChange('clientTaxId', e.target.value)}
          />
        </motion.div>
      </div>
    </div>
  </motion.div>
)

const StepLineItems = ({ data, onChange }) => {
  const addItem = () => {
    onChange('lineItems', [...data.lineItems, { ...defaultLineItem }])
  }

  const removeItem = (index) => {
    if (data.lineItems.length > 1) {
      onChange('lineItems', data.lineItems.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index, field, value) => {
    const updated = [...data.lineItems]
    updated[index] = { ...updated[index], [field]: value }
    onChange('lineItems', updated)
  }

  const formatCurrency = (amount) => {
    const symbols = { EUR: '€', USD: '$', GBP: '£', CHF: 'Fr.', CAD: 'C$', AUD: 'A$', JPY: '¥', CNY: '¥', INR: '₹', BRL: 'R$', MXN: 'MX$', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč' }
    return `${symbols[data.currency] || data.currency} ${Number(amount || 0).toFixed(2)}`
  }

  const subtotal = data.lineItems.reduce((sum, item) =>
    sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-black text-slate-900 dark:text-white tracking-tight"
        >
          Line Items
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 mt-2"
        >
          Add your products or services
        </motion.p>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {data.lineItems.map((item, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative p-5 bg-white dark:bg-white/[0.02] rounded-2xl border-2 border-slate-200/50 dark:border-white/[0.05] group hover:border-slate-300 dark:hover:border-white/[0.1] transition-all"
            >
              {/* Item number badge */}
              <div className="absolute -top-3 -left-3 w-7 h-7 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {index + 1}
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/[0.03] border-2 border-transparent rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/30 focus:bg-white dark:focus:bg-white/[0.05] transition-all font-medium"
                    placeholder="What did you provide?"
                  />

                  {/* Notes/Comment field */}
                  <AnimatePresence mode="wait">
                    {item.showNote || (item.comment && item.comment.length > 0) ? (
                      <motion.div
                        key="note-input"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative"
                      >
                        <textarea
                          value={item.comment || ''}
                          onChange={(e) => updateItem(index, 'comment', e.target.value)}
                          placeholder="Add details, specs, or notes for this item..."
                          rows={2}
                          className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-xl text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/30 transition-all resize-none"
                        />
                        <button
                          onClick={() => {
                            updateItem(index, 'comment', '')
                            updateItem(index, 'showNote', false)
                          }}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="add-note-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => updateItem(index, 'showNote', true)}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-500 transition-colors py-1"
                      >
                        <StickyNote className="w-3.5 h-3.5" />
                        Add note
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.03] border-2 border-transparent rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/30 transition-all text-center font-mono"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Unit Price</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.03] border-2 border-transparent rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/30 transition-all text-right font-mono"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">VAT %</label>
                      <input
                        type="number"
                        value={item.vat}
                        onChange={(e) => updateItem(index, 'vat', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.03] border-2 border-transparent rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/30 transition-all text-center font-mono"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end pt-2">
                  <motion.div
                    key={(item.quantity || 0) * (item.price || 0)}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-xl font-black text-slate-900 dark:text-white font-mono"
                  >
                    {formatCurrency((Number(item.quantity) || 0) * (Number(item.price) || 0))}
                  </motion.div>
                  {data.lineItems.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeItem(index)}
                      className="mt-3 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        onClick={addItem}
        className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/[0.1] rounded-2xl text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-3 font-medium"
      >
        <Plus className="w-5 h-5" />
        Add another item
      </motion.button>

      {/* Expenses Section */}
      <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/[0.05]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Expenses</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add reimbursable expenses</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange('expenses', [...(data.expenses || []), { description: '', amount: 0 }])}
            className="px-4 py-2 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </motion.button>
        </div>

        <AnimatePresence mode="popLayout">
          {(data.expenses || []).map((expense, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: -50 }}
              className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl mb-3"
            >
              <input
                type="text"
                value={expense.description}
                onChange={(e) => {
                  const updated = [...data.expenses]
                  updated[index] = { ...updated[index], description: e.target.value }
                  onChange('expenses', updated)
                }}
                placeholder="Expense description"
                className="flex-1 px-4 py-2.5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  {({'EUR': '€', 'USD': '$', 'GBP': '£'})[data.currency] || data.currency}
                </span>
                <input
                  type="number"
                  value={expense.amount}
                  onChange={(e) => {
                    const updated = [...data.expenses]
                    updated[index] = { ...updated[index], amount: parseFloat(e.target.value) || 0 }
                    onChange('expenses', updated)
                  }}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] rounded-lg text-slate-900 dark:text-white text-right font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const updated = data.expenses.filter((_, i) => i !== index)
                  onChange('expenses', updated)
                }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        {(data.expenses || []).length > 0 && (
          <div className="flex justify-end mt-4">
            <div className="text-right">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total Expenses: </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {formatCurrency((data.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Subtotal card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl px-8 py-5 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Subtotal</div>
          <motion.div
            key={subtotal}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black text-white font-mono"
          >
            {formatCurrency(subtotal + (data.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const StepPayment = ({ data, onChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="space-y-8"
  >
    <div>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-black text-slate-900 dark:text-white tracking-tight"
      >
        Payment Details
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-500 dark:text-slate-400 mt-2"
      >
        How should you be paid?
      </motion.p>
    </div>

    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FloatingInput
          label="Beneficiary Name"
          icon={User}
          type="text"
          value={data.beneficiary}
          onChange={(e) => onChange('beneficiary', e.target.value)}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <FloatingInput
          label="IBAN"
          icon={CreditCard}
          type="text"
          value={data.iban}
          onChange={(e) => onChange('iban', e.target.value)}
          className="font-mono tracking-wider"
        />
      </motion.div>
      <div className="grid grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FloatingInput
            label="BIC / SWIFT"
            icon={Wallet}
            type="text"
            value={data.bic}
            onChange={(e) => onChange('bic', e.target.value)}
            className="font-mono"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <FloatingInput
            label="Intermediary BIC"
            icon={Wallet}
            type="text"
            value={data.intermediaryBic}
            onChange={(e) => onChange('intermediaryBic', e.target.value)}
            className="font-mono"
          />
        </motion.div>
      </div>
    </div>

    {/* Success message */}
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden p-5 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-cyan-500/10 rounded-2xl border border-emerald-500/20"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl" />
      <div className="relative flex items-start gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30"
        >
          <Check className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <div className="font-bold text-emerald-900 dark:text-emerald-300 text-lg">Almost there!</div>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
            Your payment details will be saved and included on the invoice.
          </p>
        </div>
      </div>
    </motion.div>
  </motion.div>
)

// Premium invoice templates
const INVOICE_STYLES = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean & simple',
    accent: '#10b981',
    headerBg: 'bg-white',
    preview: 'from-slate-50 to-white',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bold & professional',
    accent: '#3b82f6',
    headerBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    preview: 'from-blue-50 to-indigo-50',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated & refined',
    accent: '#8b5cf6',
    headerBg: 'bg-gradient-to-r from-violet-600 to-purple-600',
    preview: 'from-violet-50 to-purple-50',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Strong & impactful',
    accent: '#f59e0b',
    headerBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    preview: 'from-amber-50 to-orange-50',
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Fresh & organic',
    accent: '#22c55e',
    headerBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
    preview: 'from-green-50 to-emerald-50',
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Sleek & premium',
    accent: '#e5e7eb',
    headerBg: 'bg-gradient-to-r from-slate-800 to-slate-900',
    preview: 'from-slate-800 to-slate-900',
  },
]

const StepNotes = ({ data, onChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="space-y-8"
  >
    <div>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-black text-slate-900 dark:text-white tracking-tight"
      >
        Notes & Terms
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-500 dark:text-slate-400 mt-2"
      >
        Add any additional information for your client
      </motion.p>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <FloatingTextarea
        label="Notes"
        icon={StickyNote}
        value={data.notes}
        onChange={(e) => onChange('notes', e.target.value)}
        rows={5}
      />
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
        Common notes: payment terms, thank you messages, additional instructions
      </p>
    </motion.div>

    {/* Quick note templates */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-3"
    >
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Quick Templates
      </label>
      <div className="grid grid-cols-1 gap-3">
        {[
          { label: 'Thank you', text: 'Thank you for your business! We appreciate your trust and look forward to working with you again.' },
          { label: 'Payment terms', text: 'Payment is due within 30 days of the invoice date. Late payments may incur a 2% monthly interest charge.' },
          { label: 'Bank transfer', text: 'Please make payment via bank transfer using the payment details provided. Include the invoice number as reference.' },
        ].map((template, i) => (
          <motion.button
            key={template.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.05 }}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onChange('notes', data.notes ? `${data.notes}\n\n${template.text}` : template.text)}
            className="text-left p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border-2 border-slate-200/50 dark:border-white/[0.05] hover:border-emerald-400/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-all group"
          >
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {template.label}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {template.text}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  </motion.div>
)

const StepStyle = ({ data, onChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="space-y-8"
  >
    <div>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-black text-slate-900 dark:text-white tracking-tight"
      >
        Invoice Style
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-500 dark:text-slate-400 mt-2"
      >
        Choose a look that matches your brand
      </motion.p>
    </div>

    {/* Style templates grid */}
    <div className="grid grid-cols-2 gap-4">
      {INVOICE_STYLES.map((style, i) => {
        const isSelected = data.template === style.id
        return (
          <motion.button
            key={style.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onChange('template', style.id)
              onChange('accentColor', style.accent)
            }}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 group ${
              isSelected
                ? 'border-emerald-500 shadow-xl shadow-emerald-500/25 ring-4 ring-emerald-500/10'
                : 'border-slate-200/50 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/[0.1] hover:shadow-lg'
            }`}
          >
            {/* Mini preview */}
            <div className={`h-28 bg-gradient-to-br ${style.preview} relative overflow-hidden`}>
              {/* Animated background shimmer on hover */}
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: '100%', opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              />

              {/* Mini invoice mockup */}
              <motion.div
                animate={isSelected ? { y: -2, scale: 1.02 } : { y: 0, scale: 1 }}
                className="absolute inset-2.5 bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-hidden"
              >
                <div className={`h-7 ${style.headerBg}`} />
                <div className="p-2.5 space-y-1.5">
                  <div className="h-1.5 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-1 w-9 bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-1 w-18 bg-slate-100 dark:bg-slate-800 rounded mt-2" />
                  <div className="flex justify-end mt-2">
                    <div className="h-2 w-10 rounded" style={{ backgroundColor: style.accent + '40' }} />
                  </div>
                </div>
              </motion.div>

              {/* Selected checkmark with animation */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className="absolute top-2 right-2 w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30"
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Accent color indicator */}
              <div
                className="absolute bottom-2 left-2 w-4 h-4 rounded-full shadow-md ring-2 ring-white/50"
                style={{ backgroundColor: style.accent }}
              />
            </div>

            {/* Label */}
            <div className={`p-3.5 transition-colors ${isSelected ? 'bg-emerald-50/50 dark:bg-emerald-500/5' : 'bg-white dark:bg-slate-900/50'}`}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{style.name}</div>
                {isSelected && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{style.description}</div>
            </div>
          </motion.button>
        )
      })}
    </div>

    {/* Accent color picker */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Accent Color
        </label>
        <span className="text-xs text-slate-400 font-mono">{data.accentColor || '#10b981'}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {[
          { color: '#10b981', name: 'Emerald' },
          { color: '#3b82f6', name: 'Blue' },
          { color: '#8b5cf6', name: 'Violet' },
          { color: '#f59e0b', name: 'Amber' },
          { color: '#ef4444', name: 'Red' },
          { color: '#ec4899', name: 'Pink' },
          { color: '#06b6d4', name: 'Cyan' },
          { color: '#84cc16', name: 'Lime' },
        ].map((item, i) => {
          const isSelected = data.accentColor === item.color
          return (
            <motion.button
              key={item.color}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.03 }}
              whileHover={{ scale: 1.15, y: -3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange('accentColor', item.color)}
              className={`relative w-11 h-11 rounded-xl transition-all shadow-md group ${
                isSelected ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900 shadow-lg' : 'hover:shadow-lg'
              }`}
              style={{ backgroundColor: item.color }}
              title={item.name}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent opacity-60" />

              {/* Selected check */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white drop-shadow-md" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Color name tooltip on hover */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {item.name}
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>

    {/* All set message */}
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      className="relative overflow-hidden p-5 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-cyan-500/10 rounded-2xl border border-emerald-500/20"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl" />
      <div className="relative flex items-start gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <div className="font-bold text-emerald-900 dark:text-emerald-300 text-lg">You're all set!</div>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
            Your invoice is ready. Click "Finish & Export" to download your PDF.
          </p>
        </div>
      </div>
    </motion.div>
  </motion.div>
)

// Main component
export const SteppedInvoiceEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const previewRef = useRef(null)
  const pdfPreviewRef = useRef(null)

  const { getInvoice, createInvoice, updateInvoice } = useInvoices()
  const { profiles, clients } = useProfiles()

  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-001',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'EUR',
    status: 'draft',
    logo: '',
    yourName: '',
    yourAddress: '',
    yourEmail: '',
    yourTaxId: '',
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientTaxId: '',
    lineItems: [{ ...defaultLineItem }],
    expenses: [],
    beneficiary: '',
    iban: '',
    bic: '',
    intermediaryBic: '',
    notes: '',
    template: 'minimal',
    accentColor: '#10b981',
  })

  const steps = [
    { id: 'details', label: 'Details', icon: FileText, focus: 'details' },
    { id: 'yourInfo', label: 'Sender', icon: Building2, focus: 'yourInfo' },
    { id: 'clientInfo', label: 'Client', icon: User, focus: 'clientInfo' },
    { id: 'lineItems', label: 'Items', icon: Package, focus: 'lineItems' },
    { id: 'payment', label: 'Payment', icon: CreditCard, focus: 'payment' },
    { id: 'notes', label: 'Notes', icon: StickyNote, focus: 'notes' },
    { id: 'style', label: 'Style', icon: Palette, focus: 'style' },
  ]

  useEffect(() => {
    if (!isNew) {
      loadInvoice()
    }
  }, [id])

  const loadInvoice = async () => {
    try {
      const invoice = await getInvoice(id)
      if (invoice) {
        setInvoiceData({
          invoiceNumber: invoice.invoice_number || invoice.invoiceNumber || 'INV-001',
          issueDate: invoice.issue_date || invoice.issueDate || '',
          dueDate: invoice.due_date || invoice.dueDate || '',
          currency: invoice.currency || 'EUR',
          status: invoice.status || 'draft',
          logo: invoice.logo || '',
          yourName: invoice.your_name || invoice.yourName || '',
          yourAddress: invoice.your_address || invoice.yourAddress || '',
          yourEmail: invoice.your_email || invoice.yourEmail || '',
          yourTaxId: invoice.your_tax_id || invoice.yourTaxId || '',
          clientName: invoice.client_name || invoice.clientName || '',
          clientAddress: invoice.client_address || invoice.clientAddress || '',
          clientEmail: invoice.client_email || invoice.clientEmail || '',
          clientTaxId: invoice.client_tax_id || invoice.clientTaxId || '',
          lineItems: invoice.line_items || invoice.lineItems || [{ ...defaultLineItem }],
          expenses: invoice.expenses || [],
          beneficiary: invoice.beneficiary || '',
          iban: invoice.iban || '',
          bic: invoice.bic || '',
          intermediaryBic: invoice.intermediary_bic || invoice.intermediaryBic || '',
          notes: invoice.notes || '',
          template: invoice.template || DEFAULT_TEMPLATE,
        })
      }
    } catch (error) {
      console.error('Error loading invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }))
  }

  const handleLoadProfile = (profile) => {
    setInvoiceData(prev => ({
      ...prev,
      yourName: profile.your_name || profile.yourName || '',
      yourAddress: profile.your_address || profile.yourAddress || '',
      yourEmail: profile.your_email || profile.yourEmail || '',
      yourTaxId: profile.your_tax_id || profile.yourTaxId || '',
      beneficiary: profile.beneficiary || prev.beneficiary,
      iban: profile.iban || prev.iban,
      bic: profile.bic || prev.bic,
      intermediaryBic: profile.intermediary_bic || profile.intermediaryBic || prev.intermediaryBic,
    }))
  }

  const handleLoadClient = (client) => {
    setInvoiceData(prev => ({
      ...prev,
      clientName: client.client_name || client.clientName || '',
      clientAddress: client.client_address || client.clientAddress || '',
      clientEmail: client.client_email || client.clientEmail || '',
      clientTaxId: client.client_tax_id || client.clientTaxId || '',
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = {
        invoice_number: invoiceData.invoiceNumber,
        issue_date: invoiceData.issueDate,
        due_date: invoiceData.dueDate,
        currency: invoiceData.currency,
        status: invoiceData.status,
        logo: invoiceData.logo,
        your_name: invoiceData.yourName,
        your_address: invoiceData.yourAddress,
        your_email: invoiceData.yourEmail,
        your_tax_id: invoiceData.yourTaxId,
        client_name: invoiceData.clientName,
        client_address: invoiceData.clientAddress,
        client_email: invoiceData.clientEmail,
        client_tax_id: invoiceData.clientTaxId,
        line_items: invoiceData.lineItems,
        expenses: invoiceData.expenses,
        beneficiary: invoiceData.beneficiary,
        iban: invoiceData.iban,
        bic: invoiceData.bic,
        intermediary_bic: invoiceData.intermediaryBic,
        notes: invoiceData.notes,
        template: invoiceData.template,
      }

      if (isNew) {
        const created = await createInvoice(data)
        navigate(`/invoice/${created.id}`, { replace: true })
      } else {
        await updateInvoice(id, data)
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert('Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await handleSave()
      // Use the hidden PDF preview for export (proper A4 format with template styles)
      if (pdfPreviewRef.current) {
        await exportToPDF(pdfPreviewRef.current, `${invoiceData.invoiceNumber || 'invoice'}.pdf`)
      }
    } catch (error) {
      console.error('Error exporting:', error)
    } finally {
      setExporting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FileText className="w-6 h-6 text-emerald-500" />
            </motion.div>
          </div>
          <div className="text-slate-500 dark:text-slate-400 font-medium">Loading invoice...</div>
        </motion.div>
      </div>
    )
  }

  // Export loading overlay
  const ExportOverlay = () => (
    <AnimatePresence>
      {exporting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-6 max-w-sm mx-4"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-4 border-emerald-100 dark:border-emerald-900 border-t-emerald-500 rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Download className="w-8 h-8 text-emerald-500" />
              </motion.div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Creating your PDF
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Your invoice is being generated with all your customizations...
              </p>
            </div>
            <motion.div
              className="w-full h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepDetails data={invoiceData} onChange={handleChange} />
      case 1:
        return <StepYourInfo data={invoiceData} onChange={handleChange} profiles={profiles} onLoadProfile={handleLoadProfile} />
      case 2:
        return <StepClientInfo data={invoiceData} onChange={handleChange} clients={clients} onLoadClient={handleLoadClient} />
      case 3:
        return <StepLineItems data={invoiceData} onChange={handleChange} />
      case 4:
        return <StepPayment data={invoiceData} onChange={handleChange} />
      case 5:
        return <StepNotes data={invoiceData} onChange={handleChange} />
      case 6:
        return <StepStyle data={invoiceData} onChange={handleChange} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] relative overflow-hidden">
      <PremiumBackground />
      <ExportOverlay />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/60 dark:bg-[#0a0a0f]/60 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/[0.05]"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </motion.button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {isNew ? 'New Invoice' : invoiceData.invoiceNumber}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="relative px-5 py-2.5 bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all font-semibold disabled:opacity-50 border border-slate-200/50 dark:border-white/[0.05] overflow-hidden group"
            >
              <span className={saving ? 'opacity-0' : ''}>Save Draft</span>
              {saving && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full"
                  />
                </motion.div>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={exporting}
              className="relative px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:shadow-xl transition-all font-semibold flex items-center gap-2 disabled:opacity-50 overflow-hidden group"
            >
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              />
              <Download className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Export PDF</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <StepIndicator steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          {/* Form - takes 3 columns */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 relative bg-white dark:bg-slate-900/50 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-none border border-slate-200/50 dark:border-white/[0.05] p-8 backdrop-blur-xl overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation */}
            <motion.div
              layout
              className="flex justify-between mt-10 pt-8 border-t border-slate-100 dark:border-white/[0.05]"
            >
              <motion.button
                whileHover={{ x: -5, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium group"
              >
                <motion.div
                  animate={currentStep > 0 ? { x: [0, -3, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  <ChevronLeft className="w-5 h-5 group-hover:text-emerald-500 transition-colors" />
                </motion.div>
                Previous
              </motion.button>
              {currentStep < steps.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.03, x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={nextStep}
                  className="relative flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 text-white dark:text-slate-900 rounded-xl shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:shadow-slate-900/40 dark:hover:shadow-white/30 hover:shadow-xl transition-all font-semibold overflow-hidden group"
                >
                  {/* Shimmer */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 dark:via-black/10 to-transparent -skew-x-12"
                  />
                  <span className="relative z-10">Continue</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <ChevronRight className="w-5 h-5 relative z-10" />
                  </motion.div>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleExport}
                  disabled={exporting}
                  className="relative flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:shadow-xl transition-all font-semibold disabled:opacity-50 overflow-hidden group"
                >
                  {/* Sparkle effect */}
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-4 -right-4 w-8 h-8 bg-white/20 rounded-full blur-md"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 relative z-10" />
                  </motion.div>
                  <span className="relative z-10">{exporting ? 'Creating...' : 'Finish & Export'}</span>
                </motion.button>
              )}
            </motion.div>
          </motion.div>

          {/* Preview - takes 2 columns */}
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2.5 px-5 py-2 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-white/[0.08] dark:to-white/[0.03] rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider shadow-sm border border-slate-200/50 dark:border-white/[0.05]"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                Live Preview
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {steps[currentStep].label}
                </span>
              </motion.span>
            </motion.div>
            <motion.div
              ref={previewRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <InvoicePreview
                data={invoiceData}
                focusSection={steps[currentStep].focus}
              />
            </motion.div>

            {/* Quick stats below preview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 grid grid-cols-3 gap-3"
            >
              {[
                { label: 'Items', value: (invoiceData.lineItems || []).filter(i => i.description).length },
                { label: 'Template', value: (invoiceData.template || 'minimal').charAt(0).toUpperCase() + (invoiceData.template || 'minimal').slice(1) },
                { label: 'Total', value: `${{'EUR': '€', 'USD': '$', 'GBP': '£'}[invoiceData.currency] || invoiceData.currency}${((invoiceData.lineItems || []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0) * (1 + (Number(item.vat) || 0) / 100), 0)).toFixed(0)}` },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center p-3 bg-white/50 dark:bg-white/[0.02] rounded-xl border border-slate-200/50 dark:border-white/[0.05]"
                >
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hidden PDF Preview - proper A4 format for export */}
      <div
        ref={pdfPreviewRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '595px', // A4 width at 72 DPI
        }}
      >
        <PDFInvoicePreview data={invoiceData} />
      </div>
    </div>
  )
}

export default SteppedInvoiceEditor
