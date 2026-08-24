# iCAMPUS — LMS Dashboard

Enterprise-grade Learning Management System console built with React 19, Tailwind CSS v4,
lucide-react and Recharts.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
```

## Layout

| Path | Purpose |
|---|---|
| `src/config/nav.js` | Single source of truth for the sidebar, routes and breadcrumbs |
| `src/context/AppContext.jsx` | Sidebar, global search, check-in session, toasts |
| `src/components/ui/` | Primitives (`Card`, `Badge`, `Modal`, `Button`, …) and the shared `DataTable` |
| `src/components/charts/ChartKit.jsx` | Chart palette, axis/grid tokens, tooltip and legend |
| `src/components/layout/` | `AppLayout`, `Sidebar`, `Topbar` |
| `src/pages/` | One file per route |
| `src/data/mockData.js` | Deterministic demo dataset + attendance generator |

## Design notes

- Accent `#00a65a`, exposed as the `brand-*` scale in `src/index.css` (`@theme`).
- Chart series use a fixed categorical slot order validated for colour-vision deficiency
  across all pairs on the light surface. Slots are assigned per entity, never cycled.
- Status is never carried by colour alone — every badge pairs a hue with an icon and label.
- Tables live inside `overflow-x-auto`; the page body never scrolls sideways.

## Demo data

`mockData.js` is fully deterministic, so numbers stay stable across reloads. "Today" is
pinned to 21 Aug 2026 (`TODAY`) so the attendance register renders a realistic partial month.
Attendance carries per-month absence pressure, so some months fall under the 70% threshold
and exercise the low-attendance warning — e.g. **March 2026 / Physical → 68.2%**.
