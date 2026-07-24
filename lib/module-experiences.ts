export type ModuleRole = 'driver' | 'nanny';

export type ModuleExperience = {
  id: string;
  task: string;
  indonesian: string;
  chinese: string;
  harvest: string[];
};

type LessonSource = [task: string, indonesian: string, explanation: string, harvest: string[]];

function lessons(prefix: string, source: LessonSource[]): ModuleExperience[] {
  return source.map(([task, indonesian, chinese, harvest], index) => ({
    id: `${prefix}-${String(index + 1).padStart(3, '0')}`,
    task,
    indonesian,
    chinese,
    harvest,
  }));
}

// Each tuple is one complete lesson. Do not derive sentences from title order or
// use a shared fallback: IDs remain the only mapping key throughout the UI.
const driverSource: LessonSource[] = [
  ['明天早上七点半来接我', 'Besok pagi jemput saya jam setengah delapan ya.', '用于确认第二天早上的接送时间。', ['besok pagi（明天早上）', 'jemput（接）', 'jam setengah delapan（七点半）']],
  ['你到了吗？', 'Sudah sampai?', '用于询问司机是否已经到达。', ['sudah sampai（已经到了）']],
  ['先去银行，然后去公司', 'Kita ke bank dulu, setelah itu ke kantor.', '用于安排先后两个目的地。', ['ke bank dulu（先去银行）', 'setelah itu（然后）', 'ke kantor（去公司）']],
  ['前面堵车吗？', 'Di depan macet?', '用于确认前方路况。', ['di depan（前面）', 'macet（堵车）']],
  ['通知客户我们会晚到', 'Tolong bilang ke klien ya, kita telat sekitar sepuluh menit.', '用于请司机通知客户会晚到。', ['bilang ke klien（告诉客户）', 'telat（晚到）', 'sekitar sepuluh menit（大约十分钟）']],
  ['走另外一条路吧', 'Kita lewat jalan lain ya.', '用于请司机改走另一条路线。', ['lewat（经过、走）', 'jalan lain（另一条路）']],
  ['停地下停车场', 'Parkir di basement ya.', '用于安排车辆停在地下停车场。', ['parkir（停车）', 'basement（地下停车场）']],
  ['你先在这里等我', 'Tunggu saya di sini dulu ya.', '用于让司机在当前位置等待。', ['tunggu（等）', 'di sini（在这里）', 'dulu（先）']],
  ['我开完会了，你过来接我', 'Saya sudah selesai rapat. Tolong jemput saya di depan kantor ya.', '用于会议结束后请司机到公司门口接人。', ['selesai rapat（开完会）', 'jemput（接）', 'di depan kantor（公司门口）']],
  ['先去银行', 'Kita ke bank dulu ya.', '用于安排先去银行。', ['ke bank dulu（先去银行）']],
  ['我大概二十分钟出来', 'Saya keluar kira-kira dua puluh menit lagi.', '用于告诉司机预计二十分钟后出来。', ['keluar（出来）', 'kira-kira（大概）', 'dua puluh menit lagi（二十分钟后）']],
  ['下午去客户公司', 'Nanti sore kita ke kantor klien ya.', '用于安排下午去客户公司。', ['nanti sore（下午）', 'kantor klien（客户公司）']],
  ['我们到了', 'Kita sudah sampai.', '用于通知对方已经到达。', ['sudah sampai（到了）']],
  ['我在楼下等您', 'Saya tunggu di bawah ya.', '用于告诉对方自己在楼下等待。', ['tunggu（等）', 'di bawah（楼下）']],
  ['附近有什么好吃的吗？', 'Di sekitar sini ada makanan enak nggak?', '用于请司机推荐附近好吃的食物。', ['di sekitar sini（这附近）', 'makanan enak（好吃的食物）']],
  ['先去加个油', 'Isi bensin dulu ya.', '用于说明要先去加油。', ['isi bensin（加油）', 'dulu（先）']],
  ['今天先去哪里？', 'Hari ini kita ke mana dulu?', '用于询问当天第一站去哪里。', ['ke mana（去哪里）', 'dulu（先）']],
  ['这条路有点堵', 'Jalan ini agak macet.', '用于说明当前路线有些堵车。', ['jalan ini（这条路）', 'agak macet（有点堵）']],
  ['靠边停一下', 'Pinggir dulu ya.', '用于让司机靠边短暂停车。', ['pinggir（靠边）', 'dulu（先）']],
  ['到了', 'Sudah sampai.', '用于简短通知已经到达。', ['sudah sampai（到了）']],
  ['明天几点出发？', 'Besok berangkat jam berapa?', '用于确认第二天的出发时间。', ['besok（明天）', 'berangkat（出发）', 'jam berapa（几点）']],
  ['去机场接人', 'Kita ke bandara jemput orang ya.', '用于安排到机场接人。', ['bandara（机场）', 'jemput orang（接人）']],
  ['行李多吗？', 'Bagasinya banyak nggak?', '用于确认是否有很多行李。', ['bagasi（行李）', 'banyak（多）']],
  ['先送客户回去', 'Antar klien pulang dulu ya.', '用于安排先送客户回去。', ['antar（送）', 'klien（客户）', 'pulang（回去）']],
  ['去加油站', 'Kita ke pom bensin dulu ya.', '用于安排去加油站。', ['pom bensin（加油站）', 'dulu（先）']],
  ['车停在哪里？', 'Mobilnya parkir di mana?', '用于询问车辆停放位置。', ['mobil（车）', 'parkir（停车）', 'di mana（在哪里）']],
  ['帮我拿一下东西', 'Tolong ambilkan barang ini ya.', '用于请司机帮忙拿东西。', ['ambilkan（帮忙拿）', 'barang（东西）']],
  ['今天还有安排吗？', 'Hari ini masih ada jadwal lagi?', '用于确认当天是否还有安排。', ['masih ada（还有）', 'jadwal（安排）']],
  ['晚上送我回家', 'Nanti malam antar saya pulang ya.', '用于安排晚上送自己回家。', ['nanti malam（晚上）', 'antar saya pulang（送我回家）']],
  ['明天早上还是七点半来接我', 'Besok pagi tetap jemput saya jam setengah delapan ya.', '用于确认第二天接送时间不变。', ['tetap（还是、不变）', 'jemput（接）', 'jam setengah delapan（七点半）']],
];

