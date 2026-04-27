# REST API Specification — OpsFloor

Base URL: `http://localhost:5000`  
Auth header: `Authorization: Bearer <jwt>`

---

## Auth

### POST /api/auth/login

Login and receive a JWT.

**Request body:**
```json
{ "username": "operator", "password": "operator123" }
```

**Response 200:**
```json
{
  "token": "<jwt>",
  "user": { "username": "operator", "role": "operator" }
}
```

**Response 401:**
```json
{ "error": "Invalid credentials" }
```

---

## Machines

### GET /api/machines

List all machines sorted by name.

**Auth:** Required  
**Response 200:** Array of Machine objects

```json
[
  {
    "_id": "...",
    "name": "CNC-001",
    "status": "running",
    "oee_score": 88.4,
    "output_count": 423,
    "target_count": 480,
    "downtime_minutes": 12,
    "shift": "morning",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### PATCH /api/machines/:id/status

Update a machine's status.

**Auth:** Required, **Role:** supervisor only  
**Request body:**
```json
{ "status": "idle" }
```

Valid status values: `running`, `idle`, `fault`

**Response 200:** Updated machine object  
**Response 400:** `{ "error": "status must be one of: running, idle, fault" }`  
**Response 403:** `{ "error": "Supervisor role required" }`  
**Response 404:** `{ "error": "Machine not found" }`

---

## Downtime

### GET /api/downtime

Get downtime logs. Supports optional query filters.

**Auth:** Required  
**Query params:**
- `machine_id` — filter by machine ObjectId
- `date` — filter by date (format: `YYYY-MM-DD`), matches full day

**Response 200:** Array of DowntimeLog objects (populated with machine name + shift)

```json
[
  {
    "_id": "...",
    "machine_id": { "_id": "...", "name": "CNC-001", "shift": "morning" },
    "reason": "Tool Wear",
    "started_at": "2026-04-26T08:30:00.000Z",
    "ended_at": "2026-04-26T09:45:00.000Z",
    "duration_minutes": 75
  }
]
```

---

### POST /api/downtime

Log a new downtime event.

**Auth:** Required  
**Request body:**
```json
{
  "machine_id": "<ObjectId>",
  "reason": "Hydraulic Pressure Loss",
  "started_at": "2026-04-27T14:00:00.000Z",
  "ended_at": "2026-04-27T15:30:00.000Z"
}
```

`ended_at` is optional. `duration_minutes` is auto-computed from start/end.

**Response 201:** Created DowntimeLog (populated)

---

## Shifts

### GET /api/shifts

Get shift summaries, sorted by date descending. Returns up to 63 records (7 days × 3 shifts).

**Auth:** Required  
**Response 200:** Array of ShiftSummary objects

```json
[
  {
    "_id": "...",
    "shift": "morning",
    "date": "2026-04-27T00:00:00.000Z",
    "total_oee": 89.2,
    "machines_count": 3,
    "faults_count": 1
  }
]
```

---

## Health Check

### GET /api/health

**Auth:** None  
**Response 200:** `{ "status": "ok" }`
