import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

const ROOT = new URL('..', import.meta.url).pathname;
const appCss = readFileSync(join(ROOT, 'src/app.css'), 'utf8');
const proseCss = readFileSync(join(ROOT, 'src/lib/styles/prose.css'), 'utf8');
const licensesTxt = readFileSync(join(ROOT, 'static/fonts/LICENSES.txt'), 'utf8');

function walkPublicStyles(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === 'admin') continue;
			walkPublicStyles(full, out);
		} else if (entry.name.endsWith('.css') || entry.name.endsWith('.svelte')) {
			out.push(full);
		}
	}
	return out;
}

function evalClampPx(formula: string, viewportPx: number, rootPx = 16): number {
	const m = formula.match(
		/^clamp\(\s*([0-9.]+)rem\s*,\s*([0-9.]+)rem\s*\+\s*([0-9.]+)vi\s*,\s*([0-9.]+)rem\s*\)$/
	);
	if (!m) throw new Error(`Invalid linear rem+vi clamp formula: ${formula}`);
	const minPx = Number.parseFloat(m[1]) * rootPx;
	const prefPx = Number.parseFloat(m[2]) * rootPx + (Number.parseFloat(m[3]) / 100) * viewportPx;
	const maxPx = Number.parseFloat(m[4]) * rootPx;
	return Math.min(maxPx, Math.max(minPx, prefPx));
}

