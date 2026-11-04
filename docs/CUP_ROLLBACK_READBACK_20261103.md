# Cup save rollback readback — 3 November 2026

Cup slot persistence now verifies the stored bytes after attempting rollback, matching the Career slot behavior. If a storage adapter throws after successfully restoring the prior bytes (or removing a key that was previously absent), readback confirms rollback and keeps the vault usable. If readback mismatches or fails, the trusted in-memory snapshot remains exportable and further writes are blocked.

Fault injection covers: existing-slot restoration despite a throwing `setItem`, absent-key restoration despite a throwing `removeItem`, and a corrupted rollback that must remain blocked. Existing rollback and backup integrity cases were updated to reflect readback-confirmed recovery.

## Validation

- `node --test tests/cup_rollback_readback.test.cjs tests/cup_storage_rollback.test.cjs tests/cup_backup_integrity.test.cjs tests/career_backup_integrity.test.cjs` — **33 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — passed.
- `git diff --check` on changed Cup source and tests — passed.

This checks the save adapter contract locally. Browser UI, physical-device power-loss behavior, and hosted storage are separate acceptance gates.
