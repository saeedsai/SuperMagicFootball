# Formation mini-pitch name labels — 3 November 2026

The six-player formation mini-pitch now sizes each visible surname label to its available responsive width instead of ellipsizing it on mobile. Full player names remain in the existing title and accessible canvas label. The label stays within the pitch and does not change player markers, lineup positions, selection order, role colors, or saves.

`tests/v08193_ui_browser_qa.py` checks all six formations at desktop and 390×844 simulated touch for complete labels, pitch bounds, and pairwise label overlap; it saves 12 screenshots under `tests/.generated/formation_labels_*.png`. Build and browser QA pass with no browser errors. Device and owner visual acceptance remain separate.
