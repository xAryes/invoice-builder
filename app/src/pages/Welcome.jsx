import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  FileText,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Globe,
  Users,
  BarChart3,
  RefreshCw,
  TrendingUp,
  Send,
  Sparkles,
  Download,
  Mail,
  Clock,
  PenTool,
  CheckCircle,
  Star,
  Quote,
  Play,
  DollarSign,
  Palette,
  Moon,
  Sun,
} from 'lucide-react'

// Google icon component
const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

// Brand Colors - Emerald/Teal theme (softer than blue)
const BRAND = {
  name: 'Billflow',
  primary: 'emerald',
  accent: 'teal',
}

// Logo component - New Billflow branding
const Logo = ({ dark = false, size = 'default' }) => {
  const sizes = {
    small: { icon: 'w-7 h-7', text: 'text-base', iconSize: 'w-3.5 h-3.5' },
    default: { icon: 'w-9 h-9', text: 'text-lg', iconSize: 'w-4 h-4' },
    large: { icon: 'w-11 h-11', text: 'text-xl', iconSize: 'w-5 h-5' },
  }
  const s = sizes[size]

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.icon} bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20`}>
        <svg className={`${s.iconSize} text-white`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 15h6" />
          <path d="M9 11h6" />
        </svg>
      </div>
      <span className={`font-bold ${s.text} ${dark ? 'text-white' : 'text-gray-900'}`}>
        Bill<span className="text-emerald-500">flow</span>
      </span>
    </div>
  )
}

// Dashboard Preview Component - Enhanced with more floating elements
const DashboardPreview = () => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.4 }}
    className="relative"
  >
    {/* Glowing background */}
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-3xl -z-10 scale-125" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -z-10" />

    {/* Browser Window */}
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/20">
      <div className="h-10 bg-gray-900/50 border-b border-white/5 flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 mx-4">
          <div className="h-6 bg-white/5 rounded-lg max-w-xs mx-auto flex items-center justify-center gap-2">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-white/40">app.billflow.co/dashboard</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Revenue', value: '$12,426', trend: '+22%', icon: DollarSign, color: 'emerald' },
            { label: 'Invoices Sent', value: '84', trend: '+12%', icon: FileText, color: 'teal' },
            { label: 'Pending', value: '$2,340', trend: '-5%', icon: Clock, color: 'amber' },
            { label: 'Clients', value: '32', trend: '+8%', icon: Users, color: 'cyan' },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <Icon className={`w-3.5 h-3.5 text-${stat.color}-500`} />
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    stat.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">Revenue Overview</span>
                <p className="text-[10px] text-emerald-500 font-medium">+23% this month</p>
              </div>
            </div>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Last 6 months</span>
          </div>
          <div className="flex items-end gap-2 h-20">
            {[40, 65, 45, 80, 55, 90].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t hover:from-emerald-600 hover:to-teal-500 transition-colors cursor-pointer"
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
              <span key={m} className="text-[8px] text-gray-400">{m}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>

    {/* Floating Cards - Enhanced */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0, y: [-5, 5, -5] }}
      transition={{
        opacity: { delay: 1.5, duration: 0.5 },
        x: { delay: 1.5, duration: 0.5 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
      }}
      className="absolute -right-8 top-20 bg-white rounded-2xl shadow-2xl shadow-emerald-500/10 border border-gray-100 p-4 z-10"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Check className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Payment Received</p>
          <p className="text-xs text-gray-500">$2,850.00 from Acme Inc.</p>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, y: [5, -5, 5] }}
      transition={{
        opacity: { delay: 1.8, duration: 0.5 },
        x: { delay: 1.8, duration: 0.5 },
        y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }
      }}
      className="absolute -left-6 bottom-28 bg-white rounded-2xl shadow-2xl shadow-teal-500/10 border border-gray-100 p-4 z-10"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Revenue Up</p>
          <p className="text-xs text-emerald-500 font-medium">+23% vs last month</p>
        </div>
      </div>
    </motion.div>

    {/* New floating card - Invoice sent */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { delay: 2.1, duration: 0.5 },
        scale: { delay: 2.1, duration: 0.5 },
        y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2.1 }
      }}
      className="absolute -right-4 bottom-16 bg-white rounded-2xl shadow-2xl shadow-violet-500/10 border border-gray-100 p-3 z-10"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center">
          <Send className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-900">Invoice Sent</p>
          <p className="text-[10px] text-gray-500">INV-2026-042</p>
        </div>
      </div>
    </motion.div>
  </motion.div>
)

// Invoice Editor Preview Component - Enhanced with hover interactions
const InvoiceEditorPreview = () => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    whileHover={{ y: -8 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 blur-3xl -z-10 scale-110 group-hover:scale-125 transition-transform duration-500" />

    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden group-hover:shadow-emerald-500/20 group-hover:border-emerald-500/30 transition-all duration-300">
      <div className="h-14 bg-white/5 border-b border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30"
          >
            <FileText className="w-4 h-4 text-white" />
          </motion.div>
          <span className="font-semibold text-white">INV-2026-0042</span>
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30"
          >
            Draft
          </motion.span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.05 }} className="px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5 rounded-lg transition">Preview</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg shadow-md shadow-emerald-500/30 hover:bg-emerald-400 transition">Send Invoice</motion.button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Bill To</label>
            <motion.div
              whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.5)' }}
              className="bg-white/5 rounded-lg p-3 border border-white/10 cursor-pointer transition-colors"
            >
              <p className="text-sm font-medium text-white">Acme Corporation</p>
              <p className="text-xs text-gray-400">john@acme.com</p>
            </motion.div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Issue Date</label>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-sm text-gray-300">Feb 01, 2026</div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Due Date</label>
              <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-sm text-gray-300">Mar 01, 2026</div>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Line Items</label>
            <div className="space-y-2">
              {[
                { desc: 'Website Design', price: '$2,500' },
                { desc: 'Development', price: '$4,000' },
                { desc: 'Hosting (Annual)', price: '$299' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10 cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors"
                >
                  <span className="text-xs text-gray-300">{item.desc}</span>
                  <span className="text-xs font-semibold text-emerald-400">{item.price}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/80 rounded-lg shadow-lg p-4 h-full cursor-pointer transition-shadow hover:shadow-xl border border-white/10"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mb-2 shadow-lg shadow-emerald-500/30" />
                <p className="text-[10px] text-gray-500">Your Company</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">INVOICE</p>
                <p className="text-[10px] text-gray-500">INV-2026-0042</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-2 w-24 bg-white/10 rounded" />
              <div className="h-2 w-32 bg-white/10 rounded" />
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-300 font-medium">$6,799</span>
                </div>
                <div className="flex justify-between text-[10px] mt-1">
                  <span className="text-gray-500">Tax (10%)</span>
                  <span className="text-gray-300 font-medium">$679.90</span>
                </div>
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-white/10">
                  <span className="font-semibold text-white">Total</span>
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="font-bold text-emerald-400"
                  >
                    $7,478.90
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </motion.div>
)

// Feature Bento Grid Component - Enhanced with visual previews
const FeaturesBentoGrid = () => {
  return (
    <section className="py-24 px-6 bg-[#0a0a0f] relative overflow-hidden" id="features">
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(16, 185, 129) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }} />
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            Features
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">get paid faster</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto text-lg">
            Powerful features designed for freelancers and agencies.
          </p>
        </motion.div>

        {/* Bento Grid - Redesigned */}
        <div className="grid grid-cols-12 gap-4">
          {/* Professional Templates - Large Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 md:col-span-7 row-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-8 group min-h-[320px]"
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg"
              >
                <Palette className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional Templates</h3>
              <p className="text-white/80 max-w-xs text-sm leading-relaxed">Beautiful, customizable invoice designs that make your business look professional.</p>

              {/* Feature bullets */}
              <div className="mt-4 space-y-2">
                {['Drag & drop editor', 'Custom branding', 'Multiple layouts'].map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2 text-white/70 text-xs"
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                    {feature}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Invoice Preview Stack - Enhanced */}
            <div className="absolute bottom-0 right-0 w-64 h-72">
              <motion.div
                initial={{ rotate: -12, y: 30, opacity: 0 }}
                whileInView={{ rotate: -12, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="absolute bottom-2 right-12 w-40 h-52 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              />
              <motion.div
                initial={{ rotate: -6, y: 30, opacity: 0 }}
                whileInView={{ rotate: -6, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-4 right-8 w-40 h-52 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
              />
              <motion.div
                initial={{ rotate: 0, y: 30, opacity: 0 }}
                whileInView={{ rotate: 0, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="absolute bottom-6 right-4 w-40 h-52 bg-white rounded-xl shadow-2xl p-3 cursor-pointer transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg" />
                  <div className="text-right">
                    <div className="text-[7px] text-gray-400 uppercase tracking-wider">Invoice</div>
                    <div className="text-[9px] font-bold text-gray-900">#2026-042</div>
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="h-1.5 w-16 bg-gray-200 rounded" />
                  <div className="h-1.5 w-12 bg-gray-100 rounded" />
                </div>
                <div className="space-y-1 border-t border-gray-100 pt-2">
                  <div className="flex justify-between items-center">
                    <div className="h-1 w-14 bg-gray-100 rounded" />
                    <div className="text-[8px] font-medium text-gray-600">$2,500</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-1 w-10 bg-gray-100 rounded" />
                    <div className="text-[8px] font-medium text-gray-600">$4,000</div>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 left-3 flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-[8px] text-gray-500 font-medium">Total</span>
                  <span className="text-sm font-bold text-emerald-600">$6,500</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Dark Mode - Medium Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="col-span-12 md:col-span-5 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-6 group min-h-[152px] cursor-pointer"
          >
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
              <motion.div
                animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"
              />
            </div>

            <div className="relative z-10">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Dark Mode</h3>
              <p className="text-white/70 text-sm">Easy on the eyes, day or night</p>
            </div>

            {/* Theme toggle visual */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/10 rounded-full p-1">
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sun className="w-3 h-3 text-yellow-900" />
              </div>
              <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center border border-white/20">
                <Moon className="w-3 h-3 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Smart Analytics - Medium Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.02 }}
            className="col-span-12 md:col-span-5 relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-blue-500 to-blue-600 p-6 group min-h-[152px] cursor-pointer"
          >
            {/* Background effect */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-400/30 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="px-2 py-1 bg-white/20 rounded-full">
                  <span className="text-[10px] font-semibold text-white">+24% ↑</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Smart Analytics</h3>
              <p className="text-white/70 text-sm">Track revenue and growth trends</p>
            </div>

            {/* Mini Chart - Enhanced */}
            <div className="absolute bottom-4 right-4 flex items-end gap-1.5 h-14">
              {[25, 40, 30, 55, 35, 70, 45, 85].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                  className="w-2.5 bg-white/40 rounded-t group-hover:bg-white/60 transition-colors"
                />
              ))}
            </div>
          </motion.div>

          {/* Recurring Invoices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="col-span-6 md:col-span-4 relative overflow-hidden rounded-3xl bg-gray-900/80 border border-white/10 p-5 group hover:shadow-2xl hover:shadow-teal-500/10 hover:border-teal-500/30 transition-all min-h-[140px] cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-3 shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">Recurring Invoices</h3>
              <p className="text-sm text-gray-400">Automate subscription billing</p>
            </div>
            {/* Recurring indicator - Enhanced */}
            <div className="absolute top-4 right-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-teal-500 rounded-full" />
              </div>
            </div>
          </motion.div>

          {/* Multi-Currency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -4 }}
            className="col-span-6 md:col-span-4 relative overflow-hidden rounded-3xl bg-gray-900/80 border border-white/10 p-5 group hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all min-h-[140px] cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">Multi-Currency</h3>
              <p className="text-sm text-gray-400">Invoice in any currency</p>
            </div>
            {/* Currency badges - Enhanced */}
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {[
                { symbol: '$', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
                { symbol: '€', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
                { symbol: '£', color: 'bg-violet-500/20 text-violet-400 border border-violet-500/30' },
                { symbol: '¥', color: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
              ].map((c, i) => (
                <motion.span
                  key={c.symbol}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className={`w-7 h-7 ${c.color} rounded-full flex items-center justify-center text-xs font-bold`}
                >
                  {c.symbol}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Email Delivery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="col-span-12 md:col-span-4 relative overflow-hidden rounded-3xl bg-gray-900/80 border border-white/10 p-5 group hover:shadow-2xl hover:shadow-rose-500/10 hover:border-rose-500/30 transition-all min-h-[140px] cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-3 shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">Email Delivery</h3>
              <p className="text-sm text-gray-400">One-click sending with tracking</p>
            </div>
            {/* Email sent indicator - Enhanced */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <motion.div
                initial={{ x: 0, opacity: 1 }}
                animate={{ x: [0, 20, 20], opacity: [1, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5 }}
              >
                <Send className="w-5 h-5 text-rose-400" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5, delay: 0.3 }}
                className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30"
              >
                <Check className="w-3 h-3 text-emerald-400" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Additional Features Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          {[
            { icon: Shield, label: 'Secure & private' },
            { icon: Download, label: 'PDF export' },
            { icon: Moon, label: 'Dark mode' },
            { icon: Users, label: 'Client management' },
            { icon: RefreshCw, label: 'Recurring invoices' },
            { icon: FileText, label: 'Professional templates' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm transition-all cursor-default ${
                  item.badge
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/30'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.badge ? 'text-blue-400' : 'text-emerald-400'}`} />
                {item.label}
                {item.badge && <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded-full font-medium">EU</span>}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// Compact Stats Bar - Enhanced with icons and better styling
const StatsBar = () => {
  const stats = [
    { value: '10K+', label: 'Users', icon: Users, color: 'text-emerald-400' },
    { value: '$50M+', label: 'Processed', icon: DollarSign, color: 'text-teal-400' },
    { value: '4.9★', label: 'Rating', icon: Star, color: 'text-amber-400' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex items-center justify-center gap-6 sm:gap-10 py-6"
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-white/5 items-center justify-center">
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{stat.value}</span>
              <span className="text-sm text-white/50">{stat.label}</span>
            </div>
            {i < stats.length - 1 && <div className="w-px h-5 bg-white/10 ml-4 sm:ml-6" />}
          </motion.div>
        )
      })}
    </motion.div>
  )
}

