/** 2026-10-16 Argentina national metadata source correction; retain playable IDs and ratings. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const roster=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/players/national26.json'),'utf8'));
const teams=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/teams.json'),'utf8'));
function ageAt(iso,asOf='2026-10-16'){
 const [y,m,d]=iso.split('-').map(Number),[Y,M,D]=asOf.split('-').map(Number);
 return Y-y-Number(M<m||(M===m&&D<d));
}
const cases=[
 {id:'national26_1_gk_13',name:'Emiliano Martínez',role:'GK',dob:'1992-09-02',age:34,height:195,num:14,rating:95},
 {id:'national26_1_9',name:'Lionel Messi',role:'FW',dob:'1987-06-24',age:39,height:170,num:10,rating:93}
];
test('Argentina verified player DOBs and heights are correct on 2026-10-16',()=>{
 const players=roster.national26_1;
 assert.ok(players);
 for(const e of cases){
  const p=players.find(x=>x.id===e.id);
  assert.ok(p,'player ID stable: '+e.id);
  assert.equal(p.name,e.name);
  assert.equal(p.role,e.role);
  assert.equal(ageAt(e.dob),e.age);
  assert.equal(p.age,e.age);
  assert.equal(p.heightCm,e.height);
  assert.equal(p.num,e.num,'historic shirt allocation unchanged');
  assert.equal(p.rating,e.rating,'game rating must not be inferred from birthday');
  assert.equal(p.fictional,false);
 }
});
test('age calculation respects birthdays instead of integer year subtraction',()=>{
 assert.equal(ageAt('1987-06-24','2026-06-23'),38);
 assert.equal(ageAt('1987-06-24','2026-06-24'),39);
 assert.equal(ageAt('1992-09-02','2026-09-01'),33);
 assert.equal(ageAt('1992-09-02','2026-09-02'),34);
});
test('Argentina roster composition and all 32 national squads remain stable',()=>{
 const argentina=teams.find(x=>x.id==='national26_1');
 assert.ok(argentina,'Argentina team remains selectable');
 assert.equal(Object.keys(roster).length,32);
 for(const [id,players] of Object.entries(roster)){
  assert.equal(players.length,12,id+' count');
  assert.equal(new Set(players.map(x=>x.id)).size,12,id+' unique IDs');
 }
 assert.equal(roster.national26_1.length,12);
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(role=>
  [role,roster.national26_1.filter(p=>p.role===role).length])),{GK:2,DF:3,MF:4,FW:3});
 assert.equal(roster.national26_1.find(x=>x.id==='national26_1_0').name,'Juan Musso');
});
