import fs from 'node:fs';
import path from 'node:path';

export type DriverExperience = {
  id: string;
  task: string;
  indonesian: string;
  chinese: string;
  explanation: string;
  harvest: string[];
  missing?: boolean;
};

const sourcePath = path.join(process.cwd(), '03_Experience_Base', 'Experience_Base_Driver_v0.1.md');
const displayOverrides: Record<string, Pick<DriverExperience, 'task' | 'indonesian'>> = {
  'EXP-DRV-002': { task: '你到了吗？', indonesian: 'Sudah sampai?' },
  'EXP-DRV-003': { task: '先去银行，然后去公司', indonesian: 'Kita ke bank dulu, setelah itu ke kantor ya.' },
  'EXP-DRV-004': { task: '前面堵车吗？', indonesian: 'Di depan macet?' },
};

// Display text follows the Chinese Task exactly. Background, reasons, and
// outcomes stay in the explanation instead of being appended to dialogue.
const dialogueOverrides: Record<string, string> = {
  'EXP-DRV-001': 'Besok pagi jam setengah delapan jemput saya di depan rumah ya.',
  'EXP-DRV-002': 'Sudah sampai?',
  'EXP-DRV-003': 'Kita ke bank dulu, setelah itu ke kantor ya.',
  'EXP-DRV-004': 'Di depan macet?',
  'EXP-DRV-005': 'Tolong bilang ke klien ya, kita telat sekitar sepuluh menit.',
  'EXP-DRV-006': 'Pak, kita lewat jalan lain ya.',
  'EXP-DRV-007': 'Parkir di basement saja.',
  'EXP-DRV-008': 'Tunggu saya di sini dulu ya.',
  'EXP-DRV-009': 'Saya sudah selesai rapat. Tolong jemput saya di depan kantor ya.',
  'EXP-DRV-010': 'Kita ke bank dulu ya.',
  'EXP-DRV-011': 'Saya kira-kira keluar dua puluh menit lagi ya.',
  'EXP-DRV-012': 'Nanti sore kita ke kantor klien ya.',
  'EXP-DRV-013': 'Pak, kita sudah sampai.',
  'EXP-DRV-014': 'Pak, saya tunggu di bawah ya.',
  'EXP-DRV-015': 'Di sekitar sini ada makanan yang enak nggak?',
  'EXP-DRV-016': 'Pak, saya isi bensin dulu ya.',
  'EXP-DRV-018': 'Jalan ini agak macet.',
  'EXP-DRV-019': 'Pinggir dulu ya.',
  'EXP-DRV-020': 'Sudah sampai.',
  'EXP-DRV-030': 'Besok pagi tetap jemput saya jam setengah delapan ya.',
};

function section(content: string, heading: string) {
  const match = content.match(new RegExp(`^## ${heading}(?:[^\\r\\n]*)\\r?\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'));
  return match?.[1]?.trim() ?? '';
}

function firstIndonesianSentence(scene: string) {
  const marker = `**${String.fromCodePoint(0x1f1ee, 0x1f1e9)}**`;
  const legacyContentMarker = `**${String.fromCodePoint(0x1f50a)}**`;
  const start = scene.indexOf(marker);
  if (start < 0) return '';
  return scene
    .slice(start + marker.length)
    .split(/\r?\n\s*(?:---|### |## )/)[0]
    .split(legacyContentMarker)[0]
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? '';
}

function harvestFromDialogue(harvest: string[], dialogue: string) {
  const normalizedDialogue = dialogue.toLocaleLowerCase();
  return harvest.filter((entry) => {
    const term = entry.replace(/^[-*\s]+/, '').split(/[（(]/)[0]?.trim().toLocaleLowerCase();
    return Boolean(term) && normalizedDialogue.includes(term);
  });
}

function parseSource(): Map<string, DriverExperience> {
  const records = new Map<string, DriverExperience>();
  const markdown = fs.readFileSync(sourcePath, 'utf8');
  const matches = [...markdown.matchAll(/^# (EXP-DRV-\d{3})(?:[^\r\n]*)\r?\n([\s\S]*?)(?=^# EXP-DRV-|(?![\s\S]))/gm)];

  for (const match of matches) {
    const id = match[1];
    const body = match[2];
    const task = section(body, 'Task').split(/\r?\n/)[0].trim();
    const indonesian = dialogueOverrides[id] ?? displayOverrides[id]?.indonesian ?? firstIndonesianSentence(section(body, `${String.fromCodePoint(0x1f3ac)} Scene`));
    const sourceHarvest = section(body, "Today's Harvest")
      .split(/\r?\n/)
      .map((line) => line.replace(/^-\s*/, '').trim())
      .filter(Boolean);
    const harvest = harvestFromDialogue(sourceHarvest, indonesian);

    if (task && indonesian && sourceHarvest.length > 0) {
      const override = displayOverrides[id];
      records.set(id, {
        id,
        task: override?.task ?? task,
        indonesian,
        chinese: override?.task ?? task,
        explanation: section(body, 'Story Background'),
        harvest,
      });
    }
  }

  return records;
}

export function getDriverExperiences(): DriverExperience[] {
  const sourceRecords = parseSource();
  return Array.from({ length: 30 }, (_, index) => {
    const id = `EXP-DRV-${String(index + 1).padStart(3, '0')}`;
    return sourceRecords.get(id) ?? { id, task: '正式内容尚未导入', indonesian: '', chinese: '', explanation: '', harvest: [], missing: true };
  });
}
