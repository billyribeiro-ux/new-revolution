/** Public card data only. Never serialize the article body, preview token or password into a listing. */
export interface BlogCardPost {
	id: number;
	title: string;
	slug: string;
	excerpt?: string | null;
	coverImage?: string | null;
	coverImageAlt?: string | null;
	coverImageWidth?: number | null;
	coverImageHeight?: number | null;
	/** Only candidates verified against the active media record, never inferred from a filename. */
	coverImageSrcset?: string;
	publishedAt?: Date | string | null;
	contentUpdatedAt?: Date | string | null;
	readingTime?: number | null;
	featured?: boolean;
	isPillar?: boolean;
	category?: { id?: number; name: string; slug: string; color?: string | null } | null;
	author?: { id?: number; name: string; slug: string; jobTitle?: string | null } | null;
}

export interface BlogListing {
	/** One lead on the first unfiltered page; never repeated in posts. */
	featuredPosts: BlogCardPost[];
	posts: BlogCardPost[];
	search: string;
	pagination: {
		page: number;
		perPage: number;
		/** All matching public posts, including the lead. */
		total: number;
		/** Pages of regular posts; an empty collection still has page 1. */
		totalPages: number;
	};
}

export const HOME_BLOG_PAGE_SIZE = 6;

export function emptyBlogListing(perPage = HOME_BLOG_PAGE_SIZE): BlogListing {
	return {
		featuredPosts: [],
		posts: [],
		search: '',
		pagination: { page: 1, perPage, total: 0, totalPages: 1 }
	};
}

/** Homepage query pagination preserves the main page identity without URL hash fragments. */
export function homeBlogPageHref<T extends string>(
	basePath: T,
	page: number
): T | `${T}?blogPage=${number}` {
	return page > 1 ? `${basePath}?blogPage=${page}` : basePath;
}
