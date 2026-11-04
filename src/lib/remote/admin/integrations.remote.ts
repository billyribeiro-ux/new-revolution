import { command, query } from '$app/server';
import { requireAdmin } from '#lib/server/auth-guards.js';
import { rethrowServiceRefusal } from '#lib/server/service-errors.js';
import {
	getIntegrationSummary,
	listIntegrationSummaries,
	listIntegrationTestRuns,
	testIntegrationConnection,
	upsertIntegration
} from '#lib/server/services/integrations.js';
import {
	integrationProviderInputSchema,
	integrationUpsertSchema
} from '#lib/shared/schemas/integrations.js';

export const fetchIntegrations = query(async () => {
	requireAdmin();
	return listIntegrationSummaries();
});

export const fetchIntegration = query(integrationProviderInputSchema, async ({ provider }) => {
	requireAdmin();
	return getIntegrationSummary(provider);
});

export const fetchIntegrationTestRuns = query(
	integrationProviderInputSchema,
	async ({ provider }) => {
		requireAdmin();
		return listIntegrationTestRuns(provider);
	}
);

export const saveIntegrationCmd = command(integrationUpsertSchema, async (input) => {
	requireAdmin();
	return upsertIntegration(input).catch(rethrowServiceRefusal);
});

export const testIntegrationCmd = command(integrationProviderInputSchema, async ({ provider }) => {
	requireAdmin();
	return testIntegrationConnection(provider).catch(rethrowServiceRefusal);
});
