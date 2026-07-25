# Real Estate / STR Monitoring Dashboard: Technical Reference

> All table/column/function names are taken verbatim from `schema.sql` and `supabase_sql_view.sql`. Where something is inferred rather than directly stated in those files, it is marked **[inferred]**.

---

## 1. Schema Breakdown

### `public.properties`

The static registry of tracked short-term rental listings. One row per listing, updated in-place.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `uuid` | NOT NULL | Primary key |
| `name` | `character varying` | NOT NULL | Human-readable listing name as scraped |
| `property_key` | `character varying` | NULL | **[inferred]** Internal/platform identifier for the listing (e.g. Airbnb listing ID). Not constrained; nullable. |
| `platform` | `character varying` | NOT NULL | The STR platform scraped (e.g. `"airbnb"`, `"vrbo"`). No CHECK constraint visible — possible values not enforced at the schema layer. |
| `url` | `text` | NOT NULL UNIQUE | Canonical listing URL. UNIQUE constraint ensures one row per URL. |
| `market` | `character varying` | NOT NULL | Geographic market label (e.g. `"NYC"`, `"NJ"`). Not constrained to an enum — values are free-form strings from the scraper. |
| `bedrooms` | `integer` | NULL | Bedroom count. Nullable, so this may not always be scraped. |
| `host_name` | `character varying` | NULL | Name of the listing host. Nullable. |
| `cleaning_fee` | `numeric` | NULL | Scraped cleaning fee. Nullable. |
| `review_count` | `integer` | NULL | Total review count. Nullable. |
| `avg_rating` | `numeric` | NULL | Listing average rating. Nullable. |
| `latitude` | `numeric` | NULL | Geographic coordinate. Nullable. |
| `longitude` | `numeric` | NULL | Geographic coordinate. Nullable. |
| `is_active` | `boolean` | NOT NULL | Whether the listing is currently being tracked. |
| `client_id` | `uuid` | NULL | FK → `public.clients(id)`. NULL if not assigned to a client. |
| `consecutive_404s` | `integer` | NOT NULL DEFAULT 0 | Counter incremented by the scraper each time the listing URL returns 404. Used to auto-deactivate stale/deleted listings. |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` | Row insertion timestamp. The `get_dashboard_kpis()` function uses `MIN(created_at) FROM properties` as the `tracking_since` KPI. |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` | Last row modification time. |

**Insert vs Update**: `url` has a UNIQUE constraint, so the same listing cannot appear twice. The scraper presumably does an upsert on `url`. `consecutive_404s`, `is_active`, `review_count`, `avg_rating` all suggest mutable columns that get updated in-place, not appended. **Properties are a snapshot table, not a history table.**

---

### `public.rate_history`

The time-series history of nightly rate observations. Each row represents a single price check for a specific `(property_id, stay_date)` pair at a point in time. This is the primary history table for the STR dashboard.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `uuid` | NOT NULL | Primary key |
| `property_id` | `uuid` | NOT NULL | FK → `public.properties(id)`. |
| `stay_date` | `timestamptz` | NOT NULL | The *future* date being checked (the night a guest would stay). This is **not** the observation time. |
| `nightly_rate` | `numeric` | NULL | Quoted nightly rate in the observation's `currency`. **Nullable** — a NULL here means the listing was scraped but no rate was returned (unavailable, blocked, or booked). |
| `is_available` | `boolean` | NOT NULL | Whether the platform reported the listing as bookable for `stay_date`. Does not distinguish between booked (unavailable) and host-blocked (also unavailable). |
| `currency` | `character varying` | NOT NULL | Currency code for `nightly_rate` (e.g. `"USD"`). |
| `meta_data` | `jsonb` | NOT NULL | Arbitrary scraper metadata. Schema does not define its structure. |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` | The wall-clock time the scraper wrote this row. This is the actual observation timestamp. `v_rate_volatility` aliases this as `recorded_at`. |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` | Last row modification time. |

**No UNIQUE constraint exists on `(property_id, stay_date)`**, which means the scraper can insert multiple rows for the same `(property_id, stay_date)` combination — one per scrape run. This is consistent with the stated 4-scrapes/day workflow, producing up to 4 rows per `(listing, stay_date)` per day. The corroborating evidence from the schema is: `created_at` has a DEFAULT of `now()` (auto-inserted at write time), and there is no UNIQUE constraint or ON CONFLICT clause visible in this file that would prevent multiple inserts per pair.

**"Stale" corroboration**: Because each scrape inserts new rows rather than updating existing ones, the recency of data is determined by comparing `created_at` (= `recorded_at`) to `now()`. The frontend uses `hoursSince > 24` to classify a row as stale — this is a **frontend-only threshold**, not enforced or defined in the schema or views.

---

### Supporting Tables (not STR-specific)

These tables exist in the schema but are shared across products:

