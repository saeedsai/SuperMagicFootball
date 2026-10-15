// v0.8.25.31 modular offline shell; versioned when any data or runtime module changes.
const CACHE='smf-082531-modular-v1';
const MODULES=['audio','dribbles','kits','specials','stats','morale','abilities','fitness','playeridentity','data','identity','clubfilters','tactics','ai','expanded','bpw','bpwalltime','continental','tournaments','career','input','visualfeel','shotfeel','engine','bpwpersonality','artpose','render','ui'];
const DATA=['teams.json','mechanics/gameplay.json','graphics/procedural_assets.json','graphics/player_appearances.json','graphics/art_registry.json','editorial/historical_rosters.json','confederations.json','continental_mapping.json',...['arcade','national26','club26','legends','continental','bpw_worldcup','bpw_alltime'].map(g=>'players/'+g+'.json')];
const CORE=['./index.html','./style.css','./icon-180.png','./src/main.js','./src/assets.js',...MODULES.map(m=>'./src/modules/'+m+'.js'),...DATA.map(d=>'./data/'+d)];
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
