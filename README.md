# Maetor — Arrival Estimator

UPS shipping arrival estimator. Enter origin and destination ZIPs, pick a service level, and get a business-day delivery estimate — accounting for supplier lead times, handling, and UPS-observed holidays.

**Live:** [chaudharys1.github.io/maetor](https://chaudharys1.github.io/maetor/)

---

## Features

- **Warehouse & dropship modes** — flat handling days for warehouse orders; min–max lead time windows for dropship suppliers
- **Arrival windows** — when a supplier has a range (e.g. 10–20 biz days), shows earliest and latest arrival dates
- **UPS service levels** — Ground, 3 Day Select, 2nd Day Air, Next Day Air, and more
- **Holiday awareness** — excludes weekends and six UPS-observed US holidays, computed algorithmically for any year
- **Transit override** — manually set transit days for lanes you've clocked from real orders
- **Supplier management** — add, edit, and delete suppliers with custom lead times; export/import as JSON
- **Dark mode** — persisted via `localStorage`

---

## Estimate Model

```
Order / Ready date
  + Lead time (biz days)        ← supplier range for dropship; flat handling for warehouse
  = Ships on (date or window)
  + Carrier transit (biz days)  ← fixed days by UPS service, or distance band for Ground
  = Arrives (date or window)
```

**Business days** exclude weekends and these six UPS-observed holidays:

| Holiday | Rule |
|---|---|
| New Year's Day | Jan 1 |
| Memorial Day | Last Monday in May |
| Independence Day | Jul 4 |
| Labor Day | First Monday in September |
| Thanksgiving | Fourth Thursday in November |
| Christmas Day | Dec 25 |

**UPS Ground transit** is approximated from haversine distance between 3-digit ZIP-prefix centroids:

| Distance | Transit days |
|---|---|
| < 250 mi | 1 day |
| 250–599 mi | 2 days |
| 600–999 mi | 3 days |
| 1,000–1,499 mi | 4 days |
| ≥ 1,500 mi | 5 days |

This can differ ±1 day from UPS's actual zone map. Use the **Transit Override** toggle for routes you've confirmed from real orders.

---

## Supplier Lead Times

Go to the **Suppliers** tab to manage your supplier list. Each entry has:

| Field | Description |
|---|---|
| Name | Shown in the estimator dropdown |
| Always dropship | Auto-selects "Dropship" mode when this supplier is picked |
| Lead time min / max | Business days from order placement to supplier shipping |

Default seeds (Panduit 10–20 biz days, Hubbell 8–15 biz days) are **placeholder estimates** — replace them with ranges from your own order history.

Supplier data lives in `localStorage`. Use **Export JSON** / **Import JSON** on the Suppliers tab to back up or transfer your list.

---

## Tech Stack

| | |
|---|---|
| Framework | React 18 + Vite |
| Icons | Phosphor Icons |
| Styling | CSS custom properties (dark-mode design system) |
| Data | ~930 US 3-digit ZIP-prefix centroids (static, no API) |
| Deploy | Netlify (static SPA) |

---

## Local Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the production build
```

---

## Known Limitations

- ZIP coverage is ~930 three-digit prefix centroids (mainland US + territories). Some APO/FPO and reserved prefixes are missing — the estimator prompts for manual override when this happens.
- Ground transit is distance-approximated, not UPS's exact zone map. ±1 day error is common on mid-range routes.
- Supplier lead times are your own inputs — no live data is fetched from suppliers.
- UPS occasionally closes for additional unmodeled days (severe weather, etc.).
- No FedEx support yet.
