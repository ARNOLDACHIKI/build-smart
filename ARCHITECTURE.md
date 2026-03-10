# Build Buddy AI - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT SETUP                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│   Your Browser           │
│   localhost:8080         │
└──────────────┬───────────┘
               │
               │ HTTP
               ▼
┌──────────────────────────────────────────────────────────────┐
│           FRONTEND (React + Vite + TypeScript)               │
│                                                              │
│  Port: 8080                                                  │
│  Location: /frontend                                         │
│                                                              │
│  - React Components                                          │
│  - shadcn/ui Components                                      │
│  - Tailwind CSS Styling                                      │
│  - React Query for API calls                                 │
│                                                              │
│  npm run dev (from /frontend)                                │
└──────────────┬───────────────────────────────────────────────┘
               │
               │ API Calls (fetch/axios)
               │ http://localhost:3000/api/*
               ▼
┌──────────────────────────────────────────────────────────────┐
│          BACKEND (Node.js + Express + TypeScript)            │
│                                                              │
│  Port: 3000                                                  │
│  Location: /backend                                          │
│                                                              │
│  Routes:                                                     │
│  ├── GET  /health          → Server status                  │
│  ├── GET  /api/health/db   → DB connection check            │
│  ├── GET  /api/users       → Fetch all users                │
│  └── POST /api/users       → Create new user                │
│                                                              │
│  CORS: Enabled for http://localhost:8080                    │
│  npm run dev (from /backend)                                 │
└──────────────┬───────────────────────────────────────────────┘
               │
               │ SQL Queries
               │ postgres://build_buddy@localhost:5432
               ▼
┌──────────────────────────────────────────────────────────────┐
│        DATABASE (PostgreSQL + Prisma ORM)                   │
│                                                              │
│  Database: build_buddy_db                                    │
│  User: build_buddy                                           │
│  Port: 5432 (default)                                        │
│  Connection: postgresql://build_buddy:pass@localhost:5432    │
│                                                              │
│  Tables:                                                     │
│  └── users                                                   │
│      ├── id (String, PK)                                    │
│      ├── email (String, Unique)                             │
│      ├── password (String)                                   │
│      ├── name (String)                                       │
│      ├── role (ENUM: USER|ADMIN)                            │
│      ├── createdAt (DateTime)                               │
│      └── updatedAt (DateTime)                               │
│                                                              │
│  Prisma Studio: npm run backend:studio                       │
└──────────────────────────────────────────────────────────────┘
```

## Development Workflow

```
START: npm run dev (from root)
│
├─► Frontend Server (Port 8080)
│   ├─ Vite hot reload
│   ├─ TypeScript compilation
│   └─ Asset bundling
│
├─► Backend Server (Port 3000)
│   ├─ tsx watch (hot reload)
│   ├─ TypeScript compilation
│   └─ Express routes
│
└─► Watch for changes
    ├─ Frontend: src/** changes → reload browser
    └─ Backend: src/** changes → restart server
```

## Data Flow Example

```
User Action (Frontend)
    │
    ▼
React Component
    │ (fetch())
    ▼
Express Route Handler
    │ (req.body)
    ▼
Prisma ORM
    │ (user.create())
    ▼
PostgreSQL Database
    │ (INSERT INTO users)
    ▼
Database Response
    │
    ▼
Express Response JSON
    │
    ▼
React Component
    │ (useState update)
    ▼
UI Re-render
```

## File Organization

```
build-buddy-ai-37/
│
├── 📁 frontend/                  (React App)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/           (React components)
│   │   ├── pages/                (Page components)
│   │   ├── contexts/             (Context providers)
│   │   ├── hooks/                (Custom hooks)
│   │   └── lib/                  (Utilities)
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── 📁 backend/                   (Node.js API)
│   ├── src/
│   │   └── server.ts             (Main Express app)
│   ├── prisma/
│   │   ├── schema.prisma         (Database schema)
│   │   └── migrations/           (Schema history)
│   ├── package.json
│   └── .env                      (Database config)
│
├── 📄 package.json              (Root workspace)
├── 📄 pnpm-workspace.yaml       (Monorepo config)
├── 📄 QUICKSTART.md             (5-min guide)
├── 📄 SETUP.md                  (Detailed docs)
└── 📄 README_SETUP.md           (This overview)
```

## Communication Patterns

### Request Flow
```
Browser (Client)
    │
    ├─ GET /api/users
    │   └─► Backend server receives
    │       └─► Prisma queries database
    │           └─► Returns JSON response
    │               └─► Frontend receives & displays
    │
    └─ POST /api/users
        └─► Backend receives JSON
            └─► Validates data
                └─► Prisma creates record in DB
                    └─► Returns created user
                        └─► Frontend updates UI
```

## Environment Setup

```
Development
├─ Frontend: http://localhost:8080/
├─ Backend:  http://localhost:3000/
└─ Database: localhost:5432
   └─ build_buddy_db
```

```
Production (Future)
├─ Frontend: https://yourdomain.com/
├─ Backend:  https://api.yourdomain.com/
└─ Database: AWS RDS or managed PostgreSQL
```

## Technology Stack Summary

```
FRONTEND
├─ React 18
├─ Vite (build tool)
├─ TypeScript
├─ Tailwind CSS
├─ shadcn/ui (component library)
└─ React Query (data fetching)

BACKEND
├─ Node.js
├─ Express.js
├─ TypeScript
├─ Prisma ORM
├─ PostgreSQL driver
└─ CORS middleware

DATABASE
├─ PostgreSQL 12+
├─ Prisma ORM
├─ Type-safe queries
└─ Auto-generated migrations
```

## Running Commands Reference

```bash
# From root directory
npm run dev              # Start everything
npm run build            # Build both
npm run frontend:dev     # Frontend only
npm run backend:dev      # Backend only
npm run backend:migrate  # Database migrations
npm run backend:studio   # Database UI

# From frontend directory
cd frontend
pnpm dev                 # Start frontend
pnpm build               # Build frontend
pnpm lint                # Check code

# From backend directory
cd backend
pnpm dev                 # Start backend
pnpm prisma:migrate      # Migrations
pnpm prisma:studio       # Database Studio
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────┐
│         CDN / Static Hosting            │
│    (Frontend React App - production)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Cloud Platform                  │
│  ├─ Backend API (Node.js/Express)      │
│  └─ Database (Managed PostgreSQL)      │
└─────────────────────────────────────────┘
```

---

This architecture provides a solid foundation for a scalable, production-ready application with clear separation of concerns between frontend and backend.
