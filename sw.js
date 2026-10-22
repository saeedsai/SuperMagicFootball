// 0.9.6.0 modular offline shell; cache rotates whenever shipped runtime or data changes.
const CACHE='smf-082538-concept-front-hair-v1-rear-v2-face-v3-arm-v4-far-v5-collar-v6-torso-v7-back-torso-v8-sh01-live-v1-career-slots-v1-sd09-spin-v1-release-0906-v1-cup-slots-v1-cup-backup-v2';
const MODULES=['audio','dribbles','kits','specials','stats','morale','abilities','fitness','playeridentity','data','identity','clubfilters','tactics','ai','expanded','bpw','bpwalltime','continental','tournaments','career','career_slots','cup_slots','input','visualfeel','shotfeel','physicsbalance','shotpaths','engine','bpwpersonality','artpose','characterart','concepthero','conceptmodular','render','release','ui'];
const DATA=['teams.json','mechanics/gameplay.json','graphics/procedural_assets.json','graphics/player_appearances.json','graphics/art_registry.json','editorial/historical_rosters.json','confederations.json','continental_mapping.json',...['arcade','national26','club26','legends','continental','bpw_worldcup','bpw_alltime'].map(g=>'players/'+g+'.json')];
const CORE=['./index.html','./style.css','./icon-180.png','./src/main.js','./src/assets.js',...MODULES.map(m=>'./src/modules/'+m+'.js'),...DATA.map(d=>'./data/'+d),'./assets/concept_hero/hero_atlas.webp','./assets/characters/concept_modular_v1/source/hair_front_front.svg','./assets/characters/concept_modular_v1/source/hair_back_back.svg','./assets/characters/concept_modular_v1/source/face_front_front.svg','./assets/characters/concept_modular_v1/source/arm_near_front.svg','./assets/characters/concept_modular_v1/source/arm_far_front.svg','./assets/characters/concept_modular_v1/source/torso_collar_front.svg','./assets/characters/concept_modular_v1/source/torso_front.svg','./assets/characters/concept_modular_v1/source/torso_back.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('smf-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok&&CORE.some(rel=>new URL(rel,self.registration.scope).href===event.request.url)){
   const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});
  }return response;
 }).catch(()=>caches.match(event.request).then(saved=>saved||Response.error())));
});