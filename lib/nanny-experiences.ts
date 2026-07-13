import fs from 'node:fs';
import path from 'node:path';

export type NannyExperience = { id: string; task: string; indonesian: string; chinese: string; explanation: string; harvest: string[]; missing?: boolean };
const sourceDir = path.join(process.cwd(), '03_Experience_Base', 'Experience');

function between(source: string, heading: string, stops: string[]) {
  const stop = stops.map((item) => `^${item}`).join('|');
  return source.match(new RegExp(`^${heading}\\s*\\r?\\n(.*?)(?=${stop}|^[-]{3,}|(?![\\s\\S]))`, 'ms'))?.[1]?.trim() ?? '';
}

function parse(id: string): NannyExperience | undefined {
  const file = path.join(sourceDir, `${id}.md`);
  if (!fs.existsSync(file)) return undefined;
  const source = fs.readFileSync(file, 'utf8');
  const task = between(source, 'Task', ['User Goal', 'Business Value', 'Frequency', 'Difficulty', '👨', '👩', '🇮🇩']);
  const indonesian = source.match(/🇮🇩\s*\r?\n\s*([^\r\n]+)/)?.[1]?.trim() ?? '';
  const explanation = between(source, 'Story Background', ['Task', 'User Goal']) || between(source, 'User Goal', ['Business Value', 'Frequency', 'Difficulty', '👨', '👩']) || task;
  const harvest = between(source, "Today's Harvest", ['Chinese Common Mistakes', 'Culture Tips', 'Real Tips', 'Emotional Intelligence', 'AI Coach', 'Why This Matters', 'Related Experience', 'Next Scene'])
    .split(/\r?\n/).map((line) => line.replace(/^-\s*/, '').trim()).filter((line) => Boolean(line) && !line.startsWith('---'));
  return task && indonesian && harvest.length ? { id, task, indonesian, chinese: task, explanation, harvest } : undefined;
}

export function getNannyExperiences(): NannyExperience[] {
  return Array.from({ length: 50 }, (_, index) => {
    const id = `EXP-NAN-${String(index + 1).padStart(3, '0')}`;
    return parse(id) ?? { id, task: '', indonesian: '', chinese: '', explanation: '', harvest: [], missing: true };
  });
}
