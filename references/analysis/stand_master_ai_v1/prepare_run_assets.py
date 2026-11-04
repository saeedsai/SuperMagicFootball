from PIL import Image
from pathlib import Path
import shutil,json
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
gen=Path(r'C:\Users\sa1_s\.codex\generated_images\01a1966c-7bee-7563-870c-01c1b8ba562a')
out=root/'body'/'run_sources'; out.mkdir(parents=True,exist_ok=True)
old=['exec-dee73a40-d275-4360-aaf7-78633f64f1fe.png','exec-2ce5cd6a-da73-4427-9aa4-faf8d0b924c1.png','exec-31fab817-9f03-48e9-a9c1-0a10172cbc3c.png','exec-b0be189f-481a-4cdb-bc8c-26a93650ffc2.png','exec-72104f4c-e48f-4c16-b574-29eeb3357c00.png']
new=['exec-7cc59ee3-20dc-48a8-ac0b-83979db20c22.png','exec-8168ba0f-53d4-471c-bb0d-65a1f6a00a9b.png','exec-76cb3e9e-d611-4ba6-be59-d2b7dffea3a2.png','exec-ceabb310-57c3-4ec9-a144-5eb3e925a1d8.png','exec-5584b425-c2ce-42a2-aa67-6b5cb70ab810.png']
views=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
commands=[]
for i,v in enumerate(views):
 p1=out/f'phase1_{v}.png';p2=out/f'phase2_{v}.png';shutil.copy2(gen/old[i],p1);shutil.copy2(gen/new[i],p2)
 with Image.open(p1) as im:w,h=im.size
 commands.append({'op':'splitImageManual','source':str(p1),'outputDir':str(out/'split'/v/'run_1'),'regions':[{'x':0,'y':0,'w':w//2,'h':h}],'assignments':[{'view':v,'category':'body','animation':'run','frame':'run_1'}]})
 with Image.open(p2) as im:w,h=im.size
 commands.append({'op':'splitImageManual','source':str(p2),'outputDir':str(out/'split'/v/'run_2'),'regions':[{'x':0,'y':0,'w':w,'h':h}],'assignments':[{'view':v,'category':'body','animation':'run','frame':'run_2'}]})
(root/'body'/'run_split_commands.json').write_text(json.dumps({'commands':commands},indent=2),encoding='utf-8')
print(json.dumps([{'view':v,'phase1':Image.open(out/f'phase1_{v}.png').size,'phase2':Image.open(out/f'phase2_{v}.png').size} for v in views]))
