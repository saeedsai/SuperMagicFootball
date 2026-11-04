# SAVE-103 Career rollback readback — 2026-11-03

Career vault writes now verify the stored bytes after attempting rollback, even when the storage adapter throws after performing the restore. A matching readback is treated as a successful rollback: in-memory state remains usable and no false recovery snapshot is exposed. A mismatching or unavailable readback still blocks further writes and retains the last trusted in-memory snapshot for export.

Focused fault injection covers both a previously absent vault key restored by a throwing `removeItem`, and an occupied vault restored by a throwing `setItem`. It also confirms that a real mismatch still reports incomplete rollback and preserves the trusted backup. Existing Career legacy-label compatibility and Cup backup behavior remain covered by adjacent suites.

## Validation

- `node --test tests/career_backup_integrity.test.cjs` — **12 passed, 0 failed**.
- `node --test tests/career_backup_integrity.test.cjs tests/career_save_slots.test.cjs tests/career_slot_duplicate.test.cjs tests/career_slot_rename.test.cjs tests/cup_backup_integrity.test.cjs` — **53 passed, 0 failed**.
- `git diff --check -- src/modules/career_slots.js tests/career_backup_integrity.test.cjs` — passed.

Physical power-loss behavior and hosted restore remain unverified; this change validates adapter-level rollback/readback only.
