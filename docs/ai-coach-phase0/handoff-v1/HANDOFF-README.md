# AI Coach Phase 0 · 原始材料交接包 v1

**交接方**：WorkBuddy（独立教学质量测试负责人角色）
**接收方**：Codex（`codex/ai-coach-teaching-intelligence-phase0` @ `af52eae`）
**交接日期**：2026-10-19
**性质**：只读交接。本目录不属于任何 Git 仓库，未修改 Production / Supabase / main / 环境变量，未部署、未合并、未创建测试账号。

---

## 0. 给你（Codex）的一句话

你之前把 WorkBuddy A/B 的 8 个来源组记为 `MISSING` 是**正确的判断**——它们确实不在仓库、也不在任何 project worktree 里。它们在这里，已按字节原样复制，全部 16 个文件带 SHA-256。

但**请不要把"文件到了"当成"案例可以归一化了"**。四态拆开之后：

```
存在            100 / 100
格式有效        100 / 100   （但对你的 schema v1 是 0 / 100）
课程目标有效     93 / 100   （探针 A 松口径；回指到指定 Day 的精确值只有 20 / 100）
教学标准有效      0 / 100   NOT VERIFIED
```

`TEACHING_TEST_CASE_INTAKE` 仍然不能从 `BLOCKED_SOURCE` 直接跳到 `READY`。正确的下一态是 `BLOCKED_JUDGE`。

---

## 1. 目录结构

```
ai-coach-phase0-handoff-v1/
├── HANDOFF-README.md                  ← 本文件
├── HANDOFF-INVENTORY.md               ← 人读清单（逐文件：来源/版本/字节/SHA-256/角色）
├── FOUR-STATE-MATRIX.md               ← 四态判定与证据链
├── data/
│   ├── handoff-manifest.json          ← 机器读清单（sourceId → path → sha256 → provider）
│   └── four-state-result.json         ← 四态评估全量结果（含 100 行逐例判定）
├── scripts/
│   ├── build-handoff-manifest.mjs     ← 重新生成清单
│   ├── four-state-evaluate.mjs        ← 重新计算四态
│   └── verify-handoff.mjs             ← 自检：重算 16 个哈希 + 复验四态数字，退出码即门禁
└── received/original/
    ├── WA/    ← WorkBuddy A 原始材料（4 文件）
    ├── WB/    ← WorkBuddy B 原始材料（8 文件，含 1 个 bundle）
    └── CODEX/ ← 你当前的 Phase 0 文档快照（4 文件，用于对齐）
```

---

## 2. 八类来源 → 实际文件映射

`docs/ai-coach-phase0/SOURCE_INVENTORY_V1.md` 枚举了 8 个来源组，全部命中：

| sourceId | 交接路径 | 字节 | SHA-256（前 16） |
|---|---|---|---|
| `WBA-SKILLS-S01-S12` | `received/original/WA/1-IndoBrain-AI-Teaching-Skills-V1.md` | 72,259 | `524bec4c17d3d5e6` |
| `WBA-EVIDENCE-TABLE` | `received/original/WA/2-教学证据与参考文献表.md` | 33,686 | `a94b1ee474b843e0` |
| `WBA-BIDIRECTIONAL-EXAMPLES` | `received/original/WA/3-双向教学示例库.md` | 18,163 | `5487e54fca1618e4` |
| `WBB-100-CASES` | `received/original/WB/data/ai-coach-cases-100.json` | 200,457 | `4e909e473d0f6ad6` |
| `WBB-TIS-RUBRIC` | `received/original/WB/AI-Coach-教学质量评分标准.md` | 26,461 | `1abd87893a475f55` |
| `WBB-QUICK-SPEAK` | `received/original/WB/Quick-Speak-五分钟体验设计.md` | 35,269 | `d00e7858438c9b47` |
| `WBB-MOBILE-SPEC` | `received/original/WB/移动端交互规范-375-390-430.md` | 24,052 | `829b94d38cea532d` |
| `WBB-REAL-USER-PROTOCOL` | `received/original/WB/真实用户测试计划-与基线对比.md` | 28,471 | `3cbb898a9dde89e3` |

另有 8 个支持性文件：`WA/建立索引.md`、`WB/build-cases.mjs`、`WB/verify-targets.mjs`、`WB/ai-coach-teaching-eval-v1.zip`、`CODEX/*.md|json` ×4。完整 16 条见 `data/handoff-manifest.json`。

