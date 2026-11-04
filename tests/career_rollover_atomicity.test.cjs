'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('src/modules/ui.js','utf8');
const start=source.indexOf('function beginCareerNextSeason(){');
const end=source.indexOf('\nfunction showManager(){',start);
assert.ok(start>=0&&end>start,'Career rollover UI function exists');
const block=source.slice(start,end);
const makeCareer=()=>({season:1,week:14,leagueFinished:true,table:{standings:[1,2,3]}});
function fixture(failSave=false){
 const original=makeCareer(),events=[];let context;context={career:original,TEAMS:[],
  careerSeasonReview:()=>({available:true}),
  nextSeason(value){value.season++;value.week=0;value.leagueFinished=false;value.table={standings:[]};},
  careerSlots:{active:2,save(slot,value){events.push(['save',slot,value.season]);if(failSave)throw Error('QuotaExceededError');}},
  store:{put(key,value){events.push(['mirror',key,value.season]);}},
  saveCareer(){context.careerSlots.save(context.careerSlots.active,context.career);context.store.put('managerCareer',context.career);},
  alert:message=>events.push(['alert',message]),showManager:()=>events.push(['manager']),
  showCareerSeasonReview:()=>events.push(['review'])};
 vm.runInNewContext(block+';this.begin=beginCareerNextSeason;',context);
 return {context,original,events};
}

test('failed Career season save leaves the in-memory season and standings available to retry',()=>{
 const f=fixture(true);
 assert.doesNotThrow(()=>f.context.begin());
 assert.equal(f.context.career,f.original,'failed rollover keeps the original Career object');
 assert.deepEqual(f.original,makeCareer(),'failed rollover preserves the completed league table');
 assert.deepEqual(f.events,[['save',2,2],['alert','Career season rollover failed: QuotaExceededError'],['review']]);
});

test('successful Career rollover persists the staged season before publishing it',()=>{
 const f=fixture();f.context.begin();
 assert.equal(f.original.season,1,'staging does not mutate the completed Career');
 assert.equal(f.context.career.season,2);
 assert.deepEqual(f.events,[['save',2,2],['mirror','managerCareer',2],['manager']]);
});
