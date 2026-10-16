# Complete customization catalogue and unique Concept Royals team

Targets below are proposed **finished illustrated modular art** counts, NOT what exists today. Existing procedural options are not counted toward modular progress. Create entries in small batches and verify before incrementing PROGRESS_TRACKER.json.

## Seventeen existing Player Studio families
| Family / saved key | Target | Key art and behavior |
|---|---:|---|
| Face / face | 16 | varied cheek, chin, jaw, forehead and side/rear head silhouettes |
| Eyes / eyes | 24 | distinct shapes, lids, highlights, near/far projections |
| Brows / brows | 28 | arch, thickness, placement, expressions |
| Eye color / eyeColor | 12 | iris palettes, natural and stylized, pupils unchanged |
| Noses / nose | 16 | bridge, tip, nostrils, distinct front/profile |
| Lips / lips | 16 | closed/open smiles, neutral, teeth, mouth shape animations |
| Haircuts / style | 40 | short, side part, curls/coils, afro, textured, spiky, wavy, long, ponytail, undercut, natural protective styles, nape/back shape |
| Hair colors / hair | 20 | natural and optional creative pigments with highlight/shadow ramps |
| Skin colors / skin | 16 | continuous fair-to-deep natural tones, separate skin masks |
| Beards / beard | 18 | clean, shadow/stubble, moustache, goatee, chinstrap, short/full, sideburn options |
| Physique / body | 8 | lean, athletic, muscular, compact, broad, different shoulder/hip rigs |
| Height / stature | 9 | proportion-controlled bands with planted feet; no gameplay stat changes |
| Exaggeration / exaggeration | 5 | cartoon head/eye-to-torso proportions while retaining anchors |
| Accessories / accessory | 28 | headband (explicit), headwear, glasses, goggles, wristbands/tape, captain band, gloves |
| Freckles / freckles | 8 | local facial patterns matched to head and skin |
| Scars / scar | 16 | cheek, brow, lip/chin variants including proper left/right placement |
| Tattoos / tattoo | 40 | forearm, sleeve, calf, neckline art bound to moving body parts |

### Additional optional future families
Ear types 8, hairline types 8, hair texture materials 8, neck shapes 5, wrinkles/dimples 8, facial expression sets 12, glasses styles 10, earrings/piercings 10, gloves 12, boots 12, sock bands 8, custom jersey trims, specific sleeve lengths, and asymmetric left/right items. Add these as namespaced concept-only string IDs, not reused numeric values.

### Completeness rules
- Every active selector must produce actual unique visible in-game pixels, not merely different menu labels. Rear views naturally hide nose/eyes but must preserve hair and face/head identity.
- Assets are modular: no exponential precooked full-body atlas. Keep realistic shading/line consistency through skin and hair color materials. Test 16 skin × 20 hair color boundary selections, and pairwise face/beard, hair/headband, glasses/face, tattoos/sleeves, build/height combinations.
- Avoid tattoos or facial hair floating during turning, clipping past chin, or incorrectly showing through helmets/collars.
- Body dimensions change visual pose/height, not match physics, collision, speed, power or ratings. Hair styles must not secretly add headbands. Shirts, logos, role colors and squad numbers are dynamic.

## First playable 12-character goal — Concept Royals FC
Use the existing **12 player IDs**, **2 GK / 3 DF / 4 MF / 3 FW** role distribution, but create 12 distinct facial/hair/skin/body identities from shared approved source art. These are illustrative slots, not claims of real players or asset completion:

| Slot | Role | Differentiating painted features |
|---|---|---|
| 01 | GK | golden-tan skin, tousled chestnut hair, square face, clean shave, green goalkeeper kit/gloves |
| 02 | GK | dark skin, black close crop, longer face, subtle stubble, gloves/wrist tape |
| 03 | DF | deep skin, curly dark hair, round jaw, clean shave |
| 04 | DF | olive skin, short black fade, angular jaw, trimmed beard |
| 05 | DF | fair skin, sandy buzz, broad face, freckles |
| 06 | MF | medium-brown skin, auburn side part, oval face |
| 07 | MF | fair skin, blond textured waves, bright eye tint, freckles |
| 08 | MF | warm-tan skin, longer black side sweep, sports glasses |
| 09 | MF | dark skin, coiled natural hair, rounder cheeks and eyebrow shape |
| 10 | FW | warm-light skin, chestnut spikes, sharp jaw, short beard, captain armband |
| 11 | FW | brown skin, short black undercut, strong brows, **explicit** headband |
| 12 | FW | medium skin, honey-brown short curls, thin moustache, wrist tape |

Each of the 12 needs unique **painted** hair/face/skin characteristics and a valid preview from all eight sides. Merely changing names, jersey numbers or applying a full-body tint does not qualify. The unique team must be shown with screenshots taken from a real running match and Studio, not a generated team portrait. Goalkeepers require green kits, distinct numbers, and visible gloves.

## Small-batch production rule
First make one beautiful playable hero with one color and hairstyle. Add two genuinely different heads with one shared body. Then add hair/color variations and correct long/rear/oblique hair projections. Promote to 12 distinct demo players only after those variants pass 8-view and motion checks. Expand the full catalog one family at a time; keep references/masks/atlases/tests paired. The final target is intended to guide years of growth, not to overload one chat.
