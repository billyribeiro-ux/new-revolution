import { chromium } from '@playwright/test';
import fs from 'node:fs';
const BASE = 'http://localhost:5199';
const VIEWPORTS = (process.env.VPS || '1440x900,390x844').split(',').map((v) => v.split('x').map(Number));
const b = await chromium.launch();

const AUDIT_FN = () => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; };
  const over = (top, bot) => { const a = top.a + bot.a * (1 - top.a); if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }; return { r: (top.r * top.a + bot.r * bot.a * (1 - top.a)) / a, g: (top.g * top.a + bot.g * bot.a * (1 - top.a)) / a, b: (top.b * top.a + bot.b * bot.a * (1 - top.a)) / a, a }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const bgOf = (el) => {
    let layers = []; let cur = el; let unknown = false;
    while (cur && cur.nodeType === 1) {
      const cs = getComputedStyle(cur);
      let bg = parse(cs.backgroundColor);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        const cols = [...cs.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0])).filter(Boolean);
        if (cols.length) { const avg = cols.reduce((s, c) => ({ r: s.r + c.r, g: s.g + c.g, b: s.b + c.b, a: s.a + c.a }), { r: 0, g: 0, b: 0, a: 0 }); const n = cols.length; bg = { r: avg.r / n, g: avg.g / n, b: avg.b / n, a: Math.min(1, avg.a / n) }; } else unknown = true;
      }
      if (bg && bg.a > 0) layers.push(bg);
      if (bg && bg.a >= 1) break;
      cur = cur.parentElement;
    }
    let acc = { r: 11, g: 14, b: 18, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) acc = over(layers[i], acc);
    return { c: acc, unknown };
  };
  const effOpacity = (el) => { let o = 1; let c = el; while (c && c.nodeType === 1) { o *= parseFloat(getComputedStyle(c).opacity); c = c.parentElement; } return o; };
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const t = walker.currentNode; const txt = t.textContent.trim(); if (!txt) continue;
    const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0 || r.height === 0) continue;
    if (el.closest('[aria-hidden="true"], details:not([open]) > :not(summary)')) continue;
    const eo = effOpacity(el);
    let fg = parse(cs.color); if (!fg) continue;
    const { c: bg, unknown } = bgOf(el);
    fg = { ...fg, a: fg.a * eo };
    const fgc = over(fg, bg);
    const cr = ratio(fgc, bg);
    const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    const path = (() => { const parts = []; let c = el; for (let i = 0; i < 3 && c && c !== document.body; i++) { parts.unshift(c.tagName.toLowerCase() + (c.className && typeof c.className === 'string' ? '.' + c.className.trim().split(/\s+/).slice(0, 2).join('.') : '')); c = c.parentElement; } return parts.join(' > '); })();
    if (cr < need) out.push({ kind: cr < 2 ? 'INVISIBLE' : cr < 3 ? 'FAIL' : 'LOW', cr: +cr.toFixed(2), need, path, text: txt.slice(0, 50), op: +eo.toFixed(2), unknown, y: Math.round(r.top + scrollY) });
  }
  return out;
};

const PAGE_FN = () => ({
  overflowX: document.documentElement.scrollWidth - innerWidth,
  wide: [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.right > innerWidth + 1 && cs.position !== 'fixed' && !e.closest('.mobile-nav, .dropdown-menu, svg'); }).slice(0, 6).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + ' r=' + Math.round(e.getBoundingClientRect().right)),
  hiddenText: [...document.querySelectorAll('.reveal:not(.in-view)')].length
});

const routes = new Set(['/', '/about', '/our-mission', '/mentorship', '/blogs', '/resources', '/resources/etf-stocks-list', '/resources/stock-indexes-list', '/store/courses', '/store/indicators', '/store/scanners', '/live-trading-rooms/day-trading-room', '/live-trading-rooms/swing-trading-room', '/live-trading-rooms/small-accounts-room', '/alert-services/spx-profit-pulse']);
for (const x of ['/store/courses/move-prior-to-the-move-ultra','/store/indicators/spx-gamma-zones','/store/scanners/move-prior-to-the-move-radar']) routes.add(x);
const queue = [...routes]; const visited = new Set(); const report = {};
while (queue.length && visited.size < 40) {
  const route = queue.shift(); if (visited.has(route)) continue; visited.add(route);
  for (const [w, h] of VIEWPORTS) {
    const pg = await b.newPage({ viewport: { width: w, height: h } }); await pg.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
    const logs = []; pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text().slice(0, 140)); }); pg.on('pageerror', (e) => logs.push('pageerror ' + e.message.slice(0, 140)));
    const res = await pg.goto(BASE + route, { waitUntil: 'networkidle' }).catch(() => null);
    const status = res?.status();
    if (!res || status >= 400) { report[`${route} @${w}`] = { status }; await pg.close(); continue; }
    // scroll through the page so scroll-reveal triggers
    { const H = await pg.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 450) { await pg.mouse.wheel(0, 450); await pg.waitForTimeout(90); } await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(700); }
    const contrast = await pg.evaluate(AUDIT_FN);
    const page = await pg.evaluate(PAGE_FN);
    report[`${route} @${w}`] = { status, contrast, page, logs };
    if (false) { const links = await pg.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => new URL(a.href).pathname))]); for (const l of links) if (!visited.has(l) && !queue.includes(l) && !l.startsWith('/demo') && !l.includes('.')) queue.push(l); }
    await pg.close();
  }
}
fs.writeFileSync('/tmp/audit.json', JSON.stringify(report, null, 1));
for (const [k, v] of Object.entries(report)) {
  if (!v.contrast) { console.log(k, 'STATUS', v.status); continue; }
  const inv = v.contrast.filter((c) => c.kind !== 'LOW');
  console.log(k, 'status', v.status, 'contrast issues:', v.contrast.length, '(severe', inv.length + ')', 'overflowX', v.page.overflowX, 'wide', v.page.wide.length, 'unrevealed', v.page.hiddenText, v.logs.length ? 'LOGS ' + JSON.stringify(v.logs) : '');
}
await b.close();
