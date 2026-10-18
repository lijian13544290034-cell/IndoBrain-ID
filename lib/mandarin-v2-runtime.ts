import type {
  MandarinSupplementalContentType,
  MandarinSupplementalCoursePackageV1,
  MandarinSupplementalExpressionV1,
  MandarinSupplementalScenarioV1,
} from '@/lib/mandarin-course-import-types';

export type MandarinV2CatalogEntry = {
  id: string;
  contentType: MandarinSupplementalContentType;
  titleZh: string;
  titleId: string;
  groupId: string;
  scenarioId: string;
  difficulty: 1 | 2 | 3;
  expressionCount: number;
  accessTier: 'FREE' | 'LEVEL_2';
  day: null;
  locked: boolean;
};

export type MandarinV2Course = Omit<MandarinV2CatalogEntry, 'expressionCount' | 'locked'> & {
  expressions: MandarinSupplementalExpressionV1[];
  scenario?: MandarinSupplementalScenarioV1;
  pathway: MandarinSupplementalCoursePackageV1['course']['pathway'];
};

export type MandarinV2RuntimePayload = {
  catalog: MandarinV2CatalogEntry[];
  courses: MandarinV2Course[];
};

const supportedTypes = new Set<MandarinSupplementalContentType>([
  'PUBLIC_HIGH_FREQUENCY',
  'PRACTICAL_SENTENCE',
  'CAREER_SCENARIO',
]);

export function mandarinV2FavoriteId(expressionId: string) {
  return `mandarin-v2:${expressionId}`;
}

export function isReviewedMandarinV2Package(value: MandarinSupplementalCoursePackageV1) {
  if (value.version !== 1 || value.direction !== 'ID_TO_ZH' || value.reviewStatus !== 'HUMAN_APPROVED') return false;
  if (!value.reviewReference.trim() || !supportedTypes.has(value.contentType)) return false;
  if ('day' in value.course || 'dayNumber' in value.course || value.course.pathway.mode !== 'SUPPLEMENTAL') return false;
  if (value.contentType === 'PUBLIC_HIGH_FREQUENCY' && value.course.accessTier !== 'FREE') return false;
  if (value.course.accessTier === 'LEVEL_2' && value.course.requiresPermission !== 'mandarin.level2.access') return false;
  if (value.course.accessTier === 'FREE' && value.course.requiresPermission !== null) return false;
  return value.expressions.length > 0;
}

function difficultyFor(expressions: MandarinSupplementalExpressionV1[]): 1 | 2 | 3 {
  return expressions.reduce<1 | 2 | 3>((highest, expression) => Math.max(highest, expression.difficulty) as 1 | 2 | 3, 1);
}

function toCatalog(coursePackage: MandarinSupplementalCoursePackageV1, levelTwoAuthorized: boolean): MandarinV2CatalogEntry {
  return {
    id: coursePackage.course.id,
    contentType: coursePackage.contentType,
    titleZh: coursePackage.course.titleZh,
    titleId: coursePackage.course.titleId,
    groupId: coursePackage.course.groupId,
    scenarioId: coursePackage.course.scenarioId,
    difficulty: difficultyFor(coursePackage.expressions),
    expressionCount: coursePackage.expressions.length,
    accessTier: coursePackage.course.accessTier,
    day: null,
    locked: coursePackage.course.accessTier === 'LEVEL_2' && !levelTwoAuthorized,
  };
}

function toCourse(coursePackage: MandarinSupplementalCoursePackageV1): MandarinV2Course {
  return {
    id: coursePackage.course.id,
    contentType: coursePackage.contentType,
    titleZh: coursePackage.course.titleZh,
    titleId: coursePackage.course.titleId,
    groupId: coursePackage.course.groupId,
    scenarioId: coursePackage.course.scenarioId,
    difficulty: difficultyFor(coursePackage.expressions),
    accessTier: coursePackage.course.accessTier,
    day: null,
    expressions: coursePackage.expressions,
    scenario: coursePackage.scenario,
    pathway: coursePackage.course.pathway,
  };
}

export function buildMandarinV2Runtime(
  packages: readonly MandarinSupplementalCoursePackageV1[],
  levelTwoAuthorized: boolean,
): MandarinV2RuntimePayload {
  const reviewed = packages.filter(isReviewedMandarinV2Package);
  return {
    catalog: reviewed.map((coursePackage) => toCatalog(coursePackage, levelTwoAuthorized)),
    courses: reviewed
      .filter((coursePackage) => coursePackage.course.accessTier === 'FREE' || levelTwoAuthorized)
      .map(toCourse),
  };
}

export type MandarinV2CoachReference = {
  courseId: string;
  contentType: MandarinSupplementalContentType;
  expressionIds: string[];
};

export function buildMandarinV2CoachReferences(payload: MandarinV2RuntimePayload): MandarinV2CoachReference[] {
  return payload.courses.map((course) => ({
    courseId: course.id,
    contentType: course.contentType,
    expressionIds: course.expressions.map((expression) => expression.id),
  }));
}
