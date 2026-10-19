# Quick Speak 五分钟体验设计（Quick Speak v1）

> **版本**：1.0.0  
> **适用基线**：IndoBrain-ID `a86dde0`（RC2-B2-3）  
> **角色视角**：教学质量负责人 + 移动端 UX 设计师  
> **配套文档**：《100 个模拟学生测试案例》（`data/ai-coach-cases-100.json`）、《AI Coach 教学质量评分标准》（`AI-Coach-教学质量评分标准.md`）  
> **性质**：设计文档。本轮**不修改仓库代码、不提交 Git、不部署**。文中所有"现状"均标注了代码位置，所有"需新增"均为方案建议。

---

## 0. 一句话定义

> **Quick Speak 是"5 分钟内完成一次真实任务"的最短路径**：学生选一个明天真要说的目标 → 听一遍示范 → 开口说 → 只改一个最关键的错 → 换一个变量再说一次 → 带着一句能直接用的话离开。

它**不是**课程浏览页，**不是**聊天窗口，**不是**发音测评器。它是「任务卡（Task Card）」形式的定时会话。

**与现有 AI Coach 的关系（关键约束）**：

| 现有能力 | Quick Speak 如何处理 |
|---|---|
| `MandarinAiCoachExperience` 的 6 阶段 `WELCOME→TEACH→RECALL→COMPREHENSION→ROLEPLAY→COMPLETE`（`components/MandarinAiCoachExperience.tsx:17`） | **不新建一条链路**，而是在其上加一个「任务卡包装层」：TEACH 之前插入 `TARGET`（选目标），COMPREHENSION 在很多任务中**跳过**（见 §3.3 取舍说明），RECALL→ROLEPLAY 之间插入 `SHIFT`（变化追问） |
| AI 会话 `/api/mandarin-coach/conversation`（14 个必填字段，`answer.maxLength=320`） | **复用**，不新增接口。教学动作由「会话返回的 `teachingStrategy` + `skillIds` + 计划层 `policy`」共同体现 |
| 中文 TTS `/api/chinese-tts`（`zh-CN-XiaoxiaoNeural`，`rate ∈ {normal, slow}`） | **复用**。`slow` 已经是**真·放慢**（供应商侧参数），不是前端 playbackRate。**不新增语音供应商** |
| 印尼语 TTS `/api/tts`（仅接受不含汉字文本，`maxLength 500`） | **复用**，用于场景 A 的示范朗读 |
| 发音接口 `/api/mandarin-coach/pronunciation`（422 = 空转写） | **复用**，但需在 UI 层补「转写≠发音」的文案分层（当前 `MandarinAiCoachExperience.tsx:128` 已把 422 映射为"没听清"，方向正确，Quick Speak 需固化并加断言） |
| 每日本地存储 `CoachProfile v4`（`lib/mandarin-ai-coach.ts`） | **复用**，不新增存储键 |

---

## 1. 五阶段时间盒（总 5:00）

时间是**设计预算**，不是硬性拦截。超时**不弹窗、不清场**，只在进度条上给出"已超预算"的柔提示（见 §5.4）。

| # | 阶段 | 时间窗 | 累计 | 学生要做什么 | 系统要做什么 | 失败即退出条件 |
|---|---|---|---|---|---|---|
| 1 | **选择目标** `PICK` | 0:00 – 0:25 | 0:25 | 从 3 张任务卡里点 1 张（或说一句"我要跟司机说明天八点接我"） | 展示 ≤3 张卡，每卡 1 个中文任务 + 1 个印尼语任务名；默认高亮"上次没说完的那张" | 25s 内无操作 → 自动选中高亮卡并进入下一阶段（**不罚、不提示"你太慢"**） |
| 2 | **简短示范** `DEMO` | 0:25 – 1:15 | 1:15 | 听 1 句示范（键句），可选点"再慢一点" | 只播**1 句**目标句，播 `normal` 一次；`slow` 最多再播 1 次；同屏只显示中文 + 拼音 + 1 行母语释义 | 连续 2 次 TTS 请求失败 → 降级为纯文本大字卡 + 拼音，**不阻塞**开口 |
| 3 | **开口** `SPEAK` | 1:15 – 2:20 | 2:20 | 按下麦克风说 1 句话 | 录音 → STT → 判定；**首轮结果只做"能不能听懂"判断**，不做满分判定 | 空转写 / 422 → **不计失败**，走 §4.2 ASR 分支 |
| 4 | **纠错** `FIX` | 2:20 – 3:20 | 3:20 | 听 1 个纠正点，改 1 处再说一次 | **只输出 1 个纠正点**；第 2 次同错 → 换策略（`COACH_RETRY_POLICY.changeStrategyAt=2`）；第 3 次 → 给"保存到复习 + 继续"出口（`offerSaveAndSkipAt=3`） | 3 次仍不过 → 强制给出口，**必须**允许带着"待复习"离开 |
| 5 | **变化追问** `SHIFT` | 3:20 – 4:20 | 4:20 | 用同一个句型换 1 个变量再说一次 | 只给 1 个变量（时间 / 地点 / 对象 三选一），并说明"只换了什么" | 学生不会 → 允许回退到"跟我念一次"，**不判失败** |
| 6 | **任务完成** `DONE` | 4:20 – 5:00 | 5:00 | 看结果、听回放、决定"保存复习 / 再来一次 / 换任务" | 给出 1 句可直接复制/播放的成品句 + 掌握度圆点 + 3 个按钮 | — |

