'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AchievementCardPreview, { type AchievementCardData, type AchievementCardError, type AchievementCardWarning } from '@/components/achievement-card/AchievementCardPreview';
import { achievementCardSlogans, defaultAchievementCardSloganId, type AchievementCardSlogan } from '@/lib/achievement-card/slogans';
import type { LearningAchievementStats } from '@/lib/learning-achievements';

type ReferralData = { kind: 'brand'; qrUrl: string; message: string };
type GenerationState = 'loading' | 'ready' | 'error';

function shareCopy(stats: LearningAchievementStats, url: string) {
  return `我已经在 IndoBrain 掌握了 ${stats.masteredHarvestCount} 个真实印尼语词汇/词组，完成了 ${stats.completedExperienceCount} 个真实场景。\n\n在印尼，不再只会说 Halo。\n${url}`;
}

export default function AchievementCardLauncher({ stats, streakDays, compact = false }: { stats: LearningAchievementStats; streakDays?: number; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [sloganId, setSloganId] = useState<AchievementCardSlogan['id']>(defaultAchievementCardSloganId);
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [image, setImage] = useState<Blob | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>('loading');
  const [generationKey, setGenerationKey] = useState(0);
  const [status, setStatus] = useState('');
  const slogan = useMemo(() => achievementCardSlogans.find((item) => item.id === sloganId) || achievementCardSlogans[0], [sloganId]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setImage(null);
    setGenerationState('loading');
    setStatus('');
    fetch('/api/achievement-card/referral')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('referral_failed')))
      .then((value: ReferralData) => { if (active) setReferral(value); })
      .catch(() => { if (active) setStatus('暂时无法准备二维码，请稍后再试。'); });
    return () => { active = false; };
  }, [open]);

  const cardData = useMemo<AchievementCardData | null>(() => referral ? ({
    masteredHarvestCount: stats.masteredHarvestCount,
    completedExperienceCount: stats.completedExperienceCount,
    streakDays: streakDays && streakDays > 0 ? streakDays : undefined,
    slogan,
    referralQrUrl: referral.qrUrl,
  }) : null, [referral, slogan, stats.completedExperienceCount, stats.masteredHarvestCount, streakDays]);

  const handleReady = useCallback((blob: Blob) => {
    setImage(blob);
    setGenerationState('ready');
  }, []);
  const handleError = useCallback((error: AchievementCardError) => {
    setImage(null);
    setGenerationState('error');
    setStatus('分享卡生成失败，请重试。');
    console.error(`[achievement-card] ${error}`);
  }, []);
  const handleWarning = useCallback((warning: AchievementCardWarning) => {
    if (warning === 'qr_generation_failed') setStatus('二维码生成失败，分享卡主体仍可保存。');
    console.error(`[achievement-card] ${warning}`);
  }, []);
  const retry = useCallback(() => {
    setImage(null);
    setStatus('');
    setGenerationState('loading');
    setGenerationKey((value) => value + 1);
  }, []);

  const save = useCallback(() => {
    if (!image) return;
    const href = URL.createObjectURL(image);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'indobrain-learning-achievement.png';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(href), 0);
  }, [image]);

  const share = useCallback(async () => {
    if (!image || !referral) return;
    const text = shareCopy(stats, referral.qrUrl);
    const file = new File([image], 'indobrain-learning-achievement.png', { type: 'image/png' });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ title: '我的 IndoBrain 学习成果', text, files: [file] });
      else { save(); setStatus('当前设备不支持图片分享，已为你准备保存图片。'); }
    } catch {
      setStatus('分享已取消或暂不可用。');
    }
  }, [image, referral, save, stats]);

  const copy = useCallback(async () => {
    if (!referral) return;
    await navigator.clipboard.writeText(shareCopy(stats, referral.qrUrl));
    setStatus('分享文案已复制。');
  }, [referral, stats]);

  return <>
    <button onClick={() => setOpen(true)} className={compact ? 'rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50' : 'rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-50'}>生成分享卡</button>
    {open && <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/40 px-4 py-6" role="dialog" aria-modal="true" aria-label="生成学习成果分享卡">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs text-stone-400">IndoBrain</p><h2 className="mt-1 text-xl font-semibold">生成学习成果分享卡</h2><p className="mt-1 text-sm text-stone-500">1080 × 1440 高清 PNG</p></div><button onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-stone-500 hover:bg-stone-100" aria-label="关闭分享卡">×</button></div>
        <div className="mt-5"><p className="text-sm font-medium">选择品牌文案</p><div className="mt-2 flex flex-wrap gap-2">{achievementCardSlogans.map((item) => <button key={item.id} onClick={() => { setImage(null); setGenerationState('loading'); setSloganId(item.id); }} className={`rounded-lg border px-3 py-2 text-left text-sm ${item.id === sloganId ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 hover:bg-stone-50'}`}>{item.lines.join('')}</button>)}</div></div>
        {cardData ? <div className="mt-5"><AchievementCardPreview key={`${sloganId}-${generationKey}`} data={cardData} onReady={handleReady} onError={handleError} onWarning={handleWarning} /></div> : <div className="mt-5 rounded-xl bg-stone-50 p-5 text-sm text-stone-500">正在准备分享卡…</div>}
        {referral && <p className="mt-4 text-sm leading-6 text-stone-500">{referral.message}</p>}
        <div className="mt-5 grid gap-2 sm:grid-cols-3"><button disabled={generationState !== 'ready'} onClick={share} className="min-h-11 rounded-xl bg-stone-900 px-3 text-sm font-medium text-white disabled:opacity-40">分享我的学习成果</button><button disabled={generationState !== 'ready'} onClick={save} data-card-blob-size={image?.size} className="min-h-11 rounded-xl border border-stone-300 px-3 text-sm font-medium disabled:opacity-40">保存分享卡</button><button disabled={!referral} onClick={copy} className="min-h-11 rounded-xl border border-stone-300 px-3 text-sm font-medium disabled:opacity-40">复制分享文案</button></div>
        {generationState === 'error' && <button onClick={retry} className="mt-3 min-h-10 rounded-lg border border-stone-300 px-3 text-sm font-medium hover:bg-stone-50">重新生成</button>}
        {status && <p className="mt-3 text-sm text-stone-500" role="status">{status}</p>}
      </div>
    </div>}
  </>;
}
