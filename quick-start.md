# Quick Start Guide

## Setup in 5 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start PostgreSQL
```bash
docker-compose up -d
```

This starts PostgreSQL on `localhost:5432` with credentials:
- User: `safeniche`
- Password: `safeniche123`
- Database: `safeniche`

### 3. Configure Environment
The `.env` file is already in place. It's configured to copy to `backend/.env` automatically.

### 4. Setup Database
```bash
npm run db:generate --workspace=backend  # Generate Prisma client
npm run db:migrate --workspace=backend   # Run migrations
npm run db:seed --workspace=backend      # Add demo data
```

### 5. Start Development Server
```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Demo Accounts

After seeding:
- **Admin**: admin@example.com / `password123`
- **Moderator**: moderator@example.com / `password123`
- **Member**: member@example.com / `password123`

## Quick Test

1. Open http://localhost:5173
2. Click "Sign Up" and create an account
3. Create a community or browse existing ones
4. Make a post, comment, and try moderation features

## Stopping Services

```bash
# Stop development servers (Ctrl+C)
# Stop PostgreSQL
docker-compose down
```

## Troubleshooting

### "Connection refused" on PostgreSQL
Make sure Docker is running and the container is up:
```bash
docker ps
docker-compose logs postgres
```

### Port already in use
Change ports in `docker-compose.yml` or your environment.

### Prisma errors
Reset the database:
```bash
npm run db:reset --workspace=backend
```

### Build errors
Clear caches:
```bash
rm -rf backend/node_modules frontend/node_modules
npm install
```
