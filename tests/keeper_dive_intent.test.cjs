const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=p=>fs.readFileSync(path.join(root,p),'utf8');
const engine=source('src/modules/engine.js');
test('goalkeeper anticipatory dive does not expand save depth or teleport the ball',()=>{
 const intent=engine.slice(engine.indexOf(' tryKeeperDiveIntent(p){'),engine.indexOf(' tryKeeperDive(p,manual=false){'));
 assert(intent.length>200,'keeper intent method exists');
 for(const fragment of ['predictKeeperShot(p,b)','keeperReactionReach(p,b)','keeperDiveAttempt','p.diveIntentCooldown=1.25','p.diveIntentPending=true']){
  assert(intent.includes(fragment),fragment);
 }
 assert.doesNotMatch(intent,/b\.owner\s*=|b\.x\s*=|b\.y\s*=|b\.vx\s*=|p\.x\s*=|p\.y\s*=|keeperCollect\(/);
 const dive=engine.slice(engine.indexOf(' tryKeeperDive(p,manual=false){'),engine.indexOf(' superBreakerApproaching(keeper,b){'));
 assert.match(dive,/contactDepth=Math\.min\(reach\.x,42\+diving\*\.33\)/);
 assert.match(dive,/Math\.abs\(dx\)>contactDepth/);
});
test('one anticipatory attempt per shot has a recovery while real saves retain cooldown',()=>{
 assert.match(engine,/diveIntentCooldown:0,diveIntentPending:false/);
 assert.match(engine,/p\.diveIntentCooldown=Math\.max\(0,/);
 assert.match(engine,/p\.diveIntentPending=false;p\.diveCooldown=keeperDiveRecoverySeconds\(p\)/);
 assert.match(engine,/p\.diveCooldown>0\|\|p\.diveIntentPending/);
 assert.match(engine,/if\(!this\.tryKeeperDive\(keeper,false\)\)this\.tryKeeperDiveIntent\(keeper\)/);
});
