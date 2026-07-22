export type ModuleRole = 'driver' | 'nanny' | 'production' | 'warehouse' | 'qc' | 'purchasing' | 'operator' | 'logistics' | 'shipping' | 'export' | 'customerService';

import { getDriverExperiences, type DriverExperience } from '@/lib/driver-experiences';
import { getNannyExperiences } from '@/lib/nanny-experiences';
import { formatHarvest } from '@/lib/harvest';

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
    { id: 'EXP-PRO-006', task: '把这个订单排到明天。', chinese: '把这个订单排到明天。', indonesian: 'Jadwalkan pesanan ini besok ya.', explanation: '生产计划调整后安排指定订单到次日。', harvest: ['jadwalkan', 'pesanan ini', 'besok'] },
    { id: 'EXP-PRO-007', task: '优先完成这个订单。', chinese: '优先完成这个订单。', indonesian: 'Selesaikan pesanan ini dulu ya.', explanation: '交期紧的订单需要优先处理。', harvest: ['selesaikan', 'pesanan ini', 'dulu'] },
    { id: 'EXP-PRO-008', task: '把今天的产量报给我。', chinese: '把今天的产量报给我。', indonesian: 'Laporkan produksi hari ini ke saya ya.', explanation: '班组结束时汇报当天实际产量。', harvest: ['laporkan', 'produksi hari ini', 'ke saya'] },
  ],
  warehouse: [
    { id: 'EXP-WHS-001', task: '查一下这个材料的库存。', chinese: '查一下这个材料的库存。', indonesian: 'Cek stok bahan ini ya.', explanation: '发料或采购前先确认材料库存。', harvest: ['cek stok', 'bahan ini', 'ya'] },
    { id: 'EXP-WHS-002', task: '这批材料已经到了。', chinese: '这批材料已经到了。', indonesian: 'Bahan batch ini sudah datang.', explanation: '仓库通知相关人员材料已到厂。', harvest: ['bahan', 'batch ini', 'sudah datang'] },
    { id: 'EXP-WHS-003', task: '把坏掉的材料分开。', chinese: '把坏掉的材料分开。', indonesian: 'Pisahkan bahan yang rusak ya.', explanation: '避免受损材料被误发到生产线。', harvest: ['pisahkan', 'bahan', 'yang rusak'] },
    { id: 'EXP-WHS-004', task: '把材料送到生产线。', chinese: '把材料送到生产线。', indonesian: 'Kirim bahan ke jalur produksi ya.', explanation: '生产线需要材料时，仓库安排发料。', harvest: ['kirim bahan', 'ke jalur produksi', 'produksi'] },
    { id: 'EXP-WHS-005', task: '这个货放在哪个位置？', chinese: '这个货放在哪个位置？', indonesian: 'Barang ini ditaruh di lokasi mana?', explanation: '入库时确认货物的存放位置。', harvest: ['barang ini', 'ditaruh', 'lokasi mana'] },
    { id: 'EXP-WHS-006', task: '今天盘点库存。', chinese: '今天盘点库存。', indonesian: 'Hari ini hitung stok ya.', explanation: '仓库按计划核对实际库存。', harvest: ['hari ini', 'hitung stok', 'stok'] },
    { id: 'EXP-WHS-007', task: '这个箱子要贴标签。', chinese: '这个箱子要贴标签。', indonesian: 'Kotak ini harus dikasih label.', explanation: '货物入库或出库前需要识别标签。', harvest: ['kotak ini', 'harus', 'dikasih label'] },
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
    { id: 'EXP-PUR-002', task: '问一下供应商什么时候送到。', chinese: '问一下供应商什么时候送到。', indonesian: 'Tanya ke pemasok, kapan kirim ya.', explanation: '材料未到时，采购向供应商确认到货时间。', harvest: ['tanya ke pemasok', 'kapan kirim', 'ya'] },
    { id: 'EXP-PUR-003', task: '订购这个材料。', chinese: '订购这个材料。', indonesian: 'Pesan bahan ini ya.', explanation: '确认需求后向供应商下采购单。', harvest: ['pesan', 'bahan ini', 'ya'] },
    { id: 'EXP-PUR-004', task: '供应商送晚了。', chinese: '供应商送晚了。', indonesian: 'Pemasoknya terlambat.', explanation: '供应商延误会影响材料供应。', harvest: ['pemasok', 'terlambat', 'pemasoknya'] },
    { id: 'EXP-PUR-005', task: '确认材料规格。', chinese: '确认材料规格。', indonesian: 'Konfirmasi spesifikasi bahannya ya.', explanation: '下单前确认规格，避免买错材料。', harvest: ['konfirmasi', 'spesifikasi bahan', 'ya'] },
    { id: 'EXP-PUR-006', task: '这个材料要买多少？', chinese: '这个材料要买多少？', indonesian: 'Bahan ini beli berapa banyak?', explanation: '采购根据生产计划确认采购数量。', harvest: ['bahan ini', 'beli', 'berapa banyak'] },
    { id: 'EXP-PUR-007', task: '这个报价可以吗？', chinese: '这个报价可以吗？', indonesian: 'Penawaran ini bisa dipakai?', explanation: '采购比较报价后确认是否采用。', harvest: ['penawaran ini', 'bisa', 'dipakai'] },
    { id: 'EXP-PUR-008', task: '请供应商今天送货。', chinese: '请供应商今天送货。', indonesian: 'Minta pemasok kirim hari ini ya.', explanation: '生产紧急时要求供应商当天送达。', harvest: ['minta pemasok', 'kirim', 'hari ini'] },
  ],
  operator: [
    { id: 'EXP-OPR-001', task: '开始开机器。', chinese: '开始开机器。', indonesian: 'Nyalakan mesinnya ya.', explanation: '操作员在确认安全后启动设备。', harvest: ['nyalakan', 'mesinnya', 'ya'] },
    { id: 'EXP-OPR-002', task: '操作机器要戴手套。', chinese: '操作机器要戴手套。', indonesian: 'Kalau pakai mesin, harus pakai sarung tangan.', explanation: '操作设备时使用手套保护双手。', harvest: ['pakai mesin', 'harus pakai', 'sarung tangan'] },
    { id: 'EXP-OPR-003', task: '机器不正常。', chinese: '机器不正常。', indonesian: 'Mesinnya tidak normal.', explanation: '操作员发现设备异常时及时报告。', harvest: ['mesinnya', 'tidak normal', 'normal'] },
    { id: 'EXP-OPR-004', task: '今天做这个产品。', chinese: '今天做这个产品。', indonesian: 'Hari ini buat produk ini ya.', explanation: '班组按当天安排生产指定产品。', harvest: ['hari ini', 'buat', 'produk ini'] },
    { id: 'EXP-OPR-005', task: '数一下做了多少件。', chinese: '数一下做了多少件。', indonesian: 'Tolong hitung, sudah buat berapa pcs ya.', explanation: '操作员记录当前完成数量。', harvest: ['tolong hitung', 'buat berapa', 'pcs'] },
    { id: 'EXP-OPR-006', task: '先关掉机器。', chinese: '先关掉机器。', indonesian: 'Matikan mesinnya dulu ya.', explanation: '异常或换线前按要求关闭设备。', harvest: ['matikan', 'mesinnya', 'dulu'] },
    { id: 'EXP-OPR-007', task: '请叫一下主管。', chinese: '请叫一下主管。', indonesian: 'Tolong panggil supervisornya ya.', explanation: '现场需要主管协助时使用。', harvest: ['tolong panggil', 'supervisornya', 'ya'] },
    { id: 'EXP-OPR-008', task: '整理一下工作区域。', chinese: '整理一下工作区域。', indonesian: 'Rapikan area kerja ya.', explanation: '结束工作前保持操作区域整洁。', harvest: ['rapikan', 'area kerja', 'ya'] },
  ],
};

