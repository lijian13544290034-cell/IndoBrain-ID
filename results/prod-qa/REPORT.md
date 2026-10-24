# IndoBrain 公共中文课程 — 独立验收报告（Production）

- **被测站点**：https://www.indobrain.app （正式生产站点）
- **验收日期**：2026-10-25（GMT+7）
- **角色**：QA（只读验收；未改代码、未部署、未改数据库/环境变量）
- **浏览器**：真实 Chrome（headless），桌面 1280×900；移动 390×844（另测 360×800、414×800），全新 profile、无任何登录态
- **登录态检查**：使用既有授权测试环境（Preview QA 会话，`indobrain-01-prd-prd-v0-1-3r3lj9yq1`），未使用真实用户账号，未创建/修改任何用户数据
- **数据说明**：收藏/进度/已学状态均为浏览器 localStorage（测试 profile 内），不写生产库

## 结论

**未发现 P0 阻塞。未发现 P1。**

P2 共 3 项，均为体验/可发现性层面，不阻止上线与学习。

---

## P0 清单

**未发现 P0 阻塞。**

- Day 1/15/30 正文、拼音、印尼语解释全部正常；TTS 真实播放；收藏、已学、进度刷新后保留；下一课可自然推进；移动端无溢出、按钮可点；Day 31/60 匿名访问被正确拦截且无正文泄漏。

## P1 清单

**未发现 P1。**

## P2 清单

### P2-1 公共课程在站内没有任何入口链接，且被 robots 明确屏蔽（仅直链可用）

- **页面 URL**：https://www.indobrain.app/ （→ `/login?next=%2F`）、https://www.indobrain.app/login、https://www.indobrain.app/learn-chinese
- **操作步骤**：
  1. 无痕窗口打开 `https://www.indobrain.app/`
  2. 观察跳转与登录页全部链接
  3. 抓取 `/robots.txt` 与 `/sitemap.xml`
- **实际结果**：
  - 根域 307 → `/login?next=%2F`；登录页链接只有 `/`、`/life`、`/about#favorites`、`/about`，**无 `/learn-chinese`**
  - `robots.txt` 含 `Disallow: /learn-chinese`；`sitemap.xml` 15 条 URL 中无该课程
  - 课程页 `/learn-chinese` 本身匿名可访问（200，完整 Day 1 内容）
- **预期结果**：若产品定位为“公开可学的公共课程”，官网站内应有可发现入口；若定位为“仅通过分享链接分发”，当前行为可接受
- **严重程度**：P2（不影响直链分享与学习，影响自然发现）
- **证据**：`results/prod-qa/shots/01-login.png`；抓取日志见 `results/prod-qa/evidence.txt`

### P2-2 匿名用户收藏后没有集中查看入口

- **页面 URL**：https://www.indobrain.app/learn-chinese
- **操作步骤**：
  1. 打开课程页 → 点任意卡片「☆ Favorit」（变为 `★ Favorit`，`aria-pressed=true`）
  2. 刷新页面（收藏状态保留）
  3. 尝试访问 `/learn-chinese/favorites`、`/about#favorites`
- **实际结果**：收藏可切换且刷新后保留（localStorage `mandarin-work-30d:profile:guest`.favorites）；但 `/learn-chinese/favorites` 返回 **404**，`/about#favorites` 302/307 到登录页，匿名用户只能靠卡片上的 ★ 逐一辨认
- **预期结果**：按现有设计，收藏至少应能在某处集中查看；若公共课程暂不提供收藏列表，则属于已知范围
- **严重程度**：P2
- **证据**：`results/prod-qa/shots/03-favorite.png`；`/learn-chinese/favorites` 404 见 `evidence.txt`

### P2-3 浏览其它课次后刷新，会回到“当前进度课次”而非刚才浏览的课次

- **页面 URL**：https://www.indobrain.app/learn-chinese
- **操作步骤**：
  1. 点「Lihat 30 hari」→ 选 Day 15（页面显示 `HARI 15`）
  2. 直接刷新
- **实际结果**：刷新后回到 `HARI 1`（恢复逻辑按 `profile.currentDay`，只在「Selesaikan Hari N」时前移）；已完成进度 `1/30` 不受影响；完成 Day 1 后刷新会正确落在 Day 2
- **预期结果**：作为“继续学习”语义（= 下一个未完成课）可接受；若希望保留“正在浏览”的课次则不符
- **严重程度**：P2（观察项，可能属设计预期）
- **证据**：`results/prod-qa/shots/06-day15.png`、`v3-picker-completed.png`；日志见 `evidence.txt`

---

## 逐项验收结果（对应 8 项要求）

