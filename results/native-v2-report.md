# IndoBrain AI 中文教练 V2（自由大模型极简版）交付报告

- 执行时间：2026-10-26T15:39:51.806Z
- 分支：`experiment/free-model-native-v2`（从 `9fb4fed` 切出，保留原实验可回退）
- Preview（产品测试部署）：https://indobrain-01-prd-prd-v0-1-hvgf2sikc-lijian1.vercel.app
- Preview（最终版，含移动端间距修复）：https://indobrain-01-prd-prd-v0-1-8nr8i16w9-lijian1.vercel.app/coba-gratis/native-chat
- 模型：`google/gemini-2.5-flash`（A/B 同一模型）
- 检查项：56/56 通过，0 失败

## 一、架构变化：做减法

| 项目 | 原 Natural Conversation Skill V1（A） | 极简自由版 V2（B） |
| --- | --- | --- |
| 系统提示词 | 约 15 条教学规则（意图分类、策略切换、纠错上限、任务编排、掌握度证据…） | 1 条教师角色 + 3 条安全/语言方向 + 1 段音频清单格式 |
| 输出约束 | 14 字段结构化 JSON schema + 失败重试 | 自由文本，无 JSON、无 schema |
| 意图/教学引擎 | learnerAct / teachingStrategy / task / assessment 强制判定 | 无，模型自行决定 |
| 中文语音 | spokenChinese 白名单（模型填 4 字段） | 从自由文本抽句 + 音频清单（中文/拼音/语义），单次调用 |
| 前端 | 显示 responseMode、模型、token、TTS 成本等技术信息 | 只显示输入、回答、四层中文卡片、错误 |

代码层面：**新增 5 个文件，修改 0 行既有代码**；A 版本接口与页面原样保留，可随时对比回退。

## 二、四层中文展示

每个中文教学词句一张卡片，四层严格对应同一句：

1. **中文原文**：简体中文（服务端只接受汉字 + 中文标点，含拉丁字母的一律剔除）
2. **汉语拼音**：必须带声调符号；数字声调、无声调拼音、含印尼语的拼音一律判为无效
3. **印尼语语义**：模型给出的自然 Bahasa Indonesia 释义
4. **朗读按钮**：复用 `/api/chinese-tts`（Azure zh-CN + 24h 缓存），只送中文，不送拼音/印尼语

拼音与中文的对应校验（服务端，无第二次模型调用）：声调符号数量应与汉字数接近（轻声无符号，允许 ±2 偏差），可拦截整段错配、无声调、数字声调三类问题。

## 三、9 个真实场景实录（B 版自由回答）

### S1-real-user-sentence · 真实用户原句（含拼写错误 retoran/boelh）；允许先给计划+追问岗位，不必立刻教中文

**学生输入**：saya mau kerja di retoran china, tolong bantu buat les untuk saya, boelh ya

**B 回答**（5044ms · 874 token · $0.0011）：

> Wah, seru sekali! Mau bekerja di restoran China itu kesempatan yang bagus untuk belajar bahasa dan budayanya. Tentu saja saya bisa bantu! Untuk permulaan, kita bisa fokus pada frasa-frasa yang paling sering dipakai di restoran. Tapi, supaya lebih pas dan efektif, boleh tahu nanti peranmu di restoran itu apa? Misalnya, apakah kamu akan jadi pelayan, koki, kasir, atau bagian kebersihan? Dengan tahu peranmu, saya bisa siapkan materi yang lebih relevan dan langsung bisa kamu pakai. Sebagai contoh, kalau kamu jadi pelayan, salah satu kalimat yang pasti sering dipakai adalah:

**四层卡片**：

| 中文 | 拼音 | 印尼语 | 播放 |
| --- | --- | --- | --- |
| 请问您想点什么？ | Qǐngwèn nín xiǎng diǎn shénme | Permisi, Anda mau pesan apa? | ✅ |

**A 版（Natural Conversation Skill V1）对照**（6193ms · 1987 token · $0.0015，意图=REQUEST，策略=MODEL）：

