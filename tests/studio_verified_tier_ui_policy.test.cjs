'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {fileURLToPath}=require('node:url');

const ui=fs.readFileSync('src/modules/ui.js','utf8');
let apiPromise;
async function apis(){
 if(!apiPromise)apiPromise=(async()=>{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(fileURLToPath(url),'utf8'))});
  const assets=await import('../src/assets.js');await assets.loadAssets();
  const [{ABILITIES},{STATS},{SPECIALS},{DRIBBLES}]=await Promise.all([
   import('../src/modules/abilities.js'),import('../src/modules/stats.js'),
   import('../src/modules/specials.js'),import('../src/modules/dribbles.js')
  ]);
  return {assets,ABILITIES,STATS,SPECIALS,DRIBBLES};
 })();
 return apiPromise;
}
function player(role,ovr,extra={}){
 const stats=['stamina','strength','aggression','defence','speedRating','agility','dribbling','shootPower','shootAccuracy','heading','passing','crossing','gkDiving','gkSkill'];
 return {id:`tier-ui-${role}-${ovr}`,name:'Tier UI Fixture',role,rating:40,statsVerified:true,
  ...Object.fromEntries(stats.map(key=>[key,ovr])),...extra};
}
function extractFunction(name,nextName){
 const start=ui.indexOf(`function ${name}(`),end=Math.min(...[
  ui.indexOf(`function ${nextName}(`,start),ui.indexOf(`const ${nextName}=`,start)
 ].filter(index=>index>=0));
 assert.ok(start>=0&&end>start,`${name} source function exists`);return ui.slice(start,end);
}
function extractConst(name){
 const start=ui.indexOf(`const ${name}=`),end=ui.indexOf(';',start);
 assert.ok(start>=0&&end>start,`${name} source constant exists`);return ui.slice(start,end+1);
}
function runHandler({name,nextName,player:record,choice,tier,api,specials,stats,shots,dribbles}){
 const metrics={writes:[],refreshes:0,errors:[]};
 const context={
  studioCareerContext:false,career:null,home:0,avatarIndex:0,edits:{},TEAMS:[{id:'fixture'}],
  roster:()=>[record],
  $:id=>({studioShotAbility:choice,studioShotTier:tier,studioDefAbility:choice,studioDefTier:tier,
   studioDribble:choice,studioMagic:choice}[id]===undefined?null:{value:String({studioShotAbility:choice,studioShotTier:tier,studioDefAbility:choice,studioDefTier:tier,studioDribble:choice,studioMagic:choice}[id])}),
  ABILITIES:api,SPECIALS:specials,SHOTS:shots,DRIBBLES:dribbles,
  STATS:stats,verifiedRatingTierForPlayer:stats.verifiedRatingTierForPlayer,tokenWallet:{owns:()=>true},
  studioEliteEligible:p=>['Gold','Star','Superstar'].includes(stats.verifiedRatingTierForPlayer(p)),
  studioMagicEligible:p=>!!p&&p.role!=='GK'&&['Star','Superstar'].includes(stats.verifiedRatingTierForPlayer(p)),
  studioVerifiedDribbleEligible:p=>['Gold','Star','Superstar'].includes(stats.verifiedRatingTierForPlayer(p)),
  studioDribbleSaveState:undefined,studioShotSaveState:undefined,studioDefenceSaveState:undefined,
  storeCharacterChanges:(key,payload)=>{metrics.writes.push({key,payload});return true;},
  saveCareer(){},showPlayerStudio(){metrics.refreshes++;},alert:message=>metrics.errors.push(message)
 };
 const helper=(fn,next)=>extractFunction(fn,next);
 const source=(name==='saveStudioShot'?helper('studioShotSaveState','studioDribbleSaveState'):
  name==='saveStudioDefence'?helper('studioDefenceSaveState','studioDefenceTierGuide'):
  name==='saveStudioTrick'?helper('studioDribbleSaveState','studioDribblePreviewGuide'):'')+
  helper(name,nextName)+`;${name}();`;
 vm.runInNewContext(source,context);return metrics;
}
function stateHelper(name,nextName,ctx){
 const body=extractFunction(name,nextName);
 return vm.runInNewContext(body+`;${name};`,ctx);
}

