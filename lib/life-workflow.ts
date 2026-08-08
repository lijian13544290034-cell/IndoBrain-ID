const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

export const lifeWorkflow = [
  { slug: 'friends', indonesian: 'Teman', chinese: '朋友', ids: [...range(1, 70), 140, 141, 142, 143] },
  { slug: 'basics', indonesian: 'Layanan Harian', chinese: '日常服务', ids: range(104, 132) },
  { slug: 'supermarket', indonesian: 'Supermarket', chinese: '超市', ids: [...range(83, 92), 133, 134, 135, 136] },
  { slug: 'restaurant', indonesian: 'Restoran', chinese: '餐厅', ids: [...range(93, 103), 137, 138, 139] },
  { slug: 'business', indonesian: 'Bisnis', chinese: '商务沟通', ids: range(144, 173) },
  { slug: 'dating', indonesian: 'Kencan', chinese: '恋爱交友', ids: range(174, 223) },
  { slug: 'home', indonesian: 'Rumah', chinese: '生活居家', ids: range(224, 273) },
] as const;

export type LifeWorkflowSlug = (typeof lifeWorkflow)[number]['slug'];

export function isLifeWorkflow(value: string | undefined): value is LifeWorkflowSlug {
  return lifeWorkflow.some((workflow) => workflow.slug === value);
}

export function getLifeWorkflow(id: string) {
  const number = Number(id.slice(-3));
  return lifeWorkflow.find((workflow) => (workflow.ids as readonly number[]).includes(number));
}