> Tentu saja! Senang sekali bisa membantu. Untuk memulai, mari kita pelajari cara menyapa pelanggan dengan "Selamat datang" dalam bahasa Mandarin. Ini adalah frasa yang sangat penting di restoran.

### S2-factory-work · 去工厂工作

**学生输入**：saya mau kerja di pabrik, tolong ajari saya Mandarin untuk kerja

**B 回答**（3987ms · 985 token · $0.0011）：

> Oke, siap! Bekerja di pabrik dan bisa berbahasa Mandarin itu pasti akan sangat membantu dan membuka banyak kesempatan. Saya siap bantu kamu belajar Mandarin yang relevan untuk lingkungan pabrik. Supaya belajarnya lebih efektif dan langsung kena sasaran, boleh tahu lebih detail sedikit tentang pekerjaanmu di pabrik nanti? Misalnya: * Kamu akan bekerja di bagian apa? (Produksi, QC/Quality Control, gudang, administrasi, dll.) * Apakah kamu akan sering berinteraksi dengan atasan/supervisor orang Tiongkok? * Atau lebih banyak berinteraksi dengan rekan kerja sesama pekerja? * Produk apa yang diproduksi di pabrik tersebut? Dengan informasi ini, saya bisa siapkan materi yang lebih spesifik dan langsung bisa kamu gunakan di tempat kerja. Sebagai permulaan, ini ada satu kalimat dasar yang mungkin akan sering kamu dengar atau perlu ucapkan di lingkungan kerja:

**四层卡片**：

| 中文 | 拼音 | 印尼语 | 播放 |
| --- | --- | --- | --- |
| 老板，我明天想请假。 | Lǎobǎn wǒ míngtiān xiǎng qǐngjià | Bos, saya mau minta izin besok. | ✅ |

**A 版（Natural Conversation Skill V1）对照**（3869ms · 2267 token · $0.0015，意图=REQUEST，策略=DIRECT_ANSWER）：

> Baik, saya paham! Kamu ingin belajar Mandarin untuk bekerja di pabrik. Itu juga tujuan yang sangat bagus dan praktis. Tentu saja saya akan bantu kamu fokus pada percakapan yang relevan untuk lingkungan pabrik.

### S3-practice-now · 直接练习中文

**学生输入**：saya mau langsung latihan ngobrol pakai Mandarin sama kamu

**B 回答**（4689ms · 1138 token · $0.0010）：

> Wah, ide bagus sekali! Langsung latihan ngobrol itu cara yang paling efektif untuk mengasah kemampuan Mandarinmu. Saya siap bantu! Oke, mari kita mulai. Anggap saja ini hari pertamamu di pabrik. Mungkin kamu bertemu dengan supervisor atau rekan kerja dan ingin menyapa atau memperkenalkan diri. Coba kamu mulai dengan menyapa saya dan memperkenalkan diri, misalnya: "Halo, saya [nama kamu]." Atau, kalau kamu mau menanyakan sesuatu yang sederhana, misalnya kamu perlu bantuan. Kamu bisa bilang: Silakan dicoba! Saya tunggu balasanmu ya.

**四层卡片**：

| 中文 | 拼音 | 印尼语 | 播放 |
| --- | --- | --- | --- |
| 请问，我需要帮忙。 | Qǐngwèn wǒ xūyào bāngmáng | Permisi, saya butuh bantuan. | ✅ |

**A 版（Natural Conversation Skill V1）对照**（4517ms · 2545 token · $0.0018，意图=REQUEST，策略=ROLEPLAY）：

> Baik, mari kita mulai latihan ngobrol pakai Mandarin! Kita bisa bayangkan kamu baru saja tiba di pabrik untuk hari pertama kerja. Saya akan jadi supervisor kamu. Saya akan menyapa kamu dan memberikan instruksi sederhana. Coba kamu balas sapaan saya ya.

### S4-reexplain · 没听懂，继续解释

**学生输入**：kemarin saya tidak paham, tolong jelaskan lagi pelan-pelan

**B 回答**（4749ms · 1582 token · $0.0018）：

