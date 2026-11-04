'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {fileURLToPath}=require('node:url');

test('BPW tier exemption matches exactly six historical team IDs in both APIs',async()=>{
 globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(fileURLToPath(url),'utf8'))});
 const assets=await import('../src/assets.js');
 await assets.loadAssets();
 const [source,module]=await Promise.all([import('../src/bpw_world_cups.js'),import('../src/modules/bpw.js')]);
 const expectedYears=[1998,2002,2006,2010,2014,2018];
 const expected=new Set(expectedYears.map(year=>`bpw_wc_${year}`));
 assert.deepEqual(source.BPW_YEARS,expectedYears);
 assert.deepEqual(module.BPW.BPW_YEARS,expectedYears);
 const originalTeams=JSON.stringify(assets.GAME_ASSETS.teams);
 const originalRosters=JSON.stringify(assets.GAME_ASSETS.rosters);
 const originalEditorial=JSON.stringify(assets.GAME_ASSETS.editorial);
 const exempt=assets.GAME_ASSETS.teams.filter(team=>source.isBPWTierExemptTeam(team.id));
 assert.equal(exempt.length,6);
 assert.deepEqual(new Set(exempt.map(team=>team.id)),expected);
 for(const team of assets.GAME_ASSETS.teams){
  const shouldExempt=expected.has(team.id);
  assert.equal(source.isBPWTierExemptTeam(team.id),shouldExempt,`${team.id} source helper`);
  assert.equal(module.BPW.isBPWTierExemptTeam(team.id),shouldExempt,`${team.id} module helper`);
  assert.equal(source.isBPWTierExemptTeam(team.id),module.BPW.isBPWTierExemptTeam(team.id),`${team.id} parity`);
 }
 assert.equal(source.isBPWTierExemptTeam('bpw_alltime'),false,'All-Time squad is not one of the six year teams');
 assert.equal(module.BPW.isBPWTierExemptTeam('bpw_alltime'),false);
 assert.equal(source.isBPWTierExemptTeam('bpw_wc_2022'),false);
 assert.equal(source.isBPWTierExemptTeam({id:'bpw_wc_1998'}),false,'helper accepts exact team IDs only');
 assert.equal(JSON.stringify(assets.GAME_ASSETS.teams),originalTeams);
 assert.equal(JSON.stringify(assets.GAME_ASSETS.rosters),originalRosters);
 assert.equal(JSON.stringify(assets.GAME_ASSETS.editorial),originalEditorial);
});
