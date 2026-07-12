type Props = {
  indonesian: string;
  chinese: string;
  className?: string;
  chineseClassName?: string;
};

// Shared bilingual UI structure. Progressive localization can adjust these
// presentation classes later without changing module data or page structure.
export default function LocalizedLabel({
  indonesian,
  chinese,
  className = '',
  chineseClassName = '',
}: Props) {
  return (
    <span className={`block ${className}`} data-localization-mode="day-1">
      <span className="block">{indonesian}</span>
      <span className={`mt-1 block text-sm font-normal text-stone-500 ${chineseClassName}`}>（{chinese}）</span>
    </span>
  );
}
