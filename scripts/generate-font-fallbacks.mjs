#!/usr/bin/env node
/**
 * Measures metric-matched fallback faces for the self-hosted variable fonts and prints the
 * `@font-face` block that lives in `src/app.css` (section "Metric-matched fallback faces").
 *
 * Why: with `font-display: swap`, text first paints in a local font and reflows when the WOFF2
 * arrives. Without `size-adjust` / `ascent-override` / `descent-override` / `line-gap-override`
 * on that local font, the reflow moves the hero by tens of pixels (measured CLS 0.048 on `/`).
 *
 * How (all values are measured, nothing is hand-tuned):
 *   1. Load the site's real copy from a running build (`pnpm build && pnpm preview --port 4173`)
 *      and collect, per family/weight/style, the exact text the page renders in it.
 *   2. In Chromium, load the Fontsource WOFF2 files from node_modules and the local Arial faces.
 *   3. size-adjust = average advance width of the web font / that of Arial, on that text.
 *   4. ascent/descent/line-gap overrides = web-font metrics / size-adjust, because the overrides
 *      are scaled by size-adjust (CSS Fonts 5, "size-adjust" descriptor).
 *   5. Verify: render the same paragraphs at a fixed width in the web font and in the adjusted
 *      fallback and report rendered height and width differences.
 *
 * Usage: node scripts/generate-font-fallbacks.mjs [baseUrl] [route ...]
 *   e.g. node scripts/generate-font-fallbacks.mjs http://localhost:4173 / /about
 * Requires Arial on the measuring machine (macOS / Windows); the script fails loudly otherwise.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const [baseUrl = 'http://localhost:4173', ...routeArgs] = process.argv.slice(2);
const routes = routeArgs.length > 0 ? routeArgs : ['/', '/about'];

const FONT_FILES = {
	'Montserrat Variable': {
		normal: 'node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2',
		italic: 'node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-italic.woff2'
	},
	'Sofia Sans Variable': {
		normal: 'node_modules/@fontsource-variable/sofia-sans/files/sofia-sans-latin-wght-normal.woff2',
		italic: 'node_modules/@fontsource-variable/sofia-sans/files/sofia-sans-latin-wght-italic.woff2'
	}
};

/** Fontsource CSS per family/style; the fallback faces copy the `latin` subset's unicode-range from it. */
const FONTSOURCE_CSS = {
	'Montserrat Variable': {
		normal: 'node_modules/@fontsource-variable/montserrat/wght.css',
		italic: 'node_modules/@fontsource-variable/montserrat/wght-italic.css'
	},
	'Sofia Sans Variable': {
		normal: 'node_modules/@fontsource-variable/sofia-sans/wght.css',
		italic: 'node_modules/@fontsource-variable/sofia-sans/wght-italic.css'
	}
};

/**
 * The fallback face covers exactly the characters the web font's Latin subset covers, so a glyph the web
 * font does not ship still falls through to the system stack after the swap, as it did before.
 */
function latinUnicodeRange(family, style) {
	const css = readFileSync(`${ROOT}${FONTSOURCE_CSS[family][style]}`, 'utf8');
	for (const block of css.split('@font-face').slice(1)) {
		// Match on the face's own src URL; Fontsource's /* name */ comments precede the next @font-face.
		if (/-latin-wght-(?:normal|italic)\.woff2/.test(block)) {
			const range = block.match(/unicode-range:\s*([^;]+);/)?.[1].trim();
			if (range) return range;
		}
	}
	throw new Error(`No latin unicode-range found in ${FONTSOURCE_CSS[family][style]}.`);
}

/** Arial and its metric-compatible clones (Liberation Sans, Arimo share Arial's advance widths). */
const LOCAL_SOURCES = {
	regular: ['Arial', 'ArialMT', 'Liberation Sans', 'LiberationSans', 'Arimo'],
	bold: [
		'Arial Bold',
		'Arial-BoldMT',
		'Liberation Sans Bold',
		'LiberationSans-Bold',
		'Arimo Bold',
		'Arimo-Bold'
	],
	italic: [
		'Arial Italic',
		'Arial-ItalicMT',
		'Liberation Sans Italic',
		'LiberationSans-Italic',
		'Arimo Italic',
		'Arimo-Italic'
	],
	boldItalic: [
		'Arial Bold Italic',
		'Arial-BoldItalicMT',
		'Liberation Sans Bold Italic',
		'LiberationSans-BoldItalic',
		'Arimo Bold Italic',
		'Arimo-BoldItalic'
	]
};

/**
 * Weight bands per fallback face. `at` is the weight the band is measured at; Montserrat is used
 * almost only at 700-900 on the site, so its heavy range is split finely.
 */
