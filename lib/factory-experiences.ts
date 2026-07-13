import fs from 'node:fs';
import path from 'node:path';

export type FactoryExperience = {
  id: string;
  content: string;
  task: string;
  indonesian: string;
  explanation?: string;
  harvest: string[];
};

const experiencePath = path.join(
  process.cwd(),
  'experience',
  'factory',
  'manager',
  'Factory_Manager_Experience.md',
);

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
      const indonesianFromMarker = content.match(/\*\*🇮🇩\*\*\s*\r?\n\s*([^\r\n]+)/)?.[1]?.trim();
      const indonesianFromTask = taskSection
        .split(/\r?\n/)
        .map((line) => line.replace(/\*\*/g, '').trim())
        .find((line) => /[A-Za-z]/.test(line) && !/[\u3400-\u9FFF]/.test(line) && !line.startsWith('#')) ?? '';
      const indonesian = indonesianFromMarker ?? indonesianFromTask;
      const explanation = content.match(/## Story Background\s*\r?\n([\s\S]*?)(?=\r?\n## |$)/)?.[1]?.trim();
      const harvestSection = content.match(/## Today's Harvest\s*\r?\n([\s\S]*?)(?=\r?\n## |$)/)?.[1] ?? '';
      const harvest = harvestSection
        .split(/\r?\n/)
        .map((line) => line.replace(/^-\s*/, '').trim())
        .filter(Boolean);

      return { id: match[1], content, task, indonesian, explanation, harvest };
    })
    .filter(({ id }) => Number(id.slice(-3)) >= 1)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getFactoryExperience(id: string) {
  return getFactoryExperiences().find((experience) => experience.id === `EXP-FAC-${id}`);
}