factoryRoleExperiences.production.push(
  { id: 'EXP-PRO-009', task: '这个订单很急，先做。', chinese: '这个订单很急，先做。', indonesian: 'Pesanan ini mendesak, kerjakan dulu ya.', explanation: '遇到紧急订单时，明确要求生产线优先处理。', harvest: ['pesanan ini（这个订单）', 'mendesak（紧急）', 'kerjakan dulu（先做）'] },
  { id: 'EXP-PRO-010', task: '机器停了多久？', chinese: '机器停了多久？', indonesian: 'Mesinnya berhenti berapa lama?', explanation: '发生停机后，先确认停机时长以评估对产量的影响。', harvest: ['mesinnya（机器）', 'berhenti（停止）', 'berapa lama（多久）'] },
  { id: 'EXP-PRO-011', task: '今天的产量报给我。', chinese: '今天的产量报给我。', indonesian: 'Laporkan hasil produksi hari ini ya.', explanation: '每天收工前汇报实际完成的产量。', harvest: ['laporkan（报告）', 'hasil produksi（生产结果）', 'hari ini（今天）'] },
);
factoryRoleExperiences.warehouse.push(
  { id: 'EXP-WHS-009', task: '这批材料收到了吗？', chinese: '这批材料收到了吗？', indonesian: 'Bahan ini sudah diterima?', explanation: '材料到厂后，仓库确认是否已完成收货。', harvest: ['bahan ini（这批材料）', 'sudah diterima（已收到）', 'ya（语气词）'] },
  { id: 'EXP-WHS-010', task: '这个材料库存不够。', chinese: '这个材料库存不够。', indonesian: 'Stok bahan ini tidak cukup.', explanation: '库存不足时，仓库及时通知相关人员。', harvest: ['stok（库存）', 'bahan ini（这个材料）', 'tidak cukup（不够）'] },
  { id: 'EXP-WHS-011', task: '出货前把货准备好。', chinese: '出货前把货准备好。', indonesian: 'Siapkan barang sebelum kirim ya.', explanation: '发货前确认货物、包装和单据都已备好。', harvest: ['siapkan barang（准备货物）', 'sebelum（之前）', 'kirim（发货）'] },
);
factoryRoleExperiences.qc.push(
  { id: 'EXP-QC-009', task: '不良率是多少？', chinese: '不良率是多少？', indonesian: 'Persentase barang cacatnya berapa?', explanation: 'QC 用不良率判断当天品质是否异常。', harvest: ['persentase（百分比）', 'barang cacat（不良品）', 'berapa（多少）'] },
  { id: 'EXP-QC-010', task: '这个样品批准了吗？', chinese: '这个样品批准了吗？', indonesian: 'Sampel ini sudah disetujui?', explanation: '量产前先确认样品是否获得批准。', harvest: ['sampel ini（这个样品）', 'sudah disetujui（已批准）', 'ya（语气词）'] },
  { id: 'EXP-QC-011', task: '这个产品要重新检查。', chinese: '这个产品要重新检查。', indonesian: 'Produk ini perlu diperiksa ulang.', explanation: '品质异常或返工后，安排复检确认。', harvest: ['produk ini（这个产品）', 'perlu（需要）', 'diperiksa ulang（重新检查）'] },
);
factoryRoleExperiences.purchasing.push(
  { id: 'EXP-PUR-009', task: '供应商几点送到？', chinese: '供应商几点送到？', indonesian: 'Pemasok datang jam berapa?', explanation: '采购确认供应商的具体到货时间。', harvest: ['pemasok（供应商）', 'datang（到达）', 'jam berapa（几点）'] },
  { id: 'EXP-PUR-010', task: '确认一下这个材料的价格。', chinese: '确认一下这个材料的价格。', indonesian: 'Konfirmasi harga bahan ini ya.', explanation: '下单前再次确认材料价格，避免预算偏差。', harvest: ['konfirmasi（确认）', 'harga（价格）', 'bahan ini（这个材料）'] },
  { id: 'EXP-PUR-011', task: '这个材料要紧急采购。', chinese: '这个材料要紧急采购。', indonesian: 'Bahan ini harus dibeli segera.', explanation: '缺料可能停线时，采购需要立即处理。', harvest: ['bahan ini（这个材料）', 'harus（必须）', 'segera（马上）'] },
);
factoryRoleExperiences.operator.push(
  { id: 'EXP-OPR-009', task: '把机器调慢一点。', chinese: '把机器调慢一点。', indonesian: 'Atur mesin lebih pelan ya.', explanation: '调整设备速度时，给出清晰直接的操作指令。', harvest: ['atur mesin（调整机器）', 'lebih pelan（慢一点）', 'ya（语气词）'] },
  { id: 'EXP-OPR-010', task: '换一下这个材料。', chinese: '换一下这个材料。', indonesian: 'Ganti bahan ini ya.', explanation: '需要切换原材料时使用。', harvest: ['ganti（更换）', 'bahan ini（这个材料）', 'ya（语气词）'] },
  { id: 'EXP-OPR-011', task: '机器有问题，叫主管来。', chinese: '机器有问题，叫主管来。', indonesian: 'Mesinnya bermasalah, panggil supervisornya ya.', explanation: '操作员发现机器异常时，立即请主管到现场处理。', harvest: ['mesinnya bermasalah（机器有问题）', 'panggil（叫来）', 'supervisornya（主管）'] },
);

