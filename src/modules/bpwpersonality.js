// Supermagic Football v0.8.25.30 | BPWPERSONALITY | independently editable module
const BPWPERSONALITY=(()=>{
 const ARCHETYPES=Object.freeze({
  maestro:Object.freeze({label:'Maestro',pace:.91,bounce:.64,lean:.42,gesture:.60,head:.75}),
  showman:Object.freeze({label:'Showman',pace:1.08,bounce:1.28,lean:.90,gesture:1.50,head:1.30}),
  sprinter:Object.freeze({label:'Sprinter',pace:1.25,bounce:.72,lean:1.40,gesture:.72,head:.48}),
  captain:Object.freeze({label:'Captain',pace:.96,bounce:.54,lean:.48,gesture:1.10,head:.80}),
  anchor:Object.freeze({label:'Anchor',pace:.83,bounce:.38,lean:.25,gesture:.56,head:.32}),
  artist:Object.freeze({label:'Artist',pace:1.03,bounce:.90,lean:1.16,gesture:1.22,head:1.08}),
  warrior:Object.freeze({label:'Warrior',pace:1.11,bounce:.95,lean:.83,gesture:1.06,head:.70}),
  sentinel:Object.freeze({label:'Sentinel',pace:.84,bounce:.36,lean:.20,gesture:.94,head:.50}),
  finisher:Object.freeze({label:'Finisher',pace:1.06,bounce:.77,lean:.90,gesture:.90,head:.66})
 });
 const KEYS=Object.freeze(Object.keys(ARCHETYPES));
 // Design-direction assignments, not assertions about historical player behavior or appearance.
 const CURATED=Object.freeze({
  'Lev Yashin':'sentinel','Gianluigi Buffon':'sentinel','Franz Beckenbauer':'captain',
  'Paolo Maldini':'anchor','Sergio Ramos':'warrior','Diego Maradona':'artist',
  'Zinedine Zidane':'maestro','Johan Cruyff':'maestro','Lionel Messi':'artist',
  'Pelé':'showman','Cristiano Ronaldo':'finisher','Ronaldo Nazário':'sprinter',
  'Ronaldinho':'showman','Kylian Mbappé':'sprinter','Luka Modrić':'maestro',
  'Fabien Barthez':'sentinel','Oliver Kahn':'warrior','Iker Casillas':'sentinel',
  'Andrés Iniesta':'maestro','Xavi':'maestro','Neymar':'showman','Thierry Henry':'finisher',
  'Miroslav Klose':'finisher','Manuel Neuer':'sentinel','Lilian Thuram':'anchor'
 });
 const normalize=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const curated=new Map(Object.entries(CURATED).map(([n,a])=>[normalize(n),a]));
 const cache=new Map();
 function hash(s){let h=2166136261;for(const c of s){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;}return h>>>0;}
 function profileFor(src){
  const p=src?.src||src;
  if(!p||typeof p.historicalPersonKey!=='string'||!p.historicalPersonKey.startsWith('worldcup:'))return null;
  const identity=p.historicalPersonKey;
  if(cache.has(identity))return cache.get(identity);
  const n=hash(identity),kind=curated.get(normalize(p.name))||((p.role==='GK')?'sentinel':KEYS[n%KEYS.length]);
  const profile=Object.freeze({identity,name:p.name,archetype:kind,label:ARCHETYPES[kind].label,
   phase:(n%720)/720*Math.PI*2,
   rhythm:.89+((n>>>8)%27)/100,shoulder:(n>>>13)%2?1:-1,
   // Personal micro-timing means two players in the same archetype are still individually animated.
   signature:(n>>>16)%997,role:p.role||'MF'});
  cache.set(identity,profile);return profile;
 }
 function sampleMotion(profile,{time=0,anim=0,action='idle',moving=false}={}){
  if(!profile)return Object.freeze({offsetX:0,offsetY:0,lean:0,headTilt:0,armSwing:0,runRate:1});
  const a=ARCHETYPES[profile.archetype],t=Number.isFinite(time)?time:0,
   phase=profile.phase,s=Math.sin(t*(2.15*profile.rhythm)+phase),
   active=action==='celebrate',busy=['super','superBicycle','superHead','bicycle','keeperDive','keeperDiveCatch','comboSuper','flyingKick','defensiveBicycle'].includes(action),
   intensity=busy?.22:active?1.40:moving?1.0:.56;
  return {
   offsetX:Math.sin(t*1.8*profile.rhythm+phase)*a.lean*2.2*intensity,
   offsetY:Math.sin(t*3.25*profile.rhythm+phase)*a.bounce*(moving?2.8:1.45)*intensity,
   lean:((moving?.032:.012)*a.lean*profile.shoulder+s*.019)*intensity,
   headTilt:(Math.sin(t*1.6*profile.rhythm+phase)*.045*a.head+ (active?.055*profile.shoulder:0))*(busy?.18:1),
   armSwing:Math.sin(t*4.15*profile.rhythm+phase)*a.gesture*(active?8:moving?3.5:1.6)*(busy?.24:1),
   runRate:a.pace*profile.rhythm
  };
 }
 return Object.freeze({ARCHETYPES,CURATED,profileFor,sampleMotion});
})();

// v0.8.25.23: frame-rate-safe visual animation; these helpers never touch simulation speed or fatigue.

export {BPWPERSONALITY};
