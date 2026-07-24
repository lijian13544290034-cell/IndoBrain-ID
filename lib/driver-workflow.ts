export const driverWorkflow = [
  { slug: 'jemput', indonesian: 'Penjemputan', chinese: '接送', ids: [1, 2, 9, 13, 20, 30] },
  { slug: 'perjalanan', indonesian: 'Perjalanan', chinese: '行程', ids: [3, 4, 5, 6, 18, 19] },
  { slug: 'menunggu', indonesian: 'Menunggu', chinese: '等待与停车', ids: [7, 8, 10, 11, 14] },
  { slug: 'kunjungan', indonesian: 'Kunjungan', chinese: '拜访与生活', ids: [12, 15, 16, 36, 38, 40] },
  { slug: 'lanjutan', indonesian: 'Lanjutan', chinese: '后续场景', ids: [17, 21, 22, 23, 24, 25, 26, 27, 28, 29, 37, 39] },
] as const;

export type DriverWorkflowSlug = (typeof driverWorkflow)[number]['slug'];

export function isDriverWorkflow(value: string | undefined): value is DriverWorkflowSlug {
  return driverWorkflow.some((workflow) => workflow.slug === value);
}

export function getDriverWorkflow(id: string) {
  const number = Number(id.slice(-3));
  return driverWorkflow.find((workflow) => (workflow.ids as readonly number[]).includes(number));
}
