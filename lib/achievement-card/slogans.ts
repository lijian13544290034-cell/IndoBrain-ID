export type AchievementCardSlogan = {
  id: 'phonetic' | 'speak-up' | 'beyond-halo';
  lines: string[];
};

export const achievementCardSlogans: AchievementCardSlogan[] = [
  {
    id: 'phonetic',
    lines: ['我一直以为印尼语很难，', '原来就是拼音的读法。'],
  },
  {
    id: 'speak-up',
    lines: ['我已经开口了。'],
  },
  {
    id: 'beyond-halo',
    lines: ['在印尼，不再只会说 Halo。'],
  },
];

export const defaultAchievementCardSloganId: AchievementCardSlogan['id'] = 'phonetic';

