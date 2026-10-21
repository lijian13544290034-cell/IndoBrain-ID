'use client';

import { useState } from 'react';

export type WordBreakdownItem = { chinese: string; pinyin: string; indonesian: string };

/**
 * 拆词解释（Penjelasan kata）：默认收起，点击展开。
 * 纯前端渲染，展开不触发任何网络/模型调用。
 */
export default function WordBreakdownPanel({ items }: { items: WordBreakdownItem[] }) {
  const [open, setOpen] = useState(false);
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-8 items-center gap-1 rounded-full border border-[var(--ib-border-soft)] bg-white px-3 text-xs font-bold text-[var(--ib-primary)]"
      >
        <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        <span>Penjelasan kata</span>
        <span className="font-medium text-[var(--ib-text-secondary)]">拆词</span>
      </button>
      {open ? (
        <ul className="mt-2 space-y-1.5 rounded-xl border border-[var(--ib-border-soft)] bg-white p-2.5">
          {items.map((item, index) => (
            <li key={`${item.chinese}-${index}`} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 break-words">
              <span className="text-base font-bold text-[var(--ib-primary-strong)]">{item.chinese}</span>
              {item.pinyin ? <span className="text-xs font-semibold text-[var(--ib-primary)]">{item.pinyin}</span> : null}
              <span className="text-xs leading-5 text-[var(--ib-text-secondary)]">{item.indonesian}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
