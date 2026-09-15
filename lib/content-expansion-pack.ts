export type ExpansionExperienceSeed = {
  code: string;
  task: string;
  indonesian: string;
  explanation: string;
  harvest: string[];
  insight?: { indonesian: string; chinese: string };
  microScene?: {
    task?: string;
    indonesian: string;
    chinese: string;
    explanation?: string;
    harvest?: string[];
    learningTip?: string;
  };
};

// W18 remains omitted because its learning intent is already covered by the
// existing EXP-LIF-153 retention scene. W10 is appended to preserve the IDs
// assigned to the original expansion records.
export const workExpansionSeeds: ExpansionExperienceSeed[] = [
  { code: 'W01', task: '今天表现很好', indonesian: 'Kerja kamu hari ini bagus banget. Pertahankan ya.', explanation: '你今天做得非常好，继续保持。', harvest: ['bagus banget', 'pertahankan'], microScene: { task: '表扬员工今天表现出色', indonesian: 'Kerja kamu hari ini bagus banget. Pertahankan ya.', chinese: '你今天做得非常好，继续保持。', explanation: '“bagus banget”是很口语的“非常好”；“pertahankan ya”用来鼓励员工继续保持当前表现，语气直接但友好。', harvest: ['bagus banget（非常好；特别棒）', 'pertahankan（保持；继续保持）'] } },
  { code: 'W02', task: '最近进步明显', indonesian: 'Saya lihat kamu sekarang sudah jauh lebih baik.', explanation: '我看得出来，你现在进步很多了。', harvest: ['saya lihat', 'jauh lebih baik'], microScene: { task: '员工最近进步明显', indonesian: 'Saya lihat kamu sekarang sudah jauh lebih baik.', chinese: '我看得出来，你现在进步很多了。', explanation: '这里的“saya lihat”不只是字面上的“我看”，更接近“我看得出来 / 我注意到”。“jauh lebih baik”表示“好很多、进步很多”，很适合肯定员工最近的改善。', harvest: ['saya lihat（我看得出来；我注意到）', 'jauh lebih baik（好很多；进步很多）'] } },
  { code: 'W03', task: '对工作成果满意', indonesian: 'Saya puas sama hasil kerja kamu.', explanation: '我对你的工作成果很满意。', harvest: ['puas sama', 'hasil kerja'], microScene: { task: '肯定员工的工作成果', indonesian: 'Saya puas sama hasil kerja kamu.', chinese: '我对你的工作成果很满意。', explanation: '“puas sama...”是口语里很自然的“对……满意”。这里的“sama”是常见口语用法；更正式时可以使用“dengan”。', harvest: ['puas sama（对……满意）', 'hasil kerja（工作成果；工作结果）'] } },
  { code: 'W04', task: '当众表扬员工', indonesian: 'Hari ini dia kerjanya bagus.\nKita kasih apresiasi, ya.', explanation: '他今天表现很好，我们应该给他肯定。', harvest: ['apresiasi', 'kasih apresiasi'] },
  { code: 'W05', task: '主动解决问题', indonesian: 'Bagus. Saya suka cara kamu selesaikan masalah ini.', explanation: '不错，我喜欢你解决这个问题的方法。', harvest: ['cara', 'selesaikan masalah'] },
  { code: 'W06', task: '员工提出好建议', indonesian: 'Ide kamu bagus. Kita coba.', explanation: '你的想法不错，我们试试。', harvest: ['ide', 'kita coba'], microScene: { task: '接受员工提出的好建议', indonesian: 'Ide kamu bagus. Kita coba.', chinese: '你的想法不错，我们试试。', explanation: '“kita coba”是非常自然、直接的“我们试试”，适合主管接受员工建议并决定尝试时使用。', harvest: ['ide（想法；主意）', 'kita coba（我们试试）'] } },
  { code: 'W07', task: '我相信你', indonesian: 'Saya percaya sama kamu.\nCoba kamu handle sendiri.', explanation: '我相信你，这次你自己负责看看。', harvest: ['percaya sama', 'handle sendiri'], microScene: { task: '向员工表达信任', indonesian: 'Saya percaya sama kamu.', chinese: '我相信你。', explanation: '“percaya sama...”是口语里的“相信 / 信任……”。对员工这样说，可以明确表达信任，也为后续授权做铺垫。', harvest: ['percaya sama kamu（相信你；信任你）'] } },
  { code: 'W08', task: '第一次授权负责', indonesian: 'Mulai sekarang, bagian ini kamu yang pegang.', explanation: '从现在开始，这部分你来负责。', harvest: ['mulai sekarang', 'pegang'], microScene: { task: '第一次授权员工负责一个区域', indonesian: 'Mulai sekarang, bagian ini kamu yang pegang.', chinese: '从现在开始，这部分你来负责。', explanation: '“pegang”本义是“拿、握”，在工作场景里经常表示“负责、掌管”。这里是把某个工作区域正式交给员工负责。', harvest: ['mulai sekarang（从现在开始）', 'pegang（负责；掌管）'] } },
  { code: 'W09', task: '完成困难任务', indonesian: 'Saya tahu ini gak gampang.\nKamu kerjainnya bagus.', explanation: '我知道这不容易，你完成得很好。', harvest: ['gak gampang', 'kerjain'] },
  { code: 'W11', task: '感谢整个团队', indonesian: 'Makasih semuanya.\nMinggu ini kalian kerja keras banget.', explanation: '谢谢大家，这周大家真的辛苦了。', harvest: ['semuanya', 'kalian'] },
  { code: 'W12', task: '达到目标', indonesian: 'Target bulan ini tercapai.\nKerja bagus, semuanya.', explanation: '这个月目标达成了，大家干得漂亮。', harvest: ['target', 'tercapai'], microScene: { task: '表扬团队完成本月目标', indonesian: 'Target bulan ini tercapai.', chinese: '这个月目标达成了。', explanation: '“tercapai”表示目标已经达到或实现。“sasaran”也表示“目标”，但实际工作沟通中经常直接使用“target”。', harvest: ['target（目标）', 'sasaran（目标）', 'tercapai（达到；实现；达成）'] } },
  { code: 'W13', task: '超额完成目标', indonesian: 'Kita bukan cuma capai target,\ntapi lewat target. Mantap!', explanation: '我们不只是达标，还超额了。干得漂亮！', harvest: ['capai target', 'lewat target', 'mantap'] },
  { code: 'W14', task: '表扬新人学得快', indonesian: 'Untuk orang baru, kamu belajarnya cepat.\nBagus.', explanation: '对新人来说，你学得很快，不错。', harvest: ['orang baru', 'belajarnya cepat'] },
  { code: 'W15', task: '犯错后鼓励', indonesian: 'Gak apa-apa salah.\nYang penting tahu salahnya di mana\ndan jangan diulang.', explanation: '犯错没关系，重要的是知道错在哪里，\n下次别再犯。', harvest: ['gak apa-apa', 'yang penting', 'jangan diulang'], microScene: { task: '员工犯错后先安抚再提醒', indonesian: 'Gak apa-apa salah.', chinese: '犯错没关系。', explanation: '“gak apa-apa”先缓和气氛，表示“没关系”。接着用“yang penting...”强调真正重要的事，再用“jangan diulang”明确提醒不要再犯。', harvest: ['gak apa-apa（没关系；不要紧）', 'yang penting（重要的是……）', 'jangan diulang（不要再犯；不要再重复）'] } },
  { code: 'W16', task: '再给一次机会', indonesian: 'Saya kasih kamu kesempatan sekali lagi.\nTunjukkan kamu bisa.', explanation: '我再给你一次机会，证明你可以。', harvest: ['kesempatan', 'sekali lagi', 'tunjukkan'], microScene: { task: '给犯错员工再一次机会', indonesian: 'Saya kasih kamu kesempatan sekali lagi.', chinese: '我再给你一次机会。', explanation: '“kasih ... kesempatan”是口语里的“给……机会”；“sekali lagi”表示“再一次”。这句话适合在明确要求改进的同时，继续鼓励员工。', harvest: ['kesempatan（机会）', 'sekali lagi（再一次；再给一次）'] } },
  { code: 'W17', task: '员工最近状态不好', indonesian: 'Akhir-akhir ini kamu kelihatan kurang fokus.\nAda masalah?', explanation: '最近你好像不太专注，是不是有什么问题？', harvest: ['akhir-akhir ini', 'kurang fokus'] },
  { code: 'W19', task: '表扬员工帮助同事', indonesian: 'Bagus kamu mau bantu teman satu tim.\nSaya hargai itu.', explanation: '你愿意帮助团队里的同事，这点很好，\n我很认可。', harvest: ['teman satu tim', 'saya hargai'], microScene: { task: '表扬员工主动帮助同事', indonesian: 'Saya hargai itu.', chinese: '我很认可这一点。', explanation: '“saya hargai itu”可以表示“我认可 / 我重视这一点”，适合肯定员工主动帮助团队，而不只是泛泛地说“很好”。', harvest: ['saya hargai itu（我认可这一点；我很重视这一点）', 'teman satu tim（同一团队的同事；队友）'] } },
  { code: 'W20', task: '告诉员工未来有机会', indonesian: 'Kalau kamu terus berkembang seperti ini,\nke depannya kamu bisa pegang tanggung jawab lebih besar.', explanation: '如果你继续这样进步，\n以后可以承担更大的责任。', harvest: ['berkembang', 'ke depannya', 'tanggung jawab'] },
  { code: 'W10', task: '感谢今天辛苦工作', indonesian: 'Makasih ya, hari ini sudah kerja keras.', explanation: '谢谢你，今天辛苦了。', harvest: ['makasih', 'kerja keras'], microScene: { task: '下班前感谢员工今天辛苦工作', indonesian: 'Makasih ya, hari ini sudah kerja keras.', chinese: '谢谢你，今天辛苦了。', explanation: '“makasih ya”是口语化的感谢；“sudah kerja keras”强调对方今天已经付出的努力，适合下班前表达认可。', harvest: ['makasih ya（谢谢；辛苦了）', 'kerja keras（努力工作；辛苦付出）'] } },
];

