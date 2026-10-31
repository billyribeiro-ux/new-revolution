import * as env from '$app/env/private';
import * as publicEnv from '$app/env/public';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { ConflictError, NotConfiguredError } from '#lib/server/service-errors.js';
import {
	integrationConnections,
	integrationTestRuns,
	type IntegrationConnection
} from '#lib/server/db/schema.js';
import {
	decryptIntegrationSecret,
	encryptIntegrationSecret,
	integrationEncryptionAvailable,
	secretLastFour
} from '#lib/server/integrations/crypto.js';
import {
	displayNameForProvider,
	integrationDefinitions,
	integrationProviders,
	type IntegrationStatus,
	type IntegrationTestStatus
} from '#lib/server/integrations/providers.js';
import {
	ga4ConfigSchema,
	ga4SecretsSchema,
	googleAdsConfigSchema,
	googleAdsSecretsSchema,
	googleSearchConsoleConfigSchema,
	googleTagConfigSchema,
	googleTagManagerConfigSchema,
	integrationUpsertSchema,
	resendConfigSchema,
	resendSecretsSchema,
	type IntegrationProvider,
	type IntegrationUpsertInput
} from '#lib/shared/schemas/integrations.js';

export type IntegrationSummary = {
	id: number | null;
	provider: IntegrationProvider;
	displayName: string;
	category: 'email' | 'analytics' | 'advertising' | 'seo' | 'tag_management';
	enabled: boolean;
	status: IntegrationStatus;
	config: Record<string, unknown>;
	hasSecret: boolean;
	secretLastFour: string | null;
	secretUpdatedAt: Date | null;
	lastTestStatus: IntegrationTestStatus | null;
	lastTestAt: Date | null;
	lastTestError: string | null;
	lastTestEvidence: Record<string, unknown> | null;
	updatedAt: Date | null;
	definition: (typeof integrationDefinitions)[IntegrationProvider];
};

type SecretBundle = Record<string, string>;

type TestResult = {
	connectionStatus?: 'configured' | 'connected';
	status: IntegrationTestStatus;
	error: string | null;
	evidence: Record<string, unknown>;
};

function typedConfig(value: unknown): Record<string, unknown> {
	return value && typeof value === 'object' && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}

function redactConfig(provider: IntegrationProvider, config: Record<string, unknown>) {
	if (provider === 'resend') return resendConfigSchema.parse(config);
	if (provider === 'ga4') return ga4ConfigSchema.parse(config);
	if (provider === 'google_ads') return googleAdsConfigSchema.parse(config);
	if (provider === 'google_search_console') return googleSearchConsoleConfigSchema.parse(config);
	if (provider === 'google_tag') return googleTagConfigSchema.parse(config);
	return googleTagManagerConfigSchema.parse(config);
}

function parseSecrets(provider: IntegrationProvider, secrets: unknown): SecretBundle | null {
	if (!secrets) return null;
	if (provider === 'resend') return resendSecretsSchema.parse(secrets);
	if (provider === 'ga4') return ga4SecretsSchema.parse(secrets);
	if (provider === 'google_ads') return googleAdsSecretsSchema.parse(secrets);
	return null;
}

function decryptSecretBundle(row: IntegrationConnection): SecretBundle | null {
	if (!row.secretCiphertext) return null;
	return JSON.parse(decryptIntegrationSecret(row.secretCiphertext)) as SecretBundle;
}

function rowToSummary(
	provider: IntegrationProvider,
	row?: IntegrationConnection
): IntegrationSummary {
	const definition = integrationDefinitions[provider];
	return {
		id: row?.id ?? null,
		provider,
		displayName: definition.displayName,
		category: definition.category,
		enabled: row?.enabled ?? false,
		status:
			provider === 'ga4' && row?.status === 'connected'
				? 'configured'
				: ((row?.status as IntegrationStatus | undefined) ?? 'not_configured'),
		config: row ? redactConfig(provider, typedConfig(row.config)) : {},
		hasSecret: !!row?.secretCiphertext,
		secretLastFour: row?.secretLastFour ?? null,
		secretUpdatedAt: row?.secretUpdatedAt ?? null,
		lastTestStatus: (row?.lastTestStatus as IntegrationTestStatus | null) ?? null,
		lastTestAt: row?.lastTestAt ?? null,
		lastTestError: row?.lastTestError ?? null,
		lastTestEvidence: row?.lastTestEvidence ?? null,
		updatedAt: row?.updatedAt ?? null,
		definition
	};
}

