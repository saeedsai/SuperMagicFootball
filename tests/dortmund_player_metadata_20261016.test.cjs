// Borussia Dortmund 2026/27 sourced player metadata contract.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const json=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const expected=[
  {
    "name": "Gregor Kobel",
    "num": 1,
    "heightCm": 195,
    "nation": null
  },
  {
    "name": "Alexander Meyer",
    "num": 33,
    "heightCm": 195,
    "nation": null
  },
  {
    "name": "Nico Schlotterbeck",
    "num": 4,
    "heightCm": 191,
    "nation": null
  },
  {
    "name": "Waldemar Anton",
    "num": 3,
    "heightCm": 189,
    "nation": null
  },
  {
    "name": "Julian Ryerson",
    "num": 26,
    "heightCm": 183,
    "nation": null
  },
  {
    "name": "Felix Nmecha",
    "num": 8,
    "heightCm": 190,
    "nation": null
  },
  {
    "name": "Joey Veerman",
    "num": 25,
    "heightCm": 185,
    "nation": "Netherlands"
  },
  {
    "name": "Marcel Sabitzer",
    "num": 20,
    "heightCm": 178,
    "nation": null
  },
  {
    "name": "Emre Can",
    "num": 23,
    "heightCm": 186,
    "nation": null
  },
  {
    "name": "Serhou Guirassy",
    "num": 9,
    "heightCm": 187,
    "nation": null
  },
  {
    "name": "Maximilian Beier",
    "num": 14,
    "heightCm": 183,
    "nation": null
  },
  {
    "name": "Daniel Svensson",
    "num": 24,
    "heightCm": 183,
    "nation": null
  }
];
const ids=["club26_11_0","club26_11_gk_12","club26_11_2","club26_11_1","club26_11_4","club26_11_3","club26_11_8","club26_11_5","club26_11_11","club26_11_10","club26_11_7","club26_11_6"];
const age=iso=>{const [y,m,d]=iso.split('-').map(Number);return 2026-y-(m>10||(m===10&&d>16)?1:0)};
test('Dortmund current 2026/27 dates, shirts, heights, source and runtime parity',async()=>{
 const arr=json('data/players/club26.json').club26_11;
 const {ROSTER_CORRECTIONS}=await import('../src/roster_corrections.js');
 const audit=json('docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json');
 const history=json('docs/PLAYER_METADATA_BATCHES_20261016.json');
 const batch=history.batches.find(x=>x.id==='CLUB-20261016-BVB-METADATA-1');
 assert(batch&&batch.playersChanged===12&&batch.fieldsChanged===47);
 assert.deepEqual(arr,ROSTER_CORRECTIONS.club26_11);
 assert.deepEqual(arr.map(x=>x.id),ids,'player IDs retained');
 assert.deepEqual(arr.map(x=>({name:x.name,role:x.role,rating:x.rating})),audit.club26_11.selected,'original audit/rating contract');
 assert.equal(new Set(arr.map(x=>x.num)).size,12,'official shirts unique');
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(r=>[r,arr.filter(p=>p.role===r).length])),{GK:2,DF:3,MF:4,FW:3});
 for(const [i,p]of arr.entries()){
  const exp=expected.find(x=>x.name===p.name);
  assert(exp,p.name+' absent from confirmed Dortmund squad');
  assert.equal(p.age,age(p.birthDate),p.name+' age calculated as of 2026-10-16');
  assert.equal(p.heightCm,exp.heightCm,p.name+' Bundesliga height');
  assert.equal(p.num,exp.num,p.name+' confirmed jersey number');
  assert.equal(p.shirtVerified,true,p.name+' shirt verification flag');
  if(exp.nation!==null)assert.equal(p.nation,exp.nation,p.name+' nationality');
  const c=batch.changes.find(x=>x.playerId===p.id);
  assert(c&&c.rosterSlot===i+1,p.name+' immutable before/after trail');
  for(const [key,v]of Object.entries(c.fields)){
    assert.equal(p[key],v.current,p.name+' '+key+' actual value');
    assert(/^https:\/\//.test(v.source),p.name+' '+key+' URL evidence');
  }
  assert(p.ratingSource.startsWith('FC27'),'FC27 source label preserved');
 }
 const gap=batch.remainingIssues.find(x=>x.player==='Daniel Svensson');
 assert(gap&&gap.gameRole==='FW'&&gap.officialPosition==='DF','document the real position mismatch');
});
