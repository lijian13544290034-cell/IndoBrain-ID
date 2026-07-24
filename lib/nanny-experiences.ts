import fs from 'node:fs';
import path from 'node:path';
import { formatHarvest } from '@/lib/harvest';

export type NannyExperience = { id: string; task: string; indonesian: string; chinese: string; explanation: string; harvest: string[]; missing?: boolean };
const sourceDir = path.join(process.cwd(), '03_Experience_Base', 'Experience');
const actorMarkers = [String.fromCodePoint(0x1f468), String.fromCodePoint(0x1f469)];
const indonesianFlag = String.fromCodePoint(0x1f1ee, 0x1f1e9);
const legacyContentMarker = String.fromCodePoint(0x1f50a);

// Every displayed sentence is deliberately task-complete: no background,
// inferred reason, result, or second dialogue turn is mixed into it.
const dialogueOverrides: Record<string, string> = {
  'EXP-NAN-005': 'Malam ini enaknya masak apa ya?',
  'EXP-NAN-006': 'Hari ini jangan pakai cabai ya.',
  'EXP-NAN-007': 'Hari ini garamnya sedikit saja ya.',
  'EXP-NAN-008': 'Hari ini tidak usah masak makan malam ya.',
  'EXP-NAN-009': 'Tolong beli sayur ya.',
  'EXP-NAN-010': 'Tolong pesan gas satu tabung ya.',
  'EXP-NAN-011': 'Hari ini tolong bersihkan dapur ya.',
  'EXP-NAN-012': 'Jangan lupa buang sampah ya.',
  'EXP-NAN-013': 'Tolong cuci sprei ya.',
  'EXP-NAN-014': 'Tolong jemput anak sore ini ya.',
  'EXP-NAN-015': 'Tolong mandikan anak dulu ya.',
  'EXP-NAN-016': 'Tolong ingatkan anak mengerjakan PR ya.',
  'EXP-NAN-017': 'Hari ini saya bayar gaji ya.',
  'EXP-NAN-018': 'Besok saya boleh izin?',
  'EXP-NAN-019': 'Boleh minta gaji lebih awal sedikit?',
  'EXP-NAN-020': 'Terima kasih, hari ini sudah bekerja keras.',
  'EXP-NAN-021': 'Tolong beli dua kotak susu ya.',
  'EXP-NAN-022': 'Sekalian beli satu rak telur ya.',
  'EXP-NAN-023': 'Tolong rapikan ruang tamu ya.',
  'EXP-NAN-024': 'Malam ini ada tamu.',
  'EXP-NAN-025': 'Tolong potong buah dulu ya.',
  'EXP-NAN-026': 'Tolong buatkan teh ya.',
  'EXP-NAN-027': 'Tamunya sudah datang.',
  'EXP-NAN-028': 'Tolong bawakan buah ya.',
  'EXP-NAN-029': 'Sarapan pagi ini yang sederhana saja ya.',
  'EXP-NAN-030': 'Jangan lupa bawa botol minum anak ya.',
  'EXP-NAN-031': 'Tolong hidangkan makanannya ya.',
  'EXP-NAN-032': 'Istirahat dulu ya.',
  'EXP-NAN-033': 'Tolong rapikan meja ya.',
  'EXP-NAN-034': 'Tolong cuci piring ya.',
  'EXP-NAN-035': 'Besok datang jam delapan saja.',
  'EXP-NAN-036': 'Selamat pagi.',
  'EXP-NAN-037': 'Sarapannya dibuat lebih banyak ya.',
  'EXP-NAN-038': 'Masakannya enak sekali.',
  'EXP-NAN-039': 'Hari ini ikut kami ke mal ya.',
  'EXP-NAN-040': 'Tolong temani anak main dulu ya.',
  'EXP-NAN-041': 'Masih ada yang belum dibeli?',
  'EXP-NAN-042': 'Tolong rapikan belanjaannya ya.',
  'EXP-NAN-043': 'Tolong pisahkan belanjaannya ya.',
  'EXP-NAN-044': 'Ayamnya untuk besok ya.',
  'EXP-NAN-045': 'Berasnya masih ada berapa?',
  'EXP-NAN-046': 'Besok saya pergi dinas dua hari.',
  'EXP-NAN-047': 'Saya sudah pulang.',
  'EXP-NAN-048': 'Hari ini kerjanya bagus.',
  'EXP-NAN-049': 'Mulai besok kembali seperti biasa ya.',
  'EXP-NAN-050': 'Terima kasih sudah menjaga kami minggu ini.',
};

