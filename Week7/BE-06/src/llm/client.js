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
  const res = await client.chat.completions.create({
    model: process.env.LLM_MODEL,
    temperature: 0.2,
    messages: [
      { role: 'system', content: promptTemplate },
      { role: 'user', content: JSON.stringify(bookData) },
    ],
  });
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

const { outputSchema } = require('./schema');
module.exports = { classifyBook, classifyBookSafe };