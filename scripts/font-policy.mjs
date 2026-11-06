import { SITE_ORIGIN } from '../src/lib/shared/site-origin.ts';

/**
 * Source-level font loading guard. Runtime browser checks remain necessary because
 * CMS content and compiled CSS are not fully described by source-text scanning.
 */

/** @param {string} value */
function isExternalUrl(value) {
	try {
		return new URL(value, SITE_ORIGIN).origin !== SITE_ORIGIN;
	} catch {
		return true;
	}
}

/**
 * @param {string} filename Repository-relative POSIX path.
 * @param {string} source
 * @returns {string[]}
 */
export function findFontPolicyViolations(filename, source) {
	if (/\.(?:spec|test|e2e)\.[cm]?[jt]s$/.test(filename)) return [];
	const violations = [];
	if (
		/(?:https?:)?\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com|fonts\.bunny\.net|use\.typekit\.net|fonts\.adobe\.com|api\.fontshare\.com|fonts\.cdnfonts\.com)(?:[/:]|$)/i.test(
			source
		)
	) {
		violations.push('external font provider reference');
	}
	for (const match of source.matchAll(
		/(?:https?:)?\/\/[^\s'"<>)]*\.(?:woff2?|ttf|otf|eot)(?:[?#][^\s'"<>)]*)?/gi
	)) {
		if (isExternalUrl(match[0])) violations.push('external font file URL');
	}
	for (const match of source.matchAll(
		/@import\s+(?:url\(\s*)?['"]?((?:https?:)?\/\/[^\s'";)]+)/gi
	)) {
		if (isExternalUrl(match[1])) violations.push('external CSS import');
	}
	for (const link of source.matchAll(/<link\b[^>]*>/gi)) {
		const href = /\bhref\s*=\s*['"]((?:https?:)?\/\/[^'"]+)['"]/i.exec(link[0]);
		if (/\brel\s*=\s*['"]stylesheet['"]/i.test(link[0]) && href && isExternalUrl(href[1])) {
			violations.push('externally hosted stylesheet link');
		}
	}
	if (filename !== 'src/app.css') {
		if (source.includes('@fontsource-variable/'))
			violations.push('Fontsource import outside src/app.css');
		if (/@font-face\b/i.test(source)) violations.push('@font-face outside src/app.css');
	}
	if (/\.(?:attr|style)\(\s*['"]font-family['"]\s*,\s*['"](?!var\(--font-)/.test(source)) {
		violations.push('chart font bypasses the shared font tokens');
	}
	return [...new Set(violations)];
}
