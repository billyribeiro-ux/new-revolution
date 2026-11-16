import { pageHref } from '#lib/shared/blog/pagination';

export type ArchivePath = '/blog' | `/blog/category/${string}` | `/blog/tag/${string}`;
type RelativeArchivePath = 'blog' | `blog/category/${string}` | `blog/tag/${string}`;

export interface ArchiveTopic {
	id: number;
	name: string;
	path: ArchivePath;
	postCount: number;
}

/** Kit 3 accepts concrete pathnames without a leading slash; the component resolves the result once. */
export function archiveHref(path: ArchivePath, page = 1, search = '') {
	const pathname = path.slice(1) as RelativeArchivePath;
	return pageHref(pathname, page, search ? { search } : {});
}
