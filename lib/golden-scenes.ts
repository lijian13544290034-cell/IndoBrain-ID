import type { WorkplacePattern } from '@/lib/workplace-patterns';

export type GoldenSceneLine = {
  speaker: string;
  indonesian: string;
  chinese: string;
};

export type GoldenScenePair = {
  indonesian: string;
  chinese: string;
};

export type GoldenSceneContent = {
  situation: string;
  dialogue: GoldenSceneLine[];
  replies: GoldenScenePair[];
  variations: GoldenScenePair[];
  localUsage?: GoldenScenePair;
  easyMistake?: GoldenScenePair;
  trySay: GoldenScenePair;
};

export type GoldenLifeExperience = {
  id: string;
  category: 'gold';
  task: string;
  chinese: string;
  indonesian: string;
  explanation: string;
  harvest: string[];
  pattern: WorkplacePattern;
  goldenScene: GoldenSceneContent;
};

const pattern = (indonesian: string, chinese: string): WorkplacePattern => ({ indonesian, chinese });

const scene = (
  id: string,
  task: string,
  indonesian: string,
  explanation: string,
  harvest: string[],
  patternText: WorkplacePattern,
  goldenScene: GoldenSceneContent,
): GoldenLifeExperience => ({
  id,
  category: 'gold',
  task,
  chinese: task,
  indonesian,
  explanation,
  harvest,
  pattern: patternText,
  goldenScene,
});

