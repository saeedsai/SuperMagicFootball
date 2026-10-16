#!/usr/bin/env python3
"""Reserve one exclusive SuperMagicFootball development scope on GitHub dev.

Use GITHUB_TOKEN (Contents:write) for mutations. No dependencies beyond stdlib.
A 24-hour lease is advisory: an expired active lock NEVER auto-unlocks.
"""
import argparse
import base64
import datetime as dt
import json
import os
import re
import sys
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

REPO = "saeedsai/SuperMagicFootball"
BRANCH = "dev"
PREFIX = "docs/agent_coordination/claims"
STATIC_LOCKS = {
    "graphics-renderer", "gameplay-engine", "ui-controls",
    "integration-tooling", "qa-framework", "release-infra",
}
DYNAMIC_LOCK = re.compile(r"roster-(club|national)-[a-z0-9][a-z0-9_-]{0,63}$")
OWNER_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{2,100}$")
FEATURE_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{2,100}$")


class ClaimError(Exception):
    """Expected conflict/validation error with no successful reservation."""


def check_lock(lock):
    if lock not in STATIC_LOCKS and not DYNAMIC_LOCK.fullmatch(lock):
        raise ClaimError("Unknown lock key; consult FEATURE_REGISTRY.json: " + lock)
    return lock


def check_identity(owner, feature=None):
    if not OWNER_RE.fullmatch(owner):
        raise ClaimError("Owner must be a unique 3-101 char session ID (letters/numbers/._-)")
    if feature is not None and not FEATURE_RE.fullmatch(feature):
        raise ClaimError("Feature ID must be 3-101 chars (letters/numbers/._-)")


def iso(t):
    return t.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def utc_now():
    return dt.datetime.now(dt.timezone.utc)


class GitHubContentsClient:
    def __init__(self, token=None):
        self.token = token or os.environ.get("GITHUB_TOKEN", "")
        self.api = "https://api.github.com/repos/" + REPO

    def request(self, method, suffix, payload=None):
        if method != "GET" and not self.token:
            raise ClaimError("GITHUB_TOKEN with Contents write permission is required")
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "SuperMagicFootball-feature-claims",
        }
        if self.token:
            headers["Authorization"] = "Bearer " + self.token
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        if body is not None:
            headers["Content-Type"] = "application/json"
        req = Request(self.api + suffix, data=body, headers=headers, method=method)
        try:
            with urlopen(req, timeout=20) as response:
                return json.load(response)
        except HTTPError as error:
            if error.code == 404 and method == "GET":
                return None
            if error.code in (409, 422):
                raise ClaimError("GitHub conflicting/stale write (HTTP %s); re-read remote lock" % error.code) from error
            raise ClaimError("GitHub %s error HTTP %s: %s" % (method, error.code, error.reason)) from error

    def lock_path(self, key):
        return PREFIX + "/" + check_lock(key) + ".json"

    def read_lock(self, key):
        path = quote(self.lock_path(key), safe="/")
        item = self.request("GET", "/contents/" + path + "?ref=" + BRANCH)
        if item is None:
            return None, None
        if not isinstance(item, dict) or item.get("type") != "file":
            raise ClaimError("Expected a GitHub file for lock " + key)
        try:
            raw = base64.b64decode(item["content"].replace("\n", ""), validate=True)
            record = json.loads(raw.decode("utf-8"))
        except (KeyError, ValueError, UnicodeError) as error:
            raise ClaimError("Malformed existing lock " + key) from error
        return record, item["sha"]

    def write_lock(self, key, record, expected_sha, action):
        path = quote(self.lock_path(key), safe="/")
        payload = {
            "message": "chore(coordination): %s %s for %s" % (action, key, record["owner"]),
            "content": base64.b64encode((json.dumps(record, indent=2, sort_keys=True) + "\n").encode("utf-8")).decode("ascii"),
            "branch": BRANCH,
        }
        if expected_sha is not None:
            payload["sha"] = expected_sha
        self.request("PUT", "/contents/" + path, payload)


