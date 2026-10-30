const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const render=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/render.js'),'utf8');
test('slide pose enters, extends and recovers with travel progress',()=>{
 assert.match(render,/const entry=clamp\(\(1-remaining\)\/\.22,0,1\)/);
 assert.match(render,/const recovery=p\.slideTimer>0\?1:clamp/);
 assert.match(render,/ctx\.translate\(8\*pose,15\*pose\);ctx\.rotate\(-\.62\*pose\)/);
});
test('turf spray is match-only and uses actual slide heading',()=>{
 assert.match(render,/if\(sliding&&this\.inMatchDraw&&!p\.preview&&p\.slideTimer>0\)/);
 assert.match(render,/const dx=p\.slideDX\|\|p\.face\|\|1,dy=p\.slideDY\|\|0/);
 assert.match(render,/game\.terrain==='Dirt'/);
});
