# 登录阻塞（P0）修复与验证报告

日期：2026-10-23（会话时间线）
范围：仅在 Vercel **Preview** 环境修复与验证；未改动 Production 部署、未改 `main`、未改 Supabase 表结构、未新建认证系统、未新增/轮换任何密钥。

---

## 1. 根因（一句话）

**不是代码回归，是部署目标选错**：之前的新版 Preview 部署在新建项目 `indobrain-v12-rc2-integration` 上，该项目**没有任何环境变量**，导致 `lib/account/repository.ts` 的 `environment()` 抛出 `ACCOUNT_DATABASE_NOT_CONFIGURED`，被 `/api/auth/login` 的兜底分支统一改写成误导性的文案 `Account login is not configured yet.`（HTTP 503）。

- 真实错误链：`stage=login-lock:read` → `getLoginLock()` → `environment()` → 缺 `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY`
- 该项目全部历史部署（含 `piwfky21g`）都返回同一错误 ⇒ 与本次集成分支改动无关。
- 旧项目 `indobrain-01-prd-prd-v0-1` 登录一直正常 ⇒ 变量与 Supabase 实例本身健康。

## 2. 修复方式（未新增任何变量）

把当前分支 `cc64e4b`（含 P1 拆词 + 5 项 P0 教学修复）部署到**原项目** `indobrain-01-prd-prd-v0-1` 的 **Preview** 环境，复用该项目已存在的 Preview 作用域配置：

| 变量 | 作用域 | 状态 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Preview | 已有，复用 |
| `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Preview | 已有，复用 |
| `AUTH_REQUIRED` | Preview | 已有，复用 |
| `PREVIEW_QA_SESSION_SECRET` / `ENABLE_PREVIEW_QA` | Preview | 已有，复用 |
| `AZURE_SPEECH_KEY` / `AZURE_SPEECH_REGION` | Preview | 已有，复用 |
| `INITIAL_STUDENT_PASSWORD` | Preview（仅 2 个旧分支） | 未复用到本分支，不影响登录 |

**结论：不需要你提供任何 Supabase 密钥，也不需要新增变量。**

## 3. 交付链接

```
https://indobrain-01-prd-prd-v0-1-3r3lj9yq1-lijian1.vercel.app
```

- 部署 ID：`dpl_GSWnpsksh4GK3w8eNQD5aPSxpBm3`
- 状态：READY（build 47s）
- 登录页：`/login`

### ⚠️ 一个必读前提

该 Preview 部署挂了 **Vercel Deployment Protection**（团队 SSO）。你直接打开链接会先看到 Vercel 登录页，这是**平台侧访问保护**，不是 IndoBrain 的账号登录，也不是本次故障。

解决方式（任选其一，我不擅自改动项目设置）：
1. 用**已登录 Vercel 的同一浏览器**打开 —— 会自动穿过保护层；
2. 或由我给出一次性分享链接（`--share` 形式，带临时 token）；
3. 或你在 Vercel 项目设置里把 Deployment Protection 改成 Vercel Authentication: Standard Protection 以外的策略。

## 4. 实际验证结果（不是推断，是跑过的）

### 4.1 登录接口连通性
```
POST /api/auth/login  {phone:+628000000000, password:probe-not-a-password}
→ 401  {"error":"Phone number or password is incorrect."}
```
**401 而不是 503** ⇒ 账号数据库已连通，`Account login is not configured yet.` 已消失。

### 4.2 真实浏览器端到端（Chrome headless，脚本 `scripts/verify-login-smoke-preview.mjs`）

桌面 1280×900 与移动 390×844 各 10 项，全部 PASS：

| 检查 | 桌面 | 移动 |
|---|---|---|
| 登录页可打开且渲染手机号输入 | PASS | PASS |
| 登录接口已连数据库（401 而非 503） | PASS | PASS |
| 存在 Preview 验收入口按钮 | PASS | PASS |
| 点击后进入 `/learn-chinese` | PASS | PASS |
| AI 教练页渲染 | PASS | PASS |
| 可启动课程 | PASS | PASS |
| 会话下发消息 → 收到回复（`欢迎光临`） | PASS | PASS |
| 回复含目标句 + 拆词（2 个词） | PASS | PASS |
| 无横向溢出（1280/1280、390/390） | PASS | PASS |
| 无前端运行时异常 | PASS | PASS |

截图：`results/login-smoke/01-login-*.png`、`02-coach-*.png`、`03-lesson-*.png`、`04-final-*.png`

### 4.3 真实模型链路（Vercel 内部 curl，绕过 SSO）
```
POST /api/mandarin-coach/conversation
→ 200，model_used = mandarin-coach-brain-v0.1 → google/gemini-2.5-flash
  chinese=欢迎光临  pinyin=huān yíng guāng lín
  wordBreakdown=[欢迎 huān yíng / 光临 guāng lín]
  latency 3361ms，structured_retries=0，safe_fallbacks=0
```
说明最新代码（P1 拆词 + P0 修复）确实在该部署上生效，且真实 Gemini 调用正常。

## 5. 你实际登录时可能遇到的两种情况

| 现象 | 原因 | 处理 |
|---|---|---|
| 先跳 Vercel 登录页 | 平台访问保护 | 用已登录 Vercel 的浏览器打开，或找我要分享链接 |
| 输入手机号后提示 `Phone number or password is incorrect.` | 账号不在该 Preview 指向的库里 / 密码不对 | 这是**真实校验结果**，说明链路已通；提供手机号可在不暴露密码的前提下重置 |

> 说明：我没有你的真实账号密码，因此无法替你做「输入正确账号密码」那一步。「登录成功 → 进入 AI 教练 → 发消息 → 收到回复」这一段，我是用项目自带的 **Preview 验收会话**（不创建账号、不写数据）在同一部署、同一套页面代码上跑通并截图取证的。

## 6. 遗留 / 可选收尾

1. `/api/auth/login` 兜底文案误导（把任何异常都说成「未配置」）——建议后续改成区分 `ACCOUNT_DATABASE_NOT_CONFIGURED` 与其它异常，本次未改（不在 P0 范围）。
2. 新项目 `indobrain-v12-rc2-integration` 若继续使用，需要补 Preview 作用域变量（仅上述 Supabase 两项必需），否则会重现同一问题。
3. 部署保护策略是否对齐到「任何人可访问」由你决定；本次未动项目设置。
