export type EssentialCategory = {
  slug: string;
  indonesian: string;
  chinese: string;
};

export type Essential = {
  id: string;
  module: 'driver' | 'nanny' | 'factory' | 'social';
  category: string;
  chinese: string;
  indonesian: string;
  aliases: string[];
  sortOrder: number;
};

export const driverEssentialCategories: EssentialCategory[] = [
  { slug: 'arah', indonesian: 'Arah', chinese: '方向' },
  { slug: 'navigasi', indonesian: 'Navigasi', chinese: '导航' },
  { slug: 'berhenti-menunggu', indonesian: 'Berhenti & Menunggu', chinese: '停车与等待' },
  { slug: 'kecepatan-berkendara', indonesian: 'Kecepatan & Berkendara', chinese: '速度与驾驶' },
  { slug: 'tempat', indonesian: 'Tempat', chinese: '常见地点' },
  { slug: 'waktu-koordinasi', indonesian: 'Waktu & Koordinasi', chinese: '时间与协调' },
];

const item = (id: string, category: string, chinese: string, indonesian: string, aliases: string[]): Essential => ({
  id, module: 'driver', category, chinese, indonesian, aliases, sortOrder: Number(id.slice(-3)),
});

const driverEssentials: Essential[] = [
  item('ESS-DRV-001', 'arah', '左转。', 'Belok kiri.', ['左转', '方向', 'kiri', 'belok']),
  item('ESS-DRV-002', 'arah', '右转。', 'Belok kanan.', ['右转', '方向', 'kanan', 'belok']),
  item('ESS-DRV-003', 'arah', '一直走。', 'Lurus saja.', ['一直走', '直走', '方向', 'lurus']),
  item('ESS-DRV-004', 'arah', '前面掉头。', 'Putar balik di depan.', ['掉头', '调头', '方向', 'putar balik']),
  item('ESS-DRV-005', 'arah', '从这里进去。', 'Masuk dari sini.', ['从这里进去', '进去', '方向', 'masuk']),
  item('ESS-DRV-006', 'arah', '从那边出去。', 'Keluar lewat sana.', ['从那边出去', '出去', '方向', 'keluar']),
  item('ESS-DRV-007', 'arah', '走左边。', 'Lewat sebelah kiri.', ['走左边', '左边', '方向', 'kiri']),
  item('ESS-DRV-008', 'arah', '走右边。', 'Lewat sebelah kanan.', ['走右边', '右边', '方向', 'kanan']),
  item('ESS-DRV-009', 'arah', '在前面的路口左转。', 'Di simpang depan, belok kiri.', ['路口左转', '左转', '方向', 'simpang']),
  item('ESS-DRV-010', 'arah', '在前面的路口右转。', 'Di simpang depan, belok kanan.', ['路口右转', '右转', '方向', 'simpang']),
  item('ESS-DRV-011', 'arah', '走另外一条路。', 'Lewat jalan lain saja.', ['另一条路', '换路', '方向', 'jalan lain']),
  item('ESS-DRV-012', 'arah', '不要走这条路。', 'Jangan lewat jalan ini.', ['不要走这条路', '别走这条路', '方向', 'jalan ini']),

  item('ESS-DRV-013', 'navigasi', '跟着导航走。', 'Ikuti GPS saja.', ['跟导航', '导航', 'GPS', 'ikuti']),
  item('ESS-DRV-014', 'navigasi', '导航显示走这边。', 'GPS-nya menunjukkan lewat sini.', ['导航显示', '走这边', '导航', 'GPS']),
  item('ESS-DRV-015', 'navigasi', '前面有出口。', 'Di depan ada pintu keluar.', ['出口', '导航', 'pintu keluar']),
  item('ESS-DRV-016', 'navigasi', '从这个出口出去。', 'Keluar lewat pintu ini.', ['这个出口', '出口出去', '导航', 'keluar']),
  item('ESS-DRV-017', 'navigasi', '进入高速公路。', 'Masuk jalan tol.', ['进高速', '高速公路', '导航', 'jalan tol']),
  item('ESS-DRV-018', 'navigasi', '不要走高速。', 'Jangan lewat jalan tol.', ['不走高速', '高速公路', '导航', 'jalan tol']),
  item('ESS-DRV-019', 'navigasi', '前面有收费站。', 'Di depan ada gerbang tol.', ['收费站', '高速收费', '导航', 'gerbang tol']),
  item('ESS-DRV-020', 'navigasi', '走普通道路。', 'Lewat jalan biasa saja.', ['普通道路', '不走高速', '导航', 'jalan biasa']),
  item('ESS-DRV-021', 'navigasi', '这条路堵车吗？', 'Jalan ini macet nggak?', ['这条路堵吗', '堵车', '导航', 'macet']),
  item('ESS-DRV-022', 'navigasi', '前面堵得严重吗？', 'Di depan macet parah nggak?', ['前面堵车', '堵得严重', '导航', 'macet parah']),
  item('ESS-DRV-023', 'navigasi', '看看有没有更快的路。', 'Coba cari jalan yang lebih cepat.', ['更快的路', '快一点', '导航', 'jalan cepat']),
  item('ESS-DRV-024', 'navigasi', '我们是不是走错路了？', 'Kita salah jalan nggak?', ['走错路', '导航', 'salah jalan']),

  item('ESS-DRV-025', 'berhenti-menunggu', '先靠边停一下。', 'Pinggir dulu ya.', ['靠边停', '停车', '等待', 'pinggir']),
  item('ESS-DRV-026', 'berhenti-menunggu', '停在这里。', 'Berhenti di sini.', ['停这里', '停车', '等待', 'berhenti']),
  item('ESS-DRV-027', 'berhenti-menunggu', '停在前面。', 'Berhenti di depan.', ['停前面', '停车', '等待', 'berhenti']),
  item('ESS-DRV-028', 'berhenti-menunggu', '在门口等我。', 'Tunggu saya di depan pintu.', ['门口等我', '等待', 'tunggu', 'pintu']),
  item('ESS-DRV-029', 'berhenti-menunggu', '在大堂等我。', 'Tunggu saya di lobi.', ['大堂等我', '等待', 'tunggu', 'lobi']),
  item('ESS-DRV-030', 'berhenti-menunggu', '在车里等我。', 'Tunggu saya di mobil.', ['车里等我', '等待', 'tunggu', 'mobil']),
  item('ESS-DRV-031', 'berhenti-menunggu', '等我五分钟。', 'Tunggu saya lima menit ya.', ['等五分钟', '等待', 'lima menit', 'tunggu']),
  item('ESS-DRV-032', 'berhenti-menunggu', '不用等我。', 'Nggak usah tunggu saya.', ['不用等我', '不要等', '等待', 'nggak usah']),
  item('ESS-DRV-033', 'berhenti-menunggu', '我好了以后联系你。', 'Kalau sudah selesai, saya hubungi kamu.', ['好了联系你', '结束后联系', '等待', 'hubungi']),
  item('ESS-DRV-034', 'berhenti-menunggu', '你可以先去停车。', 'Kamu parkir dulu saja.', ['先去停车', '停车', '等待', 'parkir']),

  item('ESS-DRV-035', 'kecepatan-berkendara', '慢一点。', 'Pelan-pelan ya.', ['慢一点', '速度', '驾驶', 'pelan']),
  item('ESS-DRV-036', 'kecepatan-berkendara', '开快一点。', 'Sedikit lebih cepat ya.', ['快一点', '速度', '驾驶', 'cepat']),
  item('ESS-DRV-037', 'kecepatan-berkendara', '不要开太快。', 'Jangan terlalu cepat.', ['不要太快', '速度', '驾驶', 'terlalu cepat']),
  item('ESS-DRV-038', 'kecepatan-berkendara', '小心一点。', 'Hati-hati ya.', ['小心', '驾驶', 'hati-hati']),
  item('ESS-DRV-039', 'kecepatan-berkendara', '前面注意一下。', 'Hati-hati di depan.', ['前面注意', '驾驶', 'hati-hati']),
  item('ESS-DRV-040', 'kecepatan-berkendara', '继续走。', 'Lanjut jalan.', ['继续走', '驾驶', 'lanjut']),
  item('ESS-DRV-041', 'kecepatan-berkendara', '可以走了。', 'Sudah bisa jalan.', ['可以走了', '驾驶', 'bisa jalan']),
  item('ESS-DRV-042', 'kecepatan-berkendara', '倒车一点。', 'Mundur sedikit.', ['倒车', '驾驶', 'mundur']),

  item('ESS-DRV-043', 'tempat', '去机场。', 'Ke bandara.', ['机场', '地点', 'bandara']),
  item('ESS-DRV-044', 'tempat', '去酒店。', 'Ke hotel.', ['酒店', '地点', 'hotel']),
  item('ESS-DRV-045', 'tempat', '去公司。', 'Ke kantor.', ['公司', '办公室', '地点', 'kantor']),
  item('ESS-DRV-046', 'tempat', '去工厂。', 'Ke pabrik.', ['工厂', '地点', 'pabrik']),
  item('ESS-DRV-047', 'tempat', '去银行。', 'Ke bank.', ['银行', '地点', 'bank']),
  item('ESS-DRV-048', 'tempat', '去医院。', 'Ke rumah sakit.', ['医院', '地点', 'rumah sakit']),
  item('ESS-DRV-049', 'tempat', '去商场。', 'Ke mal.', ['商场', '地点', 'mal']),
  item('ESS-DRV-050', 'tempat', '去停车场。', 'Ke tempat parkir.', ['停车场', '地点', 'tempat parkir']),
  item('ESS-DRV-051', 'tempat', '去大门。', 'Ke gerbang depan.', ['大门', '正门', '地点', 'gerbang depan']),
  item('ESS-DRV-052', 'tempat', '去后门。', 'Ke pintu belakang.', ['后门', '地点', 'pintu belakang']),

  item('ESS-DRV-053', 'waktu-koordinasi', '现在出发。', 'Berangkat sekarang.', ['现在出发', '时间', '协调', 'berangkat']),
  item('ESS-DRV-054', 'waktu-koordinasi', '十分钟后出发。', 'Berangkat sepuluh menit lagi.', ['十分钟后出发', '时间', '协调', 'sepuluh menit']),
  item('ESS-DRV-055', 'waktu-koordinasi', '明天早上七点来接我。', 'Besok pagi jemput saya jam tujuh.', ['明早七点接我', '时间', '协调', 'jemput']),
  item('ESS-DRV-056', 'waktu-koordinasi', '我马上下来。', 'Saya segera turun.', ['马上下来', '时间', '协调', 'segera turun']),
  item('ESS-DRV-057', 'waktu-koordinasi', '我快到了。', 'Saya hampir sampai.', ['快到了', '时间', '协调', 'hampir sampai']),
  item('ESS-DRV-058', 'waktu-koordinasi', '你到了告诉我。', 'Kalau sudah sampai, kabari saya ya.', ['到了告诉我', '时间', '协调', 'kabari']),
  item('ESS-DRV-059', 'waktu-koordinasi', '我晚一点联系你。', 'Nanti saya hubungi kamu lagi.', ['晚点联系', '时间', '协调', 'hubungi']),
  item('ESS-DRV-060', 'waktu-koordinasi', '今天不用来接我。', 'Hari ini nggak usah jemput saya.', ['今天不用接我', '取消接送', '时间', '协调', 'nggak usah jemput']),
];

