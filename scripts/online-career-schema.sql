-- Account-scoped server-owned Online Career schedule/progression.
-- Scores are populated only by online-career-service after an immutable durable match result is read.
CREATE TABLE IF NOT EXISTS smf_online_career_seasons (
  account_id text NOT NULL CHECK (account_id ~ '^[A-Za-z0-9_-]{8,128}$'),
  season_id char(32) NOT NULL CHECK (season_id ~ '^[a-f0-9]{32}$'),
  team_id text NOT NULL CHECK (team_id ~ '^[A-Za-z0-9_-]{1,64}$'),
  fixture_count smallint NOT NULL CHECK (fixture_count BETWEEN 1 AND 64),
  played_count smallint NOT NULL DEFAULT 0 CHECK (played_count BETWEEN 0 AND fixture_count),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','complete')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, season_id),
  CHECK ((status = 'active' AND played_count < fixture_count) OR (status = 'complete' AND played_count = fixture_count))
);
CREATE UNIQUE INDEX IF NOT EXISTS smf_online_career_one_active_season_idx
  ON smf_online_career_seasons (account_id) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS smf_online_career_fixtures (
  account_id text NOT NULL,
  season_id char(32) NOT NULL,
  fixture_no smallint NOT NULL CHECK (fixture_no BETWEEN 1 AND 64),
  fixture_id char(32) NOT NULL CHECK (fixture_id ~ '^[a-f0-9]{32}$'),
  match_id char(32) NOT NULL CHECK (match_id ~ '^[a-f0-9]{32}$'),
  participant_0 text NOT NULL CHECK (participant_0 ~ '^[A-Za-z0-9_-]{8,64}$'),
  participant_1 text NOT NULL CHECK (participant_1 ~ '^[A-Za-z0-9_-]{8,64}$'),
  team_0 text NOT NULL CHECK (team_0 ~ '^[A-Za-z0-9_-]{1,64}$'),
  team_1 text NOT NULL CHECK (team_1 ~ '^[A-Za-z0-9_-]{1,64}$'),
  mode text NOT NULL CHECK (mode = 'career-ai'),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed')),
  score_0 smallint CHECK (score_0 BETWEEN 0 AND 999),
  score_1 smallint CHECK (score_1 BETWEEN 0 AND 999),
  recorded_at timestamptz,
  result_hash char(64) CHECK (result_hash IS NULL OR result_hash ~ '^[0-9a-f]{64}$'),
  PRIMARY KEY (account_id, season_id, fixture_no),
  UNIQUE (fixture_id),
  UNIQUE (match_id),
  FOREIGN KEY (account_id, season_id) REFERENCES smf_online_career_seasons(account_id, season_id) ON DELETE CASCADE,
  CHECK (participant_0 <> participant_1),
  CHECK (team_0 <> team_1),
  CHECK ((status = 'scheduled' AND score_0 IS NULL AND score_1 IS NULL AND recorded_at IS NULL AND result_hash IS NULL) OR
         (status = 'completed' AND score_0 IS NOT NULL AND score_1 IS NOT NULL AND recorded_at IS NOT NULL AND result_hash IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS smf_online_career_fixtures_match_idx
  ON smf_online_career_fixtures (match_id);
CREATE UNIQUE INDEX IF NOT EXISTS smf_online_career_account_match_once_idx
  ON smf_online_career_fixtures (account_id, match_id);
CREATE INDEX IF NOT EXISTS smf_online_career_seasons_status_idx
  ON smf_online_career_seasons (account_id, status, updated_at DESC);
