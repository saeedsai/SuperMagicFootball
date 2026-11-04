const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {fileURLToPath}=require('node:url');

let statsApisPromise;
function statsApis(){
 if(!statsApisPromise)statsApisPromise=(async()=>{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(fileURLToPath(url),'utf8'))});
  const assets=await import('../src/assets.js');
  await assets.loadAssets();
  const source=await import('../src/stats.js');
  const modular=(await import('../src/modules/stats.js')).STATS;
  return [source,modular];
 })();
 return statsApisPromise;
}

const expectedBands=[
 {tier:'Common',minOVR:1,maxOVR:69},
 {tier:'Silver',minOVR:70,maxOVR:79},
 {tier:'Gold',minOVR:80,maxOVR:90},
 {tier:'Star',minOVR:91,maxOVR:95},
 {tier:'Superstar',minOVR:96,maxOVR:100},
];

test('rating tier bands cover every inclusive OVR and reject invalid values in both stats APIs',async()=>{
 for(const stats of await statsApis()){
  assert.deepEqual(stats.RATING_TIER_BANDS,expectedBands);
  for(const {tier,minOVR,maxOVR} of expectedBands){
   assert.equal(stats.ratingTierForOVR(minOVR),tier,`${minOVR} starts ${tier}`);
   assert.equal(stats.ratingTierForOVR(maxOVR),tier,`${maxOVR} ends ${tier}`);
  }
  for(let ovr=1;ovr<=100;ovr++){
   const expected=expectedBands.find(band=>ovr>=band.minOVR&&ovr<=band.maxOVR).tier;
   assert.equal(stats.ratingTierForOVR(ovr),expected,`OVR ${ovr}`);
  }
  for(const invalid of [0,101,-1,1.5,NaN,Infinity,-Infinity,null,undefined,'80']){
   assert.equal(stats.ratingTierForOVR(invalid),null,`invalid OVR ${String(invalid)}`);
  }
 }
});

test('player tier derives from the rounded six-stat OVR for the canonical role',async()=>{
 const apis=await statsApis();
 const player={
  id:'rating-tier-primary-position-fixture',role:'FW',rating:35,
  shootAccuracy:96,shootPower:96,dribbling:96,speedRating:96,agility:96,heading:96,
  defence:60,strength:60,aggression:60,stamina:60,passing:60,crossing:60,
 };
 for(const stats of apis){
  assert.equal(stats.overallForPosition(player),96);
  assert.notEqual(stats.overallForPosition(player,'DF'),96,'formation-slot OVR remains separately available');
  assert.equal(stats.ratingTierForPlayer(player),'Superstar');
  assert.equal(stats.ratingTierForPlayer(null),null);
 }
});

test('privilege tier requires explicitly verified canonical inputs and never generated defaults',async()=>{
 const apis=await statsApis();
 const verified={
  id:'rating-tier-verified-fixture',role:'FW',statsVerified:true,rating:15,
  shootAccuracy:96,shootPower:96,dribbling:96,speedRating:96,agility:96,heading:96,
 };
 for(const stats of apis){
  assert.equal(stats.verifiedRatingTierForPlayer(verified),'Superstar');
  assert.equal(stats.verifiedRatingTierForPlayer({...verified,statsVerified:false}),null);
  assert.equal(stats.verifiedRatingTierForPlayer({...verified,heading:undefined}),null);
  assert.equal(stats.verifiedRatingTierForPlayer({...verified,role:'UNKNOWN'}),null);
  assert.equal(stats.verifiedRatingTierForPlayer({src:verified}),'Superstar');
 }
});