const additionalExperiences: Record<string, NannyExperience> = {
  'EXP-NAN-051': { id: 'EXP-NAN-051', task: '今天不要去接孩子了。', chinese: '今天不要去接孩子了。', indonesian: 'Hari ini tidak usah jemput anak ya.', explanation: '接孩子安排临时变化时，及时通知保姆。', harvest: ['hari ini（今天）', 'tidak usah（不用）', 'jemput anak（接孩子）'] },
  'EXP-NAN-052': { id: 'EXP-NAN-052', task: '把孩子明天的衣服准备好。', chinese: '把孩子明天的衣服准备好。', indonesian: 'Siapkan pakaian anak untuk besok ya.', explanation: '晚上提前准备孩子第二天要穿的衣服。', harvest: ['siapkan（准备）', 'pakaian anak（孩子的衣服）', 'untuk besok（明天用）'] },
  'EXP-NAN-053': { id: 'EXP-NAN-053', task: '家里的洗衣液快没有了。', chinese: '家里的洗衣液快没有了。', indonesian: 'Sabun cuci di rumah hampir habis.', explanation: '生活用品快用完时，提醒及时补充。', harvest: ['sabun cuci（洗衣液）', 'di rumah（在家里）', 'hampir habis（快用完）'] },
  'EXP-NAN-054': { id: 'EXP-NAN-054', task: '下午有客人来。', chinese: '下午有客人来。', indonesian: 'Sore ini ada tamu datang.', explanation: '有访客来之前，提醒保姆做好接待准备。', harvest: ['sore ini（今天下午）', 'tamu（客人）', 'datang（来）'] },
  'EXP-NAN-055': { id: 'EXP-NAN-055', task: '孩子今晚早点睡。', chinese: '孩子今晚早点睡。', indonesian: 'Malam ini anak tidur lebih awal ya.', explanation: '需要调整孩子作息时使用，不涉及医疗判断。', harvest: ['malam ini（今晚）', 'anak（孩子）', 'tidur lebih awal（早点睡）'] },
  'EXP-NAN-056': { id: 'EXP-NAN-056', task: '白色衣服分开洗。', chinese: '白色衣服分开洗。', indonesian: 'Pakaian putih dicuci terpisah ya.', explanation: '洗衣时将白色衣物分开，避免染色。', harvest: ['pakaian putih（白色衣服）', 'dicuci（洗）', 'terpisah（分开）'] },
  'EXP-NAN-057': { id: 'EXP-NAN-057', task: '孩子今天有点不舒服，请注意观察。', chinese: '孩子今天有点不舒服，请注意观察。', indonesian: 'Anak hari ini kurang enak badan, tolong diperhatikan ya.', explanation: '孩子状态不佳时，请保姆留意情况；不作医疗诊断。', harvest: ['anak（孩子）', 'kurang enak badan（有点不舒服）', 'diperhatikan（注意观察）'] },
  'EXP-NAN-058': { id: 'EXP-NAN-058', task: '客人十点来，准备茶水。', chinese: '客人十点来，准备茶水。', indonesian: 'Tamu datang jam sepuluh, siapkan teh ya.', explanation: '有访客来之前，提前准备简单茶水。', harvest: ['tamu（客人）', 'jam sepuluh（十点）', 'siapkan teh（准备茶）'] },
  'EXP-NAN-059': { id: 'EXP-NAN-059', task: '今天不要给孩子喝甜饮料。', chinese: '今天不要给孩子喝甜饮料。', indonesian: 'Hari ini jangan kasih anak minuman manis ya.', explanation: '家庭对当天饮食有要求时使用。', harvest: ['jangan kasih（不要给）', 'anak（孩子）', 'minuman manis（甜饮料）'] },
  'EXP-NAN-060': { id: 'EXP-NAN-060', task: '下雨的话，衣服晾在里面。', chinese: '下雨的话，衣服晾在里面。', indonesian: 'Kalau hujan, jemur pakaian di dalam ya.', explanation: '雨天将衣物晾在室内，避免再次淋湿。', harvest: ['kalau hujan（如果下雨）', 'jemur pakaian（晾衣服）', 'di dalam（在里面）'] },
};

function between(source: string, heading: string, stops: string[]) {
  const stop = stops.map((item) => `^${item}`).join('|');
  return source.match(new RegExp(`^${heading}\\s*\\r?\\n(.*?)(?=${stop}|^[-]{3,}|(?![\\s\\S]))`, 'ms'))?.[1]?.trim() ?? '';
}

function firstIndonesianLine(source: string) {
  const start = source.indexOf(indonesianFlag);
  if (start < 0) return '';
  return source
    .slice(start + indonesianFlag.length)
    .replace(/^\s*\r?\n/, '')
    .split(/\r?\n[-]{3,}/)[0]
    .split(legacyContentMarker)[0]
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

function parse(id: string): NannyExperience | undefined {
  const file = path.join(sourceDir, `${id}.md`);
  if (!fs.existsSync(file)) return undefined;
  const source = fs.readFileSync(file, 'utf8');
  const sceneStops = ['User Goal', 'Business Value', 'Frequency', 'Difficulty', ...actorMarkers, indonesianFlag];
  const task = between(source, 'Task', sceneStops);
  const indonesian = dialogueOverrides[id] ?? firstIndonesianLine(source);
  const explanation = between(source, 'Story Background', ['Task', 'User Goal']) || between(source, 'User Goal', ['Business Value', 'Frequency', 'Difficulty', ...actorMarkers]) || task;
  const sourceHarvest = between(source, "Today's Harvest", ['Chinese Common Mistakes', 'Culture Tips', 'Real Tips', 'Emotional Intelligence', 'AI Coach', 'Why This Matters', 'Related Experience', 'Next Scene'])
    .split(/\r?\n/).map((line) => line.replace(/^-\s*/, '').trim()).filter((line) => Boolean(line) && !line.startsWith('---'));
  return task && indonesian && sourceHarvest.length ? { id, task, indonesian, chinese: task, explanation, harvest: harvestFromDialogue(sourceHarvest, indonesian) } : undefined;
}

export function getNannyExperiences(): NannyExperience[] {
  return Array.from({ length: 60 }, (_, index) => {
    const id = `EXP-NAN-${String(index + 1).padStart(3, '0')}`;
    const experience = parse(id) ?? additionalExperiences[id];
    return experience ? { ...experience, harvest: formatHarvest(experience.harvest, experience.indonesian) } : { id, task: '', indonesian: '', chinese: '', explanation: '', harvest: [], missing: true };
  });
}
