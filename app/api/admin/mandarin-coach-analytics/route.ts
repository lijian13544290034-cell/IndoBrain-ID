import { requireSuperAdmin } from '@/lib/account/auth';
import { readCoachAnalytics } from '@/lib/server/mandarin-coach-analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireSuperAdmin();
    const analytics = await readCoachAnalytics();
    return Response.json(analytics, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN';
    return Response.json({ error: message === 'ADMIN_AUTH_REQUIRED' ? 'Admin authentication required.' : 'Learning analytics unavailable.' }, { status: message === 'ADMIN_AUTH_REQUIRED' ? 401 : 503 });
  }
}