**设计意图说明**：

- **总时长 5 分钟不是巧合**：现有会话里 `answer` 上限 320 字符、`followUp` 上限 160 字符——AI 单轮输出本来就不长，5 分钟 ≈ 6~8 轮，正好在语境窗口内不丢上下文。
- **DEMO 只占 50 秒**：因为现有 TEACH 阶段已经有"听 + 拼音 + 拆块（`chunks`）"，Quick Speak 不重复造轮子，只是**把输出压到 1 句**。
- **纠错阶段独占 60 秒**：这是唯一"允许重复"的阶段，也是 TIS 中 CQ（纠错质量 20 分）与 TA（教学动作 25 分）的主要打分窗口。

---

## 2. 阶段状态机（与现有 Phase 的映射）

```
Quick Speak 语义层       现有 MandarinAiCoachExperience Phase
─────────────────────────────────────────────────────────────
PICK        ──────────────  WELCOME（选任务卡 = 选 lesson/expression 子集）
DEMO        ──────────────  TEACH（只展示 active 这 1 条，不 advance）
SPEAK       ──────────────  TEACH 内的首次 submitVoice('PRONUNCIATION')
FIX         ──────────────  TEACH 内的 retry（受 COACH_RETRY_POLICY 约束）
            ──────────────  （可选）COMPREHENSION —— 见 §3.3
SHIFT       ──────────────  RECALL（换变量后要求独立产出）
DONE        ──────────────  ROLEPLAY 通过后 / COMPLETE
```

**映射原则**：Quick Speak **不新增 Phase 枚举值**，用「会话配置 + 前端任务的 stage 标记」表达。理由：

1. `Phase` 类型被 `nextPhaseAfterSkippedAssessment`、`evidenceDefinitionForActivity`、`recordPersonalizationEvidence` 三处消费（`lib/mandarin-coach-access-continuity.ts`、`lib/mandarin-coach-personalization.ts`）。新增枚举值会波及证据链与掌握度计算，超出"设计"边界。
2. 现有 `evidenceDefinitionForActivity` 已经区分 `GUIDED_STT` / `ACTIVE_RECALL_STT` / `ROLEPLAY_TASK`，语义足够承载 Quick Speak 的三个开口点。

**若后续要落地 Quick Speak 独立的 stage 标记，建议字段**（不在本轮实现）：

```ts
type QuickSpeakStage = 'PICK' | 'DEMO' | 'SPEAK' | 'FIX' | 'SHIFT' | 'DONE';
// 挂在 CoachProfile 的旁路对象里，例如 profile.quickSpeak?: { stage, taskCardId, startedAt, budgetMs }
// 注意 CoachProfile.version 目前是 4，新增字段必须走 version 升级 + restore 兼容分支
```

> ⚠️ **实现风险提示**：`restorePersonalizationState` 要求 `profile.version === 1`（个性化侧），而 `CoachProfile.version` 是 `4`（会话侧）。两套版本号已不一致，新增 Quick Speak 字段时应**只动会话侧 profile 并在 read 时做缺省填充**，不要顺手改个性化侧版本号。

---

## 3. 两个完整场景的逐轮脚本

### 3.0 场景共同约束（两方向都适用）

| 约束 | 数值 / 规则 | 依据 |
|---|---|---|
| 每轮 AI 输出新知识点 | **≤ 1 个** | 断言 `MAX_NEW_ITEMS=1`（《评分标准》§2） |
| 每轮 AI 输出纠正点 | **≤ 1 个** | 断言 `SINGLE_CORRECTION_POINT` |
| 首轮禁止要求完整长句 | 只要求 1 个意群 / 1 个词块 | 案例 `ID-ZH-001` / `ID-ID-001` 的 `forbidden_teacher_action` |
| 出现"我不会 / 我不敢"类元话语 | **先安抚一句，再给 1 个可复制句**，禁止评价能力 | 断言 `NO_NEGATIVE_EVAL` / `NO_ABILITY_ATTRIBUTION`（P0-5） |
| 语音转写异常 | **绝不计入发音错误** | 断言 `ASR_ERROR_NOT_PRON_ERROR`（P0-1） |
| 第 3 次同错 | 必须给"保存复习 + 继续"出口 | `COACH_RETRY_POLICY.offerSaveAndSkipAt = 3` |

---

### 3.1 场景 A｜中国人学印尼语：安排司机明天接人

**任务卡**（PICK 阶段展示）：

| 卡片 | 中文任务 | 印尼语任务名 | 目标句 | 课程锚点 |
|---|---|---|---|---|
| A-1（默认） | 让司机明天八点来接我 | Jemput saya besok jam delapan | `Besok jam delapan jemput saya ya.` | `lib/driver-experiences.ts#EXP-DRV-001`（真实句为 `Besok pagi jam setengah delapan jemput saya di depan rumah ya.`，Quick Speak 用其**简化变体**，见下方 fidelity 说明） |
| A-2 | 明天改成八点来接我 | Besok jam delapan ya | `Besok jemput saya jam delapan ya.` | `EXP-DRV-031`（课程原文：`明天改成八点来接我。`） |
| A-3 | 在大堂等我 | Tunggu saya di lobi | `Tunggu saya di lobi ya.` | `EXP-DRV-032`（课程原文：`在大堂等我。`） |

