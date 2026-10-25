# Codex 交接说明 · 日常高频中文公共课程第一批（30 条）

日期：2026-10-25（rev2 终审修订版）· 分支：`feature/public-core-30-candidates` · reviewReference：`WB-public-core-30-review-2026-10-25-rev2`

## 1. 文件位置

| 文件 | 路径 |
|---|---|
| 候选 JSON（Schema 兼容） | `content/public-core-30/public_core_30_review.json` |
| 候选 CSV（含追溯与审核列，UTF-8 BOM） | `content/public-core-30/public_core_30_review.csv` |
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

当前交付版输出仅 1 条：`reviewStatus: must be HUMAN_APPROVED before import`（流程设计使然）。已实测：把 `reviewStatus` 改为 `HUMAN_APPROVED` 并填真实 `reviewReference` 后 **0 错误**。

## 6. 内容注册表如何接入（人工批准后）

1. 人工完成 QA 报告第 9 节的拼音终审与批准，将 JSON 的 `reviewStatus` 改为 `HUMAN_APPROVED`、`reviewReference` 填真实审批引用。
2. 把整个 package 对象加入 `lib/server/mandarin-v2-reviewed-packages.ts` 的 `mandarinV2ReviewedPackages`（server-only 注册表）。
3. 按 `docs/mandarin-v2-runtime-architecture.md`「Activation checklist」执行：validator + `verify-mandarin-v2-runtime` → server 渲染路由调用 `getMandarinV2Runtime` → 接入 `MandarinV2VocabularyModule` 显示组件 → 收藏/复习解析器 → 访客隔离、zh-CN TTS、移动端回归 → 最后才加导航。
4. 运行时保证（无需额外工作）：`day: null` 不写 Day 1–60；收藏走 `mandarin-v2:` 独立命名空间；TTS 走既有 `ChineseSpeechButton`（zh-CN、fail-closed）。

## 7. 哪些内容仍不可发布

- **未人工批准前整包不可发布/不可进 Production**：当前 `reviewStatus=REVIEW_PASSED` 会被 validator 与 V2 适配器（要求 `HUMAN_APPROVED`）双重拒绝——这是刻意的安全控制。
- rev2 终审已修订 5 条自然度问题（CN-HF-002/014/017/021/030，详见 QA 报告第 4 节）并消除拼音争议点（「哦」已移除；「一/不」变调与轻声按实际读音统一口径），**仅剩一项人工动作：正式 HUMAN_APPROVED 批准 + 真实 reviewReference**。
- 本批之外的一切内容（其余 249 条 Real Use、48 条职业表达、Level 2 门禁内容）均不在本包范围。
- 禁改清单不变：Production、main、Supabase Schema、Day 1–60、中→印模块、AI Free Teaching、AI Coach V1.2、会员系统。

## 8. 与既有系统的隔离确认

- 本批未触碰任何运行时代码/注册表/UI；只有 `content/public-core-30/` 数据、生成脚本与文档。
- 不使用共享管理员账号；不暴露 Service Role Key 或 AI Gateway 凭据。
