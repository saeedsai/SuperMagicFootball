"""Actual-renderer 64px normal/double-jump poses, mirrored and reduced-flash checked."""
from pathlib import Path
import base64
import json
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
fixture=root/'tests/.generated/play.html'
output=root/'docs/evidence/browser/player_jump_air_pose_64px_20261105_review.png'
metrics_output=root/'docs/evidence/browser/player_jump_air_pose_64px_20261105_review_metrics.json'
if output.exists():
    raise SystemExit(f'refusing to overwrite existing evidence: {output}')
if metrics_output.exists():
    raise SystemExit(f'refusing to overwrite existing evidence: {metrics_output}')
if not fixture.exists():
    raise SystemExit('missing tests/.generated/play.html; run python -X utf8 scripts/build.py first')

script=r'''()=>{
 const api=window.SupermagicFootball,renderer=api.renderer,game=api.game;
 const base=game.players.find(p=>!p.keeper&&p.src);
 if(!base)throw Error('production roster player unavailable');
 const views=[
  {name:'front+',dx:50,dy:260,kind:'front',side:1},
  {name:'quarter+',dx:184,dy:184,kind:'quarterFront',side:1},
  {name:'profile+',dx:260,dy:0,kind:'side',side:1},
  {name:'front-',dx:-50,dy:260,kind:'front',side:-1},
  {name:'quarter-',dx:-184,dy:184,kind:'quarterFront',side:-1},
  {name:'profile-',dx:-260,dy:0,kind:'side',side:-1}
 ];
 const rows=[
  {name:'ground',action:'idle',z:0,vz:0,jumpCount:0,actionTimer:0,anim:0},
  {name:'normal takeoff',action:'jump',z:2,vz:420,jumpCount:1,actionTimer:.5,anim:.30},
  {name:'normal rise',action:'jump',z:38,vz:220,jumpCount:1,actionTimer:.18,anim:.30},
  {name:'normal apex',action:'idle',z:82,vz:0,jumpCount:1,actionTimer:0,anim:.30},
  {name:'normal descent',action:'idle',z:36,vz:-300,jumpCount:1,actionTimer:0,anim:.30},
  {name:'double takeoff',action:'doubleJump',z:32,vz:535,jumpCount:2,actionTimer:.5,anim:.30},
  {name:'double rise',action:'doubleJump',z:90,vz:300,jumpCount:2,actionTimer:.18,anim:.30},
  {name:'double apex',action:'idle',z:150,vz:0,jumpCount:2,actionTimer:0,anim:.30},
  {name:'double descent',action:'idle',z:46,vz:-330,jumpCount:2,actionTimer:0,anim:.30}
 ];
 const canvas=document.createElement('canvas');canvas.width=576;canvas.height=rows.length*200;canvas.id='playerJumpAirProof';
 const c=canvas.getContext('2d');c.fillStyle='#dfe8f0';c.fillRect(0,0,canvas.width,canvas.height);
 const snapshots=[],deltaSummary=[],flashChecks=[];
 const ball=game.ball,ballState=()=>JSON.stringify({x:ball.x,y:ball.y,z:ball.z,vx:ball.vx,vy:ball.vy,vz:ball.vz,owner:ball.owner?.src?.id??null,attacker:ball.attacker});
 const draw=(ctx,p,view,reducedFlash)=>renderer.drawPlayer(ctx,p,{
  getTeam:game.getTeam.bind(game),options:{...(game.options||{}),showNames:false,reducedFlash},
  celebrationStyle:game.celebrationStyle,ball,terrain:game.terrain,condition:game.condition
 });
 const allPixels=[];
 for(let r=0;r<rows.length;r++){
  const phase=rows[r],y=r*200;
  for(let col=0;col<views.length;col++){
   const view=views[col],x=col*96;
   c.fillStyle='#f9fbfd';c.fillRect(x+1,y+1,94,198);
   c.fillStyle='#203244';c.font='bold 9px Arial';c.textAlign='center';c.fillText(`${view.name} · ${phase.name}`,x+48,y+11);
   c.strokeStyle='#a8b7c5';c.lineWidth=1;c.beginPath();c.moveTo(x+8,y+178);c.lineTo(x+88,y+178);c.stroke();
   const p={...base,src:base.src,t:base.t,i:0,keeper:false,x:0,y:0,z:phase.z,vz:phase.vz,jumpCount:phase.jumpCount,
    action:phase.action,actionTimer:phase.actionTimer,anim:phase.anim,dx:view.dx,dy:view.dy,moveVX:view.dx,moveVY:view.dy,
    face:1,visualFacing:{kind:view.kind,side:view.side},controlled:false,preview:false,stun:0,cryTimer:0,firstTouchFx:0,
    turnLag:0,shotImpactKnockdownTimer:0,shotImpactConfusedTimer:0,shotImpactWeaknessTimer:0,spinBumpFx:0,fireballBurnFx:0};
   const state=()=>JSON.stringify({x:p.x,y:p.y,z:p.z,vz:p.vz,jumpCount:p.jumpCount,action:p.action,actionTimer:p.actionTimer,
    dx:p.dx,dy:p.dy,moveVX:p.moveVX,moveVY:p.moveVY,anim:p.anim,breath:p.breath,fatigue:p.fatigue,preview:p.preview,visualFacing:p.visualFacing});
   const playerBefore=state(),ballBefore=ballState(),start=c.getImageData(x,y,96,96).data;
   c.save();c.translate(x+48,y+178);c.scale(.52,.52);draw(c,p,view,true);c.restore();
   const afterPixels=c.getImageData(x,y,96,200).data;
   const pixels=Array.from(afterPixels);
   let minY=200,maxY=-1,painted=0;
   for(let py=16;py<176;py++)for(let px=4;px<92;px++){const k=(py*96+px)*4;if(pixels[k]!==249||pixels[k+1]!==251||pixels[k+2]!==253){minY=Math.min(minY,py);maxY=Math.max(maxY,py);painted++;}}
   snapshots.push({view:view.name,phase:phase.name,preview:p.preview,unchanged:playerBefore===state(),ballUnchanged:ballBefore===ballState(),
    z:p.z,vz:p.vz,jumpCount:p.jumpCount,paintedPixels:painted,renderedBoundsHeight:maxY>=minY?maxY-minY+1:0,
    unshiftedCharacterHeight:maxY>=minY?maxY-minY+1-Math.round(p.z*.52):0});
   allPixels.push({row:r,col,data:pixels});
   if(r===0||r===3||r===7){
    c.clearRect(x,y,96,200);c.fillStyle='#dfe8f0';c.fillRect(x,y,96,200);c.fillStyle='#f9fbfd';c.fillRect(x+1,y+1,94,198);
    c.fillStyle='#203244';c.font='bold 9px Arial';c.textAlign='center';c.fillText(`${view.name} · ${phase.name}`,x+48,y+11);
    c.strokeStyle='#a8b7c5';c.lineWidth=1;c.beginPath();c.moveTo(x+8,y+178);c.lineTo(x+88,y+178);c.stroke();
    const q={...p,visualFacing:{...p.visualFacing}};c.save();c.translate(x+48,y+178);c.scale(.52,.52);draw(c,q,view,true);c.restore();
    const repeated=c.getImageData(x,y,96,200).data;let changed=0;
    for(let k=0;k<afterPixels.length;k+=4)if(afterPixels[k]!==repeated[k]||afterPixels[k+1]!==repeated[k+1]||afterPixels[k+2]!==repeated[k+2])changed++;
    flashChecks.push({view:view.name,phase:phase.name,reducedFlashRepeatPixelDelta:changed});
   }
  }
 }
 for(let col=0;col<views.length;col++)for(const [r1,r2,label] of [[0,3,'normal apex vs ground'],[0,7,'double apex vs ground']]){
  const a=allPixels[r1*6+col].data,b=allPixels[r2*6+col].data;let changed=0,painted=0;
  for(let y=16;y<200;y++)for(let x=0;x<96;x++){const k=(y*96+x)*4;
   if(a[k]!==b[k]||a[k+1]!==b[k+1]||a[k+2]!==b[k+2])changed++;
   if(b[k]!==249||b[k+1]!==251||b[k+2]!==253)painted++;
  }
  deltaSummary.push({view:views[col].name,comparison:label,changedPixels:changed,apexPaintedPixels:painted});
 }
 document.body.append(canvas);
 return {sheet:[canvas.width,canvas.height],nominalPlayerHeightPx:64,rows:rows.map(x=>x.name),views:views.map(x=>x.name),snapshots,deltaSummary,flashChecks};
}'''

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':720,'height':940},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(fixture.read_text(encoding='utf-8'),wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer && !!window.SupermagicFootball?.game?.players?.length',timeout=30000)
    report=page.evaluate(script)
    report['browserErrors']=errors
    if errors:raise AssertionError(errors)
    if any(not s['unchanged'] or not s['ballUnchanged'] for s in report['snapshots']):raise AssertionError('player or ball state changed during drawing')
    if any(s['preview'] for s in report['snapshots']):raise AssertionError('QA must exercise preview:false production match path')
    if any(x['reducedFlashRepeatPixelDelta']>4 for x in report['flashChecks']):raise AssertionError(report['flashChecks'])
    if any(x['changedPixels']<80 or x['apexPaintedPixels']<250 for x in report['deltaSummary']):raise AssertionError(report['deltaSummary'])
    if any(x['unshiftedCharacterHeight']<50 or x['unshiftedCharacterHeight']>75 for x in report['snapshots']):raise AssertionError('character should remain approximately 64px high independently of jump travel',report['snapshots'])
    png=page.evaluate("document.querySelector('#playerJumpAirProof').toDataURL('image/png')")
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_bytes(base64.b64decode(png.split(',',1)[1]))
    report['evidence']=str(output)
    report['metricsEvidence']=str(metrics_output)
    metrics_output.write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report,indent=2))
    browser.close()
