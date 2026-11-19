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
 assert.match(intent,/320\+70\*clamp/,'readable shots gain a skill-scaled longer intent window');
 assert.match(intent,/readable\?320\+70/,'erratic shots retain the original 320-unit window');
 assert.match(intent,/stat\(p,'gkSkill'\)/,'anticipation is tied to keeper skill');
 assert.match(intent,/zigzag.*swim.*warp.*lightning/,'erratic shots remain unpredictable');
 assert.match(intent,/predicted\.time<\.065\|\|predicted\.time>\.46/,'time gate stays bounded');
 assert.match(engine,/remaining<=30\|\|remaining>390/,'early intent can advance through the longer window');
});

test('skill-scaled keeper read window is bounded and distinguishes Magic shots',()=>{
 const window=(skill,readable)=>readable?320+70*Math.min(1,Math.max(0,(skill-35)/65)):320;
 assert.equal(window(35,true),320);
 assert.equal(window(67.5,true),355);
 assert.equal(window(100,true),390);
 assert.equal(window(150,true),390);
 assert.equal(window(100,false),320);
});
