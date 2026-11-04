'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
const start=source.indexOf('function page('),end=source.indexOf('\nconst unsavedFormScreens=',start);
assert(start>=0&&end>start,'shared page route helper exists');
function harness(initial='nav-input'){
 const state={screen:initial,html:'',focuses:0};
 const context={
  get screen(){return state.screen},set screen(v){state.screen=v},
  get menuEntryReturn(){return 'home'},set menuBackAction(v){state.back=v},
  button:(label,action)=>`<button data-action="${action}">${label}</button>`,
  show:(html,id)=>{state.html=html;state.screen=id},
  menu:{querySelector:selector=>selector==='.heading'?{focus:opts=>{state.focuses++;state.focusOpts=opts}}:null}
 };
 vm.runInNewContext(source.slice(start,end)+'\nthis.page=page;',context);
 return {context,state};
}
test('VIZ-02 route change moves focus to the new page heading without adding a Tab stop',()=>{
 const {context,state}=harness();
 context.page('CONTROLLER MAPPING','Remap controls.','<input id="firstControl"/>','navInput');
 assert.match(state.html,/<h1 class="heading" tabindex="-1">CONTROLLER MAPPING<\/h1>/);
 assert.equal(state.focuses,1,'keyboard route change announces the destination heading');
 assert.equal(state.focusOpts.preventScroll,true);
 context.page('CONTROLLER MAPPING','Updated values.','<input id="nextControl"/>','navInput');
 assert.equal(state.focuses,1,'same-screen refresh must not steal focus from the active editor');
 context.page('INPUT SETTINGS','Four actions.','<button>Mappings</button>','navSettings');
 assert.equal(state.focuses,2,'a different route receives focus');
});

