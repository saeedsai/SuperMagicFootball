"""Actual Canvas renderer gallery for twenty-five celebration styles in eight views."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
FIXTURE=ROOT/'tests/.generated/play.html'
OUT=ROOT/'tests/.generated/celebration_player_poses.png'
CRY_OUT=ROOT/'tests/.generated/disappointment_reaction_poses.png'
assert FIXTURE.exists(),'Run python -X utf8 scripts/build.py first'
html=FIXTURE.read_text(encoding='utf-8')
JS=r'''() => {
 const e=window.SupermagicFootball,g=e?.game,r=e?.renderer;
 if(!g||!r?.drawPlayer)throw Error('live game/player renderer unavailable');
 const base=g.players.find(p=>p&&!p.keeper);if(!base)throw Error('outfield player unavailable');
 const views=[
  ['FRONT',0,1],['FRONT RIGHT',.707,.707],['RIGHT',1,0],['BACK RIGHT',.707,-.707],
  ['BACK',0,-1],['BACK LEFT',-.707,-.707],['LEFT',-1,0],['FRONT LEFT',-.707,.707]
 ];
 const styles=['CHAMPION DANCE','HUMAN PYRAMID','VICTORY LAP','SUPERSTAR POSE','GOAL PARTY','TEAM WAVE','VICTORY V','FAN PARADE','RESPECTFUL BOW','KICKOFF SPIN','ONE-KNEE PRAYER','SHOULDER SURF','DOUBLE FIST PUMP','WAVE TO CROWD','HEART HANDS','ELBOW PUMP','CALM IT','SKY POINT','BADGE KISS','OPEN ARMS','SIDE SHUFFLE','SALUTE TO FANS','CROSS-CHEST FIST','SIDELINE POINT','VICTORY SPREAD'];
 const canvas=document.createElement('canvas');canvas.width=4250;canvas.height=1740;canvas.id='celebration-player-gallery';
 canvas.style.cssText='position:fixed;left:10px;top:10px;width:4250px;height:1740px;z-index:1000002;background:#e8eef3';
 const c=canvas.getContext('2d',{willReadFrequently:true});c.fillStyle='#e8eef3';c.fillRect(0,0,canvas.width,canvas.height);
 const original={time:r.time,celebrationStyle:g.celebrationStyle,ball:JSON.stringify({x:g.ball.x,y:g.ball.y,z:g.ball.z,vx:g.ball.vx,vy:g.ball.vy,vz:g.ball.vz}),player:JSON.stringify({x:base.x,y:base.y,z:base.z,dx:base.dx,dy:base.dy,action:base.action})};
 const hashes=[];let samples=0;const teammateDistinctByStyle=[],cryHashes=[];
 try {
  for(let vi=0;vi<views.length;vi++)for(let si=0;si<styles.length;si++){
   const [label,dx,dy]=views[vi],x=si*170,y=vi*190;
   c.fillStyle='#e8eef3';c.fillRect(x,y,170,190);
   c.fillStyle='#203244';c.font='bold 10px system-ui';c.textAlign='center';c.fillText(styles[si],x+85,y+16);
   c.save();c.translate(x+85,y+176);
   g.celebrationStyle=si;r.time=.43;
   const p={...base,x:0,y:0,z:0,dx,dy,face:dx<0?-1:1,visualFacing:null,action:'celebrate',anim:0,actionTimer:0,controlled:false,preview:true,keeper:false,stun:0,cryTimer:0};
   r.drawPlayer(c,p,{getTeam:()=>g.getTeam(base.t),options:{showNames:false,reducedFlash:false},celebrationStyle:si});c.restore();
   const d=c.getImageData(x,y,170,190).data;let h=2166136261,opaque=0,minX=170,minY=190,maxX=-1,maxY=-1;
   for(let q=0;q<d.length;q+=4){const isBackground=d[q]===232&&d[q+1]===238&&d[q+2]===243;if(d[q+3]>16&&!isBackground&&(q>>2)%170<162&&((q>>2)/170|0)>=24){opaque++;const pixel=q>>2,px=pixel%170,py=(pixel/170)|0;minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);}h=Math.imul(h^d[q]^d[q+1]<<8^d[q+2]<<16^d[q+3],16777619)>>>0;}
   if(opaque<700||minX<8||maxX>161||minY<10||maxY>188)throw Error(`blank/clipped ${label} ${styles[si]} bounds ${[minX,minY,maxX,maxY]} px ${opaque}`);
   hashes.push({view:label,style:si,hash:h,opaque});samples++;
  }
  // Each scorer-side teammate gets a deterministic offset through the twenty-five existing poses.
  // Keep their render-space cluster local to the gallery; no player or ball state is changed.
  const groupY=1530;
  for(let si=0;si<styles.length;si++){
   const x=si*170;c.fillStyle='#e8eef3';c.fillRect(x,groupY,170,210);c.fillStyle='#203244';c.font='bold 10px system-ui';c.textAlign='center';c.fillText(`TEAM · ${styles[si]}`,x+85,groupY+15);
   g.celebrationStyle=si;r.time=0;const playerHashes=[];
   for(let qi=0;qi<3;qi++){
    const p={...base,i:qi,x:(qi-1)*78,y:0,z:0,dx:0,dy:1,face:1,visualFacing:null,action:'celebrate',anim:0,actionTimer:0,controlled:false,preview:true,keeper:false,stun:0,cryTimer:0};
    c.save();c.translate(x+85,groupY+198);c.scale(.62,.62);r.drawPlayer(c,p,{getTeam:()=>g.getTeam(base.t),options:{showNames:false,reducedFlash:false},celebrationStyle:si});c.restore();
    const sx=x+85+(qi-1)*48-23,sy=groupY+27,d=c.getImageData(sx,sy,46,185).data;let h=2166136261,opaque=0;
    for(let q=0;q<d.length;q+=4){if(d[q+3]>16)opaque++;h=Math.imul(h^d[q]^d[q+1]<<8^d[q+2]<<16^d[q+3],16777619)>>>0;}
    if(opaque<350)throw Error(`blank/clipped group teammate ${si}/${qi}: ${opaque}`);
    playerHashes.push(h);
   }
   const unique=new Set(playerHashes).size;if(unique!==3)throw Error(`teammates share a pose in ${styles[si]}: ${unique}`);teammateDistinctByStyle.push(unique);
  }
  const cryCanvas=document.createElement('canvas');cryCanvas.width=2550;cryCanvas.height=1600;cryCanvas.id='disappointment-reaction-gallery';
  cryCanvas.style.cssText='position:fixed;left:10px;top:10px;width:2550px;height:1600px;z-index:1000001;background:#e8eef3';
  const cc=cryCanvas.getContext('2d',{willReadFrequently:true});cc.fillStyle='#e8eef3';cc.fillRect(0,0,2550,1600);
  const reactions=['HANDS TO HEAD','SHOULDERS DROPPED','WIPE TEARS','PALMS UP','ARMS FOLDED','TURN AWAY','FRUSTRATED CLAP','POINT TO GROUND','COVER FACE','PROTEST TO REF','CLUTCH CHEST','DISBELIEF SPREAD','HANDS ON HIPS','ONE-ARM SHRUG','TEMPLE PRESS'];
  for(let vi=0;vi<views.length;vi++)for(let si=0;si<reactions.length;si++){
   const [label,dx,dy]=views[vi],x=si*170,y=vi*200;cc.fillStyle='#e8eef3';cc.fillRect(x,y,170,200);
   cc.fillStyle='#203244';cc.font='bold 10px system-ui';cc.textAlign='center';cc.fillText(reactions[si],x+85,y+16);
   cc.save();cc.translate(x+85,y+173);g.celebrationStyle=si;r.time=.43;
   const p={...base,x:0,y:0,z:0,dx,dy,face:dx<0?-1:1,visualFacing:null,action:'cry',anim:0,actionTimer:0,controlled:false,preview:true,keeper:false,stun:0,cryTimer:1};
   r.drawPlayer(cc,p,{getTeam:()=>g.getTeam(base.t),options:{showNames:false,reducedFlash:false},celebrationStyle:si});cc.restore();
   const d=cc.getImageData(x,y,170,200).data;let h=2166136261,opaque=0,minX=170,minY=200,maxX=-1,maxY=-1;
   for(let q=0;q<d.length;q+=4){const isBackground=d[q]===232&&d[q+1]===238&&d[q+2]===243,pixel=q>>2,px=pixel%170,py=(pixel/170)|0;if(d[q+3]>16&&!isBackground&&px<162&&py>=24){opaque++;minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);}if(py>=24)h=Math.imul(h^d[q]^d[q+1]<<8^d[q+2]<<16^d[q+3],16777619)>>>0;}
   if(opaque<700||minX<8||maxX>161||minY<10||maxY>198)throw Error(`blank/clipped reaction ${label} ${reactions[si]} bounds ${[minX,minY,maxX,maxY]} px ${opaque}`);
   cryHashes.push({view:label,style:si,hash:h});
  }
  document.body.append(cryCanvas);
 } finally {r.time=original.time;g.celebrationStyle=original.celebrationStyle;}
 document.body.append(canvas);
 const distinctByView=views.map((v,i)=>new Set(hashes.filter(h=>h.view===v[0]).map(h=>h.hash)).size);
 if(distinctByView.some(n=>n!==25))throw Error('celebration styles did not produce twenty-five distinct renders per facing '+JSON.stringify(distinctByView));
 const cryDistinctByView=views.map(v=>new Set(cryHashes.filter(h=>h.view===v[0]).map(h=>h.hash)).size);
 if(cryDistinctByView.some(n=>n!==15))throw Error('disappointment reactions did not produce fifteen distinct renders per facing '+JSON.stringify(cryDistinctByView));
 const sameBall=JSON.stringify({x:g.ball.x,y:g.ball.y,z:g.ball.z,vx:g.ball.vx,vy:g.ball.vy,vz:g.ball.vz})===original.ball;
 const samePlayer=JSON.stringify({x:base.x,y:base.y,z:base.z,dx:base.dx,dy:base.dy,action:base.action})===original.player;
 if(!sameBall||!samePlayer)throw Error('preview mutated live physics/player state');
 return {views:views.map(v=>v[0]),styles,samples,distinctByView,teammateDistinctByStyle,crySamples:cryHashes.length,cryDistinctByView,physicsAndPlayerUnchanged:true};
}'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':4300,'height':1800});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer',timeout=60000)
 result=page.evaluate(JS);page.locator('#celebration-player-gallery').screenshot(path=str(OUT),timeout=30000);page.locator('#disappointment-reaction-gallery').evaluate("e=>e.style.zIndex='1000003'");page.locator('#disappointment-reaction-gallery').screenshot(path=str(CRY_OUT),timeout=30000)
 assert result['samples']==200 and result['distinctByView']==[25]*8 and result['teammateDistinctByStyle']==[3]*25 and result['crySamples']==120 and result['cryDistinctByView']==[15]*8,result
 assert not errors,errors
 browser.close();print({**result,'preview':str(OUT),'reactionPreview':str(CRY_OUT),'pageErrors':errors})
