export type ExpansionExperienceSeed = {
  code: string;
  task: string;
  indonesian: string;
  explanation: string;
  harvest: string[];
  insight?: { indonesian: string; chinese: string };
};

// W10 and W18 are intentionally omitted: their learning intents are already
// covered by EXP-NAN-020 and the existing EXP-LIF-153 retention scene.
export const workExpansionSeeds: ExpansionExperienceSeed[] = [
  { code: 'W01', task: '今天表现很好', indonesian: 'Kerja kamu hari ini bagus banget. Pertahankan ya.', explanation: '你今天做得非常好，继续保持。', harvest: ['bagus banget', 'pertahankan'], insight: { indonesian: '“Pertahankan ya” is a natural way to say “继续保持”.', chinese: '“Pertahankan ya” is a natural way to say “继续保持”.' } },
  { code: 'W02', task: '最近进步明显', indonesian: 'Saya lihat kamu sekarang sudah jauh lebih baik.', explanation: '我看得出来，你现在进步很多了。', harvest: ['saya lihat', 'jauh lebih baik'] },
  { code: 'W03', task: '对工作成果满意', indonesian: 'Saya puas sama hasil kerja kamu.', explanation: '我对你的工作成果很满意。', harvest: ['puas sama', 'hasil kerja'], insight: { indonesian: 'In normal workplace conversation, “sama” is common and natural.', chinese: 'In normal workplace conversation, “sama” is common and natural.' } },
  { code: 'W04', task: '当众表扬员工', indonesian: 'Hari ini dia kerjanya bagus.\nKita kasih apresiasi, ya.', explanation: '他今天表现很好，我们应该给他肯定。', harvest: ['apresiasi', 'kasih apresiasi'] },
  { code: 'W05', task: '主动解决问题', indonesian: 'Bagus. Saya suka cara kamu selesaikan masalah ini.', explanation: '不错，我喜欢你解决这个问题的方法。', harvest: ['cara', 'selesaikan masalah'] },
  { code: 'W06', task: '员工提出好建议', indonesian: 'Ide kamu bagus. Kita coba.', explanation: '你的想法不错，我们试试。', harvest: ['ide', 'kita coba'] },
  { code: 'W07', task: '我相信你', indonesian: 'Saya percaya sama kamu.\nCoba kamu handle sendiri.', explanation: '我相信你，这次你自己负责看看。', harvest: ['percaya sama', 'handle sendiri'], insight: { indonesian: '“handle” is intentionally retained as common Indonesian workplace code-switching.', chinese: '“handle” is intentionally retained as common Indonesian workplace code-switching.' } },
  { code: 'W08', task: '第一次授权负责', indonesian: 'Mulai sekarang, bagian ini kamu yang pegang.', explanation: '从现在开始，这部分你来负责。', harvest: ['mulai sekarang', 'pegang'], insight: { indonesian: '“pegang” can mean being responsible for / handling a work area.', chinese: '“pegang” can mean being responsible for / handling a work area.' } },
  { code: 'W09', task: '完成困难任务', indonesian: 'Saya tahu ini gak gampang.\nKamu kerjainnya bagus.', explanation: '我知道这不容易，你完成得很好。', harvest: ['gak gampang', 'kerjain'] },
  { code: 'W11', task: '感谢整个团队', indonesian: 'Makasih semuanya.\nMinggu ini kalian kerja keras banget.', explanation: '谢谢大家，这周大家真的辛苦了。', harvest: ['semuanya', 'kalian'] },
  { code: 'W12', task: '达到目标', indonesian: 'Target bulan ini tercapai.\nKerja bagus, semuanya.', explanation: '这个月目标达成了，大家干得漂亮。', harvest: ['target', 'tercapai'] },
  { code: 'W13', task: '超额完成目标', indonesian: 'Kita bukan cuma capai target,\ntapi lewat target. Mantap!', explanation: '我们不只是达标，还超额了。干得漂亮！', harvest: ['capai target', 'lewat target', 'mantap'] },
  { code: 'W14', task: '表扬新人学得快', indonesian: 'Untuk orang baru, kamu belajarnya cepat.\nBagus.', explanation: '对新人来说，你学得很快，不错。', harvest: ['orang baru', 'belajarnya cepat'] },
  { code: 'W15', task: '犯错后鼓励', indonesian: 'Gak apa-apa salah.\nYang penting tahu salahnya di mana\ndan jangan diulang.', explanation: '犯错没关系，重要的是知道错在哪里，\n下次别再犯。', harvest: ['gak apa-apa', 'yang penting', 'jangan diulang'] },
  { code: 'W16', task: '再给一次机会', indonesian: 'Saya kasih kamu kesempatan sekali lagi.\nTunjukkan kamu bisa.', explanation: '我再给你一次机会，证明你可以。', harvest: ['kesempatan', 'sekali lagi', 'tunjukkan'] },
  { code: 'W17', task: '员工最近状态不好', indonesian: 'Akhir-akhir ini kamu kelihatan kurang fokus.\nAda masalah?', explanation: '最近你好像不太专注，是不是有什么问题？', harvest: ['akhir-akhir ini', 'kurang fokus'] },
  { code: 'W19', task: '表扬员工帮助同事', indonesian: 'Bagus kamu mau bantu teman satu tim.\nSaya hargai itu.', explanation: '你愿意帮助团队里的同事，这点很好，\n我很认可。', harvest: ['teman satu tim', 'saya hargai'] },
  { code: 'W20', task: '告诉员工未来有机会', indonesian: 'Kalau kamu terus berkembang seperti ini,\nke depannya kamu bisa pegang tanggung jawab lebih besar.', explanation: '如果你继续这样进步，\n以后可以承担更大的责任。', harvest: ['berkembang', 'ke depannya', 'tanggung jawab'] },
];

