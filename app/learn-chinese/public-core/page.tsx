import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import PublicCoreExperience, { type PublicCoreExpression } from '@/components/PublicCoreExperience';
import candidatePackage from '@/content/public-core-30/public_core_30_review.json';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '30 Kalimat Mandarin Sehari-hari · IndoBrain Preview',
  description: 'Preview internal kursus Mandarin sehari-hari untuk pemula Indonesia.',
  robots: { index: false, follow: false },
};

const sourceCommit = 'c7f8083097260da89e797b89484af9318806d453';

function candidateIsValid() {
  return candidatePackage.direction === 'ID_TO_ZH'
    && candidatePackage.contentType === 'PUBLIC_HIGH_FREQUENCY'
    && candidatePackage.reviewStatus === 'REVIEW_PASSED'
    && candidatePackage.course.id === 'mandarin-public-core-30'
    && candidatePackage.expressions.length === 30
    && new Set(candidatePackage.expressions.map((item) => item.id)).size === 30;
}

export default async function PublicCorePage() {
  const requestHeaders = await headers();
  const hostname = (requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? '').split(':')[0].toLowerCase();
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const isPreviewRuntime = process.env.VERCEL_ENV === 'preview';
  const isProductionDomain = hostname === 'indobrain.app' || hostname === 'www.indobrain.app';

  if ((!isLocal && !isPreviewRuntime) || isProductionDomain || !candidateIsValid()) notFound();

  return <PublicCoreExperience expressions={candidatePackage.expressions as PublicCoreExpression[]} sourceCommit={sourceCommit} />;
}
