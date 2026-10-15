#!/usr/bin/env python3
"""Generate *test-only* inline fixture from exactly the editable modules and JSON.
The distributed game is index.html + src/main.js + modules + JSON, not this fixture.
Inherited Chromium harnesses historically inject a single inline module into about:blank;
this output retains their independent deterministic physics/graphics coverage.
"""
from pathlib import Path
import json,re,base64
root=Path(__file__).resolve().parents[1]
order=['audio','dribbles','kits','specials','stats','morale','abilities','fitness','playeridentity','data','identity','clubfilters','tactics','ai','expanded','bpw','bpwalltime','continental','tournaments','career','input','visualfeel','shotfeel','engine','bpwpersonality','artpose','characterart','render','ui']
groups=['arcade','national26','club26','legends','continental','bpw_worldcup','bpw_alltime']
load=lambda path:json.loads((root/'data'/path).read_text())
players={g:load(f'players/{g}.json') for g in groups}
rosters={k:v for group in players.values() for k,v in group.items()}
assets={'teams':load('teams.json'),'rosters':rosters,'players':players,'mechanics':load('mechanics/gameplay.json'),'graphics':load('graphics/procedural_assets.json'),'editorial':load('editorial/historical_rosters.json'),'confederations':load('confederations.json'),'continentalMapping':load('continental_mapping.json')}
for t in assets['teams']:
 assert len(rosters[t['id']])==12,(t['id'],'bad roster')
code=['// Generated test harness - never hand edit.\nconst GAME_ASSETS='+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n']
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