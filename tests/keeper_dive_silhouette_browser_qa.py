"""Actual renderer preview for keeper torso/leg lean across both dive lanes."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
FIXTURE=ROOT/'tests/.generated/play.html'
OUT=ROOT/'tests/.generated/keeper_dive_silhouette.png'
assert FIXTURE.exists(),'Run python -X utf8 scripts/build.py first'
html=FIXTURE.read_text(encoding='utf-8')
JS=r'''() => {
 const e=window.SupermagicFootball,g=e?.game,r=e?.renderer;
 if(!g||!r?.drawPlayer)throw Error('live game/player renderer unavailable');
 const base=g.players.find(p=>p?.keeper);if(!base)throw Error('keeper player unavailable');
 const lanes=[['DIVE UP',-1],['DIVE DOWN',1]],phases=[0,.15,.30,.45,.60,'recover'];
 const labels=['TAKEOFF','EARLY','MID','LATE','FULL REACH','RECOVER'];
 const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=440;canvas.id='keeper-dive-gallery';
 canvas.style.cssText='position:fixed;left:10px;top:10px;width:1920px;height:440px;z-index:999999;background:#e8eef3';
 const c=canvas.getContext('2d',{willReadFrequently:true});c.fillStyle='#e8eef3';c.fillRect(0,0,canvas.width,canvas.height);
 const original={time:r.time,ball:JSON.stringify({x:g.ball.x,y:g.ball.y,z:g.ball.z,vx:g.ball.vx,vy:g.ball.vy,vz:g.ball.vz}),player:JSON.stringify({x:base.x,y:base.y,z:base.z,action:base.action,actionTimer:base.actionTimer,diveElapsed:base.diveElapsed,diveDy:base.diveDy})};
 const hashes=[];let samples=0;
 try {
  for(let li=0;li<lanes.length;li++)for(let pi=0;pi<phases.length;pi++){
   const [lane,diveDy]=lanes[li],phase=phases[pi],x=pi*320,y=li*220;
   c.fillStyle='#e8eef3';c.fillRect(x,y,320,220);
   c.fillStyle='#203244';c.font='bold 11px system-ui';c.textAlign='center';c.fillText(labels[pi],x+160,y+16);
   c.save();c.beginPath();c.rect(x,y,320,220);c.clip();c.translate(x+160,y+146);r.time=.31;
   const face=base.t===0?1:-1;
   const p={...base,x:0,y:0,z:0,face,dx:0,dy:0,visualFacing:{kind:'side',side:face},action:phase==='recover'?'keeperRecover':'keeperDive',actionTimer:phase==='recover'?.34:.60-(Number(phase)||0),diveElapsed:phase==='recover'?0:phase,diveDy,controlled:false,preview:true,keeper:true,stun:0,cryTimer:0};
   r.drawPlayer(c,p,{getTeam:()=>g.getTeam(base.t),options:{showNames:false,reducedFlash:false}});c.restore();
   const d=c.getImageData(x,y,320,220).data;let h=2166136261,opaque=0,minX=320,minY=220,maxX=-1,maxY=-1;
   for(let q=0;q<d.length;q+=4){const bg=d[q]===232&&d[q+1]===238&&d[q+2]===243;if(d[q+3]>16&&!bg&&((q>>2)/320|0)>=23){opaque++;const k=q>>2,px=k%320,py=(k/320)|0;minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);}h=Math.imul(h^d[q]^d[q+1]<<8^d[q+2]<<16^d[q+3],16777619)>>>0;}
   if(opaque<650||minX<5||maxX>314||minY<12||maxY>214)throw Error(`blank/clipped ${lane} ${labels[pi]} ${[minX,minY,maxX,maxY]} px ${opaque}`);
   hashes.push({lane,label:labels[pi],hash:h,opaque,bounds:[minX,minY,maxX,maxY]});samples++;
  }
 } finally {r.time=original.time;}
 document.body.append(canvas);
 for(const [lane] of lanes){const sequence=hashes.filter(v=>v.lane===lane);if(new Set(sequence.slice(0,5).map(v=>v.hash)).size<4)throw Error(`dive phases do not visibly animate ${lane}`);}
 const sameBall=JSON.stringify({x:g.ball.x,y:g.ball.y,z:g.ball.z,vx:g.ball.vx,vy:g.ball.vy,vz:g.ball.vz})===original.ball;
 const samePlayer=JSON.stringify({x:base.x,y:base.y,z:base.z,action:base.action,actionTimer:base.actionTimer,diveElapsed:base.diveElapsed,diveDy:base.diveDy})===original.player;
 if(!sameBall||!samePlayer)throw Error('visual preview mutated physics/keeper state');
 return {lanes:lanes.map(v=>v[0]),phases:labels,samples,distinctDives:lanes.map(([lane])=>new Set(hashes.filter(v=>v.lane===lane).slice(0,5).map(v=>v.hash)).size),physicsAndKeeperStateUnchanged:true};
}'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 results=[]
 for label,options in [('desktop',{'viewport':{'width':1040,'height':390}}),('touch',{'viewport':{'width':844,'height':390},'is_mobile':True,'has_touch':True})]:
  context=browser.new_context(**options);page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer',timeout=60000)
  result=page.evaluate(JS);preview=OUT.with_name(f'keeper_dive_silhouette_{label}.png')
  page.locator('#keeper-dive-gallery').screenshot(path=str(preview),timeout=30000)
  assert result['samples']==12 and all(n>=4 for n in result['distinctDives']),result
  assert not errors,errors
  results.append({'deviceProfile':label,**result,'preview':str(preview),'pageErrors':errors});context.close()
 browser.close();print({'profiles':results})
