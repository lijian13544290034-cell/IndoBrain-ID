// build-public-core-30.mjs
// 生成「日常高频中文公共课程」第一批 30 条候选数据（CSV + JSON）。
// 数据来源：docs/BASIC_ESSENTIALS_REAL_USE_V1_GROUPS_01_39.md / _40_93.md 的 Real Use 条目（可逐条追溯）。
// 只生成本目录下的候选文件，不触碰运行时代码、课程注册表或 Production。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'content', 'public-core-30');
fs.mkdirSync(OUT, { recursive: true });

const SRC_1 = 'docs/BASIC_ESSENTIALS_REAL_USE_V1_GROUPS_01_39.md';
const SRC_2 = 'docs/BASIC_ESSENTIALS_REAL_USE_V1_GROUPS_40_93.md';

// sourceId 指向 Real Use 文档中的 `## GROUP: NN` 第 idx 条，可逐条追溯。
const rows = [
  // —— 1. 问候与礼貌 ——
  { id: 'CN-HF-001', sourceId: 'basic-essentials-G38#3', sourceFile: SRC_1, category: 'greeting', indonesian: 'Halo, Pak.', chinese: '您好，先生。', pinyin: 'nín hǎo, xiān sheng.', difficulty: 1, reviewNotes: '' },
  { id: 'CN-HF-002', sourceId: 'basic-essentials-G39#2', sourceFile: SRC_1, category: 'greeting', indonesian: 'Permisi, Pak.', chinese: '打扰一下，先生。', pinyin: 'dǎ rǎo yí xià, xiān sheng.', difficulty: 1, reviewNotes: '终审修订：「Permisi」是引起注意的礼貌语，教学表达定为「打扰一下」（「不好意思」偏道歉/婉拒语境，不作为 Permisi 首选对译）；「一下」的「一」读第四声（yí），与 CN-HF-025 口径一致。' },
  { id: 'CN-HF-003', sourceId: 'basic-essentials-G39#3', sourceFile: SRC_1, category: 'greeting', indonesian: 'Hati-hati di jalan.', chinese: '路上小心。', pinyin: 'lù shang xiǎo xīn.', difficulty: 1, reviewNotes: '' },
  // —— 2. 人称与位置 ——
  { id: 'CN-HF-004', sourceId: 'basic-essentials-G14#1', sourceFile: SRC_1, category: 'self-intro', indonesian: 'Saya di sini.', chinese: '我在这里。', pinyin: 'wǒ zài zhè lǐ.', difficulty: 1, reviewNotes: '' },
  { id: 'CN-HF-005', sourceId: 'basic-essentials-G15#1', sourceFile: SRC_1, category: 'self-intro', indonesian: 'Kamu sudah sampai?', chinese: '你到了吗？', pinyin: 'nǐ dào le ma?', difficulty: 1, reviewNotes: '' },
  { id: 'CN-HF-006', sourceId: 'basic-essentials-G15#2', sourceFile: SRC_1, category: 'self-intro', indonesian: 'Saya baru masuk.', chinese: '我刚进去。', pinyin: 'wǒ gāng jìn qù.', difficulty: 2, reviewNotes: '' },
  // —— 3. 数字与数量 ——
  { id: 'CN-HF-007', sourceId: 'basic-essentials-G01#1', sourceFile: SRC_1, category: 'numbers', indonesian: 'satu orang', chinese: '一个人。', pinyin: 'yí gè rén.', difficulty: 1, reviewNotes: '「一」在第四声量词前读第二声（yí），按实际读音标注。' },
  { id: 'CN-HF-008', sourceId: 'basic-essentials-G01#2', sourceFile: SRC_1, category: 'numbers', indonesian: 'dua botol', chinese: '两瓶。', pinyin: 'liǎng píng.', difficulty: 1, reviewNotes: '量词前用「两」不用「二」。' },
  { id: 'CN-HF-009', sourceId: 'basic-essentials-G30#1', sourceFile: SRC_1, category: 'numbers', indonesian: 'sedikit saja', chinese: '一点点就行。', pinyin: 'yì diǎn diǎn jiù xíng.', difficulty: 1, reviewNotes: '「一」在第三声前读第四声（yì）。' },
  // —— 4. 日期与时间 ——
  { id: 'CN-HF-010', sourceId: 'basic-essentials-G11#1', sourceFile: SRC_1, category: 'time', indonesian: 'Jam setengah sembilan.', chinese: '八点半。', pinyin: 'bā diǎn bàn.', difficulty: 1, reviewNotes: '' },
  { id: 'CN-HF-011', sourceId: 'basic-essentials-G08#2', sourceFile: SRC_1, category: 'time', indonesian: 'minggu depan', chinese: '下周。', pinyin: 'xià zhōu.', difficulty: 1, reviewNotes: '' },
  { id: 'CN-HF-012', sourceId: 'basic-essentials-G07#2', sourceFile: SRC_1, category: 'time', indonesian: 'Hari ini saja.', chinese: '就今天吧。', pinyin: 'jiù jīn tiān ba.', difficulty: 1, reviewNotes: '' },
  // —— 5. 购物与价格 ——
  { id: 'CN-HF-013', sourceId: 'basic-essentials-G26#2', sourceFile: SRC_1, category: 'shopping', indonesian: 'Ini berapa?', chinese: '这个多少钱？', pinyin: 'zhè ge duō shǎo qián?', difficulty: 1, reviewNotes: '' },
  { id: 'CN-HF-014', sourceId: 'basic-essentials-G36#3', sourceFile: SRC_1, category: 'shopping', indonesian: 'Bisa cash?', chinese: '可以用现金吗？', pinyin: 'kě yǐ yòng xiàn jīn ma?', difficulty: 1, reviewNotes: '终审修订：「可以现金吗」缺动词、不成句，补「用」为自然问法；印尼语 Bisa cash? 语义不变。' },
  { id: 'CN-HF-015', sourceId: 'basic-essentials-G18#2', sourceFile: SRC_1, category: 'shopping', indonesian: 'Saya mau beli yang ini.', chinese: '我想买这个。', pinyin: 'wǒ xiǎng mǎi zhè ge.', difficulty: 1, reviewNotes: '' },
  // —— 6. 吃饭与饮水 ——
  { id: 'CN-HF-016', sourceId: 'basic-essentials-G61#1', sourceFile: SRC_2, category: 'food-drink', indonesian: 'Jangan terlalu pedas.', chinese: '不要太辣。', pinyin: 'bú yào tài là.', difficulty: 1, reviewNotes: '「不」在第四声前变第二声（bú）。' },
  { id: 'CN-HF-017', sourceId: 'basic-essentials-G60#2', sourceFile: SRC_2, category: 'food-drink', indonesian: 'Tanpa gula ya.', chinese: '不要加糖。', pinyin: 'bú yào jiā táng.', difficulty: 1, reviewNotes: '终审修订：改为点单祈使句「不要加糖」，消除句尾语气词「哦」的声调标注争议（ó/ō 各有依据，统一避开）；「不」在第四声「要」前变第二声（bú），与 CN-HF-016 口径一致。源句语气词 ya 的软化功能由祈使句式自然承担，印尼语保持原文。' },
  { id: 'CN-HF-018', sourceId: 'basic-essentials-G61#3', sourceFile: SRC_2, category: 'food-drink', indonesian: 'Air hangat saja.', chinese: '温水就行。', pinyin: 'wēn shuǐ jiù xíng.', difficulty: 1, reviewNotes: '' },
  // —— 7. 出行与位置 ——
  { id: 'CN-HF-019', sourceId: 'basic-essentials-G26#1', sourceFile: SRC_1, category: 'travel', indonesian: 'Toiletnya di mana?', chinese: '厕所在哪里？', pinyin: 'cè suǒ zài nǎ lǐ?', difficulty: 1, reviewNotes: '与工作中文「请问洗手间在哪里？」近义但措辞不同，保留。' },
  { id: 'CN-HF-020', sourceId: 'basic-essentials-G85#1', sourceFile: SRC_2, category: 'travel', indonesian: 'Tolong jemput saya di lokasi ini.', chinese: '请到这个位置接我。', pinyin: 'qǐng dào zhè ge wèi zhì jiē wǒ.', difficulty: 2, reviewNotes: '' },
  { id: 'CN-HF-021', sourceId: 'basic-essentials-G88#2', sourceFile: SRC_2, category: 'travel', indonesian: 'Lurus saja dulu.', chinese: '先直走。', pinyin: 'xiān zhí zǒu.', difficulty: 1, reviewNotes: '终审修订：「先一直往前」冗长且无落点，改为对司机更自然的「先直走」，与源句 Lurus saja dulu. 的指令语境一致；句长变短，difficulty 2→1。' },
  // —— 8. 简单请求 ——
  { id: 'CN-HF-022', sourceId: 'basic-essentials-G16#1', sourceFile: SRC_1, category: 'requests', indonesian: 'Tolong ambil ini.', chinese: '帮我拿这个。', pinyin: 'bāng wǒ ná zhè ge.', difficulty: 1, reviewNotes: '' },
  { id: 'CN-HF-023', sourceId: 'basic-essentials-G21#3', sourceFile: SRC_1, category: 'requests', indonesian: 'Tolong bungkus ya.', chinese: '帮我打包。', pinyin: 'bāng wǒ dǎ bāo.', difficulty: 1, reviewNotes: '' },
  { id: 'CN-HF-024', sourceId: 'basic-essentials-G72#2', sourceFile: SRC_2, category: 'requests', indonesian: 'Nyalakan lampunya.', chinese: '把灯打开。', pinyin: 'bǎ dēng dǎ kāi.', difficulty: 1, reviewNotes: '' },
  // —— 9. 日常回应 ——
  { id: 'CN-HF-025', sourceId: 'basic-essentials-G38#1', sourceFile: SRC_1, category: 'responses', indonesian: 'Tunggu sebentar ya.', chinese: '稍等一下。', pinyin: 'shāo děng yí xià.', difficulty: 1, reviewNotes: '「一下」的「一」读第四声（yí）。与工作中文「等一下。」近义但措辞不同，保留。' },
  { id: 'CN-HF-026', sourceId: 'basic-essentials-G38#2', sourceFile: SRC_1, category: 'responses', indonesian: 'Ini nih.', chinese: '就是这个。', pinyin: 'jiù shì zhè ge.', difficulty: 1, reviewNotes: '' },
  { id: 'CN-HF-027', sourceId: 'basic-essentials-G34#3', sourceFile: SRC_1, category: 'responses', indonesian: 'Sudah siap?', chinese: '准备好了吗？', pinyin: 'zhǔn bèi hǎo le ma?', difficulty: 1, reviewNotes: '' },
  // —— 10. 基础生活沟通 ——
  { id: 'CN-HF-028', sourceId: 'basic-essentials-G82#1', sourceFile: SRC_2, category: 'daily-life', indonesian: 'HP-ku lowbat.', chinese: '我手机快没电了。', pinyin: 'wǒ shǒu jī kuài méi diàn le.', difficulty: 2, reviewNotes: '' },
  { id: 'CN-HF-029', sourceId: 'basic-essentials-G41#3', sourceFile: SRC_2, category: 'daily-life', indonesian: 'Badan nggak enak.', chinese: '身体不舒服。', pinyin: 'shēn tǐ bù shū fu.', difficulty: 1, reviewNotes: '「舒服」第二字轻声（fu）。' },
  { id: 'CN-HF-030', sourceId: 'basic-essentials-G27#1', sourceFile: SRC_1, category: 'daily-life', indonesian: 'Kapan selesai?', chinese: '什么时候做完？', pinyin: 'shén me shí hòu zuò wán?', difficulty: 1, reviewNotes: '终审修订：源语境是追问完成时间（GROUP 27「问时间、原因和情况」），「什么时候好？」语义模糊，改为「什么时候做完」与 selesai 精确对应；「什么」第二字轻声（me）。' },
];

