const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
const css=fs.readFileSync('style.css','utf8');
function section(start,end){
 const a=ui.indexOf(start),b=ui.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'expected Studio implementation section: '+start);
 return ui.slice(a,b);
}
function studioContext(){
 const spin={textContent:'■ STOP TURN'};
 const ctx=vm.createContext({
  studioGalleryOpen:true,studioDirection:0,studioSpin:true,
  STUDIO_DIRS:Array.from({length:8},(_,i)=>({label:'VIEW '+i})),
  studioAction:'run',studioGalleryFrame:1,
  menu:{querySelector:selector=>selector==='[data-action=studioSpin]'?spin:null},
  escapeHTML:s=>String(s),redraws:0,
  drawCustomizer(){this.redraws++;},
 });
 // VM globals use the context object, so the draw stub is explicitly bound.
 ctx.drawCustomizer=()=>{ctx.redraws++};
 vm.runInContext(section('function studioPickView(index){','// STUDIO-GALLERY-PICK-01 END'),ctx);
 vm.runInContext(section('function studioEightViewMarkup(){','// 0.8.25.32: Optional'),ctx);
 return {ctx,spin};
}
test('gallery selection changes only preview heading and stops auto-rotation',()=>{
 const {ctx,spin}=studioContext();
 assert.equal(ctx.studioPickView(6),true);
 assert.equal(ctx.studioDirection,6);
 assert.equal(ctx.studioSpin,false);
 assert.equal(ctx.redraws,1);
 assert.equal(spin.textContent,'↻ AUTO ROTATE');
});
test('invalid and hidden-gallery selections cannot change preview',()=>{
 const {ctx}=studioContext();
 for(const value of [-1,8,1.5,NaN,Infinity,'2',null]){
  assert.equal(ctx.studioPickView(value),false);
 }
 assert.equal(ctx.redraws,0);
 assert.equal(ctx.studioDirection,0);
 ctx.studioGalleryOpen=false;
 assert.equal(ctx.studioPickView(3),false);
 assert.equal(ctx.studioDirection,0);
});
test('gallery renders eight semantic buttons and exactly one pressed direction',()=>{
 const {ctx}=studioContext();
 ctx.studioDirection=5;
 const html=ctx.studioEightViewMarkup();
 assert.equal((html.match(/data-studio-pick="/g)||[]).length,8);
 assert.equal((html.match(/<canvas data-studio-view="/g)||[]).length,8);
 assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
 assert.match(html,/data-studio-pick="5" aria-pressed="true"/);
 assert.match(html,/type="button"/);
 assert.match(html,/aria-label="Show VIEW 5 in main player preview"/);
});
test('delegated gallery clicks and selection sync are wired to the live Studio',()=>{
 assert.match(ui,/menu\.addEventListener\('click',e=>\{const galleryPick=e\.target\.closest\?\.\('\[data-studio-pick\]'\)/);
 assert.match(ui,/studioPickView\(Number\(galleryPick\.dataset\.studioPick\)\)/);
 assert.match(ui,/gallery\?\.querySelectorAll\('\[data-studio-pick\]'\)\.forEach/);
 assert.match(ui,/button\.setAttribute\('aria-pressed',pressed\)/);
 assert.match(css,/\.studioViewPick\[aria-pressed=true\]/);
 assert.match(css,/\.studioViewPick:focus-visible/);
});
