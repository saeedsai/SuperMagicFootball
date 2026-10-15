import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROSTER_CORRECTIONS} from '../src/roster_corrections.js';
const clubData = JSON.parse(readFileSync(new URL('../data/players/club26.json', import.meta.url), 'utf8'));
const quota={GK:2,DF:3,MF:4,FW:3};
let players=0,fc27=0,provisional=0;
assert.equal(Object.keys(clubData).length,32);
for(const [club,roster] of Object.entries(clubData)){
 assert.equal(roster.length,12,club+' must have exactly 12 players');
 assert.deepEqual(roster,ROSTER_CORRECTIONS[club],club+' game/runtime roster mismatch');
 assert.equal(new Set(roster.map(p=>p.id)).size,12,club+' duplicate IDs');
 assert.equal(new Set(roster.map(p=>p.name)).size,12,club+' duplicate names');
 const counts={GK:0,DF:0,MF:0,FW:0};
 for(const player of roster){
  assert.equal(player.fictional,false,club+' has a fictional player');
  assert.ok(Object.hasOwn(counts,player.role));
  counts[player.role]++;players++;
  for(const field of ['rating','power','shoot','defense']){
   assert.ok(Number.isFinite(player[field])&&player[field]>=1&&player[field]<=100,club+' invalid '+field);
  }
  assert.ok(['A','B','C','D'].includes(player.speed),club+' speed invalid');
  if(player.ratingSource?.startsWith('FC27'))fc27++;
  if(player.ratingSource?.startsWith('Editorial'))provisional++;
 }
 assert.deepEqual(counts,quota,club+' positional quota mismatch');
}
assert.equal(players,384);
assert.equal(fc27,290);
assert.equal(provisional,94);
assert.equal(fc27+provisional,players,'all club rating sources must be classified');
console.log('Club26 FC27 roster regression PASS — 32 clubs, 384 players, no fictional slots, data/runtime identical');
