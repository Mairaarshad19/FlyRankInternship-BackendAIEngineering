// Routes only translate HTTP <-> service calls. No business logic here,
// no storage logic here. Just: read the request, call the service,
// send the response.

const express = require('express');

function createTaskRoutes(taskService) {
  const router = express.Router();

  // GET /api/tasks - list all tasks
  router.get('/', async (req, res) => {
    const tasks = await taskService.listTasks();
    res.json(tasks);
  });

  // GET /api/tasks/:id - get one task
  router.get('/:id', async (req, res) => {
    const task = await taskService.getTask(Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });

  // POST /api/tasks - create a task
  router.post('/', async (req, res) => {
    try {
      const task = await taskService.createTask(req.body.title);
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // PATCH /api/tasks/:id - update a task
  router.patch('/:id', async (req, res) => {
    try {
      const task = await taskService.updateTask(Number(req.params.id), req.body);
      res.json(task);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  // DELETE /api/tasks/:id - delete a task
  router.delete('/:id', async (req, res) => {
    try {
      await taskService.deleteTask(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  return router;
}

module.exports = { createTaskRoutes };