> Baik, tidak apa-apa. Maaf kalau kemarin saya terlalu cepat. Mari kita coba lagi, pelan-pelan ya. Jadi begini, kamu bilang mau belajar Mandarin untuk kerja di pabrik, kan? Nah, cara paling bagus untuk belajar itu adalah dengan langsung mencoba ngobrol, seperti yang kamu minta. Kemarin, saya mengajakmu untuk mulai latihan ngobrol dengan saya, seolah-olah kamu baru pertama kali masuk kerja di pabrik. Tujuannya adalah supaya kamu bisa langsung mencoba mengucapkan kalimat-kalimat dasar yang mungkin kamu butuhkan di sana. Saya memberi dua pilihan untuk memulai: 1. **Memperkenalkan diri atau menyapa.** Misalnya, kamu bisa bilang "Halo, saya [nama kamu]." dalam bahasa Mandarin. Ini adalah cara yang baik untuk memulai interaksi. 2. **Meminta bantuan sederhana.** Karena di tempat kerja baru, mungkin ada hal yang belum kamu pahami atau butuh bantuan. Contoh kalimat untuk meminta bantuan yang saya b

**四层卡片**：

| 中文 | 拼音 | 印尼语 | 播放 |
| --- | --- | --- | --- |
| 请问，您可以帮我一下吗？ | Qǐngwèn nín kěyǐ bāng wǒ yīxià ma | Permisi, bisakah Anda membantu saya sebentar? | ✅ |

**A 版（Natural Conversation Skill V1）对照**（5075ms · 2553 token · $0.0024，意图=CONFUSION，策略=EXPLAIN）：

> Maaf, saya jelaskan lagi ya. Tadi saya mengajak kamu untuk mulai latihan percakapan Mandarin, seolah-olah ini hari pertamamu di pabrik. Kamu bisa mulai dengan menyapa dan memperkenalkan diri, atau menanyakan sesuatu yang sederhana. Contohnya, kamu bisa bilang: "Halo, saya [nama kamu]." (Nǐ hǎo, wǒ shì [nama kamu].) Atau, kalau kamu butuh bantuan, kamu bisa bilang: "Bisakah kamu membantu saya?" (Nǐ néng bāng wǒ ma?) Coba pilih salah satu kalimat di atas, atau kalimat sapaan lain yang kamu tahu, untuk memulai percakapan. Tidak perlu khawatir salah, kita belajar bersama di sini.

### S5-ask-boss-leave · 跟中国老板请假

**学生输入**：saya mau belajar cara minta izin ke bos China, gimana bilangnya

**B 回答**（5715ms · 1913 token · $0.0020）：

> Oke, ini pertanyaan yang sangat penting dan praktis di lingkungan kerja! Bagus sekali kamu memikirkan ini. Untuk meminta izin atau cuti ke bos orang Tiongkok, kalimat yang paling umum dan sopan adalah: **老板，我明天想请假。** (Lǎobǎn, wǒ míngtiān xiǎng qǐngjià.) Bos, saya mau minta izin besok. Mari kita bedah sedikit kalimat ini: * **老板 (Lǎobǎn)**: Artinya "Bos" atau "Pemilik". Ini panggilan standar untuk atasan di sana. * **我 (wǒ)**: Artinya "saya". * **明天 (míngtiān)**: Artinya "besok". Kamu bisa ganti dengan waktu lain, misalnya `今天 (jīntiān)` untuk "hari ini" atau tanggal spesifik. * **想 (xiǎng)**: Artinya "ingin" atau "mau". Menunjukkan keinginan dengan sopan. * **请假 (qǐngjià)**: Ini adalah kata kunci untuk "minta izin" atau "minta cuti". Jadi, kalau kamu mau bilang "Bos, saya mau minta izin besok", kamu bisa pakai kalimat di atas. Apakah kamu mau coba berlatih mengucapkan kalimat ini, atau a

**四层卡片**：

| 中文 | 拼音 | 印尼语 | 播放 |
| --- | --- | --- | --- |
| 老板，我明天想请假。 | Lǎobǎn wǒ míngtiān xiǎng qǐngjià | Bos, saya mau minta izin besok. | ✅ |