| # | 检查项 | 结果 | 关键证据 |
|---|---|---|---|
| 1 | 印尼用户能否打开中文学习入口 | **通过**：`/learn-chinese` 匿名 200，完整 Day 1 内容（7 张表达卡 + AI 教练入口）；根域仍跳登录（见 P2-1） | `02-day1.png`、`mobile-01-home.png` |
| 2 | Day 1 / 15 / 30 页面、拼音、印尼语 | **通过**：HARI 1/15/30 标题正确；汉字、带声调拼音（nǐ/hǎo、hǎi/méi、zhèng/zài/zuò）、印尼语释义齐全；Day 30 为「Dialog kerja」情景对话 | `02-day1.png`、`06-day15.png`、`06-day30.png`、`mobile-day15.png`、`mobile-day30.png` |
| 3 | Day 31 / 60 权限 | **通过**：匿名 Level 2 目录仅锁定卡片（`🔒 Login + akses Level 2`），**0 个课程内容链接**（唯一 `/level-2/31` 链接是 `Masuk untuk Level 2` 登录按钮的 `next=` 参数）；`/level-2/31`、`/level-2/60` 均 302→`/login?next=...`，无正文；授权测试会话可正常打开 Day 31 正文（现有设计） | `07-level2.png`、`07-level2-31.png`、`07-level2-60.png`、`qa-level2-authorized.png`、`qa-day31.png` |
| 4 | 中文朗读能否真正播放 | **通过**：`POST /api/chinese-tts` 返回 200 `audio/mpeg`、7632 字节；真实鼠标点击后 `<audio>` 使用 blob 源，`duration=1.908s`、`currentTime` 推进到 1.908s，无 media error；Day 15 朗读同为 200 audio；移动端同样可播 | `tts-playing.png`、`g-tts.png` |
| 5 | 收藏、已学状态、刷新后进度恢复 | **通过**：收藏 `false→true` 且刷新保留；「Tandai dipelajari」→「✓ Dipelajari」（`completedItems=["CN-WORK-D01-I01"]`）刷新保留；「Selesaikan Hari 1」→ `0/30 → 1/30`，刷新仍 `1/30` 且日选择器 Day 1 变绿，页面自动续到 Day 2 | `03-favorite.png`、`04-progress.png`、`v3-after-complete.png`、`v3-picker-completed.png` |
| 6 | 从一课自然进入下一课 | **通过**：「Hari berikutnya」→ 页面切到 `HARI 2`；也可用「Lihat 30 hari」直选任意 Day 1–30 | `05-day2.png`、`mobile-02-picker.png` |
| 7 | 手机端遮挡/点击/播放 | **通过**：360/390/414px 均无横向溢出（`scrollWidth == clientWidth`）；朗读/收藏/已学按钮高度 44px、下一课 48px；手机端 TTS 正常 | `mobile-01-home.png`、`mobile-04-buttons.png`、`mobile-day30.png` |
| 8 | 公共课程是否有独立入口 / 是否误判上线 | **有独立入口但未挂导航**：`/learn-chinese` 独立、匿名可达（即公共课程本体）；`/coba-gratis`（免登录访客模式）在生产 **404，未上线**，本轮不视为已上线功能；`/learn-chinese/course`、`/favorites`、`/review`、`/profile` 在生产均为 404（属新版分支路由，生产 IA 为单页课程，不算缺陷） | `01-login.png`；`evidence.txt` 路由状态表 |

---

## 已排除的疑似问题（避免误报留档）

| 现象 | 核实结论 |
|---|---|
| 首次脚本报 Day 1/15/30 正文缺失 | 脚本按新版 `/learn-chinese/course?day=N` 取页，生产为 `/learn-chinese` 单页 + 日选择器；改用真实 IA 后全部通过 |
| Level 2 目录匿名页出现 1 个 `level-2/31` 链接 | 该链接是 `Masuk untuk Level 2` 按钮的 `/login?next=/learn-chinese/level-2/31`，非课程正文链接；HTML 中无其它 level-2 内容链接 |
| TTS 返回 0 字节 | puppeteer `response.buffer()` 读取时机问题；直连 API 与浏览器内 fetch 均返回 7632 字节 `audio/mpeg`，真实播放推进 1.908s |
| 「Tandai dipelajari」后 `0/30` 不变 | 设计如此：`completedItems` 记录单句已学，`x/30 hari selesai` 只统计「Selesaikan Hari N」；两者分别验证均正常 |
| 单次观察到 React #418（hydration） | 后续 `/login`、`/learn-chinese` 各 5 次全新加载均未复现（0/10），未见可见异常，不作为问题 |
| 无头浏览器点击朗读无播放态 | 脚本合成点击不构成用户手势；CDP 真实鼠标点击后正常播放，属测试方法问题 |

## 验收限制（未覆盖项）

1. **无真实登录账号**：登录后的收藏列表（`/about#favorites`）与“已登录但无 Level 2 权益（locked）”状态未直接实测；Level 2 放行路径用既有授权 Preview QA 会话验证。
2. **未用印尼本地网络/真机**：移动端为真实 Chrome 移动仿真（360/390/414），未覆盖印尼运营商网络与 iOS Safari 真机。
3. **未测会员/支付**（按指示不将未开放权限视为 Bug）。
4. AI 教练自由教学质量不在本轮公共课程阻塞清单内（仅确认入口可达）。

## 证据文件

- 截图：`results/prod-qa/shots/`（`01-login.png`、`02-day1.png`、`03-favorite.png`、`04-progress.png`、`05-day2.png`、`06-day15.png`、`06-day30.png`、`07-level2*.png`、`mobile-*.png`、`qa-*.png`、`tts-playing.png`、`v3-*.png`）
- 原始结果：`results/prod-qa/summary-v2.json`、`results/prod-qa/run-v2.log`、`results/prod-qa/evidence.txt`
- 脚本（可复跑，只读）：`scripts/verify-prod-qa-readonly-v2.mjs`、`scripts/verify-prod-qa-v3.mjs`、`scripts/verify-prod-tts-play.mjs`
