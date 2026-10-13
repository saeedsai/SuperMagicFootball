# Appearance Expansion Spec — v0.8.14

## Goal

Increase the comic individuality of player avatars so the game feels funnier and more expressive, while moving recognizable stars closer to their stylized identity.

## Delivered in this phase

### Facial feature catalog

- Eye shapes: **20**
- Eyebrow shapes: **20**
- Eye colors: **6**
- Nose shapes: **6**
- Lip shapes: **8**

### New caricature controls

- **Build**: 5-step wider/slimmer body variation
- **Stature**: 5-step shorter/taller body variation
- **Funny scale**: 3-step head/body exaggeration modifier

### Rendering improvements

- Stronger eye/eyebrow expression language
- More varied mouth/lip rendering
- Slightly more recognizable star/legend signature presets
- Richer shirt collar/trim/sleeve/shorts presentation
- Heavier chibi silhouette and more comic proportions

## Data/persistence approach

- All new fields are deterministic for untouched players.
- Manual player customization persists the expanded appearance object.
- Legacy `mouth` appearance data remains accepted and maps safely into the new `lips` flow.

## Non-goals for v0.8.14

- Photoreal likenesses
- Licensed club crests or photo-based portraits
- Hand-authored appearance review for all 2,592 players
- Real-world body/height database parity

## Planned follow-up

- Curated likeness pass for priority stars by team
- Named preset labels and editor guidance
- Additional keeper/body archetypes
- Screenshot-review pack covering flagship teams and legends
