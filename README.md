# DevTools Portal

A full-stack Developer Tools Landing Page — a curated, categorized collection of developer resources with an admin dashboard for content management.

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend   │─────▶│   Backend   │─────▶│   MongoDB   │
│  React/Vite  │ HTTP │ Express/TS  │      │             │
│   (nginx)    │◀─────│  REST API   │◀─────│             │
│   :80        │      │   :4000     │      │   :27017    │
└─────────────┘      └─────────────┘      └─────────────┘
```

**Frontend**: React 19 + TypeScript + Vite + Tailwind CSS, served by nginx in production.
**Backend**: Node.js + Express + TypeScript, with Zod validation and JWT auth.
**Database**: MongoDB with Mongoose ODM.

## Features

- **Public landing page** — links displayed as styled cards, grouped by category
- **Admin authentication** — JWT-based login for admin users
- **Admin dashboard** — full CRUD for managing links (create, edit, delete)
- **Responsive design** — works on mobile, tablet, and desktop
- **Seed data** — admin user and sample links created on first startup

## Project Structure

```
devtools-portal/
├── backend/
│   ├── src/
│   │   ├── config/        # Database connection, env validation, seed data
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/        # Mongoose schemas (User, Link)
│   │   ├── routes/        # Express route definitions
│   │   ├── types/         # TypeScript interfaces
│   │   ├── validators/    # Zod schemas
│   │   └── index.ts       # Server entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context (auth state)
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Route-level page components
│   │   ├── services/      # API client functions
│   │   ├── types/         # TypeScript interfaces
│   │   └── main.tsx       # App entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── tailwind.config.js
├── k8s/                   # Kubernetes manifests
├── .github/workflows/     # CI pipeline
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Docker)

### Local Development

1. **Clone and install:**

```bash
git clone <repo-url> && cd devtools-portal

# Backend
cd backend
cp .env.example .env    # Edit values as needed
npm install
npm run dev             # Starts on http://localhost:4000

# Frontend (in a separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev             # Starts on http://localhost:5173
```

2. **Open** http://localhost:5173 to see the landing page.
3. **Admin login** at http://localhost:5173/admin/login using the credentials from your `.env`.

### Docker Compose

```bash
# Start all services (MongoDB + backend + frontend)
docker-compose up --build

# Access the app at http://localhost
# API available at http://localhost:4000/api
```

Stop with `docker-compose down`. Add `-v` to also remove the MongoDB volume.

## Environment Variables

### Backend (`backend/.env`)

| Variable         | Description                     | Default                                      |
| ---------------- | ------------------------------- | -------------------------------------------- |
| `PORT`           | Server port                     | `4000`                                       |
| `MONGODB_URI`    | MongoDB connection string       | `mongodb://localhost:27017/devtools-portal`   |
| `JWT_SECRET`     | Secret key for signing JWTs     | *(required)*                                 |
| `ADMIN_EMAIL`    | Seeded admin email              | *(required)*                                 |
| `ADMIN_PASSWORD` | Seeded admin password           | *(required)*                                 |
| `CORS_ORIGIN`    | Allowed CORS origin             | `http://localhost:5173`                      |

### Frontend (`frontend/.env`)

| Variable       | Description            | Default                       |
| -------------- | ---------------------- | ----------------------------- |
| `VITE_API_URL` | Backend API base URL   | `http://localhost:4000/api`   |

## API Documentation

### Public Endpoints

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| GET    | `/api/health`      | Health check       |
| GET    | `/api/links`       | List all links     |
| GET    | `/api/links/:id`   | Get a single link  |

### Auth Endpoints

| Method | Endpoint           | Description        | Body                          |
| ------ | ------------------ | ------------------ | ----------------------------- |
| POST   | `/api/auth/login`  | Admin login        | `{ email, password }`         |

**Response:** `{ token, email }`

### Protected Endpoints (require `Authorization: Bearer <token>`)

| Method | Endpoint           | Description        | Body                                              |
| ------ | ------------------ | ------------------ | ------------------------------------------------- |
| POST   | `/api/links`       | Create a link      | `{ title, url, description?, icon?, category?, sortOrder? }` |
| PUT    | `/api/links/:id`   | Update a link      | Partial link fields                               |
| DELETE | `/api/links/:id`   | Delete a link      | —                                                 |

### Link Model

```json
{
  "_id": "ObjectId",
  "title": "string (required)",
  "url": "string (required, valid URL)",
  "description": "string (optional, max 500)",
  "icon": "string (optional — emoji or image URL)",
  "category": "string (optional)",
  "sortOrder": "number (default 0)",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

## Deployment

### Kubernetes

Apply the manifests in order:

```bash
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/mongodb.yml
kubectl apply -f k8s/backend.yml
kubectl apply -f k8s/frontend.yml
```

**Important:** Update the Secret values in `k8s/backend.yml` before deploying to production. Replace the container image references with your registry paths.

### CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR to `main`:

1. **Backend** — install, lint, build
2. **Frontend** — install, lint, build
3. **Docker** — build both container images

## Development Scripts

### Backend

| Command            | Description                |
| ------------------ | -------------------------- |
| `npm run dev`      | Start with hot-reload      |
| `npm run build`    | Compile TypeScript         |
| `npm start`        | Run compiled JS            |
| `npm run lint`     | Run ESLint                 |
| `npm run format`   | Format with Prettier       |

### Frontend

| Command            | Description                |
| ------------------ | -------------------------- |
| `npm run dev`      | Start Vite dev server      |
| `npm run build`    | Type-check + production build |
| `npm run preview`  | Preview production build   |
| `npm run lint`     | Run ESLint                 |
| `npm run format`   | Format with Prettier       |
