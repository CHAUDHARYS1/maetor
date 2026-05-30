# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # first time
npm run dev       # local dev server (Vite, http://localhost:5173)
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

## Architecture

**Stack:** Vite + React 18, `@phosphor-icons/react`, no router (single-page with tab state in `App.jsx`).  
**Deploy:** Netlify static SPA — `netlify.toml` handles build + SPA redirect.

### File layout

```
src/
  main.jsx               Entry point
  App.jsx                Tab shell (Estimate | Suppliers) + useSuppliers hook wiring
  index.css              All styles — dark-mode design tokens + component classes
  data/
    zip3.js              ~930 US 3-digit ZIP-prefix → [lat, lng] lookup table
  lib/
    calendar.js          Business-day engine: buildHolidays, addBiz, nextBiz, parseDate, toISO, pretty
    transit.js           SERVICES array, haversine(), groundDays(), coords()
    estimate.js          compute(inputs) → result — pure function, no side effects
    useSuppliers.js      Supplier CRUD + localStorage persistence + export/import JSON
  components/
    EstimatorPage.jsx    Main form (source, ZIPs, service, date, lead/handling, override)
    ResultPanel.jsx      Arrival window or single date + Timeline + skipped holidays
    SuppliersPage.jsx    Supplier list with add/edit/delete and JSON import/export
    SupplierModal.jsx    Bottom-sheet form for adding/editing a supplier
```

### Estimate model

```
readyDate + leadTime(min..max biz days) = shipWindow(earliest..latest)
shipWindow + transitDays(biz days)      = arriveWindow(earliest..latest)
```

- **Warehouse:** leadMin = leadMax = handling (flat number) → single arrival date
- **Dropship with supplier:** leadMin/leadMax from supplier record → arrival window if min ≠ max
- **Dropship "Other":** leadMin = leadMax = manual handling input

`estimate.js:compute()` returns `{ state: "wait"|"nozip"|"ok", ...fields }`. All downstream display is derived from this one object.

### Supplier data shape

```js
{ id: string, name: string, alwaysDropship: boolean, leadMin: number, leadMax: number }
```

Seeded defaults: Panduit (10–20 biz days), Hubbell (8–15 biz days) — clearly marked as placeholder estimates in the UI. Stored in `localStorage` under key `maetor_suppliers`.

### Design system (dark mode)

All CSS custom properties live in `index.css :root`. They are a dark-mode adaptation of the shared `_design-system/` tokens:
- `--bg` `--card` `--surface` for layered surfaces
- `--accent: #f6b21b` (gold) as the single interactive color
- `--green: #37d28a` for the arrive dot and confirmed state
- `--font-display: 'Archivo'` for hero numbers/dates; `--font-mono: 'IBM Plex Mono'` for values
- `--radius: 5px` everywhere (per design-system rules); `--radius-lg: 8px` only for special inputs

Component CSS classes follow the design system naming: `.grp`, `.form-grp`, `.form-field`, `.field-lbl`, `.field-inp`, `.seg`, `.pill`, `.btn-full`, `.overlay`/`.sheet`, etc.

### Key invariants

- `addBiz(date, 0, hol)` returns the next business day on or after `date` — shipping on the ready date itself when handling = 0.
- `coords(zip)` returns `null` for ZIPs that map to `[0, 0]` (reserved/APO ranges) — the estimator handles this with a "nozip" state and prompts for manual override.
- The `result` object from `compute()` is fully re-derived on every render via `useMemo` — no cached stale state.
