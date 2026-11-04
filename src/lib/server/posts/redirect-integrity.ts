import { and, eq, isNull } from 'drizzle-orm';
import type { AppDatabase } from '../db';
import { posts, redirects } from '../db/schema';

export type RedirectIntegrityIssueKind = 'self-loop' | 'cycle' | 'chain' | 'dangling-target';

export interface RedirectIntegrityIssue {
	kind: RedirectIntegrityIssueKind;
	sourcePath: string;
	targetPath: string;
}

export interface RedirectEdge {
	sourcePath: string;
	targetPath: string;
}

/**
 * Pure graph checks over ACTIVE redirects.
 * - `self-loop`: source === target.
 * - `cycle`: following targets returns to a visited source (A→B→A).
 * - `chain`: a target is itself an active source (A→B→C); the save path collapses these, so one means a bug or manual edit.
 * - `dangling-target`: only when `liveBlogPaths` is given; a `/blog/...` target that no live post serves.
 */
export function analyzeRedirectGraph(
	edges: readonly RedirectEdge[],
	liveBlogPaths?: ReadonlySet<string>
): RedirectIntegrityIssue[] {
	const bySource = new Map(edges.map((e) => [e.sourcePath, e.targetPath]));
	const issues: RedirectIntegrityIssue[] = [];

	for (const edge of edges) {
		if (edge.sourcePath === edge.targetPath) {
			issues.push({ kind: 'self-loop', ...edge });
			continue;
		}

		const seen = new Set([edge.sourcePath]);
		let cursor: string | undefined = edge.targetPath;
		let hops = 0;
		let cyclic = false;
		while (cursor !== undefined && bySource.has(cursor)) {
			if (seen.has(cursor)) {
				cyclic = true;
				break;
			}
			seen.add(cursor);
			cursor = bySource.get(cursor);
			hops++;
		}
		if (cyclic) {
			issues.push({ kind: 'cycle', ...edge });
		} else if (hops > 0) {
			issues.push({ kind: 'chain', ...edge });
		} else if (liveBlogPaths && edge.targetPath.startsWith('/blog/')) {
			if (!liveBlogPaths.has(edge.targetPath)) {
				issues.push({ kind: 'dangling-target', ...edge });
			}
		}
	}
	return issues;
}

type RedirectReader = Pick<AppDatabase, 'select'>;

/** Loop, cycle and chain issues only; safe to run inside a save transaction (no live-post lookup). */
export async function findRedirectGraphIssues(
	db: RedirectReader
): Promise<RedirectIntegrityIssue[]> {
	const rows = await db
		.select({ sourcePath: redirects.sourcePath, targetPath: redirects.targetPath })
		.from(redirects)
		.where(eq(redirects.isActive, true));
	return analyzeRedirectGraph(rows);
}

/** Full audit including dangling targets. Read-only; intended for a periodic check or an operator script. */
export async function findRedirectIntegrityIssues(
	db: RedirectReader
): Promise<RedirectIntegrityIssue[]> {
	const [rows, live] = await Promise.all([
		db
			.select({ sourcePath: redirects.sourcePath, targetPath: redirects.targetPath })
			.from(redirects)
			.where(eq(redirects.isActive, true)),
		db
			.select({ slug: posts.slug })
			.from(posts)
			.where(and(eq(posts.status, 'published'), isNull(posts.deletedAt)))
	]);
	return analyzeRedirectGraph(rows, new Set(live.map((p) => `/blog/${p.slug}`)));
}

/** True when a published, non-deleted post serves `/blog/<slug>`. Used by the redirect hook to avoid 301s into a 404. */
export async function isLiveBlogPath(db: RedirectReader, path: string): Promise<boolean> {
	if (!path.startsWith('/blog/')) return true; // not ours to judge
	const slug = path.slice('/blog/'.length);
	const [row] = await db
		.select({ id: posts.id })
		.from(posts)
		.where(and(eq(posts.slug, slug), eq(posts.status, 'published'), isNull(posts.deletedAt)))
		.limit(1);
	return Boolean(row);
}
