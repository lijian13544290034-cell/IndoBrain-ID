# HANDOFF-INVENTORY · 逐文件清单

交接方：WorkBuddy｜接收方：Codex｜日期：2026-10-19
哈希算法：SHA-256。文本文件同时给出 raw 与 LF-canonical 两种口径；**本次交接两者完全相同**（原始文件均不含 CRLF），因此可任选其一核对。

机器可读版本：`data/handoff-manifest.json`

---

## A. WorkBuddy A — 12 Skills / 证据表 / 双向示例库

来源：`C:\Users\lijia\WorkBuddy\2026-10-18-21-29-22\IndoBrain-Teaching-Skills-V1\`
版本：V1，2026-10-19（文件内声明）
状态：**PRESENT**

| # | 交接路径 | 原始路径 | 字节 | 行数 | SHA-256 |
|---|---|---|---|---|---|
| A-1 | `received/original/WA/1-IndoBrain-AI-Teaching-Skills-V1.md` | 同名 | 72,259 | 1,268 | `524bec4c17d3d5e6b65d59579ef9ee0f1d09456e03406cbc59702eb7d93b0fa5` |
| A-2 | `received/original/WA/2-教学证据与参考文献表.md` | 同名 | 33,686 | 468 | `a94b1ee474b843e0176d9f1705faeac6b5e332f55817e950d74eb6d1daca0f10` |
| A-3 | `received/original/WA/3-双向教学示例库.md` | 同名 | 18,163 | 466 | `5487e54fca1618e467e3a2ee26537b495839618518af33ebb31cb238c70d5abf` |
| A-4 | `received/original/WA/建立索引.md` | 同名 | 1,780 | 24 | `906442a3081e3617e5096a03af796c8035ef9b93b786b66afcc2e01e0c55118a` |

**内容核验（已执行，非引用）**

- A-1：`### S{nn} · 英文名（中文名）` 标题共 **12 个**，与 S01–S12 全等，无缺号无重号。每个 Skill 下 `#### n.` 字段数**均为 12**，无缺项。
- A-1：ID → 名称映射为
  `S01 Student Diagnosis / S02 Micro Speaking / S03 Scaffolding / S04 Adaptive Difficulty / S05 Corrective Feedback / S06 Guided Roleplay / S07 Independent Recall / S08 Error Recovery / S09 Spaced Review / S10 Confidence Building / S11 Task Assessment / S12 Learning Reflection`
- A-1：8 条产品原则为 `P1`–`P8`，含 P6「跟读不等于掌握」、P7「中印分别设计」、P8「STT ≠ 发音测评」，与 Phase 1 契约方向一致。
- A-2：文件自统计「独立来源总计 41（强证据 17 / 有限证据 15 / 理论源头 2 / 标准-框架 5 / 方向旁证 2）」，另附「不可引用清单 12 条」「未能核实 6 条」。**该统计为文件自述，本次未逐条复核 41 个 DOI**。
- A-3：`## n. S{nn}` 小节 **12 个**，覆盖全部 12 个 Skill，每节含中文教学 / 印尼语教学双轨示例。

**A 组的真实缺口**

| 缺口 | 说明 | 影响 |
|---|---|---|
| A-G1 | **无机器可读 Skill manifest**。ID→名称只存在于 Markdown 标题。 | `skillIds` 字段无法自动填，S02/S03/S04/S05/S07/S08 语义仍对归一化不透明 |
| A-G2 | Skill 的「触发条件 / AI 教学动作 / 成功失败判定」是散文段落，非结构化 | 无法直接生成 `preconditions` |

---

## B. WorkBuddy B — 100 案例 / TIS / Quick Speak / 移动端规范 / 真实用户测试计划

