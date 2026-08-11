const { updateJob } = require('./store');
const { classifyBook } = require('../llm/client'); // pichle task se laya hua function

async function processJob(job) {
  updateJob(job.id, { status: 'processing' });

  try {
    const result = await classifyBook(job.input);
    updateJob(job.id, { status: 'done', result });
  } catch (err) {
    job.attempts += 1;

    // Retry logic: try up to 3 times before giving up
    if (job.attempts < 3) {
      console.log(`Job ${job.id} failed, retrying (attempt ${job.attempts})`);
      setTimeout(() => processJob(job), 1000 * job.attempts); // backoff
    } else {
      updateJob(job.id, { status: 'failed', error: err.message });
      console.error(`ALERT: Job ${job.id} failed permanently after ${job.attempts} attempts`);
    }
  }
}

module.exports = { processJob };