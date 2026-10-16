// 2026-10-16 independent official EA FC27 & DFB Bayern immutable data-only acceptance.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=()=>JSON.parse(fs.readFileSync(path.join(root,'data/players/club26.json'),'utf8'));
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const ea="https://www.ea.com/nb/games/ea-sports-fc/ratings/teams-ratings/fc-bayern-munchen/21";
const names=["Manuel Neuer","Jonas Urbig","Joshua Kimmich","Dayot Upamecano","Jonathan Tah","Jamal Musiala","Konrad Laimer","Aleksandar Pavlović","Ismael Saibari","Harry Kane","Michael Olise","Luis Díaz"];
const shirts=[1,40,6,2,4,10,27,45,34,9,17,14];
const heights=[192,189,176,188,192,181,179,186,185,188,184,180];
const nationalities=["Germany","Germany","Germany","France","Germany","Germany","Austria","Germany","Morocco","England","France","Colombia"];
const birthdates=["1986-03-27","2003-08-08","1995-02-08","1998-10-27","1996-02-11","2003-02-26","1997-05-27","2004-05-03","2001-01-28","1993-07-28","2001-12-12","1997-01-13"];
const expected=[[81,80,80,87,78,31,82],[79,79,76,85,79,32,77],[88,71,73,90,84,81,79],[87,80,45,65,75,86,83],[87,62,38,60,63,87,86],[87,79,81,79,90,62,65],[85,86,69,78,77,81,77],[83,66,68,82,82,79,79],[83,83,78,77,83,55,82],[90,62,94,83,82,49,83],[90,83,82,89,91,47,69],[88,82,82,83,87,44,74]];
const ageAt=d=>{const [y,m,day]=d.split('-').map(Number);return 2026-y-(m>10||(m===10&&day>16)?1:0)};
test('Bayern 12 official FC27 OVR, 72 face stats and source/runtime parity',async()=>{
 const players=data().club26_1;
 const {ROSTER_CORRECTIONS}=await import('../src/roster_corrections.js');
 const audit=load('docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json');
 assert.deepEqual(players,ROSTER_CORRECTIONS.club26_1,'source/runtime must match');
 assert.deepEqual(players.map(p=>({name:p.name,role:p.role,rating:p.rating})),audit.club26_1.selected,'immutable selected names roles OVR');
 assert.equal(players.length,12);
 assert.deepEqual(players.map(p=>p.name),names);
 assert.equal(new Set(players.map(p=>p.id)).size,12);
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(role=>[role,players.filter(p=>p.role===role).length])),{GK:2,DF:3,MF:4,FW:3});
 const attrs=['pace','shooting','passing','dribbling','defending','physicality'];
 for(let n=0;n<players.length;n++){
  const p=players[n];
  assert.equal(p.rating,expected[n][0],p.name+' official FC27 OVR');
  assert.deepEqual(attrs.map(key=>p.fc27FaceStats[key]),expected[n].slice(1),p.name+' official EA six attributes');
  assert.equal(p.source,ea);assert.equal(p.fc27OfficialCheckedAt,'2026-10-16');
  assert.match(p.ratingSource,/^FC27 official EA launch ratings/);
  assert.equal(p.statsVerified,false,'arcade stats not EA headline attributes');
 }
});
test('Bayern DFB jerseys, DOB-derived ages, and FootballSquads physical heights',()=>{
 const players=data().club26_1;
 assert.deepEqual(players.map(p=>p.num),shirts);
 assert.deepEqual(players.map(p=>p.birthDate),birthdates,'DFB 2026/27 birth-date registration');
 assert.deepEqual(players.map(p=>p.nation),nationalities,'sourced Bayern nationality metadata');
 assert.equal(new Set(players.map(p=>p.num)).size,12);
 for(let n=0;n<12;n++){const p=players[n];assert.equal(p.shirtVerified,true,p.name+' DFB shirt verification');assert.equal(p.age,ageAt(p.birthDate),p.name+' current age');assert.equal(p.heightCm,heights[n],p.name+' height');}
 assert.equal(players.find(p=>p.name==='Konrad Laimer').num,27);
 assert.equal(players.find(p=>p.name==='Aleksandar Pavlović').num,45);
 assert.equal(players.find(p=>p.name==='Ismael Saibari').num,34);
});
test('Immutable Bayern per-field metadata batch tracks all changes and only Bayern',()=>{
 const ledger=load('docs/PLAYER_METADATA_BATCHES_20261016.json');
 const batch=ledger.batches.find(x=>x.id==='CLUB-20261016-FCB-FC27-VERIFICATION-1');
 assert(batch&&batch.clubId==='club26_1');
 assert.equal(batch.playersChanged,12);assert.equal(batch.changes.length,12);
 assert.equal(batch.officialFc27Audit.overallRatingsMatched,12);
 assert.equal(batch.officialFc27Audit.headlineAttributesMatched,72);
 assert.equal(batch.fieldsChanged,batch.changes.reduce((n,c)=>n+Object.keys(c.fields).length,0));
 const ps=data().club26_1;
 for(const change of batch.changes){const idx=ps.findIndex(p=>p.id===change.playerId);assert(idx>=0);assert.equal(change.rosterSlot,idx+1);for(const [k,v] of Object.entries(change.fields)){assert.equal(ps[idx][k],v.current);assert.match(v.source,/^https:\/\//);}}
});
