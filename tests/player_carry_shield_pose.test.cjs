'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const artposePath=path.resolve(__dirname,'../src/modules/artpose.js');
const artposePromise=import(pathToFileURL(artposePath).href);
const player=(patch={})=>({t:0,x:100,y:100,face:1,action:'idle',preview:false,keeper:false,
 down:false,stun:0,z:0,dribbleHold:.35,...patch});
const defender=(patch={})=>({t:1,x:45,y:100,z:0,face:1,action:'idle',actionTimer:0,
 down:false,stun:0,invuln:0,slideTimer:0,...patch});
const ballFor=p=>({owner:p,x:p.x+17,y:p.y+12,z:0});

test('held DRIBBLE braces toward a nearby active defender and mirrors the pressure side',async()=>{
 const {ARTPOSE}=await artposePromise;
 const p=player(),left=ARTPOSE.carryShieldPose(p,ballFor(p),[p,defender({x:45})]);
 const right=ARTPOSE.carryShieldPose(p,ballFor(p),[p,defender({x:155})]);
 assert.ok(left.strength>0&&left.strength<=1,JSON.stringify(left));
 assert.ok(right.strength>0&&right.strength<=1,JSON.stringify(right));
 assert.equal(left.side,-1);assert.equal(right.side,1);
 assert.ok(left.lean<0&&right.lean>0);
 assert.equal(left.lean,-right.lean);
 assert.ok(Math.abs(left.lean)<=.095&&Math.abs(right.lean)<=.095);
});

test('only the nearest ready grounded opponent can trigger the carry brace',async()=>{
 const {ARTPOSE}=await artposePromise,p=player(),ball=ballFor(p);
 const down=defender({x:110,down:true}),protectedPlayer=defender({x:120,invuln:.2});
 const nearestReady=defender({x:55});
 const pose=ARTPOSE.carryShieldPose(p,ball,[p,down,protectedPlayer,nearestReady]);
 assert.ok(pose.strength>0);assert.equal(pose.side,-1);
 for(const unavailable of [
  {down:true},{stun:.2},{invuln:.2},{slideTimer:.2},{z:22},
  {action:'slide',actionTimer:.2},{action:'hurt',actionTimer:.2},
  {action:'shotDown'},{action:'shotGetUp'},{shotImpactKnockdownPending:.2},
  {shotImpactKnockdownTimer:.2},{shotImpactRiseTimer:.2}
 ]){
  const rejected=ARTPOSE.carryShieldPose(p,ball,[p,defender(unavailable)]);
  assert.equal(rejected.strength,0,JSON.stringify(unavailable));
  assert.equal(rejected.lean,0);
 }
});

test('carry brace is neutral without a held dribble, owned close ball, grounded carrier or live opponent',async()=>{
 const {ARTPOSE}=await artposePromise,p=player(),ball=ballFor(p),q=defender();
 const neutral=()=>({lean:0,side:0,strength:0});
 assert.deepEqual(ARTPOSE.carryShieldPose({...p,dribbleHold:.119},ball,[p,q]),neutral());
 assert.deepEqual(ARTPOSE.carryShieldPose(p,{...ball,owner:null},[p,q]),neutral());
 assert.deepEqual(ARTPOSE.carryShieldPose(p,{...ball,x:p.x+39},[p,q]),neutral());
 assert.deepEqual(ARTPOSE.carryShieldPose({...p,action:'pass'},ball,[p,q]),neutral());
 assert.deepEqual(ARTPOSE.carryShieldPose({...p,preview:true},ball,[p,q]),neutral());
 assert.deepEqual(ARTPOSE.carryShieldPose({...p,z:20},ball,[p,q]),neutral());
 assert.deepEqual(ARTPOSE.carryShieldPose(p,ball,[p]),neutral());
});

test('carry brace reads frozen inputs without mutating player, ball or opponents',async()=>{
 const {ARTPOSE}=await artposePromise;
 const p=Object.freeze(player()),q=Object.freeze(defender()),ball=Object.freeze(ballFor(p));
 const players=Object.freeze([p,q]),before=JSON.stringify({p,q,ball});
 assert.doesNotThrow(()=>ARTPOSE.carryShieldPose(p,ball,players));
 assert.equal(JSON.stringify({p,q,ball}),before);
});

test('production renderer forwards the mirrored brace to the existing procedural character painter',()=>{
 const render=fs.readFileSync(path.resolve(__dirname,'../src/modules/render.js'),'utf8');
 const art=fs.readFileSync(path.resolve(__dirname,'../src/modules/characterart.js'),'utf8');
 assert.match(render,/ARTPOSE\.carryShieldPose\(p,game\.ball,game\.players\)/);
 assert.match(render,/carryShieldLean:carryShield\.lean\*view\.side/);
 assert.match(render,/carryShieldSide:carryShield\.side\*view\.side,carryShieldStrength:carryShield\.strength/);
 assert.match(art,/const shieldLean=clamp\(Number\(opt\.carryShieldLean\)\|\|0,-\.095,\.095\)/);
 assert.match(art,/if\(shieldArm>0\)\{elbow\[0\]\+=sign\*4\.5\*shieldArm/);
 assert.match(art,/if\(shieldLean\)\{c\.translate\(0,-24\);c\.rotate\(shieldLean\);c\.translate\(0,24\)\}/);
});
