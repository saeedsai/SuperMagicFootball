/** Spain national26_0 source-audited age/height without arcade score changes. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const {readFileSync}=require('node:fs'),{join}=require('node:path');
const all=JSON.parse(readFileSync(join(__dirname,'../data/players/national26.json'),'utf8'));
const teams=JSON.parse(readFileSync(join(__dirname,'../data/teams.json'),'utf8'));
const asOf=new Date('2026-10-16T00:00:00Z');
function ageAt(iso){let b=new Date(iso+'T00:00:00Z'),n=asOf.getUTCFullYear()-b.getUTCFullYear();return n-(asOf.getUTCMonth()<b.getUTCMonth()||(asOf.getUTCMonth()===b.getUTCMonth()&&asOf.getUTCDate()<b.getUTCDate())?1:0)}
test('2026-10-16 sourced Spain national player metadata',()=>{
 for(const [id,name,birth,age] of [
  ['national26_0_11','Pedri','2002-11-25',23],
  ['national26_0_8','Gavi','2004-08-05',22],
 ]){
  const p=all.national26_0.find(x=>x.id===id);assert.ok(p);
  assert.equal(p.name,name);assert.equal(p.role,'MF');
  assert.equal(ageAt(birth),age);assert.equal(p.age,age);assert.equal(p.heightCm,174);
  assert.equal(p.rating,97);assert.equal(p.source,'2026 World Cup squad sample');
 }
});
test('all 32 national teams retain 12 players; Spain preserves immutable composition',()=>{
 assert.equal(Object.keys(all).length,32);
 for(const [id,team] of Object.entries(all)){
  assert.equal(team.length,12,id);assert.equal(new Set(team.map(x=>x.id)).size,12,id);
 }
 assert.equal(teams.find(x=>x.id==='national26_0').index,13);
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(role=>[role,all.national26_0.filter(p=>p.role===role).length])),{GK:2,DF:3,MF:4,FW:3});
 assert.deepEqual(all.national26_0.filter(p=>['national26_0_11','national26_0_8'].includes(p.id)).map(p=>p.num),[12,9]);
});
