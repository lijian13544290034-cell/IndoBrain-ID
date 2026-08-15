'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { isIndonesianVoice } from '@/lib/indonesian-voice';

const IndonesianAudioContext = createContext<boolean | null>(null);

export function useIndonesianAudio() {
  return useContext(IndonesianAudioContext);
}

function getBrowserIndonesianVoiceStatus() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  return window.speechSynthesis.getVoices().some(isIndonesianVoice);
}

function waitForBrowserVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve(false);
  if (getBrowserIndonesianVoiceStatus()) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    const timeout = window.setTimeout(() => resolve(getBrowserIndonesianVoiceStatus()), 1000);
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      window.clearTimeout(timeout);
      resolve(getBrowserIndonesianVoiceStatus());
    }, { once: true });
  });
}

export default function IndonesianAudioProvider({ children }: { children: React.ReactNode }) {
  const [azureReady, setAzureReady] = useState<boolean | null>(null);
  const [browserIndonesianVoiceReady, setBrowserIndonesianVoiceReady] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch('/api/tts').then((response) => response.ok ? response.json() : { configured: false }).then((data: { configured?: boolean }) => Boolean(data.configured)).catch(() => false),
      waitForBrowserVoices(),
    ]).then(([azureConfigured, browserVoiceReady]) => {
      if (!mounted) return;
      setAzureReady(azureConfigured);
      setBrowserIndonesianVoiceReady(browserVoiceReady);
      console.info(`Azure TTS: ${azureConfigured ? 'Ready' : 'Not configured'}`);
      console.info(`Browser Indonesian voice: ${browserVoiceReady ? 'Ready' : 'Not available'}`);
      if (!azureConfigured && !browserVoiceReady) console.warn('TTS REAL AUDIO: BLOCKED');
    });
    return () => { mounted = false; };
  }, []);

  return (
    <IndonesianAudioContext.Provider value={azureReady}>
      {children}
      {azureReady === false && (
        <p className="mt-4 text-xs leading-5 text-stone-500">
          Azure TTS: Not configured.
          <br />
          Browser Indonesian voice: {browserIndonesianVoiceReady ? 'Ready' : 'Not available'}.
          <br />
          {!browserIndonesianVoiceReady && 'TTS REAL AUDIO: BLOCKED'}
        </p>
      )}
    </IndonesianAudioContext.Provider>
  );
}
