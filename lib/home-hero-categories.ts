export type HomeHeroCategory = 'life' | 'travel' | 'restaurant' | 'business' | 'factory' | 'public-service' | 'social';

export const homeHeroCategories: Record<HomeHeroCategory, { label: string; chinese: string; heroImage: string }> = {
  life: { label: 'Life', chinese: '生活居家', heroImage: '/home-heroes/life.png' },
  travel: { label: 'Travel', chinese: '出行交通', heroImage: '/home-heroes/travel.png' },
  restaurant: { label: 'Restaurant', chinese: '餐饮消费', heroImage: '/home-heroes/restaurant.png' },
  business: { label: 'Business', chinese: '工作商务', heroImage: '/home-heroes/business.png' },
  factory: { label: 'Factory', chinese: '工厂', heroImage: '/home-heroes/factory.png' },
  'public-service': { label: 'Public Service', chinese: '公共服务', heroImage: '/home-heroes/public-service.png' },
  social: { label: 'Social', chinese: '社交休闲', heroImage: '/home-heroes/social.png' },
};
