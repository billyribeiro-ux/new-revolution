import { describe, expect, it } from 'vite-plus/test';
import { buildTocTree, type TocEntry } from './toc';

describe('buildTocTree', () => {
	it('preserves heading order and nests under the nearest shallower heading', () => {
		const entries: TocEntry[] = [
			{ id: 'a', text: 'A', level: 2 },
			{ id: 'b', text: 'B', level: 4 },
			{ id: 'c', text: 'C', level: 3 },
			{ id: 'd', text: 'D', level: 4 },
			{ id: 'e', text: 'E', level: 2 }
		];
		const tree = buildTocTree(entries);
		expect(tree.map((node) => node.id)).toEqual(['a', 'e']);
		expect(tree[0].children.map((node) => node.id)).toEqual(['b', 'c']);
		expect(tree[0].children[1].children.map((node) => node.id)).toEqual(['d']);
		expect(entries[0]).not.toHaveProperty('children');
		expect(buildTocTree([])).toEqual([]);
	});
});
