// Invoice template configurations
export const INVOICE_TEMPLATES = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean & simple',
    preview: 'Understated with lots of whitespace',
    styles: {
      headerBg: '#ffffff',
      headerText: '#111111',
      accentColor: '#4d65ff',
      bodyBg: '#ffffff',
      bodyText: '#333333',
      mutedText: '#888888',
      borderColor: '#eeeeee',
      tableHeaderBg: '#fafafa',
      tableHeaderText: '#333333',
      totalsBg: '#fafafa',
      paymentBg: '#fafafa',
      paymentBorder: '#4d65ff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Bold & professional',
    preview: 'Sleek, contemporary look with colored headers',
    styles: {
      headerBg: '#3b82f6',
      headerText: '#ffffff',
      accentColor: '#3b82f6',
      bodyBg: '#ffffff',
      bodyText: '#1e293b',
      mutedText: '#64748b',
      borderColor: '#e2e8f0',
      tableHeaderBg: '#3b82f6',
      tableHeaderText: '#ffffff',
      totalsBg: '#eff6ff',
      paymentBg: '#f8fafc',
      paymentBorder: '#3b82f6',
      fontFamily: '"Inter", -apple-system, sans-serif',
    },
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated & refined',
    preview: 'Timeless design with refined typography',
    styles: {
      headerBg: '#8b5cf6',
      headerText: '#ffffff',
      accentColor: '#8b5cf6',
      bodyBg: '#ffffff',
      bodyText: '#1e1b4b',
      mutedText: '#6b7280',
      borderColor: '#e9d5ff',
      tableHeaderBg: '#8b5cf6',
      tableHeaderText: '#ffffff',
      totalsBg: '#faf5ff',
      paymentBg: '#faf5ff',
      paymentBorder: '#8b5cf6',
      fontFamily: 'Georgia, "Times New Roman", serif',
    },
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Strong & impactful',
    preview: 'High contrast with bold typography',
    styles: {
      headerBg: '#f59e0b',
      headerText: '#000000',
      accentColor: '#f59e0b',
      bodyBg: '#ffffff',
      bodyText: '#000000',
      mutedText: '#555555',
      borderColor: '#fed7aa',
      tableHeaderBg: '#f59e0b',
      tableHeaderText: '#000000',
      totalsBg: '#fffbeb',
      paymentBg: '#fffbeb',
      paymentBorder: '#f59e0b',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    },
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    description: 'Fresh & organic',
    preview: 'Earthy tones with natural feel',
    styles: {
      headerBg: '#22c55e',
      headerText: '#ffffff',
      accentColor: '#22c55e',
      bodyBg: '#ffffff',
      bodyText: '#14532d',
      mutedText: '#4b5563',
      borderColor: '#bbf7d0',
      tableHeaderBg: '#22c55e',
      tableHeaderText: '#ffffff',
      totalsBg: '#f0fdf4',
      paymentBg: '#f0fdf4',
      paymentBorder: '#22c55e',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Sleek & premium',
    preview: 'Dark mode for modern professionals',
    styles: {
      headerBg: '#1e293b',
      headerText: '#f8fafc',
      accentColor: '#e5e7eb',
      bodyBg: '#0f172a',
      bodyText: '#e2e8f0',
      mutedText: '#94a3b8',
      borderColor: '#334155',
      tableHeaderBg: '#1e293b',
      tableHeaderText: '#f8fafc',
      totalsBg: '#1e293b',
      paymentBg: '#1e293b',
      paymentBorder: '#475569',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },
  // Legacy templates for backward compatibility
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional professional layout',
    preview: 'Timeless design with serif fonts',
    styles: {
      headerBg: '#ffffff',
      headerText: '#000000',
      accentColor: '#2c3e50',
      bodyBg: '#ffffff',
      bodyText: '#2c3e50',
      mutedText: '#7f8c8d',
      borderColor: '#bdc3c7',
      tableHeaderBg: '#2c3e50',
      tableHeaderText: '#ffffff',
      totalsBg: '#ecf0f1',
      paymentBg: '#f9f9f9',
      paymentBorder: '#2c3e50',
      fontFamily: 'Georgia, "Times New Roman", serif',
    },
  },
  blue: {
    id: 'blue',
    name: 'Corporate Blue',
    description: 'Professional corporate style',
    preview: 'Blue accents for business invoices',
    styles: {
      headerBg: '#ffffff',
      headerText: '#1e3a5f',
      accentColor: '#2563eb',
      bodyBg: '#ffffff',
      bodyText: '#1e3a5f',
      mutedText: '#64748b',
      borderColor: '#e2e8f0',
      tableHeaderBg: '#1e3a5f',
      tableHeaderText: '#ffffff',
      totalsBg: '#eff6ff',
      paymentBg: '#f8fafc',
      paymentBorder: '#2563eb',
      fontFamily: '"Inter", -apple-system, sans-serif',
    },
  },
}

export const DEFAULT_TEMPLATE = 'minimal'

export const getTemplate = (templateId) => {
  return INVOICE_TEMPLATES[templateId] || INVOICE_TEMPLATES[DEFAULT_TEMPLATE]
}

export const getTemplateStyles = (templateId, customAccentColor = null) => {
  const template = getTemplate(templateId)
  let styles = { ...template.styles }

  // Apply custom accent color if provided
  if (customAccentColor) {
    styles = {
      ...styles,
      accentColor: customAccentColor,
      tableHeaderBg: customAccentColor,
      paymentBorder: customAccentColor,
    }
  }

  // Apply custom branding overrides if enabled (legacy support)
  if (typeof window !== 'undefined') {
    try {
      const customBranding = JSON.parse(localStorage.getItem('custom_branding') || '{}')
      if (customBranding.enabled) {
        styles = {
          ...styles,
          accentColor: customBranding.accentColor || styles.accentColor,
          tableHeaderBg: customBranding.tableHeaderBg || styles.tableHeaderBg,
          tableHeaderText: customBranding.tableHeaderText || styles.tableHeaderText,
          paymentBorder: customBranding.paymentBorder || styles.paymentBorder,
          fontFamily: customBranding.fontFamily || styles.fontFamily,
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  return styles
}
