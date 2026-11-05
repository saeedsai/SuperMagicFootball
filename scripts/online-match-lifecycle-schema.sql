CREATE TABLE IF NOT EXISTS smf_online_match_lifecycle (
  match_id char(32) PRIMARY KEY CHECK (match_id ~ '^[a-f0-9]{32}$'),
  participant_0 text NOT NULL CHECK (participant_0 ~ '^[A-Za-z0-9_-]{8,64}$'),
  participant_1 text NOT NULL CHECK (participant_1 ~ '^[A-Za-z0-9_-]{8,64}$'),
  team_0 text NOT NULL CHECK (team_0 ~ '^[A-Za-z0-9_-]{1,64}$'),
  team_1 text NOT NULL CHECK (team_1 ~ '^[A-Za-z0-9_-]{1,64}$'),
  status text NOT NULL CHECK (status IN ('active','completed','interrupted')),
  assigned_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CHECK (participant_0 <> participant_1),
  CHECK (team_0 <> team_1)
);
CREATE INDEX IF NOT EXISTS smf_online_match_lifecycle_participant_0_idx ON smf_online_match_lifecycle (participant_0, updated_at DESC);
CREATE INDEX IF NOT EXISTS smf_online_match_lifecycle_participant_1_idx ON smf_online_match_lifecycle (participant_1, updated_at DESC);
