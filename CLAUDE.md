# Invoice Builder

A personal invoice and expense report generator tool. Pure localStorage, no auth/Supabase. Branded with Raiku color palette (`#4d65ff`).

## Current State

- **Branch**: main
- **Last updated**: 2026-03-21

## Architecture

Stripped-down personal tool: open app → blank invoice form ready to go.

### UX Design
- **Split layout** on desktop: form on left, live A4 preview on right (always visible)
- Mobile: form only, offscreen PDF render for export
- Sticky action bar: Save, PDF, Print, Email always accessible
- Document type presets in action bar: Salary, Office & IT, General & Admin, Travel & Events — auto-generates typed invoice number (e.g. `SAL-2026-01`)
- Flat form structure: From/To cards side by side, line items table (with comment/details sub-field), payment details card with Bank/Crypto toggle
- **Payment toggle**: Bank mode (Beneficiary, IBAN, BIC, Intermediary BIC) or Crypto mode (ETH Address ERC-20, Network)
- **Data backup**: Settings > Data tab — JSON export/import of all localStorage data
- Saved line items: save common services in Settings > Items, load into invoices via "Load saved..." dropdown
- Optional sections (expenses, notes, signature, style) collapsed by default
- Client picker dropdown + "Save client for next time" inline prompt
- Profile switcher (if multiple profiles) + "Save as default profile" prompt
- Recurring expense templates: save in Settings, load into expense forms via dropdown

### Routing
```
/              → New Invoice (default landing)
/invoice/:id   → Edit existing invoice
/expense/new   → New Expense Report
/expense/:id   → Edit existing expense report
/documents     → List of all invoices + expenses
/settings      → Profile, invoicing, clients, recurring expenses, branding
```

### Layout
Minimal top nav: `Invoice Builder [+ Invoice] [+ Expense] | Documents | Settings | ☀/🌙`

## Project Structure

```
app/src/
├── components/ui/       # Reusable UI (Button, Input, Toast, EmptyState, StatusBadge)
├── components/          # Layout, InvoicePreview, ExpensePreview, SignatureCanvas
├── hooks/               # useInvoices, useProfiles (clients + saved expenses), useExpenses, useTheme
├── lib/                 # pdfExport, emailInvoice, invoiceNumber, invoiceTemplates
├── pages/               # InvoiceForm, ExpenseForm, Documents, Settings
├── index.css            # Tailwind v4 config with custom brand color palette
```

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS v4 (custom `brand` color palette: `#4d65ff` Raiku blue)
- React Router v7
- Lucide React icons
- Framer Motion (animations)
- jsPDF + html2canvas (PDF export, JPEG format for compatibility)

## Development Commands

```bash
cd app
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build
npm run lint     # ESLint
```

Node/npm path: `/usr/local/bin` (node v24.12.0, npm 11.6.2)

## Branding

- **Brand color**: `#4d65ff` (Raiku blue) defined as custom Tailwind palette `brand-50` through `brand-900` in `index.css`
- **Logo**: `public/logo.svg` — blue gradient rounded square with document icon
- **Favicon**: SVG + PNG fallback (`favicon-32.png`)
- **Document accent**: Default `#4d65ff`, customizable per document via color picker
- All UI accents use `brand-*` Tailwind classes (buttons, active states, labels, links)

## Key Patterns

- All data stored in localStorage (no Supabase, no auth)
- `snake_case` in storage, `camelCase` in React state — both handled in load/save
- `useToast()` from `components/ui` for notifications — never use `alert()`
- Default profile auto-loads into new invoices/expenses
- Invoice number generation: `lib/invoiceNumber.js` reads format from localStorage settings
- Default settings (currency, VAT, payment terms) stored in localStorage
- `accent_color` field must be saved/loaded in document data
- PDF export uses a single offscreen div (`fixed -left-[9999px]`, width `210mm`) — never `display:none` (breaks html2canvas)
- Line items have `description` + `comment` fields (comment = smaller detail text)

## Data Model

