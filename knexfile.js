// knexfile.js
require('dotenv').config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

module.exports = {
  client: 'pg',
  connection: connectionString,
  pool: {
    min: 2,
    max: 10,      // tune based on your Supabase plan & concurrency needs
    // Optional: how long to wait for a free connection before erroring
    acquireTimeoutMillis: 30000,
  },
  // If using PgBouncer in transaction pooling mode and you hit
  // "prepared statement" errors, disable prepared statements:
  acquireConnectionTimeout: 60000,
};
