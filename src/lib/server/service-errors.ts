import { error } from '@sveltejs/kit';

/**
 * Business-rule refusals raised by the service layer.
 *
 * Kit 3 treats a plain `Error` thrown from a remote function as
 * `kind: 'unknown'`: `handleError` logs it at error level and the client gets
 * a scrubbed 500, so a permanent conflict ("a scheduled post carries this
 * tag") reached the operator as "please try again". Services throw these
 * instead, and the remote and REST boundaries turn them into a 404, 409 or 503
 * whose message is shown as written. Every message is authored here in the
 * services and carries no driver, query, secret or stack text, which is what
 * makes it safe to expose. Keep them free of em and en dashes: the operator
 * reads them.
 *
 * Genuine failures ("Failed to create tag" with no row returned, a dropped
 * connection) stay plain `Error`s and keep the scrubbed 500.
 */
export type ServiceRefusalCode = 'NOT_FOUND' | 'CONFLICT' | 'NOT_CONFIGURED';

export abstract class ServiceRefusal extends Error {
	abstract readonly status: 404 | 409 | 503;
	abstract readonly code: ServiceRefusalCode;
}

/** The row the caller asked for does not exist (or not in the required state). */
export class NotFoundError extends ServiceRefusal {
	readonly status = 404;
	readonly code = 'NOT_FOUND';
	override name = 'NotFoundError';
}

/** The request conflicts with the current state; retrying will not help. */
export class ConflictError extends ServiceRefusal {
	readonly status = 409;
	readonly code = 'CONFLICT';
	override name = 'ConflictError';
}

/**
 * The deployment lacks configuration the operation needs (an environment
 * variable that is not set). The operator can fix it, so the message says
 * what to set; it names the setting and never its value. 503 because the
 * request is sound and will succeed once the server is configured. It is
 * still a 5xx, so `handleError` and `apiError` log it at error level.
 */
export class NotConfiguredError extends ServiceRefusal {
	readonly status = 503;
	readonly code = 'NOT_CONFIGURED';
	override name = 'NotConfiguredError';
}

/**
 * True when `err`, or anything on its `cause` chain (drizzle wraps the driver's
 * NeonDbError in a DrizzleQueryError), is a Postgres unique violation (SQLSTATE
 * 23505) on `table.column`. Postgres reports the table and constraint for a
 * unique violation but no column, so the column is matched by drizzle's
 * constraint name (`<table>_<column>_unique`) or, for a constraint whose name
 * predates the migration journal, the `Key (<column>)=` detail.
 */
export function isUniqueViolation(
	err: unknown,
	target: { table: string; column: string }
): boolean {
	let current: unknown = err;
	for (let depth = 0; depth < 5 && current && typeof current === 'object'; depth++) {
		const { code, table, constraint, detail } = current as Record<string, unknown>;
		if (
			code === '23505' &&
			table === target.table &&
			(constraint === `${target.table}_${target.column}_unique` ||
				String(detail ?? '').startsWith(`Key (${target.column})=`))
		) {
			return true;
		}
		current = (current as { cause?: unknown }).cause;
	}
	return false;
}

/**
 * Run a write to a taxonomy table (authors, categories, tags), turning a clash
 * on its `<table>_slug_unique` constraint into a `ConflictError` that names
 * the problem. Left as the driver error, a duplicate slug on create or rename
 * reached the operator as a scrubbed 500 through both the remote and REST
 * boundaries. Any other failure is rethrown untouched.
 */
export async function refuseDuplicateSlug<T>(
	write: PromiseLike<T>,
	table: string,
	noun: string
): Promise<T> {
	try {
		return await write;
	} catch (err) {
		if (isUniqueViolation(err, { table, column: 'slug' })) {
			throw new ConflictError(`That slug is already used by another ${noun}.`);
		}
		throw err;
	}
}

/**
 * Remote-function boundary, mirroring `rethrowSeoGate`: a refusal becomes
 * `error(status, message, { code })` (Kit `kind: 'app'`, body passed through
 * to the client; `handleError` logs a 404/409 at warn and a 503
 * `NOT_CONFIGURED` at error); anything else is rethrown untouched for
 * `handleError` to log and scrub. Typed `never`, so
 * `await service().catch(rethrowServiceRefusal)` keeps the success type.
 */
export function rethrowServiceRefusal(err: unknown): never {
	if (err instanceof ServiceRefusal) error(err.status, err.message, { code: err.code });
	throw err;
}
