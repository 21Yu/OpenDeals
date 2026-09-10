# OpenDeals

OpenDeals is a personal shopping-deals project that lets users search Google Shopping results, compare prices, and save products to a personal list.

Live application: [https://20.80.58.48](https://20.80.58.48)

The project is structured as a monorepo:

- `frontend/`: React 19, TypeScript, Vite, Tailwind CSS, and React Router
- `backend/`: Express 5, TypeScript, PostgreSQL, JWT authentication, and the SerpApi Google Shopping integration

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
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/opendeals
JWT_SECRET=replace-with-a-long-random-secret
SERPAPI_KEY=your-serpapi-key
CORS_ORIGIN=http://localhost:3001
NODE_ENV=development
``` 

Create a PostgreSQL database and apply the schema:

```bash
psql "$DATABASE_URL" -f backend/src/migrations/schema.sql
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

Open the local URL printed by Vite. The frontend proxies `/api` requests to the backend, so no frontend API URL is required for local development.

## Testing & Quality Assurance

Run the complete local verification suite from the repository root:

```bash
cd backend && npm ci && npm test && npm run build
cd ../frontend && npm ci && npm test && npm run lint && npm run build
```

- Backend: Automated API tests covering health checks, shopping query validation, result mapping, user authentication, and cookie management.
- Frontend: Route smoke tests verifying page rendering across the application router and authentication provider.

## CI/CD Pipeline

GitHub Actions is configured in `.github/workflows/`:

- `ci.yml`: Triggers on pull requests and pushes to main. Uses Node.js 22 to install dependencies (npm ci), run tests, check linting, and compile production builds for both services.
- `deploy.yml`: Runs automated verification before triggering deployments on pushes to main or manual invocations (workflow_dispatch).

### Deployment Architecture

| Component | Azure service | Deployment method |
| --- | --- | --- |
| Database | Azure Database for PostgreSQL | Managed instance initialized with `schema.sql` |
| Backend API | Azure Container Apps | Docker image built from `backend/Dockerfile`, pushed to Azure Container Registry (ACR), deployed via commit SHA tag |
| Frontend | Azure Linux VM | Vite static production build deployed to `/var/www/html` and served via Nginx over SSH |


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

The backend runs on port `3000` by default.

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/` | Health check endpoint | No |
| `GET` | `/shopping?q=...` | Search products (`supports min_price`, `max_price`, `sort_by`) | No |
| `POST` | `/users/register` | Create user account | No |
| `POST` | `/users/login` | Authenticate user and issue HTTP-only cookie | No |
| `POST` | `/users/logout` | Clear authentication cookie | No |
| `GET` | `/users/me` | Fetch authenticated profile | Yes |
| `POST` | `/users/add-item` | Save shopping item to user list | Yes |
| `GET` | `/users/allitems` | Retrieve user's saved items | Yes |
| `DELETE` | `/users/deleteitem/:id` | Remove item from saved list | Yes |

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

