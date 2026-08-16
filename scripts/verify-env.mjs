const expectedAzureRegion = 'southeastasia';

const args = new Set(process.argv.slice(2));
const explicitTarget = [...args].find((arg) => arg.startsWith('--target='))?.split('=')[1];
const target = explicitTarget || process.env.VERCEL_ENV || process.env.INDOBRAIN_ENV || 'local';

function normalizeTarget(value) {
  const normalized = String(value || 'local').toLowerCase();
  if (normalized === 'preview' || normalized === 'production') return normalized;
  return 'local';
}

const environment = normalizeTarget(target);

const contract = [
  { name: 'AZURE_SPEECH_KEY', secret: true, required: { local: false, preview: true, production: true }, validate: (value) => Boolean(value) },
  { name: 'AZURE_SPEECH_REGION', secret: false, required: { local: false, preview: true, production: true }, validate: (value) => !value || value === expectedAzureRegion, expected: expectedAzureRegion },
  { name: 'TTS_SMOKE_BASE_URL', secret: false, required: { local: false, preview: false, production: false } },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', secret: false, required: { local: false, preview: false, production: false } },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', secret: true, required: { local: false, preview: false, production: false } },
  { name: 'AI_PROVIDER', secret: false, required: { local: false, preview: false, production: false } },
  { name: 'AI_MODEL', secret: false, required: { local: false, preview: false, production: false } },
  { name: 'GEMINI_API_KEY', secret: true, required: { local: false, preview: false, production: false } },
  { name: 'OPENAI_API_KEY', secret: true, required: { local: false, preview: false, production: false } },
  { name: 'OPENROUTER_API_KEY', secret: true, required: { local: false, preview: false, production: false } },
  { name: 'GROQ_API_KEY', secret: true, required: { local: false, preview: false, production: false } },
  { name: 'DEEPSEEK_API_KEY', secret: true, required: { local: false, preview: false, production: false } },
  { name: 'QWEN_API_KEY', secret: true, required: { local: false, preview: false, production: false } },
  { name: 'REFERRAL_QR_BASE_URL', secret: false, required: { local: false, preview: false, production: false } },
  { name: 'REFERRAL_LANDING_URL', secret: false, required: { local: false, preview: false, production: false } },
  { name: 'REFERRAL_COOKIE_MAX_AGE_SECONDS', secret: false, required: { local: false, preview: false, production: false } },
];

const failures = [];

console.log(`ENV CONTRACT TARGET: ${environment}`);

for (const item of contract) {
  const value = process.env[item.name];
  const exists = Boolean(value);
  const required = item.required[environment] === true;
  const validationPassed = item.validate ? item.validate(value) : true;
  const state = exists ? 'EXISTS' : 'MISSING';
  const requiredLabel = required ? 'REQUIRED' : 'OPTIONAL';

  if (required && !exists) failures.push(`${item.name}: MISSING`);
  if (exists && !validationPassed) failures.push(`${item.name}: UNEXPECTED`);

  const expected = item.expected ? ` expected=${item.expected}` : '';
  console.log(`${item.name}: ${state} ${requiredLabel} secret=${item.secret ? 'YES' : 'NO'}${expected}`);
}

if (environment === 'local' && !process.env.AZURE_SPEECH_KEY) {
  console.log('LOCAL_AZURE_TTS: NOT CONFIGURED');
  console.log('TTS REAL AUDIO: BLOCKED');
}

if (failures.length) {
  console.error('ENV CONTRACT: FAIL');
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log('ENV CONTRACT: PASS');
