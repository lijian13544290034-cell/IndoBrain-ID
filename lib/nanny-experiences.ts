import fs from 'node:fs';
import path from 'node:path';

export type NannyExperience = { id: string; task: string; indonesian: string; chinese: string; explanation: string; harvest: string[]; missing?: boolean };
const sourceDir = path.join(process.cwd(), '03_Experience_Base', 'Experience');
const actorMarkers = [String.fromCodePoint(0x1f468), String.fromCodePoint(0x1f469)];
const indonesianFlag = String.fromCodePoint(0x1f1ee, 0x1f1e9);
const legacyContentMarker = String.fromCodePoint(0x1f50a);

function between(source: string, heading: string, stops: string[]) {
  const stop = stops.map((item) => `^${item}`).join('|');
  return source.match(new RegExp(`^${heading}\\s*\\r?\\n(.*?)(?=${stop}|^[-]{3,}|(?![\\s\\S]))`, 'ms'))?.[1]?.trim() ?? '';
}

function firstIndonesianBlock(source: string) {
  const start = source.indexOf(indonesianFlag);
  if (start < 0) return '';

  // A formal source can wrap a single spoken turn across several lines.
  // Keep that complete turn rather than presenting a misleading fragment.
  return source
    .slice(start + indonesianFlag.length)
    .replace(/^\s*\r?\n/, '')
    .split(/\r?\n[-]{3,}/)[0]
    .split(legacyContentMarker)[0]
    .trim()
    .replace(/\s*\r?\n\s*/g, ' ');
}

function parse(id: string): NannyExperience | undefined {
  const file = path.join(sourceDir, `${id}.md`);
  if (!fs.existsSync(file)) return undefined;
  const source = fs.readFileSync(file, 'utf8');
  const sceneStops = ['User Goal', 'Business Value', 'Frequency', 'Difficulty', ...actorMarkers, indonesianFlag];
  const task = between(source, 'Task', sceneStops);
  const indonesian = firstIndonesianBlock(source);
  const explanation = between(source, 'Story Background', ['Task', 'User Goal']) || between(source, 'User Goal', ['Business Value', 'Frequency', 'Difficulty', ...actorMarkers]) || task;
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
