// This repository has the EXACT SAME function names and behavior
// contract as inMemoryTaskRepository.js: getAll, getById, create,
// update, remove. That's what lets us swap one for the other without
// touching the service or routes.

const pool = require('../db');

async function getAll() {
  const result = await pool.query('SELECT * FROM tasks ORDER BY id');
  return result.rows;
}

async function getById(id) {
  const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function create(title) {
  const result = await pool.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title]
  );
  return result.rows[0];
}

async function update(id, updates) {
  // Build the update dynamically based on which fields were passed in.
  // Keeps it simple: we support updating title and/or completed.
  const existing = await getById(id);
  if (!existing) return null;

  const title = updates.title !== undefined ? updates.title : existing.title;
  const completed =
    updates.completed !== undefined ? updates.completed : existing.completed;

  const result = await pool.query(
    'UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
    [title, completed, id]
  );
  return result.rows[0];
}

async function remove(id) {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = { getAll, getById, create, update, remove };