test('Studio shot and defence helpers enforce verified role and Gold 2 / Star 3 / Superstar 5 caps',async()=>{
 const a=await apis(),shots=a.assets.GAME_ASSETS.mechanics.shotTypes,shotId=Object.keys(shots)[0];
 const shotState=stateHelper('studioShotSaveState','studioDribbleSaveState',{ABILITIES:a.ABILITIES,SPECIALS:a.SPECIALS,SHOTS:shots});
 const defState=stateHelper('studioDefenceSaveState','studioDefenceTierGuide',{ABILITIES:a.ABILITIES,SPECIALS:a.SPECIALS});
 for(const [ovr,max] of [[79,0],[80,2],[90,2],[91,3],[95,3],[96,5]]){
  const mf=player('MF',ovr),df=player('DF',ovr);
  for(let level=1;level<=5;level++){
   assert.equal(shotState(shotId,level,mf).invalid,level>0&&level>max,`shot OVR ${ovr} L${level}`);
   assert.equal(defState('drill',level,df).invalid,level>0&&level>max,`defence OVR ${ovr} L${level}`);
  }
 }
 const unverified=player('MF',100,{statsVerified:false,rating:100});
 assert.equal(shotState(shotId,1,unverified).invalid,true);
 assert.equal(shotState(shotId,1,player('DF',96)).invalid,true);
 assert.equal(defState('drill',1,player('MF',96)).invalid,true);
 assert.equal(defState('drill',1,player('DF',100,{statsVerified:false,rating:100})).invalid,true);
});

test('actual Studio shot/defence saves enforce caps and preserve unverified legacy KEEP/REMOVE',async()=>{
 const a=await apis(),shots=a.assets.GAME_ASSETS.mechanics.shotTypes,shotId=Object.keys(shots)[0];
 for(const [ovr,level,allowed] of [[80,2,true],[80,3,false],[91,3,true],[91,4,false],[96,5,true]]){
  const record=player('MF',ovr),r=runHandler({name:'saveStudioShot',nextName:'STUDIO_MAGIC_TRICKS',player:record,choice:shotId,tier:level,api:a.ABILITIES,specials:a.SPECIALS,stats:a.STATS,shots});
  assert.equal(r.errors.length,allowed?0:1,`shot OVR ${ovr} L${level}: ${r.errors.join('; ')}`);assert.equal(r.writes.length,allowed?1:0);
 }
 const unverifiedShot=player('MF',100,{statsVerified:false,rating:100,superAbility:{type:'shoot',id:shotId,level:5},shot:shotId,shotName:shots[shotId].name,superShotLevel:5});
 const kept=runHandler({name:'saveStudioShot',nextName:'STUDIO_MAGIC_TRICKS',player:unverifiedShot,choice:'keep',tier:5,api:a.ABILITIES,specials:a.SPECIALS,stats:a.STATS,shots});
 assert.equal(kept.writes.length,0);assert.equal(kept.errors.length,0);
 const removed=runHandler({name:'saveStudioShot',nextName:'STUDIO_MAGIC_TRICKS',player:unverifiedShot,choice:'none',tier:5,api:a.ABILITIES,specials:a.SPECIALS,stats:a.STATS,shots});
 assert.equal(removed.writes.length,1);assert.equal(removed.errors.length,0);
 assert.equal(Object.hasOwn(removed.writes[0].payload.fixture[0],'superAbility'),false);

 for(const [ovr,level,allowed] of [[80,2,true],[80,3,false],[91,3,true],[91,4,false],[96,5,true]]){
  const r=runHandler({name:'saveStudioDefence',nextName:'saveAppearance',player:player('DF',ovr),choice:'drill',tier:level,api:a.ABILITIES,specials:a.SPECIALS,stats:a.STATS});
  assert.equal(r.errors.length,allowed?0:1,`defence OVR ${ovr} L${level}`);assert.equal(r.writes.length,allowed?1:0);
 }
 const legacyDefence=player('DF',100,{statsVerified:false,rating:100,superAbility:{type:'defence',id:'drill',level:5},superDefenceLevel:5});
 const keepDefence=runHandler({name:'saveStudioDefence',nextName:'saveAppearance',player:legacyDefence,choice:'keep',tier:5,api:a.ABILITIES,specials:a.SPECIALS,stats:a.STATS});
 assert.equal(keepDefence.writes.length,0);assert.equal(keepDefence.errors.length,0);
 const removeDefence=runHandler({name:'saveStudioDefence',nextName:'saveAppearance',player:legacyDefence,choice:'none',tier:5,api:a.ABILITIES,specials:a.SPECIALS,stats:a.STATS});
 assert.equal(removeDefence.writes.length,1);assert.equal(removeDefence.errors.length,0);
 assert.equal(Object.hasOwn(removeDefence.writes[0].payload.fixture[0],'superAbility'),false);
});

