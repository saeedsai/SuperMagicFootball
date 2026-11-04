'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
const start=ui.indexOf('// Never let a structurally damaged legacy mirror');
const end=ui.indexOf('\nlet continentalRun=',start);
assert.ok(start>=0&&end>start,'Career startup restore block is present');
const startup=ui.slice(start,end);
const validatorStart=ui.indexOf('function careerBackupTeamReferencesValid(saved){');
const validatorEnd=ui.indexOf('\nfunction renderCareerBackupPreview',validatorStart);
assert.ok(validatorStart>=0&&validatorEnd>validatorStart,'team-reference validator is present');
const validatorSource=ui.slice(validatorStart,validatorEnd);
const careerApi=import('../src/modules/career_slots.js');
function memory(initial={}){
 const data=new Map(Object.entries(initial));
 return {getItem:key=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
}
const career=club=>({club,season:2,week:4,members:[club],fixtures:Array.from({length:14},()=>[]),history:[],roster:Array.from({length:12},(_,i)=>({id:`p${club}-${i}`})),table:{[club]:{pts:0,gf:0,ga:0}},facilities:{training:1},cup:{stage:0},cash:100});
async function bootCareer(storage,legacy,teams){
 const {CAREER_SLOTS}=await careerApi;
 const careerSlots=CAREER_SLOTS.create(storage);
 const validator=vm.runInNewContext(`${validatorSource};careerBackupTeamReferencesValid`,{TEAMS:teams,Number,Array,Set,Object});
 const context={career:legacy,careerSlots,CAREER_SLOTS,careerBackupTeamReferencesValid:validator,clubs:[],TEAMS:teams,store:{put(){throw Error('startup must not rewrite the legacy mirror')}},console:{warn(){}}};
 vm.runInNewContext(startup,context);
 return {career:context.career,careerSlots};
}

test('SAVE-103 startup rejects an occupied Career vault slot with unavailable team references and preserves legacy bytes',async()=>{
 const storage=memory(),teams=[{id:'a'},{id:'b'},{id:'c'}],legacy=career(1);
 const legacyBytes=JSON.stringify(legacy);storage.setItem('legend_managerCareer',legacyBytes);
 const {CAREER_SLOTS}=await careerApi;
 const slots=CAREER_SLOTS.create(storage);slots.save(1,career(99),'stale team');
 const vaultBytes=storage.getItem('legend_careerSlots');
 const booted=await bootCareer(storage,legacy,teams);
 assert.equal(booted.career,null,'the vault is authoritative and an unavailable active Career fails closed');
 assert.equal(storage.getItem('legend_careerSlots'),vaultBytes,'the slot remains available for export/recovery');
 assert.equal(storage.getItem('legend_managerCareer'),legacyBytes,'the legacy mirror remains untouched');
});

test('SAVE-103 malformed legacy Career data is ignored without deleting its stored bytes',async()=>{
 const teams=[{id:'a'},{id:'b'}],legacy={club:1},legacyBytes=JSON.stringify(legacy),storage=memory({'legend_managerCareer':legacyBytes});
 const booted=await bootCareer(storage,legacy,teams);
 assert.equal(booted.career,null);
 assert.equal(booted.careerSlots.hasVault,false,'damaged legacy data is not migrated');
 assert.equal(storage.getItem('legend_managerCareer'),legacyBytes,'the original bytes remain available for recovery');
});

test('SAVE-103 player-facing Career slot load passes the team-reference validator',()=>{
 assert.match(ui,/careerSlots\.load\(n,careerBackupTeamReferencesValid\)/);
});
