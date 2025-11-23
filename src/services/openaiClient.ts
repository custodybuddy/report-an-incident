import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const client = apiKey
  ? new OpenAI({
      apiKey,
      // Frontend-only demo: the key must be provided at build time. For production, proxy this through a backend.
      dangerouslyAllowBrowser: true,
    })
  : null;

export const isOpenAIConfigured = Boolean(client);

export const generateNarrativeSummary = async (narrative: string) => {
  if (!client) {
    throw new Error('OpenAI API key is not configured. Set VITE_OPENAI_API_KEY in your environment.');
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: 'Summarize the incident objectively in 3 concise sentences with no legal conclusions.',
      },
      {
        role: 'user',
        content: narrative,
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? '';
};
