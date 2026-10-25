import 'server-only';

import type { MandarinSupplementalCoursePackageV1 } from '@/lib/mandarin-course-import-types';
import approvedPublicCore30 from '@/content/public-core-30/public_core_30_review.json';

export const mandarinV2ReviewedPackages: readonly MandarinSupplementalCoursePackageV1[] = [
  approvedPublicCore30 as MandarinSupplementalCoursePackageV1,
];