const BANDS = {
	'Montserrat Variable': [
		{ style: 'normal', range: [100, 549], at: 400, local: 'regular' },
		{ style: 'normal', range: [550, 749], at: 700, local: 'bold' },
		{ style: 'normal', range: [750, 849], at: 800, local: 'bold' },
		{ style: 'normal', range: [850, 900], at: 900, local: 'bold' },
		{ style: 'italic', range: [100, 549], at: 400, local: 'italic' },
		{ style: 'italic', range: [550, 900], at: 700, local: 'boldItalic' }
	],
	'Sofia Sans Variable': [
		{ style: 'normal', range: [1, 449], at: 400, local: 'regular' },
		{ style: 'normal', range: [450, 549], at: 500, local: 'regular' },
		{ style: 'normal', range: [550, 649], at: 600, local: 'bold' },
		{ style: 'normal', range: [650, 1000], at: 700, local: 'bold' },
		{ style: 'italic', range: [1, 549], at: 400, local: 'italic' },
		{ style: 'italic', range: [550, 1000], at: 700, local: 'boldItalic' }
	]
};

const pct = (n) => `${(n * 100).toFixed(2)}%`;

const browser = await chromium.launch();
try {
	// 1. Collect the real copy per family/weight/style from the built site.
	const corpus = {};
	const collector = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	for (const route of routes) {
		const response = await collector.goto(new URL(route, baseUrl).href, {
			waitUntil: 'networkidle'
		});
		if (!response?.ok())
			throw new Error(`Could not load ${route} from ${baseUrl} (status ${response?.status()}).`);
		const found = await collector.evaluate(() => {
			const out = [];
			const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
			for (let node = walker.nextNode(); node; node = walker.nextNode()) {
				const text = node.textContent.replace(/\s+/g, ' ').trim();
				if (!text) continue;
				const style = getComputedStyle(node.parentElement);
				if (style.display === 'none' || style.visibility === 'hidden') continue;
				const family = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
				const transform = style.textTransform;
				const shown =
					transform === 'uppercase'
						? text.toUpperCase()
						: transform === 'lowercase'
							? text.toLowerCase()
							: text;
				out.push({ family, weight: Number(style.fontWeight), style: style.fontStyle, text: shown });
			}
			return out;
		});
		for (const run of found) (corpus[run.family] ??= []).push(run);
	}
	await collector.close();

	const textFor = (family, band) => {
		const runs = corpus[family] ?? [];
		const inBand = runs.filter(
			(r) => r.style === band.style && r.weight >= band.range[0] && r.weight <= band.range[1]
		);
		const chosen = inBand.reduce((n, r) => n + r.text.length, 0) >= 200 ? inBand : runs;
		const text = chosen.map((r) => r.text).join(' ');
		if (text.length < 200)
			throw new Error(`Not enough ${family} text on ${routes.join(', ')} to measure.`);
		return { text, source: chosen === inBand ? 'band' : 'family' };
	};

	// 2-5. Measure in a page that loads the WOFF2 files straight from node_modules.
	const page = await browser.newPage();
	await page.route('http://fonts.local/**', (route) => {
		const file = decodeURIComponent(new URL(route.request().url()).pathname.slice(1));
		if (!file)
			return route.fulfill({
				body: '<!doctype html><title>font metrics</title>',
				contentType: 'text/html'
			});
		return route.fulfill({ body: readFileSync(`${ROOT}${file}`), contentType: 'font/woff2' });
	});
	await page.goto('http://fonts.local/');

	const results = [];
	for (const [family, bands] of Object.entries(BANDS)) {
		for (const band of bands) {
			const { text, source } = textFor(family, band);
			const measured = await page.evaluate(
				async ({ family, band, url, locals, text }) => {
					const web = new FontFace(`Probe Web`, `url(${url}) format('woff2')`, {
						style: band.style,
						weight: '1 1000'
					});
					const local = new FontFace('Probe Local', locals.map((n) => `local('${n}')`).join(', '), {
						style: band.style,
						weight: band.local.startsWith('bold') ? '700' : '400'
					});
					await web.load();
					try {
						await local.load();
					} catch {
						throw new Error(`None of ${locals.join(', ')} is installed; cannot measure ${family}.`);
					}
					document.fonts.add(web);
					document.fonts.add(local);
					const ctx = document.createElement('canvas').getContext('2d');
					const metrics = (name) => {
						ctx.font = `${band.style} ${band.at} 100px "${name}"`;
						const m = ctx.measureText(text);
						return {
							width: m.width,
							ascent: m.fontBoundingBoxAscent / 100,
							descent: m.fontBoundingBoxDescent / 100
						};
					};
					const w = metrics('Probe Web');
					const f = metrics('Probe Local');
					// Line gap: a line-height:normal box is (ascent + descent + lineGap) * font-size.
					const box = document.createElement('span');
					box.style.cssText = `font: ${band.style} ${band.at} 100px "Probe Web"; line-height: normal; display: inline-block`;
					box.textContent = 'Hg';
					document.body.append(box);
					const lineGap = Math.max(
						0,
						box.getBoundingClientRect().height / 100 - w.ascent - w.descent
					);
					box.remove();
					document.fonts.delete(web);
					document.fonts.delete(local);
					return { web: w, local: f, lineGap };
				},
				{
					family,
					band,
					url: `http://fonts.local/${FONT_FILES[family][band.style]}`,
					locals: LOCAL_SOURCES[band.local],
					text
				}
			);
			const sizeAdjust = measured.web.width / measured.local.width;
			results.push({
				family,
				band,
				source,
				chars: text.length,
				sizeAdjust,
				ascent: measured.web.ascent / sizeAdjust,
				descent: measured.web.descent / sizeAdjust,
				lineGap: measured.lineGap / sizeAdjust,
				text
			});
		}
	}

	// Emit CSS.
	const css = [];
	for (const r of results) {
		const sources = LOCAL_SOURCES[r.band.local].map((n) => `local('${n}')`).join(', ');
		css.push(
			[
				'@font-face {',
				`\tfont-family: '${r.family} Fallback';`,
				`\tfont-style: ${r.band.style};`,
				`\tfont-weight: ${r.band.range[0]} ${r.band.range[1]};`,
				`\tsrc: ${sources};`,
				`\tsize-adjust: ${pct(r.sizeAdjust)};`,
				`\tascent-override: ${pct(r.ascent)};`,
				`\tdescent-override: ${pct(r.descent)};`,
				`\tline-gap-override: ${pct(r.lineGap)};`,
				`\tunicode-range: ${latinUnicodeRange(r.family, r.band.style)};`,
				`}`
			].join('\n')
		);
	}

	// Verify: paragraphs at fixed widths, web font vs adjusted fallback.
	await page.addStyleTag({ content: css.join('\n') });
	const verification = [];
	for (const r of results) {
		const check = await page.evaluate(
			async ({ family, band, url, text }) => {
				const web = new FontFace(family, `url(${url}) format('woff2')`, {
					style: band.style,
					weight: '1 1000'
				});
				await web.load();
				document.fonts.add(web);
				await document.fonts.load(`${band.style} ${band.at} 16px "${family} Fallback"`);
				const sample = text.slice(0, 1200);
				const render = (name, width) => {
					const el = document.createElement('p');
					el.style.cssText = `margin:0;width:${width}px;font:${band.style} ${band.at} 18px/1.5 "${name}";`;
					el.textContent = sample;
					document.body.append(el);
					const h = el.getBoundingClientRect().height;
					const line = document.createElement('span');
					line.style.cssText = `font:${band.style} ${band.at} 18px "${name}";white-space:nowrap;line-height:normal`;
					line.textContent = sample.slice(0, 120);
					document.body.append(line);
					const box = line.getBoundingClientRect();
					el.remove();
					line.remove();
					return { h, w: box.width, lh: box.height };
				};
				const rows = [360, 680].map((width) => ({
					width,
					web: render(family, width),
					fb: render(`${family} Fallback`, width)
				}));
				document.fonts.delete(web);
				return rows;
			},
			{
				family: r.family,
				band: r.band,
				url: `http://fonts.local/${FONT_FILES[r.family][r.band.style]}`,
				text: r.text
			}
		);
		verification.push({ r, check });
	}

	console.log(
		'/* Generated by scripts/generate-font-fallbacks.mjs - do not hand-edit the numbers. */'
	);
	console.log(css.join('\n'));
	console.error(
		'\nVerification (18px, line-height 1.5; height = wrapped paragraph, width = 120-char run, lh = line-height:normal box):'
	);
	for (const { r, check } of verification) {
		const cells = check
			.map((c) => `${c.width}px h ${c.web.h.toFixed(0)}/${c.fb.h.toFixed(0)}`)
			.join('  ');
		const c0 = check[0];
		console.error(
			`${r.family} ${r.band.style} ${r.band.range.join('-')} @${r.band.at} [${r.source} ${r.chars}ch] size-adjust ${pct(r.sizeAdjust)} | ${cells} | run width ${c0.web.w.toFixed(1)}/${c0.fb.w.toFixed(1)} (${(((c0.fb.w - c0.web.w) / c0.web.w) * 100).toFixed(2)}%) | lh ${c0.web.lh.toFixed(2)}/${c0.fb.lh.toFixed(2)}`
		);
	}
} finally {
	await browser.close();
}
