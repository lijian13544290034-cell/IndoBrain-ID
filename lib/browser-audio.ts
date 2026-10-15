type WebkitAudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

let sharedAudioContext: AudioContext | null = null;

/**
 * Call synchronously from a user gesture before awaiting a TTS request.
 * Mobile browsers can otherwise revoke media playback permission while the
 * request is in flight, even when the resulting MP3 is valid.
 */
export function prepareBrowserAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextConstructor = window.AudioContext
    ?? (window as WebkitAudioWindow).webkitAudioContext;
  if (!AudioContextConstructor) return null;

  sharedAudioContext ??= new AudioContextConstructor();
  if (sharedAudioContext.state === 'suspended') {
    void sharedAudioContext.resume().catch(() => undefined);
  }
  return sharedAudioContext;
}

export async function playBrowserAudioBlob(blob: Blob, preparedContext?: AudioContext | null) {
  const context = preparedContext ?? prepareBrowserAudio();
  if (context) {
    if (context.state === 'suspended') await context.resume();
    const encoded = await blob.arrayBuffer();
    const decoded = await context.decodeAudioData(encoded.slice(0));
    await new Promise<void>((resolve, reject) => {
      const source = context.createBufferSource();
      source.buffer = decoded;
      source.connect(context.destination);
      source.onended = () => {
        source.disconnect();
        resolve();
      };
      try {
        source.start(0);
      } catch (error) {
        source.disconnect();
        reject(error);
      }
    });
    return;
  }

  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.setAttribute('playsinline', '');
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => URL.revokeObjectURL(url);
    audio.onended = () => { cleanup(); resolve(); };
    audio.onerror = () => { cleanup(); reject(new Error('audio-playback-failed')); };
    void audio.play().catch((error) => { cleanup(); reject(error); });
  });
}
