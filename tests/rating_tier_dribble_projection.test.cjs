'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {fileURLToPath}=require('node:url');

let apisPromise;
function apis(){
 if(!apisPromise)apisPromise=(async()=>{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(fileURLToPath(url),'utf8'))});
  const assets=await import('../src/assets.js');
  await assets.loadAssets();
  const [source,module,sourceDribbles,moduleDribbles]=await Promise.all([
   import('../src/stats.js'),import('../src/modules/stats.js'),
   import('../src/dribbles.js'),import('../src/modules/dribbles.js'),
  ]);
  return {assets,source,module:module.STATS,sourceDribbles,moduleDribbles:moduleDribbles.DRIBBLES};
 })();
 return apisPromise;
}

function verified(role,ovr,extra={}){
 return {id:`tier-dribble-${role}-${ovr}`,name:`Verified ${role} ${ovr} Style`,role,statsVerified:true,
  stamina:ovr,strength:ovr,aggression:ovr,defence:ovr,speedRating:ovr,agility:ovr,
  dribbling:ovr,shootPower:ovr,shootAccuracy:ovr,heading:ovr,passing:ovr,crossing:ovr,
  gkDiving:ovr,gkSkill:ovr,...extra};
}

test('source and module projections personalize only verified Gold+ and preserve explicit unverified styles',async()=>{
 const {source,module,sourceDribbles,moduleDribbles}=await apis();
 const cases=[
  [verified('FW',69),'sideStep'],
  [verified('MF',70,{dribbleType:'rainbow'}),'sideStep'],
  [verified('DF',79,{dribbleType:'roulette'}),'sideStep'],
  [verified('MF',80),null],
  [verified('FW',91),null],
  [verified('DF',96,{dribbleType:'elastico'}),'elastico'],
  [{id:'legacy-no-style',name:'Legacy Famous Player',role:'FW',rating:99},'sideStep'],
  [{id:'legacy-style',name:'Legacy Saved Player',role:'MF',rating:99,dribbleType:'rainbow'},'rainbow'],
 ];
 for(const [player,expected] of cases){
  const before=structuredClone(player);
  const sourceType=source.withStats(player).dribbleType;
  const moduleType=module.withStats(player).dribbleType;
  assert.equal(moduleDribbles.assignedDribbleType(player),sourceDribbles.assignedDribbleType(player),`${player.id} assignment API parity`);
  assert.equal(sourceType,moduleType,`${player.id} source/module parity`);
  if(expected)assert.equal(sourceType,expected,`${player.id} projection`);
  else assert.equal(sourceType,sourceDribbles.assignedDribbleType(player),`${player.id} keeps/personalizes style`);
  assert.deepEqual(player,before,`${player.id} source is unchanged`);
 }
 const roundedBoundary=verified('MF',79.5);
 assert.equal(source.overallForPosition(roundedBoundary),80);
 assert.equal(source.verifiedRatingTierForPlayer(roundedBoundary),'Gold');
 assert.equal(module.verifiedRatingTierForPlayer(roundedBoundary),'Gold','verified tier uses rounded canonical inputs in both APIs');
});

test('all 2,676 unverified canonical players project safely without mutating roster data',async()=>{
 const {assets,source,module,sourceDribbles,moduleDribbles}=await apis();
 const rosters=assets.GAME_ASSETS.rosters,snapshot=JSON.stringify(rosters);
 let count=0;
 for(const team of assets.GAME_ASSETS.teams)for(const player of rosters[team.id]){
  count++;
  assert.equal(source.verifiedRatingTierForPlayer(player),null,`${player.id} remains unverified`);
  const expected=sourceDribbles.DRIBBLE_STYLES.some(style=>style.id===player.dribbleType)?player.dribbleType:'sideStep';
  assert.equal(source.withStats(player).dribbleType,expected,`${player.id} standalone projection`);
  assert.equal(module.withStats(player).dribbleType,expected,`${player.id} modular projection`);
 }
 assert.equal(count,2676);
 assert.equal(JSON.stringify(rosters),snapshot,'runtime projection does not write any roster style');
});
