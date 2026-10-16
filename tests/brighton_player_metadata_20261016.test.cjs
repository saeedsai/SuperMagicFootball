// 2026-10-16 Brighton club player metadata batch; no gameplay/OVR edits.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(name)=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const refDate='2026-10-16';
const age=(dob)=>{const [y,m,d]=dob.split('-').map(Number);return 2026-y-(m>10||(m===10&&d>16)?1:0)};
const entries=[
  {
    "name": "Bart Verbruggen",
    "num": 1,
    "nation": "Netherlands",
    "heightCm": 193
  },
  {
    "name": "Jason Steele",
    "num": 23,
    "heightCm": 190
  },
  {
    "name": "Luka Vušković",
    "num": 44,
    "heightCm": 193
  },
  {
    "name": "Ferdi Kadıoğlu",
    "num": 24,
    "heightCm": 173
  },
  {
    "name": "Mats Wieffer",
    "num": 27,
    "nation": "Netherlands",
    "heightCm": null
  },
  {
    "name": "Carlos Baleba",
    "num": 17,
    "heightCm": null
  },
  {
    "name": "Pascal Groß",
    "num": 13,
    "heightCm": 181
  },
  {
    "name": "Yasin Ayari",
    "num": 26,
    "heightCm": 172
  },
  {
    "name": "Diego Gómez",
    "num": 25,
    "heightCm": 183
  },
  {
    "name": "Kaoru Mitoma",
    "num": 7,
    "heightCm": 178
  },
  {
    "name": "Yankuba Minteh",
    "num": 11,
    "heightCm": null
  },
  {
    "name": "Georginio Rutter",
    "num": 10,
    "heightCm": 182
  }
];
const stableIds=["club26_12_0","club26_12_11","club26_12_1","club26_12_5","club26_12_2","club26_12_8","club26_12_7","club26_12_3","club26_12_6","club26_12_10","club26_12_9","club26_12_4"];
test('Brighton 2026/27 metadata, parity, age, shirts and immutable audit',async()=>{
 const source=read('data/players/club26.json');
 const {ROSTER_CORRECTIONS}=await import('../src/roster_corrections.js');
 const audit=read('docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json');
 const changes=read('docs/PLAYER_METADATA_BATCHES_20261016.json');
 const batch=changes.batches.find(b=>b.id==='CLUB-20261016-BHA-METADATA-1');
 const arr=source.club26_12;
 assert(batch&&batch.playersChanged===12&&batch.fieldsChanged===44);
 assert.deepEqual(arr,ROSTER_CORRECTIONS.club26_12);
 assert.equal(arr.length,12);
 assert.deepEqual(arr.map(x=>x.id),stableIds,'stable game identity slots');
 assert.deepEqual(arr.map(x=>({name:x.name,role:x.role,rating:x.rating})),audit.club26_12.selected,'never rewrite position/OVR audit');
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(role=>[role,arr.filter(x=>x.role===role).length])),{GK:2,DF:3,MF:4,FW:3});
 assert.equal(new Set(arr.map(p=>p.num)).size,12,'unique jersey numbers');
 for(const p of arr){
  const e=entries.find(x=>x.name===p.name);
  assert(e,p.name+' not in reviewed snapshot');
  assert.equal(p.num,e.num,p.name+' official 2026-27 shirt number');
  assert.equal(p.age,age(p.birthDate),p.name+' age at '+refDate);
  if(e.heightCm!==null)assert.equal(p.heightCm,e.heightCm,p.name+' height');
  if(e.nation)assert.equal(p.nation,e.nation,p.name+' nationality');
  if(p.name!=='Carlos Baleba')assert.equal(p.shirtVerified,true,p.name+' current official shirt');
  const change=batch.changes.find(c=>c.playerId===p.id);
  assert(change&&change.rosterSlot===arr.indexOf(p)+1,p.name+' permanent player change trail');
  for(const [field,delta] of Object.entries(change.fields)){
   assert.equal(p[field],delta.current,p.name+' change not present');
   assert(delta.source.startsWith('https://'),p.name+' evidence link missing');
  }
 }
 const conflict=batch.knownRegistrationConflicts.find(x=>x.playerName==='Carlos Baleba');
 assert(conflict&&conflict.latestLeagueListingClub==='Manchester United','cannot silently certify stale club membership');
 assert(conflict.source.includes('premierleague.com'),'dated conflict source');
});
