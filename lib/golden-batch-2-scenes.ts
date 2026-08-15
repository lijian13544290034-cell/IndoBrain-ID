import type { GoldenSceneContent } from '@/lib/golden-scenes';

type GoldenExperiencePatch = {
  task: string;
  chinese: string;
  indonesian: string;
  explanation: string;
  harvest: string[];
  goldenScene: GoldenSceneContent;
};

const line = (speaker: string, indonesian: string, chinese: string) => ({ speaker, indonesian, chinese });
const pair = (indonesian: string, chinese: string) => ({ indonesian, chinese });

export const nannyGoldenBatch2: Record<string, GoldenExperiencePatch> = {
  'EXP-NAN-005': {
    task: '让保姆准备今天的饭',
    chinese: '让保姆准备今天的饭',
    indonesian: 'Hari ini tolong masak makan malam untuk empat orang ya.',
    explanation: '告诉保姆今天吃什么、几个人吃、几点做好，以及缺食材时怎么处理。',
    harvest: ['tolong masak', 'makan malam', 'untuk empat orang', 'jangan pakai cabai', 'kalau bahannya kurang'],
    goldenScene: {
      situation: '你在家里，晚上有家人一起吃饭。你需要把今天的饭菜安排清楚：几个人吃、吃什么、不要放什么、几点准备好，缺食材时要先告诉你。',
      goal: '成功让保姆在晚上 7 点前准备好 4 个人的晚饭，并确认缺食材时先联系你。',
      dialogue: [
        line('我', 'Mbak, hari ini tolong masak makan malam untuk empat orang ya.', 'Mbak，今天请准备 4 个人的晚饭。'),
        line('保姆', 'Baik, mau masak apa?', '好的，想做什么菜？'),
        line('我', 'Bikin ayam kecap dan sayur bening saja.', '做酱油鸡和清汤蔬菜就好。'),
        line('保姆', 'Mau pakai cabai?', '要放辣椒吗？'),
        line('我', 'Jangan pakai cabai ya, anak-anak juga makan.', '不要放辣椒，孩子也要吃。'),
        line('保姆', 'Baik. Jam berapa harus siap?', '好的。几点要准备好？'),
        line('我', 'Kalau bisa, jam tujuh sudah siap.', '可以的话，7 点前准备好。'),
        line('保姆', 'Kalau bahannya kurang, bagaimana?', '如果食材不够怎么办？'),
        line('我', 'Kabari saya dulu, nanti saya putuskan mau beli apa.', '先告诉我，我再决定买什么。'),
      ],
      replies: [
        pair('Ayamnya tinggal sedikit, Bu.', '鸡肉只剩一点了。'),
        pair('Sayurnya masih ada, tapi bawang putih habis.', '蔬菜还有，但是蒜没了。'),
        pair('Kalau mau cepat, saya masak telur juga ya.', '如果想快一点，我也可以做鸡蛋。'),
        pair('Bisa siap jam tujuh, Bu.', '7 点可以准备好。'),
      ],
      variations: [
        pair('Hari ini tolong masak makan siang untuk tiga orang ya.', '今天请准备 3 个人的午饭。'),
        pair('Jangan terlalu asin ya.', '不要太咸。'),
        pair('Kalau ikan tidak ada, beli ayam saja.', '如果没有鱼，就买鸡肉。'),
        pair('Jam enam setengah sudah siap ya.', '6 点半前准备好。'),
      ],
      decisions: [
        {
          situation: '保姆说鸡肉不够，你可以决定换菜或让她去买。',
          options: [
            pair('Kalau ayam kurang, beli setengah kilo lagi ya.', '鸡肉不够的话，再买半公斤。'),
            pair('Kalau begitu masak telur saja, tidak usah beli lagi.', '那就做鸡蛋，不用再买了。'),
          ],
        },
      ],
      localUsage: pair('Masak yang simpel saja ya.', '印尼家庭口语里，想让对方做简单一点的饭，可以这样说。'),
      easyMistake: pair('Jangan bilang “buat makanan empat orang” saja.', '只说“做四个人的食物”不够自然，最好明确 makan siang / makan malam。'),
      trySay: pair('Hari ini tolong masak makan malam untuk empat orang ya.', '今天请准备 4 个人的晚饭。'),
    },
  },
  'EXP-NAN-011': {
    task: '让保姆重点打扫家里',
    chinese: '让保姆重点打扫家里',
    indonesian: 'Hari ini tolong fokus bersihkan ruang tamu dan dapur ya.',
    explanation: '家里某些地方脏了，需要告诉保姆重点清洁并确认是否完成。',
    harvest: ['fokus bersihkan', 'ruang tamu', 'dapur', 'lantai lengket', 'sudah selesai'],
    goldenScene: {
      situation: '你发现客厅、厨房和卫生间今天比较脏，需要让保姆按重点处理，而不是泛泛地说“打扫一下”。',
      goal: '成功让保姆优先清理客厅和厨房，并在完成后告诉你。',
      dialogue: [
        line('我', 'Mbak, hari ini tolong fokus bersihkan ruang tamu dan dapur ya.', 'Mbak，今天请重点打扫客厅和厨房。'),
        line('保姆', 'Bagian mana yang paling kotor?', '哪里最脏？'),
        line('我', 'Lantai ruang tamu agak lengket, meja juga banyak debu.', '客厅地板有点黏，桌子上也很多灰。'),
        line('保姆', 'Dapurnya dibersihkan semua?', '厨房要全部清理吗？'),
        line('我', 'Iya, terutama kompor dan wastafel.', '是的，尤其是炉灶和水槽。'),
        line('保姆', 'Kamar mandi sekalian?', '卫生间也一起吗？'),
        line('我', 'Kalau sempat, kamar mandi juga disikat ya.', '如果来得及，卫生间也刷一下。'),
        line('保姆', 'Nanti kalau sudah selesai saya kabari.', '完成后我通知你。'),
        line('我', 'Oke, terima kasih.', '好的，谢谢。'),
      ],
      replies: [
        pair('Ruang tamunya sudah saya pel.', '客厅我已经拖好了。'),
        pair('Kompor masih ada minyak, saya bersihkan lagi.', '炉灶还有油，我再清一次。'),
        pair('Kamar mandi belum sempat, nanti sore saya kerjakan.', '卫生间还没来得及，下午我做。'),
        pair('Sampahnya sudah saya buang.', '垃圾我已经倒了。'),
      ],
      variations: [
        pair('Hari ini tolong fokus bersihkan kamar mandi ya.', '今天请重点清洁卫生间。'),
        pair('Tolong lap meja makan juga ya.', '餐桌也请擦一下。'),
        pair('Lantainya dipel dua kali ya.', '地板请拖两遍。'),
        pair('Kalau sudah selesai, kabari saya ya.', '完成后告诉我。'),
      ],
      decisions: [
        {
          situation: '保姆说时间不够，你需要决定优先顺序。',
          options: [
            pair('Kalau waktunya tidak cukup, dapur dulu ya.', '时间不够的话，先做厨房。'),
            pair('Kamar mandi boleh nanti sore, yang penting ruang tamu selesai dulu.', '卫生间可以下午做，先把客厅弄好。'),
          ],
        },
      ],
      localUsage: pair('Yang ini dibereskan dulu ya.', '指出重点区域时，这句话很自然：这个先处理。'),
      easyMistake: pair('Jangan hanya bilang “rumah kotor”.', '只说“家里脏”不够可执行，要指出位置和动作。'),
      trySay: pair('Hari ini tolong fokus bersihkan ruang tamu dan dapur ya.', '今天请重点打扫客厅和厨房。'),
    },
  },
  'EXP-NAN-056': {
    task: '洗衣服、晾衣服、熨衣服',
    chinese: '洗衣服、晾衣服、熨衣服',
    indonesian: 'Baju putih dicuci terpisah, lalu dijemur di dalam ya.',
    explanation: '告诉保姆哪些衣服要洗、哪些分开洗、晾在哪里、哪件今天要熨好。',
    harvest: ['dicuci terpisah', 'cuci tangan', 'dijemur di dalam', 'disetrika', 'dipakai hari ini'],
    goldenScene: {
      situation: '你有一批衣服要洗，其中白色衣服不能和深色衣服混洗，一件衬衫今天要用，需要洗完晾好并熨好。',
      goal: '成功安排洗衣、晾衣、熨衣，并确认今天要用的衬衫会优先处理。',
      dialogue: [
        line('我', 'Mbak, baju putih dicuci terpisah ya.', 'Mbak，白色衣服请分开洗。'),
        line('保姆', 'Yang hitam juga dicuci hari ini?', '黑色衣服今天也洗吗？'),
        line('我', 'Iya, tapi jangan dicampur dengan yang putih.', '洗，但是不要和白色的混在一起。'),
        line('保姆', 'Yang ini boleh masuk mesin cuci?', '这件可以放洗衣机吗？'),
        line('我', 'Yang bahan halus itu cuci tangan saja ya.', '那件细面料的手洗就好。'),
        line('保姆', 'Nanti dijemur di luar?', '等下晾在外面吗？'),
        line('我', 'Kalau hujan, jemur di dalam saja.', '如果下雨，就晾在里面。'),
        line('我', 'Kemeja biru ini tolong disetrika, hari ini mau saya pakai.', '这件蓝衬衫请熨一下，我今天要穿。'),
        line('保姆', 'Baik, saya dahulukan kemejanya.', '好的，我先处理衬衫。'),
      ],
      replies: [
        pair('Baju putihnya sudah saya pisahkan.', '白色衣服我已经分出来了。'),
        pair('Yang bahan halus saya cuci tangan ya.', '细面料的我手洗。'),
        pair('Kemejanya sudah kering, tinggal disetrika.', '衬衫已经干了，只剩熨。'),
        pair('Di luar mendung, saya jemur di dalam.', '外面阴天，我晾在里面。'),
      ],
      variations: [
        pair('Baju anak jangan dicampur dengan handuk ya.', '孩子的衣服不要和毛巾混洗。'),
        pair('Yang ini jangan masuk pengering ya.', '这件不要放烘干机。'),
        pair('Celana ini perlu disetrika juga.', '这条裤子也需要熨。'),
        pair('Kalau belum kering, kabari saya dulu.', '如果还没干，先告诉我。'),
      ],
      decisions: [
        {
          situation: '保姆说衬衫还没完全干，你要决定是否换衣服或继续处理。',
          options: [
            pair('Kalau belum kering, saya pakai yang putih saja.', '如果还没干，我就穿白色那件。'),
            pair('Coba angin-anginkan dulu, nanti saya cek lagi.', '先通风晾一下，等下我再看。'),
          ],
        },
      ],
      localUsage: pair('Dahulukan yang ini ya.', '要对方优先处理某件衣服时，这句很实用。'),
      easyMistake: pair('Untuk pakaian yang belum kering, cukup bilang baju belum kering.', '衣服没干直接说 baju belum kering，不要把其他场景的词混进来。'),
      trySay: pair('Baju putih dicuci terpisah, lalu dijemur di dalam ya.', '白色衣服分开洗，然后晾在室内。'),
    },
  },
  'EXP-NAN-010': {
    task: '家里煤气没有了',
    chinese: '家里煤气没有了',
    indonesian: 'Gasnya habis, tolong pesan satu tabung ya.',
    explanation: '做饭时发现煤气没了，需要确认规格、价格、送达时间和到货。',
    harvest: ['gasnya habis', 'pesan satu tabung', 'ukuran yang biasa', 'berapa harganya', 'sudah sampai'],
    goldenScene: {
      situation: '准备做饭时发现煤气没了。你需要让保姆订一罐常用规格的煤气，确认价格和送达时间，并在到货后告诉你。',
      goal: '成功让保姆订好 1 罐常用规格煤气，并确认什么时候送到。',
      dialogue: [
        line('我', 'Mbak, gasnya habis ya?', 'Mbak，煤气没了吗？'),
        line('保姆', 'Iya, apinya sudah kecil sekali.', '是的，火已经很小了。'),
        line('我', 'Tolong pesan satu tabung yang ukuran biasa ya.', '请订一罐平时用的规格。'),
        line('保姆', 'Mau pesan sekarang?', '现在订吗？'),
        line('我', 'Iya, sekarang saja. Berapa harganya?', '对，现在订。多少钱？'),
        line('保姆', 'Biasanya sekitar dua puluh dua ribu.', '通常大概 22,000。'),
        line('我', 'Oke. Kira-kira kapan sampai?', '好。大概什么时候到？'),
        line('保姆', 'Biasanya setengah jam sampai.', '通常半小时到。'),
        line('我', 'Kalau sudah sampai, kabari saya ya.', '到了告诉我。'),
      ],
      replies: [
        pair('Gasnya benar-benar habis, Bu.', '煤气真的没了。'),
        pair('Toko gasnya sedang saya hubungi.', '我正在联系煤气店。'),
        pair('Katanya dikirim sekitar tiga puluh menit lagi.', '他们说大概 30 分钟后送。'),
        pair('Gasnya sudah sampai dan sudah dipasang.', '煤气已经送到并装好了。'),
      ],
      variations: [
        pair('Tolong pesan dua tabung ya.', '请订两罐。'),
        pair('Pesan ukuran yang sama seperti biasa ya.', '订和平时一样的规格。'),
        pair('Kalau harganya naik, kabari saya dulu.', '如果涨价了，先告诉我。'),
        pair('Kalau tokonya tutup, cari toko lain ya.', '如果那家关门，就找另一家。'),
      ],
      decisions: [
        {
          situation: '煤气店说要等一小时，你可以决定等或换店。',
          options: [
            pair('Kalau satu jam terlalu lama, coba toko lain ya.', '一小时太久的话，试试别家。'),
            pair('Tidak apa-apa, tunggu saja. Nanti masak setelah gas datang.', '没关系，就等吧。煤气到了再做饭。'),
          ],
        },
      ],
      localUsage: pair('Gasnya habis.', '印尼家庭里最常听到的说法，简单直接。'),
      easyMistake: pair('Jangan bilang “gas tidak ada angin”.', '煤气没了不能按中文想法说“没气/没风”，自然说 gasnya habis。'),
      trySay: pair('Gasnya habis, tolong pesan satu tabung ya.', '煤气没了，请订一罐。'),
    },
  },
  'EXP-NAN-009': {
    task: '让保姆买菜 / 买家里缺的东西',
    chinese: '让保姆买菜 / 买家里缺的东西',
    indonesian: 'Tolong beli sayur, telur, dan sabun cuci ya.',
    explanation: '家里缺东西时，说明买什么、买多少、没有时怎么替换、找零和小票怎么处理。',
    harvest: ['tolong beli', 'kalau tidak ada', 'boleh ganti', 'struknya simpan', 'uang kembaliannya'],
    goldenScene: {
      situation: '家里蔬菜、鸡蛋和洗衣液快没了。你要让保姆去买，并交代买不到时怎么替换、预算、找零和小票。',
      goal: '成功让保姆买回家里缺的东西，并确认找零和小票。',
      dialogue: [
        line('我', 'Mbak, tolong beli sayur, telur, dan sabun cuci ya.', 'Mbak，请买蔬菜、鸡蛋和洗衣液。'),
        line('保姆', 'Sayurnya mau yang apa?', '蔬菜要买什么？'),
        line('我', 'Bayam satu ikat, wortel setengah kilo, telur satu rak.', '菠菜一把，胡萝卜半公斤，鸡蛋一板。'),
        line('保姆', 'Kalau bayam tidak ada?', '如果没有菠菜呢？'),
        line('我', 'Boleh ganti kangkung, tapi jangan beli terlalu banyak.', '可以换空心菜，但不要买太多。'),
        line('保姆', 'Sabun cucinya merek yang biasa?', '洗衣液买平时那个牌子吗？'),
        line('我', 'Iya, kalau tidak ada, beli ukuran kecil dulu.', '对，如果没有，先买小瓶的。'),
        line('我', 'Ini uangnya. Struknya simpan, kembaliannya kasih saya ya.', '这是钱。小票留着，找零给我。'),
        line('保姆', 'Baik, nanti saya kabari kalau sudah selesai.', '好的，买完我告诉你。'),
      ],
      replies: [
        pair('Bayamnya habis, adanya kangkung.', '菠菜没了，只有空心菜。'),
        pair('Telurnya naik harga sedikit.', '鸡蛋稍微涨价了。'),
        pair('Sabun cuci merek biasa tidak ada.', '平时那个牌子的洗衣液没有。'),
        pair('Saya sudah beli semua, struknya ada.', '我都买好了，小票在。'),
      ],
      variations: [
        pair('Tolong beli beras lima kilo ya.', '请买 5 公斤米。'),
        pair('Kalau merek itu tidak ada, beli merek lain yang bagus.', '如果那个牌子没有，就买别的好牌子。'),
        pair('Jangan beli yang terlalu mahal ya.', '不要买太贵的。'),
        pair('Kalau uangnya kurang, hubungi saya dulu.', '如果钱不够，先联系我。'),
      ],
      decisions: [
        {
          situation: '保姆说鸡蛋涨价，你需要决定是否继续买。',
          options: [
            pair('Tidak apa-apa, tetap beli satu rak ya.', '没关系，还是买一板。'),
            pair('Kalau mahal sekali, beli setengah rak dulu.', '如果太贵，先买半板。'),
          ],
        },
      ],
      localUsage: pair('Sekalian beli...', '顺便买…… 是家庭采购里非常高频的说法。'),
      easyMistake: pair('Jangan hanya kirim daftar barang tanpa jumlah.', '只发物品名容易买错，要说数量和替换规则。'),
      trySay: pair('Tolong beli sayur, telur, dan sabun cuci ya.', '请买蔬菜、鸡蛋和洗衣液。'),
    },
  },
};