export const goldenLifeExperiences: GoldenLifeExperience[] = [
  scene(
    'EXP-LIF-274',
    '问厕所在哪里',
    'Permisi, toiletnya di mana?',
    '在商场、机场、医院等地方礼貌询问厕所，并听懂常见方向回答。',
    ['permisi', 'di mana', 'lurus saja', 'belok kanan', 'di sebelah'],
    pattern('Permisi, [tempat] di mana?', '不好意思，[地方]在哪里？'),
    {
      situation: '在商场、机场、医院等地方询问厕所，并听懂常见方向回答。',
      dialogue: [
        { speaker: '我', indonesian: 'Permisi, toiletnya di mana?', chinese: '不好意思，请问厕所在哪里？' },
        { speaker: '对方', indonesian: 'Lurus saja, lalu belok kanan.', chinese: '一直往前走，然后右转。' },
        { speaker: '我', indonesian: 'Oh, di sebelah lift, ya?', chinese: '哦，是在电梯旁边，对吗？' },
        { speaker: '对方', indonesian: 'Iya, betul.', chinese: '对，没错。' },
        { speaker: '我', indonesian: 'Terima kasih.', chinese: '谢谢。' },
      ],
      replies: [
        { indonesian: 'Di sebelah kiri.', chinese: '在左边。' },
        { indonesian: 'Di lantai dua.', chinese: '在二楼。' },
        { indonesian: 'Di bawah.', chinese: '在楼下。' },
        { indonesian: 'Di samping lift.', chinese: '在电梯旁边。' },
        { indonesian: 'Di belakang kasir.', chinese: '在收银台后面。' },
      ],
      variations: [
        { indonesian: 'Permisi, ATM-nya di mana?', chinese: '请问 ATM 在哪里？' },
        { indonesian: 'Permisi, liftnya di mana?', chinese: '请问电梯在哪里？' },
        { indonesian: 'Permisi, pintu keluarnya di mana?', chinese: '请问出口在哪里？' },
        { indonesian: 'Permisi, tempat parkirnya di mana?', chinese: '请问停车场在哪里？' },
      ],
      localUsage: { indonesian: 'Toiletnya di mana, ya?', chinese: '更随意：厕所在哪里呀？' },
      easyMistake: { indonesian: 'WC di mana?', chinese: '能听懂，但对陌生人略显生硬。' },
      trySay: { indonesian: 'Permisi, toiletnya di mana?', chinese: '不好意思，请问厕所在哪里？' },
    },
  ),
  scene(
    'EXP-LIF-275',
    '咖啡店点咖啡',
    'Mbak, saya mau pesan satu es kopi susu.',
    '完成点单，并听懂冷热、杯型、糖量、堂食/外带等常见问题。',
    ['pesan', 'yang sedang', 'kurang gula', 'dibawa pulang', 'ditunggu sebentar'],
    pattern('Saya mau pesan satu [minuman].', '我想点一杯[饮料]。'),
    {
      situation: '完成点单，并听懂冷热、杯型、糖量、堂食/外带等常见问题。',
      dialogue: [
        { speaker: '我', indonesian: 'Mbak, saya mau pesan satu es kopi susu.', chinese: '你好，我想点一杯冰奶咖。' },
        { speaker: '店员', indonesian: 'Yang ukuran sedang atau besar?', chinese: '要中杯还是大杯？' },
        { speaker: '我', indonesian: 'Yang sedang saja.', chinese: '中杯就可以。' },
        { speaker: '店员', indonesian: 'Gulanya normal?', chinese: '糖正常吗？' },
        { speaker: '我', indonesian: 'Kurang gula, ya.', chinese: '少糖，谢谢。' },
        { speaker: '店员', indonesian: 'Baik, ditunggu sebentar.', chinese: '好的，请稍等一下。' },
      ],
      replies: [
        { indonesian: 'Mau panas atau dingin?', chinese: '要热的还是冰的？' },
        { indonesian: 'Makan di sini atau dibawa pulang?', chinese: '在这里喝还是带走？' },
        { indonesian: 'Mau tambah gula?', chinese: '要加糖吗？' },
        { indonesian: 'Pakai es?', chinese: '要冰吗？' },
      ],
      variations: [
        { indonesian: 'Saya mau pesan satu kopi hitam.', chinese: '我想点一杯黑咖啡。' },
        { indonesian: 'Saya mau pesan satu teh.', chinese: '我想点一杯茶。' },
        { indonesian: 'Saya mau pesan satu air mineral.', chinese: '我想要一瓶矿泉水。' },
        { indonesian: 'Tanpa gula.', chinese: '不要糖。' },
        { indonesian: 'Sedikit es.', chinese: '少冰。' },
        { indonesian: 'Tanpa es.', chinese: '不要冰。' },
      ],
      localUsage: { indonesian: 'Saya mau...', chinese: '日常点单里这样说非常自然。' },
      easyMistake: { indonesian: 'Saya ingin...', chinese: '没有错，但普通点单里通常更直接。' },
      trySay: { indonesian: 'Saya mau pesan satu kopi.', chinese: '我想点一杯咖啡。' },
    },
  ),
  scene(
    'EXP-LIF-276',
    '打车告诉司机目的地',
    'Pak, kita ke Grand Indonesia, ya.',
    '告诉司机目的地、确认路线，并听懂道路和时间相关回答。',
    ['lewat', 'jalan tol', 'lebih cepat', 'macet', 'sebentar lagi sampai'],
    pattern('Kita ke [tempat] ya.', '我们去[地点]吧。'),
    {
      situation: '告诉司机目的地、确认路线，并听懂道路和时间相关回答。',
      dialogue: [
        { speaker: '我', indonesian: 'Pak, kita ke Grand Indonesia, ya.', chinese: '师傅，我们去 Grand Indonesia。' },
        { speaker: '司机', indonesian: 'Lewat jalan biasa atau tol?', chinese: '走普通道路还是高速？' },
        { speaker: '我', indonesian: 'Kalau lewat tol lebih cepat, lewat tol saja.', chinese: '如果走高速更快，就走高速吧。' },
        { speaker: '司机', indonesian: 'Baik. Sekitar tiga puluh menit.', chinese: '好的，大约三十分钟。' },
        { speaker: '我', indonesian: 'Oke, Pak.', chinese: '好的，师傅。' },
      ],
      replies: [
        { indonesian: 'Jalannya macet.', chinese: '路上堵车。' },
        { indonesian: 'Kita lewat sini saja.', chinese: '我们从这里走吧。' },
        { indonesian: 'Sebentar lagi sampai.', chinese: '马上到了。' },
        { indonesian: 'Turun di sini saja?', chinese: '在这里下车吗？' },
        { indonesian: 'Lokasinya di sebelah mana?', chinese: '具体在哪一边？' },
      ],
      variations: [
        { indonesian: 'Pak, kita ke bandara, ya.', chinese: '师傅，我们去机场。' },
        { indonesian: 'Pak, kita ke hotel, ya.', chinese: '师傅，我们去酒店。' },
        { indonesian: 'Pak, kita ke kantor, ya.', chinese: '师傅，我们去办公室。' },
        { indonesian: 'Pak, kita ke pabrik, ya.', chinese: '师傅，我们去工厂。' },
        { indonesian: 'Berhenti di sini saja.', chinese: '就在这里停吧。' },
      ],
      localUsage: { indonesian: 'Kita ke... ya.', chinese: '这是很自然的日常表达。' },
      easyMistake: { indonesian: 'Pergi ke Grand Indonesia.', chinese: '过于命令式，不如一起出发的说法自然。' },
      trySay: { indonesian: 'Pak, kita ke kantor, ya.', chinese: '师傅，我们去办公室。' },
    },
  ),
  scene(
    'EXP-LIF-277',
    '超市结账',
    'Pakai kantong plastik?',
    '听懂收银员关于袋子、支付方式、零钱和小票的常见问题。',
    ['kantong plastik', 'tunai', 'QRIS', 'struk', 'uang kecil'],
    pattern('Bayarnya [metode] saja.', '付款方式用[方式]就可以。'),
    {
      situation: '听懂收银员关于袋子、支付方式、零钱和小票的常见问题。',
      dialogue: [
        { speaker: '收银员', indonesian: 'Pakai kantong plastik?', chinese: '需要塑料袋吗？' },
        { speaker: '我', indonesian: 'Iya, satu saja.', chinese: '要，一个就可以。' },
        { speaker: '收银员', indonesian: 'Bayarnya tunai atau QRIS?', chinese: '现金还是 QRIS？' },
        { speaker: '我', indonesian: 'QRIS saja.', chinese: 'QRIS 就可以。' },
        { speaker: '收银员', indonesian: 'Struknya mau?', chinese: '要小票吗？' },
        { speaker: '我', indonesian: 'Tidak usah, terima kasih.', chinese: '不用了，谢谢。' },
      ],
      replies: [
        { indonesian: 'Ada uang kecil?', chinese: '有零钱吗？' },
        { indonesian: 'Mau pakai member?', chinese: '要用会员吗？' },
        { indonesian: 'Ada kartu member?', chinese: '有会员卡吗？' },
        { indonesian: 'Bawa kantong sendiri?', chinese: '自己带袋子了吗？' },
        { indonesian: 'Kembaliannya lima ribu.', chinese: '找您五千。' },
      ],
      variations: [
        { indonesian: 'Bayar pakai tunai.', chinese: '用现金支付。' },
        { indonesian: 'Bayar pakai kartu.', chinese: '用卡支付。' },
        { indonesian: 'QRIS saja.', chinese: 'QRIS 就可以。' },
        { indonesian: 'Satu saja.', chinese: '一个就行。' },
        { indonesian: 'Dua saja.', chinese: '两个就行。' },
      ],
      localUsage: { indonesian: 'Tidak usah.', chinese: '日常里非常高频的“不用了”。' },
      easyMistake: { indonesian: 'Saya tidak mau.', chinese: '能懂，但收银时不如直接说“不用了”自然。' },
      trySay: { indonesian: 'QRIS saja.', chinese: 'QRIS 就可以。' },
    },
  ),
  scene(
    'EXP-LIF-278',
    '请家务人员帮忙',
    'Mbak, tolong bersihkan dapurnya dulu, ya.',
    '自然、礼貌地请家务人员完成具体任务，并确认完成情况。',
    ['tolong', 'bersihkan', 'setelah itu', 'sudah selesai', 'kasih tahu'],
    pattern('Tolong [aksi] dulu, ya.', '麻烦先[动作]一下。'),
    {
      situation: '自然、礼貌地请家务人员完成具体任务，并确认完成情况。',
      dialogue: [
        { speaker: '我', indonesian: 'Mbak, tolong bersihkan dapurnya dulu, ya.', chinese: '麻烦先把厨房打扫一下。' },
        { speaker: '对方', indonesian: 'Sekarang, Bu?', chinese: '现在吗？' },
        { speaker: '我', indonesian: 'Iya. Setelah itu, tolong pel lantainya juga.', chinese: '对。之后也麻烦拖一下地。' },
        { speaker: '对方', indonesian: 'Baik, Bu.', chinese: '好的。' },
        { speaker: '我', indonesian: 'Kalau sudah selesai, kasih tahu saya, ya.', chinese: '弄完以后告诉我一下。' },
      ],
      replies: [
        { indonesian: 'Sebentar lagi, Bu.', chinese: '马上。' },
        { indonesian: 'Setelah saya cuci baju, ya.', chinese: '我洗完衣服以后做。' },
        { indonesian: 'Sudah selesai.', chinese: '已经做好了。' },
        { indonesian: 'Sabunnya habis.', chinese: '清洁剂用完了。' },
        { indonesian: 'Yang ini juga dibersihkan?', chinese: '这个也要清理吗？' },
      ],
      variations: [
        { indonesian: 'Tolong bersihkan dapurnya dulu, ya.', chinese: '麻烦先打扫厨房。' },
        { indonesian: 'Tolong cuci piringnya dulu, ya.', chinese: '麻烦先洗碗。' },
        { indonesian: 'Tolong pel lantainya dulu, ya.', chinese: '麻烦先拖地。' },
        { indonesian: 'Tolong buang sampahnya dulu, ya.', chinese: '麻烦先倒垃圾。' },
        { indonesian: 'Tolong rapikan kamarnya dulu, ya.', chinese: '麻烦先整理房间。' },
      ],
      localUsage: { indonesian: 'Tolong + tindakan + ya.', chinese: '这是非常实用、自然的请求方式。' },
      easyMistake: { indonesian: 'Bersihkan dapur.', chinese: '命令式会比较生硬，优先说“请麻烦……”这种说法。' },
      trySay: { indonesian: 'Tolong bantu saya sebentar, ya.', chinese: '麻烦先帮我一下。' },
    },
  ),
];