factoryRoleExperiences.production.push(
  { id: 'EXP-PRO-012', task: '这个订单的优先级改了。', chinese: '这个订单的优先级改了。', indonesian: 'Prioritas pesanan ini berubah.', explanation: '客户交期变化后，及时调整订单的生产顺序。', harvest: ['prioritas（优先级）', 'pesanan ini（这个订单）', 'berubah（改变）'] },
  { id: 'EXP-PRO-013', task: '上午前完成这批。', chinese: '上午前完成这批。', indonesian: 'Selesaikan batch ini sebelum siang ya.', explanation: '有明确完成时限时，用于提醒生产班组。', harvest: ['selesaikan（完成）', 'batch ini（这批）', 'sebelum siang（中午前）'] },
  { id: 'EXP-PRO-014', task: '产量不够，增加一台机器。', chinese: '产量不够，增加一台机器。', indonesian: 'Produksinya kurang, tambah satu mesin ya.', explanation: '产量落后时，通过增加设备来补足产能。', harvest: ['produksinya kurang（产量不够）', 'tambah（增加）', 'satu mesin（一台机器）'] },
  { id: 'EXP-PRO-015', task: '先确认原材料够不够。', chinese: '先确认原材料够不够。', indonesian: 'Cek dulu bahan bakunya cukup atau tidak.', explanation: '开工前先确认原材料，避免生产中断。', harvest: ['cek dulu（先检查）', 'bahan baku（原材料）', 'cukup atau tidak（够不够）'] },
);
factoryRoleExperiences.warehouse.push(
  { id: 'EXP-WHS-012', task: '卸货前检查数量。', chinese: '卸货前检查数量。', indonesian: 'Cek jumlahnya sebelum bongkar ya.', explanation: '卸货前核对数量，避免收货差异。', harvest: ['cek jumlahnya（检查数量）', 'sebelum（之前）', 'bongkar（卸货）'] },
  { id: 'EXP-WHS-013', task: '这个托盘放到A区。', chinese: '这个托盘放到A区。', indonesian: 'Taruh palet ini di area A ya.', explanation: '入库时明确托盘的存放区域。', harvest: ['taruh（放）', 'palet ini（这个托盘）', 'area A（A区）'] },
  { id: 'EXP-WHS-014', task: '把发货单交给司机。', chinese: '把发货单交给司机。', indonesian: 'Berikan surat jalan ke sopir ya.', explanation: '车辆出发前，把随货单据交给司机。', harvest: ['berikan（交给）', 'surat jalan（发货单）', 'sopir（司机）'] },
  { id: 'EXP-WHS-015', task: '包装破了，先不要出货。', chinese: '包装破了，先不要出货。', indonesian: 'Kemasannya rusak, jangan dikirim dulu ya.', explanation: '发现包装破损时，先暂停发货并处理。', harvest: ['kemasannya rusak（包装破了）', 'jangan dikirim（不要发货）', 'dulu（先）'] },
);
factoryRoleExperiences.qc.push(
  { id: 'EXP-QC-012', task: '这个问题又出现了。', chinese: '这个问题又出现了。', indonesian: 'Masalah ini muncul lagi.', explanation: '同一品质问题再次出现时，需要记录并追查原因。', harvest: ['masalah ini（这个问题）', 'muncul lagi（又出现）', 'lagi（再次）'] },
  { id: 'EXP-QC-013', task: '把样品给客户确认。', chinese: '把样品给客户确认。', indonesian: 'Kirim sampel ini ke pelanggan untuk disetujui ya.', explanation: '量产前将样品发给客户确认。', harvest: ['kirim sampel（发送样品）', 'pelanggan（客户）', 'disetujui（被确认）'] },
  { id: 'EXP-QC-014', task: '返工后再检查一次。', chinese: '返工后再检查一次。', indonesian: 'Setelah dikerjakan ulang, periksa lagi ya.', explanation: '返工完成后重新检查，确保问题已解决。', harvest: ['setelah（之后）', 'dikerjakan ulang（返工）', 'periksa lagi（再检查）'] },
  { id: 'EXP-QC-015', task: '今天的品质报告发给我。', chinese: '今天的品质报告发给我。', indonesian: 'Kirim laporan mutu hari ini ke saya ya.', explanation: '每日将品质检查结果汇报给负责人。', harvest: ['kirim laporan（发送报告）', 'laporan mutu（品质报告）', 'hari ini（今天）'] },
);
factoryRoleExperiences.purchasing.push(
  { id: 'EXP-PUR-012', task: '采购单今天发出去。', chinese: '采购单今天发出去。', indonesian: 'Kirim pesanan pembelian hari ini ya.', explanation: '采购需求确认后，当天将采购单发给供应商。', harvest: ['kirim（发送）', 'pesanan pembelian（采购单）', 'hari ini（今天）'] },
  { id: 'EXP-PUR-013', task: '供应商说什么时候到？', chinese: '供应商说什么时候到？', indonesian: 'Pemasok bilang kapan datang?', explanation: '材料延误时，询问供应商承诺的到货时间。', harvest: ['pemasok（供应商）', 'bilang（说）', 'kapan datang（什么时候到）'] },
  { id: 'EXP-PUR-014', task: '这个材料数量要改。', chinese: '这个材料数量要改。', indonesian: 'Jumlah bahan ini perlu diubah.', explanation: '生产计划变化后，及时更正采购数量。', harvest: ['jumlah（数量）', 'bahan ini（这个材料）', 'diubah（更改）'] },
  { id: 'EXP-PUR-015', task: '找一个新的供应商。', chinese: '找一个新的供应商。', indonesian: 'Cari pemasok baru ya.', explanation: '现有供应不稳定时，寻找新的供应来源。', harvest: ['cari（寻找）', 'pemasok baru（新供应商）', 'baru（新的）'] },
);
factoryRoleExperiences.operator.push(
  { id: 'EXP-OPR-012', task: '换材料前先停机器。', chinese: '换材料前先停机器。', indonesian: 'Matikan mesin dulu sebelum ganti bahan ya.', explanation: '更换材料前先按流程关机，避免安全和品质问题。', harvest: ['matikan mesin（关机器）', 'sebelum（之前）', 'ganti bahan（换材料）'] },
  { id: 'EXP-OPR-013', task: '机器设置不对。', chinese: '机器设置不对。', indonesian: 'Setelan mesinnya tidak tepat.', explanation: '发现设备参数设置异常时，及时报告。', harvest: ['setelan（设置）', 'mesinnya（机器）', 'tidak tepat（不对）'] },
  { id: 'EXP-OPR-014', task: '今天做完多少件，告诉主管。', chinese: '今天做完多少件，告诉主管。', indonesian: 'Kalau sudah tahu jumlah hari ini, kabari supervisor ya.', explanation: '完成数量确认后，及时向主管汇报。', harvest: ['jumlah hari ini（今天的数量）', 'kabari（通知）', 'supervisor（主管）'] },
  { id: 'EXP-OPR-015', task: '下班前清理机器。', chinese: '下班前清理机器。', indonesian: 'Bersihkan mesin sebelum pulang ya.', explanation: '下班前清洁设备，保持基本现场管理。', harvest: ['bersihkan mesin（清理机器）', 'sebelum pulang（下班前）', 'pulang（下班、回家）'] },
);