> **fidelity 声明（必须保留在文档里，不能省略）**：
> - `EXP-DRV-001` 的**课程原文**是「明天早上七点半到我家门口接我」，印尼语 `Besok pagi jam setengah delapan jemput saya di depan rumah ya.`。Quick Speak A-1 的 `Besok jam delapan jemput saya ya.` 是**同一句式的简化变体**（去掉 `pagi` / `setengah` / `di depan rumah`），用途是零基础首轮。**它不是课程原文**，不得在验收中当作"课程内容已覆盖"的证据。
> - A-2 / A-3 的印尼语与中文与课程原文**逐字对应**，可直接作为课程内容引用。
> - 「中国人学印尼语」方向**没有独立的 Level 1-30 印尼语课程**：`lib/love-indonesian-content.ts` 是真实内容库（100 个 LOVE 场景）但**不覆盖工作场景**；工作场景只有 `lib/driver-experiences.ts`（40 条）。因此场景 A 的"课程锚点"只能是 driver 场景，**不能声称在 30 天印尼语课程里**。

#### 逐轮脚本（6 轮，教师侧 = AI，学生侧 = 模拟）

| 轮 | 阶段 | 学生输入 | AI 应该做的（正面） | AI 绝对不能做的（反面） | 对应断言 | 对应案例 |
|---|---|---|---|---|---|---|
| R1 | DEMO | （无输入，听示范） | 播 1 次 `Besok jam delapan jemput saya ya.`（`rate=normal`）；同屏：`Besok jam delapan jemput saya ya.` / `明天八点来接我。` / 拆块 `Besok`·`jam delapan`·`jemput saya ya` | 不得同时播 `setengah delapan` / `di depan rumah` 等更多细节；不得一次展示 3 个不同表达 | `MAX_NEW_ITEMS=1`、`HAS_SPLIT_CHUNKS` | ID-ZH-001 |
| R2 | SPEAK（首开口） | `（沉默 6 秒）呃…这个…我不太会说，你先告诉我最简单的说法。` | 先用印尼语安抚 1 句（**不评价能力**），再邀请只重复第 1 块 `Besok` | 语法讲解开头 / 说"这么简单都不会" / 要求第一轮就说整句 | `INVITES_SPEAKING`、`NO_NEGATIVE_EVAL`、`NO_LECTURE` | ID-ZH-001 |
| R3 | SPEAK（跟读整句） | `Besok jam delapan jemput saya ya…（停顿）是不是这样？我刚刚是照着你念的。` | 识别为"跟读成功但未独立生成"，**不判 PASS**；下一轮把提示降到只给 `Besok…` 让学生补完 | 直接判"掌握"并推进新内容；只回"很好/正确"而不指出具体哪里对 | `NOT_PASS_ON_ECHO`、`REDUCES_PROMPT` | ID-ZH-002 |
| R4 | FIX（纠错，第 1 次错） | `Besok jam delapan jemput saya ya…`（把 `jemput` 说成 `jemur`） | 只指出 `-put` 这一处；肯定其余部分正确；请学生只练 `jemput` 一个词 | 纠正整句所有成分；一次给 3 条规则 | `SINGLE_CORRECTION_POINT`、`LOCATES_MINIMAL_PAIR` | ID-ZH-003（第 1 次） |
| R5 | FIX（纠错，第 3 次仍错） | `Besok jam delapan jemur saya ya…（第 3 次）哎呀又错了，是不是我耳朵有问题。` | **必须换策略**：①只对比 `jemput` / `jemur` 各读一次；②否定"耳朵有问题"的自我归因（"这是很常见的一组音，不是听力问题"）；③给"保存到复习 + 继续"出口 | 同一策略第 3 次重复；附和"你听力可能不行"；无出口 | `STRATEGY_CHANGED_AT_ATTEMPT_3`(权重 2)、`OFFERS_EXIT`、`NO_ABILITY_ATTRIBUTION`（P0-5） | ID-ZH-003（第 3 次） |
| R6 | SHIFT（变化追问） | `Besok jam delapan jemput saya ya. 对了，要是下午三点呢？` | 先确认主任务完成（1 句）→ **只换时间**一个变量 → 给 `Jam tiga sore jemput saya ya.` → 立刻要求学生说一次 | 同时改时间+地点+人称（三变量一次给）；忽略学生的迁移需求；进入无关新课 | `SINGLE_VARIABLE_CHANGE`(权重 2)、`REQUIRES_PRODUCTION`、`CONFIRMS_COMPLETION` | ID-ZH-005 |
| — | DONE | — | 展示成品句 + 拼音 + 可播放；掌握度圆点；3 个按钮（模拟听 / 再来一次 / 换任务） | 不得自动跳走；不得强制跳转商城或课程列表 | — | — |

**ASR 分支（不占独立轮次，任何阶段触发）**：若 R2/R4 出现空转写或 422：

