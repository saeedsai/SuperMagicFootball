#!/usr/bin/env python3
"""Render Mace Sweep's wrist prop through the actual game renderer at eight headings and five times."""
from pathlib import Path
import base64
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build current modular browser fixture first'
html=fixture.read_text(encoding='utf8')
output=ROOT/'tests/.generated/art102_mace_sweep_gallery.png'

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1600,'height':1100},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.set_content(html,wait_until='load')
 page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
 result=page.evaluate('''() => {
  const api=SupermagicFootball,g=api.game;
  g.init({home:0,away:9,humans:1,mode:'quick'});
  const p=g.player(0,2),target=g.player(1,2);
  p.src={...p.src,role:'DF',superDefenceLevel:2,
   superAbility:{type:'defence',id:'maceSweep',level:2}};
  const directions=[
   ['front',0,1],['frontRight',.5,.866],['right',1,0],['backRight',.5,-.866],
   ['back',0,-1],['backLeft',-.5,-.866],['left',-1,0],['frontLeft',-.5,.866]
  ];
  const phases=[.24,.18,.12,.06,0],canvas=document.createElement('canvas');
  canvas.width=1520;canvas.height=1640;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#233a36';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff4cc';
  let cells=0;const hashes=[];
  directions.forEach(([label,dx,dy],row)=>{
   ctx.fillText(label,45,row*205+95);
   phases.forEach((remaining,col)=>{
    const x=145+col*190,y=row*205+8;
    ctx.fillStyle=(row+col)%2?'#324943':'#2b423d';ctx.fillRect(x,y,180,190);
    p.x=x+90;p.y=y+174;p.dx=dx;p.dy=dy;p.face=dx<0?-1:1;p.visualFacing=null;
    p.action='defenceSuper';p.actionTimer=remaining;p.stun=0;p.z=0;p.preview=true;
    p.maceSweepPending={remaining,target};
    api.renderer.drawPlayer(ctx,p,g);cells++;
    const pixels=ctx.getImageData(x,y,180,190).data;let checksum=0;
    for(let i=0;i<pixels.length;i++)checksum=(checksum+pixels[i]*(i+1))%9007199254740881;
    hashes.push({row,col,checksum});
   });
  });
  const url=canvas.toDataURL('image/png');
  const phaseCounts=directions.map((_,row)=>new Set(hashes.filter(h=>h.row===row).map(h=>h.checksum)).size);
  const headingCounts=phases.map((_,col)=>new Set(hashes.filter(h=>h.col===col).map(h=>h.checksum)).size);
  return {cells,width:canvas.width,height:canvas.height,phaseCounts,headingCounts,url};
 }''')
 assert result['cells']==40 and (result['width'],result['height'])==(1520,1640),result
 assert result['phaseCounts']==[5]*8,('phase art did not visibly change in every heading',result['phaseCounts'])
 assert all(count>=5 for count in result['headingCounts']),('view gallery has duplicate rendered silhouettes',result['headingCounts'])
 output.parent.mkdir(parents=True,exist_ok=True)
 output.write_bytes(base64.b64decode(result['url'].split(',',1)[1]))
 assert not errors,errors
 print('ART102_MACE_SWEEP_GALLERY_PASS',output,result['cells'],'cells',flush=True)
 browser.close()
