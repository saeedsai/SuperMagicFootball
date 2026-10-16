# Animation design — all actions and eight illustrated views

The finished system should animate the **real high-quality layered concept character**, not bounce a static full-body sprite. Reuse src/modules/artpose.js and the action/pose information in src/modules/render.js, without changing physics, hitboxes, ball possession or AI. Animations are visual consumers of gameplay state.

## Eight actual view IDs
| ID | Heading | Current compatibility input | Final art requirement |
|---|---|---|---|
| front | camera-facing | front with side sign | independently authored front |
| frontRight | front-right | quarterFront, positive | own eye/nose/hair/jersey projection |
| right | right profile | side, positive | own side silhouette |
| backRight | right rear | quarterBack, positive | own rear hair and jersey |
| back | away | back | own rear silhouette |
| backLeft | left rear | quarterBack, negative | true left art, not mirrored text/number |
| left | left profile | side, negative | true left profile and tattoos |
| frontLeft | left front | quarterFront, negative | own near/far features and kit details |

Existing VISUALFEEL.facingView converts vectors to five kinds plus signed direction. New concept-modular mapper must check the **actual existing STUDIO_DIRS order** before binding numeric indices. Temporary mirroring is acceptable in unfinished prototypes but may not qualify as complete eight-view graphics, because number 10, crest, scars or text can appear reversed.

## Body/face animation channels
Anatomical 2D rig: pelvis/torso, neck/head, shoulders/elbows/wrists/hands, hips/knees/ankles/feet, eye/blink lids, mouth/lips, secondary hair locks and garment movement. Each part has view-dependent anchor coordinates, layer order and clip masks. Foot planting and shoulder/hip counterrotation are important to avoid skating and stiff paper-doll motions.

Use time-based phases, at stable speeds on phone and PC. Combine key pose frames, interpolated pivots, hand-painted correction frames for joint bends/crossing arms, limited deformations for cloth/hair and secondary facial expressions. A fallback is explicitly tracked until final coverage. Baked illustration pixels alone are not a complete animation.

## Required animation catalogue
| Group | Specific actions and transitions | Initial target keyframes / view | Priority |
|---|---|---|---|
| Standby | idle, breathing, blink, look around, ready/anticipation | 6–8 + eye/mouth overlays | first |
| Locomotion | start, walk, jog/run, sprint, stop, backpedal, 45/90/180 turn, lean/cut | 8–12 looping + turning keys | first |
| Dribbling | approach, carry, first touch, close control, roll, receive, trap | 6–10 | first |
| Pass/shoot | short/long pass, cross, ordinary kick, powerful/super shot wind-up/strike/follow-through, volley | 6–12 | early |
| Defend/contact | brace, block, tackle, slide, impact, stumble, hurt, stun, recover/get-up | 6–12 | early |
| Aerial | header, jump, apex, land, bicycle, ball lift, midair flip, airborne intercept | 8–14 | middle |
| Specials | super, hyperdash, defenceSuper, combos, comboJump/Land/Super, flipKick, flyingKick, superBicycle, superHead, dribbleTrick, defensiveBicycle | 10–16 + corrective frames | later |
| Emotions | celebrate, disappointment, smile, cry, pain, exhaustion, victory | 6–10 each + faces | later |
| Goalkeeper movement | ready/shuffle, approach, dive in several directions, deflect, catch, land, recover, special save | 8–12 each | middle |
| Goalkeeper possession | real glove catch, visible hold at glove/chest, turn, throw, punt and release | 8–12 + ball attachment anchors | middle |

Initial production release of the *one hero* needs idle, walk/run, turn, pass/kick and at least one keeper-ready/catch fallback. Later milestones expand the entire action list. Review the latest engine action enumeration: current render.js also handles receive, slide, header, keeperDiveCatch, keeperRecover, keeperThrow, keeperPunt, keeperSuper, superBicycle, superHead, comboSuper and more. Add a mapping test asserting every engine state either has a specific completed animation or a deliberately listed temporary fallback.

## State machine and transitions
1. Select animation from real action and movement/possession state, with previous/current heading.
2. Determine time/phase from existing game clocks and action timer, not frame-count increments.
3. Select eight-direction art, explicit near/far painter order, pose and emotion channels; blend matched anchors across turns.
4. Ensure foot-contact and hip anchor remain stable on the ground when stance is planted. Root jump/slide/dive remains owned by the existing renderer.
5. Layer GK held ball using gloveGrip/ballAnchor; no ball visibly resting on foot during keeper hold.
6. Prevent crossing hands/hair from drawing through front jersey/face.
7. On missing art use old safe renderer or logged named fallback; never draw blank players.

## Milestone animation acceptance
- C01: breathe + one readable alternating arm/leg run on one view.
- C02: all **eight independently authored views** for idle, walk/run, turn, stop and kick; screenshot contact sheet and real match.
- C03: all 12 players use compatible rig/pose timing and still look unique during motion.
- C08: complete common motions with valid action transitions, feet/ball interactions, torso and arms.
- C09: all specials/emotions and goalkeeper sequences including high/low dive, actual glove hold, throw/punt.
- C12: zero unhandled/missing **production** action × direction combinations, subject to owner visual signoff.

## QA examples
8 heading views × selected actions × normalized phases (0, .25, .5, .75, 1). For each state assert no transparent blanks, missing layers, white backgrounds, mirrored numbers or clipped geometry; distinct opposite run phases should move more than the torso. Pixel hash differences alone are insufficient for smoothness: inspect a 12-frame video/contact sheet at live sprite size. Test transitions (run→kick→idle, dive→catch→hold→throw, jump→land, slide→recover), opposite legs at opposite stride, no severe elbow/hip seams, and fallback behavior when sprites fail to load.
