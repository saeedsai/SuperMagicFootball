CREATE TABLE IF NOT EXISTS smf_online_match_checkpoint (
  match_id char(32) PRIMARY KEY REFERENCES smf_online_match_lifecycle(match_id) ON DELETE CASCADE,
  participant_0 text NOT NULL CHECK (participant_0 ~ '^[A-Za-z0-9_-]{8,64}$'),
  participant_1 text NOT NULL CHECK (participant_1 ~ '^[A-Za-z0-9_-]{8,64}$'),
  team_0 text NOT NULL CHECK (team_0 ~ '^[A-Za-z0-9_-]{1,64}$'),
  team_1 text NOT NULL CHECK (team_1 ~ '^[A-Za-z0-9_-]{1,64}$'),
  schema_version integer NOT NULL CHECK (schema_version BETWEEN 1 AND 65535),
  payload_json text NOT NULL,
  payload_bytes integer NOT NULL CHECK (payload_bytes BETWEEN 2 AND 262144),
  payload_sha256 char(64) NOT NULL CHECK (payload_sha256 ~ '^[a-f0-9]{64}$'),
  updated_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  CHECK (participant_0 <> participant_1),
  CHECK (team_0 <> team_1),
  CHECK (expires_at > updated_at)
);
CREATE INDEX IF NOT EXISTS smf_online_match_checkpoint_expiry_idx
  ON smf_online_match_checkpoint (expires_at);
