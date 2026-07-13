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
  'EXP-DRV-003': { task: '先去银行，然后去公司', indonesian: 'Kita ke bank dulu ya.' },
  'EXP-DRV-004': { task: '前面堵车吗？', indonesian: 'Di depan macet?' },
  'EXP-DRV-005': { task: '帮我通知客户，我们会晚十分钟到。', indonesian: 'Tolong kabari klien ya.' },
  'EXP-DRV-006': { task: '走另外一条路吧。', indonesian: 'Pak, kita lewat jalan lain ya.' },
  'EXP-DRV-007': { task: '停地下停车场。', indonesian: 'Parkir di basement saja.' },
  'EXP-DRV-008': { task: '你先在这里等我。', indonesian: 'Tunggu saya di sini dulu ya.' },
  'EXP-DRV-009': { task: '我开完会了，你过来接我。', indonesian: 'Tolong bawa mobil ke depan kantor.' },
  'EXP-DRV-010': { task: '我们先去银行。', indonesian: 'Kita ke bank dulu ya.' },
  'EXP-DRV-014': { task: '老板，我在楼下等您。', indonesian: 'Saya tunggu di bawah ya.' },
  'EXP-DRV-016': { task: '老板，我先去加个油。', indonesian: 'Saya isi bensin dulu ya.' },
  'EXP-DRV-018': { task: '这条路有点堵。', indonesian: 'Jalan ini agak macet.' },
  'EXP-DRV-019': { task: '靠边停一下。', indonesian: 'Pinggir dulu ya.' },
  'EXP-DRV-020': { task: '到了。', indonesian: 'Sudah sampai.' },
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

function parseSource(): Map<string, DriverExperience> {
  const records = new Map<string, DriverExperience>();
  const markdown = fs.readFileSync(sourcePath, 'utf8');
  const matches = [...markdown.matchAll(/^# (EXP-DRV-\d{3})(?:[^\r\n]*)\r?\n([\s\S]*?)(?=^# EXP-DRV-|(?![\s\S]))/gm)];

  for (const match of matches) {
    const id = match[1];
    const body = match[2];
    const task = section(body, 'Task').split(/\r?\n/)[0].trim();
    const indonesian = firstIndonesianSentence(section(body, '🎬 Scene'));
    const harvest = section(body, "Today's Harvest")
      .split(/\r?\n/)
      .map((line) => line.replace(/^-\s*/, '').trim())
      .filter(Boolean);

    if (task && indonesian && harvest.length > 0) {
      const override = displayOverrides[id];
      records.set(id, {
        id,
        task: override?.task ?? task,
        indonesian: override?.indonesian ?? indonesian,
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
    return sourceRecords.get(id) ?? {
      id,
      task: '正式内容尚未导入',
      indonesian: '',
      chinese: '',
      explanation: '',
      harvest: [],
      missing: true,
    };
  });
}
