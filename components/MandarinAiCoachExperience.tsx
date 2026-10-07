'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import AiCoachConversation from '@/components/AiCoachConversation';
import AiCoachRecorder from '@/components/AiCoachRecorder';
import MandarinAdaptiveCoursePanel from '@/components/MandarinAdaptiveCoursePanel';
import { decideNextBestAction } from '@/lib/mandarin-adaptive-course';
import { recordAdaptiveResult, refreshAdaptivePlan } from '@/lib/mandarin-adaptive-course-profile';
import { COACH_RETRY_POLICY, FEEDBACK_COPY, createCoachProfile, type CoachEventName, type CoachProfile, type ExpressionId, type FeedbackId } from '@/lib/mandarin-ai-coach';
import { readCoachProfile, resetCoachProfile, saveCoachProfile } from '@/lib/mandarin-ai-coach-profile';
import type { MandarinCoachCatalogEntry, MandarinCoachCurriculumPayload } from '@/lib/mandarin-coach-curriculum-types';
import { applyPreviewTestReset } from '@/lib/mandarin-preview-test-reset';

type Phase = 'WELCOME' | 'TEACH' | 'COMPREHENSION' | 'ROLEPLAY' | 'COMPLETE';
type AttemptResponse = { transcript: string; verdict: 'PASS' | 'RETRY' | 'BREAKDOWN'; feedback: string; feedbackId: FeedbackId; nextAction: 'CONTINUE' | 'REPEAT' | 'SHOW_BREAKDOWN'; usage: { token_input: number; token_output: number; model_calls: number; estimated_ai_cost: number; model_used: string; stt_seconds: number; stt_model: string } };

