# 任务 A：AI 中文老师教学引擎优化 — 根因分析与交付

- 分支：`feature/coach-teaching-core-wb`（基于共同基线 `4318ec1`）
- 基线保护：`feature/coach-learning-ux` 与其提交 `cbe5132` 未被触碰
- 约束遵守：未改 main / Production / Supabase schema / 环境变量；未推送、未部署；未合并任务 B
- 日期：2026-10-22

## 一、P0 缺陷复现与根因

**用户输入**：`分酒器是啥`
**错误表现**：解释了分酒器，却自动跳转到「你想喝点什么？」并生成不相关教学卡片。

### 根因 1（主因，权重最高）：`courseFocus` 无条件抢占教学权

`lib/server/mandarin-teacher-skill.ts:150` 原文：

> `If the learner has not been taught this target yet, teach it now (one sentence, pinyin, meaning, then ONE practice question).`

这句话对**每一轮**都生效，不区分学生本轮是提问还是练习。系统同时还注入了一个具体的课程目标句（`courseFocus.target`，即「你想喝点什么？」）。

结果：模型一边被要求回答词义，一边被更强硬地要求「teach it now」——课程推进指令压过了学生的真实问题。这就是「解释了分酒器却跳到无关句子」的直接成因。这不是模型能力问题，是 prompt 指令冲突。

### 根因 2：纯释义请求没有被单独识别

`lib/server/mandarin-coach-brain.ts` 的 `MEANING` 正则只覆盖 `什么意思 / apa artinya / artinya apa / maksudnya / berarti apa`。

- `分酒器是啥`、`分酒器是啥意思` → 未命中，被归为 `CONVERSATION`，`confidence` 仅 0.45
- 由于没有 `MEANING` 意图，程序层没有任何「这是释义回合」的信号可以传给模型

### 根因 3：目标词提取把疑问尾巴一起吞掉

`extractTarget('分酒器是啥')` 返回整句 `分酒器是啥`，`extractTarget('库存是什么意思')` 返回 `库存是`（被 `什么意思` 截断后残留「是」）。目标词本身是错的，模型即使想解释也拿不到干净的词。

### 根因 4：中文「继续」指令完全无法恢复课程

`CONTINUE_COURSE`（`mandarin-ai-coach.ts:102`）与 `buildContinueContext`（`:599`）只认 `lanjut / continue / next / teruskan`。

实测：`继续刚才的课程。`、`继续`、`继续学习`、`接着刚才的课` **全部不匹配** → 返回 null → 落到模型自由回答 → 学生无法回到原课程，需求「说继续时恢复之前的课程」不成立。

### 已排除的可能原因（避免误改）

| 怀疑点 | 结论 |
|---|---|
| `teaching-intent-guard` 误拦 | 否。`分酒器是啥` 含汉字，走 `TARGET_LANGUAGE_ATTEMPT` → `LEARNING_RELATED`，正常放行 |
| Active 教学引擎（day-27）接管 | 否。`teachingEngineRuntimeMode()` 默认 `OFF`，且仅对 `mandarin-work-level-1-day-27` 生效 |
| OFF_TOPIC 误判 | 否。`OFF_TOPIC` 正则不含餐饮品类词，「分酒器」不触发 |
| 迷你课程状态机抢答 | 否。`composeMiniCourseResponse` 在 `PRACTICE` 阶段只对 `looksLikeAttempt` 生效，且需已有课程状态 |

## 二、修复方案（最小有效改动）

遵循「AI 负责理解与教学决策，确定性规则负责状态/校验/成本」的原则：**没有**新增关键词黑名单去硬猜意图，而是给规则层补一个**可验证的布尔信号**，交还给模型决策。

