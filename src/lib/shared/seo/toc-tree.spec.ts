import { describe, expect, it } from 'vite-plus/test';
import { buildTocTree, normalizePostHeadings, type TocEntry } from './toc';

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

describe('published heading identifiers', () => {
	it('preserves numeric heading identifiers and keeps duplicate TOC targets unique', () => {
		const { html, toc } = normalizePostHeadings(
			'<h2>1. What 0DTE Changes About the Trade</h2><h3>1. What 0DTE Changes About the Trade</h3>'
		);
		expect(toc.map((item) => item.id)).toEqual([
			'1-what-0dte-changes-about-the-trade',
			'1-what-0dte-changes-about-the-trade-2'
		]);
		for (const item of toc) expect(html).toContain(`id="${item.id}"`);
	});
});
