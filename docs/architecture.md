# Architecture

## Routes

```
/              → New Invoice (landing page)
/invoice/:id   → Edit existing invoice
/expense/new   → New Expense Report
/expense/:id   → Edit existing expense report
/documents     → Document list grouped by month
/settings      → Profile, invoicing, clients, recurring expenses, branding
```

## Project structure

```
app/src/
├── components/
│   ├── ui/              → Reusable UI (Button, Input, Toast, StatusBadge)
│   ├── Layout.jsx       → Top nav bar
│   ├── InvoicePreview   → Live invoice preview (sidebar + print HTML)
│   ├── ExpensePreview   → Live expense preview (sidebar + print HTML)
│   └── SignatureCanvas  → Drawable signature pad
├── hooks/
│   ├── useInvoices      → Invoice CRUD (localStorage)
│   ├── useExpenses      → Expense report CRUD (localStorage)
│   ├── useProfiles      → Profiles, clients, saved items (localStorage)
│   └── useTheme         → Light/dark mode toggle
├── lib/
│   ├── pdfExport        → Text-based PDF generation (jsPDF)
│   ├── emailInvoice     → mailto: link builder
│   ├── invoiceNumber    → Auto-incrementing number generation
│   └── invoiceTemplates → Template styles and colors
└── pages/
    ├── InvoiceForm      → Split-layout invoice editor
    ├── ExpenseForm      → Split-layout expense editor
    ├── Documents        → Document list grouped by month
    └── Settings         → Multi-tab settings page
```

## Data storage

All data is in the browser's localStorage. No server, no database.

### localStorage keys

| Key | What it stores |
|-----|---------------|
| `invoice_builder_invoices` | All invoices |
| `invoice_builder_expenses` | All expense reports |
| `invoice_builder_profiles` | Sender profiles (name, address, payment details) |
| `invoice_builder_clients` | Saved clients |
| `invoice_builder_line_items` | Saved line item templates |
| `invoice_builder_saved_expenses` | Recurring expense templates |
| `default_currency` | Default currency code |
| `default_vat_rate` | Default VAT percentage |
| `default_payment_terms` | Payment terms in days |
| `invoice_number_format` | Invoice numbering format |
| `custom_branding` | Custom colors/fonts |
| `theme` | `light` or `dark` |

## PDF export

PDFs are generated using **jsPDF** with native text/line/rect rendering. This means:

- Text in PDFs is selectable and copyable
- No html2canvas or screenshot-based approach
- Expense report attachments (receipt images) are appended as separate pages
- Invoice logos and signatures are embedded as images

## Key conventions

- **snake_case** in localStorage, **camelCase** in React state
- Notifications use `useToast()`, never `alert()`
- Default profile auto-loads into new documents
- Preview sidebar is visual only. PDF export builds directly from data
