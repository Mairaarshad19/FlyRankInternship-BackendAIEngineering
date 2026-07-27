
# FlyRank Backend AI Engineering Internship

A hands on backend engineering track built week by week: REST APIs, persistence, containerization, and authentication, each one replacing the last layer's biggest weakness without breaking anything above it.

## Problem

Most beginner backend projects stop at "it works on my machine." They skip the parts that actually matter in production: does the data survive a restart, can it run the same way on someone else's computer, and is it actually secure. This repo is a record of closing those gaps one at a time, in the order a real backend actually needs them.

## Solution

Each week takes the same core idea, a task API, and pushes it one layer deeper:

Week 2 builds the API itself: full CRUD, proper status codes, input validation, and live documentation through Swagger.

Week 3 splits into two directions. One replaces the in memory array with SQLite so data survives a restart with zero setup. The other goes further and containerizes the whole stack with Postgres and Docker, so the exact same environment runs identically on any machine with one command.

Week 4 adds real authentication using Supabase as the identity provider: signup, login, logout, and route level protection through a single reusable middleware, instead of scattering auth checks across every endpoint.

The throughline across all of it: the API layer barely changes from week to week. Only the storage or security underneath it does. That separation is the actual skill being demonstrated, not just four separate projects.

## Features

Full CRUD REST API with correct HTTP status codes (200, 201, 204, 400, 404, 401)

Interactive API documentation via Swagger UI on every project

Two persistence paths implemented side by side: SQLite (zero config) and Postgres (containerized, production shaped)

Layered architecture (routes, services, repositories) so storage can be swapped by changing one file

Dockerized app plus database stack that starts with a single command and survives a full restart with data intact

Token based authentication with Supabase, including a reusable auth middleware protecting multiple routes

Environment variables handled correctly throughout: secrets gitignored, example files committed

## Tech Stack

Node.js, Express.js

SQLite (better-sqlite3), PostgreSQL

Docker, Docker Compose

Supabase Auth (JWT based)

Swagger / OpenAPI

Git, GitHub

## Architecture

```
Client
  |
  v
Routes        <- only handles HTTP in/out, no logic
  |
  v
Services      <- business rules (validation, auth checks)
  |
  v
Repository    <- talks to storage: in-memory, SQLite, or Postgres
```

The repository layer is the only thing that changes between an in memory prototype and a fully containerized Postgres backend. Routes and services stay untouched, which is proven directly in the BE-04 commit history: the storage swap is a one line change in `server.js`.

## Screenshots

Swagger UI with full CRUD cycle: see `Week2/BE-01/swagger-screenshot.jpeg`

SQLite data inspected directly in DB Browser: see `Week3/BE-02/db-browser-screenshot1.jpeg`

Swagger UI with Bearer auth and the lock icon on protected routes: see `Week4/BE-03/swagger-auth-screenshot.jpeg`

## Demo Video

Not recorded yet. Will be added once the full stack (API, database, auth) is demoed end to end in one walkthrough.

## Installation

Each week's project lives in its own folder and runs independently.

```bash
cd Week2/BE-01      # or Week3/BE-02, Week3/BE-04, Week4/BE-03
npm install
```

For BE-01 and BE-02:
```bash
node server.js
```

For BE-04 (Docker):
```bash
docker compose up --build
```

For BE-03 (Auth), copy `.env.example` to `.env` and fill in your own Supabase project URL and key first:
```bash
cp .env.example .env
node server.js
```

Full details, endpoint tables, and status code references are in each folder's own README.

## Future Improvements

Add Redis caching to the containerized stack

Add rate limiting and request logging middleware

Move from SQLite to Postgres for the CRUD project to unify all storage on one production ready database

Add automated tests (currently everything is verified manually via curl and Swagger)

Deploy one version of the stack to a live server instead of localhost only

## Why this pattern

Every project here follows the same discipline: define the contract (routes and status codes) before writing the implementation, then keep the implementation swappable underneath that contract. That is the same instinct needed to take a working prototype and make it production ready without a rewrite, which is usually the actual job.
