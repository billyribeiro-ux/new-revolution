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
		const tag = link[0];
		const href = /\bhref\s*=\s*['"]((?:https?:)?\/\/[^'"]+)['"]/i.exec(tag);
		if (/\brel\s*=\s*['"]stylesheet['"]/i.test(tag) && href && isExternalUrl(href[1])) {
			violations.push('externally hosted stylesheet link');
		}
		if (
			/\bas\s*=\s*['"]font['"]/i.test(tag) ||
			/\btype\s*=\s*['"]font\//i.test(tag) ||
			/\bhref\s*=\s*['"][^'"]*\.(?:woff2?|ttf|otf|eot)(?:[?#][^'"]*)?['"]/i.test(tag)
		) {
			violations.push('font link href is forbidden');
		}
	}
	const svgFontAsset = filename === 'src/lib/server/svg-brand-font.ts';
	if (filename !== 'src/app.css' && !svgFontAsset) {
		if (source.includes('@fontsource-variable/'))
			violations.push('Fontsource import outside src/app.css');
		if (/@font-face\b/i.test(source)) violations.push('@font-face outside src/app.css');
	}
	if (/\.(?:attr|style)\(\s*['"]font-family['"]\s*,\s*['"](?!var\(--font-)/.test(source)) {
		violations.push('chart font bypasses the shared font tokens');
	}
	// Transport email HTML has client fallback stacks; website/admin typography does not.
	if (
		filename !== 'src/app.css' &&
		!svgFontAsset &&
		!/^src\/lib\/server\/(?:email\/|waitlist\/email\.ts$)/.test(filename)
	) {
		for (const match of source.matchAll(/font-family\s*:\s*([^;}\n]+)/g)) {
			const family = match[1].trim();
			if (
				!/^(?:var\(--font-(?:display|sans|mono|heading|body)\)|inherit\b|unset\b|revert\b|\$\{)/.test(
					family
				)
			) {
				violations.push('intentional font family bypasses the two brand roles');
			}
		}
		if (
			/font\s*:[^;}\n]*(?:system-ui|Arial|Helvetica|Georgia|monospace|sans-serif)/i.test(source)
		) {
			violations.push('font shorthand bypasses the two brand roles');
		}
	}

	return [...new Set(violations)];
}
