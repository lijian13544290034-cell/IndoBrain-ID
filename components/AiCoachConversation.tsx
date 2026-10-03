'use client';

import { useState } from 'react';
import AiCoachRecorder from '@/components/AiCoachRecorder';
import type { CoachBrainSkillId, CoachConversationTurn, CoachEventName, CoachIntent, CoachProfile, CoachQuestionMemory, CoachSkill, ExpressionId, UserInitiatedMemory } from '@/lib/mandarin-ai-coach';

type ConversationResponse = {
  questionId: string;
  transcript: string | null;
  detectedLanguage: 'INDONESIAN' | 'CHINESE' | 'MIXED';
  intent: CoachIntent;
  intents: CoachIntent[];
  skillIds: CoachBrainSkillId[];
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
  usage: { token_input: number; token_output: number; model_calls: number; estimated_ai_cost: number; model_used: string; stt_seconds: number; stt_model: string | null };
};

function telemetry(profile: CoachProfile, event: CoachEventName, data: Record<string, unknown> = {}) {
  void fetch('/api/mandarin-coach/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: profile.sessionId, event, data: { day: 1, page: '/learn-chinese/ai-coach', ...data } }),
    keepalive: true,
  });
}

export default function AiCoachConversation({ profile, currentExpression, currentSkill, onProfileChange }: {
  profile: CoachProfile;
  currentExpression: ExpressionId | null;
  currentSkill: CoachSkill;
  onProfileChange: (profile: CoachProfile) => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingResolution, setPendingResolution] = useState<string | null>(null);

  function setConversationOpen(next: boolean) {
    setOpen(next);
    if (next) telemetry(profile, 'coach_conversation_opened', { current_expression: currentExpression, current_skill: currentSkill });
    onProfileChange({ ...profile, conversation: { ...profile.conversation, mode: next ? 'COACH_CONVERSATION' : 'GUIDED_TRAINING' } });
  }

  async function playCoachChinese(text: string, rate: 'normal' | 'slow' = 'normal') {
    setError('');
    try {
      const response = await fetch('/api/chinese-tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, rate }) });
      if (!response.ok || response.headers.get('X-IndoBrain-Chinese-TTS-Voice') !== 'zh-CN-XiaoxiaoNeural') throw new Error('tts');
      const url = URL.createObjectURL(await response.blob());
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
      onProfileChange({ ...profile, usage: { ...profile.usage, tts_calls: profile.usage.tts_calls + 1 } });
      if (rate === 'slow') telemetry(profile, 'coach_slow_audio_requested', { chinese: text.slice(0, 80), tts_rate: 'slow' });
    } catch {
      setError('Audio Mandarin zh-CN belum tersedia. Tidak ada suara pengganti yang digunakan.');
    }
  }

  async function send(message?: string, audio?: Blob) {
    const cleanMessage = (message || '').trim();
    if (!cleanMessage && !audio) return;
    setBusy(true);
    setError('');
    telemetry(profile, 'coach_question_submitted', { input_mode: audio ? 'VOICE' : 'TEXT', current_expression: currentExpression, current_skill: currentSkill });
    try {
      const recentMistakes = profile.expressions.filter((item) => item.wrong_count > item.correct_count).map((item) => item.expression_id);
      const reviewQueue = profile.expressions.filter((item) => item.mastery_level < 2).map((item) => item.expression_id);
      const form = new FormData();
      form.set('sessionId', profile.sessionId);
      if (cleanMessage) form.set('message', cleanMessage);
      if (audio) form.set('audio', audio, `coach-question.${audio.type.includes('mp4') ? 'm4a' : 'webm'}`);
      form.set('context', JSON.stringify({
        currentDay: 1,
        currentExpression,
        currentSkill,
        userLevel: 'absolute beginner',
        recentMistakes,
        masteryState: profile.expressions.map((item) => ({ expressionId: item.expression_id, masteryLevel: item.mastery_level })),
        reviewQueue,
        conversationMode: 'COACH_CONVERSATION',
        learningGoal: 'Mandarin praktis untuk kerja dan percakapan dasar',
        preferredExplanationLanguage: profile.learning.preferredExplanationLanguage,
        userInitiatedMemory: profile.learning.userInitiated,
        recentConversationSummary: profile.conversation.summary,
        recentTurns: profile.conversation.recentTurns.slice(-6).map(({ role, text }) => ({ role, text })),
      }));
      const response = await fetch('/api/mandarin-coach/conversation', { method: 'POST', body: form });
      const result = await response.json() as ConversationResponse | { error: string };
      if (!response.ok || !('questionId' in result)) throw new Error('error' in result ? result.error : 'AI Coach belum tersedia.');

      const now = result.timestamp;
      const userText = cleanMessage || result.transcript || '';
      const userTurn: CoachConversationTurn = { id: `${result.questionId}-user`, role: 'user', text: userText, intent: result.intent, createdAt: now };
      const assistantTurn: CoachConversationTurn = {
        id: `${result.questionId}-assistant`, role: 'assistant', text: result.answer,
        chinese: result.chinese || undefined, pinyin: result.pinyin || undefined, indonesian: result.indonesian || undefined,
        intent: result.intent, intents: result.intents, skillIds: result.skillIds, ttsRate: result.ttsRate, createdAt: now,
      };
      const question: CoachQuestionMemory = {
        id: result.questionId, question: userText, detected_language: result.detectedLanguage, intent: result.intent,
        detected_intents: result.intents, target_chinese: result.targetChinese || result.chinese || null, skill_used: result.skillIds,
        current_day: 1, current_expression: currentExpression, answer_category: result.answerCategory,
        resolved: null, follow_up: profile.conversation.recentTurns.length > 0, asked_at: now,
      };
      let userInitiated = profile.learning.userInitiated;
      if (result.rememberTarget && result.targetChinese && result.targetPinyin && result.targetMeaning) {
        const existing = userInitiated.find((item) => item.expression === result.targetChinese);
        const remembered: UserInitiatedMemory = existing ? { ...existing, pinyin: result.targetPinyin, meaning_id: result.targetMeaning, last_seen_at: now } : {
          id: `user-${crypto.randomUUID()}`, expression: result.targetChinese, pinyin: result.targetPinyin, meaning_id: result.targetMeaning, source: 'USER_INITIATED',
          first_seen_at: now, last_seen_at: now, last_attempt_at: null, last_success_at: null, mastery_level: 0, pronunciation_status: 'NOT_STARTED', fail_count: 0, review_count: 0, saved_for_review: false,
        };
        userInitiated = existing ? userInitiated.map((item) => item.id === existing.id ? remembered : item) : [...userInitiated, remembered].slice(-50);
      }
      const next: CoachProfile = {
        ...profile,
        usage: {
          token_input: profile.usage.token_input + result.usage.token_input,
          token_output: profile.usage.token_output + result.usage.token_output,
          stt_seconds: profile.usage.stt_seconds + result.usage.stt_seconds,
          tts_calls: profile.usage.tts_calls,
          model_calls: profile.usage.model_calls + result.usage.model_calls,
          estimated_ai_cost: profile.usage.estimated_ai_cost + result.usage.estimated_ai_cost,
        },
        conversation: {
          mode: 'COACH_CONVERSATION', summary: result.summary,
          recentTurns: [...profile.conversation.recentTurns, userTurn, assistantTurn].slice(-12),
          questions: [...profile.conversation.questions, question].slice(-20),
        },
        learning: { ...profile.learning, userInitiated },
      };
      onProfileChange(next);
      setInput('');
      setPendingResolution(result.questionId);
      telemetry(next, 'coach_answer_received', { question_id: result.questionId, intent: result.intent, answer_category: result.answerCategory, ...result.usage });
      if (result.skillGap) telemetry(next, 'coach_skill_gap', { question_id: result.questionId, target: result.targetChinese || null, current_skill: result.skillIds, reason: result.skillGapReason });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'AI Coach belum tersedia.');
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
    <div className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-2xl bg-[var(--ib-bg-muted)] p-3" aria-live="polite">
      {profile.conversation.recentTurns.length === 0 ? <div className="rounded-2xl bg-white p-3 text-sm leading-6 text-[var(--ib-text-secondary)]"><p className="font-semibold text-[var(--ib-primary-strong)]">Contoh pertanyaan:</p><p>“Kenapa 谢谢 dibaca xiè xie?”</p><p>“Kalau di tempat kerja bilang apa?”</p><p>“Saya tidak mengerti. Bisa lebih pelan?”</p></div> : null}
      {profile.conversation.recentTurns.map((turn) => <div key={turn.id} className={`rounded-2xl p-3 ${turn.role === 'user' ? 'ml-7 bg-[var(--ib-primary)] text-white' : 'mr-7 bg-white text-[var(--ib-text-primary)]'}`}><p className="whitespace-pre-wrap text-sm leading-6">{turn.text}</p>{turn.chinese ? <div className="mt-3 rounded-xl bg-[var(--ib-primary-soft)] p-3 text-[var(--ib-text-primary)]"><p className="text-2xl font-bold text-[var(--ib-primary-strong)]">{turn.chinese}</p>{turn.pinyin ? <p className="mt-1 font-semibold text-[var(--ib-primary)]">{turn.pinyin}</p> : null}{turn.indonesian ? <p className="mt-1 text-sm text-[var(--ib-text-secondary)]">{turn.indonesian}</p> : null}<button type="button" onClick={() => playCoachChinese(turn.chinese!, turn.ttsRate)} className="mt-2 text-sm font-bold text-[var(--ib-primary)]">🔊 {turn.ttsRate === 'slow' ? 'Dengarkan pelan' : 'Dengarkan'}</button></div> : turn.indonesian ? <p className="mt-2 text-sm text-[var(--ib-text-secondary)]">{turn.indonesian}</p> : null}</div>)}
    </div>
    {pendingResolution ? <div className="mt-3 flex items-center gap-2 text-xs text-[var(--ib-text-secondary)]"><span>Jawaban ini membantu?</span><button type="button" onClick={() => resolveAnswer(true)} className="rounded-full border border-[var(--ib-border-soft)] px-3 py-2 font-semibold text-[var(--ib-primary)]">Ya</button><button type="button" onClick={() => resolveAnswer(false)} className="rounded-full border border-[var(--ib-border-soft)] px-3 py-2 font-semibold text-[var(--ib-primary)]">Belum</button></div> : null}
    <label className="mt-4 block text-xs font-bold text-[var(--ib-text-secondary)]" htmlFor="coach-question">Ketik pertanyaan atau jawabanmu</label>
    <textarea id="coach-question" value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} rows={3} placeholder="Contoh: Apa artinya? / 这个怎么发音？" className="mt-2 w-full resize-none rounded-2xl border border-[var(--ib-border-soft)] bg-white p-3 text-sm outline-none focus:border-[var(--ib-primary)]" />
    <button type="button" disabled={busy || !input.trim()} onClick={() => send(input)} className="mt-2 min-h-11 w-full rounded-full bg-[var(--ib-primary-strong)] px-5 font-bold text-white disabled:opacity-50">{busy ? 'AI sedang menjawab…' : 'Kirim ke AI Coach'}</button>
    <div className="my-3 flex items-center gap-3 text-xs text-[var(--ib-text-muted)]"><span className="h-px flex-1 bg-[var(--ib-border-soft)]"/><span>atau bicara</span><span className="h-px flex-1 bg-[var(--ib-border-soft)]"/></div>
    <AiCoachRecorder busy={busy} idleLabel="🎙️ Tanya dengan suara" busyLabel="AI sedang mendengarkan…" onRecorded={(audio) => send(undefined, audio)} />
    {error ? <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p> : null}
  </section>;
}
