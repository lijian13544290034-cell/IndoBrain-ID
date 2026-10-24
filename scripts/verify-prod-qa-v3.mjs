// v3：进度语义、已学状态、TTS 播放状态、手机端点击目标
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration/package.json');
const puppeteer = require('C:/Users/lijia/WorkBuddy/2026-09-12-20-25-07/node_modules/puppeteer-core');

const ROOT = 'C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration';
const SHOT = path.join(ROOT, 'results', 'prod-qa', 'shots');
const PROD = 'https://www.indobrain.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rec = (id, name, ok, detail) => console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + detail : ''}`);
const text = (p) => p.evaluate(() => document.body.innerText);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-first-run', '--disable-extensions', '--mute-audio', '--window-size=1280,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 100)));

  await page.goto(PROD + '/learn-chinese', { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1200);

  // 1. TTS 播放中状态（按钮文案 Memutar）
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Dengarkan Mandarin/i.test(x.textContent || ''));
    b?.click();
  });
  let sawPlaying = false;
  for (let i = 0; i < 24; i += 1) {
    const label = await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => (b.textContent || '').trim()).find((t) => /^(Memutar|Memuat|Audio belum tersedia)/.test(t)) || '');
    if (label) { sawPlaying = label.includes('Memutar'); if (sawPlaying) break; }
    await sleep(250);
  }
  rec('T1', '朗读时出现播放中状态（Memutar）', sawPlaying, `playing=${sawPlaying}`);

  // 浏览器内直接量 TTS 字节（只读）
  const ttsBytes = await page.evaluate(async () => {
    const r = await fetch('/api/chinese-tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: '你好' }) });
    const b = await r.arrayBuffer();
    return { status: r.status, ct: r.headers.get('content-type'), bytes: b.byteLength };
  });
  rec('T2', 'TTS 接口返回真实音频', ttsBytes.status === 200 && /audio/.test(ttsBytes.ct || '') && ttsBytes.bytes > 1000, JSON.stringify(ttsBytes));

  // 2. Tandai dipelajari → ✓ Dipelajari + 持久化
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Tandai dipelajari/i.test(x.textContent || ''));
    b?.click();
  });
  await sleep(800);
  const learnedLabel = await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => (b.textContent || '').trim()).find((t) => /Dipelajari/.test(t)) || '');
  const profile1 = await page.evaluate(() => localStorage.getItem('mandarin-work-30d:profile:guest'));
  rec('P1', '标记已学 → 按钮变 ✓ Dipelajari', /✓/.test(learnedLabel), `label=${learnedLabel} profile=${(profile1 || '').slice(0, 120)}`);

  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(1300);
  const learnedAfterReload = await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => (b.textContent || '').trim()).filter((t) => /Dipelajari/.test(t)).length);
  rec('P2', '刷新后已学状态保持', learnedAfterReload >= 1, `count=${learnedAfterReload}`);

  // 3. Selesaikan Hari 1 → 进度 1/30
  const prog0 = (await text(page)).match(/(\d+)\/30 hari selesai/)?.[1];
  const solved = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Selesaikan Hari 1/i.test(x.textContent || ''));
    if (!b) return false; b.scrollIntoView({ block: 'center' }); b.click(); return true;
  });
  await sleep(1200);
  const t3 = await text(page);
  const prog1 = t3.match(/(\d+)\/30 hari selesai/)?.[1];
  rec('P3', '「Selesaikan Hari 1」→ 进度 +1', solved && Number(prog1) === Number(prog0) + 1, `${prog0} → ${prog1} (clicked=${solved})`);
  await page.screenshot({ path: path.join(SHOT, 'v3-after-complete.png') });

  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(1300);
  const prog2 = (await text(page)).match(/(\d+)\/30 hari selesai/)?.[1];
  rec('P4', '刷新后进度保持', prog2 === prog1, `${prog1} → ${prog2}`);

  // 4. 日选择器里 Day 1 是否显示已完成（绿色样式）
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Lihat 30 hari/i.test(x.textContent || ''));
    b?.click();
  });
  await sleep(700);
  const day1Class = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => (x.textContent || '').trim() === '1');
    return b ? b.className : '';
  });
  rec('P5', '日选择器标识已完成 Day 1', /emerald/.test(day1Class), day1Class.slice(-60));
  await page.screenshot({ path: path.join(SHOT, 'v3-picker-completed.png') });

  // 5. 刷新后仍停在 Day 1 / 显示已完成
  rec('P6', '页面无未捕获 JS 异常', errs.length === 0, errs.slice(0, 3).join(' | ') || 'none');
  await page.close();

  // 6. 手机端点击目标尺寸
  const m = await browser.newPage();
  await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await m.goto(PROD + '/learn-chinese', { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1200);
  const sizes = await m.evaluate(() => {
    const pick = (re) => {
      const el = [...document.querySelectorAll('button')].find((b) => re.test(b.textContent || ''));
      if (!el) return null; const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) };
    };
    return { listen: pick(/Dengarkan Mandarin/), fav: pick(/Favorit/), mark: pick(/Tandai dipelajari/), next: pick(/Hari berikutnya/) };
  });
  const tapOk = Object.values(sizes).filter(Boolean).every((s) => s.h >= 40);
  rec('M1', '手机端按钮高度 ≥40px（可点）', tapOk, JSON.stringify(sizes));
  await m.screenshot({ path: path.join(SHOT, 'mobile-04-buttons.png') });
  await m.close();
  await browser.close();
})();
