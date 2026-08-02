export type HomeHeroCategory = 'life' | 'travel' | 'restaurant' | 'business' | 'factory' | 'public-service' | 'social';

export const homeHeroCategories: Record<HomeHeroCategory, {
  label: string;
  chinese: string;
  heroImage: string;
}> = {
  life: { label: 'Life', chinese: '生活', heroImage: '/home-heroes/life.svg' },
  travel: { label: 'Travel', chinese: '出行', heroImage: '/home-heroes/travel.svg' },
  restaurant: { label: 'Restaurant', chinese: '餐厅', heroImage: '/home-heroes/restaurant.svg' },
  business: { label: 'Business', chinese: '商务', heroImage: '/home-heroes/business.svg' },
  factory: { label: 'Factory', chinese: '工厂', heroImage: '/home-heroes/factory.svg' },
  'public-service': { label: 'Public Service', chinese: '公共服务', heroImage: '/home-heroes/public-service.svg' },
  social: { label: 'Social', chinese: '社交', heroImage: '/home-heroes/social.svg' },
};
