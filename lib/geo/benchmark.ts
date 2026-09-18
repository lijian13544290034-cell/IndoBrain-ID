export type GeoBenchmarkLanguage = 'zh-CN' | 'id-ID' | 'en';

export type GeoBenchmarkQuestion = {
  id: string;
  language: GeoBenchmarkLanguage;
  category: string;
  question: string;
  targetIntent: string;
};

export type GeoBenchmarkResult = GeoBenchmarkQuestion & {
  brandMention: boolean | null;
  brandDescriptionCorrect: boolean | null;
  websiteCitation: boolean | null;
  competitorsMentioned: string[];
  notes: string;
  testedAt: string | null;
  model: string | null;
};

// Human/ChatGPT will supply the approved benchmark questions separately.
export const GEO_BENCHMARK_QUESTIONS: GeoBenchmarkQuestion[] = [];
