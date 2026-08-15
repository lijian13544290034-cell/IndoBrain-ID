const baseUrl = process.env.TTS_SMOKE_BASE_URL ?? 'http://localhost:3000';
const testSentence = 'Selamat pagi, hari ini kita belajar bahasa Indonesia.';
const expectedVoice = 'id-ID-GadisNeural';

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function main() {
  const statusResponse = await fetch(`${baseUrl}/api/tts`, { method: 'GET' });
  const status = await readJson(statusResponse);

  if (!statusResponse.ok || !status) {
    throw new Error('/api/tts status check failed');
  }

  if (status.configured !== true) {
    console.log('LOCAL_AZURE_TTS: NOT CONFIGURED');

    const failClosedResponse = await fetch(`${baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: testSentence }),
    });

    if (failClosedResponse.status !== 503) {
      throw new Error('Azure unavailable must fail closed with 503');
    }

    console.log('TTS SMOKE: FAIL CLOSED');
    return;
  }

  if (status.voice !== expectedVoice) {
    throw new Error(`Unexpected configured TTS voice: ${status.voice}`);
  }

  const response = await fetch(`${baseUrl}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: testSentence }),
  });

  if (!response.ok) {
    throw new Error(`/api/tts returned ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.startsWith('audio/')) {
    throw new Error(`Expected audio content-type, got ${contentType}`);
  }

  const voice = response.headers.get('x-indobrain-tts-voice');
  if (voice !== expectedVoice) {
    throw new Error(`Expected ${expectedVoice}, got ${voice}`);
  }

  const audio = await response.arrayBuffer();
  if (audio.byteLength < 1024) {
    throw new Error('TTS audio response is unexpectedly small');
  }

  console.log(`TTS SMOKE: PASS ${expectedVoice}`);
}

main().catch((error) => {
  console.error(`TTS SMOKE: FAIL ${error.message}`);
  process.exit(1);
});
