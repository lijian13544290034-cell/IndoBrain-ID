import fs from 'node:fs';
import path from 'node:path';

export type FactoryExperience = {
  id: string;
  content: string;
  task: string;
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
      const task = content.match(/## Task\s*\n\s*([^\n]+)/)?.[1]?.trim() ?? '';

      return { id: match[1], content, task };
    })
    .filter(({ id }) => Number(id.slice(-3)) >= 1)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getFactoryExperience(id: string) {
  return getFactoryExperiences().find((experience) => experience.id === `EXP-FAC-${id}`);
}
