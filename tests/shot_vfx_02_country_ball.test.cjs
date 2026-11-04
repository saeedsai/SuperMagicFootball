'use strict';
const {test,before}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {fileURLToPath}=require('node:url');

let DATA,VISUALFEEL,ENGINE,RENDER;
before(async()=>{
 globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(fileURLToPath(url),'utf8'))});
 const assets=await import('../src/assets.js');
 await assets.loadAssets();
 [{DATA},{VISUALFEEL},{ENGINE},{RENDER}]=await Promise.all([
  import('../src/modules/data.js').then(x=>({DATA:x.DATA})),
  import('../src/modules/visualfeel.js').then(x=>({VISUALFEEL:x.VISUALFEEL})),
  import('../src/modules/engine.js').then(x=>({ENGINE:x.ENGINE})),
  import('../src/modules/render.js').then(x=>({RENDER:x.RENDER})),
 ]);
});

test('SHOT-VFX-02 adds a source-noted optional Hinomaru ball while retaining classic defaults',()=>{
 const model=VISUALFEEL.BALL_MODELS.find(item=>item.id==='hinomaru');
 assert.ok(model);
 assert.equal(model.name,'Hinomaru Panels · Japan-inspired');
 assert.equal(model.inspiredBy,'Japan');
 assert.equal(model.source,'https://laws.e-gov.go.jp/law/411AC0000000127');
 assert.match(model.sourceNote,/centered crimson disc/);
 assert.match(model.sourceNote,/never|not.*nationality/i);
 const france=VISUALFEEL.BALL_MODELS.find(item=>item.id==='tricolore');
 assert.ok(france);
 assert.equal(france.name,'Tricolore Panels · France-inspired');
 assert.equal(france.inspiredBy,'France');
 assert.equal(france.source,'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006527453/2026-02-06');
 assert.match(france.sourceNote,/blue, white, and red/i);
 assert.match(france.sourceNote,/never inferred from nationality/i);
 const brazil=VISUALFEEL.BALL_MODELS.find(item=>item.id==='auriverde');
 assert.ok(brazil);
 assert.equal(brazil.name,'Auriverde Panels · Brazil-inspired');
 assert.equal(brazil.inspiredBy,'Brazil');
 assert.equal(brazil.source,'https://www.gov.br/planalto/pt-br/conheca-a-presidencia/biblioteca-da-pr/simbolos-nacionais/bandeira/bandeira-nacional');
 assert.match(brazil.sourceNote,/green field, yellow diamond, blue celestial sphere and white band/i);
 assert.match(brazil.sourceNote,/never inferred from nationality/i);
 assert.equal(VISUALFEEL.validBallModel('tricolore'),'tricolore');
 assert.equal(VISUALFEEL.validBallModel('hinomaru'),'hinomaru');
 assert.equal(VISUALFEEL.validBallModel('auriverde'),'auriverde');
 assert.equal(VISUALFEEL.validBallModel('not-a-ball'),'classic');
 assert.equal(DATA.DEFAULT_OPTIONS.ballModel,'classic','the existing ball remains the default');
});