async function getConnection(provider: IntegrationProvider) {
	const rows = await db
		.select()
		.from(integrationConnections)
		.where(eq(integrationConnections.provider, provider))
		.limit(1);
	return rows[0] ?? null;
}

export async function listIntegrationSummaries(): Promise<IntegrationSummary[]> {
	const rows = await db.select().from(integrationConnections);
	const byProvider = new Map(rows.map((row) => [row.provider, row]));
	return integrationProviders.map((provider) => rowToSummary(provider, byProvider.get(provider)));
}

export async function getIntegrationSummary(
	provider: IntegrationProvider
): Promise<IntegrationSummary> {
	return rowToSummary(provider, (await getConnection(provider)) ?? undefined);
}

export async function upsertIntegration(
	input: IntegrationUpsertInput
): Promise<IntegrationSummary> {
	const parsed = integrationUpsertSchema.parse(input);
	const now = new Date();
	const provider = parsed.provider;
	const existing = await getConnection(provider);
	const config = redactConfig(provider, parsed.config);
	const secretBundle = parseSecrets(provider, parsed.secrets);
	const values: Partial<typeof integrationConnections.$inferInsert> = {
		provider,
		displayName: displayNameForProvider(provider),
		enabled: parsed.enabled,
		status: parsed.enabled ? 'configured' : 'disabled',
		config,
		updatedAt: now
	};

	if (secretBundle) {
		if (!integrationEncryptionAvailable()) {
			// A deployment fault the operator can fix, not a bug: say what to set.
			throw new NotConfiguredError(
				'Provider secrets cannot be saved: this deployment has no encryption key. Set INTEGRATION_ENCRYPTION_KEY in the server environment, redeploy, then save again.'
			);
		}
		const serialized = JSON.stringify(secretBundle);
		values.secretCiphertext = encryptIntegrationSecret(serialized);
		values.secretLastFour = secretLastFour(Object.values(secretBundle).join(':'));
		values.secretUpdatedAt = now;
	} else if (
		parsed.enabled &&
		!existing?.secretCiphertext &&
		integrationDefinitions[provider].secretRequired
	) {
		values.status = 'not_configured';
	}

	const rows = existing
		? await db
				.update(integrationConnections)
				.set(values)
				.where(eq(integrationConnections.id, existing.id))
				.returning()
		: await db
				.insert(integrationConnections)
				.values({
					...values,
					provider,
					displayName: displayNameForProvider(provider),
					createdAt: now,
					updatedAt: now
				})
				.returning();

	return rowToSummary(provider, rows[0]);
}

async function recordTestResult(row: IntegrationConnection, result: TestResult) {
	const now = new Date();
	await db.insert(integrationTestRuns).values({
		connectionId: row.id,
		provider: row.provider,
		status: result.status,
		error: result.error,
		evidence: result.evidence,
		createdAt: now
	});
	const nextStatus: IntegrationStatus = row.enabled
		? result.status === 'success'
			? (result.connectionStatus ?? 'connected')
			: 'failed'
		: 'disabled';
	const rows = await db
		.update(integrationConnections)
		.set({
			status: nextStatus,
			lastTestStatus: result.status,
			lastTestAt: now,
			lastTestError: result.error,
			lastTestEvidence: result.evidence,
			updatedAt: now
		})
		.where(eq(integrationConnections.id, row.id))
		.returning();
	return rowToSummary(row.provider as IntegrationProvider, rows[0]);
}

