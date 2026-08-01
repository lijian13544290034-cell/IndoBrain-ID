import type { LifeWorkflowSlug } from '@/lib/life-workflow';

export const lifeContentUpdates: ReadonlyArray<{
  id: string;
  category: LifeWorkflowSlug;
  title: string;
  chinese: string;
  addedCount: number;
  version: string;
  publishedAt: string;
}> = [
  {
    id: 'v1-5-business',
    category: 'business',
    title: 'Komunikasi Bisnis',
    chinese: '商务沟通',
    addedCount: 30,
    version: 'V1.5',
    publishedAt: '2026-08-01',
  },
  {
    id: 'v1-5-dating',
    category: 'dating',
    title: 'Kencan',
    chinese: '恋爱交流',
    addedCount: 50,
    version: 'V1.5',
    publishedAt: '2026-08-01',
  },
];
