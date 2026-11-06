/** One normalization contract for stored search text and incoming literal keyword queries. */
export function normalizeBlogSearch(value: string): string {
	// HTML replaces NUL with U+FFFD; PostgreSQL text cannot store NUL decoded from legacy JSON.
	return value.normalize('NFKC').replaceAll('\u0000', '\uFFFD').replace(/\s+/gu, ' ').trim();
}

export interface ParsedPostCustomFields {
	values: ReadonlyMap<string, string>;
	malformed: boolean;
	/** Any explicit true wins if a legacy array contains conflicting duplicate flags. */
	excludeFromSearch: boolean;
}

/** The CMS accepts either key/value records or a flat string map, independent of serialization. */
export function parsePostCustomFields(raw: string | null | undefined): ParsedPostCustomFields {
	const values = new Map<string, string>();
	let excludeFromSearch = false;
	if (!raw?.trim()) return { values, malformed: false, excludeFromSearch };
	try {
		const parsed: unknown = JSON.parse(raw);
		let entries: Array<[string, string]>;
		if (Array.isArray(parsed)) {
			entries = [];
			for (const item of parsed) {
				if (
					typeof item !== 'object' ||
					item === null ||
					Array.isArray(item) ||
					!('key' in item) ||
					typeof item.key !== 'string' ||
					!('value' in item) ||
					typeof item.value !== 'string'
				)
					return { values, malformed: true, excludeFromSearch: true };
				entries.push([item.key, item.value]);
			}
		} else if (typeof parsed === 'object' && parsed !== null) {
			entries = [];
			for (const [key, value] of Object.entries(parsed)) {
				if (typeof value !== 'string') return { values, malformed: true, excludeFromSearch: true };
				entries.push([key, value]);
			}
		} else return { values, malformed: true, excludeFromSearch: true };
		for (const [key, value] of entries) {
			values.set(key, value);
			if (key === '__excludeFromSearch' && value === 'true') excludeFromSearch = true;
		}
		return { values, malformed: false, excludeFromSearch };
	} catch {
		return { values, malformed: true, excludeFromSearch: true };
	}
}
