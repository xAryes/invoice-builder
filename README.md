# Invoice Builder

A lightweight, privacy-first invoice and expense report generator. Runs entirely in your browser with localStorage -- no server, no accounts, no data leaves your machine.

Built with React 19, Vite 7, and Tailwind CSS v4.

## Features

- **Invoices** -- Split-layout editor with live A4 preview, line items with comments, VAT per line, expenses section
- **Expense Reports** -- Categorized expenses (Travel, Office, Software, etc.) with date tracking and category summaries
- **Expense Attachments** -- Attach receipts (images or PDFs) to expense items; PDFs are auto-converted to images. Attachments appear as extra pages in the preview, print output, and exported PDF
- **PDF Export** -- One-click PDF generation (JPEG-based for maximum compatibility)
- **Print** -- Clean print-optimized HTML output
- **Email** -- Open your email client with the invoice pre-attached
- **Document Types** -- Preset buttons for quick numbering:
  - Salary: Staff Costs &rarr; `INV-001`
  - Office: IT & Equipment &rarr; `EXP-INV-001-OFF`
  - General & Administrative &rarr; `EXP-INV-001-GA`
  - Travel & Events &rarr; `EXP-INV-001-TE`
- **Client Management** -- Save clients with default VAT rates, load them into any document
- **Saved Line Items** -- Store common services in Settings, load into invoices with one click
- **Recurring Expenses** -- Save expense templates for repeated monthly entries
- **Multiple Profiles** -- Switch between sender identities (freelancer, company, etc.)
- **Branding** -- Custom accent colors per document, global brand color settings
- **Dark Mode** -- Full dark/light theme support
- **Signature** -- Draw or upload a signature, embedded in documents

## Getting Started

### 1. Install Node.js (one-time setup)

You need Node.js to run this app. If you don't have it yet:

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version (the big green button)
3. Run the installer and follow the prompts (all defaults are fine)
4. To verify it worked, open a terminal and type:
   ```bash
   node --version
   ```
   You should see something like `v20.x.x` or higher.

### 2. Download and run the app

Open a terminal (Terminal on Mac, Command Prompt or PowerShell on Windows) and run these commands one at a time:

```bash
# Download the project
git clone https://github.com/xAryes/invoice-builder.git

# Go into the project folder
cd invoice-builder/app

# Install dependencies (takes about 30 seconds)
npm install

# Start the app
npm run dev
```

### 3. Open it

Once you see `Local: http://localhost:5173/` in your terminal, open that link in your browser. That's it -- the app is running.

To stop the app, press `Ctrl + C` in the terminal.

> **No git?** You can also download the project as a ZIP from the green "Code" button on GitHub, unzip it, then start from the `cd` step above.

## Usage

### Creating an Invoice

1. Open the app -- you land on a blank invoice form
2. Click **Salary: Staff Costs** in the action bar to auto-generate an `INV-XXX` number
3. Fill in your details (or save a profile in Settings to auto-populate)
4. Add line items with description, quantity, price, and VAT %
5. Click **Save**, then **PDF** or **Print** to export

### Creating an Expense Report

1. Click **+ Expense** in the top nav
2. Pick a type: **Office**, **General & Admin**, or **Travel & Events**
3. The report number auto-links to your latest invoice (e.g. `EXP-INV-001-OFF`)
4. Add expense rows with date, description, category, and amount
5. Export as PDF or print

### Settings

Access via the **Settings** link in the nav bar:

| Tab | What it does |
|-----|-------------|
| **My Profile** | Your name, address, email, tax ID, and payment details (IBAN, BIC) |
| **Invoicing** | Invoice number format, starting number, default currency/VAT/payment terms |
| **Items** | Saved line item templates for quick loading |
| **Clients** | Client directory with default VAT rates |
| **Recurring** | Saved expense templates |
| **Branding** | Custom accent colors and font overrides for PDF output |

## Build for Production

```bash
cd app
npm run build
```

Output goes to `app/dist/`. Serve it with any static file server:

```bash
npm run preview
```

Or deploy the `dist/` folder to Netlify, Vercel, GitHub Pages, or any static host.

## Project Structure

```
app/
  src/
    components/      # Layout, InvoicePreview, ExpensePreview, SignatureCanvas
    components/ui/   # Button, Input, Toast, EmptyState, StatusBadge
    hooks/           # useInvoices, useProfiles, useExpenses, useTheme
    lib/             # pdfExport, emailInvoice, invoiceNumber, invoiceTemplates
    pages/           # InvoiceForm, ExpenseForm, Documents, Settings
    index.css        # Tailwind v4 config with brand color palette
  public/
    logo.svg         # App logo
```

## Data Storage

All data is stored in your browser's localStorage. Nothing is sent to any server.

| Key | Contents |
|-----|----------|
| `invoice_builder_profiles` | Sender profiles |
| `invoice_builder_clients` | Saved clients |
| `invoice_builder_invoices` | Invoice documents |
| `invoice_builder_expenses` | Expense report documents |
| `invoice_builder_line_items` | Saved line item templates |
| `invoice_builder_saved_expenses` | Recurring expense templates |

To back up your data, export it from your browser's DevTools (`Application` > `Local Storage`).

## Tech Stack

- [React 19](https://react.dev/) -- UI framework
- [Vite 7](https://vite.dev/) -- Build tool
- [Tailwind CSS v4](https://tailwindcss.com/) -- Styling
- [React Router v7](https://reactrouter.com/) -- Client-side routing
- [Framer Motion](https://motion.dev/) -- Animations
- [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/) -- PDF export
- [PDF.js](https://mozilla.github.io/pdf.js/) -- PDF attachment rendering (lazy-loaded)
- [Lucide React](https://lucide.dev/) -- Icons

## License

MIT -- see [LICENSE](LICENSE) for details.
