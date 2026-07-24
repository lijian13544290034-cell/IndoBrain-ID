'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const IndonesianAudioContext = createContext<boolean | null>(null);

export function useIndonesianAudio() {
  return useContext(IndonesianAudioContext);
}

export default function IndonesianAudioProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    fetch('/api/tts').then((response) => response.ok ? response.json() : { configured: false }).then((data: { configured?: boolean }) => setEnabled(Boolean(data.configured))).catch(() => setEnabled(false));
  }, []);
  return <IndonesianAudioContext.Provider value={enabled}>{children}{enabled === false && <p className="mt-4 text-xs leading-5 text-stone-500">语音功能正在配置中。<br />Fitur audio sedang disiapkan.</p>}</IndonesianAudioContext.Provider>;
}
