# IndoBrain 印尼人学中文——日常高频词公共课程 内容 QA 报告

日期：2026-10-25 · 角色：内容质量与使用体验 QA（只读，未改 Production / 未改课程数据 / 未新增课程内容）
核对基准：仓库 `feature/guest-mode-public-beta`（HEAD 含 `6cdb28f`）实际文件状态；未采用任何未经核实的线索版本。

---

## A. 找到的内容及来源文件

**线索核实结果（重点）：**

| 线索 | 核实结果 |
|---|---|
| `IndoBrain_IDZH_public_core_100_draft.csv/json` | **不存在。** 已搜索：仓库全部文件、git 全部分支内容、`Documents/Codex` 全部会话目录（含 2026-10-24 最新工作副本）、`WorkBuddy` 工作区、Desktop/Documents/Downloads |
| 「100 条高频公共表达」 | **无对应文件或文档段落**。仓库内唯一的 "100" 是 `docs/ai-coach-phase0/.../ai-coach-cases-100.json`（AI Coach 测试用例，非课程内容） |
| 「10 个模块」 | **无对应划分**。V2 架构文档定义的是 3 个内容类型（Kosakata Penting / Kalimat Praktis / Situasi Singkat） |
| 「48 条职业表达草稿」 | **不存在**。`CN-CAREER-*` 仅出现在类型定义与校验脚本中，无任何草稿数据 |

**确实存在、可用的内容来源：**

1. `docs/BASIC_ESSENTIALS_REAL_USE_V1_GROUPS_01_39.md`（1701 行）+ `_40_93.md`（2265 行）—— 中国人学印尼语「基础必会」语料：**93 个学习组 / 633 个概念 / 279 条 Real Use 表达**（PHRASE 34 / SENTENCE 48 / MICRO_SCENE 11）。每条含印尼语原文 + 中文翻译。这是与「从中国人学印尼语反向转换」最接近的现有语料。
2. `docs/BASIC_ESSENTIALS_MICRO_SCENE_GROUP_MAP_V1.md` —— 93 组 ↔ 微场景映射审计（规划文档）。
3. **发布管线全部就绪但为空**：`schemas/mandarin-course-import-v1.schema.json`、`lib/mandarin-course-import-types.ts`（`PUBLIC_HIGH_FREQUENCY` / `CN-HF-*` ID 规则）、`scripts/validate-mandarin-course-import.mjs`（含与现有课程重复检测）、`lib/server/mandarin-v2-reviewed-packages.ts`（**故意为空的注册表**）、V2 运行时。实测：`verify-mandarin-course-import` PASS、`verify-mandarin-v2-runtime` PASS（"empty registry … no navigation activation"）。

## B. 实际表达数量、模块数量

- **可作为公共课程发布的表达：0 条；模块：0 个。** 注册表为空是架构文档明示的发布安全控制，不是遗漏。
- 最接近语料：279 条 / 93 组 / 633 概念（方向：印尼语→中文释义，无拼音）。

## C. 质量合格数量

- 现有 279 条语料的**翻译质量**：随机抽查 30 条全部自然、准确（如 `minyak goreng→食用油`、`Ini berapa?→这个多少钱？`、`Tolong bungkus ya→帮我打包`、`Jam setengah sembilan→八点半`）。
- 但作为「印尼人学中文课程卡片」的合格数：**0** —— 全部缺拼音、缺 TTS 文本字段、缺难度/标签/审核状态。

## D. 需要修改的表达及具体问题

内容级错误：**抽查未发现**。

- 翻译方向颠倒：0 处（中文侧含拉丁字母的 8 条全部是专有名词/品牌：QRIS、Kak、Budi、e-toll、Wi-Fi，处理合理）。
- 语料内部重复：仅 2 条（"我要这个。""我手机快没电了。"各出现 2 次），属不同组的合理复用。
- 不适合公开教学的内容：未发现（语料为数字/吃喝/居家/出行等日常场景）。

## E. 缺失内容

1. **整门公共课程的最终内容包不存在**：无 100 条清单、无 10 模块划分、无 48 条职业表达。
2. 现有语料转课程卡片的必需字段：拼音（含声调，需人工复核变调/多音字——导入规范明确要求）、`ttsText`、难度 1–3、tags、`reviewStatus: HUMAN_APPROVED` + 审核引用。

## F. 是否满足最小公开课程要求

**不满足。** 最小卡片结构（中文/拼音/印尼语/中文朗读/收藏/完成标记）在运行时层面全部支持：`ChineseSpeechButton` 复用（TTS 只读中文、zh-CN、无降级）、收藏走 `mandarin-v2:<expressionId>` 独立命名空间、进度 `day: null` 不写 Day 1–60 —— 数据隔离已由 V2 适配器保证。**但没有一条已审核内容可激活，页面/导航也不存在（按设计未建）。**

## G. 阻止上线的 P0 项

1. **P0-1 公共日常中文课程内容不存在。** `mandarinV2ReviewedPackages` 注册表为空，仓库与全部本地目录中无任何 `CN-HF-*` 课程包草稿。上线没有可发布对象。
2. **P0-2 任务线索文件 `IndoBrain_IDZH_public_core_100_draft.csv/json` 无法定位。** 若该文件确实存在（可能在其他设备/网盘/早期会话），需指认位置后以它为共同核对基准重新执行第二步 QA；若不存在，则本课程需先产出内容并通过人工审核——这超出本轮「内容 QA、不新增课程内容」的职权范围，需明确授权。

## H. 不阻止上线的 P2 项

本轮无（内容缺失是唯一阻塞；无外观/体验类问题可报）。

## 附：推动上线的最少路径（供决策，未动手）

279 条 Real Use 语料质量合格，是现成底稿：反向生成卡片（补拼音/ttsText/难度/标签）→ 既有 validator 校验（自动查重 Day 1–60）→ 人工审核记录 `reviewReference` → 填入 registry → 按架构文档激活清单建路由。管线验证全部 PASS，内容到位后无需任何架构改动。该步骤涉及新增课程内容，须待授权。
