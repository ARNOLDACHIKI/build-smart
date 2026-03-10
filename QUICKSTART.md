# 🚀 Quick Start Guide

## Start the Application (5 seconds)

```bash
cd /home/lod/Documents/build-buddy-ai-37
npm run dev
```

**Wait 3-5 seconds, then access:**
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000

## Test the Database Connection

```bash
# In a new terminal
curl http://localhost:3000/api/health/db
```

Expected response:
```json
{
  "status": "ok",
  "message": "Database connection is healthy"
}
```

## Create a Test User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

## View All Users

```bash
curl http://localhost:3000/api/users
```

## Database Management

### View/Edit Data (Interactive)
```bash
npm run backend:studio
```
Opens Prisma Studio in browser

### Create New Migration
```bash
# After modifying schema.prisma
npm run backend:migrate
```

## Project Layout

```
Root Directory: /home/lod/Documents/build-buddy-ai-37

├── frontend/              ← React app (port 8080)
│   └── src/              
│
├── backend/              ← Express server (port 3000)
│   ├── src/server.ts    
│   └── prisma/schema.prisma
│
└── Database
    └── PostgreSQL (localhost:5432)
        └── build_buddy_db
```

## Useful Commands

| Command | What It Does |
|---------|------------|
| `npm run dev` | Start both servers |
| `npm run frontend:dev` | Frontend only |
| `npm run backend:dev` | Backend only |
| `npm run backend:migrate` | Database migrations |
| `npm run backend:studio` | Prisma Studio |
| `npm run build` | Build for production |

## Troubleshooting

### Servers won't start
```bash
# Kill any existing processes
pkill -f "vite\|tsx\|node"

# Clear cache and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm install

# Try again
npm run dev
```

### Database connection error
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Check if build_buddy_db exists
sudo -u postgres psql -l | grep build_buddy
```

## Documentation

- **Full Setup Details**: See `SETUP.md`
- **Setup Status**: See `SETUP_COMPLETE.md`
- **Frontend**: See `frontend/README.md`

---

**That's it! Your full-stack application is ready to develop.** 🎉