```
AI 文案：「Suara belum terdengar jelas.」（= 没听清，不是发错）
按钮：  [🎙️ 再说一次]  [⌨️ 改用打字]
副作用：attempts 不 +1；wrong_count 不 +1；saved_for_review 不写
```
对应案例 `ID-ZH-004`，断言 `ASR_ERROR_NOT_PRON_ERROR`（P0-1）、`NO_EVIDENCE_WRITE`、`OFFERS_TEXT_FALLBACK`、`NO_NEEDS_REVIEW`。

**非空但畸变转写（真实风险，必须显式设计）**：如果 STT 返回的是"看起来像印尼语但意思不对"的字符串（例如把 `jemput` 转成 `jemur` 以外的怪词），**当前实现会进入模型判定**（`route.ts:112-117` 只在转写为空时 422）。因此 Quick Speak 必须加一条**前端兜底规则**：

> 当 `verdict === 'RETRY'` 且模型的 `feedback` 文本命中了「我听成 X」类不明词汇时，UI 追加一行固定文案：`Kalau kamu yakin sudah benar, coba rekam lagi atau ketik jawabanmu.`（如果你确定说对了，可以重录或打字）。这条文案的作用是**把"可能听错"的可能性交还给学生**，而不是让 AI 单方面判定发音错误。

这条规则不需要改后端，只在前端渲染层加；但它**必须**被写入浏览器测试清单（《真实用户测试计划》§浏览器层）。

---

### 3.2 场景 B｜印尼人学中文：向中国老板汇报工作进度

**任务卡**（PICK 阶段展示）：

| 卡片 | 印尼语任务 | 中文任务名 | 目标句 | 拼音 | 课程锚点 |
|---|---|---|---|---|---|
| B-1（默认） | Lapor kalau sudah selesai | 汇报"好了" | `好了` | `hǎo le` | `lib/mandarin-work-course.ts` Day 12 词表（第 27 行 `'好了':'sudah selesai / sudah siap'`） |
| B-2 | Bilang belum selesai | 汇报"还没好" | `还没好` | `hái méi hǎo` | Day 12 词表（`'还没':'belum'` + `'好'`） |
| B-3 | Lapor satu selesai satu belum | 汇报"一个完成一个没完成" | `这个好了，那个还没。` | — | Day 12 词表组合（`这个` / `好了` / `那个` / `还没` 均在 Day 12 及之前出现） |

> **fidelity 声明**：
> - `好了` 与 `还没` **逐字在 Day 12 词表中**（`lib/mandarin-work-course.ts:27`），Day 12 对话也是 `[['老板','好了吗？'],['员工','还没。'],...]`（同文件第 116 行）。
> - `还没好`（三字）**不在词表里**：词表只有 `还没`。拼音 `hái méi hǎo` 由 `toPinyinSegments` 逐字生成（`还→hái`、`没→méi`、`好→hǎo`），这是**可推导但非原句**的组合，不得声称"课程已教过整句"。
> - `这个好了，那个还没。` 同理：四个词均在词表内，整句是**组合式**，不是课程原句。
> - **「印尼人学中文」方向没有独立课程文件**：仓库里 `ID_TO_ZH` 复用的是同一套 `mandarin-work-course`（中文为目标语）。这一点在《评分标准》§8 已列为"尚未验证事项"，此处不重复展开。
> - 拼音映射来源：`lib/mandarin-work-course.ts:49` 的 `pinyin` 表 + `:63` 的 `exactPinyin` 覆盖表（`不` 在去声前变 `bú`、`一` 在去声前变 `yí`）。

#### 逐轮脚本（6 轮）

| 轮 | 阶段 | 学生输入 | AI 应该做的（正面） | AI 绝对不能做的（反面） | 对应断言 | 对应案例 |
|---|---|---|---|---|---|---|
| R1 | DEMO | （听示范） | 播 `好了`（`rate=normal`，必要时 `slow`）；同屏：`好了` / `hǎo le` / `Sudah selesai.`；**只给这 1 个** | 不得同时给 `好了` / `做好了` / `还没` 三种回答；不得讲"了"的语法 | `MAX_NEW_ITEMS=1`、`HAS_PINYIN` | ID-ID-001 |
| R2 | SPEAK（首开口） | `（沉默）老板问我好了吗，我怕说错，就笑了一下。` | 先安抚（"笑一下没关系，两句话就够"）→ 邀请只说 `hǎo` 一个音节 | 批评沉默；一次给三种回答；要求说整句 | `INVITES_SPEAKING`、`NO_NEGATIVE_EVAL` | ID-ID-001 |
| R3 | SPEAK（跟读 → 真实提问） | `Hǎo le… 但你问我我会说，老板真的站在那我又忘了。` | 识别为**迁移失败**：改用迷你角色扮演（"老板：好了吗？"），学生只需答 2 个字 | 重复纯示范同一句；直接判"掌握"；要求长句 | `ROLEPLAY_PROMPT_GIVEN`、`MINIMAL_ANSWER_TARGET=2`、`NOT_PASS_ON_ECHO` | ID-ID-002 |
| R4 | FIX（声调错，第 1 次） | `Hái méi hào…`（`好` 读第四声） | 只定位 `好` 这一个音节的声调；只对比 `hǎo`(3) / `hào`(4) 一对 | 讲完整四声理论；纠正整句；标五度调值图 | `SINGLE_CORRECTION_POINT`、`ONE_TONE_CONTRAST_ONLY` | ID-ID-003（第 1 次） |
| R5 | FIX（第 3 次仍错） | `Hái méi hào… 我是不是永远学不会声调？` | **必须换策略**：①降为单音节练习（只说 `好`）；②用"高低走向"提示（不做五度标记法）；③明确"声调是技能不是天赋"；④给保存复习出口 | 第 3 次仍重复整句；附和"你学不会"；无出口 | `STRATEGY_CHANGED_AT_ATTEMPT_3`(权重 2)、`SINGLE_SYLLABLE_DRILL`、`NO_ABILITY_ATTRIBUTION`（P0-5）、`OFFERS_EXIT` | ID-ID-003（第 3 次） |
| R6 | SHIFT（变化追问） | `Hǎo le！我想跟老板汇报：这个做完了，那个还没，还有机器有点问题。` | 先确认单词级完成 → **只给 1 个汇报句** `这个好了，那个还没。` → **显式告诉学生"机器问题留到下一轮"** → 要求产出 | 一次给三段式汇报结构；忽略"机器有问题"这个真实需求 | `MAX_NEW_ITEMS=1`、`DEFERS_REMAINING`、`CONFIRMS_COMPLETION`、`REQUIRES_PRODUCTION` | ID-ID-005 |
| — | DONE | — | 成品句 + 拼音 + 播放；掌握度；3 个按钮 | 自动跳走 | — | — |

