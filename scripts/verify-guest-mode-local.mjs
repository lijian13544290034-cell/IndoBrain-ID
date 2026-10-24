// 访客模式本地纯逻辑验收（不依赖网络 / 不消耗模型额度）
// 覆盖：令牌签发与校验、篡改拒绝、过期拒绝、匿名 id 稳定性、限额计数、隐私字段
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration';
const tmp = path.join(root, '.tmp-guest');
const OUT = process.argv[2] || 'results/guest-mode/local.json';
const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`);
};

process.env.GUEST_MODE_ENABLED = 'true';
process.env.GUEST_SESSION_SECRET = 'local-test-secret-do-not-use-in-prod';
process.env.VERCEL_ENV = 'preview';
process.env.GUEST_MAX_CONVERSATIONS = '3';
process.env.GUEST_DAILY_CONVERSATION_BUDGET = '10';
process.env.GUEST_DAILY_SESSION_BUDGET = '50';
process.env.GUEST_IP_DAILY_SESSIONS = '2';

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const strip = (file, name) => {
  const src = readFileSync(path.join(root, file), 'utf8')
    .replace("import 'server-only';", '')
    .replace(/from '@\/lib\/account\/guest-mode'/g, "from './guest-mode.ts'")
    .replace(/from '@\/lib\/server\/guest-session'/g, "from './guest-session.ts'");
  writeFileSync(path.join(tmp, name), src);
};
strip('lib/account/guest-mode.ts', 'guest-mode.ts');
strip('lib/server/guest-session.ts', 'guest-session.ts');
strip('lib/server/guest-quota.ts', 'guest-quota.ts');
strip('lib/account/preview-qa.ts', 'preview-qa.ts');

const sessionMod = await import(`file://${path.join(tmp, 'guest-session.ts').replace(/\\/g, '/')}`);
const quotaMod = await import(`file://${path.join(tmp, 'guest-quota.ts').replace(/\\/g, '/')}`);
const modeMod = await import(`file://${path.join(tmp, 'guest-mode.ts').replace(/\\/g, '/')}`);

// 1. 签发 + 校验
const { token, session } = sessionMod.issueGuestToken();
const verified = sessionMod.verifyGuestToken(token);
check('访客令牌可签发并校验', Boolean(verified) && verified.id === session.id, `id 前缀=${token.slice(0, 6)}…`);

