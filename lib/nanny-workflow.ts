export const nannyWorkflow = [
  { slug: 'makan', indonesian: 'Makan & Minum', chinese: '饮食', ids: [5, 6, 7, 8, 21, 22, 25, 26, 29, 31, 34, 37, 38, 44, 45, 59] },
  { slug: 'rumah', indonesian: 'Pekerjaan Rumah', chinese: '家务', ids: [11, 12, 13, 23, 33, 42, 43, 56, 60] },
  { slug: 'anak', indonesian: 'Anak & Keluarga', chinese: '孩子与家庭', ids: [14, 15, 16, 30, 35, 36, 39, 40, 57] },
  { slug: 'belanja', indonesian: 'Belanja & Tamu', chinese: '采购与待客', ids: [9, 10, 24, 27, 28, 41, 58] },
  { slug: 'kerja', indonesian: 'Pengaturan Kerja', chinese: '工作安排', ids: [17, 18, 19, 20, 32, 46, 47, 48, 49, 50] },
] as const;

export type NannyWorkflowSlug = (typeof nannyWorkflow)[number]['slug'];
export const isNannyWorkflow = (value: string | undefined): value is NannyWorkflowSlug => nannyWorkflow.some((item) => item.slug === value);
export const getNannyWorkflow = (id: string) => nannyWorkflow.find((item) => (item.ids as readonly number[]).includes(Number(id.slice(-3))));