**ASR 分支（印尼口音特化）**：`ID-ID-004` 的设计点是 **STT 把 `hǎo le` 转成 `hau le`**——这是真实存在的口音转写现象，**不是发音错误**。

```
AI 文案：「Aku mungkin kurang dengar.」（我可能没听准。）
         （第二次仍异常 → 直接给拼音对照 hǎo le，并说"你的音可能没问题，是我没识别对"）
按钮：  [🎙️ 再说一次]  [⌨️ 改用打字]
禁止：  基于 hau 这个转写给出声调纠正
```
对应断言 `ASR_ERROR_NOT_PRON_ERROR`（权重 2）、`NO_EVIDENCE_WRITE`、`OFFERS_TEXT_FALLBACK`。

---

### 3.3 为什么 Quick Speak **跳过** COMPREHENSION 阶段

现有链路是 `TEACH → RECALL → COMPREHENSION → ROLEPLAY → COMPLETE`（`advanceTeaching`，`MandarinAiCoachExperience.tsx:146-147`：先 `setPhase('RECALL')`，RECALL 通过后才进 COMPREHENSION）。

Quick Speak 的取舍：

| 保留 | 理由 |
|---|---|
| TEACH（=DEMO+SPEAK+FIX） | 必须有，这是"学" |
| RECALL（=SHIFT） | 必须有，这是"验迁移"——没有它就无法区分"跟读"与"掌握"（`ID-ZH-002` / `ID-ID-002` 的核心风险） |
| ROLEPLAY（=DONE 的一部分） | 简化保留：DONE 阶段的成品句播放就是最小 roleplay 呈现 |

| 跳过 | 理由 | 代价（必须承认） |
|---|---|---|
| COMPREHENSION（4 选 1 选义） | 5 分钟内做 4 选 1 会挤掉"开口"时间；而且 Quick Speak 的目标是**说**，不是**认** | 无法验证学生是否只是机械模仿。**缓解**：把选义做成 SHIFT 阶段的**可选 8 秒轻量确认**（"这句话是说明天还是后天？"二选一），不计入主流程计时 |

> 这一取舍**必须**在 A/B 基线对比里单列一个观察项：Quick Speak 组的"理解正确率"可能低于完整 AI Coach 组，若低于 15 个百分点以上，则说明跳过 COMPREHENSION 不可接受。

---

## 4. 各阶段的退出 / 降级路径

### 4.1 中途退出（`MID_EXIT`）

覆盖案例（MID_EXIT 共 9 例，逐条列出便于回归）：
`ID-ZH-013`、`ID-ZH-023`、`ID-ZH-034`、`ID-ZH-043`、`ID-ID-013`、`ID-ID-023`、`ID-ID-033`、`ID-ID-044`、`ID-ID-050`。

| 退出时机 | 学生行为 | 系统必须做的 | 绝对不能做的 |
|---|---|---|---|
| PICK 阶段退出 | 直接返回 / 关页面 | 什么都不保存（还没选目标） | 弹"你确定要走吗"劝阻框 |
| DEMO 阶段退出 | 听完就走 | 保存 `stage='DEMO'`，下次进入直达 DEMO，**不从头开始** | 不保存进度导致下次重听 |
| SPEAK 阶段退出（未开口） | 按了麦克风又取消 | 保存 `stage='SPEAK'`；不清空已听的 DEMO 计数 | 计为"放弃"并扣减掌握度 |
| FIX 阶段退出（已 2 次错） | 直接走 | **必须自动**写入"待复习"（`saved_for_review=true`，`pronunciation_status='NEEDS_REVIEW'`），并在下次进入时提示"上次卡在 jemput / hǎo" | 丢失错误历史（这是最贵的学费） |
| SHIFT 阶段退出 | 说完主句就走 | 视为**主任务已完成**；SHIFT 未完成不影响 DONE 记录 | 判整次会话失败 |
| DONE 阶段 | — | — | — |

