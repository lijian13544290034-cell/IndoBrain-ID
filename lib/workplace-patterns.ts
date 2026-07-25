export type WorkplacePattern = { indonesian: string; chinese: string };

// Keep patterns practical: they are short spoken frames learners can reuse
// immediately, not grammar explanations.
export function getWorkplacePattern(sentence: string): WorkplacePattern {
  const text = sentence.trim();
  if (/^Tolong\b/i.test(text)) return { indonesian: 'Tolong [aksi] ya.', chinese: '请[做某个动作]。' };
  if (/^Hari ini nggak usah\b/i.test(text)) return { indonesian: 'Nggak usah [kegiatan] ya.', chinese: '不用[做某件事]了。' };
  if (/^Hari ini\b/i.test(text)) return { indonesian: 'Hari ini [pengaturan] ya.', chinese: '今天[安排]。' };
  if (/^Kirim\b/i.test(text)) return { indonesian: 'Kirim [barang/dokumen] ke [orang] ya.', chinese: '把[货物/文件]发给[对方]。' };
  if (/^(Cek|Periksa|Konfirmasi)\b/i.test(text)) return { indonesian: 'Cek [hal yang perlu dipastikan] dulu ya.', chinese: '先确认[需要核对的事项]。' };
  if (/^Sudah\b/i.test(text)) return { indonesian: 'Sudah [selesai/datang]?', chinese: '已经[完成/到了]吗？' };
  if (/^Masih\b/i.test(text)) return { indonesian: 'Masih [status]?', chinese: '还[处于某个状态]吗？' };
  if (/^(Bisa|Perlu|Harus)\b/i.test(text)) return { indonesian: 'Bisa [aksi]?', chinese: '可以[做某个动作]吗？' };
  if (text.endsWith('?')) return { indonesian: text, chinese: '用来确认当前情况或进度。' };
  return { indonesian: text, chinese: '用来明确当前的安排或要求。' };
}
