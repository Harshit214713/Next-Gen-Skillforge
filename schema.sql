-- D1 schema for Next-Gen Skillforge.
-- Apply with:
--   npx wrangler d1 execute NEXT_GEN_SKILLFORGE_DB --file=./schema.sql
--   npx wrangler d1 execute NEXT_GEN_SKILLFORGE_DB --local --file=./schema.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users (updated_at);
