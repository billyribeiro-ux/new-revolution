import type { IntegrationProvider } from '#lib/shared/schemas/integrations.js';

export type IntegrationStatus =
	| 'not_configured'
	| 'configured'
	| 'connected'
	| 'failed'
	| 'disabled';
export type IntegrationTestStatus = 'success' | 'failed' | 'skipped';

export type IntegrationDefinition = {
	provider: IntegrationProvider;
	displayName: string;
	category: 'email' | 'analytics' | 'advertising' | 'seo' | 'tag_management';
	secretLabel: string;
	secretRequired: boolean;
	fields: Array<{
		key: string;
		label: string;
		type: 'text' | 'email';
		required: boolean;
		placeholder?: string;
	}>;
};

export const integrationDefinitions: Record<IntegrationProvider, IntegrationDefinition> = {
	resend: {
		provider: 'resend',
		displayName: 'Resend',
		category: 'email',
		secretLabel: 'API key',
		secretRequired: true,
		fields: [
			{
				key: 'fromEmail',
				label: 'From email',
				type: 'email',
				required: true,
				placeholder: 'support@revolutiontradingpros.com'
			},
			{
				key: 'fromName',
				label: 'From name',
				type: 'text',
				required: false,
				placeholder: 'Revolution Trading Pros'
			},
			{
				key: 'replyTo',
				label: 'Reply-to email',
				type: 'email',
				required: false,
				placeholder: 'support@revolutiontradingpros.com'
			},
			{
				key: 'notifyEmail',
				label: 'Lead notification email',
				type: 'email',
				required: false,
				placeholder: 'owner@example.com'
			}
		]
	},
	ga4: {
		provider: 'ga4',
		displayName: 'Google Analytics 4',
		category: 'analytics',
		secretLabel: 'Measurement Protocol API secret',
		secretRequired: true,
		fields: [
			{
				key: 'measurementId',
				label: 'Measurement ID',
				type: 'text',
				required: true,
				placeholder: 'G-XXXXXXXXXX'
			}
		]
	},
	google_ads: {
		provider: 'google_ads',
		displayName: 'Google Ads',
		category: 'advertising',
		secretLabel: 'Google Ads API OAuth bundle',
		secretRequired: false,
		fields: [
			{
				key: 'conversionId',
				label: 'Conversion ID',
				type: 'text',
				required: true,
				placeholder: 'AW-123456789'
			},
			{
				key: 'conversionLabel',
				label: 'Default conversion label',
				type: 'text',
				required: false,
				placeholder: 'abcDEFghiJKLmnopQ'
			},
			{
				key: 'customerId',
				label: 'Customer ID',
				type: 'text',
				required: false,
				placeholder: '123-456-7890'
			},
			{
				key: 'loginCustomerId',
				label: 'Manager login customer ID',
				type: 'text',
				required: false,
				placeholder: '123-456-7890'
			}
		]
	},
	google_search_console: {
		provider: 'google_search_console',
		displayName: 'Google Search Console',
		category: 'seo',
		secretLabel: 'No secret required',
		secretRequired: false,
		fields: [
			{
				key: 'verificationToken',
				label: 'HTML tag verification content',
				type: 'text',
				required: true,
				placeholder: 'BrOqLZqBXGLujtjOEmZoC3d_WOTKhltuzPnEzpQJPog'
			}
		]
	},
	google_tag: {
		provider: 'google_tag',
		displayName: 'Google tag',
		category: 'tag_management',
		secretLabel: 'No secret required',
		secretRequired: false,
		fields: [
			{
				key: 'tagId',
				label: 'Tag ID',
				type: 'text',
				required: true,
				placeholder: 'GT-XXXXXXXXX'
			}
		]
	},
	google_tag_manager: {
		provider: 'google_tag_manager',
		displayName: 'Google Tag Manager',
		category: 'tag_management',
		secretLabel: 'No secret required',
		secretRequired: false,
		fields: [
			{
				key: 'containerId',
				label: 'Container ID',
				type: 'text',
				required: true,
				placeholder: 'GTM-XXXXXXX'
			}
		]
	}
};

export const integrationProviders = Object.keys(integrationDefinitions) as IntegrationProvider[];

export function displayNameForProvider(provider: IntegrationProvider): string {
	return integrationDefinitions[provider].displayName;
}
