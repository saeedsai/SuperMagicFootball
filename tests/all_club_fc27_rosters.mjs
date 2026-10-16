import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ROSTER_CORRECTIONS} from '../src/roster_corrections.js';
const teams=JSON.parse(fs.readFileSync(new URL('../data/teams.json',import.meta.url)));
const groups=['club26','continental'];
const quota={GK:2,DF:3,MF:4,FW:3}, ids=[];
let count=0,fc=0,editorial=0,placeholder=0;
const audit=JSON.parse(fs.readFileSync(new URL('../docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json',import.meta.url)));
for(const group of groups){
 const data=JSON.parse(fs.readFileSync(new URL('../data/players/'+group+'.json',import.meta.url)));
 for(const [id,arr] of Object.entries(data)){
  ids.push(id);count+=arr.length;
  assert(teams.some(t=>t.id===id),id+' team missing');
  assert.equal(arr.length,12,id+' squad count');
  assert.deepEqual(ROSTER_CORRECTIONS[id],arr,id+' source vs runtime');
  assert.deepEqual(Object.fromEntries(Object.keys(quota).map(k=>[k,arr.filter(p=>p.role===k).length])),quota,id+' role quotas');
  assert.equal(new Set(arr.map(p=>p.id)).size,12,id+' IDs');
  assert.equal(new Set(arr.map(p=>p.name.toLowerCase().normalize('NFKD'))).size,12,id+' names');
  assert.equal(new Set(arr.map(p=>p.num)).size,12,id+' shirt numbers');
  assert.deepEqual(audit[id]?.selected,arr.map(p=>({name:p.name,role:p.role,rating:p.rating})),id+' selection differs from audited shortlist');
  for(const p of arr){
   assert(Number.isInteger(p.rating)&&p.rating>=50&&p.rating<=99,id+' '+p.name+' OVR');
   assert(['A','B','C','D'].includes(p.speed),id+' '+p.name+' speed');
   if(p.fictional){placeholder++;assert(!p.fc27Id,id+' fictional player misrepresented as licensed');}
   else if(p.ratingSource?.startsWith('FC27')){fc++;assert(p.fc27Id,id+' missing FC27 ID');}
   else{editorial++;assert(p.ratingSource?.startsWith('Editorial'),id+' unclassified editorial provenance');}
  }
 }
}
assert.equal(ids.length,165);
assert.equal(count,1980);
assert.equal(Object.keys(audit).length,165);
assert(fc>800,'FC27 dataset should provide many credible club players');
console.log('PASS 165 clubs / 1,980 slots / 2GK-3DF-4MF-3FW; FC27',fc,'editorial real',editorial,'unresolved fictional',placeholder);
