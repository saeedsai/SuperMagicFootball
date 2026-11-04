'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');

test('potential uses five named inclusive numeric bands and leaves absent legacy potential unknown',async()=>{
 const runtime=await runtimeImport,mod=(await moduleImport).CAREER;
 const edges=[[0,'Foundation'],[59,'Foundation'],[60,'Developing'],[69,'Developing'],
  [70,'Promising'],[79,'Promising'],[80,'Elite'],[89,'Elite'],[90,'Generational'],[99,'Generational']];
 for(const [score,label] of edges){assert.equal(runtime.careerPotentialBand(score),label);assert.equal(mod.careerPotentialBand(score),label);}
 assert.equal(runtime.careerPotentialBand({potential:84}),'Elite');
 assert.equal(runtime.careerPotentialBand(undefined),null);assert.equal(runtime.careerPotentialBand(''),null);
 assert.deepEqual(runtime.POTENTIAL_BANDS,mod.POTENTIAL_BANDS);
});

test('growth is pure and repeatable, capped by potential and bounded by attribute limits',async()=>{
 const C=await runtimeImport;
 const source={id:'youth-1',role:'MF',age:19,rating:79,potential:80,power:98,shoot:69,defense:69,
  passing:98,crossing:50,stamina:50,speedRating:50,agility:50,dribbling:50,xp:25};
 const before=structuredClone(source);
 const a=C.applyCareerGrowth(source,{training:3,performance:2});
 const b=C.applyCareerGrowth(source,{training:3,performance:2});
 const mirror=(await moduleImport).CAREER;
 assert.deepEqual(a,b,'same inputs always produce the same growth');
 assert.deepEqual(mirror.applyCareerGrowth(source,{training:3,performance:2}),a,'runtime and editable module stay aligned');
 assert.deepEqual(source,before,'pure calculation leaves its input untouched');
 assert.deepEqual(Object.keys(a).sort(),Object.keys(source).sort(),'no growth metadata is added to saved players');
 assert.equal(a.rating,80,'potential is a hard overall rating cap');
 assert.equal(a.power,99);assert.equal(a.shoot,70);assert.equal(a.defense,70);assert.equal(a.passing,100);
 assert.ok(a.rating-source.rating<=2,'per-event rating gain is bounded');
 assert.equal(C.applyCareerGrowth({...source,rating:80},{training:3,performance:2}).rating,80,'cannot exceed potential');
 const abovePotentialSave={...source,rating:86,potential:80};
 assert.equal(C.applyCareerGrowth(abovePotentialSave,{training:0,performance:-2}).rating,85,
  'legacy players already above potential regress gradually and are never clamped down in one update');
});

test('training, performance and age bands have deterministic growth or regression',async()=>{
 const C=await runtimeImport;
 const base={role:'DF',rating:70,potential:90,power:70,shoot:40,defense:45,strength:60,aggression:60,stamina:60};
 const trained=C.applyCareerGrowth({...base,age:25},{training:3,performance:0});
 const poor=C.applyCareerGrowth({...base,age:25},{training:0,performance:-2});
 assert.equal(trained.rating,72);assert.equal(poor.rating,69,'poor performance can regress a capped event');
 const expected=new Map([[19,72],[21,71],[29,70],[32,69]]);
 for(const [age,rating] of expected){
  assert.equal(C.applyCareerGrowth({...base,age},{training:1,performance:0}).rating,rating,`age ${age} growth band`);
 }
 const youngSeason=C.applyCareerGrowth({...base,age:18,rating:70},{ageAdvance:true,training:2});
 const veteranSeason=C.applyCareerGrowth({...base,age:34,rating:70},{ageAdvance:true,training:2});
 assert.equal(youngSeason.rating,71,'young players develop when advancing a season');
 assert.equal(veteranSeason.rating,69,'veterans regress when advancing a season');
});

test('career training supports legacy roster shapes without mutating canonical source data',async()=>{
 const C=await runtimeImport;
 const legacy={id:'old-youth',name:'Legacy Prospect',role:'DF',age:18,level:1,xp:25,power:50,shoot:40,defense:45};
 const canonical=structuredClone(legacy);
 const teams=[{id:'one',group:'club26',rank:60,flag:'XX',customRoster:[legacy]}];
 const career=C.createCareer(0,teams);
 assert.notEqual(career.roster[0],legacy,'career owns a copied roster');
 assert.doesNotThrow(()=>C.trainPlayer(career,0));
 assert.deepEqual(legacy,canonical,'growth never mutates the canonical team roster');
 assert.equal(career.roster[0].power,52,'focused training grows legacy players without a potential field');
 assert.deepEqual(Object.keys(career.roster[0]).sort(),Object.keys(legacy).sort(),'training does not require potential or a new save field');
 assert.equal(career.roster[0].potential,undefined);assert.equal(career.roster[0].rating,undefined);
});

test('career match performance is applied deterministically when XP crosses a level',async()=>{
 const C=await runtimeImport;
 const make=()=>({club:0,season:1,week:0,members:[0,1],fixtures:[[[0,1]],[[1,0]]],
  table:{0:{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},1:{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}},
  cash:100000000,roster:[{id:'performer',role:'MF',age:25,level:2,xp:85,potential:90,rating:75,power:75,shoot:50,defense:50,value:4000000}],
  facilities:{training:1,stadium:1},cup:{stage:0,eliminated:false,pending:false,wins:0},history:[]});
 const winning=make(),losing=make();
 C.advanceCareer(winning,[{rank:60},{rank:60}],[2,0]);
 C.advanceCareer(losing,[{rank:60},{rank:60}],[0,2]);
 assert.equal(winning.roster[0].rating,77,'winning form and training produce bounded growth');
 assert.equal(losing.roster[0].rating,74,'poor form produces deterministic regression');
 assert.equal(winning.roster[0].level,3);assert.equal(losing.roster[0].level,3);
});

test('legacy careers with missing facilities and optional fields can age into regression without migration',async()=>{
 const C=await runtimeImport;
 const player={id:'veteran',role:'FW',age:33,level:4,xp:10,power:65,shoot:50,defense:42};
 const career={season:4,roster:[player],members:[0],club:0,week:0,leagueFinished:false};
 assert.doesNotThrow(()=>C.nextSeason(career));
 assert.equal(career.roster[0].age,34);assert.equal(career.roster[0].power,64);
 assert.equal(career.roster[0].potential,undefined);assert.equal(career.roster[0].rating,undefined);
 assert.deepEqual(Object.keys(career.roster[0]).sort(),Object.keys(player).sort());
});

test('scouted Academy IDs stay unique after signing a prospect and scouting again in the same week',async()=>{
 const runtime=await runtimeImport,mod=(await moduleImport).CAREER;
 const run=api=>{
  const career={club:4,season:2,week:3,cash:100000000,facilities:{academy:1},scouted:[],
   roster:Array.from({length:12},(_,i)=>({id:`starter_${i}`,name:`Starter ${i}`,num:i+1}))};
  const first=api.scoutAcademy(career);
  const signed=api.signAcademy(career,0,0);
  const next=api.scoutAcademy(career);
  const ids=[...career.roster,...career.scouted].map(player=>player.id);
  assert.equal(new Set(ids).size,ids.length,'no Career roster/scouting identity is duplicated');
  assert.notEqual(next.id,signed.id,'the next same-week scout does not reuse the signed prospect ID');
  return {first:first.id,signed:signed.id,next:next.id};
 };
 assert.deepEqual(run(runtime),run(mod),'standalone and bundled Career behavior stay aligned');
});
