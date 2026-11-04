import { z } from 'zod';

export const integrationProviderSchema = z.enum([
	'resend',
	'ga4',
	'google_ads',
	'google_search_console',
	'google_tag',
	'google_tag_manager'
]);

const optionalTrimmedString = z
	.string()
	.trim()
	.transform((value) => (value.length > 0 ? value : undefined))
	.optional();

export const resendConfigSchema = z.object({
	fromEmail: z.string().trim().email('Enter a valid from email address'),
	fromName: optionalTrimmedString,
	replyTo: optionalTrimmedString,
	notifyEmail: optionalTrimmedString
});

export const ga4ConfigSchema = z.object({
	measurementId: z
		.string()
		.trim()
		.regex(/^G-[A-Z0-9]+$/, 'Enter a GA4 measurement ID like G-XXXXXXXXXX')
});

export const googleAdsConfigSchema = z.object({
	conversionId: z
		.string()
		.trim()
		.regex(/^AW-?[0-9]+$/, 'Enter a Google Ads conversion ID like AW-123456789'),
	conversionLabel: optionalTrimmedString,
	customerId: optionalTrimmedString,
	loginCustomerId: optionalTrimmedString
});

export const googleSearchConsoleConfigSchema = z.object({
	verificationToken: z
		.string()
		.trim()
		.regex(/^[A-Za-z0-9_-]+$/, 'Enter the content value from the google-site-verification meta tag')
});

export const googleTagManagerConfigSchema = z.object({
	containerId: z
		.string()
		.trim()
		.regex(/^GTM-[A-Za-z0-9]+$/, 'Enter a Google Tag Manager container ID like GTM-XXXXXXX')
});

export const googleTagConfigSchema = z.object({
	tagId: z
		.string()
		.trim()
		.regex(/^GT-[A-Za-z0-9]+$/, 'Enter a Google tag ID like GT-XXXXXXXXX')
});

export const resendSecretsSchema = z.object({
	apiKey: z.string().trim().min(12, 'Resend API key is required')
});

export const ga4SecretsSchema = z.object({
	apiSecret: z.string().trim().min(8, 'GA4 API secret is required')
});

export const googleAdsSecretsSchema = z.object({
	developerToken: z.string().trim().min(8, 'Developer token is required'),
	clientId: z.string().trim().min(8, 'OAuth client ID is required'),
	clientSecret: z.string().trim().min(8, 'OAuth client secret is required'),
	refreshToken: z.string().trim().min(8, 'OAuth refresh token is required')
});

export const integrationUpsertSchema = z.discriminatedUnion('provider', [
	z.object({
		provider: z.literal('resend'),
		enabled: z.boolean(),
		config: resendConfigSchema,
		secrets: resendSecretsSchema.optional()
	}),
	z.object({
		provider: z.literal('ga4'),
		enabled: z.boolean(),
		config: ga4ConfigSchema,
		secrets: ga4SecretsSchema.optional()
	}),
	z.object({
		provider: z.literal('google_ads'),
		enabled: z.boolean(),
		config: googleAdsConfigSchema,
		secrets: googleAdsSecretsSchema.optional()
	}),
	z.object({
		provider: z.literal('google_search_console'),
		enabled: z.boolean(),
		config: googleSearchConsoleConfigSchema,
		secrets: z.undefined().optional()
	}),
	z.object({
		provider: z.literal('google_tag'),
		enabled: z.boolean(),
		config: googleTagConfigSchema,
		secrets: z.undefined().optional()
	}),
	z.object({
		provider: z.literal('google_tag_manager'),
		enabled: z.boolean(),
		config: googleTagManagerConfigSchema,
		secrets: z.undefined().optional()
	})
]);

export const integrationProviderInputSchema = z.object({
	provider: integrationProviderSchema
});

export type IntegrationProvider = z.infer<typeof integrationProviderSchema>;
export type IntegrationUpsertInput = z.infer<typeof integrationUpsertSchema>;
export type IntegrationProviderInput = z.infer<typeof integrationProviderInputSchema>;
export type ResendConfigInput = z.infer<typeof resendConfigSchema>;
export type Ga4ConfigInput = z.infer<typeof ga4ConfigSchema>;
export type GoogleAdsConfigInput = z.infer<typeof googleAdsConfigSchema>;
export type GoogleSearchConsoleConfigInput = z.infer<typeof googleSearchConsoleConfigSchema>;
export type GoogleTagConfigInput = z.infer<typeof googleTagConfigSchema>;
export type GoogleTagManagerConfigInput = z.infer<typeof googleTagManagerConfigSchema>;
