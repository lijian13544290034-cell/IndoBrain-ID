import fs from 'node:fs';
import path from 'node:path';
import { formatHarvest } from '@/lib/harvest';

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
  'EXP-DRV-006': 'Kita lewat jalan lain ya.',
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

const generatedExperiences: Record<string, DriverExperience> = {
  'EXP-DRV-017': { id: 'EXP-DRV-017', task: '去机场接客人。', chinese: '去机场接客人。', indonesian: 'Tolong jemput tamu di bandara ya.', explanation: '需要安排司机到机场接一位客人。', harvest: ['tolong jemput', 'tamu', 'bandara'] },
  'EXP-DRV-021': { id: 'EXP-DRV-021', task: '先去加油站。', chinese: '先去加油站。', indonesian: 'Kita ke pom bensin dulu ya.', explanation: '出发前，老板安排司机先到加油站补充燃油。', harvest: ['ke pom bensin', 'bensin', 'dulu'] },
  'EXP-DRV-022': { id: 'EXP-DRV-022', task: '帮我拿一下行李。', chinese: '帮我拿一下行李。', indonesian: 'Tolong ambilkan koper saya ya.', explanation: '到达目的地后，老板请司机协助拿行李。', harvest: ['tolong ambilkan', 'koper', 'saya'] },
  'EXP-DRV-023': { id: 'EXP-DRV-023', task: '走收费公路吧。', chinese: '走收费公路吧。', indonesian: 'Lewat jalan tol saja ya.', explanation: '老板希望司机选择收费公路行驶。', harvest: ['lewat', 'jalan tol', 'saja'] },
  'EXP-DRV-024': { id: 'EXP-DRV-024', task: '在这里等我。', chinese: '在这里等我。', indonesian: 'Tunggu saya di sini ya.', explanation: '老板临时下车办事，请司机在原地等候。', harvest: ['tunggu', 'saya', 'di sini'] },
  'EXP-DRV-025': { id: 'EXP-DRV-025', task: '送我去仓库。', chinese: '送我去仓库。', indonesian: 'Antar saya ke gudang ya.', explanation: '老板需要前往仓库处理工作。', harvest: ['antar', 'saya', 'gudang'] },
  'EXP-DRV-026': { id: 'EXP-DRV-026', task: '我需要去海关。', chinese: '我需要去海关。', indonesian: 'Saya perlu ke bea cukai ya.', explanation: '老板需要到海关办理事务。', harvest: ['perlu', 'ke bea cukai', 'bea cukai'] },
  'EXP-DRV-027': { id: 'EXP-DRV-027', task: '今天晚点回家。', chinese: '今天晚点回家。', indonesian: 'Hari ini saya pulang lebih malam ya.', explanation: '老板提前告诉司机，今天回家时间会比平时晚。', harvest: ['hari ini', 'pulang', 'lebih malam'] },
  'EXP-DRV-028': { id: 'EXP-DRV-028', task: '今晚需要加班。', chinese: '今晚需要加班。', indonesian: 'Malam ini kita perlu lembur ya.', explanation: '当天工作延长，需要司机配合晚间加班安排。', harvest: ['malam ini', 'perlu', 'lembur'] },
  'EXP-DRV-029': { id: 'EXP-DRV-029', task: '把车停在门口。', chinese: '把车停在门口。', indonesian: 'Parkir mobil di depan ya.', explanation: '到达地点后，老板安排车辆停在门口。', harvest: ['parkir', 'mobil', 'di depan'] },
};

Object.assign(generatedExperiences, {
  'EXP-DRV-031': { id: 'EXP-DRV-031', task: '明天改成八点来接我。', chinese: '明天改成八点来接我。', indonesian: 'Besok jemput saya jam delapan ya.', explanation: '第二天的接送时间有变化时，及时告知司机。', harvest: ['besok（明天）', 'jemput saya（接我）', 'jam delapan（八点）'] },
  'EXP-DRV-032': { id: 'EXP-DRV-032', task: '在大堂等我。', chinese: '在大堂等我。', indonesian: 'Tunggu saya di lobi ya.', explanation: '在酒店或公寓时，请司机在大堂等待。', harvest: ['tunggu saya（等我）', 'di lobi（在大堂）', 'ya（语气词）'] },
  'EXP-DRV-033': { id: 'EXP-DRV-033', task: '今天不要走收费公路。', chinese: '今天不要走收费公路。', indonesian: 'Hari ini jangan lewat jalan tol ya.', explanation: '希望避开收费公路时使用。', harvest: ['hari ini（今天）', 'jangan lewat（不要走）', 'jalan tol（收费公路）'] },
  'EXP-DRV-034': { id: 'EXP-DRV-034', task: '先去洗车。', chinese: '先去洗车。', indonesian: 'Kita cuci mobil dulu ya.', explanation: '车辆需要清洁时，安排司机先去洗车。', harvest: ['cuci mobil（洗车）', 'dulu（先）', 'ya（语气词）'] },
  'EXP-DRV-035': { id: 'EXP-DRV-035', task: '航站楼改了吗？', chinese: '航站楼改了吗？', indonesian: 'Terminalnya berubah?', explanation: '去机场前确认航站楼是否发生变化。', harvest: ['terminal（航站楼）', 'berubah（改变）'] },
} satisfies Record<string, DriverExperience>);

const generatedDialogueOverrides: Record<string, string> = {
  'EXP-DRV-028': 'Malam ini perlu lembur ya.',
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
  return Array.from({ length: 35 }, (_, index) => {
    const id = `EXP-DRV-${String(index + 1).padStart(3, '0')}`;
    const generated = generatedExperiences[id];
    const experience = sourceRecords.get(id) ?? (generated ? { ...generated, indonesian: generatedDialogueOverrides[id] ?? generated.indonesian } : undefined);
    return experience ? { ...experience, harvest: formatHarvest(experience.harvest, experience.indonesian) } : { id, task: '正式内容尚未导入', indonesian: '', chinese: '', explanation: '', harvest: [], missing: true };
  });
}
