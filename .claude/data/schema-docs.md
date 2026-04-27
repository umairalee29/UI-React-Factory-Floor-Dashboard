# Schema Documentation — OpsFloor

## Machine

File: `server/src/models/Machine.js`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | MongoDB document ID |
| `name` | String | required, trimmed | Human-readable machine identifier (e.g. `CNC-001`) |
| `status` | String | enum: running/idle/fault, default: idle | Current operational state |
| `oee_score` | Number | 0–100 | Overall Equipment Effectiveness percentage |
| `output_count` | Number | ≥0, default: 0 | Parts produced in current shift |
| `target_count` | Number | ≥0, default: 0 | Target parts for current shift |
| `downtime_minutes` | Number | ≥0, default: 0 | Accumulated downtime this shift |
| `shift` | String | required, enum: morning/afternoon/night | Which shift this machine belongs to |
| `createdAt` | Date | auto (timestamps) | Document creation time |
| `updatedAt` | Date | auto (timestamps) | Last modification time |

**OEE Formula (for reference):**  
`OEE = Availability × Performance × Quality`  
In this demo, `oee_score` is a single composite number — breakdown into components is not modeled.

---

## DowntimeLog

File: `server/src/models/DowntimeLog.js`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | MongoDB document ID |
| `machine_id` | ObjectId | required, ref: Machine | Foreign key to the machine |
| `reason` | String | required, trimmed | Human-readable downtime cause |
| `started_at` | Date | required | When the downtime event began |
| `ended_at` | Date | optional | When the machine recovered; null = ongoing |
| `duration_minutes` | Number | auto (pre-save hook) | Computed: `(ended_at - started_at) / 60000` |
| `createdAt` | Date | auto | Document creation time |
| `updatedAt` | Date | auto | Last modification time |

**Pre-save hook:**  
If both `started_at` and `ended_at` are present, `duration_minutes` is calculated automatically. If `ended_at` is not set (ongoing event), `duration_minutes` remains undefined.

---

## ShiftSummary

File: `server/src/models/ShiftSummary.js`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | MongoDB document ID |
| `shift` | String | required, enum: morning/afternoon/night | Shift identifier |
| `date` | Date | required | The date of this shift summary (time component is midnight UTC) |
| `total_oee` | Number | 0–100 | Average OEE across all machines in this shift |
| `machines_count` | Number | ≥0, default: 0 | Number of machines that ran this shift |
| `faults_count` | Number | ≥0, default: 0 | Number of fault events recorded this shift |
| `createdAt` | Date | auto | Document creation time |
| `updatedAt` | Date | auto | Last modification time |

**Production note:**  
In a real deployment, ShiftSummary records would be created by a scheduled aggregation job (e.g., cron at shift end). In this demo they are pre-seeded.
