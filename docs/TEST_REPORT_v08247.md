# Test report — v0.8.24.7 Alpha — menu/navigation iteration

## Results

- **Node:** 64 / 64 inherited `npm test` scripts PASS on rebuilt source, including audio, game physics, BPW squads, career, releases and goalkeeper.
- **Browser:** 40 / 40 distinct script files PASS after updating stale direct-home navigation expectations and rerunning affected scripts; list in `BROWSER_EXECUTION_v08247.csv`. Tested on headless Chromium (various desktop and simulated-touch configurations), mostly sequential/targeted. This is not one uninterrupted 40-script runner invocation. A resource-constrained full-shard invocation was interrupted; successful individual executions and reruns provide the per-script results.
- **New:** `v08247_menu_browser_qa.py` PASS (desktop, mobile portrait and landscape, five categories, 12+ nested routes, placeholders, settings, Back and overflow). `v08247_menu_input_browser_qa.py` PASS (keyboard focus, simulated controller, canceled quit, pause → Sound → resume).
- **Control remap issue fixed:** old save handler called nonexistent `showSettings()` after menu split. Retested with penalty & bindings regression PASS.
- **Old tests adjusted:** The direct-home test helpers were updated to enter the matching existing mode through its new category. No underlying match engine or save keys were replaced.
- **Catalog:** 419 requirements. This number includes future modes and is **not** 419 individually executed tests.
- **Packaging:** standalone single-file HTML regenerated from `src/` and CSS; offline dependencies remain local. ZIP/HTML checksums and archive integrity checked during packaging.

## Boundaries and unverified issues

Physical USB/Bluetooth controllers, Safari/iOS hardware, unrestricted-origin localStorage persistence, real Android/iOS audio and low-end mobile performance were not certified. Desktop and mobile browser emulations do not substitute for physical testing. Real player-versus-CPU difficulty/goals calibration is still an open milestone. No new gameplay physics was introduced.
