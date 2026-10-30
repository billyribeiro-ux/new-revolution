export const MEDIA_UPLOAD_MAX_BYTES = 4_000_000;
export const MEDIA_REQUEST_MAX_BYTES = 4_400_000;
export const MEDIA_METADATA_MAX_BYTES = 16_000;

export const MEDIA_ALLOWED_METADATA_KEYS = [
	'title',
	'alt_text',
	'description',
	'caption',
	'folder'
] as const;

export type MediaMetadataKey = (typeof MEDIA_ALLOWED_METADATA_KEYS)[number];

export const MEDIA_ALLOWED_MIME_TYPES = [
	'image/png',
	'image/jpeg',
	'image/gif',
	'image/webp',
	'image/avif',
	'image/svg+xml'
] as const;

export type AllowedMediaMimeType = (typeof MEDIA_ALLOWED_MIME_TYPES)[number];

export const MEDIA_VARIANT_WIDTHS = [480, 800, 1200] as const;
export const MEDIA_WEBP_QUALITY = 82;

export const MEDIA_LIST_DEFAULT_PER_PAGE = 24;
export const MEDIA_LIST_MIN_PER_PAGE = 1;
export const MEDIA_LIST_MAX_PER_PAGE = 100;

export interface MediaAvailableSize {
	value: 'thumbnail' | 'medium' | 'large' | 'full';
	label: string;
	url: string;
	width: number | null;
	height: number | null;
	available: boolean;
}

export interface MediaUrls {
	original: string;
	large: string;
	medium: string;
	thumbnail: string;
	webp: string;
}

export interface MediaItem {
	id: string;
	filename: string;
	slug: string;
	mime_type: string;
	size_bytes: number;
	width: number | null;
	height: number | null;
	title: string;
	alt_text: string;
	description: string;
	caption: string;
	folder: string;
	urls: MediaUrls;
	available_sizes: MediaAvailableSize[];
	usage_count?: number;
	created_at: string;
	updated_at: string;
}

/**
 * Normalises a media folder path so Root is always represented as `''` (never `'/'`).
 */
export function normaliseMediaFolder(rawFolder: string | null | undefined): string {
	if (!rawFolder) return '';
	const trimmed = rawFolder
		.trim()
		.replace(/^\/+|\/+$/g, '')
		.replace(/\/{2,}/g, '/');
	if (!trimmed || trimmed === 'root' || trimmed === 'Root') return '';
	return trimmed.slice(0, 120);
}

export function formatMaxUploadMb(): string {
	return `${(MEDIA_UPLOAD_MAX_BYTES / 1_000_000).toFixed(0)} MB`;
}
