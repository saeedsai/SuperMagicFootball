/** Live Club26/continental source contract used by superseded 2026 snapshots.
 * The original 2026 named lineup was replaced on purpose by highest-OVR
 * position-qualified FC27 selection. Never hardcode the old lineup again.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TEAMS,SHOTS,rosterFor,DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {ROSTER_CORRECTIONS} from '../src/roster_corrections.js';
import {safePlan,validatePlan} from '../src/tactics.js';
import {GameEngine} from '../src/engine.js';
const audit=JSON.parse(fs.readFileSync(new URL('../docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json',import.meta.url),'utf8'));
installExpansion(TEAMS,SHOTS);
installContinentalClubs(TEAMS,SHOTS);
const quota={GK:2,DF:3,MF:4,FW:3};
export function verifyCurrentClub(name,group='club26'){
 const team=TEAMS.find(t=>t.name===name&&t.group===group);
 assert(team, name+' exists as selectable '+group+' club');
 const players=rosterFor(team.index);
 assert.equal(players.length,12,name+' 12 first-squad slots');
 assert.deepEqual(players,ROSTER_CORRECTIONS[team.id],name+' runtime/source parity');
 assert.deepEqual(Object.fromEntries(Object.keys(quota).map(k=>[k,players.filter(p=>p.role===k).length])),quota,name+' role quota');
 assert.equal(new Set(players.map(p=>p.id)).size,12,name+' stable unique identifiers');
 assert.equal(new Set(players.map(p=>p.num)).size,12,name+' unique shirts');
 assert.equal(new Set(players.map(p=>p.name.toLowerCase().normalize('NFKD'))).size,12,name+' unique named players');
 assert.deepEqual(audit[team.id].selected,players.map(p=>({name:p.name,role:p.role,rating:p.rating})),name+' source-ranked shortlist');
 const seenFC=players.filter(p=>p.ratingSource?.startsWith('FC27'));
 if(group==='club26')assert(seenFC.length>=8,name+' majority FC27 source');
 for(const p of players){
   assert.equal(p.fictional,false,name+': fictional player '+p.name);
   assert(Number.isInteger(p.rating)&&p.rating>=50&&p.rating<=99,name+' '+p.name+' OVR');
   assert(p.ratingSource?.startsWith('FC27')||p.ratingSource?.startsWith('Editorial'),name+' '+p.name+' rating provenance');
   if(p.birthDate)assert(/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate),name+' '+p.name+' ISO birth date');
 }
 const plan=safePlan(null,players,team.index);
 assert.deepEqual(validatePlan(plan,players,team.index),plan);
 assert.equal(players[plan.lineup[0]].role,'GK');
 const input={state:[{},{}],poll(){},just(){return false}};
 const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
 game.init({home:team.index,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
 assert.equal(game.rosters[0].length,12,name+' match startup');
 return {team,players};
}
