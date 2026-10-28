import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/lijia/WorkBuddy/2026-09-12-20-25-07/node_modules/puppeteer-core');
const BASE = process.argv[2];
const BYPASS = process.env.VERCEL_PROTECTION_BYPASS || '';
const OIDC = process.env.VERCEL_OIDC_TOKEN || '';
if (!BASE) throw new Error('usage: node scripts/verify-native-coach-inline-tts-ui.mjs <baseUrl>');

const path = '/coba-gratis/native-coach-v1';
const url = `${BASE}${path}${BYPASS ? `?x-vercel-protection-bypass=${BYPASS}&x-vercel-set-bypass-cookie=true` : ''}`;
const outputDir = 'results/native-coach-inline-tts';
mkdirSync(outputDir, { recursive: true });
const checks = [];
const record = (name, passed, evidence) => {
  checks.push({ name, passed, evidence });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name} :: ${evidence}`);
};

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

async function verifyViewport(name, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  if (OIDC) await page.setExtraHTTPHeaders({ 'x-vercel-trusted-oidc-idp-token': OIDC });
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('indobrain:native-coach:v1', JSON.stringify({
      version: 1,
      turns: [{
        id: 'inline-tts-fixture',
        role: 'assistant',
        text: 'Istilah 分酒器 artinya decanter. Bos bilang 明天早点来。 Kalau tidak bisa, jawab 不好意思，我不能早到。 你好！请问您要去哪里？ Contoh lain: 小明爱我。',
        chinese: [{ text: '小明爱我', pinyin: 'Xiǎomíng ài wǒ', indonesian: 'Xiao Ming mencintaiku.' }],
        breakdowns: {
          小明爱我: {
            sentence: '小明爱我', pinyin: 'Xiǎomíng ài wǒ', indonesian: 'Xiao Ming mencintaiku',
            words: [
              { text: '小明', pinyin: 'Xiǎomíng', indonesian: 'Xiao Ming (nama orang)' },
              { text: '爱', pinyin: 'ài', indonesian: 'cinta, sayang' },
              { text: '我', pinyin: 'wǒ', indonesian: 'saya, aku' },
            ],
          },
        },
        streaming: false,
      }],
    }));
  });
  const ttsResponses = [];
  page.on('response', async (response) => {
    if (!response.url().includes('/api/chinese-tts')) return;
    ttsResponses.push({
      status: response.status(),
      contentType: response.headers()['content-type'] || '',
      voice: response.headers()['x-indobrain-chinese-tts-voice'] || '',
      cache: response.headers()['x-indobrain-tts-cache'] || '',
    });
  });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForSelector('button', { timeout: 15_000 });
  await new Promise((resolve) => setTimeout(resolve, 1_500));
  const started = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((item) => /Mulai ngobrol/i.test(item.textContent || ''));
    button?.click();
    return Boolean(button);
  });
  if (started) {
    await page.waitForSelector('#native-coach-message', { timeout: 15_000 });
  }

  const inline = await page.$$eval('button[aria-label^="Dengarkan Mandarin:"]', (buttons) => buttons.map((button) => ({
    text: button.textContent,
    display: getComputedStyle(button).display,
    maxWidth: getComputedStyle(button).maxWidth,
    whiteSpace: getComputedStyle(button).whiteSpace,
    verticalAlign: getComputedStyle(button).verticalAlign,
    width: button.getBoundingClientRect().width,
  })));
  record(`${name}: embedded, word and multi-sentence fragments`,
    inline.map((item) => item.text).join('|') === '分酒器|明天早点来。|不好意思，我不能早到。|你好！|请问您要去哪里？|小明爱我。',
    inline.map((item) => item.text).join('|'));
  record(`${name}: inline style does not overflow`,
    inline.every((item) => item.display === 'inline-block' && item.maxWidth === '100%' && item.whiteSpace === 'normal' && item.verticalAlign === 'baseline')
      && await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    JSON.stringify(inline));
  const breakdownUi = await page.evaluate(() => ({
    actionCount: [...document.querySelectorAll('button')]
      .filter((button) => button.textContent?.trim() === 'Arti per kata').length,
    hasChineseControl: document.body.innerText.includes('拆词'),
  }));
  record(`${name}: one on-demand breakdown entry without fragment button row`,
    breakdownUi.actionCount === 1 && !breakdownUi.hasChineseControl,
    JSON.stringify(breakdownUi));
  const breakdown = await page.$$eval('details', (items) => items.map((item) => item.innerText));
  record(`${name}: natural word breakdown remains compact and complete`,
    breakdown.length === 1 && /小明[\s\S]*爱[\s\S]*我/u.test(breakdown[0])
      && await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    breakdown.join(' | ').slice(0, 300));

  const clickAndFinish = async (selector) => {
    await page.waitForFunction((value) => {
      const button = document.querySelector(value);
      return button instanceof HTMLButtonElement && !button.disabled;
    }, { timeout: 15_000 }, selector);
    const previous = ttsResponses.length;
    await page.click(selector);
    const deadline = Date.now() + 15_000;
    while (ttsResponses.length === previous && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await page.waitForFunction((value) => {
      const button = document.querySelector(value);
      return button instanceof HTMLButtonElement && !button.disabled;
    }, { timeout: 15_000 }, selector);
  };
  await clickAndFinish('button[aria-label="Dengarkan Mandarin: 分酒器"]');
  await clickAndFinish('button[aria-label="Dengarkan Mandarin: 分酒器"]');
  await clickAndFinish('button[aria-label="Dengarkan Mandarin: 明天早点来。"]');
  await clickAndFinish('button[aria-label="Dengarkan 小明爱我"]');
  await clickAndFinish('button[aria-label="Dengarkan 小明"]');
  await clickAndFinish('button[aria-label="Dengarkan 爱"]');
  await clickAndFinish('button[aria-label="Dengarkan 我"]');

  record(`${name}: inline and card requests are valid zh-CN audio`,
    ttsResponses.length >= 4 && ttsResponses.every((item) => item.status === 200 && item.contentType.startsWith('audio/') && item.voice === 'zh-CN-XiaoxiaoNeural'),
    JSON.stringify(ttsResponses));
  record(`${name}: repeated exact fragment uses existing cache`,
    ttsResponses.slice(1).some((item) => item.cache === 'HIT'),
    ttsResponses.map((item) => item.cache).join(','));
  const lightError = await page.$eval('body', (body) => body.innerText.includes('Audio Mandarin belum tersedia'));
  record(`${name}: playback does not disturb normal reading`, !lightError, `ttsError=${lightError}`);

  await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: true });
  await page.close();
  return { name, inline, ttsResponses };
}

const mobile = await verifyViewport('mobile-390x844', { width: 390, height: 844, isMobile: true, hasTouch: true });
const desktop = await verifyViewport('desktop-1280x900', { width: 1280, height: 900 });
await browser.close();

const result = { url, executedAt: new Date().toISOString(), checks, mobile, desktop };
writeFileSync(`${outputDir}/ui-check.json`, JSON.stringify(result, null, 2));
const failed = checks.filter((item) => !item.passed);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length) process.exitCode = 1;
