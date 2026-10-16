// Arsenal 2026/27 official EA FC27 and Premier League source contract; only club26_0.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const ea="https://www.ea.com/sv/games/ea-sports-fc/ratings/teams-ratings/arsenal/1";
const names=["David Raya","Kepa","Gabriel","William Saliba","Ezri Konsa","Declan Rice","Bruno Guimarães","Martin Ødegaard","Zubimendi","Bukayo Saka","Viktor Gyökeres","Eberechi Eze"];
const shirts=[1,13,6,2,15,41,39,8,36,7,14,10];
const ages=[31,32,28,25,28,27,28,27,27,25,28,28];
const heights=[183,189,190,192,183,185,182,176,180,178,187,173];
const face=[[87,86,88,88,58,86],[77,77,82,80,47,76],[64,44,64,66,91,84],[77,41,68,73,90,82],[71,55,72,75,86,80],[72,75,86,81,85,84],[59,75,85,84,80,80],[65,78,88,87,66,63],[65,71,82,80,80,75],[79,82,85,87,60,73],[81,87,72,78,44,87],[74,80,82,87,57,68]];
const ovr=[88,78,89,88,84,88,86,86,84,87,86,84];
const keys=['pace','shooting','passing','dribbling','defending','physicality'];
const dobAge=d=>{const [y,m,day]=d.split('-').map(Number);return 2026-y-(m>10||(m===10&&day>16)?1:0)};
test('Arsenal 12 FC27 official EA launch base-card ratings and 72 face stats match exactly',async()=>{
 const data=load('data/players/club26.json').club26_0;
 const {ROSTER_CORRECTIONS}=await import('../src/roster_corrections.js');
 const all=load('docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json');
 assert.deepEqual(data,ROSTER_CORRECTIONS.club26_0,'source/runtime parity');
 assert.deepEqual(data.map(p=>({name:p.name,role:p.role,rating:p.rating})),all.club26_0.selected,'immutable selected OVR/role/name');
 assert.deepEqual(data.map(p=>p.name),names);
 assert.deepEqual(data.map(p=>p.rating),ovr);
 assert.equal(data.length,12);
 assert.equal(new Set(data.map(p=>p.id)).size,12);
 for(let i=0;i<12;i++){
  const p=data[i];
  assert.deepEqual(keys.map(k=>p.fc27FaceStats[k]),face[i],p.name+' EA six headline values');
  assert.equal(p.source,ea,p.name+' EA primary citation');
  assert.match(p.ratingSource,/^FC27 official EA launch ratings/);
  assert.equal(p.fc27OfficialCheckedAt,'2026-10-16');
  assert.equal(p.statsVerified,false,'do not imply arcade gameplay scales are FC27 stats');
 }
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(role=>[role,data.filter(p=>p.role===role).length])),{GK:2,DF:3,MF:4,FW:3});
});
test('Arsenal 2026/27 PL jerseys, DOB-derived October ages, and sourced height metadata',()=>{
 const all=load('data/players/club26.json');const data=all.club26_0;
 assert.deepEqual(data.map(p=>p.num),shirts);
 assert.equal(new Set(data.map(p=>p.num)).size,12);
 for(let i=0;i<12;i++){
  assert.equal(data[i].shirtVerified,true,data[i].name+' confirmed shirt');
  assert.equal(data[i].age,dobAge(data[i].birthDate),data[i].name+' current age');
  assert.equal(data[i].age,ages[i]);
  assert.equal(data[i].heightCm,heights[i]);
 }
});
test('Every Arsenal metadata field change has an immutable per-field source and no other club is in the batch',()=>{
 const ledger=load('docs/PLAYER_METADATA_BATCHES_20261016.json');
 const batch=ledger.batches.find(b=>b.id==='CLUB-20261016-ARS-FC27-VERIFICATION-1');
 assert(batch,'audit batch missing');
 assert.equal(batch.clubId,'club26_0');assert.equal(batch.playersChanged,12);
 assert.equal(batch.officialFc27Audit.playersMatched,12);
 assert.equal(batch.officialFc27Audit.faceStatGroupsMatched,72);
 assert.equal(batch.changes.length,12);
 assert.equal(batch.fieldsChanged,batch.changes.reduce((sum,e)=>sum+Object.keys(e.fields).length,0));
 const players=load('data/players/club26.json').club26_0;
 for(const c of batch.changes){
  const p=players.find(q=>q.id===c.playerId);assert(p);
  assert.equal(c.rosterSlot,players.indexOf(p)+1);
  for(const [k,v] of Object.entries(c.fields)){
   assert.equal(p[k],v.current,p.name+' '+k+' mismatch');
   assert.match(v.source,/^https:\/\//);
  }
 }
});