export function getEssentials(module: Essential['module']) {
  if (module === 'driver') return driverEssentials;
  if (module === 'nanny') return nannyEssentials;
  if (module === 'factory') return factoryEssentials;
  return socialEssentials;
}

function seeds(module: Essential['module'], prefix: string, groups: Array<{ category: string; lines: string[] }>) {
  return groups.flatMap((group) => group.lines.map((line) => {
    const [chinese, indonesian] = line.split('|');
    return { module, category: group.category, chinese, indonesian, aliases: [chinese, indonesian, group.category], sortOrder: 0 };
  })).map((entry, index) => ({ ...entry, id: `${prefix}-${String(index + 1).padStart(3, '0')}`, sortOrder: index + 1 }));
}

export const nannyEssentialCategories: EssentialCategory[] = [
  { slug: 'anak-bayi', indonesian: 'Anak & Bayi', chinese: '孩子与婴儿' }, { slug: 'makan-minum', indonesian: 'Makan & Minum', chinese: '吃饭与喝水' },
  { slug: 'tidur-mandi', indonesian: 'Tidur & Mandi', chinese: '睡觉与洗澡' }, { slug: 'rumah-kebersihan', indonesian: 'Rumah & Kebersihan', chinese: '家务与清洁' },
  { slug: 'belanja-persediaan', indonesian: 'Belanja & Persediaan', chinese: '购物与用品' }, { slug: 'kesehatan-keamanan', indonesian: 'Kesehatan & Keamanan', chinese: '健康与安全' },
];

