/// <reference lib="dom" />
/**
 * Cookie-consent store (in-house CMP).
 *
 * Owns the visitor's consent decision and the Google Consent Mode v2 wiring:
 *   - On load, BEFORE any GA tag fires, default ALL consent signals to 'denied'
 *     (Consent Mode v2: analytics_storage, ad_storage, ad_user_data,
 *     ad_personalization). This is the GDPR-correct default for EEA visitors.
 *   - On a decision, gtag('consent','update', …) flips the granted signals.
 *
 * Persistence: localStorage `_t_consent`, carrying the policyVersion so
 * we can re-prompt when the policy changes. Every decision is also
 * POSTed to /api/consent for the audit log.
 */
import { browser } from '$app/env';

export const CONSENT_POLICY_VERSION = 1;
const STORAGE_KEY = '_t_consent';
const VID_KEY = '_t_vid';

export type ConsentCategories = {
	necessary: true;
	analytics: boolean;
	marketing: boolean;
};

type StoredConsent = {
	categories: ConsentCategories;
	policyVersion: number;
};

type GtagConsentParams = {
	analytics_storage: 'granted' | 'denied';
	ad_storage: 'granted' | 'denied';
	ad_user_data: 'granted' | 'denied';
	ad_personalization: 'granted' | 'denied';
};

// `Window.gtag` / `Window.dataLayer` are declared globally in src/app.d.ts.

function readStored(): StoredConsent | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as StoredConsent;
		if (!parsed?.categories || typeof parsed.policyVersion !== 'number') return null;
		return parsed;
	} catch {
		return null;
	}
}

function vid(): string {
	if (!browser) return '';
	try {
		let id = localStorage.getItem(VID_KEY);
		if (!id) {
			id = crypto.randomUUID();
			localStorage.setItem(VID_KEY, id);
		}
		return id;
	} catch {
		return '';
	}
}

/**
 * Push a Consent Mode command the only way gtag.js accepts it: as an
 * Arguments object via the global gtag shim. gtag.js/gtm.js IGNORE plain
 * arrays pushed to dataLayer; the previous array push here made every
 * consent command a silent no-op (forensic audit 2026-06-11). The shim is
 * defined by the app.html boot script before any module executes; the
 * fallback below only covers non-standard embedding contexts.
 */
function gtagConsent(mode: 'default' | 'update', params: GtagConsentParams): void {
	if (!browser) return;
	window.dataLayer = window.dataLayer ?? [];
	if (typeof window.gtag !== 'function') {
		window.gtag = function gtag() {
			// eslint-disable-next-line prefer-rest-params -- gtag.js requires the Arguments object shape; a rest-param array would be ignored
			window.dataLayer.push(arguments);
		};
	}
	window.gtag('consent', mode, params);
}

function toParams(c: ConsentCategories): GtagConsentParams {
	const ad = c.marketing ? 'granted' : 'denied';
	return {
		analytics_storage: c.analytics ? 'granted' : 'denied',
		ad_storage: ad,
		ad_user_data: ad,
		ad_personalization: ad
	};
}

class ConsentStore {
	/** null = no decision yet (banner should show). */
	categories = $state<ConsentCategories | null>(null);
	/** True once a valid, current-version decision exists. */
	decided = $derived(this.categories !== null);
	analytics = $derived(this.categories?.analytics ?? false);
	marketing = $derived(this.categories?.marketing ?? false);

	/**
	 * Initialize: set Consent Mode v2 defaults to denied (before GA fires),
	 * then load any stored decision and apply it. Returns whether the banner
	 * needs to be shown (no decision, or stale policy version).
	 */
	init(): boolean {
		if (!browser) return false;
		// Denied-by-default for EEA/GDPR. The authoritative registration lives
		// in the app.html boot script (parse time, before any tag can load);
		// this re-push is an idempotent safety net with identical values.
		gtagConsent('default', {
			analytics_storage: 'denied',
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied'
		});

		const stored = readStored();
		if (stored && stored.policyVersion >= CONSENT_POLICY_VERSION) {
			this.categories = stored.categories;
			gtagConsent('update', toParams(stored.categories));
			return false;
		}
		return true;
	}

	private persistAndApply(categories: ConsentCategories): void {
		this.categories = categories;
		if (browser) {
			try {
				localStorage.setItem(
					STORAGE_KEY,
					JSON.stringify({ categories, policyVersion: CONSENT_POLICY_VERSION })
				);
			} catch {
				/* private mode / quota — best effort */
			}
		}
		gtagConsent('update', toParams(categories));
		void this.logDecision(categories);
	}

	private async logDecision(categories: ConsentCategories): Promise<void> {
		if (!browser) return;
		try {
			await fetch('/api/consent', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					anonId: vid(),
					categories,
					policyVersion: CONSENT_POLICY_VERSION
				}),
				keepalive: true
			});
		} catch {
			/* audit log is best-effort; the local decision already applies */
		}
	}

	acceptAll(): void {
		this.persistAndApply({ necessary: true, analytics: true, marketing: true });
	}

	rejectAll(): void {
		this.persistAndApply({ necessary: true, analytics: false, marketing: false });
	}

	save(opts: { analytics: boolean; marketing: boolean }): void {
		this.persistAndApply({ necessary: true, analytics: opts.analytics, marketing: opts.marketing });
	}
}

export const consent = new ConsentStore();
