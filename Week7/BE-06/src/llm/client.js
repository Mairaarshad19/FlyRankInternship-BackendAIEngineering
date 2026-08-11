const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
  timeout: 30000, // Stage 4 requirement, set now
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

module.exports = { classifyBook };