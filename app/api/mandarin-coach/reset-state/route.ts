import { getCurrentAccountUser } from '@/lib/account/auth';
import { isPreviewTestAccount } from '@/lib/account/preview-test';
import { anonymousTesterId } from '@/lib/server/mandarin-coach-analytics';
import { readFromSupabase } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentAccountUser();
  if (!user || !isPreviewTestAccount(user)) return Response.json({ resetAt: null });
  const testerId = anonymousTesterId(user.id);
  const result = await readFromSupabase<{ created_at: string }>(`conversations?role_type=eq.mandarin_coach_reset&session_id=eq.${encodeURIComponent(testerId)}&select=created_at&order=created_at.desc&limit=1`);
  return Response.json({ resetAt: result.rows[0]?.created_at || null });
}
