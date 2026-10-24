// IndoBrain 公共中文课程 — 只读验收 v2（对齐生产实际 IA）
// 生产: /learn-chinese = 30 天课程应用（Day 1-30 单页切换）; /learn-chinese/level-2 = Day 31-60 目录
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire('C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration/package.json');
const puppeteer = require('C:/Users/lijia/WorkBuddy/2026-09-12-20-25-07/node_modules/puppeteer-core');

const ROOT = 'C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration';
const OUT_DIR = path.join(ROOT, 'results', 'prod-qa');
const SHOT_DIR = path.join(OUT_DIR, 'shots');
const PROD = 'https://www.indobrain.app';
const QA = 'https://indobrain-01-prd-prd-v0-1-3r3lj9yq1-lijian1.vercel.app';
const BYPASS = 'tjsf5ySGeoMx5sKLkRPeatqEmXsEtZWl';

const findings = [];
const consoleErrors = [];
const netFails = [];
const checks = [];
const ttsLog = [];

function rec(id, name, ok, detail) { checks.push({ id, name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + detail : ''}`); }
function add(id, url, steps, actual, expected, severity, evidence) {
  findings.push({ id, url, steps, actual, expected, severity, evidence });
  console.log(`[${severity}] ${id}: ${actual}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const text = (page) => page.evaluate(() => document.body.innerText);

async function watch(page) {
  page.on('response', async (res) => {
    if (res.url().includes('/api/chinese-tts')) {
      let bytes = 0, ct = '';
      try { ct = res.headers()['content-type'] || ''; bytes = (await res.buffer()).length; } catch { /* ignore */ }
      ttsLog.push({ status: res.status(), contentType: ct, bytes, at: Date.now() });
    } else if (res.status() >= 400) {
      netFails.push(`${res.status()} ${res.url().slice(0, 110)}`);
    }
  });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 120)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('console: ' + m.text().slice(0, 120)); });
}
async function click(page, regex) {
  return page.evaluate((src) => {
    const re = new RegExp(src, 'i');
    const els = [...document.querySelectorAll('button, a')].filter((el) => re.test((el.textContent || '').trim()) || re.test(el.getAttribute('aria-label') || ''));
    if (!els.length) return false;
    els[0].scrollIntoView({ block: 'center' });
    els[0].click();
    return true;
  }, regex.source);
}
async function clickNth(page, regex, n) {
  return page.evaluate((src, idx) => {
    const re = new RegExp(src, 'i');
    const els = [...document.querySelectorAll('button')].filter((el) => re.test((el.textContent || '').trim()));
    if (els.length <= idx) return false;
    els[idx].scrollIntoView({ block: 'center' });
    els[idx].click();
    return true;
  }, regex.source, n);
}
async function overflow(page) {
  return page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
}

