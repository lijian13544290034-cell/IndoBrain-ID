import type { WorkplacePattern } from '@/lib/workplace-patterns';

export type GoldenSceneLine = {
  speaker: string;
  indonesian: string;
  chinese: string;
};

export type GoldenScenePair = {
  indonesian: string;
  chinese: string;
};

export type GoldenSceneContent = {
  situation: string;
  dialogue: GoldenSceneLine[];
  replies: GoldenScenePair[];
  variations: GoldenScenePair[];
  localUsage?: GoldenScenePair;
  easyMistake?: GoldenScenePair;
  trySay: GoldenScenePair;
};

export type GoldenLifeExperience = {
  id: string;
  category: 'rumah-harian';
  task: string;
  chinese: string;
  indonesian: string;
  explanation: string;
  harvest: string[];
  pattern: WorkplacePattern;
  goldenScene: GoldenSceneContent;
};

