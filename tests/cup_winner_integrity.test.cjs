'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const cupImport=import('../src/modules/cup_slots.js');
const campaign=(club=1)=>({id:'cup_UEFA',compId:'UEFA',club,participants:[club,2,3,4],phase:'league',roundIdx:0,
 history:[],rounds:[],groups:[],table:{[club]:{},2:{},3:{},4:{}},earned:0,winner:null,knockout:null});
function memory(){const map=new Map();return {getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)}}

test('Cup slot validation rejects foreign winners and winners on active campaigns',async()=>{
 const {CUP_SLOTS}=await cupImport,base=campaign();
 assert.equal(CUP_SLOTS.validTournament(base),true);
 assert.equal(CUP_SLOTS.validTournament({...base,winner:99}),false,'winner must be one of the saved participants');
 assert.equal(CUP_SLOTS.validTournament({...base,winner:2}),false,'active campaigns cannot claim a winner');
 assert.equal(CUP_SLOTS.validTournament({...base,phase:'finished',winner:2}),true,'a finished campaign may name a participant winner');
 assert.equal(CUP_SLOTS.validTournament({...base,phase:'finished',winner:null}),true,'elimination or nonqualification may finish without a champion');
});

test('invalid winner is rejected before a Cup slot write',async()=>{
 const {CUP_SLOTS}=await cupImport,storage=memory(),slots=CUP_SLOTS.create(storage);
 assert.throws(()=>slots.save(1,{...campaign(),winner:99},'bad winner'),/invalid Cup campaign/);
 assert.equal(storage.getItem('legend_cupSlots'),null);
 assert.equal(slots.list().filter(slot=>slot.occupied).length,0);
});

test('runtime restore validation enforces the same winner and phase rules',async()=>{
 const [{TEAMS,SHOTS},{installExpansion},{installContinentalClubs},{validateTournament,createTournament}]=await Promise.all([
  import('../src/data.js'),import('../src/expanded.js'),import('../src/continental.js'),import('../src/tournaments.js')
 ]);
 installExpansion(TEAMS,SHOTS);
 const mapping=installContinentalClubs(TEAMS,SHOTS),fresh=createTournament('UEFA',mapping.UEFA[0],TEAMS,mapping);
 assert.equal(validateTournament(fresh,TEAMS),true);
 assert.equal(validateTournament({...fresh,winner:mapping.UEFA[1]},TEAMS),false,'active winner must be null');
 assert.equal(validateTournament({...fresh,winner:Number.MAX_SAFE_INTEGER},TEAMS),false,'winner must belong to participants');
 const champion={...fresh,phase:'finished',winner:mapping.UEFA[1]};
 assert.equal(validateTournament(champion,TEAMS),true,'finished tournament may retain a participant champion');
 assert.equal(validateTournament({...champion,winner:Number.MAX_SAFE_INTEGER},TEAMS),false);
});

test('standalone and modular restore validators keep the Cup winner guard aligned',()=>{
 const runtime=fs.readFileSync(path.resolve('src/tournaments.js'),'utf8');
 const modular=fs.readFileSync(path.resolve('src/modules/tournaments.js'),'utf8');
 const guard="!(t.winner===null||(Number.isInteger(t.winner)&&t.participants.includes(t.winner)))||(t.phase!=='finished'&&t.winner!==null)";
 assert.ok(runtime.includes(guard));assert.ok(modular.includes(guard));
});