test('old Magic Tricks require verified Star+ while existing unverified and unknown picks remain keep/remove-safe',async()=>{
 const a=await apis();
 const eligible=vm.runInNewContext(extractConst('studioMagicEligible')+'\nstudioMagicEligible;',
  {verifiedRatingTierForPlayer:a.STATS.verifiedRatingTierForPlayer});
 assert.equal(eligible(player('FW',80)),false);assert.equal(eligible(player('FW',91)),true);
 assert.equal(eligible(player('FW',100,{statsVerified:false,rating:100})),false);
 const saved=player('MF',100,{statsVerified:false,rating:100,magicTrick:'legacy-unknown'});
 const ctx={studioCareerContext:false,career:null,home:0,avatarIndex:0,edits:{},TEAMS:[{id:'fixture'}],roster:()=>[saved],
  $:()=>({value:'keep'}),STUDIO_MAGIC_TRICKS:[{id:'banana'}],studioMagicEligible:eligible,
  studioSpinBumpEligible:()=>false,studioSandTrapEligible:()=>false,studioLightningEligible:()=>false,studioWindEligible:()=>false,studioMudEligible:()=>false,
  showPlayerStudio(){ctx.refreshes++;},refreshes:0,writes:[],errors:[],storeCharacterChanges:(key,payload)=>{ctx.writes.push(payload);return true;},saveCareer(){},alert:m=>ctx.errors.push(m)};
 const handler=extractFunction('saveStudioMagic','saveStudioTrick');
 vm.runInNewContext(handler+';saveStudioMagic()',ctx);assert.equal(ctx.writes.length,0);assert.equal(ctx.refreshes,1);
 ctx.$=()=>({value:'none'});vm.runInNewContext(handler+';saveStudioMagic()',ctx);
 assert.equal(ctx.writes.length,1);assert.equal(Object.hasOwn(ctx.writes[0].fixture[0],'magicTrick'),false);
});

test('unique Dribble Styles need Gold+; basic style, KEEP CURRENT and REMOVE remain available',async()=>{
 const a=await apis(),styles=a.DRIBBLES.DRIBBLE_STYLES;
 const eligible=vm.runInNewContext(extractConst('studioVerifiedDribbleEligible')+'\nstudioVerifiedDribbleEligible;',
  {verifiedRatingTierForPlayer:a.STATS.verifiedRatingTierForPlayer});
 const saveState=stateHelper('studioDribbleSaveState','studioDribblePreviewGuide',{studioVerifiedDribbleEligible:eligible});
 assert.equal(saveState('sideStep',player('MF',70),styles).invalid,false);
 assert.equal(saveState('roulette',player('MF',79),styles).invalid,true);
 assert.equal(saveState('roulette',player('MF',80),styles).invalid,false);
 assert.equal(saveState('roulette',player('MF',100,{statsVerified:false,rating:100}),styles).invalid,true);
 const saveStyle=(record,choice)=>runHandler({name:'saveStudioTrick',nextName:'saveStudioDefence',player:record,choice,api:a.ABILITIES,stats:a.STATS,dribbles:a.DRIBBLES});
 const added=saveStyle(player('MF',80),'roulette');assert.equal(added.writes.length,1);assert.equal(added.errors.length,0);
 const denied=saveStyle(player('MF',80,{statsVerified:false,rating:100}),'roulette');assert.equal(denied.writes.length,0);assert.equal(denied.errors.length,1);
 const basic=saveStyle(player('MF',70),'sideStep');assert.equal(basic.writes.length,1);assert.equal(basic.errors.length,0);
 const legacy=player('FW',70,{dribbleType:'unknown-legacy-style'});
 const kept=saveStyle(legacy,'keep');assert.equal(kept.writes.length,0);assert.equal(kept.errors.length,0);
 const removed=saveStyle(legacy,'none');assert.equal(removed.writes.length,1);assert.equal(removed.errors.length,0);
 assert.equal(Object.hasOwn(removed.writes[0].payload.fixture[0],'dribbleType'),false);
});
