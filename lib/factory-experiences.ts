import fs from 'node:fs';
import path from 'node:path';
import { factorySupplemental } from '@/lib/factory-supplemental';

export type FactoryExperience = {
  id: string;
  content: string;
  task: string;
  indonesian: string;
  explanation?: string;
  harvest: string[];
};

const experiencePath = path.join(process.cwd(), 'experience', 'factory', 'manager', 'Factory_Manager_Experience.md');
const indonesianMarker = `**${String.fromCodePoint(0x1f1ee, 0x1f1e9)}**`;

// The task is the source of truth. These are the spoken, task-complete lines
// shown to users; all background remains in Penjelasan.
const dialogueOverrides: Record<string, string> = {
  'EXP-FAC-001': 'Hari ini produksi apa?', 'EXP-FAC-002': 'Hari ini produksi berapa?',
  'EXP-FAC-003': 'Sekarang sudah sampai mana?', 'EXP-FAC-004': 'Hari ini ada masalah mutu?',
  'EXP-FAC-005': 'Bahan bakunya cukup?', 'EXP-FAC-006': 'Hari ini bisa selesai?',
  'EXP-FAC-007': 'Pelanggan datang jam berapa?', 'EXP-FAC-008': 'Barangnya hari ini bisa keluar nggak?',
  'EXP-FAC-009': 'Jam berapa kirim barang hari ini?', 'EXP-FAC-010': 'Sore ini muat kontainer?',
  'EXP-FAC-011': 'Kapalnya berangkat kapan?', 'EXP-FAC-012': 'Dokumen ekspornya sudah siap?',
  'EXP-FAC-013': 'Proses bea cukainya sudah selesai?', 'EXP-FAC-014': 'Kira-kira kapan sampai?',
  'EXP-FAC-015': 'Pelanggannya sudah terima barang?', 'EXP-FAC-016': 'Pelanggan ada keluhan?',
  'EXP-FAC-017': 'Pelanggan ada pesanan baru?', 'EXP-FAC-018': 'Minggu depan produksi apa?',
  'EXP-FAC-019': 'Pesanan ABC dikerjakan dulu ya. Ini lebih mendesak.',
  'EXP-FAC-020': 'Minggu ini ada masalah apa aja?', 'EXP-FAC-021': 'Hari ini masuk berapa orang?',
  'EXP-FAC-022': 'Semua mesin normal?', 'EXP-FAC-023': 'Sasaran hari ini bisa tercapai?',
  'EXP-FAC-024': 'Hari ini ada pesanan mendesak?', 'EXP-FAC-025': 'Bahan bakunya sudah datang?',
  'EXP-FAC-026': 'Stok masih cukup?', 'EXP-FAC-027': 'Malam ini perlu lembur?',
  'EXP-FAC-028': 'Kenapa hari ini lebih lambat?', 'EXP-FAC-029': 'Besok produksi apa?',
  'EXP-FAC-030': 'Hari ini keseluruhannya gimana?', 'EXP-FAC-031': 'Efisiensi produksi hari ini gimana?',
  'EXP-FAC-032': 'Biaya produksi hari ini normal?', 'EXP-FAC-033': 'Hari ini barang cacatnya berapa persen?',
  'EXP-FAC-034': 'Hari ini ada masalah keselamatan?', 'EXP-FAC-035': 'Area produksi sudah rapi?',
  'EXP-FAC-036': 'Pelanggan mana yang paling mendesak?', 'EXP-FAC-037': 'Pemasok akhir-akhir ini gimana?',
  'EXP-FAC-038': 'Hari ini ada perbaikan apa?', 'EXP-FAC-039': 'Hari ini sudah rapat?',
  'EXP-FAC-040': 'Apa prioritas utama hari ini?', 'EXP-FAC-041': 'Pelanggan ada keluhan?',
  'EXP-FAC-042': 'Masalah mutu sudah diperbaiki?', 'EXP-FAC-043': 'Biaya bulan ini bagaimana?',
  'EXP-FAC-044': 'Sasaran bulan ini bisa tercapai?', 'EXP-FAC-045': 'KPI bulan ini bagaimana?',
  'EXP-FAC-046': 'Operator baru sudah dilatih?', 'EXP-FAC-047': 'Mesinnya sudah dirawat?',
  'EXP-FAC-048': 'Fokus bulan depan apa?', 'EXP-FAC-049': 'Rapat bulanan kapan?',
  'EXP-FAC-050': 'Masih ada yang perlu saya bantu?',
};

