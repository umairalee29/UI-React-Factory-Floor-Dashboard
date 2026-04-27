# ADR 004 — Frontend State Management

**Status:** Accepted  
**Date:** 2026-04-27

## Context

The frontend has four distinct data domains: auth, machines (live), downtime logs, shift summaries. Need a strategy for managing async loading states and socket updates.

## Decision

Redux Toolkit with four slices, one per domain.

```
store/
  slices/
    authSlice.js      — token, user, loading, error
    machinesSlice.js  — list, oeeTrend, loading, error
    downtimeSlice.js  — logs, loading, error
    shiftsSlice.js    — summaries, loading, error
```

Each slice uses `createAsyncThunk` for API calls and a synchronous reducer for socket updates.

## Key Patterns

**Circular dependency prevention (Axios interceptors):**
```js
// api.js exports injectStore()
// main.jsx calls injectStore(store) after store creation
// This avoids store importing api and api importing store
```

**Socket updates bypass async thunks:**
```js
// machinesSlice has a synchronous reducer:
updateMachinesFromSocket(state, action) { state.list = action.payload; }
// useSocket hook dispatches this on every socket event
```

**OEE trend built client-side:**
- No separate API endpoint for trend data
- Each socket update appends an averaged data point to `machinesSlice.oeeTrend`
- Capped at 20 entries (rolling window)

## Consequences

- No RTK Query — overkill for 4 endpoints with different invalidation strategies
- Selectors are inline (no reselect) — machine count is small enough that memoization provides no measurable benefit
- Component-level `useEffect` dispatches fetches on mount — simple and explicit
