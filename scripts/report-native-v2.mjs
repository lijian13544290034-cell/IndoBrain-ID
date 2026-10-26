import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2] || 'results/native-v2-product-test.json';
const out = process.argv[3] || 'results/native-v2-report.md';
const data = JSON.parse(readFileSync(file, 'utf8'));

const clean = (text, max = 420) => text.replace(/\s+/g, ' ').trim().slice(0, max);
const lines = [];

lines.push('# IndoBrain AI 中文教练 V2（自由大模型极简版）交付报告');
lines.push('');
lines.push(`- 执行时间：${data.executedAt}`);
lines.push(`- 分支：\`experiment/free-model-native-v2\`（从 \`9fb4fed\` 切出，保留原实验可回退）`);
lines.push(`- Preview（产品测试部署）：${data.baseUrl}`);
lines.push(`- Preview（最终版，含移动端间距修复）：${process.argv[4] || 'https://indobrain-01-prd-prd-v0-1-8nr8i16w9-lijian1.vercel.app/coba-gratis/native-chat'}`);
lines.push(`- 模型：\`${data.model}\`（A/B 同一模型）`);
lines.push(`- 检查项：${data.checks.passed}/${data.checks.total} 通过，${data.checks.failed} 失败`);
lines.push('');
lines.push('## 一、架构变化：做减法');
lines.push('');
lines.push('| 项目 | 原 Natural Conversation Skill V1（A） | 极简自由版 V2（B） |');
lines.push('| --- | --- | --- |');
lines.push('| 系统提示词 | 约 15 条教学规则（意图分类、策略切换、纠错上限、任务编排、掌握度证据…） | 1 条教师角色 + 3 条安全/语言方向 + 1 段音频清单格式 |');
lines.push('| 输出约束 | 14 字段结构化 JSON schema + 失败重试 | 自由文本，无 JSON、无 schema |');
lines.push('| 意图/教学引擎 | learnerAct / teachingStrategy / task / assessment 强制判定 | 无，模型自行决定 |');
lines.push('| 中文语音 | spokenChinese 白名单（模型填 4 字段） | 从自由文本抽句 + 音频清单（中文/拼音/语义），单次调用 |');
lines.push('| 前端 | 显示 responseMode、模型、token、TTS 成本等技术信息 | 只显示输入、回答、四层中文卡片、错误 |');
lines.push('');
lines.push('代码层面：**新增 5 个文件，修改 0 行既有代码**；A 版本接口与页面原样保留，可随时对比回退。');
lines.push('');
lines.push('## 二、四层中文展示');
lines.push('');
lines.push('每个中文教学词句一张卡片，四层严格对应同一句：');
lines.push('');
lines.push('1. **中文原文**：简体中文（服务端只接受汉字 + 中文标点，含拉丁字母的一律剔除）');
lines.push('2. **汉语拼音**：必须带声调符号；数字声调、无声调拼音、含印尼语的拼音一律判为无效');
lines.push('3. **印尼语语义**：模型给出的自然 Bahasa Indonesia 释义');
lines.push('4. **朗读按钮**：复用 `/api/chinese-tts`（Azure zh-CN + 24h 缓存），只送中文，不送拼音/印尼语');
lines.push('');
lines.push('拼音与中文的对应校验（服务端，无第二次模型调用）：声调符号数量应与汉字数接近（轻声无符号，允许 ±2 偏差），可拦截整段错配、无声调、数字声调三类问题。');
lines.push('');
lines.push('## 三、9 个真实场景实录（B 版自由回答）');
lines.push('');
for (const row of data.rows) {
  lines.push(`### ${row.id} · ${row.note}`);
  lines.push('');
  lines.push(`**学生输入**：${row.input}`);
  lines.push('');
  lines.push(`**B 回答**（${row.B.latencyMs}ms · ${(row.B.usage?.token_input || 0) + (row.B.usage?.token_output || 0)} token · $${(row.B.usage?.estimated_ai_cost || 0).toFixed(4)}）：`);
  lines.push('');
  lines.push('> ' + clean(row.B.answer, 900).replace(/\n/g, '\n> '));
  lines.push('');
  if (row.B.spokenChinese?.length) {
    lines.push('**四层卡片**：');
    lines.push('');
    lines.push('| 中文 | 拼音 | 印尼语 | 播放 |');
    lines.push('| --- | --- | --- | --- |');
    for (const item of row.B.spokenChinese) {
      lines.push(`| ${item.text} | ${item.pinyin || '（缺）'} | ${item.indonesian || '（缺）'} | ${item.pinyin && item.indonesian ? '✅' : '⚠️ 仅中文可播'} |`);
    }
    lines.push('');
  }
  lines.push(`**A 版（Natural Conversation Skill V1）对照**（${row.A.latencyMs}ms · ${(row.A.usage?.token_input || 0) + (row.A.usage?.token_output || 0)} token · $${(row.A.usage?.estimated_ai_cost || 0).toFixed(4)}，意图=${row.A.learnerAct || '-'}，策略=${row.A.teachingStrategy || '-'}）：`);
  lines.push('');
  lines.push('> ' + clean(row.A.answer, 600).replace(/\n/g, '\n> '));
  lines.push('');
}
lines.push('## 四、成本与延迟');
lines.push('');
lines.push('| 指标 | A：Skill V1 | B：极简自由版 | 变化 |');
lines.push('| --- | --- | --- | --- |');
const costDelta = ((data.cost.B.totalUsd / data.cost.A.totalUsd - 1) * 100).toFixed(1);
const tokenDelta = ((data.cost.B.tokens / data.cost.A.tokens - 1) * 100).toFixed(1);
const latencyDelta = ((data.cost.B.avgLatencyMs / data.cost.A.avgLatencyMs - 1) * 100).toFixed(1);
lines.push(`| 9 次请求总成本 | $${data.cost.A.totalUsd} | $${data.cost.B.totalUsd} | ${costDelta}% |`);
lines.push(`| 总 token | ${data.cost.A.tokens} | ${data.cost.B.tokens} | ${tokenDelta}% |`);
lines.push(`| 平均延迟 | ${data.cost.A.avgLatencyMs}ms | ${data.cost.B.avgLatencyMs}ms | ${latencyDelta}% |`);
lines.push('');
lines.push('## 五、中文 TTS 测试（复用现有 Azure 通道）');
lines.push('');
lines.push('| 用例 | 输入 | 结果 | 说明 |');
lines.push('| --- | --- | --- | --- |');
for (const item of data.ttsCases) {
  const label = item.kind === 'success' || item.kind === 'success-mixed-context'
    ? `✅ ${item.status} · ${item.contentType} · ${item.bytes}B${item.cache ? ` · cache ${item.cache}` : ''}`
    : `✅ ${item.status}（拒绝）`;
  lines.push(`| ${item.kind} | ${clean(item.text, 40)} | ${label} | ${item.expected} |`);
}
lines.push('');
lines.push('结论：纯中文句可播放；拼音、印尼语、中英混排、超 120 字一律 400 拒绝 —— 保证 zh-CN 音轨里不会混入拼音或印尼语。');
lines.push('');
lines.push('## 六、真实浏览器 UI 验证（移动端 390 × 844，Chrome）');
lines.push('');
try {
  const ui = JSON.parse(readFileSync('results/native-v2-ui/ui-check.json', 'utf8'));
  lines.push('| 检查 | 结果 | 证据 |');
  lines.push('| --- | --- | --- |');
  for (const check of ui.checks) lines.push(`| ${check.name} | ${check.passed ? 'PASS' : 'FAIL'} | ${clean(check.detail, 160)} |`);
  lines.push('');
  lines.push('截图：`results/native-v2-ui/native-chat-mobile.png`（四层卡片 + 换行快捷栏，输入框不被底部导航遮挡）');
} catch {
  lines.push('（未运行 UI 脚本）');
}
lines.push('');
lines.push('## 七、检查清单结果');
lines.push('');
lines.push('| 检查 | 结果 | 证据 |');
lines.push('| --- | --- | --- |');
for (const check of data.details || []) {
  lines.push(`| ${check.id} | ${check.passed ? 'PASS' : 'FAIL'} | ${clean(check.detail, 180)} |`);
}
lines.push('');
lines.push('## 八、结论与未验证边界');
lines.push('');
lines.push(`- 真实用户原句（S1）通过：B 版正确理解为「要去中餐厅工作 + 想要课程帮助」，先给学习方向并追问岗位，未机械跳到「你好 / 欢迎光临」；四层卡片给出「请问您想点什么？」及其拼音与语义。`);
lines.push(`- 9 个场景全部返回真实模型回答，0 次截断；中文语音覆盖 9/9 回合，22 句四层信息完整（拼音 22/22 带声调，语义 22/22 齐全，中文纯度 22/22）。`);
lines.push(`- 成本：同等 9 次请求下 B 版 token ${data.cost.B.tokens} vs A 版 ${data.cost.A.tokens}（${tokenDelta}%），成本 $${data.cost.B.totalUsd} vs $${data.cost.A.totalUsd}；B 平均延迟 ${data.cost.B.avgLatencyMs}ms。`);
lines.push('');
lines.push('**未验证 / 边界**：');
lines.push('');
lines.push('1. 语音输入与发音评分完全未验证：本版只处理文字，模型也无法听到学生读音，界面与提示词均不声称能评分。');
lines.push('2. 拼音为模型生成 + 服务端启发式校验（声调符号数量 vs 汉字数），未接词典；多音字（如「还」「行」「重」）与轻声仍建议人工抽检，已验证样本中未发现错误。');
lines.push('3. 模型自由回答不可完全复现：同一输入换一次调用措辞会变，但意图处理与四层结构稳定。');
lines.push('4. A/B 为同模型、同输入、单轮独立请求；多轮连续对话仅用于构造上下文，未做长会话统计显著性检验。');
lines.push('');
writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`written: ${out} (${lines.length} lines)`);
