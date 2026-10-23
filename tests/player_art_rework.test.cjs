// Appearance combination smoke tests for production Canvas2D character-art renderer.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
let modPromise=import(pathToFileURL(path.resolve(__dirname,'../src/modules/characterart.js')).href);
function fakeCanvas(){
 let saves=0,errors=0,draws=0;
 const c={createLinearGradient(){return {addColorStop(n,col){assert.ok(n>=0&&n<=1);assert.equal(typeof col,'string')}}},
 save(){saves++},restore(){saves--;assert.ok(saves>=0,'unbalanced restore')},
 beginPath(){draws++},moveTo(){},lineTo(){},quadraticCurveTo(){},bezierCurveTo(){},ellipse(x,y,rx,ry){for(const n of [x,y,rx,ry])assert.ok(Number.isFinite(n));},roundRect(){},fill(){},stroke(){},closePath(){},clip(){},
 translate(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y))},rotate(x){assert.ok(Number.isFinite(x))},scale(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y))},fillText(){},strokeText(){}};
 return {c,counts:()=>({saves,errors,draws})};
}
const team={primary:'#2769c0',secondary:'#f5f2e8',trim:'#ffc14b'};
const player={src:{num:10},action:'idle',keeper:false};
test('eight projections and representative face/beard/hair combinations do not throw',async()=>{
 const {CHARACTER_ART:art}=await modPromise;
 const views=['front','quarterFront','side','quarterBack','back'];
 let total=0;
 for(let f=0;f<5;f++)for(let b=0;b<5;b++)for(let h=0;h<13;h++)for(const kind of views){
   const {c,counts}=fakeCanvas();
   const av={face:f,beard:b,style:h,eyes:(f*5+h)%20,brows:(h*2)%20,eyeColor:h%6,nose:(f+h)%6,lips:(b+h)%8,skin:'#af7957',hair:'#503a2b',accessory:(f+h)%6};
   art.draw(c,player,av,team,{kind,side:1},{skin:av.skin,hair:av.hair,headScale:1,run:0});
   assert.equal(counts().saves,0,kind+' save/restore');
   assert.ok(counts().draws>20,kind+' draws');
   total++;
 }
 assert.equal(total,1625);
});
test('appearance presets, mirroring, kit changes, accessories and keeper actions',async()=>{
 const {CHARACTER_ART:art}=await modPromise;
 for(const kind of ['front','quarterFront','side','quarterBack','back']){
  for(const dir of [-1,1])for(let a=0;a<6;a++)for(let n=0;n<6;n++)for(let mouth=0;mouth<8;mouth++){
   const av={face:n%5,beard:a%5,style:n,eyes:a,eyeColor:n%6,brows:a,nose:n,lips:mouth,accessory:a,skin:'#7a4d38',hair:'#202125'};
   const {c,counts}=fakeCanvas();
   art.draw(c,{src:{num:1},keeper:true,action:'keeperDiveCatch'},av,{primary:'#1c9b65',secondary:'#f3ece0',trim:'#e7b03f'},{kind,side:dir},{skin:av.skin,hair:av.hair,headScale:1,run:.6,kick:true,sliding:true});
   assert.equal(counts().saves,0);
  }
 }
});
test('offline caching and inline browser test fixture both load new art module',()=>{
 const build=fs.readFileSync(path.resolve(__dirname,'../scripts/build.py'),'utf8');
 const sw=fs.readFileSync(path.resolve(__dirname,'../sw.js'),'utf8');
 assert.match(build,/'artpose','characterart','concepthero','conceptmodular','crownroyals','render'/);
 assert.match(sw,/'artpose','characterart','concepthero','conceptmodular','crownroyals','render'/);
 assert.match(sw,/smf-082538-concept-front-hair-v1/);
});
test('production integration remains in match renderer',()=>{
 const source=fs.readFileSync(path.resolve(__dirname,'../src/modules/render.js'),'utf8');
 assert.match(source,/import\s+\{CHARACTER_ART\}\s+from\s+["']\.\/characterart\.js["']/);
 assert.match(source,/CHARACTER_ART\.draw\(ctx,p,av,team,view,/);
});

test('all 13 hair styles have independent authored paths in each principal view',async()=>{
 const {CHARACTER_ART:art}=await modPromise;
 for(const kind of ['front','quarterFront','side','quarterBack','back']){
  const signatures=[];
  for(let style=0;style<13;style++){
   const {c,counts}=fakeCanvas(),out=[];let path=[];
   for(const op of ['moveTo','lineTo','quadraticCurveTo','bezierCurveTo']){
    c[op]=(...args)=>path.push([op,...args]);
   }
   c.beginPath=()=>{path=[]};
   c.fill=()=>out.push(['fill',c.fillStyle,path]);
   c.stroke=()=>out.push(['stroke',c.strokeStyle,path]);
   const av={face:2,style,beard:0,skin:'#dca27f',hair:'#503a2b',eyes:8,brows:4,nose:2,lips:1};
   art.draw(c,player,av,team,{kind,side:1},{skin:av.skin,hair:av.hair,headScale:1});
   assert.equal(counts().saves,0);
   signatures.push(JSON.stringify(out));
  }
  assert.equal(new Set(signatures).size,13,kind+' must show 13 distinct hairstyles');
 }
});
test('the full beard is jaw-fitted across every face type including rear-facing',async()=>{
 const {CHARACTER_ART:art}=await modPromise;
 for(const kind of ['front','quarterFront','side','quarterBack','back']){
  for(let face=0;face<5;face++){
   function trace(beard){
    let path=[],ops=[];
    const {c,counts}=fakeCanvas();
    for(const op of ['moveTo','lineTo','quadraticCurveTo','bezierCurveTo']){
     c[op]=(...args)=>path.push([op,...args]);
    }
    c.beginPath=()=>{path=[]};
    c.fill=()=>ops.push(['fill',c.fillStyle,path]);
    c.stroke=()=>ops.push(['stroke',c.strokeStyle,path]);
    const av={face,style:1,beard,skin:'#dca27f',hair:'#503a2b',eyes:8,brows:4,nose:2,lips:1};
    art.draw(c,player,av,team,{kind,side:1},{skin:av.skin,hair:av.hair,headScale:1});
    assert.equal(counts().saves,0);
    return JSON.stringify(ops);
   }
   assert.notEqual(trace(0),trace(3),kind+' face '+face+' full beard differs from clean-shaven');
   if(kind==='back')assert.equal(trace(0),trace(4),'moustache must not show through rear cranium');
  }
 }
});

test('all player studio art choices draw unique instructions wherever visible',async()=>{
 const {CHARACTER_ART:art}=await modPromise;
 const counts={face:5,style:13,eyes:20,brows:20,eyeColor:6,nose:6,lips:8,beard:5,accessory:6,freckles:4,scar:6,tattoo:6};
 const defaults={face:0,style:1,eyes:0,brows:0,eyeColor:0,nose:0,lips:0,beard:0,accessory:0,freckles:0,scar:0,tattoo:0,skin:'#dca27f',hair:'#503a2b'};
 for(const [field,count] of Object.entries(counts)){
  const traces=new Set();
  for(let index=0;index<count;index++){
   const {c,counts:state}=fakeCanvas();
   const log=[];let path=[];
   const commands=['moveTo','lineTo','quadraticCurveTo','bezierCurveTo','ellipse','roundRect'];
   for(const command of commands)c[command]=(...args)=>path.push([command,...args]);
   c.beginPath=()=>{path=[]};
   c.fill=()=>log.push(['fill',c.fillStyle,path]);
   c.stroke=()=>log.push(['stroke',c.strokeStyle,path]);
   const av={...defaults,[field]:index};
   art.draw(c,player,av,team,{kind:'front',side:1},{skin:av.skin,hair:av.hair,headScale:1});
   assert.equal(state().saves,0,field+' '+index);
   traces.add(JSON.stringify(log));
  }
  assert.equal(traces.size,count,field+' '+count+' selected options need distinct graphics');
 }
});