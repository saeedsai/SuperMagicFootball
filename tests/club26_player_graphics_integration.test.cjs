// Cross-agent contract: independently edited FC27 club JSON and character-art runtime.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const squads=JSON.parse(read('data/players/club26.json'));
const graphics=JSON.parse(read('data/graphics/procedural_assets.json'));
const overrides=JSON.parse(read('data/graphics/player_appearances.json'));
function avatarResolver(){
 const source=read('src/modules/expanded.js')
  .replace('import {GAME_ASSETS} from "../assets.js";','')
  .replace(/export\s+\{EXPANDED\};?\s*$/,'return EXPANDED;');
 return new Function('GAME_ASSETS',source)({graphics}).avatarFor;
}
function mockCanvas(){
 let stack=0,draws=0;
 const finite=(...v)=>v.forEach(x=>assert.ok(Number.isFinite(x),'nonfinite graphic coordinate'));
 const ctx={
  createLinearGradient(){return {addColorStop(n,color){finite(n);assert.equal(typeof color,'string')}}},
  save(){stack++},restore(){stack--;assert.ok(stack>=0,'negative Canvas stack')},
  beginPath(){draws++},moveTo(...v){finite(...v)},lineTo(...v){finite(...v)},
  bezierCurveTo(...v){finite(...v)},quadraticCurveTo(...v){finite(...v)},
  ellipse(x,y,rx,ry){finite(x,y,rx,ry);assert.ok(rx>0&&ry>0)},
  roundRect(){},fill(){},stroke(){},closePath(){},clip(){},
  translate(...v){finite(...v)},rotate(...v){finite(...v)},scale(...v){finite(...v)},
  fillText(){},strokeText(){}
 };
 return {ctx,stack:()=>stack,draws:()=>draws};
}
test('club26 database equals runtime roster and every rating source is labelled',async()=>{
 const {ROSTER_CORRECTIONS}=await import(pathToFileURL(path.join(root,'src/roster_corrections.js')).href);
 assert.equal(Object.keys(squads).length,32);
 const ratings={fc27:0,provisional:0};
 let total=0;
 for(const [club,roster] of Object.entries(squads)){
  assert.equal(roster.length,12,club);
  assert.deepEqual(roster,ROSTER_CORRECTIONS[club],club+' drifted from live roster');
  assert.equal(new Set(roster.map(p=>p.id)).size,12,club+' duplicate player ID');
  assert.equal(new Set(roster.map(p=>p.name)).size,12,club+' duplicate player name');
  const roles={GK:0,DF:0,MF:0,FW:0};
  for(const p of roster){
   assert.equal(p.fictional,false,p.id+' fictional slot');
   assert.ok(Object.hasOwn(roles,p.role),p.id+' unknown role');
   roles[p.role]++;
   assert.ok(Number.isFinite(p.rating),p.id+' missing rating');
   assert.ok(Number.isFinite(p.power)&&Number.isFinite(p.shoot)&&Number.isFinite(p.defense),p.id+' invalid gameplay ratings');
   if(p.ratingSource?.startsWith('FC27')){ratings.fc27++;assert(p.fc27Id,p.id+' missing sourced FC27 ID');}
   else if(p.ratingSource?.startsWith('Editorial'))ratings.provisional++;
   else assert.fail(p.id+' missing or unexpected ratingSource: '+String(p.ratingSource));
   total++;
  }
  assert.deepEqual(roles,{GK:2,DF:3,MF:4,FW:3},club+' role quota');
 }
 assert.equal(total,384);
 assert.equal(ratings.fc27+ratings.provisional,384);
 assert(ratings.fc27>=300,'FC27 source should cover most licensed club players');
});
test('all 384 Club26 player records render in five physical projections using live avatar resolution',async()=>{
 const {CHARACTER_ART:art}=await import(pathToFileURL(path.join(root,'src/modules/characterart.js')).href);
 const avatarFor=avatarResolver();
 const {ctx,stack,draws}=mockCanvas();
 const views=['front','quarterFront','side','quarterBack','back'];
 let players=0,renders=0;
 for(const [club,roster] of Object.entries(squads))for(const player of roster){
  const person={...player};
  const stored=overrides[club]?.[person.id];
  if(stored){if(stored.avatar)person.avatar=stored.avatar;if(stored.appearance)person.appearance=stored.appearance}
  const av={...avatarFor(person),...(person.appearance||{})};
  assert.match(av.skin,/^#[0-9a-f]{6}$/i,person.id+' skin');
  assert.match(av.hair,/^#[0-9a-f]{6}$/i,person.id+' hair');
  for(const kind of views){
   art.draw(ctx,{src:person,keeper:person.role==='GK',action:'idle'},av,
    {primary:'#2769c0',secondary:'#f5f2e8',trim:'#ffc14b'},
    {kind,side:1},{skin:av.skin,hair:av.hair,headScale:1,run:0});
   assert.equal(stack(),0,person.id+' canvas stack '+kind);
   renders++;
  }
  players++;
 }
 assert.equal(players,384);
 assert.equal(renders,1920);
 assert.ok(draws()>10000,'unexpectedly few drawing operations');
});
test('playable loader, match renderer and browser cache all reference integrated sources',()=>{
 assert.match(read('src/assets.js'),/read\('players\/'\+g\+'\.json'\)/);
 assert.match(read('src/modules/render.js'),/import\s+\{CHARACTER_ART\}\s+from\s+['"]\.\/characterart\.js['"]/);
 assert.match(read('src/modules/render.js'),/CHARACTER_ART\.draw\(ctx,p,av,team,view,/);
 const worker=read('sw.js');
 assert.match(worker,/['"]characterart['"]/);
 assert.match(worker,/['"]club26['"]/);
});
