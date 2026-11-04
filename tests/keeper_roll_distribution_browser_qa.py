#!/usr/bin/env python3
"""Real Versus GameEngine: the existing DRIBBLE action gives a human keeper a low safe roll."""
from pathlib import Path
import base64
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(), 'Run python3 scripts/build.py before browser tests'
HTML=fixture.read_text(encoding='utf8')
preview=ROOT/'tests/.generated/keeper_roll_release_pose.png'

JS=r"""() => {
 const api=window.SupermagicFootball,g=api.game;
 if(g.matchState!=='play'||g.humans!==2)throw Error('Local Versus not started');
 const identity=JSON.stringify({teamIds:g.teamIds,rosters:g.rosters.map(r=>r.map(p=>p.id)),score:g.score});
 const results=[],releasePhases=[.42,.315,.21,.105,0],releaseHashes=[];
 const releaseCanvas=document.createElement('canvas');releaseCanvas.width=1200;releaseCanvas.height=420;
 const releaseCtx=releaseCanvas.getContext('2d');releaseCtx.fillStyle='#e8eef3';releaseCtx.fillRect(0,0,1200,420);
 for(const t of [0,1]){
   const dir=t===0?1:-1;
   const keeper=g.players.find(p=>p.t===t&&p.keeper);
   const player=g.players.find(p=>p.t===t&&!p.keeper);
   const target=g.players.find(p=>p.t===t&&!p.keeper&&p!==player);
   if(!keeper||!player||!target)throw Error('Initial team missing players');
   // Deterministically place the real on-field players so one back-line lane
   // is safe while the others are beyond the short-roll range.
   const ox=keeper.x, oy=keeper.y;
   for(const q of g.players){
     if(q!==keeper&&q!==target){
       q.x=ox+dir*(q.t===t?1300:1050);q.y=oy+350;
     }
   }
   target.x=ox+dir*410;target.y=oy+35;target.z=0;target.stun=0;
   keeper.stun=0;keeper.z=0;
   g.keeperCollect(keeper,'loose');
   if(g.ball.owner!==keeper)throw Error('Real catch was not held');
   const eventStart=g.events.length;
   g.command(player,'dribble');
   const events=g.events.slice(eventStart).filter(e=>e.type==='keeperDistribution'||e.type==='passIntent');
   results.push({side:t,roll:events.length===2&&events[0].mode==='roll'&&
     events[1].mode==='roll'&&events[1].loft==='ground',
     releaseDuration:keeper.keeperReleasePoseDuration,
     target:g.ball.passTarget,expected:target.src.id,
     team:g.ball.passTeam,from:g.ball.passFrom,
     owner:g.ball.owner===null,z:g.ball.z,
     forward:g.ball.vx*dir>0,events:events.map(e=>e.type)});
   releasePhases.forEach((remaining,frame)=>{
     const x=frame*240,y=t*210;
     releaseCtx.fillStyle='#e8eef3';releaseCtx.fillRect(x,y,240,210);
     releaseCtx.fillStyle='#183247';releaseCtx.font='bold 13px sans-serif';releaseCtx.textAlign='center';
     releaseCtx.fillText(['RELEASE','EARLY','MID','LATE','FOLLOW'][frame],x+120,y+16);
     releaseCtx.save();releaseCtx.translate(x+120,y+184);
     const visual={...keeper,x:0,y:0,face:dir,dx:dir,dy:0,visualFacing:{kind:'side',side:dir},
       action:'keeperThrow',actionTimer:remaining,keeperReleasePoseDuration:.42,preview:true,
       controlled:false,stun:0,cryTimer:0,anim:0,z:0,vz:0};
     api.renderer.drawPlayer(releaseCtx,visual,g);releaseCtx.restore();
     const pixels=releaseCtx.getImageData(x,y+32,240,178).data;let checksum=0,playerPixels=0;
     for(let k=0;k<pixels.length;k+=4){
       checksum=(checksum+pixels[k]*(k+1)+pixels[k+1]*(k+2)+pixels[k+2]*(k+3)+pixels[k+3]*(k+4))%9007199254740881;
       if(pixels[k+3]>32&&(pixels[k]!==232||pixels[k+1]!==238||pixels[k+2]!==243))playerPixels++;
     }
     releaseHashes.push({side:t,frame,checksum,playerPixels});
   });
   // Fail-closed case: no safe teammate. Catch again, close the passing lane.
   g.keeperCollect(keeper,'loose');
   // All active defenders close the corridor: do not rely on a random
   // opening-match defender's stun/cooldown state.
   for(const blocking of g.players.filter(q=>q.t!==t&&!q.keeper)){
     blocking.x=ox+dir*205;blocking.y=oy+17;blocking.stun=0;
   }
   const lane=g.keeperPassingLane(keeper,target);
   const heldBefore=g.ball.owner===keeper;
   const old=g.events.length;
   g.command(player,'dribble');
   results[results.length-1].blocked=heldBefore&&!lane.clear&&
     g.ball.owner===keeper&&g.events.length===old;
   results[results.length-1].blockedTrace={heldBefore,lane,
     heldAfter:g.ball.owner===keeper,additional:g.events.slice(old).map(e=>e.type)};
 }
 const phaseSamples=[0,1].map(side=>releaseHashes.filter(v=>v.side===side));
 const phaseHashes=phaseSamples.map(samples=>samples.map(v=>v.checksum));
 const phaseCounts=phaseHashes.map(hashes=>new Set(hashes).size);
 const visiblePixels=phaseSamples.map(samples=>samples.map(v=>v.playerPixels));
 return {results,phaseCounts,phaseHashes,visiblePixels,releasePreview:releaseCanvas.toDataURL('image/png'),identityUnchanged:identity===JSON.stringify({
     teamIds:g.teamIds,rosters:g.rosters.map(r=>r.map(p=>p.id)),score:g.score}),
   buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
   state:g.matchState};
}"""

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
   args=['--no-sandbox','--disable-dev-shm-usage'])
 # One real renderer pass is enough here: both teams/headings are checked in
 # this gallery; the existing match UI touch checks remain unchanged.
 for label,touch in [('desktop',False)]:
  context=browser.new_context(viewport={'width':844 if touch else 1280,'height':390 if touch else 720},
   is_mobile=touch,has_touch=touch)
  page=context.new_page();page.set_default_timeout(90000)
  errors=[]
  page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(HTML,wait_until='commit')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navQuick','navOnDevice','versus','kickoff'):
   page.locator('[data-action="'+action+'"]').first.click()
  data=page.evaluate(JS)
  assert data['state']=='play',(label,data)
  assert data['buttons']==4 and data['identityUnchanged'],(label,data)
  for r in data['results']:
   assert r['roll'] and r['target']==r['expected'],(label,r)
   assert r['owner'] and r['team']==r['side'] and r['z']<=15,(label,r)
   assert r['forward'] and r['blocked'],(label,r)
   assert r['releaseDuration']==.42,(label,r)
  assert [r['side'] for r in data['results']]==[0,1],(label,data)
  assert all(count>=4 for count in data['phaseCounts']),('keeper roll release frames are not distinct at game scale for both sides',data['phaseCounts'])
  assert all(len(set(hashes))>=4 and hashes[0]!=hashes[-1] for hashes in data['phaseHashes']),('release and follow-through are not visibly distinct',data['phaseHashes'])
  assert all(min(samples)>250 for samples in data['visiblePixels']),('actual keeper render is blank',data['visiblePixels'])
  assert not errors,(label,errors)
  print('KEEPER_ROLL_DISTRIBUTION_BROWSER_PASS',label,
   'P1/P2 safe rolling pass, 4+ distinct rendered phases per side, guarded lane, untouched teams and four buttons',data['phaseCounts'],flush=True)
  preview.parent.mkdir(parents=True,exist_ok=True)
  preview.write_bytes(base64.b64decode(data['releasePreview'].split(',',1)[1]))
  context.close()
 browser.close()
