// Invoice template configurations
export const INVOICE_TEMPLATES = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean design with accent colors',
    preview: 'Sleek, contemporary look with colored headers',
    styles: {
      headerBg: '#1a1a1a',
      headerText: '#ffffff',
      accentColor: '#1a1a1a',
      bodyBg: '#ffffff',
      bodyText: '#333333',
      mutedText: '#666666',
      borderColor: '#e5e5e5',
      tableHeaderBg: '#1a1a1a',
      tableHeaderText: '#ffffff',
      totalsBg: '#f5f5f5',
      paymentBg: '#f8f8f8',
      paymentBorder: '#1a1a1a',
      fontFamily: 'Arial, Helvetica, sans-serif',
    },
  },
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
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant',
    preview: 'Understated with lots of whitespace',
    styles: {
      headerBg: '#ffffff',
      headerText: '#111111',
      accentColor: '#111111',
      bodyBg: '#ffffff',
      bodyText: '#333333',
      mutedText: '#888888',
      borderColor: '#eeeeee',
      tableHeaderBg: '#fafafa',
      tableHeaderText: '#333333',
      totalsBg: '#fafafa',
      paymentBg: '#fafafa',
      paymentBorder: '#dddddd',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Strong visual impact',
    preview: 'High contrast with bold typography',
    styles: {
      headerBg: '#000000',
      headerText: '#ffffff',
      accentColor: '#ff6b35',
      bodyBg: '#ffffff',
      bodyText: '#000000',
      mutedText: '#555555',
      borderColor: '#000000',
      tableHeaderBg: '#000000',
      tableHeaderText: '#ffffff',
      totalsBg: '#fff3ee',
      paymentBg: '#f5f5f5',
      paymentBorder: '#ff6b35',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
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

export const DEFAULT_TEMPLATE = 'modern'

export const getTemplate = (templateId) => {
  return INVOICE_TEMPLATES[templateId] || INVOICE_TEMPLATES[DEFAULT_TEMPLATE]
}

export const getTemplateStyles = (templateId) => {
  const template = getTemplate(templateId)
  let styles = { ...template.styles }

  // Apply custom branding overrides if enabled
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
