import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/lijia/WorkBuddy/2026-09-12-20-25-07/node_modules/puppeteer-core');

const BASE = process.argv[2];
const BYPASS = process.env.VERCEL_PROTECTION_BYPASS || '';
if (!BASE) { console.error('usage: node check-native-v2-ui.mjs <baseUrl>'); process.exit(1); }

const url = `${BASE}/coba-gratis/native-chat${BYPASS ? `?x-vercel-protection-bypass=${BYPASS}&x-vercel-set-bypass-cookie=true` : ''}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
mkdirSync('results/native-v2-ui', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=390,844'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const checks = [];
const record = (name, passed, detail) => { checks.push({ name, passed, detail }); console.log(`${passed ? 'PASS' : 'FAIL'} ${name} :: ${detail}`); };

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
const bodyText = await page.evaluate(() => document.body.innerText);
record('page loads (no Vercel SSO)', !/Authentication Required|Vercel Authentication/i.test(bodyText), bodyText.slice(0, 60).replace(/\n/g, ' '));

// 启动访客会话
await page.evaluate(() => {
  const button = [...document.querySelectorAll('button')].find((item) => /Mulai ngobrol/i.test(item.textContent || ''));
  button?.click();
});
await sleep(2500);
const chatReady = await page.$('#native-chat-message');
record('guest session starts, composer visible', Boolean(chatReady), `composer=${Boolean(chatReady)}`);

// 快捷问题栏：不得出现横向滚动
const layout = await page.evaluate(() => {
  const doc = document.documentElement;
  const buttons = [...document.querySelectorAll('button')].filter((item) => /restoran china|latihan ngobrol|jelaskan lagi/i.test(item.textContent || ''));
  const row = buttons[0]?.parentElement;
  return {
    pageOverflow: doc.scrollWidth - window.innerWidth,
    rowScroll: row ? row.scrollWidth - row.clientWidth : null,
    rowWrap: row ? getComputedStyle(row).flexWrap : null,
    suggestionCount: buttons.length,
  };
});
record('suggestion bar no horizontal scroll', (layout.rowScroll ?? 0) <= 1 && layout.pageOverflow <= 1, `rowScroll=${layout.rowScroll} pageOverflow=${layout.pageOverflow} wrap=${layout.rowWrap} items=${layout.suggestionCount}`);

// 底部固定导航不得压住输入框
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await sleep(800);
const overlap = await page.evaluate(() => {
  const input = document.querySelector('#native-chat-message')?.getBoundingClientRect();
  const navs = [...document.querySelectorAll('nav, div')].map((element) => ({ element, style: getComputedStyle(element), rect: element.getBoundingClientRect() }))
    .filter((entry) => entry.style.position === 'fixed' && entry.rect.top > window.innerHeight - 160 && entry.rect.height < 140);
  const nav = navs.at(-1)?.rect;
  if (!input || !nav) return { inputBottom: input?.bottom ?? null, navTop: nav?.top ?? null, overlap: 0 };
  return { inputBottom: Math.round(input.bottom), navTop: Math.round(nav.top), overlap: Math.max(0, Math.round(input.bottom - nav.top)) };
});
record('composer not covered by bottom nav', overlap.overlap <= 2, JSON.stringify(overlap));

// 真实用户原句 → 四层卡片
await page.type('#native-chat-message', 'saya mau kerja di retoran china, tolong bantu buat les untuk saya, boelh ya');
await page.evaluate(() => {
  const button = [...document.querySelectorAll('button')].find((item) => /^(Kirim)$/i.test((item.textContent || '').trim()));
  button?.click();
});
await sleep(15000);
const cards = await page.evaluate(() => {
  const buttons = [...document.querySelectorAll('button[aria-label^="Putar "]')];
  return buttons.map((button) => {
    const card = button.closest('div.rounded-xl');
    return {
      label: button.getAttribute('aria-label'),
      chinese: card?.querySelector('[lang="zh-CN"]')?.textContent || '',
      pinyin: card?.querySelectorAll('p')[1]?.textContent || '',
      meaning: card?.querySelectorAll('p')[2]?.textContent || '',
    };
  });
});
record('four-layer cards rendered', cards.length > 0 && cards.every((card) => card.chinese && card.pinyin && card.meaning),
  JSON.stringify(cards.slice(0, 2)));
record('no technical debug footer (token/model/cost)', !/token|model_used|karakter tertagih|TTS aktual/i.test(await page.evaluate(() => document.body.innerText)), 'checked page text');

// 播放按钮点击 → 音频请求成功
const audio = await page.evaluate(async () => {
  const button = document.querySelector('button[aria-label^="Putar "]');
  if (!button) return { clicked: false };
  button.click();
  await new Promise((resolve) => setTimeout(resolve, 6000));
  return { clicked: true, alert: document.querySelector('[role="alert"]')?.textContent || '' };
});
record('play button triggers zh-CN audio (no error surfaced)', audio.clicked && !/belum tersedia|gagal/i.test(audio.alert || ''), JSON.stringify(audio));

await page.screenshot({ path: 'results/native-v2-ui/native-chat-mobile.png', fullPage: true });
await browser.close();

const result = { url, executedAt: new Date().toISOString(), checks, cards, layout };
writeFileSync('results/native-v2-ui/ui-check.json', JSON.stringify(result, null, 2), 'utf8');
console.log(`\n== ${checks.filter((check) => check.passed).length}/${checks.length} UI checks passed ==`);
