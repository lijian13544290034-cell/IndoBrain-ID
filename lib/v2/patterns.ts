import type { PatternV2 } from '@/lib/v2/content-foundation';

/** Compatibility inventory for the three existing PatternBuilder frames. */
export const legacyPatternV2Examples: readonly PatternV2[] = [
  {
    id: 'PAT-REQUEST-001', titleZh: '请求购买', templateId: 'legacy-buy', explanationZh: '使用受控商品词槽提出购买请求。',
    slots: [{ id: 'product', labelZh: '商品' }], examples: [{ textId: 'Tolong beli susu ya.', textZh: '请买牛奶。' }],
    tags: ['请求', '购物'], difficultyLevel: 'L1', requiredMembershipTier: 'TRIAL',
  },
  {
    id: 'PAT-TRANSPORT-001', titleZh: '预约接送', templateId: 'legacy-pickup', explanationZh: '使用受控时间词槽安排接送。',
    slots: [{ id: 'time', labelZh: '时间' }], examples: [{ textId: 'Besok jemput saya jam tujuh ya.', textZh: '明天七点来接我。' }],
    tags: ['交通', '预约'], difficultyLevel: 'L1', requiredMembershipTier: 'TRIAL',
  },
  {
    id: 'PAT-FACTORY-001', titleZh: '生产安排', templateId: 'legacy-factory', explanationZh: '使用受控产品和数量词槽说明生产安排。',
    slots: [{ id: 'product', labelZh: '产品' }, { id: 'quantity', labelZh: '数量' }], examples: [{ textId: 'Hari ini kita produksi kursi sebanyak 500.', textZh: '今天我们生产 500 把椅子。' }],
    tags: ['工厂', '安排'], difficultyLevel: 'L3', requiredMembershipTier: 'PRO',
  },
];
