-- Account-scoped online UT collection and soft-token purchase receipts.
-- This is independent of the offline roster/save stores. Team/player IDs are
-- validated against the canonical game asset catalog by the server module.
CREATE TABLE IF NOT EXISTS smf_online_ut_owned_items (
  account_id text NOT NULL CHECK (length(account_id) BETWEEN 1 AND 128),
  category text NOT NULL CHECK (category IN ('team','player')),
  item_id text NOT NULL CHECK (length(item_id) BETWEEN 1 AND 129),
  acquired_at timestamptz NOT NULL,
  PRIMARY KEY (account_id, category, item_id)
);

CREATE TABLE IF NOT EXISTS smf_online_ut_purchase_ledger (
  account_id text NOT NULL CHECK (length(account_id) BETWEEN 1 AND 128),
  idempotency_key text NOT NULL CHECK (length(idempotency_key) BETWEEN 8 AND 128),
  request_hash char(64) NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  category text NOT NULL CHECK (category IN ('team','player')),
  item_id text NOT NULL CHECK (length(item_id) BETWEEN 1 AND 129),
  price integer NOT NULL CHECK (price BETWEEN 1 AND 999999),
  balance_after integer NOT NULL CHECK (balance_after BETWEEN 0 AND 999999),
  recorded_at timestamptz NOT NULL,
  PRIMARY KEY (account_id, idempotency_key),
  UNIQUE (account_id, category, item_id),
  FOREIGN KEY (account_id, category, item_id)
    REFERENCES smf_online_ut_owned_items (account_id, category, item_id)
);

CREATE INDEX IF NOT EXISTS smf_online_ut_purchase_ledger_recorded_idx
  ON smf_online_ut_purchase_ledger (account_id, recorded_at DESC);

-- Server-validated 12-player lineups are independent from client squad snapshots.
-- Player data/stats are always hydrated from canonical game assets at match time.
CREATE TABLE IF NOT EXISTS smf_online_ut_lineups (
  account_id text NOT NULL CHECK (length(account_id) BETWEEN 1 AND 128),
  team_id text NOT NULL CHECK (length(team_id) BETWEEN 1 AND 64),
  player_ids jsonb NOT NULL CHECK (jsonb_typeof(player_ids) = 'array' AND jsonb_array_length(player_ids) = 12),
  version integer NOT NULL CHECK (version BETWEEN 1 AND 2147483647),
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (account_id, team_id)
);

-- Every save key keeps a durable request fingerprint and result version so retries
-- remain idempotent even after the lineup advances again.
CREATE TABLE IF NOT EXISTS smf_online_ut_lineup_ledger (
  account_id text NOT NULL CHECK (length(account_id) BETWEEN 1 AND 128),
  idempotency_key text NOT NULL CHECK (length(idempotency_key) BETWEEN 8 AND 128),
  request_hash char(64) NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  team_id text NOT NULL CHECK (length(team_id) BETWEEN 1 AND 64),
  player_ids jsonb NOT NULL CHECK (jsonb_typeof(player_ids) = 'array' AND jsonb_array_length(player_ids) = 12),
  version integer NOT NULL CHECK (version BETWEEN 1 AND 2147483647),
  recorded_at timestamptz NOT NULL,
  PRIMARY KEY (account_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS smf_online_ut_lineup_ledger_recorded_idx
  ON smf_online_ut_lineup_ledger (account_id, recorded_at DESC);
