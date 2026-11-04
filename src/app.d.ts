import type { AuthSession } from '#lib/server/auth.ts';
import type { Logger } from '#lib/server/logger.ts';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Window {
		gtag: (...args: unknown[]) => void;
		dataLayer: unknown[];
	}

	namespace App {
		interface Error {
			message: string;
			code?: string;
			errorId?: string;
		}

		interface Locals {
			reqId: string;
			logger: Logger;
			user?: AuthSession['user'];
			session?: AuthSession['session'];
		}

		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}
