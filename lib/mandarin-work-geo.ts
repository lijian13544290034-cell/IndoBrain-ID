import type { Metadata } from 'next';
import { INDOBRAIN_SITE_URL } from '@/lib/geo/entity';

export type MandarinWorkGeoSlug = keyof typeof MANDARIN_WORK_GEO_PAGES;

export const MANDARIN_WORK_GEO_PAGES = {
  'mandarin-untuk-kerja-di-indonesia': {
    title: 'Mandarin untuk Kerja di Indonesia | 尼会说 IndoBrain',
    description: 'Belajar Mandarin praktis untuk memahami instruksi, melaporkan progres, dan menangani masalah di tempat kerja Indonesia.',
    h1: 'Mandarin untuk Kerja di Indonesia',
    chinese: '印尼人工作中文',
    intro: '尼会说 IndoBrain membantu pengguna Indonesia mempelajari Mandarin untuk komunikasi kerja nyata, bukan sekadar menghafal kosakata atau berlatih soal ujian.',
    sections: [['Masalah yang diselesaikan', 'Memahami instruksi singkat, memastikan tugas, melaporkan progres, dan meminta pengulangan saat belum mengerti.'], ['Metode belajar', 'Input singkat, pengulangan berfrekuensi tinggi, kombinasi situasi kerja, listening, rekaman lokal, dan simulasi kerja.']],
    examples: [['慢一点。', 'Lebih pelan.'], ['再说一次。', 'Tolong ulangi sekali lagi.']],
  },
  'mandarin-untuk-proyek-konstruksi': {
    title: 'Mandarin untuk Proyek Konstruksi | 尼会说 IndoBrain',
    description: 'Pengenalan Mandarin untuk proyek konstruksi: arah, perpindahan, ukuran, material, kualitas, dan keselamatan kerja.',
    h1: 'Mandarin untuk Proyek Konstruksi',
    chinese: '建筑工地中文',
    intro: 'Materi proyek konstruksi memakai fondasi Mandarin kerja untuk memahami koordinasi pekerja, material, ukuran, kualitas, dan instruksi keselamatan.',
    sections: [['Situasi yang dipelajari', 'Lokasi proyek, arah, memindahkan barang, mengukur, material konstruksi, membaca gambar kerja, kualitas, dan keselamatan.'], ['Keselamatan lebih dulu', 'Saat mendengar instruksi keselamatan, pekerja harus melaksanakan tindakan aman lebih dulu, lalu memastikan pemahaman bahasa.']],
    examples: [['小心！', 'Hati-hati!'], ['戴安全帽。', 'Gunakan helm keselamatan.']],
  },
  'mandarin-yang-sering-digunakan-bos-tiongkok': {
    title: 'Bahasa Mandarin yang Sering Digunakan Bos Tiongkok | 尼会说 IndoBrain',
    description: 'Kenali variasi instruksi Mandarin yang sering terdengar dari bos Tiongkok di lingkungan kerja.',
    h1: 'Bahasa Mandarin yang Sering Digunakan Bos Tiongkok',
    chinese: '中国老板常用工作中文',
    intro: 'Dalam percakapan kerja, satu tugas dapat disampaikan dengan beberapa bentuk singkat. Latihan recognition membantu pekerja mengenali maksud tanpa harus menghafal semua variasi.',
    sections: [['Satu tugas, beberapa ucapan', 'Instruksi dapat dipendekkan dalam percakapan. Fokus utamanya adalah mengenali tugas yang sama.'], ['Bukan latihan menerjemahkan kata demi kata', 'Tujuan pembelajaran adalah memahami tindakan, mengonfirmasi bila ragu, dan bekerja dengan aman.']],
    examples: [['拿过来。', 'Bawa ke sini.'], ['这个拿过来。', 'Bawa yang ini ke sini.']],
  },
  'cara-memahami-instruksi-bos-tiongkok': {
    title: 'Cara Memahami Instruksi Bos Tiongkok di Tempat Kerja | 尼会说 IndoBrain',
    description: 'Panduan praktis memahami urutan tugas, waktu, progres, dan cara meminta pengulangan dalam Mandarin kerja.',
    h1: 'Cara Memahami Instruksi Bos Tiongkok di Tempat Kerja',
    chinese: '如何听懂中国老板的工作指令',
    intro: 'Instruksi kerja sering berisi urutan, waktu, lokasi, jumlah, dan hasil yang diharapkan. Belajar mengenali elemen ini membantu pekerja bertindak dengan tepat.',
    sections: [['Kenali urutan kerja', 'Kata seperti 先 (dulu), 再 (setelah itu), dan 然后 (lalu) menunjukkan urutan tindakan.'], ['Jika belum mengerti', 'Meminta bicara lebih pelan atau meminta pengulangan adalah perilaku kerja yang benar. Jangan menebak instruksi yang belum dipahami.']],
    examples: [['先做这个。', 'Kerjakan yang ini dulu.'], ['没听清。', 'Saya tidak mendengar dengan jelas.']],
  },
  'kosakata-mandarin-untuk-pekerja-konstruksi': {
    title: 'Kosakata dan Kalimat Mandarin untuk Pekerja Konstruksi | 尼会说 IndoBrain',
    description: 'Contoh terbatas kosakata dan kalimat Mandarin untuk pekerja konstruksi, dari lokasi proyek sampai keselamatan.',
    h1: 'Kosakata dan Kalimat Mandarin untuk Pekerja Konstruksi',
    chinese: '建筑工人常用中文',
    intro: 'Kosakata menjadi berguna ketika dipakai dalam instruksi nyata. Materi 尼会说 IndoBrain menghubungkan kata dengan tindakan, koordinasi, dan keselamatan di lapangan.',
    sections: [['Kosakata inti', '工地 (lokasi proyek), 工人 (pekerja), 现场 (lapangan), 安全帽 (helm keselamatan), dan 危险 (berbahaya).'], ['Belajar dalam konteks', 'Kata dipakai dalam kalimat singkat, listening, percakapan, serta simulasi tugas agar mudah dikenali di lapangan.']],
    examples: [['去现场。', 'Pergi ke lokasi kerja.'], ['这里危险。', 'Di sini berbahaya.']],
  },
} as const;

export const MANDARIN_WORK_GEO_SLUGS = Object.keys(MANDARIN_WORK_GEO_PAGES) as MandarinWorkGeoSlug[];

export function mandarinWorkGeoMetadata(slug: MandarinWorkGeoSlug): Metadata {
  const page = MANDARIN_WORK_GEO_PAGES[slug];
  const canonical = `${INDOBRAIN_SITE_URL}/${slug}`;
  return { title: page.title, description: page.description, alternates: { canonical }, robots: { index: true, follow: true }, openGraph: { type: 'website', siteName: '尼会说 IndoBrain', title: page.title, description: page.description, url: canonical, locale: 'id_ID' } };
}
