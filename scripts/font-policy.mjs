/**
 * Source-level font loading guard. Runtime browser checks remain necessary because
 * CMS content and compiled CSS are not fully described by source-text scanning.
 */

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
	if (/(?:https?:)?\/\/[^\s'"<>)]*\.(?:woff2?|ttf|otf|eot)(?:[?#][^\s'"<>)]*)?/i.test(source)) {
		violations.push('external font file URL');
	}
	if (/@import\s+(?:url\(\s*)?['"]?(?:https?:)?\/\//i.test(source)) {
		violations.push('external CSS import');
	}
	for (const link of source.matchAll(/<link\b[^>]*>/gi)) {
		if (
			/\brel\s*=\s*['"]stylesheet['"]/i.test(link[0]) &&
			/\bhref\s*=\s*['"](?:https?:)?\/\//i.test(link[0])
		) {
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