**设计原则：中途退出的学生，回来时必须感到"被记住"，而不是"被清零"。** 这是 `MandarinCoachPersonalization`（`components/MandarinCoachPersonalization.tsx`）已有的能力方向，Quick Speak 只是把它前移到"退出即保存"。

### 4.2 ASR 失败（`ASR_FAILURE`）

三层判定（与《评分标准》§3 判定矩阵一致）：

| 层 | 触发 | 判定 | 是否计入学习证据 |
|---|---|---|---|
| L1 空转写 | `transcript === ''` 或 HTTP 422 | **不是发音问题** | ❌ 不计 |
| L2 疑似畸变 | 转写非空，但与目标句编辑距离 > 阈值，且模型 `verdict='RETRY'` | **先假设可能是识别问题**，要求学生重录或打字；不直接给发音纠正 | ❌ 第一次不计；第二次仍畸变才计 1 次 `RETRY` |
| L3 稳定复现 | 同一音节/词连续 ≥2 次被转写为同一个错误形式 | 允许发音反馈，但措辞**必须**是"我听到的接近 X" | ✅ 计 |

**关键措辞禁列**（来自《评分标准》§3）：禁止"你发成了 X"、"你的发音错了"、"你把 X 说成 Y"。允许"我听到的比较接近 X"、"我们再对比听一次"。

### 4.3 语音服务不可用（降级）

| 故障 | 检测 | 降级动作 | 学生可见文案 |
|---|---|---|---|
| `/api/chinese-tts` 503/502 | `!response.ok` 或 header 校验失败（现有代码已校验 `X-IndoBrain-Chinese-TTS-Voice === 'zh-CN-XiaoxiaoNeural'`，`MandarinAiCoachExperience.tsx:110`） | 大字文本 + 拼音，**不用浏览器 TTS 冒充** | `Audio Mandarin zh-CN belum tersedia.`（现有文案，`MandarinAiCoachExperience.tsx:113`，明确说"没有使用替代声音"） |
| `/api/tts`（印尼语）503 | 同上 | 同上 | 同上，印尼语版本 |
| STT 超时 | 请求 > 25s | 给"重试 / 打字"两条路 | `Suara belum terdengar jelas.` |

**明确不做的**：不引入第二个 TTS 供应商做 fallback，不引入浏览器 `speechSynthesis` 作为兜底（音色不一致会误导发音模仿）。

---

## 5. 界面结构与交互细节

### 5.1 单屏结构（以 390 宽为例）

```
┌──────────────────────────────┐
│ ← 返回        1/6  0:48/5:00 │  ← 顶栏：阶段序号 + 剩余预算（不倒数到 0 逼人）
├──────────────────────────────┤
│  ●●●○○  阶段进度              │  ← 6 点进度，当前点放大
├──────────────────────────────┤
│                              │
│      Besok jam delapan       │  ← 目标句：主字号 32~36px
│      jemput saya ya.         │
│                              │
│      明天八点来接我。          │  ← 母语释义：16px，次要色
│                              │
│   ┌────────┐ ┌────────┐      │
│   │ 🔊 听   │ │ 🐢 慢   │      │  ← 两个 TTS 按钮，44×44 最小点击区
│   └────────┘ └────────┘      │
│                              │
│   [Besok] [jam delapan]      │  ← 拆块（chunks），浅底，可点单块播放
│   [jemput saya ya]           │
│                              │
├──────────────────────────────┤
│   🎙️  Ucapkan sekarang        │  ← 主 CTA：全宽，min-h 48px
├──────────────────────────────┤
│   打字回答（次级文本链接）      │
└──────────────────────────────┘
```

**高度预算（375×667 最紧的情况）**：

| 区块 | 高度 | 说明 |
|---|---|---|
| 顶栏 | 48 | 含进度 |
| 阶段进度点 | 20 | |
| 目标句 + 释义 | 120 | 单句；若换行则 160 |
| TTS 按钮行 | 56 | |
| 拆块区 | 72~112 | 1 行 ~ 2 行 |
| 主 CTA | 56 | min-h 48 + 8 间距 |
| 打字链接 | 40 | |
| 安全区 | 底部 +34 | iOS home indicator |
| **合计** | **446 ~ 526** | 667 下可用 ≈ 667，**余量 ≥ 141px**，不需要滚动 |

> 这条高度预算的意义：**375 宽的 iPhone SE 上，Quick Speak 首屏必须是"句 + 听 + 说"三件事都不需要滚动**。如果实现时超了，优先压缩拆块区（折叠成 1 行 + "展开"），**不要**压缩主 CTA。

### 5.2 各阶段可见元素矩阵

