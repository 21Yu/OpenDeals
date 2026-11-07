# OpenDeals

OpenDeals is a personal shopping-deals project that lets users search Google Shopping results, compare prices, and save products to a personal list.

The project is structured as a monorepo:

- `frontend/`: React 19, TypeScript, Vite, Tailwind CSS, and React Router
- `backend/`: Express 5, TypeScript, PostgreSQL, JWT authentication, and the SerpApi Google Shopping integration

## Live Deployments

- Frontend: [https://open-deals.vercel.app](https://open-deals.vercel.app)
- Backend API: [https://open-deals-zhff.vercel.app](https://open-deals-zhff.vercel.app)

The frontend calls the backend at `/api`. Configure `VITE_API_BASE_URL` in the frontend deployment as `https://open-deals-zhff.vercel.app` (without a trailing `/api`), and configure the backend's `CORS_ORIGIN` as `https://open-deals.vercel.app`.

## Features

- Search & Filter: Search products via Google Shopping API with price range filters (`min_price`, `max_price`) and sorting.
- Authentication: Secure user registration and login using HTTP-only JWT cookies.
- Saved Items: Add, view, and remove saved products tied to user accounts.
- Responsive UI: Clean multi-page interface covering search, product lists, user profiles, and application info.

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL
- A [SerpApi](https://serpapi.com/) API key

## Setup

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd OpenDeals

cd backend
npm install

cd ../frontend
npm install
```

Create a backend/.env file:

```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/opendeals
JWT_SECRET=replace-with-a-long-random-secret
SERPAPI_KEY=your-serpapi-key
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=OpenDeals Alerts <alerts@your-verified-domain.com>
CRON_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
``` 

Create a PostgreSQL database and apply the schema:

```bash
psql "$DATABASE_URL" -f backend/src/migrations/schema.sql
```

The schema migration adds price history and notification fields to saved items. New saved items create an initial price-history baseline; existing items establish a baseline the first time the daily job checks them. Price drops are stored as in-app notifications, while saved-item analytics identify historic lows, 30-day average discounts, and drops recorded today.

## Daily Price Checks

The backend exposes `GET /api/cron/check-prices`. Requests require `Authorization: Bearer $CRON_SECRET`. The route checks up to 100 saved products per run through SerpApi and records successful price checks. `backend/vercel.json` schedules this endpoint daily at 03:00 UTC. Vercel adds the `Authorization: Bearer $CRON_SECRET` header automatically when `CRON_SECRET` is configured in the backend project.

To enable automated price analytics in production:

1. Set `CRON_SECRET`, `SERPAPI_KEY`, `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN` in the backend project for the Production environment.
2. Deploy the `backend/` directory as the backend Vercel project's Root Directory. The cron path is relative to that project: `https://open-deals-zhff.vercel.app/api/cron/check-prices`.

Test the endpoint manually with:

```bash
curl -i https://open-deals-zhff.vercel.app/api/cron/check-prices \\
    -H "Authorization: Bearer $CRON_SECRET"
```

## Local Development

Start the backend server:

```bash
cd backend
npm run dev
```

In a second terminal, start the frontend client:

```bash
cd frontend
npm run dev
```

Open the local URL printed by Vite. Locally, the frontend uses `/api` and Vite strips that prefix before proxying requests to Express on port `3001`; the frontend runs on port `3000`. `frontend/.env.development` keeps local requests on this proxy, while the base frontend environment can retain the deployed API URL. For separate deployments, set `VITE_API_BASE_URL` to the backend origin, with no `/api` suffix, and set `CORS_ORIGIN` to the frontend origin. For the live deployments above, these values are `https://open-deals-zhff.vercel.app` and `https://open-deals.vercel.app`, respectively.

## Testing & Quality Assurance

Run the complete local verification suite from the repository root:

```bash
cd backend && npm ci && npm test && npm run build
cd ../frontend && npm ci && npm test && npm run lint && npm run build
```

- Backend: Automated API tests covering health checks, shopping query validation, result mapping, user authentication, and cookie management.
- Frontend: Route smoke tests verifying page rendering across the application router and authentication provider.

## CI Pipeline

GitHub Actions runs the verification suite on pull requests and pushes to `main`:

- `ci.yml`: Uses Node.js 22 to install dependencies (`npm ci`), run tests, lint the frontend, and build both services.

### Deployment Architecture

The frontend and backend are deployed as separate Vercel projects. The frontend deployment uses the backend origin in `VITE_API_BASE_URL`; the backend deployment must allow the frontend origin through `CORS_ORIGIN` and provide its required secrets and database connection settings.

| Component | Hosting | Configuration |
| --- | --- | --- |
| Database | [Neon](https://neon.tech) | Managed PostgreSQL instance initialized with `schema.sql` |
| Backend API | [Vercel](https://open-deals-zhff.vercel.app) | Configure backend environment variables and `CORS_ORIGIN` |
| Frontend | [Vercel](https://open-deals.vercel.app) | Set `VITE_API_BASE_URL` to the backend origin, without `/api` |


## Available Scripts

### Backend(`backend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Express server with TypeScript watch mode |
| `npm run build` | Compile the backend to `dist/` |
| `npm start` | Run compiled production server |
| `npm test` | Run backend API tests |

### Frontend(`frontend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |
| `npm test` | Run frontend tests with Vitest |

## API Overview

The backend runs on port `3000` by default. API routes are mounted under `/api`.

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/` | Health check endpoint | No |
| `GET` | `/api/shopping?q=...` | Search products (supports `min_price`, `max_price`, and `sort_by`) | No |
| `POST` | `/api/users/register` | Create user account | No |
| `POST` | `/api/users/login` | Authenticate user and issue HTTP-only cookie | No |
| `POST` | `/api/users/logout` | Clear authentication cookie | No |
| `GET` | `/api/users/me` | Fetch authenticated profile | Yes |
| `POST` | `/api/users/add-item` | Save shopping item to user list | Yes |
| `GET` | `/api/users/allitems` | Retrieve user's saved items | Yes |
| `GET` | `/api/products/:id/history` | Retrieve a saved product's price history | Yes |
| `DELETE` | `/api/users/deleteitem/:id` | Remove item from saved list | Yes |
| `GET` | `/api/notifications` | Retrieve the user's notification feed and unread count | Yes |
| `PATCH` | `/api/notifications/:id/read` | Mark one notification as read | Yes |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications as read | Yes |
| `GET` | `/api/cron/check-prices` | Check saved-product prices and record snapshots (requires cron bearer token) | Yes |

## Project Structure

```text
OpenDeals/
├── backend/
│   └── src/
│       ├── db/             PostgreSQL connection pool
│       ├── middleware/     JWT authentication middleware
│       ├── migrations/     Database schema
│       ├── routes/         Shopping and user endpoints
│       └── tests/          Backend API tests
└── frontend/
    └── src/
        ├── components/     Shared UI components and forms
        ├── context/        Authentication context and provider
        ├── pages/          Application pages
        ├── services/       Frontend API client
        └── models/         Shared frontend types
```

