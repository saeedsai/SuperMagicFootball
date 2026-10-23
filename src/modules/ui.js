// Supermagic Football v0.8.25.30 | UI | independently editable module
import {AUDIO} from "./audio.js";
import {KITS} from "./kits.js";
import {SPECIALS} from "./specials.js";
import {ABILITIES} from "./abilities.js";
import {DRIBBLES} from "./dribbles.js";
import {ABILITY_ICONS} from "./ability-icons.js";
import {STATS} from "./stats.js";
import {MORALE} from "./morale.js";
import {DATA} from "./data.js";
import {IDENTITY} from "./identity.js";
import {CLUBFILTERS} from "./clubfilters.js";
import {TACTICS} from "./tactics.js";
import {AI} from "./ai.js";
import {EXPANDED} from "./expanded.js";
import {BPW} from "./bpw.js";
import {BPWALLTIME} from "./bpwalltime.js";
import {CONTINENTAL} from "./continental.js";
import {TOURNAMENTS} from "./tournaments.js";
import {CAREER} from "./career.js";
import {CAREER_SLOTS} from "./career_slots.js";
import {CUP_SLOTS} from "./cup_slots.js";
import {RELEASE} from "./release.js";
import {INPUT} from "./input.js";
import {VISUALFEEL} from "./visualfeel.js";
import {ENGINE} from "./engine.js";
import {BPWPERSONALITY} from "./bpwpersonality.js";
import {RENDER} from "./render.js";
import {CONCEPT_MODULAR} from "./conceptmodular.js";
import {GAME_ASSETS} from "../assets.js";
(()=>{const {ArcadeAudio,AUDIO_DEFAULTS}=AUDIO;const {JAPAN_ROSTER,TEAMS,rosterFor,SHOTS,DEFAULT_OPTIONS,DEFAULT_LINEUP,WEATHER,TERRAIN,CONDITIONS,FORMATIONS}=DATA;const {Input}=INPUT;const {TEAM_TALKS,moodLabel}=MORALE;const {AI_LEVELS,aiTuning}=AI;const {withStats,NUMERIC_STATS,overallForPosition}=STATS;const {abilityLevel}=SPECIALS;const {kitFor,KIT_CHOICES}=KITS;const {teamIdentity,countryFlag,countryCode,isClub}=IDENTITY;const {careerClubIds,clubRegion,clubCountry,countryName,availableRegions,availableCountries,clubsInCountry}=CLUBFILTERS;const {defaultPlan,safePlan,validatePlan,ATTACK_STYLES,DEFENCE_STYLES}=TACTICS;const {GameEngine}=ENGINE;const {Renderer}=RENDER;const {installExpansion,avatarFor,NATURAL_SKIN_TONES,NATURAL_HAIR_COLORS,STUDIO_ASSET_LABELS}=EXPANDED;const {installBPWWorldCups,BPW_YEARS}=BPW;const {installBPWAllTime}=BPWALLTIME;const {CONTINENTS,SIX_TOP_BY_CONTINENT,installContinentalClubs}=CONTINENTAL;const {createTournament,tournamentCurrent,tournamentAdvance,tournamentStandings,tournamentProgress,validateTournament}=TOURNAMENTS;const {createCareer,currentCareerFixture,advanceCareer,standings,nextSeason,purchase,upgradeFacility,trainPlayer,scoutAcademy,signAcademy,renewContract,recoverPlayer,careerCoverage,recordMatchFitness}=CAREER;


















const $=id=>document.getElementById(id), input=new Input(), renderer=new Renderer($('field'));
const store={get(k,v){try{return JSON.parse(localStorage.getItem('legend_'+k))??v}catch{return v}},put(k,v){try{localStorage.setItem('legend_'+k,JSON.stringify(v))}catch{}}};
// Preserve original order: 13 arcade, 32 national, 32 clubs, 6 legends, 133 continental;
// user-created clubs are inserted before the seven BPW teams as before.
for(const entry of GAME_ASSETS.teams.slice(13,216)){
 const t={...entry,index:TEAMS.length,customRoster:GAME_ASSETS.rosters[entry.id]};TEAMS.push(t);
}
const CONTINENTAL_TEAMS=GAME_ASSETS.continentalMapping;
for(const team of TEAMS)if(team.customRoster)team.customRoster=rosterFor(team.index).map(withStats);
const clubs=store.get('customClubs',[]);
for(const club of clubs){if(club&&String(club.id||'').startsWith('club_')&&typeof club.name==='string'&&/^#[0-9a-fA-F]{6}$/.test(club.primary||'')&&Array.isArray(club.customRoster)&&club.customRoster.length===12){club.index=TEAMS.length;TEAMS.push(club)}}
// Append after loaded user clubs: six original World Cup BPW indexes and
// all legacy saved-team indices remain stable; the all-time squad is last.
for(const entry of GAME_ASSETS.teams.slice(216))TEAMS.push({
 ...entry,index:TEAMS.length,customRoster:GAME_ASSETS.rosters[entry.id]
});
// A single literal illustrated character model in every position; original teams remain unchanged.
const CONCEPT_DEMO_ID='demo_concept_royals';
const CONCEPT_DEMO_ROLES=['GK','GK','DF','DF','DF','MF','MF','MF','MF','FW','FW','FW'];
const CONCEPT_DEMO_NUMBERS=[1,12,2,3,4,5,6,7,8,9,10,11];
const CONCEPT_DEMO_IDENTITIES=[
 ['Alex Moreno','#e8b48e','#493020','messy','none','none'],
 ['Leo Fischer','#f0c4a0','#d5a23f','swept','headband','none'],
 ['Kwame Adu','#68422f','#161419','coils','none','none'],
 ['Diego Rivas','#b9825c','#221b1b','fade','none','neckTattoo'],
 ['Ryo Tanaka','#e0b49b','#8e8e97','fringe','none','none'],
 ['Sean OConnor','#edb48c','#b95225','crop','none','freckles'],
 ['Rafa Silva','#bd865f','#30201a','curly','none','cheekMark'],
 ['Malik Diarra','#794d35','#c39a4b','locs','earring','none'],
 ['Ivan Petrov','#dfaa86','#372b27','buzz','none','templeTattoo'],
 ['Carlos Mena','#c28a65','#272027','ponytail','none','none'],
 ['Samuel Okafor','#6c4839','#d4d6dc','shortCurls','bandage','none'],
 ['Enzo Ferrari','#e5b58e','#68482d','long','headband','none']
];
const CONCEPT_DEMO_ROSTER=CONCEPT_DEMO_ROLES.map((role,i)=>{
 const [name,skin,hair,hairStyle,accessory,mark]=CONCEPT_DEMO_IDENTITIES[i];
 return {
 id:CONCEPT_DEMO_ID+'_'+i,name,role,
 num:CONCEPT_DEMO_NUMBERS[i],power:72,shoot:40,defense:42,speed:'A',
 shot:'omega',shotName:'Concept Magic Shot',skill:'Illustrated Prototype',
 level:1,xp:0,renderModel:'concept_hero',
 appearance:{renderModel:'concept_hero',conceptHeroVariant:i,style:1,face:i,beard:0,accessory:0,
 skin,hair,hairStyle,conceptAccessory:accessory,conceptMark:mark,body:2,stature:2,exaggeration:1}
 };
});
// Explicit one-player art-preview opt-in; default game and saved rosters are unchanged.
if(typeof location!=='undefined'&&new URLSearchParams(location.search).has('conceptModularPreview')){
 CONCEPT_DEMO_ROSTER[9].renderModel='concept_modular_v1';
 CONCEPT_DEMO_ROSTER[9].appearance.renderModel='concept_modular_v1';
}
TEAMS.push({id:CONCEPT_DEMO_ID,index:TEAMS.length,name:'Concept Royals FC',
 group:'concept_demo',flag:'CRF',primary:'#1262d4',secondary:'#f4f5f7',
 trim:'#f1bb46',rank:84,shot:'omega',customRoster:CONCEPT_DEMO_ROSTER});

// Separate Crown Royals reference team. Never replace or mutate Concept Royals.
// Alex and Leo use independent reference-art sprites; the other ten
// players remain placeholders using the standard art pipeline.
const CROWN_ROYALS_ID='demo_crown_royals_reference';
const CROWN_NAMES=['Leo','Kwame','Diego','Ryo','Sean','Rafa','Malik','Ivan','Carlos','Alex','Samuel','Enzo'];
const CROWN_ROLES=['GK','GK','DF','DF','DF','MF','MF','MF','MF','FW','FW','FW'];
const CROWN_ROSTER=CROWN_NAMES.map((name,i)=>({
 id:i===9?'crown_royals_reference_alex':i===0?'crown_royals_reference_leo':i===1?'crown_royals_reference_kwame':CROWN_ROYALS_ID+'_'+i,
 name,role:CROWN_ROLES[i],num:i===9?1:i<9?i+2:i+1,power:70,shoot:36,defense:39,speed:'B',
 shot:'omega',shotName:'Crown Magic Shot',skill:'Reference Art In Progress',
 level:1,xp:0,...((i===9||i===0||i===1)?{renderModel:'crown_royals_reference',
 appearance:{renderModel:'crown_royals_reference',skin:i===1?'#68422f':i===0?'#f0c4a0':'#e8b48e',hair:i===1?'#161419':i===0?'#d5a23f':'#493020'}}:{})
}));
TEAMS.push({id:CROWN_ROYALS_ID,index:TEAMS.length,name:'Crown Royals (Art WIP)',
 group:'crown_royals_reference',flag:'CR',primary:'#362070',secondary:'#edc04c',
 trim:'#f2bd49',rank:83,shot:'omega',customRoster:CROWN_ROSTER});


const careerStorage=(()=>{try{return window.localStorage}catch{return {getItem(){return null},setItem(){throw Error('Persistent storage unavailable')},removeItem(){throw Error('Persistent storage unavailable')}}}})();
const careerSlots=CAREER_SLOTS.create(careerStorage);
let career=store.get('managerCareer',null),creatingCareer=false;
// Migrate pre-0.6 custom-club index saves: v0.5 appended user clubs at index 83.
if(career&&!career.saveSchema&&clubs.length){const oldToNew=id=>Number.isInteger(id)&&id>=83&&id<83+clubs.length?(TEAMS.findIndex(t=>t.id===clubs[id-83].id)):id;
 if(career.club>=83&&career.club<83+clubs.length){career.club=oldToNew(career.club);career.members=career.members.map(oldToNew);career.fixtures=career.fixtures.map(r=>r.map(pair=>pair.map(oldToNew)));career.table=Object.fromEntries(Object.entries(career.table).map(([id,v])=>[oldToNew(+id),v]));career.history.forEach(r=>r.against=oldToNew(r.against));if(career.lastResult)career.lastResult.against=oldToNew(career.lastResult.against);career.saveSchema=2;store.put('managerCareer',career)}
}
if(!careerSlots.error){try{careerSlots.importLegacy(career);if(careerSlots.hasVault)career=careerSlots.activeCareer();}catch(error){console.warn('Career slot migration could not be saved:',error);}}
let continentalRun=store.get('continentalRun',null);if(!validateTournament(continentalRun,TEAMS))continentalRun=null;
// SAVE-102: migrate existing Cup campaign without deleting the legacy save.
const cupSlots=CUP_SLOTS.create(careerStorage);
if(!cupSlots.error){try{
 cupSlots.importLegacy(continentalRun);
 if(cupSlots.hasVault){const saved=cupSlots.activeTournament();if(saved&&validateTournament(saved,TEAMS))continentalRun=saved;}
}catch(error){console.warn('Cup slot migration could not be saved:',error);}}

let continentSelection='UEFA';
let managerRegion='',managerCountry='';
const opt={...DEFAULT_OPTIONS,...store.get('options',{})};opt.ballModel=VISUALFEEL.validBallModel(opt.ballModel);
input.setBindings(store.get('controllerBindings',input.getBindings()));
const kitSelections=(()=>{const k=store.get('kitSelections',null);return Array.isArray(k)?[k[0]==='away'?'away':'home',k[1]==='home'?'home':'away']:['home','away'];})();
let preTalkChoices=['none','none'];let home=0,away=9,homeCategory='all',awayCategory='all',mode='quick',humans=1,formation=opt.formation||'2-1-2',lineup=store.get('lineup',DEFAULT_LINEUP.slice()), edits=store.get('edits',{}),screen='home';
let teamPlans=store.get('teamPlans',{}),squadContext='home',squadSide=0,squadReturnAtHalf=false;
let league=store.get('league',{played:0,wins:0,draws:0,losses:0,points:0,playoff:0,stage:'qualifier',games:[]});
const audio=new ArcadeAudio({...AUDIO_DEFAULTS,...store.get('audioOptions',{}),...(opt.sfx===false?{mute:true}:{})});
const game=new GameEngine(opt,input),menu=$('menu'),hud=$('hud'),touch=$('mobile'),perfHud=$('perfHud');
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const button=(name,act,cls='')=>`<button class="btn ${cls}" data-action="${act}">${name}</button>`;
const choice=(id,values,selected)=>`<select id="${id}" class="choice">${values.map(([key,name])=>`<option value="${escapeHTML(key)}" ${String(key)===String(selected)?'selected':''}>${escapeHTML(name)}</option>`).join('')}</select>`;
const aiChoices=()=>AI_LEVELS.map(l=>[l.id,l.name]);
const difficultyHint=()=>`<p class="muted" id="difficultyHint">${escapeHTML(aiTuning(opt.difficulty).name)} CPU: reaction, shot accuracy, passing, pressure and keeper response all scale by difficulty. Human players are unaffected.</p>`;
const field=(name,id,values,selected)=>`<label class="fieldLabel" for="${id}">${name}</label>${choice(id,values,selected)}`;

// Native select remains keyboard-accessible; the adjacent icon browser displays
// actual team flags and original crests while searching and selecting a team.
const teamField=(name,id,values,selected)=>`${field(name,id,values,selected)}<div class="teamPickTools"><span class="teamPickCurrent" id="${id}Identity">${TEAMS[selected]?teamIdentity(TEAMS[selected]):''}</span><button type="button" class="btn minor teamBrowseToggle" data-team-browse="${id}" aria-expanded="false" aria-controls="${id}Browse">⚑ BROWSE FLAGS / CRESTS</button></div><div class="teamBrowsePanel hidden" id="${id}Browse"><label class="fieldLabel" for="${id}Search">SEARCH TEAM</label><input class="teamBrowseSearch" id="${id}Search" type="search" data-team-search="${id}" placeholder="Search by team or country" autocomplete="off"/><div class="teamBrowseResults" id="${id}Results" role="listbox" aria-label="Teams with flags and crests"></div></div>`;
function updateTeamPickerIcon(id){const target=$(id+'Identity'),team=TEAMS[Number($(id)?.value)];if(target)target.innerHTML=team?teamIdentity(team):'';}
function fillTeamBrowser(id){const select=$(id),panel=$(id+'Browse'),out=$(id+'Results');if(!select||!panel||!out)return;const query=($(id+'Search')?.value||'').trim().toLocaleLowerCase();const available=[...select.options].filter(o=>o.value!==''&&TEAMS[Number(o.value)]).map(o=>Number(o.value));const matching=available.filter(i=>!query||`${TEAMS[i].name} ${countryName(clubCountry(TEAMS[i]),TEAMS)} ${clubCountry(TEAMS[i])}`.toLocaleLowerCase().includes(query));const first=matching.slice(0,60);out.innerHTML=first.map(i=>`<button type="button" class="teamPickItem ${String(i)===select.value?'selected':''}" role="option" aria-selected="${String(i)===select.value}" data-pick-team="${id}" data-team-id="${i}">${teamIdentity(TEAMS[i])}<span>${escapeHTML(TEAMS[i].name)}<small>${escapeHTML(countryName(clubCountry(TEAMS[i]),TEAMS))}</small></span></button>`).join('')||'<p class="muted">No matching teams</p>';if(matching.length>60)out.innerHTML+=`<p class="muted">Showing 60 of ${matching.length}. Type to narrow your search.</p>`;}
function showTeamBrowser(id){const target=$(id+'Browse'),toggle=menu.querySelector(`[data-team-browse="${id}"]`);if(!target)return;const open=target.classList.contains('hidden');menu.querySelectorAll('.teamBrowsePanel').forEach(x=>x.classList.add('hidden'));menu.querySelectorAll('[data-team-browse]').forEach(x=>x.setAttribute('aria-expanded','false'));if(open){target.classList.remove('hidden');if(toggle)toggle.setAttribute('aria-expanded','true');fillTeamBrowser(id);$(id+'Search')?.focus();}}

const nations=()=>TEAMS.map((t,i)=>[i,`[${t.group==='bpw_worldcup'?'WC':t.group==='bpw_alltime'?'AT':countryCode(t)||'FC'}] ${t.group==='national26'?'NAT ':t.group==='club26'?'CLB ':t.group==='continental'?'CUP ':t.group==='bpw_worldcup'?'BPW WC ':t.group==='bpw_alltime'?'BPW LEG ':t.group==='legends'?'LEG ':'ARC '}${t.name} (${t.rank})`]);
const categoryOptions=[['all',`ALL ${TEAMS.length} TEAMS`],['arcade','1993 ARCADE TEAMS'],['national26','2026 NATIONAL TEAMS'],['club26','2026 FEATURED GLOBAL CLUBS'],['UEFA','EUROPE CHAMPIONS'],['AFC','ASIA CHAMPIONS'],['CAF','AFRICA CHAMPIONS'],['CONCACAF','NORTH AMERICA CHAMPIONS'],['CONMEBOL','SOUTH AMERICA CHAMPIONS'],['OFC','OCEANIA CHAMPIONS'],['legends','LEGENDARY TEAMS'],['bpw_worldcup','BPW WORLD CUP ALL-STARS (1998–2018)'],['bpw_alltime','BPW ALL-TIME LEGENDARY 12 ★']];
const filteredNations=cat=>nations().filter(([i])=>cat==='all'||cat==='arcade'&&TEAMS[i].group===undefined||cat==='club26'&&TEAMS[i].group==='club26'||cat==='national26'&&TEAMS[i].group==='national26'||cat==='legends'&&TEAMS[i].group==='legends'||cat==='bpw_worldcup'&&TEAMS[i].group==='bpw_worldcup'||cat==='bpw_alltime'&&TEAMS[i].group==='bpw_alltime'||['UEFA','AFC','CAF','CONCACAF','CONMEBOL','OFC'].includes(cat)&&TEAMS[i].continent===cat);
const roster=i=>(edits[TEAMS[i].id]||rosterFor(i)).map(withStats);
const playerOVR=(p,position=p?.role)=>overallForPosition(p,position);
const playerAbilityIcons=p=>ABILITY_ICONS.summary(p,SHOTS,ABILITIES.DEFENCE_MOVES,DRIBBLES.DRIBBLE_STYLES,STUDIO_MAGIC_TRICKS);
const studioEliteEligible=p=>Number.isFinite(Number(p?.rating))?Number(p.rating)>=90:playerOVR(p)>=90;
const planFor=i=>safePlan(teamPlans[TEAMS[i].id],roster(i),i);
const identity=i=>teamIdentity(TEAMS[i]);
const menuVisible=()=>!menu.classList.contains('hidden');
const closeMenu=()=>{input.cancelAll();audio.sceneChange('match');menu.classList.add('hidden');hud.classList.remove('hidden');touch.classList.toggle('hidden',!matchMedia('(pointer:coarse)').matches)};
const show=(html,id='home')=>{audio.sceneChange(id==='HALF TIME'?'halftime':id==='PAUSED'?'silent':'menu');screen=id;menu.classList.remove('hidden','blank');menu.innerHTML=`<div class="menubox"><div class="screenTools">${button('⛶ FULLSCREEN','fullscreen','minor fullscreenTool')}</div>${html}<div class="copyright">INDEPENDENT HD SOCCER ENGINE • ORIGINAL CODE & GRAPHICS • NO EMULATOR • EARLY ACCESS BUILD</div></div>`;hud.classList.add('hidden');touch.classList.add('hidden')};
function page(title,subtitle,body,returnAction='home'){if(returnAction==='home'&&menuEntryReturn!=='home')returnAction=menuEntryReturn;menuBackAction=returnAction;show(`<div class="row space"><div><div class="topline">HIGH-DEFINITION CARTOON SOCCER</div><h1 class="heading">${title}</h1><div class="subtitle">${subtitle}</div></div>${button('← BACK',returnAction,'minor')}</div>${body}`,title)}
// v0.8.24.7 — Menu handoff: five primary categories, no new gameplay modes.
// Existing action handlers, saves, teams and engine remain the authority.
const menuParents={
 'nav-quick':'home','nav-device':'navQuick','nav-online':'home','nav-career':'home',
 'nav-cups':'home','nav-international':'navCups','nav-clubs':'navCups',
 'nav-settings':'home','nav-settings-game':'navSettings','nav-settings-graphics':'navSettings',
 'nav-settings-sound':'navSettings','nav-customize':'navSettings','nav-input':'navSettings',
 'nav-saves':'navSettings','nav-about':'home','nav-later':'navCups'
};
const navFocusMap={};let menuBackAction='home',menuEntryReturn='home';
const navItem=(label,act,description='',availability='active',icon='⚽')=>({label,act,description,availability,icon});
function menuChoices(id,title,subtitle,entries,back='home',extra=''){
 menuBackAction=back;
 const cards=entries.map((e,i)=>`<button type="button" class="btn navChoice ${e.availability==='later'?'navLater':''}" data-action="${escapeHTML(e.act)}" ${i===0?'data-default-focus="true"':''} aria-label="${escapeHTML(e.label+(e.availability==='later'?' coming later':''))}"><span class="navIcon" aria-hidden="true">${e.icon}</span><span class="navCopy"><strong>${escapeHTML(e.label)}</strong><small>${escapeHTML(e.description)}</small></span><span class="navStatus">${e.availability==='later'?'COMING LATER':'›'}</span></button>`).join('');
 show(`<div class="navScreen"><div class="row space navHeader"><div><div class="topline">SUPERMAGIC FOOTBALL</div><h1 class="heading">${escapeHTML(title)}</h1><p class="subtitle">${escapeHTML(subtitle)}</p></div>${button('← BACK',back,'minor navBack')}</div><div class="navList">${cards}</div>${extra}</div>`,id);
 // Restore the selected item in its parent after returning; do not steal focus from clicks.
 if(navFocusMap[id]){const match=menu.querySelector(`[data-action="${navFocusMap[id]}"]`);if(match){match.focus({preventScroll:true});return;}}
 menu.querySelector('.navChoice')?.focus({preventScroll:true});
}
const comingLater=(title,description,back='navCups')=>{
 menuBackAction=back;
 page(title,'Planned feature — not available in this version.',`<div class="panel navInfo"><h2>COMING LATER</h2><p>${escapeHTML(description)}</p><p>No substitute gameplay is launched. Existing saves are unchanged.</p>${button('← BACK',back,'gold')}</div>`,back);
};
function showQuickMenu(){menuChoices('nav-quick','QUICK MATCH','Play on one device, practice, or explore planned local multiplayer.',[
 navItem('On Device','navOnDevice','Single-player, two-player, penalties and training.','active','🎮'),
 navItem('Local Network','laterLAN','Devices connected over your local network.','later','📡')],'home');}
function showOnDevice(){menuChoices('nav-device','ON DEVICE','Use the existing playable match setups.',[
 navItem('Single Player vs CPU','quick','Existing team, kit and match setup.','active','⚽'),
 navItem('Two Players · Same Device','versus','Play a local head-to-head match.','active','🎮'),
 navItem('Penalty Shootout','pk','Standalone penalty challenge.','active','🥅'),
 navItem('Training Arena','training','Practice the four action buttons and combinations.','active','💥')],'navQuick');}
function showOnlineMenu(){menuChoices('nav-online','ONLINE','Future network modes — not playable in this build.',[
 navItem('Online Match','laterOnlineMatch','Compete over the internet.','later','🌐'),
 navItem('Ultimate Team','laterUltimate','Collect and develop your own squad.','later','⭐'),
 navItem('Online Career','laterOnlineCareer','Shared career experience.','later','💼'),
 navItem('Online Cup / League','laterOnlineCup','Multiplayer competitive tournaments.','later','🏆')],'home');}
function showCareerMenu(){menuChoices('nav-career','CAREER','Continue your existing manager career or manage your club.',[
 ...(career?[navItem('Continue Career','manager',`Season ${career.season} · ${TEAMS[career.club]?.name||'Saved career'}`,'active','▶')]:[]),
 navItem(career?'Start a New Career':'New Career','navNewCareer',career?'Replaces the current career after confirmation.':'Select a club and begin a career.','active','⭐'),
 navItem('Career Management','manager','Squad, transfers, scouting, facilities and fixtures.','active','💼'),
 navItem('10 Career Save Slots','navCareerSlots','Save, load or delete independent manager careers.','active','💾')],'home');}
function showCupsMenu(){menuChoices('nav-cups','LEAGUES & CUPS','Choose an existing competition or explore planned tournaments.',[
 navItem('International','navInternational','World Cup and future national cups.','active','🌍'),
 navItem('Clubs','navClubs','Existing continental championships and future leagues.','active','🏆'),
 navItem('World League · Arcade','league','The original playable World League challenge.','active','⚽'),
 navItem('10 Cup Save Slots','navCupSlots','Save, load or delete ten independent continental campaigns.','active','💾'),
 navItem('Custom Cup','laterCustomCup','Design a custom knockout tournament.','later','➕'),
 navItem('Custom League','laterCustomLeague','Design a custom league season.','later','➕')],'home');}
function showInternationalMenu(){menuChoices('nav-international','INTERNATIONAL','National tournaments planned for future versions.',[
 navItem('World Cup','laterWorldCup','A complete World Cup tournament is not yet implemented.','later','🌐'),
 navItem('Asian Cup','laterAsian','Asian national competition.','later','🌏'),
 navItem('Euro','laterEuro','European national competition.','later','🇪🇺'),
 navItem('Copa América','laterCopa','South American national competition.','later','🌎'),
 navItem('Africa Cup','laterAfrica','African national competition.','later','🌍'),
 navItem('CONCACAF Cup','laterConcacaf','North and Central American national competition.','later','🏆')],'navCups');}
function showClubCompetitionsMenu(){menuChoices('nav-clubs','CLUB COMPETITIONS','Existing continental championships are playable; named leagues remain planned.',[
 navItem('Continental Championships · Six','continents','Playable confederation competitions with fixtures and progression.','active','🏆'),
 navItem('Champions League','laterChampions','Planned branded tournament; use existing continental championships separately.','later','⭐'),
 navItem('Europa League','laterEuropa','Future European cup.','later','🏆'),
 navItem('Premier League','laterPremier','Future domestic league.','later','🏴'),
 navItem('Serie A','laterSerie','Future Italian league.','later','🇮🇹'),
 navItem('Bundesliga','laterBundes','Future German league.','later','🇩🇪'),
 navItem('La Liga','laterLaLiga','Future Spanish league.','later','🇪🇸'),
 navItem('Ligue 1 · France','laterLigue1','Future French league.','later','🇫🇷')],'navCups');}
function showSettingsMenu(){menuChoices('nav-settings','SETTINGS','Adjust the game and manage your saved creations.',[
 navItem('Game Settings','navGameSettings','Difficulty, pace, duration, weather and pitch.','active','⚽'),
 navItem('Graphics','navGraphics','Camera, player names and fullscreen.','active','🖥'),
 navItem('Sound','navSound','Music, sound effects, crowd and mute.','active','🔊'),
 navItem('Player & Team Customization','navCustomization','Player studio, create club, squad tactics and roster editor.','active','🎨'),
 navItem('Input Settings','navInput','Keyboard and gamepad mappings, touch controls reference.','active','🎮'),
 navItem('Save Management','navSaveManagement','Export or import compatible saves.','active','💾'),
 navItem('How to Play','help','Four-button controls and combo guide.','active','📖')],'home');}
function showCustomizationMenu(){menuChoices('nav-customize','PLAYER & TEAM CUSTOMIZATION','Every existing team-management tool is still available.',[
 navItem('Player Studio','playerStudio','Edit player cartoon appearance.','active','🎨'),
 navItem('Create a Club','clubs','Design clubs and kits for matches.','active','🏟'),
 navItem('Roster Editor','editor','Edit 12-player team attributes.','active','🧩'),
 navItem('Squad & Tactics','squad','Lineups, formations and player instructions.','active','👥'),
 navItem('Super Shot Encyclopedia','gallery','Explore available Super Shots.','active','✨')],'navSettings');}
function showInputMenu(){menuChoices('nav-input','INPUT SETTINGS','The game always uses four actions: Pass, Shoot, Dribble and Jump.',[
 navItem('Keyboard & Gamepad Mappings','controls','Remap both local players.','active','🎮'),
 navItem('Touch Controls & Combos','help','View the existing touch layout and combo reference.','active','👆')],'navSettings');}
function showCareerSlots(){
 const rows=careerSlots.list().map(s=>`<div class="panel"><h3 class="titleSmall">SLOT ${s.number}${s.active?' · ACTIVE':''}</h3><p>${s.occupied?`${escapeHTML(s.name)} · ${escapeHTML(TEAMS[s.club]?.name||'Unknown club')} · Season ${s.season} · Week ${s.week} · ${escapeHTML(new Date(s.savedAt).toLocaleString())}`:'Empty slot'}</p><div class="row">${career?button(s.occupied?'OVERWRITE':'SAVE HERE','careerSlotSave_'+s.number):''}${s.occupied?button('LOAD','careerSlotLoad_'+s.number)+button('DELETE','careerSlotDelete_'+s.number):''}</div></div>`).join('');
 page('CAREER SAVE SLOTS','10 independent local slots. The active slot autosaves after career progress; overwrite and delete require confirmation.',`${careerSlots.error?`<p role="alert">Save storage is damaged: ${escapeHTML(careerSlots.error)}. Export a backup before recovery.</p>`:''}<div class="scroll">${rows}</div><p class="muted">Legacy single-save careers are copied into slot 1 without removing the old data. Use Settings → Save Management to export all slots.</p>`,'navCareer');
}
function showCupSlots(){
 const hasFree=cupSlots.list().some(slot=>!slot.occupied);
 const rows=cupSlots.list().map(s=>`<div class="panel"><h3 class="titleSmall">SLOT ${s.number}${s.active?' · ACTIVE':''}</h3><p>${s.occupied?`${escapeHTML(s.name)} · ${escapeHTML(s.compId||'Unknown competition')} · ${escapeHTML(TEAMS[s.club]?.name||'Unknown club')} · ${escapeHTML(s.phase)} · ${s.phase==='finished'?'Complete':'Round '+(s.roundIdx+1)} · Saved ${escapeHTML(new Date(s.savedAt).toLocaleString())}`:'Empty slot'}</p><div class="row">${continentalRun?button(s.occupied?'OVERWRITE':'SAVE HERE','cupSlotSave_'+s.number):''}${s.occupied?button('LOAD','cupSlotLoad_'+s.number)+(hasFree?button('COPY','cupSlotCopy_'+s.number):'')+button('DELETE','cupSlotDelete_'+s.number):''}</div></div>`).join('');
 page('CUP SAVE SLOTS','Ten independent continental championship slots. The active slot saves after every match or bye.',`${cupSlots.error?`<p role="alert">Cup save storage is damaged: ${escapeHTML(cupSlots.error)}. Export a backup before recovery.</p>`:''}<div class="scroll">${rows}</div><p class="muted">Existing single-save championships are copied into slot 1 without deleting their original data. Back up your slots before importing another Cup vault.</p><div class="row">${button('EXPORT CUP BACKUP','cupBackupExport')}${button('IMPORT CUP BACKUP','cupBackupImport')}</div>`,'navCups');
}
function showSaveMenu(parent='navSettings'){menuChoices('nav-saves','SAVE MANAGEMENT','Safely back up or restore local progress.',[
 navItem('Export All Saves','exportSave','Download a JSON backup without changing progress.','active','⬇'),
 navItem('Import Save','importSave','Requires explicit confirmation before replacing progress.','active','⬆')],parent,`<input id="saveImportFile" type="file" accept=".json,application/json" class="hidden" aria-label="Import saved game"/>`);}
// The installed bundle supplies the version and release notes, including offline.
// Never substitute a remote dev commit for proof of the player's deployed game.
function showAbout(){
 const bundle=escapeHTML(RELEASE.version),date=escapeHTML(RELEASE.date);
 const notes=RELEASE.notes.map(note=>`<li>${escapeHTML(note)}</li>`).join('');
 page('ABOUT SUPERMAGIC FOOTBALL','Original offline cartoon arcade football.',
  `<div class="panel"><h2>GAME VERSION</h2><p id="aboutBundleVersion"><strong>${bundle}</strong></p><p class="muted">Release date · ${date}. This version is embedded in the game you opened and remains available offline.</p><h3>WHAT'S NEW</h3><ul id="aboutReleaseNotes">${notes}</ul><p><strong>Developer: Saeed</strong> · <a href="mailto:saeedmsalehi1990@gmail.com">saeedmsalehi1990@gmail.com</a></p><p class="muted">Four action buttons · ${TEAMS.length} teams · progress saved locally on your device.</p>${button('← MAIN MENU','home','gold')}</div>`,'home');
}
function showHome(){
 menuBackAction='home';menuEntryReturn='home';
 show(`<header class="homeMasthead"><div><div class="topline">ARCADE FOOTBALL · SUPER SHOTS · YOUR FOOTBALL UNIVERSE</div><h1 class="heading logoHeading">SUPERMAGIC <em>FOOTBALL</em></h1><p class="subtitle">Pick a mode. All original gameplay and editing tools remain accessible.</p></div></header>
 <div class="menuGrid homeDashboard simplifiedHome"><main class="homeDirectory" aria-label="Five game categories">
 <div class="navList navMainList">
 ${[
 navItem('Quick Match','navQuick','Play locally or enter training.','active','⚽'),
 navItem('Online','navOnline','Online modes planned for later.','later','🌐'),
 navItem('Career','navCareer','Manage a team and its season.','active','★'),
 navItem('Leagues & Cups','navCups','World League, continental cups and upcoming competitions.','active','🏆'),
 navItem('Settings','navSettings','Game, graphics, sound, controls and customization.','active','⚙')
 ].map(e=>`<button type="button" class="btn navChoice" data-action="${e.act}"><span class="navIcon" aria-hidden="true">${e.icon}</span><span class="navCopy"><strong>${e.label}</strong><small>${e.description}</small></span><span class="navStatus">${e.availability==='later'?'LATER':'›'}</span></button>`).join('')}
 </div><div class="row navFooter">${career?button('▶ CONTINUE CAREER','manager','minor'):''}${button('⛶ FULLSCREEN','fullscreen','minor')}${button('CREDITS / ABOUT','navAbout','minor')}</div>
 <p class="muted homeFootnote">${TEAMS.length} teams · 12 players per team · six formations · four action buttons · playable offline.</p></main>
 <aside class="panel posterPanel" aria-label="Supermagic Football preview"><div class="poster newPoster"><div class="posterSun"></div><div class="posterLines"></div><canvas id="posterCanvas" width="480" height="360" aria-label="Animated football preview"></canvas><div class="posterBall">✦</div><div class="posterTitle">BIG PERSONALITY.<br><span>BIGGER PLAY.</span></div></div><div class="posterStats"><span>01 <b>PLAY OFFLINE</b></span><span>02 <b>${TEAMS.length} TEAMS</b></span><span>03 <b>FOUR ACTION BUTTONS</b></span></div></aside></div>`,'home');
 drawPoster();const focus=menu.querySelector(`[data-action="${navFocusMap.home||'navQuick'}"]`)||menu.querySelector('.navChoice');focus?.focus({preventScroll:true});
}
function drawPoster(){let canvas=$('posterCanvas');if(!canvas)return;let cx=canvas.getContext('2d');let t=performance.now()/1000;cx.clearRect(0,0,canvas.width,canvas.height);
 const p=game.player(0,3);if(!p)return;
 cx.save();cx.translate(207,325);cx.scale(3.15,3.15);renderer.drawPlayer(cx,{...p,x:0,y:0,face:1,anim:t,dx:1,dy:0,z:Math.sin(t*2)*5,action:'kick',controlled:false},game);cx.restore();
 cx.save();cx.translate(355+Math.cos(t*2)*8,130+Math.sin(t*3)*11);cx.rotate(t);cx.scale(2.3,2.3);renderer.drawSoccerBall(cx,0,0,15);cx.restore();
}
function showClubs(){
 const custom=TEAMS.map((t,i)=>({t,i})).filter(v=>v.t.id.startsWith('club_'));
 page('CUSTOM CLUB BUILDER','Create a new playable club with custom colors, signature shot, and twelve editable players. All saved locally.',
 `<div class="twoCol"><div class="panel">
 <div class="badge">BUILD A NEW CLUB</div>
 <label class="fieldLabel" for="clubName">CLUB NAME</label><input class="choice" id="clubName" value="Skyline FC" maxlength="25" placeholder="My Club"/>
 <label class="fieldLabel" for="clubCode">SHORT BADGE</label><input class="choice" id="clubCode" value="SFC" maxlength="3"/>
 <div class="tripleCol colorRows"><div><label class="fieldLabel" for="clubPrimary">KIT COLOR</label><input type="color" id="clubPrimary" value="#ff7444"/></div><div><label class="fieldLabel" for="clubSecondary">TRIM</label><input type="color" id="clubSecondary" value="#ffe7a6"/></div><div><label class="fieldLabel" for="clubThird">ACCENT</label><input type="color" id="clubThird" value="#2a3854"/></div></div>
 ${field('CLUB SPECIAL SHOT','clubShot',Object.entries(SHOTS).map(([k,v])=>[k,v.name]),'banana')}
 ${field('TEAM RATING','clubRank',[50,60,70,80,90,95].map(v=>[v,v+' / 100']),80)}
 <div class="row" style="margin-top:13px">${button('＋ CREATE & SELECT CLUB','saveClub','gold')}</div>
 <p class="muted">New clubs are immediately available for Quick Match and Versus. Edit the twelve-player roster in the Roster Editor afterward.</p>
 </div><div class="panel"><h3 class="titleSmall">MY SAVED CLUBS (${custom.length})</h3>
 <div class="clubList">${custom.map(({t,i})=>`<div class="clubRow">${identity(i)}<div><strong>${escapeHTML(t.name)}</strong><div class="rosterMeta">${escapeHTML(SHOTS[t.shot]?.name||'Super shot')} · ${t.rank} OVR</div></div><div class="row">${button('PLAY','selectClub'+i,'gold')}${button('×','deleteClub'+i,'minor')}</div></div>`).join('')||'<p class="muted">No custom clubs yet. Create one and use it in matches!</p>'}</div>
 </div></div>`);
}
function saveNewClub(){
 const name=$('clubName').value.trim().slice(0,25),flag=$('clubCode').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);
 if(name.length<2||flag.length<2){alert('Enter a club name and a 2–3 letter badge.');return}
 if(TEAMS.some(t=>t.name.toLowerCase()===name.toLowerCase())){alert('This team name already exists.');return}
 const rank=Number($('clubRank').value),shot=$('clubShot').value,slug='club_'+Date.now().toString(36);
 const newRoster=Array.from({length:12},(_,i)=>({id:slug+'_'+i,name:(['Ace','Buster','Dash','Flash','Rex','Zip','Boom','Sunny','Maverick','Rocket','Dashie','Glove'][i]),role:i===0||i===11?'GK':i<4?'DF':i<7?'MF':'FW',num:i+1,power:Math.min(65,35+Math.round(rank*.3)+i%9),shoot:15+Math.round(rank*.12)+(i%5),defense:15+Math.round(rank*.13)+(i%3),speed:['B','C','A','B','D'][i%5],shot,shotName:SHOTS[shot].name,skill:'Club Technique',level:1,xp:0,fictional:true}));
 const t={id:slug,index:TEAMS.length,name,flag:flag||'CL',primary:$('clubPrimary').value,secondary:$('clubSecondary').value,trim:$('clubThird').value,shot,rank,customRoster:newRoster};
 TEAMS.push(t);store.put('customClubs',TEAMS.filter(t=>t.id.startsWith('club_')));home=t.index;away=home===away?0:away;showSetup('quick');
}
function deleteClub(idx){
 const t=TEAMS[idx];if(!t?.id.startsWith('club_')||!confirm(`Delete club ${t.name}?`))return;
 TEAMS.splice(idx,1);TEAMS.forEach((t,i)=>t.index=i);home=0;away=9;store.put('customClubs',TEAMS.filter(t=>t.id.startsWith('club_')));showClubs();
}

// CONTINENTAL CAMPAIGNS — six confederations, all documented participants, self-contained offline seasons.
const confed=id=>CONTINENTS.find(c=>c.id===id);
function showContinents(){
 const inProgress=continentalRun&&continentalRun.phase!=='finished';
 page('GLOBAL CLUB CHAMPIONSHIPS','Choose one of six confederation competitions. Play every match of a single-club championship run, or continue your saved campaign.',
 `<div class="confedGrid">${CONTINENTS.map(c=>`<div class="confedCard"><div class="confedTop"><span class="confedIcon">${{UEFA:'🏆',AFC:'🌏',CAF:'🌍',CONCACAF:'🌎',CONMEBOL:'🔥',OFC:'🌊'}[c.id]}</span><div><div class="badge">${c.id} · ${c.season}</div><h3>${c.name}</h3><span class="rosterMeta">${CONTINENTAL_TEAMS[c.id].length} PARTICIPANTS · ${c.region}</span></div></div><p class="muted"><strong>Top six:</strong> ${c.featured.split('|').map(escapeHTML).join(' · ')}</p>${button('BROWSE CLUBS & START','continentPick_'+c.id,'gold')}</div>`).join('')}</div>
 <div class="row">${button('💾 10 CUP SAVE SLOTS','navCupSlots','minor')}</div>
 ${continentalRun?`<div class="fixture"><strong>Saved: ${confed(continentalRun.compId)?.name} · ${escapeHTML(TEAMS[continentalRun.club]?.name||'Unknown club')}</strong><p>${escapeHTML(tournamentProgress(continentalRun))}</p>${button('▶ CONTINUE SAVED TOURNAMENT','continentContinue','gold')}</div>`:''}
 <p class="muted">Participant names reflect the stated season. Fixtures, tournament draws and ratings are arcade simulations, not the official 2026–27 fixture database. Some squads contain fictional marked stand-ins.</p>`, 'home');
}
function showContinentSetup(id=continentSelection){const comp=confed(id);if(!comp)return showContinents();continentSelection=id;
 const ids=CONTINENTAL_TEAMS[id],defaultClub=career&&ids.includes(career.club)?career.club:ids.find(i=>TEAMS[i].topSix)??ids[0];
 page(comp.name.toUpperCase(),`${comp.region} · ${comp.season} · ${ids.length} qualified clubs. All 12-player squads are selectable.`,
 `<div class="twoCol"><div class="panel"><div class="badge">CHOOSE A CLUB</div>
 ${teamField('YOUR CLUB','continentClub',ids.map(i=>[i,`${TEAMS[i].topSix?'★ ':''}[${countryCode(TEAMS[i])||'CLB'}] ${TEAMS[i].name} • ${TEAMS[i].rank} OVR`]),defaultClub)}
 <p class="muted">★ marks six featured top clubs of this confederation. Selection does not change actual historical participation.</p>
 ${button('🏆 START NEW CHAMPIONSHIP','continentStart','gold')}
 <p class="muted" style="margin-top:12px">A new championship uses the next empty Cup slot (up to ten). If all slots are full, confirm before replacing the active Cup save. Career saves stay separate.</p>
 <div class="stat"><strong>COMPETITION SYSTEM</strong><span>${{league:'36 teams · eight matches · playoffs · knockout','regional-league':'32 teams · East and West league phases · knockout',groups:'Group matches · top-two qualifiers · knockout','short-groups':'Two groups of four · semifinals · final',knockout:'27-team seeded knockout · five byes'}[comp.format]}</span></div>
 <div class="stat"><strong>ROSTER STATUS</strong><span>12 players each · placeholders explicitly labelled</span></div>
 </div><div class="panel"><h3 class="titleSmall">FEATURED CLUBS</h3><div class="continentClubList">${ids.filter(i=>TEAMS[i].topSix).map(i=>`<div class="clubRow">${identity(i)}<div><strong>${escapeHTML(TEAMS[i].name)}</strong><div class="rosterMeta">${escapeHTML(countryCode(TEAMS[i])||'CLB')} · ${TEAMS[i].rank} OVERALL · ${roster(i).filter(p=>p.fictional).length} academy stand-ins</div></div></div>`).join('')}</div></div></div>`, 'continents');
}
// Browsers running a local QA fixture or privacy-restricted origin may forbid
// persistent storage entirely. Allow a match to continue in memory, but never
// swallow quota/corruption errors or pretend that an unsaved slot was retained.
let cupSaveVolatile=false;
function writeCupSlot(slot,tournament,name){
 try{const result=cupSlots.save(slot,tournament,name);cupSaveVolatile=false;return result;}
 catch(error){
  if(!/Persistent storage unavailable/.test(String(error?.message)))throw error;
  if(!cupSaveVolatile)console.warn('Cup progress is session-only: persistent storage unavailable.');
  cupSaveVolatile=true;
  return null;
 }
}
function startContinent(){const value=+$('continentClub').value;try{const fresh=createTournament(continentSelection,value,TEAMS,CONTINENTAL_TEAMS);const slot=cupSlots.firstEmpty()??cupSlots.active;if(cupSlots.list()[slot-1].occupied&&!confirm('All ten Cup slots are full. Overwrite active Cup slot '+slot+'?'))return;writeCupSlot(slot,fresh,confed(fresh.compId)?.name||'Cup '+slot);continentalRun=fresh;store.put('continentalRun',continentalRun);showTournament()}catch(e){alert('Could not start Cup: '+e.message)}}
function saveCup(){if(!continentalRun)return;writeCupSlot(cupSlots.active,continentalRun);store.put('continentalRun',continentalRun)}
function showTournament(){if(!continentalRun)return showContinents();const t=continentalRun,c=confed(t.compId),fx=tournamentCurrent(t),my=TEAMS[t.club],rank=tournamentStandings(t),position=rank.findIndex(x=>x.id===t.club)+1;
 const standingsHTML=rank.slice(0,Math.min(36,rank.length)).map((p,i)=>`<tr class="${p.id===t.club?'myTeam':''}"><td>${i+1}</td><td>${teamIdentity(TEAMS[p.id])} ${escapeHTML(TEAMS[p.id].name)}</td><td>${p.p}</td><td>${p.w}</td><td>${p.d}</td><td>${p.l}</td><td>${p.gf-p.ga}</td><td>${p.pts}</td></tr>`).join('');
 page('CONTINENTAL CAMPAIGN',`${c.name} · ${c.season} · ${my.name}`,
 `<div class="careerTop"><div class="metric"><small>YOUR CLUB</small><strong>${escapeHTML(my.name)}</strong></div><div class="metric"><small>COMPETITION</small><strong>${c.id}</strong></div><div class="metric"><small>LEAGUE POSITION</small><strong>#${position}</strong></div><div class="metric"><small>PRIZE EARNINGS</small><strong>${eur(t.earned)}</strong></div></div>
 <div class="twoCol"><div class="panel">${cupSaveVolatile?'<p role="status" class="muted">Temporary Cup session: browser storage is unavailable. Progress will be lost when this page closes.</p>':''}<div class="badge">${escapeHTML(tournamentProgress(t))}</div>
 <div class="fixture"><span>${t.phase==='finished'?'🏁 CAMPAIGN COMPLETE':fx?.bye?'🟢 BYE — AUTO ADVANCE':'⚽ NEXT MATCH'}</span><strong>${t.phase==='finished'?(t.winner===t.club?'🏆 CONTINENTAL CHAMPIONS!':'ELIMINATED — TRY AGAIN'):fx?.bye?'Automatic qualification':`${escapeHTML(my.name)} VS ${escapeHTML(TEAMS[fx?.opponent]?.name||'TBD')}`}</strong></div>
 <div class="row">${t.phase==='finished'?button('↻ NEW CAMPAIGN','continentPick_'+t.compId,'gold'):fx?.bye?button('➜ ADVANCE THROUGH BYE','continentBye','gold'):button('▶ PLAY CHAMPIONSHIP MATCH','continentKickoff','gold')}${button('ALL CONTINENTS','continents','minor')}${button('SAVE SLOTS','navCupSlots','minor')}</div>
 <div class="stat"><strong>CONTINENT'S TOP SIX</strong><span>${c.featured.split('|').map(escapeHTML).join(', ')}</span></div><div class="scroll" style="max-height:190px;margin-top:12px">${t.history.slice(0,18).map(h=>`<div class="stat"><strong>${escapeHTML(h.stage||'MATCHDAY '+h.round||'MATCH')}</strong><span>${h.kind==='bye'?'BYE':(TEAMS[h.a]?.name||'')+' '+(h.scoreA??'')+'–'+(h.scoreB??'')+' '+(TEAMS[h.b]?.name||'')}</span></div>`).join('')||'<div class="muted">No completed fixtures yet.</div>'}</div>
 </div><div class="panel"><h3 class="titleSmall">CONTINENTAL STANDINGS</h3><div class="scroll continentTable"><table class="miniTable"><thead><tr><th>#</th><th>CLUB</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th></tr></thead><tbody>${standingsHTML}</tbody></table></div><p class="muted">${t.phase==='league'?'Standings update after every complete arcade matchday.':'Knockout results determine elimination and trophy winners.'}</p></div></div>`, 'continents');
}
function continentKickoff(){const fx=tournamentCurrent(continentalRun);if(!fx||fx.bye)return showTournament();mode='continental';home=continentalRun.club;away=fx.opponent;start()}
function continentBye(){try{tournamentAdvance(continentalRun,TEAMS);saveCup();showTournament()}catch(e){alert('Cup autosave failed: '+e.message);showTournament()}}

function showGallery(){
 const japan=roster(0),ids=Object.entries(SHOTS);page('SUPER SHOT ENCYCLOPEDIA','Explore all 12 Japanese signature moves and the opposing countries’ team shots.',
 `<div class="shotGrid">${ids.map(([id,shot],i)=>{let hero=japan.find(p=>p.shot===id);let team=TEAMS.find(t=>t.shot===id);return `<div class="shotCard"><canvas class="shotArt" data-shot="${id}" width="120" height="95"></canvas><div><div class="rosterName">${escapeHTML(shot.name)}</div><div class="rosterMeta">${escapeHTML(hero?hero.name:team?team.name:'Special move')}</div><div class="rosterMeta">${escapeHTML(shot.behavior.toUpperCase())} · POWER ${Math.round(shot.impact*100)}%</div></div></div>`}).join('')}</div><p class="muted">Special-shot designs and physics are reconstructed and remain subject to reference-game fidelity work.</p>`);
 drawGallery();
}
function drawGallery(){document.querySelectorAll('.shotArt').forEach(c=>{let x=c.getContext('2d'),id=c.dataset.shot,shot=SHOTS[id];x.clearRect(0,0,c.width,c.height);let g=x.createRadialGradient(60,45,3,60,45,70);g.addColorStop(0,shot.color+'66');g.addColorStop(1,'#092b3a');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);x.save();x.translate(60,46);x.scale(1.15,1.15);renderer.drawTransformation(x,{...shot,id},performance.now()/1000);x.restore()})}
// v0.8.25.4: progressive pre-match setup. Primary screen is teams + kickoff;
// all existing rules, kits, talks and tactics live one level below.
function showSetup(newMode='quick'){
 mode=newMode;if(mode==='league')home=0;
 if(home===away)away=(away+1)%TEAMS.length;
 if(!filteredNations(homeCategory).some(([i])=>i===home))homeCategory='all';
 if(!filteredNations(awayCategory).some(([i])=>i===away))awayCategory='all';
 const label=mode==='versus'?'TWO-PLAYER VERSUS':mode==='training'?'TRAINING ARENA':mode==='pk'?'PENALTY SHOWDOWN':'MATCH SETUP';
 page(label,'Choose teams, then kick off. Optional settings are in the submenus.',
 `<div class="panel setupPrimary">
 <div class="row space setupStartRow"><span class="badge">CHOOSE YOUR TEAMS</span><div class="row"><span class="pill">${mode==='versus'?'TWO LOCAL PLAYERS':'VS CPU'}</span>${button('▶ KICK OFF','kickoff','gold')}</div></div>
 <div class="previewCombat"><div class="nationCard">${identity(home)}<canvas class="teamPortrait" id="homePortrait" width="190" height="175"></canvas><strong>${escapeHTML(TEAMS[home].name)}</strong><span class="nationSub" id="homeKitCaption">HOME • ATTACK →</span></div><div class="versusBadge">VS</div><div class="nationCard">${identity(away)}<canvas class="teamPortrait" id="awayPortrait" width="190" height="175"></canvas><strong>${escapeHTML(TEAMS[away].name)}</strong><span class="nationSub" id="awayKitCaption">← ATTACK • AWAY</span></div></div>
 <div class="selectors"><div>${field('HOME CATEGORY','homeGroup',categoryOptions,homeCategory)}${teamField('HOME TEAM','homeTeam',filteredNations(homeCategory),home)}</div><div>${field('AWAY CATEGORY','awayGroup',categoryOptions,awayCategory)}${teamField('AWAY TEAM','awayTeam',filteredNations(awayCategory),away)}</div></div>
 <div class="setupDigest"><span>⏱ ${opt.halfSeconds}s / half</span><span>☀ ${escapeHTML(opt.weather)}</span><span>🎯 ${escapeHTML(aiTuning(opt.difficulty).name)}</span><span>⚙ ${escapeHTML(opt.terrain)} pitch</span></div>
 </div>
 <div class="setupSubnav"><button class="btn setupSubButton" data-action="setupRules">⚙ Match rules <small>Weather, time, CPU</small></button><button class="btn setupSubButton" data-action="setupAppearance">🎨 Kits &amp; talks <small>Look and morale</small></button><button class="btn setupSubButton" data-action="setupTactics">♟ Team tactics <small>Formation &amp; lineup</small></button></div>
 <p class="setupControlsTip muted">P1: WASD move · K pass · J shoot · I dribble · Space jump${mode==='versus'?' · P2: arrows + mapped actions':''}</p>`, 'navOnDevice');
 paintTeamPreviews();
}
function paintBallPreview(){
 const canvas=$('ballPreview');if(!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 ctx.clearRect(0,0,canvas.width,canvas.height);
 const model=VISUALFEEL.validBallModel(opt.ballModel);
 renderer.drawSoccerBall(ctx,canvas.width/2,canvas.height/2,28,model,Math.PI*.17);
}
function showSetupExtras(section){
 const talks=Object.entries(TEAM_TALKS).map(([k,v])=>[k,v.name]);
 if(section==='rules'){
  page('MATCH RULES','Optional match conditions. Changes apply to your next kickoff.',
  `<div class="panel setupExtras">${field('WEATHER','weather',WEATHER.map(v=>[v,v]),opt.weather)}${field('PLAYING SURFACE','terrain',TERRAIN.map(v=>[v,v==='Classic'?'Classic · Weathered Famicom-style pitch':v]),opt.terrain)}${field('PITCH CONDITION','condition',CONDITIONS.map(v=>[v,v]),opt.condition)}${field('MATCH BALL','ballModel',VISUALFEEL.BALL_MODELS.map(v=>[v.id,v.name]),opt.ballModel)}<canvas id="ballPreview" class="ballPreview" width="100" height="76" aria-label="Preview of selected match ball"></canvas>${field('SECONDS PER HALF','halfSeconds',[60,120,180,300].map(v=>[v,v+' sec']),opt.halfSeconds)}${field('CPU DIFFICULTY','matchDifficulty',aiChoices(),opt.difficulty)}${field('CPU STRATEGY','aiStyle',['Balanced','Aggressive','Defensive'].map(v=>[v,v]),opt.aiStyle||'Balanced')}${difficultyHint()}<div class="row">${button('✓ DONE — BACK TO MATCH','returnSetup','gold')}</div></div>`, 'returnSetup');
 }else if(section==='appearance'){
  page('KITS & TEAM TALKS','Optional team colors and pre-match morale.',
  `<div class="panel setupExtras"><div class="kitChooser"><div class="kitSelector"><span class="kitDot" id="homeKitDot"></span>${field('HOME TEAM KIT','homeKit',[['home','HOME KIT'],['away','AWAY KIT']],kitSelections[0])}</div><div class="kitSelector"><span class="kitDot" id="awayKitDot"></span>${field('AWAY TEAM KIT','awayKit',[['home','HOME KIT'],['away','AWAY KIT']],kitSelections[1])}</div></div>${field('MATCH BALL DESIGN','ballModel',VISUALFEEL.BALL_MODELS.map(v=>[v.id,v.name]),opt.ballModel)}<canvas id="ballPreview" class="ballPreview" width="100" height="76" aria-label="Preview of selected match ball"></canvas><h3 class="titleSmall">Pre-match talks</h3><p class="muted">One talk per team. Player personalities respond differently.</p><div class="tacticsGrid">${field('HOME TEAM TALK','preTalkHome',talks,preTalkChoices[0])}${field('AWAY TEAM TALK','preTalkAway',talks,preTalkChoices[1])}</div><div class="row">${button('✓ DONE — BACK TO MATCH','returnSetup','gold')}</div></div>`, 'returnSetup');
  // A kit-only submenu does not render portraits; update swatches directly.
  for(const side of [0,1]){const dot=$(side?'awayKitDot':'homeKitDot');if(dot){const team=kitFor(TEAMS[side?away:home],kitSelections[side]);dot.style.background=team.primary;dot.style.borderColor=team.secondary;}}
 }else{
  page('TEAM TACTICS','Formation, lineup, captain, substitutions and tactical style are preserved.',
  `<div class="panel setupExtras"><p class="muted">Configure either team, then return to this match setup. Six approved formations remain available.</p><div class="row">${button('⚙ HOME TACTICS','prepHome')}${button('⚙ AWAY TACTICS','prepAway')}${button('← BACK TO MATCH','returnSetup','gold')}</div></div>`, 'returnSetup');
 }
 paintBallPreview();
}
function paintTeamPreviews(){for(const side of ['home','away']){
 const id=side==='home'?home:away,c=$(side+'Portrait');if(!c)continue;
 const ctx=c.getContext('2d'),team=kitFor(TEAMS[id],kitSelections[side==='home'?0:1]),r=roster(id),star=r[id===0?0:8]||r[0];
 const dot=$(side+'KitDot');if(dot){dot.style.background=team.primary;dot.style.borderColor=team.secondary;}
 const caption=$(side+'KitCaption');if(caption)caption.textContent=(side==='home'?'HOME • ATTACK →':'← ATTACK • AWAY')+' · '+team.kitLabel+' KIT';
 ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#13364b';ctx.fillRect(0,0,c.width,c.height);
 const glow=ctx.createRadialGradient(90,85,5,90,85,120);glow.addColorStop(0,team.primary+'aa');glow.addColorStop(1,'#092739');ctx.fillStyle=glow;ctx.fillRect(0,0,c.width,c.height);
 ctx.save();ctx.translate(87,162);ctx.scale(1.45,1.45);
 renderer.drawPlayer(ctx,{...game.player(0,3),t:0,i:3,x:0,y:0,src:star,face:side==='home'?1:-1,dx:.5,dy:0,z:0,anim:performance.now()/1300,action:'idle',controlled:false}, {getTeam:()=>team,options:{showNames:false}});
 ctx.restore();
 ctx.save();ctx.translate(153,36);ctx.scale(.47,.47);renderer.drawTransformation(ctx,{...SHOTS[team.shot],id:team.shot},1.5);ctx.restore();
 }}
function start(){if(mode==='versus')humans=2;else humans=1;game.init({home,away,mode,humans,rosters:[mode==='career'&&career?career.roster.map(p=>({...p})):roster(home),roster(away)],lineups:[planFor(home).lineup.slice(),planFor(away).lineup.slice()],formations:[planFor(home).formation,planFor(away).formation],plans:[planFor(home),planFor(away)],options:{...opt,kitChoices:kitSelections.slice()}});if(preTalkChoices[0]!=='none')game.applyTeamTalk(0,preTalkChoices[0],'pregame');if(preTalkChoices[1]!=='none')game.applyTeamTalk(1,preTalkChoices[1],'pregame');if(mode==='pk')game.startPK(false);closeMenu();drawHUD()}
function drawHUD(){let p=game.controlledPlayer(0),s=game.score;$('homeflag').innerHTML=identity(home);$('awayflag').innerHTML=identity(away);$('homename').textContent=TEAMS[home].name.toUpperCase();$('awayname').textContent=TEAMS[away].name.toUpperCase();$('scoring').innerHTML=`${s[0]} <span>:</span> ${s[1]}`;$('weatherHud').textContent=game.weather.toUpperCase();let secs=Math.max(0,Math.ceil(game.matchSeconds-game.clock));$('timeHud').textContent=`${game.half===1?'1ST':'2ND'} • ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;if(p){const inPossession=game.ball.owner?.t===0;const ownBall=game.ball.owner===p;const goalkeeperHasBall=game.ball.owner?.t===0&&game.ball.owner?.keeper;// v0.8.25: keep the exact four approved action labels on screen; defensive / keeper functions remain contextual.
  for(const [key,text] of Object.entries({pass:'PASS',shoot:'SHOOT',dribble:'DRIBBLE',jump:'JUMP'})){const b=document.querySelector('[data-act="'+key+'"]');if(b){if(b.textContent!==text)b.textContent=text;b.title=key==='pass'?(goalkeeperHasBall?'Pass / goalkeeper clear':inPossession?'Tap nearest · direction aim · hold long · Jump then Pass cross':'Pass / tackle'):key==='shoot'?(inPossession?'Shoot':'Shoot / slide tackle'):key==='dribble'?(inPossession?'Dribble':'Dribble / switch player'):'Jump';}}const dribbleButton=document.querySelector('[data-act="dribble"]');if(dribbleButton){
   const cd=Math.max(0,p.dribbleCooldown||0),cooling=cd>.02&&game.ball.owner===p;
   dribbleButton.classList.toggle('cooling',cooling);
   dribbleButton.dataset.cooldown=cooling?cd.toFixed(1)+'s':'';
   if(cooling)dribbleButton.title='Dribble ready in '+cd.toFixed(1)+' seconds';
  }
  $('playerTag').textContent=`#${p.src.num} ${p.src.name.toUpperCase()}  ·  ${(p.src.superAbility?.type==='defence'&&!game.ball.owner?p.src.superAbility.name:p.src.shotName).toUpperCase()}  · LV${abilityLevel(p,(p.src.superAbility?.type==='defence'&&!game.ball.owner)?'defence':'shot')}  ·  ${(p.src.superAbility?.type==='defence'&&!game.ball.owner?(p.abilityCd||0):p.specialCd)>0?'SUPER RECHARGING':'SUPER READY'}  ·  ${moodLabel(p.morale)} ${Math.round(p.morale)}%`;const staminaBar=$('staminaFill');if(staminaBar)staminaBar.style.width=Math.round(100*(1-(p.fatigue||0)))+'%';const staminaText=$('staminaText');if(staminaText)staminaText.textContent=`STAMINA ${Math.round(100*(1-(p.fatigue||0)))}%`;const meter=$('powerFill');if(meter)meter.style.width=Math.max(0,Math.min(100,100*Math.max(p.charge||0,game.input.held(p.t,'pass')?(p.passHold||0):0)/1.2))+'%';const superLabel=$('specialMeter');if(superLabel){let defensive=p.src.superAbility?.type==='defence'&&!game.ball.owner;let abilityCooldown=defensive?(p.abilityCd||0):p.specialCd;superLabel.textContent=(game.input.held(p.t,'pass')&&game.ball.owner?.t===p.t)?'PASS • HOLD TO EXTEND':defensive?(abilityCooldown>0?'DEF CD '+abilityCooldown.toFixed(1)+'s':'★ DEF READY'):(abilityCooldown>0?'RECHARGE '+abilityCooldown.toFixed(1)+'s':'★ READY');superLabel.classList.toggle('charging',abilityCooldown>0)}}}
function showLeague(){home=0;mode='league';let list=[10,9,11,12];away=league.stage==='finals'?list[Math.min(league.playoff||0,3)]:(league.played%12)+1;
 page('WORLD LEAGUE','Win at least 16 games and accumulate 70 points to qualify for four championship finals.',`<div class="twoCol"><div class="panel"><div class="titleSmall">JAPAN • ${league.stage.toUpperCase()}</div><div class="tripleCol">${[['WINS',league.wins],['POINTS',league.points],['GAMES',league.played]].map(([a,b])=>`<div class="panel" style="text-align:center"><div class="badge">${a}</div><div style="font-size:34px;color:#ffdd76;font-weight:900">${b}</div></div>`).join('')}</div><p class="muted">Qualification: 16 wins / 70 points. Finals: ${league.playoff||0} / 4 victories.</p><div class="stat"><span>NEXT OPPONENT</span><strong>${TEAMS[away].name}</strong></div><div class="row" style="margin-top:15px">${league.stage==='champion'?'<strong>🏆 CUP WON — CHAMPIONS!</strong>':button('▶ NEXT MATCH','leagueKickoff','gold')}${button('RESET SEASON','clearLeague')}</div></div><div class="panel"><div class="titleSmall">MATCH HISTORY</div><div class="scroll"><table class="miniTable"><thead><tr><th>Opponent</th><th>Result</th></tr></thead><tbody>${(league.games||[]).slice(0,20).map(g=>`<tr><td>${escapeHTML(g.team)}</td><td>${g.a} - ${g.b}</td></tr>`).join('')||'<tr><td colspan="2">No results yet.</td></tr>'}</tbody></table></div></div></div>`)}
// Read-only substitution hint: only GameEngine.applyPlan validates and commits swaps.
function substitutionAdviceForPause(game,side,plan,players){
 const remaining=Math.max(0,(game.maxSubstitutions??0)-(game.substitutionsUsed?.[side]??0));
 const wrap=message=>`<div id="substitutionAdvice" class="panel" role="status" aria-label="Substitution advice"><strong>BENCH FITNESS REVIEW</strong><p class="muted">${message}</p></div>`;
 if(!remaining)return wrap('All substitutions have been used. Keep the current lineup.');
 const onField=new Set(plan.lineup),ledger=game.fatigueLedger?.[side]||{};
 const unavailable=game.subbedOut?.[side]||new Set();
 const fatigue=id=>Math.max(0,Math.min(1,Number.isFinite(ledger[id])?ledger[id]:0));
 const matches=[];
 for(let slot=0;slot<plan.lineup.length;slot++){
  const starter=players[plan.lineup[slot]];
  if(!starter)continue;
  const tired=fatigue(starter.id);
  if(tired<.40)continue;
  for(let bench=0;bench<players.length;bench++){
   const replacement=players[bench];
   if(!replacement||onField.has(bench)||replacement.role!==starter.role||
      (replacement.injuryWeeks||0)>0||unavailable.has(replacement.id))continue;
   const fresh=fatigue(replacement.id);
   if(tired-fresh<.20)continue;
   matches.push({slot,bench,starter,replacement,tired,fresh,gain:tired-fresh});
  }
 }
 matches.sort((a,b)=>b.gain-a.gain||a.slot-b.slot||a.bench-b.bench);
 if(!matches.length)return wrap('No urgent eligible same-role swap. Review squad fitness before changing the lineup.');
 const best=matches[0],fit=value=>Math.round(100*(1-value));
 return wrap(`Suggested swap — slot ${best.slot+1} (${escapeHTML(best.starter.role)}): #${escapeHTML(String(best.starter.num))} ${escapeHTML(best.starter.name)} (FIT ${fit(best.tired)}%) → #${escapeHTML(String(best.replacement.num))} ${escapeHTML(best.replacement.name)} (FIT ${fit(best.fresh)}%). Select the bench player above and choose SAVE TACTICS to confirm. ${remaining} substitution${remaining===1?'':'s'} left.`);
}
// Advisory only: changing preview selectors must never apply/swap players or save.
function lineupRoleFitGuidance(players,slots,positions){
 const mismatches=[];
 let matched=0;
 for(let i=0;i<positions.length;i++){
  const player=players[slots[i]],assigned=positions[i];
  if(player?.role===assigned){matched++;continue;}
  const natural=player?.role||'unknown',name=player?.name||'unassigned';
  mismatches.push('slot '+(i+1)+' ('+assigned+'): '+name+' naturally '+natural+
   ' · position OVR '+playerOVR(player,assigned));
 }
 return 'LINEUP FIT '+matched+'/'+positions.length+' natural roles. '+
  (mismatches.length?'Review '+mismatches.join('; ')+'.':'All starters fit their assigned roles.')+
  ' Advice only; no changes are applied until SAVE TACTICS.';
}
function showSquad(side=0,origin='home'){
 squadReturnAtHalf=origin==='pause'&&screen==='HALF TIME';
 squadSide=side;squadContext=origin;
  // Both visible and keyboard/gamepad Back return to the actual entry menu.
  const squadBackAction=origin==='setup'?'returnSetup':origin==='pause'?'returnPause':menuEntryReturn;
 const index=origin==='pause'?game.teamIds[side]:side===0?home:away;
 const team=TEAMS[index],players=origin==='pause'?game.rosters[side]:roster(index);
 const plan=origin==='pause'?safePlan(game.teamPlans[side],players,index):planFor(index);
 const order=['GK','DF','DF','MF','FW','FW'];
 const memberOptions=players.map((p,i)=>[i,`#${p.num} ${p.name} · ${p.role} · OVR ${playerOVR(p)}${p.legendaryRating?` · LEG ${p.legendaryRating}`:''}`]);
 const fieldPlayerOptions=plan.lineup.map(i=>memberOptions[i]);
 const roleOptions=players.map((p,i)=>[i,`${plan.lineup.includes(i)?'●':'○'} #${p.num} ${p.name}`]);
 page('TEAM COMMAND CENTER',`${team.name} — edit formation, starting six, captain, set pieces and tactics ${origin==='pause'?'while the game is paused':'before kickoff'}.`,
 `<div class="squadHeader">${identity(index)}<strong>${escapeHTML(team.name)}</strong><span>${origin==='pause'?'LIVE TACTICS':'PREGAME PLAN'} · 6 ON FIELD / 6 BENCH</span></div><div class="twoCol"><div class="panel"><h3 class="titleSmall">FORMATION & LINEUP</h3>${field('FORMATION','formation',Object.keys(FORMATIONS).map(v=>[v,v]),plan.formation)}<div class="formationPitch" id="formationPitch" aria-label="Six-player formation with cartoon player faces"></div><p class="muted">OVR is the rounded mean of six position-relevant stats (1–100). Formation OVR is for the assigned position, not necessarily the player’s natural role. Five outfield players + goalkeeper.</p>
 ${plan.lineup.map((id,i)=>`<div class="lineupRow"><strong>${order[i]}</strong>${choice('pos'+i,(i===0?memberOptions.filter(([j])=>players[j].role==='GK'):memberOptions.filter(([j])=>players[j].role!=='GK')),id)}<span class="positionOvr" data-lineup-ovr="${i}" aria-label="Position overall rating">OVR ${playerOVR(players[id],order[i])}</span></div>`).join('')}
  <p id="lineupRoleFit" class="muted" role="status" aria-live="polite" aria-label="Lineup position fit guidance"></p>
 <p class="muted">${origin==='pause'?`SUBSTITUTIONS: <b>${game.substitutionsUsed[side]} / ${game.maxSubstitutions}</b> used. Only ${game.maxSubstitutions} changes allowed; substituted-off players cannot return.`:'Before kickoff, choose any six starters. During play, use Pause to substitute up to three players.'} Substitutes enter with their own fitness; exhausted players lose speed, precision and tackling strength.</p>
 ${origin==='pause'?substitutionAdviceForPause(game,side,plan,players):''}
 <h3 class="titleSmall">LEADERSHIP & SET PIECES</h3><div class="tacticsGrid">${[['captain','CAPTAIN'],['penalty','PENALTY KICKS'],['freeKick','FREE KICKS'],['corner','CORNERS']].map(([key,label])=>`<div>${field(label,'role_'+key,key==='captain'?fieldPlayerOptions:roleOptions,plan[key])}</div>`).join('')}</div>
 <h3 class="titleSmall">TEAM INSTRUCTIONS</h3><div class="tacticsGrid"><div>${field('ATTACKING STYLE','attackStyle',ATTACK_STYLES.map(v=>[v,v]),plan.attack)}</div><div>${field('DEFENSIVE STYLE','defenceStyle',DEFENCE_STYLES.map(v=>[v,v]),plan.defence)}</div></div>
 <p class="muted">Possession prioritizes passes; Direct pushes forward and shoots earlier. High Press closes down faster; Deep Block holds positions. Captain boosts team passing slightly. Penalty taker accuracy affects shootouts. Free-kick/corner roles are saved, but those restart mechanics are not yet playable.</p>
 <div class="row">${button('✓ SAVE TACTICS','saveSquad','gold')}${button('RESTORE DEFAULT','resetSquad')}${button('← BACK',squadBackAction)}</div></div><div class="panel"><h3 class="titleSmall">12-PLAYER ROSTER · POSITION OVR</h3><div class="roster">${players.map((p,i)=>`<div class="rosterCard ${plan.lineup.includes(i)?'startingPlayer':''}"><canvas class="portrait playerFaceCanvas" width="80" height="88" data-squad-avatar="${i}" role="img" aria-label="Cartoon face of ${escapeHTML(p.name)}"></canvas><div><div class="rosterName">${plan.lineup.includes(i)?'● STARTING ':'○ BENCH '}#${p.num} ${escapeHTML(p.name)}</div><div class="rosterMeta"><span class="ovrBadge" title="Calculated from six ${p.role} attributes">${p.role} OVR ${playerOVR(p)}</span>${p.legendaryRating?` · <span class="ovrBadge" title="User-selected all-time legendary card rating (not the calculated position OVR)">LEG ${p.legendaryRating}</span>`:''}${BPWPERSONALITY.profileFor(p)?` · <span class="personalityBadge" title="Individual arcade animation style (editorial, not historical motion capture)">✦ ${escapeHTML(BPWPERSONALITY.profileFor(p).label)}</span>`:''} · ${origin==='pause'?`FIT ${Math.round(100*(1-(game.fatigueLedger[side][p.id]??0)))}% · `:`CON ${p.condition??100}% · `}STA ${p.stamina} · DEF ${p.defence} · SPD ${p.speedRating} · AGI ${p.agility} · DRB ${p.dribbling}</div>${playerAbilityIcons(p)}<div class="rosterMeta">SHOT ${p.shootPower}/${p.shootAccuracy} · HEAD ${p.heading} · PASS ${p.passing} · CROSS ${p.crossing} · STYLE ${escapeHTML(p.dribbleType||'sideStep')}</div><div class="rosterMeta">${p.role==='GK'?`GK DIVING ${p.gkDiving} · GK SKILL ${p.gkSkill} · `:''}ABILITY ${escapeHTML(p.superAbility?.name||'NONE')} · SUPER SHOT LV${abilityLevel(p,'shot')} · DEF LV${p.superAbility?.type==='defence'?abilityLevel(p,'defence'):'—'} · GK LV${p.gkSuperAbility?abilityLevel(p,'keeper'):'—'}</div></div></div>`).join('')}</div></div></div>`,squadBackAction);
 refreshFormationPreview();
}
// v0.8.25.22: canvas previews share a conservative character framing model.
// The legacy small thumbnails placed the player's feet outside the visible canvas.
function portraitFit(width,height,appearance={},action='idle'){
 const w=Math.max(1,Number(width)||1),h=Math.max(1,Number(height)||1);
 const padding=Math.max(4,Math.min(w,h)*.042);
 const style=((Number(appearance?.style)||0)%13+13)%13;
 const tallHair=style===7||style===10||style===11?12:style===4||style===5?7:0;
 const stature=Number(appearance?.stature)||2,exaggeration=Number(appearance?.exaggeration)||1;
 const diving=action==='keeperDive'||action==='keeperDiveCatch';
 const sliding=action==='slide';
 const jumping=['header','superHead','jump','flyingKick','bicycle','superBicycle'].includes(action);
 // Diving reaches downward as well as sideways; reserve additional lower space rather than cutting off gloves or feet.
 const lowerRoom=12+(diving?78:sliding?28:0);
 const headroom=145+tallHair+Math.max(0,stature-2)*8+Math.max(0,exaggeration-1)*11+(diving?126:sliding?33:jumping?65:0);
 const reach=124+(diving?165:sliding?25:0);
 const scale=Math.min(2,(w-2*padding)/reach,(h-2*padding)/headroom);
 return {x:w/2,y:h-padding-lowerRoom*scale,scale};
}
// v0.8.25.24: fit keeper preview from the *visible pose*, not a generic standing estimate.
// The offscreen alpha bounds exclude the UI background and the action label. This affects
// Player Studio rendering only: no match movement, collisions or goalkeeper physics change.
function drawFittedKeeperStudioPose(ctx,width,height,player,team){
 const scratch=document.createElement('canvas');scratch.width=400;scratch.height=400;
 const sc=scratch.getContext('2d',{willReadFrequently:true});
 if(!sc)return false;
 const positioned={...player,x:200,y:265,preview:true,controlled:false};
 renderer.drawPlayer(sc,positioned,team);
 const data=sc.getImageData(0,0,400,400).data;
 let minX=400,minY=400,maxX=-1,maxY=-1,painted=0;
 // Two-pixel stride is sufficient for a stable envelope and avoids an expensive full scan.
 for(let y=0;y<400;y+=2)for(let x=0;x<400;x+=2){
  if(data[(y*400+x)*4+3]<30)continue;
  if(x<minX)minX=x;if(x>maxX)maxX=x;
  if(y<minY)minY=y;if(y>maxY)maxY=y;painted++;
 }
 if(painted<150||maxX<=minX||maxY<=minY)return false;
 // Bound both dimensions, leaving a quiet margin around gloves, hair and boots.
 const margin=Math.max(10,Math.min(width,height)*.075),footer=Math.max(19,height*.10);
 const sw=maxX-minX+4,sh=maxY-minY+4;
 const scale=Math.min(2.65,(width-margin*2)/sw,(height-margin-footer)/sh);
 const cx=(minX+maxX)*.5,cy=(minY+maxY)*.5;
 ctx.save();ctx.translate(width*.5-scale*cx,(height-footer+margin)*.5-scale*cy);ctx.scale(scale,scale);
 ctx.drawImage(scratch,0,0);ctx.restore();
 return {scale,painted,bounds:[minX,minY,maxX,maxY]};
}
function drawTeamFace(canvas,player,teamIndex){if(!canvas||!player)return;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);const gradient=ctx.createLinearGradient(0,0,0,canvas.height);gradient.addColorStop(0,'#347885');gradient.addColorStop(1,'#102d44');ctx.fillStyle=gradient;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();const fit=portraitFit(canvas.width,canvas.height,player.appearance||{});ctx.translate(fit.x,fit.y);ctx.scale(fit.scale,fit.scale);renderer.drawPlayer(ctx,{...game.player(0,3),src:player,team:0,i:0,x:0,y:0,z:0,t:0,face:1,dx:0,dy:0,anim:0,action:'idle',controlled:false,preview:true},{getTeam:()=>TEAMS[teamIndex],options:{showNames:false}});ctx.restore();}
function refreshFormationPreview(){const board=$('formationPitch');if(!board)return;const teamIndex=squadContext==='pause'?game.teamIds[squadSide]:squadSide===0?home:away;const players=squadContext==='pause'?game.rosters[squadSide]:roster(teamIndex);const key=$('formation')?.value||'2-1-2';const labels={'2-1-2':['GK','DF','DF','MF','FW','FW'],'1-2-2':['GK','DF','MF','MF','FW','FW'],'2-2-1':['GK','DF','DF','MF','MF','FW'],'1-3-1':['GK','DF','MF','MF','MF','FW'],'1-1-3':['GK','DF','MF','FW','FW','FW'],'3-1-1':['GK','DF','DF','DF','MF','FW']}[key]||['GK','DF','DF','MF','FW','FW'];menu.querySelectorAll('.lineupRow>strong').forEach((node,i)=>node.textContent=labels[i]||'MF');const positions=FORMATIONS[key]||FORMATIONS['2-1-2'];const slots=Array.from({length:6},(_,i)=>Number($('pos'+i)?.value));menu.querySelectorAll('[data-lineup-ovr]').forEach((badge,i)=>{badge.textContent='OVR '+playerOVR(players[slots[i]],labels[i]);badge.title='Calculated for '+labels[i]+' position';});const guidance=$('lineupRoleFit');if(guidance)guidance.textContent=lineupRoleFitGuidance(players,slots,labels);board.innerHTML=positions.map((pos,i)=>`<div class="formationSlot" style="left:${Math.round(pos.x*100)}%;top:${Math.round(pos.y*100)}%" title="${escapeHTML(players[slots[i]]?.name||'Player')}"><canvas width="86" height="90" data-formation-avatar="${slots[i]}" aria-label="${escapeHTML(players[slots[i]]?.name||'Player')} face" role="img"></canvas><small>${escapeHTML((players[slots[i]]?.name||'Player').split(' ').slice(-1)[0])}</small><span class="formationOvr" aria-label="${labels[i]} overall rating ${playerOVR(players[slots[i]],labels[i])}">${labels[i]} ${playerOVR(players[slots[i]],labels[i])}</span></div>`).join('');menu.querySelectorAll('[data-squad-avatar],[data-formation-avatar]').forEach(canvas=>{const j=Number(canvas.dataset.squadAvatar??canvas.dataset.formationAvatar);drawTeamFace(canvas,players[j],teamIndex)});}

const SAVE_KEYS=Object.freeze(['customClubs','managerCareer','careerSlots','cupSlots','continentalRun','options','league','lineup','edits','teamPlans','controllerBindings','kitSelections','audioOptions']);
// Reject structurally corrupt imports before confirmation or any storage mutation.
// Legacy and newer exports can omit keys. Null means 'preserve current value'.
function validateSaveImport(payload){
 if(!payload||typeof payload!=='object'||Array.isArray(payload)||
    !['Supermagic Football','Nekketsu Legends HD'].includes(payload.product)||
    !payload.data||typeof payload.data!=='object'||Array.isArray(payload.data))throw Error('Not a Supermagic Football save file');
 const data=payload.data, changes=[];
 for(const key of SAVE_KEYS){
  if(!Object.hasOwn(data,key)||data[key]===null)continue;
  const value=data[key],array=['customClubs','lineup','kitSelections'].includes(key);
  if(array?!Array.isArray(value):(!value||typeof value!=='object'||Array.isArray(value)))throw Error('Invalid save section: '+key);
  if(key==='customClubs'&&(value.length>128||value.some(t=>!t||typeof t!=='object'||typeof t.id!=='string'||!t.id.startsWith('club_')||typeof t.name!=='string'||!Array.isArray(t.customRoster)||t.customRoster.length!==12)))throw Error('Invalid custom club data');
  if(key==='lineup'&&(value.length!==6||value.some(n=>!Number.isInteger(n)||n<0||n>10000)||new Set(value).size!==6))throw Error('Invalid lineup');
  if(key==='kitSelections'&&(value.length!==2||value.some(k=>k!=='home'&&k!=='away')))throw Error('Invalid kit selections');
  if(key==='careerSlots'&&!CAREER_SLOTS.validVault(value))throw Error('Invalid Career save slots');
  if(key==='cupSlots'&&!CUP_SLOTS.validVault(value))throw Error('Invalid Cup save slots');
   if(key==='managerCareer'&&(!Number.isInteger(value.club)||!Array.isArray(value.members)||!Array.isArray(value.fixtures)||!Array.isArray(value.history)||!Array.isArray(value.roster)||value.roster.length!==12||!value.table||typeof value.table!=='object'||!value.facilities||typeof value.facilities!=='object'||!value.cup||typeof value.cup!=='object'||!Number.isFinite(value.cash)||!Number.isInteger(value.week)))throw Error('Invalid manager career');
  if(key==='continentalRun'&&(!Array.isArray(value.participants)||!['league','knockout','finished'].includes(value.phase)))throw Error('Invalid continental cup');
  if(key==='league'&&(!Array.isArray(value.games)||!Number.isFinite(value.played)))throw Error('Invalid league history');
  changes.push([key,JSON.stringify(value)]);
 }
 if(changes.length===0)throw Error('No importable save sections');
 return changes;
}
// localStorage has no transaction API. Stage/validate all entries first and
// restore the original values if a synchronous write fails. Never claim success
// if setItem throws (unlike the normal best-effort autosave store.put helper).
function commitSaveImport(changes,storage){
 // Keep a raw pre-image before any write; never trust autosave's silent errors.
 const previous=changes.map(([key])=>[key,storage.getItem('legend_'+key)]);
 let attempted=-1;
 try{
  for(let i=0;i<changes.length;i++){
   attempted=i;
   const [key,json]=changes[i],slot='legend_'+key;
   storage.setItem(slot,json);
   // Some storage shims silently discard writes. Readback avoids false success.
   if(storage.getItem(slot)!==json)throw Error('Save section not retained: '+key);
  }
 }catch(e){let rollbackFailed=false;
  // Include the *failing* write: a storage adapter may mutate and then throw.
  for(let i=attempted;i>=0;i--){const [key,prior]=previous[i],slot='legend_'+key;
   try{if(prior===null)storage.removeItem(slot);else storage.setItem(slot,prior);
    if(storage.getItem(slot)!==prior)rollbackFailed=true;
   }catch{rollbackFailed=true}
  }
  throw Error('Save could not be stored'+(rollbackFailed?' and automatic rollback was incomplete':' (changes rolled back)'));
 }
 return changes.length;
}
function exportSave(){const keys=SAVE_KEYS;const data={product:'Supermagic Football',version:RELEASE.version,exportedAt:new Date().toISOString(),data:Object.fromEntries(keys.map(k=>[k,store.get(k,null)]))};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Supermagic_Football_Save_'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}
async function importSave(file){try{
 if(!file||file.size>5_000_000)throw Error('Save file missing or larger than 5MB');
 const changes=validateSaveImport(JSON.parse(await file.text()));
 if(!confirm(`Import ${changes.length} save sections? This will REPLACE matching local progress. Export a backup first. Continue?`))return;
 commitSaveImport(changes,localStorage);
 alert('Save imported. Game will reload to apply the new progress.');location.reload();
 }catch(e){alert('Could not import save: '+e.message)} }

function showControls(){
 const bindings=input.getBindings(),codes=['KeyJ','KeyK','KeyI','KeyL','KeyQ','KeyE','KeyF','KeyG','KeyH','KeyU','KeyO','Space','Digit1','Digit2','Numpad0','Numpad1','Numpad2','Numpad3','NumpadDecimal','ControlRight','Comma','Period','Slash'];
 const names={Space:'SPACE',ControlRight:'RIGHT CTRL',NumpadDecimal:'NUMPAD DECIMAL'};
 const actions=['pass','shoot','dribble','jump'];
 const keyFields=(suffix,values)=>actions.map((a,i)=>field(a.toUpperCase(),'bindKey'+suffix+i,codes.map(k=>[k,names[k]||k.replace('Key','')]),values[i])).join('');
 const padFields=(suffix,values)=>actions.map((a,i)=>field(a.toUpperCase(),'bindPad'+suffix+i,Array.from({length:8},(_,n)=>[n,'BUTTON '+n+(n===0?' / A':n===1?' / B':n===2?' / X':n===3?' / Y':'')]),values[i])).join('');
 page('CONTROLLER MAPPING','Each player can remap four actions separately. The phone touchscreen stays a fixed four-button cross.',`<div class="twoCol"><div class="panel"><h3 class="titleSmall">PLAYER 1 · KEYBOARD</h3>${keyFields('',bindings.keyboard)}<h3 class="titleSmall">PLAYER 1 · GAMEPAD</h3>${padFields('',bindings.gamepad)}</div><div class="panel"><h3 class="titleSmall">PLAYER 2 · KEYBOARD</h3>${keyFields('2',bindings.keyboard2)}<h3 class="titleSmall">PLAYER 2 · GAMEPAD</h3>${padFields('2',bindings.gamepad2)}<p class="muted">Keys cannot overlap between players. Movement directions remain fixed. Connect two controllers for local versus.</p></div></div><div class="row">${button('SAVE BINDINGS','saveBindings','gold')}${button('RESTORE DEFAULTS','resetBindings')}${button('BACK TO INPUT SETTINGS','navInput')}</div>`,'navInput');
}
function showSettingsSection(section){
 const opts={
 game:{id:'nav-settings-game',title:'GAME SETTINGS',subtitle:'CPU, match rules and environment.',fields:`${field('CPU DIFFICULTY','difficulty',aiChoices(),opt.difficulty)}${difficultyHint()}${field('MATCH PACE','gameSpeed',[[0.8,'Relaxed / 80%'],[1,'Normal / 100%'],[1.15,'Fast / 115%']],opt.gameSpeed||1)}${field('HALF LENGTH','settingsDuration',[60,120,180,300].map(v=>[v,v+' sec']),opt.halfSeconds)}${field('WEATHER','settingsWeather',WEATHER.map(v=>[v,v]),opt.weather)}${field('TERRAIN','settingsTerrain',TERRAIN.map(v=>[v,v]),opt.terrain)}${field('CONDITION','settingsCondition',CONDITIONS.map(v=>[v,v]),opt.condition)}`},
 graphics:{id:'nav-settings-graphics',title:'GRAPHICS',subtitle:'Camera and display settings.',fields:`${field('CAMERA','camera',[['Follow','Follow the ball'],['Wide','Wide center view']],opt.camera)}${field('BALL DESIGN','ballModel',VISUALFEEL.BALL_MODELS.map(v=>[v.id,v.name]),opt.ballModel)}<canvas id="ballPreview" class="ballPreview" width="100" height="76" aria-label="Preview of selected match ball"></canvas>${field('SHOW PLAYER NAMES','showNames',[['true','Yes'],['false','No']],String(opt.showNames))}${field('PERFORMANCE HUD','showPerformance',[['false','Off (default)'],['true','Show live FPS / frame time']],String(opt.showPerformance===true))}<div class="row">${button('⛶ TOGGLE FULLSCREEN','fullscreen','minor')}</div><p class="muted">Fullscreen and screen rotation support depends on your browser and device. Visual effects remain built into the game.</p>`},
 sound:{id:'nav-settings-sound',title:'SOUND',subtitle:'Original offline music, sound effects and crowd.',fields:`${field('MASTER MUTE','audioMute',[['false','Sound on'],['true','Mute all']],String(audio.settings.mute))}${['master','music','sfx','ui','ambience'].map(k=>`<label class="fieldLabel" for="audio_${k}">${k.toUpperCase()} VOLUME <output id="audio_${k}Value">${audio.settings[k]}%</output></label><input type="range" id="audio_${k}" min="0" max="100" step="5" value="${audio.settings[k]}" aria-label="${k} volume" style="width:100%"/>`).join('')}<p class="muted">Audio begins after interacting with the page. No internet or external samples needed.</p>`}
 };
 const cfg=opts[section];if(!cfg)return showSettingsMenu();const back=menuEntryReturn==='returnPause'?'returnPause':'navSettings';menuBackAction=back;
 show(`<div class="navScreen"><div class="row space navHeader"><div><div class="topline">SUPERMAGIC FOOTBALL · SETTINGS</div><h1 class="heading">${cfg.title}</h1><p class="subtitle">${cfg.subtitle}</p></div>${button('← BACK',back,'minor')}</div><div class="panel navSettingsFields">${cfg.fields}<div class="row navSaveRow">${button('✓ SAVE CHANGES','saveSettings','gold')}</div></div></div>`,cfg.id);paintBallPreview();
}
function showHelp(){page('CONTROLS','Exactly four football action buttons: Pass, Shoot, Dribble and Jump.',`<div class="twoCol"><div class="panel"><h3 class="titleSmall">PLAYER 1</h3>${[['Move','WASD / arrow keys in one-player mode / left stick'],['PASS','K / gamepad B'],['SHOOT','J / gamepad A'],['DRIBBLE','I / gamepad X'],['JUMP','Space / gamepad Y'],['Pause (menu only)','Esc / P / controller Start']].map(([a,b])=>`<div class="stat"><strong>${a}</strong><span>${b}</span></div>`).join('')}</div><div class="panel"><h3 class="titleSmall">PLAYER 2</h3>${[['Move','Arrow keys or keypad 8-4-5-6 / second left stick'],['PASS','Period / gamepad B'],['SHOOT','Comma / gamepad A'],['DRIBBLE','Keypad Decimal / gamepad X'],['JUMP','Right Ctrl / gamepad Y']].map(([a,b])=>`<div class="stat"><strong>${a}</strong><span>${b}</span></div>`).join('')}<p class="muted">There are NO separate Special, Switch, Sprint or goalkeeper-dive buttons. During normal matches goalkeepers defend automatically. In two-player penalty shootouts, the defending player steers the keeper and taps JUMP to dive. Remap the same four actions in Settings → Remap Controls.</p></div></div>
<div class="twoCol" style="margin-top:18px"><div class="panel"><h3 class="titleSmall">WHEN YOU HAVE THE BALL</h3>${[['Tap PASS (no direction)','Pass to closest teammate'],['PASS + direction','Kick in that exact direction'],['Hold PASS, then release','Longer, faster pass (hold duration sets power)'],['First JUMP; while airborne press PASS','Cross (sequence matters)'],['PASS first, then JUMP','NOT a cross. PASS release determines the pass; JUMP remains a jump'],['Tap SHOOT','Normal shot'],['Hold SHOOT, then release','Charged shot'],['JUMP then SHOOT while carrying','Elevated normal shot'],['Double JUMP then SHOOT while carrying','Super Shot (or stronger normal shot without ability)'],['Tap DRIBBLE','Dribble dash'],['Dribble near an opponent','Automatic personal trick; both moves have 2s cooldown'],['JUMP then DRIBBLE near a loose aerial ball','Normal bicycle kick'],['JUMP then two DRIBBLE taps near an aerial ball','Super Bicycle (same special power and ball visuals as Super Shot)'],['JUMP then SHOOT near a loose aerial ball','Normal header'],['JUMP then two SHOOT taps near an aerial ball','Super Header (same power and ball visuals as Super Shot)'],['Hold DRIBBLE 0.26s, then press JUMP','Lift ball above player without jumping'],['Release DRIBBLE; JUMP, then tap DRIBBLE twice','Super Bicycle from lifted ball; non-specialists use boosted ordinary shot'],['Tap JUMP','Jump / jump again while airborne'],['Hold JUMP + direction','Run with ball (no jump on a long hold)']].map(([a,b])=>`<div class="stat"><strong>${a}</strong><span>${b}</span></div>`).join('')}</div><div class="panel"><h3 class="titleSmall">WHEN YOU DO NOT HAVE THE BALL</h3>${[['Tap PASS','Standing tackle'],['Hold PASS','Chase opponent'],['Tap SHOOT','Short bounded slide tackle (max 148 field units)'],['Tap DRIBBLE','Change controlled player'],['Tap JUMP','Jump'],['Hold JUMP + direction','Sprint while defending'],['JUMP + SHOOT','Defensive flying kick'],['Second JUMP, then SHOOT','Defensive bicycle kick'],['Goalkeeper','Autonomously positions, dives and saves'],['Goalkeeper holding ball; safe teammates','Short accurate distribution'],['Goalkeeper under pressure / blocked pass','Automatic long clearance']].map(([a,b])=>`<div class="stat"><strong>${a}</strong><span>${b}</span></div>`).join('')}</div></div>
<p class="muted">Removed from normal-match human controls: teammate launch → flip kick, reverse-order PASS+JUMP cross, separate goalkeeper-dive, Special, Switch and Sprint buttons. In two-player penalties the existing JUMP controls the keeper dive. Now playable: Hold Dribble then Jump for a stationary loft; release Dribble, Jump, then tap Dribble twice near the airborne ball to execute Super Bicycle. Super Shot, Super Header and Super Bicycle share power and transformation effects for eligible players.</p>`)}

function showEditor(){page('PLAYER DATA EDITOR','Edit your own 12-player team roster in JSON. Every player can change shot and stats.',`<div class="twoCol"><div class="panel">${teamField('SELECT TEAM','editTeam',nations(),home)}<label class="fieldLabel">TEAM PLAYER DEFINITIONS</label><textarea id="jsonRoster" style="width:100%;height:280px;padding:12px;background:#061625;color:#c5eaff;border:1px solid #90bbcb;border-radius:9px;touch-action:pan-y" spellcheck="false">${escapeHTML(JSON.stringify(roster(home),null,2))}</textarea><div class="row" style="margin-top:12px">${button('✓ APPLY','importRoster','gold')}${button('⬇ EXPORT','exportRoster')}</div></div><div class="panel"><h3 class="titleSmall">EDITABLE ENGINE</h3><p class="muted">Individual player data includes the fourteen 1–100 ratings: stamina, strength, aggression, defence, speedRating, agility, dribbling, shootPower, shootAccuracy, heading, passing, crossing, gkDiving, gkSkill. dribbleType selects one of ten gameplay-distinct tricks. superAbility and gkSuperAbility hold optional unique move definitions. superShotLevel, superDefenceLevel and gkSuperLevel can explicitly override arcade strength tiers (1–5); top tiers are reserved for a small editorial star shortlist. Existing legacy power, shoot, defense, speed are retained for compatibility. The same engine is intended to support new clubs, abilities and growth later.</p><p class="muted">Available super shots: ${Object.keys(SHOTS).join(', ')}.</p><p class="muted">The source code is included in the ZIP for extensions. Online play, the career economy and custom competition designer are future work—not currently playable.</p></div></div>`)}

const eur=n=>'€'+(n/1000000).toFixed(1)+'m';
const saveCareer=()=>{if(!career)return;try{careerSlots.save(careerSlots.active,career);store.put('managerCareer',career);}catch(error){alert('Career autosave failed: '+error.message);}};
// Pre-match natural-role suitability: advisory only; no plan/roster/save writes.
// Fixed starting-six slots reflect the game's existing six-player role assignment.
// Keep this independent from the existing injury/fitness replacement report.
function careerLineupRoleFitPanel(c){
 if(!Number.isInteger(c?.club)||!Array.isArray(c?.roster))return '';
 const lineup=planFor(c.club)?.lineup,slots=['GK','DF','DF','MF','FW','FW'];
 if(!Array.isArray(lineup)||lineup.length!==6||new Set(lineup).size!==6||
  lineup.some(i=>!Number.isInteger(i)||i<0||!c.roster[i]))return '';
 const squad=c.roster,selected=new Set(lineup),reserved=new Set();
 const fitness=p=>{const n=p?.condition==null?100:Number(p.condition);return Number.isFinite(n)?Math.max(0,Math.min(100,n)):0;};
 const mismatches=lineup.map((index,slot)=>({index,slot,expected:slots[slot],p:squad[index]}))
  .filter(x=>x.p.role!==x.expected);
 const matched=6-mismatches.length;
 if(!mismatches.length)return '<div id="careerLineupRoleFit" aria-label="Starting lineup natural-position suitability"><p class="muted"><strong>ROLE FIT: 6/6</strong> natural positions. Your projected starting six matches its assigned roles.</p></div>';
 const details=mismatches.slice(0,3).map(({p,slot,expected})=>{
  const ready=squad.map((q,i)=>({q,i})).filter(({q,i})=>
   q&&!selected.has(i)&&!reserved.has(i)&&q.role===expected&&
   !(Number(q.injuryWeeks)>0)&&fitness(q)>=60);
  ready.sort((a,b)=>fitness(b.q)-fitness(a.q)||
   playerOVR(b.q,expected)-playerOVR(a.q,expected)||a.i-b.i);
  const replacement=ready[0];
  if(replacement)reserved.add(replacement.i);
  const advice=replacement
   ?`Consider ${escapeHTML(String(replacement.q.name||'Reserve'))} (${Math.round(fitness(replacement.q))}% fit) for the ${expected} role.`
   :`No match-ready natural ${expected} reserve available.`;
  return `<p class="muted" data-role-fit-slot="${slot}"><strong>Slot ${slot+1} ${expected}:</strong> ${escapeHTML(String(p.name||'Player'))} naturally plays ${escapeHTML(String(p.role||'?'))}. ${advice}</p>`;
 }).join('');
 return `<div id="careerLineupRoleFit" aria-label="Starting lineup natural-position suitability">
  <h3 class="titleSmall">📋 STARTING SIX · ROLE FIT ${matched}/6</h3>
  ${details}
  ${mismatches.length>3?`<p class="muted">+${mismatches.length-3} additional role mismatches to review.</p>`:''}
  <p class="muted">Natural-position advice only. Review Squad &amp; Tactics before kickoff; no automatic changes.</p>
 </div>`;
}
// Read-only pre-kickoff scouting. No AI odds, plan edits, or career writes.
function careerOpponentScoutPanel(c,fx){
 if(!fx||!Number.isInteger(fx.opponent)||!TEAMS[fx.opponent])return '';
 const opponent=TEAMS[fx.opponent],oppRoster=roster(fx.opponent);
 const starters=planFor(fx.opponent).lineup.map(i=>oppRoster[i]).filter(Boolean);
 const average=role=>{
  const vals=starters.filter(p=>p.role===role).map(p=>playerOVR(p,role)).filter(Number.isFinite);
  return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;
 };
 const attack=average('FW'),defence=average('DF'),keeper=average('GK');
 const threat=starters.filter(p=>p.role!=='GK').map(p=>({p,ovr:playerOVR(p)}))
  .filter(q=>Number.isFinite(q.ovr)).sort((a,b)=>b.ovr-a.ovr)[0];
 const table=fx.kind==='league'?c.table?.[fx.opponent]:null;
 const safe=x=>Number.isFinite(x)&&x>=0?Math.trunc(x):0;
 const played=table?safe(table.p):0,wins=table?safe(table.w):0,draws=table?safe(table.d):0;
 const record=table&&played?`${played} played · ${wins}W ${draws}D ${Math.max(0,played-wins-draws)}L`:'No league matches recorded';
 const recommendation=attack!==null&&defence!==null&&attack>=defence+6
  ?'Contain the forwards: consider Deep Block and Possession.'
  :attack!==null&&defence!==null&&defence>=attack+6
  ?'Break their back line: consider Direct attack and High Press.'
  :'Balanced opponent: consider Possession and adapt to the match.';
 const tired=(c.roster||[]).filter(p=>p&&(Number(p.condition)<60||Number(p.injuryWeeks)>0)).length;
 const fitness=tired?`Your squad has ${tired} player${tired===1?'':'s'} below 60% fitness or injured. Review your starters before kickoff.`
  :'No fitness warning below 60% in your current squad.';
 const rating=n=>n===null?'–':escapeHTML(String(n));
 const highlight=threat?`${escapeHTML(threat.p.name||'Player')} · ${escapeHTML(threat.p.role)} · OVR ${rating(threat.ovr)}`:'No outfield scouting data';
 return `<section class="panel" id="careerOpponentScout" aria-label="Next opponent scouting report">
  <h3 class="titleSmall">🔍 NEXT OPPONENT SCOUT</h3>
  <p class="muted">Projected six-player lineup for ${escapeHTML(opponent.name)} · positional game ratings, not official match odds.</p>
  <div class="stat"><strong>ATTACK / DEFENCE / KEEPER</strong><span>${rating(attack)} / ${rating(defence)} / ${rating(keeper)}</span></div>
  <div class="stat"><strong>KEY OUTFIELD THREAT</strong><span>${highlight}</span></div>
  <div class="stat"><strong>LEAGUE RECORD</strong><span>${escapeHTML(record)}</span></div>
  <p class="muted"><strong>TACTICAL IDEA:</strong> ${recommendation}</p>
  <p class="muted"><strong>SQUAD READINESS:</strong> ${fitness}</p>
  <p class="muted">Scouting advice only. Adjust tactics or squad separately; no automatic changes or costs.</p>
  ${careerBenchReadinessPanel(c)}
  ${careerLineupRoleFitPanel(c)}
 </section>`;
}
// Advisory only: project the same saved six the next match actually uses.
// A reserve must match the starter's position, be uninjured and at least 60% fit.
// Never update lineup, the career object, the plan, or a storage entry.
function careerBenchReadinessPanel(c){
 if(!Number.isInteger(c?.club)||!Array.isArray(c?.roster))return '';
 const lineup=planFor(c.club)?.lineup;
 if(!Array.isArray(lineup)||lineup.length!==6)return '';
 const squad=c.roster,selected=new Set(lineup),reserved=new Set();
 const fitness=p=>{const v=p?.condition==null?100:Number(p.condition);return Number.isFinite(v)?Math.max(0,Math.min(100,v)):0;};
 const injured=p=>Number(p?.injuryWeeks)>0;
 const needs=lineup.map((index,slot)=>({index,slot,p:squad[index]}))
  .filter(x=>x.p&&(injured(x.p)||fitness(x.p)<60))
  .sort((a,b)=>Number(injured(b.p))-Number(injured(a.p))||fitness(a.p)-fitness(b.p)||a.slot-b.slot);
 if(!needs.length)return '<div id="careerBenchReadiness" aria-label="Pre-match bench recommendations"><p class="muted"><strong>STARTING SIX:</strong> All projected starters are available at 60% fitness or better. No replacements advised.</p></div>';
 const rows=needs.slice(0,3).map(({p,slot})=>{
  const candidates=squad.map((q,i)=>({q,i})).filter(({q,i})=>q&&!selected.has(i)&&!reserved.has(i)&&q.role===p.role&&!injured(q)&&fitness(q)>=60);
  candidates.sort((a,b)=>fitness(b.q)-fitness(a.q)||playerOVR(b.q,b.q.role)-playerOVR(a.q,a.q.role)||a.i-b.i);
  const pick=candidates[0];
  if(pick)reserved.add(pick.i);
  const label=`${escapeHTML(String(p.name||'Player'))} (${escapeHTML(String(p.role||'?'))}, ${injured(p)?'injured':`fitness ${Math.round(fitness(p))}%`})`;
  const action=pick?`Consider ${escapeHTML(String(pick.q.name||'Reserve'))} (${Math.round(fitness(pick.q))}% fit) as a same-position reserve.`:'No healthy same-position reserve available.';
  return `<p class="muted" data-bench-slot="${slot}"><strong>${label}</strong> — ${action}</p>`;
 }).join('');
 return `<div id="careerBenchReadiness" aria-label="Pre-match bench recommendations"><h3 class="titleSmall">🩺 BENCH READINESS</h3>${rows}${needs.length>3?`<p class="muted">+${needs.length-3} additional starters need review.</p>`:''}<p class="muted">Suggestions only: review your squad and tactics manually; your starting six is unchanged.</p></div>`;
}
function showManager(){if(!career||creatingCareer){const regions=availableRegions(TEAMS);if(!regions.includes(managerRegion))managerRegion=regions[0]||'UEFA';const countries=availableCountries(TEAMS,managerRegion);if(!countries.includes(managerCountry))managerCountry=countries[0]||'';const choices=clubsInCountry(TEAMS,managerRegion,managerCountry);page('MANAGER CAREER','Choose continent → country → club, then build your twelve-player squad.',`<div class="panel"><div class="managerRegionSelector">${field('1. CONTINENT','managerContinent',regions.map(k=>[k,CONTINENTS.find(x=>x.id===k)?.region||k]),managerRegion)}${field('2. COUNTRY','managerCountry',countries.map(k=>[k,countryName(k,TEAMS)]),managerCountry)}</div>${teamField('3. CLUB','managerClub',choices.map(i=>[i,TEAMS[i].name]),choices[0])}<p class="muted">Select a continent and country to narrow the list. Browse Flags / Crests to see team graphics while choosing.</p><div class="row" style="margin-top:15px">${button('START MANAGER CAREER','startManager','gold')}${button('CONTINENTAL CUPS','continents')}</div></div>`);return;}
 const c=career,fx=currentCareerFixture(c),sorted=standings(c),place=sorted.findIndex(v=>v.id===c.club)+1;
 page('MANAGER CAREER',`Season ${c.season} · ${TEAMS[c.club].name} · 12 active players · League & knockout cup`,`<div class="row" style="margin:10px 0">${CONTINENTS.filter(co=>CONTINENTAL_TEAMS[co.id].includes(c.club)).map(co=>button('🏆 '+co.id+' CHAMPIONSHIP','continentPick_'+co.id,'gold')).join('')}</div><div class="careerTop"><div class="metric"><small>TRANSFER FUNDS</small><strong>${eur(c.cash)}</strong></div><div class="metric"><small>LEAGUE POSITION</small><strong>#${place} / 8</strong></div><div class="metric"><small>LEAGUE ROUND</small><strong>${c.week} / 14</strong></div><div class="metric"><small>CUP</small><strong>${c.cup.eliminated?'OUT':c.cup.stage===3?'🏆 WON':['QF','SF','FINAL'][c.cup.stage]}</strong></div></div>
 <div class="twoCol"><div class="panel"><h3 class="titleSmall">NEXT FIXTURE</h3><div class="fixture">${fx?`${fx.kind==='cup'?'🏆 '+fx.round:'🏟 LEAGUE WEEK '+fx.round}<br><strong>${TEAMS[c.club].name} <em>VS</em> ${TEAMS[fx.opponent].name}</strong>`:c.leagueFinished?'🏆 SEASON COMPLETE!':'No fixtures yet'}</div>
 ${careerOpponentScoutPanel(c,fx)}
 <div class="row">${fx?button('▶ PLAY NEXT MATCH','careerPlay','gold'):button('↻ BEGIN NEW SEASON','careerSeason','gold')}${button('12-PLAYER SQUAD','careerSquad')}${button('TRANSFER MARKET','careerMarket')}${button('🔍 YOUTH ACADEMY','careerScout')}</div><hr><h3 class="titleSmall">CLUB FACILITIES</h3>
 ${Object.entries(c.facilities).map(([key,v])=>`<div class="facility"><span>🏟 ${key.toUpperCase()} LVL ${v}</span>${button('UPGRADE '+eur(v*12500000),'facility_'+key)}</div>`).join('')}
 <p class="muted">Academy scouts create fictional recruitable prospects with defined potential, and players have contract years and fitness. Wins generate income. Training improves player experience; upgraded training increases XP per match. Facilities and transfers persist in this browser.</p></div>
 <div class="panel"><h3 class="titleSmall">LEAGUE TABLE</h3><div class="scroll"><table class="miniTable"><thead><tr><th>TEAM</th><th>PL</th><th>W</th><th>D</th><th>GD</th><th>PTS</th></tr></thead><tbody>${sorted.map((r,i)=>`<tr class="${r.id===c.club?'myTeam':''}"><td>${i+1}. ${teamIdentity(TEAMS[r.id])} ${escapeHTML(TEAMS[r.id].name)}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.gf-r.ga}</td><td><b>${r.pts}</b></td></tr>`).join('')}</tbody></table></div><h3 class="titleSmall">LATEST RESULTS</h3><div class="scroll">${c.history.slice(0,5).map(r=>`<div class="stat"><span>${r.kind.toUpperCase()} vs ${escapeHTML(TEAMS[r.against].name)}</span><strong>${r.a}:${r.b}</strong></div>`).join('')||'<p class="muted">No matches played yet</p>'}</div></div></div>`);
}
function careerPlay(){if(!career)return showManager();const fx=currentCareerFixture(career);if(!fx)return showManager();home=career.club;away=fx.opponent;mode='career';start()}
function showCareerSquad(){if(!career)return showManager();home=career.club;const rows=career.roster.map((p,i)=>`<div class="squadEntry"><canvas class="miniAvatar" width="100" height="108" data-avatar="${i}" data-avatarcareer="1"></canvas><div><strong>#${p.num} ${escapeHTML(p.name)}</strong><small>${p.role} · LV ${p.level} · ${p.xp} XP · OVR ${playerOVR(p)}</small><small>STR ${withStats(p).strength} · STA ${withStats(p).stamina} · SHOOT ${withStats(p).shootPower}/${withStats(p).shootAccuracy} · GK ${withStats(p).gkSkill}</small>${playerAbilityIcons(p)}<small>FIT ${p.condition??100}% · CONTRACT ${p.contractYears??2}Y ${p.injuryWeeks?' · OUT '+p.injuryWeeks+'w':''}</small>${p.fictional?'<small class="placeholder">Academy stand-in</small>':''}</div><div class="squadBtns">${button('🎨','editPlayer'+i)}<button class="btn" data-train="${i}">TRAIN €1.5m</button><button class="btn" data-careerrecover="${i}">RECOVER €0.5m</button><button class="btn" data-careerrenew="${i}">RENEW</button></div></div>`).join('');page('MANAGER SQUAD',`Twelve players · ${TEAMS[career.club].name}. Improve their stats, appearance and experience.`,`<div class="squadGrid">${rows}</div><div class="row" style="margin-top:12px">${button('← MANAGER HUB','manager','gold')}${button('TRANSFER MARKET','careerMarket')}${button('YOUTH SCOUTING','careerScout')}</div>`,'manager');paintAvatars();}
function careerTrain(){const ix=Number(menu.dataset.trainPlayer);try{trainPlayer(career,ix);saveCareer();showCareerSquad()}catch(e){alert(e.message)}}

function showCareerScout(){if(!career)return showManager();const players=career.scouted||[];page('YOUTH ACADEMY & SCOUTING',`Your youth academy is level ${career.facilities.academy}. Discover and sign original rising talents. Scouted names are fictional, never presented as real 2026 players.`,
 `<div class="twoCol"><div class="panel"><h3 class="titleSmall">SCOUT NETWORK</h3><div class="fixture">SCOUTING COST <strong>€2.5 MILLION</strong><p>Talents scale with academy level; each prospect has a future potential ceiling.</p></div>${button('🔎 SCOUT NEW PROSPECT','careerScoutNew','gold')}<div class="stat"><strong>FUNDS</strong><span>${eur(career.cash)}</span></div><div class="stat"><strong>ACADEMY LEVEL</strong><span>${career.facilities.academy}</span></div>${button('BACK TO MANAGER','manager')}</div>
 <div class="panel"><h3 class="titleSmall">DISCOVERED TALENTS (${players.length})</h3><div class="scroll">${players.map((p,i)=>`<div class="scoutRow"><div><strong>${escapeHTML(p.name)}</strong><small>${p.role} · AGE ${p.age} · OVR ${playerOVR(p)} · POT ${p.potential}</small><small>Signing fee ${eur(Math.ceil(p.value*.55))}</small></div>${button('SIGN','careerSign'+i,'gold')}</div>`).join('')||'<p class="muted">No prospects discovered. Scout a new player to begin.</p>'}</div><p class="muted">Signing replaces a squad member, preserving the twelve-player roster limit.</p></div></div>`, 'manager')}
function tryCareerScout(){try{scoutAcademy(career);saveCareer();showCareerScout()}catch(e){alert(e.message)}}
function tryCareerSign(i){const p=career.scouted[i];if(!p)return showCareerScout();const replacement=prompt(`Sign ${p.name}? Type 1–12 to replace one player on your roster:`, '12');if(replacement===null)return;try{signAcademy(career,i,+replacement-1);saveCareer();showCareerSquad()}catch(e){alert(e.message)}}
function tryCareerContract(index){try{const fee=renewContract(career,index);saveCareer();showCareerSquad();toast(`RENEWED — ${eur(fee)}`)}catch(e){alert(e.message)}}
function tryCareerRecover(index){try{recoverPlayer(career,index);saveCareer();showCareerSquad()}catch(e){alert(e.message)}}

let selectedMarketTeam=-1;
function showCareerMarket(requested){if(!career)return showManager();const indices=TEAMS.map((t,i)=>i).filter(i=>['club26','continental'].includes(TEAMS[i].group)&&i!==career.club);selectedMarketTeam=indices.includes(requested)?requested:(indices.includes(selectedMarketTeam)?selectedMarketTeam:indices[0]);const team=TEAMS[selectedMarketTeam];
 page('TRANSFER MARKET',`Transfer budget ${eur(career.cash)}. Buy a player by swapping one of your current twelve squad members.`,`<div class="twoCol"><div class="panel"><h3 class="titleSmall">SCOUT OTHER CLUBS</h3>${teamField('SELLING CLUB','marketTeam',indices.map(i=>[i,TEAMS[i].name]),selectedMarketTeam)}<div class="scroll">${team.customRoster.map((p,i)=>`<div class="marketRow"><span>${escapeHTML(p.name)}<br><small>${p.role} · OVR ${playerOVR(p)}${p.fictional?' · ACADEMY STAND-IN':''}</small></span><span>${eur(p.value||5000000)}</span><input type="radio" name="target" value="${i}" ${i===0?'checked':''} aria-label="Buy ${escapeHTML(p.name)}"/></div>`).join('')}</div></div><div class="panel"><h3 class="titleSmall">YOUR OUTGOING PLAYER</h3>${field('REPLACE','releasePlayer',career.roster.map((p,i)=>[i,`${p.name} · ${p.role}`]),11)}<p class="muted">Transferring replaces one squad member, keeping exactly twelve players. 35% of the outgoing player's estimated value is recovered.</p><div class="row">${button('BUY & SWAP PLAYER','careerBuy','gold')}${button('← MANAGER','manager')}</div><p class="muted">The club database mixes documented 2026 World Cup-affiliated names with clearly flagged academy stand-ins where a complete 2026/27 roster could not be verified.</p></div></div>`,'manager');}
function careerBuy(){try{const i=Number(menu.querySelector('input[name=target]:checked')?.value),release=Number($('releasePlayer').value);const p=purchase(career,TEAMS,selectedMarketTeam,i,release);saveCareer();alert(p.name+' joined your club!');showCareerSquad()}catch(e){alert(e.message)}}
let avatarIndex=0;
const STUDIO_DIRS=Object.freeze([
 {label:'FRONT',view:{kind:'front',side:1},dx:0,dy:1},
 {label:'FRONT ¾ RIGHT',view:{kind:'quarterFront',side:1},dx:.707,dy:.707},
 {label:'RIGHT SIDE',view:{kind:'side',side:1},dx:1,dy:0},
 {label:'BACK ¾ RIGHT',view:{kind:'quarterBack',side:1},dx:.707,dy:-.707},
 {label:'BACK',view:{kind:'back',side:1},dx:0,dy:-1},
 {label:'BACK ¾ LEFT',view:{kind:'quarterBack',side:-1},dx:-.707,dy:-.707},
 {label:'LEFT SIDE',view:{kind:'side',side:-1},dx:-1,dy:0},
 {label:'FRONT ¾ LEFT',view:{kind:'quarterFront',side:-1},dx:-.707,dy:.707}
]);
const STUDIO_ACTIONS=Object.freeze(['idle','run','kick','slide','header','keeperDive','keeperDiveCatch','keeperRecover','celebrate']);
// v0.8.25.20: Studio helper functions live in the menu module, not EXPANDED's private scope.
function studioOptionTags(items,selected){return items.map(([val,label])=>`<option value="${escapeHTML(val)}" ${String(selected)===String(val)?'selected':''}>${escapeHTML(label)}</option>`).join('')}
function studioNumberOptions(key,selected){return studioOptionTags((STUDIO_ASSET_LABELS[key]||[]).map((label,i)=>[String(i),label]),selected)}
function studioColorOptions(list,selected){
 const values=list.map(([value,label])=>[value,`${label} · ${value}`]);
 // Preserve a pre-existing player's actual natural shade, even when that exact hex
 // is not one of the ten broadly useful presets.
 if(typeof selected==='string'&&/^#[0-9a-f]{6}$/i.test(selected)&&!values.some(([value])=>value.toLowerCase()===selected.toLowerCase()))
   values.unshift([selected,`Current player shade · ${selected}`]);
 return studioOptionTags(values,selected);
}

let studioDirection=0,studioAction='idle',studioSpin=false,studioDragX=null,studioGalleryOpen=false,studioGallerySignature='';
setInterval(studioAnimationFrame,1150);
setInterval(()=>{if(screen==='PLAYER CUSTOMIZATION' && $('customPortrait') && studioAction!=='idle')drawCustomizer()},90);
function studioRotate(step){studioDirection=((studioDirection+step)%8+8)%8;const label=$('customAngleLabel');if(label)label.textContent=STUDIO_DIRS[studioDirection].label;drawCustomizer()}
function studioAnimationFrame(){if(!studioSpin||!$('customPortrait')||screen!=='PLAYER CUSTOMIZATION')return;studioDirection=(studioDirection+1)%8;drawCustomizer();}
function studioEightViewMarkup(){
 return `<section id="studioEightViewGallery" class="studioEightViewGallery" aria-label="Eight-direction player appearance gallery">${STUDIO_DIRS.map((dir,i)=>`<figure class="studioEightViewItem"><canvas data-studio-view="${i}" width="144" height="152" role="img" aria-label="${escapeHTML(dir.label)} appearance"></canvas><figcaption>${escapeHTML(dir.label)}</figcaption></figure>`).join('')}</section>`;
}
// 0.8.25.32: Optional, non-interactive eight-view contact sheet for the selected
// Studio appearance. Idle frames are deterministic even while rotating/animating
// the large preview; update the sheet only when the edited character changes.
function drawStudioEightViewGallery(player,appearance){
 const root=$('studioEightViewGallery');if(!studioGalleryOpen||!root||!player)return;
 const signature=JSON.stringify([home,avatarIndex,player.name,appearance]);
 if(signature===studioGallerySignature&&root.querySelectorAll('canvas').length===8)return;
 studioGallerySignature=signature;
 const gameView={getTeam:()=>TEAMS[home],options:{showNames:false},celebrationStyle:0};
 const template=game.player(0,3)||{i:3,team:0};
 const fit=portraitFit(144,152,appearance,'idle');
 for(let i=0;i<STUDIO_DIRS.length;i++){
  const canvas=root.querySelector('canvas[data-studio-view="'+i+'"]');if(!canvas)continue;
  const ctx=canvas.getContext('2d');if(!ctx)continue;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const gr=ctx.createLinearGradient(0,0,144,152);
  gr.addColorStop(0,'#27666e');gr.addColorStop(1,'#102b3e');ctx.fillStyle=gr;ctx.fillRect(0,0,144,152);
  const dir=STUDIO_DIRS[i];
  const dummy={...template,x:0,y:0,z:0,t:0,i:avatarIndex,src:{...player,appearance},
   keeper:player.role==='GK',face:dir.view.side,dx:dir.dx,dy:dir.dy,
   visualFacing:dir.view,anim:0,action:'idle',controlled:false,preview:true,stun:0,cryTimer:0};
  ctx.save();ctx.translate(fit.x,fit.y);ctx.scale(fit.scale,fit.scale);
  renderer.drawPlayer(ctx,dummy,gameView);ctx.restore();
 }
}

// STUDIO-101: edit the exact 14 numeric attributes already used by the match
// engine. Keep legacy rating and player identity intact for older saves.
const STUDIO_STAT_NAMES=Object.freeze({stamina:'Stamina',strength:'Strength',aggression:'Aggression',defence:'Defence',speedRating:'Speed',agility:'Agility',dribbling:'Dribbling',shootPower:'Shot power',shootAccuracy:'Shot accuracy',heading:'Heading',passing:'Passing',crossing:'Crossing',gkDiving:'GK diving',gkSkill:'GK skill'});
function studioStatControls(player){const normalized=withStats(player);
 return `<details id="studioStatsEditor"><summary>EDIT PLAYER STATS · ${escapeHTML(player.role)} OVR ${overallForPosition(normalized)}</summary><p class="muted">Change any of the 14 match attributes (1–100). This does not alter historic IDs or the stored legacy overall rating.</p><div class="avatarControls">${NUMERIC_STATS.map(key=>`<label for="stat_${key}">${STUDIO_STAT_NAMES[key]||key}<input class="choice" type="number" inputmode="numeric" min="1" max="100" step="1" id="stat_${key}" value="${normalized[key]}" /></label>`).join('')}</div><p id="studioStatOVR" role="status">POSITION OVR: ${overallForPosition(normalized)}</p><div class="row">${button('SAVE PLAYER STATS','saveStudioStats','gold')}${button('RESET UNSAVED STATS','resetStudioStats')}</div></details>`;
}
function readStudioStats(){const stats={};for(const key of NUMERIC_STATS){const node=$('stat_'+key),raw=node?.value??'';const value=Number(raw);if(raw.trim()===''||!Number.isInteger(value)||value<1||value>100)throw Error('Invalid '+(STUDIO_STAT_NAMES[key]||key)+': enter a whole number from 1 to 100');stats[key]=value;}return stats;}
function studioStatPreview(){const label=$('studioStatOVR');if(!label)return;try{const player=(career&&home===career.club?career.roster:roster(home))[avatarIndex];label.textContent='POSITION OVR: '+overallForPosition({...player,...readStudioStats()});}catch(error){label.textContent=error.message;}}
function saveStudioStats(){try{const stats=readStudioStats(),inCareer=!!(career&&home===career.club);const source=inCareer?career.roster.map(p=>({...p})):roster(home);if(!source[avatarIndex])throw Error('No player selected');source[avatarIndex]={...source[avatarIndex],...stats};if(inCareer){const updated={...career,roster:source};if(!storeCharacterChanges('managerCareer',updated))return;career=updated;saveCareer();showCareerSquad();}else{const updated={...edits,[TEAMS[home].id]:source};if(!storeCharacterChanges('edits',updated))return;edits=updated;showPlayerStudio(avatarIndex);}}catch(error){alert('Cannot save player stats: '+error.message)}}
function showPlayerStudio(index=0){avatarIndex=Math.max(0,Math.min(11,Number(index)||0));const squad=career&&home===career.club?career.roster:roster(home);const player=squad[avatarIndex];if(!player){showHome();return;}const av={...avatarFor(player),...(player.appearance||{})};
 const colorControls=`<label>SKIN COLOR<select class="choice" id="face_skin">${studioColorOptions(NATURAL_SKIN_TONES,av.skin)}</select></label><label>HAIR COLOR<select class="choice" id="face_hair">${studioColorOptions(NATURAL_HAIR_COLORS,av.hair)}</select></label>`;
 const assetControls=[
  ['style','HAIRSTYLE'],['face','FACE SHAPE'],['eyes','EYE SHAPE'],['brows','EYEBROWS'],['eyeColor','EYE COLOR'],['nose','NOSE'],['lips','LIPS'],
  ['body','BUILD'],['stature','HEIGHT STYLE'],['exaggeration','FUNNY SCALE'],['beard','FACIAL HAIR'],['accessory','ACCESSORY'],['freckles','FRECKLES'],['scar','SCARS'],['tattoo','TATTOOS']
 ].map(([id,name])=>`<label>${name}<select class="choice" id="face_${id}">${studioNumberOptions(id,av[id]??0)}</select></label>`).join('');
 const defenceChoices=studioEliteEligible(player)||player.superAbility?.type==='defence'?ABILITIES.studioDefenceChoices(player):[];
 const defenceSelector=player.role==='DF'? `<div class="panel"><h3>SUPER DEFENCE</h3><div id="studioDefIcon">${ABILITY_ICONS.icon('defence',player.superAbility?.type==='defence'?player.superAbility.id:null)}</div><p class="muted">Only eligible defenders can equip available defence abilities. No extra action button is added.</p><label>DEFENCE TIER<select class="choice" id="studioDefTier">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===SPECIALS.abilityLevel(player,'defence')?'selected':''}>${n}</option>`).join('')}</select></label><label>ABILITY<select class="choice" id="studioDefAbility"><option value="keep">KEEP CURRENT</option><option value="none">REMOVE DEFENCE</option>${defenceChoices.map(a=>`<option value="${escapeHTML(a.id)}">${escapeHTML(a.name)}</option>`).join('')}</select></label><div class="row">${button('SAVE DEFENCE ABILITY','saveStudioDefence')}</div></div>`:'';
 const shotSelector=['MF','FW'].includes(player.role)?`<div class="panel"><h3>SUPER SHOT</h3><div id="studioShotIcon">${ABILITY_ICONS.icon('shot',player.superAbility?.type==='shoot'?player.shot:null)}</div><label>SHOT LEVEL<select class="choice" id="studioShotTier">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===SPECIALS.abilityLevel(player,'shot')?'selected':''}>${n}</option>`).join('')}</select></label><label>SHOT TYPE<select class="choice" id="studioShotAbility"><option value="keep">KEEP CURRENT</option><option value="none">REMOVE SUPER SHOT</option>${(studioEliteEligible(player)||player.superAbility?.type==='shoot'?Object.entries(SHOTS):[]).map(([id,shot])=>`<option value="${escapeHTML(id)}" ${id===player.shot?'selected':''}>${escapeHTML(shot.name||id)}</option>`).join('')}</select></label><div class="row">${button('SAVE SUPER SHOT','saveStudioShot')}</div></div>`:'';
 const dribbleSelector=player.role!=='GK'?`<div class="panel"><h3>DRIBBLE STYLE</h3><div id="studioDribbleIcon">${ABILITY_ICONS.icon('dribble',DRIBBLES.assignedDribbleType(player))}</div><p class="muted">Normal ball-control style; no levels and not a magic Trick.</p><label>STYLE<select class="choice" id="studioDribble">${DRIBBLES.DRIBBLE_STYLES.map(a=>`<option value="${escapeHTML(a.id)}" ${a.id===DRIBBLES.assignedDribbleType(player)?'selected':''}>${escapeHTML(a.name||a.id)}</option>`).join('')}</select></label><div class="row">${button('SAVE DRIBBLE STYLE','saveStudioTrick')}</div></div>`:'';
 const magicSelector=player.role!=='GK'?`<div class="panel"><h3>TRICK — RARE MAGIC</h3><div id="studioMagicIcon">${ABILITY_ICONS.icon('trick',player.magicTrick)}</div><p class="muted">Tricks are rare elite abilities, distinct from dribble styles. Magic gameplay is under development; choosing a planned trick does not activate it in matches yet. KEEP CURRENT is the default; removal requires an explicit choice.</p><label>TRICK<select class="choice" id="studioMagic"><option value="keep" selected>KEEP CURRENT</option><option value="none">REMOVE MAGIC TRICK</option>${(studioEliteEligible(player)||player.magicTrick?STUDIO_MAGIC_TRICKS:[]).map(a=>`<option value="${a.id}">${a.name} (planned)</option>`).join('')}</select></label><div class="row">${button('SAVE TRICK SELECTION','saveStudioMagic')}</div></div>`:'';
 studioGallerySignature='';
 page('PLAYER CUSTOMIZATION','Every player has a persistent, editable HD caricature. Modify facial structure, funny exaggeration, hair, expressions and personal details.',`<div class="twoCol"><div class="panel">${career?'':teamField('SELECT TEAM','customTeam',nations(),home)}${field('PLAYER','customPlayer',squad.map((p,i)=>[i,`#${p.num} ${p.name}`]),avatarIndex)}<div class="characterStage"><canvas id="customPortrait" width="300" height="260" role="img" aria-label="Rotatable player preview"></canvas><div class="row studioRotateControls"><button type="button" class="btn" data-action="studioLeft" aria-label="Rotate character left 45 degrees">◀ ROTATE</button><strong id="customAngleLabel">${STUDIO_DIRS[studioDirection].label}</strong><button type="button" class="btn" data-action="studioRight" aria-label="Rotate character right 45 degrees">ROTATE ▶</button></div><p class="muted" style="margin:0">Drag the player horizontally to turn • eight views</p><div class="row studioMotionControls"><label class="fieldLabel" for="customPose">PREVIEW MOTION</label><select id="customPose" class="choice">${STUDIO_ACTIONS.map(a=>`<option value="${a}" ${a===studioAction?'selected':''}>${a.toUpperCase()}</option>`).join('')}</select><button type="button" class="btn" data-action="studioSpin">${studioSpin?'■ STOP TURN':'↻ AUTO ROTATE'}</button></div><div>${escapeHTML(player.name)} · ${player.role}<p>${escapeHTML(player.shotName||'Super shot')}</p></div></div><div class="row">${button(studioGalleryOpen?'HIDE 8-VIEW GALLERY':'COMPARE ALL 8 VIEWS','studioGalleryToggle')}</div>${studioGalleryOpen?studioEightViewMarkup():''}<div class="row">${button('✓ SAVE CHARACTER','saveAppearance','gold')}${button('RANDOMIZE FACE','randomizeFace')}</div></div><div class="panel"><div class="avatarControls">${colorControls}${assetControls}</div><p class="muted">Customization now uses curated natural skin and hair palettes, exposes every hairstyle and face asset used by the renderer, and adds tattoo choices so the editor matches the drawable character system.</p>${studioStatControls(player)}${shotSelector}${defenceSelector}${magicSelector}${dribbleSelector}</div></div>`,career?'careerSquad':'home');
 // Visual-only live previews; select values remain the sole saved source of truth.
 for(const [selectId,previewId,category,current] of [
  ['studioShotAbility','studioShotIcon','shot',player.superAbility?.type==='shoot'?player.shot:null],
  ['studioDefAbility','studioDefIcon','defence',player.superAbility?.type==='defence'?player.superAbility.id:null],
  ['studioMagic','studioMagicIcon','trick',player.magicTrick],
  ['studioDribble','studioDribbleIcon','dribble',DRIBBLES.assignedDribbleType(player)]
 ]){
  const select=$(selectId),target=$(previewId);if(!select||!target)continue;
  const update=()=>{const chosen=select.value==='keep'?current:select.value==='none'?null:select.value;target.innerHTML=ABILITY_ICONS.icon(category,chosen);};
  select.addEventListener('change',update);update();
 }
 const tierSelect=$('studioDefTier'),abilitySelect=$('studioDefAbility');
 if(tierSelect&&abilitySelect)tierSelect.onchange=()=>{
  const previous=abilitySelect.value;
  const available=studioEliteEligible(player)||player.superAbility?.type==='defence'?ABILITIES.studioDefenceChoices(player,Number(tierSelect.value)):[];
  abilitySelect.innerHTML='<option value="keep">KEEP CURRENT</option><option value="none">REMOVE DEFENCE</option>'+available.map(a=>`<option value="${escapeHTML(a.id)}">${escapeHTML(a.name)}</option>`).join('');
  if([...abilitySelect.options].some(o=>o.value===previous))abilitySelect.value=previous;
 };
 drawCustomizer();}
function getAppearance(){const numeric=['style','face','eyes','brows','eyeColor','nose','lips','body','stature','exaggeration','beard','accessory','freckles','scar','tattoo'];return Object.fromEntries(['skin','hair',...numeric].map(k=>[k,k==='skin'||k==='hair'?$('face_'+k).value:+$('face_'+k).value]))}
function drawCustomizer(){
 const canvas=$('customPortrait');if(!canvas)return;
 const ctx=canvas.getContext('2d'),p=(career&&home===career.club?career.roster:roster(home))[avatarIndex];if(!p)return;
 const pose=$('customPose')?.value||studioAction;
 const dir=STUDIO_DIRS[studioDirection],action=pose==='run'?'idle':pose;
 const tm=performance.now()/1000,run=pose==='run',canvW=canvas.width,canvH=canvas.height;
 ctx.clearRect(0,0,canvW,canvH);
 const gr=ctx.createLinearGradient(0,0,canvW,canvH);gr.addColorStop(0,'#27666e');gr.addColorStop(1,'#0b2741');ctx.fillStyle=gr;ctx.fillRect(0,0,canvW,canvH);
 ctx.save();ctx.strokeStyle='#c5efed38';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(150,236,78,12,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 const appearance=getAppearance();
 const fit=portraitFit(canvW,canvH,appearance,action);
 const moving=run;
 const source=game.player(0,3)||{i:3,team:0};
 const dummy={...source,x:0,y:0,z:pose==='header'?22:0,t:0,i:avatarIndex,src:{...p,appearance},
  keeper:p.role==='GK'||action.startsWith('keeper'),face:dir.view.side,
  dx:moving?dir.dx*.6:0,dy:moving?dir.dy*.6:0,visualFacing:dir.view,anim:tm*.56,
  action,actionTimer:.22,diveElapsed:.32,diveDy:dir.dy<0?-1:1,controlled:false,preview:true,stun:0,cryTimer:0};
 const previewGame={getTeam:()=>TEAMS[home],options:{showNames:false},celebrationStyle:0};
 if(!action.startsWith('keeper')||!drawFittedKeeperStudioPose(ctx,canvW,canvH,dummy,previewGame)){
  ctx.save();ctx.translate(fit.x,fit.y);ctx.scale(fit.scale,fit.scale);
  renderer.drawPlayer(ctx,dummy,previewGame);ctx.restore();
 }
 const label=$('customAngleLabel');if(label)label.textContent=dir.label;
 drawStudioEightViewGallery(p,appearance);
}
// Character saves must confirm durable storage before the editor says the value
// was saved. Keep the exact legacy `legend_edits` / `legend_managerCareer` JSON
// structure for compatibility with old backups and previously saved lineups.
function storeCharacterChanges(key,payload){
 const slot='legend_'+key;let previous;
 try{previous=localStorage.getItem(slot)}catch{
  alert('Character saving is unavailable because browser storage cannot be read.');return false;
 }
 try{
  const json=JSON.stringify(payload);
  localStorage.setItem(slot,json);
  if(localStorage.getItem(slot)!==json)throw Error('storage did not retain the change');
  return true;
 }catch(e){
  // A privacy shim can mutate storage and then throw. Restore the exact previous
  // bytes, including an absent key, before reporting whether the save failed.
  let restored=false;
  try{
   if(previous===null)localStorage.removeItem(slot);else localStorage.setItem(slot,previous);
   restored=localStorage.getItem(slot)===previous;
  }catch{}
  alert('Could not save character changes. '+(restored?'Your earlier saved appearance was restored.':'The previous save could not be verified. Please use an exported backup.'));
  return false;
 }
}
function saveStudioShot(){
 try{
  const isCareer=!!(career&&home===career.club);
  const source=isCareer?career.roster.map(p=>({...p})):roster(home);
  const player=source?.[avatarIndex],id=$('studioShotAbility')?.value,tier=Number($('studioShotTier')?.value);
  if(!player||!['MF','FW'].includes(player.role))throw Error('Only midfielders and forwards can equip Super Shots');
  if(id!=='keep'&&id!=='none'&&!studioEliteEligible(player)&&player.superAbility?.type!=='shoot')throw Error('Super Shots are reserved for elite players');
  if(!Number.isInteger(tier)||tier<1||tier>5)throw Error('Super Shot level must be 1–5');
  if(!id||!['keep','none'].includes(id)&&!Object.hasOwn(SHOTS,id))throw Error('Unknown Super Shot');
  const updated={...player,superShotLevel:tier};
  if(id==='none'){
   if(updated.superAbility?.type==='shoot')delete updated.superAbility;
   updated.shot=null;updated.shotName='';
  }else if(id==='keep'){
   if(updated.superAbility?.type==='shoot')updated.superAbility={...updated.superAbility,level:tier};
  }else{
   updated.shot=id;updated.shotName=SHOTS[id].name||id;
   updated.superAbility={type:'shoot',id,name:updated.shotName,level:tier};
  }
  source[avatarIndex]=updated;
  if(isCareer){const next={...career,roster:source};if(!storeCharacterChanges('managerCareer',next))return;career=next;saveCareer();}
  else{const next={...edits,[TEAMS[home].id]:source};if(!storeCharacterChanges('edits',next))return;edits=next;}
  showPlayerStudio(avatarIndex);
 }catch(error){alert('Cannot save Super Shot: '+error.message)}
}
const STUDIO_MAGIC_TRICKS=Object.freeze([
 {id:'banana',name:'Banana Peel'},{id:'ice',name:'Ice Patch'},{id:'bat',name:'Bat Strike'},
 {id:'fireball',name:'Fireball'},{id:'freeze',name:'Freeze'},{id:'scream',name:'Scream'},
 {id:'hideBall',name:'Hide Ball'},{id:'teleport',name:'Teleport'}
]);
function saveStudioMagic(){
 try{
  const isCareer=!!(career&&home===career.club),source=isCareer?career.roster.map(p=>({...p})):roster(home);
  const player=source?.[avatarIndex],id=$('studioMagic')?.value;
  if(!player||player.role==='GK')throw Error('Only eligible outfield players can equip Tricks');
  if(!id||id!=='keep'&&id!=='none'&&!STUDIO_MAGIC_TRICKS.some(t=>t.id===id))throw Error('Unknown Trick');
  if(id!=='keep'&&id!=='none'&&!studioEliteEligible(player)&&!player.magicTrick)throw Error('Tricks are reserved for elite players');
  if(id==='keep'){showPlayerStudio(avatarIndex);return;} // No storage write for an unchanged ability.
  const updated={...player};if(id==='none')delete updated.magicTrick;else updated.magicTrick=id;
  source[avatarIndex]=updated;
  if(isCareer){const next={...career,roster:source};if(!storeCharacterChanges('managerCareer',next))return;career=next;saveCareer();}
  else{const next={...edits,[TEAMS[home].id]:source};if(!storeCharacterChanges('edits',next))return;edits=next;}
  showPlayerStudio(avatarIndex);
 }catch(error){alert('Cannot save magic Trick: '+error.message)}
}
function saveStudioTrick(){
 try{
  const isCareer=!!(career&&home===career.club);
  const source=isCareer?career.roster.map(p=>({...p})):roster(home);
  if(!source?.[avatarIndex])throw Error('No selected player');
  source[avatarIndex]=DRIBBLES.withStudioDribble(source[avatarIndex],$('studioDribble')?.value);
  if(isCareer){const updated={...career,roster:source};if(!storeCharacterChanges('managerCareer',updated))return;career=updated;saveCareer();}
  else{const updated={...edits,[TEAMS[home].id]:source};if(!storeCharacterChanges('edits',updated))return;edits=updated;}
  showPlayerStudio(avatarIndex);
 }catch(error){alert('Cannot save dribble style: '+error.message)}
}
function saveStudioDefence(){
 try{
  const isCareer=!!(career&&home===career.club);
  const source=isCareer?career.roster.map(p=>({...p})):roster(home);
  if(!source?.[avatarIndex])throw Error('No selected player');
  const ability=$('studioDefAbility')?.value,tier=Number($('studioDefTier')?.value);
  if(!ability)throw Error('Select a defender ability');
  if(ability!=='keep'&&ability!=='none'&&!studioEliteEligible(source[avatarIndex])&&source[avatarIndex].superAbility?.type!=='defence')throw Error('Super Defence is reserved for elite players');
  if(ability!=='keep'&&ability!=='none'&&!ABILITIES.studioDefenceChoices(source[avatarIndex],tier).some(a=>a.id===ability))
   throw Error('This defender is not eligible for that ability');
  source[avatarIndex]=ABILITIES.withStudioDefence(source[avatarIndex],ability,tier);
  if(isCareer){
   const updated={...career,roster:source};
   if(!storeCharacterChanges('managerCareer',updated))return;
   career=updated;saveCareer();
  }else{
   const updated={...edits,[TEAMS[home].id]:source};
   if(!storeCharacterChanges('edits',updated))return;
   edits=updated;
  }
  showPlayerStudio(avatarIndex);
 }catch(error){alert('Cannot save Super Defence: '+error.message)}
}
function saveAppearance(){
 const isCareer=!!(career&&home===career.club);
 const source=isCareer?career.roster.map(p=>({...p})):roster(home);
 if(!source?.[avatarIndex])return;
 source[avatarIndex]={...source[avatarIndex],appearance:getAppearance()};
 if(isCareer){
  const updated={...career,roster:source};
  if(!storeCharacterChanges('managerCareer',updated))return;
  career=updated;saveCareer();showCareerSquad();
 }else{
  const updated={...edits,[TEAMS[home].id]:source};
  if(!storeCharacterChanges('edits',updated))return;
  edits=updated;showPlayerStudio(avatarIndex);
 }
}
function paintAvatars(){menu.querySelectorAll('[data-avatar]').forEach(canvas=>{const i=+canvas.dataset.avatar,p=career?.roster?.[i];if(!p)return;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#1b5460';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();const fit=portraitFit(canvas.width,canvas.height,p.appearance||{});ctx.translate(fit.x,fit.y);ctx.scale(fit.scale,fit.scale);renderer.drawPlayer(ctx,{...game.player(0,3),src:p,t:0,i,face:1,x:0,y:0,z:0,anim:0,dx:0,dy:0,action:'idle',controlled:false,preview:true},{getTeam:()=>TEAMS[career.club],options:{showNames:false}});ctx.restore()})}

// Preserve the halftime team-talk opportunity after inspecting or saving live tactics.
// Four in-match quick tactical calls reuse existing gameplay AI modifiers and
// applyPlan validation. They never change the persistent pre-match teamPlans.
const QUICK_TACTICAL_CALLS={
 attack:{attack:'Direct',defence:'High Press',label:'ATTACK'},
 control:{attack:'Possession',defence:'Balanced',label:'CONTROL'},
 defend:{attack:'Possession',defence:'Deep Block',label:'PROTECT LEAD'},
 balanced:{attack:'Balanced',defence:'Balanced',label:'BALANCED'}
};
function quickTacticalPanel(side){
 const label=side===0?'Home':'Away',plan=game.teamPlans?.[side]||{};
 const styles=`${escapeHTML(plan.attack||'Balanced')} / ${escapeHTML(plan.defence||'Balanced')}`;
 return `<section class="panel" id="quickTactical${label}" aria-label="${label} live quick tactical calls">
 <h3 class="titleSmall">⚡ ${label.toUpperCase()} QUICK TACTICS</h3>
 <p class="muted" role="status" id="quickTacticalStatus${label}">CURRENT: ${styles}. Match-only changes; lineup, substitutions and saved presets stay unchanged.</p>
 <div class="row">${button('⚔ ATTACK','quickTactic'+label+'Attack')}${button('⚽ CONTROL','quickTactic'+label+'Control')}${button('🛡 PROTECT LEAD','quickTactic'+label+'Defend')}${button('↺ BALANCED','quickTactic'+label+'Balanced')}</div>
 </section>`;
}
function quickTacticalCall(side,key){
 if(!['PAUSED','HALF TIME'].includes(screen)||game.matchState!=='paused'||(side===1&&humans<2))return false;
 const choice=QUICK_TACTICAL_CALLS[key],plan=game.teamPlans?.[side];
 if(!choice||!plan)return false;
 if(plan.attack===choice.attack&&plan.defence===choice.defence){
  toast(`${side===0?'HOME':'AWAY'} ${choice.label} is already active`,1300);
  return true;
 }
 try{
  // Clone the authoritative in-match plan. Do not write the pre-game teamPlans
  // or localStorage, and do not swap any selected player.
  game.applyPlan(side,{...plan,attack:choice.attack,defence:choice.defence});
  if(screen==='HALF TIME')halftime();else pause();
  toast(`${side===0?'HOME':'AWAY'} ${choice.label} · ${choice.attack} / ${choice.defence}`,1900);
  return true;
 }catch(err){alert(err.message);return false;}
}
// Read-only live match moments. These come from the engine's existing event
// stream; never create telemetry events or persist a history to user saves.
function matchHighlightsPanel(game){
 const allowed=new Set(['goal','save','dribbleTrick','substitution','teamTalk']);
 const events=(Array.isArray(game?.events)?game.events:[])
  .filter(ev=>ev&&allowed.has(ev.type)&&(ev.type!=='substitution'||Number(ev.count)>0))
  .slice(-5).reverse();
 const safe=value=>escapeHTML(String(value));
 const describe=ev=>{
  const team=ev.team??ev.player?.t;
  const side=team===0?'HOME':team===1?'AWAY':'MATCH';
  if(ev.type==='goal'){
   const hero=typeof ev.hero==='string'?ev.hero:ev.hero?.src?.name||ev.hero?.name||'';
   const score=Array.isArray(ev.score)&&ev.score.length===2&&ev.score.every(Number.isFinite)
    ?' · '+ev.score.map(n=>Math.trunc(n)).join('–'):'';
   return 'GOAL · '+side+(hero?' · '+safe(hero):'')+score;
  }
  if(ev.type==='save'){
   const player=typeof ev.player==='string'?ev.player:ev.player?.src?.name||ev.player?.name||'';
   const technique=typeof ev.saveType==='string'&&ev.saveType?' · '+safe(ev.saveType):'';
   return 'KEEPER SAVE · '+side+(player?' · '+safe(player):'')+technique;
  }
  if(ev.type==='dribbleTrick'){
   const player=typeof ev.player==='string'?ev.player:'';
   const style=typeof ev.name==='string'?ev.name:typeof ev.style==='string'?ev.style:'';
   const result=ev.success===true?' · SUCCESS':ev.success===false?' · BLOCKED':'';
   return 'SKILL MOVE · '+side+(player?' · '+safe(player):'')+(style?' · '+safe(style):'')+result;
  }
  if(ev.type==='substitution'){
   const n=Math.max(1,Math.trunc(Number(ev.count)));
   return 'SUBSTITUTION · '+side+' · '+n+' player'+(n===1?'':'s');
  }
  return 'TEAM TALK · '+side+(typeof ev.choice==='string'?' · '+safe(ev.choice):'');
 };
 const content=events.length
  ?'<ol class="muted">'+events.map(ev=>'<li>'+describe(ev)+'</li>').join('')+'</ol>'
  :'<p class="muted">No major match moments recorded yet.</p>';
 return '<section class="panel" id="matchHighlights" aria-label="Recent match events"><h3 class="titleSmall">MATCH EVENTS</h3>'+content+'</section>';
}
// Read-only shootout history from the actual GameEngine.pk.kicks booleans.
// Keep the regulation score untouched (draws can be decided on penalties).
function penaltyRoundScorecard(game,{finished=false,winner=null}={}){
 const pk=game?.pk,kicks=pk?.kicks;
 if(!Array.isArray(kicks)||kicks.length!==2||!kicks.every(side=>Array.isArray(side)))return '';
 // The engine stores booleans only. Reject malformed snapshots instead of
 // presenting an invented goal/save sequence or allowing dynamic HTML.
 if(kicks.some(side=>side.some(kick=>typeof kick!=='boolean')))return '';
 const totals=kicks.map(side=>side.filter(Boolean).length);
 const rows=kicks.map((side,t)=>{
  const recent=side.slice(-12);
  const omitted=side.length-recent.length;
  const moments=recent.map((goal,i)=>'<span aria-label="'+(goal?'Goal':'Saved or missed')+'"> '+(goal?'●':'○')+' </span>').join('');
  return '<p class="muted"><strong>'+(t===0?'HOME':'AWAY')+': '+totals[t]+' / '+side.length+
   '</strong> · '+(omitted?'+'+omitted+' earlier · ':'')+(moments||'No kicks yet')+'</p>';
 }).join('');
 const completed=kicks[0].length+kicks[1].length;
 const nextSide=completed%2===0?'HOME':'AWAY';
 const live=finished?'':pk.shotTimer>0?'CURRENT KICK: '+nextSide:'NEXT KICK: '+nextSide;
 const result=finished&&(winner===0||winner===1)?'WINNER: '+(winner===0?'HOME':'AWAY'):'';
 const status=result||live;
 return '<section class="panel" id="penaltyRoundScorecard" aria-label="Penalty shootout scorecard" role="region" aria-live="polite">'+
  '<h3 class="titleSmall">🥅 PENALTY SHOOTOUT · '+totals[0]+'–'+totals[1]+'</h3>'+
  rows+(status?'<p class="muted" role="status">'+status+'</p>':'')+'</section>';
}
function returnFromPauseTactics(){if(squadReturnAtHalf&&game.matchState==='paused')halftime();else pause();}
function pause(){game.matchState='paused';page('PAUSED','Resume or change the computer opponent difficulty without restarting.',`<div class="panel">${field('CPU DIFFICULTY (LIVE)','liveDifficulty',aiChoices(),opt.difficulty)}${difficultyHint()}<p class="muted">Changes apply immediately on the next AI decision. In local 2-player Versus this does not affect either human.</p></div>${penaltyRoundScorecard(game)}${matchHighlightsPanel(game)}<div class="row">${quickTacticalPanel(0)}${humans>=2?quickTacticalPanel(1):''}</div><div class="row">${button('▶ RESUME','resume','gold')}${button('RESTART MATCH','confirmRestart')}${button('SETTINGS','navSound')}${button('HOME TACTICS','tacticHome')}${humans>=2?button('AWAY TACTICS','tacticAway'):''}${button('RETURN TO MAIN MENU','confirmQuit')}</div>`)}
// Read-only halftime guidance. Decisions remain with the user.
function halftimeCoachAdvice(game,side){
 const scores=game.score||[0,0],delta=(scores[side]||0)-(scores[1-side]||0);
 const plan=game.teamPlans?.[side],lineup=game.lineups?.[side]||plan?.lineup||[];
 // Engine-authoritative ledger values, not transient sprite fatigue/morale.
 const squad=game.rosters?.[side]||[],ledger=game.fatigueLedger?.[side]||{};
 const remaining=Math.max(0,(game.maxSubstitutions??0)-(game.substitutionsUsed?.[side]??0));
 let tired=0;
 for(const index of lineup){
  const player=squad[index];if(!player)continue;
  const fatigue=Number(ledger[player.id]);
  if(Number.isFinite(fatigue)&&fatigue>=.60)tired++;
 }
 const morale=typeof game.teamMorale==='function'?Math.round(game.teamMorale(side)):55;
 const scoreTip=delta<0?'TRAILING: consider Direct attack and High Press to create chances.'
  :delta>0?'LEADING: consider Possession and Deep Block to protect the advantage.'
  :'LEVEL SCORE: consider Possession for control or Direct attack to chase a winner.';
 const fitnessTip=tired&&remaining
  ?`LOW FITNESS: ${tired} starter${tired===1?' is':'s are'} below 40% fitness. Check same-role bench options in TEAM TACTICS (${remaining} substitution${remaining===1?'':'s'} left).`
  :remaining===0?'NO SUBSTITUTIONS LEFT: manage the remaining starters conservatively.'
  :`BENCH: ${remaining} substitution${remaining===1?'':'s'} available; no starter below 40% fitness.`;
 const moraleTip=morale<40
  ?`LOW MORALE (${morale}%): consider a supportive team talk; individual player reactions vary.`
  :`TEAM MORALE ${morale}%: choose a team talk suited to your squad; reactions vary.`;
 return `${scoreTip} ${fitnessTip} ${moraleTip} Advice only — use TEAM TACTICS or SPEAK TO TEAM to apply changes.`;
}
// Read-only starter list: the same authoritative in-match fatigue ledger used
// by the Command Center. Never inspect benched players or mutate roster data.
function halftimeFatigueSpotlight(game,side){
 const squad=game.rosters?.[side]||[],lineup=game.lineups?.[side]||game.teamPlans?.[side]?.lineup||[];
 const ledger=game.fatigueLedger?.[side]||{},watches=[];
 for(let slot=0;slot<lineup.length;slot++){
  const player=squad[lineup[slot]];
  if(!player)continue;
  const fatigue=ledger[player.id];
  if(!Number.isFinite(fatigue)||fatigue<.60)continue;
  watches.push({player,slot,fatigue:Math.min(1,Math.max(0,fatigue))});
 }
 if(!watches.length)return '';
 watches.sort((a,b)=>b.fatigue-a.fatigue||a.slot-b.slot);
 const label=side===0?'Home':'Away';
 const names=watches.slice(0,2).map(({player,fatigue})=>{
  const shirt=player.num==null?'':`#${escapeHTML(String(player.num))} `;
  return `${shirt}${escapeHTML(String(player.name||'Player'))} (${escapeHTML(String(player.role||'Player'))}, FIT ${Math.round((1-fatigue)*100)}%)`;
 }).join(' · ');
 const more=watches.length>2?` · +${watches.length-2} more`:'';
 return `<p class="muted" id="halftimeFitness${label}" aria-label="${label} fatigued starters"><strong>FITNESS WATCH:</strong> ${names}${more}</p>`;
}
function halftimeCoachPanel(game,side){
 return `<section class="panel" id="halftimeCoach${side===0?'Home':'Away'}" role="status" aria-live="polite" aria-label="${side===0?'Home':'Away'} halftime coaching advice"><h3 class="titleSmall">📋 ${side===0?'HOME':'AWAY'} COACHING NOTES</h3><p class="muted">${halftimeCoachAdvice(game,side)}</p>${halftimeFatigueSpotlight(game,side)}</section>`;
}
function halftime(){game.matchState='paused';page('HALF TIME',`${TEAMS[home].name} ${game.score[0]} : ${game.score[1]} ${TEAMS[away].name}`,`<div class="panel"><h3 class="titleSmall">SECOND HALF STRATEGY</h3>${halftimeCoachPanel(game,0)}${humans>=2?halftimeCoachPanel(game,1):''}${matchHighlightsPanel(game)}${quickTacticalPanel(0)}${humans>=2?quickTacticalPanel(1):''}<p class="muted">Players regain 40% of their accumulated fatigue for the second half, and resting off the ball slowly restores stamina during play. CPU teams may make an automatic substitution. Use the command center for up to three substitutions; bench fatigue is remembered.</p><h3 class="titleSmall">🗣 HALF-TIME MANAGER TALK</h3><p class="muted">Talks can boost or reduce individual morale. One talk per team per halftime.</p><div class="tacticsGrid">${field('HOME TALK','halfTalkHome',Object.entries(TEAM_TALKS).map(([k,v])=>[k,v.name]),'encourage')}${humans>=2?field('AWAY TALK','halfTalkAway',Object.entries(TEAM_TALKS).map(([k,v])=>[k,v.name]),'focus'):''}</div><p class="muted">HOME MOOD: ${Math.round(game.teamMorale(0))}% · AWAY MOOD: ${Math.round(game.teamMorale(1))}%</p><div class="row">${!game.talksUsed[0].halftime?button('SPEAK TO HOME TEAM','talkHalfHome','gold'):''}${humans>=2&&!game.talksUsed[1].halftime?button('SPEAK TO AWAY TEAM','talkHalfAway'):''}</div><div class="row">${button('▶ SECOND HALF','resume','gold')}${button('HOME TACTICS','tacticHome')}${humans>=2?button('AWAY TACTICS','tacticAway'):''}${button('ADJUST CPU LEVEL','cpuPause')}</div></div>`)}
function fulltime(ev){game.matchState='finished';let [a,b]=ev.score,win=a>b;if(mode==='league'){
 league.played++;league.wins+=a>b?1:0;league.draws+=a===b?1:0;league.losses+=a<b?1:0;league.points+=a>b?5:a===b?2:0;league.games.unshift({team:TEAMS[away].name,a,b});league.games=league.games.slice(0,80);
 if(league.stage==='qualifier'&&league.wins>=16&&league.points>=70)league.stage='finals';else if(league.stage==='finals'&&win){league.playoff=(league.playoff||0)+1;if(league.playoff>=4)league.stage='champion'}store.put('league',league)}
 if(mode==='continental'&&continentalRun){try{const result=tournamentAdvance(continentalRun,TEAMS,ev.score,ev.penalties?ev.winner:null);store.put('continentalRun',continentalRun);if(career?.club===continentalRun.club){career.cash+=Math.max(0,continentalRun.earned-(continentalRun.lastCareerAward||0));continentalRun.lastCareerAward=continentalRun.earned;store.put('continentalRun',continentalRun);saveCareer()}saveCup();page('CONTINENTAL RESULT',`${TEAMS[home].name} ${a} : ${b} ${TEAMS[away].name}`,`<div class="panel careerResult"><div class="badge">${escapeHTML(confed(continentalRun.compId).name)}</div><div class="megaScore">${a} : ${b}</div><p>${escapeHTML(tournamentProgress(continentalRun))} • ${continentalRun.earned/1000000}m prize earnings</p>${button('CONTINUE CHAMPIONSHIP','continentContinue','gold')}</div>`)}catch(e){alert('Competition update failed: '+e.message);showTournament()}return;}
 if(mode==='career'&&career){recordMatchFitness(career,game.getFitnessReport(0));const outcome=advanceCareer(career,TEAMS,ev.score,ev.penalties?ev.winner:null);saveCareer();page('CAREER MATCH RESULT',`${TEAMS[home].name} ${a} : ${b} ${TEAMS[away].name}`,`<div class="panel careerResult"><div class="titleSmall">${outcome.kind.toUpperCase()} • ${outcome.win?'WIN!':a===b?'DRAW':'DEFEAT'}</div><div class="megaScore">${a} : ${b}</div><p>Club cash: €${(career.cash/1000000).toFixed(1)}m • Current week ${career.week+1}</p>${button('CONTINUE MANAGER CAREER','manager','gold')}</div>`);return;}
 page('FULL TIME',`${ev.penalties&&(ev.winner===0||ev.winner===1)?(ev.winner===0?'VICTORY!':'DEFEAT'):win?'VICTORY!':a===b?'DRAW MATCH':'DEFEAT'}${ev.penalties?' • ON PENALTIES':''}`,`<div class="panel" style="text-align:center"><div class="badge">MATCH RESULT</div><div style="font-size:70px;color:#ffe17a;font-weight:1000">${a} : ${b}</div><p>${TEAMS[home].name} vs ${TEAMS[away].name}</p>${ev.penalties?penaltyRoundScorecard(game,{finished:true,winner:ev.winner}):''}${matchHighlightsPanel(game)}<div class="row" style="justify-content:center">${button('↻ REMATCH','kickoff','gold')}${mode==='league'?button('🏆 LEAGUE','league'):button('MAIN MENU','home')}</div></div>`)}
function toast(message,duration=1600){let n=$('gameToast');n.textContent=message;n.classList.remove('hidden');toastTime=performance.now()+duration}
let toastTime=0;
game.onEvent=e=>{audio.cue(e);if(e.type==='toast')toast(e.message,1800);if(e.type==='goal'){$('gameToast').classList.add('hidden');toastTime=0}if(e.type==='penaltyStart')toast('PENALTY SHOOTOUT',1500);if(e.type==='penaltyKick')toast(e.goal?'GOAL!':'SAVE!',1300);if(e.type==='pause')pause();if(e.type==='halftime')halftime();if(e.type==='finished')fulltime(e)};
function action(a){audio.cue('ui');
 const navTarget=menu.querySelector('[data-action="'+a+'"]');if(navTarget&&a!=='home'&&a!=='quit')navFocusMap[screen]=a;
 if(['quick','versus','pk','training','manager','league','continents','clubs','playerStudio','editor','gallery','squad','help','controls'].includes(a)&&screen.startsWith('nav-'))menuEntryReturn=({
 'nav-device':'navOnDevice','nav-career':'navCareer','nav-cups':'navCups','nav-clubs':'navClubs','nav-settings':'navSettings','nav-customize':'navCustomization','nav-input':'navInput','nav-saves':'navSaveManagement'
 })[screen]||'home';
 if(a==='confirmQuit'){if(confirm('Leave this match and return to the main menu? Match progress will be lost.')){game.matchState='none';showHome();}}else if(a==='confirmRestart'){if(confirm('Restart the match from kickoff? Current match progress will be lost.'))start();}
 else if(a==='navQuick')showQuickMenu();else if(a==='navOnDevice')showOnDevice();else if(a==='navOnline')showOnlineMenu();else if(a==='navCareer'){creatingCareer=false;showCareerMenu();}else if(a==='navCups')showCupsMenu();else if(a==='navInternational')showInternationalMenu();else if(a==='navClubs')showClubCompetitionsMenu();else if(a==='navSettings'||a==='settings')showSettingsMenu();else if(a==='navCustomization')showCustomizationMenu();else if(a==='navInput')showInputMenu();else if(a==='navSaveManagement')showSaveMenu('navSettings');else if(a==='navCareerSlots')showCareerSlots();else if(a==='navCupSlots')showCupSlots();
 else if(a==='navGameSettings')showSettingsSection('game');else if(a==='navGraphics')showSettingsSection('graphics');else if(a==='navSound'){if(game.matchState==='paused'&&screen==='PAUSED')menuEntryReturn='returnPause';showSettingsSection('sound');}
 else if(a==='navAbout')showAbout();
 else if(a==='navNewCareer'){creatingCareer=true;showManager();}
 else if(a.startsWith('later')){const labels={laterLAN:'Local Network',laterOnlineMatch:'Online Match',laterUltimate:'Ultimate Team',laterOnlineCareer:'Online Career',laterOnlineCup:'Online Cup / League',laterWorldCup:'World Cup',laterAsian:'Asian Cup',laterEuro:'Euro',laterCopa:'Copa América',laterAfrica:'Africa Cup',laterConcacaf:'CONCACAF Cup',laterChampions:'Champions League',laterEuropa:'Europa League',laterPremier:'Premier League',laterSerie:'Serie A',laterBundes:'Bundesliga',laterLaLiga:'La Liga',laterLigue1:'Ligue 1',laterCustomCup:'Custom Cup',laterCustomLeague:'Custom League'};const parent=a==='laterLAN'?'navQuick':a.startsWith('laterOnline')||a==='laterUltimate'?'navOnline':['laterWorldCup','laterAsian','laterEuro','laterCopa','laterAfrica','laterConcacaf'].includes(a)?'navInternational':['laterCustomCup','laterCustomLeague'].includes(a)?'navCups':'navClubs';comingLater(labels[a]||'Coming Later','This feature is on the roadmap but is not yet playable.',parent);}
 else if(a==='home'||a==='quit'){game.matchState='none';showHome()}
 else if(a==='continents')showContinents();else if(a.startsWith('continentPick_'))showContinentSetup(a.slice(14));else if(a==='continentStart')startContinent();else if(a==='continentContinue')showTournament();else if(a==='continentKickoff')continentKickoff();else if(a==='continentBye')continentBye();
 else if(a==='manager'){creatingCareer=false;showManager();}else if(a==='startManager'){const v=+$('managerClub').value;const slot=careerSlots.firstEmpty()??careerSlots.active;if(careerSlots.list()[slot-1].occupied&&!confirm('All ten slots are full. Overwrite active Career slot '+slot+'?'))return;const fresh=createCareer(v,TEAMS);fresh.saveSchema=2;fresh.clubId=TEAMS[v].id;try{careerSlots.save(slot,fresh);career=fresh;creatingCareer=false;store.put('managerCareer',career);showManager();}catch(error){alert('Could not create Career save: '+error.message);}}
 else if(a==='careerPlay')careerPlay();else if(a==='careerSeason'){if(career){nextSeason(career);saveCareer();showManager()}}
 else if(a==='careerScout')showCareerScout();else if(a==='careerScoutNew')tryCareerScout();else if(a.startsWith('careerSign'))tryCareerSign(+a.slice(10));
 else if(a==='careerMarket')showCareerMarket();else if(a==='careerSquad')showCareerSquad();else if(a==='careerBuy')careerBuy();
 else if(a==='careerTrain')careerTrain();else if(a.startsWith('facility_')){try{upgradeFacility(career,a.slice(9));saveCareer();showManager()}catch(e){alert(e.message)}}
 else if(a==='studioGalleryToggle'){
  // Preserve *unsaved* Player Studio form controls when showing a comparison.
  // Reconstructing the Studio menu here would silently discard edits.
  studioGalleryOpen=!studioGalleryOpen;studioGallerySignature='';
  if(studioGalleryOpen){navTarget?.parentElement?.insertAdjacentHTML('afterend',studioEightViewMarkup());}
  else $('studioEightViewGallery')?.remove();
  if(navTarget)navTarget.textContent=studioGalleryOpen?'HIDE 8-VIEW GALLERY':'COMPARE ALL 8 VIEWS';
  drawCustomizer();
 }
 else if(a==='studioLeft')studioRotate(-1);else if(a==='studioRight')studioRotate(1);else if(a==='studioSpin'){studioSpin=!studioSpin;const btn=menu.querySelector('[data-action=studioSpin]');if(btn)btn.textContent=studioSpin?'■ STOP TURN':'↻ AUTO ROTATE';drawCustomizer()}
 else if(a==='saveStudioStats')saveStudioStats();else if(a==='resetStudioStats'){const player=(career&&home===career.club?career.roster:roster(home))[avatarIndex];if(player){const normalized=withStats(player);for(const key of NUMERIC_STATS)if($('stat_'+key))$('stat_'+key).value=String(normalized[key]);studioStatPreview();}}else if(a==='playerStudio')showPlayerStudio();else if(a.startsWith('editPlayer'))showPlayerStudio(+a.slice(10));else if(a==='saveAppearance')saveAppearance();else if(a==='saveStudioDefence')saveStudioDefence();else if(a==='saveStudioTrick')saveStudioTrick();else if(a==='saveStudioMagic')saveStudioMagic();else if(a==='saveStudioShot')saveStudioShot();else if(a==='randomizeFace'){const el=$('face_style');if(el){for(const k of ['style','face','eyes','brows','eyeColor','nose','lips','body','stature','exaggeration','beard','accessory','freckles','scar','tattoo']){const node=$('face_'+k);node.value=Math.floor(Math.random()*node.options.length)}const skinNode=$('face_skin'),hairNode=$('face_hair');if(skinNode)skinNode.value=NATURAL_SKIN_TONES[Math.floor(Math.random()*NATURAL_SKIN_TONES.length)][0];if(hairNode)hairNode.value=NATURAL_HAIR_COLORS[Math.floor(Math.random()*NATURAL_HAIR_COLORS.length)][0];drawCustomizer()}}
 else if(a==='conceptDemo'){home=TEAMS.findIndex(t=>t.id===CONCEPT_DEMO_ID);away=0;homeCategory='all';showSetup('quick');}
 else if(a==='quick'||a==='versus'||a==='training')showSetup(a);
 else if(a==='setupRules')showSetupExtras('rules');else if(a==='setupAppearance')showSetupExtras('appearance');else if(a==='setupTactics')showSetupExtras('tactics');
 else if(a==='league')showLeague();else if(a==='gallery')showGallery();else if(a==='clubs')showClubs();else if(a==='saveClub')saveNewClub();else if(a.startsWith('selectClub')){home=+a.slice(10);away=home===away?0:away;showSetup('quick')}else if(a.startsWith('deleteClub'))deleteClub(+a.slice(10));else if(a==='pk'){mode='pk';showSetup('pk')}
 else if(a==='leagueKickoff'){mode='league';start()}
 else if(a==='kickoff')start();else if(a==='squad')showSquad(0,game.matchState==='paused'?'pause':'home');else if(a==='prepHome')showSquad(0,'setup');else if(a==='prepAway')showSquad(1,'setup');else if(a==='tacticHome')showSquad(0,'pause');else if(a==='tacticAway'&&humans>=2)showSquad(1,'pause');else if(a==='returnSetup')showSetup(mode);else if(a==='returnPause'){menuEntryReturn='home';if(screen==='TEAM COMMAND CENTER'&&squadContext==='pause')returnFromPauseTactics();else pause();}else if(a==='controls')showControls();else if(a==='saveBindings'){const profile={keyboard:Array.from({length:4},(_,i)=>$('bindKey'+i).value),gamepad:Array.from({length:4},(_,i)=>+$('bindPad'+i).value),keyboard2:Array.from({length:4},(_,i)=>$('bindKey2'+i).value),gamepad2:Array.from({length:4},(_,i)=>+$('bindPad2'+i).value)};if(input.setBindings(profile)){store.put('controllerBindings',input.getBindings());showInputMenu();}else alert('Each player needs four unique keys and buttons. Keyboard keys cannot overlap across players.');}else if(a==='resetBindings'){input.setBindings({keyboard:['KeyK','KeyJ','KeyI','Space'],gamepad:[1,0,2,3],keyboard2:['Period','Comma','NumpadDecimal','ControlRight'],gamepad2:[1,0,2,3]});store.put('controllerBindings',input.getBindings());showControls();}else if(a==='help')showHelp();else if(a==='editor')showEditor();
 else if(/^quickTactic(Home|Away)(Attack|Control|Defend|Balanced)$/.test(a)){
  const match=a.match(/^quickTactic(Home|Away)(Attack|Control|Defend|Balanced)$/);
  quickTacticalCall(match[1]==='Home'?0:1,match[2].toLowerCase());
 }
 else if(a==='talkHalfHome'||a==='talkHalfAway'){const side=a==='talkHalfHome'?0:1;try{const response=game.applyTeamTalk(side,$(side?'halfTalkAway':'halfTalkHome')?.value||'encourage','halftime');halftime();toast(`${response.positive} INSPIRED · ${response.backfires} UPSET · TEAM MOOD ${response.morale}%`)}catch(err){alert(err.message)}}
 else if(a==='fullscreen')toggleFullscreen();else if(a==='cpuPause')pause();else if(a==='resume'){game.matchState=game.pk?'penalty':'play';closeMenu()}
 else if(a==='saveSquad'){
  const ix=squadContext==='pause'?game.teamIds[squadSide]:squadSide===0?home:away;
  const players=squadContext==='pause'?game.rosters[squadSide]:roster(ix);
  const raw={formation:$('formation').value,lineup:Array.from({length:6},(_,i)=>+$('pos'+i).value),captain:+$('role_captain').value,penalty:+$('role_penalty').value,freeKick:+$('role_freeKick').value,corner:+$('role_corner').value,attack:$('attackStyle').value,defence:$('defenceStyle').value};
  try{const plan=validatePlan(raw,players,ix);
   if(squadContext==='pause')game.applyPlan(squadSide,plan);
   teamPlans[TEAMS[ix].id]=plan;store.put('teamPlans',teamPlans);
   if(squadContext==='pause')returnFromPauseTactics();else if(squadContext==='setup')showSetup(mode);else showHome();
  }catch(e){alert(e.message)}
 }
 else if(a==='resetSquad'){
  const ix=squadContext==='pause'?game.teamIds[squadSide]:squadSide===0?home:away;
  const replacement=defaultPlan(ix,roster(ix));try{if(squadContext==='pause')game.applyPlan(squadSide,replacement);teamPlans[TEAMS[ix].id]=replacement;store.put('teamPlans',teamPlans);if(squadContext==='pause')returnFromPauseTactics();else showSquad(squadSide,squadContext);}catch(e){alert(e.message)}
 }
 else if(a==='cupBackupExport'){try{
 const blob=new Blob([cupSlots.exportBackup()],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='Supermagic_Cup_Backup_'+new Date().toISOString().slice(0,10)+'.json';link.click();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
 }catch(error){alert('Cup backup export failed: '+error.message)}}
 else if(a==='cupBackupImport'){
 const picker=document.createElement('input');picker.type='file';picker.accept='.json,application/json';
 picker.onchange=async()=>{try{
  const file=picker.files?.[0];if(!file)return;if(file.size>2000000)throw Error('Cup backup exceeds 2 MB');
  const bytes=await file.text(),hasData=cupSlots.list().some(s=>s.occupied);
  // Validate and inspect before confirmation; no progress changes on rejection.
  const validator=saved=>validateTournament(saved,TEAMS);
  const preview=cupSlots.inspectBackup(bytes,validator);
  const names=preview.slots.map(s=>'Slot '+s.number+': '+s.name+' ('+s.compId+')').join('\n');
  const warning=hasData?'This will REPLACE all existing Cup slots. Export a backup first.':'No existing Cup slots will be overwritten.';
  if(!confirm('Import '+preview.occupied+' Cup slots? Active slot: '+preview.active+'\n'+names+'\n'+warning))return;
  cupSlots.importBackup(bytes,{overwrite:hasData,validator});
  const restored=cupSlots.activeTournament();
  continentalRun=restored;store.put('continentalRun',continentalRun);showCupSlots();
 }catch(error){alert('Cup backup import failed: '+error.message)}};
 picker.click();
 }
 else if(a.startsWith('cupSlotSave_')){const n=Number(a.slice('cupSlotSave_'.length));if(!continentalRun)return showCupSlots();const prior=cupSlots.list()[n-1];if(prior?.occupied&&!confirm('Overwrite Cup slot '+n+'?'))return;try{const name=prompt('Cup save name:',prior?.name||confed(continentalRun.compId)?.name||'Cup '+n);if(name===null)return;cupSlots.save(n,continentalRun,name);store.put('continentalRun',continentalRun);showCupSlots()}catch(error){alert(error.message)}}
 else if(a.startsWith('cupSlotLoad_')){const n=Number(a.slice('cupSlotLoad_'.length));if(continentalRun&&!confirm('Load Cup slot '+n+'? The current Cup campaign will be replaced.'))return;try{const loaded=cupSlots.load(n,saved=>validateTournament(saved,TEAMS));continentalRun=loaded;store.put('continentalRun',continentalRun);showTournament()}catch(error){alert(error.message)}}
 else if(a.startsWith('cupSlotCopy_')){const n=Number(a.slice('cupSlotCopy_'.length));try{cupSlots.duplicate(n);showCupSlots()}catch(error){alert(error.message)}}
 else if(a.startsWith('cupSlotDelete_')){const n=Number(a.slice('cupSlotDelete_'.length));if(!confirm('Permanently delete Cup slot '+n+'? Export a backup first if needed.'))return;try{const wasActive=cupSlots.active===n;cupSlots.remove(n);if(wasActive){continentalRun=null;store.put('continentalRun',null)}showCupSlots()}catch(error){alert(error.message)}}
 else if(a.startsWith('careerSlotSave_')){const n=Number(a.slice(15));if(!career)return showCareerSlots();const prior=careerSlots.list()[n-1];if(prior?.occupied&&!confirm('Overwrite Career slot '+n+'?'))return;try{const name=prompt('Career save name:',prior?.name||TEAMS[career.club]?.name||'Career '+n);if(name===null)return;careerSlots.save(n,career,name);store.put('managerCareer',career);showCareerSlots();}catch(error){alert(error.message)}}
  else if(a.startsWith('careerSlotLoad_')){const n=Number(a.slice(15));if(career&&!confirm('Load Career slot '+n+'? Unsaved progress in the current career will be lost.'))return;try{career=careerSlots.load(n);store.put('managerCareer',career);showManager();}catch(error){alert(error.message)}}
  else if(a.startsWith('careerSlotDelete_')){const n=Number(a.slice(17));if(!confirm('Permanently delete Career slot '+n+'? Export a backup first if needed.'))return;try{careerSlots.remove(n);if(careerSlots.active===n){career=null;store.put('managerCareer',null);}showCareerSlots();}catch(error){alert(error.message)}}
  else if(a==='exportSave')exportSave();else if(a==='importSave')$('saveImportFile')?.click();
 else if(a==='saveSettings'){
  const get=id=>$(id)?.value;
  const changes={};for(const [id,key,cast] of [['difficulty','difficulty',Number],['settingsDuration','halfSeconds',Number],['gameSpeed','gameSpeed',Number],['settingsWeather','weather',String],['settingsTerrain','terrain',String],['settingsCondition','condition',String],['camera','camera',String],['ballModel','ballModel',VISUALFEEL.validBallModel],['showNames','showNames',v=>v==='true'],['showPerformance','showPerformance',v=>v==='true']]){if(get(id)!==undefined)changes[key]=cast(get(id));}
  Object.assign(opt,changes);
  const values={};for(const k of ['master','music','sfx','ui','ambience'])if(get('audio_'+k)!==undefined)values[k]=+get('audio_'+k);
  if(get('audioMute')!==undefined)values.mute=get('audioMute')==='true';
  audio.configure(values);opt.sfx=!audio.settings.mute;
  game.options.difficulty=opt.difficulty;
  store.put('audioOptions',audio.settings);store.put('options',opt);if(menuEntryReturn==='returnPause'){menuEntryReturn='home';pause();}else showSettingsMenu();
 }
 else if(a==='clearLeague'){if(confirm('Reset all league wins and fixture results?')){league={played:0,wins:0,draws:0,losses:0,points:0,playoff:0,stage:'qualifier',games:[]};store.put('league',league);showLeague()}}
 else if(a==='importRoster'){try{let list=JSON.parse($('jsonRoster').value);if(!Array.isArray(list)||list.length!==12)throw Error('Need an array of 12 players');for(let p of list){if(!p.name||!['GK','DF','MF','FW'].includes(p.role)||!SHOTS[p.shot]||!['A','B','C','D'].includes(p.speed)||!Number.isFinite(+p.shoot)||!Number.isFinite(+p.power)||!Number.isFinite(+p.defense))throw Error('Invalid player record '+p.name)}edits[TEAMS[home].id]=list;store.put('edits',edits);showEditor();toast('ROSTER SAVED')}catch(e){alert('Cannot import roster: '+e.message)}}
 else if(a==='exportRoster'){let blob=new Blob([$('jsonRoster').value],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=TEAMS[home].id+'_players.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),800)}
}

// Fullscreen is a user-triggered browser capability. Never pretend it succeeded on iOS Safari.
function fullscreenActive(){return Boolean(document.fullscreenElement||document.webkitFullscreenElement)}
function standaloneActive(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
function fullscreenButtons(){
 const text=fullscreenActive()?'⇲ EXIT FULLSCREEN':'⛶ FULLSCREEN';
 const menuButton=menu.querySelector('.fullscreenTool');
 if(menuButton)menuButton.textContent=text;
 const matchButton=$('fullscreenMatch');if(matchButton){matchButton.title=text;matchButton.setAttribute('aria-label',text);matchButton.textContent=fullscreenActive()?'⇲':'⛶';}
 document.body.classList.toggle('fullscreen-active',fullscreenActive()||standaloneActive());
 if(renderer?.resize)renderer.resize();
}
function fullscreenHelp(message){
 $('fullscreenHelpText').textContent=message;
 $('fullscreenHelp').classList.remove('hidden');
}
function toggleFullscreen(){
 // Invoked directly from button activation; do not await work before requestFullscreen.
 if(fullscreenActive()){
  const exit=document.exitFullscreen||document.webkitExitFullscreen;
  if(exit){Promise.resolve(exit.call(document)).catch(()=>fullscreenHelp('Use your device browser exit-fullscreen command.')).finally(fullscreenButtons);}
  return;
 }
 if(standaloneActive()){
  fullscreenHelp('You are already running the installed standalone game. Rotate to landscape for the best view; system UI visibility is controlled by your device.');
  return;
 }
 const el=$('app'); const enter=el.requestFullscreen||el.webkitRequestFullscreen;
 if(!enter){
  fullscreenHelp('Your browser does not support fullscreen for this type of web game. On iPhone: open in Safari → Share → Add to Home Screen → launch the installed game. On Android: Chrome menu → Add to Home Screen / Install app. Rotate to landscape.');
  return;
 }
 try{
  const result=enter.call(el);
  Promise.resolve(result).then(async()=>{
    fullscreenButtons();
    try{if(screen.orientation?.lock)await screen.orientation.lock('landscape')}catch{/* Unsupported outside compatible full-screen devices. */}
    if(renderer?.resize)renderer.resize();
  }).catch(e=>{
    fullscreenHelp('Your browser blocked fullscreen ('+(e?.name||'unsupported')+'). Use Add to Home Screen / Install app and rotate your phone to landscape.');fullscreenButtons();
  });
 }catch(e){fullscreenHelp('Fullscreen unavailable in this browser. Install the game to the Home Screen for a more immersive view.');}
}
for(const name of ['fullscreenchange','webkitfullscreenchange'])document.addEventListener(name,fullscreenButtons);
if(window.visualViewport)visualViewport.addEventListener('resize',()=>renderer.resize());
if(screen.orientation?.addEventListener)screen.orientation.addEventListener('change',()=>renderer.resize());
$('fullscreenMatch').addEventListener('click',toggleFullscreen);
$('fullscreenHelpClose').addEventListener('click',()=>$('fullscreenHelp').classList.add('hidden'));

// Menu-only focus navigation; input handling inside matches remains unchanged.
const primaryNavScreens=new Set(['home','nav-quick','nav-device','nav-online','nav-career','nav-cups','nav-international','nav-clubs','nav-settings','nav-customize','nav-input','nav-saves','nav-settings-game','nav-settings-graphics','nav-settings-sound']);
const menuButtons=()=>[...menu.querySelectorAll('.navChoice')].filter(el=>!el.disabled&&el.offsetParent!==null);
function navigateMenu(direction){const items=menuButtons();if(!items.length)return;const index=items.indexOf(document.activeElement);const next=items[(index+direction+items.length)%items.length];next.focus({preventScroll:true});next.scrollIntoView({block:'nearest',behavior:'instant'});}
function backFromMenu(){if(screen==='TEAM COMMAND CENTER'){action(squadContext==='pause'?'returnPause':squadContext==='setup'?'returnSetup':menuBackAction||'home');return;}if(['MATCH RULES','KITS & TEAM TALKS','TEAM TACTICS'].includes(screen)){action('returnSetup');return;}const back=screen==='nav-settings-sound'&&menuEntryReturn==='returnPause'?'returnPause':screen==='nav-saves'?menuBackAction:menuParents[screen]||menuBackAction||'home';if(screen==='home')return;action(back);}
document.addEventListener('keydown',e=>{
 if(!menuVisible())return;
 if(e.target?.matches?.('input,select,textarea,[contenteditable="true"]'))return;
 if(e.code==='Escape'||e.code==='Backspace'){
  if(['PAUSED','HALF TIME'].includes(screen)){e.preventDefault();if(screen==='PAUSED')action('resume');return;}
  e.preventDefault();backFromMenu();input.cancelAll();return;
 }
 if(primaryNavScreens.has(screen)){
  if(e.code==='ArrowDown'||e.code==='ArrowUp'){e.preventDefault();navigateMenu(e.code==='ArrowDown'?1:-1);}
  else if((e.code==='Enter'||e.code==='Space')&&document.activeElement?.matches?.('.navChoice')){e.preventDefault();document.activeElement.click();}
 }
});
let lastPadNav=0,padWas={};
function pollMenuPad(now){
 if(!menuVisible()){padWas={};return;}const pad=navigator.getGamepads?.()?.[0];if(!pad)return;
 const pressed=i=>Boolean(pad.buttons?.[i]?.pressed);
 const down=pressed(13)||(pad.axes?.[1]||0)>.55,up=pressed(12)||(pad.axes?.[1]||0)<-.55;
 if(primaryNavScreens.has(screen)&&now-lastPadNav>180&&down!==up&&(down||up)){navigateMenu(down?1:-1);lastPadNav=now;}
 if(pressed(0)&&!padWas.a){const selected=document.activeElement?.matches?.('.navChoice')?document.activeElement:menuButtons()[0];selected?.click();}
 if(pressed(1)&&!padWas.b)backFromMenu();
 padWas={a:pressed(0),b:pressed(1)};
}
menu.addEventListener('change',e=>{if(e.target.id==='saveImportFile'){importSave(e.target.files?.[0]);}});

// Studio drag-to-rotate; pointer capture keeps rotation stable on touch screens.
menu.addEventListener('pointerdown',e=>{if(e.target.id==='customPortrait'){studioDragX=e.clientX;e.target.setPointerCapture?.(e.pointerId)}});
menu.addEventListener('pointermove',e=>{if(studioDragX===null||e.target.id!=='customPortrait')return;const delta=e.clientX-studioDragX;if(Math.abs(delta)>=22){studioRotate(delta>0?1:-1);studioDragX=e.clientX;}});
for(const eventName of ['pointerup','pointercancel','lostpointercapture'])menu.addEventListener(eventName,()=>{studioDragX=null});
menu.addEventListener('input',e=>{if(e.target.id?.startsWith('stat_')){studioStatPreview();return;}if(e.target.dataset.teamSearch){fillTeamBrowser(e.target.dataset.teamSearch);return;}if(e.target.id?.startsWith('face_')||e.target.id==='customPose'){if(e.target.id==='customPose')studioAction=e.target.value;drawCustomizer()}});
menu.addEventListener('change',e=>{if(/^pos[0-5]$/.test(e.target.id)){const choiceEl=$('role_captain');if(!choiceEl)return;const current=+choiceEl.value;const ix=squadContext==='pause'?game.teamIds[squadSide]:squadSide===0?home:away;const players=squadContext==='pause'?game.rosters[squadSide]:roster(ix);const slots=Array.from({length:6},(_,i)=>+$('pos'+i).value);choiceEl.innerHTML=slots.map(i=>`<option value="${i}" ${i===current?'selected':''}>#${players[i].num} ${escapeHTML(players[i].name)}</option>`).join('');if(!slots.includes(current))choiceEl.value=String(slots[1]||slots[0]);refreshFormationPreview();}});

menu.addEventListener('click',e=>{const browser=e.target.closest('[data-team-browse]');if(browser){showTeamBrowser(browser.dataset.teamBrowse);return;}const pick=e.target.closest('[data-pick-team]');if(pick){const select=$(pick.dataset.pickTeam);if(select){select.value=pick.dataset.teamId;select.dispatchEvent(new Event('change',{bubbles:true}));}return;}let train=e.target.closest('[data-train]');if(train){menu.dataset.trainPlayer=train.dataset.train;careerTrain();return}const renew=e.target.closest('[data-careerrenew]');if(renew){tryCareerContract(+renew.dataset.careerrenew);return}const recover=e.target.closest('[data-careerrecover]');if(recover){tryCareerRecover(+recover.dataset.careerrecover);return}let node=e.target.closest('[data-action]');if(node)action(node.dataset.action)});
menu.addEventListener('change',e=>{const id=e.target.id;switch(id){case 'managerContinent':managerRegion=e.target.value;managerCountry='';showManager();break;case 'managerCountry':managerCountry=e.target.value;showManager();break;case 'continentClub':updateTeamPickerIcon(id);break;case 'managerClub':updateTeamPickerIcon(id);break;case 'formation':refreshFormationPreview();break;case 'homeGroup':homeCategory=e.target.value;home=filteredNations(homeCategory)[0]?.[0]??home;away=home===away?(away+1)%TEAMS.length:away;showSetup(mode);break;case 'awayGroup':awayCategory=e.target.value;away=filteredNations(awayCategory).find(([i])=>i!==home)?.[0]??away;showSetup(mode);break;case 'homeTeam':home=+e.target.value;if(home===away)away=(away+1)%TEAMS.length;showSetup(mode);break;case 'awayTeam':away=+e.target.value;if(away===home)home=(home+1)%TEAMS.length;showSetup(mode);break;case 'preTalkHome':preTalkChoices[0]=e.target.value;break;case 'preTalkAway':preTalkChoices[1]=e.target.value;break;case 'homeKit':case 'awayKit':{let side=id==='homeKit'?0:1;kitSelections[side]=e.target.value;store.put('kitSelections',kitSelections);if(screen==='KITS & TEAM TALKS')showSetupExtras('appearance');else paintTeamPreviews();break;}case 'weather':opt.weather=e.target.value;break;case 'terrain':opt.terrain=e.target.value;break;case 'condition':opt.condition=e.target.value;break;case 'halfSeconds':opt.halfSeconds=+e.target.value;break;case 'ballModel':opt.ballModel=VISUALFEEL.validBallModel(e.target.value);game.options.ballModel=opt.ballModel;store.put('options',opt);paintBallPreview();break;case 'aiStyle':opt.aiStyle=e.target.value;break;case 'matchDifficulty':case 'liveDifficulty':opt.difficulty=+e.target.value;game.options.difficulty=opt.difficulty;store.put('options',opt);{const hint=$('difficultyHint');if(hint)hint.textContent=aiTuning(opt.difficulty).name+' CPU: reaction, shot accuracy, passing, pressure and keeper response all scale by difficulty. Human players are unaffected.';}break;case 'marketTeam':showCareerMarket(+e.target.value);break;case 'customTeam':home=+e.target.value;showPlayerStudio();break;case 'customPlayer':showPlayerStudio(+e.target.value);break;case 'editTeam':home=+e.target.value;updateTeamPickerIcon(id);$('jsonRoster').value=JSON.stringify(roster(home),null,2);break;}});
menu.addEventListener('change',e=>{if(e.target.id==='difficulty'){const hint=$('difficultyHint');if(hint)hint.textContent=aiTuning(+e.target.value).name+' CPU: reaction, shot accuracy, passing, pressure and keeper response all scale by difficulty. Human players are unaffected.';}});
$('pauseBtn').addEventListener('click',()=>{if(['play','penalty'].includes(game.matchState))pause()});
$('dismissRotate').addEventListener('click',()=>{$('rotate').classList.add('hidden');rotateDismissed=true});let rotateDismissed=false;function checkRotate(){let should=!rotateDismissed&&!menuVisible()&&matchMedia('(pointer:coarse)').matches&&innerHeight>innerWidth*1.12;$('rotate').classList.toggle('hidden',!should)}
let last=performance.now(),uiT=0,perfSamples=0,perfElapsed=0;
function updatePerformanceHUD(now,rawDelta){
 const active=opt.showPerformance===true&&['play','penalty'].includes(game.matchState)&&!menuVisible();
 perfHud.classList.toggle('hidden',!active);
 if(!active){perfSamples=0;perfElapsed=0;return}
 if(rawDelta>0&&rawDelta<1000){perfSamples++;perfElapsed+=rawDelta;}
 if(perfElapsed>=500){const fps=1000*perfSamples/perfElapsed;
  perfHud.textContent=`FPS ${fps.toFixed(0)} · ${(perfElapsed/perfSamples).toFixed(1)} ms`;
  perfSamples=0;perfElapsed=0;
 }
}
function frame(now){pollMenuPad(now);const rawDelta=now-last;let dt=Math.min(.05,Math.max(0,rawDelta/1000||.016));last=now;updatePerformanceHUD(now,rawDelta);if(game.matchState==='play')game.update(dt);else if(game.matchState==='penalty')game.updatePK(dt);renderer.frame(game,dt,menuVisible());if(screen==='home'&&menuVisible())drawPoster();uiT-=dt;if(uiT<=0){uiT=.1;if(!menuVisible())drawHUD()}if(toastTime&&now>toastTime){$('gameToast').classList.add('hidden');toastTime=0}checkRotate();requestAnimationFrame(frame)}
game.init({home,away,options:opt});game.matchState='none';window.NekketsuHD={audio,version:RELEASE.version,game,renderer,input,teams:TEAMS,shots:SHOTS,aiLevels:AI_LEVELS,rosterFor,getCareer:()=>career,getContinental:()=>continentalRun,confederations:CONTINENTS,continentalMapping:CONTINENTAL_TEAMS,kitsFor:team=>KIT_CHOICES.map(k=>kitFor(team,k)),getKitChoices:()=>kitSelections.slice(),getTeamPlan:i=>planFor(i),getMorale:team=>game.teamMorale(team)};window.NekketsuHD.ballModels=VISUALFEEL.BALL_MODELS;window.NekketsuHD.facingView=VISUALFEEL.facingView;window.NekketsuHD.impactStun=VISUALFEEL.impactStun;window.NekketsuHD.rollDelta=VISUALFEEL.rollDelta;window.NekketsuHD.personalityFor=p=>BPWPERSONALITY.profileFor(p);window.NekketsuHD.personalityMotion=(p,params)=>BPWPERSONALITY.sampleMotion(BPWPERSONALITY.profileFor(p),params);window.SupermagicFootball=window.NekketsuHD;window.SupermagicFootball.conceptModularStatus=CONCEPT_MODULAR.status;window.SupermagicFootball.portraitFit=portraitFit;window.SupermagicFootball.studio={directions:STUDIO_DIRS,getDirection:()=>studioDirection,rotate:studioRotate,getAction:()=>studioAction,fitKeeperPose:drawFittedKeeperStudioPose};showHome();requestAnimationFrame(frame);
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});

// Browser audio can only be unlocked by a deliberate user gesture.
document.addEventListener('pointerdown',()=>audio.unlock(),{passive:true});
document.addEventListener('keydown',()=>audio.unlock());
// iOS Safari can require touchstart rather than pointerdown to resume Web Audio.
document.addEventListener('touchstart',()=>audio.unlock(),{passive:true});

// Studio drag-to-rotate; pointer capture keeps rotation stable on touch screens.
menu.addEventListener('pointerdown',e=>{if(e.target.id==='customPortrait'){studioDragX=e.clientX;e.target.setPointerCapture?.(e.pointerId)}});
menu.addEventListener('pointermove',e=>{if(studioDragX===null||e.target.id!=='customPortrait')return;const delta=e.clientX-studioDragX;if(Math.abs(delta)>=22){studioRotate(delta>0?1:-1);studioDragX=e.clientX;}});
for(const eventName of ['pointerup','pointercancel','lostpointercapture'])menu.addEventListener(eventName,()=>{studioDragX=null});
menu.addEventListener('input',e=>{if(e.target?.matches?.('input[id^=audio_]')){const output=$(e.target.id+'Value');if(output)output.textContent=e.target.value+'%'}});
document.addEventListener('visibilitychange',()=>document.hidden?audio.suspend():audio.resume());
window.addEventListener('pagehide',()=>audio.suspend());
window.addEventListener('pageshow',()=>{if(!document.hidden)audio.resume()});

})();