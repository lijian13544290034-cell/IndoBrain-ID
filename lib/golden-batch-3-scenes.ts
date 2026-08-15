import type { GoldenSceneContent } from '@/lib/golden-scenes';

export type GoldenExperiencePatch = {
  task: string;
  indonesian: string;
  explanation: string;
  harvest: string[];
  goldenScene: GoldenSceneContent;
};

const line = (speaker: string, indonesian: string, chinese: string) => ({ speaker, indonesian, chinese });
const pair = (indonesian: string, chinese: string) => ({ indonesian, chinese });

export const nannyGoldenBatch3: Record<string, GoldenExperiencePatch> = {
  'EXP-NAN-018': {
    task: '保姆临时请假',
    indonesian: 'Mbak, kalau hari ini izin tidak masuk, besok bisa masuk seperti biasa?',
    explanation: '早上保姆临时请假时，先问原因和严重程度，再确认今天、明天以及家里重要安排怎么处理。',
    harvest: ['izin tidak masuk', 'besok bisa masuk', 'seperti biasa', 'ada urusan penting'],
    goldenScene: {
      situation: '早上保姆发消息说今天不能来。你家里原本有打扫和做饭安排，需要确认原因、今天是否完全不能来、明天能否恢复，以及紧急事情怎么处理。',
      goal: '成功处理一次真实请假：知道原因，确认明天是否回来，并安排好今天最重要的家务。',
      dialogue: [
        line('保姆', 'Bu, hari ini saya izin tidak masuk ya.', 'Bu，今天我想请假不来上班。'),
        line('我', 'Kenapa, Mbak? Ada masalah apa?', '为什么？发生什么事了吗？'),
        line('保姆', 'Anak saya sakit, jadi saya harus ke rumah sakit dulu.', '我孩子病了，所以我得先去医院。'),
        line('我', 'Baik. Hari ini benar-benar tidak bisa datang sama sekali?', '好的。今天完全不能来了吗？'),
        line('保姆', 'Sepertinya tidak bisa, Bu. Maaf sekali.', '应该来不了，Bu。真的不好意思。'),
        line('我', 'Besok bisa masuk seperti biasa?', '明天可以照常来吗？'),
        line('保姆', 'Kalau anak saya sudah membaik, besok saya masuk.', '如果孩子好一些，明天我来上班。'),
        line('我', 'Oke. Kalau begitu hari ini yang penting tolong kabari saya soal kunci dan sampah ya.', '好。那今天重要的是先告诉我钥匙和垃圾怎么处理。'),
      ],
      replies: [
        pair('Saya usahakan besok masuk, Bu.', '我尽量明天来上班。'),
        pair('Kalau sore sudah selesai, saya bisa mampir sebentar.', '如果下午处理完，我可以短暂过来一下。'),
        pair('Kuncinya masih saya pegang, nanti saya titipkan ke satpam.', '钥匙还在我这里，等下我交给保安。'),
        pair('Maaf, Bu, saya baru bisa kabari lagi siang nanti.', '不好意思，Bu，我中午才能再告诉您。'),
      ],
      variations: [
        pair('Kalau tidak bisa masuk hari ini, tolong kabari lebih awal ya.', '如果今天不能来，请早点通知我。'),
        pair('Besok kalau masih belum bisa, kasih tahu malam ini ya.', '如果明天还不能来，今晚请告诉我。'),
        pair('Hari ini tidak apa-apa, tapi sampahnya harus tetap dibuang.', '今天没关系，但垃圾还是要处理。'),
        pair('Kalau ada keadaan darurat, saya mengerti.', '如果是紧急情况，我理解。'),
      ],
      decisions: [
        {
          situation: '保姆说下午可能可以短暂过来，你要判断是否需要她来处理紧急家务。',
          options: [
            pair('Kalau memang repot, tidak usah datang. Keluarga dulu ya.', '如果确实忙，就不用来了。先照顾家里。'),
            pair('Kalau bisa mampir sebentar, tolong buang sampah dan cek dapur saja.', '如果能短暂过来，请只倒垃圾和检查厨房。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：对方说 izin tidak masuk 时，先问原因和安排，比直接说 boleh / tidak boleh 更自然。', '处理请假时先了解情况，再确认结果。'),
      easyMistake: pair('不要只说 Tidak bisa. 这样太硬，也没有解决今天家里的实际安排。', '不要只拒绝，要确认替代安排。'),
      trySay: pair('Mbak, kalau hari ini izin tidak masuk, besok bisa masuk seperti biasa?', 'Mbak，如果今天请假不来，明天可以照常来吗？'),
    },
  },
  'EXP-NAN-032': {
    task: '给保姆安排明天几件重要事情',
    indonesian: 'Mbak, besok ada beberapa hal penting, tolong dengarkan dulu ya.',
    explanation: '睡前一次性交代第二天多件事情，训练排序、时间、复述和临时修改。',
    harvest: ['beberapa hal penting', 'tolong dengarkan', 'yang paling penting', 'tolong ulangi'],
    goldenScene: {
      situation: '晚上准备休息前，你要把明天的几件事一次性交代给保姆：打扫客厅、洗衣机、中午做饭、下午收快递。',
      goal: '成功让保姆复述明天的重点安排，并确认优先级和时间。',
      dialogue: [
        line('我', 'Mbak, besok ada beberapa hal penting, tolong dengarkan dulu ya.', 'Mbak，明天有几件重要的事，请先听一下。'),
        line('保姆', 'Baik, Bu. Apa saja?', '好的，Bu。有哪些？'),
        line('我', 'Pagi bersihkan ruang tamu dulu, lalu jalankan mesin cuci.', '早上先打扫客厅，然后开洗衣机。'),
        line('我', 'Siang tolong siapkan makan siang sederhana.', '中午请准备简单午饭。'),
        line('保姆', 'Sore ada paket juga ya?', '下午也有快递，对吗？'),
        line('我', 'Iya, paket itu yang paling penting. Kalau datang, langsung terima dan foto resinya.', '对，那个快递最重要。到了就收下，并拍一下单据。'),
        line('我', 'Coba Mbak ulangi, besok urutannya bagaimana?', '你复述一下，明天顺序是什么？'),
        line('保姆', 'Pagi ruang tamu, mesin cuci, siang masak, sore terima paket.', '早上客厅、洗衣机，中午做饭，下午收快递。'),
      ],
      replies: [
        pair('Kalau paket datang saat saya masak, saya terima dulu ya.', '如果快递在我做饭时到，我先收快递。'),
        pair('Mesin cucinya saya jalankan setelah ruang tamu selesai.', '客厅完成后我再开洗衣机。'),
        pair('Kalau tamu datang, saya kabari Ibu dulu.', '如果有客人来，我先通知您。'),
      ],
      variations: [
        pair('Yang paling penting besok adalah terima paket itu.', '明天最重要的是收那个快递。'),
        pair('Kalau tidak sempat menyetrika, tidak apa-apa.', '如果来不及熨衣服，没关系。'),
        pair('Tolong ulangi sekali lagi supaya tidak salah.', '请再复述一次，避免弄错。'),
        pair('Paketnya jangan dibuka dulu ya.', '快递先不要打开。'),
      ],
      decisions: [
        {
          situation: '保姆复述时漏掉了“拍单据”，你需要温和纠正。',
          options: [
            pair('Betul, tapi satu lagi: resinya difoto dulu ya.', '对，但还有一点：单据要先拍照。'),
            pair('Coba ulangi dari bagian paketnya ya.', '请从快递那部分再复述一次。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：重要任务最好让对方 ulangi 一次，回答 iya 不一定代表完全理解。', '让对方复述能减少误会。'),
      easyMistake: pair('不要一次说很长一串后就结束，要停下来确认对方听懂。', '多任务安排必须确认。'),
      trySay: pair('Mbak, besok ada beberapa hal penting, tolong dengarkan dulu ya.', 'Mbak，明天有几件重要的事，请先听一下。'),
    },
  },
};

export const driverGoldenBatch3: Record<string, GoldenExperiencePatch> = {
  'EXP-DRV-002': {
    task: '司机迟到了，我要追问他在哪里',
    indonesian: 'Pak, sekarang sudah jam delapan lewat, posisi Bapak di mana?',
    explanation: '司机迟到时，先问位置和原因，再判断是否继续等，并要求到了马上通知。',
    harvest: ['sudah jam delapan lewat', 'posisi Bapak', 'berapa lama lagi', 'kabari saya'],
    goldenScene: {
      situation: '约好 8:00 接你，现在 8:15 司机还没到。你有点着急，但不能一上来就骂人。',
      goal: '成功问清司机位置、迟到原因和预计到达时间，并要求到达后立刻通知。',
      dialogue: [
        line('我', 'Pak, sekarang sudah jam delapan lewat, posisi Bapak di mana?', 'Pak，现在已经八点多了，您在哪里？'),
        line('司机', 'Maaf, Pak, saya masih di jalan. Agak macet.', '不好意思，Pak，我还在路上。有点堵。'),
        line('我', 'Kira-kira berapa lama lagi sampai?', '大概还要多久到？'),
        line('司机', 'Mungkin sepuluh menit lagi.', '可能还要十分钟。'),
        line('我', 'Saya ada janji, jadi tolong kasih waktu yang jelas ya.', '我有约，所以请给我明确时间。'),
        line('司机', 'Baik, Pak. Saya usahakan cepat.', '好的，Pak。我尽量快。'),
        line('我', 'Kalau sudah sampai, langsung kabari saya.', '到了马上告诉我。'),
        line('司机', 'Siap, Pak. Nanti saya kabari.', '好的，Pak。等下我通知您。'),
      ],
      replies: [
        pair('Saya masih lima menit lagi, Pak.', '我还有五分钟到。'),
        pair('Tadi ada jalan ditutup, jadi saya putar balik.', '刚才有路封了，所以我绕路了。'),
        pair('Saya sudah dekat gerbang kompleks.', '我已经快到小区门口了。'),
      ],
      variations: [
        pair('Pak, Bapak sudah sampai mana?', 'Pak，您到哪里了？'),
        pair('Kalau masih lama, saya naik kendaraan lain dulu.', '如果还要很久，我先坐别的车。'),
        pair('Tolong jangan terlambat lagi besok ya.', '明天请不要再迟到了。'),
        pair('Saya tunggu sampai jam delapan dua puluh saja.', '我只等到八点二十。'),
      ],
      decisions: [
        {
          situation: '司机说还要 20 分钟，你可能赶不上会议。',
          options: [
            pair('Kalau begitu saya pesan mobil lain dulu ya.', '那我先叫别的车了。'),
            pair('Saya tunggu, tapi tolong benar-benar sampai sepuluh menit lagi.', '我等，但请真的十分钟内到。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：先问 posisi di mana，再要求时间，比直接 marah 更有效。', '先定位，再判断。'),
      easyMistake: pair('不要只反复说 cepat，司机需要给你清楚的位置和预计时间。', '催促要有信息目标。'),
      trySay: pair('Pak, sekarang sudah jam delapan lewat, posisi Bapak di mana?', 'Pak，现在已经八点多了，您在哪里？'),
    },
  },
  'EXP-DRV-009': {
    task: '发定位给司机，让他准确找到我',
    indonesian: 'Pak, saya share location ya, tolong masuk dari pintu depan.',
    explanation: '在陌生地点司机找不到入口时，发送定位、描述标志物，并重新指路。',
    harvest: ['share location', 'pintu depan', 'di dekat', 'masuk dari'],
    goldenScene: {
      situation: '你在一个陌生办公楼，司机找不到入口。你需要发定位、确认是否收到，并用附近标志物帮他找到你。',
      goal: '成功让司机通过定位和入口说明找到你。',
      dialogue: [
        line('我', 'Pak, saya share location ya, tolong cek dulu.', 'Pak，我发定位给您，请先看一下。'),
        line('司机', 'Sudah saya terima, tapi pintu masuknya di mana?', '我收到了，但入口在哪里？'),
        line('我', 'Saya di depan gedung, dekat minimarket kecil.', '我在楼前面，靠近一个小便利店。'),
        line('司机', 'Saya masuk dari pintu belakang tadi.', '我刚才从后门进去了。'),
        line('我', 'Jangan dari belakang, Pak. Masuk dari pintu depan saja.', '不要从后面进，Pak。从正门进就好。'),
        line('司机', 'Depan yang ada satpam itu?', '有保安的那个前门吗？'),
        line('我', 'Iya, saya tunggu di sebelah pos satpam.', '对，我在保安岗旁边等您。'),
        line('司机', 'Baik, saya putar ke depan sekarang.', '好的，我现在绕到前面。'),
      ],
      replies: [
        pair('Lokasinya sudah masuk, Pak.', '定位已经收到了。'),
        pair('Saya belum lihat minimarketnya.', '我还没看到便利店。'),
        pair('Saya sudah di depan pos satpam.', '我已经到保安岗前面了。'),
      ],
      variations: [
        pair('Saya tunggu di depan lobi utama.', '我在主大厅前面等。'),
        pair('Masuk dari gerbang sebelah kiri ya.', '从左边那个门进。'),
        pair('Saya di dekat papan nama gedung.', '我在楼名牌附近。'),
        pair('Kalau bingung, telepon saya langsung.', '如果找不到，直接打电话给我。'),
      ],
      decisions: [
        {
          situation: '司机仍然走错入口，你需要更明确地重新指路。',
          options: [
            pair('Pak, keluar dulu lalu putar ke jalan utama ya.', 'Pak，先出去，再绕到主路。'),
            pair('Tunggu di situ, saya jalan ke arah Bapak.', '您在那里等，我往您那边走。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：share location 很常用，但最好再补一句 patokan，比如 dekat minimarket。', '定位加标志物更可靠。'),
      easyMistake: pair('不要只发定位不说入口，很多印尼建筑有多个 pintu masuk。', '入口信息很关键。'),
      trySay: pair('Pak, saya share location ya, tolong masuk dari pintu depan.', 'Pak，我发定位给您，请从正门进。'),
    },
  },
  'EXP-DRV-010': {
    task: '给司机安排一天多个目的地',
    indonesian: 'Pak, hari ini kita ada beberapa tujuan: kantor, bank, lalu kantor klien.',
    explanation: '一天有多个目的地时，按顺序交代地点、取消或新增站点，并确认下一站。',
    harvest: ['beberapa tujuan', 'lalu kantor klien', 'urutan pertama', 'tujuan berikutnya'],
    goldenScene: {
      situation: '你今天要从家去公司、银行、午餐、客户办公室，最后回家。司机需要清楚顺序和临时变化。',
      goal: '成功安排一天多站行程，并在每一站后确认下一站。',
      dialogue: [
        line('我', 'Pak, hari ini kita ada beberapa tujuan: kantor, bank, lalu kantor klien.', 'Pak，今天我们有几个目的地：公司、银行，然后客户办公室。'),
        line('司机', 'Urutan pertama ke kantor dulu ya?', '第一站先去公司，对吗？'),
        line('我', 'Iya, dari kantor kita ke bank sekitar jam sebelas.', '对，从公司出来后大概十一点去银行。'),
        line('司机', 'Setelah bank langsung ke klien?', '银行之后直接去客户那里吗？'),
        line('我', 'Sebelum ke klien, kita makan siang sebentar.', '去客户那里之前，我们先简单吃个午饭。'),
        line('司机', 'Baik. Nanti saya tunggu di mana?', '好的。等下我在哪里等？'),
        line('我', 'Di setiap tempat, tunggu di depan saja. Nanti saya kabari tujuan berikutnya.', '每个地方都在前面等。我会告诉您下一站。'),
        line('司机', 'Siap, Pak. Nanti saya ikuti urutannya.', '好的，Pak。我会按顺序走。'),
      ],
      replies: [
        pair('Kalau banknya batal, langsung ke restoran ya?', '如果银行取消，就直接去餐厅吗？'),
        pair('Kantor kliennya yang di Sudirman, Pak?', '客户办公室是 Sudirman 那个吗？'),
        pair('Saya tunggu di depan lobi saja ya.', '我就在大厅前面等。'),
      ],
      variations: [
        pair('Tujuan pertama kita ke pabrik dulu.', '第一站我们先去工厂。'),
        pair('Banknya kita batal, langsung ke kantor klien.', '银行取消，直接去客户办公室。'),
        pair('Setelah makan siang, kita kembali ke kantor.', '午饭后我们回公司。'),
        pair('Nanti saya kabari tujuan berikutnya lewat WhatsApp.', '下一站我用 WhatsApp 告诉您。'),
      ],
      decisions: [
        {
          situation: '银行临时取消，但客户时间提前，你要重新安排顺序。',
          options: [
            pair('Banknya batal. Kita langsung ke kantor klien sekarang.', '银行取消。我们现在直接去客户办公室。'),
            pair('Kita makan siang dulu, setelah itu baru ke klien.', '我们先吃午饭，然后再去客户那里。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：多站行程要说 urutan，不要只丢一串地点给司机。', '顺序比地点列表更重要。'),
      easyMistake: pair('不要只说 pergi kantor bank klien，司机不一定知道先后顺序。', '要明确第一站、下一站。'),
      trySay: pair('Pak, hari ini kita ada beberapa tujuan: kantor, bank, lalu kantor klien.', 'Pak，今天我们有几个目的地：公司、银行，然后客户办公室。'),
    },
  },
};

export const factoryGoldenBatch3: Record<string, GoldenExperiencePatch> = {
  'EXP-FAC-021': {
    task: '新员工第一天，交代基本工作',
    indonesian: 'Hari ini kamu ikut Pak Andi dulu, jangan sentuh mesin sebelum dijelaskan.',
    explanation: '新员工第一天上班时，说明今天先做什么、谁带他、哪里能去、什么不能动、有问题找谁。',
    harvest: ['ikut Pak Andi', 'jangan sentuh mesin', 'sebelum dijelaskan', 'kalau ada pertanyaan'],
    goldenScene: {
      situation: '一个印尼新员工第一天上班。你要自然、有礼貌但清楚地完成 onboarding。',
      goal: '成功让新员工知道今天跟谁学、哪些设备不能碰、有问题找谁、下班前要完成什么。',
      dialogue: [
        line('我', 'Hari ini kamu ikut Pak Andi dulu, jangan sentuh mesin sebelum dijelaskan.', '今天你先跟 Pak Andi，不讲清楚之前不要碰机器。'),
        line('员工', 'Baik, Pak. Saya ikut Pak Andi dulu.', '好的，Pak。我先跟 Pak Andi。'),
        line('我', 'Area produksi boleh masuk, tapi gudang bahan jangan masuk sendiri dulu.', '生产区可以进，但原料仓先不要自己进去。'),
        line('员工', 'Kalau ada pertanyaan saya tanya siapa, Pak?', '如果有问题我问谁？'),
        line('我', 'Tanya Pak Andi dulu. Kalau masih belum jelas, baru tanya saya.', '先问 Pak Andi。如果还不清楚，再问我。'),
        line('我', 'Sebelum pulang, kamu harus paham alur kerja dasar hari ini.', '下班前，你要理解今天的基本工作流程。'),
        line('员工', 'Baik, nanti sebelum pulang saya lapor.', '好的，下班前我会汇报。'),
      ],
      replies: [
        pair('Saya belum paham bagian ini, Pak.', '这部分我还不明白。'),
        pair('Pak Andi sedang di area produksi.', 'Pak Andi 正在生产区。'),
        pair('Saya sudah ikut lihat prosesnya.', '我已经跟着看了流程。'),
      ],
      variations: [
        pair('Hari ini kamu ikut supervisor dulu.', '今天你先跟主管。'),
        pair('Jangan ambil bahan sebelum ada izin.', '没有批准前不要拿材料。'),
        pair('Kalau bingung, jangan diam saja.', '如果不懂，不要只是沉默。'),
        pair('Sebelum pulang, lapor ke saya dulu.', '下班前先向我汇报。'),
      ],
      decisions: [
        {
          situation: '新员工说“iya”但眼神很迷茫，你要确认他真的懂。',
          options: [
            pair('Coba kamu ulangi, hari ini harus ikut siapa?', '你复述一下，今天要跟谁？'),
            pair('Tidak apa-apa kalau belum paham, tanya sekarang saja.', '不懂没关系，现在就问。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：新员工常先回答 iya，重要规则最好让他复述一次。', '复述比点头可靠。'),
      easyMistake: pair('不要用命令式骂人开场。第一天要清楚，但也要让对方敢问问题。', '边界清楚，语气要稳。'),
      trySay: pair('Hari ini kamu ikut Pak Andi dulu, jangan sentuh mesin sebelum dijelaskan.', '今天你先跟 Pak Andi，不讲清楚之前不要碰机器。'),
    },
  },
  'EXP-FAC-022': {
    task: '员工没听懂任务，我重新解释',
    indonesian: 'Coba ulangi dulu, tadi kamu pahamnya seperti apa?',
    explanation: '员工表面回答 iya，但实际做错时，先确认他理解成什么，再换简单说法并让他复述。',
    harvest: ['coba ulangi', 'pahamnya seperti apa', 'saya jelaskan lagi', 'lebih sederhana'],
    goldenScene: {
      situation: '你交代完任务后，员工说 iya，但做出来完全不对。你需要确认他到底理解成了什么。',
      goal: '成功让员工复述任务，并用更简单的话重新确认标准。',
      dialogue: [
        line('我', 'Coba ulangi dulu, tadi kamu pahamnya seperti apa?', '你先复述一下，刚才你理解成什么了？'),
        line('员工', 'Saya kira barang ini langsung dikirim, Pak.', '我以为这个货直接发走，Pak。'),
        line('我', 'Bukan langsung dikirim. Barang ini dicek dulu, baru dikemas.', '不是直接发。这个货先检查，再包装。'),
        line('员工', 'Oh, dicek dulu ya, Pak?', '哦，先检查对吗？'),
        line('我', 'Iya. Saya jelaskan lagi lebih sederhana ya.', '对。我再用更简单的话解释一次。'),
        line('我', 'Pertama cek jumlah, kedua cek label, ketiga baru masuk kardus.', '第一检查数量，第二检查标签，第三才装箱。'),
        line('员工', 'Baik. Cek jumlah, cek label, lalu masuk kardus.', '好的。检查数量、检查标签，然后装箱。'),
      ],
      replies: [
        pair('Saya pikir labelnya nanti saja.', '我以为标签可以晚点再看。'),
        pair('Berarti belum boleh dikirim ya, Pak?', '所以现在还不能发货，对吗？'),
        pair('Saya ulang dari awal ya, Pak.', '我从头再复述一次。'),
      ],
      variations: [
        pair('Coba jelaskan lagi dengan kata-kata kamu sendiri.', '请用你自己的话再解释一次。'),
        pair('Yang penting urutannya jangan dibalik.', '重点是顺序不要反。'),
        pair('Kalau belum jelas, berhenti dulu dan tanya.', '如果还不清楚，先停下来问。'),
        pair('Saya kasih contoh satu kali ya.', '我给你示范一次。'),
      ],
      decisions: [
        {
          situation: '员工还是只回答 iya，你需要让他主动复述。',
          options: [
            pair('Jangan hanya jawab iya. Coba ulangi tugasnya.', '不要只回答 iya。请复述任务。'),
            pair('Oke, kita coba satu barang dulu, saya lihat caranya.', '好，我们先做一个货，我看你的做法。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：Iya 有时只是礼貌回应，不一定代表完全理解。', '关键任务要复述。'),
      easyMistake: pair('不要说 Kamu tidak ngerti ya? 这样容易让对方没面子。', '先问他理解成什么。'),
      trySay: pair('Coba ulangi dulu, tadi kamu pahamnya seperti apa?', '你先复述一下，刚才你理解成什么了？'),
    },
  },
  'EXP-FAC-023': {
    task: '员工做错了，要求返工',
    indonesian: 'Bagian ini belum sesuai standar, tolong dikerjakan ulang sebelum jam empat.',
    explanation: '发现员工做错时，指出具体问题，听解释，明确标准和返工时间，避免羞辱式批评。',
    harvest: ['belum sesuai standar', 'dikerjakan ulang', 'sebelum jam empat', 'saya cek lagi'],
    goldenScene: {
      situation: '任务已经完成，但结果不符合标准。你要解决问题，而不是制造冲突。',
      goal: '成功让员工知道哪里错、按什么标准返工、几点前完成，并在返工后接受检查。',
      dialogue: [
        line('我', 'Bagian ini belum sesuai standar, tolong dikerjakan ulang sebelum jam empat.', '这部分还不符合标准，请四点前返工。'),
        line('员工', 'Yang mana yang salah, Pak?', '哪一部分错了，Pak？'),
        line('我', 'Labelnya miring dan jumlah di kardus ini kurang dua.', '标签贴歪了，这箱数量少了两个。'),
        line('员工', 'Saya kira masih bisa diterima.', '我以为这样还可以接受。'),
        line('我', 'Untuk pelanggan ini tidak bisa. Standarnya harus rapi dan jumlahnya pas.', '这个客户不行。标准是整齐，数量准确。'),
        line('员工', 'Baik, saya kerjakan ulang sekarang.', '好的，我现在返工。'),
        line('我', 'Setelah selesai, panggil saya. Saya cek lagi.', '完成后叫我，我再检查。'),
      ],
      replies: [
        pair('Saya belum tahu standarnya harus serapi itu.', '我之前不知道标准要这么整齐。'),
        pair('Boleh saya minta contoh yang benar?', '可以给我一个正确样品吗？'),
        pair('Saya bisa selesai sebelum jam empat.', '我可以四点前完成。'),
      ],
      variations: [
        pair('Bagian ini harus diperbaiki hari ini.', '这部分今天必须改好。'),
        pair('Tolong samakan dengan contoh yang ini.', '请按照这个样品做一致。'),
        pair('Kalau sudah selesai, jangan langsung kirim dulu.', '完成后不要马上发货。'),
        pair('Saya cek ulang sebelum barang keluar.', '货出去前我再复查。'),
      ],
      decisions: [
        {
          situation: '员工解释说没有看过标准样品，你要区分没听懂还是不认真。',
          options: [
            pair('Kalau belum tahu standar, tanya dulu sebelum kerja.', '如果不知道标准，工作前先问。'),
            pair('Saya tunjukkan contohnya, setelah itu tolong kerjakan ulang.', '我给你看样品，然后请返工。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：指出 masalah spesifik 比说 kamu salah 更容易让对方接受。', '说具体问题，不攻击人。'),
      easyMistake: pair('不要说 Kamu kerja tidak benar. 这会把问题变成人身批评。', '批结果，不骂人。'),
      trySay: pair('Bagian ini belum sesuai standar, tolong dikerjakan ulang sebelum jam empat.', '这部分还不符合标准，请四点前返工。'),
    },
  },
  'EXP-FAC-024': {
    task: '员工迟到，问清原因并提醒',
    indonesian: 'Hari ini kamu datang terlambat tiga puluh menit, ada alasan apa?',
    explanation: '员工迟到时，按第一次、第二次、经常发生三种强度处理，并要求以后提前通知。',
    harvest: ['datang terlambat', 'ada alasan apa', 'beri tahu lebih awal', 'aturan perusahaan'],
    goldenScene: {
      situation: '员工今天迟到 30 分钟。你需要问原因、判断是否偶发，并清楚表达公司要求。',
      goal: '成功完成一次有边界的迟到沟通：听原因、提醒规则、要求以后提前通知。',
      dialogue: [
        line('我', 'Hari ini kamu datang terlambat tiga puluh menit, ada alasan apa?', '你今天迟到了三十分钟，是什么原因？'),
        line('员工', 'Maaf, Pak. Tadi anak saya sakit, jadi saya antar dulu.', '对不起，Pak。刚才孩子病了，我先送孩子。'),
        line('我', 'Saya mengerti, tapi lain kali beri tahu lebih awal ya.', '我理解，但下次请提前通知。'),
        line('员工', 'Iya, Pak. Tadi saya buru-buru.', '好的，Pak。刚才我太赶了。'),
        line('我', 'Kalau ini pertama kali, saya ingatkan dulu.', '如果这是第一次，我先提醒。'),
        line('我', 'Tapi kalau sering terlambat, ini jadi masalah aturan perusahaan.', '但如果经常迟到，这就是公司规定问题。'),
        line('员工', 'Baik, Pak. Ke depan saya kabari lebih awal.', '好的，Pak。以后我会提前通知。'),
      ],
      replies: [
        pair('Motor saya tadi rusak di jalan.', '我摩托车路上坏了。'),
        pair('Saya telat karena hujan deras.', '我因为大雨迟到了。'),
        pair('Besok saya datang lebih awal, Pak.', '明天我会早点来。'),
      ],
      variations: [
        pair('Kalau terlambat, kabari sebelum jam masuk.', '如果迟到，上班时间前通知。'),
        pair('Ini sudah kedua kali minggu ini.', '这是这周第二次了。'),
        pair('Saya perlu kamu lebih disiplin soal jam kerja.', '我需要你在工作时间上更守纪律。'),
        pair('Hari ini saya catat sebagai peringatan.', '今天我记录为一次提醒。'),
      ],
      decisions: [
        {
          situation: '这是员工本周第二次迟到，你需要更直接但不羞辱。',
          options: [
            pair('Karena ini sudah kedua kali, saya perlu bicara lebih serius.', '因为这是第二次了，我需要更认真地谈一下。'),
            pair('Hari ini saya ingatkan terakhir, besok jangan terlambat lagi.', '今天我最后提醒一次，明天不要再迟到。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：先说 saya mengerti，再说 aturan，可以兼顾面子和规则。', '先理解，再立规矩。'),
      easyMistake: pair('不要当众大声骂迟到，容易让员工丢面子并防御。', '规则要清楚，场合要合适。'),
      trySay: pair('Hari ini kamu datang terlambat tiga puluh menit, ada alasan apa?', '你今天迟到了三十分钟，是什么原因？'),
    },
  },
  'EXP-FAC-025': {
    task: '员工工作太慢，要求提高效率',
    indonesian: 'Pekerjaan ini biasanya selesai dua jam, kenapa hari ini sampai setengah hari?',
    explanation: '员工进度明显慢时，问进度和困难，给标准、方法和新完成时间，而不是只喊 cepat。',
    harvest: ['biasanya selesai', 'setengah hari', 'hambatannya di mana', 'target selesai'],
    goldenScene: {
      situation: '正常两小时完成的工作，员工做了半天还没好。你要找出原因并重新约定完成时间。',
      goal: '成功判断是不会做、缺工具还是效率问题，并让员工承诺新的完成时间。',
      dialogue: [
        line('我', 'Pekerjaan ini biasanya selesai dua jam, kenapa hari ini sampai setengah hari?', '这个工作通常两小时完成，为什么今天用了半天？'),
        line('员工', 'Saya masih pilih barang yang rusak satu-satu, Pak.', '我还在一个个挑坏的货，Pak。'),
        line('我', 'Hambatannya di mana? Kurang orang atau caranya belum tepat?', '卡在哪里？人手不够，还是方法不对？'),
        line('员工', 'Caranya mungkin belum tepat, Pak.', '可能方法不太对，Pak。'),
        line('我', 'Oke. Pakai meja besar, pisahkan dulu tiga kategori.', '好。用大桌子，先分成三类。'),
        line('我', 'Target selesai jam tiga. Bisa?', '目标三点完成。可以吗？'),
        line('员工', 'Bisa, Pak. Saya ubah caranya sekarang.', '可以，Pak。我现在换方法。'),
      ],
      replies: [
        pair('Kalau sendiri mungkin selesai jam empat.', '如果我一个人做，可能四点完成。'),
        pair('Saya perlu satu orang bantu hitung.', '我需要一个人帮忙数。'),
        pair('Saya belum tahu harus dipisah tiga kategori.', '我不知道要分成三类。'),
      ],
      variations: [
        pair('Kita pakai cara yang lebih cepat ya.', '我们用更快的方法。'),
        pair('Jangan kerja satu-satu kalau bisa dikelompokkan.', '能分组就不要一个个做。'),
        pair('Jam dua saya cek lagi progresnya.', '两点我再检查进度。'),
        pair('Kalau butuh bantuan, bilang sekarang.', '如果需要帮忙，现在说。'),
      ],
      decisions: [
        {
          situation: '员工慢是因为方法不对，不是偷懒。',
          options: [
            pair('Saya ajarkan caranya sekali, setelah itu lanjutkan sendiri.', '我教一次方法，然后你自己继续。'),
            pair('Saya minta satu orang bantu sampai jam tiga.', '我安排一个人帮忙到三点。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：问 hambatannya di mana 可以快速找到真正阻碍。', '先找阻碍，再催进度。'),
      easyMistake: pair('不要只说 Cepat! 这不会告诉员工怎么变快。', '催促要配方法和期限。'),
      trySay: pair('Pekerjaan ini biasanya selesai dua jam, kenapa hari ini sampai setengah hari?', '这个工作通常两小时完成，为什么今天用了半天？'),
    },
  },
  'EXP-FAC-026': {
    task: '员工上班一直玩手机',
    indonesian: 'Saat jam kerja, tolong jangan main HP kecuali ada hal penting.',
    explanation: '发现员工工作时间玩手机时，先提醒，再明确规则，区分紧急电话和普通刷手机。',
    harvest: ['jam kerja', 'jangan main HP', 'hal penting', 'aturan ini jelas'],
    goldenScene: {
      situation: '你连续看到员工工作时间刷手机。你要给面子，但规则必须清楚。',
      goal: '成功让员工知道工作时间不能玩手机，紧急事情可以先说明。',
      dialogue: [
        line('我', 'Saat jam kerja, tolong jangan main HP kecuali ada hal penting.', '工作时间请不要玩手机，除非有重要事情。'),
        line('员工', 'Maaf, Pak. Tadi ada chat keluarga.', '对不起，Pak。刚才有家人消息。'),
        line('我', 'Kalau darurat keluarga, bilang dulu ke supervisor.', '如果是家庭紧急情况，先告诉主管。'),
        line('员工', 'Baik, Pak. Saya kira sebentar tidak apa-apa.', '好的，Pak。我以为一小会儿没关系。'),
        line('我', 'Sebentar juga mengganggu kerja kalau sering terjadi.', '如果经常发生，一小会儿也会影响工作。'),
        line('我', 'Saya ingatkan baik-baik ya, aturan ini jelas.', '我好好提醒你，这个规则很清楚。'),
        line('员工', 'Saya mengerti, Pak. Tidak saya ulangi.', '我明白，Pak。不会再重复。'),
      ],
      replies: [
        pair('Saya cuma balas sebentar, Pak.', '我只是回一下消息，Pak。'),
        pair('Kalau ada telepon penting, saya izin dulu.', '如果有重要电话，我会先请示。'),
        pair('Saya simpan HP di loker dulu.', '我先把手机放到柜子里。'),
      ],
      variations: [
        pair('HP boleh dipakai saat istirahat.', '手机可以在休息时间用。'),
        pair('Kalau kerja belum selesai, fokus dulu.', '如果工作还没完成，先专心。'),
        pair('Saya sudah lihat ini beberapa kali.', '我已经看到好几次了。'),
        pair('Mulai hari ini aturan ini harus diikuti.', '从今天开始，这个规则必须遵守。'),
      ],
      decisions: [
        {
          situation: '同一个员工再次被发现刷手机，你要升级提醒。',
          options: [
            pair('Ini sudah kedua kali, saya perlu beri peringatan lebih serius.', '这是第二次了，我需要更严肃提醒。'),
            pair('Kalau ada urusan pribadi, izin dulu, jangan diam-diam main HP.', '如果有私事，先请示，不要偷偷玩手机。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：给面子的说法是 saya ingatkan baik-baik，但规则仍要明确。', '温和不等于模糊。'),
      easyMistake: pair('不要把所有手机使用都说成 malas，先区分是否有紧急事。', '先问清楚，再定规则。'),
      trySay: pair('Saat jam kerja, tolong jangan main HP kecuali ada hal penting.', '工作时间请不要玩手机，除非有重要事情。'),
    },
  },
  'EXP-FAC-027': {
    task: '安排员工今天必须完成的 3 件事',
    indonesian: 'Hari ini ada tiga tugas utama, yang pertama harus selesai sebelum jam sepuluh.',
    explanation: '早上分配三项重要任务，说明优先级、配合人、标准，并要求员工复述。',
    harvest: ['tiga tugas utama', 'yang pertama', 'harus selesai', 'tolong ulangi'],
    goldenScene: {
      situation: '早上开始工作，今天有三件重要任务。你需要分配清楚，而不是只说“今天很忙”。',
      goal: '成功让员工复述三项任务、优先级、完成时间和检查节点。',
      dialogue: [
        line('我', 'Hari ini ada tiga tugas utama, yang pertama harus selesai sebelum jam sepuluh.', '今天有三项主要任务，第一项必须十点前完成。'),
        line('员工', 'Tugas pertama yang mana, Pak?', '第一项是哪一个，Pak？'),
        line('我', 'Cek stok barang A dulu. Setelah itu bantu packing pesanan B.', '先查 A 货库存。然后帮忙包装 B 订单。'),
        line('员工', 'Yang ketiga apa, Pak?', '第三项是什么？'),
        line('我', 'Yang ketiga rapikan area kerja sebelum pulang.', '第三项是下班前整理工作区。'),
        line('我', 'Untuk packing, kamu kerja sama dengan Rudi.', '包装那项，你和 Rudi 配合。'),
        line('我', 'Coba ulangi tiga tugas hari ini.', '复述一下今天三项任务。'),
        line('员工', 'Cek stok A, packing B dengan Rudi, lalu rapikan area kerja.', '查 A 库存、和 Rudi 包装 B、然后整理工作区。'),
      ],
      replies: [
        pair('Stok A saya cek dulu sebelum jam sepuluh.', 'A 库存我十点前先查。'),
        pair('Kalau Rudi belum datang, saya mulai sendiri dulu.', '如果 Rudi 还没来，我先自己开始。'),
        pair('Area kerja saya rapikan sebelum pulang.', '工作区我下班前整理。'),
      ],
      variations: [
        pair('Yang paling mendesak adalah pesanan B.', '最紧急的是 B 订单。'),
        pair('Tugas kedua bisa dikerjakan setelah istirahat.', '第二项可以休息后做。'),
        pair('Jam dua saya cek progresnya.', '两点我检查进度。'),
        pair('Kalau ada kendala, lapor sebelum siang.', '如果有阻碍，中午前报告。'),
      ],
      decisions: [
        {
          situation: '员工说三项来不及，你要调整优先级。',
          options: [
            pair('Kalau tidak cukup waktu, stok A dan packing B dulu.', '如果时间不够，先做 A 库存和 B 包装。'),
            pair('Saya tambah satu orang bantu packing.', '我加一个人帮忙包装。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：列任务时用 yang pertama / yang kedua，比一口气讲完更清楚。', '分层表达更好执行。'),
      easyMistake: pair('不要只说 kerjakan semuanya hari ini，员工不知道先做哪一件。', '多任务必须排优先级。'),
      trySay: pair('Hari ini ada tiga tugas utama, yang pertama harus selesai sebelum jam sepuluh.', '今天有三项主要任务，第一项必须十点前完成。'),
    },
  },
  'EXP-FAC-028': {
    task: '检查工作进度，发现还没完成',
    indonesian: 'Tadi kamu bilang nanti selesai, sekarang progresnya sudah sampai mana?',
    explanation: '员工用 nanti 模糊回答后，下午仍未完成。训练从模糊回答拿到明确承诺。',
    harvest: ['nanti selesai', 'progresnya sudah sampai mana', 'jam berapa selesai', 'deadline jelas'],
    goldenScene: {
      situation: '员工上午说 nanti selesai，下午你发现还没完成。你不能继续接受模糊回答。',
      goal: '成功问出真实进度、原因和准确完成时间。',
      dialogue: [
        line('我', 'Tadi kamu bilang nanti selesai, sekarang progresnya sudah sampai mana?', '你刚才说等下完成，现在进度到哪里了？'),
        line('员工', 'Masih proses, Pak.', '还在处理中，Pak。'),
        line('我', 'Masih proses itu berapa persen kira-kira?', '还在处理中大概是多少百分比？'),
        line('员工', 'Mungkin sekitar enam puluh persen.', '可能大概百分之六十。'),
        line('我', 'Kenapa belum selesai? Ada kendala?', '为什么还没完成？有阻碍吗？'),
        line('员工', 'Barangnya belum lengkap dari gudang.', '仓库那边货还没齐。'),
        line('我', 'Saya perlu waktu jelas. Jam berapa bisa selesai?', '我需要明确时间。几点能完成？'),
        line('员工', 'Jam lima selesai, Pak.', '五点完成，Pak。'),
      ],
      replies: [
        pair('Nanti selesai, Pak.', '等下会完成，Pak。'),
        pair('Kalau barang datang, bisa cepat selesai.', '如果货到了，可以很快完成。'),
        pair('Saya butuh bantuan dari gudang.', '我需要仓库帮忙。'),
      ],
      variations: [
        pair('Saya perlu jawaban yang lebih jelas.', '我需要更明确的回答。'),
        pair('Nanti itu jam berapa?', '“等下”是几点？'),
        pair('Kalau tidak bisa selesai, bilang sekarang.', '如果不能完成，现在说。'),
        pair('Deadline-nya jam lima hari ini.', '截止时间是今天五点。'),
      ],
      decisions: [
        {
          situation: '员工仍然只说 nanti，你要逼近明确时间。',
          options: [
            pair('Saya tidak bisa pakai jawaban nanti. Tolong sebutkan jamnya.', '我不能接受“等下”这个回答。请说具体时间。'),
            pair('Kalau belum tahu, cek dulu ke gudang sekarang.', '如果还不知道，现在先去仓库确认。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：nanti 很常见，但管理中要继续追问 jam berapa。', '把模糊变成明确。'),
      easyMistake: pair('不要听到 nanti 就默认马上完成。nanti 可能是稍后，也可能很久。', '必须确认时间。'),
      trySay: pair('Tadi kamu bilang nanti selesai, sekarang progresnya sudah sampai mana?', '你刚才说等下完成，现在进度到哪里了？'),
    },
  },
  'EXP-FAC-029': {
    task: '员工说做不了，我要找出真正原因',
    indonesian: 'Kalau tidak bisa, alasannya apa: belum paham, kurang alat, atau waktunya tidak cukup?',
    explanation: '员工说 tidak bisa 时，不能直接接受也不能发火，要拆解原因：不会、没工具、没权限、时间不够、需要谁帮忙。',
    harvest: ['tidak bisa', 'alasannya apa', 'kurang alat', 'waktunya tidak cukup'],
    goldenScene: {
      situation: '员工说“做不了”。你需要找出真正 blocker，而不是把问题停在一句 tidak bisa。',
      goal: '成功定位做不了的真实原因，并给出可执行解决办法。',
      dialogue: [
        line('员工', 'Pak, ini tidak bisa.', 'Pak，这个做不了。'),
        line('我', 'Kalau tidak bisa, alasannya apa: belum paham, kurang alat, atau waktunya tidak cukup?', '如果做不了，原因是什么：不懂、缺工具，还是时间不够？'),
        line('员工', 'Saya belum punya alat untuk buka bagian ini.', '我没有打开这部分的工具。'),
        line('我', 'Alatnya ada di siapa?', '工具在谁那里？'),
        line('员工', 'Biasanya di Pak Rudi, tapi beliau belum datang.', '通常在 Pak Rudi 那里，但他还没来。'),
        line('我', 'Oke. Pinjam ke bagian maintenance dulu, lalu lanjutkan.', '好。先去维修部借，然后继续。'),
        line('员工', 'Baik, Pak. Kalau dapat alat, saya bisa lanjut.', '好的，Pak。如果拿到工具，我就能继续。'),
      ],
      replies: [
        pair('Saya belum pernah kerja bagian ini.', '我以前没做过这部分。'),
        pair('Saya tidak punya akses ke ruangan itu.', '我没有进入那个房间的权限。'),
        pair('Kalau dibantu satu orang, bisa selesai hari ini.', '如果有一个人帮忙，今天能完成。'),
      ],
      variations: [
        pair('Yang membuat tidak bisa bagian mana?', '具体是哪一部分导致做不了？'),
        pair('Butuh alat apa?', '需要什么工具？'),
        pair('Siapa yang bisa bantu?', '谁可以帮忙？'),
        pair('Kalau saya beri akses, bisa lanjut?', '如果我给权限，可以继续吗？'),
      ],
      decisions: [
        {
          situation: '原因是缺工具，不是员工不会做。',
          options: [
            pair('Ambil alat dulu, setelah itu lanjutkan pekerjaan ini.', '先拿工具，然后继续这项工作。'),
            pair('Kalau alat belum ada, kerjakan bagian lain dulu.', '如果工具还没有，先做其他部分。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：tidak bisa 只是结果，不是原因。继续问 alasannya apa。', '先拆原因，再解决。'),
      easyMistake: pair('不要马上说 kenapa tidak bisa? dengan nada marah。语气太冲会让员工只防御。', '追问要稳。'),
      trySay: pair('Kalau tidak bisa, alasannya apa: belum paham, kurang alat, atau waktunya tidak cukup?', '如果做不了，原因是什么：不懂、缺工具，还是时间不够？'),
    },
  },
  'EXP-FAC-030': {
    task: '员工请假，我要决定批不批准',
    indonesian: 'Besok kamu mau izin, alasannya apa dan pekerjaanmu siapa yang pegang?',
    explanation: '员工明天想请假，但公司很忙。训练问原因、紧急程度、交接人，并给出批准、不批准或半天方案。',
    harvest: ['mau izin', 'alasannya apa', 'siapa yang pegang', 'setengah hari'],
    goldenScene: {
      situation: '员工提出明天请假，但明天正好很忙。你需要判断能不能批，而不是随口答应或拒绝。',
      goal: '成功问清请假原因、工作交接和紧急程度，并给出明确决定。',
      dialogue: [
        line('员工', 'Pak, besok saya mau izin.', 'Pak，明天我想请假。'),
        line('我', 'Besok kamu mau izin, alasannya apa dan pekerjaanmu siapa yang pegang?', '你明天想请假，原因是什么？你的工作谁接手？'),
        line('员工', 'Ada urusan keluarga, Pak. Tapi belum ada yang pegang pekerjaan saya.', '有家庭事情，Pak。但还没人接我的工作。'),
        line('我', 'Besok kita sedang banyak pekerjaan. Harus besok?', '明天我们工作很多。必须明天吗？'),
        line('员工', 'Kalau bisa, saya izin setengah hari saja.', '如果可以，我请半天就好。'),
        line('我', 'Oke, setengah hari saya izinkan, tapi pagi harus serahkan pekerjaan ke Rudi.', '好，半天我批准，但早上必须把工作交给 Rudi。'),
        line('员工', 'Baik, Pak. Pagi saya serahkan dulu.', '好的，Pak。早上我先交接。'),
      ],
      replies: [
        pair('Urusannya bisa saya pindah ke sore.', '事情可以改到下午。'),
        pair('Saya sudah minta Rudi bantu pegang pekerjaan saya.', '我已经请 Rudi 帮忙接手工作。'),
        pair('Kalau tidak bisa izin, saya masuk dulu pagi.', '如果不能请假，我早上先来上班。'),
      ],
      variations: [
        pair('Saya izinkan, tapi pekerjaan harus diserahkan dulu.', '我批准，但工作必须先交接。'),
        pair('Besok belum bisa izin penuh.', '明天还不能请全天。'),
        pair('Kalau hanya setengah hari, masih bisa.', '如果只是半天，还可以。'),
        pair('Tolong ajukan izin lebih awal lain kali.', '下次请早点申请请假。'),
      ],
      decisions: [
        {
          situation: '员工没有交接人，但事情也确实紧急。',
          options: [
            pair('Saya izinkan setengah hari, tapi kita atur pengganti dulu.', '我批准半天，但我们先安排替代人。'),
            pair('Besok pagi masuk dulu, setelah pekerjaan aman baru izin.', '明早先上班，工作安排好后再请假。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：批准请假前问 siapa yang pegang，能避免工作没人接。', '请假要连同交接一起确认。'),
      easyMistake: pair('不要只说 boleh 或 tidak boleh，要说明条件和安排。', '决定要可执行。'),
      trySay: pair('Besok kamu mau izin, alasannya apa dan pekerjaanmu siapa yang pegang?', '你明天想请假，原因是什么？你的工作谁接手？'),
    },
  },
  'EXP-FAC-031': {
    task: '员工找我谈加薪',
    indonesian: 'Baik, kita bicara baik-baik soal gaji, tapi saya perlu dengar alasannya dulu.',
    explanation: '员工提出加薪时，既不粗暴拒绝，也不随便承诺，而是听理由、看表现、设条件和下次评估时间。',
    harvest: ['bicara baik-baik', 'soal gaji', 'dengar alasannya', 'evaluasi lagi'],
    goldenScene: {
      situation: '员工说想谈工资。你需要把谈话控制在事实、表现和条件上。',
      goal: '成功完成一次加薪沟通：听理由、不当场承诺、给出评估条件和时间。',
      dialogue: [
        line('员工', 'Pak, saya mau bicara soal gaji.', 'Pak，我想谈一下工资。'),
        line('我', 'Baik, kita bicara baik-baik soal gaji, tapi saya perlu dengar alasannya dulu.', '好，我们好好谈工资，但我需要先听你的理由。'),
        line('员工', 'Saya sudah kerja hampir satu tahun, dan pekerjaan saya bertambah.', '我已经工作快一年了，而且工作变多了。'),
        line('我', 'Menurut kamu, bagian mana dari pekerjaanmu yang paling berkembang?', '你觉得你的工作哪部分进步最大？'),
        line('员工', 'Saya sekarang bisa pegang stok dan bantu packing.', '我现在能管库存，也能帮包装。'),
        line('我', 'Saya catat. Saya tidak bisa jawab hari ini, tapi kita evaluasi lagi bulan depan.', '我记下了。我今天不能答复，但我们下个月再评估。'),
        line('我', 'Kalau bulan ini absensi dan hasil kerja bagus, kita bicarakan lagi.', '如果这个月出勤和工作结果都好，我们再谈。'),
      ],
      replies: [
        pair('Saya berharap bisa naik sedikit, Pak.', '我希望可以稍微涨一点。'),
        pair('Apa yang harus saya perbaiki dulu?', '我需要先改进什么？'),
        pair('Baik, Pak. Bulan depan kita evaluasi lagi.', '好的，Pak。下个月我们再评估。'),
      ],
      variations: [
        pair('Saya belum bisa janji sekarang.', '我现在还不能承诺。'),
        pair('Kita lihat hasil kerja bulan ini dulu.', '我们先看这个月的工作结果。'),
        pair('Saya hargai kamu mau bicara langsung.', '我认可你愿意直接沟通。'),
        pair('Kita buat target yang jelas dulu.', '我们先设明确目标。'),
      ],
      decisions: [
        {
          situation: '员工希望你当场答应，你需要保持边界。',
          options: [
            pair('Saya tidak mau janji tanpa evaluasi data dulu.', '没有先评估数据，我不想随便承诺。'),
            pair('Saya dengar permintaanmu, tapi keputusan tetap setelah evaluasi.', '我听到了你的请求，但决定还是评估后再说。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：bicara baik-baik 能降低紧张感，但后面要接明确条件。', '语气柔和，标准清楚。'),
      easyMistake: pair('不要直接 Tidak bisa，也不要随口 Oke naik。两种都会制造后续问题。', '谈薪要留评估空间。'),
      trySay: pair('Baik, kita bicara baik-baik soal gaji, tapi saya perlu dengar alasannya dulu.', '好，我们好好谈工资，但我需要先听你的理由。'),
    },
  },
  'EXP-FAC-032': {
    task: '员工犯了严重错误，我要正式谈一次',
    indonesian: 'Masalah ini cukup serius, jadi saya perlu dengar penjelasan lengkap dari kamu.',
    explanation: '严重错误已造成损失时，正式确认事实、让员工解释、判断是否故意、说明后果并要求解决。',
    harvest: ['cukup serius', 'penjelasan lengkap', 'apa yang terjadi', 'jangan terulang'],
    goldenScene: {
      situation: '员工的错误已经造成损失。你需要严肃但可控地谈一次，不能辱骂，也不能威胁。',
      goal: '成功确认事实、明确严重性、要求补救，并防止再次发生。',
      dialogue: [
        line('我', 'Masalah ini cukup serius, jadi saya perlu dengar penjelasan lengkap dari kamu.', '这个问题比较严重，所以我需要听你完整解释。'),
        line('员工', 'Maaf, Pak. Saya salah kirim barang ke pelanggan.', '对不起，Pak。我把货发错给客户了。'),
        line('我', 'Ceritakan dari awal, apa yang terjadi?', '从头说，发生了什么？'),
        line('员工', 'Saya tidak cek nomor pesanan sekali lagi.', '我没有再检查一次订单号。'),
        line('我', 'Siapa saja yang terlibat waktu barang keluar?', '货出去时还有谁参与？'),
        line('员工', 'Saya dan bagian gudang, Pak.', '我和仓库部门，Pak。'),
        line('我', 'Ini tidak boleh terulang. Hari ini kamu bantu cek ulang dan hubungi gudang.', '这不能再发生。今天你协助复查并联系仓库。'),
        line('员工', 'Baik, Pak. Saya akan perbaiki hari ini.', '好的，Pak。我今天处理。'),
      ],
      replies: [
        pair('Saya tidak sengaja, Pak.', '我不是故意的，Pak。'),
        pair('Saya lupa cek nomor pesanan.', '我忘了检查订单号。'),
        pair('Saya siap bantu hubungi gudang.', '我愿意帮忙联系仓库。'),
      ],
      variations: [
        pair('Saya perlu tahu faktanya dulu.', '我需要先知道事实。'),
        pair('Kita cari solusi, tapi ini tetap serius.', '我们找解决办法，但这件事仍然严重。'),
        pair('Setelah ini harus ada cara pencegahan.', '之后必须有预防方法。'),
        pair('Besok kita cek ulang prosedurnya.', '明天我们复查流程。'),
      ],
      decisions: [
        {
          situation: '员工一直道歉，但没有说明事实。',
          options: [
            pair('Maaf saya terima, tapi sekarang jelaskan faktanya dulu.', '道歉我接受，但现在先说明事实。'),
            pair('Kita bicara solusi setelah kejadian jelas.', '事情说清楚后，我们再谈解决办法。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：严重问题适合单独谈，避免当众让员工 kehilangan muka。', '严肃问题也要控制场合。'),
      easyMistake: pair('不要用 ancaman 或辱骂开场，否则员工可能只想自保。', '先事实，再后果。'),
      trySay: pair('Masalah ini cukup serius, jadi saya perlu dengar penjelasan lengkap dari kamu.', '这个问题比较严重，所以我需要听你完整解释。'),
    },
  },
  'EXP-FAC-033': {
    task: '两个员工发生矛盾',
    indonesian: 'Kita dengarkan satu-satu dulu, jangan saling potong pembicaraan.',
    explanation: '两个员工互相指责时，管理者先让双方分别说，区分事实和情绪，提出解决方式。',
    harvest: ['dengarkan satu-satu', 'jangan saling potong', 'fakta dulu', 'solusinya begini'],
    goldenScene: {
      situation: '两个员工互相指责，情绪上来了。你作为管理者介入，要保护面子、保持秩序、找共同事实。',
      goal: '成功让双方分别表达，找出事实，并确认后续解决方式。',
      dialogue: [
        line('我', 'Kita dengarkan satu-satu dulu, jangan saling potong pembicaraan.', '我们先一个一个听，不要互相打断。'),
        line('员工A', 'Dia tidak kasih barangnya tepat waktu, Pak.', '他没有按时把货给我，Pak。'),
        line('我', 'Oke, saya catat. Sekarang B jelaskan dari sisi kamu.', '好，我记下。现在 B 从你的角度说明。'),
        line('员工B', 'Saya tunggu label dari dia, jadi saya belum bisa kirim.', '我在等他的标签，所以还不能发。'),
        line('我', 'Jadi faktanya label belum siap dan barang belum bisa keluar, benar?', '所以事实是标签没准备好，货还不能出，对吗？'),
        line('员工A', 'Iya, Pak.', '对，Pak。'),
        line('我', 'Solusinya begini: A siapkan label jam dua, B kirim setelah label masuk.', '解决方式这样：A 两点准备标签，B 标签到后发货。'),
        line('员工B', 'Baik, Pak. Saya tunggu label jam dua.', '好的，Pak。我两点等标签。'),
      ],
      replies: [
        pair('Saya merasa disalahkan terus, Pak.', '我觉得一直被怪罪，Pak。'),
        pair('Saya hanya minta informasinya jelas.', '我只是希望信息清楚。'),
        pair('Kalau label siap, saya bisa lanjut.', '如果标签好了，我就能继续。'),
      ],
      variations: [
        pair('Kita bicara fakta dulu, bukan emosi.', '我们先谈事实，不谈情绪。'),
        pair('Jangan bahas siapa salah dulu.', '先不要讨论谁错。'),
        pair('Setelah ini kalau ada masalah, lapor lebih awal.', '以后有问题早点报告。'),
        pair('Saya akan cek lagi jam tiga.', '我三点再检查。'),
      ],
      decisions: [
        {
          situation: '两人开始互相打断，你要恢复秩序。',
          options: [
            pair('Stop dulu. A selesai bicara dulu, setelah itu B.', '先停一下。A 先说完，然后 B 再说。'),
            pair('Kalau saling potong, masalahnya tidak selesai.', '如果互相打断，问题解决不了。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：冲突沟通中 menjaga muka 很重要，尽量不要当众羞辱其中一方。', '保留面子，先找事实。'),
      easyMistake: pair('不要一开始就说 siapa yang salah，容易让双方更防御。', '先听双方，再判断。'),
      trySay: pair('Kita dengarkan satu-satu dulu, jangan saling potong pembicaraan.', '我们先一个一个听，不要互相打断。'),
    },
  },
  'EXP-FAC-034': {
    task: '开一个 5 分钟晨会',
    indonesian: 'Pagi ini kita briefing lima menit: hasil kemarin, target hari ini, dan masalah utama.',
    explanation: '用简单印尼语主持晨会：昨天结果、今天目标、三件重点、谁负责、有没有问题。',
    harvest: ['briefing lima menit', 'hasil kemarin', 'target hari ini', 'masalah utama'],
    goldenScene: {
      situation: '早上团队开始工作前，你要用非常简单清楚的印尼语主持 5 分钟 morning briefing。',
      goal: '成功完成一次晨会：复盘昨天、明确今天目标、分配责任、问问题并鼓励团队。',
      dialogue: [
        line('我', 'Pagi ini kita briefing lima menit: hasil kemarin, target hari ini, dan masalah utama.', '今天早上我们开五分钟晨会：昨天结果、今天目标和主要问题。'),
        line('我', 'Kemarin target belum tercapai, kurang dua puluh karton.', '昨天目标还没达成，少二十箱。'),
        line('员工', 'Masalahnya di bahan datang terlambat, Pak.', '问题是材料来晚了，Pak。'),
        line('我', 'Baik. Target hari ini seratus dua puluh karton.', '好。今天目标是一百二十箱。'),
        line('我', 'Tiga fokus: bahan masuk tepat waktu, packing rapi, dan laporan jam empat.', '三个重点：材料准时进、包装整齐、四点报告。'),
        line('员工', 'Siapa pegang laporan, Pak?', '谁负责报告，Pak？'),
        line('我', 'Rudi pegang laporan. Kalau ada masalah, kasih tahu sebelum siang.', 'Rudi 负责报告。如果有问题，中午前告诉我。'),
        line('我', 'Oke, kita mulai. Kerja rapi dan aman ya.', '好，我们开始。工作要整齐、安全。'),
      ],
      replies: [
        pair('Hari ini bahan sudah siap, Pak.', '今天材料已经准备好，Pak。'),
        pair('Packing kemarin ada beberapa yang perlu dirapikan.', '昨天包装有几处需要整理。'),
        pair('Kalau ada masalah, kami lapor sebelum siang.', '如果有问题，我们中午前报告。'),
      ],
      variations: [
        pair('Hari ini fokus kita kualitas dulu.', '今天我们先重点关注品质。'),
        pair('Target hari ini delapan puluh karton.', '今天目标八十箱。'),
        pair('Laporan progres jam dua ya.', '两点报告进度。'),
        pair('Ada pertanyaan sebelum mulai?', '开始前有问题吗？'),
      ],
      decisions: [
        {
          situation: '员工提出材料可能再次迟到，你需要当场指定跟进人。',
          options: [
            pair('Rudi, tolong cek bahan sekarang dan lapor jam sembilan.', 'Rudi，请现在检查材料，九点报告。'),
            pair('Kalau bahan telat, pindah ke pekerjaan packing dulu.', '如果材料晚到，先转去做包装工作。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：briefing 要短、清楚、可执行，不要变成长篇训话。', '晨会是对齐行动。'),
      easyMistake: pair('不要只说 semangat tanpa target。团队需要目标和责任人。', '鼓励要配任务。'),
      trySay: pair('Pagi ini kita briefing lima menit: hasil kemarin, target hari ini, dan masalah utama.', '今天早上我们开五分钟晨会：昨天结果、今天目标和主要问题。'),
    },
  },
  'EXP-FAC-035': {
    task: '下班前检查今天结果',
    indonesian: 'Sebelum pulang, kita cek hasil hari ini: apa yang selesai dan apa yang belum.',
    explanation: '下班前检查当天任务：完成了什么、没完成什么、原因、今晚必须完成和明天第一件事。',
    harvest: ['sebelum pulang', 'cek hasil hari ini', 'apa yang selesai', 'apa yang belum'],
    goldenScene: {
      situation: '下午准备下班，你要检查今天任务结果。这个场景和早上安排任务形成闭环。',
      goal: '成功确认今天完成项、未完成原因、今晚必须处理的事和明天第一件事。',
      dialogue: [
        line('我', 'Sebelum pulang, kita cek hasil hari ini: apa yang selesai dan apa yang belum.', '下班前我们检查今天结果：什么完成了，什么还没完成。'),
        line('员工', 'Stok A selesai, packing B belum semua.', 'A 库存完成了，B 包装还没全部完成。'),
        line('我', 'Kenapa packing B belum selesai?', '为什么 B 包装还没完成？'),
        line('员工', 'Labelnya datang terlambat, Pak.', '标签来晚了，Pak。'),
        line('我', 'Yang harus selesai malam ini bagian mana?', '今晚必须完成哪一部分？'),
        line('员工', 'Dua puluh karton terakhir harus selesai malam ini.', '最后二十箱今晚必须完成。'),
        line('我', 'Baik. Besok pagi pertama, cek ulang label dan jumlah.', '好。明早第一件事，复查标签和数量。'),
        line('员工', 'Siap, Pak. Saya catat untuk besok pagi.', '好的，Pak。我记下明早做。'),
      ],
      replies: [
        pair('Yang belum selesai bisa lanjut besok pagi.', '没完成的可以明早继续。'),
        pair('Kalau malam ini perlu lembur, kami bisa dua orang.', '如果今晚需要加班，我们可以两个人。'),
        pair('Besok pagi saya cek ulang jumlahnya.', '明早我复查数量。'),
      ],
      variations: [
        pair('Apa yang paling penting selesai hari ini?', '今天最重要完成什么？'),
        pair('Yang ini boleh lanjut besok.', '这个可以明天继续。'),
        pair('Yang ini jangan ditinggal, harus selesai malam ini.', '这个不能放着，今晚必须完成。'),
        pair('Besok pagi mulai dari pekerjaan ini dulu.', '明早先从这个工作开始。'),
      ],
      decisions: [
        {
          situation: '还有 20 箱没完成，你要决定今晚加班还是明早继续。',
          options: [
            pair('Dua puluh karton ini selesai malam ini, setelah itu boleh pulang.', '这二十箱今晚完成，然后可以下班。'),
            pair('Kalau label belum siap, lanjutkan besok pagi jam delapan.', '如果标签还没好，明早八点继续。'),
          ],
        },
      ],
      localUsage: pair('印尼沟通提示：下班前问 apa yang belum，比第二天才发现问题更稳。', '每天收尾要有结果确认。'),
      easyMistake: pair('不要只问 sudah selesai? 员工可能只回答 sudah。要问完成了什么、没完成什么。', '问题要问具体。'),
      trySay: pair('Sebelum pulang, kita cek hasil hari ini: apa yang selesai dan apa yang belum.', '下班前我们检查今天结果：什么完成了，什么还没完成。'),
    },
  },
};
