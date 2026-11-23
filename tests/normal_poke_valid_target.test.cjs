'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const methodStart=source.indexOf(' tackle(p,slide=false,slideBall=null){');
const selectStart=source.indexOf('  const canSlideTarget=',methodStart);
const selectEnd=source.indexOf('  // Lead a moving ball carrier',selectStart);
assert.ok(methodStart>=0&&selectStart>methodStart&&selectEnd>selectStart,'locate production tackle target selection');
const selection=source.slice(selectStart,selectEnd);
const choose=vm.runInNewContext('(function(p,slide){'+selection+'return {near,owner,target};})',{
 distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)
});
const player=(overrides={})=>({t:1,x:150,y:100,stun:0,invuln:0,down:false,action:'idle',...overrides});
const defender={t:0,x:100,y:100,dx:1,dy:0,face:1};
function select(players,owner,slide=false){
 return choose.call({players:[defender,...players],ball:{owner}},defender,slide);
}
test('PASS poke skips an invulnerable carrier and chooses the next reachable active defender',()=>{
 const protectedCarrier=player({x:175,invuln:1});
 const available=player({x:140});
 const result=select([protectedCarrier,available],protectedCarrier,false);
 assert.equal(result.owner,null);
 assert.equal(result.near.includes(protectedCarrier),false);
 assert.equal(result.target,available);
});
test('PASS poke skips downed and getting-up candidates without losing a live receiver',()=>{
 for(const state of [{down:true},{action:'shotDown'},{action:'shotGetUp'}]){
  const unavailable=player({x:135,...state});
  const available=player({x:165});
  const result=select([unavailable,available],unavailable,false);
  assert.equal(result.near.includes(unavailable),false);
  assert.equal(result.target,available);
 }
});
test('a live opponent carrier remains the preferred PASS-poke target',()=>{
 const carrier=player({x:175});
 const closer=player({x:135});
 const result=select([closer,carrier],carrier,false);
 assert.equal(result.owner,carrier);
 assert.equal(result.target,carrier);
});
test('SHOOT slide retains its stricter existing target eligibility',()=>{
 const protectedCarrier=player({x:175,invuln:1});
 const airborne=player({x:135,z:35});
 const available=player({x:165});
 const result=select([protectedCarrier,airborne,available],protectedCarrier,true);
 assert.equal(result.owner,null);
 assert.equal(result.near.includes(protectedCarrier),false);
 assert.equal(result.near.includes(airborne),false);
 assert.equal(result.target,available);
});
