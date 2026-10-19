# FOUR-STATE-MATRIX · 100 个案例到底有几个"能用"

**核心一句**：100 是**存在数量**，不是**已验证数量**。四态拆开后，能走到"教学标准有效"的是 **0**。

生成脚本：`scripts/four-state-evaluate.mjs`（连跑两次，除 `generatedAt` 外输出逐字节相同）
全量结果：`data/four-state-result.json`（含 100 行逐例判定）
被评对象：`received/original/WB/data/ai-coach-cases-100.json`（v1.0.0）
对照基线：`a86dde0`（`C:/Users/lijia/Desktop/IndoBrain-B2-3-rt`，HEAD 已核对）

---

## 1. 四态总表

| 态 | 定义 | 结果 | 判定 |
|---|---|---|---|
| **S1 存在** | 记录可解析，`cases[]` 计数 | **100 / 100** | PASS |
| **S2 格式有效** | 自有 19 个声明字段全非空；`assertions[]` 非空且每条有 `rule` | **100 / 100** | PASS（对自有契约） |
| **S2′ 对你的 schema v1 合规** | 命中 `teaching-test-case.schema.v1.json` 的 13 个必需字段 | **0 / 100** | NOT CONFORMANT |
| **S3 课程目标有效** | 目标能解析到真实课程词表（探针 A）/ 且属于指定那一天（探针 B） | **93（A）· 20 精确（B）· 47 含部分（B）** | PARTIAL |
| **S4 教学标准有效** | 有可执行判据能对该案断言给出 PASS/FAIL | **0 / 100** | **NOT VERIFIED** |

递进漏斗：`100 存在 → 100 格式有效 → 93 课程词表命中 → 20 精确属天 → 0 可判分`

---

## 2. S2：格式有效 ≠ 可归一化

两个"格式"必须分清，否则会把 100 误读成"归一化完成 100%"。

### 2.1 自有契约（100/100）

案例集自带 21 个字段，其中除 `curriculum_area`（9 例空）与 `fidelity_note`（95 例空）外，其余 19 个 **100/100 非空**。`assertions` 无空数组，无缺 `rule` 的条目。**作为一份自洽的数据文件，它是干净的。**

### 2.2 你的 schema v1（0/100）

`docs/ai-coach-phase0/teaching-test-case.schema.v1.json` 要求：

```
caseId, source, sourceVersion, sourceLocator, category, direction, evaluationMode,
skillIds, preconditions, input{mode,learnerText,audioFixture},
expected{machineAssertions,humanCriteria}, references{courseIds,expressionIds,apiContracts},
normalizationStatus
```

案例集实际拥有：`case_id, learning_direction, learner_level, learner_behavior, goal, scenario, student_input,
input_mode, expected_teacher_action, forbidden_teacher_action, success_criteria, severity, target_content,
curriculum_ref, assertions, failure_signature, baseline_expectation, tags, curriculum_area, in_curriculum, fidelity_note`

**交集 = 0**。字段命名风格不同（snake_case vs camelCase）、字段集合不同、嵌套结构不同。`skillIds` 出现 **0 次**。

`TEST_CASE_NORMALIZATION_V1.md` 第 3 步写的是：

> Create a normalized record referencing its original case ID and locator.

按这句话做，会得到 100 个只有 `caseId` + `sourceLocator` 的记录，其余 11 个必需字段为空——直接违反同一个 schema 的 `required`。**所以归一化必须逐例做人工判断，不是批量改名。**

逐例需要人工决定的 5 件事：

| schema 字段 | 素材在哪 | 判断难度 |
|---|---|---|
| `category` | 无。需读 `goal` + `expected_teacher_action` + `tags` 推断 | 100 次判断，可交叉校验 |
| `skillIds` | 无。需 S01–S12 语义映射（而 A 组没给机器清单） | 阻塞在 A-G1 |
| `evaluationMode` | 部分。`assertions` 有 → 至少 MACHINE 可宣称 | 需先有 S4 判定器才敢写 MACHINE |
| `preconditions` | 可从 `learner_level` + `scenario` + `input_mode` 编写 | 可批量起草 + 人工复核 |
| `references.*` | `curriculum_ref` + `target_content.content_id` 部分可用 | 复合引用（`#D8 + D23`）需拆 |

---

## 3. S3：93 这个数字为什么不能用

### 3.1 两个探针

