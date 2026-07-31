'use client';

import { useEffect, useState } from 'react';
import { readLearningProfile, subscribeProfile, toggleFavorite } from '@/lib/learning-profile';

type Props = { itemId: string; targetText: string; dark?: boolean };

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return; }
  const area = document.createElement('textarea');
  area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
  document.body.appendChild(area); area.select();
  const copied = document.execCommand('copy'); document.body.removeChild(area);
  if (!copied) throw new Error('Clipboard is unavailable');
}

export default function LearningItemActions({ itemId, targetText, dark = false }: Props) {
  const [favorited, setFavorited] = useState(false); const [message, setMessage] = useState('');
  useEffect(() => { const sync = () => setFavorited(readLearningProfile().favorites.includes(itemId)); sync(); return subscribeProfile(sync); }, [itemId]);
  function favorite() { const result = toggleFavorite(itemId); setFavorited(result.favorited); setMessage(result.favorited ? 'Disimpan' : 'Dihapus dari simpanan'); }
  async function copy() { try { await copyText(targetText); setMessage('Berhasil disalin'); } catch { setMessage('Gagal menyalin'); } }
  const shared = `min-h-8 rounded-lg border px-2 text-xs font-medium transition duration-200 ${dark ? 'border-stone-600 text-stone-100 hover:bg-stone-800' : 'border-stone-300 text-stone-700 hover:bg-stone-100'}`;
  return <div className="mt-2 flex flex-wrap items-center gap-2"><button type="button" onClick={favorite} aria-label={favorited ? 'Hapus dari simpanan' : 'Simpan'} className={favorited ? `${shared} border-stone-900 bg-stone-900 text-white hover:bg-stone-700` : shared}>{favorited ? '★ Disimpan' : '☆ Simpan'}</button><button type="button" onClick={() => void copy()} aria-label="Salin teks Mandarin" className={shared}>⧉ Salin</button>{message && <span role="status" className={`text-xs ${dark ? 'text-stone-300' : 'text-stone-500'}`}>{message}</span>}</div>;
}
