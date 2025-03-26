// packages/utils/anthropic.ts
export async function callAnthropic(prompt: string) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();

    console.log('[RAW CLAUDE RESPONSE]', JSON.stringify(data, null, 2));

    return data.content?.[0]?.text ?? 'No response from Claude';
  }