'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AiCoachConversation from '@/components/AiCoachConversation';
import AiCoachRecorder from '@/components/AiCoachRecorder';
import { DAY_ONE_EXPRESSIONS, type CoachEventName, type CoachProfile, type ExpressionId, type FeedbackId, FEEDBACK_COPY, emptyCoachProfile, getExpression } from '@/lib/mandarin-ai-coach';
import { readCoachProfile, resetCoachProfile, saveCoachProfile } from '@/lib/mandarin-ai-coach-profile';

type Phase = 'WELCOME' | 'TEACH' | 'COMPREHENSION' | 'ROLEPLAY' | 'COMPLETE';
type AttemptResponse = {
  transcript: string;
  verdict: 'PASS' | 'RETRY' | 'BREAKDOWN';
  feedback: string;
  feedbackId: FeedbackId;
  nextAction: 'CONTINUE' | 'REPEAT' | 'SHOW_BREAKDOWN';
  usage: { token_input: number; token_output: number; model_calls: number; estimated_ai_cost: number; model_used: string; stt_seconds: number; stt_model: string };
};

function telemetry(profile: CoachProfile, event: CoachEventName, data: Record<string, unknown> = {}) {
  void fetch('/api/mandarin-coach/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: profile.sessionId, event, data: { day: 1, page: '/learn-chinese/ai-coach', ...data } }),
    keepalive: true,
  });
}

function MasteryDots({ level }: { level: number }) {
  return <span className="inline-flex gap-1" aria-label={`Tingkat penguasaan ${level} dari 4`}>{[1, 2, 3, 4].map((value) => <span key={value} className={`h-2 w-2 rounded-full ${value <= level ? 'bg-[var(--ib-primary)]' : 'bg-[var(--ib-border-soft)]'}`} />)}</span>;
}