const nannyEssentials = seeds('nanny', 'ESS-NAN', [
  { category: 'anak-bayi', lines: [
    '抱一下宝宝。|Gendong bayinya ya.', '换一下尿布。|Ganti popoknya ya.', '孩子在哭。|Anaknya menangis.', '陪孩子玩一下。|Temani anaknya bermain ya.',
    '看着孩子。|Tolong jaga anaknya ya.', '去接孩子。|Jemput anaknya ya.', '送孩子去学校。|Antar anaknya ke sekolah ya.', '孩子醒了。|Anaknya sudah bangun.',
    '准备孩子的衣服。|Siapkan baju anaknya ya.', '不要让孩子靠近危险的地方。|Jangan biarkan anaknya dekat tempat berbahaya.', '带孩子出去一下。|Ajak anaknya keluar sebentar ya.', '孩子在睡觉。|Anaknya sedang tidur.',
  ] },
  { category: 'makan-minum', lines: [
    '准备牛奶。|Siapkan susu ya.', '给孩子喝水。|Kasih anaknya minum air ya.', '喂孩子吃饭。|Suapi anaknya ya.', '不要放辣椒。|Jangan pakai cabai ya.',
    '少放一点糖。|Kurangi gulanya ya.', '准备一些水果。|Siapkan buah ya.', '把饭热一下。|Hangatkan makanannya ya.', '孩子还没吃饭。|Anaknya belum makan.',
    '留一点饭。|Simpan sedikit makanan ya.', '把餐桌擦干净。|Bersihkan meja makan ya.',
  ] },
  { category: 'tidur-mandi', lines: [
    '让孩子睡觉。|Tidurkan anaknya ya.', '叫孩子起床。|Bangunkan anaknya ya.', '给孩子洗澡。|Mandikan anaknya ya.', '给孩子洗头。|Keramas anaknya ya.',
    '准备毛巾。|Siapkan handuk ya.', '用温水。|Pakai air hangat ya.', '给孩子换衣服。|Ganti baju anaknya ya.', '让孩子刷牙。|Suruh anaknya sikat gigi ya.',
    '关灯。|Matikan lampunya ya.', '轻轻关门。|Tutup pintunya pelan-pelan ya.',
  ] },
  { category: 'rumah-kebersihan', lines: [
    '扫地。|Sapu lantainya ya.', '拖地。|Pel lantainya ya.', '洗衣服。|Cuci bajunya ya.', '晾衣服。|Jemur bajunya ya.',
    '叠衣服。|Lipat bajunya ya.', '打扫房间。|Bersihkan kamarnya ya.', '打扫厨房。|Bersihkan dapurnya ya.', '倒垃圾。|Buang sampahnya ya.',
    '洗厕所。|Bersihkan kamar mandinya ya.', '收拾玩具。|Rapikan mainannya ya.',
  ] },
  { category: 'belanja-persediaan', lines: [
    '买蔬菜。|Beli sayur ya.', '买尿布。|Beli popok ya.', '买牛奶。|Beli susu ya.', '买肥皂。|Beli sabun ya.',
    '家里的用品快没了。|Barang kebutuhan rumah hampir habis.', '看一下购物清单。|Cek daftar belanjanya ya.', '保留收据。|Simpan struknya ya.', '不要买太多。|Jangan beli terlalu banyak ya.',
  ] },
  { category: 'kesehatan-keamanan', lines: [
    '孩子发烧了。|Anaknya demam.', '孩子咳嗽。|Anaknya batuk.', '马上告诉我。|Langsung kabari saya ya.', '先不要给药。|Jangan kasih obat dulu ya.',
    '先打电话给我。|Telepon saya dulu ya.', '小心一点。|Hati-hati ya.', '把大门关好。|Tutup gerbangnya ya.', '不要让孩子一个人待着。|Jangan tinggalkan anaknya sendiri.',
    '把尖锐物品放远一点。|Jauhkan barang tajam ya.', '需要的话联系医生。|Kalau perlu, hubungi dokter ya.',
  ] },
]);

