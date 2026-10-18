export type MandarinSupplementalContentType = 'PUBLIC_HIGH_FREQUENCY' | 'PRACTICAL_SENTENCE' | 'CAREER_SCENARIO';
export type MandarinSupplementalAccessTier = 'FREE' | 'LEVEL_2';

export type MandarinSupplementalExpressionV1 = {
  id: string;
  chinese: string;
  pinyin: string;
  indonesian: string;
  ttsText: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
};

export type MandarinSupplementalScenarioV1 = {
  occupations: string[];
  roles: Array<{
    id: string;
    titleZh: string;
    titleId: string;
  }>;
  dialogueTurns: Array<{
    id: string;
    roleId: string;
    expressionId: string;
  }>;
  commonQuestionExpressionIds: string[];
  variableExercises: Array<{
    id: string;
    variableLabelId: string;
    templateExpressionId: string;
    optionExpressionIds: string[];
  }>;
};

export type MandarinSupplementalCoursePackageV1 = {
  version: 1;
  direction: 'ID_TO_ZH';
  contentType: MandarinSupplementalContentType;
  reviewStatus: 'HUMAN_APPROVED';
  reviewReference: string;
  course: {
    id: string;
    titleZh: string;
    titleId: string;
    groupId: string;
    scenarioId: string;
    accessTier: MandarinSupplementalAccessTier;
    requiresPermission: 'mandarin.level2.access' | null;
    pathway: {
      mode: 'SUPPLEMENTAL';
      recommendedAfterLessonId: string | null;
      prerequisiteLessonIds: string[];
    };
  };
  expressions: MandarinSupplementalExpressionV1[];
  scenario?: MandarinSupplementalScenarioV1;
};
