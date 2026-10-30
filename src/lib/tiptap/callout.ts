import { Node, mergeAttributes, wrappingInputRule } from '@tiptap/core';

export type CalloutType = 'info' | 'tip' | 'warning' | 'danger';
export const CALLOUT_TYPES: readonly CalloutType[] = ['info', 'tip', 'warning', 'danger'] as const;

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		callout: {
			setCallout: (attributes?: { type?: CalloutType }) => ReturnType;
			toggleCallout: (attributes?: { type?: CalloutType }) => ReturnType;
			unsetCallout: () => ReturnType;
		};
	}
}

export const Callout = Node.create({
	name: 'callout',
	group: 'block',
	content: 'block+',
	defining: true,

	addAttributes() {
		return {
			type: {
				default: 'info' as CalloutType,
				parseHTML: (element) => {
					const raw =
						element.getAttribute('data-callout') ||
						element.getAttribute('data-callout-type') ||
						'info';
					return CALLOUT_TYPES.includes(raw as CalloutType) ? (raw as CalloutType) : 'info';
				},
				renderHTML: (attributes) => {
					const calloutType: CalloutType = CALLOUT_TYPES.includes(attributes.type)
						? attributes.type
						: 'info';
					return {
						'data-callout': calloutType,
						'data-callout-type': calloutType,
						class: `callout callout-${calloutType}`
					};
				}
			}
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-callout]' }, { tag: 'aside[data-callout]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return ['div', mergeAttributes(HTMLAttributes), 0];
	},

	addCommands() {
		return {
			setCallout:
				(attributes) =>
				({ editor, commands }) => {
					if (editor.isActive(this.name)) {
						return commands.updateAttributes(this.name, attributes ?? { type: 'info' });
					}
					return commands.wrapIn(this.name, attributes);
				},
			toggleCallout:
				(attributes) =>
				({ editor, commands }) => {
					const targetType = attributes?.type ?? 'info';
					if (editor.isActive(this.name, { type: targetType })) {
						return commands.lift(this.name);
					}
					if (editor.isActive(this.name)) {
						return commands.updateAttributes(this.name, { type: targetType });
					}
					return commands.wrapIn(this.name, { type: targetType });
				},
			unsetCallout:
				() =>
				({ state, tr, dispatch, commands }) => {
					if (commands.lift(this.name)) {
						return true;
					}
					let unwrapped = false;
					state.doc.nodesBetween(state.selection.from, state.selection.to, (node, pos) => {
						if (node.type.name === this.name) {
							tr.replaceWith(pos, pos + node.nodeSize, node.content);
							unwrapped = true;
							return false;
						}
					});
					if (unwrapped && dispatch) {
						dispatch(tr);
					}
					return unwrapped;
				}
		};
	},

	addKeyboardShortcuts() {
		return {
			'Mod-Shift-c': () => this.editor.commands.toggleCallout({ type: 'info' })
		};
	},

	addInputRules() {
		return [
			wrappingInputRule({
				find: /^:::(info|tip|warning|danger)?\s$/,
				type: this.type,
				getAttributes: (match) => ({
					type: (match[1] as CalloutType) || 'info'
				})
			})
		];
	}
});