---

## 3. 必须知道的三个坑

### 3.1 `ai-coach-teaching-eval-v1.zip` 不是 zip

**它是 tar**。文件头是 `AI-Coach-教学质量评分标准.md\0…ustar`，`unzip` 会报 `End-of-central-directory signature not found`。

```bash
# 正确
tar -tf  received/original/WB/ai-coach-teaching-eval-v1.zip
tar -xvf received/original/WB/ai-coach-teaching-eval-v1.zip
```

包内 7 项（4 文档 + 100 案例 + 2 脚本）已逐一解包并与包外同名文件做哈希比对：**7/7 完全相同**，无版本分歧。也就是说 zip 是冗余副本，直接用包外的目录文件即可。

### 3.2 案例集有 21 个字段，你的 schema v1 要求 13 个，交集是 0

你的 `teaching-test-case.schema.v1.json` 要求 `caseId / source / sourceVersion / sourceLocator / category / direction / evaluationMode / skillIds / preconditions / input{...} / expected{...} / references{...} / normalizationStatus`。

案例集提供的是 `case_id / learning_direction / learner_level / learner_behavior / goal / scenario / student_input / input_mode / expected_teacher_action / forbidden_teacher_action / success_criteria / severity / target_content / curriculum_ref / assertions / failure_signature / baseline_expectation / tags / curriculum_area / in_curriculum / fidelity_note`。

**没有任何一个案例包含 schema 的 13 个必需字段中的任意一个**（`skillIds` 出现 0 次）。所以 `TEST_CASE_NORMALIZATION_V1.md` 第 3 步"Create a normalized record referencing its original case ID and locator"不是改字段名，是**逐例重新创作 + 人工判断 3 个维度**：

| schema 字段 | 来源 | 需要什么 |
|---|---|---|
| `category` | 无 | 三组归属需人工判定（案例集无此字段） |
| `skillIds` | 无 | 需 WorkBuddy A 的 S01–S12 语义映射（见 3.3） |
| `evaluationMode` | 部分 | `assertions` 可跑 → `MACHINE`；仅有人工标准 → `HUMAN`；两者都有 → `BOTH` |
| `references.courseIds/expressionIds` | `curriculum_ref` 部分可推 | `content_id` 形如 `CN-WORK-D23-I01` 可直接用；`#D8 + D23` 这种复合引用需拆解 |
| `preconditions` | 无 | 需从 `learner_level` + `scenario` 编写 |

### 3.3 WorkBuddy A 没有机器可读的 Skill 清单

`WBA-SKILLS-S01-S12` 目前是**散文**。ID→名称映射藏在 Markdown 标题里：

```
### S02 · Micro Speaking（微口语输出）
### S03 · Scaffolding（支架）
### S04 · Adaptive Difficulty（自适应难度）
### S05 · Corrective Feedback（纠错反馈）
### S07 · Independent Recall（独立提取）
### S08 · Error Recovery（错误恢复 / 挫败恢复）
### S01 · Student Diagnosis（学习者诊断）
### S06 · Guided Roleplay（引导式角色扮演）
### S09 · Spaced Review（间隔复习）
### S10 · Confidence Building（信心建立）
### S11 · Task Assessment（任务评估）
### S12 · Learning Reflection（学习反思）
```

**已验证**：12 个 Skill 全部存在，每个都含且仅含 12 个 `#### n.` 字段（无缺项）。但这仍然是散文，不是 manifest。

你的 `AI_COACH_MVP_INTEGRATION_PLAN_V1.md` 第 43 行写着「S02/S03/S04/S05/S07/S08 remain opaque external IDs」。这个判断在文件到位后**依然成立**——因为原文里 S02 的语义是"微口语输出"，而你要的"intent / preconditions / actions / evidence requirements / fallbacks"是分散在 12 个字段里的，需要一次显式抽取才能变成 manifest。**这一步我没有替你做**，因为抽取即解释，解释即立场，不应该由交接方单方面定。

---

## 4. 四态的准确含义（请勿简化回"100 个案例"）

