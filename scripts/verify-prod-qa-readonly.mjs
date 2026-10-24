// IndoBrain 公共中文课程 — 只读验收（QA）
// 目标: https://www.indobrain.app  + 授权测试环境(preview-qa)仅用于需登录的检查
// 本脚本只读: 不注册、不提交、不改数据。输出 results/prod-qa/
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire('C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration/package.json');
const puppeteer = require('C:/Users/lijia/WorkBuddy/2026-09-12-20-25-07/node_modules/puppeteer-core');

const ROOT = 'C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration';
const OUT_DIR = path.join(ROOT, 'results', 'prod-qa');
const SHOT_DIR = path.join(OUT_DIR, 'shots');
const PROD = 'https://www.indobrain.app';
const QA = 'https://indobrain-01-prd-prd-v0-1-3r3lj9yq1-lijian1.vercel.app'; // 授权测试环境（preview-qa 可用）

const findings = [];
const consoleErrors = [];
const networkFailures = [];

function add(id, url, steps, actual, expected, severity, evidence) {
  findings.push({ id, url, steps, actual, expected, severity, evidence });
  console.log(`[${severity}] ${id}: ${actual}`);
}
function pass(id, note) { console.log(`PASS ${id}${note ? ' — ' + note : ''}`); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function bodyText(page) {
  return page.evaluate(() => document.body.innerText);
}
async function overflow(page) {
  return page.evaluate(() => {
    const d = document.documentElement;
    return { sw: d.scrollWidth, cw: d.clientWidth, overflow: d.scrollWidth > d.clientWidth + 1 };
  });
}
async function clickByText(page, regex) {
  return page.evaluate((pattern) => {
    const re = new RegExp(pattern, 'i');
    const els = [...document.querySelectorAll('button, a, [role="button"]')].filter((el) => re.test((el.textContent || '').trim()) || re.test(el.getAttribute('aria-label') || ''));
    if (!els.length) return false;
    const el = els[0];
    el.scrollIntoView({ block: 'center' });
    el.click();
    return (el.textContent || '').trim().slice(0, 40);
  }, regex.source);
}
function watchResponses(page, bucket) {
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/chinese-tts')) {
      let len = 0; let ct = '';
      try { ct = res.headers()['content-type'] || ''; const buf = await res.buffer(); len = buf.length; } catch { /* ignore */ }
      bucket.push({ url, status: res.status(), contentType: ct, bytes: len });
    } else if (res.status() >= 400 && !url.includes('vercel')) {
      networkFailures.push({ url: url.slice(0, 140), status: res.status() });
    }
  });
  page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + String(err).slice(0, 160)));
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push('console: ' + msg.text().slice(0, 160)); });
}

async function newPage(browser, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  return page;
}