export const driverGoldenBatch2: Record<string, GoldenExperiencePatch> = {
  'EXP-DRV-001': {
    task: '让司机明早来接我',
    chinese: '让司机明早来接我',
    indonesian: 'Besok pagi jam tujuh jemput saya di depan rumah ya.',
    explanation: '和司机确认第二天几点来、在哪里接、去哪里、是否知道地址、到了怎么联系。',
    harvest: ['besok pagi', 'jemput saya', 'di depan rumah', 'alamatnya sudah tahu', 'kabari saya'],
    goldenScene: {
      situation: '你要安排司机明天早上接你去办公室。你需要把时间、上车地点、目的地和到达后的联系都说清楚。',
      goal: '成功让司机明早 7 点到家门口接你，并确认他知道目的地地址。',
      dialogue: [
        line('我', 'Pak, besok pagi jam tujuh jemput saya di depan rumah ya.', 'Pak，明天早上 7 点到家门口接我。'),
        line('司机', 'Baik, Bu. Mau ke mana?', '好的，Bu。去哪里？'),
        line('我', 'Ke kantor di Sudirman.', '去 Sudirman 的办公室。'),
        line('司机', 'Alamatnya yang biasa?', '是平时那个地址吗？'),
        line('我', 'Iya, alamat yang biasa. Bapak masih tahu kan?', '对，平时那个地址。您还知道吧？'),
        line('司机', 'Tahu, Bu.', '知道的，Bu。'),
        line('我', 'Tolong datang sepuluh menit lebih awal kalau bisa.', '可以的话请提前 10 分钟到。'),
        line('司机', 'Baik, kalau sudah sampai saya kabari.', '好的，到了我告诉您。'),
        line('我', 'Oke, terima kasih.', '好的，谢谢。'),
      ],
      replies: [
        pair('Baik, saya datang jam tujuh kurang sepuluh.', '好的，我 6:50 到。'),
        pair('Alamatnya boleh kirim ulang?', '地址可以再发一次吗？'),
        pair('Besok jalan biasanya agak macet.', '明天路上通常会有点堵。'),
        pair('Kalau sudah sampai, saya chat ya.', '到了我发消息。'),
      ],
      variations: [
        pair('Besok pagi jam delapan jemput saya di hotel ya.', '明天早上 8 点到酒店接我。'),
        pair('Nanti sore jemput saya di kantor ya.', '今天下午到办公室接我。'),
        pair('Tolong tunggu di depan lobi.', '请在大堂前等。'),
        pair('Kalau sudah dekat, kabari saya.', '快到时告诉我。'),
      ],
      decisions: [
        {
          situation: '司机说不确定地址，你需要决定是否重发定位。',
          options: [
            pair('Saya kirim lokasi lagi lewat WhatsApp ya.', '我再通过 WhatsApp 发定位给你。'),
            pair('Nanti saya share pin, ikuti lokasi itu saja.', '等下我分享定位，照那个位置走。'),
          ],
        },
      ],
      localUsage: pair('Jemput saya jam tujuh ya.', '和熟悉司机沟通时，这样说最自然。'),
      easyMistake: pair('Jangan lupa sebut tempat jemput dan tujuan.', '只说“明天来接我”容易导致司机不知道在哪里接、去哪里。'),
      trySay: pair('Besok pagi jam tujuh jemput saya di depan rumah ya.', '明天早上 7 点到家门口接我。'),
    },
  },
  'EXP-DRV-003': {
    task: '开车途中临时改目的地',
    chinese: '开车途中临时改目的地',
    indonesian: 'Pak, kita ubah rute dulu ya. Saya mau mampir ke bank sebentar.',
    explanation: '已经在车上时，临时增加停靠点、取消原目的地或改走另一条路线。',
    harvest: ['ubah rute', 'mampir sebentar', 'tidak jadi ke sana', 'lewat jalan lain', 'tunggu di sana'],
    goldenScene: {
      situation: '你已经在车上，原本要去办公室，但临时要先去银行，再去见客户。你需要让司机理解新的顺序。',
      goal: '成功让司机先去银行，再继续去客户办公室，并在银行等你。',
      dialogue: [
        line('我', 'Pak, kita ubah rute dulu ya.', 'Pak，我们先改一下路线。'),
        line('司机', 'Baik, mau ke mana dulu?', '好的，先去哪里？'),
        line('我', 'Saya mau mampir ke bank sebentar.', '我想先去银行一下。'),
        line('司机', 'Setelah itu tetap ke kantor klien?', '之后还是去客户办公室吗？'),
        line('我', 'Iya, setelah bank baru ke kantor klien.', '对，银行之后再去客户办公室。'),
        line('司机', 'Lewat jalan biasa atau tol?', '走普通路还是收费路？'),
        line('我', 'Kalau lebih cepat, lewat tol saja.', '如果更快，就走收费路。'),
        line('我', 'Nanti di bank Bapak tunggu di parkiran ya.', '等下在银行，您在停车场等我。'),
        line('司机', 'Siap, Bu.', '好的，Bu。'),
      ],
      replies: [
        pair('Kalau lewat tol lebih cepat.', '走收费路更快。'),
        pair('Banknya di sebelah kiri, Bu.', '银行在左边，Bu。'),
        pair('Saya tunggu di parkiran saja.', '我就在停车场等。'),
        pair('Setelah ini langsung ke klien ya?', '之后直接去客户那里对吗？'),
      ],
      variations: [
        pair('Kita tidak jadi ke kantor, langsung ke hotel saja.', '我们不去办公室了，直接去酒店。'),
        pair('Mampir ke minimarket dulu ya.', '先去便利店停一下。'),
        pair('Setelah itu baru lanjut ke pabrik.', '之后再继续去工厂。'),
        pair('Tolong lewat jalan lain kalau yang ini macet.', '如果这条路堵，请换一条路。'),
      ],
      decisions: [
        {
          situation: '司机问是否走收费路，你需要在时间和费用之间选择。',
          options: [
            pair('Lewat tol saja, yang penting cepat.', '走收费路，重要的是快。'),
            pair('Tidak usah lewat tol, kita lewat jalan biasa saja.', '不用走收费路，走普通路就好。'),
          ],
        },
      ],
      localUsage: pair('Mampir sebentar ya.', '临时顺路停一下，印尼人常用 mampir。'),
      easyMistake: pair('Jangan bilang “ganti tujuan” tanpa menjelaskan urutannya.', '只说“换目的地”不够，要说明先去哪、之后去哪。'),
      trySay: pair('Pak, kita ubah rute dulu ya. Saya mau mampir ke bank sebentar.', 'Pak，我们先改一下路线。我想去银行一下。'),
    },
  },
  'EXP-DRV-004': {
    task: '堵车了，问司机还要多久',
    chinese: '堵车了，问司机还要多久',
    indonesian: 'Pak, macetnya parah ya? Kira-kira masih berapa lama?',
    explanation: '在雅加达堵车时，问原因、预计时间、是否有其他路线，并决定继续走还是换路。',
    harvest: ['macetnya parah', 'berapa lama', 'jalan lain', 'akan telat', 'lanjut saja'],
    goldenScene: {
      situation: '你在雅加达路上遇到堵车，快要迟到。你需要问司机堵车原因、还要多久、有没有更快路线，然后做决定。',
      goal: '成功判断是否会迟到，并让司机继续走或换路线。',
      dialogue: [
        line('我', 'Pak, macetnya parah ya?', 'Pak，堵得很严重吗？'),
        line('司机', 'Iya, di depan ada penyempitan jalan.', '是的，前面道路变窄。'),
        line('我', 'Kira-kira masih berapa lama sampai?', '大概要多久到？'),
        line('司机', 'Mungkin sekitar empat puluh menit lagi.', '可能还要 40 分钟左右。'),
        line('我', 'Ada jalan lain yang lebih cepat?', '有没有更快的路？'),
        line('司机', 'Ada, tapi agak muter.', '有，但会绕一点。'),
        line('我', 'Kalau lewat sana bisa lebih cepat, kita lewat sana saja.', '如果那边更快，就走那边。'),
        line('司机', 'Baik, saya belok setelah lampu merah.', '好的，红绿灯后我转过去。'),
        line('我', 'Tolong kabari kalau tetap akan telat ya.', '如果还是会迟到，请告诉我。'),
      ],
      replies: [
        pair('Macet karena ada kecelakaan kecil.', '堵车是因为有小事故。'),
        pair('Kalau lewat jalan lain, hemat sekitar sepuluh menit.', '走另一条路大概省 10 分钟。'),
        pair('Sepertinya kita akan telat sedikit.', '看起来会稍微迟到。'),
        pair('Lebih baik lanjut saja, sebentar lagi lancar.', '最好继续走，等下就顺了。'),
      ],
      variations: [
        pair('Kita masih jauh?', '我们还远吗？'),
        pair('Kira-kira sampai jam berapa?', '大概几点到？'),
        pair('Kalau macet terus, lewat jalan lain ya.', '如果一直堵，就换路。'),
        pair('Tidak apa-apa, lanjut saja.', '没关系，继续走吧。'),
      ],
      decisions: [
        {
          situation: '司机说另一条路会绕，但可能快一点，你要决定。',
          options: [
            pair('Kita coba jalan lain saja.', '我们试试另一条路。'),
            pair('Lanjut saja, jangan muter terlalu jauh.', '继续走，不要绕太远。'),
          ],
        },
      ],
      localUsage: pair('Macetnya parah ya?', '这句话比生硬问“为什么堵车”更自然。'),
      easyMistake: pair('Jangan hanya bilang “cepat cepat”.', '催司机“快点快点”不礼貌，也不能解决问题。'),
      trySay: pair('Pak, macetnya parah ya? Kira-kira masih berapa lama?', 'Pak，堵得严重吗？大概还要多久？'),
    },
  },
  'EXP-DRV-008': {
    task: '让司机停车等我',
    chinese: '让司机停车等我',
    indonesian: 'Pak, tunggu saya di sini dulu ya. Saya keluar sekitar dua puluh menit lagi.',
    explanation: '到达商场、办公室或餐厅后，让司机停车等候、不要跟进去，并说明多久出来。',
    harvest: ['tunggu saya di sini', 'cari parkir', 'tidak usah ikut masuk', 'saya kabari', 'jemput di depan'],
    goldenScene: {
      situation: '你到商场办事，只需要进去 20 分钟。你要让司机找地方停车、不要跟进去、等你出来再接。',
      goal: '成功让司机在附近等你，并确认你出来后联系他来接。',
      dialogue: [
        line('我', 'Pak, saya turun di depan sini ya.', 'Pak，我在前面这里下。'),
        line('司机', 'Baik, saya ikut masuk?', '好的，我要跟进去吗？'),
        line('我', 'Tidak usah, Bapak tunggu saya di sini dulu ya.', '不用，您先在这里等我。'),
        line('司机', 'Kalau tidak boleh berhenti lama?', '如果这里不能久停呢？'),
        line('我', 'Cari parkir yang dekat saja.', '找个近一点的停车位就好。'),
        line('司机', 'Kira-kira berapa lama?', '大概要多久？'),
        line('我', 'Sekitar dua puluh menit. Kalau saya sudah selesai, saya kabari.', '大概 20 分钟。我好了就告诉您。'),
        line('司机', 'Nanti saya jemput di depan lagi ya?', '等下我再到前面接您吗？'),
        line('我', 'Iya, nanti jemput saya di pintu utama.', '对，等下到正门接我。'),
      ],
      replies: [
        pair('Saya cari parkir dulu ya.', '我先找停车位。'),
        pair('Di sini tidak boleh berhenti lama.', '这里不能久停。'),
        pair('Kalau sudah selesai, chat saya saja.', '好了就发消息给我。'),
        pair('Saya tunggu di dekat pintu utama.', '我在正门附近等。'),
      ],
      variations: [
        pair('Tunggu saya di lobi ya.', '在大堂等我。'),
        pair('Tidak usah ikut masuk.', '不用跟我进去。'),
        pair('Saya keluar sekitar setengah jam lagi.', '我大概半小时后出来。'),
        pair('Kalau saya sudah siap, saya telepon.', '我好了就打电话。'),
      ],
      decisions: [
        {
          situation: '司机说门口不能停，你需要决定他在哪里等。',
          options: [
            pair('Kalau begitu tunggu di parkiran saja.', '那就在停车场等。'),
            pair('Tunggu agak jauh sedikit juga tidak apa-apa.', '稍微远一点等也没关系。'),
          ],
        },
      ],
      localUsage: pair('Saya kabari nanti.', '印尼日常安排里很自然，表示“我等下通知你”。'),
      easyMistake: pair('Jangan bilang “wait me”.', '不要用英语直译；印尼语直接说 tunggu saya。'),
      trySay: pair('Pak, tunggu saya di sini dulu ya. Saya keluar sekitar dua puluh menit lagi.', 'Pak，请先在这里等我。我大概 20 分钟后出来。'),
    },
  },
  'EXP-DRV-017': {
    task: '让司机去机场接人',
    chinese: '让司机去机场接人',
    indonesian: 'Pak, nanti tolong jemput tamu saya di Bandara Soekarno-Hatta Terminal 3 ya.',
    explanation: '安排司机去机场接朋友或客户，说明机场、航站楼、航班、接谁、延误怎么办、送去哪里。',
    harvest: ['jemput tamu', 'Terminal 3', 'jam kedatangan', 'kalau delay', 'antar ke hotel'],
    goldenScene: {
      situation: '你有一位客户今晚到雅加达机场，你不能亲自去接，需要让司机按航站楼和航班信息去接，并把人送到酒店。',
      goal: '成功安排司机去机场接到客人，并在航班延误时保持联系。',
      dialogue: [
        line('我', 'Pak, nanti tolong jemput tamu saya di Bandara Soekarno-Hatta Terminal 3 ya.', 'Pak，等下请去苏加诺哈达机场 3 号航站楼接我的客人。'),
        line('司机', 'Baik. Jam berapa kedatangannya?', '好的。几点到？'),
        line('我', 'Pesawatnya landing sekitar jam delapan malam.', '航班大概晚上 8 点落地。'),
        line('司机', 'Nama tamunya siapa?', '客人叫什么名字？'),
        line('我', 'Namanya Pak Chen. Saya kirim foto dan nomor WhatsApp-nya.', '他叫陈先生。我把照片和 WhatsApp 发给你。'),
        line('司机', 'Kalau pesawatnya delay bagaimana?', '如果航班延误怎么办？'),
        line('我', 'Tolong tunggu dan kabari saya. Saya juga cek dari sini.', '请等一下并告诉我。我这边也会查。'),
        line('司机', 'Setelah dijemput, diantar ke mana?', '接到以后送去哪里？'),
        line('我', 'Antar ke hotel di Kuningan ya.', '送到 Kuningan 的酒店。'),
      ],
      replies: [
        pair('Saya tunggu di pintu kedatangan ya.', '我在到达口等。'),
        pair('Tolong kirim nomor penerbangannya.', '请发航班号。'),
        pair('Kalau sudah ketemu tamunya, saya kabari.', '见到客人后我告诉您。'),
        pair('Kalau delay, saya tunggu di parkiran dulu.', '如果延误，我先在停车场等。'),
      ],
      variations: [
        pair('Jemput teman saya di Terminal 2 ya.', '请到 2 号航站楼接我朋友。'),
        pair('Saya kirim lokasi hotelnya nanti.', '我等下发酒店定位。'),
        pair('Kalau tidak ketemu, telepon saya langsung.', '如果找不到人，直接打电话给我。'),
        pair('Tolong bawa papan nama kecil kalau perlu.', '需要的话请拿一个小名牌。'),
      ],
      decisions: [
        {
          situation: '航班延误了，你要告诉司机怎么处理。',
          options: [
            pair('Tolong tunggu dulu, saya pantau jadwalnya.', '请先等一下，我看着航班动态。'),
            pair('Kalau delay lebih dari satu jam, tunggu di parkiran saja.', '如果延误超过一小时，就先在停车场等。'),
          ],
        },
      ],
      localUsage: pair('Kalau sudah ketemu, kabari saya.', '接人场景里非常关键：见到人后告诉我。'),
      easyMistake: pair('Jangan lupa terminal dan nomor kontak.', '机场接人只说“去机场接人”不够，必须给航站楼和联系方式。'),
      trySay: pair('Pak, nanti tolong jemput tamu saya di Bandara Soekarno-Hatta Terminal 3 ya.', 'Pak，等下请到苏加诺哈达机场 3 号航站楼接我的客人。'),
    },
  },
};
