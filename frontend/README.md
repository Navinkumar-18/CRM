# Zuna CRM Frontend

React + Vite frontend for the Zuna CRM application. Built with Tailwind CSS, React Router, React Hook Form, and Zustand for state management.

## Prerequisites

- Node.js 22+
- Running instance of the Zuna CRM backend

## Quick Start

```bash
# 1. Install dependencies
npm ci

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Start development server
npm run dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Vite |
| `npm run build` | Compile TypeScript and build for production |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Lint source files with ESLint |

## Environment Variables

See `.env.example`. The app requires:
- `VITE_API_URL` (default: `http://localhost:3001/api`)

## Project Structure

```
src/
├── api/           # Axios instance and API utilities
├── assets/        # Static assets (images, fonts, global css)
├── components/    # Reusable UI components (buttons, modals, layout)
├── pages/         # Page-level components matching routes
├── services/      # Data fetching services (React Query / Zustand)
├── store/         # Zustand state stores
├── types/         # TypeScript interfaces and types
├── App.tsx        # Application root and router
└── main.tsx       # Entry point
```
