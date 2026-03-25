# SafeNiche Frontend

React + TypeScript + Vite application.

## Quick Start

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

App runs on http://localhost:5173

**Proxied API requests** to `/api` go to http://localhost:3001

## Structure

```
src/
├── components/      # Reusable UI components
│   └── common/     # Buttons, inputs, cards, etc.
├── pages/          # Route pages (Home, Login, Community, etc.)
├── context/        # React context providers
│   ├── AuthContext.tsx   # Authentication state
│   ├── ThemeContext.tsx  # Dark/light theme
│   └── SocketContext.tsx # WebSocket connection
├── services/       # API client
├── utils/          # Helper functions
├── types/          # TypeScript definitions
├── App.tsx         # Router and layout
├── main.tsx        # React entry
└── index.css       # Global styles + CSS variables
```

## Services

- `api`: REST API client (src/services/api.ts)
  - `api.get('/path')`
  - `api.post('/path', data)`
  - `api.put('/path', data)`
  - `api.patch('/path', data)`
  - `api.delete('/path')`

## Context Providers

- `useAuth()`: Auth state, login, logout, register, current user
- `useTheme()`: Toggle dark/light mode
- `useSocket()`: WebSocket connection status

## CSS Variables

Theme colors in `:root`:
```css
--primary: #6366f1;      /* Indigo */
--secondary: #ec4899;    /* Pink */
--success: #10b981;      /* Green */
--warning: #f59e0b;      /* Amber */
--danger: #ef4444;       /* Red */
--bg, --bg-secondary
--text, --text-secondary
--border
```

Override in `[data-theme="dark"]` for dark mode.

## Components to Build

Future components:
- PostCard
- CommentTree
- CommunityCard
- UserAvatar
- MarkdownEditor
- Modal
- Dropdown
- Toast notifications

## Build for Production

```bash
npm run build
```

Outputs to `dist/` directory.