test('graphics/setup selection remains player-controlled and persists through the existing options key',()=>{
 const ui=fs.readFileSync(path.resolve(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(ui,/storedOptions=store\.get\('options',\{\}\),opt=\{\.\.\.DEFAULT_OPTIONS,\.\.\.storedOptions\}/);
 assert.match(ui,/field\('MATCH BALL · OPTIONAL COSMETIC','ballModel',VISUALFEEL\.BALL_MODELS/);
 assert.match(ui,/field\('BALL DESIGN · OPTIONAL COSMETIC','ballModel',VISUALFEEL\.BALL_MODELS/);
 assert.match(ui,/case 'ballModel':opt\.ballModel=VISUALFEEL\.validBallModel\(e\.target\.value\);game\.options\.ballModel=opt\.ballModel;store\.put\('options',opt\);paintBallPreview\(\);break/);
 assert.match(ui,/The ball design applies to the whole match and is never assigned from player nationality/);
});

test('the selected Hinomaru design renders as a cosmetic ball pattern',()=>{
 const fills=[];
 const ctx={
  save(){},restore(){},translate(){},rotate(){},beginPath(){},arc(){},clip(){},ellipse(){},
  moveTo(){},lineTo(){},closePath(){},stroke(){},fill(){fills.push(this.fillStyle);},
 };
 const renderer=Object.create(RENDER.Renderer.prototype);
 renderer.drawSoccerBall(ctx,0,0,15,'hinomaru',0);
 assert.ok(fills.includes('#bc002d'),'renders the centered deep-red disc');
 assert.ok(fills.includes('#25394a'),'renders the separate football seam panels');
 assert.ok(fills.includes('#f4f1dd'),'keeps the white ball base');
});

test('the selected Tricolore design renders original colored panels and football seams',()=>{
 const fills=[],strokes=[];
 const ctx={
  save(){},restore(){},translate(){},rotate(){},beginPath(){},arc(){},clip(){},ellipse(){},
  moveTo(){},lineTo(){},closePath(){},stroke(){strokes.push(this.strokeStyle);},fill(){fills.push(this.fillStyle);},
 };
 const renderer=Object.create(RENDER.Renderer.prototype);
 renderer.drawSoccerBall(ctx,0,0,15,'tricolore',0);
 assert.ok(fills.includes('#0055a4'),'renders the blue ball panel');
 assert.ok(fills.includes('#ef4135'),'renders the red ball panel');
 assert.ok(fills.includes('#f4f1dd'),'retains the light center and ball surface');
 assert.ok(strokes.includes('#25394a'),'renders panel seams');
});

test('the selected Auriverde design renders original colored panels without flag text or emblems',()=>{
 const fills=[];
 const ctx={
  save(){},restore(){},translate(){},rotate(){},beginPath(){},arc(){},clip(){},ellipse(){},fillRect(){},
  moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},stroke(){},fill(){fills.push(this.fillStyle);},
 };
 const renderer=Object.create(RENDER.Renderer.prototype);
 renderer.drawSoccerBall(ctx,0,0,15,'auriverde',0);
 assert.ok(fills.includes('#009b3a'),'renders the green field');
 assert.ok(fills.includes('#ffdf00'),'renders the gold diamond');
 assert.ok(fills.includes('#002776'),'renders the blue central sphere');
 assert.ok(fills.includes('#fff'),'renders the curved white band');
});

test('switching ball cosmetics leaves match physics unchanged',()=>{
 const input=()=>({state:[{},{}],edges:[{},{}],ups:[{},{}],poll(){},just(){return false;},held(){return false;},released(){return false;},tapDuration(){return 0;},canceled(){return false;}});
 const create=model=>{
  const options={...DATA.DEFAULT_OPTIONS,weather:'Clear',weatherSeed:731,ballModel:model};
  const game=new ENGINE.GameEngine(options,input());
  game.init({home:0,away:9,options});game.humans=2;game.driveAI=()=>{};game.coordinateAiCombos=()=>{};
  for(const [index,p] of game.players.entries()){
   p.x=index%2?3380:250;p.y=index%3?1280:190;p.stun=0;p.invuln=0;
  }
  Object.assign(game.ball,{x:1850,y:760,z:0,vx:190,vy:23,vz:0,owner:null,shot:null,age:0,power:0,canCollect:0,targetY:760,attacker:-1,trail:[]});
  return game;
 };
 for(const design of ['hinomaru','tricolore','auriverde']){
  const classic=create('classic');
  const countryStyle=create(design);
  for(let frame=0;frame<30;frame++){classic.update(1/60);countryStyle.update(1/60);}
  const ballKeys=['x','y','z','vx','vy','vz','age','power','canCollect','targetY','attacker','rollAngle'];
  assert.deepEqual(Object.fromEntries(ballKeys.map(k=>[k,classic.ball[k]])),Object.fromEntries(ballKeys.map(k=>[k,countryStyle.ball[k]])),design);
  const playerKeys=['x','y','z','moveVX','moveVY','stun','fatigue','action','actionTimer','cd'];
  assert.deepEqual(classic.players.map(p=>Object.fromEntries(playerKeys.map(k=>[k,p[k]]))),countryStyle.players.map(p=>Object.fromEntries(playerKeys.map(k=>[k,p[k]]))),design);
  assert.deepEqual(classic.score,countryStyle.score,design);
 }
});
