'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const begin=source.indexOf('function keeperReactionReach(');
const end=source.indexOf('\n// Keepers cannot instantly dive again',begin);
assert.ok(begin>=0&&end>begin,'extract production keeper reach');
const reach=vm.runInNewContext(source.slice(begin,end)+';keeperReactionReach',{clamp:(v,a,b)=>Math.min(b,Math.max(a,v)),stat:(p,k)=>p[k]});
const diveWindowBegin=source.indexOf('function keeperDiveReadWindow(');
const diveWindowEnd=source.indexOf("\n// Keepers cannot instantly dive again",diveWindowBegin);
assert.ok(diveWindowBegin>=0&&diveWindowEnd>diveWindowBegin,'extract production fatigue-aware dive window');
const diveWindow=vm.runInNewContext(source.slice(diveWindowBegin,diveWindowEnd)+';keeperDiveReadWindow',{
 clamp:(v,a,b)=>Math.min(b,Math.max(a,v)),stat:(p,k)=>p[k]
});
const keeper={t:0,x:100,gkSkill:70,gkDiving:70,fatigue:0};
const shot=(x,behavior)=>({x,vx:-400,vy:0,shot:behavior?{level:1,behavior}:null});
test('readable ordinary shots permit bounded lateral goalkeeper preparation',()=>{
 const distant=reach(keeper,shot(700));
 const urgent=reach(keeper,shot(180));
 assert.ok(distant.y>urgent.y,'long flight gives keeper preparation time');
 assert.ok(distant.y<=122,'lateral reach remains bounded');
 assert.ok(reach({...keeper,fatigue:1},shot(700)).y<distant.y,'fatigue cannot improve preparation');
});
test('erratic and retreating shots do not gain readable-flight preparation',()=>{
 const ordinary=reach(keeper,shot(700));
 const zigzag=reach(keeper,shot(700,'zigzag'));
 assert.ok(zigzag.y<ordinary.y,'erratic Magic shot is not predictable');
 const retreat=reach(keeper,{x:700,vx:400,vy:0});
 assert.ok(Number.isFinite(retreat.y));
 assert.ok(retreat.y<=116,'retreating ball cannot grant preparation');
});

test('early readable keeper dive intent preserves late read for erratic shots',()=>{
 const engine=fs.readFileSync('src/modules/engine.js','utf8');
 const start=engine.indexOf('tryKeeperDiveIntent(p){');
 const end=engine.indexOf('\n // Physical but tightly bounded late lunge',start);
 assert.ok(start>=0&&end>start);
 const intent=engine.slice(start,end);
 assert.match(intent,/keeperDiveReadWindow\(p,readable\)/,'production intent uses the fatigue-aware read window');
 assert.match(engine,/return 320\+70\*skill-45\*fatigue/,'fatigue shortens only the readable-shot window');
 assert.match(engine,/stat\(keeper,'gkSkill'\)/,'anticipation is tied to keeper skill');
 assert.match(intent,/zigzag.*swim.*warp.*lightning/,'erratic shots remain unpredictable');
 assert.match(intent,/predicted\.time<\.065\|\|predicted\.time>\.46/,'time gate stays bounded');
 assert.match(engine,/remaining<=30\|\|remaining>390/,'early intent can advance through the longer window');
});

test('keeper dive-read window scales with skill and fatigue without changing Magic-shot timing',()=>{
 assert.equal(diveWindow({gkSkill:35,fatigue:0},true),320);
 assert.equal(diveWindow({gkSkill:67.5,fatigue:0},true),355);
 assert.equal(diveWindow({gkSkill:100,fatigue:0},true),390);
 assert.equal(diveWindow({gkSkill:150,fatigue:0},true),390);
 assert.equal(diveWindow({gkSkill:100,fatigue:1},true),345);
 assert.equal(diveWindow({gkSkill:35,fatigue:1},true),275);
 assert.equal(diveWindow({gkSkill:100,fatigue:1},false),320);
});

test('straight-flight Magic shots cannot receive ordinary-shot early dive reads',()=>{
 const engine=fs.readFileSync('src/modules/engine.js','utf8');
 const start=engine.indexOf('tryKeeperDiveIntent(p){');
 const end=engine.indexOf('\n // Physical but tightly bounded late lunge',start);
 const intent=engine.slice(start,end);
 const expression=intent.match(/const readable=([^;]+);/)?.[1];
 assert.ok(expression,'production readable-flight predicate is present');
 const readable=vm.runInNewContext('(b)=>('+expression+')');
 assert.equal(readable({shot:null}),true,'ordinary shots retain skill-based early anticipation');
 assert.equal(readable({shot:{level:1,behavior:'straight'}}),false,'straight Magic shot cannot get the bonus');
 assert.equal(readable({shot:{level:1}}),false,'unspecified Magic trajectory cannot get the bonus');
 assert.equal(readable({shot:{level:1,behavior:'zigzag'}}),false,'erratic Magic shot remains late-read');
});