async function testResend(row: IntegrationConnection): Promise<TestResult> {
	const config = resendConfigSchema.parse(row.config);
	const secrets = decryptSecretBundle(row);
	const apiKey = secrets?.['apiKey'];
	if (!apiKey) {
		return {
			status: 'failed',
			error: 'Resend API key is missing.',
			evidence: { checkedAt: new Date().toISOString(), provider: 'resend' }
		};
	}
	const fromDomain = config.fromEmail.split('@')[1]?.toLowerCase() ?? '';
	let cursor: string | undefined;
	for (let page = 0; page < 20; page++) {
		const url = new URL('https://api.resend.com/domains');
		url.searchParams.set('limit', '100');
		if (cursor) url.searchParams.set('after', cursor);
		const response = await fetch(url, {
			headers: { Authorization: `Bearer ${apiKey}` },
			signal: AbortSignal.timeout(5000)
		});
		const body = (await response.json().catch(() => null)) as {
			data?: Array<{
				id: string;
				name: string;
				status: string;
				capabilities?: { sending?: string };
			}>;
			has_more?: boolean;
		} | null;
		if (!response.ok)
			return {
				status: 'failed',
				error: `Resend returned HTTP ${response.status}.`,
				evidence: {
					checkedAt: new Date().toISOString(),
					endpoint: '/domains',
					responseCode: response.status
				}
			};
		if (!Array.isArray(body?.data)) throw new Error('Resend returned an invalid domain list.');
		const matched = body.data.find((domain) => domain.name.toLowerCase() === fromDomain);
		if (matched) {
			const ready = matched.status === 'verified' && matched.capabilities?.sending === 'enabled';
			return {
				status: ready ? 'success' : 'failed',
				error: ready ? null : `Resend domain ${fromDomain} is not verified for sending.`,
				evidence: {
					checkedAt: new Date().toISOString(),
					endpoint: '/domains',
					responseCode: response.status,
					fromDomain,
					domainStatus: matched.status,
					sendingCapability: matched.capabilities?.sending ?? null,
					deliveryVerified: false
				}
			};
		}
		if (!body.has_more) break;
		const next = body.data.at(-1)?.id;
		if (!next || next === cursor) throw new Error('Resend returned an invalid pagination cursor.');
		cursor = next;
	}
	return {
		status: 'failed',
		error: `No verified sending domain matched ${fromDomain}.`,
		evidence: { checkedAt: new Date().toISOString(), endpoint: '/domains', fromDomain }
	};
}

async function testGa4(row: IntegrationConnection): Promise<TestResult> {
	const config = ga4ConfigSchema.parse(row.config);
	const secrets = decryptSecretBundle(row);
	const apiSecret = secrets?.['apiSecret'];
	if (!apiSecret) {
		return {
			status: 'failed',
			error: 'GA4 API secret is missing.',
			evidence: { checkedAt: new Date().toISOString(), provider: 'ga4' }
		};
	}
	const payload = {
		client_id: `tc360.integration.${Date.now()}`,
		events: [
			{
				name: 'tc360_integration_test',
				params: {
					debug_mode: true,
					engagement_time_msec: 1,
					session_id: Date.now().toString(),
					source: 'tc360_admin_integrations'
				}
			}
		]
	};
	const debugUrl = new URL('https://www.google-analytics.com/debug/mp/collect');
	debugUrl.searchParams.set('measurement_id', config.measurementId);
	debugUrl.searchParams.set('api_secret', apiSecret);
	const debugResponse = await fetch(debugUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
		signal: AbortSignal.timeout(5000)
	});
	const body = (await debugResponse.json().catch(() => null)) as {
		validationMessages?: unknown;
	} | null;
	const validationMessages = Array.isArray(body?.validationMessages) ? body.validationMessages : [];
	const validPayload =
		debugResponse.ok && Array.isArray(body?.validationMessages) && validationMessages.length === 0;
	return {
		status: validPayload ? 'success' : 'failed',
		connectionStatus: 'configured',
		error: validPayload ? null : `GA4 payload validation failed (HTTP ${debugResponse.status}).`,
		evidence: {
			checkedAt: new Date().toISOString(),
			measurementId: config.measurementId,
			mode: 'payload_validation',
			debugEndpoint: '/debug/mp/collect',
			debugResponseCode: debugResponse.status,
			validationMessages,
			credentialsVerified: false,
			deliveryVerified: false,
			note: 'The debug endpoint validates event structure, not the API secret or delivery. Verify a controlled event in GA4 Realtime or DebugView before claiming end-to-end connectivity.'
		}
	};
}