// 2. 载荷无个人信息
const payloadJson = Buffer.from(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
const payloadKeys = Object.keys(JSON.parse(payloadJson)).sort().join(',');
check('令牌载荷只含 v/iat/exp/n（无个人信息）', payloadKeys === 'exp,iat,n,v', payloadKeys);

// 3. 篡改拒绝（改计数）
const [id, , sig] = token.split('.');
const forgedPayload = Buffer.from(JSON.stringify({ v: 1, iat: Date.now(), exp: Date.now() + 3600_000, n: 0 })).toString('base64url');
check('篡改计数被签名拒绝', sessionMod.verifyGuestToken(`${id}.${forgedPayload}.${sig}`) === null);
check('篡改签名被拒绝', sessionMod.verifyGuestToken(`${id}.${token.split('.')[1]}.AAAA`) === null);
check('伪造访客 id 前缀被拒绝', sessionMod.verifyGuestToken(`hacker${token.slice(6)}`) === null);

// 4. 过期拒绝
process.env.GUEST_SESSION_TTL_SECONDS = '1';
const shortLived = sessionMod.issueGuestToken();
await new Promise((resolve) => setTimeout(resolve, 1200));
check('过期令牌被拒绝', sessionMod.verifyGuestToken(shortLived.token) === null);
delete process.env.GUEST_SESSION_TTL_SECONDS;

// 5. 匿名 id 稳定且不可反推
const a = sessionMod.anonymousGuestId(session.id);
const b = sessionMod.anonymousGuestId(session.id);
check('匿名 id 稳定且不含原始令牌', a === b && !a.includes(session.id) && a.startsWith('guest-'), a);

// 6. 会话作用域与账号作用域不同命名空间
const scoped = sessionMod.signedSessionId(session.id, 'coach-abc12345');
check('访客会话键与客户端 id 解耦', scoped.startsWith('scope-') && !scoped.includes('coach-abc12345'), scoped);

// 7. 限额：每 IP 每日 2 个会话
const ip = 'hashed-ip-1';
const first = quotaMod.registerGuestSession(ip);
const second = quotaMod.registerGuestSession(ip);
const third = quotaMod.registerGuestSession(ip);
check('同 IP 每日会话上限生效', first.allowed && second.allowed && !third.allowed && third.reason === 'IP_DAILY_LIMIT');

// 8. 限额：单会话轮数上限 3
const guestId = sessionMod.anonymousGuestId(session.id);
const t1 = quotaMod.consumeGuestTurn(guestId, 0);
const t2 = quotaMod.consumeGuestTurn(guestId, 1);
const t3 = quotaMod.consumeGuestTurn(guestId, 2);
const t4 = quotaMod.consumeGuestTurn(guestId, 3);
check('单会话轮数上限生效', t1.allowed && t2.allowed && t3.allowed && !t4.allowed && t4.reason === 'SESSION_TURN_LIMIT');

// 9. 全站日预算熔断（预算 10，已用 3）
let globalDenied = null;
for (let i = 0; i < 12; i += 1) {
  const result = quotaMod.consumeGuestTurn(`other-guest-${i}`, 0);
  if (!result.allowed) { globalDenied = result.reason; break; }
}
check('全站日对话预算熔断', globalDenied === 'GLOBAL_DAILY_BUDGET', String(globalDenied));

// 10. 统计快照字段（只含数量/轮数/时长/错误率）
const snapshot = quotaMod.guestMetricsSnapshot();
const required = ['guests', 'conversations', 'usage', 'errors', 'limits'];
check('统计快照含访客数/轮数/时长/错误率', required.every((key) => key in snapshot),
  `sessions=${snapshot.guests.sessionsTotal} · turns=${snapshot.conversations.total} · errRate=${snapshot.errors.rate}`);
const snapshotText = JSON.stringify(snapshot);
check('统计不含 IP / 手机号 / 设备指纹', !/1\.2\.3\.4|\+62|ip_address|device/i.test(snapshotText));
quotaMod.recordGuestError();
check('错误计数可累加', quotaMod.guestMetricsSnapshot().errors.total === 1);

// 11. 公开访客部署上内部 QA 绕过自动关闭
process.env.VERCEL_ENV = 'preview';
process.env.ENABLE_PREVIEW_QA = 'true';
process.env.PREVIEW_QA_SESSION_SECRET = process.env.GUEST_SESSION_SECRET;
process.env.GUEST_MODE_ENABLED = 'true';
delete process.env.PREVIEW_QA_ALLOW_ON_GUEST;
const { isPreviewQaEnabled } = await import(`file://${path.join(tmp, 'preview-qa.ts').replace(/\\/g, '/')}`);
check('公开访客部署上内部 QA 绕过自动关闭', isPreviewQaEnabled() === false);
process.env.PREVIEW_QA_ALLOW_ON_GUEST = 'true';
check('显式放行时 QA 可恢复（仅内部需要）', isPreviewQaEnabled() === true);
delete process.env.PREVIEW_QA_ALLOW_ON_GUEST;

// 12. 生产环境默认关闭
delete process.env.VERCEL_ENV;
process.env.VERCEL_ENV = 'production';
check('Production 强制关闭访客入口', modeMod.isGuestModeEnabled() === false);
process.env.VERCEL_ENV = 'preview';
check('Preview + 开关打开时可用', modeMod.isGuestModeEnabled() === true);

const passed = checks.filter((c) => c.pass).length;
mkdirSync(path.dirname(path.join(root, OUT)), { recursive: true });
writeFileSync(path.join(root, OUT), JSON.stringify({ passed, total: checks.length, checks }, null, 2));
rmSync(tmp, { recursive: true, force: true });
console.log(`\n${passed}/${checks.length} PASS · ${OUT}`);
if (passed !== checks.length) process.exitCode = 1;
