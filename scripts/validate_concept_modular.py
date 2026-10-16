#!/usr/bin/env python3
"""Validate experimental editable front hair without altering game data."""
import json,xml.etree.ElementTree as ET
from pathlib import Path
R=Path(__file__).resolve().parents[1]/'assets/characters/concept_modular_v1'
m=json.loads((R/'manifests/rig.json').read_text())
assert m['schema']=='smf-concept-modular/1' and m['authoredViews']==['front']
assert len(set(m['viewIds']))==8 and m['fallbackModel']=='concept_hero'
assert m['referenceCanvas']==[112,265] and m['logicalPlayerHeight']==141
l=m['runtimeLayer']
assert l['view']=='front' and l['kind']=='hair_front' and l['noMirroring']
assert l['sourceCanvas']==m['referenceCanvas'] and l['cropRect']==[0,0,112,265]
assert l['trimOffset']==[0,0] and 0<=l['pivot'][0]<=112 and 0<=l['pivot'][1]<=265
assert 0<=l['alphaBoundsEstimate'][0]<l['alphaBoundsEstimate'][2]<=112
assert 0<=l['alphaBoundsEstimate'][1]<l['alphaBoundsEstimate'][3]<=265
art=(R/'manifests'/l['asset']).resolve()
assert art.is_relative_to(R) and art.is_file()
assert (R/'manifests'/m['provenance']).is_file()
root=ET.fromstring(art.read_text())
ns='{http://www.w3.org/2000/svg}'
assert root.tag==ns+'svg' and root.get('viewBox')=='0 0 112 265'
assert len(root.findall('.//'+ns+'path'))>=12
assert not root.findall('.//'+ns+'image') and not root.findall('./'+ns+'rect')
assert not any('http:' in v or 'https:' in v for e in root.iter() for k,v in e.attrib.items() if k.endswith('href'))
print('CONCEPT_MODULAR_SOURCE_PASS transparent source, bounds, pivots, provenance and fallback')
