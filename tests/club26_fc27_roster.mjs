import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROSTER_CORRECTIONS} from '../src/roster_corrections.js';
const data=JSON.parse(readFileSync(new URL('../data/players/club26.json', import.meta.url),'utf8'));
const quota={GK:2,DF:3,MF:4,FW:3};
let fc27=0,editorial=0,roles=0;
assert.equal(Object.keys(data).length,32);
for(const [club,squad] of Object.entries(data)){
 assert.equal(squad.length,12,club+' squad length');
 assert.deepEqual(ROSTER_CORRECTIONS[club],squad,club+' runtime/data mismatch');
 assert.equal(new Set(squad.map(p=>p.id)).size,12,club+' duplicate id');
 assert.equal(new Set(squad.map(p=>p.name.normalize('NFKD').toLowerCase())).size,12,club+' duplicate name');
 assert.deepEqual(Object.fromEntries(Object.keys(quota).map(k=>[k,squad.filter(p=>p.role===k).length])),quota,club+' quota');
 for(const p of squad){
  roles++;
  assert.equal(p.fictional,false,club+' must contain a named real player');
  assert(p.name?.trim(),club+' missing name');
  assert(Number.isInteger(p.rating)&&p.rating>=1&&p.rating<=100,club+' invalid overall');
  for(const f of ['power','shoot','defense'])assert(Number.isFinite(p[f])&&p[f]>=1&&p[f]<=100,club+' invalid '+f);
  assert(['A','B','C','D'].includes(p.speed),club+' invalid speed');
  const source=p.ratingSource||'';
  if(source.startsWith('FC27')){fc27++;assert(p.fc27Id,'FC27 player must have source ID');}
  else if(source.startsWith('Editorial')){editorial++;assert(!p.fc27Id,'editorial rating must not falsely claim FC27 ID');}
  else throw Error(club+' unclassified rating source for '+p.name);
 }
}
assert.equal(roles,384);
assert(fc27>=300,'expected broad FC27 coverage among licensed clubs');
assert.equal(fc27+editorial,roles);
console.log('PASS club26: 32 clubs, 384 player slots, 2/3/4/3, source-classified, runtime and data identical; FC27',fc27,'editorial',editorial);