| Table | STR Relevance |
|---|---|
| `public.scrape_runs` | Tracks all scrape jobs including `job_type = 'REAL_ESTATE_MONITOR'`. `platform` column links a run to a specific STR platform. |
| `public.clients` | Referenced by `properties.client_id`. Defines which client owns a listing. |
| `public.alembic_version` | Migration version tracking. Not query-relevant. |

---

## 2. Views and Functions

All views are defined in `supabase_sql_view.sql`. Only views relevant to the STR dashboard are covered here in detail. The remaining views (`v_category_price_index`, `v_price_spread_latest`, `v_price_volatility`, `v_recent_alerts`, `v_recent_leads`, `v_recent_prices`, `v_recent_runs`) serve the pricing and leads dashboards and are not used by `RealEstateDemo.tsx`.

---

### `public.v_rate_volatility`

**Source tables**: `rate_history`, `properties`

**Type**: Aggregation (window function) + join. Not a pass-through.

**Purpose**: Computes a trailing 7-row moving average of `nightly_rate` per property, and expresses each rate observation as a percentage deviation from that trailing average.

**CTE `valid_rates`**:
```sql
SELECT
  rate_history.id,
  rate_history.property_id,
  rate_history.stay_date,
  rate_history.nightly_rate,
  AVG(rate_history.nightly_rate) OVER (
    PARTITION BY rate_history.property_id
    ORDER BY rate_history.stay_date
    ROWS BETWEEN 6 PRECEDING AND 1 PRECEDING
  ) AS trailing_avg_rate
FROM rate_history
WHERE rate_history.nightly_rate IS NOT NULL
```

**Critical note on window frame**: The window is ordered by `stay_date` (the check-in date), not `created_at` (observation time). This means the trailing average is computed over a rolling window of the 6 preceding `stay_date` records per property, not the 6 preceding *scrape events*. If the same `stay_date` appears multiple times per day (due to 4 scrapes/day), all those rows are included individually in the window ordered by `stay_date`. **[inferred]** The intent is likely to capture a rolling window of observed rates across different stay nights, but intraday re-checks of the same night will affect window frame ordering in a non-obvious way.

**Final output columns**:

| Column | Source | Notes |
|---|---|---|
| `id` | `rate_history.id` | Rate history row PK |
| `property_id` | `properties.id` | FK to `properties` |
| `property_name` | `properties.name` | |
| `url` | `properties.url` | |
| `market` | `properties.market` | |
| `platform` | `properties.platform` | |
| `stay_date` | `rate_history.stay_date` | Future stay night being checked |
| `nightly_rate` | `rate_history.nightly_rate` | Can be NULL |
| `is_available` | `rate_history.is_available` | |
| `currency` | `rate_history.currency` | |
| `recorded_at` | `rate_history.created_at` | Aliased. Actual observation timestamp. |
| `trailing_avg_rate` | computed (window) | NULL for earliest rows per property (no preceding rows). |
| `pct_above_trailing_avg` | computed | `ROUND((nightly_rate - trailing_avg_rate) / NULLIF(trailing_avg_rate, 0) * 100, 2)`. NULL if either input is NULL. |

**No `WHERE` or time filter** — the view exposes the full history (all rows in `rate_history`, not windowed to a recent period).

---

### `public.v_scrape_health`

**Source tables**: `scrape_runs`

**Type**: Aggregation (window function). Not a pass-through.

**Purpose**: Returns one row per `(job_type, platform)` — the most recent scrape run for each combination, with computed health flags.

**Computed columns relevant to STR**:

| Column | Logic |
|---|---|
| `last_status` | `status` of the most recent run |
| `is_failed` | `true` if `status = 'failed'` |
| `high_failure_rate` | `true` if `items_failed / items_attempted > 0.20` |
| `has_blocks` | `true` if `meta_data->>'blocked_count' > 0` |

The `get_dashboard_kpis()` function queries this view with `WHERE job_type = 'REAL_ESTATE_MONITOR'` and aggregates `platform → last_status` pairs via `json_object_agg`.

---

### `public.get_dashboard_kpis()` — `real_estate` block

**Type**: SQL function, `SECURITY DEFINER`, returns `json`.

The `real_estate` key is built as:

```sql
'real_estate', json_build_object(
  'properties_tracked', (SELECT COUNT(DISTINCT property_id) FROM v_rate_volatility),
  'rate_changes_7d', (
    SELECT COUNT(*) FROM rate_history
    WHERE created_at >= NOW() - INTERVAL '7 days'
    AND nightly_rate IS NOT NULL
    AND nightly_rate != (
      SELECT nightly_rate FROM rate_history rh2
      WHERE rh2.property_id = rate_history.property_id
        AND rh2.created_at < rate_history.created_at
        AND rh2.nightly_rate IS NOT NULL
      ORDER BY rh2.created_at DESC LIMIT 1
    )
  ),
  'spikes_7d', (
    SELECT COUNT(*) FROM v_rate_volatility
    WHERE ABS(pct_above_trailing_avg) >= 25
    AND recorded_at >= NOW() - INTERVAL '7 days'
  ),
  'tracking_since', (SELECT MIN(created_at) FROM properties),
  'last_scrape_status', (
    SELECT COALESCE(json_object_agg(platform, last_status), '{}'::json)
    FROM v_scrape_health
    WHERE job_type = 'REAL_ESTATE_MONITOR'
  )
)
```

