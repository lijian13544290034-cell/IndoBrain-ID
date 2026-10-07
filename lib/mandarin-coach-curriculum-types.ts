export type MandarinCoachCourseSource = 'MANDARIN_WORK_LEVEL_1' | 'MANDARIN_WORK_LEVEL_2' | 'GOLDEN_QUANTITY';

export type MandarinCoachCurriculumExpression = {
  id: string;
  chinese: string;
  pinyin: string;
  indonesian: string;
  chunks: ReadonlyArray<{ chinese: string; pinyin: string }>;
  kind: 'NEW' | 'CORE' | 'REVIEW' | 'COMBINATION' | 'LISTENING' | 'DIALOGUE';
};

export type MandarinCoachCurriculumTurn = {
  role: string;
  chinese: string;
  pinyin: string;
};

export type MandarinCoachCurriculumLesson = {
  id: string;
  source: MandarinCoachCourseSource;
  courseTitle: string;
  courseTitleId: string;
  group: string;
  day: number | null;
  title: string;
  scenario: string;
  expressions: MandarinCoachCurriculumExpression[];
  dialogue: MandarinCoachCurriculumTurn[];
};

export type MandarinCoachCatalogEntry = Pick<MandarinCoachCurriculumLesson, 'id' | 'source' | 'courseTitle' | 'courseTitleId' | 'group' | 'day' | 'title' | 'scenario'> & {
  expressionCount: number;
  locked: boolean;
};

export type MandarinCoachCurriculumPayload = {
  catalog: MandarinCoachCatalogEntry[];
  lessons: MandarinCoachCurriculumLesson[];
  inventory: {
    direction: 'INDONESIAN_TO_MANDARIN';
    courses: number;
    days: number;
    topics: number;
    lessons: number;
    expressions: number;
  };
};
