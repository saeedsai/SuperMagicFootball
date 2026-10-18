/** Exercise real UI career bench advice, without mocking its decision algorithm. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const at=ui.indexOf('function careerBenchReadinessPanel(c){');
const end=ui.indexOf('\nfunction showManager(){',at);
assert(at>0&&end>at,'actual production career readiness helper is present');
assert(ui.includes('$'+'{careerBenchReadinessPanel(c)}'),'the live scout embeds readiness');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lineup=[0,1,2,3,4,5];
const plan={lineup};
const helper=vm.runInNewContext('('+ui.slice(at,end)+')',{planFor:()=>plan,playerOVR:p=>p.ovr??55,escapeHTML:esc});
function career(){
 const roles=['GK','DF','DF','MF','FW','FW','GK','DF','MF','MF','MF','FW'];
 return {club:1,cash:500000,season:2,roster:roles.map((role,i)=>({
   id:'p'+i,name:'Player '+i,role,condition:100,injuryWeeks:0,ovr:50+i}))};
}
test('healthy starting six shows ready guidance, not a fictitious substitution',()=>{
 const c=career(),out=helper(c);
 assert(out.includes('STARTING SIX:'));
 assert(out.includes('No replacements advised'));
 assert(!out.includes('Consider Player'));
});
test('unfit defender receives actual healthy same-role reserve suggestion',()=>{
 const c=career();c.roster[1].condition=34;
 const out=helper(c);
 assert(out.includes('Player 1 (DF, fitness 34%)'),out);
 assert(out.includes('Consider Player 7 (100% fit)'),out);
 assert(!out.includes('Consider Player 6'),out);
 assert(out.includes('data-bench-slot="1"'),out);
});
test('injured GK has a viable second goalkeeper; no outfield replacement',()=>{
 const c=career();c.roster[0].injuryWeeks=2;
 const out=helper(c);
 assert(out.includes('Player 0 (GK, injured)'));
 assert(out.includes('Consider Player 6 (100% fit)'));
 assert(!out.includes('Consider Player 7'));
});
test('a not-fit or injured reserve is never recommended',()=>{
 const c=career();c.roster[4].condition=18;
 c.roster[11].injuryWeeks=1;
 const out=helper(c);
 assert(out.includes('No healthy same-position reserve available.'),out);
 assert(!out.includes('Consider Player 11'));
});
test('never select a starting-six player even if otherwise healthier',()=>{
 const c=career();c.roster[2].condition=22;
 c.roster[1].condition=100;
 const out=helper(c);
 assert(out.includes('Consider Player 7'));
 assert(!out.includes('Consider Player 1'));
});
test('a bench candidate is assigned once, even with two tired same-position starters',()=>{
 const c=career();c.roster[1].condition=30;c.roster[2].condition=25;
 const out=helper(c);
 assert.equal((out.match(/Consider Player 7/g)||[]).length,1,out);
 assert.equal((out.match(/No healthy same-position reserve available/g)||[]).length,1,out);
});
test('injuries take priority over fatigue when selecting scarce reserve',()=>{
 const c=career();c.roster[1].condition=5;c.roster[2].injuryWeeks=3;
 const out=helper(c);
 assert(out.indexOf('Player 2 (DF, injured)')<out.indexOf('Player 1 (DF, fitness 5%)'),out);
 assert(out.indexOf('Consider Player 7')<out.indexOf('No healthy same-position reserve available'),out);
});
test('malformed, missing or wrong-size lineups fail closed',()=>{
 const c=career();
 assert.equal(helper(null),'');
 assert.equal(helper({club:1,roster:null}),'');
 for(const bad of [null,[0,1,2],[0,1,2,3,4,5,6]]){
   plan.lineup=bad;assert.equal(helper(c),'');
 }
 plan.lineup=lineup;
});
test('untrusted player names and roles are escaped, suggestions show no buttons',()=>{
 const c=career();
 c.roster[1].condition=25;c.roster[1].name='<img onerror=alert(1)>';
 c.roster[7].name='<script>alert(2)</script>';
 const out=helper(c);
 assert(out.includes('&lt;img onerror=alert(1)&gt;'),out);
 assert(out.includes('&lt;script&gt;alert(2)&lt;/script&gt;'),out);
 assert(!out.includes('<img ')&&!out.includes('<script>'));
 assert(!out.includes('<button'));
});
test('career, lineup, money, rosters and plans never change after advice render',()=>{
 const c=career();c.roster[0].condition=10;c.roster[2].injuryWeeks=2;
 const before=JSON.stringify({c,lineup,plan});
 helper(c);helper(c);
 assert.equal(JSON.stringify({c,lineup,plan}),before);
 assert(!ui.slice(at,end).includes('store.put('));
 assert(!ui.slice(at,end).includes('saveCareer('));
 assert(!ui.slice(at,end).includes('applyPlan('));
});
test('report limits to three advice rows and counts extra unfit starters',()=>{
 const c=career();for(let i=0;i<5;i++)c.roster[i].condition=20;
 const out=helper(c);
 assert.equal((out.match(/data-bench-slot=/g)||[]).length,3,out);
 assert(out.includes('+2 additional starters need review.'),out);
});
