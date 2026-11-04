import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as PmNode } from '@tiptap/pm/model';

export interface SearchMatchRange {
	from: number;
	to: number;
}

export interface FindAndReplaceStorage {
	searchTerm: string;
	replaceTerm: string;
	caseSensitive: boolean;
	results: SearchMatchRange[];
	currentIndex: number;
}

export const findAndReplacePluginKey = new PluginKey('findAndReplace');

export function findMatchesInDoc(
	doc: PmNode,
	searchTerm: string,
	caseSensitive: boolean
): SearchMatchRange[] {
	if (!searchTerm) return [];
	const needle = caseSensitive ? searchTerm : searchTerm.toLowerCase();
	if (!needle) return [];

	const results: SearchMatchRange[] = [];

	doc.descendants((node, pos) => {
		if (!node.isText || !node.text) return;
		const haystack = caseSensitive ? node.text : node.text.toLowerCase();
		let searchStart = 0;
		while (searchStart <= haystack.length - needle.length) {
			const idx = haystack.indexOf(needle, searchStart);
			if (idx === -1) break;
			results.push({
				from: pos + idx,
				to: pos + idx + needle.length
			});
			searchStart = idx + Math.max(1, needle.length);
		}
	});

	return results;
}

declare module '@tiptap/core' {
	interface Storage {
		findAndReplace: FindAndReplaceStorage;
	}
	interface Commands<ReturnType> {
		findAndReplace: {
			setSearchTerm: (searchTerm: string) => ReturnType;
			setReplaceTerm: (replaceTerm: string) => ReturnType;
			setCaseSensitive: (caseSensitive: boolean) => ReturnType;
			nextSearchResult: () => ReturnType;
			previousSearchResult: () => ReturnType;
			replaceCurrentMatch: () => ReturnType;
			replaceAllMatches: () => ReturnType;
			clearSearch: () => ReturnType;
		};
	}
}

export const FindAndReplace = Extension.create<Record<string, never>, FindAndReplaceStorage>({
	name: 'findAndReplace',

	addStorage() {
		return {
			searchTerm: '',
			replaceTerm: '',
			caseSensitive: false,
			results: [],
			currentIndex: 0
		};
	},

	addCommands() {
		return {
			setSearchTerm:
				(searchTerm: string) =>
				({ state, dispatch }) => {
					this.storage.searchTerm = searchTerm;
					this.storage.results = findMatchesInDoc(
						state.doc,
						this.storage.searchTerm,
						this.storage.caseSensitive
					);
					this.storage.currentIndex = 0;
					if (dispatch) {
						dispatch(state.tr.setMeta(findAndReplacePluginKey, { updated: true }));
					}
					return true;
				},
			setReplaceTerm:
				(replaceTerm: string) =>
				({ state, dispatch }) => {
					this.storage.replaceTerm = replaceTerm;
					if (dispatch) {
						dispatch(state.tr.setMeta(findAndReplacePluginKey, { updated: true }));
					}
					return true;
				},
			setCaseSensitive:
				(caseSensitive: boolean) =>
				({ state, dispatch }) => {
					this.storage.caseSensitive = caseSensitive;
					this.storage.results = findMatchesInDoc(
						state.doc,
						this.storage.searchTerm,
						this.storage.caseSensitive
					);
					this.storage.currentIndex = 0;
					if (dispatch) {
						dispatch(state.tr.setMeta(findAndReplacePluginKey, { updated: true }));
					}
					return true;
				},
			nextSearchResult:
				() =>
				({ state, dispatch }) => {
					const count = this.storage.results.length;
					if (count === 0) return false;
					this.storage.currentIndex = (this.storage.currentIndex + 1) % count;
					if (dispatch) {
						dispatch(state.tr.setMeta(findAndReplacePluginKey, { updated: true }));
					}
					return true;
				},
			previousSearchResult:
				() =>
				({ state, dispatch }) => {
					const count = this.storage.results.length;
					if (count === 0) return false;
					this.storage.currentIndex = (this.storage.currentIndex - 1 + count) % count;
					if (dispatch) {
						dispatch(state.tr.setMeta(findAndReplacePluginKey, { updated: true }));
					}
					return true;
				},
			replaceCurrentMatch:
				() =>
				({ state, dispatch }) => {
					const matches = findMatchesInDoc(
						state.doc,
						this.storage.searchTerm,
						this.storage.caseSensitive
					);
					if (matches.length === 0) return false;
					const idx = Math.min(this.storage.currentIndex, matches.length - 1);
					const match = matches[idx];
					if (!match) return false;

					const tr = state.tr.insertText(this.storage.replaceTerm, match.from, match.to);
					this.storage.results = findMatchesInDoc(
						tr.doc,
						this.storage.searchTerm,
						this.storage.caseSensitive
					);
					if (this.storage.currentIndex >= this.storage.results.length) {
						this.storage.currentIndex = 0;
					}
					tr.setMeta(findAndReplacePluginKey, { updated: true });
					if (dispatch) {
						dispatch(tr);
					}
					return true;
				},
			replaceAllMatches:
				() =>
				({ state, dispatch }) => {
					const matches = findMatchesInDoc(
						state.doc,
						this.storage.searchTerm,
						this.storage.caseSensitive
					);
					if (matches.length === 0) return false;

					// Dispatch a single transaction in reverse document order so Cmd/Ctrl+Z undoes all at once (Section 10.6)
					const tr = state.tr;
					for (let i = matches.length - 1; i >= 0; i--) {
						const m = matches[i];
						if (m) {
							tr.insertText(this.storage.replaceTerm, m.from, m.to);
						}
					}
					this.storage.results = [];
					this.storage.currentIndex = 0;
					tr.setMeta(findAndReplacePluginKey, { updated: true });
					if (dispatch) {
						dispatch(tr);
					}
					return true;
				},
			clearSearch:
				() =>
				({ state, dispatch }) => {
					this.storage.searchTerm = '';
					this.storage.replaceTerm = '';
					this.storage.results = [];
					this.storage.currentIndex = 0;
					if (dispatch) {
						dispatch(state.tr.setMeta(findAndReplacePluginKey, { updated: true }));
					}
					return true;
				}
		};
	},

	addProseMirrorPlugins() {
		const storage = this.storage;

		return [
			new Plugin({
				key: findAndReplacePluginKey,
				state: {
					init() {
						return DecorationSet.empty;
					},
					apply(tr, _old, _oldState, newState) {
						if (!storage.searchTerm) {
							storage.results = [];
							return DecorationSet.empty;
						}
						if (tr.docChanged || tr.getMeta(findAndReplacePluginKey)) {
							storage.results = findMatchesInDoc(
								newState.doc,
								storage.searchTerm,
								storage.caseSensitive
							);
						}
						if (storage.results.length === 0) {
							return DecorationSet.empty;
						}
						const activeIdx = Math.min(storage.currentIndex, storage.results.length - 1);
						const decorations = storage.results.map((range, i) =>
							Decoration.inline(range.from, range.to, {
								class: i === activeIdx ? 'search-result search-result-current' : 'search-result'
							})
						);
						return DecorationSet.create(newState.doc, decorations);
					}
				},
				props: {
					decorations(state) {
						return this.getState(state);
					}
				}
			})
		];
	}
});
