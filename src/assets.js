// v0.8.25.30: typed validated editable JSON catalog. Loaded before gameplay modules.
export let GAME_ASSETS=null;
const playerGroups=['arcade','national26','club26','legends','continental','bpw_worldcup','bpw_alltime'];
async function read(path){const response=await fetch(new URL('../data/'+path,import.meta.url),{cache:'no-cache'});if(!response.ok)throw Error(path+': HTTP '+response.status);return response.json();}
export async function loadAssets(){
 const [teams,mechanics,graphics,editorial,confederations,...groups]=await Promise.all([
  read('teams.json'),read('mechanics/gameplay.json'),read('graphics/procedural_assets.json'),
  read('editorial/historical_rosters.json'),read('confederations.json'),
  ...playerGroups.map(g=>read('players/'+g+'.json'))]);
 if(!Array.isArray(teams)||teams.length!==223)throw Error('Expected 223 original teams');
 const rosters=Object.assign(Object.create(null),...groups);
 const appearances=await read('graphics/player_appearances.json');
 for(const [teamId,rows] of Object.entries(appearances))for(const player of rosters[teamId]||[]){
  const entry=rows[player.id];if(entry){if(entry.avatar)player.avatar=entry.avatar;if(entry.appearance)player.appearance=entry.appearance;}
 }
 if(new Set(teams.map(t=>t.id)).size!==teams.length)throw Error('Duplicate team IDs');
 for(const t of teams){if(!Array.isArray(rosters[t.id])||rosters[t.id].length!==12)throw Error('Invalid roster: '+t.id)}
 const mapping=await read('continental_mapping.json');
 
 GAME_ASSETS={teams,rosters,players:Object.fromEntries(playerGroups.map((g,i)=>[g,groups[i]])),mechanics,graphics,editorial,confederations,continentalMapping:mapping};
 return GAME_ASSETS;
}