### 1. `lib/server/mandarin-coach-brain.ts`
- `MEANING` 正则扩充：`是啥 / 啥意思 / 是什么意思 / 是什么 / 啥东西 / apa itu / itu apa / arti dari / apa arti / arti nya / apa maksud`
- 新增 `LEARN_REQUEST`：识别「我想学 / 教我 / 怎么用 / 例句 / ajari / mau belajar」等**真正要学**的诉求
- `CoachBrainPlan` 新增 `explanationOnly`：`有目标词 && 问了意思 && 没要求教 && 非离题` → `true`
- `extractTarget` 增强：
  - 新增 `MEANING_TAIL` 剥除疑问尾巴（`是啥 / 是什么 / 啥意思 / 什么意思…`）
  - 新增 `LEARN_FRAME_HEAD` 剥除学习框架（`我想学习怎么介绍` → 只剩名词）
  - 剥完不足 2 字则保留原串，避免把目标词切碎

实测效果：

```
分酒器是啥            → [EXPLAIN] target="分酒器"  intents=MEANING
库存是什么意思        → [EXPLAIN] target="库存"    intents=MEANING+WORKPLACE
Apa arti 分酒器?      → [EXPLAIN] target="分酒器"  intents=MEANING
我想学习怎么介绍分酒器 → [TEACH]  target="分酒器"  intents=CONVERSATION
```

### 2. `lib/server/mandarin-teacher-skill.ts`
- `LEARNER FIRST` 增加 4 条硬规则：
  - **THE STUDENT'S QUESTION WINS**：学生问词义时先答问题，不得替换成无关课程句
  - **ANSWER ONLY unless the learner asks to learn it**：纯释义回合只给释义，允许一句「要不要我教你怎么用」，禁止未经请求直接教
  - 学生真要学这个词时，教的句子**必须包含该词**且不跑题
  - 侧问后课程进度不动，`lanjut / 继续` 从原位置恢复，**不得重开课程**
- `courseFocus` 注入改为二分支（这是修复核心）：
  - `explanationOnly === true` → `CONTEXT ONLY THIS TURN — do not teach it`，明确 `Do NOT teach "<target>"`、`Leave the course position unchanged so "lanjut" resumes exactly here`
  - 否则 → 可教学，但改为 `Teach this target ONLY when the learner has no question of their own this turn`，并明确「学生问别的词时先答问题、目标句不动」
- `buildTeacherSkillSystem` 新增 `explanationOnly?: boolean` 入参

### 3. `lib/server/mandarin-ai-coach.ts`
- `CONTINUE_COURSE`（课程状态机）与 `buildContinueContext`（课程续教）同步扩充中文：`继续 / 继续刚才的课程 / 继续学习 / 接着刚才的课 / 回到课程 / 我们继续`，以及 `kembali ke pelajaran / lanjut pelajaran|materi|belajar`
- 标点集补 `。！？`（原来只认英文标点，中文句号会导致不匹配）
- `buildTeacherSkillSystem` 调用处传入 `explanationOnly: brainPlan.explanationOnly`
- 意图分类器 system prompt 增一句：纯释义问题是 MEANING/VOCABULARY，不推断为「继续课程」
- `buildContinueContext` 导出（纯函数，供测试直接断言）

## 三、修改文件清单

| 文件 | 变更 | 风险 |
|---|---|---|
| `lib/server/mandarin-coach-brain.ts` | +`LEARN_REQUEST`、+`explanationOnly`、`MEANING` 扩充、`extractTarget` 重写剥离逻辑 | 中。`extractTarget` 影响所有意图的目标词，已用 31 项断言覆盖 |
| `lib/server/mandarin-teacher-skill.ts` | +4 条 LEARNER FIRST 规则、`courseFocus` 二分支、+`explanationOnly` 入参 | 中。改的是 prompt，行为需真实模型回归（本地无凭据，见风险） |
| `lib/server/mandarin-ai-coach.ts` | `CONTINUE_COURSE`/`buildContinueContext` 正则扩充、传参、导出 `buildContinueContext` | 低。仅扩匹配面，未改状态机逻辑 |
| `scripts/verify-teaching-intent-consistency.mjs` | 新增，31 项离线断言 | 无 |

文件数：3 个源码 + 1 个测试。**未改** 前端组件、API 路由、数据库、环境变量、`mandarin-mini-course.ts` 状态机。

## 四、自动化测试结果

命令：
```
node --experimental-strip-types --import <server-only/ai-stub-hook> scripts/verify-teaching-intent-consistency.mjs
```

**31/31 通过。** 覆盖：

