-- Immutable server-awarded soft-token receipts and bounded account balances.
CREATE TABLE IF NOT EXISTS smf_online_token_balances (
  account_id text PRIMARY KEY CHECK (length(account_id) BETWEEN 1 AND 128),
  balance integer NOT NULL CHECK (balance BETWEEN 0 AND 999999),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS smf_online_reward_ledger (
  account_id text NOT NULL CHECK (length(account_id) BETWEEN 1 AND 128),
  match_id char(32) NOT NULL CHECK (match_id ~ '^[0-9a-f]{32}$'),
  side smallint NOT NULL CHECK (side IN (0,1)),
  outcome text NOT NULL CHECK (outcome IN ('win','draw','loss')),
  reward integer NOT NULL CHECK (reward BETWEEN 0 AND 30),
  balance_after integer NOT NULL CHECK (balance_after BETWEEN 0 AND 999999),
  result_hash char(64) NOT NULL CHECK (result_hash ~ '^[0-9a-f]{64}$'),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, match_id)
);

CREATE INDEX IF NOT EXISTS smf_online_reward_ledger_match_idx
  ON smf_online_reward_ledger (match_id);
