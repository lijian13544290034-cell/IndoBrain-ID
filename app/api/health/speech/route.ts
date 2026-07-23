export function GET() {
  const region = process.env.AZURE_SPEECH_REGION;
  const configured = Boolean(process.env.AZURE_SPEECH_KEY && region);
  if (!configured) {
    return Response.json({ speech: 'unavailable', configured: false }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  return Response.json({ speech: 'ok', configured: true, region }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