describe('Enterprise Typography SSOT & Mathematical Fluid Scale', () => {
	it('ships valid WOFF2 binaries and OFL-1.1 attributions for all @font-face urls in src/app.css', () => {
		const fontUrls = [...appCss.matchAll(/url\(['"](\/fonts\/[^'"]+\.woff2)['"]\)/g)].map(
			(m) => m[1]
		);
		expect(fontUrls.length).toBeGreaterThanOrEqual(7);

		for (const relUrl of fontUrls) {
			const diskPath = join(ROOT, 'static', relUrl);
			expect(existsSync(diskPath), `Missing font asset ${diskPath}`).toBe(true);
			const magic = readFileSync(diskPath).subarray(0, 4).toString('ascii');
			expect(magic, `Invalid WOFF2 header on ${relUrl}`).toBe('wOF2');
		}

		expect(licensesTxt).toContain('Plus Jakarta Sans');
		expect(licensesTxt).toContain('Inter - Copyright');
		expect(licensesTxt).toContain('Geist Mono');
		expect(licensesTxt).not.toContain('Montserrat - Copyright');
		expect(licensesTxt).not.toContain('Sofia Sans - Copyright');
	});

	it('declares canonical font, weight, fluid scale, and backward-compatible alias tokens', () => {
		const requiredTokens = [
			'--font-display',
			'--font-sans',
			'--font-mono',
			'--font-heading',
			'--font-body',
			'--font-primary',
			'--font-secondary',
			'--weight-regular',
			'--weight-medium',
			'--weight-semibold',
			'--weight-bold',
			'--weight-extrabold',
			'--step-hero',
			'--step-h1',
			'--step-h2',
			'--step-h3',
			'--step-sub',
			'--step-h4',
			'--step-lead',
			'--step-body',
			'--step-body-sm',
			'--step-sm',
			'--step-caption',
			'--step-xs',
			'--step-micro',
			'--step-breadcrumb',
			'--text-eyebrow',
			'--text-seo-kicker',
			'--blog-h1',
			'--blog-h2',
			'--blog-h3',
			'--blog-h4',
			'--blog-body'
		];
		for (const token of requiredTokens) {
			expect(appCss, `Missing SSOT token ${token}`).toMatch(new RegExp(`${token}\\s*:`));
		}
	});

	it('mathematically validates every [375px -> 1536px] fluid token, monotonicity, and WCAG 1.4.4 zoom ratio', () => {
		const expectedScale: ReadonlyArray<[string, number, number]> = [
			['--step-hero', 32, 50],
			['--step-h1', 28, 42.4],
			['--step-h2', 24, 36],
			['--step-h3', 18, 22],
			['--step-sub', 17, 20],
			['--step-h4', 15, 16],
			['--step-lead', 17, 19],
			['--step-body', 15, 16],
			['--step-body-sm', 13.5, 15],
			['--text-eyebrow', 12, 16],
			['--step-sm', 12, 14],
			['--step-caption', 12, 13]
		];

		const widths = [320, 375, 480, 768, 1024, 1280, 1440, 1536, 1920];

		for (const [token, minPx, maxPx] of expectedScale) {
			// WCAG 1.4.4 browser-zoom invariant: F_max / F_min <= 2.5
			expect(maxPx / minPx, `${token} exceeds 2.5x WCAG zoom ratio`).toBeLessThanOrEqual(2.5);

			const match = appCss.match(new RegExp(`${token}\\s*:\\s*(clamp\\([^;]+\\))\\s*;`));
			expect(match, `${token} must use a linear clamp() formula`).not.toBeNull();
			const formula = match![1];

			expect(evalClampPx(formula, 320)).toBeCloseTo(minPx, 1);
			expect(evalClampPx(formula, 375)).toBeCloseTo(minPx, 1);
			expect(evalClampPx(formula, 1536)).toBeCloseTo(maxPx, 1);
			expect(evalClampPx(formula, 1920)).toBeCloseTo(maxPx, 1);

			for (let i = 1; i < widths.length; i++) {
				expect(
					evalClampPx(formula, widths[i]),
					`${token} must be monotonic between ${widths[i - 1]}px and ${widths[i]}px`
				).toBeGreaterThanOrEqual(evalClampPx(formula, widths[i - 1]) - 1e-6);
			}

			// Verify 200% root font-size enlargement scales token cleanly
			expect(evalClampPx(formula, 1280, 32)).toBeGreaterThan(evalClampPx(formula, 1280, 16) * 1.45);
		}
	});

	it('respects OS root font preference (html 100%), disables synthetic faux-weights, and scopes Inter cv* features off html', () => {
		const htmlBlock = appCss.match(/\bhtml\s*\{([^}]+)\}/)?.[1] ?? '';
		expect(htmlBlock).toContain('font-size: 100%');
		expect(htmlBlock).toContain('font-synthesis-weight: none');
		expect(htmlBlock).toContain('font-synthesis-style: none');
		expect(htmlBlock).not.toContain('cv02');

		const bodyBlock = appCss.match(/\bbody\s*\{([^}]+)\}/)?.[1] ?? '';
		expect(bodyBlock).toContain("'cv02'");
		expect(bodyBlock).not.toContain('tabular-nums');
	});

	it('preserves the protected Blog Layout Contract (container-flush .prose-base without 65ch caps)', () => {
		expect(proseCss).toContain('font-size: var(--blog-body)');
		expect(proseCss).toContain('font-size: var(--blog-h1)');
		expect(proseCss).toContain('font-size: var(--blog-h2)');
		expect(proseCss).toContain('font-size: var(--blog-h3)');
		expect(proseCss).toContain('font-size: var(--blog-h4)');

		const proseParagraph = proseCss.match(/\.prose-base\s+p\s*\{([^}]+)\}/)?.[1] ?? '';
		expect(proseParagraph).toContain('max-inline-size: 100%');
		expect(proseParagraph).not.toMatch(/\b65ch\b|\b70ch\b|\b680px\b|\b700px\b/);
	});

	it('enforces zero static >0.75rem font-sizes, bare-vw clamps, faux weights, synthetic italics, or fixed-rem line-heights across public src/', () => {
		const violations: string[] = [];
		for (const file of walkPublicStyles(join(ROOT, 'src'))) {
			if (file.includes('/components/admin/') || file.endsWith('IndicatorChart.svelte')) continue;
			const lines = readFileSync(file, 'utf8').split('\n');
			lines.forEach((line, idx) => {
				if (file.endsWith('src/app.css') && idx < 290) return;

				const fsMatch = line.match(/^\s*font-size\s*:\s*([^;]+);/);
				if (fsMatch) {
					const val = fsMatch[1].trim();
					const valid =
						val.startsWith('var(--') ||
						val === '0' ||
						val === '640px' ||
						val === 'inherit' ||
						/^[0-9.]+em$/.test(val) ||
						(/^[0-9.]+rem$/.test(val) && Number.parseFloat(val) <= 0.75) ||
						/^clamp\([^)]*\+[^)]*(?:vi|cqi)/.test(val);
					if (!valid) violations.push(`${file}:${idx + 1} non-fluid font-size: ${val}`);
				}

				if (/^\s*font-weight\s*:\s*(?:450|750|900)\s*;/.test(line)) {
					violations.push(`${file}:${idx + 1} unsupported weight: ${line.trim()}`);
				}
				if (/^\s*font-style\s*:\s*italic\s*;/.test(line)) {
					violations.push(`${file}:${idx + 1} synthetic italic: ${line.trim()}`);
				}
				if (/^\s*line-height\s*:\s*[0-9.]+rem\s*;/.test(line)) {
					violations.push(`${file}:${idx + 1} fixed-rem line-height: ${line.trim()}`);
				}
			});
		}
		expect(violations).toEqual([]);
	});
});