1. 纯释义不推进课程（4 条：`分酒器是啥` / `分酒器是啥意思` / `库存是什么意思` / `Apa arti 分酒器?`）
2. 学习请求可教学且目标词正确（2 条）
3. 目标词提取不吞疑问尾巴/学习框架（3 条）
4. system prompt 释义回合禁止推进、保留课程位置、教学回合仍可教、含「学生问题优先」（4 条）
5. 恢复课程指令 7 种写法全部命中 `CONTINUE_NEXT_EXPRESSION`
6. 「继续」不被误判为释义
7. 模糊澄清（`Bukan, maksud saya...` 等）不作 CORRECTION 判断
8. 混合语言提问（中文/印尼语/混用）目标词正确
9. 学生答非课程句子时不硬判错

**回归对照（关键）**：`git stash` 掉三个源码文件后重跑，大量断言失败（`explanationOnly=undefined`、`continueContext=null`、system prompt 无「学生问题优先」），确认测试**真实捕获**了缺陷，而非事后放宽断言。

## 五、真实模型测试结果

**未能执行** —— 仓库 `node_modules` 为空（0 个包），且本地无 `.env` / `.env.local` / `AI_GATEWAY_API_KEY`（仅有 `.env.example`）。

因此本轮验证边界是：**程序判定层 + prompt 内容层**（决定模型收到什么指令，是根因所在），未验证模型实际输出文本。

补充说明：`scripts/verify-p0-smart-coach.mjs`、`scripts/verify-mandarin-ai-coach.mjs` 等既有端到端脚本均需先起 dev server（`npm run dev` + 真实凭据），本轮同样无法执行 —— **这些脚本必须在有凭据的环境重跑，不回退为「已通过」**。

## 六、尚未解决的风险

1. **prompt 改动的行为回归未验证**（最高风险）。`courseFocus` 二分支与 4 条新规则是自然语言指令，模型是否 100% 遵守需真实模型评估。建议在 Preview 用 `分酒器是啥` 首发验证，并重点看 `teachingStrategy` 是否仍出现 `MINI_COURSE_*`。
2. **`extractTarget` 是共享函数**，被所有意图复用。虽然做了「剥完不足 2 字回退原串」的保护，仍可能存在未预见的句式被过度剥离。建议后续把 `extractTarget` 从正则改为模型辅助抽取，或补一组更大规模的样例回归。
3. **`explanationOnly` 依赖正则判定**，属于「确定性信号」而非「意图理解」。这是刻意的设计（避免用纯模型判断状态），但代价是新出现的口语写法可能漏判（例如「这个是干嘛的」）。当前 `MEANING` 未覆盖「干嘛用 / 有什么用 / 干啥用」，若漏判则退回原行为（仍会强制推进），不会更糟。
4. **`分酒器` 不在词表**：`lib/server/mandarin-word-breakdown.ts` 的 `PRESET`/`LEXICON` 无此词，拆词会走兜底或由模型返回。属任务 B 的边界，此处仅记录未改。
5. **`分酒器` 的语义特殊性**：这是餐饮器具名（酒具），与「喝」相关但不等于「你想喝点什么」。即使修好意图，模型仍可能自行联想。已通过 prompt 的「教的句子必须包含该词」约束缓解。
6. **多轮上下文削弱**：`recentTurns` 只带最近 6 条，`recentConversationSummary` 截 280 字。学生隔多轮再说「继续」时，若原课程信息已被挤掉，恢复依据只剩 `miniCourse` 游标（进程内 Map，TTL 6 小时，不进数据库）。多实例部署下可能丢状态。
7. **`teaching-intent-guard` 的 `EXPLICIT_LEARNING` 正则未扩充**：`分酒器是啥` 靠「含汉字」放行。若学生用纯印尼语问冷门词（如 `apa arti fenjiuqi`），可能落到 `COACH_CONTEXT_DEFAULT`（仍放行，MEDIUM）。当前不阻塞，但语义上不够强。

## 七、待集成状态

- 分支 `feature/coach-teaching-core-wb`，本地提交，**未推送**
- 任务 B（`cbe5132`）**未合并**，两分支互不影响
- 未部署 Production，等待统一集成指令
