#!/usr/bin/env python3
"""Advance the permanent 165-club, 1,980-player roster audit in named batches.

Usage:
  python3 scripts/advance_club_roster_batch.py --check
  python3 scripts/advance_club_roster_batch.py --batch-id CLUB-20261016-AFC-B --region AFC --description "..."
  python3 scripts/advance_club_roster_batch.py --refresh-provenance

Update roster JSON, runtime registry, and the selection audit before advancing.
This script never invents player data; it only records observable changes.
"""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
AUDIT_PATH = ROOT / "docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json"
LEDGER_PATH = ROOT / "docs/CLUB_ROSTER_BATCH_LEDGER_20261016.json"
QUOTA = {"GK": 2, "DF": 3, "MF": 4, "FW": 3}


def blob_sha(raw: bytes) -> str:
    """Match GitHub git-blob SHA-1 exactly."""
    return hashlib.sha1(b"blob " + str(len(raw)).encode("ascii") + b"\0" + raw).hexdigest()


def source_refs(audit_team: dict) -> list[str]:
    return list(dict.fromkeys(
        x.strip() for x in str(audit_team.get("source", "")).split(";")
        if x.strip().startswith(("http://", "https://"))
    ))


def assert_inventory(audit: dict) -> None:
    assert len(audit) == 165, f"Expected 165 clubs; got {len(audit)}"
    for club_id, info in audit.items():
        players = info["selected"]
        assert len(players) == 12, f"{club_id}: 12-player squad required"
        assert Counter(p["role"] for p in players) == QUOTA, f"{club_id}: 2/3/4/3 broken"
        assert len({p["name"].casefold() for p in players}) == 12, f"{club_id}: duplicate names"
        assert all(
            not p["name"].lower().find("academy") >= 0
            and 50 <= p["rating"] <= 99
            for p in players
        ), f"{club_id}: invalid name or rating"


def report_snapshot(audit: dict) -> dict:
    return {
        club_id: {"club": info["club"], "players": info["selected"]}
        for club_id, info in audit.items()
    }


def current_commit() -> str:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True,
            stderr=subprocess.DEVNULL
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        return "not-available"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    actions = parser.add_mutually_exclusive_group(required=True)
    actions.add_argument("--check", action="store_true", help="Fail if the ledger is out of sync")
    actions.add_argument("--batch-id", help="New unique batch ID for actual player changes")
    actions.add_argument(
        "--refresh-provenance", action="store_true",
        help="Resync sources/hash only; reject unrecorded player changes"
    )
    parser.add_argument("--region", default="MIXED")
    parser.add_argument("--description", default="Sourced club roster and ratings review")
    args = parser.parse_args()

    raw = AUDIT_PATH.read_bytes()
    audit = json.loads(raw)
    ledger = json.loads(LEDGER_PATH.read_text(encoding="utf8"))
    assert_inventory(audit)
    new_snapshot = report_snapshot(audit)
    old_snapshot = ledger["currentRosterSnapshot"]
    assert set(old_snapshot) == set(new_snapshot), "Team inventory changed"
    diff = []
    for club_id, team in new_snapshot.items():
        previous = old_snapshot[club_id]
        assert previous["club"] == team["club"], f"Club renamed: {club_id}"
        for slot, (before, after) in enumerate(
            zip(previous["players"], team["players"]), start=1
        ):
            if before != after:
                diff.append((club_id, team["club"], slot, before, after))
    new_sha = blob_sha(raw)
    if args.check:
        assert ledger["currentAuditBlobSha"] == new_sha, (
            "Audit content changed: update the ledger in a named batch "
            "or run --refresh-provenance for a metadata-only edit"
        )
        assert not diff, f"{len(diff)} unrecorded player changes: {diff[:5]}"
        assert ledger["summary"]["changedSlots"] == len(ledger["playerChanges"])
        print(json.dumps({
            "status": "PASS", "auditBlobSha": new_sha,
            "clubs": len(audit), "slots": sum(len(t["players"]) for t in new_snapshot.values()),
            "recordedChanges": len(ledger["playerChanges"]),
            "batches": len(ledger["batches"])
        }))
        return

    if args.refresh_provenance:
        assert not diff, f"Refusing to hide {len(diff)} player edits as metadata updates"
    else:
        assert args.batch_id not in {b["id"] for b in ledger["batches"]}, (
            "Batch ID already exists; use a fresh ID to preserve historical edits"
        )
        assert diff, "No roster changes detected; don't create an empty batch"
        changes = []
        for club_id, club, slot, before, after in diff:
            player = json.loads(
                (ROOT / "data/players" / (
                    "club26.json" if club_id.startswith("club26") else "continental.json"
                )).read_text(encoding="utf8")
            )[club_id][slot - 1]
            assert (player["name"], player["role"], player["rating"]) == (
                after["name"], after["role"], after["rating"]
            ), f"Runtime/source mismatch: {club_id}, slot {slot}"
            assert not player.get("fictional"), f"{club_id}: cannot track a fictional replacement"
            rating_source = player.get("ratingSource", "")
            assert rating_source.startswith(("Editorial", "FC27")), (
                f"Unknown OVR provenance: {club_id} / {player['name']}"
            )
            refs = source_refs(audit[club_id])
            assert refs, f"Missing independent club sourcing: {club_id}"
            ledger["clubSourceEvidence"][club_id] = {
                "club": club,
                "origin": audit[club_id].get("origin", ""),
                "sourceReferences": refs
            }
            change_type = (
                "academy_placeholder_replaced" if "academy" in before["name"].lower()
                else "rating_only" if before["name"] == after["name"] and before["role"] == after["role"]
                else "player_replacement"
            )
            changes.append({
                "batchId": args.batch_id, "clubId": club_id, "club": club,
                "slot": slot, "role": after["role"],
                "previousRole": before["role"],
                "previous": {"name": before["name"], "overall": before["rating"]},
                "current": {"name": after["name"], "overall": after["rating"]},
                "ratingProvenance": (
                    "fc27_third_party_unofficial" if rating_source.startswith("FC27")
                    else "editorial_estimate_not_EA_FC27"
                ),
                "changeType": change_type, "evidenceClubId": club_id
            })
        ledger["playerChanges"].extend(changes)
        ledger["batches"].append({
            "id": args.batch_id, "region": args.region,
            "description": args.description,
            "status": "pending_regression",
            "affectedClubIds": sorted({r["clubId"] for r in changes}),
            "changedSlots": len(changes),
            "recordedDate": datetime.now(timezone.utc).date().isoformat(),
            "verification": "Provenance recorded; automated roster regression required"
        })
    ledger["currentRosterSnapshot"] = new_snapshot
    ledger["currentAuditBlobSha"] = new_sha
    ledger["trackedSnapshotCommit"] = current_commit()
    ledger["summary"]["changedSlots"] = len(ledger["playerChanges"])
    ledger["summary"]["changedClubs"] = len({r["clubId"] for r in ledger["playerChanges"]})
    ledger["summary"]["noAcademyPlayers"] = True
    LEDGER_PATH.write_text(json.dumps(ledger, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
    print(json.dumps({
        "updated": True, "batch": args.batch_id if not args.refresh_provenance else "metadata-only",
        "newPlayerChanges": len(diff), "allRecordedChanges": len(ledger["playerChanges"]),
        "auditBlobSha": new_sha,
    }))


if __name__ == "__main__":
    main()
