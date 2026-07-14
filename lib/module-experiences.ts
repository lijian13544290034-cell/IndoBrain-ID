export type ModuleRole = 'driver' | 'nanny' | 'production' | 'warehouse' | 'qc' | 'purchasing' | 'operator';

import { getDriverExperiences, type DriverExperience } from '@/lib/driver-experiences';

export type ModuleExperience = DriverExperience & {
  id: string;
  task: string;
  indonesian: string;
  chinese: string;
  harvest: string[];
};

const factoryRoleExperiences: Record<'production' | 'warehouse' | 'qc' | 'purchasing' | 'operator', ModuleExperience[]> = {
  production: [
    { id: 'EXP-PRO-001', task: '今天先生产这个订单。', chinese: '今天先生产这个订单。', indonesian: 'Hari ini produksi pesanan ini dulu ya.', explanation: '开工时先明确当天最优先的订单。', harvest: ['hari ini', 'produksi', 'pesanan ini', 'dulu'] },
    { id: 'EXP-PRO-002', task: '今天目标是多少？', chinese: '今天目标是多少？', indonesian: 'Sasaran hari ini berapa?', explanation: '生产班组开始前确认当天的目标数量。', harvest: ['sasaran', 'hari ini', 'berapa'] },
    { id: 'EXP-PRO-003', task: '这条生产线停了吗？', chinese: '这条生产线停了吗？', indonesian: 'Jalur produksi ini berhenti?', explanation: '出现异常时及时确认生产线状态。', harvest: ['jalur produksi', 'ini', 'berhenti'] },
    { id: 'EXP-PRO-004', task: '今天产量还差多少？', chinese: '今天产量还差多少？', indonesian: 'Produksi hari ini masih kurang berapa?', explanation: '班组长用这句话了解与当天目标的差距。', harvest: ['produksi', 'hari ini', 'masih kurang', 'berapa'] },
    { id: 'EXP-PRO-005', task: '今天晚上需要加班吗？', chinese: '今天晚上需要加班吗？', indonesian: 'Malam ini perlu lembur?', explanation: '根据进度确认是否需要加班。', harvest: ['malam ini', 'perlu', 'lembur'] },
    { id: 'EXP-PRO-006', task: '把这个订单排到明天。', chinese: '把这个订单排到明天。', indonesian: 'Pesanan ini jadwalkan besok ya.', explanation: '生产计划调整后安排指定订单到次日。', harvest: ['pesanan ini', 'jadwalkan', 'besok'] },
    { id: 'EXP-PRO-007', task: '优先完成这个订单。', chinese: '优先完成这个订单。', indonesian: 'Selesaikan pesanan ini dulu ya.', explanation: '交期紧的订单需要优先处理。', harvest: ['selesaikan', 'pesanan ini', 'dulu'] },
    { id: 'EXP-PRO-008', task: '把今天的产量报给我。', chinese: '把今天的产量报给我。', indonesian: 'Laporkan produksi hari ini ke saya ya.', explanation: '班组结束时汇报当天实际产量。', harvest: ['laporkan', 'produksi hari ini', 'ke saya'] },
  ],
  warehouse: [
    { id: 'EXP-WHS-001', task: '查一下这个材料的库存。', chinese: '查一下这个材料的库存。', indonesian: 'Cek stok bahan ini ya.', explanation: '发料或采购前先确认材料库存。', harvest: ['cek stok', 'bahan ini', 'ya'] },
    { id: 'EXP-WHS-002', task: '这批材料已经到了。', chinese: '这批材料已经到了。', indonesian: 'Bahan batch ini sudah datang.', explanation: '仓库通知相关人员材料已到厂。', harvest: ['bahan', 'batch ini', 'sudah datang'] },
    { id: 'EXP-WHS-003', task: '把坏掉的材料分开。', chinese: '把坏掉的材料分开。', indonesian: 'Pisahkan bahan yang rusak ya.', explanation: '避免受损材料被误发到生产线。', harvest: ['pisahkan', 'bahan', 'yang rusak'] },
    { id: 'EXP-WHS-004', task: '把材料送到生产线。', chinese: '把材料送到生产线。', indonesian: 'Kirim bahan ke jalur produksi ya.', explanation: '生产线需要材料时，仓库安排发料。', harvest: ['kirim bahan', 'ke jalur produksi', 'produksi'] },
    { id: 'EXP-WHS-005', task: '这个货放在哪个位置？', chinese: '这个货放在哪个位置？', indonesian: 'Barang ini taruh di lokasi mana?', explanation: '入库时确认货物的存放位置。', harvest: ['barang ini', 'taruh', 'lokasi mana'] },
    { id: 'EXP-WHS-006', task: '今天盘点库存。', chinese: '今天盘点库存。', indonesian: 'Hari ini hitung stok ya.', explanation: '仓库按计划核对实际库存。', harvest: ['hari ini', 'hitung stok', 'stok'] },
    { id: 'EXP-WHS-007', task: '这个箱子要贴标签。', chinese: '这个箱子要贴标签。', indonesian: 'Kotak ini harus ditempel label.', explanation: '货物入库或出库前需要识别标签。', harvest: ['kotak ini', 'harus', 'ditempel label'] },
    { id: 'EXP-WHS-008', task: '出货的货准备好了吗？', chinese: '出货的货准备好了吗？', indonesian: 'Barang untuk kirim sudah siap?', explanation: '发货前由仓库确认货物备齐。', harvest: ['barang', 'untuk kirim', 'sudah siap'] },
  ],
  qc: [
    { id: 'EXP-QC-001', task: '检查这批产品。', chinese: '检查这批产品。', indonesian: 'Periksa produk batch ini ya.', explanation: 'QC 对完成的批次进行检验。', harvest: ['periksa', 'produk', 'batch ini'] },
    { id: 'EXP-QC-002', task: '把不良品分开。', chinese: '把不良品分开。', indonesian: 'Pisahkan barang cacatnya ya.', explanation: '发现不良品后先隔离，避免混入合格品。', harvest: ['pisahkan', 'barang cacat', 'ya'] },
    { id: 'EXP-QC-003', task: '这个产品需要返工。', chinese: '这个产品需要返工。', indonesian: 'Produk ini perlu dikerjakan ulang.', explanation: '产品未达到标准时安排返工。', harvest: ['produk ini', 'perlu', 'dikerjakan ulang'] },
    { id: 'EXP-QC-004', task: '先检查样品。', chinese: '先检查样品。', indonesian: 'Periksa sampelnya dulu ya.', explanation: '量产或交货前先确认样品。', harvest: ['periksa', 'sampelnya', 'dulu'] },
    { id: 'EXP-QC-005', task: '检查包装品质。', chinese: '检查包装品质。', indonesian: 'Periksa mutu kemasannya ya.', explanation: '出货前检查包装是否符合要求。', harvest: ['periksa', 'mutu', 'kemasannya'] },
    { id: 'EXP-QC-006', task: '这个缺陷又出现了。', chinese: '这个缺陷又出现了。', indonesian: 'Cacat ini terulang lagi.', explanation: '重复出现的缺陷需要升级处理。', harvest: ['cacat ini', 'terulang', 'lagi'] },
    { id: 'EXP-QC-007', task: '检查结果怎么样？', chinese: '检查结果怎么样？', indonesian: 'Hasil pemeriksaannya bagaimana?', explanation: '检验完成后确认结果。', harvest: ['hasil', 'pemeriksaannya', 'bagaimana'] },
    { id: 'EXP-QC-008', task: '客户的品质要求是什么？', chinese: '客户的品质要求是什么？', indonesian: 'Standar mutu dari pelanggan apa?', explanation: '生产前确认客户的品质标准。', harvest: ['standar mutu', 'dari pelanggan', 'apa'] },
  ],
  purchasing: [
    { id: 'EXP-PUR-001', task: '原材料不够。', chinese: '原材料不够。', indonesian: 'Bahan bakunya tidak cukup.', explanation: '采购收到缺料信息后需要安排补货。', harvest: ['bahan baku', 'tidak cukup', 'cukup'] },
    { id: 'EXP-PUR-002', task: '问一下供应商什么时候送到。', chinese: '问一下供应商什么时候送到。', indonesian: 'Tanya pemasoknya datang kapan ya.', explanation: '材料未到时，采购向供应商确认到货时间。', harvest: ['tanya pemasok', 'datang kapan', 'ya'] },
    { id: 'EXP-PUR-003', task: '订购这个材料。', chinese: '订购这个材料。', indonesian: 'Pesan bahan ini ya.', explanation: '确认需求后向供应商下采购单。', harvest: ['pesan', 'bahan ini', 'ya'] },
    { id: 'EXP-PUR-004', task: '供应商送晚了。', chinese: '供应商送晚了。', indonesian: 'Pemasoknya terlambat.', explanation: '供应商延误会影响材料供应。', harvest: ['pemasok', 'terlambat', 'pemasoknya'] },
    { id: 'EXP-PUR-005', task: '确认材料规格。', chinese: '确认材料规格。', indonesian: 'Konfirmasi spesifikasi bahannya ya.', explanation: '下单前确认规格，避免买错材料。', harvest: ['konfirmasi', 'spesifikasi bahan', 'ya'] },
    { id: 'EXP-PUR-006', task: '这个材料要买多少？', chinese: '这个材料要买多少？', indonesian: 'Bahan ini beli berapa?', explanation: '采购根据生产计划确认采购数量。', harvest: ['bahan ini', 'beli', 'berapa'] },
    { id: 'EXP-PUR-007', task: '这个报价可以吗？', chinese: '这个报价可以吗？', indonesian: 'Penawaran ini bisa dipakai?', explanation: '采购比较报价后确认是否采用。', harvest: ['penawaran ini', 'bisa', 'dipakai'] },
    { id: 'EXP-PUR-008', task: '请供应商今天送货。', chinese: '请供应商今天送货。', indonesian: 'Minta pemasok kirim hari ini ya.', explanation: '生产紧急时要求供应商当天送达。', harvest: ['minta pemasok', 'kirim', 'hari ini'] },
  ],
  operator: [
    { id: 'EXP-OPR-001', task: '开始开机器。', chinese: '开始开机器。', indonesian: 'Mulai nyalakan mesin ya.', explanation: '操作员在确认安全后启动设备。', harvest: ['mulai', 'nyalakan', 'mesin'] },
    { id: 'EXP-OPR-002', task: '操作机器要戴手套。', chinese: '操作机器要戴手套。', indonesian: 'Kalau pakai mesin, harus pakai sarung tangan.', explanation: '操作设备时使用手套保护双手。', harvest: ['pakai mesin', 'harus pakai', 'sarung tangan'] },
    { id: 'EXP-OPR-003', task: '机器不正常。', chinese: '机器不正常。', indonesian: 'Mesinnya tidak normal.', explanation: '操作员发现设备异常时及时报告。', harvest: ['mesinnya', 'tidak normal', 'normal'] },
    { id: 'EXP-OPR-004', task: '今天做这个产品。', chinese: '今天做这个产品。', indonesian: 'Hari ini buat produk ini ya.', explanation: '班组按当天安排生产指定产品。', harvest: ['hari ini', 'buat', 'produk ini'] },
    { id: 'EXP-OPR-005', task: '数一下做了多少件。', chinese: '数一下做了多少件。', indonesian: 'Hitung sudah buat berapa pcs ya.', explanation: '操作员记录当前完成数量。', harvest: ['hitung', 'buat berapa', 'pcs'] },
    { id: 'EXP-OPR-006', task: '先关掉机器。', chinese: '先关掉机器。', indonesian: 'Matikan mesinnya dulu ya.', explanation: '异常或换线前按要求关闭设备。', harvest: ['matikan', 'mesinnya', 'dulu'] },
    { id: 'EXP-OPR-007', task: '请叫一下主管。', chinese: '请叫一下主管。', indonesian: 'Tolong panggil pengawas ya.', explanation: '现场需要主管协助时使用。', harvest: ['tolong panggil', 'pengawas', 'ya'] },
    { id: 'EXP-OPR-008', task: '整理一下工作区域。', chinese: '整理一下工作区域。', indonesian: 'Rapikan area kerja ya.', explanation: '结束工作前保持操作区域整洁。', harvest: ['rapikan', 'area kerja', 'ya'] },
  ],
};

