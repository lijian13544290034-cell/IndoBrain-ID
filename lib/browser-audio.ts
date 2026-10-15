type WebkitAudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

type PreparedBrowserAudio = {
  context: AudioContext | null;
  element: HTMLAudioElement;
};

let sharedAudioContext: AudioContext | null = null;
let sharedAudioElement: HTMLAudioElement | null = null;

// A valid, silent PCM WAV. Playing it synchronously from the tap unlocks the
// same native media element that will receive the real TTS blob later.
const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQQAAAAAAA==';

/**
 * Call synchronously from a user gesture before awaiting a TTS request.
 * Mobile browsers can otherwise revoke media playback permission while the
 * request is in flight, even when the resulting MP3 is valid.
 */
export function prepareBrowserAudio(): PreparedBrowserAudio | null {
  if (typeof window === 'undefined') return null;

  sharedAudioElement ??= new Audio();
  sharedAudioElement.preload = 'auto';
  sharedAudioElement.setAttribute('playsinline', '');
  sharedAudioElement.muted = false;
  sharedAudioElement.volume = 1;
  sharedAudioElement.src = SILENT_WAV;
  // Keep the media element alive and associated with the document on mobile.
  if (!sharedAudioElement.isConnected && document.body) {
    sharedAudioElement.hidden = true;
    document.body.appendChild(sharedAudioElement);
  }
  void sharedAudioElement.play()
    .then(() => {
      sharedAudioElement?.pause();
      if (sharedAudioElement) sharedAudioElement.currentTime = 0;
    })
    .catch(() => undefined);

  const AudioContextConstructor = window.AudioContext
    ?? (window as WebkitAudioWindow).webkitAudioContext;
  if (AudioContextConstructor) {
    sharedAudioContext ??= new AudioContextConstructor();
    if (sharedAudioContext.state === 'suspended') {
      void sharedAudioContext.resume().catch(() => undefined);
    }
  }
  return { context: sharedAudioContext, element: sharedAudioElement };
}

export async function playBrowserAudioBlob(blob: Blob, prepared?: PreparedBrowserAudio | null) {
  const preparedAudio = prepared ?? prepareBrowserAudio();
  if (!preparedAudio) throw new Error('browser-audio-unavailable');

  const url = URL.createObjectURL(blob);
  const audio = preparedAudio.element;
  audio.pause();
  audio.src = url;
  audio.muted = false;
  audio.volume = 1;
  try {
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('native-audio-playback-failed'));
      void audio.play().catch(reject);
    });
    return;
  } catch (nativeError) {
    const context = preparedAudio.context;
    if (!context) throw nativeError;
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
  } finally {
    audio.onended = null;
    audio.onerror = null;
    URL.revokeObjectURL(url);
  }
}
