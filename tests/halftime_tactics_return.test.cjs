const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.resolve(__dirname,'../src/modules/ui.js'),'utf8');
const start=source.indexOf('function returnFromPauseTactics(){');
const end=source.indexOf('function pause(){',start);
assert(start>=0&&end>start,'actual live halftime return helper exists');
function navigate(wasHalftime,state='paused'){
 const history=[];
 const context={squadReturnAtHalf:wasHalftime,game:{matchState:state},
                halftime:()=>history.push('HALF TIME'),pause:()=>history.push('PAUSED')};
 const fn=vm.runInNewContext('(()=>{'+source.slice(start,end)+';return returnFromPauseTactics;})()',context);
 fn();
 return history;
}
test('halftime tactics Back/Save return to the team-talk screen',()=>{
 assert.deepEqual(navigate(true),['HALF TIME']);
});
test('normal live Pause tactics still return to PAUSED',()=>{
 assert.deepEqual(navigate(false),['PAUSED']);
});
test('never reopen halftime after an active match has resumed',()=>{
 assert.deepEqual(navigate(true,'play'),['PAUSED']);
});
test('live Team Command Center captures entry origin and all return paths preserve it',()=>{
 assert.match(source,/squadReturnAtHalf=origin==='pause'&&screen==='HALF TIME'/);
 assert.match(source,/screen==='TEAM COMMAND CENTER'&&squadContext==='pause'\)returnFromPauseTactics\(\)/);
 const block=source.slice(source.indexOf("else if(a==='saveSquad')"),source.indexOf("else if(a==='exportSave')"));
 assert.equal((block.match(/returnFromPauseTactics\(\)/g)||[]).length,2,'SAVE and RESTORE DEFAULT both return correctly');
 assert.match(block,/store\.put\('teamPlans',teamPlans\)/,'explicit SAVE persistence unchanged');
});
test('Escape/Backspace in Team Command Center follows the same return route',()=>{
 const block=source.slice(source.indexOf('function backFromMenu(){'),source.indexOf("document.addEventListener('keydown'",source.indexOf('function backFromMenu(){')));
 assert.match(block,/screen==='TEAM COMMAND CENTER'/);
 assert.match(block,/squadContext==='pause'\?'returnPause':squadContext==='setup'\?'returnSetup':menuBackAction\|\|'home'/,'pause/setup remain hard priorities while other entry screens use the actual Back destination');
 assert.match(source,/if\(e.code==='Escape'\|\|e.code==='Backspace'\)/);
});