| 元素 | PICK | DEMO | SPEAK | FIX | SHIFT | DONE |
|---|---|---|---|---|---|---|
| 顶栏进度 | ●○○○○○ | ●●○○○○ | ●●●○○○ | ●●●●○○ | ●●●●●○ | ●●●●●● |
| 目标句大字号 | — | ✅ | ✅ | ✅ | 新句 | 成品句 |
| 母语释义 | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| 拼音 | — | ✅ | ✅ | **纠正点音节加粗** | 新句拼音 | ✅ |
| 听 / 慢按钮 | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| 拆块区 | — | ✅ | ✅ | 只留错的那块 | — | — |
| 麦克风 CTA | — | — | ✅ | ✅ | ✅ | — |
| 打字入口 | ✅（可打字选任务） | — | ✅ | ✅ | ✅ | — |
| 出口（保存复习） | — | — | — | 第 3 次错后出现 | — | ✅ |
| 掌握度圆点 | — | — | — | — | — | ✅ |

### 5.3 反馈文案规范

**每个反馈块只能是三种形态之一**（禁止混排）：

| 形态 | 结构 | 字数上限 | 示例 |
|---|---|---|---|
| **肯定 + 1 个纠正点 + 邀请** | 3 句，逐句 ≤ 22 字 | ≤ 66 字 | `Bagus, waktunya sudah benar. Cuma bagian "jemput" perlu jelas sedikit. Coba ulangi satu kata itu ya.` |
| **没听清（ASR）** | 1 句 + 2 按钮 | ≤ 30 字 | `Suara belum terdengar jelas.` |
| **出口（第 3 次）** | 1 句共情 + 1 句建议 + 1 按钮组 | ≤ 50 字 | `Kata ini memang sering tertukar. Simpan dulu, nanti kita ulang besok ya.` |

**依据**：现有 `answer.maxLength=320` 是**上限不是目标**；Quick Speak 的自我约束是 **≤ 66 字**，约为上限的 1/5。这个数值来自移动端可读性：66 字在 375 宽、16px 字号下正好 3 行，4 行以上学生开始跳过。

### 5.4 超时与柔提示

- 预算耗尽时（例如 5:00 已到但还在 FIX）：
  - 进度条**变细变灰**，文字变为 `Waktu hampir habis`（时间快到了）
  - **不弹窗、不清场、不强制跳转**
- 只在超过 **150%**（7:30）时，才在底部出现一行可关闭提示：`Mau simpan dulu dan lanjut besok?`（要不要先保存明天继续？）—— 还是一个**问句**，不是判决。

---

## 6. 与 TIS 评分的对接

Quick Speak 的每个阶段都是评分取样点，映射到《AI Coach 教学质量评分标准》的六维度：

| Quick Speak 阶段 | 主要取样维度 | 必须通过的断言 | 若失败则 |
|---|---|---|---|
| PICK | —（不计分，只计可用性） | 卡片 ≤3 张、每卡有母语 | 可用性问题，记入 UX 缺陷单 |
| DEMO | **BR 简洁（10）** | `MAX_NEW_ITEMS=1`、`HAS_SPLIT_CHUNKS` | BR ≤ 2 分 |
| SPEAK | **TA 教学动作（25）**、**IP 独立表达（15）** | `INVITES_SPEAKING`、`NO_NEGATIVE_EVAL`、`NOT_PASS_ON_ECHO` | TA/IP ≤ 2 分 |
| FIX | **CQ 纠错质量（20）**、**TA（25）** | `SINGLE_CORRECTION_POINT`、`STRATEGY_CHANGED_AT_ATTEMPT_3`、`NO_ABILITY_ATTRIBUTION` | 命中 P0-5 → **直接 BLOCKER** |
| SHIFT | **DA 难度适配（15）**、**TC 任务完成（15）** | `SINGLE_VARIABLE_CHANGE`、`REQUIRES_PRODUCTION` | DA ≤ 2 分 |
| DONE | **TC 任务完成（15）** | `CONFIRMS_COMPLETION` | TC ≤ 2 分 |
| 任意阶段 ASR | **安全项（P0-1）** | `ASR_ERROR_NOT_PRON_ERROR`、`NO_EVIDENCE_WRITE` | 命中 P0-1 → **直接 BLOCKER** |

**Quick Speak 通过门槛（建议，需 A/B 后再定）**：

| 指标 | 门槛 |
|---|---|
| 单次会话 TIS 总分 | ≥ 80（与《评分标准》PASS 线一致） |
| 5 次连续会话中 P0 命中 | 0 |
| 到达 DONE 的比例（模拟学生脚本跑） | ≥ 80% |
| 平均实际用时 | ≤ 5:30（允许 10% 溢出） |
| 平均 AI 输出字数 | ≤ 66 字/轮 |
| 平均模型调用次数/会话 | ≤ 8（与 6 阶段 + 2 次容错对齐） |

---

## 7. 成本边界（不增加昂贵语音服务）

| 项 | 现状 | Quick Speak 是否增加 |
|---|---|---|
| 中文 TTS 调用 | `/api/chinese-tts`，24h 内存缓存 100 条，key = `sha256(voice:rate:text)` | **不增加**：同一句 `normal` + `slow` 各最多 1 次 = 2 次，且第二次起命中缓存 |
| 印尼语 TTS 调用 | `/api/tts`，24h 缓存 200 条 | **不增加**：同上 |
| STT 调用 | 每次 `submitVoice` 1 次 | **减少**：Quick Speak 限制开口 ≤ 4 次（SPEAK 1 + FIX 2 + SHIFT 1），现有流程无上限 |
| 文本模型调用 | 每轮会话 1 次（`ZERO_OR_ONE_PRIMARY_WITH_ONE_BOUNDED_REPAIR`） | **减少**：轮次从"无上限"降到 ≤ 6 |
| 新增供应商 | — | **零** |
| 新增动画/素材 | — | **零**（现有 CSS transition 已够用；进度条用 `transition-all`，不引入动画库） |