async function testGoogleAds(row: IntegrationConnection): Promise<TestResult> {
	const config = googleAdsConfigSchema.parse(row.config);
	const secrets = decryptSecretBundle(row);
	if (!secrets) {
		return {
			status: 'success',
			error: null,
			evidence: {
				checkedAt: new Date().toISOString(),
				mode: 'conversion_tag_config',
				conversionId: config.conversionId,
				conversionLabelConfigured: !!config.conversionLabel,
				note: 'Browser conversion tracking configuration validated locally. Add OAuth credentials to test Google Ads API access.'
			}
		};
	}
	const googleSecrets = googleAdsSecretsSchema.parse(secrets);
	const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: googleSecrets.clientId,
			client_secret: googleSecrets.clientSecret,
			refresh_token: googleSecrets.refreshToken,
			grant_type: 'refresh_token'
		})
	});
	const tokenBody = (await tokenResponse.json().catch(() => null)) as {
		access_token?: string;
		error?: string;
	} | null;
	if (!tokenResponse.ok || !tokenBody?.access_token) {
		return {
			status: 'failed',
			error: `Google OAuth token refresh failed${tokenBody?.error ? `: ${tokenBody.error}` : ''}.`,
			evidence: {
				checkedAt: new Date().toISOString(),
				endpoint: 'oauth2.googleapis.com/token',
				responseCode: tokenResponse.status,
				conversionId: config.conversionId
			}
		};
	}
	return {
		status: 'success',
		error: null,
		evidence: {
			checkedAt: new Date().toISOString(),
			endpoint: 'oauth2.googleapis.com/token',
			responseCode: tokenResponse.status,
			conversionId: config.conversionId,
			customerId: config.customerId ?? null,
			authenticated: true
		}
	};
}

async function testGoogleSearchConsole(row: IntegrationConnection): Promise<TestResult> {
	const config = googleSearchConsoleConfigSchema.parse(row.config);
	return {
		status: 'success',
		error: null,
		evidence: {
			checkedAt: new Date().toISOString(),
			mode: 'html_meta_tag',
			verificationToken: config.verificationToken,
			metaTagName: 'google-site-verification',
			runtime: {
				renderedInServerHead: true,
				publicRoutesOnly: true,
				adminRoutesExcluded: true
			},
			note: 'Search Console performs final ownership verification by fetching the public homepage.'
		}
	};
}

async function testGoogleTagManager(row: IntegrationConnection): Promise<TestResult> {
	const config = googleTagManagerConfigSchema.parse(row.config);
	const url = new URL('https://www.googletagmanager.com/gtm.js');
	url.searchParams.set('id', config.containerId);
	const response = await fetch(url);
	return {
		status: response.ok ? 'success' : 'failed',
		error: response.ok ? null : `Google Tag Manager returned HTTP ${response.status}.`,
		evidence: {
			checkedAt: new Date().toISOString(),
			containerId: config.containerId,
			endpoint: 'googletagmanager.com/gtm.js',
			responseCode: response.status,
			runtime: {
				loadedOnPublicRoutes: true,
				adminRoutesExcluded: true,
				noscriptFallbackIncluded: true
			}
		}
	};
}

async function testGoogleTag(row: IntegrationConnection): Promise<TestResult> {
	const config = googleTagConfigSchema.parse(row.config);
	const url = new URL('https://www.googletagmanager.com/gtag/js');
	url.searchParams.set('id', config.tagId);
	const response = await fetch(url);
	return {
		status: response.ok ? 'success' : 'failed',
		error: response.ok ? null : `Google tag returned HTTP ${response.status}.`,
		evidence: {
			checkedAt: new Date().toISOString(),
			tagId: config.tagId,
			endpoint: 'googletagmanager.com/gtag/js',
			responseCode: response.status,
			runtime: {
				loadedOnPublicRoutes: true,
				adminRoutesExcluded: true,
				sendPageViewDisabled: true
			}
		}
	};
}

export async function testIntegrationConnection(
	provider: IntegrationProvider
): Promise<IntegrationSummary> {
	const row = await getConnection(provider);
	if (!row) {
		throw new ConflictError(`${displayNameForProvider(provider)} is not configured.`);
	}
	if (!row.enabled) {
		return recordTestResult(row, {
			status: 'skipped',
			error: 'Integration is disabled.',
			evidence: { checkedAt: new Date().toISOString(), provider }
		});
	}
	try {
		const result =
			provider === 'resend'
				? await testResend(row)
				: provider === 'ga4'
					? await testGa4(row)
					: provider === 'google_ads'
						? await testGoogleAds(row)
						: provider === 'google_search_console'
							? await testGoogleSearchConsole(row)
							: provider === 'google_tag'
								? await testGoogleTag(row)
								: await testGoogleTagManager(row);
		return recordTestResult(row, result);
	} catch (err) {
		return recordTestResult(row, {
			status: 'failed',
			error: err instanceof Error ? err.message : 'Connection test failed.',
			evidence: { checkedAt: new Date().toISOString(), provider }
		});
	}
}

