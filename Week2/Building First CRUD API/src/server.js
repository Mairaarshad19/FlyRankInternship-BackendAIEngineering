const express = require('express');

const postgresTaskRepository = require('./repositories/postgresTaskRepository');
const { createTaskService } = require('./services/taskService');
const { createTaskRoutes } = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- This is the ONE place where we choose which repository to use. ---
// Right now: in-memory. Later (Phase 4): we'll swap this single line
// for a Postgres repository, and nothing else in the app will change.
const repository = postgresTaskRepository;

const taskService = createTaskService(repository);
app.use('/api/tasks', createTaskRoutes(taskService));

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
