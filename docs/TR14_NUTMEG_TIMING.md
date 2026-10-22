# TR14 Nutmeg timing

Development candidate: Nutmeg dribbling gains a small bounded bonus against nearby defenders. The live engine supplies stat-only contests after checking close range; separate closing/facing defender reads still counter the move. Spatial-aware callers require a closing defender within 15–100 units. Fatigue removes the bonus and strong defenders can counter weak dribblers. Existing four buttons and save schema remain unchanged.

Source: `d19e47b9` (initial), `32b93155` (engine stat-only integration). Local exact-source Node checks: 13/13 passing against blob `0a38af2ee6dc5a4d562fbde87739f8e97eadcadd`. Full CI, Modular QA and Pages remain unverified. Player Studio dribble equipment helper exists but UI is not wired. GitHub regression-test, README, release-notes and central-log updates encountered tool safety rejections; do not claim certification.