| 探针 | 算法 | 出处 | 结果 |
|---|---|---|---|
| **A（松）** | 把 `lib/mandarin-work-course.ts`（daily + dialogues）、`lib/server/mandarin-work-level2.ts`、`lib/driver-experiences.ts` 的全部汉字切成集合；目标串**任意长度 ≥2 的子串**命中即通过 | WorkBuddy B 自己的 `verify-targets.mjs` | **93 / 100** |
| **B（严）** | 从 `curriculum_ref` 抽 `#D{n}`，只与该天 `daily[n]` 词表比：完全相等 = `EXACT_DAY`，互相包含 = `PARTIAL_DAY`，在别的天 = `OTHER_DAY`，全课程无 = `NOT_IN_COURSE`，无天号 = `NO_DAY_REF` | 本包新增 | `EXACT_DAY 20`、`PARTIAL_DAY 27`、`OTHER_DAY 1`、`NOT_IN_COURSE 5`、`NO_DAY_REF 47` |

探针 A 的松点在于：`为什么` 命中（3 字）就能让 `为什么还没好？` 整套通过。它证明的是**这些汉字在课程文件里出现过**，不是**这个表达是课程教的目标**。

### 3.2 双探针冲突 4 例（这是最有信息量的部分）

| Case | 目标 | 引用 | A | B | 真相 |
|---|---|---|---|---|---|
| `ID-ZH-017` | 为什么还没好？ | `#D21` | ✅ | NOT_IN_COURSE | `为什么`（D21）、`还没`（D17 前后）都在，但 D21 当天词表无此组合句 |
| `ID-ID-035` | 他叫什么？ | `#D1` | ✅ | NOT_IN_COURSE | `什么？` 在 D3、`我叫……` 在 D1；`叫什么` 全课程**零出现** |
| `ID-ID-048` | 谢谢，你吃了吗？ | `#D28` | ✅ | NOT_IN_COURSE | `吃了吗` 零出现，`谢谢你` 也零出现 |
| `ID-ID-006` | 来了。 | `#D2` | ❌ | PARTIAL_DAY | 反向冲突：B 因 `来` 在 D2 判部分，A 因整串不在汉字集合里判失败 |

前 3 例说明**松口径会放行编造的目标句**；第 4 例说明**两个口径连"通过"的定义都不一致**。

### 3.3 探针 A 判失败的 7 例（案例集自己也承认 5 例）

| Case | 目标 | 案例集声明 |
|---|---|---|
| `ID-ZH-022` | 七点半。 | `in_curriculum=false` |
| `ID-ZH-040` | 请配合一下。 | `in_curriculum=false` |
| `ID-ID-006` | 来了。 | `in_curriculum=false` |
| `ID-ID-013` | 来了。 | `in_curriculum=false` |
| `ID-ID-049` | 新年快乐！ | `in_curriculum=false` |
| `ID-ID-026` | 他在仓库。 | **`in_curriculum=true`（未声明为缺口）** |
| `ID-ID-033` | 他在仓库。 | **`in_curriculum=true`（未声明为缺口）** |

`ID-ID-026` / `ID-ID-033` 的 `target_content.content_id` 是 `CN-WORK-D23-I01`，`curriculum_ref` 写 `#D8 + D23`。但 `他在仓库` 与 `仓库` 在 `mandarin-work-course.ts` 的 daily 词表、dialogues、level2、driver-experiences 中**均不出现**（`仓库` 仅作为 D23 的标题词出现，词表里对应的是 `货 / 库存`）。**这两例是案例集 `fidelity.in_curriculum_true = 95` 声明中的数据错误**，本轮不代改，标为待裁定。

> 补充：探针 B 把 `ID-ID-006`（来了。）判为 `PARTIAL_DAY` 是因为 `来` 在 D2——但 `来了` 这个表达不在。B 的"部分匹配"口径比 A 更宽的一个环节就在这里，使用时需注意 `PARTIAL_DAY` 不等于"这一课教过"。

### 3.4 `NO_DAY_REF` 47 例

47 个案例的 `curriculum_ref` 指向 `components/MandarinAiCoachExperience.tsx#saveExpressionForReview`、`lib/mandarin-coach-personalization.ts:189-192` 这类**非课程位置**。它们可能是合理的（测的是交互而非课程），但在探针 B 下无法验证课程归属，只能落 `NO_DAY_REF`。

**结论**：若必须给一个「课程目标有效」的数字，用 **20 / 100（精确属天）** 或 **47 / 100（含部分）**，并在任何对外材料里注明口径。**不要用 93。**

---

## 4. S4：为什么是 0，且这不是案例集的错

### 4.1 断言的真实形态

