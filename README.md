# SafeNiche - A Safe Place for Niche Communities

A modern community platform built with Node.js, Express, React, TypeScript, and PostgreSQL. Features include private communities, real-time discussions, moderation tools, content warnings, and more.

## Features

### Core Features
- **Communities**: Create, manage, and join topic-based communities
- **Posts**: Share text, links, and images with upvoting and comments
- **Real-time Chat**: Live discussions via Socket.io
- **Search**: Full-text search across communities, posts, and users
- **Moderation**: Comprehensive tools for community moderators
- **Privacy**: Private/invite-only communities with granular controls

### Safety Features
- Content reporting system
- Moderation queues and logs
- User banning and appeals
- Spoiler tags and NSFW controls
- Content warnings
- Block/mute functionality

## Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication
- Socket.io for real-time features
- Helmet, CORS, rate limiting for security

**Frontend:**
- React 18 + TypeScript
- Vite for fast development
- React Router for navigation
- Context API for state management
- CSS custom properties for theming

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL (or use Docker)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd safeniche
npm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env` in the backend directory and configure:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/safeniche"
JWT_SECRET="your-super-secret-key-minimum-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-chars"
ALLOWED_ORIGINS="http://localhost:5173"
```

3. **Start PostgreSQL:**

Using Docker (recommended):
```bash
docker-compose up -d
```

Or use your own PostgreSQL instance.

4. **Run database migrations:**
```bash
npm run db:migrate --workspace=backend
```

5. **Seed the database (optional):**
```bash
npm run db:seed --workspace=backend
```

6. **Start development servers:**
```bash
npm run dev
```

This starts:
- Backend API on http://localhost:3001
- Frontend app on http://localhost:5173

### Available Scripts

- `npm run dev` - Start both backend and frontend in development
- `npm run dev:backend` - Start backend only
- `npm run dev:frontend` - Start frontend only
- `npm run build` - Build both for production
- `npm run lint` - Run ESLint on both projects
- `npm run type-check` - TypeScript type checking

### Backend scripts (in `backend/`):
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio (database GUI)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Communities
- `GET /api/communities` - List communities
- `GET /api/communities/search` - Search communities
- `GET /api/communities/trending` - Get trending communities
- `GET /api/communities/discover` - Get communities to discover
- `GET /api/communities/:slug` - Get community details
- `POST /api/communities` - Create community (auth required)
- `PUT /api/communities/:slug` - Update community
- `DELETE /api/communities/:slug` - Delete community
- `POST /api/communities/:slug/join` - Join community
- `POST /api/communities/:slug/leave` - Leave community
- `POST /api/communities/:slug/invite` - Send invite
- `POST /api/communities/invite/:token/accept` - Accept invite

### Posts
- `GET /api/communities/:slug/posts` - List posts in community
- `GET /api/posts/:id` - Get post details
- `POST /api/communities/:slug/posts` - Create post (auth)
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/vote` - Vote on post

### Comments
- `GET /api/posts/:postId/comments` - List comments
- `POST /api/posts/:postId/comments` - Add comment (auth)
- `PUT /api/comments/:id` - Edit comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/vote` - Vote on comment

### Search
- `GET /api/search?q=query&type=all` - Search all content

### Notifications
- `GET /api/notifications` - Get notifications (auth)
- `GET /api/notifications/unread/count` - Unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read/all` - Mark all as read

### Moderation (auth + mod rights required)
- `GET /api/moderation/reports` - Get reported content
- `POST /api/moderation/reports/:id/resolve` - Resolve report
- `GET /api/communities/:slug/mod-actions` - View mod history
- `POST /api/communities/:slug/mods` - Add moderator
- `DELETE /api/communities/:slug/mods/:userId` - Remove moderator
- `POST /api/communities/:slug/ban` - Ban user
- `POST /api/communities/:slug/unban` - Unban user

### Users
- `GET /api/users/:username` - Get user profile
- `GET /api/users/:username/communities` - Get user's communities
- `GET /api/users/:username/posts` - Get user's posts
- `POST /api/users/:username/follow` - Follow user
- `DELETE /api/users/:username/follow` - Unfollow user
- `POST /api/users/:username/block` - Block user
- `DELETE /api/users/:username/block` - Unblock user

## Demo Accounts

After running the seed script:
- **Admin**: admin@example.com / `password123`
- **Moderator**: moderator@example.com / `password123`
- **Member**: member@example.com / `password123`

**Note:** Change these passwords in production!

## Database Schema

### Key Models
- **User**: User accounts with privacy settings
- **Community**: Topic-based communities (public/private)
- **Post**: Content posted in communities
- **Comment**: Replies to posts (threaded)
- **CommunityMember**: User-community membership with roles
- **Vote**: Upvote/downvote tracking
- **Report**: Content reporting system
- **ModAction**: Moderation history
- **Notification**: User notifications
- **Follow**: User following/blocks
- **CommunityInvite**: Invitation system

## Deployment

### Build for Production
```bash
npm run build
```

This creates `dist/` folders in both backend and frontend.

### Docker Deployment (coming soon)
A Dockerfile and docker-compose.prod.yml will be provided for easy deployment.

### Manual Deployment
1. Build the project
2. Set environment variables on your hosting provider
3. Run database migrations
4. Start the backend server (`npm start --workspace=backend`)
5. Serve the frontend build folder with a static file server (or use Vercel/Netlify)

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API route definitions
│   │   ├── socket/          # WebSocket handlers
│   │   ├── app.ts           # Express setup
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── context/         # React context
│   │   ├── services/        # API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
└── docker-compose.yml       # PostgreSQL
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (coming soon)
5. Submit a pull request

## Safety & Moderation

SafeNiche prioritizes user safety. Key features:

- **Report System**: Users can report inappropriate content
- **Moderation Tools**: Range of tools for volunteer moderators
- **Privacy Controls**: Private communities, user blocks
- **Content Warnings**: Spoiler tags, NSFW flags
- **Transparency**: Mod action logs visible to community members

See [SAFETY.md](SAFETY.md) for detailed safety features.

## License

MIT

---

Built with care for the community. ❤️
