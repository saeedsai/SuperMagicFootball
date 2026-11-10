const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/render.js'),'utf8');
const match=source.match(/function shouldShowBreathRing\(p,game,inMatchDraw\)\{[\s\S]*?\n\}/);
assert.ok(match,'production renderer predicate must exist');
const visible=new Function(match[0]+';return shouldShowBreathRing')();
function fixture(humans,localBreathSide){
 const a={t:0,i:1},b={t:0,i:2},c={t:1,i:3},d={t:1,i:4};
 const players=[a,b,c,d],controlled=[a,c];
 const game={humans,localBreathSide,inControl:t=>t<humans,controlledPlayer:t=>controlled[t]};
 return {game,players,controlled,a,b,c,d};
}
test('multiplayer with unspecified seat shows no rings',()=>{
 const f=fixture(2,null);
 assert.deepEqual(f.players.filter(p=>visible(p,f.game,true)),[]);
});
test('legacy single-player null seat shows home selected only',()=>{
 const f=fixture(1,null);
 assert.deepEqual(f.players.filter(p=>visible(p,f.game,true)),[f.a]);
});
test('local seat and switching show exactly one ring',()=>{
 const f=fixture(2,1);
 assert.deepEqual(f.players.filter(p=>visible(p,f.game,true)),[f.c]);
 f.controlled[1]=f.d;
 assert.deepEqual(f.players.filter(p=>visible(p,f.game,true)),[f.d]);
 f.game.localBreathSide=0;
 assert.deepEqual(f.players.filter(p=>visible(p,f.game,true)),[f.a]);
 f.controlled[0]=f.b;
 assert.deepEqual(f.players.filter(p=>visible(p,f.game,true)),[f.b]);
});
test('invalid seats, spectators, previews and outside-match never show ring',()=>{
 const f=fixture(2,-1);
 for(const seat of [-1,2,NaN,Infinity,'0']) {
  f.game.localBreathSide=seat;
  assert.equal(f.players.filter(p=>visible(p,f.game,true)).length,0);
 }
 f.game.localBreathSide=0;f.game.humans=0;
 assert.equal(f.players.filter(p=>visible(p,f.game,true)).length,0);
 f.game.humans=1;
 assert.equal(visible({...f.a,preview:true},f.game,true),false);
 assert.equal(visible(f.a,f.game,false),false);
 assert.equal(visible({...f.a},f.game,true),false);
});

test('spectator and malformed local seats cannot expose either selected human',()=>{
 const f=fixture(2,0);
 for(const humans of [0,1,2]) {
  f.game.humans=humans;
  for(const seat of [-1,2,'0','1',false,true,NaN,Infinity,-Infinity,{},[]]) {
   f.game.localBreathSide=seat;
   assert.deepEqual(f.players.filter(p=>visible(p,f.game,true)),[],
    'invalid local seat '+String(seat)+' with '+humans+' humans');
  }
 }
 f.game.humans=0;
 for(const seat of [null,undefined,0,1]) {
  f.game.localBreathSide=seat;
  assert.deepEqual(f.players.filter(p=>visible(p,f.game,true)),[],
   'spectator must not have a ring');
 }
});
