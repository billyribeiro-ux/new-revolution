import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'p',
	'div',
	'span',
	'br',
	'hr',
	'a',
	'strong',
	'b',
	'em',
	'i',
	'u',
	's',
	'strike',
	'sub',
	'sup',
	'mark',
	'small',
	'abbr',
	'cite',
	'q',
	'time',
	'blockquote',
	'pre',
	'code',
	'ul',
	'ol',
	'li',
	'dl',
	'dt',
	'dd',
	'label',
	'figure',
	'figcaption',
	'img',
	'table',
	'caption',
	'colgroup',
	'col',
	'thead',
	'tbody',
	'tfoot',
	'tr',
	'th',
	'td',
	'iframe',
	'input',
	'kbd',
	'del',
	'ins'
];

const DISCARD_SUBTREE_TAGS = [
	'head',
	'script',
	'style',
	'textarea',
	'option',
	'xmp',
	'noscript',
	'template',
	'svg',
	'math',
	'form',
	'button',
	'select',
	'object',
	'embed',
	'canvas'
];

const GLOBAL_ALLOWED_CLASSES = new Set([
	'blog-image',
	'blog-image-figure',
	'alignleft',
	'aligncenter',
	'alignright',
	'wp-caption',
	'wp-caption-text',
	'callout',
	'callout--info',
	'callout--warning',
	'callout--success',
	'callout--danger',
	'twitter-embed',
	'vimeo-embed'
]);

const CODE_CLASS_REGEX = /^language-[a-z0-9-]+$/i;

const ALLOWED_IFRAME_HOSTS = new Set([
	'youtube.com',
	'www.youtube.com',
	'youtube-nocookie.com',
	'www.youtube-nocookie.com',
	'player.vimeo.com'
]);

const ALLOWED_IFRAME_PERMISSIONS = new Set([
	'accelerometer',
	'autoplay',
	'clipboard-write',
	'encrypted-media',
	'gyroscope',
	'picture-in-picture',
	'fullscreen',
	'web-share'
]);

const DATA_IMAGE_REGEX =
	/^data:image\/(?:png|jpe?g|gif|webp|avif);base64,[a-zA-Z0-9+/]+={0,2}$/;

const TWEET_URL_REGEX = /^https:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/;

export function isWordHtml(html: string): boolean {
	return (
		/class=["']?Mso/i.test(html) ||
		/style=["'][^"']*mso-/i.test(html) ||
		/<o:p[\s>]/i.test(html) ||
		/urn:schemas-microsoft-com:office/i.test(html)
	);
}

export function isGoogleDocsHtml(html: string): boolean {
	return /id=["']?docs-internal-guid-/i.test(html) || /data-sheets-value=/i.test(html);
}

function decodeHtmlEntitiesForSchemeCheck(raw: string): string {
	return raw
		.replace(/&#x([0-9a-f]+);?/gi, (_, hex) => {
			const code = parseInt(hex, 16);
			return Number.isNaN(code) ? '' : String.fromCodePoint(code);
		})
		.replace(/&#(\d+);?/g, (_, dec) => {
			const code = parseInt(dec, 10);
			return Number.isNaN(code) ? '' : String.fromCodePoint(code);
		})
		.replace(/&colon;/gi, ':')
		.replace(/&tab;/gi, '')
		.replace(/&newline;/gi, '')
		.replace(/[\u0000-\u0020\u007f-\u009f]+/g, '');
}

function isSafeUrl(
	rawUrl: string | undefined,
	allowedSchemes: readonly string[],
	allowRelative: boolean = true,
	allowDataImage: boolean = false
): boolean {
	if (!rawUrl) return false;
	const trimmed = rawUrl.trim();
	if (!trimmed) return false;

	// Disallow protocol-relative URLs
	if (trimmed.startsWith('//') || trimmed.startsWith('\\\\')) {
		return false;
	}

	const decoded = decodeHtmlEntitiesForSchemeCheck(trimmed);
	if (decoded.startsWith('//') || decoded.startsWith('\\\\')) {
		return false;
	}

	if (allowDataImage && DATA_IMAGE_REGEX.test(trimmed)) {
		return true;
	}

	// Check if there is an explicit scheme
	const schemeMatch = decoded.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
	if (schemeMatch) {
		const scheme = schemeMatch[1].toLowerCase();
		if (!allowedSchemes.includes(scheme)) {
			return false;
		}
		if (scheme === 'http' || scheme === 'https') {
			try {
				const parsed = new URL(trimmed);
				if (parsed.protocol !== `${scheme}:`) return false;
				return true;
			} catch {
				return false;
			}
		}
		return true;
	}

	// No scheme: allow safe relative URLs (`/path`, `#anchor`, `?query`, `path/file.webp`) if permitted
	if (!allowRelative) return false;
	if (decoded.includes(':')) return false;
	return true;
}

function sanitizeSrcset(rawSrcset: string | undefined): string | undefined {
	if (!rawSrcset) return undefined;
	if (/data:/i.test(rawSrcset) || /javascript:/i.test(rawSrcset)) {
		return undefined;
	}

	const candidates = rawSrcset
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);

	const validCandidates: string[] = [];
	for (const candidate of candidates) {
		const parts = candidate.split(/\s+/);
		if (parts.length === 0 || parts.length > 2) continue;
		const [url, descriptor] = parts;
		if (!isSafeUrl(url, ['http', 'https'], true, false)) continue;
		if (descriptor && !/^\d+(?:\.\d+)?[wx]$/.test(descriptor)) continue;
		validCandidates.push(descriptor ? `${url} ${descriptor}` : url);
	}

	return validCandidates.length > 0 ? validCandidates.join(', ') : undefined;
}

