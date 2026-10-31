/** Where a successful admin sign-in lands when no safe `next` is supplied. */
export const ADMIN_HOME_PATH = '/admin';

const ADMIN_PREFIX = '/admin';

/**
 * Validates the `next` query parameter of `/admin/login` and returns a same-origin path under `/admin`.
 *
 * Accepted: a path that starts with a single `/`, whose path component is `/admin` or starts with `/admin/`,
 * with an optional `?query` or `#fragment`. Examples: `/admin`, `/admin/posts/new?draft=1`, `/admin/media#top`.
 *
 * Rejected (returns `ADMIN_HOME_PATH`), decided and documented:
 * - empty, null, undefined, or not starting with `/` (`https://evil.com`, `javascript:alert(1)`)
 * - `//evil.com` and `/\evil.com` (protocol-relative and backslash forms browsers treat as off-site)
 * - any `\` or `:` anywhere (the spec's rule; also blocks `https:` smuggled into a query)
 * - any ASCII control character or space (browsers strip tabs and newlines, so `/\t/evil.com` becomes `//evil.com`)
 * - a path outside `/admin` (`/adminx`, `/x`, `/blog`)
 * - `.` or `..` segments, and encoded dot, slash or backslash (`%2e`, `%2f`, `%5c`), so `/admin/../x` cannot
 *   escape the admin area. It is rejected rather than normalised, because normalising would change the target
 *   the user asked for and would still be a valid same-origin path. Rejecting is the simpler rule to audit.
 */
export function safeAdminNext(raw: string | null | undefined): string {
	if (typeof raw !== 'string' || raw.length === 0) return ADMIN_HOME_PATH;
	if (raw.charAt(0) !== '/') return ADMIN_HOME_PATH;
	if (raw.charAt(1) === '/' || raw.charAt(1) === '\\') return ADMIN_HOME_PATH;
	if (raw.includes('\\') || raw.includes(':')) return ADMIN_HOME_PATH;
	// eslint-disable-next-line no-control-regex -- deliberately rejecting control characters and spaces
	if (/[\u0000- \u007f]/.test(raw)) return ADMIN_HOME_PATH;
	if (/%(2e|2f|5c)/i.test(raw)) return ADMIN_HOME_PATH;

	const pathEnd = raw.search(/[?#]/);
	const path = pathEnd === -1 ? raw : raw.slice(0, pathEnd);

	if (path !== ADMIN_PREFIX && !path.startsWith(`${ADMIN_PREFIX}/`)) return ADMIN_HOME_PATH;

	const segments = path.split('/');
	if (segments.some((segment) => segment === '.' || segment === '..')) return ADMIN_HOME_PATH;

	return raw;
}
