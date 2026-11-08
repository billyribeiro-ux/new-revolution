/** Intentional website/editor roles. Fontsource CSS imports stay in app.css. */
export const BRAND_FONT_DISPLAY = 'var(--font-display)';
export const BRAND_FONT_BODY = 'var(--font-sans)';

/** Normalize recognized legacy stacks without admitting arbitrary CSS. */
export function normalizeBrandFont(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const clean = value.trim();
	if (clean === BRAND_FONT_DISPLAY || clean === BRAND_FONT_BODY) return clean;
	if (clean.length > 200 || !/^[a-zA-Z\s,'"-]+$/.test(clean)) return null;
	const first = clean
		.split(',')[0]
		.trim()
		.replace(/^(['"])(.*)\1$/, '$2')
		.toLowerCase();
	if (
		first === 'montserrat' ||
		first === 'montserrat variable' ||
		first === 'geist mono' ||
		first === 'geist mono variable'
	)
		return BRAND_FONT_DISPLAY;
	if (
		first === 'sofia sans' ||
		first === 'sofia sans variable' ||
		first === 'geist' ||
		first === 'geist sans' ||
		first === 'geist variable'
	)
		return BRAND_FONT_BODY;
	return null;
}
