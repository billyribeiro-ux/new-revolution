import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite';
import { drizzle as drizzlePostgres, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type AppDatabase = PostgresJsDatabase<typeof schema> | PgliteDatabase<typeof schema>;

const MIGRATION_SQL_PATH = resolve(process.cwd(), 'drizzle/0000_blog_system.sql');

let cachedMigrationSql: string | null = null;
function getMigrationSql(): string {
	if (!cachedMigrationSql) {
		cachedMigrationSql = readFileSync(MIGRATION_SQL_PATH, 'utf8');
	}
	return cachedMigrationSql;
}

export function isPlaceholderDatabaseUrl(url: string | undefined): boolean {
	if (!url) return true;
	return (
		url.includes('user:password@host:port/db-name') ||
		url.includes('user:password@localhost:5432/db-name') ||
		url.startsWith('pglite://') ||
		url.startsWith('memory://')
	);
}

let activeDb: AppDatabase | null = null;
let activePglite: PGlite | null = null;
let initPromise: Promise<void> | null = null;
let simulatedFailureError: Error | null = null;

export function setSimulatedDbFailure(error: Error | null): void {
	simulatedFailureError = error;
}

export function assertDbHealthy(): void {
	if (simulatedFailureError) {
		throw simulatedFailureError;
	}
}

function createDefaultDb(): AppDatabase {
	const rawUrl = process.env.DATABASE_URL ?? 'postgres://user:password@host:port/db-name';

	if (!isPlaceholderDatabaseUrl(rawUrl)) {
		const client = postgres(rawUrl);
		return drizzlePostgres(client, { schema });
	}

	const isVitest = Boolean(process.env.VITEST);
	if (isVitest || rawUrl.startsWith('memory://')) {
		activePglite = new PGlite();
	} else {
		const dataDir = resolve(process.cwd(), '.svelte-kit/pglite-blog');
		mkdirSync(dataDir, { recursive: true });
		activePglite = new PGlite(dataDir);
	}

	return drizzlePglite(activePglite, { schema });
}

export function getDb(): AppDatabase {
	assertDbHealthy();
	if (!activeDb) {
		activeDb = createDefaultDb();
	}
	return activeDb;
}

async function seedPreviewBaselineIfEmpty(pglite: PGlite): Promise<void> {
	if (process.env.VITEST) return;
	const check = await pglite.query<{ count: string }>('SELECT count(*)::text AS count FROM posts');
	const existingCount = Number(check.rows[0]?.count ?? '0');
	if (existingCount > 0) return;

	await pglite.exec(`
		INSERT INTO authors (id, name, slug, job_title, credentials, bio, avatar, website, linkedin, twitter)
		VALUES (
			1,
			'Billy Ribeiro',
			'billy-ribeiro',
			'Head Trader & Founder',
			'CMT, 15+ Years Institutional Options Desk Experience',
			'Billy Ribeiro leads live execution and market structure research at Revolution Trading Pros.',
			'/logo.png',
			'https://revolutiontradingpros.com/about',
			'https://www.linkedin.com/company/revolution-trading-pros',
			'https://x.com/revtradingpros'
		)
		ON CONFLICT (slug) DO NOTHING;

		INSERT INTO categories (id, name, slug, description, is_active, sort_order)
		VALUES (
			1,
			'Market Structure',
			'market-structure',
			'Institutional order flow, dealer gamma exposure, and options risk management playbooks.',
			true,
			1
		)
		ON CONFLICT (slug) DO NOTHING;

		INSERT INTO posts (
			title,
			slug,
			excerpt,
			content,
			author_id,
			category_id,
			cover_image,
			cover_image_alt,
			cover_image_caption,
			cover_image_width,
			cover_image_height,
			meta_title,
			meta_description,
			focus_keyword,
			secondary_keywords,
			schema_type,
			reading_time,
			word_count,
			faq_items,
			status,
			visibility,
			published,
			featured,
			is_pillar,
			created_at,
			updated_at,
			content_updated_at,
			published_at
		) VALUES (
			'Institutional Order Flow and Gamma Flip Playbook',
			'institutional-order-flow-and-gamma-flip-playbook',
			'How institutional options desks map dealer gamma flip zones, dark pool liquidity levels, and disciplined intraday risk parameters on SPX.',
			'<h2>Key Takeaways for Institutional Order Flow</h2><p>Understanding dealer gamma exposure separates disciplined institutional execution from retail guesswork. When net gamma flips positive, market makers dampen volatility by selling into strength and buying pullbacks.</p><h2>Mapping the SPX Gamma Flip Zone</h2><p>Before the opening bell, identify the zero-gamma strike where dealer hedging transitions from mean-reverting to momentum-amplifying flow.</p><h3>Intraday Liquidity Confirmation</h3><p>Combine cumulative delta with dark pool print clusters to confirm institutional sponsorship at key structural inflection levels.</p><blockquote><p>Risk management is the only edge you directly control on every single trade.</p></blockquote><h2>Execution Checklist and Position Sizing</h2><p>Size every position around a predefined structural invalidation level and never widen a stop once an order is live.</p>',
			1,
			1,
			'/og-image.png',
			'Institutional SPX gamma exposure and order flow chart',
			'Figure 1: Dealer net gamma profile across SPX strikes',
			1200,
			630,
			'SPX Order Flow & Gamma Flip Playbook',
			'Learn how institutional options desks map SPX dealer gamma flip zones, dark pool liquidity levels, and strict intraday risk management rules.',
			'gamma flip playbook',
			'["institutional order flow","spx gamma exposure"]',
			'Article',
			4,
			350,
			'[{"question":"What is the SPX gamma flip level?","answer":"The gamma flip level is the index price where aggregate market maker net gamma transitions from positive (stabilizing) to negative (volatility-amplifying)."},{"question":"How should traders adjust position size in negative gamma?","answer":"Reduce contract size and widen structural stops because dealer hedging accelerates directional moves in negative gamma regimes."}]',
			'published',
			'public',
			true,
			true,
			true,
			'2026-10-25T14:00:00.000Z',
			'2026-10-25T14:00:00.000Z',
			'2026-10-25T14:00:00.000Z',
			'2026-10-25T14:00:00.000Z'
		),
		(
			'Zero DTE Risk Management and Position Sizing Rules',
			'zero-dte-risk-management-and-position-sizing-rules',
			'Strict position sizing rules, volatility regime filters, and maximum daily drawdown limits for trading SPX zero DTE options contracts.',
			'<h2>Position Sizing Framework</h2><p>Never risk more than one percent of account equity on a single intraday options structure.</p><h2>Volatility Regime Filters</h2><p>Adjust contract size when VIX term structure shifts into backwardation.</p><h2>Execution Discipline</h2><p>Define hard invalidation levels before routing any order to the exchange.</p>',
			1,
			1,
			'/og-image.png',
			'Zero DTE options risk management matrix',
			'',
			1200,
			630,
			'Zero DTE Risk Management Rules',
			'Master strict position sizing rules, volatility regime filters, and daily drawdown limits when trading SPX zero DTE options contracts.',
			'zero dte risk management',
			'["options position sizing"]',
			'BlogPosting',
			3,
			280,
			'[]',
			'published',
			'public',
			true,
			false,
			false,
			'2026-10-24T14:00:00.000Z',
			'2026-10-24T14:00:00.000Z',
			'2026-10-24T14:00:00.000Z',
			'2026-10-24T14:00:00.000Z'
		);

		INSERT INTO posts (
			title,
			slug,
			excerpt,
			content,
			author_id,
			category_id,
			status,
			visibility,
			published,
			password,
			reading_time,
			word_count,
			created_at,
			updated_at,
			content_updated_at,
			published_at
		) VALUES (
			'Private Desk Quarterly Gamma Levels Briefing',
			'private-desk-quarterly-gamma-levels-briefing',
			'Protected institutional briefing covering quarterly options expiration dealer positioning and key index hedge walls.',
			'<h2>Quarterly Dealer Positioning</h2><p>Unlocked desk analysis of quarterly OPEX gamma concentration and collar roll strikes.</p>',
			1,
			1,
			'published',
			'password_protected',
			true,
			'AlphaDesk2026!',
			2,
			120,
			'2026-10-23T14:00:00.000Z',
			'2026-10-23T14:00:00.000Z',
			'2026-10-23T14:00:00.000Z',
			'2026-10-23T14:00:00.000Z'
		);

		SELECT setval('authors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM authors));
		SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));
		SELECT setval('posts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM posts));
	`);
}

export async function ensureDbReady(): Promise<AppDatabase> {
	assertDbHealthy();
	const instance = getDb();
	if (activePglite && !initPromise) {
		const pgliteInstance = activePglite;
		initPromise = pgliteInstance
			.exec(getMigrationSql())
			.then(() => seedPreviewBaselineIfEmpty(pgliteInstance))
			.then(() => undefined);
	}
	if (initPromise) {
		await initPromise;
	}
	return instance;
}

export async function createTestDatabase(): Promise<{
	db: PgliteDatabase<typeof schema>;
	client: PGlite;
	cleanup: () => Promise<void>;
}> {
	const client = new PGlite();
	await client.exec(getMigrationSql());
	const testDb = drizzlePglite(client, { schema });
	return {
		db: testDb,
		client,
		cleanup: async () => {
			await client.close();
		}
	};
}

export function setActiveDbForTest(
	customDb: AppDatabase,
	customPglite: PGlite | null = null
): void {
	activeDb = customDb;
	activePglite = customPglite;
	initPromise = Promise.resolve();
}

export const db: AppDatabase = new Proxy({} as AppDatabase, {
	get(_target, prop, receiver) {
		const targetDb = getDb();
		const value = Reflect.get(targetDb as object, prop, receiver);
		return typeof value === 'function' ? value.bind(targetDb) : value;
	}
});
