'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
let runtimePromise;
function runtime(){if(!runtimePromise){let bundle=fs.readFileSync(path.join(__dirname,'.generated/game.js'),'utf8');const ui=bundle.indexOf('// Supermagic Football v0.8.25.30 | UI |');if(ui>=0)bundle=bundle.slice(0,ui);bundle+='\nexport {ENGINE,INPUT,DATA};';runtimePromise=import('data:text/javascript;base64,'+Buffer.from(bundle).toString('base64'));}return runtimePromise;}
async function fixture(t,mode='quick',options={}){
 const oldWindow=globalThis.window,oldDocument=globalThis.document;
 globalThis.window={addEventListener(){}};globalThis.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
 t.after(()=>{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;});
 const {ENGINE,INPUT,DATA}=await runtime(),input=new INPUT.Input(),game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,...options},input);
 const sourceRosters=[DATA.rosterFor(0),DATA.rosterFor(9)],originals=sourceRosters.map(rows=>rows.map(p=>JSON.stringify(p)));
 game.init({home:0,away:9,mode,humans:1,rosters:sourceRosters,options:{...DATA.DEFAULT_OPTIONS,...options}});
 return {game,input,originals,sourceRosters,trialPlayerId:game.players.find(p=>p.t===0&&['MF','FW'].includes(p.src.role))?.src.id};
}

test('local Arcade Trial equips only a selected temporary match-copy outfielder',async t=>{
 const id='silverCarp',seed=await fixture(t,'quick'),playerId=seed.trialPlayerId;
 const {game,originals,sourceRosters}=await fixture(t,'quick',{arcadeShotId:id,arcadeShotPlayerId:playerId});
 const selected=game.rosters[0].find(p=>p.id===playerId);
 assert.ok(['MF','FW'].includes(selected.role));
 assert.equal(selected.shot,id);
 assert.equal(selected.superAbility.type,'shoot');
 assert.equal(selected.superShotLevel,1);
 assert.equal(game.players.find(p=>p.t===0&&p.src.id===playerId).src.shot,id);
 const beforeShotCount=seed.game.rosters[0].filter(p=>p.superAbility?.type==='shoot').length;
 const previousSelected=seed.game.rosters[0].find(p=>p.id===playerId);
 assert.equal(game.rosters[0].filter(p=>p.superAbility?.type==='shoot').length,beforeShotCount+(previousSelected?.superAbility?.type==='shoot'?0:1));
 assert.deepEqual(sourceRosters.map(rows=>rows.map(p=>JSON.stringify(p))),originals,'trial selection does not mutate source roster objects');
});

test('Arcade Trial selection uses the existing Super Shot action path',async t=>{
 const seed=await fixture(t,'training'),playerId=seed.trialPlayerId;
 const {game}=await fixture(t,'training',{arcadeShotId:'dice',arcadeShotPlayerId:playerId});
 const player=game.players.find(p=>p.t===0&&p.src.id===playerId);
 game.ball.owner=player;player.specialCd=0;
 assert.equal(game.shoot(player,true),true);
 assert.equal(game.ball.shot.id,'dice');
});

test('trial loadouts are ignored in Career, Cup, LAN, invalid-player and invalid-shot contexts',async t=>{
 for(const mode of ['career','continental','league','online','versusLAN']){
  const seed=await fixture(t,mode),playerId=seed.trialPlayerId;
  const {game}=await fixture(t,mode,{arcadeShotId:'orange',arcadeShotPlayerId:playerId});
  const selected=game.rosters[0].find(p=>p.id===playerId),source=seed.game.rosters[0].find(p=>p.id===playerId);
  assert.equal(selected.shot,source.shot,`${mode} must retain the saved shot`);
  assert.deepEqual(selected.superAbility,source.superAbility,`${mode} must retain the runtime ability`);
 }
 const seed=await fixture(t,'quick'),playerId=seed.trialPlayerId;
 const invalidPlayer=await fixture(t,'quick',{arcadeShotId:'orange',arcadeShotPlayerId:'not-a-player'});
 assert.deepEqual(invalidPlayer.game.rosters[0].map(p=>[p.id,p.shot,p.superAbility]),seed.game.rosters[0].map(p=>[p.id,p.shot,p.superAbility]));
 const invalidShot=await fixture(t,'quick',{arcadeShotId:'not-a-shot',arcadeShotPlayerId:playerId});
 assert.deepEqual(invalidShot.game.rosters[0].map(p=>[p.id,p.shot,p.superAbility]),seed.game.rosters[0].map(p=>[p.id,p.shot,p.superAbility]));
 const bench=seed.sourceRosters[0].find((p,index)=>['MF','FW'].includes(p.role)&&!seed.game.lineups[0].includes(index));
 assert.ok(bench,'fixture needs a non-starting outfielder');
 const benchTrial=await fixture(t,'quick',{arcadeShotId:'orange',arcadeShotPlayerId:bench.id});
 const benchSelected=benchTrial.game.rosters[0].find(p=>p.id===bench.id);
 assert.equal(benchSelected.shot,bench.shot,'bench selection cannot get a trial shot that is not playable at kickoff');
});

