'use client';

import { useEffect, useState } from 'react';
import { readLearningProfile } from '@/lib/learning-profile';

const sourceKey = 'indobrain_learning_profile_v1';

export default function LegacyDataMigration() {
  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState('');
  const [profile, setProfile] = useState<ReturnType<typeof readLearningProfile> | null>(null);
  useEffect(() => { setProfile(readLearningProfile()); }, []);
  const hasData = Boolean(profile && (profile.favorites.length || profile.completed.length || profile.submissions.length || profile.currentStreak));
  if (dismissed || !hasData) return null;

  async function importData() {
    setStatus('Importing…');
    const response = await fetch('/api/account/migrate-local-data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceKey, profile }) });
    const data = await response.json() as { imported?: boolean; error?: string };
    if (!response.ok) return setStatus(data.error ?? 'Import failed. Your local data is still safe on this device.');
    setStatus(data.imported ? 'Imported successfully. Your local data remains on this device.' : 'This local data was already imported.');
  }

  return <section className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5"><h2 className="font-semibold">Pindahkan data perangkat <span className="font-normal text-gray-400">（迁移本机学习数据）</span></h2><p className="mt-2 text-sm leading-6 text-gray-500">Kami menemukan favorit, pengalaman selesai, atau kontribusi yang tersimpan di perangkat ini. Impor hanya dilakukan dengan persetujuan Anda; data lokal tidak akan dihapus.</p>{status ? <p className="mt-3 text-sm text-gray-600">{status}</p> : <div className="mt-4 flex gap-2"><button onClick={() => void importData()} className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white">Import Data</button><button onClick={() => setDismissed(true)} className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium">Not now</button></div>}</section>;
}
