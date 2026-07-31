import IndonesianSpeechButton from '@/components/IndonesianSpeechButton';

export default function ChineseVoiceSlot({ text, compact = false }: { text: string; compact?: boolean }) {
  return <IndonesianSpeechButton text={text} compact={compact} language="chinese" label="🔊 播放发音" />;
}
