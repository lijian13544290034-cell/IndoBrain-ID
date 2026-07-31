export const factoryWorkflow = [
  { slug: 'produksi', indonesian: 'Produksi', chinese: '生产', ids: [1, 2, 3, 21, 22, 23, 24, 27, 28, 29, 30, 31, 32, 35, 38, 39, 40, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 73, 74, 75, 76, 77, 78, 79, 80] },
  { slug: 'kualitas', indonesian: 'Kualitas', chinese: '品质', ids: [4, 33, 42, 55, 56, 57, 58, 59, 60] },
  { slug: 'keamanan', indonesian: 'Keamanan', chinese: '安全', ids: [34, 69, 70, 71, 72] },
  { slug: 'material', indonesian: 'Material', chinese: '原材料', ids: [5, 25, 26, 37, 61, 62, 63, 64] },
  { slug: 'pengiriman', indonesian: 'Pengiriman', chinese: '交付', ids: [6, 7, 8, 9, 10, 65, 66, 67, 68] },
  { slug: 'ekspor', indonesian: 'Ekspor', chinese: '出口', ids: [11, 12, 13, 14] },
  { slug: 'pelanggan', indonesian: 'Pelanggan', chinese: '客户', ids: [15, 16, 17, 18, 19, 20, 36, 41, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90] },
] as const;

export type FactoryWorkflowSlug = (typeof factoryWorkflow)[number]['slug'];

export function getWorkflowForExperience(id: string) {
  const number = Number(id.slice(-3));
  return factoryWorkflow.find((stage) => (stage.ids as readonly number[]).includes(number));
}

export function isFactoryWorkflow(value: string | undefined): value is FactoryWorkflowSlug {
  return factoryWorkflow.some((stage) => stage.slug === value);
}
