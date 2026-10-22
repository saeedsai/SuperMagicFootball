const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('src/modules/engine.js','utf8');
test('actively closing defenders read trick with bounded bonus',()=>{
 const start=src.indexOf('tryDribbleTrick(p,byAI=false)');
 const end=src.indexOf('const forward=norm(',start);
 assert.ok(start>=0&&end>start,'trick resolution available');
 const body=src.slice(start,end);
 assert.match(body,/const closing=close/);
 assert.match(body,/rival\.dx/);
 assert.match(body,/rival\.dy/);
 assert.match(body,/readBonus=closing\?Math\.min\(\.24/);
 assert.match(body,/Math\.max\(\.08,dribbleOdds\(skill,threat,style\)-readBonus\)/);
 assert.match(body,/const success=!threat/);
});
