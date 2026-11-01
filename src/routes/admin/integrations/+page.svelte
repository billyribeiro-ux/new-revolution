<script lang="ts">
	import { onMount } from 'svelte';
	import SEO from '#lib/components/SEO.svelte';
	import { refusalMessage } from '#lib/utils/http-error.js';
	import PlugsConnectedIcon from 'phosphor-svelte/lib/PlugsConnectedIcon';
	import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircleIcon';
	import WarningCircleIcon from 'phosphor-svelte/lib/WarningCircleIcon';
	import ClockClockwiseIcon from 'phosphor-svelte/lib/ClockClockwiseIcon';
	import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon';
	import {
		fetchIntegrations,
		saveIntegrationCmd,
		testIntegrationCmd
	} from '#lib/remote/admin/integrations.remote.js';
	import type {
		IntegrationProvider,
		IntegrationUpsertInput
	} from '#lib/shared/schemas/integrations.js';

	type IntegrationStatus = 'not_configured' | 'configured' | 'connected' | 'failed' | 'disabled';
	type IntegrationTestStatus = 'success' | 'failed' | 'skipped';
	type FieldDef = {
		key: string;
		label: string;
		type: 'text' | 'email';
		required: boolean;
		placeholder?: string;
	};
	type IntegrationSummary = {
		id: number | null;
		provider: IntegrationProvider;
		displayName: string;
		category: 'email' | 'analytics' | 'advertising' | 'seo' | 'tag_management';
		enabled: boolean;
		status: IntegrationStatus;
		config: Record<string, unknown>;
		hasSecret: boolean;
		secretLastFour: string | null;
		secretUpdatedAt: Date | string | null;
		lastTestStatus: IntegrationTestStatus | null;
		lastTestAt: Date | string | null;
		lastTestError: string | null;
		lastTestEvidence: Record<string, unknown> | null;
		updatedAt: Date | string | null;
		definition: {
			provider: IntegrationProvider;
			displayName: string;
			category: 'email' | 'analytics' | 'advertising' | 'seo' | 'tag_management';
			secretLabel: string;
			secretRequired: boolean;
			fields: FieldDef[];
		};
	};
	type SecretField = { key: string; label: string; placeholder?: string };
	type ProviderForm = {
		enabled: boolean;
		config: Record<string, string>;
		secrets: Record<string, string>;
	};

	const emptyForms = (): Record<IntegrationProvider, ProviderForm> => ({
		resend: { enabled: false, config: {}, secrets: {} },
		ga4: { enabled: false, config: {}, secrets: {} },
		google_ads: { enabled: false, config: {}, secrets: {} },
		google_search_console: { enabled: false, config: {}, secrets: {} },
		google_tag: { enabled: false, config: {}, secrets: {} },
		google_tag_manager: { enabled: false, config: {}, secrets: {} }
	});
	const emptyFlags = (): Record<IntegrationProvider, boolean> => ({
		resend: false,
		ga4: false,
		google_ads: false,
		google_search_console: false,
		google_tag: false,
		google_tag_manager: false
	});
	const emptyText = (): Record<IntegrationProvider, string> => ({
		resend: '',
		ga4: '',
		google_ads: '',
		google_search_console: '',
		google_tag: '',
		google_tag_manager: ''
	});

	let loading = $state(true);
	let loadError = $state('');
	let integrations = $state<IntegrationSummary[]>([]);
	let forms = $state<Record<IntegrationProvider, ProviderForm>>(emptyForms());
	let saving = $state<Record<IntegrationProvider, boolean>>(emptyFlags());
	let testing = $state<Record<IntegrationProvider, boolean>>(emptyFlags());
	let messages = $state<Record<IntegrationProvider, string>>(emptyText());
	let errors = $state<Record<IntegrationProvider, string>>(emptyText());
	let initialized = false;

	onMount(() => {
		if (initialized) return;
		initialized = true;
		setTimeout(loadIntegrations, 0);
	});

	function applySummaries(items: IntegrationSummary[]) {
		integrations = items;
		const next = emptyForms();
		for (const item of items) {
			next[item.provider].enabled = item.enabled;
			for (const field of item.definition.fields) {
				next[item.provider].config[field.key] = String(item.config[field.key] ?? '');
			}
		}
		forms = next;
	}

	async function loadIntegrations() {
		loading = true;
		loadError = '';
		try {
			applySummaries((await fetchIntegrations()) as IntegrationSummary[]);
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Unable to load integrations.';
		} finally {
			loading = false;
		}
	}

	function secretFields(provider: IntegrationProvider): SecretField[] {
		if (provider === 'resend') return [{ key: 'apiKey', label: 'Resend API key' }];
		if (provider === 'ga4') return [{ key: 'apiSecret', label: 'GA4 API secret' }];
		if (provider === 'google_ads') {
			return [
				{ key: 'developerToken', label: 'Developer token' },
				{ key: 'clientId', label: 'OAuth client ID' },
				{ key: 'clientSecret', label: 'OAuth client secret' },
				{ key: 'refreshToken', label: 'OAuth refresh token' }
			];
		}
		return [];
	}

	function googleAdsSecretBundle(provider: IntegrationProvider) {
		return {
			developerToken: secretValue(provider, 'developerToken') ?? '',
			clientId: secretValue(provider, 'clientId') ?? '',
			clientSecret: secretValue(provider, 'clientSecret') ?? '',
			refreshToken: secretValue(provider, 'refreshToken') ?? ''
		};
	}

	function googleAdsConfig(provider: IntegrationProvider) {
		return {
			conversionId: forms[provider].config['conversionId'] ?? '',
			conversionLabel: optional(provider, 'conversionLabel'),
			customerId: optional(provider, 'customerId'),
			loginCustomerId: optional(provider, 'loginCustomerId')
		};
	}

	function buildInput(provider: IntegrationProvider): IntegrationUpsertInput {
		if (provider === 'resend') {
			const apiKey = secretValue(provider, 'apiKey');
			return {
				provider,
				enabled: forms[provider].enabled,
				config: {
					fromEmail: forms[provider].config['fromEmail'] ?? '',
					fromName: optional(provider, 'fromName'),
					replyTo: optional(provider, 'replyTo'),
					notifyEmail: optional(provider, 'notifyEmail')
				},
				secrets: apiKey ? { apiKey } : undefined
			};
		}
		if (provider === 'ga4') {
			const apiSecret = secretValue(provider, 'apiSecret');
			return {
				provider,
				enabled: forms[provider].enabled,
				config: { measurementId: forms[provider].config['measurementId'] ?? '' },
				secrets: apiSecret ? { apiSecret } : undefined
			};
		}
		if (provider === 'google_ads') {
			const googleSecrets = googleAdsSecretBundle(provider);
			const hasGoogleSecrets = Object.values(googleSecrets).some(Boolean);
			return {
				provider,
				enabled: forms[provider].enabled,
				config: googleAdsConfig(provider),
				secrets: hasGoogleSecrets ? googleSecrets : undefined
			};
		}
		if (provider === 'google_search_console') {
			return {
				provider,
				enabled: forms[provider].enabled,
				config: { verificationToken: forms[provider].config['verificationToken'] ?? '' }
			};
		}
		if (provider === 'google_tag') {
			return {
				provider,
				enabled: forms[provider].enabled,
				config: { tagId: forms[provider].config['tagId'] ?? '' }
			};
		}
		return {
			provider,
			enabled: forms[provider].enabled,
			config: { containerId: forms[provider].config['containerId'] ?? '' }
		};
	}

	function optional(provider: IntegrationProvider, key: string): string | undefined {
		const value = forms[provider].config[key]?.trim();
		return value ? value : undefined;
	}

	function secretValue(provider: IntegrationProvider, key: string): string | undefined {
		const value = forms[provider].secrets[key]?.trim();
		return value ? value : undefined;
	}

	function mergeSummary(summary: IntegrationSummary) {
		integrations = integrations.map((item) =>
			item.provider === summary.provider ? summary : item
		);
		forms[summary.provider].enabled = summary.enabled;
		for (const field of summary.definition.fields) {
			forms[summary.provider].config[field.key] = String(summary.config[field.key] ?? '');
		}
		forms[summary.provider].secrets = {};
	}

	async function saveIntegration(provider: IntegrationProvider) {
		saving[provider] = true;
		messages[provider] = '';
		errors[provider] = '';
		try {
			const summary = (await saveIntegrationCmd(buildInput(provider))) as IntegrationSummary;
			mergeSummary(summary);
			messages[provider] = 'Saved. Run a connection test to confirm.';
		} catch (err) {
			// A refusal (e.g. 503 NOT_CONFIGURED: no encryption key on this
			// deployment) carries what to fix; a scrubbed 500 gets the fallback.
			errors[provider] = refusalMessage(
				err,
				err instanceof Error ? err.message : 'Unable to save integration.'
			);
		} finally {
			saving[provider] = false;
		}
	}

	async function testIntegration(provider: IntegrationProvider) {
		testing[provider] = true;
		messages[provider] = '';
		errors[provider] = '';
		try {
			const summary = (await testIntegrationCmd({ provider })) as IntegrationSummary;
			mergeSummary(summary);
			messages[provider] =
				summary.lastTestStatus === 'success'
					? successMessage(provider)
					: 'Connection test completed with attention needed.';
			if (summary.lastTestError) errors[provider] = summary.lastTestError;
		} catch (err) {
			errors[provider] = refusalMessage(
				err,
				err instanceof Error ? err.message : 'Unable to test integration.'
			);
		} finally {
			testing[provider] = false;
		}
	}

	function successMessage(provider: IntegrationProvider): string {
		if (provider === 'ga4') {
			return 'GA4 event payload validated. This check does not verify credentials or event delivery. Use GA4 Realtime or DebugView to confirm collection.';
		}
		if (provider === 'google_ads') {
			return 'Google Ads configuration validated. Conversion events still require a public conversion trigger.';
		}
		if (provider === 'google_search_console') {
			return 'Search Console verification tag validated for server-rendered public pages.';
		}
		if (provider === 'google_tag') {
			return 'Google tag validated and will load on public pages without sending duplicate page views.';
		}
		if (provider === 'google_tag_manager') {
			return 'Google Tag Manager container validated and will load on public pages.';
		}
		return 'Connection confirmed with provider evidence.';
	}

	function runtimeNote(integration: IntegrationSummary): string {
		if (integration.provider === 'ga4') {
			return 'When enabled and configured, the GA4 browser tag runs on public pages. Payload validation does not confirm collection. Admin pages are excluded from page-view tracking.';
		}
		if (integration.provider === 'google_ads') {
			return 'Public website pages load the Google Ads tag when enabled. Conversion labels are used only where a conversion trigger is implemented.';
		}
		if (integration.provider === 'google_search_console') {
			return 'Public website pages render the google-site-verification meta tag in the server head. Admin pages are excluded.';
		}
		if (integration.provider === 'google_tag') {
			return 'Public website pages load the Google tag ID from the current Manage Google tag UI. Page-view sending stays disabled here to avoid duplicate GA4 hits.';
		}
		if (integration.provider === 'google_tag_manager') {
			return 'Public website pages load Google Tag Manager and include the noscript fallback. Admin pages are excluded.';
		}
		return 'Runtime email paths use this provider only after it is enabled and connected.';
	}

	async function saveAndTest(provider: IntegrationProvider) {
		await saveIntegration(provider);
		if (!errors[provider]) await testIntegration(provider);
	}

	function statusLabel(status: IntegrationStatus): string {
		return status.replace(/_/g, ' ');
	}

	function formatDate(value: Date | string | null): string {
		if (!value) return 'Never';
		const date = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(date.getTime())) return 'Never';
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(date);
	}

	function evidenceText(value: Record<string, unknown> | null): string {
		return value ? JSON.stringify(value, null, 2) : 'No evidence captured yet.';
	}
