// Render all shipped players with their real runtime avatar presets, no browser dependency.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=p=>JSON.parse(read(p));
const groups=['arcade','national26','club26','legends','continental','bpw_worldcup','bpw_alltime'];
const views=['front','quarterFront','side','quarterBack','back'];
function actualAvatarFor(graphics){
 const source=read('src/modules/expanded.js')
 .replace('import {GAME_ASSETS} from "../assets.js";','')
 .replace(/export\s+\{EXPANDED\};?\s*$/,'return EXPANDED;');
 return new Function('GAME_ASSETS',source)({graphics}).avatarFor;
}
function mockCanvas(){
 let depth=0,draws=0;
 const verify=(...values)=>{for(const n of values)assert.ok(Number.isFinite(n),'nonfinite canvas coordinate: '+n);};
 const ctx={
  createLinearGradient(){return {addColorStop(n,clr){verify(n);assert.equal(typeof clr,'string')}}},
  beginPath(){draws++},moveTo(...v){verify(...v)},lineTo(...v){verify(...v)},
  bezierCurveTo(...v){verify(...v)},quadraticCurveTo(...v){verify(...v)},
  ellipse(x,y,rx,ry){verify(x,y,rx,ry);assert.ok(rx>0&&ry>0)},
  roundRect(){},fill(){},stroke(){},closePath(){},clip(){},
  save(){depth++},restore(){depth--;assert.ok(depth>=0,'restore underflow')},
  translate(...v){verify(...v)},rotate(...v){verify(...v)},scale(...v){verify(...v)},
  fillText(){},strokeText(){}
 };
 return {ctx,depth:()=>depth,draws:()=>draws};
}
test('all 2,676 roster players render across five view projections with their persisted presets',async()=>{
 const {CHARACTER_ART:art}=await import(pathToFileURL(path.join(root,'src/modules/characterart.js')).href);
 const graphics=data('data/graphics/procedural_assets.json');
 const overrides=data('data/graphics/player_appearances.json');
 const avatarFor=actualAvatarFor(graphics);
 const {ctx,depth,draws}=mockCanvas();
 const ids=new Set(),teamSet=new Set();
 let players=0,custom=0,renders=0;
 for(const group of groups){
  const teams=data('data/players/'+group+'.json');
  for(const [teamId,roster] of Object.entries(teams)){
   assert.equal(roster.length,12,'squad '+teamId);
   assert.ok(!teamSet.has(teamId),'unique team '+teamId);teamSet.add(teamId);
   for(const original of roster){
    assert.ok(!ids.has(original.id),'unique player '+original.id);ids.add(original.id);
    const player={...original},preset=overrides[teamId]?.[original.id];
    if(preset){custom++;if(preset.avatar)player.avatar=preset.avatar;if(preset.appearance)player.appearance=preset.appearance;}
    const avatar={...avatarFor(player),...(player.appearance||{})};
    assert.match(avatar.skin,/^#[0-9a-f]{6}$/i,player.id+' skin');
    assert.match(avatar.hair,/^#[0-9a-f]{6}$/i,player.id+' hair');
    for(const kind of views){
     art.draw(ctx,{src:player,keeper:player.role==='GK',action:'idle'},
      avatar,{primary:'#286abd',secondary:'#f5f0df',trim:'#efbd3a'},
      {kind,side:1},{skin:avatar.skin,hair:avatar.hair,headScale:1,run:0});
     assert.equal(depth(),0,'canvas stack '+player.id+' '+kind);renders++;
    }
    players++;
   }
  }
 }
 assert.equal(teamSet.size,223);assert.equal(players,2676);
 assert.equal(custom,84);assert.equal(ids.size,2676);
 assert.equal(renders,13380);assert.ok(draws()>100000);
});
