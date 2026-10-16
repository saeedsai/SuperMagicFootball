#!/usr/bin/env python3
"""Validate both genuinely editable, transparent illustrated hair layers and rig pivots."""
import json,xml.etree.ElementTree as ET
from pathlib import Path
R=Path(__file__).resolve().parents[1]/'assets/characters/concept_modular_v1'
m=json.loads((R/'manifests/rig.json').read_text(encoding='utf8'))
assert m['schema']=='smf-concept-modular/1' and m['authoredViews']==['front','back']
assert len(set(m['viewIds']))==8 and m['fallbackModel']=='concept_hero'
assert m['referenceCanvas']==[112,265] and m['logicalPlayerHeight']==141
layers=[m['runtimeLayer'],*m['additionalLayers']]
assert [l['id'] for l in layers]==['hair_front_001','hair_back_001']
for layer in layers:
 view=layer['view'];dims=[112,265] if view=='front' else [115,265]
 assert layer['kind']==('hair_front' if view=='front' else 'hair_back')
 assert layer['noMirroring'] is True
 assert layer['sourceCanvas']==dims and layer['cropRect']==[0,0,*dims]
 assert layer['trimOffset']==[0,0]
 assert all(0<=layer['pivot'][i]<=dims[i] for i in (0,1))
 x0,y0,x1,y1=layer['alphaBoundsEstimate']
 assert 0<=x0<x1<=dims[0] and 0<=y0<y1<=dims[1]
 art=(R/'manifests'/layer['asset']).resolve()
 assert art.is_relative_to(R) and art.is_file()
 root=ET.fromstring(art.read_text(encoding='utf8'))
 ns='{http://www.w3.org/2000/svg}'
 assert root.tag==ns+'svg' and root.get('viewBox')=='0 0 '+str(dims[0])+' 265'
 assert root.get('width')==str(dims[0]) and root.get('height')=='265'
 assert len(root.findall('.//'+ns+'path'))>=12
 assert not root.findall('.//'+ns+'image') and not root.findall('./'+ns+'rect')
 assert not any('http:' in v or 'https:' in v for e in root.iter()
                for k,v in e.attrib.items() if k.endswith('href'))
assert (R/'manifests'/m['provenance']).is_file()
print('CONCEPT_MODULAR_SOURCE_PASS: 2 painted transparent layers, matching pivots, legacy fallback')
