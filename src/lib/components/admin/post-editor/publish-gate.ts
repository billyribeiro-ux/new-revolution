/**
 * Parses the text of a publish-gate refusal (`SEO_GATE_BLOCKED: ...`, produced by
 * `enforcePublishSeoGate` in `src/lib/shared/seo/score.ts`) into structured parts, so the editor can
 * list each issue as its own item instead of showing one raw multi-line string.
 *
 * Format produced by the server:
 *   SEO_GATE_BLOCKED: SEO score is 0/100 (minimum required: 80/100 with zero blocking errors).
 *   <blank>
 *   Errors (items marked [BLOCKING] stop publishing on their own):
 *   - [BLOCKING] Missing meta title (-10)
 *   - No focus keyword (-8)
 *   <blank>
 *   Top warnings:
 *   - Meta description is short (-5)
 */

export const SEO_GATE_PREFIX = 'SEO_GATE_BLOCKED:';

export interface PublishGateIssue {
	/** Issue text without the list marker, the [BLOCKING] tag, or the points suffix. */
	message: string;
	/** Points deducted, parsed from the trailing "(-N)" when present. */
	points: number | null;
	blocking: boolean;
}

export interface PublishGateRefusal {
	/** First line, e.g. "SEO score is 0/100 (minimum required: 80/100 with zero blocking errors)." */
	summary: string;
	errors: PublishGateIssue[];
	warnings: PublishGateIssue[];
}

/** Returns `null` when the text is not a publish-gate refusal, so callers can fall back to the raw message. */
export function parsePublishGateRefusal(text: string): PublishGateRefusal | null {
	const trimmed = text.trim();
	if (!trimmed.startsWith(SEO_GATE_PREFIX)) return null;

	const lines = trimmed.slice(SEO_GATE_PREFIX.length).trim().split('\n');
	const summary = (lines.shift() ?? '').trim();
	const refusal: PublishGateRefusal = { summary, errors: [], warnings: [] };

	let section: 'errors' | 'warnings' | null = null;
	for (const raw of lines) {
		const line = raw.trim();
		if (line === '') continue;
		if (line.startsWith('Errors')) {
			section = 'errors';
			continue;
		}
		if (line.startsWith('Top warnings')) {
			section = 'warnings';
			continue;
		}
		if (line.startsWith('- ') && section) {
			refusal[section].push(parseIssueLine(line.slice(2)));
		}
	}
	return refusal;
}

function parseIssueLine(body: string): PublishGateIssue {
	let rest = body;
	let blocking = false;
	if (rest.startsWith('[BLOCKING] ')) {
		blocking = true;
		rest = rest.slice('[BLOCKING] '.length);
	}
	let points: number | null = null;
	const match = rest.match(/\s\(-(\d+)\)$/);
	if (match) {
		points = Number(match[1]);
		rest = rest.slice(0, match.index);
	}
	return { message: rest.trim(), points, blocking };
}
