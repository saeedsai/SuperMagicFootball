// Character Art III: accidental headbands regression and complete directional geometry.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=p=>fs.readFileSync(path.join(root,p),'utf8');
const palette=JSON.parse(source('data/graphics/procedural_assets.json'));
const expanded=source('src/modules/expanded.js').replace('import {GAME_ASSETS} from "../assets.js";','').replace(/export \{EXPANDED\};?\s*$/,'return EXPANDED;');
const avatarFor=new Function('GAME_ASSETS',expanded)({graphics:palette}).avatarFor;
const mod=import('file://'+path.join(root,'src/modules/characterart.js'));
function canvas(){
 let stack=0,draws=0;const shades=[];
 const ctx={createLinearGradient(){return{addColorStop(n,col){shades.push(String(col));}}},save(){stack++},restore(){stack--;assert.ok(stack>=0);},beginPath(){draws++},moveTo(){},lineTo(){},quadraticCurveTo(){},bezierCurveTo(){},ellipse(){},roundRect(){},fill(){},stroke(){},closePath(){},clip(){},translate(){},rotate(){},scale(){},fillText(){},strokeText(){}};
 return {ctx,stack:()=>stack,draws:()=>draws,shades};
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