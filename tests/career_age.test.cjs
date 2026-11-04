'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');

test('verified ISO birth dates give age only on or after the birthday',async()=>{
 const runtime=await runtimeImport,mod=(await moduleImport).CAREER;
 const player={ageVerified:true,birthDate:'2000-11-02'};
 for(const api of [runtime,mod]){
  assert.equal(api.verifiedPlayerAgeOnDate(player,'2026-11-01'),25);
  assert.equal(api.verifiedPlayerAgeOnDate(player,'2026-11-02'),26);
  assert.equal(api.verifiedPlayerAgeOnDate({...player,ageVerified:false},'2026-11-02'),null);
  assert.equal(api.verifiedPlayerAgeOnDate({...player,birthDate:'2000-02-30'},'2026-11-02'),null);
  assert.equal(api.verifiedPlayerAgeOnDate({...player,birthDate:'2027-01-01'},'2026-11-02'),null);
  const leap={ageVerified:true,birthDate:'2004-02-29'};
  assert.equal(api.verifiedPlayerAgeOnDate(leap,'2025-02-28'),20,'leap-day birthdays age on March 1 in non-leap years');
  assert.equal(api.verifiedPlayerAgeOnDate(leap,'2025-03-01'),21);
 }
});

test('new Career dates refresh verified ages without changing canonical team rosters',async()=>{
 const C=await runtimeImport;
 const verified={id:'verified',role:'MF',age:18,ageVerified:true,birthDate:'2000-01-01'};
 const provisional={id:'provisional',role:'FW',age:17,ageVerified:false,birthDate:'2009-12-01'};
 const team={group:'club26',flag:'XX',continent:'UEFA',rank:60,customRoster:[verified,provisional]};
 const rival={group:'club26',flag:'YY',continent:'UEFA',rank:61,customRoster:[]};
 const career=C.createCareer(0,[team,rival]);
 const today=new Date().toISOString().slice(0,10);
 assert.equal(career.seasonDate,today);
 assert.equal(career.roster[0].age,C.verifiedPlayerAgeOnDate(verified,today));
 assert.equal(career.roster[1].age,17,'unverified birth dates do not replace legacy age');
 assert.deepEqual(verified,{id:'verified',role:'MF',age:18,ageVerified:true,birthDate:'2000-01-01'});
});

test('season advances use the saved calendar date and verified DOB, with legacy age fallback',async()=>{
 const C=await runtimeImport,mod=(await moduleImport).CAREER;
 const make=()=>({club:0,season:1,seasonDate:'2026-10-31',week:0,members:[0],fixtures:[],
  table:{0:{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}},cash:0,
  roster:[
   {id:'verified',role:'MF',age:18,ageVerified:true,birthDate:'2008-11-15',rating:70,potential:90,power:70,shoot:40,defense:45},
   {id:'legacy',role:'FW',age:33,rating:70,power:65,shoot:50,defense:42}
  ],facilities:{training:1},cup:{stage:0,eliminated:false,pending:false,wins:0}});
 const a=make(),b=make();
 C.nextSeason(a);mod.nextSeason(b);
 assert.equal(a.seasonDate,'2027-10-31');assert.equal(a.seasonDate,b.seasonDate);
 assert.equal(a.roster[0].age,18,'verified age follows DOB and saved season date');
 assert.equal(a.roster[1].age,34,'legacy age still advances by one season');
 assert.equal(a.roster[1].power,64,'existing gradual veteran regression remains active');
 assert.deepEqual(a,b,'runtime and modular career implementations stay in sync');
 const leap=make();leap.seasonDate='2024-02-29';C.nextSeason(leap);assert.equal(leap.seasonDate,'2025-02-28');
});

test('legacy Career saves still advance age without requiring a date migration',async()=>{
 const C=await runtimeImport;
 const career={season:4,roster:[{id:'legacy',role:'FW',age:24,level:2,xp:0,power:50,shoot:40,defense:42}],members:[0],club:0,week:0,leagueFinished:false};
 C.nextSeason(career);
 assert.equal(career.roster[0].age,25);
 assert.match(career.seasonDate,/^\d{4}-\d{2}-\d{2}$/);
 assert.equal(career.roster[0].birthDate,undefined);
});

test('season rollover safely advances provisional legacy ages without string concatenation',async()=>{
 const C=await runtimeImport,mod=(await moduleImport).CAREER;
 const cases=[['33',34],['0',1],[0,1],[-1,24],['unknown',24],[Number.MAX_SAFE_INTEGER,24],[undefined,24]];
 for(const [age,expected] of cases){
  const make=()=>({season:2,roster:[{id:'legacy-age',role:'FW',age,ageVerified:false,level:1,xp:0}],members:[0],club:0,week:0,leagueFinished:false,fixtures:[],table:{},cup:{}});
  const a=make(),b=make();C.nextSeason(a);mod.nextSeason(b);
  assert.equal(a.roster[0].age,expected,`age ${String(age)} rolls over safely`);
  assert.deepEqual(b,a,'runtime and modular APIs remain compatible');
 }
});

test('Career squad UI displays age and clearly identifies verified versus provisional sources',()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
 assert.match(ui,/function careerAgeLabel\(p,date\)\{const dobAge=verifiedPlayerAgeOnDate\(p,date\),verified=dobAge!==null/);
 assert.match(ui,/verified\?'DOB VERIFIED':'PROVISIONAL'/);
 assert.match(ui,/<small>\$\{p\.role\} · \$\{careerAgeLabel\(p,career\.seasonDate\)\} · LV /);
});

test('Career squad labels DOB verified only when the saved date validates the birth date',async()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
 const start=ui.indexOf('function careerAgeLabel(p,date){'),end=ui.indexOf('\nfunction showCareerSquad()',start);
 assert.ok(start>=0&&end>start,'Career age label helper exists');
 const C=await runtimeImport;
 const label=vm.runInNewContext(ui.slice(start,end)+';careerAgeLabel',{verifiedPlayerAgeOnDate:C.verifiedPlayerAgeOnDate});
 const source={ageVerified:true,birthDate:'2000-11-02',age:25};
 assert.equal(label(source,'2026-11-02'),'AGE 26 · DOB VERIFIED','saved Career date gives the age on the birthday');
 assert.equal(label({...source,birthDate:'2000-02-30'},'2026-11-02'),'AGE 25 · PROVISIONAL','invalid DOB does not claim verification');
 assert.equal(label({...source,birthDate:'2027-01-01'},'2026-11-02'),'AGE 25 · PROVISIONAL','future DOB does not claim verification');
 assert.deepEqual(source,{ageVerified:true,birthDate:'2000-11-02',age:25},'label rendering leaves Career data unchanged');
});
