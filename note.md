# Finance Tracker — Project Notes

## What This Project Does

Finance Tracker ("FinTrack Pro") is a full-stack personal finance management app.
Users can register, log in securely, and track their personal income and expenses
through a dashboard. It records every financial transaction, organizes them by
income/expense categories, and produces a monthly summary showing total income,
total expenses, and net balance (what is left).

The project is **one Next.js + TypeScript application**: the React UI and the REST
API live in the same folder. The API is implemented as Next.js Route Handlers under
`src/app/api` (no separate Express backend, no second `package.json`).

---

## Features

### Authentication & Security
- User registration (`username`, `email`, `password`) with password hashing via bcrypt.
- Login returns a JSON Web Token (JWT).
- JWT-protected routes; the token is attached to API requests as a Bearer token.
- Session verification (`/api/auth/me`) on protected pages — invalid/expired sessions
  are cleared and redirected to login.
- Security headers (X-Frame-Options, HSTS, nosniff, Permissions-Policy, etc.) applied
  globally in `next.config.ts`.
- In-memory rate limiting (100 requests / 15 minutes per IP) in `src/proxy.ts` in
  front of all `/api/*` routes.
- Zod validation on every write, with Mongoose duplicate-key and cast-error handling.

### Dashboard
- Monthly summary cards: Total Balance, Total Income, Total Expenses.
- Recent transactions list (latest 5) with delete action.
- Monthly spending bar chart: income vs expenses over the last 6 months, computed
  from real transaction data.
- Add Transaction modal accessible from sidebar and dashboard.

### Transactions
- Create income or expense transactions (amount, category, description, date).
- List all transactions with search (description/category) and type filter
  (All / Income / Expenses).
- Delete a single transaction.
- Amounts displayed in green (income) or red/neutral (expense).

### Categories
- Seeded default categories available to every user.
- Create custom categories for income or expense.
- Delete only custom categories (default categories are protected on the backend).
- Categories are grouped into Income and Expense columns.

### Settings & UX
- Account profile card (username, email, role).
- Security status and database connection info panels.
- Fully responsive layout with collapsible mobile sidebar.
- Toast notifications for success/error feedback.
- Loading states and skeleton/spinner handling for API calls.
- Protected routes redirect unauthenticated users to `/login`;
  public routes redirect logged-in users to `/dashboard`.
- Session persistence via `localStorage` (zustand persist, `auth-storage`).

---

## Tech Stack

### Application (single project)
| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | UI framework, routing, API Route Handlers, build tooling |
| React 19 | UI library |
| TypeScript (strict) | Type-safe code across UI and API |
| Tailwind CSS v4 | Styling (via `@tailwindcss/postcss`) |
| shadcn/ui + Base UI | UI primitives (button, input, dialog, card, checkbox, label) |
| TanStack React Query | Server state, caching, mutations, devtools |
| Zustand (persist) | Client auth state |
| Axios | HTTP client with auth interceptor |
| lucide-react | Icons |
| Sonner | Toast notifications |
| next-themes | Theme support for the toaster |
| Geist Variable (`@fontsource-variable/geist`) | Typography |
| ESLint (`eslint-config-next`) | Linting |

### API layer (server-only, `src/lib/server`)
| Technology | Purpose |
|---|---|
| Next.js Route Handlers | REST API (same origin, `/api/*`) |
| MongoDB + Mongoose | Database and data modeling (User, Category, Transaction) |
| JSON Web Token (JWT) | Authentication and route protection |
| bcryptjs | Password hashing |
| Zod | Request/data validation |
| `src/proxy.ts` | Rate limiting in front of `/api/*` |

---

## Project Structure

```
.
├── next.config.ts            # Security headers + server external packages
├── postcss.config.mjs
├── eslint.config.mjs
├── tsconfig.json
├── public/
└── src/
    ├── app/                  # Next.js App Router
    │   ├── layout.tsx        # Root layout + metadata
    │   ├── providers.tsx     # React Query + Toaster providers
    │   ├── globals.css       # Tailwind v4 + shadcn theme tokens
    │   ├── page.tsx          # "/" -> /dashboard
    │   ├── not-found.tsx     # unknown route -> /dashboard
    │   ├── (auth)/           # Public routes
    │   │   ├── layout.tsx    # PublicRoute guard
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── (dashboard)/      # Protected routes
    │   │   ├── layout.tsx    # DashboardProtec guard
    │   │   ├── dashboard/page.tsx
    │   │   ├── transactions/page.tsx
    │   │   ├── categories/page.tsx
    │   │   └── settings/page.tsx
    │   └── api/              # REST API (Route Handlers)
    │       ├── route.ts             # GET /api (welcome)
    │       ├── docs/route.ts        # GET /api/docs (OpenAPI JSON)
    │       ├── auth/
    │       │   ├── register/route.ts
    │       │   ├── login/route.ts
    │       │   └── me/route.ts
    │       ├── categories/
    │       │   ├── route.ts         # GET, POST
    │       │   └── [id]/route.ts    # DELETE
    │       └── transactions/
    │           ├── route.ts         # GET, POST
    │           ├── summary/route.ts # GET
    │           └── [id]/route.ts    # DELETE
    ├── components/
    │   ├── ui/               # shadcn/Base UI primitives
    │   ├── Auth/             # LoginForm, RegisterForm
    │   ├── dashboard/        # StatCards, SpendingChart, RecentTransactions, AddTransactionModal
    │   ├── layout/           # DashboardShell, Sidebar, Header
    │   └── Routes/           # DashboardProtec, PublicRoute
    ├── hooks/                # useHasMounted (hydration-safe)
    ├── lib/
    │   ├── utils.ts          # cn()
    │   ├── api/
    │   │   ├── apiClient.ts  # Axios instance + Bearer token interceptor
    │   │   └── store/authStore.ts
    │   └── server/           # Server-only backend code
    │       ├── db.ts         # Cached Mongoose connection + seeding
    │       ├── auth.ts       # JWT sign/verify, authenticate()
    │       ├── errors.ts     # AppError + errorResponse()
    │       ├── seed.ts       # Default categories seeding
    │       ├── serialize.ts  # Strip password from user output
    │       ├── validators.ts # Zod schemas
    │       ├── openapi.ts    # OpenAPI document
    │       └── models/       # User, Category, Transaction
    ├── proxy.ts              # Rate limiting for /api/*
    └── types/                # User, Category, Transaction, Summary, AuthResponse
```

## Main API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create a new user | No |
| POST | `/api/auth/login` | Log in and receive a JWT | No |
| GET | `/api/auth/me` | Get the current user profile | Yes |
| POST | `/api/categories` | Create a category | Yes |
| GET | `/api/categories` | List categories | Yes |
| DELETE | `/api/categories/:id` | Delete a custom category | Yes |
| POST | `/api/transactions` | Create income/expense | Yes |
| GET | `/api/transactions` | List transactions | Yes |
| GET | `/api/transactions/summary` | Monthly income/expense/net summary | Yes |
| DELETE | `/api/transactions/:id` | Delete a transaction | Yes |
