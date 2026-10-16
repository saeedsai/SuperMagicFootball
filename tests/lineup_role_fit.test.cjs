// Pure source contract: lineup fit is advisory UI only; gameplay and saves remain untouched.
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
test('role-fit guidance is derived from the six editable slots without mutating saved teams',()=>{
 const a=ui.indexOf('function lineupRoleFitGuidance(players,slots,positions){');
 const b=ui.indexOf('function showSquad(side=0,origin=',a);
 assert(a>0&&b>a,'read-only helper present in modular UI');
 const helper=ui.slice(a,b);
 for(const text of ['player?.role===assigned','mismatches.push','playerOVR(player,assigned)','LINEUP FIT','Advice only'])assert(helper.includes(text),text);
 assert.doesNotMatch(helper,/store\.put|applyPlan|game\.take|localStorage\.setItem|\.lineup\s*=|\.push\(.*plan/);
});
test('position guidance is accessible, refreshes with formation and lineup, and does not auto-save',()=>{
 assert.match(ui,/id="lineupRoleFit" class="muted" role="status" aria-live="polite"/);
 assert.match(ui,/guidance\.textContent=lineupRoleFitGuidance\(players,slots,labels\)/);
 assert.match(ui,/case 'formation':refreshFormationPreview\(\);break/);
 assert.match(ui,/if\(\/\^pos\[0-5\]\$\/\.test\(e\.target\.id\)\)/);
 assert.match(ui,/button\('✓ SAVE TACTICS','saveSquad','gold'\)/);
});
