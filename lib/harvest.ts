const meanings: Record<string, string> = {
  'hari ini': '今天', 'besok': '明天', 'pagi': '早上', 'sore': '下午', 'malam ini': '今晚', 'dulu': '先', 'ya': '语气词', 'saja': '就、即可',
  'jemput': '接人', 'tolong jemput': '请接', 'tunggu': '等', 'di sini': '在这里', 'di bawah': '在楼下', 'sudah sampai': '已经到了', 'sampai': '到达',
  'bank': '银行', 'kantor': '公司、办公室', 'klien': '客户', 'jalan tol': '收费公路', 'macet': '堵车', 'bensin': '汽油', 'isi bensin': '加油', 'pom bensin': '加油站',
  'koper': '行李箱', 'bandara': '机场', 'terminal': '航站楼', 'lobi': '大堂', 'parkir': '停车', 'mobil': '车', 'cuci mobil': '洗车',
  'masak': '做饭', 'makan malam': '晚饭', 'cabai': '辣椒', 'garam': '盐', 'sayur': '蔬菜', 'susu': '牛奶', 'telur': '鸡蛋', 'gas': '煤气',
  'bersihkan': '清洁', 'buang sampah': '倒垃圾', 'cuci': '洗', 'sprei': '床单', 'jemput anak': '接孩子', 'anak': '孩子', 'pakaian': '衣服', 'seragam': '制服',
  'tamu': '客人', 'datang': '来、到达', 'belanja': '购物', 'stok': '库存', 'laundry': '洗衣', 'tidur': '睡觉', 'demam': '发烧', 'laporkan': '报告',
  'produksi': '生产', 'pesanan': '订单', 'jalur produksi': '生产线', 'sasaran': '目标', 'masih kurang': '还差', 'lembur': '加班', 'jadwalkan': '安排时间',
  'selesaikan': '完成', 'laporkan produksi': '报告产量', 'mesin': '机器', 'berhenti': '停止', 'lebih lambat': '更慢', 'perlu': '需要',
  'cek stok': '查库存', 'bahan': '材料', 'bahan baku': '原材料', 'batch': '批次', 'yang rusak': '损坏的', 'pisahkan': '分开',
  'kirim bahan': '发材料', 'lokasi': '位置', 'hitung stok': '盘点库存', 'kotak': '箱子', 'label': '标签', 'barang': '货物', 'sudah siap': '已经准备好',
  'periksa': '检查', 'produk': '产品', 'barang cacat': '不良品', 'dikerjakan ulang': '返工', 'sampel': '样品', 'mutu': '品质',
  'hasil pemeriksaan': '检查结果', 'standar mutu': '品质标准', 'pelanggan': '客户', 'pemasok': '供应商', 'kirim': '送货、发货', 'pesan': '订购',
  'terlambat': '延误', 'spesifikasi': '规格', 'penawaran': '报价', 'nyalakan': '开启', 'matikan': '关闭', 'sarung tangan': '手套',
  'tidak normal': '不正常', 'buat': '做、生产', 'hitung': '数、计算', 'pcs': '件', 'panggil': '叫来', 'supervisor': '主管', 'rapikan': '整理', 'area kerja': '工作区域',
  'prioritas': '优先级', 'mendesak': '紧急', 'ubah': '更改', 'jumlah': '数量', 'keluar': '出库、出货', 'muat': '装载', 'kontainer': '集装箱',
  'persetujuan': '批准', 'periksa ulang': '复检', 'perbaiki': '修理、改善', 'laporan mutu': '品质报告', 'siapkan': '准备', 'terima': '接收',
  bagaimana: '怎么样', basement: '地下停车场', belanjaan: '买的东西', belanjaannya: '买的东西', berasnya: '大米', dapur: '厨房',
  'dari mana': '从哪里', dibuat: '被做成', 'dikasih label': '贴上标签', gaji: '工资', 'kami minggu': '我们这周', kita: '我们',
  'kita sudah': '我们已经', konfirmasi: '确认', makanan: '食物', mal: '商场', mandi: '洗澡', mesinnya: '机器', pemasoknya: '供应商',
  pr: '作业', sampelnya: '样品', sarapannya: '早餐', 'sarapannya dibuat': '早餐做得', 'satu tabung': '一罐', sekali: '非常', sudah: '已经',
  supervisornya: '主管', tamunya: '客人', 'tamunya sudah': '客人已经', terulang: '再次发生',
};