export const factoryEssentialCategories: EssentialCategory[] = [
  { slug: 'produksi', indonesian: 'Produksi', chinese: '生产' }, { slug: 'qc-cacat', indonesian: 'QC & Cacat', chinese: '品质与不良' },
  { slug: 'gudang-stok', indonesian: 'Gudang & Stok', chinese: '仓库与库存' }, { slug: 'purchasing-supplier', indonesian: 'Purchasing & Supplier', chinese: '采购与供应商' },
  { slug: 'operator-mesin', indonesian: 'Operator & Mesin', chinese: '操作与机器' }, { slug: 'pengiriman-ekspor', indonesian: 'Pengiriman & Ekspor', chinese: '出货与出口' },
  { slug: 'keamanan-koordinasi', indonesian: 'Keamanan & Koordinasi', chinese: '安全与协调' },
];

const factoryEssentials = seeds('factory', 'ESS-FAC', [
  { category: 'produksi', lines: [
    '开始生产。|Mulai produksi ya.', '停止生产。|Hentikan produksi dulu.', '今天的生产目标。|Sasaran produksi hari ini.', '这个订单很急。|Pesanan ini mendesak.',
    '生产晚了。|Produksinya terlambat.', '改变优先顺序。|Ubah prioritasnya ya.', '今晚要加班。|Malam ini perlu lembur.', '今天的产量。|Produksi hari ini.',
    '发今天的生产报告。|Kirim laporan produksi hari ini.', '这条生产线。|Jalur produksi ini.', '确认生产计划。|Konfirmasi jadwal produksi ya.', '工人不够。|Pekerjanya kurang.',
    '更换材料。|Ganti bahannya ya.', '先做样品。|Buat sampel dulu ya.', '这批需要返工。|Batch ini perlu dikerjakan ulang.', '今天完成。|Selesaikan hari ini ya.',
    '明天继续。|Lanjut besok ya.', '检查生产进度。|Cek progres produksi ya.',
  ] },
  { category: 'qc-cacat', lines: [
    '检查这批货。|Cek batch ini ya.', '有不良品。|Ada barang cacat.', '不良率是多少？|Cacatnya berapa persen?', '把不良品分开。|Pisahkan barang cacatnya ya.',
    '需要返工。|Perlu dikerjakan ulang.', '检查样品。|Cek sampelnya ya.', '客户要验货。|Pelanggan mau cek barang.', '发品质报告。|Kirim laporan mutu ya.',
    '再检查一次。|Cek lagi ya.', '包装有问题。|Kemasannya bermasalah.', '颜色不一样。|Warnanya berbeda.', '尺寸不对。|Ukurannya tidak sesuai.',
    '有脏污。|Ada kotoran.', '品质合格。|Mutunya lolos.', '品质不合格。|Mutunya tidak lolos.', '做改善措施。|Lakukan perbaikan ya.',
  ] },
  { category: 'gudang-stok', lines: [
    '检查库存。|Cek stok ya.', '盘点库存。|Hitung stok ya.', '材料到了。|Bahannya sudah datang.', '材料不够。|Bahannya kurang.',
    '放在什么位置？|Taruh di lokasi mana?', '放到A区。|Taruh di area A ya.', '收货。|Terima barangnya ya.', '发货。|Keluarkan barangnya ya.',
    '准备装货。|Siapkan untuk muat ya.', '数量不对。|Jumlahnya tidak sesuai.', '包装破了。|Kemasannya rusak.', '这个托盘。|Palet ini.',
    '贴标签。|Kasih label ya.', '做库存记录。|Catat inventarisnya ya.', '仓库文件。|Dokumen gudangnya.', '库存余额。|Sisa stoknya.',
  ] },
  { category: 'purchasing-supplier', lines: [
    '联系供应商。|Hubungi pemasok ya.', '确认价格。|Konfirmasi harganya ya.', '发采购单。|Kirim pesanan pembelian ya.', '送货日期是什么时候？|Tanggal kirimnya kapan?',
    '供应商晚了。|Pemasoknya terlambat.', '紧急采购。|Beli mendesak ya.', '订购数量。|Jumlah pesanannya.', '材料规格。|Spesifikasi bahannya.',
    '报价单。|Penawarannya.', '发票。|Fakturnya.', '付款条件。|Syarat pembayarannya.', '要一个样品。|Minta sampel ya.',
    '换供应商。|Ganti pemasok ya.', '跟进一下。|Tolong tindak lanjuti ya.',
  ] },
  { category: 'operator-mesin', lines: [
    '开机器。|Nyalakan mesinnya ya.', '关机器。|Matikan mesinnya ya.', '机器有问题。|Mesinnya bermasalah.', '叫主管过来。|Panggil supervisornya ya.',
    '换模具。|Ganti cetakannya ya.', '调整设置。|Atur setelannya ya.', '检查温度。|Cek suhunya ya.', '清理机器。|Bersihkan mesinnya ya.',
    '数一下产量。|Hitung hasilnya ya.', '换材料。|Ganti bahan ya.', '重新开机。|Nyalakan lagi ya.', '做机器保养。|Rawat mesinnya ya.',
    '机器声音不正常。|Suara mesinnya tidak normal.', '紧急停止。|Hentikan darurat ya.',
  ] },
  { category: 'pengiriman-ekspor', lines: [
    '货准备好出货了。|Barangnya siap dikirim.', '货车到了。|Truknya sudah datang.', '装货。|Muat barangnya ya.', '卸货。|Bongkar barangnya ya.',
    '送货单。|Surat jalannya.', '装箱单。|Daftar kemasnya.', '集装箱到了。|Kontainernya sudah datang.', '检查集装箱封条。|Cek segel kontainernya ya.',
    '海关文件。|Dokumen bea cukainya.', '货到港口了。|Barangnya sudah di pelabuhan.', '联系货代。|Hubungi forwardernya ya.', '出货晚了。|Pengirimannya terlambat.',
    '客户确认了吗？|Pelanggan sudah konfirmasi?', '出口截止日期。|Batas ekspornya kapan?',
  ] },
  { category: 'keamanan-koordinasi', lines: [
    '戴安全帽。|Pakai helm ya.', '戴手套。|Pakai sarung tangan ya.', '危险区域。|Area berbahaya.', '紧急出口。|Pintu darurat.',
    '灭火器在哪里？|Alat pemadam di mana?', '安全说明会。|Briefing keselamatan.', '报告事故。|Laporkan kecelakaannya ya.', '停止不安全的工作。|Hentikan kerja yang tidak aman.',
  ] },
]);

