// 真实浏览器端到端验收：登录页可用性 → Preview 验收会话 → AI 中文教练发消息 → 收到回复 → 移动端
// 用法：node scripts/verify-login-smoke-preview.mjs https://<deployment> [--mobile]
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire('C:/Users/lijia/WorkBuddy/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration/');
const puppeteer = require('C:/Users/lijia/WorkBuddy/2026-09-12-20-25-07/node_modules/puppeteer-core');

const DEPLOY = process.argv[2];
const MOBILE = process.argv.includes('--mobile');
const BYPASS = process.env.VERCEL_BYPASS_TOKEN || '';
const OUT_DIR = 'results/login-smoke';
mkdirSync(OUT_DIR, { recursive: true });

const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (!DEPLOY) throw new Error('missing deployment url');
  if (!BYPASS) throw new Error('missing VERCEL_BYPASS_TOKEN');
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  const width = MOBILE ? 390 : 1280;
  const height = MOBILE ? 844 : 900;
  await page.setViewport({ width, height, isMobile: MOBILE, hasTouch: MOBILE, deviceScaleFactor: MOBILE ? 3 : 1 });
  await page.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': BYPASS });
  const consoleErrors = [];
  page.on('pageerror', (error) => consoleErrors.push(String(error).slice(0, 200)));

  // 1. 登录页
  await page.goto(`${DEPLOY}/login`, { waitUntil: 'networkidle2', timeout: 60000 });
  const loginTitle = await page.title();
  const hasPhoneInput = await page.$('input[type="tel"], input[name="phone"], input[placeholder*="+62"]');
  check('登录页可打开且渲染手机号输入', Boolean(hasPhoneInput), loginTitle);
  await page.screenshot({ path: path.join(OUT_DIR, `01-login-${MOBILE ? 'mobile' : 'desktop'}.png`), fullPage: false });

  // 2. 真实登录错误提示（不泄漏任何凭据）：用非法号码验证服务端已连通
  const probe = await page.evaluate(async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone: '+628000000000', password: 'probe-not-a-password' }),
    });
    return { status: response.status, body: await response.json().catch(() => null) };
  });
  const probeServerOk = probe.status !== 503;
  check('登录接口已连接账号数据库（不再 503 未配置）', probeServerOk,
    `status=${probe.status} · ${probe.body?.error ?? ''}`);
  writeFileSync(path.join(OUT_DIR, 'login-probe.json'), JSON.stringify(probe, null, 2));

  // 3. Preview 验收会话入口
  const qaButton = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((button) => /验收|Preview QA/i.test(button.textContent || '')) || null);
  const qaFound = await qaButton.evaluate((el) => Boolean(el));
  check('登录页存在 Preview 验收入口按钮', qaFound);
  if (qaFound) {
    await qaButton.click();
    await page.waitForFunction(() => location.pathname.startsWith('/learn-chinese'), { timeout: 60000 });
    check('点击验收入口后进入学习首页', true, await page.evaluate(() => location.pathname));
  }

  // 4. 进入 AI 教练
  await page.goto(`${DEPLOY}/learn-chinese/ai-coach`, { waitUntil: 'networkidle2', timeout: 60000 });
  const coachBody = await page.evaluate(() => document.body.innerText.slice(0, 400));
  check('AI 教练页面渲染（含 Pelatih Mandarin AI）', /Pelatih Mandarin AI|AI 中文教练/.test(coachBody), coachBody.split('\n')[0] || '');
  await page.screenshot({ path: path.join(OUT_DIR, `02-coach-${MOBILE ? 'mobile' : 'desktop'}.png`), fullPage: false });

  // 5. 启动第一课
  const started = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button, a')];
    const target = buttons.find((el) => /Mulai|开始|Hari 1|Day 1/i.test(el.textContent || ''));
    if (!target) return false;
    target.click();
    return true;
  });
  check('AI 教练页可启动课程', started);
  await sleep(2500);
  await page.screenshot({ path: path.join(OUT_DIR, `03-lesson-${MOBILE ? 'mobile' : 'desktop'}.png`), fullPage: false });

  // 6. 通过真实页面内的 fetch 发送一条教练消息（复用页面同源 Cookie）
  const reply = await page.evaluate(async () => {
    const form = new FormData();
    form.set('sessionId', `coach-smoke-${Date.now().toString().slice(-6)}`);
    form.set('message', 'Saya kerja di restoran, saya waiter.');
    form.set('context', JSON.stringify({
      lessonId: 'mandarin-work-level-1-day-1', currentDay: 1, currentExpression: null, currentSkill: 'TEACH',
      conversationMode: 'COACH_CONVERSATION', userLevel: 'BEGINNER', learningGoal: '', recentMistakes: [],
      masteryState: [], reviewQueue: [], userInitiatedMemory: [], recentConversationSummary: '', recentTurns: [],
      messageCount: 1, miniCourse: null,
    }));
    const response = await fetch('/api/mandarin-coach/conversation', { method: 'POST', body: form });
    const body = await response.json().catch(() => null);
    return { status: response.status, body };
  });
  const answered = reply.status === 200 && typeof reply.body?.answer === 'string' && reply.body.answer.length > 10;
  check('登录会话下 AI 教练发消息并收到回复', answered,
    `status=${reply.status} · ${(reply.body?.chinese || reply.body?.answer || reply.body?.error || '').slice(0, 60)}`);
  check('回复含中文目标句与拆词', Boolean(reply.body?.targetChinese) && Array.isArray(reply.body?.wordBreakdown) && reply.body.wordBreakdown.length > 0,
    `${reply.body?.targetChinese || '-'} · ${reply.body?.wordBreakdown?.length || 0} 个词`);

  // 7. 横向溢出检查
  const overflow = await page.evaluate(() => ({
    docScroll: document.documentElement.scrollWidth,
    docClient: document.documentElement.clientWidth,
  }));
  check('页面无横向溢出', overflow.docScroll <= overflow.docClient + 1, `scroll=${overflow.docScroll} client=${overflow.docClient}`);
  check('无前端运行时异常', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));

  await page.screenshot({ path: path.join(OUT_DIR, `04-final-${MOBILE ? 'mobile' : 'desktop'}.png`), fullPage: false });
  await browser.close();

  const passed = checks.filter((c) => c.pass).length;
  writeFileSync(path.join(OUT_DIR, `login-smoke-${MOBILE ? 'mobile' : 'desktop'}.json`), JSON.stringify({ deploy: DEPLOY, mobile: MOBILE, passed, total: checks.length, checks }, null, 2));
  console.log(`\n${passed}/${checks.length} PASS`);
  if (passed !== checks.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error('SMOKE ERROR:', error.message);
  process.exitCode = 2;
});
