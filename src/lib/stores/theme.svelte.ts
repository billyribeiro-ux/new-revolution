/**
 * Theme — dark mode only.
 *
 * Deliberately contains NO reactive state. The official Svelte guidance is
 * "Only use the $state rune for variables that should be reactive... Everything
 * else can be a normal variable." Both values here were `$state` while being
 * permanently `'dark'`: `setTheme` and `toggleTheme` are no-ops, so nothing
 * could ever write them. That is reactivity overhead and a misleading signal to
 * the next reader, who reasonably assumes a `$state` can change.
 *
 * The public shape is unchanged, so `+layout.svelte` and the `$lib` barrel are
 * untouched. The getters stay getters: if light/dark is ever restored, this
 * becomes reactive again by changing the two constants to `$state` and
 * implementing the setters, with no call-site churn.
 *
 * To re-enable a light/dark toggle: add localStorage persistence, a
 * `prefers-color-scheme` media query listener, and make `currentTheme` /
 * `resolvedTheme` reactive again. The file keeps the `.svelte.ts` extension for
 * exactly that reason.
 */

export type Theme = 'light' | 'dark' | 'system';

const currentTheme: Theme = 'dark';
const resolvedTheme: 'light' | 'dark' = 'dark';

export function initTheme(): void {
	if (typeof window === 'undefined') return;
	updateDocument();
}

export function cleanupTheme(): void {
	// No listeners to clean up in dark-only mode.
}

function updateDocument(): void {
	if (typeof document === 'undefined') return;

	const root = document.documentElement;
	root.setAttribute('data-theme', 'dark');
	root.style.colorScheme = 'dark';

	const metaThemeColor = document.querySelector('meta[name="theme-color"]');
	if (metaThemeColor) {
		metaThemeColor.setAttribute('content', '#000000');
	}
}

/** @deprecated Dark-only mode — setTheme is a no-op. */
export function setTheme(_theme: Theme): void {
	void _theme;
	// No-op: dark mode only.
}

/** @deprecated Dark-only mode — toggleTheme is a no-op. */
export function toggleTheme(): void {
	// No-op: dark mode only.
}

export function getTheme(): Theme {
	return currentTheme;
}

export function getResolvedTheme(): 'light' | 'dark' {
	return resolvedTheme;
}

export const theme = {
	get current() {
		return currentTheme;
	},
	get resolved() {
		return resolvedTheme;
	},
	set: setTheme,
	toggle: toggleTheme,
	init: initTheme,
	cleanup: cleanupTheme
};