for (const r of rows) {
  r.ttsText = r.chinese; // 现有 zh-CN TTS 路径要求 ttsText 与中文完全一致
  r.tags = ['high-frequency', `cat-${r.category}`];
  r.reviewStatus = 'REVIEW_PASSED'; // 通过本轮内容+技术检查；正式导入前须人工批准为 HUMAN_APPROVED
  r.duplicateStatus = 'CHECKED_NO_CONFLICT';
}

const CATEGORY_ID = { greeting: '问候与礼貌', 'self-intro': '人称与位置', numbers: '数字与数量', time: '日期与时间', shopping: '购物与价格', 'food-drink': '吃饭与饮水', travel: '出行与位置', requests: '简单请求', responses: '日常回应', 'daily-life': '基础生活沟通' };

// —— JSON：与 schemas/mandarin-course-import-v1.schema.json 字段一一对应 ——
const pkg = {
  version: 1,
  direction: 'ID_TO_ZH',
  contentType: 'PUBLIC_HIGH_FREQUENCY',
  // 注意：schema 要求正式导入时 reviewStatus === 'HUMAN_APPROVED'。
  // 本候选包仅通过自动校验与内容自审，人工批准前保持 REVIEW_PASSED（validator 会相应提示）。
  reviewStatus: 'REVIEW_PASSED',
  reviewReference: 'WB-public-core-30-review-2026-10-25-rev2 (pending human approval)',
  course: {
    id: 'mandarin-public-core-30',
    titleZh: '日常高频中文 30 句',
    titleId: '30 Kalimat Mandarin Sehari-hari',
    groupId: 'public-high-frequency',
    scenarioId: 'daily-life-core',
    accessTier: 'FREE',
    requiresPermission: null,
    pathway: { mode: 'SUPPLEMENTAL', recommendedAfterLessonId: null, prerequisiteLessonIds: [] },
  },
  expressions: rows.map((r) => ({
    id: r.id, chinese: r.chinese, pinyin: r.pinyin, indonesian: r.indonesian,
    ttsText: r.ttsText, difficulty: r.difficulty, tags: r.tags,
  })),
};
fs.writeFileSync(path.join(OUT, 'public_core_30_review.json'), JSON.stringify(pkg, null, 2) + '\n');

// —— CSV：含追溯与审核列（JSON Schema 之外的信息都放 CSV）——
const csvEsc = (v) => `"${String(v).replace(/"/g, '""')}"`;
const header = ['id', 'sourceId', 'sourceFile', 'category', 'categoryZh', 'indonesian', 'chinese', 'pinyin', 'ttsText', 'difficulty', 'tags', 'reviewStatus', 'duplicateStatus', 'reviewNotes'];
const lines = [header.join(',')];
for (const r of rows) {
  lines.push([r.id, r.sourceId, r.sourceFile, r.category, CATEGORY_ID[r.category], r.indonesian, r.chinese, r.pinyin, r.ttsText, r.difficulty, r.tags.join('|'), r.reviewStatus, r.duplicateStatus, r.reviewNotes].map(csvEsc).join(','));
}
fs.writeFileSync(path.join(OUT, 'public_core_30_review.csv'), '\ufeff' + lines.join('\r\n') + '\r\n');

console.log(`rows=${rows.length}`);
console.log('categories:', [...new Set(rows.map((r) => r.category))].join(', '));
console.log('out:', OUT);
