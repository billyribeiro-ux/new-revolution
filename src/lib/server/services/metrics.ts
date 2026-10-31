/**
 * Period-over-period growth helpers.
 *
 * `trendPct` returns the percent change from `previous` to `current`. The
 * formula is `((current - previous) / previous) * 100`, with one important
 * edge case: when `previous === 0`, the percent change is mathematically
 * undefined (you cannot divide by zero — going from 0 → anything is
 * infinite growth, not 100%). We return `null` in that case so the UI
 * can render a clear "NEW" badge or just hide the trend, rather than
 * lying with a fake "+100%" reading. When BOTH values are zero we return
 * `0` (no activity, no change).
 *
 * Result is NOT clamped — `3 → 100` correctly returns `3233`. Capping
 * would hide real growth and is misleading on dashboards.
 *
 * @returns the integer percentage change, or `null` when the previous
 *          period had zero activity (no baseline to compare against).
 */
export function trendPct(current: number, previous: number): number | null {
	if (previous === 0) return current === 0 ? 0 : null;
	return Math.round(((current - previous) / previous) * 100);
}

/**
 * Format a numerator-over-denominator ratio as a percentage with one
 * decimal place (e.g. 24.7 for `pct(247, 1000)`). Returns `0` when the
 * denominator is zero — the only sensible value to print on an empty
 * dataset (the alternative, `null`, would force every consumer to
 * special-case rendering for "no data" cells in tables/CSV exports).
 */
export function pct(numerator: number, denominator: number): number {
	if (denominator === 0) return 0;
	return Math.round((numerator / denominator) * 100 * 10) / 10;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Densify a daily time series over a rolling window.
 *
 * SQL `GROUP BY created_at::date` only emits rows for days that had
 * activity, so charts drawn from the raw series interpolate a nonzero
 * line straight across dead days and index-positioned sparklines/bars
 * compress gaps entirely (audit 2026-06-11). This helper inserts an
 * explicit zero-valued entry (built by `makeEmpty`) for every missing
 * UTC calendar day so the temporal shape is honest.
 *
 * The window matches the query convention used by every daily series in
 * this repo: `created_at >= now - days * 24h`, bucketed by UTC date
 * (`::date` on UTC timestamps). The dense output therefore spans the
 * UTC date of `now - days * 24h` through the UTC date of `now`,
 * inclusive (the first and last buckets are partial days by design).
 *
 * Pure: existing rows are passed through untouched and the input array
 * is not mutated.
 */
export function fillDailySeries<T extends { date: string }>(
	rows: readonly T[],
	days: number,
	makeEmpty: (date: string) => T,
	now: Date = new Date()
): T[] {
	const safeDays = Math.max(1, Math.trunc(days));
	const byDate = new Map(rows.map((row) => [row.date, row]));
	const start = new Date(now.getTime() - safeDays * DAY_MS);
	const startDay = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
	const endDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	const dense: T[] = [];
	for (let day = startDay; day <= endDay; day += DAY_MS) {
		const key = new Date(day).toISOString().slice(0, 10);
		dense.push(byDate.get(key) ?? makeEmpty(key));
	}
	return dense;
}
