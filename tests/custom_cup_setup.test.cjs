'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');

const runtimeImport=import('../src/tournaments.js');
const slotsImport=import('../src/modules/cup_slots.js');
const teams=Array.from({length:16},(_,id)=>({id,name:`Club ${id+1}`,rank:50+id}));
const memory=()=>{const data=new Map();return {getItem:key=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)}};

test('Custom Cup factory validates entrants, creates a playable seeded knockout, and advances for 4–16 existing teams',async()=>{
 await (await import('../src/assets.js')).loadAssetsFromNode();
 const runtime=await runtimeImport,mod=(await import('../src/modules/tournaments.js')).TOURNAMENTS,{CUP_SLOTS}=await slotsImport;
 for(let count=4;count<=16;count++){
  const participants=teams.slice(0,count).map(team=>team.id);
  for(const api of [runtime,mod]){
   const cup=api.createCustomKnockoutTournament(0,participants,teams);
   assert.equal(cup.compId,'CUSTOM');assert.equal(cup.id,'cup_CUSTOM');assert.equal(cup.phase,'knockout');
   assert.equal(cup.participants.length,count);assert.equal(cup.knockout.matches.length,Math.floor(count/2));
   assert.equal(cup.knockout.byes.length,count%2);
   assert.equal(api.validateTournament(cup,teams),true,`${count} entrants start valid`);
   assert.equal(CUP_SLOTS.validTournament(cup),true,`${count} entrants fit Cup slot schema`);
   const vault=CUP_SLOTS.create(memory());vault.save(1,cup,'Custom Cup');
   assert.equal(vault.load(1,stored=>api.validateTournament(stored,teams)).compId,'CUSTOM');
   let guard=0;
   while(cup.phase==='knockout'&&guard++<6){
    const fixture=api.tournamentCurrent(cup);
    const score=fixture.bye?null:[2,0];
    api.tournamentAdvance(cup,teams,score);
    assert.equal(api.validateTournament(cup,teams),true,`${count} entrant campaign remains valid after round ${guard}`);
    assert.equal(CUP_SLOTS.validTournament(cup),true,`${count} entrant campaign remains saveable after round ${guard}`);
   }
   assert.equal(cup.phase,'finished',`${count} entrants complete within six rounds`);
   assert.equal(cup.winner,0,`selected club can win its path with a winning score`);
  }
 }
});

test('Custom Cup rejects missing, duplicate, unknown, over-limit, or non-member player teams',async()=>{
 const api=(await runtimeImport);
 for(const participants of [null,[],[0,1,2],[0,1,2,2],[0,1,2,99],Array.from({length:17},(_,id)=>id)])
  assert.throws(()=>api.createCustomKnockoutTournament(0,participants,teams),/4–16 different existing teams/);
 assert.throws(()=>api.createCustomKnockoutTournament(15,[0,1,2,3],teams),/4–16 different existing teams/);
 assert.throws(()=>api.createCustomKnockoutTournament(0,[0,1,2,3],[]),/4–16 different existing teams/);
});

test('Custom Cup runtime, modular, slot, and rechecksummed backup validators reject non-knockout or oversized saves',async()=>{
 await (await import('../src/assets.js')).loadAssetsFromNode();
 const runtime=await runtimeImport,mod=(await import('../src/modules/tournaments.js')).TOURNAMENTS,{CUP_SLOTS}=await slotsImport;
 const valid=runtime.createCustomKnockoutTournament(0,[0,1,2,3],teams);
 const variants=[
  {...valid,format:'league'},
  {...valid,phase:'league',rounds:[[[0,1],[2,3]]]},
  {...valid,participants:[...valid.participants,...Array.from({length:13},(_,i)=>i+4)],table:{...valid.table,...Object.fromEntries(Array.from({length:13},(_,i)=>[i+4,{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}]))}},
  {...valid,participants:[0,1,2]},
  {...valid,groups:[[0,1,2,3]]},
  {...valid,knockout:null},
 ];
 for(const malformed of variants){
  assert.equal(runtime.validateTournament(malformed,teams),false);
  assert.equal(mod.validateTournament(malformed,teams),false);
  assert.equal(CUP_SLOTS.validTournament(malformed),false);
 }
 const vault=CUP_SLOTS.create(memory());vault.save(1,valid,'Custom Cup');
 const validEnvelope=JSON.parse(vault.exportBackup());
 const rechecksummed=malformed=>{
  const payload=JSON.parse(validEnvelope.payload);payload.slots[0].tournament=malformed;
  const bytes=JSON.stringify(payload);let checksum=2166136261;
  for(let i=0;i<bytes.length;i++){checksum^=bytes.charCodeAt(i);checksum=Math.imul(checksum,16777619)>>>0;}
  return JSON.stringify({...validEnvelope,payload:bytes,checksum:checksum.toString(16).padStart(8,'0')});
 };
 for(const malformed of variants){
  assert.throws(()=>vault.inspectBackup(rechecksummed(malformed)),/Invalid Cup backup slots or tournament data/);
  assert.throws(()=>vault.importBackup(rechecksummed(malformed),{overwrite:true}),/Invalid Cup backup slots or tournament data/);
 }
});

test('Custom Cup and Custom League both route to playable local tournament setup',()=>{
 const ui=readFileSync('src/modules/ui.js','utf8');
 assert.match(ui,/navItem\('Custom Cup','customCupSetup'/);
 assert.match(ui,/navItem\('Custom League','customLeagueSetup'/);
 assert.match(ui,/function startCustomCup\(\)/);
 assert.match(ui,/createCustomKnockoutTournament\(club,participants,TEAMS\)/);
 assert.match(ui,/if\(a==='customCupStart'\)startCustomCup\(\)/);
 assert.match(ui,/function startCustomLeague\(\)/);
 assert.match(ui,/createCustomLeague\(club,participants,TEAMS\)/);
 assert.match(ui,/if\(a==='customLeagueStart'\)startCustomLeague\(\)/);
});
