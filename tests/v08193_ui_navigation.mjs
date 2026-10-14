import assert from 'node:assert/strict';
import {TEAMS,SHOTS,FORMATIONS,DEFAULT_OPTIONS} from '../src/data.js';
import {GameEngine} from '../src/engine.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {careerClubIds,clubCountry,clubRegion,countryName,availableRegions,availableCountries,clubsInCountry} from '../src/club_filters.js';
import {rosterFor} from '../src/data.js';
import {safePlan,validatePlan} from '../src/tactics.js';
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
const ids=careerClubIds(TEAMS);assert(ids.length>100,'enough playable clubs');
let seen=new Set();for(const region of availableRegions(TEAMS))for(const country of availableCountries(TEAMS,region)){
 const clubs=clubsInCountry(TEAMS,region,country);assert(clubs.length>0);
 assert(countryName(country,TEAMS).length>1);
 for(const i of clubs){assert(!seen.has(i),'duplicate club in country filtering');seen.add(i);assert.equal(clubCountry(TEAMS[i]),country);assert.equal(clubRegion(TEAMS[i]),region)}
}
assert.equal(seen.size,ids.length,'continent-country options must cover all manager clubs');
assert(clubsInCountry(TEAMS,'CONMEBOL','BRA').some(i=>TEAMS[i].name==='Flamengo'));
assert(clubsInCountry(TEAMS,'UEFA','ENG').some(i=>TEAMS[i].name==='Arsenal'));
for(const name of ['2-1-2','1-2-2','2-2-1','1-3-1','1-1-3','3-1-1']){
 assert.equal(FORMATIONS[name].length,6,`six-player formation ${name}`);
 for(const {x,y} of FORMATIONS[name])assert(x>=0&&x<=1&&y>=0&&y<=1);
 assert.equal(validatePlan({formation:name,lineup:[5,3,4,0,1,2],captain:3},rosterFor(0)).formation,name);
}
assert.equal(safePlan({formation:'1-1-3',lineup:[5,3,4,0,1,2],captain:3},rosterFor(0)).formation,'1-1-3');
assert.equal(safePlan({formation:'3-1-1',lineup:[5,3,4,0,1,2],captain:3},rosterFor(0)).formation,'3-1-1');
assert.equal(FORMATIONS['1-1-3-3-1-1'],undefined,'remove invented formation');
const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},{state:[{},{}],poll(){},just(){return false}});
game.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
game.matchState='paused';
for(const name of ['1-1-3','3-1-1']){
 const plan={...game.teamPlans[0],formation:name};
 game.applyPlan(0,plan);
 assert.equal(game.formation[0],name,`engine applies ${name}`);
 assert.equal(game.players.filter(p=>p.t===0).length,6,'still GK + five field players');
}

assert.deepEqual(FORMATIONS['1-1-3'].slice(3).map(p=>p.x),[.76,.76,.76],'three forwards in 1-1-3');
assert.deepEqual(FORMATIONS['3-1-1'].slice(1,4).map(p=>p.x),[.29,.29,.29],'three defenders in 3-1-1');
console.log(`v0.8.19.3 UI NAV PASS: ${ids.length} manager clubs, ${seen.size} unique country/continent memberships, six 6-player formation presets`);