**硬性约束**：Quick Speak **不引入** streaming TTS、不做实时语音识别（全双工）、不做语音降噪外的音频后处理（`AiCoachRecorder` 已用 `echoCancellation + noiseSuppression`，够用）。

---

## 8. 与《评分标准》§9 产品风险的衔接：中文解释模式

《评分标准》§9 记录了一个**真实冲突**：

- 场景 A 的用户画像是「刚到印尼、完全不会印尼语的中国老板」
- 但 `mandarin-ai-coach.ts:380` 的系统提示硬约束是 **BEGINNER 一律用简单印尼语解释，即使输入是中文**
- 且 `preferredExplanationLanguage` 只有 `'INDONESIAN' | 'MIXED'` 两个值（`lib/mandarin-ai-coach.ts:128`、`lib/server/mandarin-ai-coach.ts:322`、`app/api/mandarin-coach/conversation/route.ts:72`），**没有 `CHINESE`**

**这对 Quick Speak 意味着什么**：

| 情形 | 现状行为 | 结果 |
|---|---|---|
| 中国老板用中文问"这个怎么说" | 被归类后仍以印尼语解释 | 学生看不懂解释 → **5 分钟内无法完成 PICK/DEMO** |

**Quick Speak 的应对（分两级，均不改后端）**：

1. **UI 级兜底（可立即做，零后端改动）**：DEMO 阶段的目标句卡片**固定展示中文释义 + 拼音**，不依赖 AI 的解释文本。这样即使 AI 说印尼语，学生也能从卡片上读到中文。这是 Quick Speak 的**必须项**，也是本设计里对 §9 风险的最小可行回应。
2. **枚举级修复（需后端改动，本轮只提方案）**：在 `preferredExplanationLanguage` 增加 `'CHINESE'`，并在系统提示里放开"BEGINNER 用印尼语"的硬约束为"BEGINNER 用**学生母语**"。**风险**：这会改变现有中文学习者的体验，属于产品决策，不是测试能定的。

> **结论**：Quick Speak v1 **不依赖**中文解释模式也能上线（靠 UI 级兜底），但**必须在真实用户测试里专门测**"完全不懂印尼语的中国老板"能否在 5 分钟内走完场景 A。这是《真实用户测试计划》的 P0 必测项。

---

## 9. 本设计尚未验证的事项

| # | 未验证项 | 为什么没验证 | 验证方式 |
|---|---|---|---|
| 1 | 真实 5 分钟是否够用 | 未跑真实用户，只有脚本推演 | 真实用户测试 8 人，测实际用时分布 |
| 2 | 375 宽首屏是否真的不滚动 | 本轮未启动本地服务、未跑浏览器（仅做高度预算推演） | 浏览器测试层，3 视口截图 |
| 3 | 场景 A 的简化句 `Besok jam delapan jemput saya ya.` 是否自然 | 未请印尼母语者复核 | 母语者 2 人判断"这句能不能直接用" |
| 4 | 场景 B 的 `还没好` 组合是否被印尼工人理解 | 该句不在词表，是组合式 | 印尼母语者 + 目标用户各 3 人 |
| 5 | 跳过 COMPREHENSION 是否伤害理解 | 需 A/B 数据 | 基线对比实验（见《真实用户测试计划》§5） |
| 6 | 「我听到的接近 X」这类措辞学生是否能理解 | 未做文案可用性测试 | 5 人 5 秒理解测试 |
| 7 | 66 字上限是否真的够表达一个纠正点 | 未实测 | 用 100 案例的 `expected_teacher_action` 逐条压缩，看能否 ≤66 字 |
| 8 | `teachingStrategy` 字段（上限 80 字符）能否承载 11 种教学动作的区分 | 未跑模型 | 模型模拟层，统计 `teachingStrategy` 实际取值分布 |
| 9 | 非空畸变转写的前端兜底规则是否会误伤真错 | 未实测 | 构造 20 条"真错 vs 假错"样本人工标注 |
| 10 | 印尼语 TTS 对 `jemput` / `jemur` 的最小对立是否可辨 | 未听 | 母语者听测 |

---

## 10. 交付物边界声明

- 本文档为**设计**，不含代码。
- 引用的所有代码位置均在 `IndoBrain-ID @ a86dde0` 上**只读核实**过（`grep` / `sed` 读取，未编译、未运行）。
- 本轮**未启动任何本地服务**、**未调用模型 API**、**未消耗额度**、**未修改仓库**、**未提交 Git**、**未部署**。
- 场景 A/B 的 `fidelity` 声明（§3.1、§3.2 中的引用块）**不得删除**——它们记录了哪些句子是课程原文、哪些是简化变体、哪些是组合式，直接决定验收时能否声称"课程已覆盖"。
