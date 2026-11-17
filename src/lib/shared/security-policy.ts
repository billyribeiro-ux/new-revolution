/** Shared SSR/static baseline. HTTPS CMS media and approved embeds remain usable. */
export const CONTENT_SECURITY_POLICY =
	"default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://calendly.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'";
export const PERMISSIONS_POLICY = 'camera=(), microphone=(), geolocation=(), payment=()';