function isValidIframeSrc(rawSrc: string | undefined): string | undefined {
	if (!rawSrc) return undefined;
	const trimmed = rawSrc.trim();
	if (trimmed.startsWith('//')) return undefined;
	try {
		const url = new URL(trimmed);
		if (url.protocol !== 'https:') return undefined;
		if (url.username || url.password || url.port) return undefined;
		const host = url.hostname.toLowerCase();
		if (!ALLOWED_IFRAME_HOSTS.has(host)) return undefined;

		if (host.includes('youtube')) {
			if (!url.pathname.startsWith('/embed/') || url.pathname.length <= '/embed/'.length) {
				return undefined;
			}
		} else if (host === 'player.vimeo.com') {
			if (!/^\/video\/\d+/.test(url.pathname)) {
				return undefined;
			}
		} else {
			return undefined;
		}
		return url.toString();
	} catch {
		return undefined;
	}
}

function sanitizeIframeAllow(rawAllow: string | undefined): string | undefined {
	if (!rawAllow) return undefined;
	const tokens = rawAllow
		.split(';')
		.map((part) => part.trim().split(/\s+/)[0]?.toLowerCase())
		.filter((token): token is string => Boolean(token) && ALLOWED_IFRAME_PERMISSIONS.has(token));

	const unique = [...new Set(tokens)];
	return unique.length > 0 ? unique.join('; ') : undefined;
}

function isSafeCssColor(val: string): boolean {
	const v = val.trim();
	if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v)) {
		return true;
	}
	if (/^[a-zA-Z]{3,24}$/.test(v) && !/^(?:expression|url|javascript|inherit)$/i.test(v)) {
		return true;
	}
	if (
		/^(?:rgb|rgba|hsl|hsla|oklch)\(\s*[-+\d.,%\s/deg]+\s*\)$/i.test(v) &&
		v.length <= 64
	) {
		return true;
	}
	return false;
}

function isSafeCssLength(val: string): boolean {
	return /^\d+(?:\.\d+)?(?:px|pt|em|rem|%)$/i.test(val.trim());
}

