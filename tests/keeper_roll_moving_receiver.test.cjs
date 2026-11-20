'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf('  const leadX=Number.isFinite(receiver.moveVX)?');
const end=source.indexOf('  this.ball.passTarget=receiver.src.id;',start);
assert.ok(start>=0&&end>start,'roll release lead must be wired into engine');
const release=vm.runInNewContext('(function(p,receiver,speed){let actual;function freeBall(...args){actual=args;}'+source.slice(start,end).replace('this.freeBall(','freeBall(')+'return actual;})');
const keeper={x:100,y:200};
test('rollout leads a moving receiver in both axes',()=>{
 const result=release(keeper,{x:300,y:250,moveVX:100,moveVY:-50},450);
 assert.equal(result[1],214);assert.equal(result[2],43);
 assert.equal(result[3],450);assert.equal(result[4].pass,true);
});
test('rollout caps movement lead to avoid overleading fast runners',()=>{
 const result=release(keeper,{x:300,y:250,moveVX:900,moveVY:-900},450);
 assert.equal(result[1],235);assert.equal(result[2],15);
});
test('stationary or malformed receiver velocity retains original roll direction',()=>{
 for(const v of [{moveVX:0,moveVY:0},{moveVX:NaN,moveVY:Infinity},{}]){
  const result=release(keeper,{x:300,y:250,...v},450);
  assert.equal(result[1],200);assert.equal(result[2],50);
 }
});