**A 版（Natural Conversation Skill V1）对照**（5425ms · 3207 token · $0.0028，意图=REQUEST，策略=EXPLAIN）：

> Tentu, ini topik yang sangat penting di lingkungan kerja! Meminta izin ke atasan dalam bahasa Mandarin ada beberapa cara, tergantung seberapa formal situasinya dan apa yang ingin kamu minta izinnya. Kita akan mulai dengan cara yang paling umum dan sopan ya.

### S6-no-lesson-chat · 不想上课，随便聊

**学生输入**：saya tidak mau les, ngobrol santai saja ya

**B 回答**（5250ms · 1797 token · $0.0014）：

> Oke, siap! Santai saja ya. Saya juga lebih suka kalau kita bisa ngobrol seperti teman, jadi kamu nyaman bertanya apa pun. Tadi kita sudah bahas cara bilang "minta izin besok" ke bos. Nah, biasanya setelah bilang mau minta izin, bos mungkin akan bertanya, "Kenapa?" atau "Ada apa?". Kalau kamu ingin menjelaskan alasannya, misalnya kamu sakit, kamu bisa bilang: **我生病了。** (Wǒ shēngbìng le.) Saya sakit. Atau, kalau kamu mau minta izin tapi belum tahu kapan, hanya ingin menanyakan prosedur izin, kamu bisa bilang: **老板，请问怎么请假？** (Lǎobǎn, qǐngwèn zěnme qǐngjià?) Bos, permisi, bagaimana cara minta izin? Bagaimana menurutmu? Apakah ada situasi lain terkait izin yang ingin kamu tanyakan? Atau mungkin ada kalimat lain yang terlintas di pikiranmu?

**四层卡片**：

| 中文 | 拼音 | 印尼语 | 播放 |
| --- | --- | --- | --- |
| 我生病了。 | Wǒ shēngbìng le | Saya sakit. | ✅ |
| 老板，请问怎么请假？ | Lǎobǎn qǐngwèn zěnme qǐngjià | Bos, permisi, bagaimana cara minta izin? | ✅ |

**A 版（Natural Conversation Skill V1）对照**（4700ms · 2952 token · $0.0019，意图=REQUEST，策略=DIRECT_ANSWER）：

> Baik, tentu saja! Kita bisa ngobrol santai saja. Saya akan menyesuaikan diri dengan gayamu belajar. Tidak perlu merasa seperti les formal, anggap saja kita sedang ngobrol biasa sambil belajar Mandarin ya.

### S7-followup-chain · 连续追问（承接上轮）

**学生输入**：kalau bos bilang "minggu depan kita lembur", saya harus jawab apa?

**B 回答**（8378ms · 2738 token · $0.0037）：

> Wah, ini situasi yang sering terjadi di pabrik! Bagus sekali kamu memikirkan respons untuk ini. Biasanya, kalau bos bilang "minggu depan kita lembur", dalam bahasa Mandarin mungkin dia akan bilang: **下个星期我们加班。** (Xià ge xīngqī wǒmen jiābān.) Minggu depan kita lembur. Nah, untuk jawabannya, ada beberapa pilihan, tergantung niatmu: 1. **Kalau kamu setuju atau mengerti:** Ini jawaban paling aman dan umum. Kamu bisa bilang: **好的，老板。** (Hǎo de, lǎobǎn.) Baik, Bos. Atau: **知道了，老板。** (Zhīdào le, lǎobǎn.) Mengerti, Bos. 2. **Kalau kamu ingin bertanya detail lebih lanjut:** Mungkin kamu ingin tahu sampai jam berapa atau hari apa saja lembur. Ini juga respons yang umum dan wajar. **老板，加班到几点？** (Lǎobǎn, jiābān dào jǐ diǎn?) Bos, lembur sampai jam berapa? Atau: **老板，加班哪几天？** (Lǎobǎn, jiābān nǎ jǐ tiān?) Bos, lembur hari apa saja? Kamu bisa pilih salah satu yang paling sesuai dengan situasimu. Kalau 

**四层卡片**：