function sanitizeStyleAttribute(tagName: string, rawStyle: string | undefined): string | undefined {
	if (!rawStyle) return undefined;
	// Reject CSS escapes, comments, blocks, or functions like url()/expression()
	if (/[\\{}<>]|\/\*|\*\/|url\s*\(|expression\s*\(|@import|javascript:/i.test(rawStyle)) {
		return undefined;
	}

	const declarations = rawStyle
		.split(';')
		.map((d) => d.trim())
		.filter(Boolean);

	const cleanDecls: string[] = [];
	for (const decl of declarations) {
		const colonIdx = decl.indexOf(':');
		if (colonIdx <= 0) continue;
		const prop = decl.slice(0, colonIdx).trim().toLowerCase();
		const value = decl.slice(colonIdx + 1).trim();
		if (!prop || !value || prop.startsWith('mso-')) continue;
		if (/[\\{}<>()]/.test(value) && !/^(?:rgb|rgba|hsl|hsla|oklch)\(/i.test(value)) continue;

		switch (prop) {
			case 'color':
			case 'background-color': {
				if (isSafeCssColor(value)) {
					cleanDecls.push(`${prop}: ${value}`);
				}
				break;
			}
			case 'font-family': {
				if (
					/^[\w\s'",-]+$/.test(value) &&
					value.length <= 120 &&
					!/expression|javascript|url/i.test(value)
				) {
					cleanDecls.push(`${prop}: ${value}`);
				}
				break;
			}
			case 'font-size': {
				if (
					/^(?:\d+(?:\.\d+)?(?:px|pt|em|rem|%)|xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger)$/i.test(
						value
					)
				) {
					cleanDecls.push(`${prop}: ${value}`);
				}
				break;
			}
			case 'font-style': {
				if (/^(?:normal|italic|oblique)$/i.test(value)) {
					cleanDecls.push(`${prop}: ${value.toLowerCase()}`);
				}
				break;
			}
			case 'font-weight': {
				if (/^(?:normal|bold|bolder|lighter|[1-9]00)$/i.test(value)) {
					cleanDecls.push(`${prop}: ${value.toLowerCase()}`);
				}
				break;
			}
			case 'letter-spacing': {
				if (/^(?:normal|-?\d+(?:\.\d+)?(?:px|em|rem))$/i.test(value)) {
					cleanDecls.push(`${prop}: ${value}`);
				}
				break;
			}
			case 'line-height': {
				if (/^(?:normal|\d+(?:\.\d+)?(?:px|em|rem|%)?)$/i.test(value)) {
					cleanDecls.push(`${prop}: ${value}`);
				}
				break;
			}
			case 'text-align': {
				if (/^(?:left|right|center|justify|start|end)$/i.test(value)) {
					cleanDecls.push(`${prop}: ${value.toLowerCase()}`);
				}
				break;
			}
			case 'text-decoration': {
				if (
					/^(?:none|underline|line-through|overline)(?:\s+(?:none|underline|line-through|overline|solid|double|dotted|dashed|wavy))*$/i.test(
						value
					)
				) {
					cleanDecls.push(`${prop}: ${value.toLowerCase()}`);
				}
				break;
			}
			case 'text-transform': {
				if (/^(?:none|capitalize|uppercase|lowercase)$/i.test(value)) {
					cleanDecls.push(`${prop}: ${value.toLowerCase()}`);
				}
				break;
			}
			case 'width':
			case 'min-width': {
				if (
					(tagName === 'table' || tagName === 'col' || tagName === 'th' || tagName === 'td') &&
					isSafeCssLength(value)
				) {
					cleanDecls.push(`${prop}: ${value}`);
				}
				break;
			}
			default:
				break;
		}
	}

	return cleanDecls.length > 0 ? cleanDecls.join('; ') : undefined;
}

function sanitizeNumericLengthAttr(val: string | undefined): string | undefined {
	if (!val) return undefined;
	const trimmed = val.trim();
	return /^\d{1,5}%?$/.test(trimmed) ? trimmed : undefined;
}

function sanitizePositiveSpanAttr(val: string | undefined): string | undefined {
	if (!val) return undefined;
	const trimmed = val.trim();
	return /^[1-9]\d{0,4}$/.test(trimmed) ? trimmed : undefined;
}

function sanitizeColwidthAttr(val: string | undefined): string | undefined {
	if (!val) return undefined;
	const trimmed = val.trim();
	return /^\d{1,5}(?:,\d{1,5})*$/.test(trimmed) ? trimmed : undefined;
}

function filterClasses(tagName: string, rawClass: string | undefined): string | undefined {
	if (!rawClass) return undefined;
	const tokens = rawClass.split(/\s+/).filter(Boolean);
	const allowed: string[] = [];

	for (const token of tokens) {
		if (/^Mso/i.test(token) || token.startsWith('ProseMirror')) continue;
		if (GLOBAL_ALLOWED_CLASSES.has(token)) {
			allowed.push(token);
			continue;
		}
		if (tagName === 'code' && CODE_CLASS_REGEX.test(token)) {
			allowed.push(token.toLowerCase());
		}
	}

	return allowed.length > 0 ? [...new Set(allowed)].join(' ') : undefined;
}

function preCleanWordAndGoogleDocs(html: string): string {
	return (
		html
			// Conditional comments and standard HTML comments
			.replace(/<!--[\s\S]*?-->/g, '')
			// Office XML / namespace elements like <o:p></o:p>
			.replace(/<\/?(?:o|w|m|v):[^>]*>/gi, '')
			// Google Docs wrapper <b style="font-weight:normal" ...> -> <span> with font-weight:normal removed
			.replace(
				/<b\b([^>]*?\bstyle=["'][^"']*font-weight\s*:\s*(?:normal|400)[^"']*["'][^>]*)>([\s\S]*?)<\/b>/gi,
				(_full, attrs: string, inner: string) => {
					const cleanedAttrs = attrs.replace(/font-weight\s*:\s*(?:normal|400)\s*;?/gi, '');
					return `<span${cleanedAttrs}>${inner}</span>`;
				}
			)
	);
}

function runSanitizePass(inputHtml: string): string {
	const preCleaned = preCleanWordAndGoogleDocs(inputHtml);

	const sanitized = sanitizeHtml(preCleaned, {
		allowedTags: ALLOWED_TAGS,
		nonTextTags: DISCARD_SUBTREE_TAGS,
		allowedAttributes: false,
		allowProtocolRelative: false,
		parseStyleAttributes: false,
		allowedSchemes: ['http', 'https', 'mailto', 'tel'],
		allowedSchemesByTag: {
			a: ['http', 'https', 'mailto', 'tel'],
			img: ['http', 'https', 'data'],
			iframe: ['https'],
			blockquote: ['http', 'https'],
			q: ['http', 'https']
		},
		exclusiveFilter(frame) {
			if (frame.tag === 'iframe') {
				return !frame.attribs.src;
			}
			if (frame.tag === 'input') {
				return frame.attribs.type !== 'checkbox';
			}
			return false;
		},
		transformTags: {
			'*': (tagName, attribs) => {
				let currentTag = tagName.toLowerCase();

				// Convert <b style="font-weight:normal"> to span and drop font-weight:normal
				if (
					currentTag === 'b' &&
					attribs.style &&
					/font-weight\s*:\s*(?:normal|400)\b/i.test(attribs.style)
				) {
					currentTag = 'span';
					attribs.style = attribs.style.replace(/font-weight\s*:\s*(?:normal|400)\s*;?/gi, '');
				}

				const cleanAttribs: Record<string, string> = {};

				// Global attributes: style, title, lang, dir, class (NEVER id)
				const cleanStyle = sanitizeStyleAttribute(currentTag, attribs.style);
				if (cleanStyle) cleanAttribs.style = cleanStyle;

				if (attribs.title && attribs.title.trim()) {
					cleanAttribs.title = attribs.title.trim();
				}
				if (attribs.lang && /^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(attribs.lang.trim())) {
					cleanAttribs.lang = attribs.lang.trim();
				}
				if (attribs.dir && /^(?:ltr|rtl|auto)$/i.test(attribs.dir.trim())) {
					cleanAttribs.dir = attribs.dir.trim().toLowerCase();
				}
				const cleanClass = filterClasses(currentTag, attribs.class);
				if (cleanClass) cleanAttribs.class = cleanClass;

				switch (currentTag) {
					case 'a': {
						if (isSafeUrl(attribs.href, ['http', 'https', 'mailto', 'tel'], true, false)) {
							cleanAttribs.href = attribs.href.trim();
						}
						const target = attribs.target?.trim();
						if (target === '_blank' || target === '_self') {
							cleanAttribs.target = target;
						}
						const existingRels = new Set(
							(attribs.rel ?? '')
								.toLowerCase()
								.split(/\s+/)
								.filter((r) =>
									['noopener', 'noreferrer', 'nofollow', 'ugc', 'sponsored'].includes(r)
								)
						);
						if (cleanAttribs.target === '_blank') {
							existingRels.add('noopener');
							existingRels.add('noreferrer');
						}
						if (existingRels.size > 0) {
							cleanAttribs.rel = [...existingRels].join(' ');
						}
						break;
					}
					case 'img': {
						if (isSafeUrl(attribs.src, ['http', 'https'], true, true)) {
							cleanAttribs.src = attribs.src.trim();
						}
						const cleanSrcset = sanitizeSrcset(attribs.srcset);
						if (cleanSrcset) cleanAttribs.srcset = cleanSrcset;
						if (attribs.sizes && attribs.sizes.trim() && !/[<>\\]/.test(attribs.sizes)) {
							cleanAttribs.sizes = attribs.sizes.trim();
						}
						if (attribs.alt !== undefined) {
							cleanAttribs.alt = attribs.alt;
						}
						const w = sanitizeNumericLengthAttr(attribs.width);
						if (w) cleanAttribs.width = w;
						const h = sanitizeNumericLengthAttr(attribs.height);
						if (h) cleanAttribs.height = h;
						if (attribs.loading && /^(?:lazy|eager)$/i.test(attribs.loading.trim())) {
							cleanAttribs.loading = attribs.loading.trim().toLowerCase();
						}
						if (attribs.decoding && /^(?:async|sync|auto)$/i.test(attribs.decoding.trim())) {
							cleanAttribs.decoding = attribs.decoding.trim().toLowerCase();
						}
						if (
							attribs['data-align'] &&
							/^(?:left|center|right)$/i.test(attribs['data-align'].trim())
						) {
							cleanAttribs['data-align'] = attribs['data-align'].trim().toLowerCase();
						}
						break;
					}
					case 'iframe': {
						const validSrc = isValidIframeSrc(attribs.src);
						if (validSrc) {
							cleanAttribs.src = validSrc;
						}
						const w = sanitizeNumericLengthAttr(attribs.width);
						if (w) cleanAttribs.width = w;
						const h = sanitizeNumericLengthAttr(attribs.height);
						if (h) cleanAttribs.height = h;
						if (attribs.frameborder && /^(?:0|1)$/.test(attribs.frameborder.trim())) {
							cleanAttribs.frameborder = attribs.frameborder.trim();
						}
						const cleanAllow = sanitizeIframeAllow(attribs.allow);
						if (cleanAllow) cleanAttribs.allow = cleanAllow;
						if (attribs.allowfullscreen !== undefined) {
							cleanAttribs.allowfullscreen = 'allowfullscreen';
						}
						if (attribs.loading && /^(?:lazy|eager)$/i.test(attribs.loading.trim())) {
							cleanAttribs.loading = attribs.loading.trim().toLowerCase();
						}
						break;
					}
					case 'div': {
						if (attribs['data-vimeo-id'] && /^\d{1,20}$/.test(attribs['data-vimeo-id'].trim())) {
							cleanAttribs['data-vimeo-id'] = attribs['data-vimeo-id'].trim();
						}
						const dw = sanitizeNumericLengthAttr(attribs['data-width']);
						if (dw) cleanAttribs['data-width'] = dw;
						const dh = sanitizeNumericLengthAttr(attribs['data-height']);
						if (dh) cleanAttribs['data-height'] = dh;
						if (attribs['data-youtube-video'] !== undefined) {
							cleanAttribs['data-youtube-video'] = '';
						}
						if (
							attribs['data-callout-type'] &&
							/^(?:info|warning|success|danger)$/i.test(attribs['data-callout-type'].trim())
						) {
							const calloutType = attribs['data-callout-type'].trim().toLowerCase();
							cleanAttribs['data-callout-type'] = calloutType;
						}
						break;
					}
					case 'blockquote': {
						if (isSafeUrl(attribs.cite, ['http', 'https'], true, false)) {
							cleanAttribs.cite = attribs.cite.trim();
						}
						if (attribs['data-tweet-url'] && TWEET_URL_REGEX.test(attribs['data-tweet-url'].trim())) {
							cleanAttribs['data-tweet-url'] = attribs['data-tweet-url'].trim();
						}
						break;
					}
					case 'q': {
						if (isSafeUrl(attribs.cite, ['http', 'https'], true, false)) {
							cleanAttribs.cite = attribs.cite.trim();
						}
						break;
					}
					case 'mark': {
						if (attribs['data-color'] && isSafeCssColor(attribs['data-color'])) {
							cleanAttribs['data-color'] = attribs['data-color'].trim();
						}
						break;
					}
					case 'ul': {
						if (attribs['data-type'] === 'taskList') {
							cleanAttribs['data-type'] = 'taskList';
						}
						break;
					}
					case 'ol': {
						if (attribs.start && /^\d{1,5}$/.test(attribs.start.trim())) {
							cleanAttribs.start = attribs.start.trim();
						}
						if (attribs.reversed !== undefined) {
							cleanAttribs.reversed = 'reversed';
						}
						if (attribs.type && /^[1aAiI]$/.test(attribs.type.trim())) {
							cleanAttribs.type = attribs.type.trim();
						}
						break;
					}
					case 'li': {
						if (attribs.value && /^\d{1,5}$/.test(attribs.value.trim())) {
							cleanAttribs.value = attribs.value.trim();
						}
						if (attribs['data-type'] === 'taskItem') {
							cleanAttribs['data-type'] = 'taskItem';
						}
						if (
							attribs['data-checked'] === 'true' ||
							attribs['data-checked'] === 'false'
						) {
							cleanAttribs['data-checked'] = attribs['data-checked'];
						}
						break;
					}
					case 'th': {
						const colspan = sanitizePositiveSpanAttr(attribs.colspan);
						if (colspan) cleanAttribs.colspan = colspan;
						const rowspan = sanitizePositiveSpanAttr(attribs.rowspan);
						if (rowspan) cleanAttribs.rowspan = rowspan;
						const colwidth = sanitizeColwidthAttr(attribs.colwidth);
						if (colwidth) cleanAttribs.colwidth = colwidth;
						if (attribs.scope && /^(?:col|row|colgroup|rowgroup)$/i.test(attribs.scope.trim())) {
							cleanAttribs.scope = attribs.scope.trim().toLowerCase();
						}
						break;
					}
					case 'td': {
						const colspan = sanitizePositiveSpanAttr(attribs.colspan);
						if (colspan) cleanAttribs.colspan = colspan;
						const rowspan = sanitizePositiveSpanAttr(attribs.rowspan);
						if (rowspan) cleanAttribs.rowspan = rowspan;
						const colwidth = sanitizeColwidthAttr(attribs.colwidth);
						if (colwidth) cleanAttribs.colwidth = colwidth;
						break;
					}
					case 'col': {
						const span = sanitizePositiveSpanAttr(attribs.span);
						if (span) cleanAttribs.span = span;
						const w = sanitizeNumericLengthAttr(attribs.width);
						if (w) cleanAttribs.width = w;
						break;
					}
					case 'colgroup': {
						const span = sanitizePositiveSpanAttr(attribs.span);
						if (span) cleanAttribs.span = span;
						break;
					}
					case 'time': {
						if (attribs.datetime && /^[\dT:+-Z.\sW]{4,40}$/.test(attribs.datetime.trim())) {
							cleanAttribs.datetime = attribs.datetime.trim();
						}
						break;
					}
					case 'input': {
						if (attribs.type?.trim().toLowerCase() === 'checkbox') {
							cleanAttribs.type = 'checkbox';
							if (attribs.checked !== undefined) {
								cleanAttribs.checked = 'checked';
							}
							if (attribs.disabled !== undefined) {
								cleanAttribs.disabled = 'disabled';
							}
						}
						break;
					}
					default:
						break;
				}

				return {
					tagName: currentTag,
					attribs: cleanAttribs
				};
			}
		}
	});

	return sanitized;
}

function unwrapAttributelessSpans(html: string): string {
	let current = html;
	let previous = '';
	while (current !== previous) {
		previous = current;
		current = current.replace(/<span>([\s\S]*?)<\/span>/g, '$1');
	}
	return current;
}

function postProcessParagraphsAndBreaks(html: string): string {
	// 1. Convert 3 or more consecutive <br> inside a <p> into paragraph breaks
	let processed = html.replace(/<p(\b[^>]*)>([\s\S]*?)<\/p>/gi, (full, attrs, inner) => {
		if (/(?:<br\s*\/?>\s*){3,}/i.test(inner)) {
			const segments = inner.split(/(?:<br\s*\/?>\s*){3,}/i);
			return segments.map((seg: string) => `<p${attrs}>${seg}</p>`).join('');
		}
		return full;
	});

	// 2. Remove empty or NBSP-only paragraphs
	processed = processed.replace(
		/<p(?:\b[^>]*)?>(?:\s|&nbsp;|\u00a0|<br\s*\/?>)*<\/p>/gi,
		''
	);

	return processed;
}

/**
 * Shared HTML sanitizer used on server write, server read, autosave, editor paste, and HTML source mode.
 * Strictly idempotent: `sanitizePostHtml(sanitizePostHtml(x)) === sanitizePostHtml(x)`.
 */
export function sanitizePostHtml(rawHtml: string): string {
	if (!rawHtml || !rawHtml.trim()) return '';

	const firstPass = unwrapAttributelessSpans(runSanitizePass(rawHtml));
	const postProcessed = postProcessParagraphsAndBreaks(firstPass);

	if (postProcessed !== firstPass) {
		const secondPass = unwrapAttributelessSpans(runSanitizePass(postProcessed));
		return postProcessParagraphsAndBreaks(secondPass).trim();
	}

	return postProcessed.trim();
}
