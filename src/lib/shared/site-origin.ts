/**
 * Canonical production origin shared by metadata, feeds, sitemaps, and JSON-LD.
 *
 * Delegates directly to `src/lib/config/brand.ts` (the single source of truth for
 * `PUBLIC_SITE_URL` / `PUBLIC_APP_URL` and the canonical fallback origin) using a
 * relative import so plain-Node build scripts (`scripts/font-policy.mjs`) work cleanly.
 */

import { resolveSiteOrigin } from '../config/brand.ts';

export { resolveSiteOrigin };

export const SITE_ORIGIN: string = resolveSiteOrigin();
