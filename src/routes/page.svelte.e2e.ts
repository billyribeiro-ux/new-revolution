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

		// eBook title is a semantic H3
		const ebookH3 = page.locator('h3.ebook-name');
		await expect(ebookH3).toHaveCount(1);
		await expect(ebookH3).toContainText('The Institutional Execution Playbook');

		// FAQ questions are semantic H3s inside <summary>
		const faqHeadings = page.locator('.faqs details summary h3.faq-question');
		await expect(faqHeadings).toHaveCount(5);

		// Footer column headers and risk disclosure title are <p> tags, NOT H3 headings
		await expect(page.locator('footer h3')).toHaveCount(0);
		await expect(page.locator('footer p.footer-col-title')).toHaveCount(5);
		await expect(page.locator('footer p.risk-box-title')).toHaveCount(1);
	});

	test('renders enhanced brand logo and exact 8-item navigation menu & submenus', async ({
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

		// Exact 8 top-level navigation items in order
		const topLevelNavItems = page.locator(
			'nav.nav-links > .nav-item > .nav-dropdown-trigger, nav.nav-links > .nav-item > .nav-link'
		);
		await expect(topLevelNavItems).toHaveCount(8);

		const labels = (await topLevelNavItems.allTextContents()).map((t) => t.trim());
		expect(labels).toEqual([
			'Live Trading Rooms',
			'Alert Services',
			'Mentorship',
			'Store',
			'Our Mission',
			'About',
			'Blogs',
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
			'Explosive Swings'
		]);

		const storeSubmenu = page
			.locator('ul[aria-label="Store submenu"] a.dropdown-link')
			.allTextContents();
		expect((await storeSubmenu).map((t) => t.trim())).toEqual([
			'Courses',
			'Indicators',
			'Scanners'
		]);

		const resourcesSubmenu = page
			.locator('ul[aria-label="Resources submenu"] a.dropdown-link')
			.allTextContents();
		expect((await resourcesSubmenu).map((t) => t.trim())).toEqual([
			'Options Calculator',
			'ETF Stocks List',
			'Stock Indexes List'
		]);
	});

	test('applies SSOT color style guide (including WCAG AA #7E3C34 fix) and Fontsource typography', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/');

		// Verify WCAG AA darkened negative-comparison label color (#7E3C34 -> rgb(126, 60, 52))
		const negLabel = page.locator('.manifesto-card.negative .comparison-label');
		const negLabelColor = await negLabel.evaluate((el) => getComputedStyle(el).color);
		expect(negLabelColor).toBe('rgb(126, 60, 52)');

		// Verify H1 uses Montserrat Variable and body uses Sofia Sans Variable
		const h1Font = await page
			.locator('h1.hero-h1')
			.evaluate((el) => getComputedStyle(el).fontFamily);
		expect(h1Font.toLowerCase()).toContain('montserrat');

		const bodyFont = await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily);
		expect(bodyFont.toLowerCase()).toContain('sofia sans');

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
		expect(personaGraphicStyle.fontWeight).toBe('900');
		expect(personaGraphicStyle.fontVariantNumeric).toBe('tabular-nums');

		const trustValueSize = await page
			.locator('.trust-value')
			.first()
			.evaluate((el) => getComputedStyle(el).fontSize);
		expect(trustValueSize).toBe('28px');

		// Verify Row 20 <summary> itself has Montserrat 700
		const summaryStyle = await page
			.locator('.faqs details summary')
			.first()
			.evaluate((el) => {
				const s = getComputedStyle(el);
				return { fontFamily: s.fontFamily.toLowerCase(), fontWeight: s.fontWeight };
			});
		expect(summaryStyle.fontFamily).toContain('montserrat');
		expect(summaryStyle.fontWeight).toBe('700');

		// Verify keyboard :focus-visible outline on form input (3px solid #DCFF65 -> rgb(220, 255, 101), 4px offset)
		const firstNameInput = page.locator('#firstName');
		await firstNameInput.focus();
		await page.keyboard.press('Tab');
		await page.keyboard.press('Shift+Tab');
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
	});

	test('handles desktop dropdown keyboard focus traversal and outside-click dismissal', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/');

		const firstTrigger = page.locator('nav.nav-links .nav-dropdown-trigger').first();
		const secondTrigger = page.locator('nav.nav-links .nav-dropdown-trigger').nth(1);

		// Click to open first dropdown
		await firstTrigger.click();
		await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');

		// Click outside on main hero section to dismiss dropdown
		await page.locator('h1.hero-h1').click();
		await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');

		// Click to open first dropdown again, then Tab through its 3 submenu links to the next dropdown trigger
		await firstTrigger.click();
		await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
		await page.keyboard.press('Tab'); // Day Trading Room
		await page.keyboard.press('Tab'); // Swing Trading Room
		await page.keyboard.press('Tab'); // Small Accounts Room
		await page.keyboard.press('Tab'); // Alert Services trigger

		// Leaving the first .nav-item must close its dropdown
		await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');

		// Tabbing into Alert Services submenu must set aria-expanded="true" on Alert Services trigger
		await page.keyboard.press('Tab'); // SPX Profit Pulse
		await expect(secondTrigger).toHaveAttribute('aria-expanded', 'true');
	});

	test('renders US/Canada hreflang tags, JSON-LD EducationalOrganization schema, OpenGraph/Twitter image metadata, robots.txt, and clean sitemap.xml', async ({
		page,
		request
	}) => {
		await page.goto('/');
		// Prerendered (SSG) pages bake the production origin into canonical, hreflang, Open Graph and JSON-LD
		const origin = 'https://revolutiontradingpros.com';

		// Zero duplicate head tags
		await expect(page.locator('head title')).toHaveCount(1);
		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		await expect(page.locator('head meta[name="robots"]')).toHaveCount(1);
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
			'content',
			'index, follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'
		);

		// Canonical, hreflang, and og:url must all match normalized origin without trailing slash mismatch
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', origin);
		await expect(page.locator('head link[rel="alternate"][hreflang="en-us"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="alternate"][hreflang="en-us"]')).toHaveAttribute(
			'href',
			origin
		);
		await expect(page.locator('head link[rel="alternate"][hreflang="en-ca"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="alternate"][hreflang="en-ca"]')).toHaveAttribute(
			'href',
			origin
		);
		await expect(page.locator('head link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
			'href',
			origin
		);

		// OpenGraph & Twitter Card metadata verification
		await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute('content', origin);
		await expect(page.locator('head meta[property="og:locale"]')).toHaveAttribute(
			'content',
			'en_US'
		);
		await expect(page.locator('head meta[property="og:locale:alternate"]')).toHaveAttribute(
			'content',
			'en_CA'
		);
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
		expect(graphTypes).toContain('BreadcrumbList');
		expect(graphTypes).toContain('FAQPage');

		// Verify SpeakableSpecification selectors actually exist in the rendered DOM
		const webPageNode = parsedJsonLd['@graph'].find(
			(n: { '@type': string }) => n['@type'] === 'WebPage'
		);
		for (const selector of webPageNode.speakable.cssSelector as string[]) {
			await expect(page.locator(selector).first()).toBeAttached();
		}

		// Verify FAQPage JSON-LD questions match visible DOM FAQ headings 1-to-1
		const faqNode = parsedJsonLd['@graph'].find(
			(n: { '@type': string }) => n['@type'] === 'FAQPage'
		);
		const visibleFaqQuestions = (
			await page.locator('.faqs details summary h3.faq-question').allTextContents()
		).map((t) => t.trim());
		expect(faqNode.mainEntity.map((q: { name: string }) => q.name)).toEqual(visibleFaqQuestions);

		// Verify robots.txt
		const robotsRes = await request.get('/robots.txt');
		expect(robotsRes.status()).toBe(200);
		const robotsTxt = await robotsRes.text();
		expect(robotsTxt).toContain('User-agent: *');
		expect(robotsTxt).toContain('Allow: /');
		expect(robotsTxt).toContain('Disallow: /login');
		expect(robotsTxt).toContain('Disallow: /api/');
		expect(robotsTxt).toContain('Sitemap: https://revolutiontradingpros.com/sitemap.xml');

		// Verify sitemap.xml
		const sitemapRes = await request.get('/sitemap.xml');
		expect(sitemapRes.status()).toBe(200);
		expect(sitemapRes.headers()['x-robots-tag']).toBe('noindex');
		const sitemapXml = await sitemapRes.text();
		expect(sitemapXml).toContain('hreflang="en-us"');
		expect(sitemapXml).toContain('hreflang="en-ca"');
		expect(sitemapXml).toContain('hreflang="x-default"');
		expect(sitemapXml).toContain('<loc>https://revolutiontradingpros.com</loc>');
		expect(sitemapXml).toContain('<loc>https://revolutiontradingpros.com/about</loc>');
		expect(sitemapXml).toContain('<loc>https://revolutiontradingpros.com/blogs</loc>');
		expect(sitemapXml).toContain(
			'<loc>https://revolutiontradingpros.com/live-trading-rooms/day-trading-room</loc>'
		);
		expect(sitemapXml).toContain(
			'<loc>https://revolutiontradingpros.com/live-trading-rooms/small-accounts-room</loc>'
		);
		expect(sitemapXml).toContain(
			'<loc>https://revolutiontradingpros.com/live-trading-rooms/swing-trading-room</loc>'
		);
		expect(sitemapXml).not.toContain('/demo/');

		// Verify homepage blog card hrefs match sitemap.xml canonical blog routes
		const blogHrefs = await page
			.locator('.blog-card a.text-link')
			.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
		expect(blogHrefs).toEqual([
			'/blogs/how-we-shorted-oxy-put-options-600-percent-overnight',
			'/blogs/growing-a-500-dollar-small-options-account-without-blowing-up',
			'/blogs/swing-trading-options-with-a-full-time-job-watchlist-routine'
		]);
		for (const slug of blogHrefs) {
			expect(sitemapXml).toContain(`https://revolutiontradingpros.com${slug}`);
		}

		// Verify footer legal links and mandatory US (SEC/CFTC/FINRA) & Canadian (OSC/BCSC/ASC) YMYL disclosure
		const legalHrefs = await page
			.locator('nav[aria-labelledby="footer-legal"] a')
			.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
		expect(legalHrefs).toEqual(['/contact', '/privacy-policy', '/terms-of-service']);

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
		const origin = 'https://revolutiontradingpros.com';
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
		await expect(page.locator('head link[rel="alternate"][hreflang="en-us"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="alternate"][hreflang="en-ca"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
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

		// JSON-LD on /about matches visible FAQ accordion 1-to-1
		const aboutJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const aboutSchema = JSON.parse(aboutJsonLdText!);
		const aboutFaqNode = aboutSchema['@graph'].find(
			(n: { '@type': string }) => n['@type'] === 'FAQPage'
		);
		const visibleAboutFaqs = (
			await page.locator('details.faq-item summary h3.faq-item__heading').allTextContents()
		).map((t) => t.trim());
		expect(aboutFaqNode.mainEntity.map((q: { name: string }) => q.name)).toEqual(visibleAboutFaqs);

		// Verify /demo/playwright automatically receives noindex, nofollow and zero hreflang tags
		await page.goto('/demo/playwright');
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
			'content',
			'noindex, nofollow'
		);
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
		await expect(page.locator('head link[rel="alternate"][hreflang="en-us"]')).toHaveAttribute(
			'href',
			expectedDayRoomUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang="en-ca"]')).toHaveAttribute(
			'href',
			expectedDayRoomUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
			'href',
			expectedDayRoomUrl
		);

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
		const dayRoomFaqNode = dayRoomSchema['@graph'].find(
			(n: { '@type': string }) => n['@type'] === 'FAQPage'
		);
		const visibleDayRoomFaqs = (
			await page.locator('details.faq-item summary h3.faq-item__heading').allTextContents()
		).map((t) => t.trim());
		expect(dayRoomFaqNode.mainEntity.map((q: { name: string }) => q.name)).toEqual(
			visibleDayRoomFaqs
		);

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
		await expect(page.locator('head link[rel="alternate"][hreflang="en-us"]')).toHaveAttribute(
			'href',
			expectedSwingRoomUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang="en-ca"]')).toHaveAttribute(
			'href',
			expectedSwingRoomUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
			'href',
			expectedSwingRoomUrl
		);

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
		const swingRoomFaqNode = swingRoomSchema['@graph'].find(
			(n: { '@type': string }) => n['@type'] === 'FAQPage'
		);
		const visibleSwingRoomFaqs = (
			await page.locator('details.faq-item summary h3.faq-item__heading').allTextContents()
		).map((t) => t.trim());
		expect(swingRoomFaqNode.mainEntity.map((q: { name: string }) => q.name)).toEqual(
			visibleSwingRoomFaqs
		);

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
		await expect(page.locator('head link[rel="alternate"][hreflang="en-us"]')).toHaveAttribute(
			'href',
			expectedSmallRoomUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang="en-ca"]')).toHaveAttribute(
			'href',
			expectedSmallRoomUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
			'href',
			expectedSmallRoomUrl
		);

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
		const smallRoomFaqNode = smallRoomSchema['@graph'].find(
			(n: { '@type': string }) => n['@type'] === 'FAQPage'
		);
		const visibleSmallRoomFaqs = (
			await page.locator('details.faq-item summary h3.faq-item__heading').allTextContents()
		).map((t) => t.trim());
		expect(smallRoomFaqNode.mainEntity.map((q: { name: string }) => q.name)).toEqual(
			visibleSmallRoomFaqs
		);

		// Verify zero horizontal overflow across 320px and all 6 enterprise breakpoints on /live-trading-rooms/small-accounts-room
		for (const width of [320, 480, 640, 768, 1024, 1280, 1536]) {
			await page.setViewportSize({ width, height: 900 });
			const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(scrollWidth).toBeLessThanOrEqual(width);
		}

		// Verify /blogs hub route metadata, JSON-LD, and DOM parity
		const expectedBlogsUrl = `${origin}/blogs`;
		await page.goto('/blogs');

		await expect(page.locator('head title')).toHaveCount(1);
		const blogsTitle = await page.title();
		expect(blogsTitle).toBe('Stock & Options Trading Blog | Revolution Trading Pros');
		expect(blogsTitle.length).toBe(54);

		await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
		const blogsDesc = await page.locator('head meta[name="description"]').getAttribute('content');
		expect(blogsDesc).toBe(
			'Free institutional stock and options trading articles, Options Greeks guides, $500+ small account strategies, and macro analysis by Billy Ribeiro.'
		);

		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
			'href',
			expectedBlogsUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang="en-us"]')).toHaveAttribute(
			'href',
			expectedBlogsUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang="en-ca"]')).toHaveAttribute(
			'href',
			expectedBlogsUrl
		);
		await expect(page.locator('head link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
			'href',
			expectedBlogsUrl
		);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1 .hub-h1__kicker')).toHaveCount(1);
		await expect(page.locator('h4')).toHaveCount(0);
		await expect(page.locator('.hero-post-card')).toHaveCount(1);
		await expect(page.locator('.featured-topic-item')).toHaveCount(4);
		await expect(page.locator('.blog-card')).toHaveCount(6);
		await expect(page.locator('.room-cta-card')).toHaveCount(5);

		const blogsJsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const blogsSchema = JSON.parse(blogsJsonLdText!);
		const blogsGraphTypes = blogsSchema['@graph'].map((n: { '@type': string }) => n['@type']);
		expect(blogsGraphTypes).toContain('CollectionPage');
		expect(blogsGraphTypes).toContain('Blog');
		expect(blogsGraphTypes).toContain('BreadcrumbList');

		// Verify zero horizontal overflow across 320px and all 6 enterprise breakpoints on /blogs
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

		// 1280px (Wide Desktop): --max token is 1440px, 0px overflow
		await page.setViewportSize({ width: 1280, height: 900 });
		const metrics1280 = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			maxToken: getComputedStyle(document.documentElement).getPropertyValue('--max').trim(),
			navActionsRight: Math.round(
				document.querySelector('.nav-actions')!.getBoundingClientRect().right
			)
		}));
		expect(metrics1280.scrollWidth).toBeLessThanOrEqual(1280);
		expect(metrics1280.maxToken).toBe('1440px');
		expect(metrics1280.navActionsRight).toBeLessThanOrEqual(1280);

		// 1536px (Ultra-Wide Trading Desk): --max token is 1536px, 0px overflow
		await page.setViewportSize({ width: 1536, height: 960 });
		const metrics1536 = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			maxToken: getComputedStyle(document.documentElement).getPropertyValue('--max').trim(),
			navActionsRight: Math.round(
				document.querySelector('.nav-actions')!.getBoundingClientRect().right
			)
		}));
		expect(metrics1536.scrollWidth).toBeLessThanOrEqual(1536);
		expect(metrics1536.maxToken).toBe('1536px');
		expect(metrics1536.navActionsRight).toBeLessThanOrEqual(1536);
	});

	test('handles interactive preview navigation, mobile menu toggle, 48px tap targets, resize cleanup, Escape key, and eBook form validation', async ({
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

		// Submit eBook form with valid data
		await page.fill('#firstName', 'Alex');
		await page.fill('#email', 'alex@example.com');
		await page.selectOption('#profile', { index: 1 });
		await page.click('#ebookForm button[type="submit"]');

		await expect(page.locator('#formStatus')).toBeVisible();
		await expect(page.locator('#formStatus')).toContainText('Preview only');

		// Submit whitespace-only firstName (bypasses HTML5 required, triggers server Valibot v.trim() + v.minLength(1))
		await page.fill('#firstName', '   ');
		await page.click('#ebookForm button[type="submit"]');

		// Stale #formStatus must be hidden and .field-issue must appear
		await expect(page.locator('.field-issue').first()).toBeVisible();
		await expect(page.locator('.field-issue').first()).toContainText(
			'Please enter your first name.'
		);
		await expect(page.locator('#formStatus')).toHaveCount(0);
	});

	test('keeps all .reveal section elements visible (opacity: 1) when JavaScript is disabled', async ({
		browser
	}) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto('/');

		const revealCount = await page.locator('.reveal').count();
		expect(revealCount).toBeGreaterThanOrEqual(20);

		const opacities = await page
			.locator('.reveal')
			.evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
		expect(opacities.every((o) => o === '1')).toBe(true);

		await context.close();
	});
});
