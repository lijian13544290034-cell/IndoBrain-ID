type Props = { content: string };

const emphasizedSections = new Set([
  'Business Goal',
  'Management Point',
  'Business Thinking',
  'Factory Tips',
]);

const localizedHeadings: Record<string, { indonesian: string; chinese: string }> = {
  Role: { indonesian: 'Peran', chinese: '角色' },
  Scenario: { indonesian: 'Situasi', chinese: '场景' },
  'Story Background': { indonesian: 'Latar Belakang', chinese: '背景' },
  'Business Goal': { indonesian: 'Tujuan Kerja', chinese: '工作目标' },
  'Management Point': { indonesian: 'Fokus Manajemen', chinese: '管理重点' },
  Task: { indonesian: 'Tugas', chinese: '任务' },
  '🎬 Scene': { indonesian: 'Percakapan', chinese: '对话' },
  "Today's Harvest": { indonesian: 'Kata Penting Hari Ini', chinese: '今日重点词汇' },
  'Factory Tips': { indonesian: 'Tips Pabrik', chinese: '工厂提示' },
  'Business Thinking': { indonesian: 'Pemikiran Manajemen', chinese: '管理思考' },
  'Common Mistakes': { indonesian: 'Kesalahan Umum', chinese: '常见错误' },
  Localization: { indonesian: 'Ungkapan Lokal', chinese: '本地表达' },
  'Industry Vocabulary': { indonesian: 'Kosakata Industri', chinese: '行业词汇' },
  Variables: { indonesian: 'Variabel', chinese: '变量' },
  'Next Scene': { indonesian: 'Situasi Berikutnya', chinese: '下一场景' },
};

export default function MarkdownExperience({ content }: Props) {
  return (
    <article className="mt-8 rounded-2xl border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
      {content.split('\n').map((line, index) => {
        const key = `${index}-${line}`;

        if (line.startsWith('# ')) {
          return <h1 key={key} className="mb-8 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          const heading = line.slice(3);
          const label = localizedHeadings[heading];
          return (
            <h2 key={key} className={`mt-10 border-l-2 border-stone-900 pl-3 text-base font-semibold text-stone-900 ${emphasizedSections.has(heading) ? 'bg-stone-50 py-2' : ''}`}>
              {label ? <>{label.indonesian} <span className="text-sm font-normal text-stone-500">（{label.chinese}）</span></> : heading}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return <h3 key={key} className="mt-7 text-sm font-semibold text-stone-900">{line.slice(4)}</h3>;
        }
        if (line === '---') {
          return <hr key={key} className="my-9 border-stone-200" />;
        }
        if (line === '') {
          return <div key={key} className="h-3" />;
        }
        if (line.startsWith('- ')) {
          return <p key={key} className="ml-5 text-[15px] leading-7 text-stone-700">• {line.slice(2)}</p>;
        }
        if (line.startsWith('> ')) {
          return <p key={key} className="border-l-2 border-stone-300 pl-4 text-[15px] leading-7 text-stone-600">{line.slice(2)}</p>;
        }

        return <p key={key} className="text-[15px] leading-7 text-stone-700 sm:text-base sm:leading-8">{line.replace(/`/g, '')}</p>;
      })}
    </article>
  );
}
