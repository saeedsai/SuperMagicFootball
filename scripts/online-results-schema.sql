-- Durable, immutable summaries emitted only after server-owned matches finish.
-- This table does not grant currency, rewards, purchases, or progression.
CREATE TABLE IF NOT EXISTS smf_online_match_results (
  match_id char(32) PRIMARY KEY CHECK (match_id ~ '^[0-9a-f]{32}$'),
  schema_version smallint NOT NULL CHECK (schema_version = 1),
  participant_0 text NOT NULL CHECK (participant_0 ~ '^[A-Za-z0-9_-]{8,64}$'),
  participant_1 text NOT NULL CHECK (participant_1 ~ '^[A-Za-z0-9_-]{8,64}$'),
  team_0 text NOT NULL CHECK (team_0 ~ '^[A-Za-z0-9_-]{1,64}$'),
  team_1 text NOT NULL CHECK (team_1 ~ '^[A-Za-z0-9_-]{1,64}$'),
  score_0 integer NOT NULL CHECK (score_0 BETWEEN 0 AND 999),
  score_1 integer NOT NULL CHECK (score_1 BETWEEN 0 AND 999),
  half smallint NOT NULL CHECK (half = 2),
  clock_seconds numeric(8,4) NOT NULL CHECK (clock_seconds BETWEEN 0 AND 1800),
  simulation_tick integer NOT NULL CHECK (simulation_tick > 0),
  payload_hash char(64) NOT NULL CHECK (payload_hash ~ '^[0-9a-f]{64}$'),
  final_result jsonb NOT NULL CHECK (jsonb_typeof(final_result) = 'object'),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CHECK (participant_0 <> participant_1),
  CHECK (team_0 <> team_1),
  CHECK (final_result->>'schemaVersion' = '1'),
  CHECK (final_result->>'status' = 'finished'),
  CHECK (final_result->>'terminal' = 'true'),
  CHECK (final_result->>'matchId' = match_id),
  CHECK (final_result->>'half' = '2'),
  CHECK (final_result->'score' = jsonb_build_array(score_0, score_1)),
  CHECK (final_result->'teamIds' = jsonb_build_array(team_0, team_1)),
  CHECK (final_result->'participants'->0->>'userId' = participant_0),
  CHECK (final_result->'participants'->1->>'userId' = participant_1)
);

CREATE INDEX IF NOT EXISTS smf_online_match_results_recorded_at_idx
  ON smf_online_match_results (recorded_at DESC);
CREATE INDEX IF NOT EXISTS smf_online_match_results_participant_0_history_idx
  ON smf_online_match_results (participant_0, recorded_at DESC, match_id DESC);
CREATE INDEX IF NOT EXISTS smf_online_match_results_participant_1_history_idx
  ON smf_online_match_results (participant_1, recorded_at DESC, match_id DESC);

-- Database-level guard: correction/reversal requires a separate audited process,
-- never an ordinary result write or retry.
CREATE OR REPLACE FUNCTION smf_reject_online_match_result_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'online match results are immutable' USING ERRCODE = '55000';
END;
$$;

DROP TRIGGER IF EXISTS smf_online_match_results_immutable ON smf_online_match_results;
CREATE TRIGGER smf_online_match_results_immutable
  BEFORE UPDATE OR DELETE ON smf_online_match_results
  FOR EACH ROW EXECUTE FUNCTION smf_reject_online_match_result_mutation();
