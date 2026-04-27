# Data Model — OpsFloor

## Entity Relationship Diagram

```
┌─────────────────────────────────┐
│            Machine              │
│─────────────────────────────────│
│ _id         ObjectId  PK        │
│ name        String    required  │
│ status      String    enum      │
│             running/idle/fault  │
│ oee_score   Number    0-100     │
│ output_count Number   ≥0        │
│ target_count Number   ≥0        │
│ downtime_minutes Number ≥0      │
│ shift       String    enum      │
│             morning/afternoon/  │
│             night               │
│ createdAt   Date      auto      │
│ updatedAt   Date      auto      │
└─────────────────┬───────────────┘
                  │ 1:many
                  ▼
┌─────────────────────────────────┐
│          DowntimeLog            │
│─────────────────────────────────│
│ _id         ObjectId  PK        │
│ machine_id  ObjectId  FK→Machine│
│ reason      String    required  │
│ started_at  Date      required  │
│ ended_at    Date      optional  │
│ duration_minutes Number auto    │
│             (pre-save hook)     │
│ createdAt   Date      auto      │
│ updatedAt   Date      auto      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│         ShiftSummary            │
│─────────────────────────────────│
│ _id          ObjectId  PK       │
│ shift        String    enum     │
│ date         Date      required │
│ total_oee    Number    0-100    │
│ machines_count Number  ≥0       │
│ faults_count Number   ≥0        │
│ createdAt    Date      auto     │
│ updatedAt    Date      auto     │
└─────────────────────────────────┘
```

## Notes

- **Machine.oee_score** is updated in-memory by the telemetry emitter (not persisted on every tick — only the seed value and manual PATCH updates persist to DB)
- **DowntimeLog.duration_minutes** is auto-computed in the Mongoose pre-save hook: `(ended_at - started_at) / 60000`
- **ShiftSummary** records are created once per shift per day by the seed script; production would compute them via a nightly aggregation job
- Machine ↔ ShiftSummary have no direct FK — they are linked conceptually by `shift` + `date`
