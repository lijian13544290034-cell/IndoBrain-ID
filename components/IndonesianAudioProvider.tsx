'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const IndonesianAudioContext = createContext<boolean | null>(null);

export function useIndonesianAudio() {
  return useContext(IndonesianAudioContext);
}

export default function IndonesianAudioProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const updateEnabled = (next: boolean, reason: string) => {
    console.info('[IndonesianAudioProvider] setEnabled', { next, reason });
    setEnabled(next);
  };

  useEffect(() => {
    console.info('[IndonesianAudioProvider] state snapshot', { enabled, loading });
  }, [enabled, loading]);

  useEffect(() => {
    let active = true;
    console.info('[IndonesianAudioProvider] initial state', { enabled: null, configured: null, loading: false });
    console.info('[IndonesianAudioProvider] fetch start');
    setLoading(true);

    fetch('/api/tts')
      .then(async (response) => {
        console.info('[IndonesianAudioProvider] fetch response', { ok: response.ok, status: response.status });
        if (!response.ok) {
          console.info('[IndonesianAudioProvider] early return: non-success response');
          return { configured: false };
        }
        return response.json() as Promise<{ configured?: boolean; voice?: string }>;
      })
      .then((data) => {
        console.info('[IndonesianAudioProvider] API configuration', { configured: data.configured, voice: data.voice ?? null });
        if (!active) {
          console.info('[IndonesianAudioProvider] early return: provider no longer active');
          return;
        }
        updateEnabled(Boolean(data.configured), 'API configuration received');
      })
      .catch((error: unknown) => {
        console.error('[IndonesianAudioProvider] fetch exception', error);
        if (!active) {
          console.info('[IndonesianAudioProvider] early return: exception after provider cleanup');
          return;
        }
        updateEnabled(false, 'fetch exception');
      })
      .finally(() => {
        console.info('[IndonesianAudioProvider] setLoading', { next: false });
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      console.info('[IndonesianAudioProvider] cleanup');
    };
  }, []);
  return <IndonesianAudioContext.Provider value={enabled}>{children}{enabled === false && <p className="mt-4 text-xs leading-5 text-stone-500">语音功能正在配置中。<br />Fitur audio sedang disiapkan.</p>}</IndonesianAudioContext.Provider>;
}