// S01, S07, S08, and S17 are intentionally omitted because the same abilities
// already exist in EXP-LIF-197, EXP-SOC-008, EXP-SOC-009/030, and EXP-LIF-213.
export const socialExpansionSeeds: ExpansionExperienceSeed[] = [
  { code: 'S02', task: '夸笑容', indonesian: 'Senyum kamu manis banget.', explanation: '你的笑容真的很甜。', harvest: ['senyum', 'manis banget'] },
  { code: 'S03', task: '越来越漂亮', indonesian: 'Kok kamu makin cantik sih?', explanation: '你怎么越来越漂亮了？', harvest: ['makin cantik', 'sih'], insight: { indonesian: 'Kok + subject + makin + adjective + sih?', chinese: 'Kok + subject + makin + adjective + sih?' } },
  { code: 'S04', task: '安全地夸身材', indonesian: 'Kamu kelihatan makin fit.', explanation: '你看起来身材越来越好了。', harvest: ['kelihatan', 'makin fit'], insight: { indonesian: 'Safer than directly commenting on someone’s body.', chinese: 'Safer than directly commenting on someone’s body.' } },
  { code: 'S05', task: '直接夸身材', indonesian: 'Body kamu bagus banget.', explanation: '你身材真的很好。', harvest: ['body kamu', 'bagus banget'], insight: { indonesian: 'Flirty / use only when relationship is appropriate.', chinese: 'Flirty / use only when relationship is appropriate.' } },
  { code: 'S06', task: '夸性感', indonesian: 'Kamu seksi banget malam ini.', explanation: '你今晚真的很性感。', harvest: ['seksi banget', 'malam ini'], insight: { indonesian: 'Strong flirting.', chinese: 'Strong flirting.' } },
  { code: 'S09', task: '被搞得害羞', indonesian: 'Kok kamu bikin aku salting sih?', explanation: '你怎么搞得我都不好意思了？', harvest: ['salting', 'bikin aku'], insight: { indonesian: 'salting = salah tingkah. It describes being nervous, awkward, or flustered, often because of attraction or teasing—not simply “malu”.', chinese: 'salting = salah tingkah. It describes being nervous, awkward, or flustered, often because of attraction or teasing—not simply “malu”.' } },
  { code: 'S10', task: '开始喜欢对方', indonesian: 'Kayaknya aku mulai suka sama kamu.', explanation: '我好像开始喜欢上你了。', harvest: ['kayaknya', 'mulai suka'] },
  { code: 'S11', task: '我喜欢你', indonesian: 'Aku suka sama kamu.', explanation: '我喜欢你。', harvest: ['suka sama kamu'] },
  { code: 'S12', task: '我想你了', indonesian: 'Aku kangen kamu.', explanation: '我想你了。', harvest: ['kangen kamu'] },
  { code: 'S13', task: '日常亲密的“爱你”', indonesian: 'Aku sayang kamu.', explanation: '我爱你 / 我很在乎你。', harvest: ['sayang kamu'], insight: { indonesian: '“sayang” is extremely important in Indonesian intimate relationships and is often more conversational than a solemn “cinta”.', chinese: '“sayang” is extremely important in Indonesian intimate relationships and is often more conversational than a solemn “cinta”.' } },
  { code: 'S14', task: '郑重说我爱你', indonesian: 'Aku cinta kamu.', explanation: '我爱你。', harvest: ['cinta kamu'], insight: { indonesian: 'More direct / solemn romantic declaration than many everyday uses of “sayang”.', chinese: 'More direct / solemn romantic declaration than many everyday uses of “sayang”.' } },
  { code: 'S15', task: '你对我有感觉吗', indonesian: 'Kamu juga ada rasa sama aku, gak?', explanation: '你对我也有感觉吗？', harvest: ['ada rasa'] },
  { code: 'S16', task: '我们到底什么关系', indonesian: 'Sebenarnya hubungan kita ini apa?', explanation: '我们现在到底算什么关系？', harvest: ['hubungan kita', 'sebenarnya'] },
  { code: 'S18', task: '我想抱你', indonesian: 'Aku pengin peluk kamu.', explanation: '我想抱你。', harvest: ['pengin peluk'] },
  { code: 'S19', task: '我想亲你', indonesian: 'Aku pengin cium kamu. Boleh?', explanation: '我想亲你，可以吗？', harvest: ['pengin cium', 'boleh'], insight: { indonesian: '“Boleh?” is pedagogically important here.', chinese: '“Boleh?” is pedagogically important here.' } },
  { code: 'S20', task: '我想和你睡', indonesian: 'Aku pengin tidur sama kamu.\nKamu nyaman gak kalau kita lanjut?', explanation: '我想和你睡。\n如果我们继续，你愿意吗 / 你觉得舒服吗？', harvest: ['tidur sama kamu', 'nyaman', 'kalau kita lanjut', 'Aku pengin kamu temenin aku malam ini.（我想让你今晚陪我。）', 'Aku cuma pengin peluk kamu.（我只是想抱抱你。）', 'Aku belum siap.（我还没准备好。）', 'Aku gak nyaman.（我不愿意 / 我觉得不舒服。）', 'Jangan dulu.（先不要。）', 'Boleh.（可以。）'], insight: { indonesian: '“Aku pengin tidur sama kamu” can carry a clear sexual implication in an intimate context. The learning goal is real communication and understanding consent and boundaries.', chinese: '“Aku pengin tidur sama kamu” can carry a clear sexual implication in an intimate context. The learning goal is real communication and understanding consent and boundaries.' } },
];
