import { getRequestEvent } from '$app/server';
import { error, type RequestEvent } from '@sveltejs/kit';
import { verifyCsrfOrigin } from './auth-guard.ts';

export const ROLES = ['admin', 'editor', 'author', 'contributor', 'subscriber'] as const;
export type Role = (typeof ROLES)[number];

export interface Principal {
	id: number;
	userId: number;
	authUserId: string;
	email: string;
	name: string;
	role: string;
	isAdmin: boolean;
}

function currentEvent(event?: RequestEvent): RequestEvent {
	return event ?? getRequestEvent();
}

export function requireAuth(event?: RequestEvent): Principal {
	const e = currentEvent(event);
	const u = e.locals?.user;
	if (!u) {
		error(401, 'Unauthorized');
	}
	const numericId = Number.isFinite(Number(u.id)) && Number(u.id) > 0 ? Number(u.id) : 1;
	return {
		id: numericId,
		userId: numericId,
		authUserId: u.id,
		email: u.email,
		name: u.name,
		role: u.role ?? 'subscriber',
		isAdmin: u.role === 'admin'
	};
}

export function requireRole(...allowed: Role[]): Principal;
export function requireRole(event: RequestEvent, ...allowed: Role[]): Principal;
export function requireRole(eventOrRole: RequestEvent | Role, ...rest: Role[]): Principal {
	let event: RequestEvent | undefined;
	let allowed: Role[];
	if (typeof eventOrRole === 'string') {
		allowed = [eventOrRole, ...rest];
	} else {
		event = eventOrRole;
		allowed = rest;
	}

	const user = requireAuth(event);
	if (!allowed.includes(user.role as Role)) {
		error(403, 'Forbidden');
	}
	return user;
}

export function requireAdmin(event?: RequestEvent): Principal {
	const e = currentEvent(event);
	const user = requireAuth(e);
	if (user.role !== 'admin' || !user.isAdmin) {
		error(403, 'Forbidden');
	}
	if (e.request) {
		const method = e.request.method.toUpperCase();
		if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
			verifyCsrfOrigin(e.request, new URL(e.request.url));
		}
	}
	return user;
}
