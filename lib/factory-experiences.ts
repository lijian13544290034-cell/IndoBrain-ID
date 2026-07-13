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

function harvestFromDialogue(harvest: string[], dialogue: string) {
  const normalizedDialogue = dialogue.toLocaleLowerCase();
  return harvest.filter((entry) => {
    const term = entry.replace(/^[-*\s]+/, '').split(/[（(]/)[0]?.trim().toLocaleLowerCase();
    return Boolean(term) && normalizedDialogue.includes(term);
  });
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
      const indonesian = firstIndonesianLine(content, taskSection);
      const explanation = content.match(/## Story Background\s*\r?\n([\s\S]*?)(?=\r?\n## |$)/)?.[1]?.trim();
      const harvestSection = content.match(/## Today's Harvest\s*\r?\n([\s\S]*?)(?=\r?\n## |$)/)?.[1] ?? '';
      const sourceHarvest = harvestSection
        .split(/\r?\n/)
        .map((line) => line.replace(/^-\s*/, '').trim())
        .filter(Boolean);
      const supplemental = factorySupplemental[match[1]];
      const harvest = harvestFromDialogue(sourceHarvest.length ? sourceHarvest : (supplemental?.harvest ?? []), indonesian);

      return { id: match[1], content, task, indonesian, explanation: explanation ?? supplemental?.explanation, harvest };
    })
    .filter(({ id }) => Number(id.slice(-3)) >= 1)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getFactoryExperience(id: string) {
  return getFactoryExperiences().find((experience) => experience.id === `EXP-FAC-${id}`);
}
