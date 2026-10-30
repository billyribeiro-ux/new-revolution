import { z } from 'zod';
import {
	MEDIA_LIST_DEFAULT_PER_PAGE,
	MEDIA_LIST_MAX_PER_PAGE,
	MEDIA_LIST_MIN_PER_PAGE,
	normaliseMediaFolder
} from '../media-upload';

export const MEDIA_SORT_VALUES = ['newest', 'oldest', 'title', 'size', 'filename'] as const;
export type MediaSort = (typeof MEDIA_SORT_VALUES)[number];

export const mediaListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	per_page: z.coerce
		.number()
		.int()
		.default(MEDIA_LIST_DEFAULT_PER_PAGE)
		.transform((n) => Math.max(MEDIA_LIST_MIN_PER_PAGE, Math.min(MEDIA_LIST_MAX_PER_PAGE, n))),
	search: z.string().max(200).optional().default(''),
	folder: z
		.string()
		.max(120)
		.optional()
		.transform((f) => (f === undefined ? undefined : normaliseMediaFolder(f))),
	mime_type: z.string().max(80).optional().default(''),
	sort: z.enum(MEDIA_SORT_VALUES).optional().default('newest')
});
export type MediaListQuery = z.infer<typeof mediaListQuerySchema>;

export const mediaPatchSchema = z
	.object({
		title: z.string().max(300).nullish(),
		name: z.string().max(300).nullish(),
		alt_text: z.string().max(500).nullish(),
		altText: z.string().max(500).nullish(),
		description: z.string().max(2000).nullish(),
		caption: z.string().max(1000).nullish(),
		folder: z.string().max(120).nullish(),
		filename: z
			.string()
			.max(255)
			.nullish()
			.refine((val) => val === undefined || val === null || val.trim().length > 0, {
				message: 'Filename cannot be empty.'
			})
	})
	.transform((input) => {
		const out: {
			title?: string;
			alt_text?: string;
			description?: string;
			caption?: string;
			folder?: string;
			filename?: string;
		} = {};

		if (input.title !== undefined || input.name !== undefined) {
			out.title = (input.title ?? input.name ?? '').trim();
		}
		if (input.alt_text !== undefined || input.altText !== undefined) {
			out.alt_text = (input.alt_text ?? input.altText ?? '').trim();
		}
		if (input.description !== undefined) {
			out.description = (input.description ?? '').trim();
		}
		if (input.caption !== undefined) {
			out.caption = (input.caption ?? '').trim();
		}
		if (input.folder !== undefined) {
			out.folder = normaliseMediaFolder(input.folder);
		}
		if (input.filename !== undefined && input.filename !== null) {
			out.filename = input.filename.trim();
		}
		return out;
	});
export type MediaPatchInput = z.infer<typeof mediaPatchSchema>;
