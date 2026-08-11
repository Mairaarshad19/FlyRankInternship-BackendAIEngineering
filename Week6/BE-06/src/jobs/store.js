const jobs = new Map();

function createJob(id, input) {
  jobs.set(id, {
    id,
    status: 'pending', // pending -> processing -> done | failed
    input,
    result: null,
    error: null,
    attempts: 0,
    createdAt: new Date().toISOString(),
  });
  return jobs.get(id);
}

function getJob(id) {
  return jobs.get(id) || null;
}

function updateJob(id, updates) {
  const job = jobs.get(id);
  if (!job) return null;
  Object.assign(job, updates);
  return job;
}

module.exports = { createJob, getJob, updateJob };