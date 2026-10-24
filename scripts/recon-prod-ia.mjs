// 生产站信息架构侦察（只读）
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration/package.json');
const puppeteer = require('C:/Users/lijia/WorkBuddy/2026-09-12-20-25-07/node_modules/puppeteer-core');
const PROD = 'https://www.indobrain.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-first-run', '--disable-extensions', '--mute-audio', '--window-size=1280,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const bad = [];
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().slice(0, 100)}`); });
  page.on('pageerror', (e) => bad.push('ERR ' + String(e).slice(0, 90)));

  await page.goto(PROD + '/learn-chinese', { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1200);
  const info = await page.evaluate(() => ({
    title: document.title,
    h1: [...document.querySelectorAll('h1,h2')].map((e) => e.textContent.trim()).slice(0, 8),
    links: [...document.querySelectorAll('a')].map((a) => a.getAttribute('href') + ' | ' + (a.textContent || '').trim().slice(0, 30)),
    buttons: [...document.querySelectorAll('button')].map((b) => (b.textContent || '').trim().slice(0, 30) + ' | aria-pressed=' + b.getAttribute('aria-pressed') + ' | disabled=' + b.disabled).slice(0, 30),
    lsKeys: Object.keys(localStorage),
    text: document.body.innerText.slice(0, 1200),
  }));
  console.log(JSON.stringify(info, null, 1));
  console.log('NET BAD:', bad.slice(0, 10));

  // 点「Lihat 30 hari」看日选择器
  const clicked = await page.evaluate(() => {
    const el = [...document.querySelectorAll('button, a')].find((e) => /Lihat 30 hari/i.test(e.textContent || ''));
    if (!el) return false;
    el.click(); return true;
  });
  await sleep(1500);
  const afterPicker = await page.evaluate(() => ({
    url: location.href,
    text: document.body.innerText.slice(0, 900),
    dayButtons: [...document.querySelectorAll('button, a')].map((e) => (e.textContent || '').trim()).filter((t) => /^(Hari|Day)\s*\d+/.test(t)).slice(0, 40),
  }));
  console.log('PICKER clicked=', clicked, JSON.stringify(afterPicker, null, 1));
  await page.screenshot({ path: 'C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration/results/prod-qa/shots/recon-picker.png', fullPage: false });

  for (const u of ['/learn-chinese/course', '/learn-chinese/favorites', '/learn-chinese/level-2', '/learn-chinese/review', '/learn-chinese/profile', '/learn-chinese/ai-coach']) {
    const r = await page.goto(PROD + u, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch((e) => null);
    console.log(u, r ? r.status() : 'ERR', page.url().replace(PROD, ''));
  }
  await browser.close();
})();
