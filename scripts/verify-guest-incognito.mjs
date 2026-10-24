// 无痕访客端到端验收：全新 Chrome profile（不登录 Vercel / IndoBrain），
// 模拟真实印尼测试者：打开分享链接 → Mode Tamu → Mulai Belajar Sekarang → 选课 → 打开对话面板
// → 连续 3 轮真实 AI 对话 → 中文 TTS → 拆词 → 权限边界检查。
// 用法：node scripts/verify-guest-incognito.mjs <SHARE_URL>
import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire('C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration/package.json');
const puppeteer = require('C:/Users/lijia/WorkBuddy/2026-09-12-20-25-07/node_modules/puppeteer-core');

const DEPLOY = process.argv[2];
if (!DEPLOY) throw new Error('usage: node scripts/verify-guest-incognito.mjs <share-url>');
const root = 'C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration';
const OUT_DIR = path.join(root, 'results/guest-mode/incognito');
const PROFILE = path.join(tmpdir(), `ib-guest-profile-${Date.now()}`); // 系统临时目录，每轮唯一
const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickByText(page, pattern) {
  const handle = await page.evaluateHandle((source) => {
    const regex = new RegExp(source, 'i');
    return [...document.querySelectorAll('button, a')].find((el) => regex.test(el.textContent || '')) || null;
  }, pattern.source ?? String(pattern));
  const found = await handle.evaluate((el) => Boolean(el));
  if (!found) return false;
  await handle.evaluate((el) => el.click());
  return true;
}

