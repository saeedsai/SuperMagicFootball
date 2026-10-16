// Napoli 2026/27 identity and metadata checkpoint; no match-engine changes.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(base,p),'utf8'));
const cases=[
  {
    "name": "Alex Meret",
    "num": 1,
    "age": 29,
    "heightCm": 191,
    "nation": null
  },
  {
    "name": "Vanja Milinković-Savić",
    "num": 32,
    "age": 29,
    "heightCm": 202,
    "nation": null
  },
  {
    "name": "Amir Rrahmani",
    "num": 13,
    "age": 32,
    "heightCm": 192,
    "nation": null
  },
  {
    "name": "Giovanni Di Lorenzo",
    "num": 22,
    "age": 33,
    "heightCm": 183,
    "nation": null
  },
  {
    "name": "Alessandro Buongiorno",
    "num": 4,
    "age": 27,
    "heightCm": 192,
    "nation": null
  },
  {
    "name": "Scott McTominay",
    "num": 8,
    "age": 29,
    "heightCm": 193,
    "nation": null
  },
  {
    "name": "Kevin De Bruyne",
    "num": 11,
    "age": 35,
    "heightCm": 181,
    "nation": null
  },
  {
    "name": "Stanislav Lobotka",
    "num": 68,
    "age": 31,
    "heightCm": 170,
    "nation": null
  },
  {
    "name": "André-Franck Zambo Anguissa",
    "num": 99,
    "age": 30,
    "heightCm": 184,
    "nation": null
  },
  {
    "name": "David Neres",
    "num": 7,
    "age": 29,
    "heightCm": 177,
    "nation": null
  },
  {
    "name": "Matteo Politano",
    "num": 21,
    "age": 33,
    "heightCm": 171,
    "nation": null
  },
  {
    "name": "Noa Lang",
    "num": 70,
    "age": 27,
    "heightCm": 179,
    "nation": "Netherlands"
  }
];
const stableIds=["club26_25_audit_16","club26_25_0","club26_25_audit_12","club26_25_5","club26_25_4","club26_25_1","club26_25_2","club26_25_6","club26_25_3","club26_25_audit_13","club26_25_audit_14","club26_25_audit_15"];
const ageAt=s=>{const [y,m,d]=s.split('-').map(Number);return 2026-y-(m>10||(m===10&&d>16)?1:0)};
test('Napoli: 2026/27 club, age, shirts, sourced height, nationalities and runtime parity',async()=>{
 const players=read('data/players/club26.json').club26_25;
 const {ROSTER_CORRECTIONS}=await import('../src/roster_corrections.js');
 const selections=read('docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json');
 const ledger=read('docs/PLAYER_METADATA_BATCHES_20261016.json');
 const batch=ledger.batches.find(x=>x.id==='CLUB-20261016-NAP-METADATA-1');
 assert(batch,'required immutable metadata audit present');
 assert.equal(batch.playersChanged,12); assert.equal(batch.fieldsChanged,49);
 assert.equal(players.length,12); assert.deepEqual(players,ROSTER_CORRECTIONS.club26_25);
 assert.deepEqual(players.map(x=>x.id),stableIds,'preserve all in-game player identities');
 assert.deepEqual(players.map(x=>({name:x.name,role:x.role,rating:x.rating})),selections.club26_25.selected,'immutable role/overall selection history');
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(k=>[k,players.filter(x=>x.role===k).length])),{GK:2,DF:3,MF:4,FW:3});
 assert.equal(new Set(players.map(x=>x.num)).size,12,'all Napoli shirts must be unique');
 for(const [slot,p]of players.entries()){
  const expected=cases.find(x=>x.name===p.name);
  assert(expected,p.name+' missing from validated player list');
  assert.equal(p.age,expected.age,p.name+' static age as-of 2026-10-16');
  assert.equal(p.age,ageAt(p.birthDate),p.name+' ISO birthday math');
  assert.equal(p.num,expected.num,p.name+' 2026/27 shirt number');
  assert.equal(p.shirtVerified,true,p.name+' shirt verification');
  assert.equal(p.heightCm,expected.heightCm,p.name+' player height in centimetres');
  if(expected.nation)assert.equal(p.nation,expected.nation,p.name+' nationality');
  assert(p.ratingSource.startsWith('FC27'),p.name+' retain FC27 provenance');
  const record=batch.changes.find(c=>c.playerId===p.id);
  assert(record&&record.rosterSlot===slot+1,p.name+' recorded field-level before/after');
  for(const [field,item] of Object.entries(record.fields)){
   assert.equal(p[field],item.current,p.name+' current '+field);
   assert(item.source.startsWith('https://'),p.name+' '+field+' real source URL');
  }
 }
 assert(batch.knownIssues.some(x=>x.type==='height disagreement'),'height source disagreements must not be omitted');
 assert(batch.knownIssues.some(x=>x.player==='Alessandro Buongiorno'),'competition registration difference explicitly preserved');
});
