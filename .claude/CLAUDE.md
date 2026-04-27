# OpsFloor — Claude Project Instructions

## Quick Start

```bash
# From repo root
npm install          # installs client + server via npm workspaces
npm run seed         # seed MongoDB with 8 machines + 7-day history
npm run dev          # starts server :5000 and client :5173 in parallel
```

Demo accounts: `operator / operator123` · `supervisor / supervisor123`

---

## Project Overview

**OpsFloor** is a real-time factory floor dashboard:
- React + Vite frontend with Redux Toolkit state management
- Express + MongoDB backend with Socket.io telemetry
- JWT auth (in-memory only, no localStorage)
- Role-based access: operator (read-only) / supervisor (can change machine status)

---

## Critical Conventions

| Rule | Detail |
|---|---|
| **No localStorage** | JWT lives in Redux `auth.token` only — lost on page refresh intentionally |
| **CSS Modules only** | Every component has its own `.module.css`. No global class names except in `index.css` |
| **Redux for all state** | No local `useState` for server data. All async data lives in slices |
| **Axios + injectStore** | `services/api.js` uses a late-injected store reference to avoid circular deps |
| **Socket singleton** | `services/socket.js` returns the same socket instance — never create multiple |
| **CommonJS server** | Server uses `require()` / `module.exports` — no ESM on the backend |
| **ESM client** | Client uses `import/export` — Vite handles transpilation |

---

## Environment Variables

Server reads from `../.env` (relative to `server/`):

| Variable | Default | Description |
|---|---|---|
| `MONGO_URI` | `mongodb://localhost:27017/opsfloor` | MongoDB connection string |
| `JWT_SECRET` | — | Required: min 32-char random string |
| `PORT` | `5000` | Express listen port |
| `NODE_ENV` | `development` | Environment mode |
| `CLIENT_URL` | `http://localhost:5173` | CORS allowed origin |

Client reads Vite env vars (must prefix `VITE_`):
- `VITE_API_URL` — Axios base URL (proxied in dev, explicit in prod)
- `VITE_SOCKET_URL` — Socket.io server URL

---

## Key File Paths

```
server/server.js                    — Express + Socket.io entry point
server/src/config/db.js             — Mongoose connection
server/src/middleware/auth.js       — JWT authenticate + requireSupervisor
server/src/models/                  — Machine, DowntimeLog, ShiftSummary schemas
server/src/routes/                  — auth, machines, downtime, shifts
server/src/socket/telemetry.js      — 5-second broadcast loop
server/src/scripts/seed.js          — Database seed script

client/src/store/                   — Redux store + 4 slices
client/src/services/api.js          — Axios instance with interceptors
client/src/services/socket.js       — Socket.io singleton
client/src/hooks/useAuth.js         — Auth state + actions
client/src/hooks/useSocket.js       — Subscribes to machine:update
client/src/hooks/useLiveClock.js    — Live time + shift detection
client/src/components/              — TopBar, KpiCard, MachineCard, charts
client/src/pages/                   — Login, Dashboard, Downtime, Shifts
```

---

## Architecture Docs

Full SDLC documentation lives in `.claude/`:
- `architecture/` — ADRs, system design, data model
- `ui/` — Design tokens, component hierarchy
- `backend/` — API spec, socket events
- `data/` — Seed spec, schema docs
