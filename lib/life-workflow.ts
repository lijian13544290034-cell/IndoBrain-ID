export const lifeWorkflow = [
  { slug: 'friends', indonesian: 'Teman', chinese: '朋友', ids: Array.from({ length: 70 }, (_, index) => index + 1) },
  { slug: 'basics', indonesian: 'Dasar', chinese: '基础', ids: Array.from({ length: 12 }, (_, index) => index + 71) },
  { slug: 'supermarket', indonesian: 'Supermarket', chinese: '超市', ids: Array.from({ length: 10 }, (_, index) => index + 83) },
  { slug: 'restaurant', indonesian: 'Restoran', chinese: '餐厅', ids: Array.from({ length: 11 }, (_, index) => index + 93) },
] as const;

export type LifeWorkflowSlug = (typeof lifeWorkflow)[number]['slug'];

export function isLifeWorkflow(value: string | undefined): value is LifeWorkflowSlug {
  return lifeWorkflow.some((workflow) => workflow.slug === value);
}

export function getLifeWorkflow(id: string) {
  const number = Number(id.slice(-3));
  return lifeWorkflow.find((workflow) => (workflow.ids as readonly number[]).includes(number));
}
