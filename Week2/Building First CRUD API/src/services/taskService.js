// The service takes a repository as a dependency. It doesn't care
// whether that repository is in-memory or Postgres - it just calls
// getAll(), getById(), create(), update(), remove() on it.
// THIS is the file that makes "swap the storage" possible without
// touching routes or business rules.

function createTaskService(repository) {
  return {
    async listTasks() {
      return repository.getAll();
    },

    async getTask(id) {
      return repository.getById(id);
    },

    async createTask(title) {
      if (!title || title.trim() === '') {
        throw new Error('Title is required');
      }
      return repository.create(title.trim());
    },

    async updateTask(id, updates) {
      const existing = await repository.getById(id);
      if (!existing) {
        throw new Error('Task not found');
      }
      return repository.update(id, updates);
    },

    async deleteTask(id) {
      const existing = await repository.getById(id);
      if (!existing) {
        throw new Error('Task not found');
      }
      return repository.remove(id);
    },
  };
}

module.exports = { createTaskService };
