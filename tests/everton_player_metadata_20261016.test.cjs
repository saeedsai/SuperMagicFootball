// Everton dated player metadata batch, preserving the immutable historical roster selection.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const fixture=[
  {
    "name": "Jordan Pickford",
    "age": 32,
    "heightCm": 185
  },
  {
    "name": "Mark Travers",
    "age": 27,
    "heightCm": 191
  },
  {
    "name": "James Garner",
    "age": 25,
    "heightCm": 182
  },
  {
    "name": "James Tarkowski",
    "age": 33,
    "heightCm": 185
  },
  {
    "name": "Jarrad Branthwaite",
    "age": 24,
    "heightCm": 195
  },
  {
    "name": "Kiernan Dewsbury-Hall",
    "age": 28,
    "heightCm": 178
  },
  {
    "name": "Christian Nørgaard",
    "age": 32,
    "heightCm": 185
  },
  {
    "name": "Hayden Hackney",
    "age": 24,
    "heightCm": null
  },
  {
    "name": "Vitaliy Mykolenko",
    "age": 27,
    "heightCm": 180
  },
  {
    "name": "Iliman Ndiaye",
    "age": 26,
    "heightCm": 180
  },
  {
    "name": "Brennan Johnson",
    "age": 25,
    "heightCm": null
  },
  {
    "name": "Beto",
    "age": 28,
    "heightCm": 194
  }
];
const stableIds=["club26_27_0","club26_27_11","club26_27_6","club26_27_4","club26_27_5","club26_27_8","club26_27_7","club26_27_9","club26_27_1","club26_27_3","club26_27_10","club26_27_2"];
const originalShirts=[1,12,7,5,6,9,2,3,4,8,10,11];
const atDate=iso=>{const [y,m,d]=iso.split('-').map(Number);return 2026-y-(m>10||(m===10&&d>16)?1:0)};
test('Everton 2026/27: verified DOB ages/heights while preserving all gameplay and current unresolved club-selection issues',async()=>{
 const source=read('data/players/club26.json'),squad=source.club26_27;
 const {ROSTER_CORRECTIONS}=await import('../src/roster_corrections.js');
 const audit=read('docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json');
 const ledger=read('docs/PLAYER_METADATA_BATCHES_20261016.json');
 const batch=ledger.batches.find(b=>b.id==='CLUB-20261016-EVE-METADATA-1');
 assert(batch&&batch.playersChanged===12&&batch.fieldsChanged===22,'one bounded audited Everton batch');
 assert.deepEqual(squad,ROSTER_CORRECTIONS.club26_27,'playable roster mirror');
 assert.deepEqual(squad.map(x=>x.id),stableIds,'stable player IDs');
 assert.deepEqual(squad.map(x=>x.num),originalShirts,'shirts intentionally untouched until roster selection is fixed');
 assert.deepEqual(squad.map(x=>({name:x.name,role:x.role,rating:x.rating})),audit.club26_27.selected,'role/rating immutable audit');
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(r=>[r,squad.filter(x=>x.role===r).length])),{GK:2,DF:3,MF:4,FW:3});
 for(const [i,p]of squad.entries()){
   const expected=fixture.find(x=>x.name===p.name);
   assert(expected,'expected fixed player '+p.name);
   assert.equal(p.age,expected.age,p.name+' age on 2026-10-16');
   assert.equal(p.age,atDate(p.birthDate),p.name+' DOB age consistency');
   if(expected.heightCm!==null)assert.equal(p.heightCm,expected.heightCm,p.name+' height in cm');
   else assert.equal(p.heightCm,undefined,p.name+' height not invented');
   const change=batch.changes.find(c=>c.playerId===p.id);
   assert(change&&change.rosterSlot===i+1,p.name+' permanent change trail');
   for(const [k,delta] of Object.entries(change.fields)){
     assert.equal(p[k],delta.current,p.name+' '+k+' data agrees with audit');
     assert(delta.source.startsWith('https://'),p.name+' '+k+' evidence URL');
   }
 }
 for(const player of ['Beto','Iliman Ndiaye','James Garner','Vitaliy Mykolenko']){
   assert(batch.knownIssues.some(x=>x.player===player),'known transfer/role gap '+player);
 }
 assert(batch.knownIssues.some(x=>x.type==='OVR and physical gameplay statistics'),'no guessed rating certification');
});
