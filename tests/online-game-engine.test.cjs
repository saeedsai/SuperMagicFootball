'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

const neutral=()=>({x:0,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}});
const stream=(x=0,y=0,buttons={})=>({x,y,buttons:{...neutral().buttons,...buttons}});
async function setup(options={}){
 const {createOnlineGameEngine}=await import('../scripts/online-game-engine.mjs');
 return createOnlineGameEngine(options);
}

test('Node authoritative-engine seam loads validated assets and advances a server-owned score/clock',async()=>{
 const before=await import('../src/assets.js');
 const assets=await before.loadAssetsFromNode();
 assert.equal(assets.teams.length,223);
 const sourceBefore=JSON.stringify([assets.rosters[assets.teams[0].id],assets.rosters[assets.teams[9].id]]);
 const game=await setup({seed:17});
 const result=game.step(.034,[neutral(),neutral()]);
 assert.equal(result.accepted,true);
 assert.equal(result.snapshot.tick,1);
 assert.equal(result.snapshot.clock,.034);
 assert.deepEqual(result.snapshot.score,[0,0]);
 assert.equal(Object.isFrozen(result.snapshot),true);
 assert.equal(result.snapshot.phase,'play');assert.equal(result.snapshot.terminal,false);
 assert.deepEqual(result.snapshot.teamIds,['japan','brazil']);
 assert.deepEqual(Object.keys(result.snapshot),['tick','phase','matchState','terminal','half','clock','clockRemaining','clockProgress','score','teamIds','controlled','ballModel','ball','players','hazards']);
 assert.deepEqual(Object.keys(result.snapshot.ball),['x','y','height','velocity','owner','shot','roll']);
 assert.deepEqual(Object.keys(result.snapshot.hazards),['magic','walls','nova','tornado','lightning','weather']);
 assert.equal(result.snapshot.players.length,12);assert.ok(result.snapshot.players.every(player=>
  Number.isInteger(player.slot)&&[0,1].includes(player.team)&&Number.isInteger(player.index)&&player.index>=0&&player.index<12&&
  typeof player.assetId==='string'&&/^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(player.assetId)&&
  player.position.x>=0&&player.position.x<=1&&player.position.y>=0&&player.position.y<=1&&
  ['front','back','side','quarterFront','quarterBack'].includes(player.view.kind)&&
  typeof player.animation.phase==='number'&&typeof player.visual.knockdown==='number'&&
  typeof player.action==='string'&&typeof player.stun==='number'&&typeof player.keeper==='boolean'));
 assert.ok(result.snapshot.ball.x>=0&&result.snapshot.ball.x<=1);
 assert.ok(result.snapshot.ball.height>=0&&result.snapshot.ball.height<=1);
 assert.deepEqual(result.snapshot.hazards,{magic:[],walls:[],nova:null,tornado:null,lightning:null,weather:'Clear'});
 assert.ok(Buffer.byteLength(JSON.stringify(result.snapshot),'utf8')<=8192);
 assert.equal(assets.rosters[assets.teams[0].id].length,12);
 assert.equal(JSON.stringify([assets.rosters[assets.teams[0].id],assets.rosters[assets.teams[9].id]]),sourceBefore,
  'live match must not mutate shared source rosters');
});

test('Online UT player identities and canonical stats feed server simulation and snapshots',async()=>{
 const {loadAssetsFromNode}=await import('../src/assets.js'),assets=await loadAssetsFromNode();
 const base=assets.rosters.japan,foreign=assets.rosters.brazil,slot=base.findIndex(player=>player.role==='MF'),replacement=foreign.find(player=>player.role===base[slot].role);
 assert.ok(slot>=0&&replacement);
 const playerIds=base.map(player=>`japan/${player.id}`);playerIds[slot]=`brazil/${replacement.id}`;
 const game=await setup({home:0,away:9,teamIds:['japan','brazil'],rosterPlayerIds:[playerIds,null],seed:90});
 assert.ok(game.snapshot.players.some(player=>player.team===0&&player.assetId===`brazil/${replacement.id}`));
 assert.deepEqual(game.rosterAssetIds[0],playerIds);
 assert.equal(game.step(1/30,[neutral(),neutral()]).accepted,true);
 assert.ok(game.snapshot.players.some(player=>player.team===0&&player.assetId===`brazil/${replacement.id}`));
 await assert.rejects(()=>setup({teamIds:['japan','brazil'],rosterPlayerIds:[[...playerIds.slice(0,slot),`missing/player`,...playerIds.slice(slot+1)],null]}),/canonical game catalog/);
 const wrongRole=foreign.find(player=>player.role!==base[slot].role);assert.ok(wrongRole);
 const invalid=playerIds.slice();invalid[slot]=`brazil/${wrongRole.id}`;
 await assert.rejects(()=>setup({teamIds:['japan','brazil'],rosterPlayerIds:[invalid,null]}),/does not match the roster slot role/);
});

