/** Hoist named entities and merge definitions while keeping references as references. */
export function consolidateJsonLdGraph<T extends { '@graph': unknown[] }>(schema: T): T {
	const entities = new Map<string, Record<string, unknown>>();
	function visit(value: unknown): unknown {
		if (Array.isArray(value)) return value.map(visit);
		if (!value || typeof value !== 'object') return value;
		const node = value as Record<string, unknown>;
		const id = typeof node['@id'] === 'string' ? node['@id'] : undefined;
		if (id && Object.keys(node).length === 1) return { '@id': id };
		const normalized = Object.fromEntries(
			Object.entries(node).map(([key, item]) => [key, visit(item)])
		);
		if (!id) return normalized;
		entities.set(id, { ...entities.get(id), ...normalized });
		return { '@id': id };
	}
	const anonymous = schema['@graph']
		.map(visit)
		.filter((node) => node && typeof node === 'object' && !('@id' in node));
	return { ...schema, '@graph': [...entities.values(), ...anonymous] };
}
