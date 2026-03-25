# SafeNiche Backend

TypeScript Express API with Prisma ORM, JWT auth, and Socket.io.

## Quick Start

1. Install dependencies:
```bash
cd backend
npm install
```

2. Copy `.env`:
```bash
cp ../.env .env  # or create manually
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Start PostgreSQL (using docker-compose from project root):
```bash
docker-compose up -d
```

5. Run migrations:
```bash
npm run db:migrate
```

6. Seed database (optional):
```bash
npm run db:seed
```

7. Start development server:
```bash
npm run dev
```

Server runs on http://localhost:3001

## API Documentation

See main README.md in project root for full API documentation.

## Environment Variables

See `.env.example` for required configuration.

## Database Schema

Managed by Prisma in `prisma/schema.prisma`.

To make schema changes:
1. Update `schema.prisma`
2. Run `npx prisma migrate dev --name <name>`
3. Client regenerated automatically via postinstall

## Testing

Unit and integration tests coming soon.

## Structure

```
src/
├── app.ts          # Express app setup, middleware
├── server.ts       # HTTP + WebSocket server entry
├── middleware/     # Error handler, auth, validation
├── routes/         # API route definitions
├── controllers/    # Request handlers
├── services/       # Business logic (placeholder)
├── utils/          # Helper functions
└── socket/         # WebSocket handlers
```

## Development Tips

- Use `npm run db:studio` to open Prisma Studio (database GUI) at http://localhost:5555
- Database connection logs are helpful during development
- Remember to add new fields to seed.ts if needed
