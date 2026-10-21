import type { CoachBrainSkillId, CoachCapabilityId, CoachIntent } from '@/lib/mandarin-ai-coach';

export type MandarinCoachSkill = {
  skill_id: CoachBrainSkillId;
  version: '0.1.0';
  intent: string[];
  applicable_level: Array<'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE'>;
  teaching_goal: string;
  teaching_strategy: string[];
  indonesian_learner_notes: string[];
  rules: string[];
  examples: string[];
  common_errors: string[];
  fallback_strategy: string;
  output_constraints: string[];
  source: 'INDOBRAIN_COACH_BRAIN_V0.1';
  research_basis: string[];
  test_cases: string[];
};

const sharedConstraints = [
  'Use simple Bahasa Indonesia as the explanation language for beginners.',
  'Use Simplified Chinese and tone-marked Hanyu Pinyin for teaching targets.',
  'Default to one learning point and one short example; do not overload the learner.',
  'Never refuse an in-scope question merely because it is outside the current course day.',
];

export const MANDARIN_COACH_SKILLS: Record<CoachBrainSkillId, MandarinCoachSkill> = {
  VOCABULARY: {
    skill_id: 'VOCABULARY', version: '0.1.0', intent: ['ask how to say a word', 'unknown Chinese word'], applicable_level: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE'],
    teaching_goal: 'Teach one requested Chinese expression with minimum cognitive load.',
    teaching_strategy: ['Chinese → pinyin → Indonesian meaning', 'Add one 2–6 character high-frequency example', 'Invite one optional next step'],
    indonesian_learner_notes: ['Understand Indonesian slang and abbreviations such as gmn = gimana', 'Do not assume Latin-letter pinyin is Indonesian pronunciation'],
    rules: ['Answer user-initiated vocabulary even when absent from the course', 'Store a useful new target in personal memory'],
    examples: ['minum → 喝 / hē; 喝水 / hē shuǐ'], common_errors: ['Expanding into many related words', 'Refusing because the word is not in the lesson'],
    fallback_strategy: 'If the target is ambiguous, ask one short Indonesian clarification question.', output_constraints: sharedConstraints, source: 'INDOBRAIN_COACH_BRAIN_V0.1', research_basis: ['retrieval practice', 'cognitive load control'], test_cases: ['Kalau minum dalam Mandarin apa?', '喝 bahasa Mandarin apa?'],
  },
  PRONUNCIATION: {
    skill_id: 'PRONUNCIATION', version: '0.1.0', intent: ['how to read', 'pronunciation correction', 'slow playback'], applicable_level: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE'],
    teaching_goal: 'Produce intelligible standard Mainland Mandarin without overwhelming the learner.',
    teaching_strategy: ['Retrieve only the relevant pronunciation rule', 'Model natural connected speech', 'On repeated difficulty: listen again → chunk/contrast → save and skip'],
    indonesian_learner_notes: ['Prioritize tones, j/q/x, z/c/s, zh/ch/sh, u/ü and pinyin segmentation only when relevant'],
    rules: ['Never teach 你好 as two isolated full third tones in connected speech', 'Slow requests must set actual TTS rate to slow', 'zh-CN only; fail closed'],
    examples: ['你好 → ní hǎo in natural connected speech'], common_errors: ['Explaining every tone rule at once', 'Text-only promise to speak slower'],
    fallback_strategy: 'Use syllable chunks and one contrast; after three failures offer Simpan & Lewati.', output_constraints: sharedConstraints, source: 'INDOBRAIN_COACH_BRAIN_V0.1', research_basis: ['perception before production', 'corrective feedback'], test_cases: ['你好怎么读？', 'coba baca lebih pelan'],
  },
  MEANING: {
    skill_id: 'MEANING', version: '0.1.0', intent: ['what does this mean'], applicable_level: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE'],
    teaching_goal: 'Explain Chinese meaning in learner-friendly Indonesian.', teaching_strategy: ['Identify the Chinese target first', 'Give direct Indonesian meaning', 'Add context only when needed'],
    indonesian_learner_notes: ['Chinese input does not imply Chinese explanation language'], rules: ['Never emit an internal misunderstanding before a correct final answer'],
    examples: ['我饿了 / wǒ è le / Saya lapar'], common_errors: ['Switching the full explanation to Chinese'], fallback_strategy: 'Ask which Chinese segment the learner means.', output_constraints: sharedConstraints, source: 'INDOBRAIN_COACH_BRAIN_V0.1', research_basis: ['L1-supported instruction'], test_cases: ['我饿了什么意思，怎么读？', '这个 apa artinya?'],
  },
  CORRECTION: {
    skill_id: 'CORRECTION', version: '0.1.0', intent: ['is my Chinese correct', 'repeated pronunciation error'], applicable_level: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE'],
    teaching_goal: 'Correct the smallest useful problem and change strategy when repetition fails.', teaching_strategy: ['First error: brief correction', 'Second: chunk/contrast/slow', 'Third: offer retry or save and skip'],
    indonesian_learner_notes: ['Treat non-standard pinyin and mixed spelling as a learning attempt'], rules: ['Never loop indefinitely', 'Persist NEEDS_REVIEW when skipped'],
    examples: ['wo e le bener ga? → 我饿了 / wǒ è le'], common_errors: ['Binary PASS/FAIL with no actionable help'], fallback_strategy: 'Accept the communicative intent and model the corrected target.', output_constraints: sharedConstraints, source: 'INDOBRAIN_COACH_BRAIN_V0.1', research_basis: ['adaptive corrective feedback'], test_cases: ['wo e le bener ga?'],
  },
  EXAMPLE: {
    skill_id: 'EXAMPLE', version: '0.1.0', intent: ['give another example'], applicable_level: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE'],
    teaching_goal: 'Give exactly enough context to understand the current target.', teaching_strategy: ['Prefer 2–6 Chinese characters', 'Use high-frequency work/life context'],
    indonesian_learner_notes: ['Avoid adding several unknown words'], rules: ['One example by default'], examples: ['喝 → 喝水'], common_errors: ['Long literary sentences'], fallback_strategy: 'Reuse known vocabulary around the target.', output_constraints: sharedConstraints, source: 'INDOBRAIN_COACH_BRAIN_V0.1', research_basis: ['comprehensible input'], test_cases: ['Kasih contoh lain'],
  },
  CONVERSATION: {
    skill_id: 'CONVERSATION', version: '0.1.0', intent: ['continue dialogue', 'learning follow-up'], applicable_level: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE'],
    teaching_goal: 'Move the learner one small conversational step forward without forcing a fixed flow.', teaching_strategy: ['Answer first', 'Offer one optional practice turn', 'Allow topic changes'],
    indonesian_learner_notes: ['Pause roleplay for Indonesian meaning questions, then resume'], rules: ['Do not end every answer abruptly', 'Do not force continuation'],
    examples: ['Mau coba ucapkan “喝”?'], common_errors: ['Turning every question into a long lesson'], fallback_strategy: 'Offer Kembali Belajar.', output_constraints: sharedConstraints, source: 'INDOBRAIN_COACH_BRAIN_V0.1', research_basis: ['scaffolded dialogue'], test_cases: ['Apa artinya?', '我叫 Budi。'],
  },
  WORKPLACE: {
    skill_id: 'WORKPLACE', version: '0.1.0', intent: ['workplace Chinese', 'boss, HR, interview, factory, logistics'], applicable_level: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE'],
    teaching_goal: 'Teach natural, immediately usable workplace Mandarin.', teaching_strategy: ['Explain pragmatic meaning', 'Give one natural short response', 'Prefer spoken over formal written phrasing'],
    indonesian_learner_notes: ['Work scenarios are in scope even when the surface question mentions a boss or interview'], rules: ['Never classify authentic workplace-language questions as OFF_TOPIC'],
    examples: ['辛苦了 → 谢谢 / 不辛苦', '我有三年工作经验'], common_errors: ['Formal textbook phrasing', 'Blocking work questions as general advice'], fallback_strategy: 'Ask for the workplace role or exact situation.', output_constraints: sharedConstraints, source: 'INDOBRAIN_COACH_BRAIN_V0.1', research_basis: ['task-based language teaching'], test_cases: ['Bos bilang 辛苦了, saya jawab apa?', 'Kalau interview kerja...'],
  },
  REVIEW: {
    skill_id: 'REVIEW', version: '0.1.0', intent: ['review', 'remember prior learning'], applicable_level: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE'],
    teaching_goal: 'Select a small, explainable review item from personal learning memory.', teaching_strategy: ['Prioritize saved/skipped', 'Then repeated errors', 'Then recently learned or long-unreviewed'],
    indonesian_learner_notes: ['Explain why an item is being reviewed'], rules: ['Do not replay every previous item', 'Include user-initiated expressions'],
    examples: ['Kemarin kamu belajar 喝. Masih ingat?'], common_errors: ['Reviewing only course items'], fallback_strategy: 'Review the least-mastered recent expression.', output_constraints: sharedConstraints, source: 'INDOBRAIN_COACH_BRAIN_V0.1', research_basis: ['retrieval practice', 'future spaced repetition'], test_cases: ['Review kata yang belum saya kuasai'],
  },
  STUDY_PLANNING: {
    skill_id: 'STUDY_PLANNING', version: '0.1.0', intent: ['request a study plan', 'career goal for working with Chinese speakers', 'job-seeking guidance'], applicable_level: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE'],
    teaching_goal: 'Turn the learner\'s goal (job, level, timeline) into a concrete short study plan built from approved course lessons, plus basic job requirements.',
    teaching_strategy: ['Restate the detected goal in one sentence', 'Ask at most ONE clarifying question (target job/role) when missing', 'Give a staged plan referencing real course days', 'List minimal job requirements (self-introduction, greetings, work vocabulary)'],
    indonesian_learner_notes: ['Pemula = zero basics; start from greetings and self-introduction', 'Plan answers may be longer than vocabulary answers but stay concrete'],
    rules: ['Never reply to a study-plan request with only a greeting phrase', 'Always include at least one concrete next lesson or milestone', 'Do not invent course days that do not exist in the approved curriculum', 'Job requirements must stay generic and encouraging, never gatekeeping'],
    examples: ['mau kerja di PT China → plan: perkenalan diri → bahasa pabrik → interview'],
    common_errors: ['Answering with a fixed Day-1 phrase like 你好 only', 'Redirecting the learner away instead of planning'],
    fallback_strategy: 'If the goal is unclear, ask for target occupation and weekly study time in one short question.', output_constraints: sharedConstraints, source: 'INDOBRAIN_COACH_BRAIN_V0.1', research_basis: ['goal-setting', 'career-aware language planning'], test_cases: ['saya orang pemula, mau kerja di PT China, buatkan les', 'buatkan rencana belajar mandarin'],
  },
  COMMUNICATION_REQUEST: {
    skill_id: 'COMMUNICATION_REQUEST', version: '0.1.0', intent: ['what should I say to someone in a real situation', 'request to a third party (driver, boss, supplier, colleague)'], applicable_level: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE'],
    teaching_goal: 'Compose the exact sentence the LEARNER should say to another person, with pinyin, Indonesian meaning and a more natural alternative.',
    teaching_strategy: ['Identify the communicative goal (request, refusal, instruction)', 'Give the target sentence in simplified Chinese + tone-marked pinyin + Indonesian', 'Add one more natural/softer alternative', 'Note one pragmatics tip when useful'],
    indonesian_learner_notes: ['Learner describes the situation in Indonesian; the answer is what THEY should say in Mandarin'],
    rules: ['Never merely translate the learner\'s description back as if it were the answer', 'Always include a natural alternative or register note', 'Chinese → pinyin → Indonesian order is fixed'],
    examples: ['今天我太累了，你来开车吧 / jīn tiān wǒ tài lèi le, nǐ lái kāi chē ba / Hari ini saya terlalu lelah, kamu yang nyetir ya'],
    common_errors: ['Translating "saya capek tidak mau nyetir" literally without the request frame', 'Missing the practical alternative'],
    fallback_strategy: 'If the situation is ambiguous, ask who the listener is and what the learner wants them to do.', output_constraints: sharedConstraints, source: 'INDOBRAIN_COACH_BRAIN_V0.1', research_basis: ['speech-act based instruction', 'pragmatics'], test_cases: ['今天太累了，我不想开车，我应该怎么和司机说？', 'gimana bilang ke supir tunggu sebentar?'],
  },
};