async function bubbleCount(page) {
  return page.evaluate(() => {
    const region = document.querySelector('[aria-live="polite"]');
    return region ? region.querySelectorAll(':scope > div').length : 0;
  });
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    userDataDir: PROFILE, // 全新 profile：无 Vercel、无 IndoBrain 登录态
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required', '--lang=id-ID'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 200)));
  const ttsRequests = [];
  page.on('response', (res) => {
    if (res.url().includes('/api/chinese-tts')) ttsRequests.push({ status: res.status(), cache: res.headers()['x-indobrain-tts-cache'] || '' });
  });

  // 1. 打开分享链接（不带 bypass header，模拟外部测试者）
  const entry = DEPLOY.includes('/coba-gratis') ? DEPLOY : `${DEPLOY}/coba-gratis`;
  const status = await page.goto(entry, { waitUntil: 'networkidle2', timeout: 90000 }).then((r) => r.status()).catch(() => 0);
  check('分享链接无需 Vercel 登录即可打开', status === 200, `http=${status}`);
  const onVercelLogin = await page.evaluate(() => /Sign in to Vercel|vercel\.com\/login/i.test(document.body.innerText + location.href));
  check('未跳转 Vercel 登录页', !onVercelLogin);
  const bodyText = await page.evaluate(() => document.body.innerText);
  check('印尼语欢迎页突出「无需注册/密码」', /Tanpa daftar|tanpa nomor HP|tanpa kata sandi/i.test(bodyText));
  await page.screenshot({ path: path.join(OUT_DIR, '01-welcome.png') });

  // 2. 点击「Mulai Belajar Sekarang」→ 服务端建访客会话 → 进入 AI 教练
  check('存在「Mulai Belajar Sekarang」按钮', await clickByText(page, /Mulai Belajar Sekarang/));
  await page.waitForFunction(() => location.pathname.startsWith('/learn-chinese'), { timeout: 90000 }).catch(() => {});
  const pathname = await page.evaluate(() => location.pathname);
  check('访客会话后直接进入 AI 教练页', pathname === '/learn-chinese/ai-coach', pathname);
  await sleep(1200);
  await page.screenshot({ path: path.join(OUT_DIR, '02-coach-welcome.png') });

  // 3. 选一门课（Hari rencana 1 优先，回退到课程卡）
  const picked = await clickByText(page, /Hari rencana 1/)
    || await clickByText(page, /Kursus 30 Hari/)
    || await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')].filter((el) => /Hari|Topik|Restoran|Kafe|Hotel/.test(el.textContent || ''));
      if (!buttons.length) return false;
      buttons[0].click();
      return true;
    });
  check('选课成功（无需登录）', Boolean(picked));
  await sleep(1800);
  await page.screenshot({ path: path.join(OUT_DIR, '03-lesson.png') });

  // 4. 打开对话面板（默认收起 → 点 💬 Tanya AI Coach）
  const opened = await clickByText(page, /Tanya AI Coach/);
  await page.waitForSelector('#coach-question', { timeout: 60000 }).catch(() => {});
  const hasComposer = Boolean(await page.$('#coach-question'));
  check('对话面板可打开且输入框可用', hasComposer, `opened=${opened}`);

  // 5. 连续 3 轮真实 AI 对话
  const turns = [
    'Saya kerja di restoran, saya waiter.',
    'Apa artinya 欢迎光临?',
    'Bagaimana cara mengucapkannya dengan benar?',
  ];
  let answeredTurns = 0;
  const answers = [];
  for (const [index, message] of turns.entries()) {
    if (!hasComposer) break;
    const before = await bubbleCount(page);
    await page.evaluate(() => { const el = document.querySelector('#coach-question'); if (el) { el.focus(); el.value = ''; } });
    await page.type('#coach-question', message, { delay: 12 });
    const sent = await clickByText(page, /Kirim ke AI Coach/);
    if (!sent) { check(`第 ${index + 1} 轮发送`, false, '找不到发送按钮'); continue; }
    const answered = await page.waitForFunction(
      (prev) => {
        const region = document.querySelector('[aria-live="polite"]');
        const busy = /AI sedang menjawab/.test(document.body.innerText);
        return !busy && region && region.querySelectorAll(':scope > div').length > prev;
      },
      { timeout: 150000, polling: 1200 },
      before,
    ).then(() => true).catch(() => false);
    if (answered) {
      answeredTurns += 1;
      answers.push(await page.evaluate(() => {
        const region = document.querySelector('[aria-live="polite"]');
        const bubbles = region ? [...region.querySelectorAll(':scope > div')] : [];
        return bubbles.length ? bubbles[bubbles.length - 1].innerText.slice(0, 180) : '';
      }));
    }
    check(`第 ${index + 1} 轮对话收到 AI 回复`, answered, message);
    await page.screenshot({ path: path.join(OUT_DIR, `04-turn${index + 1}.png`) });
    await sleep(700);
  }
  check('完成连续 3 轮真实 AI 对话', answeredTurns === 3, `${answeredTurns}/3`);

  // 6. 中文 TTS
  const played = await clickByText(page, /Dengarkan jawaban|Mandarin/);
  await sleep(7000);
  const okTts = ttsRequests.filter((r) => r.status === 200);
  check('中文 TTS 播放接口 200', played && okTts.length > 0, `trigger=${played} req=${ttsRequests.length} ok=${okTts.length} ${okTts[0]?.cache || ''}`);
  await page.screenshot({ path: path.join(OUT_DIR, '05-tts.png') });

  // 7. 拆词面板（严格校验：点击后 aria-expanded=true 且出现按词拆分的中文条目）
  const breakdownClicked = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')].filter((el) => /Penjelasan kata/.test(el.textContent || ''));
    if (!buttons.length) return false;
    buttons[buttons.length - 1].click();
    return true;
  });
  await sleep(800);
  const breakdown = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')].filter((el) => /Penjelasan kata/.test(el.textContent || ''));
    if (!buttons.length) return { expanded: false, items: 0 };
    const target = buttons[buttons.length - 1];
    const expanded = target.getAttribute('aria-expanded') === 'true';
    const panel = target.parentElement;
    const listItems = panel ? panel.querySelectorAll('ul li') : [];
    const chineseItems = [...listItems].filter((li) => /[\u3400-\u9fff]/.test(li.textContent || '')).length;
    return { expanded, items: chineseItems };
  });
  check('拆词面板可展开（aria-expanded + 中文词条 ≥2）', breakdownClicked && breakdown.expanded && breakdown.items >= 2,
    `expanded=${breakdown.expanded} items=${breakdown.items}`);
  await page.screenshot({ path: path.join(OUT_DIR, '06-breakdown.png') });

  // 8. 页面健康
  const overflow = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
  check('移动端无横向溢出', overflow.s <= overflow.c + 1, `scroll=${overflow.s} client=${overflow.c}`);
  check('无前端运行时异常', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));

  // 9. 权限边界：只有访客 Cookie，没有账号会话；管理员接口被拒
  const cookies = await page.cookies();
  const names = cookies.map((c) => c.name);
  check('浏览器仅有访客 Cookie（无账号会话）', names.includes('indobrain_guest_session') && !names.includes('indobrain_account_session'), names.join(','));
  const adminStatus = await page.evaluate(async () => (await fetch('/api/admin/users')).status);
  check('访客无权访问管理员接口', adminStatus === 401 || adminStatus === 403 || adminStatus === 404, `status=${adminStatus}`);
  const statsStatus = await page.evaluate(async () => (await fetch('/api/admin/stats')).status);
  check('访客无权访问运营统计接口', statsStatus === 401 || statsStatus === 403 || statsStatus === 404, `status=${statsStatus}`);

  await browser.close();

  const passed = checks.filter((c) => c.pass).length;
  writeFileSync(path.join(OUT_DIR, 'incognito.json'), JSON.stringify({ deploy: DEPLOY, passed, total: checks.length, checks, answers, tts: ttsRequests }, null, 2));
  console.log(`\n${passed}/${checks.length} PASS`);
  if (passed !== checks.length) process.exitCode = 1;
}

main().catch((error) => { console.error('SMOKE ERROR:', error.message); process.exitCode = 2; });
