# Guest Mode（Mode Tamu）公开测试版 — 交付报告

日期：2026-10-24
分支：`feature/guest-mode-public-beta`（提交 `8a9b86c`）
部署：`https://indobrain-01-prd-prd-v0-1-q0tepukp8-lijian1.vercel.app`（原项目 `indobrain-01-prd-prd-v0-1` 的 Preview，未新建项目）
Production / main / Supabase schema：**均未改动**

---

## 1. 可直接转发 WhatsApp 的测试链接

```
https://indobrain-01-prd-prd-v0-1-q0tepukp8-lijian1.vercel.app/coba-gratis?x-vercel-protection-bypass=tjsf5ySGeoMx5sKLkRPeatqEmXsEtZWl&x-vercel-set-bypass-cookie=true
```

- 打开即印尼语欢迎页 → 点「Mulai Belajar Sekarang」→ 直接进 AI 中文教练，**不需要手机号、注册、密码**。
- 手机浏览器直接可用，无需安装 App。
- 链接里带的是 Vercel 平台的 **Deployment Protection 自动化 bypass token**（本项目 Preview 用）。首次打开会种一个 `_vercel_jwt` Cookie，之后站内跳转不再需要参数。
  - 这不是 IndoBrain 的应用凭据，也不含 Supabase / AI Gateway 密钥。
  - 但它确实能访问**本项目其它 Preview 部署**，请只发给本期测试者，用完可以在 Vercel 里轮换该 token（Project Settings → Deployment Protection → Protection Bypass for Automation）。

## 2. 访客可用功能（实测）

| 功能 | 结果 |
|---|---|
| 进入 AI 教练（Hari 1 课程） | ✅ |
| 连续 3 轮真实 Gemini 对话（印尼语提问 + 中文词提问） | ✅ 3/3 |
| 中文 TTS 语音播放（`/api/chinese-tts`） | ✅ 200，真实生成 + 命中缓存 |
| 拆词「Penjelasan kata」展开（欢迎/光临 + 拼音 + 释义） | ✅ aria-expanded=true，2 个词条 |
| 30 天课程（Level 2）内容 | ✅ 访客可见（配额单独限制） |
| 学习进度 | 存本机 localStorage，作用域 `guest-<匿名id>:ID_TO_ZH`，与正式账号隔离 |

## 3. 限额与安全机制

### 3.1 访客身份（不使用共享管理员账号）

- `POST /api/guest/session` 由**服务端**签发 HMAC 令牌：`<id>.<payloadB64>.<signature>`，载荷只有 `v/iat/exp/n` 四个数字字段，**无任何个人信息**。
- Cookie：`indobrain_guest_session`，`HttpOnly` + `SameSite=Lax` + `Secure`（生产构建下），12 小时有效。
- 匿名 id = `HMAC(令牌 id)`，仅用于统计去重，无法反推令牌。
- 服务端会话键 = `scope-sha256(匿名id + 客户端 sessionId)`，与账号会话键空间**不重叠**。
- 访客不写 Supabase，不建用户，不读取 Service Role Key（客户端的网络请求里没有任何密钥）。

### 3.2 限额（全部在服务端计数，浏览器无法伪造）

| 限制 | 默认值 | Preview 实测配置 |
|---|---|---|
| 单访客会话对话轮数 | 30 | **40**（`GUEST_MAX_CONVERSATIONS`） |
| 全站每日对话总预算（模型额度熔断） | 600 | **500**（`GUEST_DAILY_CONVERSATION_BUDGET`） |
| 全站每日新建会话数 | 300 | **200**（`GUEST_DAILY_SESSION_BUDGET`） |
| 同 IP 每日新建会话数 | 6 | **8**（`GUEST_IP_DAILY_SESSIONS`） |
| 会话有效期 | 12 h | 12 h |
| 语音发音评估 | 计入同一额度（STT 也耗额度） | — |

- 轮数计数**双写**：服务端内存（按实例）+ 令牌内签名计数（跨实例、不可篡改）。多实例下单个访客的额度在任何实例上都成立。
- 触发上限返回 429 + 印尼语文案，前端不崩。

### 3.3 内部 QA 绕过已关闭

原 `ENABLE_PREVIEW_QA` 在该项目 Preview 作用域是开着的（84 天前配置），意味着这台部署上 `/api/auth/preview-qa` 可无凭据拿会话、且**不受访客额度限制**。

已用代码级硬约束修掉（不依赖 env 作用域，因为 CLI 本地部署不带 git 分支元数据）：

