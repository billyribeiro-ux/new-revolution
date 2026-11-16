/**
 * Phase 3c / Phase 6 — Lab Performance & Accessibility Auditor (`tests/seo/lab.ts`)
 *
 * Uses Playwright Chromium (mobile preset: 375x812, DPR 3) against `pnpm preview`
 * to measure Core Web Vitals (LCP, CLS, TBT, FCP, TTFB), LCP element, render-blocking
 * resources, external font requests, mobile viewport overflow, tap target sizes,
 * and real axe-core WCAG 2.2 AA/best-practice results (no numeric accessibility score) across one representative URL per template.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import type { AxeResults } from 'axe-core';
import { auditAccessibility } from '../accessibility/axe.ts';

export interface TemplateTarget {
	template: string;
	url: string;
}

export const REPRESENTATIVE_TARGETS: TemplateTarget[] = [
	{ template: 'home', url: '/' },
	{ template: 'profile', url: '/about' },
	{ template: 'static', url: '/our-mission' },
	{ template: 'static-resource', url: '/resources/stock-indexes-list' },
	{ template: 'membership-product', url: '/live-trading-rooms/day-trading-room' },
	{ template: 'listing', url: '/store/courses' },
	{ template: 'product', url: '/store/courses/move-prior-to-the-move-ultra' },
	{ template: 'blog-listing', url: '/blog' },
	{ template: 'article', url: '/blog/institutional-order-flow-and-gamma-flip-playbook' }
];

export interface TemplateLabResult {
	template: string;
	url: string;
	status: number;
	viewport: { width: number; height: number };
	cwv: {
		ttfbMs: number;
		fcpMs: number;
		lcpMs: number;
		cls: number;
		tbtMs: number;
		lcpElement: string | null;
	};
	resources: {
		renderBlockingUrls: string[];
		externalFontUrls: string[];
		selfHostedFontUrls: string[];
		totalTransferBytes: number;
	};
	mobileUsability: {
		hasHorizontalOverflow: boolean;
		undersizedTapTargetsCount: number;
		undersizedTapTargetExamples: string[];
	};
	a11y: AxeResults;
}

async function waitForServer(url: string, timeoutMs = 20000): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const res = await fetch(url);
			if (res.status > 0) return;
		} catch {
			// wait
		}
		await new Promise((r) => setTimeout(r, 250));
	}
	throw new Error(`Timed out waiting for preview server at ${url}`);
}

export async function runLabAudit(outDir: string): Promise<{
	generatedAt: string;
	results: TemplateLabResult[];
}> {
	const port = 4280;
	const baseUrl = `http://localhost:${port}`;
	const previewProcess: ChildProcess = spawn(
		'pnpm',
		['preview', '--port', String(port), '--host', 'localhost'],
		{
			cwd: process.cwd(),
			stdio: 'pipe',
			env: {
				...process.env,
				NODE_ENV: 'production',
				DATABASE_URL: 'memory://accessibility-lab',
				ORIGIN: baseUrl,
				MEDIA_STORAGE: 'disk',
				BLOB_READ_WRITE_TOKEN: '',
				RESEND_API_KEY: '',
				GSC_SERVICE_ACCOUNT_JSON: '',
				INDEXNOW_API_KEY: '',
				WAITLIST_SIGNUPS_ENABLED: 'false'
			}
		}
	);

	try {
		await waitForServer(baseUrl);
		const browser = await chromium.launch({ headless: true });
		const results: TemplateLabResult[] = [];
		const axeResults: Array<{ template: string; url: string; result: AxeResults }> = [];

		try {
			for (const target of REPRESENTATIVE_TARGETS) {
				const context = await browser.newContext({
					viewport: { width: 375, height: 812 },
					deviceScaleFactor: 3,
					isMobile: true,
					hasTouch: true
				});
				const page = await context.newPage();

				const externalFontUrls: string[] = [];
				const selfHostedFontUrls: string[] = [];

				page.on('request', (req) => {
					const reqUrl = req.url();
					if (
						req.resourceType() === 'font' ||
						/\.(woff2?|ttf|otf)(\?|$)/i.test(reqUrl) ||
						/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(reqUrl)
					) {
						if (reqUrl.startsWith(baseUrl)) {
							selfHostedFontUrls.push(reqUrl.slice(baseUrl.length));
						} else {
							externalFontUrls.push(reqUrl);
						}
					}
				});

				await page.addInitScript(() => {
					interface PerfWindow extends Window {
						__seoLcpMs?: number;
						__seoLcpElement?: string | null;
						__seoCls?: number;
						__seoTbtMs?: number;
					}
					const w = window as PerfWindow;
					w.__seoLcpMs = 0;
					w.__seoLcpElement = null;
					w.__seoCls = 0;
					w.__seoTbtMs = 0;

					try {
						new PerformanceObserver((list) => {
							const entries = list.getEntries();
							const last = entries[entries.length - 1] as PerformanceEntry & {
								element?: Element | null;
							};
							if (last) {
								w.__seoLcpMs = last.startTime;
								if (last.element) {
									const tag = last.element.tagName.toLowerCase();
									const id = last.element.id ? `#${last.element.id}` : '';
									const cls =
										typeof last.element.className === 'string' && last.element.className.trim()
											? `.${last.element.className.trim().split(/\s+/).join('.')}`
											: '';
									w.__seoLcpElement = `${tag}${id}${cls}`;
								}
							}
						}).observe({ type: 'largest-contentful-paint', buffered: true });
					} catch {
						// ignore
					}

					try {
						new PerformanceObserver((list) => {
							for (const entry of list.getEntries() as Array<
								PerformanceEntry & { hadRecentInput?: boolean; value?: number }
							>) {
								if (!entry.hadRecentInput && typeof entry.value === 'number') {
									w.__seoCls = (w.__seoCls ?? 0) + entry.value;
								}
							}
						}).observe({ type: 'layout-shift', buffered: true });
					} catch {
						// ignore
					}

					try {
						new PerformanceObserver((list) => {
							for (const entry of list.getEntries()) {
								if (entry.duration > 50) {
									w.__seoTbtMs = (w.__seoTbtMs ?? 0) + (entry.duration - 50);
								}
							}
						}).observe({ type: 'longtask', buffered: true });
					} catch {
						// ignore
					}
				});

				const response = await page.goto(`${baseUrl}${target.url}`, {
					waitUntil: 'networkidle'
				});
				await page.waitForTimeout(300);

				const evalData = await page.evaluate(() => {
					interface PerfWindow extends Window {
						__seoLcpMs?: number;
						__seoLcpElement?: string | null;
						__seoCls?: number;
						__seoTbtMs?: number;
					}
					const w = window as PerfWindow;
					const nav = performance.getEntriesByType('navigation')[0] as
						| PerformanceNavigationTiming
						| undefined;
					const fcp = performance.getEntriesByName('first-contentful-paint')[0] as
						| PerformanceEntry
						| undefined;
					const resources = performance.getEntriesByType('resource') as Array<
						PerformanceResourceTiming & { renderBlockingStatus?: string }
					>;

					const renderBlockingUrls: string[] = [];
					let totalTransferBytes = nav?.transferSize ?? 0;
					for (const r of resources) {
						totalTransferBytes += r.transferSize ?? 0;
						if (r.renderBlockingStatus === 'blocking') {
							renderBlockingUrls.push(r.name);
						}
					}

					// Mobile horizontal overflow check
					const hasHorizontalOverflow =
						document.documentElement.scrollWidth > window.innerWidth + 1;

					// Tap target check (< 24x24 CSS px on interactive elements)
					const interactives = Array.from(
						document.querySelectorAll('a[href], button, input, select, textarea, summary')
					);
					const undersizedTapTargetExamples: string[] = [];
					for (const el of interactives) {
						const style = window.getComputedStyle(el);
						if (
							style.display === 'none' ||
							style.visibility === 'hidden' ||
							Number(style.opacity) === 0 ||
							el.classList.contains('skip') ||
							el.classList.contains('sr-only')
						) {
							continue;
						}
						const rect = el.getBoundingClientRect();
						if (rect.width > 0 && rect.height > 0 && (rect.width < 24 || rect.height < 24)) {
							const label =
								(el.textContent ?? '').trim().slice(0, 40) ||
								el.getAttribute('aria-label') ||
								el.tagName.toLowerCase();
							undersizedTapTargetExamples.push(
								`${el.tagName.toLowerCase()}[${Math.round(rect.width)}x${Math.round(rect.height)}]: ${label}`
							);
						}
					}

					return {
						ttfbMs: Math.round(nav ? nav.responseStart - nav.requestStart : 0),
						fcpMs: Math.round(fcp ? fcp.startTime : 0),
						lcpMs: Math.round(w.__seoLcpMs || (fcp ? fcp.startTime : 0)),
						cls: Number((w.__seoCls ?? 0).toFixed(4)),
						tbtMs: Math.round(w.__seoTbtMs ?? 0),
						lcpElement: w.__seoLcpElement ?? null,
						renderBlockingUrls,
						totalTransferBytes,
						hasHorizontalOverflow,
						undersizedTapTargetsCount: undersizedTapTargetExamples.length,
						undersizedTapTargetExamples: undersizedTapTargetExamples.slice(0, 10)
					};
				});

				const accessibility = await auditAccessibility(page);
				const templateResult: TemplateLabResult = {
					template: target.template,
					url: target.url,
					status: response?.status() ?? 0,
					viewport: { width: 375, height: 812 },
					cwv: {
						ttfbMs: evalData.ttfbMs,
						fcpMs: evalData.fcpMs,
						lcpMs: evalData.lcpMs,
						cls: evalData.cls,
						tbtMs: evalData.tbtMs,
						lcpElement: evalData.lcpElement
					},
					resources: {
						renderBlockingUrls: evalData.renderBlockingUrls,
						externalFontUrls,
						selfHostedFontUrls,
						totalTransferBytes: evalData.totalTransferBytes
					},
					mobileUsability: {
						hasHorizontalOverflow: evalData.hasHorizontalOverflow,
						undersizedTapTargetsCount: evalData.undersizedTapTargetsCount,
						undersizedTapTargetExamples: evalData.undersizedTapTargetExamples
					},
					a11y: accessibility
				};

				results.push(templateResult);
				axeResults.push({
					template: target.template,
					url: target.url,
					result: accessibility
				});

				mkdirSync(outDir, { recursive: true });
				writeFileSync(
					resolve(outDir, `${target.template}.json`),
					JSON.stringify(templateResult, null, 2) + '\n'
				);

				await context.close();
			}
		} finally {
			await browser.close();
		}

		const summary = {
			generatedAt: new Date().toISOString(),
			results
		};
		mkdirSync(outDir, { recursive: true });
		writeFileSync(resolve(outDir, 'lab-summary.json'), JSON.stringify(summary, null, 2) + '\n');
		writeFileSync(resolve(outDir, 'axe.json'), JSON.stringify(axeResults, null, 2) + '\n');

		return summary;
	} finally {
		if (previewProcess) {
			previewProcess.kill('SIGTERM');
		}
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const outIdx = process.argv.indexOf('--outdir');
	const outDir =
		outIdx !== -1 && process.argv[outIdx + 1]
			? resolve(process.cwd(), process.argv[outIdx + 1])
			: resolve(process.cwd(), 'test-results/accessibility-lab');

	runLabAudit(outDir)
		.then((summary) => {
			console.log(
				JSON.stringify(
					summary.results.map((r) => ({
						template: r.template,
						url: r.url,
						lcpMs: r.cwv.lcpMs,
						cls: r.cwv.cls,
						tbtMs: r.cwv.tbtMs,
						lcpElement: r.cwv.lcpElement,
						externalFonts: r.resources.externalFontUrls.length,
						overflow: r.mobileUsability.hasHorizontalOverflow,
						undersizedTargets: r.mobileUsability.undersizedTapTargetsCount,
						a11yEngine: r.a11y.testEngine,
						a11yNeedsReview: r.a11y.incomplete.length,
						a11yViolations: r.a11y.violations.map((v) => v.id)
					})),
					null,
					2
				)
			);
			process.exit(0);
		})
		.catch((err) => {
			console.error(err);
			process.exit(1);
		});
}
