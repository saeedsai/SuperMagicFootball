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
test('formation preview keeps canonical slot coordinates and exposes role-specific visual and accessible cues',()=>{
 assert.match(ui,/const positions=FORMATIONS\[key\]\|\|FORMATIONS\['2-1-2'\]/);
 assert.match(ui,/class="formationSlot role\$\{labels\[i\]\}" data-role="\$\{labels\[i\]\}"/);
 assert.match(ui,/const player=players\[slots\[i\]\],playerName=player\?\.name\|\|'Player'/);
 assert.match(ui,/aria-label="\$\{escapeHTML\(playerName\)\} face, \$\{labels\[i\]\}, Energy \$\{energy\} percent"/);
 assert.match(ui,/class="formationEnergy" aria-label="\$\{escapeHTML\(playerName\)\} Energy \$\{energy\} percent"/);
 assert.match(ui,/function squadEnergyPercent\(player\)/);
 assert.match(ui,/labelFontSize=Math\.max\(6,Math\.min\(baseFontSize,labelMaxWidth\/\(surname\.length\*\.58\)\)\)/);
 const css=fs.readFileSync(path.join(__dirname,'../style.css'),'utf8');
 for(const role of ['roleGK','roleDF','roleMF','roleFW'])assert.match(css,new RegExp('\\.formationSlot\\.'+role+' canvas'));
 assert.match(css,/\.formationPitch:before\{[^}]*repeating-linear-gradient/);
 assert.match(css,/\.menu \.roster\{max-height:min\(54vh,560px\)[^}]*overscroll-behavior:contain/);
});
