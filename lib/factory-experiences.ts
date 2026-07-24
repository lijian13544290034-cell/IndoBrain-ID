import fs from 'node:fs';
import path from 'node:path';

export type FactoryExperience = {
  id: string;
  content: string;
  task: string;
  indonesian: string;
};

const experiencePath = path.join(
  process.cwd(),
  'experience',
  'factory',
  'manager',
  'Factory_Manager_Experience.md',
);

function unmarkedIndonesianLines(content: string) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 1)
    .filter((line) => /^[\x00-\x7F]+$/.test(line))
    .filter((line) => /[A-Za-z]/.test(line))
    .filter((line) => !line.startsWith('#') && !line.startsWith('**') && line !== '---')
    .join('\n');
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
      const task = content.match(/## Task\s*\n\s*([^\n]+)/)?.[1]?.trim() ?? '';
      const markedIndonesian = [...content.matchAll(/\*\*🇮🇩\*\*\s*\n\s*([\s\S]*?)(?=\n---)/g)]
        .map((match) => match[1].trim())
        .join('\n');
      const indonesian = markedIndonesian || unmarkedIndonesianLines(content);

      return { id: match[1], content, task, indonesian };
    })
    .filter(({ id }) => Number(id.slice(-3)) >= 1)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getFactoryExperience(id: string) {
  return getFactoryExperiences().find((experience) => experience.id === `EXP-FAC-${id}`);
}
