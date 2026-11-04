'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

test('AI difficulty accepts levels and numeric strings while invalid values use Normal',async()=>{
 const source=fs.readFileSync(path.resolve('src/modules/ai.js'),'utf8');
 const start=source.indexOf('function aiTuning(');
 const end=source.indexOf('\n}',start);
 assert(start>=0&&end>start,'AI tuning helper must exist in the active module');
 const AI_LEVELS=JSON.parse(fs.readFileSync(path.resolve('data/mechanics/gameplay.json'),'utf8')).aiLevels;
 const aiTuning=vm.runInNewContext('('+source.slice(start,end+2)+')',{AI_LEVELS});
 assert.deepEqual(AI_LEVELS.map(level=>level.id),[0,1,2,3,4]);
 for(let level=0;level<=4;level++){
  assert.equal(aiTuning(level).id,level);
  assert.equal(aiTuning(String(level)).id,level);
 }
 assert.equal(aiTuning(2.9).id,2,'finite fractional levels retain truncation semantics');
 assert.equal(aiTuning(-100).id,0,'finite values still clamp at Rookie');
 assert.equal(aiTuning(100).id,4,'finite values still clamp at Expert');
 for(const invalid of [undefined,null,false,true,'','   ','nope',NaN,Infinity,-Infinity,{},[],Symbol('difficulty')]){
  assert.equal(aiTuning(invalid).id,2,'invalid difficulty should use Normal');
 }
});
