# Changelog — v0.8.24.7 Alpha — 14 October 2026

- Replaced multi-section home dashboard with five clean main categories, matching user-provided menu layout.
- Added nested On Device, Online, Career, Leagues & Cups, International, Clubs, Settings, Customization, Input and Save screens.
- Reused live match, penalty, training, World League, continental cups, manager career, club creation, player studio, roster editor, squad tactics, four-action controls, audio and save handling.
- Separated Game, Graphics and Sound settings, saving only the visible editable controls; retained original `legend_` settings keys.
- Marked unfinished modes Coming Later instead of routing to fake competitions/multiplayer.
- Added keyboard arrow/Enter/Space, Escape/Backspace and simulated-gamepad A/B/D-pad focus navigation.
- Added pause Return-to-Menu / Restart confirmations and safe Settings → Sound → pause return.
- Fixed control-remapping save path still calling the removed all-in-one Settings screen; removed dead settings-rendering markup.
- Adjusted legacy browser QA navigation helpers for nested menu entry; added two new menu browser suites and fourteen cataloged cases.
- Preserved seven BPW teams, six formations, player stats, Super Shot/Header/Bicycle sequences and 4 action buttons.
- No physics balancing change, roster correction, new playable online mode or new tournament engine.
