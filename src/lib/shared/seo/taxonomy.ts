export const TAXONOMY_MIN_INDEXABLE_POSTS = 2;
export const TAG_MIN_INDEXABLE_POSTS = 5;
export const TAG_MAX_PUBLIC_SHARE = 0.75;

export function isCategoryIndexable(publicPostCount: number): boolean {
	return publicPostCount >= TAXONOMY_MIN_INDEXABLE_POSTS;
}

export function isTagIndexable(tagPostCount: number, totalPublicPosts: number): boolean {
	if (tagPostCount < TAG_MIN_INDEXABLE_POSTS) return false;
	if (totalPublicPosts <= 0) return false;
	return tagPostCount <= TAG_MAX_PUBLIC_SHARE * totalPublicPosts;
}