const additionalFactoryRoleExperiences: Record<'logistics' | 'shipping' | 'export' | 'customerService', ModuleExperience[]> = {
  logistics: [
    { id: 'EXP-LOG-001', task: '今天安排哪辆车送货？', chinese: '今天安排哪辆车送货？', indonesian: 'Hari ini pakai truk yang mana untuk kirim?', explanation: '安排当天配送前，确认使用哪一辆货车。', harvest: ['hari ini（今天）', 'truk（货车）', 'untuk kirim（用于送货）'] },
    { id: 'EXP-LOG-002', task: '送货地址再确认一下。', chinese: '送货地址再确认一下。', indonesian: 'Konfirmasi alamat kirimnya lagi ya.', explanation: '车辆出发前再次确认送货地址。', harvest: ['konfirmasi（确认）', 'alamat kirim（送货地址）', 'lagi（再次）'] },
    { id: 'EXP-LOG-003', task: '司机已经出发了吗？', chinese: '司机已经出发了吗？', indonesian: 'Sopirnya sudah berangkat?', explanation: '确认配送车辆是否已按计划出发。', harvest: ['sopirnya（司机）', 'sudah berangkat（已经出发）', 'ya（语气词）'] },
    { id: 'EXP-LOG-004', task: '货到了告诉我。', chinese: '货到了告诉我。', indonesian: 'Kalau barangnya sudah sampai, kabari saya ya.', explanation: '交付完成后，要求物流人员及时回报。', harvest: ['barang（货物）', 'sudah sampai（已经到达）', 'kabari saya（通知我）'] },
    { id: 'EXP-LOG-005', task: '这票货今天必须送到。', chinese: '这票货今天必须送到。', indonesian: 'Barang ini harus sampai hari ini.', explanation: '交期紧急时，明确当天必须完成交付。', harvest: ['barang ini（这票货）', 'harus sampai（必须送到）', 'hari ini（今天）'] },
    { id: 'EXP-LOG-006', task: '把签收单发给我。', chinese: '把签收单发给我。', indonesian: 'Kirim bukti terimanya ke saya ya.', explanation: '客户签收后，收集并发送签收证明。', harvest: ['kirim（发送）', 'bukti terima（签收证明）', 'ke saya（给我）'] },
  ],
  shipping: [
    { id: 'EXP-SHP-001', task: '今天有柜要装。', chinese: '今天有柜要装。', indonesian: 'Hari ini ada kontainer yang harus dimuat.', explanation: '有集装箱装柜安排时，提前确认现场资源。', harvest: ['kontainer（集装箱）', 'harus（必须）', 'dimuat（装载）'] },
    { id: 'EXP-SHP-002', task: '柜子几点到？', chinese: '柜子几点到？', indonesian: 'Kontainernya datang jam berapa?', explanation: '装柜前确认集装箱到厂时间。', harvest: ['kontainernya（集装箱）', 'datang（到达）', 'jam berapa（几点）'] },
    { id: 'EXP-SHP-003', task: '装柜前检查封条。', chinese: '装柜前检查封条。', indonesian: 'Cek segelnya sebelum muat ya.', explanation: '装柜前检查封条，避免后续运输争议。', harvest: ['cek（检查）', 'segel（封条）', 'sebelum muat（装柜前）'] },
    { id: 'EXP-SHP-004', task: '船期改了。', chinese: '船期改了。', indonesian: 'Jadwal kapalnya berubah.', explanation: '船期发生变化时，及时同步相关部门。', harvest: ['jadwal kapal（船期）', 'berubah（改变）', 'kapalnya（船）'] },
    { id: 'EXP-SHP-005', task: '订舱确认了吗？', chinese: '订舱确认了吗？', indonesian: 'Pemesanan kapalnya sudah dikonfirmasi?', explanation: '出货前确认订舱是否完成。', harvest: ['pemesanan kapal（订舱）', 'sudah dikonfirmasi（已确认）', 'ya（语气词）'] },
    { id: 'EXP-SHP-006', task: '货物已经进港。', chinese: '货物已经进港。', indonesian: 'Barangnya sudah masuk pelabuhan.', explanation: '货物进入港口后，继续跟进装船进度。', harvest: ['barang（货物）', 'sudah masuk（已经进入）', 'pelabuhan（港口）'] },
  ],
  export: [
    { id: 'EXP-EXP-001', task: '出口文件准备好了吗？', chinese: '出口文件准备好了吗？', indonesian: 'Dokumen ekspornya sudah siap?', explanation: '报关与出运前确认出口文件是否齐全。', harvest: ['dokumen ekspor（出口文件）', 'sudah siap（已经准备好）', 'ya（语气词）'] },
    { id: 'EXP-EXP-002', task: '发票和装箱单发给我。', chinese: '发票和装箱单发给我。', indonesian: 'Kirim faktur dan daftar kemasnya ke saya ya.', explanation: '出口文件完成后，发送发票和装箱单给负责人。', harvest: ['kirim（发送）', 'faktur（发票）', 'daftar kemas（装箱单）'] },
    { id: 'EXP-EXP-003', task: '报关还在处理吗？', chinese: '报关还在处理吗？', indonesian: 'Bea cukainya masih diproses?', explanation: '确认海关申报是否仍在处理中。', harvest: ['bea cukai（海关）', 'masih（还）', 'diproses（处理中）'] },
    { id: 'EXP-EXP-004', task: '原产地证什么时候好？', chinese: '原产地证什么时候好？', indonesian: 'Surat asal barangnya kapan selesai?', explanation: '出口前确认原产地证的完成时间。', harvest: ['surat asal barang（原产地证）', 'kapan（什么时候）', 'selesai（完成）'] },
    { id: 'EXP-EXP-005', task: '把提单副本发给客户。', chinese: '把提单副本发给客户。', indonesian: 'Kirim salinan konosemen ke pelanggan ya.', explanation: '提单完成后，向客户发送副本以便安排收货。', harvest: ['kirim（发送）', 'salinan konosemen（提单副本）', 'pelanggan（客户）'] },
    { id: 'EXP-EXP-006', task: '预计到港时间是什么时候？', chinese: '预计到港时间是什么时候？', indonesian: 'Perkiraan sampai pelabuhan kapan?', explanation: '出运后确认预计到达目的港的时间。', harvest: ['perkiraan（预计）', 'sampai pelabuhan（到港）', 'kapan（什么时候）'] },
  ],
  customerService: [
    { id: 'EXP-CS-001', task: '客户有新的反馈吗？', chinese: '客户有新的反馈吗？', indonesian: 'Ada masukan baru dari pelanggan?', explanation: '交付后主动确认客户是否有新的意见。', harvest: ['masukan baru（新反馈）', 'dari pelanggan（来自客户）', 'ada（有）'] },
    { id: 'EXP-CS-002', task: '客户投诉什么？', chinese: '客户投诉什么？', indonesian: 'Pelanggan mengeluhkan apa?', explanation: '收到投诉后先明确客户反映的具体问题。', harvest: ['pelanggan（客户）', 'mengeluhkan（投诉）', 'apa（什么）'] },
    { id: 'EXP-CS-003', task: '告诉客户我们会晚一天送到。', chinese: '告诉客户我们会晚一天送到。', indonesian: 'Bilang ke pelanggan, barangnya terlambat satu hari ya.', explanation: '交期延误时，尽早向客户说明具体延误时间。', harvest: ['bilang ke pelanggan（告诉客户）', 'terlambat（延误）', 'satu hari（一天）'] },
    { id: 'EXP-CS-004', task: '客户已经收到货了吗？', chinese: '客户已经收到货了吗？', indonesian: 'Pelanggan sudah menerima barangnya?', explanation: '交付后确认客户是否已实际收到货物。', harvest: ['pelanggan（客户）', 'sudah menerima（已经收到）', 'barang（货物）'] },
    { id: 'EXP-CS-005', task: '把报价发给客户。', chinese: '把报价发给客户。', indonesian: 'Kirim penawaran ke pelanggan ya.', explanation: '报价确认后及时发送给客户。', harvest: ['kirim（发送）', 'penawaran（报价）', 'pelanggan（客户）'] },
    { id: 'EXP-CS-006', task: '客户什么时候下新订单？', chinese: '客户什么时候下新订单？', indonesian: 'Pelanggan kapan pesan lagi?', explanation: '跟进客户下一次采购计划。', harvest: ['pelanggan（客户）', 'kapan（什么时候）', 'pesan lagi（再次下单）'] },
  ],
};

