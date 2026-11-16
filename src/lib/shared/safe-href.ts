/**
 * Schemes an admin-authored call-to-action link may use. Anything else
 * (`javascript:`, `data:`, `vbscript:`, `file:`, `blob:` ...) is dropped.
 */
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/** Stand-in origin so relative paths parse; it never leaves this function. */
const RELATIVE_BASE = 'https://relative.invalid/';

/**
 * Return `value` (trimmed) when it is safe to put in an `href`, otherwise
 * `undefined`. Relative paths and fragments are allowed, as are http(s),
 * mailto: and tel: links.
 *
 * The scheme is read with the WHATWG URL parser, the same algorithm the
 * browser runs on the `href`, so tricks the browser would normalise away
 * (`java\tscript:`, leading control characters, mixed case) are seen exactly
 * as the browser would see them.
 */
export function safeCtaHref(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined;
	const href = value.trim();
	if (href === '') return undefined;
	let protocol: string;
	try {
		protocol = new URL(href, RELATIVE_BASE).protocol;
	} catch {
		return undefined;
	}
	return ALLOWED_PROTOCOLS.has(protocol) ? href : undefined;
}