```ts
// lib/account/preview-qa.ts
function guestDeploymentBlocksQa() {
  return process.env.GUEST_MODE_ENABLED === 'true' && process.env.PREVIEW_QA_ALLOW_ON_GUEST !== 'true';
}
```

实测：`POST /api/auth/preview-qa` → **404**；`POST /api/guest/session` → 200。

### 3.4 权限边界（实测）

| 检查 | 结果 |
|---|---|
| 浏览器 Cookie | 只有 `indobrain_guest_session`（+ Vercel 的 `_vercel_jwt`），**没有** `indobrain_account_session` |
| `GET /api/admin/users` | 401 |
| `GET /api/admin/stats` | 401 |
| 正式账号登录流程 | 未改（`/login`、`/api/auth/login` 原样） |

## 4. 测试结果

### 4.1 访客安全单测（本地纯逻辑，`scripts/verify-guest-mode-local.mjs`）

**18/18 PASS** — 覆盖签发/校验、载荷字段、篡改计数/签名/伪造 id 拒绝、过期拒绝、匿名 id 稳定不可反推、会话键解耦、IP 日上限、单会话轮数上限、全站预算熔断、统计字段无隐私、QA 自动关闭、Production 强制关闭。

### 4.2 无痕浏览器端到端（`scripts/verify-guest-incognito.mjs`）

全新 Chrome profile（无 Vercel 登录、无 IndoBrain 登录），390×844 移动视口，**18/18 PASS**：

```
PASS 分享链接无需 Vercel 登录即可打开
PASS 未跳转 Vercel 登录页
PASS 印尼语欢迎页突出「无需注册/密码」
PASS 存在「Mulai Belajar Sekarang」按钮
PASS 访客会话后直接进入 AI 教练页
PASS 选课成功（无需登录）
PASS 对话面板可打开且输入框可用
PASS 第 1/2/3 轮对话收到 AI 回复（3/3）
PASS 中文 TTS 播放接口 200（真实生成）
PASS 拆词面板可展开（aria-expanded + 中文词条 ≥2）
PASS 移动端无横向溢出（390/390）
PASS 无前端运行时异常
PASS 浏览器仅有访客 Cookie（无账号会话）
PASS 访客无权访问管理员接口（401）
PASS 访客无权访问运营统计接口（401）
```

截图：`results/guest-mode/incognito/01-welcome.png` … `06-breakdown.png`

### 4.3 构建

- `npx next build`：Compiled successfully，`/coba-gratis`、`/api/guest/session`、`/api/guest/metrics` 均生成。
- `npx tsc --noEmit`：0 错误。

## 5. 匿名统计

`GET /api/guest/metrics`（需 `GUEST_ADMIN_TOKEN`，未配置时 404），返回：

- 访客数：`sessionsTotal` / `sessionsToday` / `activeSessions`
- 对话轮数：`total` / `today` / `averagePerSession`
- 使用时长：`averageSessionSeconds` / `longestSessionSeconds`
- 错误率：`errors.total` / `errors.rate`
- 剩余额度：`remainingGlobalTurnsToday`

不采集手机号、姓名、IP 明文（IP 只存 sha256 前 24 位用于限流）、设备指纹、内容原文。
注：计数在 Serverless 实例内存中，多实例下为「按实例」统计；跨实例的准确值需接外部存储（本轮未做，避免动 Supabase schema）。

## 6. 已知边界 / 未做

1. **额度计数为实例级**：Vercel 多实例下全站日预算可能被多实例叠加放大（单访客额度因令牌内计数仍准确）。要精确，需要 Redis/KV 或 Supabase 表（本轮按约束未动 schema）。
2. **链接携带 Vercel bypass token**：见 §1 说明；替代方案（Password Protection）需要改项目保护策略，未擅自操作。
3. **未做自助删除数据入口**：访客数据只在本机 localStorage，清浏览器数据即清除。
4. **未做注册/会员/支付**：按「最小可用版本」要求。

## 7. 变更新增的环境变量（Preview 作用域，均非密钥明文外泄）

`GUEST_MODE_ENABLED=true`、`GUEST_SESSION_SECRET`（随机 32 字节，仅服务端）、`GUEST_MAX_CONVERSATIONS=40`、`GUEST_DAILY_CONVERSATION_BUDGET=500`、`GUEST_DAILY_SESSION_BUDGET=200`、`GUEST_IP_DAILY_SESSIONS=8`。

> `ENABLE_PREVIEW_QA` 的分支级覆盖因 CLI 部署不带 git 元数据未生效，已改为代码级约束，未改动该变量的全局值（不影响其它 Preview 分支）。
