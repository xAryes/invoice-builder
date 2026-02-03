# Invoice Builder

A simple invoice generator tool.

## Project Structure

- `/app` - Main React application

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth)
- React Router v7
- Lucide React icons

## Development Commands

```bash
cd app
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build
npm run lint     # ESLint
```

## Key Directories

```
app/src/
├── components/ui/   # Reusable UI components
├── components/      # Feature components
├── hooks/           # React hooks
├── lib/             # Utilities
├── pages/           # Route pages
```

## Environment Variables

Required in `/app/.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Demo Mode

The app runs in demo mode (localStorage) when Supabase is not configured.
