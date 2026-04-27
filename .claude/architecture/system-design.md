# System Design — OpsFloor

## Context Diagram (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Factory Operator                        │
│                      (Browser / Tablet)                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OpsFloor Web Application                     │
│                                                                 │
│  ┌─────────────────────┐    ┌──────────────────────────────┐   │
│  │  React Client       │    │   Express API Server         │   │
│  │  (Vite :5173)       │◄──►│   (Node.js :5000)            │   │
│  │                     │    │                              │   │
│  │  Redux Toolkit      │    │  REST: /api/auth             │   │
│  │  React Router v6    │    │       /api/machines          │   │
│  │  Recharts           │    │       /api/downtime          │   │
│  │  Socket.io-client   │    │       /api/shifts            │   │
│  └─────────────────────┘    │                              │   │
│                             │  Socket.io: machine:update   │   │
│                             │  (every 5 seconds)           │   │
│                             └──────────────┬───────────────┘   │
└──────────────────────────────────────────── │───────────────────┘
                                             │ Mongoose ODM
                                             ▼
                              ┌──────────────────────────┐
                              │   MongoDB (local :27017) │
                              │                          │
                              │   machines               │
                              │   downtimeLogs           │
                              │   shiftSummaries         │
                              └──────────────────────────┘
```

## Request Flow: REST API

```
Browser
  │── POST /api/auth/login ──► auth.js route
  │                                │── bcrypt.compare()
  │                                │── jwt.sign()
  │◄─────────── { token, user } ───┘

  │── GET /api/machines ──────► auth middleware (jwt.verify)
  │   Authorization: Bearer <token>    │── Machine.find()
  │◄──────── machines array ───────────┘
```

## Real-time Flow: Socket.io

```
Server
  │── setInterval(5000ms)
  │     │── Machine.find()
  │     │── apply OEE fluctuations ±2%
  │     │── randomly change 1-2 machine statuses
  │     │── io.emit('machine:update', machines)
  │
  │                    ┌──── Client
  │◄── WebSocket ──────│  socket.on('machine:update')
  │                    │  dispatch(updateMachinesFromSocket(machines))
  │                    │  Redux state updated
  │                    │  React re-renders MachineCard, OeeTrendChart
  │                    └────
```

## Auth Flow

```
Login page
  │── dispatch(loginThunk({ username, password }))
  │     │── POST /api/auth/login
  │     │── store.auth.token = JWT (in Redux state only)
  │     └── navigate('/dashboard')

Protected routes
  │── ProtectedRoute checks store.auth.token
  │── If null → <Navigate to="/login" />
  │── If present → <Outlet /> renders child page
```

## Deployment Topology (Development)

```
localhost:5173  ── Vite dev server (React SPA)
    │ /api/*       proxy → localhost:5000
    │ /socket.io   proxy → localhost:5000 (ws)
localhost:5000  ── Express + Socket.io
    │ MONGO_URI    → mongodb://localhost:27017/opsfloor
localhost:27017 ── MongoDB
```
