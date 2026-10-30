Mandatory Font Hosting Standard

All website fonts must be self-hosted, preferably sourced from Fontsource.org. Use optimized WOFF2 files, preserve the existing typography, and maintain a centralized font configuration within the CSS Single Source of Truth (SSOT).

Fonts must be served exclusively from the website's own infrastructure, with no runtime dependencies on Google Fonts, external font CDNs, or third-party font services.

Follow official Svelte, Fontsource, and web performance guidance for font loading, weight selection, fallback fonts, font-display, and selective preloading.

Verify that all fonts load correctly in production and that no external font requests occur.