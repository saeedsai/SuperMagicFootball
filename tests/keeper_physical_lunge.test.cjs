/** Keeper physical lunge is deliberately smaller than the legal contact radius. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const engine=read('src/modules/engine.js');
const head=engine.slice(engine.indexOf(' advanceKeeperDive(p,dt){'),engine.indexOf(' tryKeeperDive(p,manual=false){'));
test('physical goalie lunge has capped, fatigue-adjusted and time-limited movement',()=>{
 assert(head.length>300,'real active goalkeeper lunge is present');
 for(const pattern of [/diveIntentPending/,/actionTimer<=\.25/,/diveCooldown>0/,
   /dt>\.1/,/b\.vx\*toward<=160/,/superBreakerApproaching/,
   /predictKeeperShot\(p,b\)/,/Math\.min\(28,/,/1-fatigue\*\.55/,
   /limit-\(p\.diveAdvanceTravel\|\|0\)/,/p\.y=next/,
   /p\.diveAdvanceTravel=/])assert.match(head,pattern);
 assert.doesNotMatch(head,/\bb\.x\s*=|\bb\.owner\s*=|keeperCollect\(|this\.emit\('save'/);
});
test('new keeper lunge is called only for AI, and genuine saves still require depth-plane contact',()=>{
 assert.match(engine,/if\(p\.keeper&&!controlled\)this\.advanceKeeperDive\(p,dt\)/);
 assert.match(engine,/diveIntentCooldown=1\.25;p\.diveIntentPending=true;p\.diveAdvanceTravel=0/);
 assert.match(engine,/diveIntentPending:false,diveAdvanceTravel:0/);
 const actual=engine.slice(engine.indexOf(' tryKeeperDive(p,manual=false){'),engine.indexOf(' superBreakerApproaching(keeper,b){'));
 assert.match(actual,/contactDepth=Math\.min\(reach\.x,42\+diving\*\.33\)/);
 assert.match(actual,/Math\.abs\(dx\)>contactDepth/);
 assert.doesNotMatch(head,/contactDepth=/,'intent must never grant contact or widen save area');
});
