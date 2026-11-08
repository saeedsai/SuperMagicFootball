const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

// Execute the production renderer's visibility decision, not a test reimplementation.
const render=fs.readFileSync(path.join(__dirname,'../src/modules/render.js'),'utf8');
const match=render.match(/function shouldShowBreathRing\(p,game,inMatchDraw\)\{[\s\S]*?\n\}/);
test('Breath visibility follows the local seat across host/guest handoffs',()=>{
 assert.ok(match,'renderer predicate must exist');
 const visible=vm.runInNewContext('('+match[0]+')');
 const home=[{t:0,i:1},{t:0,i:2}],away=[{t:1,i:1},{t:1,i:2}];
 const selected=[home[0],away[0]];
 const game={humans:2,localBreathSide:0,inControl(t){return this.humans===2||t===0;},
  controlledPlayer(t){return selected[t];}};
 const players=[...home,...away];
 const rings=()=>players.filter(p=>visible(p,game,true));
 for(const seat of [0,1,0,1]){
  game.localBreathSide=seat;
  assert.deepEqual(rings(),[selected[seat]],'only current local selection can show Breath');
  selected[seat]=seat===0?home[1]:away[1];
  assert.deepEqual(rings(),[selected[seat]],'switch removes old ring in same frame');
  selected[seat]=null;
  assert.equal(rings().length,0,'missing selected player must fail closed');
  selected[seat]=seat===0?home[0]:away[0];
 }
 game.localBreathSide=1;game.humans=1;
 assert.equal(rings().length,0,'CPU team must never show local ring');
 assert.equal(players.filter(p=>visible(p,game,false)).length,0,'no match means no rings');
});
