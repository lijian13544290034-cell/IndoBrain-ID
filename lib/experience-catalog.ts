import { getDriverExperiences } from '@/lib/driver-experiences';
import { getNannyExperiences } from '@/lib/nanny-experiences';
import { getFactoryExperiences } from '@/lib/factory-experiences';
import { getLifeExperiences } from '@/lib/life-experiences';
import { moduleExperiences, moduleMeta } from '@/lib/module-experiences';

export type CatalogExperience = { id: string; task: string; indonesian: string; harvest: string[]; module: string; category: string; href: string };

export function getExperienceCatalog(): CatalogExperience[] {
  const driver = getDriverExperiences().filter((item) => !item.missing && item.indonesian).map((item) => ({ id: item.id, task: item.task, indonesian: item.indonesian, harvest: item.harvest, module: 'Sopir', category: '司机', href: `/driver/${item.id.slice(-3)}` }));
  const nanny = getNannyExperiences().filter((item) => !item.missing && item.indonesian).map((item) => ({ id: item.id, task: item.task, indonesian: item.indonesian, harvest: item.harvest, module: 'ART', category: '保姆', href: `/nanny/${item.id.slice(-3)}` }));
  const manager = getFactoryExperiences().filter((item) => item.indonesian).map((item) => ({ id: item.id, task: item.task, indonesian: item.indonesian, harvest: item.harvest, module: 'Manajer Pabrik', category: '工厂经理', href: `/factory/manager/${item.id.slice(-3)}` }));
  const factoryRoles = Object.entries(moduleExperiences).filter(([role]) => !['driver', 'nanny'].includes(role)).flatMap(([role, items]) => items.filter((item) => item.indonesian).map((item) => ({ id: item.id, task: item.task, indonesian: item.indonesian, harvest: item.harvest, module: moduleMeta[role as keyof typeof moduleMeta].indonesian, category: moduleMeta[role as keyof typeof moduleMeta].chinese, href: `/module/${role}/${item.id.slice(-3)}` })));
  const life = getLifeExperiences().filter((item) => item.indonesian).map((item) => ({ id: item.id, task: item.task, indonesian: item.indonesian, harvest: item.harvest, module: 'Life', category: item.category, href: `/life/${item.id.slice(-3)}` }));
  return [...driver, ...nanny, ...manager, ...factoryRoles, ...life];
}
