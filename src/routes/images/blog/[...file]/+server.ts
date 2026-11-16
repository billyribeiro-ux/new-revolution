import { svgBrandFontStyle } from '#lib/server/svg-brand-font';
import type { RequestHandler } from './$types';
import { eq, or } from 'drizzle-orm';
import { ensureDbReady } from '#lib/server/db';
import { media } from '#lib/server/db/schema';

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
	const words = text.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return [];
	const lines: string[] = [];
	let current = '';

	for (const word of words) {
		const candidate = current ? `${current} ${word}` : word;
		if (candidate.length <= maxChars) {
			current = candidate;
		} else {
			if (current) lines.push(current);
			current = word;
			if (lines.length >= maxLines - 1) break;
		}
	}
	if (current && lines.length < maxLines) {
		lines.push(current);
	}
	return lines;
}

export const GET: RequestHandler = async ({ params }) => {
	const fileParam = (params.file ?? '').replace(/^\/+/, '');
	const targetUrl = `/images/blog/${fileParam}`;
	const fallback1200Url = targetUrl.replace(/-(?:480|800)w(\.[a-z0-9]+)$/i, '-1200w$1');
	const fallbackBaseUrl = targetUrl.replace(/-(?:480|800|1200)w(\.[a-z0-9]+)$/i, '$1');

	let title = fileParam.replace(/\.[a-z0-9]+$/i, '').replace(/-/g, ' ');
	let altText = '';
	let caption = '';
	let description = '';
	let width = fileParam.includes('cover') ? 1200 : 1200;
	let height = fileParam.includes('cover') ? 630 : 675;

	try {
		const db = await ensureDbReady();
		const [record] = await db
			.select()
			.from(media)
			.where(
				or(
					eq(media.blobUrl, targetUrl),
					eq(media.blobUrl, fallback1200Url),
					eq(media.blobUrl, fallbackBaseUrl)
				)
			)
			.limit(1);

		if (record) {
			title = record.title || title;
			altText = record.altText || '';
			caption = record.caption || '';
			description = record.description || '';
			if (record.width && record.width > 0) width = record.width;
			if (record.height && record.height > 0) height = record.height;
		}
	} catch {
		// Fall back to filename metadata if DB lookup fails
	}

	const titleLines = wrapLines(title, 78, 2);
	const altLines = wrapLines(altText || 'Pending alt text', 92, 2);
	const captionLines = caption ? wrapLines(caption, 92, 2) : [];
	const descLines = wrapLines(
		description || 'Placeholder reserved for custom graphic creation.',
		94,
		7
	);

	let y = 118;
	const svgBlocks: string[] = [];

	// Title block
	svgBlocks.push(
		`<text x="56" y="${y}" fill="#dcff65" font-size="13" font-weight="700" letter-spacing="1.5">IMAGE TITLE</text>`
	);
	y += 26;
	for (const line of titleLines) {
		svgBlocks.push(
			`<text x="56" y="${y}" fill="#f4f6f8" font-size="22" font-weight="700">${escapeXml(line)}</text>`
		);
		y += 28;
	}

	y += 14;
	// Alt Text block
	svgBlocks.push(
		`<text x="56" y="${y}" fill="#38bdf8" font-size="13" font-weight="700" letter-spacing="1.5">ALT TEXT (SEO &amp; ACCESSIBILITY)</text>`
	);
	y += 22;
	for (const line of altLines) {
		svgBlocks.push(
			`<text x="56" y="${y}" fill="#d0d7de" font-size="16" font-weight="500">${escapeXml(line)}</text>`
		);
		y += 22;
	}

	if (captionLines.length > 0) {
		y += 12;
		svgBlocks.push(
			`<text x="56" y="${y}" fill="#dec3a1" font-size="13" font-weight="700" letter-spacing="1.5">CAPTION</text>`
		);
		y += 22;
		for (const line of captionLines) {
			svgBlocks.push(
				`<text x="56" y="${y}" fill="#b8c0c8" font-size="15">${escapeXml(line)}</text>`
			);
			y += 21;
		}
	}

	y += 14;
	// Description block
	svgBlocks.push(
		`<text x="56" y="${y}" fill="#dcff65" font-size="13" font-weight="700" letter-spacing="1.5">VISUAL IMAGE DESCRIPTION (DESIGN / GENERATION SPEC)</text>`
	);
	y += 22;
	for (const line of descLines) {
		svgBlocks.push(`<text x="56" y="${y}" fill="#9ca3af" font-size="15">${escapeXml(line)}</text>`);
		y += 21;
	}

	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(altText || title)}">
	${svgBrandFontStyle}
	<defs>
		<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
			<path d="M 40 0 L 0 0 0 40" fill="none" stroke="#18202c" stroke-width="1" />
		</pattern>
	</defs>
	<rect width="${width}" height="${height}" fill="#0b0e12" />
	<rect width="${width}" height="${height}" fill="url(#grid)" />
	<rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="12" fill="#11161d" fill-opacity="0.92" stroke="#2a3441" stroke-width="2" stroke-dasharray="8 6" />
	<rect x="56" y="48" width="290" height="30" rx="6" fill="#dcff65" />
	<text x="70" y="68" fill="#0b0e12" font-size="13" font-weight="800" letter-spacing="1.2">IMAGE PLACEHOLDER · TO BE CREATED</text>
	<text x="${width - 56}" y="68" text-anchor="end" fill="#8b949e" font-size="13">${escapeXml(targetUrl)} (${width}×${height})</text>
	<line x1="56" y1="90" x2="${width - 56}" y2="90" stroke="#222b38" stroke-width="1" />
	${svgBlocks.join('\n\t')}
</svg>`;

	return new Response(svg, {
		status: 200,
		headers: {
			'Content-Type': 'image/svg+xml; charset=utf-8',
			'Cache-Control': 'no-cache'
		}
	});
};
