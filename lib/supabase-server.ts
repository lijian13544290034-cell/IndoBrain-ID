import { accountServerKey } from '@/lib/account/config';

function environment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = accountServerKey();

  return url && key ? { url, key } : null;
}

export async function saveToSupabase(table: string, row: Record<string, unknown>) {
  const config = environment();

  if (!config) return { saved: false, reason: 'not_configured' as const };

  const response = await fetch(`${config.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    let responseCode = 'unknown';
    try {
      const error = await response.json() as { code?: unknown };
      if (typeof error.code === 'string') responseCode = error.code;
    } catch {
      // Keep diagnostics intentionally limited to non-sensitive metadata.
    }
    console.error('[supabase-write-failed]', { table, status: response.status, responseCode });
    throw new Error(`Supabase write failed: ${response.status}`);
  }
  return { saved: true };
}

export async function readFromSupabase<T>(path: string) {
  const config = environment();
  if (!config) return { configured: false as const, rows: [] as T[] };
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Supabase read failed: ${response.status}`);
  return { configured: true as const, rows: await response.json() as T[] };
}
