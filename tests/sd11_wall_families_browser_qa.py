"""SD11: browser Canvas contact sheet for original procedural wall families."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
SCRIPT=r"""() => {
 const api=window.SupermagicFootball,g=api?.game,r=api?.renderer;if(!g||!r)throw Error('Game renderer unavailable');
 const families=[['magicWall',1],['fireWall',2],['iceWall',3],['demonWall',4]],results=[];
 const canvas=document.createElement('canvas');canvas.id='sd11-wall-gallery';canvas.width=960;canvas.height=560;
 canvas.style.cssText='display:block;position:fixed;z-index:999999;left:10px;top:10px;width:960px;height:560px;border:2px solid white';document.body.appendChild(canvas);
 const ctx=canvas.getContext('2d');ctx.fillStyle='#143d35';ctx.fillRect(0,0,canvas.width,canvas.height);
 const hashes=[];
 const hashRegion=(x,y,w,h)=>{const d=ctx.getImageData(x,y,w,h).data;let n=2166136261;for(let i=0;i<d.length;i+=4){n^=d[i];n=Math.imul(n,16777619);n^=d[i+1];n=Math.imul(n,16777619);n^=d[i+2];n=Math.imul(n,16777619);}return n>>>0;};
 for(const [index,[id,tier]] of families.entries()){
  g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,reducedFlash:false}});
  const p=g.players.find(v=>v.t===0&&!v.keeper&&v.src.role==='DF');if(!p)throw Error('No outfield defender');g.players=[p];
  p.src={...p.src,role:'DF',superDefenceLevel:tier,superAbility:{type:'defence',id,level:tier,name:id}};
  Object.assign(p,{keeper:false,stun:0,abilityCd:0,cd:0,fatigue:0,x:900,y:600,face:1});g.ball.owner=null;g.magicWalls=[];g.supernova=null;
  if(!g.activateDefence(p))throw Error(id+' failed activation');
  const placed=g.magicWalls[0];if(placed.id!==id||placed.arm!==.35||placed.duration!==2.4)throw Error('Shared wall envelope mismatch '+id);
  const x=index*240+120,y=130,art={...placed,x,y,halfLength:85,duration:2.4,arm:0};
  ctx.fillStyle='#183e34';ctx.fillRect(index*240,0,240,270);ctx.fillStyle='#f4f1db';ctx.font='900 18px Arial';ctx.fillText(id.toUpperCase(),index*240+15,30);
  r.drawMagicWalls(ctx,[art],false);hashes.push(hashRegion(index*240,0,240,270));
  const reduced={...art,y:y+280,arm:.35};ctx.fillStyle='#183e34';ctx.fillRect(index*240,280,240,280);ctx.fillStyle='#f4f1db';ctx.fillText('REDUCED FLASH',index*240+15,310);r.drawMagicWalls(ctx,[reduced],true);
  const startX=placed.x,startY=placed.y;g.magicWalls[0].arm=0;
  const opponent={...p,t:1,i:3,keeper:false,x:startX,y:startY,z:0,stun:0,invuln:0,action:'slide',actionTimer:.3,src:{id:'counter',name:'Counter'}};
  g.players=[p,opponent];g.resolveMagicWalls();if(g.magicWalls.length!==0||!g.events.some(e=>e.type==='magicWallCounter'&&e.id===id))throw Error(id+' grounded SHOOT-slide did not counter');
  g.magicWalls=[{...placed,duration:2.4,arm:0}];g.updateMagicWalls(2.5);if(g.magicWalls.length!==0||!g.events.some(e=>e.type==='magicWallExpired'&&e.id===id))throw Error(id+' failed bounded expiry');
  results.push({id,tier,placement:[placed.x,placed.y],duration:placed.duration,counter:true,expires:true,visualHash:hashes.at(-1)});
 }
 if(new Set(hashes).size!==4)throw Error('Wall profiles are not visually distinct '+JSON.stringify(hashes));
 const stable=document.createElement('canvas');stable.width=240;stable.height=280;const sc=stable.getContext('2d');
 const probe={id:'demonWall',x:120,y:130,halfLength:85,thickness:13,height:66,duration:2.4,arm:.35,color:'#bd79e8'};
 sc.fillStyle='#183e34';sc.fillRect(0,0,240,280);r.time=0;r.drawMagicWalls(sc,[probe],true);const first=stable.toDataURL();sc.clearRect(0,0,240,280);sc.fillStyle='#183e34';sc.fillRect(0,0,240,280);r.time=5;r.drawMagicWalls(sc,[probe],true);if(first!==stable.toDataURL())throw Error('Reduced-flash wall changed with renderer time');
 const controls=document.querySelectorAll('#touchButtons button[data-act]').length;if(controls!==4)throw Error('Expected the existing four controls, got '+controls);
 return {results,uniqueVisuals:new Set(hashes).size,reducedFlashSteady:true,controls,canvas:'960x560'};
}"""

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind,mobile in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':1280 if not mobile else 844,'height':720 if not mobile else 390},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(HTML,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.renderer',timeout=30000)
  result=page.evaluate(SCRIPT);assert result['uniqueVisuals']==4 and result['controls']==4,result
  assert not errors,errors
  if not mobile:page.locator('#sd11-wall-gallery').screenshot(path=str(ROOT/'tests/.generated/sd11_wall_families_gallery.png'))
  print('SD11_WALL_FAMILIES_BROWSER_PASS',kind,result,flush=True);context.close()
 browser.close()
