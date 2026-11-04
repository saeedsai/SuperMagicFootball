# LAN input timeline state validation — 2026-11-02

## Change

The host-authoritative LAN input timeline now checks its complete state at each exported state transition. It rejects invalid frame and hold bounds, malformed sequence or acceptance timestamps, malformed four-button/axis data, and non-neutral controls before any input has been accepted. This prevents corrupted metadata such as a `NaN` acceptance frame from making stale guest buttons appear unexpired forever.

The existing behavior remains covered: accepted controls can be held only through the configured frame window, stale sequences are ignored, new sequences refresh the window, and initial/cleared states are neutral. Guest leave still resets the input sequence while keeping the host frame monotonic.

## Files

- `src/modules/lan-input-timeline.js`
- `tests/lan-input-timeline.test.cjs`

## Validation

Command: `node --test tests/lan-input-timeline.test.cjs`

Result: **6 passed, 0 failed**.

New regressions reject `NaN`, infinite, negative, fractional, and future acceptance frames; invalid sequence metadata; non-boolean or extra held buttons; invalid axes; and non-neutral controls in an uninitialized timeline.

This is deterministic module-level validation. It does not constitute physical two-device, network-loss, or hosted-service acceptance.
