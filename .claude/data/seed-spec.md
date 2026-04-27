# Seed Data Specification — OpsFloor

Script: `server/src/scripts/seed.js`  
Run: `npm run seed` from repo root

---

## Machines (8 total)

| Name | Shift | OEE Range | Target Count |
|---|---|---|---|
| CNC-001 | morning | 85–92% | 480 |
| CNC-002 | morning | 82–90% | 460 |
| CNC-003 | morning | 88–95% | 500 |
| PRESS-001 | afternoon | 78–88% | 600 |
| PRESS-002 | afternoon | 75–85% | 580 |
| WELD-001 | night | 75–83% | 320 |
| WELD-002 | night | 77–84% | 340 |
| WELD-003 | night | 76–82% | 310 |

Initial status: ~85% `running`, ~15% `idle`  
`output_count` computed as `round(oee/100 × target)`  
`downtime_minutes` random 5–60 minutes

---

## Downtime Logs

- **Duration:** Past 7 days
- **Frequency:** 0–3 events per machine per day (random)
- **Duration per event:** 15–120 minutes (random)
- **Reasons pool (from Kaggle plant condition dataset structure):**

| Reason |
|---|
| Tool Wear |
| Spindle Overheat |
| Power Failure |
| Material Jam |
| Hydraulic Pressure Loss |
| Sensor Calibration |
| Scheduled Maintenance |
| Coolant Leak |

---

## Shift Summaries

- **Duration:** Past 7 days × 3 shifts = 21 records
- **OEE ranges by shift:**

| Shift | OEE Range |
|---|---|
| morning | 85–92% |
| afternoon | 78–88% |
| night | 75–83% |

- `machines_count`: morning=3, afternoon=2, night=3
- `faults_count`: 0–2 per summary (random)

---

## Dataset Credit

Seed data structure inspired by the [Production Plant Data for Condition Monitoring](https://www.kaggle.com/datasets/inIT-OWL/production-plant-data-for-condition-monitoring) dataset on Kaggle (inIT-OWL). The reasons pool, machine types, and OEE ranges reflect the condition monitoring scenarios described in that dataset.
