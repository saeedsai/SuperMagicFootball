'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {fileURLToPath}=require('node:url');

const ui=fs.readFileSync('src/modules/ui.js','utf8');
const iconsSource=fs.readFileSync('src/modules/ability-icons.js','utf8').replace(/export \{ABILITY_ICONS\};?/,'');
const iconApi=vm.runInNewContext(iconsSource+'\nABILITY_ICONS;',{});
const MAGIC_TRICKS=Object.freeze([
 {id:'banana'},{id:'ice'},{id:'bat'},{id:'fireball'},{id:'freeze'},
 {id:'scream'},{id:'hideBall'},{id:'teleport'},{id:'shoulderRide'}
]);
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
 return {id:`spin-bump-${ovr}`,name:'Verified Test Player',role:'FW',rating:15,statsVerified:true,
  ...Object.fromEntries(FW_STATS.map(key=>[key,ovr])),...extra};
}
function eligibleHelper(stats){
 const start=ui.indexOf('const studioSpinBumpEligible='),end=ui.indexOf(';',start);
 assert.ok(start>=0&&end>start,'Studio must define a source-verified Spin Bump predicate');
 return vm.runInNewContext(ui.slice(start,end+1)+'\nstudioSpinBumpEligible;',{verifiedRatingTierForPlayer:stats.verifiedRatingTierForPlayer});
}
function runSave(stats,selection,player){
 const sourcePlayer={...player};
 const state={studioCareerContext:false,career:null,home:0,avatarIndex:0,edits:{},TEAMS:[{id:'team'}],
  roster:()=>[sourcePlayer],$:id=>id==='studioMagic'?{value:selection}:null,
  STUDIO_MAGIC_TRICKS:MAGIC_TRICKS,studioMagicEligible:p=>p.role!=='GK'&&Number(p.rating)>=91,
  studioSpinBumpEligible:eligibleHelper(stats),tokenWallet:{owns:()=>true},writes:[],refreshes:0,errors:[],
  storeCharacterChanges:(key,value)=>{state.writes.push({key,value});return true;},
  showPlayerStudio:()=>state.refreshes++,alert:message=>state.errors.push(message)};
 const start=ui.indexOf('function saveStudioMagic(){'),end=ui.indexOf('function saveStudioTrick(){',start);
 assert.ok(start>=0&&end>start,'actual Player Studio save handler exists');
 vm.runInNewContext(ui.slice(start,end)+'\nsaveStudioMagic();',state);
 return state;
}

test('Spin Bump is listed and its description/icon match the existing engine counter rules',async()=>{
 const stats=await statsApi(),predicate=eligibleHelper(stats);
 assert.match(ui,/const STUDIO_SPIN_BUMP_TRICK=Object\.freeze\(\{id:'spinBump',name:'Spin Bump'\}\)/);
 assert.match(ui,/spinBump:'Briefly bumps a close opponent away and stuns them/);
 assert.ok(ui.includes("studioSpinBumpEligible(player)&&(tokenWallet.owns('magicTrick','spinBump')||player.magicTrick==='spinBump')?'<option value=\"spinBump\">Spin Bump</option>'"));
 assert.match(ui,/STUDIO_MAGIC_TRICK_CATALOGUE=Object\.freeze\(\[\.\.\.STUDIO_MAGIC_TRICKS,STUDIO_SPIN_BUMP_TRICK\]\)/);
 const trickIcon=iconApi.icon('trick','spinBump','Spin Bump');
 assert.match(trickIcon,/abilityGlyph-trick/);assert.match(trickIcon,/trick · Spin Bump/);assert.match(trickIcon,/💫/);
 assert.equal(predicate(playerAt(80)),true,'verified Gold receives the new option');
 assert.equal(predicate(playerAt(79)),false,'Silver does not receive the new option');
});

test('Spin Bump unlock follows verified canonical OVR tier boundaries, not legacy or inferred ratings',async()=>{
 const stats=await statsApi(),eligible=eligibleHelper(stats);
 for(const [ovr,expected] of [[79,false],[80,true],[90,true],[91,true],[95,true],[96,true]])
  assert.equal(eligible(playerAt(ovr)),expected,`canonical OVR ${ovr}`);
 assert.equal(eligible(playerAt(96,{statsVerified:false,rating:100})),false,'high legacy rating cannot unlock');
 assert.equal(eligible({id:'inferred',role:'FW',rating:100}),false,'generated display attributes cannot unlock');
 assert.equal(eligible(playerAt(96,{heading:undefined})),false,'missing canonical input fails closed');
 assert.equal(eligible(playerAt(96,{role:'WING'})),false,'unknown canonical position fails closed');
 assert.equal(eligible(playerAt(96,{role:'GK'})),false,'goalkeepers cannot equip outfield Trick');
});

test('verified Gold can save Spin Bump while unverified players cannot gain it',async()=>{
 const stats=await statsApi();
 const gold=playerAt(80,{appearance:{face:4},customField:'preserved'});
 const allowed=runSave(stats,'spinBump',gold);
 assert.equal(allowed.errors.length,0);assert.equal(allowed.writes.length,1);
 assert.equal(allowed.writes[0].value.team[0].magicTrick,'spinBump');
 assert.deepEqual(allowed.writes[0].value.team[0].appearance,{face:4});
 assert.equal(allowed.writes[0].value.team[0].customField,'preserved');

 for(const player of [
  playerAt(96,{statsVerified:false,rating:100}),
  {id:'legacy-only',role:'FW',rating:100,power:100,shoot:100,defense:100,speed:'A'},
  playerAt(96,{heading:undefined}),
 ]){
  const rejected=runSave(stats,'spinBump',player);
  assert.equal(rejected.writes.length,0,'rejected choice must not touch saves');
  assert.equal(rejected.errors.length,1);
  assert.match(rejected.errors[0],/source-verified canonical-position Gold tier/);
 }
});

test('legacy equipped Trick remains keepable/removable even if Spin Bump is locked',async()=>{
 const stats=await statsApi(),legacy={id:'legacy',role:'FW',rating:55,magicTrick:'banana',appearance:{face:2}};
 const kept=runSave(stats,'keep',legacy);
 assert.equal(kept.errors.length,0);assert.equal(kept.writes.length,0);assert.equal(kept.refreshes,1);
 const removed=runSave(stats,'none',legacy);
 assert.equal(removed.errors.length,0);assert.equal(removed.writes.length,1);
 assert.equal(Object.hasOwn(removed.writes[0].value.team[0],'magicTrick'),false);
 assert.deepEqual(removed.writes[0].value.team[0].appearance,{face:2});
});
