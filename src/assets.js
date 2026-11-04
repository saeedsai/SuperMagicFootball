// v0.8.25.30: typed validated editable JSON catalog. Loaded before gameplay modules.
export let GAME_ASSETS=null;
const playerGroups=['arcade','national26','club26','legends','continental','bpw_worldcup','bpw_alltime'];
let nodeAssetPromise=null;
async function read(path){const response=await fetch(new URL('../data/'+path,import.meta.url),{cache:'no-cache'});if(!response.ok)throw Error(path+': HTTP '+response.status);return response.json();}
async function assembleAssets(readAsset,readPlayerGroup){
 const [teams,mechanics,graphics,editorial,confederations,...groups]=await Promise.all([
  readAsset('teams.json'),readAsset('mechanics/gameplay.json'),readAsset('graphics/procedural_assets.json'),
  readAsset('editorial/historical_rosters.json'),readAsset('confederations.json'),
  ...playerGroups.map(readPlayerGroup)]);
 if(!Array.isArray(teams)||teams.length!==223)throw Error('Expected 223 original teams');
 const rosters=Object.assign(Object.create(null),...groups);
 const appearances=await readAsset('graphics/player_appearances.json');
 for(const [teamId,rows] of Object.entries(appearances))for(const player of rosters[teamId]||[]){
  const entry=rows[player.id];if(entry){if(entry.avatar)player.avatar=entry.avatar;if(entry.appearance)player.appearance=entry.appearance;}
 }
 if(new Set(teams.map(t=>t.id)).size!==teams.length)throw Error('Duplicate team IDs');
 for(const t of teams){if(!Array.isArray(rosters[t.id])||rosters[t.id].length!==12)throw Error('Invalid roster: '+t.id)}
 const mapping=await readAsset('continental_mapping.json');
 
 GAME_ASSETS={teams,rosters,players:Object.fromEntries(playerGroups.map((g,i)=>[g,groups[i]])),mechanics,graphics,editorial,confederations,continentalMapping:mapping};
 return GAME_ASSETS;
}
export async function loadAssets(){return assembleAssets(read,g=>read('players/'+g+'.json'));}
// Node-only loading for authoritative simulation prototypes and validation.
// Node built-ins are dynamically imported here so browser startup remains fetch-only.
export async function loadAssetsFromNode(){
 if(GAME_ASSETS)return GAME_ASSETS;
 if(!nodeAssetPromise)nodeAssetPromise=(async()=>{
  const {readFile}=await import('node:fs/promises');
  const root=new URL('../data/',import.meta.url);
  const readLocal=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
  return assembleAssets(readLocal,g=>readLocal('players/'+g+'.json'));
 })();
 try{return await nodeAssetPromise}catch(error){nodeAssetPromise=null;throw error}
}
