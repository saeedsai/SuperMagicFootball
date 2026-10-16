#!/usr/bin/env python3
"""C01 experimental painted art contract: transparent editable face + two hair views."""
import json,xml.etree.ElementTree as ET
from pathlib import Path
R=Path(__file__).resolve().parents[1]/'assets/characters/concept_modular_v1'
m=json.loads((R/'manifests/rig.json').read_text(encoding='utf8'))
assert m['schema']=='smf-concept-modular/1'
assert m['authoredViews']==['front','back'] and len(set(m['viewIds']))==8
assert m['fallbackModel']=='concept_hero' and m['logicalPlayerHeight']==141
assert m['referenceCanvas']==[112,265]
layers=[m['runtimeLayer'],*m['additionalLayers']]
assert sorted(l['id'] for l in layers)==['arm_near_front_001','face_front_001','hair_back_001','hair_front_001']
assert [l['z'] for l in layers if l['view']=='front']==[20,10,14]
for layer in layers:
 view=layer['view'];dims=[112,265] if view=='front' else [115,265]
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
 assert root.tag==ns+'svg'
 assert root.get('viewBox')=='0 0 '+str(dims[0])+' 265'
 assert root.get('width')==str(dims[0]) and root.get('height')=='265'
 assert len(root.findall('.//'+ns+'path'))>=12
 assert not root.findall('.//'+ns+'image') and not root.findall('./'+ns+'rect')
 assert not any('http:' in v or 'https:' in v for e in root.iter()
                for k,v in e.attrib.items() if k.endswith('href'))
 if layer['id']=='arm_near_front_001':
  assert layer['shoulder']==layer['pivot']==[90,126]
  assert layer['elbow']==[102,171] and layer['wrist']==[104,187] and layer['hand']==[104,199]
  assert layer['z']>10 and layer['z']<20
  anim=layer['animation']
  assert anim['channel']=='legacy_run_phase' and anim['rotationRadiansPerPhase']==-.035
  assert anim['rootOwner']=='Renderer' and anim['unfinishedOppositeArm'] is True
  groups={g.get('id') for g in root.findall('.//'+ns+'g')}
  assert set(layer['partGroups']).issubset(groups)
 if layer['id']=='face_front_001':
  assert layer['headCenter']==[56,78] and layer['neck']==[56,110]
  assert layer['ears']==[[21,81],[94,82]] and layer['pivot']==[56,99]
  assert layer['z']<m['runtimeLayer']['z'],'face must draw below painted front hair'
  groups={g.get('id') for g in root.findall('.//'+ns+'g')}
  assert set(layer['partGroups']).issubset(groups)
assert (R/'manifests'/m['provenance']).is_file()
print('CONCEPT_MODULAR_SOURCE_PASS 4 transparent editable layers, face/shoulder pivots, isolated hand and face groups, original fallback')
