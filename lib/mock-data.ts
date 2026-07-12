export type Message = { id: string; role: 'assistant' | 'user'; text: string };
export type ChatProfile = { title: string; chineseTitle: string; roleType: 'driver' | 'nanny' | 'factory' | 'free' };
export const chatProfiles: Record<string, ChatProfile> = {
  driver: { title: 'Sopir', chineseTitle: '司机沟通', roleType: 'driver' },
  nanny: { title: 'ART', chineseTitle: '保姆沟通', roleType: 'nanny' },
  factory: { title: 'Pabrik', chineseTitle: '工厂管理', roleType: 'factory' },
  'ai-chat': { title: 'Chat Bebas', chineseTitle: '自由聊天', roleType: 'free' },
};
