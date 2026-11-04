import json,base64,copy
from pathlib import Path
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
source=Path(r'C:\Users\sa1_s\Downloads\ai-stand-character-three-module-turnaround-sprite-project.json')
p=json.loads(source.read_text(encoding='utf-8'))
p['projectName']='AI Stand Character — Two-Frame Run Cycle'
views=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back','threeQuarterBackRight','right','threeQuarterFrontRight']
base_map={'front':'front','threeQuarterFrontLeft':'threeQuarterFrontLeft','left':'left','threeQuarterBackLeft':'threeQuarterBackLeft','back':'back','threeQuarterBackRight':'threeQuarterBackLeft','right':'left','threeQuarterFrontRight':'threeQuarterFrontLeft'}
body_asset={}
for base in ['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']:
 for f in (1,2):
  asset_id=f'asset_run_{base}_frame{f}'
  file=root/'body'/'run_frames_final'/f'body_run_{base}_run_{f}.png'
  b=file.read_bytes()
  im_size=None
  from PIL import Image
  with Image.open(file) as im: im_size=im.size
  p['assets'][asset_id]={'name':file.name,'mime':'image/png','width':im_size[0],'height':im_size[1],'src':'data:image/png;base64,'+base64.b64encode(b).decode('ascii')}
  body_asset[(base,f)]=asset_id
for view in views:
 st=p['scenes'][view]['stand']['stand_1']
 bycat={l['category']:l for l in st}
 body_transform=copy.deepcopy(bycat['body']['transform'])
 head=bycat['head'];hair=bycat['hair']
 for f in (1,2):
  frame=f'run_{f}'; layers=[]
  base=base_map[view]
  asset_id=body_asset[(base,f)]
  layers.append({'id':f'layer_run_{view}_{frame}_body','name':f'run_{view}_{frame}_body.png','category':'body','assetId':asset_id,'visible':True,'locked':False,'crop':{'x':0,'y':0,'w':768,'h':627},'transform':copy.deepcopy(body_transform),'color':copy.deepcopy(bycat['body'].get('color',{}))})
  for cat,orig in [('head',head),('hair',hair)]:
   layer=copy.deepcopy(orig);layer['id']=f'layer_run_{view}_{frame}_{cat}';layer['name']=f'{cat}_reused_{view}_{frame}.png';layers.append(layer)
  p['scenes'][view]['run'][frame]=layers
# Keep the existing two-frame Run animation and its FPS.
out=root/'stand_run_2frame_project.json'
out.write_text(json.dumps(p,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'project':str(out),'assets':len(p['assets']),'standLayers':sum(len(p['scenes'][v]['stand']['stand_1']) for v in views),'runLayers':sum(len(p['scenes'][v]['run'][f]) for v in views for f in ('run_1','run_2')),'runFrames':next(a['frames'] for a in p['animations'] if a['id']=='run')}))
