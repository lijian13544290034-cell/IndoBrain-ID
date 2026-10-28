# Native Coach Natural Teaching V1 — 验收记录

执行日期：2026-10-28

模型：`google/gemini-2.5-flash`

代码基线：`946e2cfb9934cf0e36669e077c65f8dd51bbcf3a`

最终受测代码：`269dcc071c3552bbd4006580dc6ad19c69fcfdc0`

## 方法

- 先以 Git 差异定位退化来源：职业问题强制给中文句、`expectsChineseTeaching()` 宽泛触发、结构化 `answer + spokenChinese` 以及缺卡后的二次 Repair。
- 主对话改为一次自由文本流式调用；不再用第二次调用改写自然回答。
- 使用同一 Gemini 2.5 Flash、温度 0.45、最大输出 900，对 8 个相同输入执行“无 System Prompt”与“最小身份 Prompt”真实 A/B。
- 对最终 Preview 执行 7 个首轮场景、7 轮连续上下文、1 次按需拆词和 5 次真实 Azure TTS 请求。
- 用真实 Chrome 分别以 390×844 手机视口和 1280×900 桌面视口执行布局、点击朗读、逐词朗读和缓存测试。

## 原始证据

- `prompt-ab.json`：无教学 System Prompt vs 最小身份 Prompt 的 16 次真实模型原文。
- `preview-regression-final.json`：最终 Preview 的完整 NDJSON 流、回答、Token、成本、延迟、拆词和 TTS 结果。
- `../native-coach-inline-tts/ui-check.json`：12/12 浏览器检查。
- `../native-coach-inline-tts/mobile-390x844.png`：手机视口截图。
- `../native-coach-inline-tts/desktop-1280x900.png`：桌面视口截图。

## 安全与范围

- Preview Flag 仅绑定 `codex/native-coach-natural-teaching-v1`。
- 未修改 Production、`main`、Supabase、正式课程或 Legacy Coach。
- Azure 凭据未进入代码、结果或日志；TTS 仍由服务端既有接口处理。
