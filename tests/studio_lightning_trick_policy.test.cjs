'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {fileURLToPath}=require('node:url');

const ui=fs.readFileSync('src/modules/ui.js','utf8');
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const iconsSource=fs.readFileSync('src/modules/ability-icons.js','utf8').replace(/export \{ABILITY_ICONS\};?/,'');
const iconApi=vm.runInNewContext(iconsSource+'\nABILITY_ICONS;',{});
const oldTricks=['banana','ice','bat','fireball','freeze','scream','hideBall','teleport','shoulderRide'].map(id=>({id}));
const FW_STATS=['shootAccuracy','shootPower','dribbling','speedRating','agility','heading'];
let statsPromise;
async function statsApi(){
 if(!statsPromise)statsPromise=(async()=>{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(fileURLToPath(url),'utf8'))});
  const assets=await import('../src/assets.js');await assets.loadAssets();
  return (await import('../src/modules/stats.js')).STATS;
 })();
 return statsPromise;
}
function playerAt(ovr,extra={}){
 return {id:`lightning-${ovr}`,role:'FW',rating:10,statsVerified:true,
  ...Object.fromEntries(FW_STATS.map(key=>[key,ovr])),...extra};
}
function eligibility(stats){
 const start=ui.indexOf('const studioLightningEligible='),end=ui.indexOf(';',start);
 assert.ok(start>=0&&end>start,'Player Studio must provide a verified Lightning gate');
 return vm.runInNewContext(ui.slice(start,end+1)+'\nstudioLightningEligible;',{verifiedRatingTierForPlayer:stats.verifiedRatingTierForPlayer});
}
function save(stats,selection,player){
 const source={...player},state={studioCareerContext:false,career:null,home:0,avatarIndex:0,edits:{},TEAMS:[{id:'team'}],
  roster:()=>[source],$:id=>id==='studioMagic'?{value:selection}:null,STUDIO_MAGIC_TRICKS:oldTricks,
  studioMagicEligible:p=>p.role!=='GK'&&Number(p.rating)>=91,
  studioSpinBumpEligible:p=>!!p&&['Gold','Star','Superstar'].includes(stats.verifiedRatingTierForPlayer(p)),
  studioSandTrapEligible:p=>!!p&&['Gold','Star','Superstar'].includes(stats.verifiedRatingTierForPlayer(p)),
  studioLightningEligible:eligibility(stats),tokenWallet:{owns:()=>true},writes:[],errors:[],refreshes:0,
  storeCharacterChanges:(key,value)=>{state.writes.push({key,value});return true;},
  showPlayerStudio:()=>state.refreshes++,alert:message=>state.errors.push(message)};
 const start=ui.indexOf('function saveStudioMagic(){'),end=ui.indexOf('function saveStudioTrick(){',start);
 assert.ok(start>=0&&end>start,'real Magic Trick save handler exists');
 vm.runInNewContext(ui.slice(start,end)+'\nsaveStudioMagic();',state);return state;
}

test('engine equipment ID is lightning; Studio exposes its named icon and guide only to verified Gold+',async()=>{
 const stats=await statsApi(),eligible=eligibility(stats);
 assert.match(engine,/const allowed=\['banana','ice','bat','fireball','freeze','scream','hideBall','teleport','shoulderRide','spinBump','sandTrap','lightning','wind','mud'\]/);
 assert.match(engine,/const tierGated=\['spinBump','sandTrap','lightning','wind','mud'\]\.includes\(id\)/);
 assert.match(engine,/p\.lightningPending=\{remaining:\.32,target:rival\}/);
 assert.match(engine,/if\(inJump\|\|inSlide\|\|read\)\{this\.emit\('lightningTrickResolved'/);
 assert.match(ui,/const STUDIO_LIGHTNING_TRICK=Object\.freeze\(\{id:'lightning',name:'Lightning'\}\)/);
 assert.match(ui,/lightning:'After a short windup, jolts the nearest rival within 95 units/);
 assert.ok(ui.includes("studioLightningEligible(player)&&(tokenWallet.owns('magicTrick','lightning')||player.magicTrick==='lightning')?'<option value=\"lightning\">Lightning</option>'"));
 assert.match(ui,/STUDIO_MAGIC_TRICK_SUMMARY_CATALOGUE=Object\.freeze\(\[\.\.\.STUDIO_MAGIC_TRICK_VISUAL_CATALOGUE,STUDIO_LIGHTNING_TRICK\]\)/);
 const icon=iconApi.icon('trick','lightning','Lightning');
 assert.match(icon,/abilityGlyph-trick/);assert.match(icon,/trick · Lightning/);assert.match(icon,/⚡/);
 assert.equal(eligible(playerAt(80)),true);assert.equal(eligible(playerAt(79)),false);
});

test('Lightning unlock requires verified canonical Gold/Star/Superstar OVR',async()=>{
 const stats=await statsApi(),eligible=eligibility(stats);
 for(const [ovr,want] of [[79,false],[80,true],[90,true],[91,true],[95,true],[96,true]])
  assert.equal(eligible(playerAt(ovr)),want,`canonical FW OVR ${ovr}`);
 for(const player of [playerAt(96,{statsVerified:false,rating:100}),
  {id:'legacy-only',role:'FW',rating:100,power:100,shoot:100,defense:100,speed:'A'},
  playerAt(96,{heading:undefined}),playerAt(96,{role:'UNKNOWN'}),playerAt(96,{role:'GK'})])
  assert.equal(eligible(player),false,'unverified or ineligible inputs fail closed');
});

test('verified Gold may save Lightning; denied assignments do not write; saved Lightning remains keepable/removable',async()=>{
 const stats=await statsApi(),gold=playerAt(80,{appearance:{skin:'#8a5a3b'},otherField:'preserved'});
 const added=save(stats,'lightning',gold);
 assert.equal(added.errors.length,0);assert.equal(added.writes.length,1);
 assert.equal(added.writes[0].value.team[0].magicTrick,'lightning');
 assert.deepEqual(added.writes[0].value.team[0].appearance,{skin:'#8a5a3b'});
 assert.equal(added.writes[0].value.team[0].otherField,'preserved');
 for(const player of [playerAt(96,{statsVerified:false,rating:100}),{id:'legacy',role:'FW',rating:100},playerAt(79)]){
  const denied=save(stats,'lightning',player);
  assert.equal(denied.writes.length,0);assert.equal(denied.errors.length,1);
  assert.match(denied.errors[0],/Lightning requires source-verified canonical-position Gold tier/);
 }
 const legacy={id:'old',role:'FW',rating:50,magicTrick:'lightning',appearance:{hair:'swept'}};
 const kept=save(stats,'keep',legacy);assert.equal(kept.writes.length,0);assert.equal(kept.refreshes,1);
 const removed=save(stats,'none',legacy);assert.equal(removed.writes.length,1);
 assert.equal(Object.hasOwn(removed.writes[0].value.team[0],'magicTrick'),false);
 assert.deepEqual(removed.writes[0].value.team[0].appearance,{hair:'swept'});
});
