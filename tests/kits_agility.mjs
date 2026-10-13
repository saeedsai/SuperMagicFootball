import assert from 'node:assert/strict';
import {TEAMS,SHOTS,DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {kitFor,kitsFor,KIT_CHOICES} from '../src/kits.js';
import {GameEngine} from '../src/engine.js';
import {NUMERIC_STATS,withStats} from '../src/stats.js';
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
assert.equal(TEAMS.length,216);
assert.deepEqual(KIT_CHOICES,['home','away']);
for (const team of TEAMS){
 const [home,away]=kitsFor(team);
 assert.equal(home.kit,'home');assert.equal(away.kit,'away');
 for(const k of [home,away])for(const c of ['primary','secondary','trim'])assert.match(k[c],/^#[\da-f]{6}$/i);
 assert.notEqual(home.primary.toLowerCase(),away.primary.toLowerCase(),team.name+' must have a distinct away shirt');
 assert.equal(kitFor(team,'home').primary,team.primary,'Do not change official/source palette');
}
const input={state:[{},{}],poll(){},just(){return false}};
const game=new GameEngine({...DEFAULT_OPTIONS},input);
game.init({home:0,away:9,options:{...DEFAULT_OPTIONS,kitChoices:['away','home'],weather:'Clear'}});
assert.equal(game.getTeam(0).primary,kitFor(TEAMS[0],'away').primary);
assert.equal(game.getTeam(1).primary,kitFor(TEAMS[9],'home').primary);
assert.ok(NUMERIC_STATS.includes('speedRating')&&NUMERIC_STATS.includes('agility'));
assert.equal(withStats({name:'test',role:'FW',agility:96,speedRating:35}).agility,96);
function movement({speed,agility},duration=0.5,dir=1){
 const p={x:0,y:0,moveVX:0,moveVY:0,src:withStats({role:'MF',name:'test',speedRating:speed,agility})};
 const max=game.playerSpeed(p);for(let t=0;t<duration;t+=.016)game.moveAgile(p,dir,0,max,.016);
 return {p,maximum:max};
}
const quick=movement({speed:65,agility:95},.20).p.x;
const sluggish=movement({speed:65,agility:12},.20).p.x;
assert.ok(quick>sluggish*1.25,`agility acceleration: ${quick} vs ${sluggish}`);
const runner=movement({speed:95,agility:65},2).p.x;
const plodder=movement({speed:15,agility:65},2).p.x;
assert.ok(runner>plodder*1.25,`speed top velocity: ${runner} vs ${plodder}`);
const high={x:0,y:0,moveVX:0,moveVY:0,src:withStats({role:'MF',name:'a',speedRating:70,agility:95})};
const low={x:0,y:0,moveVX:0,moveVY:0,src:withStats({role:'MF',name:'b',speedRating:70,agility:10})};
for(let j=0;j<90;j++)for(const p of [high,low])game.moveAgile(p,1,0,220,.016);
for(let j=0;j<14;j++)for(const p of [high,low])game.moveAgile(p,-1,0,220,.016);
assert.ok(high.moveVX<low.moveVX,`agility direction change: ${high.moveVX} vs ${low.moveVX}`);
assert.ok(game.playerSpeed(high)>0);
console.log('v0.6.3 KITS & AGILITY PASS — 216 home/away pairs, chosen kits, distinct running speed, acceleration and turns');
