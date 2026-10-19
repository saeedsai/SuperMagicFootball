/** Evaluate real Manager Career natural-role fit helper without altering saves. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const at=ui.indexOf('function careerLineupRoleFitPanel(c){');
const end=ui.indexOf('// Read-only pre-kickoff scouting.',at);
assert(at>0&&end>at,'role fit must be in production UI before scouting');
assert(ui.includes('$'+'{careerLineupRoleFitPanel(c)}'),'real scout displays role fit');
const escapeHTML=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const original=[0,1,2,3,4,5],plan={lineup:original.slice()};
const fit=vm.runInNewContext('('+ui.slice(at,end)+')',{
 planFor:()=>plan,playerOVR:(p)=>p.ovr??60,escapeHTML});
function career(){
 const roles=['GK','DF','DF','MF','FW','FW','GK','DF','MF','MF','MF','FW'];
 return {club:1,cash:20000,season:2,roster:roles.map((role,i)=>({
  id:'id'+i,name:'Player '+i,role,condition:100,injuryWeeks:0,ovr:50+i
 }))};
}
test('perfect starting six reports 6/6 natural role fit without invented changes',()=>{
 const out=fit(career());
 assert.match(out,/ROLE FIT: 6\/6/);
 assert.match(out,/Your projected starting six matches/);
 assert.doesNotMatch(out,/Consider Player|data-role-fit-slot/);
});
test('mismatched defender has match-ready natural defender on bench',()=>{
 const c=career();c.roster[1].role='MF';
 const out=fit(c);
 assert.match(out,/ROLE FIT 5\/6/);
 assert.match(out,/Slot 2 DF:/);
 assert.match(out,/Player 1 naturally plays MF/);
 assert.match(out,/Consider Player 7 \(100% fit\) for the DF role/);
 assert.match(out,/data-role-fit-slot="1"/);
});
test('mismatched forward recommends actual healthy forward not defender',()=>{
 const c=career();c.roster[4].role='DF';
 const out=fit(c);
 assert.match(out,/Slot 5 FW/);
 assert.match(out,/Consider Player 11/);
 assert.doesNotMatch(out,/Consider Player 7/);
});
test('exclude selected starters, injured and below-60% reserves',()=>{
 const c=career();c.roster[3].role='FW';
 c.roster[8].condition=59;c.roster[9].injuryWeeks=1;c.roster[10].condition=58;
 const out=fit(c);
 assert.match(out,/No match-ready natural MF reserve available/);
 assert.doesNotMatch(out,/Consider Player [0-9]/);
});
test('competing mismatches do not assign the same reserve twice',()=>{
 const c=career();c.roster[1].role='MF';c.roster[2].role='MF';
 const out=fit(c);
 assert.equal((out.match(/Consider Player 7/g)||[]).length,1);
 assert.equal((out.match(/No match-ready natural DF reserve/g)||[]).length,1);
});
test('rank bench candidates by fitness then OVR',()=>{
 const c=career();c.roster[3].role='FW';
 c.roster[8].condition=70;c.roster[9].condition=90;c.roster[10].condition=90;
 c.roster[9].ovr=50;c.roster[10].ovr=80;
 assert.match(fit(c),/Consider Player 10 \(90% fit\)/);
 c.roster[10].condition=89;
 assert.match(fit(c),/Consider Player 9 \(90% fit\)/);
});
test('untrusted names/roles are escaped and no extra controls rendered',()=>{
 const c=career();c.roster[1].role='<img src=x onerror=alert(1)>';
 c.roster[1].name='<script>BAD</script>';
 c.roster[7].name='A&B <load>';
 const out=fit(c);
 assert.match(out,/&lt;script&gt;BAD&lt;\/script&gt;/);
 assert.match(out,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.match(out,/A&amp;B &lt;load&gt;/);
 assert.doesNotMatch(out,/<script>|<img |<button/);
});
test('missing, duplicate, invalid or malformed saved lineups fail closed',()=>{
 const c=career();
 assert.equal(fit(null),'');
 assert.equal(fit({club:1,roster:null}),'');
 for(const bad of [[0,1,2],[0,1,2,3,4,4],[0,1,2,3,4,12],[0,1,2,3,4,-1],null]){
  plan.lineup=bad;assert.equal(fit(c),'');
 }
 plan.lineup=original.slice();
});
test('extra natural-role mismatches are capped at three with a count',()=>{
 const c=career();
 for(let i=1;i<=5;i++)c.roster[i].role='GK';
 const out=fit(c);
 assert.equal((out.match(/data-role-fit-slot=/g)||[]).length,3);
 assert.match(out,/\+2 additional role mismatches to review/);
});
test('role evaluation is read-only and retains four-button and About contracts',()=>{
 const c=career();c.roster[1].role='FW';
 const before=JSON.stringify({c,plan});
 fit(c);fit(c);
 assert.equal(JSON.stringify({c,plan}),before);
 const block=ui.slice(at,end);
 for(const dangerous of ['store.put(','saveCareer(','applyPlan(','localStorage.setItem('])assert(!block.includes(dangerous));
 assert.match(ui,/Four action buttons/);
 assert.match(ui,/api\.github\.com\/repos\/saeedsai\/SuperMagicFootball\/commits\/dev/);
});
