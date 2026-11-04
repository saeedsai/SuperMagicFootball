'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {fileURLToPath}=require('node:url');

const ui=fs.readFileSync('src/modules/ui.js','utf8');
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const iconSource=fs.readFileSync('src/modules/ability-icons.js','utf8').replace(/export \{ABILITY_ICONS\};?/,'' );
const icons=vm.runInNewContext(iconSource+'\nABILITY_ICONS;',{});
const legacyTricks=['banana','ice','bat','fireball','freeze','scream','hideBall','teleport','shoulderRide'].map(id=>({id}));
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
 return {id:`field-trick-${ovr}`,role:'FW',rating:10,statsVerified:true,
  ...Object.fromEntries(FW_STATS.map(key=>[key,ovr])),...extra};
}
function eligible(stats,id){
 const name=id==='wind'?'Wind':'Mud';
 const start=ui.indexOf(`const studio${name}Eligible=`),end=ui.indexOf(';',start);
 assert.ok(start>=0&&end>start,`Player Studio must provide a verified ${name} gate`);
 return vm.runInNewContext(ui.slice(start,end+1)+`\nstudio${name}Eligible;`,{verifiedRatingTierForPlayer:stats.verifiedRatingTierForPlayer});
}
function save(stats,id,player){
 const state={studioCareerContext:false,career:null,home:0,avatarIndex:0,edits:{},TEAMS:[{id:'team'}],
  roster:()=>[{...player}],$:key=>key==='studioMagic'?{value:id}:null,STUDIO_MAGIC_TRICKS:legacyTricks,
  studioMagicEligible:p=>p.role!=='GK'&&Number(p.rating)>=91,
  studioSpinBumpEligible:p=>!!p&&['Gold','Star','Superstar'].includes(stats.verifiedRatingTierForPlayer(p)),
  studioSandTrapEligible:p=>!!p&&['Gold','Star','Superstar'].includes(stats.verifiedRatingTierForPlayer(p)),
  studioLightningEligible:p=>!!p&&['Gold','Star','Superstar'].includes(stats.verifiedRatingTierForPlayer(p)),
  studioWindEligible:eligible(stats,'wind'),studioMudEligible:eligible(stats,'mud'),tokenWallet:{owns:()=>true},
  writes:[],errors:[],refreshes:0,
  storeCharacterChanges:(key,value)=>{state.writes.push({key,value});return true;},
  showPlayerStudio:()=>state.refreshes++,alert:message=>state.errors.push(message)};
 const start=ui.indexOf('function saveStudioMagic(){'),end=ui.indexOf('function saveStudioTrick(){',start);
 assert.ok(start>=0&&end>start,'real Magic Trick save handler exists');
 vm.runInNewContext(ui.slice(start,end)+'\nsaveStudioMagic();',state);return state;
}

