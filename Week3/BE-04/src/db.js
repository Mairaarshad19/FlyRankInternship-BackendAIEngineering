// This file creates ONE connection pool that the whole app shares.
// "Pool" means: instead of opening a new connection every time we
// talk to Postgres (slow), we keep a small set of connections open
// and reuse them (fast).

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