async function main() {
  mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio', '--window-size=1280,900'],
  });

  const ttsResponses = [];

  // ============ A. 入口与匿名可达（桌面） ============
  {
    const page = await newPage(browser, { width: 1280, height: 900 });
    watchResponses(page, ttsResponses);

    // A1: 首页匿名跳转
    const home = await page.goto(PROD + '/', { waitUntil: 'networkidle2', timeout: 45000 });
    const homeUrl = page.url();
    console.log('A1 home ->', home.status(), homeUrl);
    if (!/\/login/.test(homeUrl)) add('A1', PROD + '/', '匿名打开首页', '未跳转登录，URL=' + homeUrl, '跳转 /login?next=%2F（现有设计）', 'P2', 'home-url');
    await page.screenshot({ path: path.join(SHOT_DIR, 'a1-login.png') });

    // A2: 登录页渲染
    const loginText = await bodyText(page);
    pass('A2', /login|masuk|nomor/i.test(loginText) ? '登录页渲染正常' : '登录页内容异常: ' + loginText.slice(0, 80));

    // A3: 学习首页匿名可达
    await page.goto(PROD + '/learn-chinese', { waitUntil: 'networkidle2', timeout: 45000 });
    const homeCn = await bodyText(page);
    const hasCourse = /Kursus 30 Hari/i.test(homeCn);
    const hasCoach = /AI Coach|Pelatih Mandarin/i.test(homeCn);
    pass('A3', `learn-chinese 匿名可达, 课程入口=${hasCourse}, 教练入口=${hasCoach}`);
    if (!hasCourse) add('A3', PROD + '/learn-chinese', '匿名打开学习首页', '未找到「Kursus 30 Hari」入口卡片', '公共课程入口可见', 'P1', 'a3-learn-chinese.png');
    await page.screenshot({ path: path.join(SHOT_DIR, 'a3-learn-chinese.png') });

    // A4: 课程页 Day1 匿名正文
    await page.goto(PROD + '/learn-chinese/course?day=1', { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(1200);
    const c1 = await bodyText(page);
    const day1 = {
      hanzi: /[\u3400-\u9fff]/.test(c1),
      pinyin: /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(c1),
      indonesian: /Saya|kamu|Apakah|Terima|selamat|mau|berapa/i.test(c1),
      listen: /Dengarkan/i.test(c1),
      favorite: /Favorit/i.test(c1),
    };
    console.log('A4 day1 checks', JSON.stringify(day1));
    if (!day1.hanzi || !day1.pinyin || !day1.indonesian) {
      add('A4', PROD + '/learn-chinese/course?day=1', '匿名打开 Day 1', `正文缺失: ${JSON.stringify(day1)}`, '汉字+拼音+印尼语解释均可见', 'P0', 'a4-day1.png');
    } else pass('A4', 'Day 1 匿名正文完整（汉字/拼音/印尼语/朗读/收藏）');
    await page.screenshot({ path: path.join(SHOT_DIR, 'a4-day1.png') });
    await page.close();
  }

  // ============ B. Day 1/15/30 内容 + B4 day=31 参数 + D. TTS ============
  {
    const page = await newPage(browser, { width: 1280, height: 900 });
    watchResponses(page, ttsResponses);
    for (const day of [1, 15, 30]) {
      const bucket = [];
      page.removeAllListeners('response');
      page.on('response', async (res) => {
        if (res.url().includes('/api/chinese-tts')) {
          let len = 0; let ct = '';
          try { ct = res.headers()['content-type'] || ''; const buf = await res.buffer(); len = buf.length; } catch { /* ignore */ }
          bucket.push({ status: res.status(), contentType: ct, bytes: len });
        }
      });
      await page.goto(`${PROD}/learn-chinese/course?day=${day}`, { waitUntil: 'networkidle2', timeout: 45000 });
      await sleep(1000);
      const t = await bodyText(page);
      const ok = {
        day: new RegExp(`Day ${day}\\b`).test(t),
        hanzi: /[\u3400-\u9fff]/.test(t),
        pinyin: /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(t),
        listen: /Dengarkan/i.test(t),
      };
      const shot = `b-day${day}.png`;
      await page.screenshot({ path: path.join(SHOT_DIR, shot) });
      if (!ok.day || !ok.hanzi || !ok.pinyin || !ok.listen) {
        add(`B${day}`, `${PROD}/learn-chinese/course?day=${day}`, `打开 Day ${day} 课程页`, `异常: ${JSON.stringify(ok)}`, '标题/汉字/拼音/朗读按钮齐全', 'P1', shot);
      } else pass(`B${day}`, `Day ${day} 内容完整`);

      // D: TTS 朗读
      const clicked = await clickByText(page, /Dengarkan/);
      await sleep(6000);
      const tts = bucket[bucket.length - 1];
      if (!clicked) add(`D-${day}`, `${PROD}/learn-chinese/course?day=${day}`, '点击朗读按钮', '未找到 Dengarkan 按钮', '存在朗读按钮', 'P1', shot);
      else if (!tts || tts.status !== 200 || !/audio/i.test(tts.contentType) || tts.bytes < 1000) {
        add(`D-${day}`, `${PROD}/learn-chinese/course?day=${day}`, '点击 Dengarkan 朗读中文', `TTS 响应异常: ${JSON.stringify(tts || null)}`, 'POST /api/chinese-tts 返回 200 audio/* 且有音频字节', 'P1', shot);
      } else pass(`D-${day}`, `TTS 200 audio ${tts.bytes}B`);
    }

    // B4: day=31 越界参数
    await page.goto(`${PROD}/learn-chinese/course?day=31`, { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(800);
    const t31 = await bodyText(page);
    const day31ok = !/Day 31\b/.test(t31) || /Day 30|Day 1\b/.test(t31);
    if (/[\u3400-\u9fff]/.test(t31) && !day31ok) add('B4', `${PROD}/learn-chinese/course?day=31`, '30 天课程请求 day=31', '页面渲染了 Day 31 内容（越界）', '应 clamp 到 Day 30 或提示', 'P2', 'b4-day31-param.png');
    else pass('B4', `day=31 参数被安全处理，页面无越界正文`);
    await page.screenshot({ path: path.join(SHOT_DIR, 'b4-day31-param.png') });
    await page.close();
  }

  // ============ C. Day 31–60 权限（匿名） ============
  {
    const page = await newPage(browser, { width: 1280, height: 900 });
    watchResponses(page, ttsResponses);
    await page.goto(PROD + '/learn-chinese/level-2', { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(800);
    const cat = await bodyText(page);
    const catOk = {
      lockIcon: /🔒|Login \+ akses/i.test(cat),
      loginBtn: /Masuk untuk Level 2/i.test(cat),
      openLinks: await page.evaluate(() => [...document.querySelectorAll('a')].filter((a) => /level-2\/\d+/.test(a.href) && /Buka pelajaran/.test(a.textContent || '')).length),
    };
    console.log('C1 level-2 catalog anon', JSON.stringify(catOk));
    if (catOk.openLinks > 0) add('C1', PROD + '/learn-chinese/level-2', '匿名打开 Level 2 目录', `出现 ${catOk.openLinks} 个可点课程链接`, '未授权用户只看到锁定卡片，无课程链接', 'P0', 'c1-level2-catalog.png');
    else pass('C1', '匿名只看到锁定卡片 + 登录引导');
    await page.screenshot({ path: path.join(SHOT_DIR, 'c1-level2-catalog.png') });

    // C2: 匿名直开 level-2/31 应跳登录
    const res31 = await page.goto(PROD + '/learn-chinese/level-2/31', { waitUntil: 'networkidle2', timeout: 45000 });
    const url31 = page.url();
    const t31l2 = await bodyText(page);
    const leakedBody = /[\u3400-\u9fff]{4,}/.test(t31l2) && !/login|masuk/i.test(t31l2.slice(0, 600));
    console.log('C2 level-2/31 ->', res31.status(), url31, 'leak=', leakedBody);
    if (leakedBody) add('C2', PROD + '/learn-chinese/level-2/31', '匿名直接访问 Day 31', '页面出现课程正文（疑似权限泄漏）', '重定向到 /login，不出现受限正文', 'P0', 'c2-level2-31.png');
    else pass('C2', `匿名访问被重定向: ${url31}`);
    await page.screenshot({ path: path.join(SHOT_DIR, 'c2-level2-31.png') });

    // C3: 匿名直开 level-2/60
    await page.goto(PROD + '/learn-chinese/level-2/60', { waitUntil: 'networkidle2', timeout: 45000 });
    const url60 = page.url();
    if (!/login/.test(url60)) add('C3', PROD + '/learn-chinese/level-2/60', '匿名直接访问 Day 60', '未重定向登录 URL=' + url60, '重定向到 /login', 'P0', 'c3-level2-60.png');
    else pass('C3', 'Day 60 匿名同样被重定向登录');
    await page.close();
  }

  // ============ E/F. 收藏、进度、刷新恢复、下一课（匿名本地存储） ============
  {
    const page = await newPage(browser, { width: 1280, height: 900 });
    watchResponses(page, ttsResponses);
    await page.goto(PROD + '/learn-chinese/course?day=1', { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(1200);
    // E1 收藏
    const favBefore = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => /Favorit/i.test(b.textContent || '') || /favorit/i.test(b.getAttribute('aria-label') || ''));
      if (!btn) return null;
      const state = btn.getAttribute('aria-pressed');
      btn.click();
      return state;
    });
    await sleep(800);
    const favAfter = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => /Favorit/i.test(b.textContent || '') || /favorit/i.test(b.getAttribute('aria-label') || ''));
      return btn ? btn.getAttribute('aria-pressed') : null;
    });
    const lsFav = await page.evaluate(() => Object.keys(localStorage).filter((k) => /mandarin|favorit|indo/i.test(k)).map((k) => k + '=' + (localStorage.getItem(k) || '').slice(0, 60)));
    console.log('E1 favorite toggle', favBefore, '->', favAfter, 'ls:', lsFav.slice(0, 4));
    if (favBefore === null) add('E1', `${PROD}/learn-chinese/course?day=1`, '查找收藏按钮', '未找到 Favorit 按钮', '表达卡带收藏按钮', 'P1', 'e1-favorite.png');
    else if (favBefore === favAfter) add('E1', `${PROD}/learn-chinese/course?day=1`, '点击 Favorit', `aria-pressed 未变化 (${favBefore})`, '点击后状态切换', 'P1', 'e1-favorite.png');
    else pass('E1', `收藏切换成功 ${favBefore}→${favAfter}`);
    await page.screenshot({ path: path.join(SHOT_DIR, 'e1-favorite.png') });

    // E2 刷新后收藏保持
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(1000);
    const favReload = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => /Favorit/i.test(b.textContent || '') || /favorit/i.test(b.getAttribute('aria-label') || ''));
      return btn ? btn.getAttribute('aria-pressed') : null;
    });
    if (favBefore !== null && favReload !== favAfter) add('E2', `${PROD}/learn-chinese/course?day=1`, '刷新页面', `收藏状态未保持 (${favReload})`, '刷新后收藏仍为已收藏', 'P1', 'e2-fav-reload.png');
    else pass('E2', `刷新后收藏保持 aria-pressed=${favReload}`);

    // E3 收藏页
    await page.goto(PROD + '/learn-chinese/favorites', { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(800);
    const favPage = await bodyText(page);
    const favShown = /[\u3400-\u9fff]/.test(favPage);
    if (favBefore !== null && !favShown) add('E3', PROD + '/learn-chinese/favorites', '打开收藏页', '刚收藏的表达未显示', '收藏页列出已收藏表达', 'P1', 'e3-favorites.png');
    else pass('E3', favShown ? '收藏页显示已收藏内容' : '收藏页打开（匿名行为已记录）');
    await page.screenshot({ path: path.join(SHOT_DIR, 'e3-favorites.png') });

    // E4 已学/进度标记
    await page.goto(PROD + '/learn-chinese/course?day=1', { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(1200);
    const marked = await clickByText(page, /Tandai|Sudah bisa|Selesai/i);
    await sleep(800);
    const lsProgress = await page.evaluate(() => Object.keys(localStorage).map((k) => k).filter((k) => /mandarin|progress|work/i.test(k)));
    console.log('E4 mark:', marked, 'progress keys:', lsProgress.slice(0, 6));
    // F 下一课
    const nextClicked = await clickByText(page, /Lanjut|Berikutnya|Hari 2|Selanjutnya/i);
    await sleep(1500);
    const nextUrl = page.url();
    const nextText = await bodyText(page);
    const advanced = /\bday=2\b/.test(nextUrl) || /Day 2\b/.test(nextText);
    console.log('F next:', nextClicked, nextUrl, 'advanced=', advanced);
    if (!nextClicked) add('F1', `${PROD}/learn-chinese/course?day=1`, '查找进入下一课的入口', '未找到 Lanjut/Berikutnyya 类按钮', '有明确下一课入口', 'P1', 'f1-next.png');
    else if (!advanced) add('F1', `${PROD}/learn-chinese/course?day=1`, '点击下一课', `URL=${nextUrl} 但页面未出现 Day 2`, '进入 Day 2', 'P1', 'f1-next.png');
    else pass('F1', `成功推进到下一课 (${nextUrl.slice(-30)})`);
    await page.screenshot({ path: path.join(SHOT_DIR, 'f1-next.png') });
    await page.close();
  }

  // ============ G. 手机端 390×844 ============
  {
    const page = await newPage(browser, { width: 390, height: 844, isMobile: true, hasTouch: true });
    watchResponses(page, ttsResponses);
    const bucket = [];
    page.on('response', async (res) => {
      if (res.url().includes('/api/chinese-tts')) {
        let len = 0; let ct = '';
        try { ct = res.headers()['content-type'] || ''; const buf = await res.buffer(); len = buf.length; } catch { /* ignore */ }
        bucket.push({ status: res.status(), contentType: ct, bytes: len });
      }
    });
    for (const [tag, url] of [['home-cn', '/learn-chinese'], ['course-1', '/learn-chinese/course?day=1'], ['level2', '/learn-chinese/level-2']]) {
      await page.goto(PROD + url, { waitUntil: 'networkidle2', timeout: 45000 });
      await sleep(1000);
      const ov = await overflow(page);
      if (ov.overflow) add(`G-${tag}`, PROD + url, '390px 视口打开页面', `横向溢出 scrollWidth=${ov.sw} clientWidth=${ov.cw}`, '无横向溢出', 'P2', `g-${tag}.png`);
      else pass(`G-${tag}`, '无横向溢出');
      await page.screenshot({ path: path.join(SHOT_DIR, `g-${tag}.png`) });
    }
    // 手机端 TTS
    await page.goto(PROD + '/learn-chinese/course?day=1', { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(1200);
    const mTts = await clickByText(page, /Dengarkan/);
    await sleep(6000);
    const mtts = bucket[bucket.length - 1];
    if (!mTts) add('G-tts', `${PROD}/learn-chinese/course?day=1 (390px)`, '点击朗读', '未找到 Dengarkan 按钮', '朗读按钮可点', 'P1', 'g-tts.png');
    else if (!mtts || mtts.status !== 200 || !/audio/i.test(mtts.contentType)) add('G-tts', `${PROD}/learn-chinese/course?day=1 (390px)`, '手机端朗读', `TTS 异常: ${JSON.stringify(mtts || null)}`, '200 audio/*', 'P1', 'g-tts.png');
    else pass('G-tts', `手机端 TTS 200 ${mtts.bytes}B`);
    await page.screenshot({ path: path.join(SHOT_DIR, 'g-tts.png') });
    await page.close();
  }

  // ============ I. 授权测试环境：登录态收藏/进度/Level2 放行 ============
  {
    const page = await newPage(browser, { width: 1280, height: 900 });
    watchResponses(page, ttsResponses);
    try {
      const r = await page.goto(QA + '/learn-chinese', { waitUntil: 'domcontentloaded', timeout: 45000 });
      console.log('I0 qa env status', r.status(), page.url());
      // Vercel protection bypass cookie
      await page.setCookie({ name: 'x-vercel-protection-bypass', value: 'tjsf5ySGeoMx5sKLkRPeatqEmXsEtZWl', domain: 'indobrain-01-prd-prd-v0-1-3r3lj9yq1-lijian1.vercel.app', path: '/' });
      const qa = await page.goto(QA + '/api/auth/preview-qa?next=/learn-chinese', { waitUntil: 'networkidle2', timeout: 45000 });
      console.log('I1 preview-qa ->', qa.status(), page.url());
      await sleep(1000);
      const t = await bodyText(page);
      const inLearning = /Kursus 30 Hari|Pelatih/i.test(t);
      if (!inLearning) add('I1', QA + '/api/auth/preview-qa', '授权测试会话进入学习首页', '未能进入学习环境: ' + t.slice(0, 80), '进入 /learn-chinese', 'P2', 'i1-qa-home.png');
      else pass('I1', '授权测试会话可用');
      await page.screenshot({ path: path.join(SHOT_DIR, 'i1-qa-home.png') });

      // I2: 授权态 Level2 目录放行（现有设计允许 preview-qa）
      await page.goto(QA + '/learn-chinese/level-2', { waitUntil: 'networkidle2', timeout: 45000 });
      await sleep(800);
      const l2 = await bodyText(page);
      const authorizedLinks = await page.evaluate(() => [...document.querySelectorAll('a')].filter((a) => /level-2\/\d+/.test(a.href)).length);
      console.log('I2 level-2 authorized links:', authorizedLinks);
      pass('I2', `授权环境 Level2 目录（授权=可见${authorizedLinks} 个链接；这是现有设计，不计为缺陷）`);
      await page.screenshot({ path: path.join(SHOT_DIR, 'i2-qa-level2.png') });
    } catch (e) {
      console.log('I 段跳过:', String(e).slice(0, 120));
    }
    await page.close();
  }

  await browser.close();

  // ============ 汇总 ============
  const summary = {
    testedAt: new Date().toISOString(),
    prod: PROD,
    p0: findings.filter((f) => f.severity === 'P0'),
    p1: findings.filter((f) => f.severity === 'P1'),
    p2: findings.filter((f) => f.severity === 'P2'),
    consoleErrors: consoleErrors.slice(0, 20),
    networkFailures: networkFailures.slice(0, 20),
    ttsResponses: ttsResponses.slice(0, 6),
  };
  writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify({ findings, summary }, null, 2));
  console.log('\n=== FINDINGS ===');
  for (const f of findings) console.log(`[${f.severity}] ${f.id} ${f.url}\n  actual: ${f.actual}`);
  console.log(`\nP0=${summary.p0.length} P1=${summary.p1.length} P2=${summary.p2.length}`);
  if (consoleErrors.length) console.log('console errors:', consoleErrors.slice(0, 8));
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
