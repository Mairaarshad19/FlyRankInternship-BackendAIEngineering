const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
  timeout: 30000, 
});

const promptTemplate = fs.readFileSync(
  path.join(__dirname, '../../prompts/classify-book-v1.md'),
  'utf-8'
);

async function classifyBook(bookData) {
  const startTime = Date.now();
  const res = await client.chat.completions.create({
    model: process.env.LLM_MODEL,
    temperature: 0.2,
    messages: [
      { role: 'system', content: promptTemplate },
      { role: 'user', content: JSON.stringify(bookData) },
    ],
  });
  const durationMs = Date.now() - startTime;
  logCost('v1', process.env.LLM_MODEL, res.usage, durationMs, false);
  return res.choices[0].message.content;
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

async function classifyBookSafe(bookData) {
  const raw = await classifyBook(bookData);
  let jsonText = extractJson(raw);

  try {
    const parsedJson = JSON.parse(jsonText);
    const validated = outputSchema.safeParse(parsedJson);
    if (validated.success) return { success: true, data: validated.data };

    const repairPrompt = `Your previous answer was rejected for this reason: ${JSON.stringify(validated.error.issues)}. Return only corrected JSON matching the schema.`;
    const repairRes = await client.chat.completions.create({
      model: process.env.LLM_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: promptTemplate },
        { role: 'user', content: JSON.stringify(bookData) },
        { role: 'assistant', content: raw },
        { role: 'user', content: repairPrompt },
      ],
    });
    const repairedText = extractJson(repairRes.choices[0].message.content);
    const repairedJson = JSON.parse(repairedText);
    const revalidated = outputSchema.safeParse(repairedJson);
    if (revalidated.success) return { success: true, data: revalidated.data };

    return { success: false, error: 'Failed validation after repair', raw };
  } catch (err) {
    return { success: false, error: err.message, raw };
  }
}

async function callWithRetry(fn, maxRetries = 2) {
  let delay = 1000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = err.status;
      const retryable = status === 429 || (status >= 500 && status < 600) || err.code === 'ETIMEDOUT';
      if (!retryable || attempt === maxRetries) throw err;
      const jitter = Math.random() * 300;
      await new Promise(r => setTimeout(r, delay + jitter));
      delay *= 2;
    }
  }
}

const { outputSchema } = require('./schema');

function logCost(promptVersion, model, usage, durationMs, repaired) {
  const fs = require('fs');
  fs.appendFileSync('logs/cost.jsonl', JSON.stringify({
    promptVersion, model, inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens, durationMs, repaired,
    timestamp: new Date().toISOString(),
  }) + '\n');
}

module.exports = { classifyBook, classifyBookSafe };