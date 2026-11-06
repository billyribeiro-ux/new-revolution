import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = ({ url }) => {
	redirect(308, `${resolve('/sunday-alpha-alerts')}${url.search}`);
};
export const HEAD = GET;