**Notes**:
- `properties_tracked` counts DISTINCT `property_id`s in `v_rate_volatility`, not in `properties`. A property with no `rate_history` rows would not be counted even if it exists in `properties`.
- `rate_changes_7d` is a correlated subquery per row — it compares each recent rate reading against its previous reading (by `created_at` DESC). It counts a row as a "change" only if `nightly_rate != previous_nightly_rate`. NULL-to-value transitions are **not** counted (both the outer `WHERE nightly_rate IS NOT NULL` and the inner `rh2.nightly_rate IS NOT NULL` filter exclude NULLs).
- `tracking_since` uses `MIN(created_at) FROM properties` — the earliest property creation date, not the earliest rate history row.
- `last_scrape_status` returns a JSON object keyed by platform, e.g. `{"airbnb": "success", "vrbo": "failed"}`. The frontend TypeScript type is `Record<string, string> | null`.

---

## 3. Insert vs Update Pattern

**Conclusion: `rate_history` is a true insert-only history table.**

Evidence from schema:
1. The PRIMARY KEY is `id` (a UUID), not `(property_id, stay_date)`. No UNIQUE constraint exists on the `(property_id, stay_date)` pair.
2. `created_at` defaults to `now()` — each INSERT gets a distinct timestamp.
3. The trailing average window function in `v_rate_volatility` operates over an ordered set, which only produces meaningful results if multiple rows per property exist.

This means the full observation history is permanently retained. Every scrape run that touches a listing inserts new rows into `rate_history` — it does not overwrite or update existing rows. At 4 scrapes/day across N future `stay_date`s, `rate_history` grows as: `4 × N_dates × N_properties` rows per day.

**`properties` is an update-in-place table.** The UNIQUE constraint on `url` and mutable fields (`consecutive_404s`, `is_active`, etc.) indicate the scraper upserts into `properties` — not appending new rows per scrape.

---

## 4. "Unavailable" and "Stale" Status Meaning

**From `schema.sql` and `supabase_sql_view.sql`:**

- `rate_history.is_available` is a `boolean NOT NULL`. It is set by the scraper at write time. The schema does not define what values are possible beyond `true`/`false`.
- `rate_history.nightly_rate` is nullable. A NULL value means no rate was returned for that observation.
- **The schema and views do not define "Unavailable" or "Stale"** as explicit values or columns. These are frontend-only derived states.

**From `RealEstateDemo.tsx` (frontend logic, not schema-layer):**

```tsx
const hoursSince = (Date.now() - new Date(row.recorded_at).getTime()) / (1000 * 60 * 60);
const isStale = hoursSince > 24;
const isPriced = row.nightly_rate !== null;
```

- **"Unavailable"**: displayed when `nightly_rate === null` AND `hoursSince <= 24`. Rendered as `<span>Unavailable</span>` with a reference to the last known priced row if one exists.
- **"Stale"**: displayed when `nightly_rate === null` AND `hoursSince > 24`. Rendered as `<span>Stale — checked [date]</span>`. The row also gets `opacity-60` applied to the entire table row.

The 24-hour threshold is hardcoded in the frontend component. The actual logic that assigns `nightly_rate = NULL` or `is_available = false` lives in the backend scraper, which is not visible from this layer.

**What the schema does NOT tell us**:
- Whether `is_available = false` is set when a listing is booked (guest), blocked by host, or just errored during scraping.
- Whether `nightly_rate = NULL` always co-occurs with `is_available = false`.

---

## 5. Frontend Display Logic

### KPI Cards (`LiveSystems.tsx`)

All 4 KPI cards for the `#real-estate` section are populated from `supabase.rpc('get_dashboard_kpis')`. Values are computed in the database function, not client-side.

| KPI Label | Source Field | Computed Where |
|---|---|---|
| **Properties Tracked** | `kpis.real_estate.properties_tracked` | Database (`get_dashboard_kpis`) |
| **Rate Changes (7d)** | `kpis.real_estate.rate_changes_7d` | Database (`get_dashboard_kpis`) |
| **25%+ Spikes (7d)** | `kpis.real_estate.spikes_7d` | Database (`get_dashboard_kpis`) |
| **Scrape Status** (per-platform) | `kpis.real_estate.last_scrape_status` | Database (`get_dashboard_kpis`) |