export default function MandarinAiCoachExperience() {
  const [profile, setProfile] = useState<CoachProfile>(() => emptyCoachProfile());
  const [phase, setPhase] = useState<Phase>('WELCOME');
  const [activeIndex, setActiveIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [comprehensionTarget, setComprehensionTarget] = useState<ExpressionId>('AI-D1-01');
  const [roleplayStep, setRoleplayStep] = useState(0);
  const [serviceError, setServiceError] = useState('');

  useEffect(() => { setProfile(readCoachProfile()); }, []);
  const active = DAY_ONE_EXPRESSIONS[activeIndex];
  const learned = useMemo(() => profile.expressions.filter((item) => item.pronunciation_status !== 'NOT_STARTED'), [profile.expressions]);

  function persist(next: CoachProfile) {
    const saved = saveCoachProfile(next);
    setProfile(saved);
    return saved;
  }

  function begin() {
    const existing = readCoachProfile();
    const weakest = existing.expressions.reduce((current, item) => item.mastery_level < current.mastery_level ? item : current, existing.expressions[0]);
    const startingIndex = DAY_ONE_EXPRESSIONS.findIndex((item) => item.id === weakest.expression_id);
    setProfile(existing);
    setPhase('TEACH');
    setActiveIndex(Math.max(0, startingIndex));
    telemetry(existing, 'start_session', { startedAt: existing.startedAt });
    telemetry(existing, 'expression_started', { expression_id: weakest.expression_id, prioritized_by_memory: true });
  }

  async function playChinese(text: string, expressionId: ExpressionId) {
    setServiceError('');
    try {
      const response = await fetch('/api/chinese-tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (!response.ok || response.headers.get('X-IndoBrain-Chinese-TTS-Voice') !== 'zh-CN-XiaoxiaoNeural') throw new Error('tts');
      const url = URL.createObjectURL(await response.blob());
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
      const next = persist({ ...profile, usage: { ...profile.usage, tts_calls: profile.usage.tts_calls + 1 } });
      telemetry(next, 'audio_play', { expression_id: expressionId, voice: 'zh-CN-XiaoxiaoNeural' });
    } catch {
      setServiceError('Audio Mandarin zh-CN belum tersedia. Tidak ada suara pengganti yang digunakan.');
    }
  }

  async function submitVoice(audio: Blob, skill: 'PRONUNCIATION' | 'ROLEPLAY', expressionId: ExpressionId) {
    setBusy(true);
    setFeedback('');
    setServiceError('');
    const memory = profile.expressions.find((item) => item.expression_id === expressionId)!;
    telemetry(profile, 'voice_attempt', { expression_id: expressionId, skill, attempt: memory.attempts + 1 });
    try {
      const form = new FormData();
      form.set('audio', audio, `mandarin.${audio.type.includes('mp4') ? 'm4a' : 'webm'}`);
      form.set('expressionId', expressionId);
      form.set('sessionId', profile.sessionId);
      form.set('attempts', String(memory.attempts));
      form.set('masteryLevel', String(memory.mastery_level));
      form.set('skill', skill);
      const response = await fetch('/api/mandarin-coach/pronunciation', { method: 'POST', body: form });
      const result = await response.json() as AttemptResponse | { error: string };
      if (!response.ok || !('verdict' in result)) throw new Error('error' in result ? result.error : 'AI error');
      setFeedback(result.feedback);
      setShowBreakdown(result.verdict === 'BREAKDOWN');
      const passed = result.verdict === 'PASS';
      const now = new Date().toISOString();
      const expressions = profile.expressions.map((item) => item.expression_id === expressionId ? {
        ...item,
        attempts: item.attempts + 1,
        correct_count: item.correct_count + (passed ? 1 : 0),
        wrong_count: item.wrong_count + (passed ? 0 : 1),
        pronunciation_status: result.verdict,
        last_seen: now,
        mastery_level: Math.max(0, Math.min(4, item.mastery_level + (passed ? 2 : 0))) as 0 | 1 | 2 | 3 | 4,
      } : item);
      const next = persist({
        ...profile,
        expressions,
        usage: {
          token_input: profile.usage.token_input + result.usage.token_input,
          token_output: profile.usage.token_output + result.usage.token_output,
          stt_seconds: profile.usage.stt_seconds + result.usage.stt_seconds,
          tts_calls: profile.usage.tts_calls,
          model_calls: profile.usage.model_calls + result.usage.model_calls,
          estimated_ai_cost: profile.usage.estimated_ai_cost + result.usage.estimated_ai_cost,
        },
      });
      telemetry(next, passed ? 'expression_pass' : result.verdict === 'RETRY' ? 'expression_retry' : 'expression_failed', { expression_id: expressionId, skill, verdict: result.verdict, ...result.usage });
      if (skill === 'ROLEPLAY' && passed) telemetry(next, 'roleplay_completed', { expression_id: expressionId, step: roleplayStep + 1 });
    } catch (error) {
      setServiceError(error instanceof Error ? error.message : 'Pelatih AI belum tersedia.');
    } finally {
      setBusy(false);
    }
  }

  function continueTeaching() {
    setFeedback('');
    setShowBreakdown(false);
    const currentMemory = profile.expressions.find((item) => item.expression_id === active.id)!;
    const firstTwoWrong = activeIndex === 1 && profile.expressions.slice(0, 2).reduce((sum, item) => sum + item.wrong_count, 0) >= 3;
    if (activeIndex < DAY_ONE_EXPRESSIONS.length - 1 && !firstTwoWrong) {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      telemetry(profile, 'expression_started', { expression_id: DAY_ONE_EXPRESSIONS[nextIndex].id, previous_mastery: currentMemory.mastery_level });
      return;
    }
    const candidates = profile.expressions.filter((item) => item.pronunciation_status !== 'NOT_STARTED');
    const minimum = Math.min(...candidates.map((item) => item.mastery_level));
    const weakCandidates = candidates.filter((item) => item.mastery_level === minimum);
    const selected = weakCandidates[Math.floor(Math.random() * weakCandidates.length)] || profile.expressions[0];
    setComprehensionTarget(selected.expression_id);
    setPhase('COMPREHENSION');
  }

  function answerComprehension(indonesian: string) {
    const target = getExpression(comprehensionTarget);
    const correct = indonesian === target.indonesian;
    setFeedback(correct ? FEEDBACK_COPY.comprehension_pass : FEEDBACK_COPY.comprehension_retry);
    const now = new Date().toISOString();
    const expressions = profile.expressions.map((item) => item.expression_id === comprehensionTarget ? {
      ...item,
      correct_count: item.correct_count + (correct ? 1 : 0),
      wrong_count: item.wrong_count + (correct ? 0 : 1),
      comprehension_status: correct ? 'PASS' as const : 'RETRY' as const,
      last_seen: now,
      mastery_level: Math.max(0, Math.min(4, item.mastery_level + (correct ? 1 : 0))) as 0 | 1 | 2 | 3 | 4,
    } : item);
    const next = persist({ ...profile, expressions });
    telemetry(next, correct ? 'comprehension_correct' : 'comprehension_wrong', { expression_id: comprehensionTarget });
    if (correct) setTimeout(() => { setFeedback(''); setPhase('ROLEPLAY'); telemetry(next, 'roleplay_started', { scenario: 'first-workday' }); }, 700);
  }

  function finishSession() {
    const next = persist({ ...profile, completed: true });
    telemetry(next, 'finish_session', {
      session_duration: Math.max(0, Math.round((Date.now() - new Date(next.startedAt).getTime()) / 1000)),
      token_input: next.usage.token_input,
      token_output: next.usage.token_output,
      stt_seconds: next.usage.stt_seconds,
      tts_calls: next.usage.tts_calls,
      model_calls: next.usage.model_calls,
      estimated_ai_cost: next.usage.estimated_ai_cost,
    });
    setPhase('COMPLETE');
  }

  if (phase === 'WELCOME') return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 py-8 text-[var(--ib-text-primary)]"><div className="mx-auto max-w-xl"><Link href="/learn-chinese" className="text-sm font-semibold text-[var(--ib-primary)]">← 30天工作中文</Link><section className="mt-6 overflow-hidden rounded-[32px] border border-[var(--ib-border-soft)] bg-white p-6 shadow-[var(--ib-shadow-card)] sm:p-8"><div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--ib-primary-soft)] text-3xl" aria-hidden>🧑‍🏫</div><p className="mt-6 text-sm font-bold text-[var(--ib-primary)]">尼会说 · IndoBrain</p><h1 className="mt-2 text-4xl font-bold text-[var(--ib-primary-strong)]">AI 中文教练</h1><p className="mt-2 text-xl font-semibold text-[var(--ib-text-secondary)]">Pelatih Mandarin AI</p><p className="mt-5 leading-7 text-[var(--ib-text-secondary)]">10 menit sehari. Belajar Mandarin yang benar-benar dipakai.</p><div className="mt-6 grid grid-cols-2 gap-2 text-sm text-[var(--ib-text-secondary)]"><span>✓ Belajar</span><span>✓ Dengarkan</span><span>✓ Ucapkan</span><span>✓ Praktik kerja</span></div><button type="button" onClick={begin} className="mt-8 min-h-14 w-full rounded-full bg-[var(--ib-primary)] px-6 text-lg font-bold text-white">Mulai Latihan</button></section></div></main>;

  if (phase === 'COMPLETE') return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 py-8 text-[var(--ib-text-primary)]"><div className="mx-auto max-w-xl rounded-[32px] bg-white p-6 shadow-[var(--ib-shadow-card)] sm:p-8"><div className="text-5xl">🎉</div><h1 className="mt-5 text-3xl font-bold text-[var(--ib-primary-strong)]">Hari pertama selesai!</h1><p className="mt-2 text-[var(--ib-text-secondary)]">Ini kemampuanmu hari ini:</p><div className="mt-5 grid gap-3">{profile.expressions.map((item) => <div key={item.expression_id} className="flex items-center justify-between rounded-2xl bg-[var(--ib-bg-muted)] p-4"><div><p className="text-xl font-bold text-[var(--ib-primary-strong)]">{item.chinese}</p><p className="text-sm text-[var(--ib-text-secondary)]">{item.indonesian}</p></div><MasteryDots level={item.mastery_level}/></div>)}</div><div className="mt-6 rounded-3xl bg-[var(--ib-primary-soft)] p-5"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Besok</p><p className="mt-2 text-2xl font-bold text-[var(--ib-primary-strong)]">你叫什么名字？</p><p className="mt-1 text-sm text-[var(--ib-text-secondary)]">Siapa nama kamu?</p><p className="mt-3 text-sm font-semibold text-[var(--ib-primary)]">Besok kita belajar cara menjawabnya.</p></div><AiCoachConversation profile={profile} currentExpression={null} currentSkill="MEMORY" onProfileChange={persist} /><button type="button" onClick={() => { setProfile(resetCoachProfile()); setPhase('WELCOME'); }} className="mt-6 min-h-12 w-full rounded-full border border-[var(--ib-border-soft)] font-bold text-[var(--ib-primary)]">Ulangi Hari 1</button></div></main>;

  const currentMemory = profile.expressions.find((item) => item.expression_id === active.id)!;
  const conversationExpression = phase === 'TEACH' ? active.id : phase === 'COMPREHENSION' ? comprehensionTarget : roleplayStep === 0 ? 'AI-D1-01' : 'AI-D1-03';
  const conversationSkill = phase === 'TEACH' ? 'TEACH' : phase === 'COMPREHENSION' ? 'COMPREHENSION' : 'ROLEPLAY';
  return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 pb-10 pt-5 text-[var(--ib-text-primary)]"><div className="mx-auto max-w-xl"><div className="flex items-center justify-between"><Link href="/learn-chinese" className="text-sm font-semibold text-[var(--ib-primary)]">← Kembali</Link><span className="text-xs font-bold text-[var(--ib-text-muted)]">Hari 1 · {phase === 'TEACH' ? `${activeIndex + 1}/${learned.length > 2 ? 3 : 3}` : phase}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--ib-border-soft)]"><div className="h-full bg-[var(--ib-primary)] transition-all" style={{ width: phase === 'TEACH' ? `${15 + activeIndex * 20}%` : phase === 'COMPREHENSION' ? '70%' : '88%' }} /></div><AiCoachConversation profile={profile} currentExpression={conversationExpression} currentSkill={conversationSkill} onProfileChange={persist} />
    {phase === 'TEACH' ? <section className="mt-5 rounded-[32px] bg-white p-6 text-center shadow-[var(--ib-shadow-card)]"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ib-primary-soft)] text-2xl">🧑‍🏫</div><p className="mt-5 text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Dengarkan dan ucapkan</p><p className="mt-3 text-5xl font-bold tracking-wide text-[var(--ib-primary-strong)]">{active.chinese}</p><p className="mt-3 text-xl font-semibold text-[var(--ib-primary)]">{active.pinyin}</p><p className="mt-2 text-lg text-[var(--ib-text-secondary)]">{active.indonesian}</p><button type="button" onClick={() => playChinese(active.chinese, active.id)} className="mt-6 min-h-12 rounded-full border border-[var(--ib-border-soft)] px-6 font-bold text-[var(--ib-primary)]">🔊 Dengarkan</button>{showBreakdown ? <div className="mt-5 flex justify-center gap-3">{active.chunks.map((chunk, index) => <div key={`${chunk.chinese}-${index}`} className="min-w-20 rounded-2xl bg-[var(--ib-primary-soft)] p-3"><p className="text-3xl font-bold text-[var(--ib-primary-strong)]">{chunk.chinese}</p><p className="mt-1 font-semibold text-[var(--ib-primary)]">{chunk.pinyin}</p></div>)}</div> : null}<div className="mt-6"><AiCoachRecorder busy={busy} onRecorded={(audio) => submitVoice(audio, 'PRONUNCIATION', active.id)} /></div>{feedback ? <div role="status" className="mt-4 rounded-2xl bg-[var(--ib-primary-soft)] p-4 text-left text-sm font-semibold leading-6 text-[var(--ib-primary-strong)]">{feedback}</div> : null}{serviceError ? <p role="alert" className="mt-4 text-sm text-rose-700">{serviceError}</p> : null}{currentMemory.pronunciation_status !== 'NOT_STARTED' ? <button type="button" onClick={continueTeaching} className="mt-5 min-h-12 w-full rounded-full bg-[var(--ib-primary-strong)] px-5 font-bold text-white">Lanjut</button> : null}</section> : null}
    {phase === 'COMPREHENSION' ? <section className="mt-5 rounded-[32px] bg-white p-6 shadow-[var(--ib-shadow-card)]"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Cek pemahaman</p><h1 className="mt-3 text-2xl font-bold text-[var(--ib-primary-strong)]">Apa arti ungkapan ini?</h1><button type="button" onClick={() => playChinese(getExpression(comprehensionTarget).chinese, comprehensionTarget)} className="mt-5 min-h-12 rounded-full border border-[var(--ib-border-soft)] px-5 font-bold text-[var(--ib-primary)]">🔊 Dengarkan tanpa melihat</button><div className="mt-5 grid gap-3">{DAY_ONE_EXPRESSIONS.map((item) => <button type="button" key={item.id} onClick={() => answerComprehension(item.indonesian)} className="min-h-12 rounded-2xl border border-[var(--ib-border-soft)] p-3 text-left font-semibold text-[var(--ib-text-primary)]">{item.indonesian}</button>)}</div>{feedback ? <p role="status" className="mt-4 rounded-2xl bg-[var(--ib-primary-soft)] p-4 text-sm font-semibold text-[var(--ib-primary-strong)]">{feedback}</p> : null}</section> : null}
    {phase === 'ROLEPLAY' ? <section className="mt-5 rounded-[32px] bg-white p-6 shadow-[var(--ib-shadow-card)]"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Hari pertama di tempat kerja</p><h1 className="mt-3 text-2xl font-bold text-[var(--ib-primary-strong)]">{roleplayStep === 0 ? 'Seorang rekan menyapamu.' : 'Bos memberi instruksi sederhana.'}</h1><div className="mt-5 rounded-2xl bg-[var(--ib-primary-soft)] p-4"><p className="text-sm text-[var(--ib-text-secondary)]">{roleplayStep === 0 ? 'Rekan kerja:' : 'Bos:'}</p><p className="mt-2 text-3xl font-bold text-[var(--ib-primary-strong)]">{roleplayStep === 0 ? '你好' : '现在开始。'}</p><button type="button" onClick={() => playChinese(roleplayStep === 0 ? '你好' : '现在开始。', roleplayStep === 0 ? 'AI-D1-01' : 'AI-D1-03')} className="mt-3 text-sm font-bold text-[var(--ib-primary)]">🔊 Dengarkan</button></div><p className="mt-5 text-sm leading-6 text-[var(--ib-text-secondary)]">Jawab dengan: <strong className="text-[var(--ib-primary-strong)]">{roleplayStep === 0 ? '你好' : '好的'}</strong></p><div className="mt-4"><AiCoachRecorder busy={busy} onRecorded={async (audio) => { const id = roleplayStep === 0 ? 'AI-D1-01' : 'AI-D1-03'; await submitVoice(audio, 'ROLEPLAY', id); }} /></div>{feedback ? <div role="status" className="mt-4 rounded-2xl bg-[var(--ib-primary-soft)] p-4 text-sm font-semibold text-[var(--ib-primary-strong)]">{feedback}</div> : null}{serviceError ? <p role="alert" className="mt-4 text-sm text-rose-700">{serviceError}</p> : null}{feedback === FEEDBACK_COPY.roleplay_pass || feedback === FEEDBACK_COPY.pronunciation_pass ? <button type="button" onClick={() => { setFeedback(''); if (roleplayStep === 0) setRoleplayStep(1); else finishSession(); }} className="mt-5 min-h-12 w-full rounded-full bg-[var(--ib-primary)] font-bold text-white">{roleplayStep === 0 ? 'Lanjut ke situasi berikutnya' : 'Selesaikan latihan'}</button> : null}</section> : null}
  </div></main>;
}
