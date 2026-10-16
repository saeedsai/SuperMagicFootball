"""Offline GitHub lock protocol regression: no network and no real reservations."""
import datetime as dt
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import claim_feature as fc  # noqa: E402


class FakeClient:
    def __init__(self):
        self.data = {}
        self.counter = 0

    def read_lock(self, key):
        if key not in self.data:
            return None, None
        value, sha = self.data[key]
        return dict(value), sha

    def write_lock(self, key, record, expected_sha, action):
        previous, actual_sha = self.read_lock(key)
        if expected_sha != actual_sha:
            raise fc.ClaimError("stale blob SHA")
        self.counter += 1
        self.data[key] = (dict(record), str(self.counter))


T = dt.datetime(2026, 10, 16, 10, 0, tzinfo=dt.timezone.utc)


class FeatureLockTests(unittest.TestCase):
    def setUp(self):
        self.c = FakeClient()

    def claim(self, lock="graphics-renderer", owner="art-chat-001"):
        return fc.claim(self.c, lock, "ART-C01", owner,
                        "Only front-layer concept rig", base_sha="abcd", now=T)

    def test_one_owner_per_exclusive_key(self):
        self.claim()
        with self.assertRaisesRegex(fc.ClaimError, "LOCK OCCUPIED"):
            self.claim(owner="art-chat-002")
        self.assertEqual(self.c.read_lock("graphics-renderer")[0]["owner"], "art-chat-001")

    def test_different_workstreams_can_run_in_parallel(self):
        self.claim()
        fc.claim(self.c, "gameplay-engine", "GK-CALIBRATION",
                 "gk-chat-001", "Only keeper physical calibration", now=T)
        self.assertEqual(len(self.c.data), 2)

    def test_expired_active_lock_is_not_stolen(self):
        self.claim()
        later = T + dt.timedelta(days=5)
        with self.assertRaises(fc.ClaimError):
            fc.claim(self.c, "graphics-renderer", "ART-C02", "art-chat-002",
                     "Next C02 task", now=later)

    def test_renew_requires_same_owner_and_refreshes_lease(self):
        self.claim()
        with self.assertRaises(fc.ClaimError):
            fc.renew(self.c, "graphics-renderer", "art-chat-002", now=T)
        result = fc.renew(self.c, "graphics-renderer", "art-chat-001",
                          now=T + dt.timedelta(hours=5))
        self.assertEqual(result["expires_at"], "2026-10-17T15:00:00Z")

    def test_release_needs_handover_then_allows_reuse(self):
        self.claim()
        with self.assertRaises(fc.ClaimError):
            fc.release(self.c, "graphics-renderer", "art-chat-002",
                       "paused", "handover", now=T)
        released = fc.release(self.c, "graphics-renderer", "art-chat-001",
                              "completed", "commit abc123", now=T)
        self.assertEqual(released["status"], "released")
        record = fc.claim(self.c, "graphics-renderer", "ART-C02",
                          "art-chat-002", "New limited rig stage", now=T)
        self.assertEqual(record["owner"], "art-chat-002")

    def test_stale_blob_sha_cannot_replace_an_active_owner(self):
        record = self.claim()
        _, current_sha = self.c.read_lock("graphics-renderer")
        self.assertEqual(current_sha, "1")
        forged = dict(record, owner="art-chat-002")
        with self.assertRaisesRegex(fc.ClaimError, "stale blob SHA"):
            self.c.write_lock("graphics-renderer", forged, "outdated", "claim")
        self.assertEqual(self.c.read_lock("graphics-renderer")[0]["owner"], "art-chat-001")
        self.assertEqual(fc.verify(self.c, "graphics-renderer", "art-chat-001"), record)

    def test_released_claim_requires_fresh_blob_sha_before_reuse(self):
        self.claim()
        _, old_sha = self.c.read_lock("graphics-renderer")
        fc.release(self.c, "graphics-renderer", "art-chat-001",
                   "completed", "docs/release-handover.md", now=T)
        released, released_sha = self.c.read_lock("graphics-renderer")
        self.assertNotEqual(old_sha, released_sha)
        with self.assertRaisesRegex(fc.ClaimError, "stale blob SHA"):
            self.c.write_lock("graphics-renderer",
                              dict(released, owner="art-chat-002", status="active"),
                              old_sha, "claim")
        self.assertEqual(self.c.read_lock("graphics-renderer")[0]["status"], "released")
        reused = fc.claim(self.c, "graphics-renderer", "ART-C02",
                          "art-chat-002", "New front illustration", now=T)
        self.assertEqual(reused["owner"], "art-chat-002")
        self.assertEqual(fc.verify(self.c, "graphics-renderer", "art-chat-002",
                                   "ART-C02"), reused)

    def test_reject_unknown_lock_or_generic_owner(self):
        with self.assertRaises(fc.ClaimError):
            fc.claim(self.c, "../secrets", "ART-C01", "art-chat-001", "x", now=T)
        with self.assertRaises(fc.ClaimError):
            fc.claim(self.c, "graphics-renderer", "ART-C01", "AI", "x", now=T)

    def test_claim_has_required_data_and_remote_verification(self):
        record = self.claim()
        self.assertEqual(record["status"], "active")
        self.assertEqual(record["base_dev_sha"], "abcd")
        self.assertEqual(record["expires_at"], "2026-10-17T10:00:00Z")
        self.assertEqual(fc.verify(self.c, "graphics-renderer", "art-chat-001"),
                         record)
        with self.assertRaises(fc.ClaimError):
            fc.verify(self.c, "graphics-renderer", "art-chat-002")

    def test_catalog_links_and_lock_group_consistency(self):
        catalog = json.loads((ROOT / "docs/agent_coordination/FEATURE_REGISTRY.json").read_text())
        groups = {item["key"] for item in catalog["staticLockKeys"]}
        self.assertEqual(groups, fc.STATIC_LOCKS)
        features = [item["feature_id"] for item in catalog["candidates"]]
        self.assertEqual(len(features), len(set(features)))
        for task in catalog["candidates"]:
            if "lock_key" in task:
                self.assertIn(task["lock_key"], groups)
        self.assertIn("docs/agent_coordination/README.md",
                      (ROOT / "AGENTS.md").read_text())


if __name__ == "__main__":
    unittest.main()
