# Invoice Builder

A simple tool to create invoices and expense reports. No login, no cloud, everything runs in your browser.

## What it does

- Create **invoices** and **expense reports** with a live preview
- Export clean, text-selectable **PDFs**
- Save your **profile**, **clients**, and **recurring expenses** so you don't retype anything
- All documents organized **by month** in the Documents page
- Multiple **templates** and accent colors

## Quick start

### 1. Install Node.js

You need Node.js (version 18 or higher). If you don't have it:

- **Mac**: Download from [nodejs.org](https://nodejs.org/) or run `brew install node` if you have Homebrew
- **Windows**: Download from [nodejs.org](https://nodejs.org/) and run the installer
- **Linux**: `sudo apt install nodejs npm` (Ubuntu/Debian) or check [nodejs.org](https://nodejs.org/)

To check if it's installed, open a terminal and type:

```
node --version
```

You should see something like `v18.0.0` or higher. If you see an error, Node isn't installed yet.

### 2. Download the project

```
git clone <your-repo-url>
cd Invoice-Builder
```

Or just download the ZIP from GitHub and unzip it.

### 3. Install dependencies

```
cd app
npm install
```

This will take a minute. It downloads everything the app needs.

### 4. Start the app

```
npm run dev
```

You'll see something like:

```
  VITE v7.3.1  ready in 300ms

  Local:   http://localhost:5173/
```

Open that URL in your browser. That's it!

## First time setup

1. Open the app
2. Go to **Settings** (top right)
3. Fill in the **My Profile** tab: your name, address, email, payment details (IBAN, BIC, etc.)
4. Save it
5. Go back and create your first invoice or expense report

Your profile will auto-fill into every new document from now on.

## How to use it

### Creating an invoice

1. Click **+ Invoice** in the top nav (or go to `/`)
2. Fill in the form on the left. The preview on the right updates live
3. Click **Save** to keep it, or **PDF** to export it directly

### Creating an expense report

1. Click **+ Expense** in the top nav
2. Add your expenses (date, description, category, amount)
3. Attach receipts by clicking the paperclip icon on any row
4. Export as PDF. Receipts show up as extra pages

### Finding your documents

Go to **Documents** in the top nav. Everything is grouped by month with totals.

## Where is my data stored?

Everything lives in your browser's **localStorage**. That means:

- Your data stays on your computer
- Nothing is sent to any server
- If you clear your browser data, it's gone
- Different browsers = different data

## Building for production

If you want to deploy it somewhere (a company server, Vercel, Netlify, etc.):

```
cd app
npm run build
```

This creates a `dist/` folder with static files. Upload those anywhere that serves HTML.

## Tech stack (for the curious)

- React 19 + Vite 7
- Tailwind CSS v4
- jsPDF (PDF generation)
- Everything client-side, no backend
