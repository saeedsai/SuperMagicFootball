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
