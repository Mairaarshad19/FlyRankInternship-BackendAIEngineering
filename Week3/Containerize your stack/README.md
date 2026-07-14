# BE-01: Postgres-backed Task API

A minimal Express API for managing tasks, backed by Postgres running in Docker.
Originally built with an in-memory store; this version swaps in a real
Postgres repository without touching the service or route layers.

## Architecture

```
src/
├── routes/taskRoutes.js              # HTTP layer only - no business logic
├── services/taskService.js           # business rules (e.g. title required)
├── repositories/
│   ├── inMemoryTaskRepository.js     # original in-memory store (kept for reference)
│   └── postgresTaskRepository.js     # Postgres-backed store (currently active)
├── db.js                             # Postgres connection pool, reads config from .env
└── server.js                         # wires everything together
```

The service and routes were **not modified** when switching storage. The only
change was in `server.js`, swapping which repository gets passed to the
service:

```js
// before
const repository = inMemoryTaskRepository;

// after
const repository = postgresTaskRepository;
```

Everything else - validation rules in the service, HTTP handling in the
routes - stayed exactly the same.

## Running the stack

```bash
docker compose up --build
```

This starts two containers:
- `app` - the Node/Express API on port 3000
- `db` - Postgres 16 on port 5433 (mapped from container's 5432)

The `tasks` table is created automatically on first start via `init.sql`,
mounted into Postgres's init directory.

## Environment variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

`.env` is gitignored and never committed.

## Endpoints

- `GET /api/tasks` - list all tasks
- `GET /api/tasks/:id` - get one task
- `POST /api/tasks` - create a task (`{ "title": "..." }`)
- `PATCH /api/tasks/:id` - update a task
- `DELETE /api/tasks/:id` - delete a task
- `GET /api/status` - health check

## Proving persistence

To confirm data survives a full restart:

1. Create a task: `curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d '{"title":"Persistence test"}'`
2. Confirm it exists: `curl http://localhost:3000/api/tasks`
3. Tear down and restart the whole stack: `docker compose down` then `docker compose up -d`
4. Confirm the task is still there: `curl http://localhost:3000/api/tasks`

This was tested manually and the task persisted across the restart, because
Postgres's data directory is mounted to a named Docker volume
(`postgres-data`) rather than living inside the container itself.