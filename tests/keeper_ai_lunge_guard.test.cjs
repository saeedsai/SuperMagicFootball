/** GK-LUNGE-FAIRNESS: simultaneous AI tracking must not bypass a dive's physical limit. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const drive=source.slice(source.indexOf(' driveAI(p,dt){'),source.indexOf(' updateBall(dt){'));
test('AI goalkeeper stops ordinary position tracking while bounded diving intent owns motion',()=>{
 assert(drive.startsWith(' driveAI(p,dt){'));
 const guard=drive.indexOf("p.keeper&&p.diveIntentPending&&p.action==='keeperDive'");
 const planning=drive.indexOf('const ai=aiTuning(this.cpuLevel(p))');
 const move=drive.indexOf('this.moveAgile(p,dx/d,dy/d,step,dt)');
 assert(guard>0&&guard<planning&&planning<move,
   'guard must precede all keeper AI pursuit/moveAgile calls');
 const beforePlanning=drive.slice(0,planning);
 assert.match(beforePlanning,/p.moveVX=0;p.moveVY=0;p.dx=0;p.dy=0;\s*return;/);
});
test('original save contact and capped dive remain separate, with no shortcut to saves',()=>{
 const intent=source.slice(source.indexOf(' tryKeeperDiveIntent(p){'),source.indexOf(' advanceKeeperDive(p,dt){'));
 const lunge=source.slice(source.indexOf(' advanceKeeperDive(p,dt){'),source.indexOf(' tryKeeperDive(p,manual=false){'));
 const save=source.slice(source.indexOf(' tryKeeperDive(p,manual=false){'),source.indexOf(' superBreakerApproaching(keeper,b){'));
 assert.match(intent,/p.diveIntentPending=true;p.diveAdvanceTravel=0/);
 assert.match(lunge,/Math.min\(28,/);
 assert.match(lunge,/p.y=next;p.diveAdvanceTravel=/);
 assert.doesNotMatch(lunge,/keeperCollect\(|this.emit\('save'|b.owner\s*=/);
 assert.match(save,/contactDepth=Math.min\(reach.x,42\+diving\*\.33\)/);
 assert.match(save,/Math.abs\(dx\)>contactDepth/);
});