| 态 | 判定 | 数量 | 证据 |
|---|---|---|---|
| **S1 存在** | JSON 可解析，`cases.length` 计数 | **100 / 100** | `data/ai-coach-cases-100.json` |
| **S2 格式有效** | 自有 19 个声明字段全非空；`assertions[]` 每条都有 `rule` | **100 / 100** | `scripts/four-state-evaluate.mjs` |
| **S3 课程目标有效** | 目标表达能在基线真实词表中解析（探针 A）；且属于 `curriculum_ref` 指定的那一天（探针 B） | **93 / 100**（探针 A，松）<br>**20 / 100**（探针 B 精确属天）<br>**47 / 100**（探针 B 含部分匹配） | 同上 |
| **S4 教学标准有效** | 存在可执行判据能对该案的断言给出 PASS/FAIL | **0 / 100 · NOT VERIFIED** | 127 个规则名，0 个实现 |

### S3 为什么有两个数

- **探针 A（93）**：WorkBuddy B 自己的 `verify-targets.mjs` 算法——把三个课程文件的全部汉字切成集合，目标串里任意长度 ≥2 的子串命中就算通过。这个口径很松：`为什么` 命中就等于 `为什么还没好？` 通过。
- **探针 B（20 精确 / 47 含部分）**：从 `curriculum_ref` 抽出 `#D21` 这样的天号，只跟那一天（`lib/mandarin-work-course.ts` 的 `daily[n]`）的词表比。

两个探针**互相矛盾的有 4 例**（探针 A 说通过、探针 B 说不在该天），这 4 例恰好暴露了松口径的失真：

| Case | 目标 | 引用 | 探针 A | 探针 B | 实情 |
|---|---|---|---|---|---|
| `ID-ZH-017` | 为什么还没好？ | `#D21` | 通过 | NOT_IN_COURSE | `为什么` 与 `还没` 都在，但 D21 当天词表里没有这个组合句 |
| `ID-ID-035` | 他叫什么？ | `#D1` | 通过 | NOT_IN_COURSE | `什么？` 在 D3、`我叫……` 在 D1，组合句不存在 |
| `ID-ID-048` | 谢谢，你吃了吗？ | `#D28` | 通过 | NOT_IN_COURSE | `吃了吗` 全课程文件中**零出现**；`谢谢你` 也零出现 |
| `ID-ID-006` | 来了。 | `#D2` | **不通过** | PARTIAL_DAY | 探针 B 判"部分匹配"是因为 `来` 在 D2；探针 A 用的是整串，反而不通过 |

**结论**：93 这个数字不能用。它证明的是"汉字出现过"，不是"这个表达是课程教过的目标"。若要用单一数字对外，请用 **20/100（精确）**或 **47/100（含部分）**，并注明口径。

另外 **47 / 100 案例的 `curriculum_ref` 完全没有天号**（指向 `components/...` 或 `lib/driver-experiences.ts#EXP-DRV-001` 这类非课程位置），这类案例在探针 B 下只能落 `NO_DAY_REF`，无法验证课程归属。

### S4 为什么是 0，以及为什么这不是案例集的锅

案例集的 `assertions` 长这样：

```json
[{ "rule": "CONTAINS_TARGET", "pattern": "jemput saya", "weight": 1 },
 { "rule": "INVITES_SPEAKING", "pattern": "(coba|ulangi|ucapkan|silakan)", "weight": 1 },
 { "rule": "MAX_NEW_ITEMS", "value": 1, "weight": 1 },
 { "rule": "NO_NEGATIVE_EVAL", "weight": 1 },
 { "rule": "NO_LECTURE", "weight": 1 }]
```

共 **127 个不同规则名**。三个结构性缺失：

1. **没有判定器**。仓库里没有任何代码实现 `INVITES_SPEAKING` 或 `NO_LECTURE`。这些是自然语言语义判断，不是正则能覆盖的（`NO_NEGATIVE_EVAL` 用正则会误杀"不错"）。
2. **没有逐例的机器判定阈值**。TIS §1.2 确实定义了 `S ≥ 80 且无 P0 违规 → PASS`、`70 ≤ S < 80 → 人工复核`、`S < 70 → FAIL`、命中任一 P0 硬断言 → `BLOCKER`，还有 0–4 级分维度细则。**这是完整的判定规则**——但它要求"人工读懂 AI 回复后打 0–4 分"，不是能跑的东西。案例集的 `assertions[].weight` 与 TIS 的维度权重也不是同一套刻度（前者是 1 的整数，后者是 25/20/15/10/15/15），映射关系没有给出。
3. **TIS 的 5 条 P0 硬断言与案例集的 127 个规则名没有对应表**。哪些 case 的哪条 rule 属于 P0 一票否决，需人工连线。

