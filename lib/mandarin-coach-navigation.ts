import type { MandarinCoachCatalogEntry, MandarinCoachCurriculumLesson } from '@/lib/mandarin-coach-curriculum-types';

type NavigationLesson = Pick<MandarinCoachCurriculumLesson, 'source' | 'courseTitle' | 'courseTitleId' | 'group' | 'day' | 'title'>;

export const MANDARIN_DAY_TITLES_ID: Readonly<Record<number, string>> = {
  1: 'Mulai Berbicara untuk Pertama Kali',
  2: 'Datang dan Pergi',
  3: 'Yang Ini dan Yang Itu',
  4: 'Jumlah',
  5: 'Ada atau Tidak',
  6: 'Hari Ini, Besok, dan Sekarang',
  7: 'Jam Berapa',
  8: 'Siapa dan Di Mana',
  9: 'Benar atau Salah, Cepat atau Lambat',
  10: 'Mengambil, Memberi, Meletakkan, dan Mencari',
  11: 'Melihat, Mendengar, Berbicara, dan Bertanya',
  12: 'Apakah Pekerjaannya Sudah Selesai?',
  13: 'Bisa atau Tidak Bisa',
  14: 'Tetap Bisa Berkomunikasi Saat Belum Paham',
  15: 'Perkembangan Pekerjaan',
  16: 'Cukup atau Belum',
  17: 'Terjadi Masalah',
  18: 'Memeriksa Hasil',
  19: 'Mengerjakan Ulang',
  20: 'Bisakah Selesai Hari Ini?',
  21: 'Mengapa',
  22: 'Mencari Seseorang',
  23: 'Gudang dan Logistik',
  24: 'Area Produksi',
  25: 'Di Kantor',
  26: 'Pembelian',
  27: 'Masuk Kerja',
  28: 'Bahasa Mandarin Sehari-hari di Perusahaan',
  29: 'Hari Kerja Penuh Pertama dalam Bahasa Mandarin',
  30: 'Tantangan Akhir: Mode Bos Tiongkok',
  31: 'Satu Instruksi, Berbagai Cara Mengucapkannya',
  32: 'Dua Instruksi Berturut-turut',
  33: 'Kerjakan Ini Dulu, Lalu Itu',
  34: 'Urutan Waktu dalam Tugas',
  35: 'Melapor Setelah Selesai',
  36: 'Mengonfirmasi Tugas',
  37: 'Saat Instruksi Tidak Terdengar Jelas',
  38: 'Bos Menanyakan Perkembangan',
  39: 'Harus Selesai Hari Ini',
  40: 'Mode Bos Tiongkok 1',
  41: 'Barang Tidak Ditemukan',
  42: 'Jumlahnya Tidak Sesuai',
  43: 'Salah Mengerjakan',
  44: 'Memperbaiki dan Mengerjakan Ulang',
  45: 'Masalah Kualitas',
  46: 'Perkembangan Pekerjaan',
  47: 'Memanggil Seseorang',
  48: 'Pembagian Tugas',
  49: 'Melaporkan Masalah Secara Proaktif',
  50: 'Simulasi Lengkap Masalah Kerja',
  51: 'Memulai di Proyek Konstruksi',
  52: 'Arah dan Posisi',
  53: 'Mengangkat dan Memindahkan',
  54: 'Mengukur Ukuran',
  55: 'Bahan Bangunan 1',
  56: 'Bahan Bangunan 2',
  57: 'Gambar Kerja dan Pelaksanaan',
  58: 'Kualitas Pekerjaan Konstruksi',
  59: 'Keselamatan di Proyek',
  60: 'Simulasi Lengkap di Proyek Konstruksi',
};

const SECTION_LABELS_ID: Readonly<Record<string, string>> = {
  'MANDARIN_WORK_LEVEL_1:Dasar kerja': '30 Hari Bisa Mandarin untuk Kerja · Dasar-dasar di Tempat Kerja',
  'MANDARIN_WORK_LEVEL_1:Komunikasi kerja': '30 Hari Bisa Mandarin untuk Kerja · Komunikasi di Tempat Kerja',
  'MANDARIN_WORK_LEVEL_1:Situasi kerja lengkap': '30 Hari Bisa Mandarin untuk Kerja · Situasi Kerja Lengkap',
  'MANDARIN_WORK_LEVEL_2:Dengar Bos Tiongkok': 'Mandarin untuk Kerja — Level 2 · Memahami Instruksi Bos Tiongkok',
  'MANDARIN_WORK_LEVEL_2:Selesaikan Masalah Kerja': 'Mandarin untuk Kerja — Level 2 · Menyelesaikan Masalah di Tempat Kerja',
  'MANDARIN_WORK_LEVEL_2:Mandarin untuk Proyek Konstruksi': 'Mandarin untuk Kerja — Level 2 · Mandarin untuk Proyek Konstruksi',
  'GOLDEN_QUANTITY:专题 / Topik': 'Topik Khusus · Jumlah dalam Bahasa Mandarin',
};

export function mandarinNavigationTitleId(lesson: NavigationLesson) {
  if (lesson.day !== null) return MANDARIN_DAY_TITLES_ID[lesson.day] ?? lesson.title;
  if (lesson.source === 'GOLDEN_QUANTITY') return 'Jumlah dalam Bahasa Mandarin';
  return lesson.courseTitleId;
}

export function mandarinNavigationTitleZh(lesson: NavigationLesson) {
  return lesson.day !== null ? lesson.title : lesson.courseTitle;
}

export function mandarinNavigationSectionId(entry: MandarinCoachCatalogEntry) {
  return SECTION_LABELS_ID[`${entry.source}:${entry.group}`] ?? `${entry.courseTitleId} · ${entry.group}`;
}

export function mandarinNavigationMeta(lesson: NavigationLesson, expressionCount: number) {
  return lesson.day !== null ? `Hari ${lesson.day} · ${expressionCount} ungkapan` : `Topik · ${expressionCount} ungkapan`;
}
