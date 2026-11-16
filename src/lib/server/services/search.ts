/**
 * On-site search helpers.
 *
 * The public `/search` route (src/routes/search) is the live target the
 * `WebSite.potentialAction.SearchAction` schema points at — declaring a
 * SearchAction whose URL doesn't resolve violates Google's structured-data
 * guidelines, so the route and the schema move together.
 */

/**
 * Escape the LIKE/ILIKE metacharacters (`%`, `_`) and the escape char (`\`)
 * in a user-supplied search term before it's interpolated into a `%term%`
 * pattern. Without this, a user typing `%` would turn a literal search into a
 * match-everything wildcard, and `_` into a single-char wildcard.
 *
 * Note: this is NOT SQL-injection defense — Drizzle parameterises the value.
 * It's about preserving *literal* search semantics inside the LIKE pattern.
 */
export function escapeLike(value: string): string {
	return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}