### localStorage Keys
- `invoice_builder_profiles` — Sender profiles (name, address, email, tax ID, payment details)
- `invoice_builder_clients` — Saved clients (name, address, email, tax ID, default VAT %)
- `invoice_builder_saved_expenses` — Recurring expense templates (description, category, amount)
- `invoice_builder_invoices` — Invoice documents
- `invoice_builder_expenses` — Expense report documents
- `invoice_builder_line_items` — Saved line item templates
- `default_currency`, `default_vat_rate`, `default_payment_terms` — Defaults
- `invoice_number_format`, `invoice_custom_prefix`, `invoice_starting_number` — Number format
- `custom_branding` — Custom colors/fonts for PDF output
- `theme` — `light` or `dark`

### Document Type Presets
| Type | Prefix | Example Number | Category |
|------|--------|----------------|----------|
| Salary | `SAL` | SAL-2026-01 | — |
| Office & IT | `OFF` | OFF-2026-01 | Office |
| General & Admin | `GA` | GA-2026-01 | Other |
| Travel & Events | `TE` | TE-2026-01 | Travel |

Numbers auto-increment per prefix by scanning existing invoices (e.g. if `SAL-2026-01` exists, next is `SAL-2026-02`).

## Settings Tabs

1. **My Profile** — Payment details (beneficiary, IBAN, BIC, intermediary BIC) + identity (name, email, address, tax ID)
2. **Invoicing** — Invoice number format, starting number, default currency/VAT/payment terms
3. **Items** — Saved line item templates (description, comment, qty, price, VAT) for quick loading into invoices
4. **Clients** — Add/edit/delete clients (name, email, address, tax ID, default VAT %). Loading a client applies their VAT rate to all line items.
5. **Recurring** — Saved expense templates (description, category, amount) for quick loading
6. **Branding** — Custom colors (accent, table header, payment border) + font override

## Key Decisions

- Invoice numbers use `lib/invoiceNumber.js` which reads format from localStorage settings; `generateTypedInvoiceNumber(prefix, invoices)` for document-type-specific numbering
- Apple system font (SF Pro) used across all invoice/expense templates
- Due date auto-calculation only updates if the previous value was also auto-calculated
- Sender info auto-loaded from first saved profile; shown in From card with profile switcher
- Expense report categories: Travel, Software, Hardware, Office, Meals, Communication, Professional Services, Other
- PDF export uses html2canvas to render generatePrintHTML into an offscreen div, then JPEG (0.95) into jsPDF
- The html2canvas approach renders in a div (NOT iframe — iframes don't capture properly)
- Preview and PDF template share the same design: accent blue labels, gray table headers, no monospace, flexbox bottom-pinned payment/footer
- Payment details section supports Bank (beneficiary/IBAN/BIC) or Crypto (ETH ERC-20 address) via `paymentMethod` field
- Profile fields auto-load into initial useState (not just useEffect) to avoid timing issues
- ETH Address field stored as `eth_address` in localStorage, `ethAddress` in React state

## Known Issues (2026-03-21)

- **PDF export bottom section**: Payment details and footer not rendering in exported PDF — html2canvas may not be capturing the full height of the flexbox layout. Needs investigation: the offscreen div approach may need explicit height on the content wrapper, or switch to browser print-to-PDF instead.
- **Date font mismatch**: The date values in the preview/PDF should use the same font style as other text (currently may render differently)
- **Reference PDF**: `/Users/arnaud/Documents/Raiku/Invoices/January/INV-001.pdf` is the gold standard design to match

## Notes

- ESLint: 9 remaining `react-refresh/only-export-components` errors are expected (Provider+hook export pattern)
- Bundle is code-split: pages lazy-loaded via React.lazy, vendors split (pdf, motion, router)
- Main chunk: ~200 KB, PDF vendor chunk: ~587 KB (loaded on demand)
- The `overflow-auto` must NOT be on `<main>` in Layout — it creates a separate scroll context that breaks sticky positioning inside child pages
