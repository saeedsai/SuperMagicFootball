// Narrow, permanent acceptance test for 2026-10-16 Aston Villa identity corrections.
const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const expected=[
 ['club26_6_0','Emiliano Martínez',34,195,'Argentina'],
 ['club26_6_11','Marco Bizot',35,193,'Netherlands'],
 ['club26_6_2','Ian Maatsen',24,178,'Netherlands'],
 ['club26_6_fill_MF_1','Boubacar Kamara',26,184,'France'],
 ['club26_6_5','Amadou Onana',25,195,'Belgium']
];
const ageAt=(iso)=>{const [y,m,d]=iso.split('-').map(Number);return 2026-y-(m>10||(m===10&&d>16)?1:0)};
test('Aston Villa verified metadata and runtime exactly match',async()=>{
 const {ROSTER_CORRECTIONS}=await import('../src/roster_corrections.js');
 const source=file('data/players/club26.json');
 const audit=file('docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json');
 const ledger=file('docs/PLAYER_METADATA_BATCHES_20261016.json');
 const squad=source.club26_6;
 assert.deepEqual(squad,ROSTER_CORRECTIONS.club26_6);
 assert.equal(squad.length,12);
 assert.deepEqual(squad.map(p=>({name:p.name,role:p.role,rating:p.rating})),audit.club26_6.selected);
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(r=>[r,squad.filter(p=>p.role===r).length])),{GK:2,DF:3,MF:4,FW:3});
 assert.equal(ledger.batches[0].playersChanged,5);
 assert.equal(ledger.batches[0].fieldsChanged,11);
 for(const [id,name,age,heightCm,nation] of expected){
  const p=squad.find(x=>x.id===id);
  assert(p&&p.name===name,name+' stable identity');
  assert.equal(p.heightCm,heightCm,name+' verified height in centimetres');
  assert.equal(p.nation,nation,name+' nationality');
  if(age!=null)assert.equal(p.age,age,name+' static age');
  assert.equal(ageAt(p.birthDate),age,name+' DOB vs reference age 2026-10-16');
  assert(p.ratingSource.startsWith('FC27'),name+' rating provenance retained');
  const c=ledger.batches[0].changes.find(x=>x.playerId===id);
  assert(c&&Object.values(c.fields).every(x=>x.source.startsWith('https://')),name+' attributed changes');
 }
});
