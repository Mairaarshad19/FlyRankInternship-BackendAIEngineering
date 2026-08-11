require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { createJob, getJob } = require('./jobs/store');
const { processJob } = require('./jobs/worker');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Idempotency: if the same idempotency key is sent twice, don't create a duplicate job
const idempotencyMap = new Map();

app.post('/jobs/classify-book', (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];

  if (idempotencyKey && idempotencyMap.has(idempotencyKey)) {
    const existingJobId = idempotencyMap.get(idempotencyKey);
    return res.status(202).json({ jobId: existingJobId, status: 'already accepted' });
  }

  const jobId = uuidv4();
  const job = createJob(jobId, req.body);

  if (idempotencyKey) idempotencyMap.set(idempotencyKey, jobId);

  // Fire and forget - don't await, let it run in background
  processJob(job);

  res.status(202).json({ jobId, status: 'pending' });
});

app.get('/jobs/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.status(200).json({
    id: job.id,
    status: job.status,
    result: job.result,
    error: job.error,
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));