async function main() {
  mkdirSync(SHOT_DIR, { recursive: true });

  // ---------- 桌面 ----------
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-first-run', '--disable-extensions', '--mute-audio', '--window-size=1280,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await watch(page);

  // 1. 匿名入口
  const r1 = await page.goto(PROD + '/', { waitUntil: 'networkidle2', timeout: 45000 });
  rec('1.1', '匿名访问根域', /\/login/.test(page.url()), `${r1.status()} → ${page.url().replace(PROD, '')}`);
  await page.screenshot({ path: path.join(SHOT_DIR, '01-login.png') });

  await page.goto(PROD + '/learn-chinese', { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1200);
  const t1 = await text(page);
  const day1 = {
    entry: /30天工作中文/.test(t1) && /30 Hari Bisa Mandarin/.test(t1),
    hanzi: /你好/.test(t1),
    pinyin: /nǐ/.test(t1) && /hǎo/.test(t1),
    indonesian: /Halo\./.test(t1) && /Terima kasih/.test(t1),
    cards: await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /Dengarkan Mandarin/i.test(b.textContent || '')).length),
    coachEntry: /AI 中文教练/.test(t1),
  };
  rec('1.2', '匿名打开学习入口', day1.entry, JSON.stringify(day1));
  rec('1.3', 'Day 1 汉字/拼音/印尼语', day1.hanzi && day1.pinyin && day1.indonesian, `cards=${day1.cards}`);
  await page.screenshot({ path: path.join(SHOT_DIR, '02-day1.png') });

  // 2. TTS（Day 1 第一张卡）
  const before = ttsLog.length;
  await clickNth(page, /Dengarkan Mandarin/i, 0);
  await sleep(6000);
  const tts1 = ttsLog.slice(before).pop();
  const ttsOk1 = Boolean(tts1 && tts1.status === 200 && /audio/i.test(tts1.contentType) && tts1.bytes > 1000);
  rec('2.1', '中文朗读（Day 1）', ttsOk1, JSON.stringify(tts1 || null));
  if (!ttsOk1) add('TTS-1', `${PROD}/learn-chinese`, '点击 Day 1 第一张卡的「Dengarkan Mandarin」', `TTS 响应: ${JSON.stringify(tts1 || '无请求')}`, 'POST /api/chinese-tts 返回 200 audio/* 且字节 > 1KB', 'P1', 'shots/02-day1.png');

  // 3. 收藏 + 刷新持久
  const favBefore = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Favorit/i.test(x.textContent || ''));
    return b ? b.getAttribute('aria-pressed') : null;
  });
  await clickNth(page, /Favorit/i, 0);
  await sleep(700);
  const favAfter = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Favorit/i.test(x.textContent || ''));
    return b ? b.getAttribute('aria-pressed') : null;
  });
  const ls1 = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])));
  rec('3.1', '收藏切换', favBefore === 'false' && favAfter === 'true', `${favBefore}→${favAfter}; ls=${Object.keys(ls1).join(',')}`);
  if (!(favBefore === 'false' && favAfter === 'true')) add('FAV-1', `${PROD}/learn-chinese`, '点击第一张卡「☆ Favorit」', `aria-pressed ${favBefore}→${favAfter}`, '点击后变为已收藏（aria-pressed=true）', 'P1', 'shots/03-favorite.png');
  await page.screenshot({ path: path.join(SHOT_DIR, '03-favorite.png') });

  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(1300);
  const favReload = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Favorit/i.test(x.textContent || ''));
    return b ? b.getAttribute('aria-pressed') : null;
  });
  rec('3.2', '刷新后收藏保持', favReload === 'true', `aria-pressed=${favReload}`);
  if (favReload !== 'true') add('FAV-2', `${PROD}/learn-chinese`, '收藏后按 F5 刷新', `刷新后 aria-pressed=${favReload}`, '收藏状态保留', 'P1', 'shots/03-favorite.png');

  // 4. 标记已学 + 进度
  const progBefore = (await text(page)).match(/(\d+)\/30 hari selesai/)?.[1] ?? '?';
  await clickNth(page, /Tandai dipelajari/i, 0);
  await sleep(900);
  const t4 = await text(page);
  const progAfter = t4.match(/(\d+)\/30 hari selesai/)?.[1] ?? '?';
  rec('4.1', '标记已学 → 进度递增', progBefore !== progAfter, `${progBefore} → ${progAfter} /30`);
  await page.screenshot({ path: path.join(SHOT_DIR, '04-progress.png') });

  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(1300);
  const t4b = await text(page);
  const progReload = t4b.match(/(\d+)\/30 hari selesai/)?.[1] ?? '?';
  rec('4.2', '刷新后进度恢复', progReload === progAfter, `${progAfter} → ${progReload} /30`);
  if (progBefore === progAfter) add('PROG-1', `${PROD}/learn-chinese`, '点击「Tandai dipelajari」（已学）', `进度未变化: ${progBefore}/30`, '进度计数增加', 'P1', 'shots/04-progress.png');
  if (progReload !== progAfter) add('PROG-2', `${PROD}/learn-chinese`, '标记已学后刷新', `刷新后进度 ${progReload}/30（刷新前 ${progAfter}）`, '进度从本地恢复', 'P1', 'shots/04-progress.png');

  // 5. 下一课
  const nextClicked = await click(page, /Hari berikutnya/i);
  await sleep(1500);
  const t5 = await text(page);
  const atDay2 = /HARI 2\b/.test(t5);
  rec('5.1', '进入下一课', Boolean(nextClicked) && atDay2, nextClicked ? `HARI2=${atDay2}` : '未找到按钮');
  if (!nextClicked || !atDay2) add('NAV-1', `${PROD}/learn-chinese`, '点击「Hari berikutnya」', nextClicked ? '页面未切到 Day 2' : '未找到下一课按钮', '进入 Day 2', 'P1', 'shots/05-day2.png');
  await page.screenshot({ path: path.join(SHOT_DIR, '05-day2.png') });

  // 6. Day 15 / Day 30
  for (const day of [15, 30]) {
    await page.goto(PROD + '/learn-chinese', { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(1200);
    await click(page, /Lihat 30 hari|Tutup/i);
    await sleep(600);
    const picked = await page.evaluate((d) => {
      const b = [...document.querySelectorAll('button')].find((x) => (x.textContent || '').trim() === String(d));
      if (!b) return false;
      b.scrollIntoView({ block: 'center' }); b.click(); return true;
    }, day);
    await sleep(1500);
    const td = await text(page);
    const cd = {
      heading: new RegExp(`HARI ${day}\\b`).test(td),
      hanzi: /[\u3400-\u9fff]/.test(td),
      pinyin: /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(td),
      indo: /(Halo|saya|kamu|Terima|maaf|berapa|makan|kerja|tidak|bisa|tolong)/i.test(td),
      listen: /Dengarkan Mandarin|Dengarkan\b/.test(td),
    };
    rec(`6.${day}`, `Day ${day} 内容`, picked && cd.heading && cd.hanzi && cd.pinyin && cd.indo, JSON.stringify(cd));
    if (!(picked && cd.heading && cd.hanzi && cd.pinyin && cd.indo)) {
      add(`DAY-${day}`, `${PROD}/learn-chinese`, `点「Lihat 30 hari」→ 选 ${day}`, `picker=${picked} ${JSON.stringify(cd)}`, `HARI ${day} 标题 + 汉字 + 拼音 + 印尼语`, 'P1', `shots/06-day${day}.png`);
    }
    await page.screenshot({ path: path.join(SHOT_DIR, `06-day${day}.png`) });
    // TTS 在 Day 15
    if (day === 15) {
      const b4 = ttsLog.length;
      await clickNth(page, /Dengarkan Mandarin|^Dengarkan$/i, 0);
      await sleep(6000);
      const t15 = ttsLog.slice(b4).pop();
      rec('6.15-tts', 'Day 15 朗读', Boolean(t15 && t15.status === 200 && /audio/i.test(t15.contentType)), JSON.stringify(t15 || null));
    }
  }

  // 7. Level 2 门禁（匿名）
  await page.goto(PROD + '/learn-chinese/level-2', { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1000);
  const t7 = await text(page);
  const links7 = await page.evaluate(() => [...document.querySelectorAll('a')].map((a) => a.getAttribute('href')).filter((h) => /level-2\/\d+/.test(h || '')));
  const locked = /🔒|Login \+ akses|Masuk untuk Level 2/i.test(t7);
  rec('7.1', 'Level2 目录匿名锁定', locked && links7.length === 0, `locked=${locked} links=${links7.length}`);
  if (!locked || links7.length) add('L2-CAT', `${PROD}/learn-chinese/level-2`, '匿名打开 Level 2 目录', `locked=${locked}, 可点课程链接=${links7.length}`, '仅锁定卡片，无课程链接', 'P0', 'shots/07-level2.png');
  await page.screenshot({ path: path.join(SHOT_DIR, '07-level2.png') });

  for (const day of [31, 60]) {
    const rr = await page.goto(`${PROD}/learn-chinese/level-2/${day}`, { waitUntil: 'networkidle2', timeout: 45000 });
    const url = page.url();
    const tt = await text(page);
    const leaked = /[\u3400-\u9fff]{6,}/.test(tt) && !/Masuk|login/i.test(tt.slice(0, 800));
    rec(`7.${day}`, `匿名直开 Day ${day}`, /login/.test(url) && !leaked, `${rr.status()} → ${url.replace(PROD, '')} leaked=${leaked}`);
    if (!/login/.test(url) || leaked) add(`L2-${day}`, `${PROD}/learn-chinese/level-2/${day}`, `匿名直接访问 Day ${day}`, `URL=${url.replace(PROD, '')}, 正文泄漏=${leaked}`, '重定向登录且无受限正文', 'P0', `shots/07-level2-${day}.png`);
    await page.screenshot({ path: path.join(SHOT_DIR, `07-level2-${day}.png`) });
  }

  // 8. 404 路由记录（本次验收范围内不视为缺陷，仅记录 IA 差异）
  const r8 = await page.goto(PROD + '/learn-chinese/course?day=1', { waitUntil: 'domcontentloaded', timeout: 30000 });
  rec('8.1', '/learn-chinese/course 路由', r8.status() === 404, `status=${r8.status()}（该分支路由尚未上线，生产 IA 为单页课程）`);

  await page.close();

  // ---------- 手机端 ----------
  const m = await browser.newPage();
  await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await watch(m);
  await m.goto(PROD + '/learn-chinese', { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1200);
  const ov1 = await overflow(m);
  rec('9.1', '手机端学习入口无横向溢出', ov1.sw <= ov1.cw + 1, `${ov1.sw}/${ov1.cw}`);
  await m.screenshot({ path: path.join(SHOT_DIR, 'mobile-01-home.png'), fullPage: false });

  const bM = ttsLog.length;
  await clickNth(m, /Dengarkan Mandarin/i, 0);
  await sleep(6000);
  const ttsM = ttsLog.slice(bM).pop();
  const ttsOkM = Boolean(ttsM && ttsM.status === 200 && /audio/i.test(ttsM.contentType));
  rec('9.2', '手机端朗读', ttsOkM, JSON.stringify(ttsM || null));
  if (!ttsOkM) add('M-TTS', `${PROD}/learn-chinese (390px)`, '手机视口点「Dengarkan Mandarin」', `TTS=${JSON.stringify(ttsM || null)}`, '200 audio/*', 'P1', 'shots/mobile-01-home.png');

  // 手机端日选择器
  await click(m, /Lihat 30 hari/i);
  await sleep(700);
  const ov2 = await overflow(m);
  rec('9.3', '手机端日选择器无溢出', ov2.sw <= ov2.cw + 1, `${ov2.sw}/${ov2.cw}`);
  await m.screenshot({ path: path.join(SHOT_DIR, 'mobile-02-picker.png') });

  await m.goto(PROD + '/learn-chinese/level-2', { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(900);
  const ov3 = await overflow(m);
  rec('9.4', '手机端 Level2 目录无溢出', ov3.sw <= ov3.cw + 1, `${ov3.sw}/${ov3.cw}`);
  await m.screenshot({ path: path.join(SHOT_DIR, 'mobile-03-level2.png') });
  await m.close();

  // ---------- 授权测试环境（登录态检查） ----------
  const q = await browser.newPage();
  await q.setViewport({ width: 1280, height: 900 });
  await watch(q);
  let qaOk = false;
  try {
    await q.goto(`${QA}/learn-chinese?x-vercel-protection-bypass=${BYPASS}&x-vercel-set-bypass-cookie=true`, { waitUntil: 'networkidle2', timeout: 45000 });
    const qa = await q.goto(`${QA}/api/auth/preview-qa?next=/learn-chinese`, { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(1200);
    const qt = await text(q);
    qaOk = /30天工作中文|Kursus|AI 中文教练/.test(qt);
    rec('10.1', '授权测试会话可用', qaOk, `status=${qa.status()} url=${q.url().replace(QA, '')}`);
    if (qaOk) {
      await q.goto(`${QA}/learn-chinese/level-2`, { waitUntil: 'networkidle2', timeout: 45000 });
      await sleep(900);
      const linksQa = await q.evaluate(() => [...document.querySelectorAll('a')].map((a) => a.getAttribute('href')).filter((h) => /level-2\/\d+/.test(h || '')).length);
      const bodyQa = await text(q);
      const authorized = /Mulai Day 31|Buka pelajaran/.test(bodyQa);
      rec('10.2', '授权态 Level2 放行（现有设计）', authorized && linksQa > 0, `links=${linksQa} authorized=${authorized}`);
      await q.screenshot({ path: path.join(SHOT_DIR, 'qa-level2-authorized.png') });
      // 授权态打开 Day 31 正文
      const r31 = await q.goto(`${QA}/learn-chinese/level-2/31`, { waitUntil: 'networkidle2', timeout: 45000 });
      await sleep(1000);
      const t31 = await text(q);
      const hasBody = /[\u3400-\u9fff]{3,}/.test(t31);
      rec('10.3', '授权态 Day 31 正文可见', r31.status() === 200 && hasBody, `status=${r31.status()} body=${hasBody}`);
      await q.screenshot({ path: path.join(SHOT_DIR, 'qa-day31.png') });
    }
  } catch (e) {
    console.log('授权环境检查异常:', String(e).slice(0, 160));
  }
  await q.close();
  await browser.close();

  const summary = {
    testedAt: new Date().toISOString(),
    prod: PROD,
    checks,
    findings,
    p0: findings.filter((f) => f.severity === 'P0'),
    p1: findings.filter((f) => f.severity === 'P1'),
    p2: findings.filter((f) => f.severity === 'P2'),
    ttsLog,
    netFails: netFails.slice(0, 25),
    consoleErrors: [...new Set(consoleErrors)].slice(0, 20),
  };
  writeFileSync(path.join(OUT_DIR, 'summary-v2.json'), JSON.stringify(summary, null, 2));
  console.log(`\nP0=${summary.p0.length} P1=${summary.p1.length} P2=${summary.p2.length}`);
  console.log('unique console errors:', summary.consoleErrors);
  console.log('net fails:', [...new Set(netFails)].slice(0, 10));
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