def claim(client, lock, feature, owner, scope, base_sha="", issue_url="", now=None):
    check_lock(lock)
    check_identity(owner, feature)
    if not scope.strip():
        raise ClaimError("Provide an explicit, bounded scope and excluded files")
    previous, sha = client.read_lock(lock)
    if previous is not None and previous.get("status") != "released":
        raise ClaimError("LOCK OCCUPIED: %s by %s (%s). Even expired active claims require a human handoff."
                         % (lock, previous.get("owner", "unknown"), previous.get("feature_id", "unknown")))
    now = now or utc_now()
    record = {
        "schema": "smf-feature-lock/1",
        "lock_key": lock,
        "feature_id": feature,
        "owner": owner,
        "scope": scope.strip(),
        "status": "active",
        "claimed_at": iso(now),
        "heartbeat_at": iso(now),
        "expires_at": iso(now + dt.timedelta(hours=24)),
        "base_dev_sha": base_sha,
        "issue_url": issue_url,
    }
    client.write_lock(lock, record, sha, "claim")
    verify(client, lock, owner, feature)
    return record


def verify(client, lock, owner, feature=None):
    record, _ = client.read_lock(lock)
    if (not record or record.get("status") != "active" or
            record.get("owner") != owner or
            (feature is not None and record.get("feature_id") != feature)):
        raise ClaimError("Lock write not confirmed on GitHub dev; STOP editing")
    return record


def renew(client, lock, owner, now=None):
    check_identity(owner)
    old, sha = client.read_lock(check_lock(lock))
    if not old or old.get("status") != "active" or old.get("owner") != owner:
        raise ClaimError("Cannot renew: this agent does not own an active lock")
    now = now or utc_now()
    new = dict(old, heartbeat_at=iso(now), expires_at=iso(now + dt.timedelta(hours=24)))
    client.write_lock(lock, new, sha, "renew")
    verify(client, lock, owner, old.get("feature_id"))
    return new


def release(client, lock, owner, outcome, handover, now=None):
    check_identity(owner)
    if outcome not in ("completed", "paused", "abandoned") or not handover.strip():
        raise ClaimError("Release requires completed/paused/abandoned outcome and handover")
    old, sha = client.read_lock(check_lock(lock))
    if not old or old.get("status") != "active" or old.get("owner") != owner:
        raise ClaimError("Cannot release another owner's lock")
    new = dict(old, status="released", outcome=outcome,
               handover=handover.strip(), released_at=iso(now or utc_now()))
    client.write_lock(lock, new, sha, "release")
    actual, _ = client.read_lock(lock)
    if not actual or actual.get("status") != "released" or actual.get("owner") != owner:
        raise ClaimError("Release not confirmed on GitHub dev")
    return new


def list_locks(client):
    listing = client.request("GET", "/contents/" + PREFIX + "?ref=" + BRANCH) or []
    return sorted(item["name"] for item in listing
                  if item.get("type") == "file" and item["name"].endswith(".json"))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("list", help="Show current GitHub dev reservations")
    for command in ("claim", "renew", "release"):
        p = commands.add_parser(command)
        p.add_argument("--lock", required=True, help="Exclusive lock key from feature registry")
        p.add_argument("--owner", required=True, help="Unique agent session ID")
        if command == "claim":
            p.add_argument("--feature", required=True)
            p.add_argument("--scope", required=True)
            p.add_argument("--base-sha", default="")
            p.add_argument("--issue-url", default="")
        elif command == "release":
            p.add_argument("--outcome", choices=["completed", "paused", "abandoned"], required=True)
            p.add_argument("--handover", required=True)
    args = parser.parse_args(argv)
    client = GitHubContentsClient()
    try:
        if args.command == "list":
            names = list_locks(client)
            if not names:
                print("No registered locks. Existing pre-protocol agents may still be working.")
            for name in names:
                key = name[:-5]
                record, _ = client.read_lock(key)
                print("%s: %s | %s | %s | %s" % (
                    key, record.get("status"), record.get("feature_id"),
                    record.get("owner"), record.get("expires_at", "")))
        elif args.command == "claim":
            record = claim(client, args.lock, args.feature, args.owner, args.scope,
                           args.base_sha, args.issue_url)
            print("CLAIM CONFIRMED on dev:", client.lock_path(args.lock), record["owner"])
        elif args.command == "renew":
            record = renew(client, args.lock, args.owner)
            print("RENEWED until", record["expires_at"])
        else:
            record = release(client, args.lock, args.owner, args.outcome, args.handover)
            print("RELEASED on dev:", client.lock_path(args.lock), record["outcome"])
    except (ClaimError, OSError) as error:
        print("No successful claim/action:", error, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
