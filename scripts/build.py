#!/usr/bin/env python3
"""Generate *test-only* inline fixture from exactly the editable modules and JSON.
The distributed game is index.html + src/main.js + modules + JSON, not this fixture.
Inherited Chromium harnesses historically inject a single inline module into about:blank;
this output retains their independent deterministic physics/graphics coverage.
"""
from pathlib import Path
import json,re,base64
root=Path(__file__).resolve().parents[1]
order=['audio','dribbles','kits','specials','stats','morale','abilities','fitness','playeridentity','data','identity','clubfilters','tactics','ai','expanded','bpw','bpwalltime','continental','tournaments','career','input','visualfeel','shotfeel','physicsbalance','shotpaths','engine','bpwpersonality','artpose','characterart','concepthero','conceptmodular','render','ui']
groups=['arcade','national26','club26','legends','continental','bpw_worldcup','bpw_alltime']
load=lambda path:json.loads((root/'data'/path).read_text())
players={g:load(f'players/{g}.json') for g in groups}
rosters={k:v for group in players.values() for k,v in group.items()}
assets={'teams':load('teams.json'),'rosters':rosters,'players':players,'mechanics':load('mechanics/gameplay.json'),'graphics':load('graphics/procedural_assets.json'),'editorial':load('editorial/historical_rosters.json'),'confederations':load('confederations.json'),'continentalMapping':load('continental_mapping.json')}
for t in assets['teams']:
 assert len(rosters[t['id']])==12,(t['id'],'bad roster')
code=['// Generated test harness - never hand edit.\nconst GAME_ASSETS='+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n']
concept_atlas=base64.b64encode((root/'assets/concept_hero/hero_atlas.webp').read_bytes()).decode('ascii')
code.append('const CONCEPT_HERO_INLINE='+json.dumps(concept_atlas)+';\n')
modular_front=base64.b64encode((root/'assets/characters/concept_modular_v1/source/hair_front_front.svg').read_bytes()).decode('ascii')
code.append('const CONCEPT_MODULAR_FRONT_INLINE='+json.dumps(modular_front)+';\n')
modular_back=base64.b64encode((root/'assets/characters/concept_modular_v1/source/hair_back_back.svg').read_bytes()).decode('ascii')
code.append('const CONCEPT_MODULAR_BACK_INLINE='+json.dumps(modular_back)+';\n')
modular_face=base64.b64encode((root/'assets/characters/concept_modular_v1/source/face_front_front.svg').read_bytes()).decode('ascii')
code.append('const CONCEPT_MODULAR_FACE_INLINE='+json.dumps(modular_face)+';\n')
modular_arm=base64.b64encode((root/'assets/characters/concept_modular_v1/source/arm_near_front.svg').read_bytes()).decode('ascii')
code.append('const CONCEPT_MODULAR_ARM_INLINE='+json.dumps(modular_arm)+';\n')
modular_far_arm=base64.b64encode((root/'assets/characters/concept_modular_v1/source/arm_far_front.svg').read_bytes()).decode('ascii')
code.append('const CONCEPT_MODULAR_FAR_ARM_INLINE='+json.dumps(modular_far_arm)+';\n')
modular_collar=base64.b64encode((root/'assets/characters/concept_modular_v1/source/torso_collar_front.svg').read_bytes()).decode('ascii')
code.append('const CONCEPT_MODULAR_COLLAR_INLINE='+json.dumps(modular_collar)+';\n')
modular_torso=base64.b64encode((root/'assets/characters/concept_modular_v1/source/torso_front.svg').read_bytes()).decode('ascii')
code.append('const CONCEPT_MODULAR_TORSO_INLINE='+json.dumps(modular_torso)+';\n')
modular_back_torso=base64.b64encode((root/'assets/characters/concept_modular_v1/source/torso_back.svg').read_bytes()).decode('ascii')
code.append('const CONCEPT_MODULAR_BACK_TORSO_INLINE='+json.dumps(modular_back_torso)+';\n')
for name in order:
 s=(root/'src/modules'/f'{name}.js').read_text()
 s=re.sub(r'^import \{[A-Z_]+\} from .*?;\n','',s,flags=re.M)
 s=re.sub(r'^export \{[A-Z_]+\};\n','',s,flags=re.M)
 code.append(s)
src='\n'.join(code)
fixture=root/'tests/.generated';fixture.mkdir(exist_ok=True)
(fixture/'game.js').write_text(src)
html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="style.css"/>','<style>\n'+(root/'style.css').read_text()+'\n</style>').replace('<script type="module" src="src/main.js"></script>','<script type="module">\n'+src.replace('</script','<\\/script')+'\n</script>')
html=html.replace('href="icon-180.png"','href="data:image/png;base64,'+base64.b64encode((root/'icon-180.png').read_bytes()).decode()+'"')
(fixture/'play.html').write_text(html)
print('Built inherited test fixtures from modular runtime:',len(src),'JS chars;',len(html),'HTML chars')