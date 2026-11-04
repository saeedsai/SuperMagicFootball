// Character Art III: accidental headbands regression and complete directional geometry.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=p=>fs.readFileSync(path.join(root,p),'utf8');
const palette=JSON.parse(source('data/graphics/procedural_assets.json'));
const expanded=source('src/modules/expanded.js').replace('import {GAME_ASSETS} from "../assets.js";','').replace(/export \{EXPANDED\};?\s*$/,'return EXPANDED;');
const avatarFor=new Function('GAME_ASSETS',expanded)({graphics:palette}).avatarFor;
const mod=import('file://'+path.join(root,'src/modules/characterart.js'));
function canvas(){
 let stack=0,draws=0,path=[];const shades=[],shapes=[],texts=[],scales=[],translations=[];
 const ctx={createLinearGradient(){return{addColorStop(n,col){shades.push(String(col));}}},save(){stack++},restore(){stack--;assert.ok(stack>=0);},beginPath(){draws++;path=[]},moveTo(...p){path.push(['M',...p]);},lineTo(...p){path.push(['L',...p]);},quadraticCurveTo(...p){path.push(['Q',...p]);},bezierCurveTo(...p){path.push(['C',...p]);},ellipse(...p){path.push(['E',...p]);},roundRect(...p){path.push(['R',...p]);},fill(){shapes.push({type:'fill',style:this.fillStyle,path:path.slice()});},stroke(){shapes.push({type:'stroke',style:this.strokeStyle,width:this.lineWidth,path:path.slice()});},closePath(){path.push(['Z']);},clip(){},translate(x,y){translations.push([x,y]);},rotate(){},scale(x,y){scales.push([x,y]);},fillText(text,x,y){texts.push({type:'fill',text,x,y,font:this.font,color:this.fillStyle});},strokeText(text,x,y){texts.push({type:'stroke',text,x,y,font:this.font,color:this.strokeStyle,width:this.lineWidth});}};
 return {ctx,stack:()=>stack,draws:()=>draws,shades,shapes,texts,scales,translations};
}
test('no headband, scar or random tattoo for regular football identities',()=>{
 for(const name of ['Lionel Messi','Cristiano Ronaldo','Mohamed Salah','Erling Haaland','Vinícius Júnior','Jude Bellingham','Luka Modrić','Sergio Ramos','Son Heung-min','Raphinha']){
  const a=avatarFor({id:name,name});assert.equal(a.accessory,0,name+' headband');assert.equal(a.scar,0,name+' scar');assert.equal(a.tattoo,0,name+' tattoo');
 }
 assert.equal(avatarFor({name:'Ronaldinho'}).accessory,1,'explicit curated band still works');
});
test('all 5 base projections never paint headbands from hairstyles alone',async()=>{
 const {CHARACTER_ART:art}=await mod;assert.equal(art.version,3);
 for(const kind of ['front','quarterFront','side','quarterBack','back'])for(let style=0;style<13;style++){
  const av={face:2,style,beard:2,accessory:0,skin:'#b7835f',hair:'#332422',eyes:8,brows:4,nose:1,lips:2};
  const {ctx,stack,draws,shades}=canvas();
  art.draw(ctx,{src:{num:10},action:'idle'},av,{primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'},{kind,side:1},{skin:av.skin,hair:av.hair,headScale:1});
  assert.equal(stack(),0);assert.ok(draws()>30);
  assert.ok(!shades.includes('#e4e9f1'),'accidental white headband from '+style+' / '+kind);
  const explicit=canvas();art.draw(explicit.ctx,{src:{num:10},action:'idle'},{...av,accessory:1},{primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'},{kind,side:1},{skin:av.skin,hair:av.hair,headScale:1});
  assert.ok(explicit.shades.includes('#e4e9f1'),'missing explicit headband for '+kind);
 }
});
test('layered fringe option is hairstyle and no longer a headband',()=>{
 assert.equal(palette.studioAssetLabels.style[8],'Layered Fringe');
 assert.equal(palette.studioAssetLabels.accessory[1],'Headband');
});

test('front-facing kits render an outlined palette-colored shield; side and back views omit it',async()=>{
 const {CHARACTER_ART:art}=await mod;
 const kit={primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'};
 function render(kind){
  const out=canvas();
  art.draw(out.ctx,{src:{num:10},action:'idle'},
   {face:0,style:1,beard:0,eyes:6,brows:4,nose:2,lips:1,skin:'#dca27f',hair:'#503a2b'},
   kit,{kind,side:1},{skin:'#dca27f',hair:'#503a2b',headScale:1});
  return out.shapes;
 }
 const outerStart=['M',-13.7,-49.8],innerStart=['M',-12.2,-48.6];
 for(const kind of ['front','quarterFront']){
  const shapes=render(kind);
  const outer=shapes.find(s=>s.type==='fill'&&JSON.stringify(s.path[0])===JSON.stringify(outerStart));
  const inner=shapes.find(s=>s.type==='fill'&&JSON.stringify(s.path[0])===JSON.stringify(innerStart));
  assert.ok(outer,kind+' shield silhouette');
  assert.equal(outer.style,kit.trim,kind+' shield follows kit trim');
  assert.equal(outer.path.at(-1)[0],'Z',kind+' shield closes');
  assert.ok(inner,kind+' inset shield field');
  assert.notEqual(inner.style,outer.style,kind+' inset contrasts with trim');
  assert.ok(shapes.some(s=>s.type==='stroke'&&s.style==='#263149'&&JSON.stringify(s.path[0])===JSON.stringify(outerStart)),kind+' outlined shield');
 }
 for(const kind of ['side','quarterBack','back']){
  const shapes=render(kind);
  assert.ok(!shapes.some(s=>JSON.stringify(s.path[0])===JSON.stringify(outerStart)),kind+' has no front chest crest');
 }
});

test('front kit numbers keep readable gold fill and choose a contrasting outline across kit values',async()=>{
 const {CHARACTER_ART:art}=await mod;
 const kits=[
  {primary:'#ed5834',secondary:'#f3f3ea',trim:'#f2bc46',outline:'#fff4d0'},
  {primary:'#f2eee2',secondary:'#172a43',trim:'#d9a93f',outline:'#263149'},
  {primary:'#123055',secondary:'#f3f3ea',trim:'#f2bc46',outline:'#fff4d0'}
 ];
 for(const kit of kits)for(const kind of ['front','quarterFront']){
  const out=canvas();
  art.draw(out.ctx,{src:{num:10},action:'idle'},
   {face:0,style:1,beard:0,eyes:6,brows:4,nose:2,lips:1,skin:'#dca27f',hair:'#503a2b'},
   kit,{kind,side:1},{skin:'#dca27f',hair:'#503a2b',headScale:1});
  const fill=out.texts.find(t=>t.type==='fill'&&t.text==='10');
  const stroke=out.texts.find(t=>t.type==='stroke'&&t.text==='10');
  assert.ok(fill&&stroke,kind+' jersey number');
  assert.equal(fill.color,kit.trim,kind+' number retains kit trim fill');
  assert.equal(stroke.color,kit.outline,kind+' outline contrasts with '+kit.primary);
  assert.equal(stroke.width,1.8,kind+' readable front outline');
  assert.match(fill.font,/12px/,kind+' game-scale number size');
 }
 const rear=canvas();
 art.draw(rear.ctx,{src:{num:10},action:'idle'},
  {face:0,style:1,beard:0,eyes:6,brows:4,nose:2,lips:1,skin:'#dca27f',hair:'#503a2b'},
  kits[0],{kind:'back',side:1},{skin:'#dca27f',hair:'#503a2b',headScale:1});
 assert.match(rear.texts.find(t=>t.type==='fill'&&t.text==='10').font,/21px/,'rear number size stays unchanged');
 assert.equal(rear.texts.find(t=>t.type==='stroke'&&t.text==='10').width,2.8,'rear outline stays unchanged');
});

test('shirt numbers stay readable when left-facing art mirrors the player',async()=>{
 const {CHARACTER_ART:art}=await mod;
 function render(kind,side){
  const out=canvas();
  art.draw(out.ctx,{src:{num:10},action:'idle'},
   {face:0,style:1,beard:0,eyes:6,brows:4,nose:2,lips:1,skin:'#dca27f',hair:'#503a2b'},
   {primary:'#ed5834',secondary:'#f3f3ea',trim:'#f2bc46'},{kind,side},{skin:'#dca27f',hair:'#503a2b',headScale:1});
  return out;
 }
 for(const kind of ['front','quarterFront','back','quarterBack']){
  const right=render(kind,1),left=render(kind,-1);
  assert.deepEqual(left.texts,right.texts,kind+' number appearance and placement are stable');
  assert.deepEqual(JSON.parse(JSON.stringify(left.shapes)),JSON.parse(JSON.stringify(right.shapes)),kind+' badge and body geometry remain unchanged');
  assert.ok(left.scales.some(([x,y])=>x===-1&&y===1),kind+' text has its own counter-mirror');
  assert.ok(!right.scales.some(([x,y])=>x===-1&&y===1),kind+' normal-facing text is not mirrored');
 }
 for(const side of [1,-1])assert.equal(render('side',side).texts.length,0,'side profile keeps its no-number rule');
});

test('cleat stripe and stud accents follow each team trim color',async()=>{
 const {CHARACTER_ART:art}=await mod;
 for(const trim of ['#30b56a','#e25a53','#d8dbe2']){
  const out=canvas();
  art.draw(out.ctx,{src:{num:10},action:'idle'},
   {face:0,style:1,beard:0,eyes:6,brows:4,nose:2,lips:1,skin:'#dca27f',hair:'#503a2b'},
   {primary:'#2675ca',secondary:'#f3f3ea',trim},{kind:'front',side:1},
   {skin:'#dca27f',hair:'#503a2b',headScale:1});
  const leftStripe=[['M',-15,-5],['L',-11,-3],['L',-7,-2],['L',-3,-1]];
  const rightStripe=[['M',11,-5],['L',15,-3],['L',19,-2],['L',23,-1]];
  for(const path of [leftStripe,rightStripe])
   assert.ok(out.shapes.some(s=>s.type==='stroke'&&s.width===1.35&&s.style===trim&&JSON.stringify(s.path)===JSON.stringify(path)),trim+' cleat stripe uses team trim');
  for(const center of [[-10,5],[31,5]])
   assert.ok(out.shapes.some(s=>s.type==='fill'&&s.style===trim&&s.path[0]?.[0]==='E'&&s.path[0][1]===center[0]&&s.path[0][2]===center[1]),trim+' cleat stud uses team trim');
 }
});

test('lower sock shading follows the team secondary color without changing leg geometry',async()=>{
 const {CHARACTER_ART:art}=await mod;
 const blend=(hex,n)=>'#'+hex.match(/[a-f\d]{2}/gi).map(x=>{
  const v=parseInt(x,16),next=Math.round(n>=0?v+(255-v)*n:v*(1+n));
  return Math.max(0,Math.min(255,next)).toString(16).padStart(2,'0');
 }).join('');
 for(const shorts of ['#f3f3ea','#df4149','#329b65','#263c60']){
  const out=canvas();
  art.draw(out.ctx,{src:{num:10},action:'idle'},
   {face:0,style:1,beard:0,eyes:6,brows:4,nose:2,lips:1,skin:'#dca27f',hair:'#503a2b'},
   {primary:'#2675ca',secondary:shorts,trim:'#f2bc46'},{kind:'front',side:1},
   {skin:'#dca27f',hair:'#503a2b',headScale:1});
  const far=[['M',-13,-10],['L',-13,-5]],near=[['M',13,-10],['L',13,-5]];
  assert.ok(out.shapes.some(s=>s.type==='stroke'&&s.width===10&&s.style===blend(shorts,-.15)&&JSON.stringify(s.path)===JSON.stringify(far)),shorts+' far sock shades from kit secondary');
  assert.ok(out.shapes.some(s=>s.type==='stroke'&&s.width===10&&s.style===blend(shorts,.10)&&JSON.stringify(s.path)===JSON.stringify(near)),shorts+' near sock shades from kit secondary');
 }
});

test('Curly Volume rear nape curls follow the skull contour instead of a flat row',async()=>{
 const {CHARACTER_ART:art}=await mod;
 const out=canvas();
 art.draw(out.ctx,{src:{num:10},action:'idle'},
  {face:1,style:11,beard:0,eyes:8,brows:6,nose:2,lips:2,skin:'#b7835f',hair:'#282524'},
  {primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'},{kind:'back',side:1},
  {skin:'#b7835f',hair:'#282524',headScale:1});
 const ellipses=out.shapes.flatMap(s=>s.path.filter(v=>v[0]==='E'));
 for(let i=-4;i<=4;i++){
  const x=i*7.1,y=4+Math.abs(i)*1.8;
  const path=[['E',x,y,7.3,6.6,0,0,Math.PI*2],['Z']];
  assert.ok(ellipses.some(e=>e[1]===x&&e[2]===y&&e[3]===7.3&&e[4]===6.6),`rear nape curl at ${x},${y}`);
  assert.ok(out.shapes.some(s=>s.type==='stroke'&&s.style==='rgba(20,19,18,0.84)'&&s.width===1.0&&JSON.stringify(s.path)===JSON.stringify(path)),`rear nape curl shading matches the hairstyle at ${x},${y}`);
 }
 assert.ok(Math.max(...[-4,-3,-2,-1,0,1,2,3,4].map(i=>4+Math.abs(i)*1.8))-
  Math.min(...[-4,-3,-2,-1,0,1,2,3,4].map(i=>4+Math.abs(i)*1.8))>6,'row curves around the back of the skull');
});

test('Side Pony remains visible below the rear skull in back projection',async()=>{
 const {CHARACTER_ART:art}=await mod;
 const av={face:1,style:10,beard:0,eyes:8,brows:6,nose:2,lips:2,skin:'#b7835f',hair:'#282524'};
 function render(kind){
  const out=canvas();
  art.draw(out.ctx,{src:{num:10},action:'idle'},av,
   {primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'},{kind,side:1},
   {skin:'#b7835f',hair:'#282524',headScale:1});
  return out.shapes.flatMap(s=>s.path.filter(v=>v[0]==='E'));
 }
 const rear=render('back'),side=render('side');
 assert.ok(rear.some(e=>e[1]===0&&e[2]===34&&e[3]===8.5&&e[4]===26),'rear tail extends below the skull');
 assert.ok(rear.some(e=>e[1]===-2.5&&e[2]===39&&e[3]===3.2&&e[4]===15),'rear tail keeps a visible hair highlight');
 assert.ok(side.some(e=>e[1]===-28&&e[2]===21&&e[3]===6&&e[4]===14),'side-view ponytail placement stays unchanged');
});

test('short-hair back projections draw both ears while quarter-back keeps its single visible ear',async()=>{
 const {CHARACTER_ART:art}=await mod;
 const av={face:2,style:2,beard:0,eyes:8,brows:6,nose:2,lips:2,skin:'#b7835f',hair:'#282524'};
 function render(kind){
  const out=canvas();
  art.draw(out.ctx,{src:{num:10},action:'idle'},av,
   {primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'},{kind,side:1},
   {skin:'#b7835f',hair:'#282524',headScale:1});
  return out.translations;
 }
 const back=render('back'),quarterBack=render('quarterBack');
 for(const pos of [[-33,7],[33,7]])assert.ok(back.some(([x,y])=>x===pos[0]&&y===pos[1]),`back ear at ${pos}`);
 assert.ok(quarterBack.some(([x,y])=>x===24&&y===8),'quarter-back keeps its existing near ear');
 assert.ok(!quarterBack.some(([x,y])=>x===-33&&y===7),'quarter-back does not add a second hidden far ear');
});

test('quarter-front far eye uses subtler contrast while frontal eyes keep full depth',async()=>{
 const {CHARACTER_ART:art}=await mod;
 const blend=(hex,n)=>'#'+hex.match(/[a-f\d]{2}/gi).map(x=>{
  const v=parseInt(x,16),next=Math.round(n>=0?v+(255-v)*n:v*(1+n));
  return Math.max(0,Math.min(255,next)).toString(16).padStart(2,'0');
 }).join('');
 function render(kind){
  const out=canvas();
  art.draw(out.ctx,{src:{num:10},action:'idle'},
   {face:1,style:1,beard:0,eyes:8,eyeColor:2,brows:6,nose:2,lips:2,skin:'#b7835f',hair:'#282524'},
   {primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'},{kind,side:1},
   {skin:'#b7835f',hair:'#282524',headScale:1});
  return out;
 }
 const base='#57799d',far=blend(base,-.14),front=render('front'),quarter=render('quarterFront');
 assert.ok(front.shades.filter(s=>s===base).length>=2,'both frontal irises retain full color');
 assert.ok(!front.shades.includes(far),'frontal eyes do not receive far-eye dimming');
 assert.ok(quarter.shades.includes(base)&&quarter.shades.includes(far),'quarter view distinguishes near and far iris tones');
 assert.ok(quarter.shapes.some(s=>s.type==='fill'&&s.style==='rgba(255,255,255,0.72)'),'far eye primary catchlight is softened');
 assert.ok(quarter.shapes.some(s=>s.type==='fill'&&s.style==='rgba(255,255,255,0.45)'),'far eye secondary catchlight is softened');
});

test('sweatband is visibly wider and textured while the standard headband stays unchanged',async()=>{
 const {CHARACTER_ART:art}=await mod;
 function render(accessory,kind='front'){
  const out=canvas();
  art.draw(out.ctx,{src:{num:10},action:'idle'},
   {face:1,style:2,beard:0,eyes:8,eyeColor:2,brows:6,nose:2,lips:2,skin:'#b7835f',hair:'#282524',accessory},
   {primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'},{kind,side:1},
   {skin:'#b7835f',hair:'#282524',headScale:1});
  return out;
 }
 const headband=render(1),sweatband=render(5),side=render(5,'side');
 assert.ok(headband.shapes.some(s=>s.type==='fill'&&JSON.stringify(s.path[0])===JSON.stringify(['M',-33,-21])),'standard headband retains original narrow path');
 assert.ok(sweatband.shapes.some(s=>s.type==='fill'&&JSON.stringify(s.path[0])===JSON.stringify(['M',-33,-24])),'sweatband uses wider fabric path');
 assert.ok(sweatband.shapes.some(s=>s.type==='stroke'&&s.width===.75&&s.style==='rgba(82,106,126,0.38)'&&JSON.stringify(s.path)===JSON.stringify([['M',-29,-15],['L',0,-17],['L',29,-15]])),'sweatband has a separate fabric seam');
 assert.ok(side.shapes.some(s=>s.type==='fill'&&JSON.stringify(s.path[0])===JSON.stringify(['M',-29,-24])),'profile sweatband keeps the wider band silhouette');
});

test('freckle options use visible varied cheek positions at game scale',async()=>{
 const {CHARACTER_ART:art}=await mod,skin='#b7835f';
 const blend=(hex,n)=>'#'+hex.match(/[a-f\d]{2}/gi).map(x=>{
  const v=parseInt(x,16),next=Math.round(n>=0?v+(255-v)*n:v*(1+n));
  return Math.max(0,Math.min(255,next)).toString(16).padStart(2,'0');
 }).join('');
 const [r,g,b]=blend(skin,-.48).match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16)),freckleInk=`rgba(${r},${g},${b},0.68)`;
 for(const [level,expected] of [[0,0],[1,4],[2,9],[3,14]]){
  const out=canvas();
  art.draw(out.ctx,{src:{num:10},action:'idle'},
   {face:1,style:2,beard:0,eyes:8,eyeColor:2,brows:6,nose:2,lips:2,freckles:level,skin,hair:'#282524'},
   {primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'},{kind:'front',side:1},
   {skin,hair:'#282524',headScale:1});
  const dots=out.shapes.filter(s=>s.type==='fill'&&s.style===freckleInk&&s.path[0]?.[0]==='E');
  assert.equal(dots.length,expected,`freckle level ${level} dot count`);
  if(expected){
   assert.ok(new Set(dots.map(s=>s.path[0][2])).size>1,`freckle level ${level} varies cheek height`);
   assert.ok(dots.every(s=>s.path[0][3]>=1&&s.path[0][4]===.95),`freckle level ${level} keeps visible dot size`);
  }
 }
});

test('closed-mouth contours retain readable definition at front, quarter and profile scales',async()=>{
 const {CHARACTER_ART:art}=await mod,skin='#b7835f';
 const blend=(hex,n)=>'#'+hex.match(/[a-f\d]{2}/gi).map(x=>{
  const v=parseInt(x,16),next=Math.round(n>=0?v+(255-v)*n:v*(1+n));
  return Math.max(0,Math.min(255,next)).toString(16).padStart(2,'0');
 }).join('');
 const [r,g,b]=blend(blend(skin,-.22),0).match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16));
 for(const kind of ['front','quarterFront','side']){
  const out=canvas();
  art.draw(out.ctx,{src:{num:10},action:'idle'},
   {face:1,style:2,beard:0,eyes:8,eyeColor:2,brows:6,nose:2,lips:2,freckles:0,skin,hair:'#282524'},
   {primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'},{kind,side:1},
   {skin,hair:'#282524',headScale:1});
  const lipFill=`rgba(${r},${g},${b},0.64)`;
  assert.ok(out.shapes.some(s=>s.type==='fill'&&s.style===lipFill&&s.path[0]?.[0]==='M'),kind+' closed mouth has a defined fill');
  assert.ok(out.shapes.some(s=>s.type==='stroke'&&s.width===1.8&&s.path.length===4),kind+' closed mouth has a clear outer contour');
  assert.ok(out.shapes.some(s=>s.type==='stroke'&&s.width===1.1&&s.path[0]?.[1]===-3),kind+' closed mouth retains lower-lip highlight');
 }
 const open=canvas();
 art.draw(open.ctx,{src:{num:10},action:'idle'},
  {face:1,style:2,beard:0,eyes:8,eyeColor:2,brows:6,nose:2,lips:4,freckles:0,skin,hair:'#282524'},
  {primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'},{kind:'front',side:1},
  {skin,hair:'#282524',headScale:1});
 assert.ok(!open.shapes.some(s=>s.type==='stroke'&&s.width===1.8&&s.path.length===4),'open mouth contour behavior stays separate');
});

test('standard hands gain inward thumb forms while keeper glove shapes stay separate',async()=>{
 const {CHARACTER_ART:art}=await mod,skin='#b7835f';
 const blend=(hex,n)=>'#'+hex.match(/[a-f\d]{2}/gi).map(x=>{
  const v=parseInt(x,16),next=Math.round(n>=0?v+(255-v)*n:v*(1+n));
  return Math.max(0,Math.min(255,next)).toString(16).padStart(2,'0');
 }).join('');
 const kit={primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'};
 function render(player){
  const out=canvas();
  art.draw(out.ctx,player,
   {face:1,style:2,beard:0,eyes:8,eyeColor:2,brows:6,nose:2,lips:2,freckles:0,skin,hair:'#282524'},
   kit,{kind:'front',side:1},{skin,hair:'#282524',headScale:1});
  return out;
 }
 const fieldPlayer=render({src:{num:10},action:'idle'}),near=blend(skin,.24),far=blend(skin,-.06);
 assert.equal(fieldPlayer.shapes.filter(s=>s.type==='fill'&&(s.style===near||s.style===far)&&s.path[0]?.[0]==='M').length,2,'ordinary player has two inward thumb forms');
 assert.equal(fieldPlayer.shapes.filter(s=>s.type==='stroke'&&s.style==='#263149'&&s.width===.8).length,2,'both thumb forms retain a clean cartoon outline');
 const keeper=render({src:{num:10},keeper:true,action:'keeperCatch'});
 assert.equal(keeper.shapes.filter(s=>s.type==='fill'&&(s.style===near||s.style===far)&&s.path[0]?.[0]==='M').length,0,'keeper hands do not receive ordinary thumb forms');
 assert.ok(keeper.shapes.some(s=>s.type==='fill'&&s.style==='#f4fbff'),'keeper catch-glove palm remains intact');
});

test('outfield near elbow fold adds definition without changing far or keeper arms',async()=>{
 const {CHARACTER_ART:art}=await mod,skin='#b7835f',creasePath=[['M',33,-39],['L',35,-37.4],['L',38,-38.7]];
 const blend=(hex,n)=>'#'+hex.match(/[a-f\d]{2}/gi).map(x=>{
  const v=parseInt(x,16),next=Math.round(n>=0?v+(255-v)*n:v*(1+n));
  return Math.max(0,Math.min(255,next)).toString(16).padStart(2,'0');
 }).join('');
 function render(player){
  const out=canvas();
  art.draw(out.ctx,player,
   {face:1,style:2,beard:0,eyes:8,eyeColor:2,brows:6,nose:2,lips:2,freckles:0,skin,hair:'#282524'},
   {primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'},{kind:'front',side:1},
   {skin,hair:'#282524',headScale:1});
  return out;
 }
 const field=render({src:{num:10},action:'idle'}),crease=`rgba(${blend(skin,-.28).match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16)).join(',')},0.48)`;
 const fold=s=>s.shapes.some(shape=>shape.type==='stroke'&&shape.width===.9&&shape.style===crease&&JSON.stringify(shape.path)===JSON.stringify(creasePath));
 assert.ok(fold(field),'near outfield elbow has the inward fold');
 const keeper=render({src:{num:10},keeper:true,action:'keeperCatch'});
 assert.ok(!fold(keeper),'keeper arms do not receive outfield elbow detail');
});

test('profile noses use a rounded projected tip while all six shapes stay distinct and view anchors remain fixed',async()=>{
 const {CHARACTER_ART:art}=await mod,skin='#b7835f',hair='#282524';
 const kit={primary:'#2675ca',secondary:'#f3f3ea',trim:'#f2bc46'};
 function nosePath(kind,style){
  const out=canvas();
  art.draw(out.ctx,{src:{num:10},action:'idle'},
   {face:1,style:2,beard:0,eyes:8,eyeColor:2,brows:6,nose:style,lips:2,skin,hair},
   kit,{kind,side:1},{skin,hair,headScale:1});
  assert.ok(out.translations.some(([x,y])=>x===(kind==='side'?23:kind==='quarterFront'?14:0)&&y===(kind==='front'?14:15)),kind+' nose anchor remains unchanged');
  if(kind==='front')return JSON.stringify(out.shapes);
  const candidates=out.shapes.filter(s=>s.type==='fill'&&s.path[0]?.[0]==='M'&&s.path[0]?.[1]===-3&&s.path.length===7&&s.path[1]?.[0]==='Q'&&s.path[1]?.[1]===.5&&s.path[1]?.[3]===2&&s.path[1]?.[4]===-1.5);
  assert.equal(candidates.length,1,kind+' exposes one nose silhouette for style '+style);
  return candidates[0].path;
 }
 for(const kind of ['side','quarterFront']){
  const paths=Array.from({length:6},(_,style)=>nosePath(kind,style));
  assert.equal(new Set(paths.map(JSON.stringify)).size,6,kind+' keeps six distinct nose shapes');
  for(const path of paths){
   assert.equal(path[3][0],'Q',kind+' nose bridge rounds into the tip');
   assert.equal(path[3][0],'Q',kind+' tip uses a curved transition');
   assert.ok(path[3][1]-path[3][3]<1.1,kind+' nose tip curvature avoids a sharp pointed wedge');
  }
 }
 const fronts=Array.from({length:6},(_,style)=>nosePath('front',style));
 assert.equal(new Set(fronts.map(JSON.stringify)).size,6,'front nose options remain distinct');
});
