'use client';

import { useEffect, useState } from 'react';

type RankedItem = { label: string; count: number };
type Analytics = {
  configured: true;
  today: {
    activeUsers: number; newUsers: number; conversationUsers: number; interactions: number; interactionsPerUser: number;
    voiceInteractions: number; textInteractions: number; averageSessionSeconds: number; returningUsers: number; offTopic: number; estimatedCost: number;
  };
  topQuestions: RankedItem[]; topChinese: RankedItem[]; topIntents: RankedItem[]; topErrors: RankedItem[]; favorites: RankedItem[];
  careerGoals: RankedItem[]; requestedCapabilities: RankedItem[]; knowledgeGapDemand: RankedItem[]; reusedLessons: RankedItem[]; masteredAdaptive: RankedItem[]; skippedAdaptive: RankedItem[];
  recentUsers: Array<{ anonymousId: string; lastSeen: string; learningDays: number; interactions: number; commonIntents: RankedItem[]; favorites: number; recentQuestions: string[] }>;
};

function RankedList({ title, items }: { title: string; items: RankedItem[] }) {
  return <section className="rounded-2xl border border-stone-200 bg-white p-4"><h3 className="font-semibold">{title}</h3><ol className="mt-3 space-y-2 text-sm">{items.length ? items.map((item) => <li key={item.label} className="flex items-start justify-between gap-3"><span className="min-w-0 break-words text-gray-700">{item.label}</span><span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold">{item.count}</span></li>) : <li className="text-gray-400">暂无数据</li>}</ol></section>;
}

export default function MandarinCoachAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void fetch('/api/admin/mandarin-coach-analytics', { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json() as Analytics | { configured?: false; error?: string };
        if (!response.ok || !body.configured) throw new Error('error' in body ? body.error : 'Analytics storage is not configured.');
        setAnalytics(body as Analytics);
      })
      .catch((error) => setNotice(error instanceof Error ? error.message : 'Learning analytics unavailable.'));
  }, []);

  if (!analytics) return <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5"><h2 className="text-lg font-semibold">AI Coach Learning Analytics</h2><p className="mt-2 text-sm text-gray-500">{notice || '正在读取匿名学习数据…'}</p></section>;

  const cards: Array<[string, string | number]> = [
    ['今日活跃用户', analytics.today.activeUsers], ['今日新匿名用户', analytics.today.newUsers], ['AI 对话人数', analytics.today.conversationUsers],
    ['互动次数', analytics.today.interactions], ['人均互动', analytics.today.interactionsPerUser], ['语音 / 文字', `${analytics.today.voiceInteractions} / ${analytics.today.textInteractions}`],
    ['平均 Session', `${analytics.today.averageSessionSeconds}s`], ['多日回访用户', analytics.today.returningUsers], ['OFF_TOPIC', analytics.today.offTopic],
    ['今日估算 AI 成本', `$${analytics.today.estimatedCost.toFixed(4)}`],
  ];

  return <section className="space-y-5" aria-labelledby="coach-analytics-title">
    <div><p className="text-sm text-gray-500">Learning Analytics · 匿名教学洞察</p><h2 id="coach-analytics-title" className="mt-1 text-xl font-semibold">AI 中文教练</h2><p className="mt-1 text-sm text-gray-500">只显示教学相关的匿名会话标识、问题趋势、练习行为与成本；不显示账号密码、Token 或 Cookie。</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label, value]) => <article key={label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs text-gray-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></article>)}</div>
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5"><RankedList title="高频问题" items={analytics.topQuestions}/><RankedList title="高频中文" items={analytics.topChinese}/><RankedList title="高频意图" items={analytics.topIntents}/><RankedList title="高频错误" items={analytics.topErrors}/><RankedList title="收藏 / 稍后复习" items={analytics.favorites}/></div>
    <div><h3 className="mb-3 text-lg font-semibold">Adaptive Course Engine</h3><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"><RankedList title="Career Goals" items={analytics.careerGoals}/><RankedList title="Requested Capabilities" items={analytics.requestedCapabilities}/><RankedList title="Knowledge Gap Demand" items={analytics.knowledgeGapDemand}/><RankedList title="Reused Verified Lessons" items={analytics.reusedLessons}/><RankedList title="Mastered Content" items={analytics.masteredAdaptive}/><RankedList title="Skipped Content" items={analytics.skippedAdaptive}/></div></div>
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-stone-50 text-xs text-gray-500"><tr><th className="p-3">匿名学习者</th><th>最近学习</th><th>学习天数</th><th>AI 互动</th><th>常见意图</th><th className="p-3">最近问题</th></tr></thead><tbody>{analytics.recentUsers.map((user) => <tr key={user.anonymousId} className="border-t border-stone-100"><td className="p-3 font-mono text-xs">{user.anonymousId}</td><td>{user.lastSeen ? new Date(user.lastSeen).toLocaleString() : '—'}</td><td>{user.learningDays}</td><td>{user.interactions}</td><td>{user.commonIntents.map((item) => item.label).join('、') || '—'}</td><td className="max-w-xs p-3 text-xs text-gray-500">{user.recentQuestions.slice(0, 2).join(' / ') || '—'}</td></tr>)}</tbody></table></div>
  </section>;
}
