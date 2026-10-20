'use client';

import { useEffect, useRef, useState } from 'react';
import AiCoachRecorder from '@/components/AiCoachRecorder';
import { playBrowserAudioBlob, prepareBrowserAudio } from '@/lib/browser-audio';
import { normalizeCoachConversationError, parseCoachConversationResponse } from '@/lib/mandarin-coach-conversation-client';
import type { CoachBrainSkillId, CoachCapabilityId, CoachConversationTurn, CoachEventName, CoachIntent, CoachProfile, CoachQuestionMemory, CoachSkill, ExpressionId, UserInitiatedMemory } from '@/lib/mandarin-ai-coach';
import type { CoachSpeechSegment } from '@/lib/mandarin-coach-speech';
import type { MandarinCoachCurriculumLesson } from '@/lib/mandarin-coach-curriculum-types';
import type { ActiveTeachingSession } from '@/lib/teaching-engine/telemetry-contracts';

type ConversationResponse = {
  questionId: string;
  transcript: string | null;
  detectedLanguage: 'INDONESIAN' | 'CHINESE' | 'MIXED';
  intent: CoachIntent;
  intents: CoachIntent[];
  skillIds: CoachBrainSkillId[];
  capabilityIds: CoachCapabilityId[];
  speechSegments: CoachSpeechSegment[];
  answerCategory: string;
  answer: string;
  chinese: string;
  pinyin: string;
  indonesian: string;
  followUp: string;
  summary: string;
  ttsRate: 'normal' | 'slow';
  teachingStrategy: string;
  rememberTarget: boolean;
  targetChinese: string;
  targetPinyin: string;
  targetMeaning: string;
  skillGap: boolean;
  skillGapReason: string;
  timestamp: string;
  usage: { token_input: number; token_output: number; model_calls: number; estimated_ai_cost: number; model_used: string; stt_seconds: number; stt_model: string | null; response_latency_ms: number };
  activeTeaching?: ActiveTeachingSession;
};

function telemetry(profile: CoachProfile, event: CoachEventName, data: Record<string, unknown> = {}) {
  void fetch('/api/mandarin-coach/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: profile.sessionId, event, data: { day: profile.currentDay, lesson_id: profile.lessonId, page: '/learn-chinese/ai-coach', ...data } }),
    keepalive: true,
  });
}

