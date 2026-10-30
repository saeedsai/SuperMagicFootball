const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const formula=engine.match(/const defenceReach=([^;]+);/);
assert.ok(formula,'slide reach must derive from Defence');
const reach=new Function('rating',`return ${formula[1].replace("stat(p,'defence')",'rating')}`);
test('Defence scales slide reach monotonically without exceeding previous maximum',()=>{
 for(const max of [104,148]){
  assert.equal(max*reach(100),max);
  assert.equal(max*reach(1),max*.5);
  for(let rating=2;rating<=100;rating++)assert.ok(max*reach(rating)>max*reach(rating-1));
 }
});
test('slide movement budget uses Defence reach and keeps existing speed/timing',()=>{
 assert.match(engine,/p\.slideRemaining=\(running\?148:104\)\*defenceReach;p\.slideBudget=p\.slideRemaining/);
 assert.match(engine,/p\.slideTimer=running\?\.46:\.34;p\.slideSpeed=\(running\?585:395\)/);
 assert.match(engine,/Math\.min\(p\.slideSpeed\*step,p\.slideRemaining\|\|0\)/);
});
