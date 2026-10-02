# Finance Tracker — FinTrack Pro

💸 Full-stack personal finance tracker built as **one Next.js + TypeScript application**.
The UI and the REST API live in the same project: API endpoints are Next.js Route
Handlers under `src/app/api`, so there is no separate backend server to run or deploy.

Users can register, log in securely, record income/expenses, manage categories, and
view a monthly summary (total income, total expenses, net balance).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict, no JavaScript source) |
| UI | React 19, Tailwind CSS v4, shadcn/ui + Base UI |
| Server state | TanStack React Query |
| Client auth state | Zustand (persist) |
| Database | MongoDB + Mongoose (cached connection) |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| Validation | Zod |
| HTTP client | Axios |
| Security | Security headers (Next config) + in-memory rate limiting (Proxy) |
| Icons / Toasts | lucide-react / Sonner |

## Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── (auth)/            # Public pages: login, register
│   │   ├── (dashboard)/       # Protected pages: dashboard, transactions, categories, settings
│   │   ├── api/               # REST API (Route Handlers — the "backend")
│   │   │   ├── auth/          # register, login, me
│   │   │   ├── categories/    # list, create, delete
│   │   │   ├── transactions/  # list, create, delete, summary
│   │   │   └── docs/          # OpenAPI JSON
│   │   ├── layout.tsx
│   │   ├── providers.tsx
│   │   └── globals.css
│   ├── components/            # UI components (Auth, dashboard, layout, ui primitives)
│   ├── hooks/                 # useHasMounted
│   ├── lib/
│   │   ├── api/               # Axios client + auth store
│   │   ├── server/            # Server-only code: db, models, auth, validators, errors, seed
│   │   └── utils.ts
│   ├── proxy.ts               # Rate limiting in front of /api/*
│   └── types/                 # Shared TypeScript types
├── public/
├── next.config.ts             # Security headers
├── postcss.config.mjs
├── eslint.config.mjs
└── tsconfig.json
```

## Getting Started

```bash
npm install
```

Create `.env` in the project root:

```env
MONGO_URI=mongodb://localhost:27017/finance_tracker
JWT_SECRET=change_me_to_a_long_random_secret
NODE_ENV=development
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000. The API is served from the same origin at `/api`.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |

## API Endpoints

All endpoints are Next.js Route Handlers under `src/app/api`. Interactive docs
(OpenAPI spec) are available at `GET /api/docs`.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api` | Welcome / health message | No |
| POST | `/api/auth/register` | Create a new user | No |
| POST | `/api/auth/login` | Log in and receive a JWT | No |
| GET | `/api/auth/me` | Get the current user profile | Yes |
| POST | `/api/categories` | Create a custom category | Yes |
| GET | `/api/categories` | List predefined + custom categories | Yes |
| DELETE | `/api/categories/:id` | Delete a custom category | Yes |
| POST | `/api/transactions` | Create income/expense | Yes |
| GET | `/api/transactions` | List transactions | Yes |
| GET | `/api/transactions/summary` | Monthly income/expense/net summary | Yes |
| DELETE | `/api/transactions/:id` | Delete a transaction | Yes |

Protected routes expect an `Authorization: Bearer <token>` header.

## Features

- **Auth** — register/login, hashed passwords (bcrypt), 30-day JWT, protected routes.
- **Dashboard** — balance/income/expense stat cards, 6-month chart, recent transactions.
- **Transactions** — create, search, filter by type, delete.
- **Categories** — seeded defaults, custom categories per user, safe deletion.
- **Security** — Zod validation on every write, security headers, rate limiting, duplicate-key handling.
- **UX** — responsive layout, toasts, skeletons/loading states, session persistence, protected route guards.
