// PSG FC 27 — primary-source player facts and strict scope checks.
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const names=["Matvey Safonov","Lucas Chevalier","Nuno Mendes","Willian Pacho","Achraf Hakimi","Vitinha","João Neves","Fabián Ruiz","Warren Zaïre-Emery","Ousmane Dembélé","Khvicha Kvaratskhelia","Désiré Doué"],shirts=[39,30,25,51,2,17,87,8,33,10,7,14],heights=[192,192,184,186,180,172,174,189,178,178,183,177],birth=["1999-02-25","2001-11-06","2002-06-19","2001-10-16","1998-11-04","2000-02-13","2004-09-27","1996-04-03","2006-03-08","1997-05-15","2001-02-12","2005-06-03"],nations=["Russia","France","Portugal","Ecuador","Morocco","Portugal","Portugal","Spain","France","France","Georgia","France"],face=[[83,82,76,80,86,50,83],[80,83,75,73,84,50,78],[89,94,77,80,86,84,80],[89,80,34,63,65,90,86],[88,92,79,81,82,82,81],[90,72,81,88,91,75,70],[88,72,75,84,87,86,82],[86,60,77,83,82,77,73],[83,79,71,78,81,79,85],[90,90,89,83,93,55,70],[89,86,85,84,90,59,81],[86,83,81,79,90,55,80]];
const ea="https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/paris-sg/73",fields=['pace','shooting','passing','dribbling','defending','physicality'];
const age=d=>{const[y,m,day]=d.split('-').map(Number);return 2026-y-(m>10||(m===10&&day>16)?1:0)};
test('PSG FC27 12 official OVR and 72 face stats plus stable slots and runtime mirror',async()=>{
 const team=load('data/players/club26.json').club26_3, audit=load('docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json').club26_3;
 const {ROSTER_CORRECTIONS}=await import('../src/roster_corrections.js');
 assert.deepEqual(team,ROSTER_CORRECTIONS.club26_3);assert.equal(team.length,12);
 assert.deepEqual(team.map(p=>({name:p.name,role:p.role,rating:p.rating})),audit.selected);
 assert.deepEqual(team.map(p=>p.name),names);
 assert.deepEqual(Object.fromEntries(['GK','DF','MF','FW'].map(k=>[k,team.filter(p=>p.role===k).length])),{GK:2,DF:3,MF:4,FW:3});
 assert.equal(new Set(team.map(p=>p.id)).size,12);
 for(let i=0;i<team.length;i++){const p=team[i];assert.equal(p.rating,face[i][0],p.name+' OVR');
  assert.deepEqual(fields.map(k=>p.fc27FaceStats[k]),face[i].slice(1),p.name+' PAC SHO PAS DRI DEF PHY');
  assert.equal(p.source,ea);assert.match(p.ratingSource,/FC27 official EA/);assert.equal(p.fc27OfficialCheckedAt,'2026-10-16');
  assert.equal(p.statsVerified,false,'arcade stats are not FC27 card attributes');
 }
 assert.equal(team[8].id,'club26_3_audit_15');
 assert.equal(team[8].name,'Warren Zaïre-Emery');assert.equal(team[8].fc27Id,'270673');
 assert.equal(team[8].fc27Position,'CM');assert.equal(team.some(p=>p.name==='Bradley Barcola'),false);
});
test('PSG 2026-27 official shirts, DOB ages, nationalities and heights',()=>{
 const team=load('data/players/club26.json').club26_3;
 assert.deepEqual(team.map(p=>p.num),shirts);
 assert.equal(new Set(team.map(p=>p.num)).size,12);
 for(let i=0;i<12;i++){const p=team[i];assert.equal(p.shirtVerified,true);
 assert.equal(p.age,age(birth[i]),p.name+' age');assert.equal(p.birthDate,birth[i],p.name+' DOB');
 assert.equal(p.nation,nations[i],p.name+' nationality');assert.equal(p.heightCm,heights[i],p.name+' 2026/27 bio height');
 }
 assert.equal(team.find(p=>p.name==='Willian Pacho').age,25);
});
test('PSG named one-player transfer and field-level metadata ledger remain consistent',()=>{
 const t=load('data/players/club26.json').club26_3;
 const l=load('docs/CLUB_ROSTER_BATCH_LEDGER_20261016.json');
 const changes=l.playerChanges.filter(x=>x.batchId==='CLUB-20261016-PSG-TRANSFER-1');
 assert.equal(changes.length,1);assert.equal(changes[0].slot,9);
 assert.deepEqual(changes[0].previous,{name:'Bradley Barcola',overall:85});
 assert.deepEqual(changes[0].current,{name:'Warren Zaïre-Emery',overall:83});
 assert.equal(l.summary.changedSlots,l.playerChanges.length);
 assert.equal(l.currentRosterSnapshot.club26_3.players[8].name,'Warren Zaïre-Emery');
 const m=load('docs/PLAYER_METADATA_BATCHES_20261016.json').batches.find(b=>b.id==='CLUB-20261016-PSG-FC27-VERIFICATION-1');
 assert(m);assert.equal(m.clubId,'club26_3');assert.equal(m.playersChanged,12);assert.equal(m.changes.length,12);
 assert.equal(m.officialFc27Audit.overallRatingsMatched,12);assert.equal(m.officialFc27Audit.headlineAttributesMatched,72);
 assert.equal(m.fieldsChanged,m.changes.reduce((sum,c)=>sum+Object.keys(c.fields).length,0));
 for(const c of m.changes){const index=t.findIndex(p=>p.id===c.playerId);assert(index>=0);assert.equal(c.rosterSlot,index+1);
 for(const [k,field] of Object.entries(c.fields)){assert.deepEqual(t[index][k],field.current);assert.match(field.source,/^https:\/\//);}
 }
});