function telemetry(profile: CoachProfile, event: CoachEventName, data: Record<string, unknown> = {}) {
  void fetch('/api/mandarin-coach/telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: profile.sessionId, event, data: { day: profile.currentDay, lesson_id: profile.lessonId, page: '/learn-chinese/ai-coach', ...data } }), keepalive: true });
}

function MasteryDots({ level }: { level: number }) {
  return <span className="inline-flex gap-1" aria-label={`Tingkat penguasaan ${level} dari 4`}>{[1, 2, 3, 4].map((value) => <span key={value} className={`h-2 w-2 rounded-full ${value <= level ? 'bg-[var(--ib-primary)]' : 'bg-[var(--ib-border-soft)]'}`} />)}</span>;
}

function CurriculumPicker({ catalog, selectedId, onSelect }: { catalog: MandarinCoachCatalogEntry[]; selectedId: string; onSelect: (id: string) => void }) {
  const sections = useMemo(() => {
    const groups = new Map<string, MandarinCoachCatalogEntry[]>();
    for (const entry of catalog) { const key = `${entry.courseTitleId} · ${entry.group}`; groups.set(key, [...(groups.get(key) ?? []), entry]); }
    return [...groups.entries()];
  }, [catalog]);
  return <div className="mt-6 space-y-4">{sections.map(([group, entries]) => <section key={group} className="rounded-3xl border border-[var(--ib-border-soft)] bg-[var(--ib-bg-muted)] p-4"><h2 className="text-sm font-bold text-[var(--ib-primary-strong)]">{group}</h2><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{entries.map((entry) => entry.locked ? <Link key={entry.id} href="/login?next=/learn-chinese/ai-coach" className="rounded-2xl border border-[var(--ib-border-soft)] bg-white p-3 text-left opacity-70"><span className="block text-xs font-bold text-[var(--ib-text-muted)]">{entry.day ? `Day ${entry.day}` : 'Topik'} · 🔒</span><span className="mt-1 block text-sm font-semibold text-[var(--ib-primary-strong)]">{entry.title}</span></Link> : <button key={entry.id} type="button" onClick={() => onSelect(entry.id)} className={`rounded-2xl border p-3 text-left ${selectedId === entry.id ? 'border-[var(--ib-primary)] bg-[var(--ib-primary-soft)]' : 'border-[var(--ib-border-soft)] bg-white'}`}><span className="block text-xs font-bold text-[var(--ib-primary)]">{entry.day ? `Day ${entry.day}` : 'Topik'} · {entry.expressionCount}</span><span className="mt-1 block text-sm font-semibold text-[var(--ib-primary-strong)]">{entry.title}</span></button>)}</div></section>)}</div>;
}

export default function MandarinAiCoachExperience({ curriculum }: { curriculum: MandarinCoachCurriculumPayload }) {
  const firstLesson = curriculum.lessons[0];
  const [selectedLessonId, setSelectedLessonId] = useState(firstLesson.id);
  const lesson = curriculum.lessons.find((entry) => entry.id === selectedLessonId) ?? firstLesson;
  const [profile, setProfile] = useState<CoachProfile>(() => createCoachProfile(firstLesson));
  const [phase, setPhase] = useState<Phase>('WELCOME');
  const [activeIndex, setActiveIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [comprehensionTarget, setComprehensionTarget] = useState<ExpressionId>(firstLesson.expressions[0]?.id ?? '');
  const [serviceError, setServiceError] = useState('');
  const pendingAdaptiveStart = useRef<{ lessonId: string; expressionId?: string } | null>(null);

  useEffect(() => {
    void applyPreviewTestReset().then((reset) => { if (reset) window.location.reload(); }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const next = readCoachProfile(lesson);
    setProfile(next); setFeedback(''); setShowBreakdown(false); setComprehensionTarget(lesson.expressions[0]?.id ?? '');
    const adaptiveStart = pendingAdaptiveStart.current;
    pendingAdaptiveStart.current = null;
    if (adaptiveStart?.lessonId === lesson.id) {
      const preferredIndex = adaptiveStart.expressionId ? lesson.expressions.findIndex((item) => item.id === adaptiveStart.expressionId) : -1;
      const weakest = next.expressions.reduce((current, item) => item.mastery_level < current.mastery_level ? item : current, next.expressions[0]);
      const startingIndex = preferredIndex >= 0 ? preferredIndex : Math.max(0, lesson.expressions.findIndex((item) => item.id === weakest?.expression_id));
      setActiveIndex(startingIndex); setPhase('TEACH');
      telemetry(next, 'start_session', { course: lesson.courseTitleId, source: lesson.source, startedAt: next.startedAt, adaptive: true });
      const chosen = lesson.expressions[startingIndex]; if (chosen) telemetry(next, 'expression_started', { expression_id: chosen.id, prioritized_by_adaptive_plan: true });
    } else { setPhase('WELCOME'); setActiveIndex(0); }
  }, [lesson]);

  const active = lesson.expressions[activeIndex] ?? lesson.expressions[0];
  const meaningOptions = useMemo(() => lesson.expressions.filter((item) => item.indonesian).slice(0, 4), [lesson]);
  const comprehensionExpression = lesson.expressions.find((item) => item.id === comprehensionTarget) ?? meaningOptions[0] ?? active;
  const roleplayPrompt = lesson.dialogue[0] ?? (active ? { role: '教练', chinese: active.chinese, pinyin: active.pinyin } : null);
  const roleplayTargetTurn = lesson.dialogue[1] ?? roleplayPrompt;
  const roleplayTarget = lesson.expressions.find((item) => item.chinese === roleplayTargetTurn?.chinese) ?? active;

  function persist(next: CoachProfile) { const saved = saveCoachProfile(next); setProfile(saved); return saved; }
  function updateAdaptiveResult(input: Parameters<typeof recordAdaptiveResult>[0]) {
    const next = recordAdaptiveResult(input);
    const record = next.mastery.find((item) => item.expressionId === input.expressionId);
    if (record) {
      const failureCount = next.mistakes.filter((item) => item.expressionId === input.expressionId).reduce((sum, item) => sum + item.count, 0);
      const action = decideNextBestAction({ record, repeatedFailures: failureCount, recentSkips: record.skips, reviewDue: Boolean(record.nextReviewAt && Date.parse(record.nextReviewAt) <= Date.now()) });
      telemetry(profile, 'adaptive_mastery_updated', { expression_id: input.expressionId, dimension: input.dimension, success: input.success, next_review_at: record.nextReviewAt });
      telemetry(profile, 'next_best_action_selected', { expression_id: input.expressionId, action: action.action, reason: action.reason, model_level: action.level });
    }
    refreshAdaptivePlan(curriculum);
  }
  function beginAdaptive(lessonId: string, expressionId?: string) {
    const targetLesson = curriculum.lessons.find((entry) => entry.id === lessonId);
    if (!targetLesson) return;
    if (targetLesson.id !== lesson.id) {
      pendingAdaptiveStart.current = { lessonId, expressionId };
      setSelectedLessonId(targetLesson.id);
      return;
    }
    const existing = readCoachProfile(targetLesson);
    const preferredIndex = expressionId ? targetLesson.expressions.findIndex((item) => item.id === expressionId) : -1;
    const weakest = existing.expressions.reduce((current, item) => item.mastery_level < current.mastery_level ? item : current, existing.expressions[0]);
    const startingIndex = preferredIndex >= 0 ? preferredIndex : Math.max(0, targetLesson.expressions.findIndex((item) => item.id === weakest?.expression_id));
    setProfile(existing); setPhase('TEACH'); setActiveIndex(startingIndex);
    telemetry(existing, 'start_session', { course: targetLesson.courseTitleId, source: targetLesson.source, startedAt: existing.startedAt, adaptive: true });
    const chosen = targetLesson.expressions[startingIndex]; if (chosen) telemetry(existing, 'expression_started', { expression_id: chosen.id, prioritized_by_adaptive_plan: true });
  }
  function begin() {
    const existing = readCoachProfile(lesson);
    const weakest = existing.expressions.reduce((current, item) => item.mastery_level < current.mastery_level ? item : current, existing.expressions[0]);
    const startingIndex = Math.max(0, lesson.expressions.findIndex((item) => item.id === weakest?.expression_id));
    setProfile(existing); setPhase('TEACH'); setActiveIndex(startingIndex);
    telemetry(existing, 'start_session', { course: lesson.courseTitleId, source: lesson.source, startedAt: existing.startedAt });
    if (weakest) telemetry(existing, 'expression_started', { expression_id: weakest.expression_id, prioritized_by_memory: true });
  }

  async function playChinese(text: string, expressionId: ExpressionId) {
    setServiceError('');
    try {
      const response = await fetch('/api/chinese-tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (!response.ok || response.headers.get('X-IndoBrain-Chinese-TTS-Voice') !== 'zh-CN-XiaoxiaoNeural') throw new Error('tts');
      const url = URL.createObjectURL(await response.blob()); const audio = new Audio(url); audio.onended = () => URL.revokeObjectURL(url); await audio.play();
      const next = persist({ ...profile, usage: { ...profile.usage, tts_calls: profile.usage.tts_calls + 1 } }); telemetry(next, 'audio_play', { expression_id: expressionId, voice: 'zh-CN-XiaoxiaoNeural' });
    } catch { setServiceError('Audio Mandarin zh-CN belum tersedia. Tidak ada suara pengganti yang digunakan.'); }
  }

  async function submitVoice(audio: Blob, skill: 'PRONUNCIATION' | 'ROLEPLAY', expressionId: ExpressionId) {
    setBusy(true); setFeedback(''); setServiceError('');
    const memory = profile.expressions.find((item) => item.expression_id === expressionId); if (!memory) { setBusy(false); return; }
    telemetry(profile, 'voice_attempt', { expression_id: expressionId, skill, attempt: memory.attempts + 1 });
    try {
      const form = new FormData(); form.set('audio', audio, `mandarin.${audio.type.includes('mp4') ? 'm4a' : 'webm'}`); form.set('lessonId', lesson.id); form.set('expressionId', expressionId); form.set('sessionId', profile.sessionId); form.set('attempts', String(memory.attempts)); form.set('masteryLevel', String(memory.mastery_level)); form.set('skill', skill);
      const response = await fetch('/api/mandarin-coach/pronunciation', { method: 'POST', body: form }); const result = await response.json() as AttemptResponse | { error: string };
      if (!response.ok || !('verdict' in result)) throw new Error('error' in result ? result.error : 'AI error');
      setFeedback(result.feedback); setShowBreakdown(result.verdict === 'BREAKDOWN'); const passed = result.verdict === 'PASS'; const now = new Date().toISOString();
      const expressions = profile.expressions.map((item) => item.expression_id === expressionId ? { ...item, attempts: item.attempts + 1, correct_count: item.correct_count + (passed ? 1 : 0), wrong_count: item.wrong_count + (passed ? 0 : 1), pronunciation_status: result.verdict, last_seen: now, mastery_level: Math.max(0, Math.min(4, item.mastery_level + (passed ? 2 : 0))) as 0 | 1 | 2 | 3 | 4 } : item);
      const next = persist({ ...profile, expressions, usage: { token_input: profile.usage.token_input + result.usage.token_input, token_output: profile.usage.token_output + result.usage.token_output, stt_seconds: profile.usage.stt_seconds + result.usage.stt_seconds, tts_calls: profile.usage.tts_calls, model_calls: profile.usage.model_calls + result.usage.model_calls, estimated_ai_cost: profile.usage.estimated_ai_cost + result.usage.estimated_ai_cost } });
      updateAdaptiveResult({ expressionId, lessonId: lesson.id, dimension: skill === 'ROLEPLAY' ? 'realSceneUsage' : 'speaking', success: passed, changedContext: skill === 'ROLEPLAY', hintLevel: result.verdict === 'BREAKDOWN' ? 5 : result.verdict === 'RETRY' ? 2 : 0, mistakeKind: passed ? undefined : skill === 'ROLEPLAY' ? 'SCENE_USAGE' : 'PRONUNCIATION' });
      telemetry(next, passed ? 'expression_pass' : result.verdict === 'RETRY' ? 'expression_retry' : 'expression_failed', { expression_id: expressionId, skill, verdict: result.verdict, ...result.usage }); if (skill === 'ROLEPLAY' && passed) telemetry(next, 'roleplay_completed', { expression_id: expressionId });
    } catch (error) { setServiceError(error instanceof Error ? error.message : 'Pelatih AI belum tersedia.'); } finally { setBusy(false); }
  }

  function finishSession(current = profile) { const next = persist({ ...current, completed: true }); telemetry(next, 'finish_session', { session_duration: Math.max(0, Math.round((Date.now() - new Date(next.startedAt).getTime()) / 1000)), token_input: next.usage.token_input, token_output: next.usage.token_output, stt_seconds: next.usage.stt_seconds, tts_calls: next.usage.tts_calls, model_calls: next.usage.model_calls, estimated_ai_cost: next.usage.estimated_ai_cost }); setPhase('COMPLETE'); }
  function advanceTeaching(currentProfile: CoachProfile) {
    setFeedback(''); setShowBreakdown(false);
    if (activeIndex < lesson.expressions.length - 1) { const nextIndex = activeIndex + 1; setActiveIndex(nextIndex); telemetry(currentProfile, 'expression_started', { expression_id: lesson.expressions[nextIndex].id }); return; }
    if (meaningOptions.length >= 2) { const candidates = currentProfile.expressions.filter((item) => meaningOptions.some((option) => option.id === item.expression_id)); const selected = candidates.sort((a, b) => a.mastery_level - b.mastery_level)[0]; setComprehensionTarget(selected?.expression_id ?? meaningOptions[0].id); setPhase('COMPREHENSION'); return; }
    if (roleplayTarget) { setPhase('ROLEPLAY'); telemetry(currentProfile, 'roleplay_started', { lesson_id: lesson.id }); return; } finishSession(currentProfile);
  }
  function saveAndSkip() { if (!active) return; const next = persist({ ...profile, expressions: profile.expressions.map((item) => item.expression_id === active.id ? { ...item, saved_for_review: true, pronunciation_status: 'NEEDS_REVIEW' as const } : item) }); updateAdaptiveResult({ expressionId: active.id, lessonId: lesson.id, dimension: 'speaking', success: false, skipped: true, mistakeKind: 'PRONUNCIATION' }); telemetry(next, 'expression_saved_for_review', { expression_id: active.id }); advanceTeaching(next); }
  function answerComprehension(indonesian: string) {
    if (!comprehensionExpression) return; const correct = indonesian === comprehensionExpression.indonesian; setFeedback(correct ? FEEDBACK_COPY.comprehension_pass : FEEDBACK_COPY.comprehension_retry);
    const expressions = profile.expressions.map((item) => item.expression_id === comprehensionExpression.id ? { ...item, correct_count: item.correct_count + (correct ? 1 : 0), wrong_count: item.wrong_count + (correct ? 0 : 1), comprehension_status: correct ? 'PASS' as const : 'RETRY' as const, last_seen: new Date().toISOString(), mastery_level: Math.max(0, Math.min(4, item.mastery_level + (correct ? 1 : 0))) as 0 | 1 | 2 | 3 | 4 } : item);
    updateAdaptiveResult({ expressionId: comprehensionExpression.id, lessonId: lesson.id, dimension: 'meaning', success: correct, hintLevel: 0, mistakeKind: correct ? undefined : 'MEANING' });
    const next = persist({ ...profile, expressions }); telemetry(next, correct ? 'comprehension_correct' : 'comprehension_wrong', { expression_id: comprehensionExpression.id }); if (correct) setTimeout(() => { setFeedback(''); if (roleplayTarget) { setPhase('ROLEPLAY'); telemetry(next, 'roleplay_started', { lesson_id: lesson.id }); } else finishSession(next); }, 700);
  }

  if (phase === 'WELCOME') return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 py-8 text-[var(--ib-text-primary)]"><div className="mx-auto max-w-5xl"><Link href="/learn-chinese" className="text-sm font-semibold text-[var(--ib-primary)]">← 30天工作中文</Link><section className="mt-6 overflow-hidden rounded-[32px] border border-[var(--ib-border-soft)] bg-white p-6 shadow-[var(--ib-shadow-card)] sm:p-8"><div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--ib-primary-soft)] text-3xl" aria-hidden="true">🧑‍🏫</div><p className="mt-6 text-sm font-bold text-[var(--ib-primary)]">尼会说 · IndoBrain</p><h1 className="mt-2 text-4xl font-bold text-[var(--ib-primary-strong)]">AI 中文教练</h1><p className="mt-2 text-xl font-semibold text-[var(--ib-text-secondary)]">Pelatih Mandarin AI</p><p className="mt-5 leading-7 text-[var(--ib-text-secondary)]">Pilih materi Mandarin yang sudah tersedia. AI Coach menggunakan isi kursus yang sama, tanpa membuat ulang materi.</p><MandarinAdaptiveCoursePanel curriculum={curriculum} onStart={beginAdaptive}/><CurriculumPicker catalog={curriculum.catalog} selectedId={lesson.id} onSelect={setSelectedLessonId}/><div className="mt-5 rounded-3xl bg-[var(--ib-primary-soft)] p-4"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Materi dipilih</p><p className="mt-1 text-xl font-bold text-[var(--ib-primary-strong)]">{lesson.day ? `Day ${lesson.day} · ` : ''}{lesson.title}</p><p className="mt-1 text-sm text-[var(--ib-text-secondary)]">{lesson.courseTitleId} · {lesson.expressions.length} latihan</p></div><button type="button" onClick={begin} disabled={!lesson.expressions.length} className="mt-6 min-h-14 w-full rounded-full bg-[var(--ib-primary)] px-6 text-lg font-bold text-white disabled:opacity-50">Mulai Latihan</button></section></div></main>;

  if (phase === 'COMPLETE') return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 py-8 text-[var(--ib-text-primary)]"><div className="mx-auto max-w-xl rounded-[32px] bg-white p-6 shadow-[var(--ib-shadow-card)] sm:p-8"><div className="text-5xl">🎉</div><h1 className="mt-5 text-3xl font-bold text-[var(--ib-primary-strong)]">Latihan selesai!</h1><p className="mt-2 text-[var(--ib-text-secondary)]">{lesson.day ? `Day ${lesson.day} · ` : ''}{lesson.title}</p><div className="mt-5 grid gap-3">{profile.expressions.map((item) => <div key={item.expression_id} className="flex items-center justify-between rounded-2xl bg-[var(--ib-bg-muted)] p-4"><div><p className="text-xl font-bold text-[var(--ib-primary-strong)]">{item.chinese}</p><p className="text-sm text-[var(--ib-text-secondary)]">{item.indonesian}</p></div><MasteryDots level={item.mastery_level}/></div>)}</div><AiCoachConversation profile={profile} lesson={lesson} currentExpression={null} currentSkill="MEMORY" onProfileChange={persist}/><button type="button" onClick={() => { setProfile(resetCoachProfile(lesson)); setPhase('WELCOME'); }} className="mt-6 min-h-12 w-full rounded-full border border-[var(--ib-border-soft)] font-bold text-[var(--ib-primary)]">Pilih materi lain</button></div></main>;

  if (!active) return null;
  const currentMemory = profile.expressions.find((item) => item.expression_id === active.id)!;
  const conversationExpression = phase === 'COMPREHENSION' ? comprehensionTarget : phase === 'ROLEPLAY' ? roleplayTarget?.id ?? null : active.id;
  const conversationSkill = phase === 'COMPREHENSION' ? 'COMPREHENSION' : phase === 'ROLEPLAY' ? 'ROLEPLAY' : 'TEACH';
  return <main className="min-h-screen bg-[var(--ib-bg-page)] px-4 pb-10 pt-5 text-[var(--ib-text-primary)]"><div className="mx-auto max-w-xl"><div className="flex items-center justify-between gap-3"><button type="button" onClick={() => setPhase('WELCOME')} className="text-sm font-semibold text-[var(--ib-primary)]">← Pilih materi</button><span className="text-right text-xs font-bold text-[var(--ib-text-muted)]">{lesson.day ? `Day ${lesson.day}` : 'Topik'} · {phase === 'TEACH' ? `${activeIndex + 1}/${lesson.expressions.length}` : phase}</span></div><p className="mt-2 truncate text-sm font-bold text-[var(--ib-primary-strong)]">{lesson.title}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--ib-border-soft)]"><div className="h-full bg-[var(--ib-primary)] transition-all" style={{ width: phase === 'TEACH' ? `${Math.max(8, Math.round((activeIndex + 1) / lesson.expressions.length * 65))}%` : phase === 'COMPREHENSION' ? '78%' : '90%' }}/></div><AiCoachConversation profile={profile} lesson={lesson} currentExpression={conversationExpression} currentSkill={conversationSkill} onProfileChange={persist}/>
    {phase === 'TEACH' ? <section className="mt-5 rounded-[32px] bg-white p-6 text-center shadow-[var(--ib-shadow-card)]"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Dengarkan dan ucapkan</p><p className="mt-3 text-4xl font-bold tracking-wide text-[var(--ib-primary-strong)]">{active.chinese}</p><p className="mt-3 text-xl font-semibold text-[var(--ib-primary)]">{active.pinyin}</p>{active.indonesian ? <p className="mt-2 text-lg text-[var(--ib-text-secondary)]">{active.indonesian}</p> : <p className="mt-2 text-sm text-[var(--ib-text-muted)]">Latihan mendengar · arti tidak ditampilkan pada materi asli</p>}<button type="button" onClick={() => playChinese(active.chinese, active.id)} className="mt-6 min-h-12 rounded-full border border-[var(--ib-border-soft)] px-6 font-bold text-[var(--ib-primary)]">🔊 Dengarkan</button>{showBreakdown ? <div className="mt-5 flex flex-wrap justify-center gap-3">{active.chunks.map((chunk, index) => <div key={`${chunk.chinese}-${index}`} className="min-w-20 rounded-2xl bg-[var(--ib-primary-soft)] p-3"><p className="text-2xl font-bold text-[var(--ib-primary-strong)]">{chunk.chinese}</p><p className="mt-1 font-semibold text-[var(--ib-primary)]">{chunk.pinyin}</p></div>)}</div> : null}<div className="mt-6"><AiCoachRecorder busy={busy} onRecorded={(audio) => submitVoice(audio, 'PRONUNCIATION', active.id)}/></div>{feedback ? <div role="status" className="mt-4 rounded-2xl bg-[var(--ib-primary-soft)] p-4 text-left text-sm font-semibold leading-6 text-[var(--ib-primary-strong)]">{feedback}</div> : null}{serviceError ? <p role="alert" className="mt-4 text-sm text-rose-700">{serviceError}</p> : null}{currentMemory.wrong_count >= COACH_RETRY_POLICY.offerSaveAndSkipAt ? <button type="button" onClick={saveAndSkip} className="mt-5 min-h-12 w-full rounded-full border border-[var(--ib-border-soft)] px-5 font-bold text-[var(--ib-primary)]">Simpan untuk review &amp; lewati</button> : null}{currentMemory.pronunciation_status !== 'NOT_STARTED' ? <button type="button" onClick={() => advanceTeaching(profile)} className="mt-3 min-h-12 w-full rounded-full bg-[var(--ib-primary-strong)] px-5 font-bold text-white">Lanjut</button> : null}</section> : null}
    {phase === 'COMPREHENSION' && comprehensionExpression ? <section className="mt-5 rounded-[32px] bg-white p-6 shadow-[var(--ib-shadow-card)]"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Cek pemahaman</p><h1 className="mt-3 text-2xl font-bold text-[var(--ib-primary-strong)]">Apa arti ungkapan ini?</h1><button type="button" onClick={() => playChinese(comprehensionExpression.chinese, comprehensionExpression.id)} className="mt-5 min-h-12 rounded-full border border-[var(--ib-border-soft)] px-5 font-bold text-[var(--ib-primary)]">🔊 Dengarkan tanpa melihat</button><div className="mt-5 grid gap-3">{meaningOptions.map((item) => <button type="button" key={item.id} onClick={() => answerComprehension(item.indonesian)} className="min-h-12 rounded-2xl border border-[var(--ib-border-soft)] p-3 text-left font-semibold text-[var(--ib-text-primary)]">{item.indonesian}</button>)}</div>{feedback ? <p role="status" className="mt-4 rounded-2xl bg-[var(--ib-primary-soft)] p-4 text-sm font-semibold text-[var(--ib-primary-strong)]">{feedback}</p> : null}</section> : null}
    {phase === 'ROLEPLAY' && roleplayPrompt && roleplayTarget ? <section className="mt-5 rounded-[32px] bg-white p-6 shadow-[var(--ib-shadow-card)]"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Praktik situasi · {lesson.scenario}</p><div className="mt-5 rounded-2xl bg-[var(--ib-primary-soft)] p-4"><p className="text-sm text-[var(--ib-text-secondary)]">{roleplayPrompt.role}:</p><p className="mt-2 text-3xl font-bold text-[var(--ib-primary-strong)]">{roleplayPrompt.chinese}</p><p className="mt-1 font-semibold text-[var(--ib-primary)]">{roleplayPrompt.pinyin}</p><button type="button" onClick={() => playChinese(roleplayPrompt.chinese, roleplayTarget.id)} className="mt-3 text-sm font-bold text-[var(--ib-primary)]">🔊 Dengarkan</button></div><p className="mt-5 text-sm leading-6 text-[var(--ib-text-secondary)]">Jawab dengan: <strong className="text-[var(--ib-primary-strong)]">{roleplayTarget.chinese}</strong></p><p className="text-sm font-semibold text-[var(--ib-primary)]">{roleplayTarget.pinyin}</p><div className="mt-4"><AiCoachRecorder busy={busy} onRecorded={(audio) => submitVoice(audio, 'ROLEPLAY', roleplayTarget.id)}/></div>{feedback ? <div role="status" className="mt-4 rounded-2xl bg-[var(--ib-primary-soft)] p-4 text-sm font-semibold text-[var(--ib-primary-strong)]">{feedback}</div> : null}{serviceError ? <p role="alert" className="mt-4 text-sm text-rose-700">{serviceError}</p> : null}{feedback === FEEDBACK_COPY.roleplay_pass || feedback === FEEDBACK_COPY.pronunciation_pass ? <button type="button" onClick={() => finishSession()} className="mt-5 min-h-12 w-full rounded-full bg-[var(--ib-primary)] font-bold text-white">Selesaikan latihan</button> : null}</section> : null}
  </div></main>;
}
