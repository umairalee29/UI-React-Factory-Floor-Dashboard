# ADR 002 — Authentication Strategy

**Status:** Accepted  
**Date:** 2026-04-27

## Context

The app needs role-based access (operator vs supervisor) and protection against unauthenticated access. We need to decide where to store the JWT.

## Options Considered

| Option | Security | UX | Complexity |
|---|---|---|---|
| localStorage | Low (XSS risk) | Persists across refresh | Simple |
| httpOnly cookie | High | Persists, automatic | Requires CSRF protection |
| Memory (Redux) | High (no XSS) | Lost on refresh | Simple |
| sessionStorage | Medium | Lost on tab close | Simple |

## Decision

Store JWT in Redux state (in-memory only).

**Reasons:**
- Eliminates XSS attack surface entirely
- Factory dashboards are typically single-session workstations — re-login on refresh is acceptable
- Simpler than cookie-based auth (no CSRF tokens, SameSite config, etc.)
- Clearly documented behavior for operators

## Consequences

- Page refresh requires re-login
- JWT is transmitted via `Authorization: Bearer` header on every API request
- Socket.io connection passes token via `auth: { token }` option
- Server validates JWT on every protected endpoint via `authenticate` middleware
