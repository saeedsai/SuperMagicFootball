# Candidate 0.12.81.53 validation

**Status: local candidate; exact-head CI has not run.** Career and Cup archive export now enforces the exact serialized-size bounds required by its own inspector/importer. The save schemas and existing progress are unchanged.

## Changes

- Career and Cup exports reject vault payloads over 2,000,000 serialized characters before constructing an archive. They also reject an envelope over 2,000,000 characters or UTF-8 bytes before returning it to the UI for download.
- The error is explicit and non-destructive. Existing storage bytes, live slots, and stale-tab recovery snapshots remain intact when export is refused. This closes the gap where a save accepted locally could produce a backup that the same game rejected on inspection or import.
- Near-limit archives remain valid and preserve their complete data through export, inspect, import, and re-export.

## Validation

- `node --test tests/career_backup_integrity.test.cjs tests/cup_backup_integrity.test.cjs`: **32/32 passed**, including limit-boundary round-trips, stale recovery preservation, and Unicode UTF-8 byte limits.
- `node --test tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs`: **20/20 passed** after syncing package, About release notes, README banner/heading, and service-worker cache metadata.
- `npm run test:node`: build passed (**5,219,207 JS / 5,342,259 HTML characters**); full Node suite **2,285/2,285**; Club26/FC27 fixture passed.
- `git diff --check`: passed.

## Remaining acceptance

- Exact `.53` Full Regression Census and Modular QA, then confirm protected promotion, Pages deployment, hosted-byte smoke, and main Census for the exact SHA.
- Owner gameplay/save review and physical-device checks remain external acceptance.
- Public Online Career/Ultimate Team/PVP hosting still needs the owner-provided server, durable PostgreSQL, OIDC/secrets, and backup/restore configuration. Active PVP restart resume still needs a safe authoritative engine checkpoint contract.