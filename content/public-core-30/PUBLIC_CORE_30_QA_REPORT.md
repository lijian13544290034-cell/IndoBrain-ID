# 日常高频中文公共课程 · 第一批 30 条候选 QA 报告

日期：2026-10-25 · 分支：`feature/public-core-30-candidates` · 生成脚本：`scripts/build-public-core-30.mjs`（可复跑）

## 1. 选出的表达数量

**30 / 30 条全部交付**，未凑数：每条都来自现有 279 条 Real Use 语料（`docs/BASIC_ESSENTIALS_REAL_USE_V1_GROUPS_01_39.md` 与 `_40_93.md`），`sourceId`（`basic-essentials-G组#序号`）+ `sourceFile` 可逐条回溯原文。

## 2. 实际使用的源文件

- `docs/BASIC_ESSENTIALS_REAL_USE_V1_GROUPS_01_39.md`（18 条）
- `docs/BASIC_ESSENTIALS_REAL_USE_V1_GROUPS_40_93.md`（12 条）

未使用 300 词源库（279 条语料已覆盖所需表达，避免引入第二口径）。

## 3. 覆盖的课程分类（10 类 × 3 条，自然配平，无凑数句）

问候与礼貌 / 人称与位置 / 数字与数量 / 日期与时间 / 购物与价格 / 吃饭与饮水 / 出行与位置 / 简单请求 / 日常回应 / 基础生活沟通

## 4. 中文质量问题

- 无方向颠倒：30 条均以印尼语原意为准确定中文，未机械调换。
- 本轮对语料中文做的反向教学调整：全部保留自然口语形态（如 `Ini berapa?→这个多少钱？`、`Tunggu sebentar ya.→稍等一下。`），未出现翻译腔。
- 有意排除的高重复候选：`Terima kasich.→谢谢。`、`Mahal banget.→太贵了。` 等 8 条与 Day 1–60 逐字重复（validator 会直接拒绝），已替换为近义不重复表达（稍等一下 / 就是这个 等）。

## 5. 拼音问题（已在 reviewNotes 中逐条标注）

| 条目 | 处理 |
|---|---|
| CN-HF-007 一个人 | 「一」变调 yí（第四声前） |
| CN-HF-009 一点点就行 | 「一」变调 yì（第三声前） |
| CN-HF-016 不要太辣 | 「不」变调 bú（第四声前） |
| CN-HF-021 先一直往前 | 「一」变调 yì（第二声前） |
| CN-HF-025 稍等一下 | 「一下」读 yí xià |
| CN-HF-008 两瓶 | 量词用「两」不用于「二」，note 已注明 |
| 轻声处理 | 先生/意思(sheng, si)、吗/了/吧/这个(ge, le, ma, ba)、舒服(fu)、什么(me) 均按实际读音标轻声 |

全部拼音为带声调符号、无数字标注（符合 validator 硬规则）；语气词「哦」标 ó（CN-HF-017）。

## 6. 重复项目

- **包内**：0 重复（normalized 中文 30 条互不相同）。
- **与 Day 1–60 工作中文 / Level 2 / Golden Quantity**：**0 逐字重复**（validator `duplicates existing canonical` 检查通过）。2 条近义句（厕所在哪里 / 稍等一下）已在 reviewNotes 说明保留理由。

## 7. 自动 validator 结果

`scripts/validate-mandarin-course-import.mjs` 实测两遍：

1. **交付版（reviewStatus=REVIEW_PASSED）**：唯一提示 `reviewStatus: must be HUMAN_APPROVED before import` —— 这正是流程设计，不是数据缺陷。
2. **模拟人工批准副本（HUMAN_APPROVED + 占位 reviewReference）**：**0 错误**。即人工批准后无需任何数据修改即可通过正式导入校验。

其余硬规则全部满足：ID `CN-HF-001…030` 合规、courseId `mandarin-public-core-30` 合规、`ttsText === chinese`（zh-CN 只读中文）、difficulty 1–3、tags 非空。

## 8. 可直接交给 Codex 集成的候选数量

**30 / 30。** 结构与 Schema 完全对齐（无字段映射猜测），重复检测已通过，拼音已自审并标注全部变调点。人工批准（reviewStatus → HUMAN_APPROVED + 真实 reviewReference）后可直接填入 `lib/server/mandarin-v2-reviewed-packages.ts`。

## 9. 尚需人工审核的内容

1. **拼音终审**（规范要求人工复核变调/多音字）：重点复核上表 6 处变调标注是否与项目教学口径一致（若项目惯用「一/不」标原调，仅需改 5 条拼音字符串，chinese/tts 不受影响）。
2. **语气词「哦」**（CN-HF-017）的声调标注口径（ó / ō）。
3. **正式 HUMAN_APPROVED 批准 + reviewReference 填写**——WorkBuddy 按规则不自行批准。
4. 品牌词不存在于本批（QRIS/e-toll/Wi-Fi 已全部避开），无需特殊 TTS 处理标记。

## 10. 结论

第一批 30 条满足「高价值、可独立学习、来源可追溯、重复清晰、自动校验通过」全部要求。批准后即可按 `docs/mandarin-v2-runtime-architecture.md` 激活清单进入 Preview 集成；不得绕过人工批准直接进 Production。
