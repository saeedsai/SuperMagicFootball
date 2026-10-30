'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
function fixture(){
 const start=ui.indexOf('function studioStepGalleryFrame(step){');
 const end=ui.indexOf('// STUDIO-GALLERY-PICK-01 END',start);
 assert.ok(start>0&&end>start,'real frame step implementation must be present');
 const slider={value:'1'},state={studioGalleryOpen:true,studioGalleryFrame:1,redraws:0,
  $:id=>id==='studioGalleryPhase'?slider:null,drawCustomizer(){state.redraws++}};
 vm.runInNewContext(ui.slice(start,end)+';this.step=studioStepGalleryFrame;',state);
 return {state,slider};
}
test('previous/next frame wrap all four phases and synchronize the real scrubber',()=>{
 const {state,slider}=fixture();
 for(const expected of [2,3,0,1]){assert.equal(state.step(1),true);assert.equal(state.studioGalleryFrame,expected);assert.equal(slider.value,String(expected));}
 assert.equal(state.step(-1),true);assert.equal(state.studioGalleryFrame,0);
 assert.equal(state.step(-1),true);assert.equal(state.studioGalleryFrame,3);
 assert.equal(state.redraws,6);
});
test('hidden gallery and malformed steps cannot change preview or write saves',()=>{
 const {state,slider}=fixture();
 for(const bad of [0,2,-2,1.5,'1',null,NaN,Infinity]){
  assert.equal(state.step(bad),false);
 }
 state.studioGalleryOpen=false;assert.equal(state.step(1),false);
 assert.equal(state.studioGalleryFrame,1);assert.equal(slider.value,'1');assert.equal(state.redraws,0);
});
test('frame controls are accessible, delegated and limited to Player Studio',()=>{
 const a=ui.indexOf('function studioEightViewMarkup(){'),b=ui.indexOf('// 0.8.25.32: Optional',a);
 const html=ui.slice(a,b);
 for(const [action,label] of [['studioGalleryPrev','Previous animation frame'],['studioGalleryNext','Next animation frame']]){
  assert.ok(html.includes('data-action="'+action+'"'),action);
  assert.ok(html.includes('aria-label="'+label+'"'),label);
 }
 assert.match(ui,/else if\(a==='studioGalleryPrev'\)studioStepGalleryFrame\(-1\)/);
 assert.match(ui,/else if\(a==='studioGalleryNext'\)studioStepGalleryFrame\(1\)/);
 assert.match(ui,/studioGalleryFrame=frame;drawCustomizer\(\)/);
 assert.equal((fs.readFileSync('index.html','utf8').match(/<button data-act=/g)||[]).length,4);
});
