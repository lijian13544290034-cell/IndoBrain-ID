type Props = { content: string };

const emphasizedSections = new Set([
  'Business Goal',
  'Management Point',
  'Business Thinking',
  'Factory Tips',
]);

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
          return (
            <h2 key={key} className={`mt-10 border-l-2 border-stone-900 pl-3 text-base font-semibold text-stone-900 ${emphasizedSections.has(heading) ? 'bg-stone-50 py-2' : ''}`}>
              {heading}
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
