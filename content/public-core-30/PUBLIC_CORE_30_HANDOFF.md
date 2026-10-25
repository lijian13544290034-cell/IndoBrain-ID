# Codex 交接说明 · 日常高频中文公共课程第一批（30 条）

日期：2026-10-25（rev2 人工批准版）· 内容来源提交：`c7f8083097260da89e797b89484af9318806d453`

审批标识：`USER-CHAT-APPROVAL-2026-10-25-PUBLIC-CORE-30-REV2`。来源为用户在本次聊天中明确确认人工测试与验收通过；未声称存在独立审核报告。

## 1. 文件位置

| 文件 | 路径 |
|---|---|
| 已批准 JSON（Schema 兼容） | `content/public-core-30/public_core_30_review.json` |
| 已批准 CSV（含追溯与审核列，UTF-8 BOM） | `content/public-core-30/public_core_30_review.csv` |
| QA 报告 | `content/public-core-30/PUBLIC_CORE_30_QA_REPORT.md` |
| 生成脚本（可复跑） | `scripts/build-public-core-30.mjs` |

## 2. 对应 Schema

`schemas/mandarin-course-import-v1.schema.json`（V1），类型 `PUBLIC_HIGH_FREQUENCY`。JSON 包结构与 Schema **逐字段一致**（`additionalProperties: false`，无多余字段）。

## 3. 字段映射（CSV ↔ JSON）

CSV 是审核视图；集成只使用 JSON。CSV 独有列的对应关系：

| CSV 列 | JSON 位置 | 说明 |
|---|---|---|
| `sourceId` / `sourceFile` / `reviewNotes` / `duplicateStatus` / `category` / `categoryZh` | 无（Schema 不允许附加字段） | 追溯与审核信息，保留在 CSV 与本文档 |
| 其余列（id/chinese/pinyin/indonesian/ttsText/difficulty/tags） | `expressions[]` 同名一字段 | 一一对应 |

课程级元数据在 JSON `course` 块：`id=mandarin-public-core-30`、`accessTier=FREE`、`requiresPermission=null`、`pathway.mode=SUPPLEMENTAL`、`recommendedAfterLessonId=null`。

## 4. ID 命名规范

- 表达 ID：`CN-HF-001` … `CN-HF-030`（符合 validator 正则 `^CN-HF-[A-Z0-9]+(-[A-Z0-9]+)*$`，后续批次从 `CN-HF-031` 续号）。
- 课程 ID：`mandarin-public-core-30`（符合 `^mandarin-public-[a-z0-9-]+$`）。ID 一经发布不可更改（收藏 `mandarin-v2:<expressionId>` 引用稳定性）。

## 5. 如何使用现有 validator

```bash
node -e "
import('./scripts/validate-mandarin-course-import.mjs').then(async (m) => {
  const fs = await import('node:fs');
  const pkg = JSON.parse(fs.readFileSync('content/public-core-30/public_core_30_review.json','utf8'));
  console.log(m.validateMandarinCourseImport(pkg));
});"
```

当前批准版输出 **0 错误**。

## 6. 内容注册表接入状态

1. JSON 与 CSV 均已标记 `HUMAN_APPROVED` 并记录真实聊天审批来源。
2. 已加入 `lib/server/mandarin-v2-reviewed-packages.ts` 的 server-only 注册表。
3. `/learn-chinese/public-core` 通过 `getMandarinV2Runtime` 读取课程，不直接绕过注册表。
4. 运行时保证：`day: null` 不写 Day 1–60；FREE 内容要求 `requiresPermission=null`；收藏走 `mandarin-v2:` 独立命名空间；TTS 走既有中文通道。

## 7. 发布范围

- 本批 30 条已批准，可进入 Production 发布候选验证。
- 本批之外的一切内容（其余 249 条 Real Use、48 条职业表达、Level 2 门禁内容）均不在本包范围。
- 禁改清单不变：Production、main、Supabase Schema、Day 1–60、中→印模块、AI Free Teaching、AI Coach V1.2、会员系统。

## 8. 与既有系统的隔离确认

- 本批只接入独立公共课程路由、正式注册表和 `/learn-chinese` 入口；未修改 Day 1–60 数据或会员逻辑。
- 不使用共享管理员账号；不暴露 Service Role Key 或 AI Gateway 凭据。