export async function listIntegrationTestRuns(provider: IntegrationProvider, limit = 10) {
	return db
		.select()
		.from(integrationTestRuns)
		.where(eq(integrationTestRuns.provider, provider))
		.orderBy(desc(integrationTestRuns.createdAt))
		.limit(Math.max(1, Math.min(25, limit)));
}

export async function getActiveIntegration(
	provider: IntegrationProvider
): Promise<IntegrationConnection | null> {
	const rows = await db
		.select()
		.from(integrationConnections)
		.where(
			and(
				eq(integrationConnections.provider, provider),
				eq(integrationConnections.enabled, true),
				eq(integrationConnections.status, 'connected')
			)
		)
		.limit(1);
	return rows[0] ?? null;
}

export async function getResendRuntimeConfig() {
	const row = await getActiveIntegration('resend').catch(() => null);
	if (row?.secretCiphertext) {
		const config = resendConfigSchema.parse(row.config);
		const secrets = decryptSecretBundle(row);
		if (secrets?.['apiKey']) {
			return {
				source: 'integration' as const,
				apiKey: secrets['apiKey'],
				fromEmail: config.fromEmail,
				fromName: config.fromName ?? 'Steven Johnson',
				replyTo: config.replyTo ?? config.fromEmail,
				notifyEmail: config.notifyEmail ?? env['LEAD_NOTIFY_EMAIL'] ?? null
			};
		}
	}
	const apiKey = env['RESEND_API_KEY']?.trim();
	if (!apiKey) return null;
	return {
		source: 'env' as const,
		apiKey,
		fromEmail: env['LEAD_FROM_EMAIL']?.trim() || 'steven@teamconsulting360.com',
		fromName: env['LEAD_FROM_NAME']?.trim() || 'Steven Johnson',
		replyTo: env['LEAD_FROM_EMAIL']?.trim() || 'steven@teamconsulting360.com',
		notifyEmail: env['LEAD_NOTIFY_EMAIL']?.trim() || null
	};
}

export async function getGa4RuntimeConfig() {
	// Browser collection needs an enabled public measurement ID, not a
	// Measurement Protocol credential check that cannot prove delivery.
	const row = await getConnection('ga4').catch(() => null);
	if (row?.enabled && ['configured', 'connected'].includes(row.status)) {
		const config = ga4ConfigSchema.parse(row.config);
		return { source: 'integration' as const, measurementId: config.measurementId };
	}
	const measurementId = publicEnv['PUBLIC_GA4_MEASUREMENT_ID']?.trim();
	return measurementId ? { source: 'env' as const, measurementId } : null;
}

export async function getGoogleAdsRuntimeConfig() {
	const row = await getActiveIntegration('google_ads').catch(() => null);
	if (!row) return null;
	const config = googleAdsConfigSchema.parse(row.config);
	return { source: 'integration' as const, ...config };
}

export async function getGoogleSearchConsoleRuntimeConfig() {
	const row = await getActiveIntegration('google_search_console').catch(() => null);
	if (row) {
		const config = googleSearchConsoleConfigSchema.parse(row.config);
		return { source: 'integration' as const, verificationToken: config.verificationToken };
	}
	const verificationToken = publicEnv['PUBLIC_GOOGLE_SITE_VERIFICATION']?.trim();
	return verificationToken ? { source: 'env' as const, verificationToken } : null;
}

export async function getGoogleTagRuntimeConfig() {
	const row = await getActiveIntegration('google_tag').catch(() => null);
	if (row) {
		const config = googleTagConfigSchema.parse(row.config);
		return { source: 'integration' as const, tagId: config.tagId };
	}
	const tagId = publicEnv['PUBLIC_GOOGLE_TAG_ID']?.trim();
	return tagId ? { source: 'env' as const, tagId } : null;
}

export async function getGoogleTagManagerRuntimeConfig() {
	const row = await getActiveIntegration('google_tag_manager').catch(() => null);
	if (row) {
		const config = googleTagManagerConfigSchema.parse(row.config);
		return { source: 'integration' as const, containerId: config.containerId };
	}
	const containerId = publicEnv['PUBLIC_GTM_CONTAINER_ID']?.trim();
	return containerId ? { source: 'env' as const, containerId } : null;
}