export const socialEssentialCategories: EssentialCategory[] = [
  { slug: 'sapaan-kenalan', indonesian: 'Sapaan & Kenalan', chinese: '问候与认识' }, { slug: 'obrolan-santai', indonesian: 'Obrolan Santai', chinese: '日常聊天' },
  { slug: 'whatsapp-kontak', indonesian: 'WhatsApp & Kontak', chinese: '联系方式' }, { slug: 'ngopi-makan', indonesian: 'Ngopi & Makan', chinese: '咖啡与吃饭' },
  { slug: 'respons-cepat', indonesian: 'Respons Cepat', chinese: '快速回应' }, { slug: 'peduli-sopan', indonesian: 'Peduli & Sopan', chinese: '关心与礼貌' },
];

const socialEssentials = seeds('social', 'ESS-SOC', [
  { category: 'sapaan-kenalan', lines: [
    '你好。|Halo.', '很高兴认识你。|Senang kenal sama kamu.', '你叫什么名字？|Nama kamu siapa?', '你来自哪里？|Kamu dari mana?',
    '你住在哪里？|Kamu tinggal di mana?', '你在这里工作吗？|Kamu kerja di sini?', '我刚来印尼不久。|Saya baru datang ke Indonesia belum lama.', '我还在学印尼语。|Saya masih belajar bahasa Indonesia.',
    '请说慢一点。|Tolong bicara pelan-pelan ya.', '下次见。|Sampai ketemu lagi.',
  ] },
  { category: 'obrolan-santai', lines: [
    '今天忙吗？|Hari ini sibuk?', '吃饭了吗？|Sudah makan belum?', '最近怎么样？|Akhir-akhir ini gimana?', '你在做什么？|Kamu lagi apa?',
    '今天工作怎么样？|Kerja hari ini gimana?', '今天很热。|Hari ini panas banget ya.', '今天堵车严重吗？|Hari ini macet parah nggak?', '周末有什么计划？|Akhir pekan ada rencana apa?',
    '好久不见。|Sudah lama nggak ketemu.', '真的吗？|Serius?', '然后呢？|Terus gimana?', '这很有意思。|Ini menarik ya.',
  ] },
  { category: 'whatsapp-kontak', lines: [
    '可以加你的 WhatsApp 吗？|Boleh minta WhatsApp kamu?', '这是我的号码。|Ini nomor saya.', '给我发个消息。|Kirim pesan ke saya ya.', '我保存你的号码。|Saya simpan nomor kamu ya.',
    '把位置发给我。|Kirim lokasi ke saya ya.', '把照片发给我。|Kirim fotonya ya.', '晚点打给我。|Telepon saya nanti ya.', '保持联系。|Tetap kontak ya.',
  ] },
  { category: 'ngopi-makan', lines: [
    '想喝咖啡吗？|Mau ngopi?', '我们一起吃饭吧。|Kita makan bareng yuk.', '你想吃什么？|Kamu mau makan apa?', '今天我请客。|Hari ini saya yang traktir ya.',
    '我们AA吧。|Kita bayar masing-masing ya.', '我知道一个好地方。|Saya tahu tempat yang enak.', '你什么时候有空？|Kamu kapan ada waktu?', '我订好位子了。|Saya sudah reservasi tempat.',
    '谢谢你今天陪我。|Terima kasih untuk hari ini.', '我们下次再见吧。|Lain kali ketemu lagi ya.',
  ] },
  { category: 'respons-cepat', lines: [
    '好的。|Oke.', '可以。|Bisa.', '不可以。|Nggak bisa.', '没问题。|Nggak apa-apa.', '放轻松。|Santai aja.',
    '等一下。|Tunggu sebentar ya.', '等会儿。|Nanti ya.', '我在路上。|Saya OTW ya.', '是吗？|Oh ya?', '哈哈哈。|Wkwkwk.',
  ] },
  { category: 'peduli-sopan', lines: [
    '保重。|Jaga diri ya.', '路上小心。|Hati-hati di jalan ya.', '到了告诉我。|Kalau sudah sampai, kabari saya ya.', '休息一下。|Istirahat dulu ya.',
    '不要太累。|Jangan terlalu capek ya.', '你还好吗？|Kamu nggak apa-apa?', '需要帮忙吗？|Perlu bantuan?', '谢谢。|Terima kasih.',
    '不好意思。|Maaf ya.', '借过一下。|Permisi ya.',
  ] },
]);