export function getCoachSkills(ids: CoachBrainSkillId[]) {
  return ids.map((id) => MANDARIN_COACH_SKILLS[id]);
}

export const MANDARIN_COACH_CAPABILITIES: Record<CoachCapabilityId, { goal: string; rules: string[] }> = {
  LANGUAGE_ROUTER: { goal: 'Understand Indonesian, Chinese, mixed input, slang and simple pinyin without a language selector.', rules: ['Route by learning intent, not keywords alone.', 'Keep authentic workplace-language questions in scope.'] },
  TRANSLATION_EXPLANATION: { goal: 'Use translation as a short bridge into learning Mandarin.', rules: ['Default explanations to simple Indonesian.', 'Teach standard Mandarin with tone-marked pinyin.'] },
  CHINESE_TEACHER: { goal: 'Turn a useful answer into one optional low-pressure practice step.', rules: ['Answer first.', 'Offer one short example or practice turn; never force it.'] },
  CORRECTION: { goal: 'Correct the smallest useful issue and invite one retry.', rules: ['Acknowledge communicative intent.', 'Do not produce a linguistic lecture.'] },
  ROLE_PLAY: { goal: 'Practice natural work and life Mandarin through short roleplay turns.', rules: ['Pause roleplay for meaning questions.', 'Resume with a clear short model answer.'] },
  PRONUNCIATION_SPEAKING: { goal: 'Support voice-first Mandarin listening, speaking and pronunciation feedback.', rules: ['Mandarin TTS is zh-CN only.', 'Mixed-language responses use language-specific speech segments.'] },
  DIFFICULTY_CONTROL: { goal: 'Keep beginner output short and adapt after repeated difficulty.', rules: ['Use one learning point at a time.', 'Change strategy at retry two and offer save/skip at retry three.'] },
  LEARNING_MEMORY: { goal: 'Use structured memory to select review and personalize the next step.', rules: ['Remember learning evidence, not unrelated personal details.', 'Do not put unlimited raw conversation into model context.'] },
};

export function getCoachCapabilityIds(intents: CoachIntent[], skills: CoachBrainSkillId[], offTopic: boolean): CoachCapabilityId[] {
  if (offTopic) return ['LANGUAGE_ROUTER'];
  const ids = new Set<CoachCapabilityId>(['LANGUAGE_ROUTER', 'CHINESE_TEACHER', 'DIFFICULTY_CONTROL', 'LEARNING_MEMORY']);
  if (skills.some((skill) => ['VOCABULARY', 'MEANING', 'EXAMPLE'].includes(skill)) || intents.includes('GRAMMAR')) ids.add('TRANSLATION_EXPLANATION');
  if (skills.includes('CORRECTION')) ids.add('CORRECTION');
  if (intents.includes('ROLEPLAY') || skills.includes('WORKPLACE')) ids.add('ROLE_PLAY');
  if (skills.includes('PRONUNCIATION') || intents.includes('CONVERSATION')) ids.add('PRONUNCIATION_SPEAKING');
  return [...ids];
}

export function getCoachCapabilities(ids: CoachCapabilityId[]) {
  return ids.map((id) => ({ capability_id: id, ...MANDARIN_COACH_CAPABILITIES[id] }));
}
