# 任务 B：学习卡片与用户体验 — 验证与优化报告

- 分支：`feature/coach-learning-ux`（基于最新共同基线 `4318ec1`，含 P1 拆词提交 `9636b79`）
- 日期：2026-10-22
- 范围遵守：仅前端组件 + 测试脚本；未推送、未部署、未改 Production/main/数据库/环境变量/核心教学引擎。

## 一、基线核对
- `9636b79`（拆词 Penjelasan kata）已推送到 `origin/codex/ai-coach-teaching-phase1d-g-smart-p0`，**不在 origin/main**。
- 其后远端还有 1 个验收测试提交 `4318ec1`（word-breakdown preview acceptance），故以 `4318ec1` 为最新共同基线建分支。

## 二、验证结果（脚本 `scripts/verify-taskB-offline.mjs`，15/15 通过，零模型调用）

| # | 任务 | 结论 |
|---|------|------|
| 1 | 教学卡片 汉字/拼音/印尼语/中文 TTS | ✅ 拼音/印尼语由脚本验证（26/26 预置句）；TTS 端点 `app/api/chinese-tts`、`app/api/tts` 均存在，卡片按 isChinese 正确路由（此前 Codex preview 已实测通过） |
| 2 | 拆词展开/收起、词语解释、移动端 | ✅ `WordBreakdownPanel` 纯前端、零网络调用、`aria-expanded` 可访问；Codex 已留 375px/390px 移动端截图验收 |
| 3 | 模型动态拆词质量（漏词/错拼音/不自然翻译） | ✅ 归一化防线有效：剔除无效项、限 8 词、防截断；预置 26 句覆盖完整无丢字；优先级 模型>预置>兜底 正确 |
| 4 | 收藏/进度/刷新保留 | ✅ 代码审查确认：localStorage scope 化 key，version 1-4 迁移，`expressions` 按 expression_id 合并（不丢外部已存项），事件订阅刷新 UI。注意：持久化在**浏览器本地**，跨设备不同步（如实报告，未擅自扩展） |
| 5 | 操作提示优化 | ✅ 已实现（见下） |

### 已知质量张力（记录，非阻塞）
1. **「不」变调标注不一致**：功能字表 `不=bù`（基调，不标变调），LEXICON `不够=bú gòu`（标变调）。分词「是不是」中 `不` 标 `bù`。教学影响小（初学者标基调是常见做法），但两套标准并存 → **给 Codex 评估统一**。
2. **轻声标注分散**：吗(ma)/了(le)/什么(me)/多少(shao)/桌子(zi)/要不要(bu) 等轻声音节无调号——拼音正确，验证脚本已按轻声规则放行。
3. Codex preview 验收唯一失败项 1.1 属**断言过严**（turn 1 实际教了「欢迎光临」，内容正确），非功能问题。

## 三、任务 5 改动（3 个组件，共 +3 行，纯提示文案）
1. `components/AiCoachRecorder.tsx`：空闲态常驻一行「Cara pakai: tekan 🎙️ → ucapkan → berhenti，AI 会检查」（录音中/错误时不显示，避免噪音）。
2. `components/MandarinAiCoachExperience.tsx`（TEACH 卡）：🔊/🐢 按钮下加提示——先听 → 点 Penjelasan kata 看逐词释义 → 按 🎙️ 跟读；不敢说可用「Simpan untuk review & lewati」或「Lanjut」。
3. `components/AiCoachConversation.tsx`：输入框上方固定提示——可打字或用 🎙️；点 🔊 Mandarin 听、Penjelasan kata 看拆词、🐢 Pelan 慢速。

文案与实际按钮 label 逐一核对（按钮真实文案为「Penjelasan kata · 拆词」，已对齐）。

## 四、给 Codex 的服务端记录（本任务未改 lib/server）
- 「不」变调：建议统一策略（全标基调 or LEXICON 内变调词保留、功能字补注 bú 变体）。
- `verify-taskB-offline.mjs` 运行需 stub `server-only`：已用 `scripts/taskb-hook.mjs` + `--import ./scripts/taskb-register.mjs`，未污染 package.json。
- 本地 node_modules 不完整（无 typescript），无法全量 `tsc --noEmit`；三处 JSX 改动为纯文本节点，建议 Codex 在完整环境复跑类型检查。

## 五、复跑命令
```
node --experimental-strip-types --import ./scripts/taskb-register.mjs scripts/verify-taskB-offline.mjs
```
