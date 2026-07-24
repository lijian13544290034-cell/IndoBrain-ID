export type FactorySupplement = {
  explanation: string;
  harvest: string[];
};

export const factorySupplemental: Record<string, FactorySupplement> = {
  'EXP-FAC-021': { explanation: '确认当天到岗人数和请假情况，及时判断是否会影响人员安排。', harvest: ['masuk（来上班）', 'izin（请假）', 'orang（人）'] },
  'EXP-FAC-022': { explanation: '确认机器是否正常，以及维修是否会影响当天生产。', harvest: ['mesin（机器）', 'normal（正常）', 'diperbaiki（维修中）'] },
  'EXP-FAC-023': { explanation: '确认当天目标能否完成，避免影响交货时间。', harvest: ['sasaran（目标）', 'tercapai（达成）', 'terlambat（延误）'] },
  'EXP-FAC-024': { explanation: '发现加急任务时先确认优先级，再安排先做哪一单。', harvest: ['pesanan（订单）', 'mendesak（紧急）', 'dikerjakan dulu（先做）'] },
  'EXP-FAC-025': { explanation: '原材料未到时，立即确认供应商的到货承诺。', harvest: ['bahan baku（原材料）', 'pemasok（供应商）', 'datang（到货）'] },
  'EXP-FAC-026': { explanation: '确认库存可支撑几天，并在不足时及时补货。', harvest: ['stok（库存）', 'cukup（足够）', 'tambah stok（补货）'] },
  'EXP-FAC-027': { explanation: '确认是否需要加班，并及时通知相关员工。', harvest: ['lembur（加班）', 'perlu（需要）', 'kasih tahu（通知）'] },
  'EXP-FAC-028': { explanation: '生产变慢时先问原因，再确认机器是否已恢复。', harvest: ['lebih lambat（更慢）', 'sempat berhenti（曾停机）', 'normal lagi（恢复正常）'] },
  'EXP-FAC-029': { explanation: '提前确认明天的生产任务和原材料准备情况。', harvest: ['besok（明天）', 'pesanan（订单）', 'siap semua（全部准备好）'] },
  'EXP-FAC-030': { explanation: '每天收尾时确认整体情况，以及是否需要老板处理。', harvest: ['secara keseluruhan（整体）', 'lancar（顺利）', 'perlu saya bantu（需要我处理吗）'] },
  'EXP-FAC-031': { explanation: '用当天与昨天的效率对比，确认改善是否有效。', harvest: ['efisiensi（效率）', 'naik（提高）', 'dibanding（相比）'] },
  'EXP-FAC-032': { explanation: '确认成本是否正常，并持续关注原材料成本。', harvest: ['biaya（成本）', 'normal（正常）', 'pantau（关注）'] },
  'EXP-FAC-033': { explanation: '出现不良品时，确认原因是否已经找到并处理。', harvest: ['barang cacat（不良品）', 'penyebab（原因）', 'ditangani（已处理）'] },
  'EXP-FAC-034': { explanation: '每日确认安全情况，确保现场没有安全异常。', harvest: ['keselamatan（安全）', 'masalah（问题）', 'tetap dijaga（继续保持）'] },
  'EXP-FAC-035': { explanation: '确认生产现场是否整洁，维持基本现场管理。', harvest: ['area produksi（生产区域）', 'rapi（整洁）', 'sudah rapi（已整理好）'] },
  'EXP-FAC-036': { explanation: '根据客户紧急程度，优先安排最重要的任务。', harvest: ['pelanggan（客户）', 'mendesak（紧急）', 'prioritaskan（优先安排）'] },
  'EXP-FAC-037': { explanation: '定期观察供应商的送货表现，避免影响材料供应。', harvest: ['pemasok（供应商）', 'pengiriman（送货）', 'tepat waktu（准时）'] },
  'EXP-FAC-038': { explanation: '记录当天的改善点，持续提升包装或生产效率。', harvest: ['perbaikan（改善）', 'pengemasan（包装）', 'ditingkatkan（提升）'] },
  'EXP-FAC-039': { explanation: '晨会后确认员工是否理解当天目标和安排。', harvest: ['pengarahan（晨会说明）', 'paham（理解）', 'sasaran（目标）'] },
  'EXP-FAC-040': { explanation: '明确当天最重要的管理优先级，并要求团队按此执行。', harvest: ['prioritas utama（首要重点）', 'pastikan（确保）', 'jalankan（执行）'] },
  'EXP-FAC-041': { explanation: '客户有投诉时，要求持续跟进直到问题有结果。', harvest: ['keluhan（投诉）', 'ditindaklanjuti（跟进处理）', 'belum ada（暂时没有）'] },
  'EXP-FAC-042': { explanation: '品质问题改善后，仍需避免同类问题再次发生。', harvest: ['mutu（品质）', 'diperbaiki（已改善）', 'terulang lagi（再次发生）'] },
  'EXP-FAC-043': { explanation: '按月检查成本是否符合目标，并持续控制支出。', harvest: ['biaya（成本）', 'sesuai sasaran（符合目标）', 'kontrol（控制）'] },
  'EXP-FAC-044': { explanation: '确认本月目标能否达成，及时判断是否需要调整。', harvest: ['sasaran bulanan（月度目标）', 'tercapai（达成）', 'optimis（有信心）'] },
  'EXP-FAC-045': { explanation: '通过 KPI 对比确认本月表现是否优于上月。', harvest: ['KPI（关键指标）', 'lebih baik（更好）', 'bulan lalu（上个月）'] },
  'EXP-FAC-046': { explanation: '新员工完成培训后，安排有经验的员工继续带领。', harvest: ['operator baru（新员工）', 'dilatih（培训）', 'berpengalaman（有经验）'] },
  'EXP-FAC-047': { explanation: '确认设备保养完成，降低机器异常和停机风险。', harvest: ['dirawat（保养）', 'mesin（机器）', 'tetap dijaga（继续保持）'] },
  'EXP-FAC-048': { explanation: '提前明确下月重点，尽早准备产能和资源。', harvest: ['fokus（重点）', 'bulan depan（下个月）', 'persiapkan（提前准备）'] },
  'EXP-FAC-049': { explanation: '月会前确认时间，并提前准备需要使用的数据。', harvest: ['rapat bulanan（月会）', 'Senin depan（下周一）', 'data（资料）'] },
  'EXP-FAC-050': { explanation: '每日管理闭环时，确认没有遗留问题并安排次日复查。', harvest: ['berjalan dengan baik（运行顺利）', 'cek lagi（再次确认）', 'besok pagi（明早）'] },
};
