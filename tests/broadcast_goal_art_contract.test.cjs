'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../src/modules/render.js'),'utf8');
const first=src.indexOf(' drawGoalCelebration(ctx,game){'),last=src.indexOf(' drawStands(ctx){',first);
assert.ok(first>0&&last>first,'live renderer celebration function is present');
const draw=Function('return ({'+src.slice(first,last)+'}).drawGoalCelebration')();
function context(){const calls=[],gradients=[],ctx={calls,gradients};for(const n of ['save','restore','beginPath','roundRect','arc','fill','stroke','translate','rotate','fillText','fillRect'])ctx[n]=(...a)=>calls.push([n,...a]);for(const n of ['createLinearGradient'])ctx[n]=(...a)=>{const g={stops:[],addColorStop:(k,c)=>g.stops.push([k,c])};gradients.push(g);return g};return ctx}
const match=(celebration=2.5,more={})=>({pendingKickoff:{scorer:1},getTeam:side=>({name:'Crown Royals',primary:'#2244cc',secondary:'#facc55'}),goalHero:'Alex',score:[2,3],celebration,...more});
test('broadcast paints scorer and actual score without mutating match',()=>{
 const c=context(),g=match(),before=JSON.stringify(g);draw.call({screenW:1280},c,g);
 const t=c.calls.filter(x=>x[0]==='fillText').map(x=>x[1]);
 for(const label of ['GOAL!','ALEX','CROWN ROYALS','2  –  3','MATCH SCORE'])assert.ok(t.includes(label),label);
 assert.equal(JSON.stringify(g),before);
});
test('animated confetti is deterministic and bounded with original colors',()=>{
 const a=context(),b=context();draw.call({screenW:1280},a,match());draw.call({screenW:1280},b,match());
 assert.deepEqual(a.calls,b.calls);
 assert.ok(a.gradients.some(g=>g.stops.some(x=>x[1]==='#2244cc')));
 assert.ok(a.gradients.some(g=>g.stops.some(x=>x[1]==='#facc55')));
 assert.equal(a.calls.filter(x=>x[0]==='fillRect'&&x[3]===6&&x[4]===12).length,24);
});
test('zero celebration and missing team metadata are safe',()=>{
 const c=context();draw.call({screenW:320},c,match(0));assert.equal(c.calls.length,0);
 const d=context();draw.call({screenW:320},d,match(1,{getTeam:()=>null,score:null,goalHero:''}));
 assert.ok(d.calls.some(x=>x[0]==='fillText'&&x[1]==='0  –  0'));
 assert.ok(d.calls.every(x=>x.every(v=>typeof v!=='number'||Number.isFinite(v))));
});
test('new running effects are visual-only and game still has exactly four controls',()=>{
 assert.match(src,/VIZ-06: subtle turf-contact animation, visual-only/);
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.deepEqual([...html.matchAll(/<button data-act="(pass|shoot|dribble|jump)"/g)].map(x=>x[1]).sort(),['dribble','jump','pass','shoot']);
});
