require('dotenv').config();
const express = require('express');
const { classifyBookSafe } = require('./llm/client');
const { inputSchema } = require('./llm/schema');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.post('/classify-book', async (req, res) => {
  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) {
    const field = parsed.error.issues[0].path.join('.');
    return res.status(400).json({ error: `Invalid or missing field: ${field}` });
  }

  if (process.env.LLM_STUB === '1') {
    return res.status(200).json({
      category: 'fiction',
      summary: 'A stub response for testing without calling the model.',
      confidence: 0.9,
    });
  }

try {
  const result = await classifyBookSafe(parsed.data);
  if (!result.success) {
    const fs = require('fs');
    fs.appendFileSync('logs/quarantine.jsonl', JSON.stringify({
      input: parsed.data, error: result.error, raw: result.raw,
      promptVersion: 'v1', timestamp: new Date().toISOString()
    }) + '\n');
    return res.status(422).json({ error: 'Could not produce a valid response' });
  }
  res.status(200).json(result.data);
} catch (err) {
  res.status(500).json({ error: 'Model call failed', details: err.message });
}
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));