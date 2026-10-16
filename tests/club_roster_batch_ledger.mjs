import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {ROSTER_CORRECTIONS} from '../src/roster_corrections.js';

const ledger=JSON.parse(fs.readFileSync(new URL('../docs/CLUB_ROSTER_BATCH_LEDGER_20261016.json',import.meta.url),'utf8'));
const auditBytes=fs.readFileSync(new URL('../docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json',import.meta.url));
const audit=JSON.parse(auditBytes);
const hash=createHash('sha1').update(Buffer.from('blob '+auditBytes.length+'\0')).update(auditBytes).digest('hex');
assert.equal(ledger.schemaVersion,1,'ledger schema');
assert.equal(ledger.currentAuditBlobSha,hash,'audit changed without an updated player-change ledger');
assert.equal(Object.keys(ledger.currentRosterSnapshot).length,165);
assert.equal(Object.keys(audit).length,165);
assert.equal(ledger.summary.clubs,165);
assert.equal(ledger.summary.slots,1980);
const quota={GK:2,DF:3,MF:4,FW:3};
let players=0;
for(const [id,entry] of Object.entries(audit)){
 const snapshot=ledger.currentRosterSnapshot[id];
 assert(snapshot,id+' missing from ledger');
 assert.equal(snapshot.club,entry.club,id+' club label');
 assert.deepEqual(snapshot.players,entry.selected,id+' current player/OVR snapshot diverged');
 const runtime=ROSTER_CORRECTIONS[id];
 assert(runtime,id+' runtime club missing');
 assert.equal(runtime.length,12,id+' runtime size');
 for(let i=0;i<12;i++){
  const p=runtime[i],s=snapshot.players[i];
  assert.equal(p.name,s.name,id+' player '+i);
  assert.equal(p.role,s.role,id+' role '+i);
  assert.equal(p.rating,s.rating,id+' OVR '+i);
  assert(!p.fictional&&!/academy/i.test(p.name),id+' unfilled player '+i);
  assert(p.ratingSource?.startsWith('FC27')||p.ratingSource?.startsWith('Editorial'),id+' unsourced overall '+p.name);
 }
 for(const [role,expected] of Object.entries(quota)){
  assert.equal(snapshot.players.filter(p=>p.role===role).length,expected,id+' '+role+' quota');
 }
 assert.equal(new Set(snapshot.players.map(p=>p.name.toLowerCase().normalize('NFKD'))).size,12,id+' name duplicate');
 assert.equal(new Set(runtime.map(p=>p.num)).size,12,id+' shirt duplicate');
 const origins=(entry.origin||'').split('+').filter(Boolean);
 assert.equal(new Set(origins).size,origins.length,id+' duplicate batch origin metadata');
 const sources=(entry.source||'').split(';').map(x=>x.trim()).filter(Boolean);
 assert.equal(new Set(sources).size,sources.length,id+' duplicate sources');
 players+=12;
}
assert.equal(players,1980);
assert.equal(ledger.playerChanges.length,207,'expected 207 recorded replacements from the original 2026-10-15 audit');
assert.equal(ledger.summary.changedSlots,ledger.playerChanges.length);
const seen=new Set(),byRegion=new Map(),clubs=new Set(),batchIds=new Set(ledger.batches.map(b=>b.id));
for(const row of ledger.playerChanges){
 assert(batchIds.has(row.batchId),row.batchId+' missing batch');
 assert(row.slot>=1&&row.slot<=12,row.clubId+' invalid slot');
 const key=row.clubId+'#'+row.slot;
 assert(!seen.has(key),'duplicate history entry in original 207-player batch: '+key);seen.add(key);
 const player=ledger.currentRosterSnapshot[row.clubId]?.players[row.slot-1];
 assert(player,row.clubId+' missing current slot');
 assert.deepEqual({name:player.name,overall:player.rating},{name:row.current.name,overall:row.current.overall},key+' player identity changed without ledger update');
 assert.equal(player.role,row.role,key+' role changed');
 assert(row.previous.name.includes('Academy'),key+' was not a placeholder');
 assert(!row.current.name.includes('Academy'),key+' replacement still fictional');
 assert.equal(row.changeType,'academy_placeholder_replaced');
 assert.equal(row.ratingProvenance,'editorial_estimate_not_EA_FC27');
 const live=ROSTER_CORRECTIONS[row.clubId][row.slot-1];
 assert.equal(live.fictional,false,key+' runtime fictional');
 assert(live.ratingSource.startsWith('Editorial'),key+' expected editorial provenance');
 assert(!live.fc27Id,key+' fake FC27 ID');
 assert(live.source&&typeof live.source==='string',key+' source URL missing in player record');
 assert(ledger.clubSourceEvidence[row.clubId]?.sourceReferences?.length,key+' evidence URLs missing');
 const b=ledger.batches.find(v=>v.id===row.batchId);
 byRegion.set(b.id,(byRegion.get(b.id)||0)+1);clubs.add(row.clubId);
}
assert.equal(clubs.size,23,'changed clubs must be tracked');
assert.equal(ledger.summary.changedClubs,23);
for(const b of ledger.batches){
 assert.equal(byRegion.get(b.id),b.changedSlots,b.id+' batch player count drift');
 assert.deepEqual([...new Set(ledger.playerChanges.filter(p=>p.batchId===b.id).map(p=>p.clubId))].sort(),b.affectedClubIds,b.id+' club list');
}
console.log('PASS: 165 clubs, 1,980 current players; 207 old-to-new replacements in 5 regional batches; stable roles, editorial provenance, source refs, blob SHA and no forgotten audit edits');