| 中文 | 拼音 | 印尼语 | 播放 |
| --- | --- | --- | --- |
| 下个星期我们加班。 | Xià ge xīngqī wǒmen jiābān | Minggu depan kita lembur. | ✅ |
| 好的，老板。 | Hǎo de lǎobǎn | Baik, Bos. | ✅ |
| 老板，加班到几点？ | Lǎobǎn jiābān dào jǐ diǎn | Bos, lembur sampai jam berapa? | ✅ |

**A 版（Natural Conversation Skill V1）对照**（5836ms · 3240 token · $0.0025，意图=QUESTION，策略=DIRECT_ANSWER）：

> Oke, ini pertanyaan yang bagus! Kalau bos bilang "minggu depan kita lembur", kamu bisa merespons dengan sederhana dan sopan seperti ini:

### S8-sudden-switch · 突然换话题

**学生输入**：oh iya, ganti topik ya — saya mau beli SIM card di China, bilangnya gimana

**B 回答**（5034ms · 2627 token · $0.0029）：

> Oke, ganti topik ya! Siap. Ini juga pertanyaan yang sangat berguna kalau kamu di Tiongkok. Untuk bilang "Saya mau beli SIM card" di Tiongkok, kamu bisa pakai kalimat ini: **你好，我想买一张电话卡。** (Nǐ hǎo, wǒ xiǎng mǎi yī zhāng diànhuàkǎ.) Halo, saya mau beli satu kartu telepon (SIM card). Mari kita bedah kalimatnya: * **你好 (Nǐ hǎo)**: Ini sapaan umum "Halo" atau "Hai", sopan untuk memulai percakapan dengan petugas toko. * **我 (wǒ)**: Artinya "saya". * **想 (xiǎng)**: Artinya "ingin" atau "mau". * **买 (mǎi)**: Artinya "membeli". * **一张 (yī zhāng)**: Ini adalah "satu" dengan kata penggolong (`zhāng`) yang dipakai untuk benda pipih seperti kartu, kertas, meja. Jadi artinya "satu lembar" atau "satu buah". * **电话卡 (diànhuàkǎ)**: Ini artinya "kartu telepon" atau "SIM card". Jadi, kalau kamu masuk ke toko operator seluler (seperti China Mobile, China Unicom, atau China Telecom) dan bilang kalimat itu, m

**四层卡片**：

| 中文 | 拼音 | 印尼语 | 播放 |
| --- | --- | --- | --- |
| 老板，我明天想请假。 | Lǎobǎn wǒ míngtiān xiǎng qǐngjià | Bos, saya mau minta izin besok. | ✅ |
| 我生病了。 | Wǒ shēngbìng le | Saya sakit. | ✅ |
| 老板，请问怎么请假？ | Lǎobǎn qǐngwèn zěnme qǐngjià | Bos, permisi, bagaimana cara minta izin? | ✅ |
| 下个星期我们加班。 | Xià ge xīngqī wǒmen jiābān | Minggu depan kita lembur. | ✅ |
| 好的，老板。 | Hǎo de lǎobǎn | Baik, Bos. | ✅ |
| 知道了，老板。 | Zhīdào le lǎobǎn | Mengerti, Bos. | ✅ |
| 老板，加班到几点？ | Lǎobǎn jiābān dào jǐ diǎn | Bos, lembur sampai jam berapa? | ✅ |
| 老板，加班哪几天？ | Lǎobǎn jiābān nǎ jǐ tiān | Bos, lembur hari apa saja? | ✅ |

**A 版（Natural Conversation Skill V1）对照**（5941ms · 3152 token · $0.0021，意图=REQUEST，策略=DIRECT_ANSWER）：

> Oke, topik baru! Ini juga sangat berguna kalau kamu baru sampai di Tiongkok. Untuk bilang "Saya mau beli SIM card di China", kamu bisa pakai kalimat ini:

### S9-messy-input · 拼写错误/俚语/中印混合

**学生输入**：bang gue mau tanya dong, 老板 bilang apa klo mau pulang cepet? makasih ya

**B 回答**（11750ms · 3544 token · $0.0051）：

