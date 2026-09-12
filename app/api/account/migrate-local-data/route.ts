import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { getCurrentAccountUser } from '@/lib/account/auth';
import { createImportedSceneContributions, importLocalLearningData, updateUser } from '@/lib/account/repository';

export const runtime = 'nodejs';

type LegacyProfile = { version?: number; favorites?: unknown; completed?: unknown; currentStreak?: unknown; longestStreak?: unknown; submissions?: unknown };

export async function POST(request: Request) {
  try {
    const user = await getCurrentAccountUser();
    if (!user) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    const body = (await request.json()) as { sourceKey?: string; profile?: LegacyProfile };
    if (body.sourceKey !== 'indobrain_learning_profile_v1' || !body.profile || typeof body.profile !== 'object') return NextResponse.json({ error: 'Unsupported local data.' }, { status: 400 });
    const favorites = Array.isArray(body.profile.favorites) ? body.profile.favorites.filter((item): item is string => typeof item === 'string') : [];
    const completed = Array.isArray(body.profile.completed) ? body.profile.completed.filter((item): item is string => typeof item === 'string') : [];
    const submissions = Array.isArray(body.profile.submissions) ? body.profile.submissions : [];
    const payload = { version: 1, favorites: [...new Set(favorites)], completed: [...new Set(completed)], currentStreak: Number(body.profile.currentStreak) || 0, longestStreak: Number(body.profile.longestStreak) || 0, submissions };
    const sourceHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const result = await importLocalLearningData(user.id, body.sourceKey, sourceHash, payload);
    if (result.imported) {
      await updateUser(user.id, { favorites_count: payload.favorites.length, completed_experiences: payload.completed.length, scene_contributions: payload.submissions.length, consecutive_learning_days: payload.currentStreak });
      if (result.importId) await createImportedSceneContributions(user.id, result.importId, payload.submissions);
    }
    return NextResponse.json({ imported: result.imported, preservedLocally: true });
  } catch {
    return NextResponse.json({ error: 'Unable to import local learning data. Your local data was not changed.' }, { status: 503 });
  }
}
