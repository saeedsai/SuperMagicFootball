const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const engine=fs.readFileSync(path.join(__dirname,'..','src/modules/engine.js'),'utf8');
test('only active opposing shots get a save event when keeper collects loose ball',()=>{
 const point=engine.indexOf("if(p.keeper&&b.attacker===p.t&&Math.hypot(b.vx,b.vy)>480)");
 assert(point>=0);
 const block=engine.slice(point,point+720);
 assert.match(block,/liveOpposingShot=b\.attacker===1-p\.t&&!!\(b\.ordinaryShot\|\|b\.shot\|\|b\.strike\)/);
 assert.match(block,/if\(this\.keeperCollect\(p,'loose'\)&&liveOpposingShot\)this\.emit\('save'/);
 assert.ok(block.indexOf('liveOpposingShot=')<block.indexOf("this.keeperCollect(p,'loose')"),
  'classification must precede keeperCollect mutation');
 assert.match(engine,/this\.emit\('keeperContact'/,'genuine diving saves retain physical contact event');
});