for (const experiences of [...Object.values(factoryRoleExperiences), ...Object.values(additionalFactoryRoleExperiences)]) {
  for (const experience of experiences) experience.harvest = formatHarvest(experience.harvest, experience.indonesian);
}

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
  ...additionalFactoryRoleExperiences,
  driver: getDriverExperiences(),
  nanny: getNannyExperiences(),
};

export const moduleMeta = {
  production: { indonesian: 'Produksi', chinese: '生产', chatRole: 'factory' },
  warehouse: { indonesian: 'Gudang', chinese: '仓库', chatRole: 'factory' },
  qc: { indonesian: 'QC', chinese: '品质管理', chatRole: 'factory' },
  purchasing: { indonesian: 'Purchasing', chinese: '采购', chatRole: 'factory' },
  operator: { indonesian: 'Operator', chinese: '操作员', chatRole: 'factory' },
  logistics: { indonesian: 'Logistik', chinese: '物流', chatRole: 'factory' },
  shipping: { indonesian: 'Pengiriman', chinese: '运输与发货', chatRole: 'factory' },
  export: { indonesian: 'Ekspor', chinese: '出口', chatRole: 'factory' },
  customerService: { indonesian: 'Layanan Pelanggan', chinese: '客户服务', chatRole: 'factory' },
  driver: { indonesian: 'Sopir', chinese: '司机', chatRole: 'driver' },
  nanny: { indonesian: 'ART', chinese: '保姆', chatRole: 'nanny' },
} as const;
