# Socket.io Events — OpsFloor

Server URL: `http://localhost:5000`  
Transport: WebSocket (with polling fallback)  
Auth: `socket.io-client` connects with `{ auth: { token: '<jwt>' } }`

---

## Events

### `machine:update`

**Direction:** Server → All connected clients  
**Frequency:** Every 5 seconds + immediately on new connection  
**Trigger:** `setInterval` in `server/src/socket/telemetry.js`

**Payload:** Full array of all Machine documents (with simulated telemetry applied)

```json
[
  {
    "_id": "...",
    "name": "CNC-001",
    "status": "running",
    "oee_score": 87.6,
    "output_count": 426,
    "target_count": 480,
    "downtime_minutes": 12,
    "shift": "morning"
  },
  ...
]
```

**Simulation rules applied each tick:**
- 1–2 random machines selected for mutation
- `oee_score` fluctuates ±2% (clamped to 60–99)
- `status` resampled with weights: 70% running, 20% idle, 10% fault
- `output_count` incremented by 0–2 for running machines

**Note:** Simulated values are NOT written back to MongoDB. They exist only in the emitted payload. The database retains the seeded values.

---

## Client Connection Pattern

```js
// services/socket.js — singleton
const socket = io(VITE_SOCKET_URL, {
  auth: { token },
  transports: ['websocket', 'polling'],
});

// hooks/useSocket.js — subscribe in component
socket.on('machine:update', (machines) => {
  dispatch(updateMachinesFromSocket(machines));
});
```

---

## Future Events (Not Implemented)

| Event | Direction | Purpose |
|---|---|---|
| `downtime:new` | Server → Client | Notify all clients of a new downtime log |
| `machine:status` | Client → Server | Request a manual status change (supervisor) |
| `join:plant` | Client → Server | Join a room for multi-plant support |
