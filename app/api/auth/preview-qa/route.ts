import { NextResponse } from 'next/server';
import {
  createPreviewQaSession,
  isPreviewQaEnabled,
  previewQaCookieMaxAge,
  previewQaCookieName,
} from '@/lib/account/preview-qa';

export const runtime = 'nodejs';

const DEFAULT_REVIEW_PATH = '/learn-chinese';
const REVIEW_PATH_PREFIXES = ['/learn-chinese'];

function reviewPath(request: Request) {
  const requestUrl = new URL(request.url);
  const requested = requestUrl.searchParams.get('next');
  if (!requested?.startsWith('/') || requested.startsWith('//')) return DEFAULT_REVIEW_PATH;
  const destination = new URL(requested, requestUrl.origin);
  if (destination.origin !== requestUrl.origin) return DEFAULT_REVIEW_PATH;
  const allowed = REVIEW_PATH_PREFIXES.some((prefix) => destination.pathname === prefix || destination.pathname.startsWith(`${prefix}/`));
  return allowed ? `${destination.pathname}${destination.search}` : DEFAULT_REVIEW_PATH;
}

function setPreviewQaCookie(response: NextResponse, session: string) {
  response.cookies.set(previewQaCookieName(), session, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: previewQaCookieMaxAge(),
  });
}

export async function GET(request: Request) {
  if (!isPreviewQaEnabled()) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const session = await createPreviewQaSession();
  if (!session) return NextResponse.json({ error: 'Preview QA Mode is unavailable.' }, { status: 503 });
  const response = NextResponse.redirect(new URL(reviewPath(request), request.url));
  setPreviewQaCookie(response, session);
  return response;
}

export async function POST() {
  if (!isPreviewQaEnabled()) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const session = await createPreviewQaSession();
  if (!session) return NextResponse.json({ error: 'Preview QA Mode is unavailable.' }, { status: 503 });
  const response = NextResponse.json({ learningDirection: 'ID_TO_ZH', reviewPath: DEFAULT_REVIEW_PATH });
  setPreviewQaCookie(response, session);
  return response;
}
