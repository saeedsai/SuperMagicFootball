// Official EA FC 27 Manchester City 2026-10-16 source-backed data-only contract.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const ea="https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/manchester-city/10",pl="https://www.premierleague.com/en/news/4725682/all-20-premier-league-clubs-squad-numbers-for-202627-season",heightsSource="https://footballsquads.co.uk/eng/2026-2027/engprem/mancity.htm";
const expected=[{"name":"Gianluigi Donnarumma","shirt":1,"age":27,"height":196,"nation":"Italy","dob":"1999-02-25","ovr":89,"face":[90,83,72,90,46,88]},{"name":"Gerónimo Rulli","shirt":28,"age":34,"height":189,"nation":"Argentina","dob":"1992-05-20","ovr":80,"face":[81,77,80,85,54,75]},{"name":"Rúben Dias","shirt":3,"age":29,"height":187,"nation":"Portugal","dob":"1997-05-14","ovr":87,"face":[58,44,69,69,87,83]},{"name":"Joško Gvardiol","shirt":24,"age":24,"height":185,"nation":"Croatia","dob":"2002-01-23","ovr":85,"face":[78,70,76,77,85,82]},{"name":"Marc Guéhi","shirt":6,"age":26,"height":182,"nation":"England","dob":"2000-07-13","ovr":85,"face":[69,46,70,72,85,82]},{"name":"Elliot Anderson","shirt":5,"age":23,"height":175,"nation":"England","dob":"2002-11-06","ovr":84,"face":[68,71,83,82,81,78]},{"name":"Phil Foden","shirt":47,"age":26,"height":171,"nation":"England","dob":"2000-05-28","ovr":84,"face":[77,82,82,88,57,53]},{"name":"Jérémy Doku","shirt":11,"age":24,"height":179,"nation":"Belgium","dob":"2002-05-27","ovr":84,"face":[91,75,78,88,40,72]},{"name":"Matheus Nunes","shirt":27,"age":28,"height":183,"nation":"Portugal","dob":"1998-08-27","ovr":83,"face":[87,70,80,79,78,75]},{"name":"Erling Haaland","shirt":9,"age":26,"height":195,"nation":"Norway","dob":"2000-07-21","ovr":91,"face":[87,92,71,80,47,89]},{"name":"Rayan Cherki","shirt":10,"age":23,"height":177,"nation":"France","dob":"2003-08-17","ovr":86,"face":[74,79,85,91,41,67]},{"name":"Antoine Semenyo","shirt":42,"age":26,"height":178,"nation":"Ghana","dob":"2000-01-07","ovr":85,"face":[82,85,79,84,46,80]}];
const ageAt=d=>{const [y,m,day]=d.split('-').map(Number);return 2026-y-(m>10||(m===10&&day>16)?1:0)};
test('Manchester City exactly matches 12 official FC27 overall scores and 72 six-face values',async()=>{
 const all=load('data/players/club26.json'),city=all.club26_2;
 const {ROSTER_CORRECTIONS}=await import('../src/roster_corrections.js');
 const selection=load('docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json').club26_2.selected;
 assert.deepEqual(city,ROSTER_CORRECTIONS.club26_2,'City source/runtime parity');
 assert.deepEqual(city.map(x=>({name:x.name,role:x.role,rating:x.rating})),selection,'immutable selection and rating');
 assert.equal(city.length,12);assert.equal(new Set(city.map(x=>x.id)).size,12);
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(r=>[r,city.filter(x=>x.role===r).length])),{GK:2,DF:3,MF:4,FW:3});
 const attributes=['pace','shooting','passing','dribbling','defending','physicality'];
 for(let i=0;i<12;i++){const p=city[i],ev=expected[i];assert.equal(p.name,ev.name);
 assert.equal(p.rating,ev.ovr,p.name+' OVR');assert.deepEqual(attributes.map(a=>p.fc27FaceStats[a]),ev.face,p.name+' EA 6-card stats');
 assert.equal(p.source,ea);assert.match(p.ratingSource,/^FC27 official EA launch ratings/);
 assert.equal(p.fc27OfficialCheckedAt,'2026-10-16');assert.equal(p.statsVerified,false,'arcade power/shot/defence untouched');
 }
});
test('Manchester City 2026/27 PL shirts, physical biographies and DOB/age/nationality',()=>{
 const city=load('data/players/club26.json').club26_2;
 assert.deepEqual(city.map(p=>p.num),expected.map(x=>x.shirt),'Premier League 2026/27 jerseys');
 assert.equal(new Set(city.map(p=>p.num)).size,12,'unique shirts');
 for(let i=0;i<12;i++){const p=city[i],ev=expected[i];
 assert.equal(p.shirtVerified,true,p.name+' officially registered shirt');assert.equal(p.nation,ev.nation,p.name+' nationality');
 assert.equal(p.birthDate,ev.dob,p.name+' DOB');assert.equal(p.age,ageAt(p.birthDate),p.name+' age on 2026-10-16');
 assert.equal(p.heightCm,ev.height,p.name+' height');
 }
});
test('Manchester City exclusive provenance changes accounted for in immutable metadata audit',()=>{
 const city=load('data/players/club26.json').club26_2;
 const batch=load('docs/PLAYER_METADATA_BATCHES_20261016.json').batches.find(b=>b.id==='CLUB-20261016-MCI-FC27-VERIFICATION-1');
 assert(batch&&batch.clubId==='club26_2');assert.equal(batch.playersChanged,12);assert.equal(batch.changes.length,12);
 assert.equal(batch.officialFc27Audit.overallRatingsMatched,12);assert.equal(batch.officialFc27Audit.headlineAttributesMatched,72);
 assert.equal(batch.otherSources.shirtNumbers,pl);assert.equal(batch.otherSources.physicalAndDOB,heightsSource);
 assert.equal(batch.fieldsChanged,batch.changes.reduce((n,v)=>n+Object.keys(v.fields).length,0));
 for(const change of batch.changes){const i=city.findIndex(p=>p.id===change.playerId);assert(i>=0);
 assert.equal(change.rosterSlot,i+1);assert.equal(change.name,city[i].name);
 for(const [field,v] of Object.entries(change.fields)){assert.equal(city[i][field],v.current);assert.match(v.source,/^https:\/\//);}
 }
});
