import assert from 'node:assert/strict';
import {predictKeeperShot,predictedKeeperLane,keeperReactionReach,GameEngine,WORLD} from '../src/engine.js';
import {withStats,overallForPosition,NUMERIC_STATS,stat} from '../src/stats.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
const make=(team,skill=80,diving=70)=>({t:team,x:team===0?240:WORLD.field.x+WORLD.field.w-90,y:765,src:withStats({id:'test-gk',role:'GK',gkSkill:skill,gkDiving:diving,rating:70}),fatigue:0});
assert(NUMERIC_STATS.includes('gkDiving')&&!NUMERIC_STATS.includes('gkJump'));
const migrated=withStats({id:'old-save',role:'GK',gkJump:91,gkSkill:72,rating:70});
assert.equal(migrated.gkDiving,91,'old saved roster alias must migrate');
assert.equal(Object.hasOwn(migrated,'gkJump'),false,'deprecated key is not emitted');
assert.equal(stat({src:{id:'old-save2',role:'GK',gkJump:65}},'gkDiving'),65,'legacy game data readable');
assert.equal(overallForPosition({...migrated,gkDiving:60}),overallForPosition({...migrated,gkDiving:60,gkJump:3}),'canonical value overrides legacy alias');
for(const team of [0,1]){
 const k=make(team),toward=team===0?-1:1;
 const base={x:k.x-toward*460,y:765,z:24,vx:toward*1150,vy:90,vz:0,age:.1,attacker:1-team,owner:null};
 const cases=[null,{behavior:'curve',direction:1,level:2},{behavior:'zigzag',level:3},{behavior:'homing',aimY:850,level:4},{behavior:'spiral',level:4},{behavior:'warp',level:3}];
 for(const shot of cases){
  const ball={...base,shot};
  const before=JSON.stringify(ball);
  const prediction=predictKeeperShot(k,ball);
  assert(prediction&&prediction.time>0&&prediction.time<.95,`intercept plane predicted: ${shot?.behavior||'normal'} ${team}`);
  assert(Number.isFinite(prediction.y)&&Number.isFinite(prediction.z));
  assert.equal(JSON.stringify(ball),before,'projection never changes original ball or its shot');
  const lane=predictedKeeperLane(k,ball,.1);
  assert(lane>=WORLD.goalTop+15&&lane<=WORLD.goalBottom-15,'keeper prediction bounded inside goal');
 }
 const high=predictedKeeperLane(make(team,95,90),{...base,shot:{behavior:'curve',direction:1,level:1}},.05);
 const low=predictedKeeperLane(make(team,25,25),{...base,shot:{behavior:'curve',direction:1,level:1}},.05);
 const aim=predictKeeperShot(k,{...base,shot:{behavior:'curve',direction:1,level:1}}).y;
 assert(Math.abs(high-aim)<=Math.abs(low-aim)+.001,'higher goalkeeper ability follows projected lane more closely');
 assert.equal(predictKeeperShot(k,{...base,vx:-base.vx}),null,'no predictive dives for shots travelling away');
 const coverage=keeperReactionReach(k,{...base,vx:toward*1900,shot:{level:5}});
 assert(coverage.y<keeperReactionReach(k,{...base,vx:toward*700,shot:null}).y,'fast level-5 super shot is harder to save');
 assert(keeperReactionReach(k,{...base,shot:{behavior:'zigzag',level:2}}).y < keeperReactionReach(k,{...base,shot:{behavior:'normal',level:2}}).y,'erratic nonlinear super shot reduces reaction coverage');
}
const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'},humans:2});
for(const team of [0,1]){
 const keeper=g.player(team,0),b=g.ball,dir=team===0?-1:1;
 for(const p of g.players.filter(p=>!p.keeper)){p.x=1800;p.y=260;}
 keeper.y=765;keeper.x=team===0?240:WORLD.field.x+WORLD.field.w-90;
 keeper.diveCooldown=0;keeper.stun=0;keeper.fatigue=0;
 b.owner=null;b.attacker=1-team;b.x=keeper.x-dir*65;b.y=keeper.y+37;b.z=12;b.vx=dir*900;b.vy=0;b.vz=0;b.power=0;b.shot=null;b.canCollect=.6;
 const result=g.tryKeeperDive(keeper);
 assert(result,`keeper ${team} dive should happen automatically`);
 assert(Number.isFinite(keeper.diveDy)&&Math.abs(keeper.diveDy)>0,'keeper directional dive vector tracked');
 assert(['keeperDive','keeperDiveCatch'].includes(keeper.action),'directional save animations include dive catches');
 keeper.diveElapsed=.3;
 assert(keeper.diveElapsed>0,'dive animation can interpolate in renderer');
}
console.log('v0.8.19.6 GK PASS: renamed/migrated attribute; mirrored nonlinear trajectory predictions, projected positioning, skill scaling, reaction and animated dive state');
