import { chromium } from '@playwright/test';
const out = process.argv[2];
const b = await chromium.launch();
const pages = { home: '/', about: '/about', mission: '/our-mission', mentorship: '/mentorship', blogs: '/blogs', hub: '/resources', etf: '/resources/etf-stocks-list', idx: '/resources/stock-indexes-list', courses: '/store/courses', indicators: '/store/indicators', scanners: '/store/scanners', spx: '/alert-services/spx-profit-pulse', day: '/live-trading-rooms/day-trading-room', ind1: '/store/indicators/spx-gamma-zones', scan1: '/store/scanners/move-prior-to-the-move-radar', course1: '/store/courses/move-prior-to-the-move-ultra' };
for (const [n, p] of Object.entries(pages)) {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await pg.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
  await pg.goto('http://localhost:5199' + p, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.addStyleTag({ content: '*{animation:none!important;transition:none!important;caret-color:transparent!important}' });
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: `${out}/${n}.png`, fullPage: true });
  await pg.close();
}
await b.close();
