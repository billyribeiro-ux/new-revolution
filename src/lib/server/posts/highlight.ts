import { createHighlighter, type Highlighter } from 'shiki';

export const SUPPORTED_CODE_LANGUAGES = [
	'javascript',
	'typescript',
	'tsx',
	'jsx',
	'svelte',
	'html',
	'css',
	'json',
	'bash',
	'shell',
	'sql',
	'python',
	'go',
	'rust',
	'yaml',
	'markdown',
	'xml',
	'diff'
] as const;

export type SupportedCodeLanguage = (typeof SUPPORTED_CODE_LANGUAGES)[number];

const SUPPORTED_LANG_SET = new Set<string>(SUPPORTED_CODE_LANGUAGES);

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Returns a cached Shiki highlighter promise, resetting the cache if initialization rejects (Section 10.9).
 */
export function getCodeHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: ['github-dark'],
			langs: [...SUPPORTED_CODE_LANGUAGES]
		}).catch((err) => {
			highlighterPromise = null;
			throw err;
		});
	}
	return highlighterPromise;
}

export function resetHighlighterCacheForTest(): void {
	highlighterPromise = null;
}

function decodeHtmlEntitiesInCode(encoded: string): string {
	return encoded
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&amp;/g, '&');
}

export async function highlightPostCodeBlocks(html: string): Promise<string> {
	if (!html || !/<pre\b[^>]*>\s*<code\b/i.test(html)) {
		return html;
	}

	let highlighter: Highlighter;
	try {
		highlighter = await getCodeHighlighter();
	} catch (err) {
		console.warn(
			'[shiki] Failed to initialize code highlighter, serving unhighlighted blocks:',
			err
		);
		return html;
	}

	return html.replace(
		/<pre\b[^>]*>\s*<code(\b[^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi,
		(fullMatch, codeAttrs: string, rawCode: string) => {
			const langMatch = codeAttrs.match(/\bclass\s*=\s*["'][^"']*?\blanguage-([a-z0-9-]+)\b/i);
			const requestedLang = langMatch ? langMatch[1].toLowerCase() : 'text';
			const lang = SUPPORTED_LANG_SET.has(requestedLang) ? requestedLang : 'text';
			const decodedCode = decodeHtmlEntitiesInCode(rawCode);

			try {
				return highlighter.codeToHtml(decodedCode, {
					lang,
					theme: 'github-dark'
				});
			} catch (err) {
				console.warn(`[shiki] Failed to highlight block for language "${requestedLang}":`, err);
				return fullMatch;
			}
		}
	);
}
