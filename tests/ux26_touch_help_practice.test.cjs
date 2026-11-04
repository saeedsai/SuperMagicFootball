'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
const start=ui.indexOf('function controlHelpBindingsFor(');
const end=ui.indexOf('\nfunction showHelp(',start);
assert.ok(start>=0&&end>start,'touch help practice updater exists');

function makeHarness(){
 const buttons=['pass','shoot','dribble','jump'].map(helpPractice=>({dataset:{helpPractice},pressed:false,setAttribute(name,value){if(name==='aria-pressed')this.pressed=value==='true';}}));
 const status={textContent:'0 of 4 touch controls checked.'};
 const guidedStatus={textContent:'Step 1 of 2: press JUMP, then PASS while airborne.'};
 const menu={querySelectorAll:()=>buttons.filter(button=>button.pressed),querySelector:selector=>selector==='#touchHelpPracticeStatus'?status:selector==='#guidedCrossStatus'?guidedStatus:null};
 const input={getBindings:()=>({keyboard:['KeyK','KeyJ','KeyI','Space'],gamepad:[1,0,2,3]})};
 const context={menu,input};
 vm.runInNewContext(ui.slice(start,end)+'\nthis.update=updateTouchHelpPractice;this.guide=updateGuidedHelpPractice;',context);
 return {buttons,status,guidedStatus,update:context.update,guide:context.guide};
}

test('UX26 Touch Control Check confirms each action and reports when all respond',()=>{
 const h=makeHarness();
 assert.equal(h.update({dataset:{},setAttribute(){}}),false);
 for(const [index,action] of ['pass','shoot','dribble','jump'].entries()){
  h.update(h.buttons[index]);
  assert.equal(h.buttons[index].pressed,true);
  assert.equal(h.status.textContent,index===3?'All 4 touch actions responded; touch input is ready.':`${action[0].toUpperCase()+action.slice(1)} touch button responded. ${index+1} of 4 checked.`);
 }
});

test('UX26 help exposes four semantic practice buttons and an atomic live result',()=>{
 const help=ui.slice(ui.indexOf('function showHelp('),ui.indexOf('\nfunction showEditor(',ui.indexOf('function showHelp(')));
 assert.match(help,/aria-labelledby="touchHelpPracticeTitle"/);
 assert.match(help,/role="status" aria-live="polite" aria-atomic="true"/);
 assert.match(help,/\['pass','shoot','dribble','jump'\]\.map\(action=>`<button type="button" class="helpTouchPracticeButton" data-help-practice="\$\{action\}"/);
 assert.match(help,/guidedCrossPractice/);
 assert.match(help,/JUMP first, then PASS while airborne/);
 assert.match(ui,/updateGuidedHelpPractice\(practice\.dataset\.helpPractice\)/);
 assert.match(ui,/screen!=='CONTROLS'[\s\S]*?bindings\.keyboard,bindings\.keyboard2/);
});

test('UX26 guided Cross practice requires Jump then Pass and explains errors',()=>{
 const h=makeHarness();
 h.guide('shoot');
 assert.match(h.guidedStatus.textContent,/Step 1 of 2: start with JUMP/);
 h.guide('jump');
 assert.match(h.guidedStatus.textContent,/JUMP registered\. Step 2 of 2: PASS \(K \/ gamepad B\) while airborne\./);
 h.guide('shoot');
 assert.equal(h.guidedStatus.textContent,'That action did not complete the sequence. Use PASS next to practice the cross.');
 h.guide('pass');
 assert.equal(h.guidedStatus.textContent,'Cross practice complete. In a match, press JUMP, then PASS while airborne.');
});
