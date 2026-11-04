-- Server-owned online profile and mode snapshots.
-- Authentication/session storage and token ledger are intentionally separate.
CREATE TABLE IF NOT EXISTS smf_online_profiles (
  account_id text PRIMARY KEY CHECK (length(account_id) BETWEEN 1 AND 128),
  profile jsonb NOT NULL CHECK (jsonb_typeof(profile) = 'object'),
  version bigint NOT NULL CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS smf_online_snapshots (
  account_id text NOT NULL CHECK (length(account_id) BETWEEN 1 AND 128),
  kind text NOT NULL CHECK (kind IN ('career', 'ultimate-team')),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  version bigint NOT NULL CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, kind)
);

-- Idempotency records return the exact prior commit result after client retry.
CREATE TABLE IF NOT EXISTS smf_online_commit_keys (
  account_id text NOT NULL CHECK (length(account_id) BETWEEN 1 AND 128),
  resource text NOT NULL CHECK (resource IN ('profile', 'career', 'ultimate-team')),
  idempotency_key text NOT NULL CHECK (length(idempotency_key) BETWEEN 8 AND 128),
  request_hash char(64) NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  committed_version bigint NOT NULL CHECK (committed_version >= 1),
  result jsonb NOT NULL CHECK (jsonb_typeof(result) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, resource, idempotency_key)
);

CREATE INDEX IF NOT EXISTS smf_online_commit_keys_created_at_idx
  ON smf_online_commit_keys (created_at);
