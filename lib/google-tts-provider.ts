import { createSign } from 'node:crypto';

export type GoogleTtsAudio = { audio: Uint8Array; voice: string; locale: string };
export type GoogleTtsSynthesis = { text: string; phoneme?: string; alphabet?: 'ipa'; rate?: 'normal' | 'slow' };

type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };
const locale = 'id-ID';
const defaultVoice = 'id-ID-Wavenet-D';
let tokenCache: { token: string; expiresAt: number } | undefined;

function escapeXml(text: string) {
  return text.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] ?? character);
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url');
}

function getCredentials(): ServiceAccount | null {
  if (process.env.GOOGLE_TTS_ENABLED !== 'true' || !process.env.GOOGLE_TTS_PROJECT_ID || !process.env.GOOGLE_TTS_CREDENTIALS_BASE64) return null;
  try {
    const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_TTS_CREDENTIALS_BASE64, 'base64').toString('utf8')) as ServiceAccount;
    return credentials.client_email && credentials.private_key ? credentials : null;
  } catch {
    return null;
  }
}

async function accessToken(credentials: ServiceAccount) {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(JSON.stringify({ iss: credentials.client_email, scope: 'https://www.googleapis.com/auth/cloud-platform', aud: credentials.token_uri ?? 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  signer.end();
  const assertion = `${header}.${claims}.${signer.sign(credentials.private_key).toString('base64url')}`;
  const response = await fetch(credentials.token_uri ?? 'https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }) });
  if (!response.ok) throw new Error('Google TTS authentication failed');
  const payload = await response.json() as { access_token?: string; expires_in?: number };
  if (!payload.access_token) throw new Error('Google TTS authentication returned no token');
  tokenCache = { token: payload.access_token, expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000 };
  return tokenCache.token;
}

export function getGoogleTtsProvider() {
  const credentials = getCredentials();
  const voice = process.env.GOOGLE_TTS_VOICE || defaultVoice;
  return {
    configured: Boolean(credentials),
    voice: credentials ? voice : null,
    locale,
    async synthesize(input: GoogleTtsSynthesis): Promise<GoogleTtsAudio> {
      if (!credentials) throw new Error('Google TTS provider is not configured');
      const token = await accessToken(credentials);
      const content = input.phoneme ? `<phoneme alphabet="${input.alphabet ?? 'ipa'}" ph="${escapeXml(input.phoneme)}">${escapeXml(input.text)}</phoneme>` : escapeXml(input.text);
      const ssml = `<speak><break time="200ms"/><prosody rate="${input.rate === 'slow' ? 'slow' : 'medium'}">${content}</prosody><break time="300ms"/></speak>`;
      const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { ssml }, voice: { languageCode: locale, name: voice }, audioConfig: { audioEncoding: 'MP3' } }),
      });
      if (!response.ok) throw new Error('Google TTS synthesis failed');
      const payload = await response.json() as { audioContent?: string };
      if (!payload.audioContent) throw new Error('Google TTS synthesis returned no audio');
      return { audio: new Uint8Array(Buffer.from(payload.audioContent, 'base64')), voice, locale };
    },
  };
}