---

### `RealEstateDemo.tsx` Widget

**Data source**: Single query to `v_rate_volatility`, fetching all rows (`SELECT *`), ordered by `stay_date DESC`. No time window filter is applied at the query layer — the full view is loaded into the client.

All derived state below is computed **client-side** from the full dataset.

#### Spike Alert Panel

Condition: `pct_above_trailing_avg >= 25` (not `abs()` — only positive spikes are shown). Deduplicated to one alert per `property_id` (highest spike per property). Capped at 4 alerts displayed. Shown only if at least one qualifying row exists.

Displayed fields per alert:
- `property_name`, `market`, `platform`, `stay_date` (formatted `"short month + day + year"`)
- `nightly_rate` (formatted as `$N/night` using `currency` field)
- `pct_above_trailing_avg` (formatted as `+N.1%`)

#### Rate History Chart (Recharts `LineChart`)

Data scope: All `v_rate_volatility` rows where `property_id === selectedPropertyId`, sorted by `recorded_at` ascending (i.e., sorted by actual observation time, not `stay_date`).

The X-axis uses `dateShort`: `recorded_at` formatted as `"month day, hour:minute"` — this means the chart plots rate observations over **actual scrape time**, not over future stay nights. Each intraday scrape produces a distinct X-axis tick (up to 4 per day per property).

Two `<Line>` components rendered:
- `nightly_rate` — solid, primary color
- `trailing_avg_rate` — dashed, muted color (labeled "7-day Trailing Avg" in legend, though the window in the DB is ordered by `stay_date`, not by time — see Section 2 note)

Tooltip formatter: `$N/night` for both lines.

**Default property selection logic** (on first data load only, client-side):
```tsx
// Filter to properties whose market contains "nyc" or "nj" (case-insensitive)
// Among those, select the one with highest |pct_above_trailing_avg|
// If no NYC/NJ properties, fall back to the full dataset
```

#### Property Rate Snapshot Table

One row per unique `property_id`. "Latest" row per property is determined by: the first entry returned for that `property_id` from the view data sorted `stay_date DESC`. This means the table row shows the rate for the most-future `stay_date` tracked per listing, **not** necessarily the most recently scraped row by time.

| Column Header | Data Source | Computed Where |
|---|---|---|
| Property | `property_name` | DB (view join) |
| Market | `market` | DB (view join) |
| Platform | `platform` | DB (view join) |
| Stay Date | `stay_date` | DB (raw column), formatted client-side |
| Rate | `nightly_rate` → `rateDisplay` | Client-side (Stale/Unavailable logic applied) |
| vs 7d Avg | `pct_above_trailing_avg` | DB (view window function) |
| Available | `is_available` | DB (raw column), displayed as `YES` / `NO` |
| Recorded | `recorded_at` | DB (alias for `created_at`), formatted client-side |

**Color coding for "vs 7d Avg" column** (client-side):
- `pct >= 25`: amber + bold
- `pct > 0 and < 25`: green
- `pct <= 0`: red
- `pct === null`: muted (no trailing avg available yet)

**Row interaction**: clicking a row sets `selectedPropertyId`, updating the chart above.

---

## 6. Known Gaps Visible From This Layer

The following are not supported by the current schema or views and cannot be derived from `rate_history`, `properties`, or the existing views without additional backend work.

| Gap | Explanation |
|---|---|
| **Occupancy calculation** | `is_available = false` does not distinguish between "booked" and "host-blocked." There is no booking or reservation table. True occupancy rate cannot be computed. |
| **Booked vs host-blocked distinction** | Structurally impossible from `rate_history.is_available` alone. No additional status column or flag exists in the schema. |
| **Long-term rental data** | Not in scope. The schema tracks `stay_date`s (nightly STR rates) only. No lease, monthly, or long-term rental table exists. |
| **Seasonal trends** | No explicit season or date-range grouping exists in any view. `v_rate_volatility` exposes all time-series data, but no seasonal aggregation view exists. |
| **Cross-listing / portfolio aggregation** | No view computes portfolio-level rate averages (e.g. median rate by market, by platform, by bedroom count). `v_rate_volatility` is per-row (per `rate_history` entry). |
| **Baseline rate (pre-tracking)** | The trailing average in `v_rate_volatility` uses only data already in `rate_history`. For newly added properties, `trailing_avg_rate` will be NULL for the first 6 rows per property (the window requires at least 1 preceding row). |
| **Cleaning fee / review data in dashboard** | `properties.cleaning_fee`, `properties.review_count`, `properties.avg_rating` are tracked in the schema but not surfaced by any view or in the frontend dashboard. |
| **Competitor benchmarking** | No cross-property comparison logic exists at the database layer. The spike alerts surface per-property deviations from a single property's own history, not deviation vs. market comps. |
