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
  return module === 'driver' ? driverEssentials : [];
}
