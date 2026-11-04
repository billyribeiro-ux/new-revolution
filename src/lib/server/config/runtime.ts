import { building, dev } from '$app/env';
import * as env from '$app/env/private';
import * as publicEnv from '$app/env/public';

const trim = (value: string | undefined): string | null => {
	const normalized = value?.trim();
	return normalized && normalized.length > 0 ? normalized : null;
};

const ensureNoTrailingSlash = (url: string): string => url.replace(/\/+$/, '');

let validated = false;

export function getRequiredEnv(name: keyof typeof env): string {
	const value = trim(env[name]);
	if (!value) throw new Error(`${name} environment variable is not set`);
	return value;
}

export function getPublicBaseUrl(): string {
	const explicit = trim(publicEnv.PUBLIC_APP_URL) ?? trim(env.ORIGIN);
	if (explicit) return ensureNoTrailingSlash(explicit);

	const productionDomain = trim(env.VERCEL_PROJECT_PRODUCTION_URL);
	if (productionDomain) return ensureNoTrailingSlash(`https://${productionDomain}`);

	const deploymentDomain = trim(env.VERCEL_URL);
	if (deploymentDomain) return ensureNoTrailingSlash(`https://${deploymentDomain}`);

	if (dev || building) return 'http://localhost:5173';

	return 'https://revolutiontradingpros.com';
}

export function assertProductionEnv(): void {
	if (validated || dev || building) return;
	validated = true;
}
