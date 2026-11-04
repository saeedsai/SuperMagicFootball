# SHOT-VFX-02 — Country-inspired ball cosmetics

## Implemented option

The global **Ball Design** setting now includes `Hinomaru Panels · Japan-inspired`. The design is an original procedural match-ball treatment with a centered deep-red disc on a white ball and small football seam panels. It is selected by the player from Settings or match setup, applies globally to that match, and is never assigned from player nationality. Existing saves and new matches retain `classic` unless the player changes the setting. The design is presentation-only; match physics and ball collision radii are unchanged.

## Source note and design limits

The motif uses the white field and centered crimson disc specified by Japan's [Act on National Flag and Anthem](https://laws.e-gov.go.jp/law/411AC0000000127), which also sets the official flag proportions. The game draws its own simplified ball-panel composition rather than embedding the flag image. It omits rays and other emblems. No nationality, player personality, ability, or team selection is derived from this design.

The second optional treatment, `Tricolore Panels · France-inspired`, uses curved blue, white and red ball panels. The colors are based on Article 2 of France's [Constitution of 4 October 1958](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006527453/2026-02-06). This is original ball artwork, not an embedded flag or exact flag layout. It is selected from the same global cosmetic menu and is never inferred from nationality.

The third optional treatment, `Auriverde Panels · Brazil-inspired`, uses a green field, gold diamond, blue center and curved white band based on the Brazilian Presidency's [national flag description](https://www.gov.br/planalto/pt-br/conheca-a-presidencia/biblioteca-da-pr/simbolos-nacionais/bandeira/bandeira-nacional). It omits the flag's stars and motto and uses original ball artwork. It shares the opt-in global setting and never reads player nationality.

## Validation

`tests/shot_vfx_02_country_ball.test.cjs` covers catalog/source metadata, default and selection persistence contracts, procedural pattern rendering, and a paired-engine physics invariance check. Run with:

```powershell
node --test tests/shot_vfx_02_country_ball.test.cjs
```

## Remaining scope

This delivers three researched optional cosmetics, not a complete country catalog. Any additional motif requires its own authoritative source note, original non-stereotyping visual treatment, and the same opt-in global setting; do not attach motifs automatically to players, rosters, nationality or ability.