function harvestFromDialogue(harvest: string[], dialogue: string) {
  const normalizedDialogue = dialogue.toLocaleLowerCase();
  const sourced = harvest
    .map((entry) => entry.replace(/^[-*\s]+/, '').split(/[（(]/)[0]?.trim())
    .filter((term) => Boolean(term) && normalizedDialogue.includes(term.toLocaleLowerCase()));
  const words = dialogue.toLocaleLowerCase().match(/[a-zà-ÿ]+(?:'[a-zà-ÿ]+)?/g) ?? [];
  const directPhrases = [
    ...words.flatMap((_, index) => words.slice(index, index + 2).length === 2 ? [words.slice(index, index + 2).join(' ')] : []),
    ...words,
  ];
  return [...new Set([...sourced, ...directPhrases])].slice(0, 6);
}

function displayContent(id: string, task: string, indonesian: string, explanation: string, harvest: string[]) {
  return [
    `# ${id}`,
    '', '## Task', task,
    '', '## Bahasa Indonesia', indonesian,
    '', '## Penjelasan', explanation,
    '', "## Today's Harvest", ...harvest.map((word) => `- ${word}`),
  ].join('\n');
}

function firstIndonesianLine(content: string, taskSection: string) {
  const markerIndex = content.indexOf(indonesianMarker);
  if (markerIndex >= 0) {
    return content
      .slice(markerIndex + indonesianMarker.length)
      .split(/\r?\n\s*(?:---|### |## )/)[0]
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? '';
  }

  return taskSection
    .split(/\r?\n/)
    .map((line) => line.replace(/\*\*/g, '').trim())
    .find((line) => /[A-Za-z]/.test(line) && !/[\u3400-\u9FFF]/.test(line) && !line.startsWith('#')) ?? '';
}

export function getFactoryExperiences(): FactoryExperience[] {
  const source = fs.readFileSync(experiencePath, 'utf8').trim();

  return source
    .split(/(?=^# EXP-FAC-\d{3}\s*$)/m)
    .filter((section) => section.trim().startsWith('# EXP-FAC-'))
    .map((section) => {
      const match = section.match(/^# (EXP-FAC-\d{3})\s*$/m);
      if (!match) throw new Error('Invalid Factory Experience format');

      const content = section.trim();
      const task = content.match(/## Task\s*\r?\n\s*([^\r\n]+)/)?.[1]?.trim() ?? '';
      const taskSection = content.match(/## Task\s*\r?\n([\s\S]*?)(?=\r?\n## |$)/)?.[1] ?? '';
      const indonesian = dialogueOverrides[match[1]] ?? firstIndonesianLine(content, taskSection);
      const explanation = content.match(/## Story Background\s*\r?\n([\s\S]*?)(?=\r?\n## |$)/)?.[1]?.trim();
      const harvestSection = content.match(/## Today's Harvest\s*\r?\n([\s\S]*?)(?=\r?\n## |$)/)?.[1] ?? '';
      const sourceHarvest = harvestSection
        .split(/\r?\n/)
        .map((line) => line.replace(/^-\s*/, '').trim())
        .filter(Boolean);
      const supplemental = factorySupplemental[match[1]];
      const harvest = harvestFromDialogue(sourceHarvest.length ? sourceHarvest : (supplemental?.harvest ?? []), indonesian);

      const displayExplanation = explanation ?? supplemental?.explanation ?? '';
      return {
        id: match[1],
        content: displayContent(match[1], task, indonesian, displayExplanation, harvest),
        task,
        indonesian,
        explanation: displayExplanation,
        harvest,
      };
    })
    .filter(({ id }) => Number(id.slice(-3)) >= 1)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getFactoryExperience(id: string) {
  return getFactoryExperiences().find((experience) => experience.id === `EXP-FAC-${id}`);
}
