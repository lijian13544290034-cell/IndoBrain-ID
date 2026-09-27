export async function saveToSupabase(table: string, row: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return { saved: false, reason: 'not_configured' as const };

  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
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
