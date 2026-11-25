'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
function player(name,t,x,y,extra={}){
 return {t,keeper:false,x,y,z:0,stun:0,down:false,action:'idle',actionTimer:0,
  slideTimer:0,moveVX:0,moveVY:0,src:{id:name,gkSkill:50,gkDiving:50},...extra};
}
function fixture(ENGINE,team,route,keeperAction){
 const field=ENGINE.WORLD.field,bounds={xMin:field.x+24,xMax:field.x+field.w-24,
  yMin:field.y+24,yMax:field.y+field.h-24};
 const dir=team===0?1:-1,goalX=team===0?bounds.xMax:bounds.xMin;
 const center=(bounds.yMin+bounds.yMax)/2;
 let carrier,runner,keeper;
 if(route==='support'){
  carrier=player('support-carrier-'+team,team,goalX-dir*1050,center);
  runner=player('support-runner-'+team,team,carrier.x+dir*160,center+112);
  keeper=player('support-keeper-'+team,1-team,carrier.x+dir*80,center+56,{keeper:true});
 }else if(route==='goalmouth'){
  carrier=player('goalmouth-carrier-'+team,team,goalX-dir*220,center);
  runner=player('goalmouth-runner-'+team,team,goalX-dir*110,center);
  keeper=player('goalmouth-keeper-'+team,1-team,goalX-dir*50,center,{keeper:true});
 }else{
  carrier=player('cutback-carrier-'+team,team,goalX-dir*150,center+350);
  runner=player('cutback-runner-'+team,team,goalX-dir*260,center+100);
  keeper=player('cutback-keeper-'+team,1-team,runner.x,runner.y+5,{keeper:true});
 }
 keeper.action=keeperAction;keeper.actionTimer=keeperAction==='idle'?0:.34;
 return {carrier,runner,keeper,bounds,supportRun:{runner,target:{x:runner.x,y:runner.y}}};
}
function evaluate(AI,route,f,team){
 if(route==='support')return AI.attackingSupportPass([f.carrier,f.runner,f.keeper],team,f.carrier,f.supportRun);
 if(route==='cutback')return AI.attackingCutbackPass([f.carrier,f.runner,f.keeper],team,f.carrier,null,f.bounds);
 return AI.attackingGoalmouthPass([f.carrier,f.runner,f.keeper],team,f.carrier,f.bounds);
}
test('CPU support, cutback and goalmouth ground passes ignore unavailable keepers but respect active dives',async()=>{
 const {AI,ENGINE}=await loadModules(),unavailable=['keeperDiveCatch','keeperRecover','keeperHold','keeperCatch'];
 for(const team of [0,1])for(const route of ['support','cutback','goalmouth']){
  for(const action of unavailable){
   const f=fixture(ENGINE,team,route,action),choice=evaluate(AI,route,f,team);
   const receiver=choice?.runner||choice;
   assert.equal(receiver?.src?.id,f.runner.src.id,JSON.stringify({team,route,action,receiver:receiver?.src?.id}));
  }
  for(const action of ['idle','keeperDive']){
   const f=fixture(ENGINE,team,route,action);
   assert.equal(evaluate(AI,route,f,team),null,JSON.stringify({team,route,action,reason:'active keeper must still block'}));
  }
 }
});
