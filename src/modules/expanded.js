// Supermagic Football v0.8.25.30 | EXPANDED | independently editable module
import {GAME_ASSETS} from "../assets.js";
const EXPANDED=(()=>{// October 2026 team selection. Modern rosters are playable editorial selections, not exhaustive licenses.
// Nation roster names: selected from openfootball World Cup 2026 squads when available.
// Italy, Denmark and Nigeria did not have a 2026 World Cup squad in the reference dataset; editorial rosters.
// Club names: 2026 Opta-based top 30 + Milan and Flamengo. Core named players drawn from 2026 World Cup squad club affiliations.
const NATIONAL_2026=[] /* historical source names now live in data/teams.json + data/players/ */;
// Named club-player cores cross-checked against 2026 World Cup squad club affiliations.
// Where this source lacks 12 players, academy stand-ins are intentionally flagged.
const CLUBS_2026=[] /* historical source names now live in data/teams.json + data/players/ */;
const LEGEND_SQUADS=[] /* historical source names now live in data/teams.json + data/players/ */;

const NATURAL_SKIN_TONES=GAME_ASSETS.graphics.skinTones;
const NATURAL_HAIR_COLORS=GAME_ASSETS.graphics.hairColors;
const STUDIO_ASSET_LABELS=GAME_ASSETS.graphics.studioAssetLabels;
function avatarFor(player){
 const seed=String(player.fictional ? (player.id||player.name) : (player.name||player.id||'new')); let h=2166136261;for(let i=0;i<seed.length;i++)h=Math.imul(h^seed.charCodeAt(i),16777619);h>>>=0;
 const palette=NATURAL_SKIN_TONES.map(v=>v[0]);
 const skin=player.appearance?.skin??palette[(h>>>4)%palette.length];
 const hairs=NATURAL_HAIR_COLORS.map(v=>v[0]);
 const eyeTints=['#3e2a22','#5b3a24','#4f6d8c','#588a69','#7a6e9c','#8b6a34'];
 // Curated silhouettes for familiar stars. These are illustrated interpretations, not photo likenesses.
 const signature={
 'Lionel Messi':{hair:'#503a2b',style:1,beard:3,face:1,skin:'#dca27f',eyes:4,brows:9,eyeColor:4,nose:1,lips:4,body:1,stature:2,exaggeration:1},
 'Cristiano Ronaldo':{hair:'#1b2024',style:2,beard:0,face:3,skin:'#dba276',eyes:6,brows:10,eyeColor:0,nose:2,lips:2,body:2,stature:3,exaggeration:0},
 'Neymar':{hair:'#dab96b',style:5,beard:2,skin:'#b7835f',eyes:13,brows:14,eyeColor:0,nose:3,lips:5,body:1,stature:2,exaggeration:2},
 'Mohamed Salah':{hair:'#202125',style:11,beard:3,skin:'#b57b56',eyes:12,brows:16,eyeColor:0,nose:2,lips:4,body:1,stature:2,exaggeration:1},
 'Erling Haaland':{hair:'#e7c36f',style:10,beard:0,skin:'#f1c6a1',eyes:15,brows:3,eyeColor:5,nose:4,lips:1,body:2,stature:4,exaggeration:2},
 'Kylian Mbappé':{hair:'#1f2527',style:2,beard:0,skin:'#a87351',eyes:2,brows:7,eyeColor:0,nose:1,lips:2,body:2,stature:2,exaggeration:1},
 'Vinícius Júnior':{hair:'#161d1e',style:7,beard:0,skin:'#996345',eyes:7,brows:15,eyeColor:0,nose:2,lips:6,body:1,stature:2,exaggeration:2},
 'Harry Kane':{hair:'#a88964',style:1,beard:2,skin:'#e6b394',eyes:4,brows:6,eyeColor:4,nose:0,lips:2,body:2,stature:3,exaggeration:0},
 'Jude Bellingham':{hair:'#282124',style:11,beard:0,skin:'#af7957',eyes:5,brows:11,eyeColor:0,nose:3,lips:3,body:1,stature:3,exaggeration:1},
 'Lamine Yamal':{hair:'#14171a',style:11,beard:0,skin:'#b57d5c',eyes:11,brows:14,eyeColor:0,nose:1,lips:2,body:0,stature:2,exaggeration:2},
 'Pedri':{hair:'#2b2522',style:3,beard:0,skin:'#e6b28d',eyes:8,brows:8,eyeColor:2,nose:0,lips:3,body:0,stature:1,exaggeration:1},
 'Rodri':{hair:'#2d2927',style:1,beard:2,skin:'#d8a282',eyes:5,brows:6,eyeColor:0,nose:5,lips:1,body:2,stature:3,exaggeration:0},
 'Kevin De Bruyne':{hair:'#c79a61',style:1,beard:2,skin:'#ebbfa2',eyes:14,brows:5,eyeColor:2,nose:4,lips:1,body:1,stature:2,exaggeration:2},
 'Luka Modrić':{hair:'#8c603d',style:7,beard:0,skin:'#ecc099',eyes:10,brows:8,eyeColor:4,nose:5,lips:3,body:0,stature:1,exaggeration:1},
 'Virgil van Dijk':{hair:'#161d1d',style:10,beard:2,skin:'#ae7957',eyes:6,brows:13,eyeColor:0,nose:4,lips:2,body:3,stature:4,exaggeration:1},
 'Son Heung-min':{hair:'#24201e',style:3,beard:0,skin:'#e0a778',eyes:16,brows:7,eyeColor:0,nose:0,lips:1,body:0,stature:2,exaggeration:1},
 'Karim Benzema':{hair:'#201b1c',style:2,beard:3,skin:'#bf8562',eyes:3,brows:12,eyeColor:0,nose:5,lips:1,body:2,stature:2,exaggeration:1},
 'Ronaldinho':{hair:'#231f1d',style:11,beard:0,accessory:1,skin:'#aa7959',eyes:17,brows:18,eyeColor:0,nose:2,lips:6,body:1,stature:2,exaggeration:2},
 'Ronaldo Nazário':{hair:'#181a1c',style:2,beard:0,skin:'#ba8563',eyes:9,brows:7,eyeColor:0,nose:3,lips:5,body:2,stature:2,exaggeration:2},
 'Zinedine Zidane':{hair:'#1e1f20',style:2,beard:0,skin:'#d9a07c',eyes:1,brows:4,eyeColor:2,nose:4,lips:1,body:1,stature:3,exaggeration:0},
 'Gianluigi Buffon':{hair:'#292427',style:6,beard:2,skin:'#e3b18d',eyes:6,brows:9,eyeColor:0,nose:5,lips:1,body:2,stature:4,exaggeration:0},
 'Andrés Iniesta':{hair:'#282a2a',style:2,beard:0,skin:'#ebc29b',eyes:0,brows:2,eyeColor:2,nose:3,lips:0,body:0,stature:1,exaggeration:1},
 'Xavi Hernández':{hair:'#252424',style:2,beard:0,skin:'#e4ae85',eyes:4,brows:8,eyeColor:0,nose:1,lips:2,body:0,stature:1,exaggeration:0},
 'Iker Casillas':{hair:'#29272b',style:0,beard:1,skin:'#e9af88',eyes:2,brows:5,eyeColor:0,nose:3,lips:1,body:1,stature:2,exaggeration:0},
 'Sergio Ramos':{hair:'#27231e',style:4,beard:3,skin:'#db9c74',eyes:6,brows:12,eyeColor:0,nose:3,lips:3,body:2,stature:3,exaggeration:2},
 'Roberto Carlos':{hair:'#202123',style:2,beard:0,skin:'#a46e4e',eyes:1,brows:11,eyeColor:0,nose:5,lips:4,body:3,stature:1,exaggeration:1},
 'Cafu':{hair:'#1b1d1d',style:2,beard:0,skin:'#9c6448',eyes:2,brows:10,eyeColor:0,nose:2,lips:3,body:1,stature:2,exaggeration:1},
 'Paolo Maldini':{hair:'#4c3428',style:6,beard:0,skin:'#e7ae8e',eyes:5,brows:9,eyeColor:0,nose:5,lips:1,body:1,stature:3,exaggeration:0},
 'Raphinha':{hair:'#232121',style:10,beard:2,skin:'#bd815b',eyes:12,brows:15,eyeColor:0,nose:2,lips:4,body:1,stature:2,exaggeration:2},
 'Marcus Rashford':{hair:'#191b1e',style:11,beard:0,skin:'#9f6b4e',eyes:18,brows:13,eyeColor:0,nose:3,lips:2,body:1,stature:3,exaggeration:1},
 'Martin Ødegaard':{hair:'#9a7652',style:1,beard:0,skin:'#edbf9a',eyes:15,brows:6,eyeColor:2,nose:4,lips:0,body:0,stature:2,exaggeration:1},
 'Sadio Mané':{hair:'#151919',style:2,beard:1,skin:'#986748',eyes:3,brows:14,eyeColor:0,nose:2,lips:3,body:0,stature:2,exaggeration:1},
 'Bruno Fernandes':{hair:'#2b2420',style:2,beard:3,skin:'#ddb18d',eyes:8,brows:11,eyeColor:0,nose:5,lips:2,body:1,stature:3,exaggeration:2},
 'Alisson':{hair:'#432e23',style:1,beard:3,skin:'#dbac83',eyes:7,brows:11,eyeColor:0,nose:4,lips:2,body:2,stature:4,exaggeration:1},
 'Jamal Musiala':{hair:'#202127',style:11,beard:0,skin:'#ba8865',eyes:19,brows:17,eyeColor:0,nose:1,lips:3,body:0,stature:2,exaggeration:2},
 'Arda Güler':{hair:'#252126',style:4,beard:0,skin:'#dfa77d',eyes:10,brows:10,eyeColor:0,nose:0,lips:1,body:0,stature:1,exaggeration:1},
 'Cole Palmer':{hair:'#8e6a43',style:1,skin:'#efbf98',eyes:14,brows:6,eyeColor:2,nose:0,lips:0,body:0,stature:2,exaggeration:1},
 'Bukayo Saka':{hair:'#1c1d1f',style:11,skin:'#8c6046',eyes:7,brows:13,eyeColor:0,nose:2,lips:5,body:1,stature:2,exaggeration:2},
 'Mohamed Salah':{hair:'#202125',style:11,beard:3,skin:'#b57b56',eyes:12,brows:16,eyeColor:0,nose:2,lips:4,body:1,stature:2,exaggeration:1},
 'Lautaro Martínez':{hair:'#26201d',style:2,beard:1,skin:'#d49b76',eyes:8,brows:12,eyeColor:0,nose:1,lips:2,body:1,stature:1,exaggeration:1},
 'Gianluigi Donnarumma':{hair:'#1d1c1b',style:2,beard:1,skin:'#ddb08d',eyes:2,brows:8,eyeColor:0,nose:5,lips:0,body:2,stature:4,exaggeration:0},
 'Mike Maignan':{hair:'#1a1b1c',style:2,beard:1,skin:'#8a5e47',eyes:1,brows:10,eyeColor:0,nose:4,lips:3,body:2,stature:3,exaggeration:1},
 'Christian Pulisic':{hair:'#75553d',style:4,skin:'#efc09c',eyes:11,brows:8,eyeColor:4,nose:1,lips:0,body:0,stature:1,exaggeration:1},
 'Rafael Leão':{hair:'#1b1c1f',style:11,skin:'#855b44',eyes:16,brows:15,eyeColor:0,nose:4,lips:5,body:1,stature:3,exaggeration:2}
 };
 const prev=player.appearance||{};
 const base={
  skin,
  hair:hairs[(h>>>8)%hairs.length],
  style:h%13,
  face:(h>>>22)%5,
  eyes:(h>>>9)%20,
  brows:(h>>>11)%20,
  eyeColor:(h>>>7)%6,
  nose:(h>>>13)%6,
  lips:(h>>>16)%8,
  beard:(h>>>18)%5,
  accessory:(h>>>20)%6,
  freckles:(h>>>25)%4,
  scar:(h>>>26)%6,
  tattoo:(h>>>21)%6,
  body:(h>>>5)%5,
  stature:(h>>>17)%5,
  exaggeration:(h>>>27)%3
 };
 const preset=signature[player.name]||{};
 const compat={};
 if(prev.mouth!=null&&prev.lips==null)compat.lips=prev.mouth;
 return {...base,eyeTint:eyeTints[(h>>>7)%eyeTints.length],...preset,...compat,...prev};
}const colors=['#e9464b','#3977bb','#31a172','#f2d047','#d36a58','#edece6','#3c414a','#8d59a9'];
function installExpansion(TEAMS,SHOTS){
 const KEEPERS={
  'Arsenal':'David Raya','Bayern Munich':'Manuel Neuer','Manchester City':'Gianluigi Donnarumma','Paris Saint-Germain':'Lucas Chevalier','Barcelona':'Joan García','Manchester United':'Senne Lammens','Aston Villa':'Emiliano Martínez','Real Madrid':'Thibaut Courtois','Inter Milan':'Yann Sommer','Liverpool':'Alisson','Bournemouth':'Djordje Petrovic','Borussia Dortmund':'Gregor Kobel','Brighton':'Bart Verbruggen','Newcastle United':'Nick Pope','Sporting CP':'Rui Silva','Brentford':'Caoimhín Kelleher','Benfica':'Anatoliy Trubin','Nottingham Forest':'Angus Gunn','Chelsea':'Robert Sánchez','Atlético Madrid':'Jan Oblak','Bayer Leverkusen':'Mark Flekken','Club Brugge':'Simon Mignolet','Roma':'Mile Svilar','Fulham':'Bernd Leno','Crystal Palace':'Dean Henderson','Napoli':'Vanja Milinković-Savić','Porto':'Diogo Costa','Everton':'Jordan Pickford','Juventus':'Michele Di Gregorio','Tottenham':'Guglielmo Vicario','AC Milan':'Mike Maignan','Flamengo':'Agustín Rossi',
  '1998 France':'Fabien Barthez','2002 Brazil':'Marcos','2006 Italy':'Gianluigi Buffon','2010 Spain':'Iker Casillas','2011 Barcelona':'Víctor Valdés','2016 Real Madrid':'Keylor Navas'
 };
 function make(t,type,idx,names,flag,primary,rank,rosterPrecision){
 const id=type+'_'+idx,shot=Object.keys(SHOTS)[(idx*7+11)%Object.keys(SHOTS).length];
 const slots=names.split('|').slice(0,12);if(type!=='national26'&&KEEPERS[t]){let i=slots.indexOf(KEEPERS[t]);if(i>=0)slots.splice(i,1);slots.unshift(KEEPERS[t]);slots.length=Math.min(slots.length,12)}
 const roleAt=(i)=>i===0||i===11?'GK':i===1||i===2||i===6||i===7?'DF':i===3||i===4||i===8?'MF':'FW';
 while(slots.length<12)slots.push(`Academy Prospect ${slots.length+1}`);
 const customRoster=slots.map((name,i)=>{const role=roleAt(i),rating=Math.min(97,Math.max(50,rank-(i%5)*2+Math.round((i*19)%7)));const p={id:id+'_'+i,name,role,num:i+1,power:Math.round(rating*.55+8),shoot:Math.round(rating*.20+7),defense:Math.round(rating*.22+3),speed:['A','B','B','C'][i%4],shot,shotName:SHOTS[shot].name,skill:'2026 Arcade Technique',level:1,xp:0,age:22+i%12,rating,value:Math.round((rating-44)**2*27000),fictional:name.startsWith('Academy Prospect'),source:rosterPrecision};p.avatar=avatarFor(p);return p});
 const team={id,index:TEAMS.length,name:t,flag,primary,secondary:primary==='#f3f3f3'?'#2a3545':'#f5efe0',trim:colors[(idx*3+1)%colors.length],shot,rank,group:type,customRoster,rosterPrecision};TEAMS.push(team);return team;
 }
 NATIONAL_2026.forEach(([name,flag,names],i)=>make(name,'national26',i,names,flag,colors[(i*3+1)%colors.length],Math.max(65,99-Math.round(i*.82)),[14,20,29].includes(i)?'editorial 2026 selection':'2026 World Cup squad sample'));
 CLUBS_2026.forEach(([name,flag,color,names],i)=>make(name,'club26',i,names,flag,color,Math.max(65,100-Math.round(i*.8)),'World Cup affiliation sample; academy stand-ins flagged'));
 LEGEND_SQUADS.forEach(([name,flag,names],i)=>make(name,'legends',i,names,flag,colors[(i*5+2)%colors.length],96-i,'historical editorial XI+bench'));
 return TEAMS;
}

return {NATIONAL_2026,CLUBS_2026,LEGEND_SQUADS,avatarFor,installExpansion,NATURAL_SKIN_TONES,NATURAL_HAIR_COLORS,STUDIO_ASSET_LABELS};})();

export {EXPANDED};
