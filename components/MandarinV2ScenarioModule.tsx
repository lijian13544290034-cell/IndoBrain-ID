'use client';

import { useEffect, useMemo, useState } from 'react';
import MandarinV2ExpressionCard from '@/components/MandarinV2ExpressionCard';
import type { MandarinV2Course } from '@/lib/mandarin-v2-runtime';
import { mandarinV2FavoriteId } from '@/lib/mandarin-v2-runtime';
import { emptyMandarinWorkProfile, readMandarinWorkProfile, subscribeMandarinWorkProfile, toggleMandarinFavorite } from '@/lib/mandarin-work-profile';

export default function MandarinV2ScenarioModule({ course }: { course: MandarinV2Course }) {
  const [profile, setProfile] = useState(emptyMandarinWorkProfile);
  const expressions = useMemo(() => new Map(course.expressions.map((expression) => [expression.id, expression])), [course.expressions]);
  const roles = useMemo(() => new Map(course.scenario?.roles.map((role) => [role.id, role])), [course.scenario]);

  useEffect(() => {
    const sync = () => setProfile(readMandarinWorkProfile());
    sync();
    return subscribeMandarinWorkProfile(sync);
  }, []);

  if (course.contentType !== 'CAREER_SCENARIO' || !course.scenario) return null;
  const card = (expressionId: string) => {
    const expression = expressions.get(expressionId);
    if (!expression) return null;
    const favoriteId = mandarinV2FavoriteId(expression.id);
    return <MandarinV2ExpressionCard key={expression.id} expression={expression} contentType={course.contentType} favorited={profile.favorites.includes(favoriteId)} onFavorite={() => setProfile(toggleMandarinFavorite(favoriteId))} />;
  };

  return <section aria-labelledby={`${course.id}-title`}>
    <header className="rounded-3xl bg-white p-5 shadow-[var(--ib-shadow-card)]">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--ib-primary)]">Situasi Singkat · Tingkat {course.difficulty}</p>
      <h2 id={`${course.id}-title`} className="mt-2 text-2xl font-bold text-[var(--ib-primary-strong)]">{course.titleId}</h2>
      <p className="mt-1 text-sm text-[var(--ib-text-secondary)]">{course.titleZh}</p>
      <p className="mt-3 text-sm text-[var(--ib-text-secondary)]">Cocok untuk: {course.scenario.occupations.join(', ')}</p>
    </header>

    <div className="mt-5 grid gap-3" aria-label="Dialog situasi singkat">
      {course.scenario.dialogueTurns.map((turn) => {
        const expression = expressions.get(turn.expressionId);
        const role = roles.get(turn.roleId);
        if (!expression || !role) return null;
        return <div key={turn.id} className="rounded-3xl border border-[var(--ib-border-soft)] bg-white p-4">
          <p className="text-xs font-bold text-[var(--ib-primary)]">{role.titleId} · {role.titleZh}</p>
          <div className="mt-3">{card(expression.id)}</div>
        </div>;
      })}
    </div>

    {course.scenario.commonQuestionExpressionIds.length > 0 ? <section className="mt-5" aria-labelledby={`${course.id}-questions`}>
      <h3 id={`${course.id}-questions`} className="text-xl font-bold text-[var(--ib-primary-strong)]">Pertanyaan yang sering dipakai</h3>
      <div className="mt-3 grid gap-4 md:grid-cols-2">{course.scenario.commonQuestionExpressionIds.map(card)}</div>
    </section> : null}

    {course.scenario.variableExercises.length > 0 ? <section className="mt-5" aria-labelledby={`${course.id}-variables`}>
      <h3 id={`${course.id}-variables`} className="text-xl font-bold text-[var(--ib-primary-strong)]">Latihan mengganti kata</h3>
      <div className="mt-3 grid gap-5">{course.scenario.variableExercises.map((exercise) => <div key={exercise.id} className="rounded-3xl bg-[var(--ib-primary-soft)] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[var(--ib-primary)]">{exercise.variableLabelId}</p><div className="mt-3 grid gap-4 md:grid-cols-2">{[exercise.templateExpressionId, ...exercise.optionExpressionIds].map(card)}</div></div>)}</div>
    </section> : null}
  </section>;
}