const nannySource: LessonSource[] = [
  ['今天做什么菜？', 'Hari ini masak apa?', '用于询问今天准备做什么菜。', ['hari ini（今天）', 'masak apa（做什么菜）']],
  ['不要放辣椒', 'Hari ini jangan pakai cabai ya.', '用于交代今天做菜不要放辣椒。', ['jangan pakai（不要用）', 'cabai（辣椒）']],
  ['帮我买水果', 'Tolong beli buah ya.', '用于请保姆购买水果。', ['tolong beli（请买）', 'buah（水果）']],
  ['今天打扫房间', 'Hari ini tolong bersihkan kamar ya.', '用于安排今天打扫房间。', ['bersihkan（打扫）', 'kamar（房间）']],
  ['孩子放学几点？', 'Anak pulang sekolah jam berapa?', '用于询问孩子几点放学。', ['pulang sekolah（放学）', 'jam berapa（几点）']],
  ['请帮我洗衣服', 'Tolong cuci baju ya.', '用于请保姆洗衣服。', ['cuci（洗）', 'baju（衣服）']],
  ['晚饭几点做好？', 'Makan malam siap jam berapa?', '用于询问晚饭什么时候做好。', ['makan malam（晚饭）', 'siap（做好）']],
  ['冰箱里还有什么？', 'Di kulkas masih ada apa?', '用于询问冰箱里还剩什么。', ['di kulkas（在冰箱里）', 'masih ada apa（还剩什么）']],
  ['明天早点来', 'Besok datang lebih pagi ya.', '用于请保姆明天早点来。', ['besok（明天）', 'lebih pagi（更早）']],
  ['今天不用来了', 'Hari ini tidak usah datang ya.', '用于通知今天不用来。', ['tidak usah（不用）', 'datang（来）']],
  ['帮我照顾孩子', 'Tolong jaga anak ya.', '用于请保姆照顾孩子。', ['jaga（照顾）', 'anak（孩子）']],
  ['去超市买东西', 'Tolong ke supermarket beli barang ya.', '用于请保姆去超市买东西。', ['supermarket（超市）', 'beli barang（买东西）']],
  ['厨房收拾好了吗？', 'Dapurnya sudah rapi?', '用于询问厨房是否收拾好了。', ['dapur（厨房）', 'sudah rapi（收拾好了）']],
  ['帮我拿快递', 'Tolong ambil paketnya ya.', '用于请保姆拿快递。', ['ambil（拿）', 'paket（快递）']],
  ['门口有人吗？', 'Ada orang di depan?', '用于询问门口是否有人。', ['ada orang（有人）', 'di depan（门口、前面）']],
  ['今天要洗车吗？', 'Hari ini perlu cuci mobil?', '用于确认今天是否需要洗车。', ['perlu（需要）', 'cuci mobil（洗车）']],
  ['垃圾倒了吗？', 'Sampahnya sudah dibuang?', '用于询问垃圾是否已经倒掉。', ['sampah（垃圾）', 'sudah dibuang（已经倒掉）']],
  ['帮我准备早餐', 'Tolong siapkan sarapan ya.', '用于请保姆准备早餐。', ['siapkan（准备）', 'sarapan（早餐）']],
  ['家里没有米了', 'Beras di rumah sudah habis.', '用于说明家里的米已经用完。', ['beras（米）', 'sudah habis（用完了）']],
  ['今天先休息吧', 'Hari ini istirahat dulu ya.', '用于让对方今天先休息。', ['istirahat（休息）', 'dulu（先）']],
  ['把衣服晒起来', 'Tolong jemur baju ya.', '用于请保姆把衣服拿去晾晒。', ['jemur（晾晒）', 'baju（衣服）']],
  ['帮我买鸡蛋', 'Tolong beli telur ya.', '用于请保姆买鸡蛋。', ['beli（买）', 'telur（鸡蛋）']],
  ['晚点做饭', 'Nanti masak agak sore ya.', '用于安排晚一点再做饭。', ['nanti（晚一点）', 'agak sore（稍晚些）']],
  ['客人几点来？', 'Tamu datang jam berapa?', '用于询问客人几点到。', ['tamu（客人）', 'datang（来）']],
  ['准备一下房间', 'Tolong siapkan kamarnya ya.', '用于请保姆准备房间。', ['siapkan（准备）', 'kamar（房间）']],
  ['别忘了关门', 'Jangan lupa tutup pintunya ya.', '用于提醒不要忘记关门。', ['jangan lupa（别忘了）', 'tutup pintu（关门）']],
  ['帮我浇花', 'Tolong siram tanaman ya.', '用于请保姆浇花。', ['siram（浇）', 'tanaman（植物、花）']],
  ['这个怎么做？', 'Ini cara buatnya bagaimana?', '用于询问这件事应该怎么做。', ['cara（方法）', 'bagaimana（怎么样、怎么）']],
  ['明天买菜', 'Besok beli sayur ya.', '用于安排明天买菜。', ['besok（明天）', 'beli sayur（买菜）']],
  ['今天辛苦了', 'Hari ini capek ya, terima kasih.', '用于感谢对方今天的辛苦。', ['capek（辛苦、累）', 'terima kasih（谢谢）']],
  ['帮我整理客厅', 'Tolong rapikan ruang tamu ya.', '用于请保姆整理客厅。', ['rapikan（整理）', 'ruang tamu（客厅）']],
  ['孩子睡了吗？', 'Anak sudah tidur?', '用于询问孩子是否已经睡着。', ['sudah tidur（睡了吗）', 'anak（孩子）']],
  ['药放在哪里？', 'Obatnya taruh di mana?', '用于询问药放在哪里。', ['obat（药）', 'taruh di mana（放在哪里）']],
  ['今天不用打扫', 'Hari ini tidak usah bersih-bersih ya.', '用于说明今天不需要打扫。', ['tidak usah（不用）', 'bersih-bersih（打扫）']],
  ['帮我看一下锅', 'Tolong lihatkan panci ya.', '用于请保姆看一下锅。', ['lihatkan（看一下）', 'panci（锅）']],
  ['晚上不要等我', 'Malam ini tidak usah tunggu saya ya.', '用于说明晚上不用等自己。', ['malam ini（今晚）', 'tunggu saya（等我）']],
  ['明天几点来？', 'Besok datang jam berapa?', '用于询问明天几点来。', ['besok（明天）', 'datang（来）']],
  ['帮我热一下饭', 'Tolong hangatkan nasi ya.', '用于请保姆热饭。', ['hangatkan（加热）', 'nasi（饭）']],
  ['洗手间清理了吗？', 'Kamar mandi sudah dibersihkan?', '用于询问洗手间是否清理完成。', ['kamar mandi（洗手间）', 'dibersihkan（清理）']],
  ['帮我买牛奶', 'Tolong beli susu ya.', '用于请保姆买牛奶。', ['beli（买）', 'susu（牛奶）']],
  ['今天下雨吗？', 'Hari ini hujan?', '用于询问今天是否下雨。', ['hujan（下雨）']],
  ['把窗户关上', 'Tolong tutup jendelanya ya.', '用于请保姆关窗户。', ['tutup（关）', 'jendela（窗户）']],
  ['客人走了吗？', 'Tamunya sudah pulang?', '用于询问客人是否已经离开。', ['tamu（客人）', 'sudah pulang（已经走了）']],
  ['帮我换床单', 'Tolong ganti seprai ya.', '用于请保姆换床单。', ['ganti（换）', 'seprai（床单）']],
  ['今天做汤吗？', 'Hari ini masak sup?', '用于询问今天是否做汤。', ['masak sup（做汤）']],
  ['明天记得买菜', 'Besok jangan lupa beli sayur ya.', '用于提醒明天记得买菜。', ['jangan lupa（别忘了）', 'beli sayur（买菜）']],
  ['先休息一下', 'Istirahat sebentar dulu ya.', '用于让对方先休息一会儿。', ['istirahat（休息）', 'sebentar（一下）']],
  ['帮我拿毛巾', 'Tolong ambilkan handuk ya.', '用于请保姆拿毛巾。', ['ambilkan（帮忙拿）', 'handuk（毛巾）']],
  ['晚上锁门', 'Malam ini kunci pintunya ya.', '用于提醒晚上锁门。', ['malam ini（今晚）', 'kunci pintu（锁门）']],
  ['明天见', 'Sampai besok ya.', '用于和对方道别并说明明天见。', ['sampai besok（明天见）']],
];

export const moduleExperiences: Record<ModuleRole, ModuleExperience[]> = {
  driver: lessons('EXP-DRV', driverSource),
  nanny: lessons('EXP-NAN', nannySource),
};

export const moduleMeta = {
  driver: { indonesian: 'Sopir', chinese: '司机', chatRole: 'driver' },
  nanny: { indonesian: 'ART', chinese: '保姆', chatRole: 'nanny' },
} as const;
