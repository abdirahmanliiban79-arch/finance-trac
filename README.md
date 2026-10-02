# Finance Tracker

Personal finance tracker built with [Next.js](https://nextjs.org) (App Router), React 19, TypeScript, and Tailwind CSS v4.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — run the production server
- `npm run lint` — run ESLint

## Environment Variables

Copy `.env.example` to `.env.local` to override the API base URL:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (defaults to the hosted API) |

## Project Structure

- `src/app` — App Router routes and layouts
- `src/components` — shared React components
- `src/lib` — utilities and API clients
- `public` — static assets

## Continuous Integration

`.github/workflows/ci.yml` runs type checking, linting, and a production build on every push and pull request to `main`.