来源：`C:\Users\lijia\WorkBuddy\2026-10-19-08-21-49\ai-coach-teaching-eval-v1\`
版本：案例集 `1.0.0`（`meta.version`），生成于 `2026-10-19T01:33:43.775Z`
状态：**PRESENT**

| # | 交接路径 | 原始路径 | 字节 | SHA-256 |
|---|---|---|---|---|
| B-1 | `received/original/WB/data/ai-coach-cases-100.json` | `data/ai-coach-cases-100.json` | 200,457 | `4e909e473d0f6ad6df8a14852fa0e49a707f1fbdf78ae65394ceb2d9a9eb0a2e` |
| B-2 | `received/original/WB/AI-Coach-教学质量评分标准.md` | 同名 | 26,461 | `1abd87893a475f55242915d2254112d42a658fa369f815e009dd40e9b915699c` |
| B-3 | `received/original/WB/Quick-Speak-五分钟体验设计.md` | 同名 | 35,269 | `d00e7858438c9b47222dbd734786f78382bef45968eed79ab7b392c64c5a05fd` |
| B-4 | `received/original/WB/移动端交互规范-375-390-430.md` | 同名 | 24,052 | `829b94d38cea532dbbed2c5f7e1d0d6fc0581b2848239f9d5a27aab597c1bd58` |
| B-5 | `received/original/WB/真实用户测试计划-与基线对比.md` | 同名 | 28,471 | `3cbb898a9dde89e3dc5cda340fb251daebccf60537e3a9d421987ec9aac0293d` |
| B-6 | `received/original/WB/build-cases.mjs` | 同名 | 121,546 | `29b8774261e7d6e3b20d2199b38487bbbdaf6c59b4b9a9d90505982c1b3ad86c` |
| B-7 | `received/original/WB/verify-targets.mjs` | 同名 | 4,045 | `dbe56b90562f4f5dac83d64228fb230907fb691adc59644e98aa75c203a2da3e` |
| B-8 | `received/original/WB/ai-coach-teaching-eval-v1.zip` | 同名 | 450,560 | `f0af3bd28fb2c7a429269559f0663c4d1f862e671e3133e654fb754956d12619` |

**B-8 是 tar，不是 zip**（`.zip` 扩展名错误）

```
$ tar -tvf ai-coach-teaching-eval-v1.zip
-rw-r--r-- 26461 AI-Coach-教学质量评分标准.md
-rw-r--r-- 35269 Quick-Speak-五分钟体验设计.md
-rw-r--r-- 28471 真实用户测试计划-与基线对比.md
-rw-r--r-- 24052 移动端交互规范-375-390-430.md
-rw-r--r-- 200457 data/ai-coach-cases-100.json
-rw-r--r-- 121546 build-cases.mjs
-rw-r--r-- 4045 verify-targets.mjs
```

7 项解包后与 B-1~B-7 **逐一哈希比对：7/7 完全相同**。包是冗余副本，无版本分歧。

**B-1 内容核验**

| 项 | 实测 |
|---|---|
| `cases.length` | 100 |
| `case_id` 唯一性 | 无重复 |
| 字段数 | 21 个，全部案例同构 |
| 空值字段 | `curriculum_area` 空 9 例；`fidelity_note` 空 95 例（仅 5 例有说明） |
| 方向 | `ZH_TO_ID` 50 / `ID_TO_ZH` 50 |
| `input_mode` | `TEXT` 86 / `VOICE` 14 |
| `severity` | `HIGH` 41 / `MEDIUM` 38 / `LOW` 21 |
| `assertions` | 无案缺断言；每条断言都有 `rule`；不同规则名 **127** 个 |
| 声明基线 | `lijian13544290034-cell/IndoBrain-ID @ a86dde0 (RC2-B2-3)` |
| 声明 `in_curriculum` | true 95 / false 5 |

**B-7 `verify-targets.mjs` 的硬编码路径**

```js
const REPO = 'C:/Users/lijia/Desktop/IndoBrain-B2-3-rt';
```

本机该目录存在且 HEAD = `a86dde0`（工作树有 `?? qa/` 未跟踪目录，不影响读取）。换机运行时需改这一行，或改用本包的 `scripts/four-state-evaluate.mjs --repo <path>`。

**B 组的真实缺口**

| 缺口 | 说明 | 影响 |
|---|---|---|
| B-G1 | 无机器可读 Skill manifest（同 A-G1） | `skillIds` 无法填 |
| B-G2 | **无三组归属字段**（教学策略 / 课程内容 / 语音可靠性） | `category` 需人工判定 100 次 |
| B-G3 | **无「需要人工评价的部分」字段** | `evaluationMode` 需人工判定；`HUMAN` 与 `MACHINE` 无法自动区分 |
| B-G4 | 断言规则名与 TIS 维度、TIS P0 硬断言之间**无映射表** | 无法聚合出 0–100 分，S4 无法计算 |
| B-G5 | `assertions[].weight` 恒为 `1`；TIS 维度权重为 25/20/15/10/15/15；两套刻度无换算 | 同上 |
| B-G6 | 47/100 案例的 `curriculum_ref` 无 `#Dn` 天号 | 课程归属只能验证到"词表中存在"，验证不到"第几天教" |
| B-G7 | 6/100 案例的目标表达在指定天词表中无法命中（见 `FOUR-STATE-MATRIX.md` §3） | 课程目标有效性存疑，需人工裁定 |

