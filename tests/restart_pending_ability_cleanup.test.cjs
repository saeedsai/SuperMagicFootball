'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.resolve('src/modules/engine.js'),'utf8').replace(/\r\n/g,'\n');
const helperStart=source.indexOf(' cancelPendingAbilityActions(){');
const helperEnd=source.indexOf('\n resetKickoff(',helperStart);
assert(helperStart>=0&&helperEnd>helperStart,'pending ability cleanup must exist in GameEngine');
const cleanup=vm.runInNewContext('({'+source.slice(helperStart,helperEnd)+'})').cancelPendingAbilityActions;

function pendingPlayer(overrides={}){
 const target={lightningMark:.4};
 return {spinBumperPending:{remaining:.2},maceSweepPending:{remaining:.1},
  lightningPending:{remaining:.15,target},lightningMark:.4,abilityFx:.4,
  action:'defenceSuper',actionTimer:.4,abilityCd:8,
  aiSpinBumperThreat:{id:'threat'},aiSpinBumperReaction:.2,target,...overrides};
}

test('restart cleanup cancels pending windups and visual cues without refunding cooldown',()=>{
 const affected=pendingPlayer(),idle={action:'run',actionTimer:.3,abilityFx:.2,abilityCd:5};
 const game={players:[affected,idle],cancelPendingAbilityActions:cleanup};
 assert.equal(game.cancelPendingAbilityActions(),1);
 assert.equal(affected.spinBumperPending,null);assert.equal(affected.maceSweepPending,null);
 assert.equal(affected.lightningPending,null);assert.equal(affected.target.lightningMark,0);
 assert.equal(affected.lightningMark,.4,'only the targeted lightning cue is cleared');
 assert.equal(affected.abilityFx,0);assert.equal(affected.action,'idle');assert.equal(affected.actionTimer,0);
 assert.equal(affected.abilityCd,8,'an interrupted move keeps its spent cooldown');
 assert.equal(affected.aiSpinBumperThreat,null);assert.equal(affected.aiSpinBumperReaction,0);
 assert.deepEqual(idle,{action:'run',actionTimer:.3,abilityFx:.2,abilityCd:5});
 assert.equal(game.cancelPendingAbilityActions(),0,'cleanup is idempotent');
});

test('all validated dead-ball restart entry points clean pending abilities',()=>{
 const restartMethods=[['startCornerRestart','startGoalKick'],['startGoalKick','startFreeKick'],['startFreeKick','isInPenaltyArea']];
 for(const [name,next] of restartMethods){
  const start=source.indexOf(` ${name}(`),end=source.indexOf(`\n ${next}(`,start);
  const method=source.slice(start,end);
  assert(start>=0&&method.includes('this.cancelPendingAbilityActions();'),`${name} must cancel pending abilities`);
  assert(method.indexOf('this.cancelPendingAbilityActions();')>method.indexOf('return false;'),
   `${name} should validate inputs before cancellation`);
 }
 const pkStart=source.indexOf(' startPK(afterDraw=false){');
 const pkEnd=source.indexOf('\n updatePK(',pkStart);
 const pk=source.slice(pkStart,pkEnd);
 assert(pk.includes('this.cancelPendingAbilityActions();'),'penalty transition must cancel pending abilities');
});

test('penalty transition clears active field effects before play resumes',()=>{
 const pkStart=source.indexOf(' startPK(afterDraw=false){');
 const pkEnd=source.indexOf('\n updatePK(',pkStart);
 const startPK=vm.runInNewContext('({'+source.slice(pkStart,pkEnd)+'})',{
  WORLD:JSON.parse(fs.readFileSync(path.resolve('data/mechanics/gameplay.json'),'utf8')).world,
  F:JSON.parse(fs.readFileSync(path.resolve('data/mechanics/gameplay.json'),'utf8')).world.field,
  clamp:(value,min,max)=>Math.max(min,Math.min(max,value))
 }).startPK;
 const game={magicHazards:[{id:'trap'}],magicWalls:[{id:'wall'}],supernova:{team:0},
  cancelPendingAbilityActions(){},_closeShotAudits(){},emit(){}};
 game.startPK=startPK;
 assert.equal(game.startPK(false,1),true);
 assert.equal(game.magicHazards.length,0);
 assert.equal(game.magicWalls.length,0);
 assert.equal(game.supernova,null);
 assert.equal(game.matchState,'penalty');
});