所以 S4 = 0 不是案例集写得差，是**评测器还没被造出来**。这属于 Phase 1 工程范围，不属于交接范围。

---

## 5. 建议你对 Phase 0 文档做的最小改动

不是替你改，是给你一个可核对的清单。

| 文件 | 现状 | 建议 |
|---|---|---|
| `source-manifest.v1.json` | 8 组 `WORKBUDDY_*` 全 `MISSING` | 改为 `PRESENT` 并填入 §2 表中的 `path` + `sha256`；`integrationStatus` 保持 `INCOMPLETE`（理由从"源缺失"换成"源已到但未归一化"） |
| `SOURCE_INVENTORY_V1.md` L9 | "WorkBuddy A/B original artifacts are not present in the repository or adjacent project worktrees" | 补一句 "…but they were located outside the codebase and handed over on 2026-10-19 at `<handoff root>`" |
| `teaching-test-case-intake.v1.json` | `normalizationStatus: BLOCKED_SOURCE`, `importedCount: 0` | 保持 `importedCount: 0`（不要虚增），把 `normalizationStatus` 换成 `BLOCKED_JUDGE`，`blockers` 换成本文件 §4 的四态数字 |
| `TEST_CASE_NORMALIZATION_V1.md` | `Imported original cases: 0` | 更新为 `Source cases received: 100`、`Four-state: 100/100/93/0` |
| `verify-ai-coach-phase0-artifacts.mjs` L48 | `assert(missingWorkBuddy.length === 8)` | 交接生效后此断言必然失败；需改成"8 组全部 PRESENT 且哈希可复算"，或改为按 manifest 文件数断言 |
| `docs/AI_COACH_MVP_INTEGRATION_PLAN_V1.md` L16/L369 | "NO-GO for … three-party source integration" | 可以保留 NO-GO，但理由要换：不再是"源缺失"，而是"源已到、未归一化、无判定器" |

---

## 6. 复现方式

```bash
cd ai-coach-phase0-handoff-v1

# 0) 先自检（16 个哈希 + 四态数字），退出码 0 才继续
node scripts/verify-handoff.mjs

# 1) 重新生成清单（16 个文件的哈希）
node scripts/build-handoff-manifest.mjs

# 2) 重新计算四态（默认指向 a86dde0 的干净工作树）
node scripts/four-state-evaluate.mjs
node scripts/four-state-evaluate.mjs --repo C:/path/to/your/worktree

# 3) 交叉验证：跑 WorkBuddy B 自己的原始校验器（需要它写死的路径存在）
node received/original/WB/verify-targets.mjs
```

已验证：`verify-handoff.mjs` → `HANDOFF INTACT`（exit 0）；`four-state-evaluate.mjs` 连跑两次，除 `generatedAt` 外逐字节相同。

---

## 7. 我没有做的事（明确声明）

- 没有修改任何业务代码、Production、Supabase、main、环境变量、账号权限。
- 没有归一化任何案例。0 条案例被转成你的 schema v1 格式——因为那需要 `category` / `skillIds` / `preconditions` 三个人工判断，交接方替你做等于伪造来源。
- 没有从 WorkBuddy A 的散文里抽取 Skill manifest。理由同 §3.3。
- 没有验证真实 AI 调用、真实 STT、真实浏览器渲染。四态全部是**静态**判定。
- 没有把 `ai-coach-teaching-eval-v1.zip` 改名成 `.tar`（保持原文件名与原始字节，避免"我改过"的歧义）。

## 8. NOT VERIFIED 清单

- 100 个案例的**实际通过率**：未跑任何真实模型调用。
- S4 若造出判定器后的真实分数：未知。
- 案例集 `fidelity.in_curriculum_true = 95` 的声明：与探针 B 不一致（探针 B 见 6 例无法在指定天命中），未裁定谁对。**不推翻、不采信**，标记为待你裁定。
- 127 个规则名的语义等价类：未做合并分析，`NO_NEGATIVE_EVAL` 与 `NO_SCOLDING`、`NO_DIFFICULTY_JUDGEMENT` 是否重复，需产品裁定。
