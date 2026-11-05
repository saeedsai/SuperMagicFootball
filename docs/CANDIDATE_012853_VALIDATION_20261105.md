# Candidate 0.12.81.53 validation

**Status: exact-head Full Regression Census `42026546624` and Modular QA `42026546832` passed for SHA `a7e4c605c55b6cf0ec98295fe29b0a3f26ba3eee`; protected promotion and hosted deployment remain to verify.** Career and Cup archive export now refuses serialized payloads and envelopes that exceed the inspector character cap or the explicit UTF-8 byte cap. Existing import-time UTF-8 byte enforcement is added in candidate .54. Save schemas and existing progress are unchanged.

## Changes

- Career and Cup exports reject vault payloads over 2,000,000 serialized characters before constructing an archive. They also reject an envelope over 2,000,000 characters or UTF-8 bytes before returning it to the UI for download.
- The error is explicit and non-destructive. Existing storage bytes, live slots, and stale-tab recovery snapshots remain intact when export is refused. This closes the export gap where a save accepted locally could produce a backup that the game rejected on inspection or import.
- Near-limit archives remain valid and preserve their complete data through export, inspect, import, and re-export.

## Validation

- `node --test tests/career_backup_integrity.test.cjs tests/cup_backup_integrity.test.cjs`: **32/32 passed**, including limit-boundary round-trips, stale recovery preservation, and Unicode UTF-8 byte limits.
- `node --test tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs`: **20/20 passed** after syncing package, About release notes, README banner/heading, and service-worker cache metadata.
- `npm run test:node`: build passed (**5,219,207 JS / 5,342,259 HTML characters**); full Node suite **2,285/2,285**; Club26/FC27 fixture passed.
- `git diff --check`: passed.

## Remaining acceptance

- Exact `.53` Full Regression Census `42026546624` and Modular QA `42026546832` passed. Protected promotion, Pages deployment, hosted-byte smoke, and main Census remain to be confirmed for this SHA.
- Owner gameplay/save review and physical-device checks remain external acceptance.
- Public Online Career/Ultimate Team/PVP hosting still needs the owner-provided server, durable PostgreSQL, OIDC/secrets, and backup/restore configuration. Active PVP restart resume still needs a safe authoritative engine checkpoint contract.