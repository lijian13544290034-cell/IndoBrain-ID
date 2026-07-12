export type AiMessage = { role: string; content: string };

type Provider = 'openai' | 'gemini' | 'openrouter' | 'groq' | 'deepseek' | 'qwen';

const compatibleProviders: Record<Exclude<Provider, 'gemini'>, { key: string; endpoint: string; model: string }> = {
  openai: { key: 'OPENAI_API_KEY', endpoint: 'https://api.openai.com/v1/chat/completions', model: 'gpt-5-mini' },
  openrouter: { key: 'OPENROUTER_API_KEY', endpoint: 'https://openrouter.ai/api/v1/chat/completions', model: 'openai/gpt-4o-mini' },
  groq: { key: 'GROQ_API_KEY', endpoint: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile' },
  deepseek: { key: 'DEEPSEEK_API_KEY', endpoint: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat' },
  qwen: { key: 'QWEN_API_KEY', endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', model: 'qwen-plus' },
};

function configuredProvider(): Provider | null {
  const provider = process.env.AI_PROVIDER?.toLowerCase() as Provider | undefined;
  if (!provider || !(provider === 'gemini' || provider in compatibleProviders)) return null;
  if (provider === 'gemini') return process.env.GEMINI_API_KEY ? provider : null;
  return process.env[compatibleProviders[provider].key] ? provider : null;
}

export function aiProviderStatus() {
  const provider = configuredProvider();
  return { configured: Boolean(provider), provider };
}

export async function generateAiReply(instructions: string, messages: AiMessage[]) {
  const provider = configuredProvider();
  if (!provider) throw new Error('AI_PROVIDER_NOT_CONFIGURED');

  if (provider === 'gemini') {
    const model = process.env.AI_MODEL || 'gemini-2.0-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: instructions }] }, contents: messages.map((message) => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.content }] })) }),
    });
    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('') || '';
  }

  const config = compatibleProviders[provider];
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env[config.key]}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.AI_MODEL || config.model, messages: [{ role: 'system', content: instructions }, ...messages] }),
  });
  if (!response.ok) throw new Error(`${provider} returned ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
