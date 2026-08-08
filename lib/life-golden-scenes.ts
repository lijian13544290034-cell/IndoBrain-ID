import type { LifeExperience } from '@/lib/life-experiences';
import type { GoldenSceneContent } from '@/lib/golden-scenes';
import type { WorkplacePattern } from '@/lib/workplace-patterns';

const pattern = (indonesian: string, chinese: string): WorkplacePattern => ({ indonesian, chinese });

const scene = (
  id: string,
  task: string,
  indonesian: string,
  explanation: string,
  harvest: string[],
  patternText: WorkplacePattern,
  goldenScene: GoldenSceneContent,
): LifeExperience => ({
  id,
  category: 'rumah-harian',
  task,
  chinese: task,
  indonesian,
  explanation,
  harvest,
  pattern: patternText,
  goldenScene,
});

export const goldenLifeExperiences: LifeExperience[] = [
  scene(
    'EXP-LIF-224',
    '问厕所在哪里',
    'Permisi, toiletnya di mana?',
    '在商场、医院或朋友家礼貌询问厕所位置，是最常见的生活口语之一。',
    ['permisi', 'toiletnya', 'di mana', 'lurus saja', 'belok kanan'],
    pattern('Permisi, [tempat] di mana?', '不好意思，[地点]在哪里？'),
    {
      situation: '在陌生地方礼貌询问厕所，并听懂对方常见的方向回答。',
      dialogue: [
        { speaker: '我', indonesian: 'Permisi, toiletnya di mana?', chinese: '不好意思，请问厕所在哪里？' },
        { speaker: '对方', indonesian: 'Lurus saja, lalu belok kanan.', chinese: '一直走，然后右转。' },
        { speaker: '我', indonesian: 'Oh, dekat lift ya?', chinese: '哦，是在电梯附近吗？' },
        { speaker: '对方', indonesian: 'Iya, di sebelah kiri lift.', chinese: '对，在电梯左边。' },
        { speaker: '我', indonesian: 'Terima kasih banyak.', chinese: '非常感谢。' },
      ],
      replies: [
        { indonesian: 'Di sebelah kiri.', chinese: '在左边。' },
        { indonesian: 'Di lantai dua.', chinese: '在二楼。' },
        { indonesian: 'Di belakang kasir.', chinese: '在收银台后面。' },
        { indonesian: 'Di dekat lift.', chinese: '在电梯附近。' },
      ],
      variations: [
        { indonesian: 'Permisi, lift-nya di mana?', chinese: '请问电梯在哪里？' },
        { indonesian: 'Permisi, pintu keluarnya di mana?', chinese: '请问出口在哪里？' },
        { indonesian: 'Permisi, ATM-nya di mana?', chinese: '请问 ATM 在哪里？' },
        { indonesian: 'Permisi, tempat parkirnya di mana?', chinese: '请问停车场在哪里？' },
      ],
      localUsage: { indonesian: 'Toiletnya di mana, ya?', chinese: '更口语一点也可以直接这样说。' },
      easyMistake: { indonesian: 'WC di mana?', chinese: '能懂，但对陌生人略显生硬。' },
      trySay: { indonesian: 'Permisi, toiletnya di mana?', chinese: '不好意思，请问厕所在哪里？' },
    },
  ),
  scene(
    'EXP-LIF-225',
    '厕所里没有纸',
    'Tisu toiletnya habis.',
    '洗手间里的纸用完时，最自然的是先说明“已经没有了”。',
    ['tisu toilet', 'habis', 'butuh', 'stok', 'tambahkan'],
    pattern('[Barang]nya habis.', '[物品]用完了。'),
    {
      situation: '发现洗手间没有纸，提醒家人或同住的人及时补充。',
      dialogue: [
        { speaker: '我', indonesian: 'Tisu toiletnya habis.', chinese: '洗手间里的纸没了。' },
        { speaker: '对方', indonesian: 'Oke, nanti saya ambilkan.', chinese: '好，我等一下拿来。' },
        { speaker: '我', indonesian: 'Kalau ada stoknya, tolong tambahkan ya.', chinese: '如果还有存货，麻烦补一下。' },
        { speaker: '对方', indonesian: 'Siap, saya cek dulu.', chinese: '好的，我先看一下。' },
        { speaker: '我', indonesian: 'Makasih.', chinese: '谢谢。' },
      ],
      replies: [
        { indonesian: 'Sebentar, saya ambil dulu.', chinese: '稍等，我先去拿。' },
        { indonesian: 'Sudah saya beli tadi.', chinese: '我刚刚已经买了。' },
        { indonesian: 'Oke, saya isi lagi.', chinese: '好，我再补一下。' },
        { indonesian: 'Masih ada di kamar mandi kecil.', chinese: '小卫生间里还有。' },
      ],
      variations: [
        { indonesian: 'Sabunnya habis.', chinese: '洗手液用完了。' },
        { indonesian: 'Handuknya belum ada.', chinese: '毛巾还没放。' },
        { indonesian: 'Tisu-nya tinggal sedikit.', chinese: '纸只剩一点了。' },
        { indonesian: 'Stok tisu-nya harus ditambah.', chinese: '纸的库存要补了。' },
      ],
      localUsage: { indonesian: 'Tisunya habis.', chinese: '印尼人日常里常直接这么说。' },
      easyMistake: { indonesian: 'Permisi, tisu toilet belum ada habisnya.', chinese: '这种说法不自然，容易把意思说乱。' },
      trySay: { indonesian: 'Tisu toiletnya habis.', chinese: '洗手间里的纸没了。' },
    },
  ),
  scene(
    'EXP-LIF-226',
    '洗澡没有热水',
    'Air panasnya belum nyala.',
    '洗澡前发现没有热水时，用简单口语先确认问题。 ',
    ['air panas', 'belum nyala', 'water heater', 'cek dulu', 'bantu'],
    pattern('[Barang]nya belum nyala.', '[物品]还没打开。'),
    {
      situation: '洗澡前发现热水没有启动，向家人或管理处说明问题。',
      dialogue: [
        { speaker: '我', indonesian: 'Air panasnya belum nyala.', chinese: '热水还没开。' },
        { speaker: '对方', indonesian: 'Oh, saya cek dulu ya.', chinese: '哦，我先检查一下。' },
        { speaker: '我', indonesian: 'Kalau bisa, tolong bantu nyalakan sekarang.', chinese: '如果可以，麻烦现在帮我打开。' },
        { speaker: '对方', indonesian: 'Baik, sebentar ya.', chinese: '好的，稍等。' },
        { speaker: '我', indonesian: 'Terima kasih.', chinese: '谢谢。' },
      ],
      replies: [
        { indonesian: 'Water heater-nya belum menyala.', chinese: '热水器还没启动。' },
        { indonesian: 'Saya panggil teknisi dulu.', chinese: '我先叫维修人员。' },
        { indonesian: 'Sebentar, saya periksa.', chinese: '等一下，我检查一下。' },
        { indonesian: 'Nanti saya kabari lagi.', chinese: '我等下再通知你。' },
      ],
      variations: [
        { indonesian: 'Airnya dingin.', chinese: '水是冷的。' },
        { indonesian: 'Water heater-nya belum nyala.', chinese: '热水器还没开。' },
        { indonesian: 'Air panasnya tidak keluar.', chinese: '热水没有出来。' },
        { indonesian: 'Kalau bisa, tolong cek air panasnya.', chinese: '如果可以，麻烦检查一下热水。' },
      ],
      localUsage: { indonesian: 'Air panasnya belum keluar.', chinese: '也很自然，意思是“热水还没出来”。' },
      easyMistake: { indonesian: 'Kalau air panas belum kering, tolong cepat.', chinese: '句意混乱，把“热水”和“干不干”混在一起了。' },
      trySay: { indonesian: 'Air panasnya belum nyala.', chinese: '热水还没开。' },
    },
  ),
  scene(
    'EXP-LIF-227',
    '手机没电，找充电器',
    'HP-ku baterainya habis.',
    '手机快没电时，先说明电量没了，再自然问充电器或插座。',
    ['HP', 'baterai', 'charger', 'colokan', 'powerbank'],
    pattern('HP-ku [keadaan].', '我的手机[状态]。'),
    {
      situation: '手机没电，需要找充电器、插座或者借一个 powerbank。',
      dialogue: [
        { speaker: '我', indonesian: 'HP-ku baterainya habis.', chinese: '我手机没电了。' },
        { speaker: '对方', indonesian: 'Ada charger di meja.', chinese: '桌上有充电器。' },
        { speaker: '我', indonesian: 'Boleh pinjam sebentar?', chinese: '可以借我一下吗？' },
        { speaker: '对方', indonesian: 'Iya, silakan.', chinese: '可以，请用。' },
        { speaker: '我', indonesian: 'Makasih ya.', chinese: '谢谢。' },
      ],
      replies: [
        { indonesian: 'Colokannya di sebelah kanan.', chinese: '插座在右边。' },
        { indonesian: 'Powerbank ada di tas.', chinese: '充电宝在包里。' },
        { indonesian: 'Chargernya lagi dipakai.', chinese: '充电器正在用。' },
        { indonesian: 'Nanti saya carikan ya.', chinese: '我等下帮你找。' },
      ],
      variations: [
        { indonesian: 'HP-ku lowbat.', chinese: '我手机快没电了。' },
        { indonesian: 'Ada charger nggak?', chinese: '有充电器吗？' },
        { indonesian: 'Bisa pinjam colokan?', chinese: '可以借用插座吗？' },
        { indonesian: 'Saya butuh charger sebentar.', chinese: '我需要一下充电器。' },
      ],
      localUsage: { indonesian: 'Lowbat banget.', chinese: '印尼人也常直接说“快没电了”。' },
      easyMistake: { indonesian: 'HP-ku mati listrik.', chinese: '字面直译会很怪，应该说电池没电。' },
      trySay: { indonesian: 'HP-ku baterainya habis.', chinese: '我手机没电了。' },
    },
  ),
  scene(
    'EXP-LIF-228',
    '找不到遥控器',
    'Remote-nya nggak ketemu.',
    '在家里找不到电视或空调遥控器时，直接说明“找不到”。',
    ['remote', 'nggak ketemu', 'coba cari', 'di sofa', 'di meja'],
    pattern('[Barang]nya nggak ketemu.', '[物品]找不到了。'),
    {
      situation: '找不到电视或空调遥控器，先问家里人或同住的人有没有看见。',
      dialogue: [
        { speaker: '我', indonesian: 'Remote-nya nggak ketemu.', chinese: '遥控器找不到了。' },
        { speaker: '对方', indonesian: 'Coba cari di sofa.', chinese: '试试在沙发上找找。' },
        { speaker: '我', indonesian: 'Oh iya, ada di meja kecil.', chinese: '哦，在小桌子上。' },
        { speaker: '对方', indonesian: 'Iya, tadi saya taruh di situ.', chinese: '对，刚刚我放在那里了。' },
        { speaker: '我', indonesian: 'Makasih, ketemu juga.', chinese: '谢谢，终于找到了。' },
      ],
      replies: [
        { indonesian: 'Di sofa mungkin.', chinese: '可能在沙发上。' },
        { indonesian: 'Di meja sebelah TV.', chinese: '在电视旁边的桌子上。' },
        { indonesian: 'Saya lihat tadi di kamar.', chinese: '我刚才在房间里看到过。' },
        { indonesian: 'Coba cek di tas.', chinese: '试试在包里找。' },
      ],
      variations: [
        { indonesian: 'Kuncinya nggak ketemu.', chinese: '钥匙找不到了。' },
        { indonesian: 'Kartu aksesnya nggak ketemu.', chinese: '门禁卡找不到了。' },
        { indonesian: 'HP-ku nggak ketemu.', chinese: '我的手机找不到了。' },
        { indonesian: 'Coba cari di meja dulu.', chinese: '先试着在桌子上找。' },
      ],
      localUsage: { indonesian: 'Nggak ketemu.', chinese: '日常里非常高频，意思就是“找不到”。' },
      easyMistake: { indonesian: 'Remote tidak ada kemarin.', chinese: '时间和状态混乱，应该直接说“找不到”。' },
      trySay: { indonesian: 'Remote-nya nggak ketemu.', chinese: '遥控器找不到了。' },
    },
  ),
];

