const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

export const lifeWorkflow = [
  { slug: 'friends', indonesian: 'Teman', chinese: '朋友', ids: [...range(1, 70), 140, 141, 142, 143] },
  { slug: 'basics', indonesian: 'Layanan Harian', chinese: '日常服务', ids: range(104, 132) },
  { slug: 'supermarket', indonesian: 'Supermarket', chinese: '超市', ids: [...range(83, 92), 133, 134, 135, 136] },
  { slug: 'restaurant', indonesian: 'Restoran', chinese: '餐厅', ids: [...range(93, 103), 137, 138, 139] },
  { slug: 'business', indonesian: 'Bisnis', chinese: '商务沟通', ids: range(144, 173) },
  { slug: 'dating', indonesian: 'Kencan', chinese: '恋爱交友', ids: range(174, 223) },
  { slug: 'rumah-harian', indonesian: 'Rumah Harian', chinese: '居家日常', ids: [224, 225, 226, 227, 228, 229, 230, 231, 232, 233] },
  { slug: 'urusan-rumah', indonesian: 'Urusan Rumah', chinese: '家务沟通', ids: [234, 235, 236, 237, 238, 239, 240, 241, 242] },
  { slug: 'masak-makan', indonesian: 'Masak & Makan', chinese: '吃饭做饭', ids: [243, 244, 245, 246, 247, 248, 249, 250] },
  { slug: 'belanja-konsumsi', indonesian: 'Belanja & Konsumsi', chinese: '购物消费', ids: [251, 252, 253, 254, 255, 256, 257, 258] },
  { slug: 'antar-persediaan', indonesian: 'Antar & Persediaan', chinese: '外卖与补给', ids: [259, 260, 261, 262, 263, 264, 265] },
  { slug: 'masalah-rumah', indonesian: 'Masalah Rumah', chinese: '生活问题', ids: [266, 267, 268, 269, 270, 271, 272, 273] },
] as const;

export type LifeWorkflowSlug = (typeof lifeWorkflow)[number]['slug'];

export function isLifeWorkflow(value: string | undefined): value is LifeWorkflowSlug {
  return lifeWorkflow.some((workflow) => workflow.slug === value);
}

export function getLifeWorkflow(id: string) {
  const number = Number(id.slice(-3));
  return lifeWorkflow.find((workflow) => (workflow.ids as readonly number[]).includes(number));
}