test('Wind and Mud runtime IDs, Studio names, summaries, guides and icons are wired',async()=>{
 const stats=await statsApi();
 assert.match(engine,/const allowed=\[[^\]]*'wind','mud'\]/);
 assert.match(engine,/const tierGated=\['spinBump','sandTrap','lightning','wind','mud'\]/);
 assert.match(engine,/id==='wind'\?120:id==='mud'\?100/);
 assert.match(engine,/rival\.windTrickFx=\.35/);
 assert.match(engine,/rival\.mudSlowTimer=\.52;rival\.mudTrickFx=\.52/);
 assert.match(ui,/const STUDIO_WIND_TRICK=Object\.freeze\(\{id:'wind',name:'Wind'\}\)/);
 assert.match(ui,/const STUDIO_MUD_TRICK=Object\.freeze\(\{id:'mud',name:'Mud'\}\)/);
 assert.match(ui,/STUDIO_MAGIC_TRICK_FULL_CATALOGUE=Object\.freeze\(\[\.\.\.STUDIO_MAGIC_TRICK_SUMMARY_CATALOGUE,STUDIO_WIND_TRICK,STUDIO_MUD_TRICK\]\)/);
 assert.ok(ui.includes("studioWindEligible(player)&&(tokenWallet.owns('magicTrick','wind')||player.magicTrick==='wind')?'<option value=\"wind\">Wind</option>'"));
 assert.ok(ui.includes("studioMudEligible(player)&&(tokenWallet.owns('magicTrick','mud')||player.magicTrick==='mud')?'<option value=\"mud\">Mud</option>'"));
 assert.match(ui,/wind:'Pushes the nearest rival within 120 units 28 units away/);
 assert.match(ui,/mud:'Slows the nearest rival within 100 units for 0\.52 seconds/);
 assert.match(ui,/playerAbilityIcons=p=>ABILITY_ICONS\.summary\([^\n]*STUDIO_MAGIC_TRICK_FULL_CATALOGUE/);
 for(const [id,name,glyph] of [['wind','Wind','🌬️'],['mud','Mud','🟫']]){
  const badge=icons.icon('trick',id,name);
  assert.match(badge,/abilityGlyph-trick/);assert.match(badge,new RegExp(`trick · ${name}`));assert.ok(badge.includes(glyph));
 }
 assert.equal(eligible(stats,'wind')(playerAt(80)),true);
 assert.equal(eligible(stats,'mud')(playerAt(80)),true);
});

test('both moves require verified canonical Gold+ outfield eligibility',async()=>{
 const stats=await statsApi();
 for(const id of ['wind','mud']){
  const canEquip=eligible(stats,id);
  for(const [ovr,want] of [[79,false],[80,true],[90,true],[91,true],[95,true],[96,true]])
   assert.equal(canEquip(playerAt(ovr)),want,`${id}: canonical FW OVR ${ovr}`);
  for(const player of [playerAt(96,{statsVerified:false,rating:100}),
   {id:'legacy-only',role:'FW',rating:100,power:100,shoot:100,defense:100,speed:'A'},
   playerAt(96,{heading:undefined}),playerAt(96,{role:'UNKNOWN'}),playerAt(96,{role:'GK'})])
   assert.equal(canEquip(player),false,`${id}: unverified or ineligible input fails closed`);
 }
});

test('verified players can save Wind and Mud; denied writes fail; legacy records remain keepable/removable',async()=>{
 const stats=await statsApi();
 for(const id of ['wind','mud']){
  const eligiblePlayer=playerAt(80,{appearance:{skin:'#8a5a3b'},customFlag:'preserved'});
  const added=save(stats,id,eligiblePlayer);
  assert.equal(added.errors.length,0);assert.equal(added.writes.length,1);
  assert.equal(added.writes[0].value.team[0].magicTrick,id);
  assert.deepEqual(added.writes[0].value.team[0].appearance,{skin:'#8a5a3b'});
  assert.equal(added.writes[0].value.team[0].customFlag,'preserved');
  for(const player of [playerAt(96,{statsVerified:false,rating:100}),{id:'legacy',role:'FW',rating:100},playerAt(79)]){
   const denied=save(stats,id,player);
   assert.equal(denied.writes.length,0);assert.equal(denied.errors.length,1);
   assert.match(denied.errors[0],new RegExp(`${id==='wind'?'Wind':'Mud'} requires source-verified canonical-position Gold tier`));
  }
  const legacy={id:'old',role:'FW',rating:50,magicTrick:id,appearance:{hair:'swept'}};
  const kept=save(stats,'keep',legacy);assert.equal(kept.writes.length,0);assert.equal(kept.refreshes,1);
  const removed=save(stats,'none',legacy);assert.equal(removed.writes.length,1);
  assert.equal(Object.hasOwn(removed.writes[0].value.team[0],'magicTrick'),false);
  assert.deepEqual(removed.writes[0].value.team[0].appearance,{hair:'swept'});
 }
});
