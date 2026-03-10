# Build Buddy AI - Full Stack Application

A modern full-stack application with React frontend and Node.js/Express backend with PostgreSQL database.

## Project Structure

```
build-buddy-ai-37/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                  # Node.js + Express + Prisma
│   ├── src/
│   │   └── server.ts        # Express server with routes
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                 # Database credentials
│   └── .env.example
└── package.json             # Root package for monorepo
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- pnpm (recommended) or npm

### Environment Setup

1. **Database Setup** (Already configured)
   - PostgreSQL database: `build_buddy_db`
   - User: `build_buddy`
   - Password: `build_buddy_pass`

2. **Backend Configuration**
   - Database URL is configured in `/backend/.env`
   - All Prisma migrations have been run

### Running the Application

#### Option 1: Run Both Frontend and Backend (Recommended)

```bash
cd /home/lod/Documents/build-buddy-ai-37
npm run dev
# or
pnpm dev
```

This will start:
- **Frontend**: http://localhost:8080/ (Vite React App)
- **Backend**: http://localhost:3000/ (Express Server)

#### Option 2: Run Services Separately

**Frontend Only:**
```bash
npm run frontend:dev
# or
cd frontend && pnpm dev
```

**Backend Only:**
```bash
npm run backend:dev
# or
cd backend && pnpm dev
```

## API Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /api/health/db` - Database connection status

### Users (Example)
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
  ```bash
  curl -X POST http://localhost:3000/api/users \
    -H "Content-Type: application/json" \
    -d '{"email": "user@example.com", "password": "pass123", "name": "John Doe"}'
  ```

## Database

### Schema
The current schema includes:
- **User** table with fields:
  - id (String, Primary Key)
  - email (String, Unique)
  - password (String)
  - name (String, Optional)
  - role (Enum: USER, ADMIN)
  - createdAt (DateTime)
  - updatedAt (DateTime)

### Running Migrations

Create a new migration after schema changes:
```bash
npm run backend:migrate
# or
cd backend && pnpm prisma:migrate
```

### Prisma Studio

View and manage database data:
```bash
npm run backend:studio
# or
cd backend && pnpm prisma:studio
```

## Development

### Frontend Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Query

### Backend Stack
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- CORS enabled for frontend

## CORS Configuration

The backend is configured to accept requests from the frontend at `http://localhost:8080`. To change this, update the `FRONTEND_URL` in `/backend/.env`.

## Scripts

### Root Package Scripts
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both frontend and backend
- `npm run frontend:dev` - Start frontend only
- `npm run backend:dev` - Start backend only
- `npm run backend:migrate` - Run Prisma migrations
- `npm run backend:studio` - Open Prisma Studio

### Frontend Scripts
```bash
cd frontend
pnpm dev       # Start dev server
pnpm build     # Build for production
pnpm preview   # Preview production build
pnpm lint      # Run ESLint
pnpm test      # Run tests
```

### Backend Scripts
```bash
cd backend
pnpm dev              # Start dev server with hot reload
pnpm build            # Build to dist/
pnpm start            # Run built application
pnpm prisma:migrate   # Create and apply migrations
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:studio    # Open Prisma Studio
```

## Next Steps

1. **Add More API Routes** - Extend `/backend/src/server.ts` with additional endpoints
2. **Update Database Schema** - Modify `/backend/prisma/schema.prisma` for new tables
3. **Connect Frontend to API** - Update frontend components to call backend endpoints
4. **Add Authentication** - Implement JWT or session-based auth
5. **Error Handling** - Add comprehensive error handling and logging
6. **Testing** - Add unit and integration tests

## Troubleshooting

### Database Connection Error
```
Error: ERROR: permission denied for schema public
```
Solution: The PostgreSQL permissions have already been configured. If this occurs:
```bash
sudo -u postgres psql build_buddy_db << EOF
GRANT ALL PRIVILEGES ON SCHEMA public TO build_buddy;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO build_buddy;
EOF
```

### Port Already in Use
If port 3000 or 8080 is already in use:
- Change backend port in `/backend/.env`: `PORT=3001`
- Change frontend port in `/frontend/vite.config.ts`

### Prisma Client Not Generated
Run: `pnpm prisma:generate` in the backend directory

## License

ISC
