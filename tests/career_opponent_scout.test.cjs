/** Career fixture scouting executes the actual UI helper without write effects. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const a=src.indexOf('function careerOpponentScoutPanel(c,fx){');
const b=src.indexOf('\n// Advisory only: project the same saved six the next match actually uses.',a);
const manager=src.indexOf('\nfunction showManager(){',b);
assert(a>0&&b>a,'career scout helper must belong to real modular UI');
assert(src.slice(manager,manager+3600).includes('${careerOpponentScoutPanel(c,fx)}'),'live Manager fixture must display scouting');
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const squads={
 1:[{id:'g',role:'GK',name:'GK',ovr:72},{id:'d1',role:'DF',name:'Defender 1',ovr:55},
    {id:'d2',role:'DF',name:'Defender 2',ovr:57},{id:'m',role:'MF',name:'Midfielder',ovr:70},
    {id:'f1',role:'FW',name:'<svg onload=alert(1)>',ovr:94},{id:'f2',role:'FW',name:'Striker',ovr:91}],
 2:[{id:'g',role:'GK',name:'GK',ovr:85},{id:'d1',role:'DF',name:'Defender 1',ovr:94},
    {id:'d2',role:'DF',name:'Defender 2',ovr:90},{id:'m',role:'MF',name:'Midfielder',ovr:70},
    {id:'f1',role:'FW',name:'Striker 1',ovr:60},{id:'f2',role:'FW',name:'Striker 2',ovr:62}],
 3:[{id:'g',role:'GK',name:'GK',ovr:72},{id:'d1',role:'DF',name:'Defender 1',ovr:73},
    {id:'d2',role:'DF',name:'Defender 2',ovr:74},{id:'m',role:'MF',name:'Midfielder',ovr:75},
    {id:'f1',role:'FW',name:'Striker 1',ovr:77},{id:'f2',role:'FW',name:'Striker 2',ovr:74}]
};
const TEAMS=[{name:'My Club'},{name:'Danger FC <script>alert(1)</script>'},{name:'Fortress FC'},{name:'Balanced FC'}];
const state={rosterCalls:0,planCalls:0};
const scout=vm.runInNewContext('('+src.slice(a,b)+')',{TEAMS,
 roster:i=>(state.rosterCalls++,squads[i]),
 planFor:i=>(state.planCalls++,{lineup:[0,1,2,3,4,5]}),
 playerOVR:p=>p.ovr,escapeHTML,careerBenchReadinessPanel:()=>'',careerLineupRoleFitPanel:()=>''});
const career=()=>({club:0,roster:[{id:'x',condition:45},{id:'y',condition:80,injuryWeeks:2},{id:'z',condition:100}],
 table:{1:{p:5,w:3,d:1},2:{p:0,w:0,d:0},3:{p:2,w:0,d:2}},cash:9000000});
test('no upcoming or invalid fixture renders nothing without reading opponent data',()=>{
 const count=state.rosterCalls;
 for(const fx of [null,{opponent:-1},{opponent:999},{opponent:NaN},{opponent:'1'}])
  assert.equal(scout(career(),fx),'');
 assert.equal(state.rosterCalls,count);
});
test('dangerous names escaped, real positional strengths and league W-D-L displayed',()=>{
 const html=scout(career(),{kind:'league',opponent:1});
 assert(html.includes('ATTACK / DEFENCE / KEEPER'));
 assert(html.includes('93 / 56 / 72'),html);
 assert(html.includes('5 played · 3W 1D 1L'),html);
 assert(html.includes('Deep Block and Possession'),html);
 assert(html.includes('Your squad has 2 players'),html);
 assert(html.includes('&lt;svg onload=alert(1)&gt;'),html);
 assert(!html.includes('<svg onload='),html);
 assert(!html.includes('<script>'),html);
 assert(html.includes('&lt;script&gt;'),html);
 assert(html.includes('aria-label="Next opponent scouting report"'));
});
test('strong defence suggests direct attack while cup form is explicit',()=>{
 const html=scout(career(),{kind:'cup',opponent:2});
 assert(html.includes('61 / 92 / 85'),html);
 assert(html.includes('Direct attack and High Press'),html);
 assert(html.includes('No league matches recorded'),html);
 assert(!html.includes('NaN')&&!html.includes('undefined'));
});
test('balanced opponent gives noncommittal guidance with no fitness false alarm',()=>{
 const c=career();c.roster=[{condition:65},{condition:100}];
 const html=scout(c,{kind:'league',opponent:3});
 assert(html.includes('Balanced opponent: consider Possession'),html);
 assert(html.includes('No fitness warning below 60%'),html);
 assert(html.includes('2 played · 0W 2D 0L'),html);
});
test('opening scout is pure read; no team-plan, career, or lineup mutation',()=>{
 const c=career(),before=JSON.stringify({career:c,teams:TEAMS,squads});
 const html=scout(c,{kind:'league',opponent:1});
 assert(html.includes('no automatic changes or costs'));
 assert.equal(JSON.stringify({career:c,teams:TEAMS,squads}),before);
 assert(state.rosterCalls>0&&state.planCalls>0);
});
test('source contains no scouting writes and current bundle/About versioning',()=>{
 assert(!src.slice(a,b).includes('store.put('),'no save writes in scout');
 assert(!src.slice(a,b).includes('game.applyPlan('),'scout cannot change tactical style');
 assert(!src.slice(a,b).includes('career.cash='),'scout cannot spend transfer funds');
 assert(src.includes("version:'0.8.25.32-integrated'"),'maintain current game bundle');
 assert(src.includes('api.github.com/repos/saeedsai/SuperMagicFootball/commits/dev'),'keep About dev revision');
});
