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
  const source=await import('../src/stats.js');
  const modular=(await import('../src/modules/stats.js')).STATS;
  return {assets,apis:[source,modular]};
 })();
 return apisPromise;
}

const FW_STATS=['shootAccuracy','shootPower','dribbling','speedRating','agility','heading'];
function playerAt(ovr){
 return {id:`celebration-${ovr}`,role:'FW',statsVerified:true,rating:1,
  ...Object.fromEntries(FW_STATS.map(key=>[key,ovr]))};
}

test('unique celebration eligibility uses verified canonical-position OVR band boundaries',async()=>{
 const {apis:apiList}=await apis();
 const expected=new Map([[79,false],[80,true],[90,true],[91,true],[95,true],[96,true]]);
 for(const [ovr,eligible] of expected){
  const player=playerAt(ovr);
  assert.equal(apiList[0].verifiedRatingTierForPlayer(player),ovr===79?'Silver':ovr<=90?'Gold':ovr<=95?'Star':'Superstar');
  for(const api of apiList)assert.equal(api.uniqueCelebrationEligible(player),eligible,`OVR ${ovr}`);
  assert.equal(apiList[0].uniqueCelebrationEligible(player),apiList[1].uniqueCelebrationEligible(player),`source/module parity at ${ovr}`);
 }
});

test('unverified, inferred, incomplete, and unknown-role players fail closed',async()=>{
 const {apis:apiList}=await apis();
 const high=playerAt(99);
 const cases=[
  ['unverified canonical values',{...high,statsVerified:false}],
  ['legacy rating only',{id:'legacy-rating',role:'FW',rating:100,power:100,shoot:100,defense:100,speed:'A'}],
  ['verified marker with missing canonical value',{...high,heading:undefined}],
  ['verified marker but null canonical value',{...high,heading:null}],
  ['unknown role',{...high,role:'WING'}],
  ['null player',null],
  ['wrapped unverified source',{src:{...high,statsVerified:false}}],
 ];
 for(const [label,player] of cases){
  const results=apiList.map(api=>api.uniqueCelebrationEligible(player));
  assert.deepEqual(results,[false,false],label);
 }
 assert.deepEqual(apiList.map(api=>api.uniqueCelebrationEligible({src:high})),[true,true],
  'a source-wrapped player remains eligible only when its canonical source is explicitly verified');
});

test('the complete current roster contains no source-verified unique-celebration eligibility',async()=>{
 const {assets,apis:apiList}=await apis();
 const rosterSnapshot=JSON.stringify(assets.GAME_ASSETS.rosters);
 let players=0;
 for(const team of assets.GAME_ASSETS.teams){
  for(const player of assets.GAME_ASSETS.rosters[team.id]){
   players++;
   assert.deepEqual(apiList.map(api=>api.uniqueCelebrationEligible(player)),[false,false],`${team.id}/${player.id}`);
  }
 }
 assert.equal(players,2676);
 assert.equal(JSON.stringify(assets.GAME_ASSETS.rosters),rosterSnapshot,'eligibility checks do not mutate roster data');
});