test('ticket-selected canonical teams initialize the authoritative match in assigned side order',async()=>{
 const game=await setup({seed:91,teamIds:['brazil','japan']});
 assert.deepEqual(game.snapshot.teamIds,['brazil','japan']);
 const frame=game.step(.02,[neutral(),neutral()]);
 assert.equal(frame.accepted,true);
 assert.deepEqual(frame.snapshot.teamIds,['brazil','japan']);
 assert.deepEqual(game.sourceRosters,['brazil','japan']);
 await assert.rejects(()=>setup({teamIds:['unknown-team','japan']}),/canonical playable team catalog/);
 await assert.rejects(()=>setup({teamIds:['brazil']}),/Invalid online simulation configuration/);
});

test('Online Career runs the authoritative CPU on side one while only side zero is human-controlled',async()=>{
 const game=await setup({mode:'career-ai',humans:1,teamIds:['japan','brazil'],seed:123});
 const awayBefore=game.snapshot.players.filter(player=>player.team===1).map(player=>player.position);
 for(let tick=0;tick<60;tick++)assert.equal(game.step(1/30,[neutral(),neutral()]).accepted,true);
 const awayAfter=game.snapshot.players.filter(player=>player.team===1).map(player=>player.position);
 assert.deepEqual(game.snapshot.teamIds,['japan','brazil']);
 assert.notDeepEqual(awayAfter,awayBefore,'server CPU changes its side despite receiving no human input');
 await assert.rejects(()=>setup({mode:'career-ai',humans:2}),/Invalid online simulation configuration/);
 await assert.rejects(()=>setup({mode:'quick',humans:1}),/Invalid online simulation configuration/);
});

test('input schema rejects invalid remote values before mutating simulation state',async()=>{
 const game=await setup({seed:2}),before=game.snapshot;
 for(const invalid of [
  [stream(2),neutral()],
  [stream(0,0,{shoot:1}),neutral()],
  [{...neutral(),score:[999,999]},neutral()],
  [neutral(),{...neutral(),buttons:{...neutral().buttons,superShot:true}}],
  [neutral()]
 ]){
  const result=game.step(.034,invalid);
  assert.equal(result.accepted,false);
  assert.equal(result.reason,'invalid-input');
  assert.deepEqual(result.snapshot,before);
 }
 assert.equal(game.step(NaN,[neutral(),neutral()]).accepted,false);
 assert.deepEqual(game.snapshot,before);
});

test('each sanitized remote input stream controls only its own selected side',async()=>{
 const game=await setup({seed:44}),before=game.snapshot;
 const homeSlot=before.controlled[0],awaySlot=before.controlled[1];
 const homeBefore=before.players.find(player=>player.team===0&&player.index===homeSlot);
 const awayBefore=before.players.find(player=>player.team===1&&player.index===awaySlot);
 const after=game.step(.034,[stream(1),neutral()]).snapshot;
 const homeAfter=after.players.find(player=>player.team===0&&player.index===homeSlot);
 const awayAfter=after.players.find(player=>player.team===1&&player.index===awaySlot);
 assert.ok(homeAfter.position.x>homeBefore.position.x,'home axis moves its controlled player forward');
 assert.equal(awayAfter.position.x,awayBefore.position.x,'neutral away input leaves its controlled player unmoved');
 assert.equal(after.score[0],before.score[0]);assert.equal(after.score[1],before.score[1]);
});

test('match simulation is repeatable for the same seed and input sequence',async()=>{
 const a=await setup({seed:1234}),b=await setup({seed:1234});
 for(let frame=0;frame<20;frame++){
  const inputs=[stream(frame<10?.5:0,0,{dribble:frame===2}),stream(-.25,0,{pass:frame===6})];
  const ra=a.step(.02,inputs),rb=b.step(.02,inputs);
  assert.equal(ra.accepted,true);assert.deepEqual(ra.snapshot,rb.snapshot);
 }
});

test('halftime resume and terminal state stop are server-owned',async()=>{
 const game=await setup({halfSeconds:.001,seed:123,mode:'training'});
 let first=game.step(.034,[neutral(),neutral()]);
 assert.equal(first.accepted,true);
 assert.equal(first.snapshot.half,2);
 assert.equal(first.snapshot.matchState,'paused');
 assert.equal(game.step(.034,[neutral(),neutral()]).reason,'paused');
 assert.equal(game.resumeAfterHalftime(),true);
 let finished=false;
 for(let frame=0;frame<8;frame++){
  if(game.snapshot.matchState==='paused')game.resumeAfterHalftime();
  if(game.snapshot.matchState==='finished'){finished=true;break;}
  game.step(.034,[neutral(),neutral()]);
 }
 assert.equal(finished,true,'short seeded match should finish within the bounded terminal simulation');
 const terminal=game.snapshot;
 assert.equal(terminal.matchState,'finished');
 const rejected=game.step(.034,[stream(1),stream(-1)]);
 assert.equal(rejected.accepted,false);assert.equal(rejected.reason,'terminal');
 assert.deepEqual(rejected.snapshot,terminal,'terminal input cannot advance clock, score, tick or player state');
});
