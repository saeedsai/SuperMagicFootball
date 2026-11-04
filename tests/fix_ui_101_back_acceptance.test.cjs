'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
function section(start,end){const a=source.indexOf(start);assert(a>=0,'missing '+start);const b=source.indexOf(end,a+start.length);assert(b>a,'missing '+end);return source.slice(a,b)}
const dirty=section('const unsavedFormScreens=', '// v0.8.24.7');
const nested=section('function closeNestedMenuLayer(){','document.addEventListener(\'keydown\',');
function fakeField({tagName='INPUT',type='text',value='initial',defaultValue='initial',checked=false,defaultChecked=false,disabled=false,id='',options=[],files=[]}={}){
 return {tagName,type,value,defaultValue,checked,defaultChecked,disabled,id,options,files};
}
function dirtyHarness(fields=[],page='PLAYER CUSTOMIZATION',confirmValue=false){
 const state={fields,screen:page,confirmCalls:[],confirmValue};
 const code=`(()=>{const screen=${JSON.stringify(page)};const menu={querySelectorAll:()=>fields};
  ${dirty}
  return {menuHasUnsavedFormChanges,confirmDiscardBeforeBack};})()`;
 const api=vm.runInNewContext(code,{fields,confirm:message=>{state.confirmCalls.push(message);return state.confirmValue;},menuBackAction:'navCustomization'});
 return {api,state};
}
test('FIX-UI-101 changed nested editor values require explicit discard confirmation and remain on Cancel',()=>{
 const field=fakeField({value:'new value'}),{api,state}=dirtyHarness([field]);
 assert.equal(api.menuHasUnsavedFormChanges(),true);
 assert.equal(api.confirmDiscardBeforeBack('navCustomization'),false);
 assert.equal(state.confirmCalls.length,1);assert.match(state.confirmCalls[0],/Discard unsaved changes/);
 assert.equal(field.value,'new value');
 state.confirmValue=true;assert.equal(api.confirmDiscardBeforeBack('navCustomization'),true);
});
test('FIX-UI-101 detects select, checkbox, radio and file edits but ignores preview-only controls',()=>{
 const select=fakeField({tagName:'SELECT',options:[{selected:true,defaultSelected:false},{selected:false,defaultSelected:true}]});
 const checkbox=fakeField({type:'checkbox',checked:true,defaultChecked:false});
 const radio=fakeField({type:'radio',checked:true,defaultChecked:false});
 const file=fakeField({type:'file',files:[{}]});
 for(const field of [select,checkbox,radio,file])assert.equal(dirtyHarness([field]).api.menuHasUnsavedFormChanges(),true);
 assert.equal(dirtyHarness([fakeField({value:'run',defaultValue:'idle',id:'customPose'})]).api.menuHasUnsavedFormChanges(),false);
 assert.equal(dirtyHarness([fakeField({value:'2',defaultValue:'1',id:'studioGalleryPhase'})]).api.menuHasUnsavedFormChanges(),false);
 assert.equal(dirtyHarness([fakeField({disabled:true,value:'x'})]).api.menuHasUnsavedFormChanges(),false);
 assert.equal(dirtyHarness([fakeField({value:'x'})],'nav-settings').api.menuHasUnsavedFormChanges(),false);
});
test('FIX-UI-101 pristine Player Studio Super Shot selection has an explicit default, not a false unsaved edit',()=>{
 assert.match(source,/<select class="choice" id="studioShotAbility"><option value="keep" selected>KEEP CURRENT/);
});
test('FIX-UI-101 declared route is confirmed once; non-Back actions do not trigger discard warning',()=>{
 const {api,state}=dirtyHarness([fakeField({value:'edited'})]);
 assert.equal(api.confirmDiscardBeforeBack('navCustomization'),false);
 assert.equal(api.confirmDiscardBeforeBack('saveStudioStats'),true);
 assert.equal(state.confirmCalls.length,1);
});
test('FIX-UI-101 Escape and gamepad Back close nested overlays before routing',()=>{
 assert.match(nested,/fullscreenHelp\.classList\.add\('hidden'\)/);
 assert.match(nested,/screen==='PLAYER CUSTOMIZATION'&&studioGalleryOpen/);
 assert.match(nested,/teamBrowsePanel:not\(\.hidden\)/);
 const back=section('function backFromMenu()','document.addEventListener(\'keydown\',');
 assert.match(back,/closeNestedMenuLayer/);
 const input=section("document.addEventListener('keydown',e=>{",'let lastPadNav=0,padWas={};');
 assert.ok(input.indexOf("if(e.code==='Escape')")<input.indexOf("if(e.target?.matches?.('input,select,textarea,[contenteditable=\"true\"]'))"),'Escape must work while an editor control has focus');
 const gamepad=section('function pollMenuPad(now){','menu.addEventListener(\'change\',e=>');
 assert.match(gamepad,/if\(pressed\(1\)&&!padWas\.b\)backFromMenu\(\)/);
 const click=section("menu.addEventListener('click',e=>", "menu.addEventListener('change',e=>{const id=e.target.id;");
 assert.match(click,/if\(node\)action\(node\.dataset\.action\)/,'touch-visible Back routes through the guarded action dispatcher');
 assert.match(source,/function action\(a\)\{if\(a===menuBackAction&&!confirmDiscardBeforeBack\(a\)\)return;/);
});
test('FIX-UI-101 route guard preserves pause return, dynamic parent routes, and exact menu origin',()=>{
 assert.match(source,/const squadBackAction=origin==='setup'\?'returnSetup':origin==='pause'\?'returnPause':origin==='career'\?'careerSquad':origin==='customization'\?'navCustomization':'home'/);
 assert.match(source,/a==='returnPause'\)\{menuEntryReturn='home';if\(screen==='TEAM COMMAND CENTER'&&squadContext==='pause'\)returnFromPauseTactics\(\);else pause\(\);\}/);
 assert.match(source,/if\(a==='confirmQuit'\)\{if\(confirm\(/);
 assert.match(source,/page\('PAUSED',[\s\S]*?,'resume'\)\}/);
 assert.match(source,/page\('HALF TIME',[\s\S]*?,'resume'\)\}/);
 assert.match(source,/if\(\['PAUSED','HALF TIME'\]\.includes\(screen\)\)\{action\('resume'\);return;\}/);
 assert.match(source,/Discard unsaved changes and leave this screen\? Choose Cancel to stay and keep editing\./);
});
