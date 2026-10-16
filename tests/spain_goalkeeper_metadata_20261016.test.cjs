/** Date-scoped, source-backed Spain national goalkeeper metadata; no gameplay stat changes. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const rosters=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/players/national26.json'),'utf8'));
const teams=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/teams.json'),'utf8'));
const AS_OF='2026-10-16';
function ageAt(iso,asOf=AS_OF){
 const [y,m,d]=iso.split('-').map(Number),[Y,M,D]=asOf.split('-').map(Number);
 return Y-y-Number(M<m||(M===m&&D<d));
}
test('Spain goalkeeper birth dates yield corrected ages as of 2026-10-16',()=>{
 for(const e of [
  {id:'national26_0_0',name:'David Raya',dob:'1995-09-15',age:31,height:183,num:1,rating:97},
  {id:'national26_0_gk_12',name:'Unai Simón',dob:'1997-06-11',age:29,height:190,num:13,rating:95}
 ]){
  const p=rosters.national26_0.find(x=>x.id===e.id);
  assert.ok(p,'stable goalkeeper identity '+e.id);
  assert.equal(p.name,e.name);
  assert.equal(p.role,'GK');
  assert.equal(ageAt(e.dob),e.age);
  assert.equal(p.age,e.age);
  assert.equal(p.heightCm,e.height);
  assert.equal(p.num,e.num,'shirt identity preserved');
  assert.equal(p.rating,e.rating,'editorial power score not recalculated');
  assert.equal(p.fictional,false);
 }
});
test('Spain has two goalkeepers and all 32 national teams retain 12 unique identities',()=>{
 assert.equal(teams.find(x=>x.id==='national26_0').index,13);
 assert.equal(Object.keys(rosters).length,32);
 for(const [team,players] of Object.entries(rosters)){
  assert.equal(players.length,12,team);
  assert.equal(new Set(players.map(x=>x.id)).size,12,team);
 }
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(role=>[
  role,rosters.national26_0.filter(p=>p.role===role).length
 ])),{GK:2,DF:3,MF:4,FW:3});
 assert.deepEqual(rosters.national26_0.filter(p=>['Pedri','Gavi'].includes(p.name)).map(p=>[p.name,p.age,p.heightCm]),
  [['Pedri',23,174],['Gavi',22,174]],'previous independent Spain metadata batch preserved');
});