// Animated How It Works Section with Step Flow - Enhanced
const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = [
    {
      step: '01',
      title: 'Create',
      fullTitle: 'Create Your Invoice',
      description: 'Build professional invoices in minutes with our intuitive editor.',
      icon: PenTool,
      gradient: 'from-emerald-400 to-emerald-600',
      bgGlow: 'bg-emerald-500',
    },
    {
      step: '02',
      title: 'Export',
      fullTitle: 'Export to PDF',
      description: 'Download professional PDFs ready to send to clients.',
      icon: Download,
      gradient: 'from-teal-400 to-teal-600',
      bgGlow: 'bg-teal-500',
    },
    {
      step: '03',
      title: 'Send',
      fullTitle: 'Send to Client',
      description: 'Email invoices directly to your clients.',
      icon: Send,
      gradient: 'from-cyan-400 to-cyan-600',
      bgGlow: 'bg-cyan-500',
    },
    {
      step: '04',
      title: 'Grow',
      fullTitle: 'Track & Grow',
      description: 'Monitor revenue with detailed analytics and insights.',
      icon: BarChart3,
      gradient: 'from-amber-400 to-amber-600',
      bgGlow: 'bg-amber-500',
    },
  ]

  // Proper auto-advance with useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
      setProgress(0)
    }, 4000)
    return () => clearInterval(interval)
  }, [steps.length])

  // Progress animation
  useEffect(() => {
    setProgress(0)
    const timer = setTimeout(() => setProgress(100), 100)
    return () => clearTimeout(timer)
  }, [activeStep])

  // Step previews
  const stepPreviews = [
    // Create Invoice Preview
    <div key="create" className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-md" />
            <span className="text-sm font-medium text-gray-700">New Invoice</span>
          </div>
          <span className="text-xs text-gray-400">Draft</span>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <div className="text-[10px] uppercase text-gray-400 mb-1">Bill to</div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-sm font-medium text-gray-900">Acme Corporation</div>
              <div className="text-xs text-gray-500">john@acme.com</div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {[
              { item: 'Website Design', price: '$2,500' },
              { item: 'Development', price: '$4,000' },
            ].map((row, i) => (
              <motion.div
                key={row.item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
              >
                <span className="text-xs text-gray-600">{row.item}</span>
                <span className="text-xs font-semibold text-gray-900">{row.price}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-sm font-medium text-gray-600">Total</span>
            <span className="text-lg font-bold text-emerald-600">$6,500</span>
          </div>
        </div>
      </div>
    </div>,

    // Send Invoice Preview
    <div key="send" className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Send className="w-7 h-7 text-teal-600" />
        </motion.div>
        <h4 className="text-lg font-semibold text-gray-900 mb-1">Invoice Sent!</h4>
        <p className="text-sm text-gray-500 mb-4">Your invoice is on its way to john@acme.com</p>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-2">Payment link</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-lg px-3 py-2 text-xs text-gray-600 border truncate">
              pay.billflow.co/inv-2026-042
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 bg-teal-500 text-white text-xs font-medium rounded-lg"
            >
              Copy
            </motion.button>
          </div>
        </div>
      </div>
    </div>,

    // Payment Received Preview
    <div key="paid" className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Check className="w-8 h-8 text-emerald-600" />
        </motion.div>
        <h4 className="text-lg font-semibold text-gray-900 mb-1">Payment Received!</h4>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-emerald-600 mb-4"
        >
          $6,500.00
        </motion.p>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Method</span>
            <span className="font-medium text-gray-900">Visa •••• 4242</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-900">Just now</span>
          </div>
        </div>
      </div>
    </div>,

    // Analytics Preview
    <div key="analytics" className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500">Monthly Revenue</div>
            <div className="text-2xl font-bold text-gray-900">$24,500</div>
          </div>
          <div className="px-2 py-1 bg-emerald-100 rounded-lg">
            <span className="text-xs font-semibold text-emerald-600">+24%</span>
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-24 mb-3">
          {[35, 45, 30, 55, 40, 70, 45, 85, 50, 75, 60, 90].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              className="flex-1 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t"
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
        </div>
      </div>
    </div>,
  ]

  return (
    <section className="py-24 px-6 bg-gray-950 relative overflow-hidden" id="how-it-works">
      {/* Dynamic background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] ${steps[activeStep].bgGlow}/10 rounded-full blur-[120px]`}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-white/5 text-white/80 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/10">
            <Zap className="w-4 h-4 text-emerald-400" />
            Simple Process
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            From invoice to payment
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">in 4 simple steps</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto text-lg">
            Our streamlined workflow helps you get paid faster than ever before.
          </p>
        </motion.div>

        {/* Steps Timeline - Horizontal on desktop */}
        <div className="mb-12">
          <div className="hidden md:flex items-center justify-between max-w-3xl mx-auto mb-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              const isActive = activeStep === i
              const isPast = i < activeStep
              return (
                <div key={step.step} className="flex items-center flex-1">
                  <motion.button
                    onClick={() => setActiveStep(i)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 relative"
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        boxShadow: isActive ? `0 0 30px rgba(16, 185, 129, 0.4)` : 'none'
                      }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-br ${step.gradient}`
                          : isPast
                          ? 'bg-emerald-500/20 border border-emerald-500/40'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isActive || isPast ? 'text-white' : 'text-gray-500'}`} />
                    </motion.div>
                    <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </motion.button>
                  {i < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-white/10 mx-4 relative">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: i < activeStep ? '100%' : '0%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="max-w-3xl mx-auto">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${steps[activeStep].gradient}`}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 3.9, ease: 'linear' }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Step Info */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 bg-gradient-to-r ${steps[activeStep].gradient} text-white`}>
                  Step {steps[activeStep].step}
                </span>
                <h3 className="text-3xl font-bold text-white mb-3">
                  {steps[activeStep].fullTitle}
                </h3>
                <p className="text-lg text-gray-400 mb-6">
                  {steps[activeStep].description}
                </p>
                {/* Mobile step navigation */}
                <div className="flex gap-2 justify-center lg:justify-start md:hidden">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveStep(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === activeStep ? 'w-8 bg-emerald-500' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Preview Area */}
          <div className="relative order-1 lg:order-2">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`absolute -inset-4 ${steps[activeStep].bgGlow}/20 rounded-3xl blur-2xl`}
            />
            <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  {stepPreviews[activeStep]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Feature Showcase Section - Enhanced with patterns
const FeatureShowcaseSection = () => (
  <section className="py-24 px-6 bg-[#0a0a0f] relative overflow-hidden">
    {/* Subtle background pattern */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: `radial-gradient(circle at 1px 1px, rgb(16, 185, 129) 1px, transparent 0)`,
      backgroundSize: '40px 40px'
    }} />

    {/* Floating decorative elements */}
    <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
    <div className="absolute bottom-40 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

    <div className="max-w-7xl mx-auto relative z-10">
      {/* Feature 1: Invoice Editor */}
      <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-medium mb-4"
          >
            <PenTool className="w-3 h-3" />
            Invoice Editor
          </motion.span>
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Create beautiful invoices in <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">minutes</span>
          </h3>
          <p className="text-lg text-gray-400 mb-6">
            Our intuitive editor makes it easy to create professional invoices. Add your logo, customize colors, and include all the details your clients need.
          </p>
          <ul className="space-y-3">
            {[
              'Drag & drop line items',
              'Custom branding & logo',
              'Auto-calculate taxes & totals',
              'Save client profiles for reuse',
              'Multiple currency support',
            ].map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-gray-300 group"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
                </div>
                <span className="group-hover:text-white transition-colors">{item}</span>
              </motion.li>
            ))}
          </ul>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Link to="/invoice/new">
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
              >
                Try the Editor
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
        <InvoiceEditorPreview />
      </div>

      {/* Feature 2: Dashboard & Analytics */}
      <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:order-2"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-400 border border-teal-500/20 px-4 py-1.5 rounded-full text-xs font-medium mb-4"
          >
            <BarChart3 className="w-3 h-3" />
            Analytics Dashboard
          </motion.span>
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Track your business <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">performance</span>
          </h3>
          <p className="text-lg text-gray-400 mb-6">
            Get real-time insights into your revenue, outstanding invoices, and client activity. Make data-driven decisions to grow your business.
          </p>
          <ul className="space-y-3">
            {[
              'Revenue trends & forecasting',
              'Client payment patterns',
              'Invoice aging reports',
              'Export to CSV/Excel',
              'Custom date ranges',
            ].map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-gray-300 group"
              >
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center group-hover:bg-teal-500 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="w-4 h-4 text-teal-400 group-hover:text-white transition-colors" />
                </div>
                <span className="group-hover:text-white transition-colors">{item}</span>
              </motion.li>
            ))}
          </ul>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-shadow"
              >
                View Dashboard
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:order-1"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl -z-10 scale-110" />
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Revenue', value: '$24,500', trend: '+18%' },
                  { label: 'Pending', value: '$3,200', trend: '-8%' },
                  { label: 'Paid', value: '$21,300', trend: '+24%' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className={`text-xs ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{stat.trend}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-white">Revenue by Month</span>
                  <span className="text-xs text-gray-500">2026</span>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {[45, 60, 35, 75, 50, 85, 40, 90, 55, 70, 45, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t transition-all hover:from-emerald-400 hover:to-teal-300"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature 3: Dark Mode & Customization */}
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-slate-500/10 text-slate-400 border border-slate-500/20 px-4 py-1.5 rounded-full text-xs font-medium mb-4"
          >
            <Moon className="w-3 h-3" />
            Dark Mode
          </motion.span>
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Work <span className="bg-gradient-to-r from-slate-400 to-gray-400 bg-clip-text text-transparent">comfortably</span>, any time
          </h3>
          <p className="text-lg text-gray-400 mb-6">
            Easy on the eyes with full dark mode support. Create invoices day or night without straining your vision.
          </p>
          <ul className="space-y-3">
            {[
              'Full dark mode support',
              'Clean, minimal interface',
              'Professional templates',
              'Save client information',
              'Recurring invoices',
            ].map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-gray-300 group"
              >
                <div className="w-6 h-6 rounded-full bg-slate-500/20 flex items-center justify-center group-hover:bg-slate-500 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <span className="group-hover:text-white transition-colors">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/20 to-gray-500/20 blur-3xl -z-10 scale-110" />
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Invoice Preview</h4>
                    <p className="text-xs text-gray-500">Dark mode enabled</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-full p-1">
                  <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center border border-emerald-500">
                    <Moon className="w-3 h-3 text-white" />
                  </div>
                  <div className="w-6 h-6 bg-transparent rounded-full flex items-center justify-center">
                    <Sun className="w-3 h-3 text-gray-500" />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="h-3 w-24 bg-white/20 rounded mb-3" />
                <div className="h-2 w-full bg-white/10 rounded mb-2" />
                <div className="h-2 w-3/4 bg-white/10 rounded mb-4" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 bg-emerald-500/20 rounded" />
                  <div className="h-8 bg-teal-500/20 rounded" />
                  <div className="h-8 bg-cyan-500/20 rounded" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
)

// Testimonials Section - Enhanced with better visuals
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Billflow has completely transformed how I manage my freelance business. Creating and sending invoices used to take hours, now it takes minutes.",
      author: "Sarah Chen",
      role: "Freelance Designer",
      avatar: "SC",
      company: "Chen Design Studio",
      gradient: "from-violet-500 to-purple-600",
      metric: "5x faster",
      metricLabel: "Invoice creation"
    },
    {
      quote: "The analytics dashboard gives me insights I never had before. I can see exactly which clients pay on time and plan my cash flow better.",
      author: "Marcus Johnson",
      role: "Agency Owner",
      avatar: "MJ",
      company: "Johnson Creative",
      gradient: "from-emerald-500 to-teal-600",
      metric: "40% better",
      metricLabel: "Cash flow visibility"
    },
    {
      quote: "My clients love the online payment option. Since switching to Billflow, my average payment time has dropped from 30 days to just 5.",
      author: "Emily Rodriguez",
      role: "Consultant",
      avatar: "ER",
      company: "ER Consulting",
      gradient: "from-amber-500 to-orange-600",
      metric: "6x faster",
      metricLabel: "Payment received"
    },
  ]

  return (
    <section className="py-24 px-6 bg-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px]" />
        {/* Floating shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-20 h-20 border border-white/5 rounded-2xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-32 w-16 h-16 border border-white/5 rounded-full"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-white/5 text-white/80 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/10">
            <Quote className="w-4 h-4" />
            Testimonials
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Loved by businesses{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">worldwide</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            See what our customers have to say about their experience with Billflow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white/[0.03] backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              {/* Glow effect on hover */}
              <div className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />

              {/* Content */}
              <div className="relative z-10">
                {/* Stars with animation */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + j * 0.05 }}
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Quote icon */}
                <div className="absolute top-4 right-4 opacity-10">
                  <Quote className="w-10 h-10 text-white" />
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed text-sm">"{testimonial.quote}"</p>

                {/* Metric badge */}
                <div className="mb-6 inline-flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-white font-bold">{testimonial.metric}</span>
                    <span className="text-gray-500 text-xs ml-1">{testimonial.metricLabel}</span>
                  </div>
                </div>

                {/* Author info */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-semibold text-sm shadow-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-xs text-gray-500">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'].map((color, i) => (
                <div key={i} className={`w-8 h-8 ${color} rounded-full border-2 border-gray-900 flex items-center justify-center text-[10px] text-white font-semibold`}>
                  {['JD', 'MK', 'AS', 'RC'][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 ml-2">
              <span className="text-white font-semibold">2,500+</span> happy customers
            </p>
          </div>
          <div className="h-6 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">4.9/5</span> average rating
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Trusted By Logos - Enhanced with marquee effect
const TrustedLogos = () => {
  const logos = [
    { name: 'stripe', display: 'stripe', style: 'font-bold text-[22px] tracking-tight' },
    { name: 'Shopify', display: 'Shopify', style: 'font-semibold text-[20px] tracking-tight' },
    { name: 'Notion', display: 'Notion', style: 'font-medium text-[20px] tracking-tight' },
    { name: 'Vercel', display: '▲ Vercel', style: 'font-medium text-[18px] tracking-tight' },
    { name: 'Linear', display: 'Linear', style: 'font-medium text-[20px] tracking-wide' },
    { name: 'Figma', display: 'Figma', style: 'font-semibold text-[20px] tracking-tight' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-16 pt-12 border-t border-white/10"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-500 mb-8"
      >
        Trusted by <span className="text-emerald-400 font-semibold">10,000+</span> businesses worldwide
      </motion.p>

      {/* Logo cloud with subtle animation */}
      <div className="relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ scale: 1.1 }}
              className="relative group"
            >
              <span
                className={`text-white/40 ${logo.style} transition-all duration-300 cursor-default select-none group-hover:text-white/80`}
              >
                {logo.display}
              </span>
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 blur-xl transition-all duration-300 -z-10" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export const Welcome = () => {
  const navigate = useNavigate()
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured()) {
      navigate('/onboarding')
      return
    }
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    navigate('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Header - Enhanced with better hover effects */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo dark />
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How it works', href: '#how-it-works' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 text-sm text-gray-400 hover:text-white transition group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-emerald-500 group-hover:w-1/2 transition-all duration-300" />
              </a>
            ))}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className="ml-4 text-sm px-5 py-2.5 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition shadow-lg shadow-white/10"
            >
              Get Started
            </motion.button>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm text-white/80 px-4 py-2 rounded-full text-sm font-medium border border-white/10">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Free invoice generator tool
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-2">
              Create invoices,
            </h1>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1]">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                get paid faster
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-400 text-lg max-w-2xl mx-auto mb-10"
          >
            A simple tool to create professional invoices, export to PDF,
            and keep track of your billing—completely free to use.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-4 mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-xl shadow-white/10 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5" />
              )}
              {loading ? 'Connecting...' : 'Start Free Today'}
            </motion.button>

            <button
              onClick={handleDemoMode}
              className="flex items-center gap-2 px-8 py-4 text-white font-medium bg-white/5 rounded-xl hover:bg-white/10 transition border border-white/10"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-gray-500"
          >
            Free plan available • No credit card required
          </motion.p>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 mt-4"
            >
              <p className="text-sm text-red-400 text-center">{error}</p>
            </motion.div>
          )}

          <div className="mt-16 max-w-4xl mx-auto">
            <DashboardPreview />
          </div>

        </div>
      </section>

      {/* How It Works - Animated Steps */}
      <HowItWorksSection />

      {/* Features Bento Grid */}
      <FeaturesBentoGrid />

      {/* Feature Showcase */}
      <FeatureShowcaseSection />


      {/* CTA Section - Enhanced with floating elements */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        {/* Floating shapes */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 hidden lg:block"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-[15%] w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 hidden lg:block"
        />
        <motion.div
          animate={{ y: [0, 10, 0], x: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-[8%] w-12 h-12 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 hidden lg:block"
        />

        {/* Floating notification cards */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.5 },
            x: { duration: 0.5 }
          }}
          className="absolute top-1/4 left-[5%] bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 hidden xl:flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-white">Invoice paid!</p>
            <p className="text-[10px] text-white/60">Just now</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          animate={{ y: [0, 10, 0] }}
          transition={{
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.5 },
            x: { duration: 0.5 }
          }}
          className="absolute bottom-1/4 right-[5%] bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 hidden xl:flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-white">Revenue up 24%</p>
            <p className="text-[10px] text-white/60">This month</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to create your first invoice?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Start creating professional invoices in seconds.
            No signup required for demo mode.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(255,255,255,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-xl"
            >
              <GoogleIcon className="w-5 h-5" />
              Get Started
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 mt-12 text-sm">
            {[
              { icon: Check, text: '100% Free' },
              { icon: FileText, text: 'PDF Export' },
              { icon: RefreshCw, text: 'Recurring invoices' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/80">{item.text}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo dark />
              <span className="text-sm text-gray-500">Free invoice generator</span>
            </div>
            <a
              href="https://github.com/xAryes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-emerald-400 transition-colors"
            >
              Made with ❤️ by xAryes
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