const nannyTasks = [
  '今天做什么菜？', '不要放辣椒', '帮我买水果', '今天打扫房间', '孩子放学几点？',
  '请帮我洗衣服', '晚饭几点做好？', '冰箱里还有什么？', '明天早点来', '今天不用来了',
  '帮我照顾孩子', '去超市买东西', '厨房收拾好了吗？', '帮我拿快递', '门口有人吗？',
  '今天要洗车吗？', '垃圾倒了吗？', '帮我准备早餐', '家里没有米了', '今天先休息吧',
  '把衣服晾起来', '帮我买鸡蛋', '晚点做饭', '客人几点来？', '准备一下房间',
  '别忘了关门', '帮我浇花', '这个怎么做？', '明天买菜', '今天辛苦了',
  '帮我整理客厅', '孩子睡了吗？', '药放在哪里？', '今天不用打扫', '帮我看一下锅',
  '晚上不要等我', '明天几点来？', '帮我热一下饭', '洗手间清理了吗？', '帮我买牛奶',
  '今天下雨吗？', '把窗户关上', '客人走了吗？', '帮我换床单', '今天做汤吧',
  '明天记得买菜', '先休息一下', '帮我拿毛巾', '晚上锁门', '明天见',
];

function createNannyExperiences(prefix: string, tasks: string[]): ModuleExperience[] {
  return tasks.map((task, index) => {
    const id = `${prefix}-${String(index + 1).padStart(3, '0')}`;
    return { id, task, indonesian: 'Tolong bantu urus rumah ya.', chinese: task, explanation: task, harvest: ['tolong（请）', 'sudah（已经）', 'nanti（之后）'] };
  });
}

export const moduleExperiences: Record<ModuleRole, ModuleExperience[]> = {
  ...factoryRoleExperiences,
  driver: getDriverExperiences(),
  nanny: createNannyExperiences('EXP-NAN', nannyTasks),
};

export const moduleMeta = {
  production: { indonesian: 'Produksi', chinese: '生产', chatRole: 'factory' },
  warehouse: { indonesian: 'Gudang', chinese: '仓库', chatRole: 'factory' },
  qc: { indonesian: 'QC', chinese: '品质管理', chatRole: 'factory' },
  purchasing: { indonesian: 'Purchasing', chinese: '采购', chatRole: 'factory' },
  operator: { indonesian: 'Operator', chinese: '操作员', chatRole: 'factory' },
  driver: { indonesian: 'Sopir', chinese: '司机', chatRole: 'driver' },
  nanny: { indonesian: 'ART', chinese: '保姆', chatRole: 'nanny' },
} as const;
