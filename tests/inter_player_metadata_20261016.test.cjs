const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const expected=[{"name":"Alessandro Bastoni","age":27,"heightCm":190},{"name":"Federico Dimarco","age":28,"heightCm":175},{"name":"Nicolò Barella","age":29,"heightCm":175},{"name":"Piotr Zieliński","age":32,"heightCm":180},{"name":"Lautaro Martínez","age":29,"heightCm":174}];
test('Inter Milan official age and height metadata batch',async()=>{
 const roster=read('data/players/club26.json').club26_8;
 const {ROSTER_CORRECTIONS}=await import('../src/roster_corrections.js');
 const audit=read('docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json');
 const ledger=read('docs/PLAYER_METADATA_BATCHES_20261016.json');
 const batch=ledger.batches.find(b=>b.id==='CLUB-20261016-INT-METADATA-1');
 assert(batch&&batch.playersChanged===5&&batch.fieldsChanged===10);
 assert.deepEqual(roster,ROSTER_CORRECTIONS.club26_8);
 assert.deepEqual(roster.map(p=>({name:p.name,role:p.role,rating:p.rating})),audit.club26_8.selected);
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(r=>[r,roster.filter(p=>p.role===r).length])),{GK:2,DF:3,MF:4,FW:3});
 for(const e of expected){
  const player=roster.find(p=>p.name===e.name);
  assert(player,e.name);
  const [y,m,d]=player.birthDate.split('-').map(Number);
  assert.equal(player.age,2026-y-(m>10||(m===10&&d>16)?1:0));
  assert.equal(player.age,e.age);
  assert.equal(player.heightCm,e.heightCm);
  assert(player.ratingSource.startsWith('FC27'));
  const c=batch.changes.find(c=>c.playerId===player.id);
  assert(c&&Object.keys(c.fields).length===2&&Object.values(c.fields).every(f=>f.source.startsWith('https://www.inter.it/')));
 }
});
