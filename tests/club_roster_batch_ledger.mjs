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
const historyBySlot=new Map(),byBatch=new Map(),clubs=new Set();
const ids=new Set(ledger.batches.map(x=>x.id));
assert.equal(ids.size,ledger.batches.length,'Batch IDs must be unique');
for(const change of ledger.playerChanges){
 assert(ids.has(change.batchId),change.batchId+' unknown');
 assert(change.slot>=1&&change.slot<=12,change.clubId+' invalid slot');
 const key=change.clubId+'#'+change.slot;
 const earlier=historyBySlot.get(key);
 if(earlier){
  assert.deepEqual(change.previous,earlier.current,key+' history chain has a gap');
  assert.equal(change.previousRole??earlier.role,earlier.role,key+' previous role mismatch');
 }
 assert(change.previous.name!==change.current.name||
    change.previous.overall!==change.current.overall||
    (change.previousRole??change.role)!==change.role,
    key+' no-op change');
 const initial=change.batchId.startsWith('CLUB-20261015-');
 if(initial){
  assert(!earlier,key+' initial batch has duplicate player slot');
  assert(change.previous.name.includes('Academy'),key+' initial player not fictional');
  assert.equal(change.changeType,'academy_placeholder_replaced');
  assert.equal(change.ratingProvenance,'editorial_estimate_not_EA_FC27');
 }
 assert(['editorial_estimate_not_EA_FC27','fc27_third_party_unofficial'].includes(change.ratingProvenance));
 assert(ledger.clubSourceEvidence[change.clubId]?.sourceReferences?.length,key+' missing cited club sources');
 historyBySlot.set(key,change);
 byBatch.set(change.batchId,(byBatch.get(change.batchId)||0)+1);
 clubs.add(change.clubId);
}
const initial=ledger.playerChanges.filter(x=>x.batchId.startsWith('CLUB-20261015-'));
assert.equal(initial.length,207,'the original 207 replacements must never disappear');
for(const [key,last] of historyBySlot){
 const p=ledger.currentRosterSnapshot[last.clubId].players[last.slot-1];
 assert.deepEqual({name:p.name,overall:p.rating},{name:last.current.name,overall:last.current.overall},key+' latest player differs from history');
 assert.equal(p.role,last.role,key+' latest role differs');
 const game=ROSTER_CORRECTIONS[last.clubId][last.slot-1];
 assert.equal(game.name,p.name);assert.equal(game.rating,p.rating);
 assert.equal(game.fictional,false);
 assert(game.ratingSource?.startsWith('Editorial')||game.ratingSource?.startsWith('FC27'),key+' rating provenance');
 assert(game.source&&typeof game.source==='string',key+' missing player-source URL');
}
assert.equal(ledger.summary.changedSlots,ledger.playerChanges.length);
assert.equal(ledger.summary.changedClubs,clubs.size);
for(const b of ledger.batches){
 assert.equal(byBatch.get(b.id),b.changedSlots,b.id+' count differs from recorded history');
 const teams=[...new Set(ledger.playerChanges.filter(x=>x.batchId===b.id).map(x=>x.clubId))].sort();
 assert.deepEqual(b.affectedClubIds,teams,b.id+' team list');
}
console.log('PASS 165 clubs / 1,980 current player snapshots / 207 baseline replacements + '+(ledger.playerChanges.length-207)+' subsequent recorded edits / '+ledger.batches.length+' immutable batches; source, role, audit SHA and history chain valid');