const wordMeanings: Record<string, string> = {
  ada: '有', agak: '有点', aja: '就', anak: '孩子', antar: '送', apa: '什么', awal: '早', ayamnya: '鸡肉',
  bawa: '带', bawakan: '拿给', bayar: '支付', bea: '海关', belum: '还没', beli: '买', bekerja: '工作',
  bensin: '汽油', berapa: '多少', beras: '大米', bersihkan: '清洁', besok: '明天', bisa: '可以', botol: '瓶子', buah: '水果',
  buang: '扔掉', buat: '做', buatkan: '做给', cabai: '辣椒', cacat: '缺陷', cek: '检查', cuci: '洗', cukup: '足够',
  datang: '来', depan: '前面', di: '在', dinas: '出差', dipakai: '使用', ditaruh: '放置', dua: '两', dulu: '先',
  enak: '好吃', garam: '盐', gas: '煤气', gudang: '仓库', hari: '天', harus: '必须', hasil: '结果', hidangkan: '端上',
  ikut: '一起', ini: '这个', istirahat: '休息', izin: '请假', jadi: '成为', jalan: '路', jam: '点钟', jangan: '不要',
  jemput: '接', kapan: '什么时候', kasih: '给', ke: '去、到', kemasannya: '包装', kembali: '回来', kerjanya: '工作',
  kira: '大约', klien: '客户', koper: '行李箱', lain: '其他', lagi: '再次', laporkan: '报告', lebih: '更', lewat: '经过',
  lokasi: '位置', lupa: '忘记', macet: '堵车', main: '玩', makan: '吃饭', malam: '晚上', mandikan: '给…洗澡',
  masak: '做饭', masakannya: '饭菜', masih: '还', meja: '桌子', mengerjakan: '做', menjaga: '照顾', mesin: '机器',
  minta: '请求', minum: '喝水', mulai: '开始', nanti: '稍后', normal: '正常', pak: '先生', pakai: '使用',
  panggil: '叫来', parkir: '停车', pelanggan: '客户', pemasok: '供应商', pemeriksaannya: '检查', penawaran: '报价',
  pengemasan: '包装', pergi: '去', periksa: '检查', perlu: '需要', pesan: '订购', pesanan: '订单', pinggir: '路边',
  piring: '盘子', pisahkan: '分开', potong: '切', produk: '产品', produksi: '生产', pulang: '回家', rak: '架',
  rapat: '会议', rapikan: '整理', ruang: '房间', saja: '就', sampah: '垃圾', sampai: '到达', sarapan: '早餐',
  saya: '我', sekolah: '学校', segera: '立刻', sekarang: '现在', selesai: '结束', sederhana: '简单', sedikit: '一点',
  sekalian: '顺便', sekitar: '附近、大约', selamat: '祝好', seperti: '像', setelah: '之后', siap: '准备好',
  sini: '这里', sore: '下午', spesifikasi: '规格', sprei: '床单', susu: '牛奶', tamu: '客人', teh: '茶', telur: '鸡蛋',
  temani: '陪伴', terima: '收到', terlambat: '迟到、延误', tetap: '保持', tidak: '不', tolong: '请', tunggu: '等',
  untuk: '用于', usah: '需要', ya: '语气词', yang: '的', berubah: '改变', lobi: '大堂', terminalnya: '航站楼',
};

export function harvestTerm(entry: string) {
  return entry.replace(/^[-*\s]+/, '').split(/[（(]/)[0].trim();
}

function explicitMeaning(entry: string) {
  return entry.match(/[（(]([^）)]+)[）)]/)?.[1]?.trim();
}

function inferredMeaning(term: string) {
  const translated = term.toLocaleLowerCase().replace(/[^a-zà-ÿ\s]/g, '').split(/\s+/).filter(Boolean).map((word) => wordMeanings[word]).filter(Boolean);
  return translated.length ? translated.join(' ') : '印尼语短语';
}

export function formatHarvest(entries: string[], dialogue: string) {
  const normalizedDialogue = dialogue.toLocaleLowerCase();
  const output: string[] = [];
  for (const entry of entries) {
    const term = harvestTerm(entry);
    if (!term || !normalizedDialogue.includes(term.toLocaleLowerCase())) continue;
    const meaning = explicitMeaning(entry) || meanings[term.toLocaleLowerCase()] || inferredMeaning(term);
    const formatted = `${term}（${meaning}）`;
    if (!output.includes(formatted)) output.push(formatted);
    if (output.length === 6) break;
  }
  return output;
}
