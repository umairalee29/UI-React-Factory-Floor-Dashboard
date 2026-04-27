# Component Hierarchy — OpsFloor

## Route Tree

```
App (BrowserRouter)
├── /login          → Login
└── ProtectedRoute  (checks auth.token)
    ├── /dashboard  → Dashboard
    ├── /downtime   → Downtime
    └── /shifts     → Shifts
```

## Component Tree

```
App
├── Login
│   └── (form — no sub-components)
│
├── Dashboard
│   ├── TopBar
│   │   └── useLiveClock (hook)
│   │   └── useAuth (hook)
│   ├── KpiCard ×4
│   ├── MachineCard ×8 (from machines.list)
│   │   └── StatusBadge
│   ├── OeeTrendChart
│   │   └── Recharts: LineChart, Line, XAxis, YAxis, ...
│   └── ParetoChart
│       └── Recharts: BarChart, Bar, XAxis, YAxis, ...
│
├── Downtime
│   ├── TopBar
│   └── <table> rows from downtime.logs
│
└── Shifts
    ├── TopBar
    ├── ShiftCard ×3 (inline in Shifts.jsx)
    └── Recharts: BarChart (7-day OEE by shift)
```

## Hooks × Components

| Hook | Used By | Purpose |
|---|---|---|
| `useAuth` | TopBar, Login, ProtectedRoute | Access token, user, login/logout |
| `useSocket` | Dashboard | Subscribe to `machine:update` socket event |
| `useLiveClock` | TopBar | Live time + date + shift name |

## Redux Slices × Components

| Slice | Read By | Written By |
|---|---|---|
| `auth` | TopBar, ProtectedRoute, Login | Login form (loginThunk), logout button |
| `machines` | Dashboard, MachineCard, OeeTrendChart | fetchMachines (thunk), useSocket (updateMachinesFromSocket) |
| `downtime` | Dashboard (ParetoChart), Downtime | fetchDowntime (thunk), createDowntime (thunk) |
| `shifts` | Shifts | fetchShifts (thunk) |
