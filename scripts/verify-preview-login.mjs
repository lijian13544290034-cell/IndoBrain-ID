// Preview 登录可用性验证（接口 200 不等于能登录，必须真的建立会话）
// 用法：node scripts/verify-preview-login.mjs <deployment-url> [out.json]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CLI = process.execPath;
const CLI_JS = 'C:/Users/lijia/WorkBuddy/2026-10-18-21-29-22/.tools/vercel/node_modules/vercel/dist/vc.js';
const DEPLOY = process.argv[2];
const OUT = process.argv[3] || 'results/preview-login.json';
if (!DEPLOY) {
  console.error('usage: node scripts/verify-preview-login.mjs <deployment-url> [out.json]');
  process.exit(2);
}

const jar = join(mkdtempSync(join(tmpdir(), 'ib-cookie-')), 'cookies.txt');

function run(path, extra = []) {
  try {
    return execFileSync(CLI, [CLI_JS, 'curl', path, '--deployment', DEPLOY, '-s', ...extra], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (error) {
    return String(error.stdout || '');
  }
}

/** 代理会先回一条 "200 Connection Established"，取最后一条真实 HTTP 状态。 */
function parseHeaders(raw) {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const httpLines = lines.filter((l) => /^HTTP\/\d/.test(l) && !/Connection Established/i.test(l));
  const last = httpLines[httpLines.length - 1] || '';
  const status = Number(last.split(' ')[1]) || 0;
  const location = (lines.find((l) => /^location:/i.test(l)) || '').replace(/^location:\s*/i, '');
  const setCookie = lines.filter((l) => /^set-cookie:/i.test(l));
  return { status, location, setCookie };
}

const results = [];

// 1) Preview QA 登录入口：给评审用的免密会话
const qaHeaders = parseHeaders(run('api/auth/preview-qa', ['-D', '-', '-o', '/dev/null', '-c', jar]));
results.push({
  check: 'Preview QA 登录入口（免密评审会话）',
  pass: (qaHeaders.status === 307 || qaHeaders.status === 302) && qaHeaders.setCookie.length > 0,
  detail: `status=${qaHeaders.status} setCookie=${qaHeaders.setCookie.length} location=${qaHeaders.location}`,
});

// 2) 登录页可打开（排除被 Vercel SSO 拦截）
const loginBody = run('login');
results.push({
  check: '登录页可打开（绕过 Deployment Protection）',
  pass: loginBody.length > 2000 && !/Authentication Required/i.test(loginBody.slice(0, 300)),
  detail: `html_len=${loginBody.length}`,
});

// 3) 真实账号登录链路：错误密码必须得到「密码不对」，而不是配置缺失
const loginProbe = run('api/auth/login', [
  '-X', 'POST', '-H', 'Content-Type: application/json',
  '-d', JSON.stringify({ phone: '+628123456789', password: 'invalid-pass-123', deviceId: 'preview-login-probe' }),
]);
const credentialAnswered = /Phone number or password is incorrect|Too many failed|Terlalu banyak/i.test(loginProbe);
const configBroken = /SUPABASE|Missing environment|not configured|does not exist|fetch failed|ECONN/i.test(loginProbe);
results.push({
  check: '真实登录能连到账号库（错误密码被明确拒绝，非配置错误）',
  pass: credentialAnswered && !configBroken,
  detail: loginProbe.replace(/\s+/g, ' ').slice(0, 160),
});

// 4) /learn-chinese 是「刻意公开」的（Mandarin for Work V1 试水），记录为设计事实
const publicPage = parseHeaders(run('learn-chinese', ['-D', '-', '-o', '/dev/null']));
results.push({
  check: '/learn-chinese 公开可访问（代码中刻意的产品决策，非登录缺陷）',
  pass: publicPage.status === 200,
  detail: `status=${publicPage.status}`,
});

// 5) 受保护路由（ID_TO_ZH 学习区）未登录必须跳登录
const guarded = parseHeaders(run('chat', ['-D', '-', '-o', '/dev/null']));
results.push({
  check: '受保护路由 /chat 未登录时跳转登录页',
  pass: guarded.status >= 300 && guarded.status < 400 && /\/login/i.test(guarded.location),
  detail: `status=${guarded.status} location=${guarded.location}`,
});

// 6) Preview QA 会话的落地页（AI Coach 所在学习区）能打开
//    注意：/learn-chinese/* 在 proxy.ts 里是刻意公开的，所以这条只证明「评审入口可达」，
//    不能当成「登录成功」。真正的账号密码登录需要有效账号，脚本不会伪造。
const cookies = (() => {
  try { return readFileSync(jar, 'utf8'); } catch { return ''; }
})();
const coachHeaders = parseHeaders(run('learn-chinese/ai-coach', ['-D', '-', '-o', '/dev/null', '-b', jar]));
results.push({
  check: 'Preview QA 落地页 /learn-chinese/ai-coach 可达',
  pass: coachHeaders.status === 200,
  detail: `status=${coachHeaders.status} jar=${cookies.includes('indobrain_preview_qa') ? 'qa-session' : 'empty'}`,
});

const failed = results.filter((r) => !r.pass);
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.check}  — ${r.detail}`);
console.log(`\n结果: ${results.length - failed.length}/${results.length} 通过`);
writeFileSync(OUT, JSON.stringify({ deploy: DEPLOY, at: new Date().toISOString(), results }, null, 2));
if (failed.length) process.exitCode = 1;
