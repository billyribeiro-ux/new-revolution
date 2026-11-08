import { expect, test } from '@playwright/test';

test.describe('Revolution Trading Pros Homepage Blueprint', () => {
	test('enforces single H1 with whitespace separation and semantic H2/H3 outline', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/');

		// Exactly one H1 on the page
		const h1List = page.locator('h1');
		await expect(h1List).toHaveCount(1);

		// Flattened H1 text must separate .h1-query and .h1-emotional with whitespace (never "IndicatorsYou")
		const h1Text = await h1List.first().textContent();
		expect(h1Text).toBeTruthy();
		expect(h1Text).not.toContain('IndicatorsYou');
		expect(h1Text).toMatch(/Custom Indicators\s+You Finally Found/);

		// The eBook does not exist yet (FREE_EBOOK_AVAILABLE=false in launch-gate.ts): no dead lead form on a YMYL page
		await expect(page.locator('#ebook')).toHaveCount(0);
		await expect(page.locator('form#ebookForm')).toHaveCount(0);
		await expect(page.getByText('DESIGN PREVIEW')).toHaveCount(0);
		await expect(page.getByText('ENTERPRISE BLUEPRINT')).toHaveCount(0);

		// FAQ questions are semantic H3s inside <summary>
		const faqHeadings = page.locator('.faqs details summary h3.faq-question');
		await expect(faqHeadings).toHaveCount(5);

		// Footer column headers and risk disclosure title are <p> tags, NOT H3 headings
		await expect(page.locator('footer h3')).toHaveCount(0);
		await expect(page.locator('footer p.footer-col-title')).toHaveCount(5);
		await expect(page.locator('footer p.risk-box-title')).toHaveCount(1);
	});

	test('renders enhanced brand logo and the 7-item navigation menu and submenus with visible Blog while Store remains gated', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/');

		// Top-left and footer logos rendered via enhanced:img (<picture> + <img>) with emblem crop (object-fit: cover, left center)
		for (const selector of [
			'header.nav-shell .brand picture img',
			'footer.footer .brand picture img'
		]) {
			const logoImg = page.locator(selector);
			await expect(logoImg).toBeVisible();

			const logoStyles = await logoImg.evaluate((img) => {
				const wrap = img.closest('.brand-logo-wrap') as HTMLElement;
				const wrapStyle = getComputedStyle(wrap);
				const imgStyle = getComputedStyle(img);
				return {
					wrapWidth: wrapStyle.width,
					wrapHeight: wrapStyle.height,
					wrapOverflow: wrapStyle.overflow,
					objectFit: imgStyle.objectFit,
					objectPosition: imgStyle.objectPosition
				};
			});
			expect(logoStyles.wrapWidth).toBe('46px');
			expect(logoStyles.wrapHeight).toBe('46px');
			expect(logoStyles.wrapOverflow).toBe('hidden');
			expect(logoStyles.objectFit).toBe('cover');
			expect(logoStyles.objectPosition).toBe('0% 50%');
		}

		// Seven visible top-level items on published; Store remains hidden
		const topLevelNavItems = page.locator(
			'nav.nav-links > .nav-item > .nav-dropdown-trigger, nav.nav-links > .nav-item > .nav-link'
		);
		await expect(topLevelNavItems).toHaveCount(7);

		const labels = (await topLevelNavItems.allTextContents()).map((t) => t.trim());
		expect(labels).toEqual([
			'Live Trading Rooms',
			'Alert Services',
			'Mentorship',
			'Our Mission',
			'About',
			'Blog',
			'Resources'
		]);

		// Submenu items verification
		const liveRoomsSubmenu = page
			.locator('ul[aria-label="Live Trading Rooms submenu"] a.dropdown-link')
			.allTextContents();
		expect((await liveRoomsSubmenu).map((t) => t.trim())).toEqual([
			'Day Trading Room',
			'Swing Trading Room',
			'Small Accounts Room'
		]);

		const alertServicesSubmenu = page
			.locator('ul[aria-label="Alert Services submenu"] a.dropdown-link')
			.allTextContents();
		expect((await alertServicesSubmenu).map((t) => t.trim())).toEqual([
			'SPX Profit Pulse',
			'Sunday Alpha Protocol'
		]);

		await expect(page.locator('ul[aria-label="Store submenu"]')).toHaveCount(0);
		await expect(page.locator('nav.nav-links a[href$="blog"]')).toBeVisible();

		const resourcesSubmenu = page
			.locator('ul[aria-label="Resources submenu"] a.dropdown-link')
			.allTextContents();
		expect((await resourcesSubmenu).map((t) => t.trim())).toEqual([
			'Options Calculator',
			'ETF Stocks List',
			'Stock Indexes List'
		]);
	});

	test('keeps Blog navigation, footer and JSON-LD aligned and navigates on desktop and mobile', async ({
		page
	}, testInfo) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/');
		const navigationSchema = await page
			.locator('script[type="application/ld+json"]')
			.evaluateAll((scripts) => {
				const graphs = scripts.flatMap(
					(script) => JSON.parse(script.textContent || '{}')['@graph'] || []
				);
				return graphs.find(
					(node) => node['@id'] === 'https://www.revolutiontradingpros.com/#navigation'
				);
			});
		const visibleLinks = await page.locator('nav.nav-links a').evaluateAll((links) =>
			links.map((link) => ({
				name: link.textContent?.trim(),
				url:
					'https://www.revolutiontradingpros.com' +
					new URL((link as HTMLAnchorElement).href).pathname
			}))
		);
		expect(
			navigationSchema.itemListElement.map((node: { name: string; url: string }) => ({
				name: node.name,
				url: node.url
			}))
		).toEqual(visibleLinks);
		await expect(
			page.locator('footer').getByRole('link', { name: 'Blog', exact: true })
		).toBeVisible();
		await testInfo.attach('navbar-desktop.png', {
			body: await page.screenshot(),
			contentType: 'image/png'
		});
		await page.locator('nav.nav-links').getByRole('link', { name: 'Blog', exact: true }).click();
		await expect(page).toHaveURL(/\/blog$/);
		await expect(page.locator('nav.nav-links a[href="/blog"]')).toHaveAttribute(
			'aria-current',
			'page'
		);
		await expect(page.locator('main h1')).toHaveCount(1);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index/);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			'https://www.revolutiontradingpros.com/blog'
		);

		for (const width of [320, 768, 1024, 1280]) {
			await page.setViewportSize({ width, height: 900 });
			await page.goto('/');
			const mobileToggle = page.getByRole('button', { name: 'Open navigation' });
			const useMobileMenu = await mobileToggle.isVisible();
			if (useMobileMenu) {
				await mobileToggle.click();
				await page.keyboard.press('Escape');
				await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
				await mobileToggle.click();
			}
			const menu = page.locator(useMobileMenu ? '#mobileNavigation' : 'nav.nav-links');
			const blogLink = menu.getByRole('link', { name: 'Blog', exact: true });
			await expect(blogLink).toBeVisible();
			const bounds = await blogLink.boundingBox();
			expect(bounds).not.toBeNull();
			expect(bounds!.x).toBeGreaterThanOrEqual(0);
			expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
			expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
				true
			);
			if (width === 320)
				await testInfo.attach('navbar-mobile.png', {
					body: await page.screenshot(),
					contentType: 'image/png'
				});
			await blogLink.click();
			await expect(page).toHaveURL(/\/blog$/);
			if (useMobileMenu)
				await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute(
					'aria-expanded',
					'false'
				);
		}
	});

	test('applies SSOT color style guide (including WCAG AA #7E3C34 fix) and Fontsource typography', async ({
		page,
		browserName
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/');

		// Verify WCAG AA darkened negative-comparison label color (#7E3C34 -> rgb(126, 60, 52))
		const negLabel = page.locator('.manifesto-card.negative .comparison-label');
		const negLabelColor = await negLabel.evaluate((el) => getComputedStyle(el).color);
		expect(negLabelColor).toBe('rgb(126, 60, 52)');

		// Verify H1 uses --font-display and body uses --font-sans
		const h1Font = await page
			.locator('h1.hero-h1')
			.evaluate((el) => getComputedStyle(el).fontFamily);
		expect(h1Font.toLowerCase()).toMatch(/plus jakarta sans|geist mono/);

		const bodyFont = await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily);
		expect(bodyFont.toLowerCase()).toMatch(/inter|geist sans/);

		// Verify Row 15 Proof Metrics & Callouts (.persona-graphic & .trust-value) use clamp(1.25rem, 2vw, 1.75rem) = 28px at 1440px
		const personaGraphicStyle = await page
			.locator('.persona-graphic')
			.first()
			.evaluate((el) => {
				const s = getComputedStyle(el);
				return {
					fontSize: s.fontSize,
					fontWeight: s.fontWeight,
					fontVariantNumeric: s.fontVariantNumeric
				};
			});
		expect(personaGraphicStyle.fontSize).toBe('28px');
		expect(['700', '900']).toContain(personaGraphicStyle.fontWeight);
		expect(personaGraphicStyle.fontVariantNumeric).toBe('tabular-nums');

		const trustValueSize = await page
			.locator('.trust-value')
			.first()
			.evaluate((el) => getComputedStyle(el).fontSize);
		expect(trustValueSize).toBe('28px');

		// Verify Row 20 <summary> itself has font-display 700
		const summaryStyle = await page
			.locator('.faqs details summary')
			.first()
			.evaluate((el) => {
				const s = getComputedStyle(el);
				return { fontFamily: s.fontFamily.toLowerCase(), fontWeight: s.fontWeight };
			});
		expect(summaryStyle.fontFamily).toMatch(/plus jakarta sans|geist mono/);
		expect(summaryStyle.fontWeight).toBe('700');

		// Verify keyboard :focus-visible outline (3px solid #DCFF65 -> rgb(220, 255, 101), 4px offset). The rule is global;
		// the eBook input that used to carry this check is gated off (launch-gate.ts), so the first hero CTA does.
		const firstNameInput = page.locator('.hero-ctas a').first();
		// macOS WebKit uses Option-Tab for full link navigation (WebKit bug 161394).
		const tabKey = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
		await firstNameInput.focus();
		await page.keyboard.press(tabKey);
		await page.keyboard.press(`Shift+${tabKey}`);
		await expect(firstNameInput).toBeFocused();
		expect(await firstNameInput.evaluate((el) => el.matches(':focus-visible'))).toBe(true);
		const inputFocusOutline = await firstNameInput.evaluate((el) => {
			const s = getComputedStyle(el);
			return {
				outlineStyle: s.outlineStyle,
				outlineWidth: s.outlineWidth,
				outlineColor: s.outlineColor,
				outlineOffset: s.outlineOffset
			};
		});
		expect(inputFocusOutline.outlineStyle).toBe('solid');
		expect(inputFocusOutline.outlineWidth).toBe('3px');
		expect(inputFocusOutline.outlineColor).toBe('rgb(220, 255, 101)');
		expect(inputFocusOutline.outlineOffset).toBe('4px');

		// The disclosure copy must align to the same responsive container as the footer.
		const riskBoxAlign = await page.locator('.risk-box').evaluate((el) => {
			const container = el.closest('.container');
			const title = el.querySelector('.risk-box-title');
			const body = el.querySelector('p:not(.risk-box-title)');
			if (!container || !title || !body) throw new Error('Missing footer disclosure elements');
			const box = el.getBoundingClientRect();
			const outer = container.getBoundingClientRect();
			const outerStyle = getComputedStyle(container);
			const paddingLeft = parseFloat(outerStyle.paddingLeft);
			const paddingRight = parseFloat(outerStyle.paddingRight);
			const text = body.getBoundingClientRect();
			return {
				boxLeft: box.left,
				innerLeft: outer.left + paddingLeft,
				boxWidth: box.width,
				innerWidth: outer.width - paddingLeft - paddingRight,
				textLeft: text.left,
				textWidth: text.width,
				textAlign: getComputedStyle(body).textAlign,
				fontSize: parseFloat(getComputedStyle(body).fontSize)
			};
		});
		expect(Math.abs(riskBoxAlign.boxLeft - riskBoxAlign.innerLeft)).toBeLessThan(1);
		expect(Math.abs(riskBoxAlign.boxWidth - riskBoxAlign.innerWidth)).toBeLessThan(1);
		expect(Math.abs(riskBoxAlign.textLeft - riskBoxAlign.innerLeft)).toBeLessThan(1);
		expect(Math.abs(riskBoxAlign.textWidth - riskBoxAlign.innerWidth)).toBeLessThan(1);
		expect(['start', 'left']).toContain(riskBoxAlign.textAlign);
		expect(riskBoxAlign.fontSize).toBeGreaterThanOrEqual(13);
	});

	test('handles desktop dropdown keyboard focus traversal and outside-click dismissal', async ({
		page,
		browserName
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/', { waitUntil: 'networkidle' });

		const firstTrigger = page.locator('nav.nav-links .nav-dropdown-trigger').first();
		const secondTrigger = page.locator('nav.nav-links .nav-dropdown-trigger').nth(1);

		// Click to open first dropdown
		await firstTrigger.click();
		await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');

		// Click outside on main hero section to dismiss dropdown
		await page.mouse.click(100, 500);
		await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');

		// Explicit keyboard entry avoids macOS WebKit's mouse-click focus policy.
		const tabKey = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
		await firstTrigger.focus();
		await page.keyboard.press('Enter');
		await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
		const firstSubmenu = page.locator('ul[aria-label="Live Trading Rooms submenu"] a');
		for (let index = 0; index < 3; index++) {
			await page.keyboard.press(tabKey);
			await expect(firstSubmenu.nth(index)).toBeFocused();
		}
		await page.keyboard.press(tabKey);
		await expect(secondTrigger).toBeFocused();
		await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');
		await page.keyboard.press(tabKey);
		await expect(page.locator('ul[aria-label="Alert Services submenu"] a').first()).toBeFocused();
		await expect(secondTrigger).toHaveAttribute('aria-expanded', 'true');
	});

	test('renders US/Canada hreflang tags, JSON-LD EducationalOrganization schema, OpenGraph/Twitter image metadata, robots.txt, and clean sitemap.xml', async ({
		page,
		request
	}) => {
		await page.goto('/');
		// Prerendered (SSG) pages bake the production origin into canonical, hreflang, Open Graph and JSON-LD
		const origin = 'https://www.revolutiontradingpros.com';

		// Zero duplicate head tags
		await expect(page.locator('head title')).toHaveCount(1);
		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		await expect(page.locator('head meta[name="robots"]')).toHaveCount(1);
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
			'content',
			'index, follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'
		);

		// Canonical and og:url must match normalized origin without trailing slash mismatch; single-locale site omits duplicate hreflang (I18N-03)
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', origin);
		await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);

		// OpenGraph & Twitter Card metadata verification
		await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute('content', origin);
		await expect(page.locator('head meta[property="og:locale"]')).toHaveAttribute(
			'content',
			'en_US'
		);
		await expect(page.locator('head meta[property="og:locale:alternate"]')).toHaveCount(0);
		await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute(
			'content',
			`${origin}/og-image.png`
		);
		await expect(page.locator('head meta[property="og:image:width"]')).toHaveAttribute(
			'content',
			'1200'
		);
		await expect(page.locator('head meta[property="og:image:height"]')).toHaveAttribute(
			'content',
			'630'
		);
		await expect(page.locator('head meta[property="og:image:type"]')).toHaveAttribute(
			'content',
			'image/png'
		);
		await expect(page.locator('head meta[name="twitter:card"]')).toHaveAttribute(
			'content',
			'summary_large_image'
		);
		await expect(page.locator('head meta[name="twitter:image"]')).toHaveAttribute(
			'content',
			`${origin}/og-image.png`
		);

		// Verify static /logo.png asset resolves with HTTP 200 and image/png
		const logoRes = await request.get('/logo.png');
		expect(logoRes.status()).toBe(200);
		expect(logoRes.headers()['content-type']).toContain('image/png');

		// Verify JSON-LD @graph completeness and Speakable/FAQ DOM parity
		const jsonLdScripts = page.locator('script[type="application/ld+json"]');
		await expect(jsonLdScripts).toHaveCount(1);
		const jsonLdText = await jsonLdScripts.first().textContent();
		expect(jsonLdText).toBeTruthy();

		const parsedJsonLd = JSON.parse(jsonLdText!);
		expect(parsedJsonLd['@context']).toBe('https://schema.org');
		expect(Array.isArray(parsedJsonLd['@graph'])).toBe(true);

		const graphTypes = parsedJsonLd['@graph'].map((n: { '@type': unknown }) => n['@type']);
		expect(graphTypes).toContain('EducationalOrganization');
		expect(graphTypes).toContain('Person');
		expect(graphTypes).toContain('OfferCatalog');
		expect(graphTypes).toContain('WebSite');
		expect(graphTypes).toContain('WebPage');
		expect(graphTypes).not.toContain('BreadcrumbList');
		expect(graphTypes).not.toContain('FAQPage');

		// Verify visible FAQ headings in DOM
		const visibleFaqQuestions = (
			await page.locator('.faqs details summary h3.faq-question').allTextContents()
		).map((t) => t.trim());
		expect(visibleFaqQuestions).toHaveLength(5);

		// Verify robots.txt (IDX-08: noindex routes not disallowed; MON-03: Google-Extended allowed)
		const robotsRes = await request.get('/robots.txt');
		expect(robotsRes.status()).toBe(200);
		const robotsTxt = await robotsRes.text();
		expect(robotsTxt).toContain('User-agent: *');
		expect(robotsTxt).toContain('Allow: /');
		expect(robotsTxt).toContain('Disallow: /api/');
		expect(robotsTxt).not.toContain('Disallow: /login');
		expect(robotsTxt).toContain('User-agent: Google-Extended');
		expect(robotsTxt).toContain('Sitemap: https://www.revolutiontradingpros.com/sitemap.xml');

		// Verify sitemap.xml
		const sitemapRes = await request.get('/sitemap.xml');
		expect(sitemapRes.status()).toBe(200);
		expect(sitemapRes.headers()['x-robots-tag']).toBe('noindex');
		const sitemapXml = await sitemapRes.text();
		expect(sitemapXml).not.toContain('hreflang=');
		expect(sitemapXml).toContain('<loc>https://www.revolutiontradingpros.com</loc>');
		expect(sitemapXml).toContain('<loc>https://www.revolutiontradingpros.com/about</loc>');
		expect(sitemapXml).toContain('<loc>https://www.revolutiontradingpros.com/contact</loc>');
		expect(sitemapXml).toContain(
			'<loc>https://www.revolutiontradingpros.com/editorial-policy</loc>'
		);
		expect(sitemapXml).toContain('<loc>https://www.revolutiontradingpros.com/privacy-policy</loc>');
		expect(sitemapXml).toContain(
			'<loc>https://www.revolutiontradingpros.com/terms-of-service</loc>'
		);
		expect(sitemapXml).toContain('<loc>https://www.revolutiontradingpros.com/refund-policy</loc>');
		expect(sitemapXml).toContain(
			'<loc>https://www.revolutiontradingpros.com/alert-services/spx-profit-pulse</loc>'
		);
		// Eligible blog pages are included; the store remains gated.
		expect(sitemapXml).toContain('/blog');
		expect(sitemapXml).not.toContain('/store');
		expect(sitemapXml).toContain(
			'<loc>https://www.revolutiontradingpros.com/live-trading-rooms/day-trading-room</loc>'
		);
		expect(sitemapXml).toContain(
			'<loc>https://www.revolutiontradingpros.com/live-trading-rooms/small-accounts-room</loc>'
		);
		expect(sitemapXml).toContain(
			'<loc>https://www.revolutiontradingpros.com/live-trading-rooms/swing-trading-room</loc>'
		);
		expect(sitemapXml).not.toContain('/demo/');

		// CMS-backed blog discovery is an owner-approved homepage exception. Store promotions stay gated.
		await expect(page.locator('main a[href*="store/"]')).toHaveCount(0);
		await expect(page.locator('#blog')).toBeVisible();
		await expect(page.locator('#blog a[href$="/blog"]')).toBeVisible();

		// The sitemap must only list live URLs, and must not stamp unverifiable dates on them.
		const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
			(m) => new URL(m[1]).pathname
		);
		expect(locs.length).toBeGreaterThan(10);
		for (const path of locs) {
			expect(
				(await request.get(path)).status(),
				`sitemap lists ${path} but it does not return 200`
			).toBe(200);
		}
		const todayIso = new Date().toISOString().split('T')[0];
		expect(sitemapXml).not.toContain(`<lastmod>${todayIso}</lastmod>`);

		// Verify footer legal links and mandatory US (SEC/CFTC/FINRA) & Canadian (OSC/BCSC/ASC) YMYL disclosure
		const legalHrefs = await page
			.locator('nav[aria-labelledby="footer-legal"] a')
			.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
		expect(legalHrefs).toEqual([
			'/contact',
			'/editorial-policy',
			'/privacy-policy',
			'/terms-of-service',
			'/terms-of-service',
			'/refund-policy'
		]);

		const riskDisclosureText = await page.locator('footer .risk-box').textContent();
		for (const regulator of ['SEC', 'CFTC', 'FINRA', 'OSC', 'BCSC', 'ASC']) {
			expect(riskDisclosureText).toContain(regulator);
		}
	});

	test('verifies /about route has zero duplicate meta tags, valid AboutPage/ProfilePage JSON-LD, strict H1->H2->H3 hierarchy, and noindex on /demo/*', async ({
		page
	}) => {
		await page.goto('/about');
		// Prerendered (SSG) pages bake the production origin into canonical, hreflang, Open Graph and JSON-LD
		const origin = 'https://www.revolutiontradingpros.com';
		const expectedAboutUrl = `${origin}/about`;

		// Zero duplicate head tags on /about
		await expect(page.locator('head title')).toHaveCount(1);
		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		await expect(page.locator('head meta[name="robots"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
			'href',
			expectedAboutUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);
		await expect(page.locator('head meta[property="og:type"]')).toHaveCount(1);
		await expect(page.locator('head meta[property="og:type"]')).toHaveAttribute(
			'content',
			'profile'
		);
		await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute(
			'content',
			expectedAboutUrl
		);

		// Strict heading hierarchy on /about: single H1 with .seo-kicker, zero H4s, semantic H3 in FAQ summary
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1 .seo-kicker')).toHaveCount(1);
		await expect(page.locator('h4')).toHaveCount(0);
		await expect(page.locator('details.faq-item summary h3.faq-item__heading')).toHaveCount(4);

		// JSON-LD on /about uses ProfilePage with mainEntity Person (SD-09) and omits restricted FAQPage (SD-10)
		const aboutJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const aboutSchema = JSON.parse(aboutJsonLdText!);
		const aboutProfileNode = aboutSchema['@graph'].find(
			(n: { '@type': string }) => n['@type'] === 'ProfilePage'
		);
		expect(aboutProfileNode).toBeTruthy();
		expect(aboutProfileNode.mainEntity).toEqual({ '@id': `${origin}/#founder` });
		expect(
			aboutSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage')
		).toBeUndefined();

		// Verify /demo/playwright automatically receives noindex, nofollow, no canonical, and zero hreflang tags
		await page.goto('/demo/playwright');
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
			'content',
			'noindex, nofollow'
		);
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
		await expect(page.locator('head link[rel="alternate"]')).toHaveCount(0);

		// Verify /live-trading-rooms/day-trading-room route metadata, JSON-LD, and DOM parity
		const expectedDayRoomUrl = `${origin}/live-trading-rooms/day-trading-room`;
		await page.goto('/live-trading-rooms/day-trading-room');

		await expect(page.locator('head title')).toHaveCount(1);
		const dayRoomTitle = await page.title();
		expect(dayRoomTitle).toBe('Live Day Trading Room | Revolution Trading Pros');
		expect(dayRoomTitle.length).toBe(47);

		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		const dayRoomDesc = await page.locator('head meta[name="description"]').getAttribute('content');
		expect(dayRoomDesc).toBe(
			'Join our live stock, ETF, and options day trading room. Real-time voice, screen share, and exact entries and stops. People over profits. Zero hype.'
		);
		expect(dayRoomDesc?.length).toBe(147);

		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
			'href',
			expectedDayRoomUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1 .seo-kicker')).toHaveCount(1);
		await expect(page.locator('h4')).toHaveCount(0);
		await expect(page.locator('.schedule-card')).toHaveCount(4);
		await expect(page.locator('.setup-card')).toHaveCount(4);
		await expect(page.locator('.comparison-table tbody tr')).toHaveCount(5);
		await expect(page.locator('.route-card')).toHaveCount(3);
		await expect(page.locator('details.faq-item summary h3.faq-item__heading')).toHaveCount(5);

		const dayRoomJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const dayRoomSchema = JSON.parse(dayRoomJsonLdText!);
		expect(
			dayRoomSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'Service')
		).toBeTruthy();
		expect(
			dayRoomSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage')
		).toBeUndefined();

		// Verify zero horizontal overflow across 320px and all 6 enterprise breakpoints on /live-trading-rooms/day-trading-room
		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// Verify /live-trading-rooms/swing-trading-room route metadata, JSON-LD, and DOM parity
		const expectedSwingRoomUrl = `${origin}/live-trading-rooms/swing-trading-room`;
		await page.goto('/live-trading-rooms/swing-trading-room');

		await expect(page.locator('head title')).toHaveCount(1);
		const swingRoomTitle = await page.title();
		expect(swingRoomTitle).toBe('Live Swing Trading Room | Revolution Trading Pros');
		expect(swingRoomTitle.length).toBe(49);

		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		const swingRoomDesc = await page
			.locator('head meta[name="description"]')
			.getAttribute('content');
		expect(swingRoomDesc).toBe(
			'Stock, ETF, and options swing trading room built for working professionals. Pre-planned entries, profit targets, and stops. People over profits.'
		);
		expect(swingRoomDesc?.length).toBe(144);

		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
			'href',
			expectedSwingRoomUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1 .seo-kicker')).toHaveCount(1);
		await expect(page.locator('h4')).toHaveCount(0);
		await expect(page.locator('.workflow-card')).toHaveCount(4);
		await expect(page.locator('.playbook-card')).toHaveCount(4);
		await expect(page.locator('.comparison-table tbody tr')).toHaveCount(5);
		await expect(page.locator('.route-card')).toHaveCount(3);
		await expect(page.locator('details.faq-item summary h3.faq-item__heading')).toHaveCount(5);

		const swingRoomJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const swingRoomSchema = JSON.parse(swingRoomJsonLdText!);
		expect(
			swingRoomSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'Service')
		).toBeTruthy();
		expect(
			swingRoomSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage')
		).toBeUndefined();

		// Verify zero horizontal overflow across 320px and all 6 enterprise breakpoints on /live-trading-rooms/swing-trading-room
		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// Verify /live-trading-rooms/small-accounts-room route metadata, JSON-LD, and DOM parity
		const expectedSmallRoomUrl = `${origin}/live-trading-rooms/small-accounts-room`;
		await page.goto('/live-trading-rooms/small-accounts-room');

		await expect(page.locator('head title')).toHaveCount(1);
		const smallRoomTitle = await page.title();
		expect(smallRoomTitle).toBe('Small Accounts Trading Room | Revolution Trading Pros');
		expect(smallRoomTitle.length).toBe(53);

		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		const smallRoomDesc = await page
			.locator('head meta[name="description"]')
			.getAttribute('content');
		expect(smallRoomDesc).toBe(
			'Grow a $500+ small account without gambling. Strict risk control, T+1 cash account rotation, and affordable stock & options setups. People over profits.'
		);
		expect(smallRoomDesc?.length).toBe(152);

		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
			'href',
			expectedSmallRoomUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1 .seo-kicker')).toHaveCount(1);
		await expect(page.locator('h4')).toHaveCount(0);
		await expect(page.locator('.roadmap-card')).toHaveCount(4);
		await expect(page.locator('.playbook-card')).toHaveCount(4);
		await expect(page.locator('.comparison-table tbody tr')).toHaveCount(5);
		await expect(page.locator('.route-card')).toHaveCount(3);
		await expect(page.locator('details.faq-item summary h3.faq-item__heading')).toHaveCount(5);

		const smallRoomJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const smallRoomSchema = JSON.parse(smallRoomJsonLdText!);
		expect(
			smallRoomSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'Service')
		).toBeTruthy();
		expect(
			smallRoomSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage')
		).toBeUndefined();

		// Verify zero horizontal overflow across 320px and all 6 enterprise breakpoints on /live-trading-rooms/small-accounts-room
		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// Verify /blogs 308-redirects to /blog and /blog hub route metadata, JSON-LD, and DOM parity
		await page.goto('/blogs');
		expect(new URL(page.url()).pathname).toBe('/blog');

		await expect(page.locator('head title')).toHaveCount(1);
		const blogsTitle = await page.title();
		expect(blogsTitle).toContain('Revolution Trading Pros');

		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		// The launched blog index emits a canonical and is eligible for indexing.
		await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
			'href',
			'https://www.revolutiontradingpros.com/blog'
		);
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', /^index/);

		await expect(page.locator('h1')).toHaveCount(1);

		const blogsJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const blogsSchema = JSON.parse(blogsJsonLdText!);
		const blogsGraphTypes = blogsSchema['@graph'].map((n: { '@type': string }) => n['@type']);
		expect(blogsGraphTypes).toContain('Blog');
		expect(blogsGraphTypes).toContain('BreadcrumbList');

		// Check overflow and disclosure alignment from small phones through ultrawide screens.
		for (const width of [320, 480, 640, 768, 1024, 1280, 1536, 2420]) {
			await page.setViewportSize({ width, height: 900 });
			const geometry = await page.evaluate(() => {
				const disclosure = document.querySelector('footer .risk-box p:not(.risk-box-title)');
				const container = disclosure?.closest('.container');
				if (!disclosure || !container) throw new Error('Missing disclosure or container');
				const text = disclosure.getBoundingClientRect();
				const outer = container.getBoundingClientRect();
				const outerStyle = getComputedStyle(container);
				const paddingLeft = parseFloat(outerStyle.paddingLeft);
				const paddingRight = parseFloat(outerStyle.paddingRight);
				return {
					scrollWidth: document.documentElement.scrollWidth,
					textLeft: text.left,
					textWidth: text.width,
					innerLeft: outer.left + paddingLeft,
					innerWidth: outer.width - paddingLeft - paddingRight
				};
			});
			expect(geometry.scrollWidth).toBeLessThanOrEqual(width);
			expect(Math.abs(geometry.textLeft - geometry.innerLeft)).toBeLessThan(1);
			expect(Math.abs(geometry.textWidth - geometry.innerWidth)).toBeLessThan(1);
		}
		await page
			.getByRole('searchbox', { name: 'Search articles' })
			.fill('unlikelymissingsearchterm');
		await page.getByRole('button', { name: 'Search', exact: true }).click();
		await expect(
			page.getByRole('heading', { name: 'Results for “unlikelymissingsearchterm”' })
		).toBeVisible();
		await page.getByRole('link', { name: 'Clear search', exact: true }).click();
		await expect(page).toHaveURL(/\/blog$/);
		await page.setViewportSize({ width: 320, height: 900 });
		await page.getByRole('searchbox', { name: 'Search articles' }).fill('x'.repeat(120));
		await page.getByRole('button', { name: 'Search', exact: true }).click();
		await expect(page).toHaveURL(/search=x{120}/);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			320
		);

		// Verify /store/indicators route metadata, JSON-LD, and DOM parity
		await page.goto('/store/indicators');

		await expect(page.locator('head title')).toHaveCount(1);
		const indicatorsTitle = await page.title();
		expect(indicatorsTitle).toBe('Custom Trading Indicators | Revolution Trading Pros');
		expect(indicatorsTitle.length).toBe(51);

		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		const indicatorsDesc = await page
			.locator('head meta[name="description"]')
			.getAttribute('content');
		expect(indicatorsDesc).toBe(
			'100% non-repainting stock, ETF, and options trading indicators for ThinkorSwim and TradingView. Spot institutional order flow and liquidity. Zero hype.'
		);
		expect(indicatorsDesc?.length).toBe(151);

		// Store remains behind the launch gate.
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', /^noindex/);
		await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1 .hero-h1__seo-kicker')).toHaveCount(1);
		await expect(page.locator('h4')).toHaveCount(0);
		await expect(page.locator('.indicator-card')).toHaveCount(8);
		await expect(page.locator('.comparison-table tbody tr')).toHaveCount(5);
		await expect(page.locator('.proof-card')).toHaveCount(3);
		await expect(page.locator('details.faq-item summary h3.faq-item__heading')).toHaveCount(4);
		await expect(page.locator('.room-cta-card')).toHaveCount(5);

		const indicatorsJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const indicatorsSchema = JSON.parse(indicatorsJsonLdText!);
		expect(
			indicatorsSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'ItemList')
		).toBeTruthy();
		expect(
			indicatorsSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage')
		).toBeUndefined();

		// Verify zero horizontal overflow across 320px and all 6 enterprise breakpoints on /store/indicators
		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// Verify /store/courses route metadata, JSON-LD, and DOM parity
		await page.goto('/store/courses');

		await expect(page.locator('head title')).toHaveCount(1);
		const coursesTitle = await page.title();
		expect(coursesTitle).toBe('Stock & Options Trading Courses | Revolution Trading Pros');
		expect(coursesTitle.length).toBe(57);

		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		const coursesDesc = await page.locator('head meta[name="description"]').getAttribute('content');
		expect(coursesDesc).toBe(
			'Self-paced stock, ETF, and options trading courses. Master institutional order flow, Options Greeks, and $500+ small account compounding. Zero hype.'
		);
		expect(coursesDesc?.length).toBe(148);

		// Store remains behind the launch gate.
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', /^noindex/);
		await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1 .hero-h1__seo-kicker')).toHaveCount(1);
		await expect(page.locator('h4')).toHaveCount(0);
		await expect(page.locator('.course-card')).toHaveCount(8);
		await expect(page.locator('.deliverable-card')).toHaveCount(6);
		await expect(page.locator('.comparison-table tbody tr')).toHaveCount(5);
		await expect(page.locator('details.faq-item summary h3.faq-item__heading')).toHaveCount(4);
		await expect(page.locator('.room-cta-card')).toHaveCount(5);

		const coursesJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const coursesSchema = JSON.parse(coursesJsonLdText!);
		expect(
			coursesSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'ItemList')
		).toBeTruthy();
		expect(
			coursesSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage')
		).toBeUndefined();

		// Verify zero horizontal overflow across 320px and all 6 enterprise breakpoints on /store/courses
		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// Verify /store/courses/move-prior-to-the-move-ultra route metadata, JSON-LD, and DOM parity
		await page.goto('/store/courses/move-prior-to-the-move-ultra');

		await expect(page.locator('head title')).toHaveCount(1);
		const singleCourseTitle = await page.title();
		expect(singleCourseTitle).toBe('Move Prior to The Move Course | Revolution Trading Pros');
		expect(singleCourseTitle.length).toBe(55);

		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		const singleCourseDesc = await page
			.locator('head meta[name="description"]')
			.getAttribute('content');
		expect(singleCourseDesc).toBe(
			'Master institutional order flow, multi-timeframe squeezes, and Options Greeks with Billy Ribeiro. Includes non-repainting ThinkorSwim and TradingView tools.'
		);
		expect(singleCourseDesc?.length).toBe(156);

		// Store remains behind the launch gate.
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', /^noindex/);
		await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1 .hero-h1__kicker')).toHaveCount(1);
		await expect(page.locator('h4')).toHaveCount(0);
		await expect(page.locator('.package-card')).toHaveCount(2);
		await expect(page.locator('.component-block')).toHaveCount(5);
		await expect(page.locator('.module-card')).toHaveCount(6);
		await expect(page.locator('.review-card')).toHaveCount(6);
		await expect(page.locator('details.faq-item summary h3.faq-item__heading')).toHaveCount(5);
		await expect(page.locator('.room-cta-card')).toHaveCount(5);

		const singleCourseJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const singleCourseSchema = JSON.parse(singleCourseJsonLdText!);
		expect(
			singleCourseSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'Service')
		).toBeTruthy();
		expect(
			singleCourseSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage')
		).toBeUndefined();

		// Verify zero horizontal overflow across 320px and all 6 enterprise breakpoints on /store/courses/move-prior-to-the-move-ultra
		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// Verify /store/indicators/move-prior-to-the-move-system route metadata, JSON-LD, and DOM parity
		await page.goto('/store/indicators/move-prior-to-the-move-system');

		await expect(page.locator('head title')).toHaveCount(1);
		const singleIndicatorTitle = await page.title();
		expect(singleIndicatorTitle).toBe('MP Early In & Out Indicator | Revolution Trading Pros');
		expect(singleIndicatorTitle.length).toBe(53);

		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		const singleIndicatorDesc = await page
			.locator('head meta[name="description"]')
			.getAttribute('content');
		expect(singleIndicatorDesc).toBe(
			'Spot explosive stock, ETF, and options moves early with our 100% non-repainting indicator system for ThinkorSwim and TradingView. People over profits.'
		);
		expect(singleIndicatorDesc?.length).toBe(150);

		// Store remains behind the launch gate.
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', /^noindex/);
		await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1 .hero-h1__kicker')).toHaveCount(1);
		await expect(page.locator('h4')).toHaveCount(0);
		await expect(page.locator('.comp-card')).toHaveCount(6);
		await expect(page.locator('.suitability-card')).toHaveCount(3);
		await expect(page.locator('.review-card')).toHaveCount(4);
		await expect(page.locator('details.faq-item summary h3.faq-item__heading')).toHaveCount(4);
		await expect(page.locator('.room-cta-card')).toHaveCount(5);

		const singleIndicatorJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const singleIndicatorSchema = JSON.parse(singleIndicatorJsonLdText!);
		expect(
			singleIndicatorSchema['@graph'].find(
				(n: { '@type': string }) => n['@type'] === 'SoftwareApplication'
			)
		).toBeTruthy();
		expect(
			singleIndicatorSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage')
		).toBeUndefined();

		// Verify zero horizontal overflow across 320px and all 6 enterprise breakpoints on /store/indicators/move-prior-to-the-move-system
		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// Verify /alert-services/spx-profit-pulse route metadata, JSON-LD, and DOM parity
		const expectedSpxUrl = `${origin}/alert-services/spx-profit-pulse`;
		await page.goto('/alert-services/spx-profit-pulse');

		await expect(page.locator('head title')).toHaveCount(1);
		const spxTitle = await page.title();
		expect(spxTitle).toBe('SPX Profit Pulse Options Alerts | Revolution Trading Pros');
		expect(spxTitle.length).toBe(57);

		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		const spxDesc = await page.locator('head meta[name="description"]').getAttribute('content');
		expect(spxDesc).toBe(
			'Real-time SPX & 0DTE index options alerts with video watchlists, gamma levels, and exact entries, targets, and stops. People over profits. Zero hype.'
		);
		expect(spxDesc?.length).toBe(149);

		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
			'href',
			expectedSpxUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1 .hero-h1__kicker')).toHaveCount(1);
		await expect(page.locator('h4')).toHaveCount(0);
		await expect(page.locator('.deliverable-card')).toHaveCount(6);
		await expect(page.locator('.advantage-card')).toHaveCount(4);
		await expect(page.locator('.package-card')).toHaveCount(3);
		await expect(page.locator('.review-card')).toHaveCount(4);
		await expect(page.locator('details.faq-item summary h3.faq-item__heading')).toHaveCount(4);
		await expect(page.locator('.room-cta-card')).toHaveCount(5);

		const spxJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const spxSchema = JSON.parse(spxJsonLdText!);
		expect(
			spxSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'Service')
		).toBeTruthy();
		expect(
			spxSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage')
		).toBeUndefined();

		// Verify zero horizontal overflow across 320px and all 6 enterprise breakpoints on /alert-services/spx-profit-pulse
		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// Verify /store/scanners route metadata, JSON-LD, and DOM parity
		await page.goto('/store/scanners');

		await expect(page.locator('head title')).toHaveCount(1);
		const scannersTitle = await page.title();
		expect(scannersTitle).toBe('Live Stock & Options Scanners | Revolution Trading Pros');
		expect(scannersTitle.length).toBe(55);

		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		const scannersDesc = await page
			.locator('head meta[name="description"]')
			.getAttribute('content');
		expect(scannersDesc).toBe(
			'Real-time, 100% non-repainting stock, ETF, and options scanners. Spot institutional order flow, multi-timeframe squeezes, and liquidity sweeps live.'
		);
		expect(scannersDesc?.length).toBe(148);

		// Store remains behind the launch gate.
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', /^noindex/);
		await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1 .hero-h1__seo-kicker')).toHaveCount(1);
		await expect(page.locator('h4')).toHaveCount(0);
		await expect(page.locator('.scanner-card')).toHaveCount(8);
		await expect(page.locator('.workflow-card')).toHaveCount(3);
		await expect(page.locator('.comparison-table tbody tr')).toHaveCount(5);
		await expect(page.locator('details.faq-item summary h3.faq-item__heading')).toHaveCount(4);
		await expect(page.locator('.room-cta-card')).toHaveCount(5);

		const scannersJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const scannersSchema = JSON.parse(scannersJsonLdText!);
		expect(
			scannersSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'ItemList')
		).toBeTruthy();
		expect(
			scannersSchema['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage')
		).toBeUndefined();

		// Verify zero horizontal overflow across 320px and all 6 enterprise breakpoints on /store/scanners
		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// Single Scanner Product Page (/store/scanners/high-octane-scanner)
		await page.goto('/store/scanners/high-octane-scanner');
		const singleScannerTitle = await page.title();
		expect(singleScannerTitle).toBe('High Octane Options Scanner | Revolution Trading Pros');
		expect(singleScannerTitle.length).toBe(53);

		const singleScannerDesc = await page
			.locator('meta[name="description"]')
			.getAttribute('content');
		expect(singleScannerDesc).toBe(
			'Find explosive stock, ETF, and options setups in real time with the 100% non-repainting High Octane Scanner for ThinkorSwim & TradingView. Zero hype.'
		);
		expect(singleScannerDesc!.length).toBe(149);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h4')).toHaveCount(0);
		await expect(page.locator('.feature-card')).toHaveCount(6);
		await expect(page.locator('.suitability-card')).toHaveCount(3);
		await expect(page.locator('.comparison-table tbody tr')).toHaveCount(5);
		await expect(page.locator('.package-card')).toHaveCount(2);
		await expect(page.locator('.review-card')).toHaveCount(4);
		await expect(page.locator('details.faq-item summary h3.faq-item__heading')).toHaveCount(5);
		await expect(page.locator('.room-cta-card')).toHaveCount(5);

		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// ETF Stock List Page (/resources/etf-stocks-list)
		await page.goto('/resources/etf-stocks-list');
		const etfTitle = await page.title();
		expect(etfTitle).toBe('ETF Stocks List & Sector Guide | Revolution Trading Pros');
		expect(etfTitle.length).toBe(56);

		const etfDesc = await page.locator('meta[name="description"]').getAttribute('content');
		expect(etfDesc).toBe(
			'Complete ETF stocks list covering SPY, QQQ, IWM, and all 11 S&P 500 sector ETFs. Compare options liquidity, expense ratios, and institutional setups.'
		);
		expect(etfDesc!.length).toBe(149);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('.benefit-card')).toHaveCount(5);
		await expect(page.locator('.type-card')).toHaveCount(5);
		await expect(page.locator('.etf-card')).toHaveCount(12);
		await expect(page.locator('.sector-card')).toHaveCount(11);
		await expect(page.locator('.comparison-table tbody tr')).toHaveCount(7);
		await expect(page.locator('.faq-item')).toHaveCount(4);
		await expect(page.locator('.room-cta-card')).toHaveCount(5);

		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// Stock Indexes List Page (/resources/stock-indexes-list)
		await page.goto('/resources/stock-indexes-list');
		const indexesTitle = await page.title();
		expect(indexesTitle).toBe('Stock Market Indexes List | Revolution Trading Pros');
		expect(indexesTitle.length).toBe(51);

		const indexesDesc = await page.locator('meta[name="description"]').getAttribute('content');
		expect(indexesDesc).toBe(
			'Comprehensive stock market indexes list and guide. Track S&P 500 ($SPX), Dow Jones ($DJI), Nasdaq ($NDX), Russell 2000 ($RUT), VIX, and global benchmarks.'
		);
		expect(indexesDesc!.length).toBe(154);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('.index-card')).toHaveCount(10);
		await expect(page.locator('.faq-item')).toHaveCount(5);

		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// Free Trading Resources Hub Page (/resources)
		await page.goto('/resources');
		const resourcesTitle = await page.title();
		expect(resourcesTitle).toBe('Free Trading Resources & Tools | Revolution Trading Pros');
		expect(resourcesTitle.length).toBe(56);

		const resourcesDesc = await page.locator('meta[name="description"]').getAttribute('content');
		expect(resourcesDesc).toBe(
			'Free stock, ETF, and options trading resources. Access beginner guides, position size and options calculators, video tutorials, and market analysis.'
		);
		expect(resourcesDesc!.length).toBe(148);

		// Verify zero duplicate head tags (unified svelte-meta-tags layer)
		await expect(page.locator('head title')).toHaveCount(1);
		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('.flagship-utility-card')).toHaveCount(3);
		await expect(page.locator('.resource-card')).toHaveCount(6);
		await expect(page.locator('.resource-card__item')).toHaveCount(24);
		await expect(
			page.getByRole('heading', { level: 2, name: /Ready to Take the Next Step\?/i })
		).toBeVisible();
		await expect(page.getByRole('link', { name: /Get Started Free/i })).toHaveAttribute(
			'href',
			'/contact'
		);

		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}
	});

	test('scales cleanly across 320px base and all 6 enterprise breakpoints (480px, 640px, 768px, 1024px, 1280px, 1536px) with zero horizontal overflow', async ({
		page
	}) => {
		await page.goto('/');

		// 320px (Mobile-First Base): 36x36px logo, >= 48x48px mobile toggle, non-overlapping chart labels, 0px overflow
		await page.setViewportSize({ width: 320, height: 844 });
		const metrics320 = await page.evaluate(() => {
			const l1 = document.querySelector('.chart-illus-label:not(.r)')!.getBoundingClientRect();
			const l2 = document.querySelector('.chart-illus-label.r')!.getBoundingClientRect();
			const toggle = document.querySelector('#mobileToggle')!.getBoundingClientRect();
			return {
				scrollWidth: document.documentElement.scrollWidth,
				logoWidth: getComputedStyle(document.querySelector('.brand-logo-wrap')!).width,
				toggleWidth: Math.round(toggle.width),
				toggleHeight: Math.round(toggle.height),
				labelsOverlap: l1.right > l2.left && l1.bottom > l2.top && l2.bottom > l1.top
			};
		});
		expect(metrics320.scrollWidth).toBeLessThanOrEqual(320);
		expect(metrics320.logoWidth).toBe('36px');
		expect(metrics320.toggleWidth).toBeGreaterThanOrEqual(48);
		expect(metrics320.toggleHeight).toBeGreaterThanOrEqual(48);
		expect(metrics320.labelsOverlap).toBe(false);

		// 480px (Large Mobile): 36x36px logo, 2-col trust & footer grids, 0px overflow
		await page.setViewportSize({ width: 480, height: 844 });
		const metrics480 = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			logoWidth: getComputedStyle(document.querySelector('.brand-logo-wrap')!).width,
			footerCols: getComputedStyle(
				document.querySelector('.footer-grid')!
			).gridTemplateColumns.split(' ').length
		}));
		expect(metrics480.scrollWidth).toBeLessThanOrEqual(480);
		expect(metrics480.logoWidth).toBe('36px');
		expect(metrics480.footerCols).toBe(2);

		// 640px (Small Tablet / Phablet): 46x46px logo, flex button rows, 0px overflow
		await page.setViewportSize({ width: 640, height: 900 });
		const styles640 = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			logoWidth: getComputedStyle(document.querySelector('.brand-logo-wrap')!).width,
			heroCtasDisplay: getComputedStyle(document.querySelector('.hero-ctas')!).display
		}));
		expect(styles640.scrollWidth).toBeLessThanOrEqual(640);
		expect(styles640.logoWidth).toBe('46px');
		expect(styles640.heroCtasDisplay).toBe('flex');

		// 768px (Tablet Portrait): announcement quick-actions visible & inside viewport, 0px overflow
		await page.setViewportSize({ width: 768, height: 1024 });
		await expect(page.locator('.announcement-links')).toBeVisible();
		const metrics768 = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			linksRight: Math.round(
				document.querySelector('.announcement-links')!.getBoundingClientRect().right
			)
		}));
		expect(metrics768.scrollWidth).toBeLessThanOrEqual(768);
		expect(metrics768.linksRight).toBeLessThanOrEqual(768);

		// 1024px (Enterprise Desktop): horizontal navbar & actions visible inside viewport, mobile toggle hidden
		await page.setViewportSize({ width: 1024, height: 900 });
		await expect(page.locator('nav.nav-links')).toBeVisible();
		await expect(page.locator('#mobileToggle')).toBeHidden();
		const metrics1024 = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			navActionsRight: Math.round(
				document.querySelector('.nav-actions')!.getBoundingClientRect().right
			)
		}));
		expect(metrics1024.scrollWidth).toBeLessThanOrEqual(1024);
		expect(metrics1024.navActionsRight).toBeLessThanOrEqual(1024);

		// 1280px (Wide Desktop): shared 96rem (1536px) border-box cap, 0px overflow
		await page.setViewportSize({ width: 1280, height: 900 });
		const metrics1280 = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			maxToken: getComputedStyle(document.documentElement).getPropertyValue('--max').trim(),
			navActionsRight: Math.round(
				document.querySelector('.nav-actions')!.getBoundingClientRect().right
			)
		}));
		expect(metrics1280.scrollWidth).toBeLessThanOrEqual(1280);
		expect(metrics1280.maxToken).toBe('96rem');
		expect(metrics1280.navActionsRight).toBeLessThanOrEqual(1280);

		// 1536px (Ultra-Wide Trading Desk): same 96rem (1536px) border-box cap, 0px overflow
		await page.setViewportSize({ width: 1536, height: 960 });
		const metrics1536 = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			maxToken: getComputedStyle(document.documentElement).getPropertyValue('--max').trim(),
			navActionsRight: Math.round(
				document.querySelector('.nav-actions')!.getBoundingClientRect().right
			)
		}));
		expect(metrics1536.scrollWidth).toBeLessThanOrEqual(1536);
		expect(metrics1536.maxToken).toBe('96rem');
		expect(metrics1536.navActionsRight).toBeLessThanOrEqual(1536);
	});

	test('handles mobile menu toggle, 48px tap targets, resize cleanup, and Escape key', async ({
		page
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');

		const mobileToggle = page.locator('#mobileToggle');
		await expect(mobileToggle).toBeVisible();
		await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');

		// Verify 48x48px minimum tap target on mobile toggle
		const toggleBox = await mobileToggle.boundingBox();
		expect(toggleBox?.width).toBeGreaterThanOrEqual(48);
		expect(toggleBox?.height).toBeGreaterThanOrEqual(48);

		// Open mobile navigation
		await mobileToggle.click();
		await expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
		await expect(page.locator('#mobileNavigation')).toHaveClass(/open/);
		await expect(page.locator('body')).toHaveClass(/menu-open/);

		// Resize to desktop (> 1180px) and verify body.menu-open scroll lock is automatically cleared
		await page.setViewportSize({ width: 1440, height: 900 });
		await expect(page.locator('body')).not.toHaveClass(/menu-open/);

		// Resize back to mobile, reopen, and press Escape to close
		await page.setViewportSize({ width: 390, height: 844 });
		await mobileToggle.click();
		await expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
		await page.keyboard.press('Escape');
		await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
	});

	test('keeps all .reveal section elements visible (opacity: 1) when JavaScript is disabled', async ({
		browser
	}) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto('/');

		const revealCount = await page.locator('.reveal').count();
		// 17 today: the store, eBook and blog sections are gated off (launch-gate.ts); this still fails if the selector stops matching.
		expect(revealCount).toBeGreaterThanOrEqual(15);

		const opacities = await page
			.locator('.reveal')
			.evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
		expect(opacities.every((o) => o === '1')).toBe(true);

		await context.close();
	});
});
