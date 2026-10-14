import assert from 'node:assert/strict';
import {POSITION_OVR_STATS,overallForPosition,withStats} from '../src/stats.js';
import {TEAMS,rosterFor,FORMATIONS,DEFAULT_OPTIONS} from '../src/data.js';
import {GameEngine} from '../src/engine.js';
const keys={
 GK:['gkSkill','gkDiving','agility','strength','passing','stamina'],
 DF:['defence','strength','aggression','speedRating','heading','stamina'],
 MF:['passing','crossing','dribbling','agility','stamina','speedRating'],
 FW:['shootAccuracy','shootPower','dribbling','speedRating','agility','heading']
};
assert.deepEqual(POSITION_OVR_STATS,keys);
for(const role of Object.keys(keys)){
 // A high rating in a position's selected stats must always increase OVR.
 const base={id:`calculation-${role}`,role,rating:55};
 const seeded=withStats(base);
 const customized={...seeded};
 for(const stat of keys[role])customized[stat]=90;
 assert.equal(overallForPosition(customized),90,`unweighted mean for ${role}`);
 assert.equal(overallForPosition({...customized,[keys[role][0]]:60}),85,'six-attribute equal average');
 assert.equal(overallForPosition({...customized,role:'MF'},role),90,'explicit slot position overrides natural role');
 assert.equal(overallForPosition(customized),90,'derived result deterministic');
 assert.equal(customized.rating,55,'legacy rating kept');
 const excluded=Object.keys(keys).flatMap(r=>keys[r]).find(k=>!keys[role].includes(k));
 assert(excluded,`unselected statistic exists for ${role}`);
 assert.equal(overallForPosition({...customized,[excluded]:1},role),90,'irrelevant stats excluded');
 for(const val of [-100,0,25.5,100,999]){
   const varied={...customized,[keys[role][0]]:val};
   assert(overallForPosition(varied,role)>=1&&overallForPosition(varied,role)<=100,'valid scale');
 }
}
for(const team of TEAMS.slice(0,9))for(const player of rosterFor(team.index??0)){
 const v=overallForPosition(player);
 assert(Number.isInteger(v)&&v>=1&&v<=100,`valid overall for ${player.name}`);
 assert.equal(v,overallForPosition(withStats(player)),'raw vs hydrated consistent');
}
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
const game=new GameEngine(DEFAULT_OPTIONS,input);
game.init({home:0,away:9,options:DEFAULT_OPTIONS});
assert.equal(game.players.filter(p=>p.t===0).length,6,'calculated OVR does not affect field size');
for(const p of game.players){const src=p.src||p;const previous=src.rating;overallForPosition(src,p.keeper?'GK':'FW');assert.equal(src.rating,previous,'no simulation state mutations');}
assert.equal(FORMATIONS['1-1-3'].length,6);assert.equal(FORMATIONS['3-1-1'].length,6);
console.log('v0.8.19.5 POSITION OVERALL PASS: equal six-attribute means for GK/DF/MF/FW; ratings remain independent; no formation or match mutation');