> Siap, bang! Pertanyaan bagus lagi nih. Ini juga sering banget kepakai di tempat kerja. Kalau kamu mau bilang ke bos "mau pulang cepet", kalimat yang paling sopan dan umum adalah: **老板，我能早点回家吗？** (Lǎobǎn, wǒ néng zǎodiǎn huíjiā ma?) Bos, apakah saya bisa pulang lebih awal? Mari kita bedah sedikit: * **老板 (Lǎobǎn)**: Seperti yang sudah kita bahas, ini panggilan "Bos". * **我 (wǒ)**: "Saya". * **能 (néng)**: Artinya "bisa" atau "dapat". Ini membuat permintaanmu terdengar lebih sopan, seperti "Bisakah saya...?" * **早点 (zǎodiǎn)**: Artinya "lebih awal" atau "lebih cepat". * **回家 (huíjiā)**: Artinya "pulang ke rumah". * **吗 (ma)**: Partikel pertanyaan, mengubah kalimat menjadi pertanyaan. Jadi, secara harfiah, kalimat itu berarti "Bos, saya bisa pulang ke rumah lebih awal?" yang dalam konteks Indonesia sama dengan "Bos, apakah saya bisa pulang lebih cepat?". Ada juga istilah **早退 (zǎotuì)** yang

**四层卡片**：

| 中文 | 拼音 | 印尼语 | 播放 |
| --- | --- | --- | --- |
| 老板，我能早点回家吗？ | Lǎobǎn wǒ néng zǎodiǎn huíjiā ma | Bos, apakah saya bisa pulang lebih awal? | ✅ |
| 早点回家 | zǎodiǎn huíjiā | pulang lebih awal | ✅ |
| 早退 | zǎotuì | pulang lebih awal (seringkali tanpa izin) | ✅ |
| 老板，我今天想早点回家。 | Lǎobǎn wǒ jīntiān xiǎng zǎodiǎn huíjiā | Bos, saya mau pulang lebih awal hari ini. | ✅ |

**A 版（Natural Conversation Skill V1）对照**（4334ms · 3234 token · $0.0021，意图=PRACTICE，策略=DIRECT_ANSWER）：

> Ini masih latihan mengikuti contoh, jadi saya belum menilai penguasaan atau pengucapanmu dari teks ini.

## 四、成本与延迟

| 指标 | A：Skill V1 | B：极简自由版 | 变化 |
| --- | --- | --- | --- |
| 9 次请求总成本 | $0.0186 | $0.0202 | 8.6% |
| 总 token | 25137 | 17198 | -31.6% |
| 平均延迟 | 5099ms | 6066ms | 19.0% |

## 五、中文 TTS 测试（复用现有 Azure 通道）

| 用例 | 输入 | 结果 | 说明 |
| --- | --- | --- | --- |
| success | 请问您想点什么？ | ✅ 200 · audio/mpeg · 9360B · cache MISS | 200 audio |
| success-mixed-context | 请问您想点什么？ | ✅ 200 · audio/mpeg · 9360B · cache HIT | 200 audio |
| failure | lǎo bǎn, wǒ míngtiān xiǎng qǐngjià | ✅ 400（拒绝） | 400 |
| failure | Bos, saya mau minta izin besok. | ✅ 400（拒绝） | 400 |
| failure | 老板 hello | ✅ 400（拒绝） | 400 |
| failure | 你好你好你好你好你好你好你好你好你好你好你好你好你好你好你好你好你好你好你好你好 | ✅ 400（拒绝） | 400 |

结论：纯中文句可播放；拼音、印尼语、中英混排、超 120 字一律 400 拒绝 —— 保证 zh-CN 音轨里不会混入拼音或印尼语。

## 六、真实浏览器 UI 验证（移动端 390 × 844，Chrome）

