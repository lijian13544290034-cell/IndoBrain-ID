import { getDriverExperiences } from '@/lib/driver-experiences';
import { getNannyExperiences } from '@/lib/nanny-experiences';
import { getFactoryExperiences } from '@/lib/factory-experiences';
import { getLifeExperiences } from '@/lib/life-experiences';
import { moduleExperiences, moduleMeta } from '@/lib/module-experiences';
import { getChineseExperiences } from '@/lib/chinese-experiences';

export type CatalogExperience = { id: string; task: string; indonesian: string; module: string; category: string; href: string; audioLanguage?: 'indonesian' | 'chinese' };

export function getExperienceCatalog(): CatalogExperience[] {
  const driver = getDriverExperiences().filter((item) => !item.missing && item.indonesian).map((item) => ({ id: item.id, task: item.task, indonesian: item.indonesian, module: 'Sopir', category: '司机', href: `/driver/${item.id.slice(-3)}` }));
  const nanny = getNannyExperiences().filter((item) => !item.missing && item.indonesian).map((item) => ({ id: item.id, task: item.task, indonesian: item.indonesian, module: 'ART', category: '保姆', href: `/nanny/${item.id.slice(-3)}` }));
  const manager = getFactoryExperiences().filter((item) => item.indonesian).map((item) => ({ id: item.id, task: item.task, indonesian: item.indonesian, module: 'Manajer Pabrik', category: '工厂经理', href: `/factory/manager/${item.id.slice(-3)}` }));
  const factoryRoles = Object.entries(moduleExperiences).filter(([role]) => !['driver', 'nanny'].includes(role)).flatMap(([role, items]) => items.filter((item) => item.indonesian).map((item) => ({ id: item.id, task: item.task, indonesian: item.indonesian, module: moduleMeta[role as keyof typeof moduleMeta].indonesian, category: moduleMeta[role as keyof typeof moduleMeta].chinese, href: `/module/${role}/${item.id.slice(-3)}` })));
  const life = getLifeExperiences().filter((item) => item.indonesian).map((item) => ({ id: item.id, task: item.task, indonesian: item.indonesian, module: 'Life', category: item.category, href: `/life/${item.id.slice(-3)}` }));
  return [...driver, ...nanny, ...manager, ...factoryRoles, ...life];
}

/** Separate catalog for Indonesian learners of Chinese; item IDs use the ID_TO_ZH namespace. */
export function getChineseExperienceCatalog(): CatalogExperience[] {
  return getChineseExperiences().map((item) => ({
    id: item.id,
    task: item.title,
    indonesian: item.dialogue[0]?.chinese ?? item.title,
    module: '中文沟通',
    category: item.category,
    href: `/chinese/${item.id}`,
    audioLanguage: 'chinese',
  }));
}
