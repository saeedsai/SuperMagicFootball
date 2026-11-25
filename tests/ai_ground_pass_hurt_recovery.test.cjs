'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
async function load(){const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();const {AI}=await import('../src/modules/ai.js'),{ENGINE}=await import('../src/modules/engine.js');return {AI,ENGINE};}
function p(id,t,x,y,extra={}){return {t,keeper:false,x,y,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0,src:{id,gkSkill:50,gkDiving:50},...extra};}
function fixture(E,team,route,action='hurt',timer=.45){
 const F=E.WORLD.field,B={xMin:F.x+24,xMax:F.x+F.w-24,yMin:F.y+24,yMax:F.y+F.h-24},d=team===0?1:-1,g=team===0?B.xMax:B.xMin,y=(B.yMin+B.yMax)/2;let c,r,bs=[];
 if(route==='support'){c=p('sc'+team,team,g-d*1050,y);r=p('sr'+team,team,c.x+d*160,y+112);bs=[p('sb'+team,1-team,c.x+d*80,y+56,{action,actionTimer:timer})];}
 else if(route==='goalmouth'){c=p('gc'+team,team,g-d*220,y);r=p('gr'+team,team,g-d*110,y);bs=[p('gb'+team,1-team,g-d*50,y,{action,actionTimer:timer})];}
 else if(route==='cutback'){c=p('cc'+team,team,g-d*150,y+350);r=p('cr'+team,team,g-d*260,y+100);bs=[p('cb'+team,1-team,r.x,r.y+5,{action,actionTimer:timer})];}
 else if(route==='give-run'){c=p('gp'+team,team,g-d*700,y);r=p('grun'+team,team,c.x+d*200,y);const x=r.x+d*132;bs=[p('gt'+team,1-team,x,y-104,{action,actionTimer:timer}),p('gb'+team,1-team,x,y+104,{action,actionTimer:timer})];}
 else{c=p('gret'+team,team,g-d*700,y);r=p('gpass'+team,team,c.x+d*180,y);r.aiGiveAndGoRun={receiverId:c.src.id,target:{x:r.x,y:r.y},expires:1};bs=[p('grb'+team,1-team,c.x+d*90,y,{action,actionTimer:timer})];}
 const all=[c,r,...bs];return {check(AI){if(route==='support')return AI.attackingSupportPass(all,team,c,{runner:r,target:{x:r.x,y:r.y}});if(route==='cutback')return AI.attackingCutbackPass(all,team,c,null,B);if(route==='goalmouth')return AI.attackingGoalmouthPass(all,team,c,B);if(route==='give-run')return AI.attackingGiveAndGoRun(all,team,c,r,B);return AI.attackingGiveAndGoReturnPass(all,team,c,B,0);}};
}
test('CPU ground-pass reads ignore active outfield hurt recovery but retain ready and sliding blockers',async()=>{const {AI,ENGINE}=await load();for(const team of [0,1])for(const route of ['support','cutback','goalmouth','give-run','give-return']){assert.ok(fixture(ENGINE,team,route,'hurt',.45).check(AI),JSON.stringify({team,route,case:'active recovery'}));assert.equal(fixture(ENGINE,team,route,'hurt',0).check(AI),null,JSON.stringify({team,route,case:'recovered'}));if(route!=='cutback')assert.equal(fixture(ENGINE,team,route,'slide',.45).check(AI),null,JSON.stringify({team,route,case:'slide'}));}});
