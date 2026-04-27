# ADR 001 — Tech Stack Selection

**Status:** Accepted  
**Date:** 2026-04-27

## Context

Need a full-stack factory dashboard with real-time updates, charts, role-based auth, and a structured monorepo.

## Decision

| Layer | Choice | Rationale |
|---|---|---|
| Frontend framework | React 18 + Vite | Industry standard, fast HMR, wide ecosystem |
| State management | Redux Toolkit | Predictable state, excellent dev tools, handles async thunks cleanly |
| Charts | Recharts | React-native chart library, composable, good dark theme support |
| Realtime | Socket.io | Reliable WS with polling fallback; pairs naturally with Node.js |
| Styling | CSS Modules | Zero-runtime, scoped styles, no extra dependencies |
| Backend | Node.js + Express | JavaScript across the stack, minimal boilerplate |
| Database | MongoDB + Mongoose | Schema-flexible for IoT-style telemetry data; ODM adds validation |
| Auth | JWT (in-memory) | Stateless, simple to implement; in-memory avoids XSS via localStorage |
| Monorepo | npm workspaces | Built-in to npm 7+, single install, shared scripts |

## Consequences

- Redux adds boilerplate but gives us time-travel debugging and clear data flow
- JWT in-memory means users must re-login on page refresh — acceptable for a factory dashboard
- CSS Modules means no shared utility classes beyond what's in `index.css`
