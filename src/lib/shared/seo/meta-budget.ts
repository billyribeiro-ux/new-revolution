export const META_TITLE_MIN = 30;
export const META_TITLE_MAX = 60;
export const META_DESCRIPTION_MIN = 70;
export const META_DESCRIPTION_MAX = 155;
export const OG_TITLE_MAX = 60;
export const OG_DESCRIPTION_MAX = 200;
export const TWITTER_TITLE_MAX = 70;
export const TWITTER_DESCRIPTION_MAX = 200;
export const EXCERPT_SOFT_MAX = 160;
export const CONTENT_MIN_WORDS = 600;
export const CONTENT_THIN_WORDS = 300;
export const PUBLISH_GATE_MIN_SCORE = 80;
export const DEFAULT_BRAND_NAME = 'Revolution Trading Pros';

export interface RenderedTitleBudget {
	renderedTitle: string;
	length: number;
	brandAppended: boolean;
}

export function computeRenderedTitle(
	rawTitle: string,
	brandName: string = DEFAULT_BRAND_NAME
): RenderedTitleBudget {
	const trimmed = rawTitle.trim();
	if (!trimmed) {
		return {
			renderedTitle: '',
			length: 0,
			brandAppended: false
		};
	}

	const suffix = ` | ${brandName}`;
	if (trimmed.endsWith(suffix)) {
		return {
			renderedTitle: trimmed,
			length: trimmed.length,
			brandAppended: true
		};
	}

	if (trimmed.length + suffix.length <= META_TITLE_MAX) {
		const withBrand = `${trimmed}${suffix}`;
		return {
			renderedTitle: withBrand,
			length: withBrand.length,
			brandAppended: true
		};
	}

	return {
		renderedTitle: trimmed,
		length: trimmed.length,
		brandAppended: false
	};
}