</script>

<SEO
	title="Integrations | Admin"
	description="Configure and verify external service integrations"
	noindex={true}
/>

<div class="integrations">
	<header class="integrations__header">
		<div>
			<p class="integrations__eyebrow">Settings</p>
			<h1>Integrations</h1>
			<p class="integrations__sub">
				Configure Resend, GA4, Google Ads, Search Console, Google tag, and Tag Manager. Each check
				reports the evidence it can verify. Secrets are encrypted where required.
			</p>
		</div>
		<div class="integrations__summary" aria-label="Integration status summary">
			<PlugsConnectedIcon size={24} weight="duotone" />
			<span>{integrations.filter((item) => item.status === 'connected').length}</span>
			<small>connected</small>
		</div>
	</header>

	{#if loading}
		<div class="integrations__state">Loading integrations...</div>
	{:else if loadError}
		<div class="integrations__state integrations__state--error">
			<p>{loadError}</p>
			<button type="button" onclick={loadIntegrations}>Retry</button>
		</div>
	{:else}
		<div class="integrations__grid">
			{#each integrations as integration (integration.provider)}
				<section class="integration-card" data-provider={integration.provider}>
					<header class="integration-card__header">
						<div>
							<p class="integration-card__category">{integration.category}</p>
							<h2>{integration.displayName}</h2>
						</div>
						<div
							class={[
								'status-chip',
								{
									'status-chip--connected': integration.status === 'connected',
									'status-chip--failed': integration.status === 'failed',
									'status-chip--disabled': integration.status === 'disabled'
								}
							]}
						>
							{#if integration.status === 'connected'}
								<CheckCircleIcon size={15} weight="fill" />
							{:else if integration.status === 'failed'}
								<WarningCircleIcon size={15} weight="fill" />
							{:else}
								<ClockClockwiseIcon size={15} />
							{/if}
							<span>{statusLabel(integration.status)}</span>
						</div>
					</header>

					<label class="toggle-row">
						<input
							id="integration-{integration.provider}-enabled"
							name="integration-{integration.provider}-enabled"
							type="checkbox"
							checked={forms[integration.provider].enabled}
							onchange={(e) => {
								forms[integration.provider].enabled = (e.currentTarget as HTMLInputElement).checked;
							}}
						/>
						<span>Enabled for production runtime</span>
					</label>

					<p class="integration-card__note">{runtimeNote(integration)}</p>

					<div class="integration-card__fields">
						{#each integration.definition.fields as field (field.key)}
							<label class="field">
								<span>{field.label}{field.required ? ' *' : ''}</span>
								<input
									id="integration-{integration.provider}-config-{field.key}"
									name="integration-{integration.provider}-config-{field.key}"
									type={field.type}
									value={forms[integration.provider].config[field.key] ?? ''}
									placeholder={field.placeholder ?? ''}
									oninput={(e) => {
										forms[integration.provider].config[field.key] = (
											e.currentTarget as HTMLInputElement
										).value;
									}}
								/>
							</label>
						{/each}
					</div>

					<div class="integration-card__secrets">
						<div class="integration-card__secret-head">
							<strong>Secret credentials</strong>
							{#if integration.hasSecret}
								<span>Stored key ending in {integration.secretLastFour}</span>
							{:else}
								<span>No secret stored</span>
							{/if}
						</div>
						{#each secretFields(integration.provider) as field (field.key)}
							<label class="field">
								<span>{field.label}</span>
								<input
									id="integration-{integration.provider}-secret-{field.key}"
									name="integration-{integration.provider}-secret-{field.key}"
									type="password"
									value={forms[integration.provider].secrets[field.key] ?? ''}
									placeholder={integration.hasSecret
										? 'Leave blank to keep existing secret'
										: (field.placeholder ?? 'Paste secret')}
									autocomplete="new-password"
									oninput={(e) => {
										forms[integration.provider].secrets[field.key] = (
											e.currentTarget as HTMLInputElement
										).value;
									}}
								/>
							</label>
						{/each}
					</div>

					<div class="integration-card__actions">
						<button
							type="button"
							class="btn btn--secondary"
							disabled={saving[integration.provider] || testing[integration.provider]}
							onclick={() => saveIntegration(integration.provider)}
						>
							<FloppyDiskIcon size={15} />
							{saving[integration.provider] ? 'Saving...' : 'Save'}
						</button>
						<button
							type="button"
							class="btn btn--primary"
							disabled={saving[integration.provider] || testing[integration.provider]}
							onclick={() => saveAndTest(integration.provider)}
						>
							<PlugsConnectedIcon size={15} />
							{testing[integration.provider] ? 'Testing...' : 'Save & test'}
						</button>
						<button
							type="button"
							class="btn btn--ghost"
							disabled={testing[integration.provider] || !integration.id}
							onclick={() => testIntegration(integration.provider)}
						>
							Test saved connection
						</button>
					</div>

					{#if messages[integration.provider]}
						<p class="notice notice--success">{messages[integration.provider]}</p>
					{/if}
					{#if errors[integration.provider]}
						<p class="notice notice--error">{errors[integration.provider]}</p>
					{/if}

					<div class="evidence">
						<div>
							<strong>Last evidence</strong>
							<span>{formatDate(integration.lastTestAt)}</span>
						</div>
						<pre>{evidenceText(integration.lastTestEvidence)}</pre>
					</div>
				</section>
			{/each}
		</div>
	{/if}
</div>

<style>
	.integrations {
		max-width: 1180px;
		margin: 0 auto;
		padding: 2rem;
	}

	.integrations__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.integrations__eyebrow,
	.integration-card__category {
		margin: 0 0 0.35rem;
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(197, 160, 89, 0.78);
	}

	.integrations h1,
	.integration-card h2 {
		font-family: var(--font-heading);
		color: #fff;
		margin: 0;
		letter-spacing: -0.02em;
	}

	.integrations h1 {
		font-size: clamp(2rem, 4vw, 3rem);
	}

	.integration-card h2 {
		font-size: 1.15rem;
	}

	.integrations__sub {
		max-width: 42rem;
		margin: 0.5rem 0 0;
		color: rgba(255, 255, 255, 0.56);
		line-height: 1.6;
	}

	.integrations__summary {
		display: grid;
		place-items: center;
		min-width: 120px;
		padding: 1rem;
		border-radius: 1rem;
		border: 1px solid rgba(197, 160, 89, 0.18);
		background: rgba(197, 160, 89, 0.08);
		color: #c5a059;
	}

	.integrations__summary span {
		font-family: var(--font-heading);
		font-size: 2rem;
		font-weight: 800;
		line-height: 1;
	}

	.integrations__summary small {
		color: rgba(255, 255, 255, 0.5);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.integrations__state {
		padding: 4rem 2rem;
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.035);
		text-align: center;
		color: rgba(255, 255, 255, 0.56);
	}

	.integrations__state--error {
		color: #f87171;
	}

	.integrations__grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}

	.integration-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.1rem;
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.018));
		box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
	}

	.integration-card__header,
	.integration-card__secret-head,
	.evidence > div {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.status-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.55rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.06);
		color: rgba(255, 255, 255, 0.62);
		font-size: 0.7rem;
		font-weight: 800;
		text-transform: capitalize;
		white-space: nowrap;
	}

	.status-chip--connected {
		background: rgba(52, 211, 153, 0.12);
		color: #86efac;
	}

	.status-chip--failed {
		background: rgba(248, 113, 113, 0.12);
		color: #fca5a5;
	}

	.status-chip--disabled {
		background: rgba(148, 163, 184, 0.1);
		color: rgba(255, 255, 255, 0.42);
	}

	.toggle-row {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		font-size: 0.82rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.72);
	}

	.toggle-row input {
		accent-color: #c5a059;
	}

	.integration-card__fields,
	.integration-card__secrets {
		display: grid;
		gap: 0.75rem;
	}

	.integration-card__secrets {
		padding-top: 0.25rem;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	.integration-card__secret-head strong,
	.evidence strong {
		color: rgba(255, 255, 255, 0.75);
		font-size: 0.78rem;
	}

	.integration-card__secret-head span,
	.evidence span,
	.integration-card__note {
		font-size: 0.72rem;
		color: rgba(255, 255, 255, 0.38);
	}

	.integration-card__note {
		margin: -0.35rem 0 0;
		line-height: 1.45;
	}

	.field {
		display: grid;
		gap: 0.35rem;
	}

	.field span {
		font-size: 0.72rem;
		font-weight: 750;
		color: rgba(255, 255, 255, 0.58);
	}

	.field input {
		width: 100%;
		padding: 0.7rem 0.75rem;
		border-radius: 0.65rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.2);
		color: rgba(255, 255, 255, 0.88);
		font: inherit;
		font-size: 0.85rem;
	}

	.field input:focus {
		outline: none;
		border-color: rgba(197, 160, 89, 0.48);
		box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.12);
	}

	.integration-card__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		min-height: 2.35rem;
		padding: 0.55rem 0.8rem;
		border-radius: 0.65rem;
		border: 1px solid transparent;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 800;
		cursor: pointer;
		transition:
			transform 0.15s ease,
			border-color 0.15s ease,
			background 0.15s ease;
	}

	.btn:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn--primary {
		background: #c5a059;
		color: #0a0a0f;
	}

	.btn--secondary,
	.btn--ghost {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.78);
	}

	.btn--ghost {
		background: transparent;
	}

	.notice {
		margin: 0;
		padding: 0.7rem 0.8rem;
		border-radius: 0.7rem;
		font-size: 0.78rem;
		line-height: 1.45;
	}

	.notice--success {
		background: rgba(52, 211, 153, 0.1);
		color: #86efac;
	}

	.notice--error {
		background: rgba(248, 113, 113, 0.1);
		color: #fca5a5;
	}

	.evidence {
		display: grid;
		gap: 0.5rem;
		padding-top: 0.25rem;
	}

	.evidence pre {
		max-height: 180px;
		margin: 0;
		padding: 0.75rem;
		border-radius: 0.75rem;
		background: rgba(0, 0, 0, 0.28);
		border: 1px solid rgba(255, 255, 255, 0.06);
		color: rgba(255, 255, 255, 0.62);
		font-size: 0.7rem;
		line-height: 1.45;
		overflow: auto;
		white-space: pre-wrap;
	}

	@media (max-width: 1180px) {
		.integrations__grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 720px) {
		.integrations {
			padding: 1rem;
		}

		.integrations__header {
			flex-direction: column;
		}

		.integrations__summary {
			width: 100%;
		}
	}
</style>
