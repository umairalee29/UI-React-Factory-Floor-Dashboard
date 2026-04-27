# ADR 003 — Real-time Telemetry Strategy

**Status:** Accepted  
**Date:** 2026-04-27

## Context

The dashboard must show live machine status and OEE changes without page refresh.

## Options Considered

| Option | Pros | Cons |
|---|---|---|
| Polling (setInterval + fetch) | Simple | Latency, extra HTTP overhead |
| SSE (Server-Sent Events) | Simple, HTTP-native | Unidirectional only |
| WebSockets (raw) | Full-duplex, low latency | More setup |
| Socket.io | Reliable, fallback to polling, rooms | Slightly heavier than raw WS |

## Decision

Socket.io with a server-side `setInterval` emitting `machine:update` every 5 seconds.

**Reasons:**
- Socket.io handles WebSocket → polling fallback automatically
- 5-second interval is appropriate for a factory floor (not millisecond trading)
- Emitting the full machine array keeps client logic simple (replace, don't patch)
- Socket.io rooms can be added later for multi-plant scalability

## Consequences

- Full array emitted every 5s (~8 machines × ~200 bytes = ~1.6KB per tick — negligible)
- Client `machinesSlice` replaces list on every `machine:update` event
- OEE trend is maintained client-side by appending to `oeeTrend` array (capped at 20 points)
- No DB write on telemetry tick (simulation only); PATCH endpoint is separate