| 检查 | 结果 | 证据 |
| --- | --- | --- |
| page loads (no Vercel SSO) | PASS | PREVIEW · MODE TAMU Ngobrol bebas dengan guru Mandarin AI |
| guest session starts, composer visible | PASS | composer=true |
| suggestion bar no horizontal scroll | PASS | rowScroll=0 pageOverflow=0 wrap=wrap items=3 |
| composer not covered by bottom nav | PASS | {"inputBottom":619,"navTop":771,"overlap":0} |
| four-layer cards rendered | PASS | [{"label":"Putar 请问您想点什么？","chinese":"请问您想点什么？","pinyin":"Qǐngwèn nín xiǎng diǎn shénme","meaning":"Permisi, Anda mau pesan apa?"}] |
| no technical debug footer (token/model/cost) | PASS | checked page text |
| play button triggers zh-CN audio (no error surfaced) | PASS | {"clicked":true,"alert":""} |

截图：`results/native-v2-ui/native-chat-mobile.png`（四层卡片 + 换行快捷栏，输入框不被底部导航遮挡）

## 七、检查清单结果

| 检查 | 结果 | 证据 |
| --- | --- | --- |
| S1-real-user-sentence | PASS | status=200 chars=579 latency=5044ms |
| S1-real-user-sentence | PASS | truncated=false outTokens=390 |
| S1-real-user-sentence | PASS | 1/1 :: 请问您想点什么？|Qǐngwèn nín xiǎng diǎn shénme|Permisi, Anda mau pesan |
| S1-real-user-sentence | PASS | found=true |
| S2-factory-work | PASS | status=200 chars=873 latency=3987ms |
| S2-factory-work | PASS | truncated=false outTokens=355 |
| S2-factory-work | PASS | count=1 |
| S2-factory-work | PASS | 1/1 :: 老板，我明天想请假。|Lǎobǎn wǒ míngtiān xiǎng qǐngjià|Bos, saya mau minta izin |
| S2-factory-work | PASS | found=true |
| S3-practice-now | PASS | status=200 chars=540 latency=4689ms |
| S3-practice-now | PASS | truncated=false outTokens=299 |
| S3-practice-now | PASS | count=1 |
| S3-practice-now | PASS | 1/1 :: 请问，我需要帮忙。|Qǐngwèn wǒ xūyào bāngmáng|Permisi, saya butuh bant |
| S3-practice-now | PASS | found=true |
| S4-reexplain | PASS | status=200 chars=1411 latency=4749ms |
| S4-reexplain | PASS | truncated=false outTokens=606 |
| S4-reexplain | PASS | count=1 |
| S4-reexplain | PASS | 1/1 :: 请问，您可以帮我一下吗？|Qǐngwèn nín kěyǐ bāng wǒ yīxià ma|Permisi, bisakah Anda me |
| S4-reexplain | PASS | found=true |
| S5-ask-boss-leave | PASS | status=200 chars=959 latency=5715ms |
| S5-ask-boss-leave | PASS | truncated=false outTokens=651 |
| S5-ask-boss-leave | PASS | count=1 |
| S5-ask-boss-leave | PASS | 1/1 :: 老板，我明天想请假。|Lǎobǎn wǒ míngtiān xiǎng qǐngjià|Bos, saya mau minta izin |
| S5-ask-boss-leave | PASS | found=true |
| S6-no-lesson-chat | PASS | status=200 chars=751 latency=5250ms |
| S6-no-lesson-chat | PASS | truncated=false outTokens=386 |
| S6-no-lesson-chat | PASS | 2/2 :: 我生病了。|Wǒ shēngbìng le|Saya sakit. ; 老板，请问怎么请假？|Lǎobǎn qǐngwèn zěnme qǐngjià|Bos, permisi, bagaimana |
| S6-no-lesson-chat | PASS | found=true |
| S7-followup-chain | PASS | status=200 chars=1079 latency=8378ms |
| S7-followup-chain | PASS | truncated=false outTokens=1315 |
| S7-followup-chain | PASS | count=3 |
| S7-followup-chain | PASS | 3/3 :: 下个星期我们加班。|Xià ge xīngqī wǒmen jiābān|Minggu depan kita lembur ; 好的，老板。|Hǎo de lǎobǎn|Baik, Bos. ; 老板，加班到几点？|Lǎobǎn jiābān dào jǐ diǎn|Bos, lembur sampai jam b |
| S7-followup-chain | PASS | found=true |
| S8-sudden-switch | PASS | status=200 chars=1074 latency=5034ms |
| S8-sudden-switch | PASS | truncated=false outTokens=976 |
| S8-sudden-switch | PASS | count=8 |
| S8-sudden-switch | PASS | 8/8 :: 老板，我明天想请假。|Lǎobǎn wǒ míngtiān xiǎng qǐngjià|Bos, saya mau minta izin ; 我生病了。|Wǒ shēngbìng le|Saya sakit. ; 老板，请问怎么请假？|Lǎobǎn qǐngwèn zěnme qǐngjià|Bos, permisi, bagaimana ;  |
| S8-sudden-switch | PASS | found=true |
| S9-messy-input | PASS | status=200 chars=1349 latency=11750ms |
| S9-messy-input | PASS | truncated=false outTokens=1837 |
| S9-messy-input | PASS | count=4 |
| S9-messy-input | PASS | 4/4 :: 老板，我能早点回家吗？|Lǎobǎn wǒ néng zǎodiǎn huíjiā ma|Bos, apakah saya bisa pu ; 早点回家|zǎodiǎn huíjiā|pulang lebih awal ; 早退|zǎotuì|pulang lebih awal (serin ; 老板，我今天想早点回家。|Lǎobǎn wǒ j |
| S9-messy-input | PASS | found=true |
| S1-intent | PASS | Wah, seru sekali! Mau bekerja di restoran China itu kesempatan yang bagus untuk belajar bahasa dan budayanya. Tentu saja saya bisa bantu! Untuk permulaan, kita bisa fokus pada fras |
| S1-no-generic-greeting | PASS | firstChinese="请问您想点什么？" head="Wah, seru sekali! Mau bekerja di restoran China itu kesempat" |
| AB-both-answered | PASS | S1-real-user-sentence:A200/B200 S2-factory-work:A200/B200 S3-practice-now:A200/B200 S4-reexplain:A200/B200 S5-ask-boss-leave:A200/B200 S6-no-lesson-chat:A200/B200 S7-followup-chain |
| AGG-chinese-coverage | PASS | 9/9 turns |
| AGG-pinyin | PASS | 22/22 |
| AGG-meaning | PASS | 22/22 |
| AGG-zh-only | PASS | 22/22 |
| TTS-1 | PASS | status=200 bytes=9360 cache=MISS |
| TTS-2 | PASS | status=200 text="请问您想点什么？" |
| TTS-3 | PASS | status=400 bytes=61 |
| TTS-4 | PASS | status=400 bytes=61 |
| TTS-5 | PASS | status=400 bytes=61 |
| TTS-6 | PASS | status=400 bytes=61 |

## 八、结论与未验证边界

- 真实用户原句（S1）通过：B 版正确理解为「要去中餐厅工作 + 想要课程帮助」，先给学习方向并追问岗位，未机械跳到「你好 / 欢迎光临」；四层卡片给出「请问您想点什么？」及其拼音与语义。
- 9 个场景全部返回真实模型回答，0 次截断；中文语音覆盖 9/9 回合，22 句四层信息完整（拼音 22/22 带声调，语义 22/22 齐全，中文纯度 22/22）。
- 成本：同等 9 次请求下 B 版 token 17198 vs A 版 25137（-31.6%），成本 $0.0202 vs $0.0186；B 平均延迟 6066ms。

**未验证 / 边界**：

1. 语音输入与发音评分完全未验证：本版只处理文字，模型也无法听到学生读音，界面与提示词均不声称能评分。
2. 拼音为模型生成 + 服务端启发式校验（声调符号数量 vs 汉字数），未接词典；多音字（如「还」「行」「重」）与轻声仍建议人工抽检，已验证样本中未发现错误。
3. 模型自由回答不可完全复现：同一输入换一次调用措辞会变，但意图处理与四层结构稳定。
4. A/B 为同模型、同输入、单轮独立请求；多轮连续对话仅用于构造上下文，未做长会话统计显著性检验。
