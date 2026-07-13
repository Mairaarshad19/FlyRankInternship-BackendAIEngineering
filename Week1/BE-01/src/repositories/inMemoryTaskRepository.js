// This repository ONLY knows how to store/retrieve tasks in memory (a plain array).
// It has no idea what a "valid" task looks like - that's the service's job.

let tasks = [];
let nextId = 1;

async function getAll() {
  return tasks;
}

async function getById(id) {
  return tasks.find((t) => t.id === id) || null;
}

async function create(title) {
  const task = { id: nextId++, title, completed: false };
  tasks.push(task);
  return task;
}

async function update(id, updates) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  Object.assign(task, updates);
  return task;
}

async function remove(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
