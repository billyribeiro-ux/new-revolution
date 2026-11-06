import { createHash } from 'node:crypto';
import { dev } from '$app/env';

/** Stable build artifact; development uses Vite's CSS request handler. */
export const brandStylesheetHref = dev ? '/src/app.css?direct' : '/brand-ui.css';

export function brandDocumentCsp(inlineStyle: string): string {
	return [
		"default-src 'none'",
		`style-src 'self' 'sha256-${createHash('sha256').update(inlineStyle).digest('base64')}'`,
		"font-src 'self'",
		"img-src 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		"base-uri 'none'"
	].join('; ');
}
