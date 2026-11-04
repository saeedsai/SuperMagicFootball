# Two-frame run cycle alignment QA

## Deliverables

- `stand_run_2frame_aligned_project.json` — bundled, editable SuperMagicAssetStudio project.
- `aligned_renders/` — Studio CLI renders for all 8 views × 2 frames.
- `aligned_gifs/run_<view>.gif` — individual two-frame run loops for each view.
- `aligned_gifs/run_turntable_360.gif` — Studio turntable GIF, using run frame 1 for all 8 views.
- `aligned_gifs/run_all_8_views_2frame.gif` — two-frame contact animation showing all 8 views at once.
- `run_all_8_views_contact.png` and `run_all_8_views_frame2_contact.png` — two frame contact sheets used for visual inspection.
- `stand_run_2frame_align_render_commands.json` — official Studio CLI edit and export commands.

## Assembly adjustment

The prior project gave all run bodies the same canvas transform even though their source poses had different torso centers and alpha bounds. I measured the upper jersey center and foot alpha boundary in each authored body PNG, then translated the body, bald head, and hair together per view and frame. The torso center is aligned to canvas x=512 and the body alpha bottom to y=904. The three synthesized views use the mirrored source measurements. This preserves each saved scale, rotation, and relative head-to-body fit while removing view/frame drift.

| View | Frame 1 jersey center / body bottom | Frame 2 jersey center / body bottom |
|---|---:|---:|
| Front | 511.5 / 904 | 511.5 / 904 |
| 3/4 Front Left | 511.5 / 904 | 511.5 / 904 |
| Left | 511.5 / 904 | 510.5 / 904 |
| 3/4 Back Left | 511.5 / 904 | 511.5 / 904 |
| Back | 511.5 / 904 | 511.5 / 904 |
| 3/4 Back Right | 511.5 / 904 | 511.5 / 904 |
| Right | 511.5 / 904 | 512.5 / 904 |
| 3/4 Front Right | 511.5 / 904 | 511.5 / 904 |

The jersey center is measured from the rendered purple torso mask, while body bottom is the rendered visible alpha boundary. Small one-pixel center differences come from antialiasing and nearest-neighbor sampling.

## Validation

- Official SuperMagicAssetStudio CLI review: valid, zero warnings, 25 assets, 72 layers, 8 views; Run has 2 frames at 8 fps.
- Studio CLI exported all 16 transparent PNG poses, 8 per-view GIFs, and one 8-view turntable GIF.
- The combined 8-view/two-frame GIF and both frame contact sheets were inspected visually. The torso centers and ground baselines now stay aligned across views; mirrored views retain mirrored body/head/hair layers.

## Limits

These are still unapproved art prototypes. The head and hair are reused existing view assets, and three views are mirrored as requested. This alignment pass does not prove frame-specific source fit, layer purity, in-game integration, physical-device rendering, or human art approval. Studio's 360 turntable export samples the first frame of the selected animation for each view; the separate contact GIF loops both run frames in all views simultaneously.