127 个规则名，三种形态：

```
CONTAINS_TARGET    { pattern: "jemput saya" }        ← 可正则实现
INVITES_SPEAKING   { pattern: "(coba|ulangi|...)" }  ← 可正则实现（但会漏召回）
MAX_NEW_ITEMS      { value: 1 }                      ← 需结构化计数
NO_NEGATIVE_EVAL   { }                               ← 语义判断，正则不可行
NO_LECTURE         { }                               ← 语义判断
NO_ABILITY_ATTRIBUTION { }                           ← 语义判断
```

按规则名**实测**的三种形态（参数统计，非估计）：

| 形态 | 数量 | 示例 |
|---|---|---|
| 带 `pattern`（可正则实现） | **6** | `CONTAINS_TARGET {pattern:"jemput saya"}`、`INVITES_SPEAKING {pattern:"(coba\|ulangi\|...)"}` |
| 带 `value`（需结构化计数） | **2** | `MAX_NEW_ITEMS {value:1}`、`MINIMAL_ANSWER_TARGET {value:…}` |
| **纯语义、无任何参数** | **119** | `NO_NEGATIVE_EVAL`、`NO_LECTURE`、`NOT_PASS_ON_ECHO`、`REDUCES_PROMPT`、`STRATEGY_CHANGED_AT_ATTEMPT_3`、`ASR_ERROR_NOT_PRON_ERROR`、`CONFIRMS_COMPLETION` … |

也就是说：**127 个规则名里只有 8 个带机器可用的参数**，其余 119 个是纯语义禁令/判断，正则不可覆盖（`NO_NEGATIVE_EVAL` 用正则会误杀"不错"；`STRATEGY_CHANGED_AT_ATTEMPT_3` 需要跨轮次历史）。

### 4.2 三块缺口

| # | 缺口 | 后果 |
|---|---|---|
| 1 | **无判定器**。仓库中 0 行代码实现任何规则名 | 断言不可执行 |
| 2 | **无规则名 → TIS 维度映射**。`NO_SCOLDING` 属 `CQ` 还是 `TA`？未定义 | 无法聚合出 0–100 分 |
| 3 | **无规则名 → P0 硬断言映射**。TIS 有 5 条一票否决，未说明哪些 rule 对应 | 无法判 `BLOCKER` |

### 4.3 公平地说：TIS 并不缺判定线

`AI-Coach-教学质量评分标准.md` §1.2 写得很清楚：

```
PASS     S ≥ 80 且无 P0 违规
复核     70 ≤ S < 80
FAIL     S < 70
BLOCKER  命中任一 P0 硬断言（不看总分）
```

6 维度权重 `TA 25 / CQ 20 / DA 15 / BR 10 / IP 15 / TC 15 = 100`，并有 0–4 级分锚点。

**所以 S4=0 的真正原因不是"标准缺失"，而是"标准与机器之间缺两座桥"**：维度映射表、P0 映射表。加上一个能读懂 `NO_LECTURE` 的判定器，S4 才可能从 0 变成正数。

这属于 Phase 1 工程范围，**不属于本次交接范围**。交接方的责任到"把缺口指认清楚"为止。

---

## 5. 逐例四态明细在哪

`data/four-state-result.json` → `rows[]`，每行：

```json
{
  "caseId": "ID-ID-026",
  "direction": "ID_TO_ZH",
  "target": "他在仓库。",
  "curriculumRef": "lib/mandarin-work-course.ts#D8 + D23",
  "declaredInCurriculum": true,
  "S1": true,
  "S2": true,
  "S3_loose": false,
  "S3_looseHow": "not-found",
  "S3_strict": "NOT_IN_COURSE",
  "S3_consistent": false,
  "S4": false,
  "S4_reason": "NO_JUDGE"
}
```

可直接用于：
- 给 Codex 做归一化时的"逐案待裁定队列"（筛 `S3_consistent === false`，共 4 例）
- 给产品做"哪些案例当前根本无法测"的清单（筛 `S3_loose === false`，共 7 例）
- 给 QA 做"哪 20 例可以立刻进入精确课程验证"的白名单（筛 `S3_strict === "EXACT_DAY"`）

---

## 6. 一句话结论

> **100 个案例的存在性没有问题，格式也没有问题，问题是它们还没有被"接上"课程与判据。**
> 把它们当成 100 个已验证案例去算通过率，得到的数字会是假的。
> 正确的中间态是 `BLOCKED_JUDGE`，不是 `READY`，也不是 `BLOCKED_SOURCE`。
