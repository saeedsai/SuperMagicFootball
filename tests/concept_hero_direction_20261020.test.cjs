'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');

function createHero(){
 class FakeImage{
  constructor(){this.complete=true;this.naturalWidth=532;this.naturalHeight=265;}
  set src(value){this._src=value;if(this.onload)this.onload();}
  get src(){return this._src;}
 }
 const document={createElement:()=>({width:0,height:0,getContext:()=>({
  drawImage(){},getImageData(_x,_y,w,h){return {data:new Uint8ClampedArray(w*h*4)};},
  clearRect(){},putImageData(){}
 })})};
 const sandbox={Image:FakeImage,document,CONCEPT_HERO_INLINE:'AA'};
 const source=read('src/modules/concepthero.js').replace(/export\s*\{CONCEPT_HERO\};?\s*$/,'')+'\nglobalThis.__hero=CONCEPT_HERO;';
 // Exercise the actual module with a fake loaded atlas, never duplicate draw logic.
 vm.runInNewContext(source.replace('import.meta.url',"'https://example.test/src/modules/concepthero.js'"),sandbox,{filename:'concepthero.js'});
 assert.equal(sandbox.__hero.status().loaded,true);
 const context=()=>({
  events:[],save(){this.events.push(['save']);},restore(){this.events.push(['restore']);},
  scale(x,y){this.events.push(['scale',x,y]);},translate(x,y){this.events.push(['translate',x,y]);},
  rotate(a){this.events.push(['rotate',a]);},drawImage(){this.events.push(['drawImage']);}
 });
 return {hero:sandbox.__hero,context};
}
function visualFeel(){
 const sandbox={};
 const source=read('src/modules/visualfeel.js')
  .replace(/import\s*\{GAME_ASSETS\}\s*from\s*["']\.\.\/assets\.js["'];?/,'const GAME_ASSETS={mechanics:{ballModels:[]}};')
  .replace(/export\s*\{VISUALFEEL\};?\s*$/,'')+'\nglobalThis.__vf=VISUALFEEL;';
 vm.runInNewContext(source,sandbox,{filename:'visualfeel.js'});
 return sandbox.__vf;
}
test('facingView maps left/right side and quarter headings correctly',()=>{
 const vf=visualFeel();
 for(const [dx,dy,kind,side] of [[1,0,'side',1],[-1,0,'side',-1],
  [1,1,'quarterFront',1],[-1,1,'quarterFront',-1],
  [1,-1,'quarterBack',1],[-1,-1,'quarterBack',-1],
  [0,1,'front',1],[0,-1,'back',1]]){
  const v=vf.facingView(dx,dy,side);assert.equal(v.kind,kind);assert.equal(v.side,side);
 }
});
test('Concept atlas side and quarter crops invert their native left-facing X exactly once',()=>{
 const {hero,context}=createHero();
 for(const kind of ['side','quarterFront','quarterBack'])for(const run of [0,.7,-.7]){
  const c=context(),p={src:{renderModel:'concept_hero'}};
  assert.equal(hero.draw(c,p,{kind,side:1},{run}),true);
  assert.deepEqual(c.events.filter(e=>e[0]==='scale'&&e[1]===-1&&e[2]===1),[['scale',-1,1]],kind+' '+run);
  assert.equal(c.events.filter(e=>e[0]==='save').length,c.events.filter(e=>e[0]==='restore').length);
  assert.ok(c.events.some(e=>e[0]==='drawImage'));
 }
});
test('Concept profile faces travel direction under unchanged parent view.side mirroring',()=>{
 const {hero,context}=createHero();
 for(const kind of ['side','quarterFront','quarterBack'])for(const side of [-1,1]){
  const c=context();c.scale(side,1);
  assert.equal(hero.draw(c,{src:{renderModel:'concept_modular_v1'}},{kind,side},{run:0}),true);
  const xSign=c.events.filter(e=>e[0]==='scale').reduce((x,e)=>x*Math.sign(e[1]),1);
  assert.equal(xSign,-side,'native left-facing '+kind+' must face '+(side>0?'right':'left'));
 }
});
test('front and back retain orientation for idle and run',()=>{
 const {hero,context}=createHero();
 for(const kind of ['front','back'])for(const run of [0,.7]){
  const c=context();assert.equal(hero.draw(c,{src:{renderModel:'concept_hero'}},{kind,side:1},{run}),true);
  assert.ok(!c.events.some(e=>e[0]==='scale'&&e[1]===-1));
  assert.equal(c.events.filter(e=>e[0]==='save').length,c.events.filter(e=>e[0]==='restore').length);
 }
});
test('procedural players are not drawn or mirrored by Concept Hero',()=>{
 const {hero,context}=createHero(),c=context();
 assert.equal(hero.draw(c,{src:{renderModel:'procedural'}},{kind:'side',side:1}),false);
 assert.equal(c.events.length,0);
});