// S17 remains omitted because the same ability already exists in EXP-LIF-213.
// S01, S07, and S08 are appended to preserve the IDs assigned to the original
// expansion records while making the Human-approved exact variants available.
export const socialExpansionSeeds: ExpansionExperienceSeed[] = [
  { code: 'S02', task: '夸笑容', indonesian: 'Senyum kamu manis banget.', explanation: '你的笑容真的很甜。', harvest: ['senyum', 'manis banget'], microScene: { indonesian: 'Senyum kamu manis banget.', chinese: '你的笑容真的很甜。' } },
  { code: 'S03', task: '越来越漂亮', indonesian: 'Kok kamu makin cantik sih?', explanation: '你怎么越来越漂亮了？', harvest: ['makin cantik', 'sih'], insight: { indonesian: 'Kok + subject + makin + adjective + sih?', chinese: 'Kok + subject + makin + adjective + sih?' }, microScene: { indonesian: 'Kok kamu makin cantik sih?', chinese: '你怎么越来越漂亮了？' } },
  { code: 'S04', task: '安全地夸身材', indonesian: 'Kamu kelihatan makin fit.', explanation: '你看起来身材越来越好了。', harvest: ['kelihatan', 'makin fit'], insight: { indonesian: 'Safer than directly commenting on someone’s body.', chinese: 'Safer than directly commenting on someone’s body.' }, microScene: { indonesian: 'Kamu kelihatan makin fit.', chinese: '你看起来越来越有精神了。' } },
  { code: 'S05', task: '直接夸身材', indonesian: 'Body kamu bagus banget.', explanation: '你身材真的很好。', harvest: ['body kamu', 'bagus banget'], insight: { indonesian: 'Flirty / use only when relationship is appropriate.', chinese: 'Flirty / use only when relationship is appropriate.' }, microScene: { indonesian: 'Body kamu bagus banget.', chinese: '你身材真的很好。' } },
  { code: 'S06', task: '夸性感', indonesian: 'Kamu seksi banget malam ini.', explanation: '你今晚真的很性感。', harvest: ['seksi banget', 'malam ini'], insight: { indonesian: 'Strong flirting.', chinese: 'Strong flirting.' }, microScene: { indonesian: 'Kamu seksi banget malam ini.', chinese: '你今晚真的很性感。' } },
  { code: 'S09', task: '被搞得害羞', indonesian: 'Kok kamu bikin aku salting sih?', explanation: '你怎么搞得我都不好意思了？', harvest: ['salting', 'bikin aku'], insight: { indonesian: 'salting = salah tingkah. It describes being nervous, awkward, or flustered, often because of attraction or teasing—not simply “malu”.', chinese: 'salting = salah tingkah. It describes being nervous, awkward, or flustered, often because of attraction or teasing—not simply “malu”.' }, microScene: { indonesian: 'Kok kamu bikin aku salting sih?', chinese: '你怎么搞得我都不好意思了？' } },
  { code: 'S10', task: '开始喜欢对方', indonesian: 'Kayaknya aku mulai suka sama kamu.', explanation: '我好像开始喜欢上你了。', harvest: ['kayaknya', 'mulai suka'], microScene: { indonesian: 'Kayaknya aku mulai suka sama kamu.', chinese: '我好像开始喜欢上你了。' } },
  { code: 'S11', task: '我喜欢你', indonesian: 'Aku suka sama kamu.', explanation: '我喜欢你。', harvest: ['suka sama kamu'], microScene: { indonesian: 'Aku suka sama kamu.', chinese: '我喜欢你。' } },
  { code: 'S12', task: '我想你了', indonesian: 'Aku kangen kamu.', explanation: '我想你了。', harvest: ['kangen kamu'], microScene: { indonesian: 'Aku kangen kamu.', chinese: '我想你了。' } },
  { code: 'S13', task: '日常亲密的“爱你”', indonesian: 'Aku sayang kamu.', explanation: '我爱你 / 我很在乎你。', harvest: ['sayang kamu'], insight: { indonesian: '“sayang” is extremely important in Indonesian intimate relationships and is often more conversational than a solemn “cinta”.', chinese: '“sayang” is extremely important in Indonesian intimate relationships and is often more conversational than a solemn “cinta”.' }, microScene: { indonesian: 'Aku sayang kamu.', chinese: '我爱你 / 我很在乎你。' } },
  { code: 'S14', task: '郑重说我爱你', indonesian: 'Aku cinta kamu.', explanation: '我爱你。', harvest: ['cinta kamu'], insight: { indonesian: 'More direct / solemn romantic declaration than many everyday uses of “sayang”.', chinese: 'More direct / solemn romantic declaration than many everyday uses of “sayang”.' }, microScene: { indonesian: 'Aku cinta kamu.', chinese: '我爱你。' } },
  { code: 'S15', task: '你对我有感觉吗', indonesian: 'Kamu juga ada rasa sama aku, gak?', explanation: '你对我也有感觉吗？', harvest: ['ada rasa'], microScene: { indonesian: 'Kamu juga ada rasa sama aku, gak?', chinese: '你对我也有感觉吗？' } },
  { code: 'S16', task: '我们到底什么关系', indonesian: 'Sebenarnya hubungan kita ini apa?', explanation: '我们现在到底算什么关系？', harvest: ['hubungan kita', 'sebenarnya'] },
  { code: 'S18', task: '我想抱你', indonesian: 'Aku pengin peluk kamu.', explanation: '我想抱你。', harvest: ['pengin peluk'], microScene: { indonesian: 'Aku pengin peluk kamu.', chinese: '我想抱你。' } },
  { code: 'S19', task: '我想亲你', indonesian: 'Aku pengin cium kamu. Boleh?', explanation: '我想亲你，可以吗？', harvest: ['pengin cium', 'boleh'], insight: { indonesian: '“Boleh?” is pedagogically important here.', chinese: '“Boleh?” is pedagogically important here.' }, microScene: { indonesian: 'Aku pengin cium kamu. Boleh?', chinese: '我想亲你，可以吗？' } },
  { code: 'S20', task: '我想和你睡', indonesian: 'Aku pengin tidur sama kamu.\nKamu nyaman gak kalau kita lanjut?', explanation: '我想和你睡。\n如果我们继续，你愿意吗 / 你觉得舒服吗？', harvest: ['tidur sama kamu', 'nyaman', 'kalau kita lanjut', 'Aku pengin kamu temenin aku malam ini.（我想让你今晚陪我。）', 'Aku cuma pengin peluk kamu.（我只是想抱抱你。）', 'Aku belum siap.（我还没准备好。）', 'Aku gak nyaman.（我不愿意 / 我觉得不舒服。）', 'Jangan dulu.（先不要。）', 'Boleh.（可以。）'], insight: { indonesian: '“Aku pengin tidur sama kamu” can carry a clear sexual implication in an intimate context. The learning goal is real communication and understanding consent and boundaries.', chinese: '“Aku pengin tidur sama kamu” can carry a clear sexual implication in an intimate context. The learning goal is real communication and understanding consent and boundaries.' } },
  { code: 'S01', task: '夸今天很漂亮', indonesian: 'Kamu cantik banget hari ini.', explanation: '你今天真的很漂亮。', harvest: ['cantik banget', 'hari ini'], microScene: { indonesian: 'Kamu cantik banget hari ini.', chinese: '你今天真的很漂亮。' } },
  { code: 'S07', task: '询问 Instagram', indonesian: 'Boleh minta IG kamu?', explanation: '可以要你的 Instagram 吗？', harvest: ['boleh minta', 'IG kamu'], microScene: { indonesian: 'Boleh minta IG kamu?', chinese: '可以要你的 Instagram 吗？' } },
  { code: 'S08', task: '邀请下次一起玩', indonesian: 'Kapan-kapan kita nongkrong bareng, yuk.', explanation: '改天我们一起出来玩吧。', harvest: ['kapan-kapan', 'nongkrong bareng'], microScene: { indonesian: 'Kapan-kapan kita nongkrong bareng, yuk.', chinese: '改天我们一起出来玩吧。' } },
];