export default function AiCoachConversation({ profile, lesson, currentExpression, currentSkill, onProfileChange }: {
  profile: CoachProfile;
  lesson: MandarinCoachCurriculumLesson;
  currentExpression: ExpressionId | null;
  currentSkill: CoachSkill;
  onProfileChange: (profile: CoachProfile) => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingResolution, setPendingResolution] = useState<string | null>(null);
  const [lastFailedRequest, setLastFailedRequest] = useState<{ message?: string; audio?: Blob } | null>(null);
  const [activeAvailable, setActiveAvailable] = useState(false);
  const [activeTeaching, setActiveTeaching] = useState<ActiveTeachingSession | null>(null);
  const [activeTurns, setActiveTurns] = useState<CoachConversationTurn[]>([]);
  const profileRef = useRef(profile);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { setActiveTeaching(null); setActiveTurns([]); }, [lesson.id]);
  useEffect(() => {
    let cancelled = false;
    void fetch('/api/mandarin-coach/status', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => { if (!cancelled) setActiveAvailable(payload?.teachingEngine?.mode === 'ACTIVE'); })
      .catch(() => { if (!cancelled) setActiveAvailable(false); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!open) return;
    const history = historyRef.current;
    if (!history) return;
    history.scrollTo({ top: history.scrollHeight, behavior: 'smooth' });
  }, [open, profile.conversation.recentTurns.length, activeTurns.length, busy, error]);

  function setConversationOpen(next: boolean) {
    setOpen(next);
    if (next) telemetry(profile, 'coach_conversation_opened', { current_expression: currentExpression, current_skill: currentSkill });
    onProfileChange({ ...profile, conversation: { ...profile.conversation, mode: next ? 'COACH_CONVERSATION' : 'GUIDED_TRAINING' } });
  }

  async function playCoachSegments(segments: CoachSpeechSegment[], rate: 'normal' | 'slow' = 'normal', sourceProfile = profile) {
    setError('');
    try {
      const preparedAudio = prepareBrowserAudio();
      for (const segment of segments) {
        const isChinese = segment.language === 'zh-CN';
        const response = await fetch(isChinese ? '/api/chinese-tts' : '/api/tts', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isChinese ? { text: segment.text, rate } : { text: segment.text }),
        });
        const voice = response.headers.get(isChinese ? 'X-IndoBrain-Chinese-TTS-Voice' : 'X-IndoBrain-TTS-Voice');
        if (!response.ok || (isChinese ? voice !== 'zh-CN-XiaoxiaoNeural' : !voice?.startsWith('id-ID-'))) throw new Error('tts');
        await playBrowserAudioBlob(await response.blob(), preparedAudio);
      }
      onProfileChange({ ...sourceProfile, usage: { ...sourceProfile.usage, tts_calls: sourceProfile.usage.tts_calls + segments.length } });
      telemetry(sourceProfile, 'coach_response_audio_play', { segments: segments.length, zh_cn_segments: segments.filter((item) => item.language === 'zh-CN').length, id_id_segments: segments.filter((item) => item.language === 'id-ID').length, characters: segments.reduce((sum, item) => sum + item.text.length, 0), tts_rate: rate });
      if (rate === 'slow') telemetry(sourceProfile, 'coach_slow_audio_requested', { tts_rate: 'slow', segments: segments.length });
    } catch {
      setError('Audio belum tersedia. Sistem tidak mengganti bahasa suara secara otomatis.');
    }
  }

  function playCoachChinese(text: string, rate: 'normal' | 'slow' = 'normal') {
    return playCoachSegments([{ language: 'zh-CN', text }], rate);
  }

  async function send(message?: string, audio?: Blob, activeStart = false) {
    const cleanMessage = (message || '').trim();
    if (!cleanMessage && !audio) return;
    setBusy(true);
    setError('');
    setLastFailedRequest(null);
    if (!activeStart && !activeTeaching) telemetry(profile, 'coach_question_submitted', { input_mode: audio ? 'VOICE' : 'TEXT', current_expression: currentExpression, current_skill: currentSkill });
    try {
      const recentMistakes = profile.expressions.filter((item) => item.wrong_count > item.correct_count).map((item) => item.expression_id);
      const reviewQueue = profile.expressions.filter((item) => item.mastery_level < 2).map((item) => item.expression_id);
      const form = new FormData();
      form.set('sessionId', profile.sessionId);
      if (cleanMessage) form.set('message', cleanMessage);
      if (audio) form.set('audio', audio, `coach-question.${audio.type.includes('mp4') ? 'm4a' : 'webm'}`);
      form.set('context', JSON.stringify({
        lessonId: lesson.id,
        currentDay: lesson.day,
        currentExpression,
        currentSkill,
        userLevel: 'absolute beginner',
        recentMistakes,
        masteryState: profile.expressions.map((item) => ({ expressionId: item.expression_id, masteryLevel: item.mastery_level })),
        reviewQueue,
        conversationMode: 'COACH_CONVERSATION',
        learningGoal: `${lesson.courseTitleId} · ${lesson.title} · ${lesson.scenario}`,
        preferredExplanationLanguage: profile.learning.preferredExplanationLanguage,
        userInitiatedMemory: profile.learning.userInitiated,
        recentConversationSummary: profile.conversation.summary,
        recentTurns: profile.conversation.recentTurns.slice(-6).map(({ role, text }) => ({ role, text })),
        sessionStartedAt: profile.startedAt,
        messageCount: profile.conversation.questions.length,
        activeTeaching,
        activeTeachingStart: activeStart,
      }));
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 45_000);
      let response: Response;
      try {
        response = await fetch('/api/mandarin-coach/conversation', { method: 'POST', body: form, signal: controller.signal });
      } finally {
        window.clearTimeout(timeout);
      }
      const result = await parseCoachConversationResponse<ConversationResponse>(response);
      if (result.activeTeaching) {
        setActiveTeaching(result.activeTeaching);
        const now = result.timestamp;
        const userText = cleanMessage || result.transcript || '';
        const activeUserTurn: CoachConversationTurn = { id: `${result.questionId}-user`, role: 'user', text: userText, intent: result.intent, createdAt: now };
        const activeAssistantTurn: CoachConversationTurn = { id: `${result.questionId}-assistant`, role: 'assistant', text: result.answer, chinese: result.chinese || undefined, pinyin: result.pinyin || undefined, indonesian: result.indonesian || undefined, speechSegments: result.speechSegments, ttsRate: result.ttsRate, createdAt: now };
        setActiveTurns((turns) => [...turns, activeUserTurn, activeAssistantTurn].slice(-14));
        setInput('');
        setPendingResolution(null);
        if (audio && result.speechSegments.length) void playCoachSegments(result.speechSegments, result.ttsRate, profileRef.current);
        return;
      }

      const currentProfile = profileRef.current;
      const now = result.timestamp;
      const userText = cleanMessage || result.transcript || '';
      const userTurn: CoachConversationTurn = { id: `${result.questionId}-user`, role: 'user', text: userText, intent: result.intent, createdAt: now };
      const assistantTurn: CoachConversationTurn = {
        id: `${result.questionId}-assistant`, role: 'assistant', text: result.answer,
        chinese: result.chinese || undefined, pinyin: result.pinyin || undefined, indonesian: result.indonesian || undefined,
        intent: result.intent, intents: result.intents, skillIds: result.skillIds, capabilityIds: result.capabilityIds,
        speechSegments: result.speechSegments, ttsRate: result.ttsRate, createdAt: now,
      };
      const question: CoachQuestionMemory = {
        id: result.questionId, question: userText, detected_language: result.detectedLanguage, intent: result.intent,
        detected_intents: result.intents, target_chinese: result.targetChinese || result.chinese || null, skill_used: result.skillIds,
        current_day: lesson.day ?? 0, current_expression: currentExpression, answer_category: result.answerCategory,
        resolved: null, follow_up: currentProfile.conversation.recentTurns.length > 0, asked_at: now,
      };
      let userInitiated = currentProfile.learning.userInitiated;
      if (result.rememberTarget && result.targetChinese && result.targetPinyin && result.targetMeaning) {
        const existing = userInitiated.find((item) => item.expression === result.targetChinese);
        const remembered: UserInitiatedMemory = existing ? { ...existing, pinyin: result.targetPinyin, meaning_id: result.targetMeaning, last_seen_at: now } : {
          id: `user-${crypto.randomUUID()}`, expression: result.targetChinese, pinyin: result.targetPinyin, meaning_id: result.targetMeaning, source: 'USER_INITIATED',
          first_seen_at: now, last_seen_at: now, last_attempt_at: null, last_success_at: null, mastery_level: 0, pronunciation_status: 'NOT_STARTED', fail_count: 0, review_count: 0, saved_for_review: false,
        };
        userInitiated = existing ? userInitiated.map((item) => item.id === existing.id ? remembered : item) : [...userInitiated, remembered].slice(-50);
      }
      const next: CoachProfile = {
        ...currentProfile,
        usage: {
          token_input: currentProfile.usage.token_input + result.usage.token_input,
          token_output: currentProfile.usage.token_output + result.usage.token_output,
          stt_seconds: currentProfile.usage.stt_seconds + result.usage.stt_seconds,
          tts_calls: currentProfile.usage.tts_calls,
          model_calls: currentProfile.usage.model_calls + result.usage.model_calls,
          estimated_ai_cost: currentProfile.usage.estimated_ai_cost + result.usage.estimated_ai_cost,
        },
        conversation: {
          mode: 'COACH_CONVERSATION', summary: result.summary,
          recentTurns: [...currentProfile.conversation.recentTurns, userTurn, assistantTurn].slice(-12),
          questions: [...currentProfile.conversation.questions, question].slice(-20),
        },
        learning: { ...currentProfile.learning, userInitiated },
      };
      profileRef.current = next;
      onProfileChange(next);
      setInput('');
      setPendingResolution(result.questionId);
      telemetry(next, 'coach_answer_received', { question_id: result.questionId, intent: result.intent, answer_category: result.answerCategory, ...result.usage });
      if (result.skillGap) telemetry(next, 'coach_skill_gap', { question_id: result.questionId, target: result.targetChinese || null, current_skill: result.skillIds, reason: result.skillGapReason });
      if (audio && result.speechSegments.length) void playCoachSegments(result.speechSegments, result.ttsRate, next);
    } catch (caught) {
      const failure = normalizeCoachConversationError(caught);
      setError(failure.message);
      setLastFailedRequest({ message: cleanMessage || undefined, audio });
    } finally {
      setBusy(false);
    }
  }

  function resolveAnswer(resolved: boolean) {
    if (!pendingResolution) return;
    const next = {
      ...profile,
      conversation: {
        ...profile.conversation,
        questions: profile.conversation.questions.map((item) => item.id === pendingResolution ? { ...item, resolved } : item),
      },
    };
    onProfileChange(next);
    telemetry(next, resolved ? 'coach_answer_helpful' : 'coach_answer_unresolved', { question_id: pendingResolution, resolved });
    setPendingResolution(null);
  }

  if (!open) return <button type="button" onClick={() => setConversationOpen(true)} className="mt-4 min-h-12 w-full rounded-2xl border border-[var(--ib-primary)] bg-[var(--ib-primary-soft)] px-5 font-bold text-[var(--ib-primary-strong)]">💬 Tanya AI Coach <span className="ml-1 text-xs font-medium">问AI教练</span></button>;

  return <section className="mt-4 rounded-[28px] border border-[var(--ib-border-soft)] bg-white p-4 shadow-[var(--ib-shadow-card)] sm:p-5" aria-label="Coach Conversation">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Coach Conversation</p><h2 className="mt-1 text-xl font-bold text-[var(--ib-primary-strong)]">Tanya AI Coach</h2><p className="mt-1 text-xs text-[var(--ib-text-secondary)]">Tanya dalam Bahasa Indonesia atau 中文.</p></div><button type="button" onClick={() => setConversationOpen(false)} className="min-h-10 shrink-0 rounded-full border border-[var(--ib-border-soft)] px-3 text-sm font-bold text-[var(--ib-primary)]">Kembali Belajar</button></div>
    <div ref={historyRef} className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-2xl bg-[var(--ib-bg-muted)] p-3" aria-live="polite">
      {(activeTeaching ? activeTurns : profile.conversation.recentTurns).length === 0 ? <div className="rounded-2xl bg-white p-3 text-sm leading-6 text-[var(--ib-text-secondary)]"><p className="font-semibold text-[var(--ib-primary-strong)]">Contoh pertanyaan:</p><p>“Kenapa 谢谢 dibaca xiè xie?”</p><p>“Kalau di tempat kerja bilang apa?”</p><p>“Saya tidak mengerti. Bisa lebih pelan?”</p></div> : null}
      {(activeTeaching ? activeTurns : profile.conversation.recentTurns).map((turn) => <div key={turn.id} className={`rounded-2xl p-3 ${turn.role === 'user' ? 'ml-7 bg-[var(--ib-primary)] text-white' : 'mr-7 bg-white text-[var(--ib-text-primary)]'}`}><p className="whitespace-pre-wrap text-sm leading-6">{turn.text}</p>{turn.chinese ? <div className="mt-3 rounded-xl bg-[var(--ib-primary-soft)] p-3 text-[var(--ib-text-primary)]"><p className="text-2xl font-bold text-[var(--ib-primary-strong)]">{turn.chinese}</p>{turn.pinyin ? <p className="mt-1 font-semibold text-[var(--ib-primary)]">{turn.pinyin}</p> : null}{turn.indonesian ? <p className="mt-1 text-sm text-[var(--ib-text-secondary)]">{turn.indonesian}</p> : null}<button type="button" onClick={() => playCoachChinese(turn.chinese!, turn.ttsRate)} className="mt-2 text-sm font-bold text-[var(--ib-primary)]">🔊 Mandarin</button></div> : turn.indonesian ? <p className="mt-2 text-sm text-[var(--ib-text-secondary)]">{turn.indonesian}</p> : null}{turn.role === 'assistant' && turn.speechSegments?.length ? <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => playCoachSegments(turn.speechSegments!, 'normal')} className="min-h-10 rounded-full border border-[var(--ib-border-soft)] px-3 text-xs font-bold text-[var(--ib-primary)]">🔊 Dengarkan jawaban</button><button type="button" onClick={() => playCoachSegments(turn.speechSegments!, 'slow')} className="min-h-10 rounded-full border border-[var(--ib-border-soft)] px-3 text-xs font-bold text-[var(--ib-primary)]">🐢 Pelan</button></div> : null}</div>)}
    </div>
    {activeAvailable && lesson.id === 'mandarin-work-level-1-day-27' ? <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950"><p className="font-bold">Latihan aktif: 我明天上班</p><p className="mt-1 text-xs">Sesi sementara, tidak disimpan sebagai nilai penguasaan.</p><button type="button" disabled={busy} onClick={() => { setActiveTeaching(null); setActiveTurns([]); void send('Mulai latihan aktif.', undefined, true); }} className="mt-2 min-h-10 rounded-full bg-[var(--ib-primary-strong)] px-4 font-bold text-white disabled:opacity-50">{activeTeaching ? 'Mulai ulang latihan' : 'Mulai latihan aktif'}</button>{activeTeaching ? <p className="mt-2 text-xs font-semibold">Tahap: {activeTeaching.stage} · Status: {activeTeaching.masteryStatus}</p> : null}</div> : null}
    {pendingResolution ? <div className="mt-3 flex items-center gap-2 text-xs text-[var(--ib-text-secondary)]"><span>Jawaban ini membantu?</span><button type="button" onClick={() => resolveAnswer(true)} className="rounded-full border border-[var(--ib-border-soft)] px-3 py-2 font-semibold text-[var(--ib-primary)]">Ya</button><button type="button" onClick={() => resolveAnswer(false)} className="rounded-full border border-[var(--ib-border-soft)] px-3 py-2 font-semibold text-[var(--ib-primary)]">Belum</button></div> : null}
    <label className="mt-4 block text-xs font-bold text-[var(--ib-text-secondary)]" htmlFor="coach-question">Ketik pertanyaan atau jawabanmu</label>
    <textarea id="coach-question" value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} rows={3} placeholder="Contoh: Apa artinya? / 这个怎么发音？" className="mt-2 w-full resize-none rounded-2xl border border-[var(--ib-border-soft)] bg-white p-3 text-sm outline-none focus:border-[var(--ib-primary)]" />
    <button type="button" disabled={busy || !input.trim()} onClick={() => send(input)} className="mt-2 min-h-11 w-full rounded-full bg-[var(--ib-primary-strong)] px-5 font-bold text-white disabled:opacity-50">{busy ? 'AI sedang menjawab…' : 'Kirim ke AI Coach'}</button>
    {error ? <div role="alert" className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><p>{error}</p>{lastFailedRequest ? <button type="button" disabled={busy} onClick={() => send(lastFailedRequest.message, lastFailedRequest.audio)} className="mt-2 min-h-10 rounded-full border border-rose-300 bg-white px-4 font-bold text-rose-800 disabled:opacity-50">Coba lagi</button> : null}</div> : null}
    <div className="my-3 flex items-center gap-3 text-xs text-[var(--ib-text-muted)]"><span className="h-px flex-1 bg-[var(--ib-border-soft)]"/><span>atau bicara</span><span className="h-px flex-1 bg-[var(--ib-border-soft)]"/></div>
    <AiCoachRecorder busy={busy} idleLabel={(activeTeaching ? activeTurns : profile.conversation.recentTurns).length ? '🎙️ Balas dengan suara' : '🎙️ Tanya dengan suara'} busyLabel="AI sedang mendengarkan…" onRecorded={(audio) => send(undefined, audio)} />
  </section>;
}
