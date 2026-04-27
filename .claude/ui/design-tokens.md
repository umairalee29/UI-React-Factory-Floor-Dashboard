# Design Tokens — OpsFloor

All tokens are CSS custom properties defined in `client/src/index.css`.

## Colors

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0f1117` | Page background |
| `--bg-surface` | `#1a1d27` | Cards, panels |
| `--bg-elevated` | `#232636` | Dropdowns, hover states |
| `--bg-input` | `#2a2d3e` | Form inputs |
| `--accent` | `#3b82f6` | Electric blue — CTAs, charts |
| `--accent-hover` | `#2563eb` | Darker accent on hover |
| `--accent-muted` | `rgba(59,130,246,0.15)` | Accent backgrounds |
| `--status-running` | `#22c55e` | Green — machine running |
| `--status-idle` | `#f59e0b` | Amber — machine idle |
| `--status-fault` | `#ef4444` | Red — machine fault |
| `--text-primary` | `#f1f5f9` | Primary text |
| `--text-secondary` | `#94a3b8` | Secondary / labels |
| `--text-muted` | `#64748b` | Muted / placeholders |
| `--border` | `#2d3148` | Default borders |
| `--border-hover` | `#3d4168` | Hover borders |

## Typography

| Token | Value | Usage |
|---|---|---|
| `--font-data` | `'Geist Mono', 'Courier New', monospace` | Numbers, machine IDs, timestamps |
| `--font-ui` | `'Inter', system-ui, sans-serif` | Labels, buttons, body text |

## Spacing Scale

| Class | Size | Usage |
|---|---|---|
| xs | 4px | Gap between badge dot and text |
| sm | 8px | Inner element spacing |
| md | 16px | Card gaps, form field gaps |
| lg | 24px | Section padding |
| xl | 32px–40px | Page sections |

## Border Radius

| Token | Value |
|---|---|
| `--radius-sm` | `4px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |

## Shadows

| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.4)` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.5)` |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.6)` |

## Animations

| Name | Usage |
|---|---|
| `pulse-fault` | Machine cards with `status === 'fault'` — red glow ring |
| `fade-in` | Machine cards on initial render / data arrival |
| `spin` | Reserved for loading spinners |

## Breakpoints

| Name | Width |
|---|---|
| Mobile | ≤ 600px |
| Tablet | ≤ 900px |
| Desktop | > 900px |
| Wide | > 1200px |