---

## C. Codex Phase 0 现有文档快照（仅供对齐，非来源材料）

来源：`C:\Users\lijia\Documents\Codex\2026-09-13\continue-from-previous-codex-session-do\indobrain-v12-rc2-integration\docs\`
分支：`codex/ai-coach-teaching-intelligence-phase0`，HEAD `af52eae`，**已推送 origin**（`refs/heads/codex/ai-coach-teaching-intelligence-phase0` = `af52eae`）

| # | 交接路径 | 字节 | SHA-256 |
|---|---|---|---|
| C-1 | `received/original/CODEX/SOURCE_INVENTORY_V1.md` | 3,523 | `6d09123029e86930e018f5865c6c80d3e53d7f3f60c00507b074a630948f607a` |
| C-2 | `received/original/CODEX/TEST_CASE_NORMALIZATION_V1.md` | 2,795 | `8a2e2837345f110a7466243c9b512f8283e78a94eeca722f5d81d26d152ebda1` |
| C-3 | `received/original/CODEX/PHASE1_CONTRACT_SPEC_V1.md` | 4,555 | `7e7c060f98ad0115e83cc74499039df84e606aa30c74c001873f79b934ce618f` |
| C-4 | `received/original/CODEX/source-manifest.v1.json` | 2,648 | `39865c4b6c2a1f97ff873bc8a6d4f6dbbba01908fcc07e291df683d0d456b6bc` |

**复验结果**

- `source-manifest.v1.json` 中唯一带 `path` + `sha256` 的条目 `CODEX-INTEGRATION-PLAN-V1` → 重算 **MATCH**。
- `node scripts/verify-ai-coach-phase0-artifacts.mjs` → `PASS`，`WORKBUDDY_ARTIFACT_GROUPS_MISSING: 8`，`TEST_CASES_IMPORTED: 0`。该脚本第 48 行 `assert(missingWorkBuddy.length === 8)` 在交接生效后必然失败，需同步修改。

---

## D. 缺失项汇总（MISSING，不补造）

| 项 | 状态 | 为什么标 MISSING |
|---|---|---|
| 名为 "WorkBuddy A" / "WorkBuddy B" 的目录或仓库 | **MISSING（按名称）** | 两个名称都不作为目录名存在。实际材料已按内容识别并定位（本文件 A、B 节）。这是**命名缺失**，不是材料缺失。 |
| WorkBuddy A 的机器可读 Skill manifest（JSON/YAML/CSV） | **MISSING** | 全盘未检出。ID→名称映射仅存在于 A-1 的 Markdown 标题。 |
| WorkBuddy B 的案例三组归属表 | **MISSING** | 案例集无 `category`/`group` 字段，`build-cases.mjs` 也不生成。 |
| WorkBuddy B 的「人工评价项」清单 | **MISSING** | 案例集无此字段。 |
| 断言规则名 → TIS 维度 / P0 硬断言 映射表 | **MISSING** | 两份文件都未提供，需新建。 |
| 历史教学质量基线分数 | **MISSING** | 仓库 37 个 `verify:*` 脚本有运行能力，无留存报告文件，无历史分数记录。（沿用前轮审计结论） |
| 真实模型 / STT / 浏览器测试记录 | **MISSING** | 本轮为静态交接，未产生任何真实调用记录。 |

---

## E. 一致性声明

- 16 个文件全部与原始位置**逐字节相同**（raw SHA-256 逐一比对，结果均为 IDENTICAL）。
- 无文件被改名后丢失、无文件被重新生成、无文件被格式化。
- `ai-coach-teaching-eval-v1.zip` 保持原名（`.zip`）与原始字节，未擅自改为 `.tar`。
- 交接目录不在任何 Git 仓库内，`git status` 无关。
