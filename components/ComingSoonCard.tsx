type Props = {
  className?: string;
};

export default function ComingSoonCard({ className = '' }: Props) {
  return <article className={`flex min-h-40 flex-col rounded-xl border border-stone-200 bg-stone-50 px-5 py-5 text-stone-600 ${className}`}>
    <h2 className="text-base font-semibold text-stone-700">🚧 更多内容持续更新中</h2>
    <p className="mt-3 break-words text-sm leading-6">我们正在持续补充更多真实印尼职场沟通场景。<br />新的 Experience 将在后续版本陆续发布。</p>
    <p className="mt-5 text-sm font-medium text-stone-700">More Experiences Coming Soon</p>
    <p className="mt-2 break-words text-sm leading-6">We&apos;re continuously adding more real Indonesian workplace communication scenarios.<br />New experiences will be released in upcoming updates.</p>
  </article>;
}
