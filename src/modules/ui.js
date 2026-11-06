// Supermagic Football v0.8.25.30 | UI | independently editable module
import {AUDIO} from "./audio.js";
import {KITS} from "./kits.js";
import {SPECIALS} from "./specials.js";
import {ABILITIES} from "./abilities.js";
import {DRIBBLES} from "./dribbles.js";
import {ABILITY_ICONS} from "./ability-icons.js";
import {STATS} from "./stats.js";
import {FITNESS} from "./fitness.js";
import {JUMPMETRICS} from "./jumpmetrics.js";
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
import {CUSTOM_LEAGUE} from "./custom_league.js";
import {CAREER} from "./career.js";
import {CAREER_SLOTS} from "./career_slots.js";
import {createOnlineOidcSession} from "./online-auth.js";
import {createOnlineAccountClient,copyOfflineCareerSlotToRemotePayload,OnlineAccountError} from "./online-account-client.js";
import {createOnlineMatchClient,sampleOnlineActionInput} from "./online-match-client.js";
import {applyOnlineMatchSnapshot} from "./online-match-renderer.js";
import {createOnlineHistoryController} from "./online-history.js";
import {CUP_SLOTS} from "./cup_slots.js";
import {ECONOMY} from "./economy.js";
import {RELEASE} from "./release.js";
import {mountLanLobby} from "./lan-lobby.js";
import {createLanLiveMatch,readLanHostResultRecovery,retryLanHostResultRecovery,awardLanResultWithWalletRetry} from "./lan-live-match.js";
import {INPUT} from "./input.js";
import {VISUALFEEL} from "./visualfeel.js";
import {ENGINE} from "./engine.js";
import {BPWPERSONALITY} from "./bpwpersonality.js";
import {RENDER} from "./render.js";
import {CONCEPT_MODULAR} from "./conceptmodular.js";
import {GAME_ASSETS} from "../assets.js";
(()=>{const {ArcadeAudio,AUDIO_DEFAULTS}=AUDIO;const {JAPAN_ROSTER,TEAMS,rosterFor,SHOTS,DEFAULT_OPTIONS,DEFAULT_LINEUP,WEATHER,TERRAIN,CONDITIONS,FORMATIONS,STADIUMS}=DATA;const {Input}=INPUT;const {TEAM_TALKS,moodLabel}=MORALE;const {AI_LEVELS,aiTuning}=AI;const {withStats,NUMERIC_STATS,overallForPosition,verifiedRatingTierForPlayer}=STATS;const {initialFatigue}=FITNESS;const {jumpMetrics}=JUMPMETRICS;const {abilityLevel}=SPECIALS;const {kitFor,KIT_CHOICES,matchContrast,bestContrastSelections}=KITS;const {teamIdentity,countryFlag,countryCode,isClub}=IDENTITY;const {careerClubIds,clubRegion,clubCountry,countryName,availableRegions,availableCountries,clubsInCountry}=CLUBFILTERS;const {defaultPlan,safePlan,validatePlan,ATTACK_STYLES,DEFENCE_STYLES}=TACTICS;const {GameEngine}=ENGINE;const {Renderer}=RENDER;const {installExpansion,avatarFor,NATURAL_SKIN_TONES,NATURAL_HAIR_COLORS,STUDIO_ASSET_LABELS}=EXPANDED;const {installBPWWorldCups,BPW_YEARS}=BPW;const {installBPWAllTime}=BPWALLTIME;const {CONTINENTS,SIX_TOP_BY_CONTINENT,installContinentalClubs}=CONTINENTAL;const {createTournament,createCustomKnockoutTournament,tournamentCurrent,tournamentAdvance,tournamentStandings,tournamentProgress,validateTournament}=TOURNAMENTS;const {create:createCustomLeague,current:customLeagueCurrent,standings:customLeagueStandings,advance:advanceCustomLeague,validate:validateCustomLeague}=CUSTOM_LEAGUE;const {createCareer,currentCareerFixture,advanceCareer,standings,careerSeasonReview,completedSeasonArchive,nextSeason,purchase,upgradeFacility,trainPlayer,scoutAcademy,signAcademy,renewContract,recoverPlayer,careerCoverage,recordMatchFitness,verifiedPlayerAgeOnDate}=CAREER;


















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
 id:i===9?'crown_royals_reference_alex':i===0?'crown_royals_reference_leo':i===1?'crown_royals_reference_kwame':i===2?'crown_royals_reference_diego':CROWN_ROYALS_ID+'_'+i,
 name,role:CROWN_ROLES[i],num:i===9?1:i<9?i+2:i+1,power:70,shoot:36,defense:39,speed:'B',
 shot:'omega',shotName:'Crown Magic Shot',skill:'Reference Art In Progress',
 level:1,xp:0,...((i===9||i===0||i===1||i===2)?{renderModel:'crown_royals_reference',
 appearance:{renderModel:'crown_royals_reference',skin:i===2?'#aa7550':i===1?'#68422f':i===0?'#f0c4a0':'#e8b48e',hair:i===2?'#1c171c':i===1?'#161419':i===0?'#d5a23f':'#493020'}}:{})
}));
TEAMS.push({id:CROWN_ROYALS_ID,index:TEAMS.length,name:'Crown Royals (Art WIP)',
 group:'crown_royals_reference',flag:'CR',primary:'#362070',secondary:'#edc04c',
 trim:'#f2bd49',rank:83,shot:'omega',customRoster:CROWN_ROSTER});


const careerStorage=(()=>{try{return window.localStorage}catch{return {getItem(){return null},setItem(){throw Error('Persistent storage unavailable')},removeItem(){throw Error('Persistent storage unavailable')}}}})();
const careerSlots=CAREER_SLOTS.create(careerStorage);
const tokenWallet=ECONOMY.create(careerStorage);
let onlineConfig=null,onlineAuthSession=null,onlineAccountClient=null,onlineIdentityError='',onlineCareerRecord=null,onlineCareerLoaded=false,onlineCareerStatus='',onlineCareerSourceSlotNumber=null,onlineCareerTargetSlotNumber=null,onlineCareerSeason=null,onlineCareerProgressLoaded=false,onlineCareerProgressLoading=false,onlineCareerProgressRequested=false,onlineCareerProgressStatus='',onlineCareerTeamId='japan',onlineCareerMatchTicketing=false,onlineUtRecord=null,onlineUtLoaded=false,onlineUtStatus='',onlineUtTeam=0,onlineUtCatalog=null,onlineUtCollection=[],onlineUtBalance=null,onlineUtCatalogLoading=false,onlineUtCatalogRequested=false,onlineUtPendingPurchase=null,onlineUtPurchaseInFlight=false,onlineUtCategory='player',onlineUtSearch='',onlineUtPage=0,onlineUtLineupTeamId='japan',onlineUtLineup=null,onlineUtLineupLoading=false,onlineUtLineupSaving=false,onlineUtLineupPendingSave=null,onlineCareerSeasons=[];
let onlineMatchClient=null,onlineMatchStatus='',onlineMatchRecoveryStatus='',onlineMatchStatusCheckKey='',onlineMatchSequence=0,onlineMatchSendAccumulator=0,onlineMatchSnapshotTick=-1,onlineMatchReported=false,onlineMatchFinalSnapshot=null,onlineMatchFinalMatchId=null,onlineMatchManualStop=false,onlineMatchCareer=false,onlineMatchInitialTeamIds=[],onlineCareerActiveFixtureNo=null;
let onlineMatchOwnedTeamIds=[],onlineMatchTeamsLoaded=false,onlineMatchTeamsLoading=false,onlineMatchTeamsRefreshNeeded=false,onlineMatchTeamsError='';
let onlineAccountGeneration=0,onlineAccountSignOutGeneration=0,onlineAccountSignOutAtGeneration=-1;
function onlineAccountGenerationIsCurrent(generation){return generation===onlineAccountGeneration&&onlineAuthSession?.isSignedIn()===true;}
let onlineRewardMatchId=null,onlineRewardClaimStatus='';
let onlineMatchHistoryItems=[],onlineMatchHistoryCursor=null,onlineMatchHistoryStatus='',onlineMatchTeamId='japan';
let onlineHistoryController=null;
let career=store.get('managerCareer',null),creatingCareer=false;
// Never let a structurally damaged legacy mirror reach Career screens or migrate into a vault.
if(career&&!CAREER_SLOTS.validCareer(career))career=null;
// Migrate pre-0.6 custom-club index saves: v0.5 appended user clubs at index 83.
if(career&&!career.saveSchema&&clubs.length){const oldToNew=id=>Number.isInteger(id)&&id>=83&&id<83+clubs.length?(TEAMS.findIndex(t=>t.id===clubs[id-83].id)):id;
 if(career.club>=83&&career.club<83+clubs.length){career.club=oldToNew(career.club);career.members=career.members.map(oldToNew);career.fixtures=career.fixtures.map(r=>r.map(pair=>pair.map(oldToNew)));career.table=Object.fromEntries(Object.entries(career.table).map(([id,v])=>[oldToNew(+id),v]));(Array.isArray(career.history)?career.history:[]).forEach(r=>{if(r&&typeof r==='object')r.against=oldToNew(r.against)});if(career.lastResult&&typeof career.lastResult==='object')career.lastResult.against=oldToNew(career.lastResult.against);career.saveSchema=2;store.put('managerCareer',career)}
}
if(career&&!careerBackupTeamReferencesValid(career))career=null;
if(!careerSlots.error){try{careerSlots.importLegacy(career);if(careerSlots.hasVault){const saved=careerSlots.activeCareer();career=saved&&careerBackupTeamReferencesValid(saved)?saved:null;}}catch(error){console.warn('Career slot migration could not be saved:',error);}}
let continentalRun=store.get('continentalRun',null);if(!validateTournament(continentalRun,TEAMS))continentalRun=null;
// SAVE-102: migrate existing Cup campaign without deleting the legacy save.
const cupSlots=CUP_SLOTS.create(careerStorage);
if(!cupSlots.error){try{
 cupSlots.importLegacy(continentalRun);
 if(cupSlots.hasVault){const saved=cupSlots.activeTournament();continentalRun=saved&&validateTournament(saved,TEAMS)?saved:null;}
}catch(error){console.warn('Cup slot migration could not be saved:',error);}}

let continentSelection='UEFA';
let customCupEntrants=[];
let customCupClub=null;
let customLeagueEntrants=[];
let customLeagueClub=null;
let customLeagueRun=null,customLeagueSaveVolatile=false,customLeagueSaveError='',customLeagueCorruptRaw=null,customLeagueResultCommitted=false,customLeagueStorageBaseline=null,customLeagueStorageBaselineKnown=false;
function customLeagueTeamReferencesValid(c){return !!c&&Array.isArray(c.participants)&&c.teamKeys&&typeof c.teamKeys==='object'&&c.participants.every(id=>Number.isSafeInteger(id)&&TEAMS[id]?.id===c.teamKeys[String(id)]);}
function loadCustomLeague(){
 let raw;try{raw=careerStorage.getItem('legend_customLeague');customLeagueStorageBaseline=raw;customLeagueStorageBaselineKnown=true;}catch(error){customLeagueSaveVolatile=true;customLeagueSaveError='Browser storage is unavailable. This Custom League can be played for this session only.';return;}
 if(raw===null||raw===undefined)return;
 try{const saved=JSON.parse(raw);if(!validateCustomLeague(saved,TEAMS)||!customLeagueTeamReferencesValid(saved)){customLeagueCorruptRaw=raw;customLeagueSaveError='The saved Custom League is damaged or references teams that changed. The original data was kept; create a replacement only if you choose to overwrite it.';return;}customLeagueRun=saved;}
 catch{customLeagueCorruptRaw=raw;customLeagueSaveError='The saved Custom League could not be read. The original data was kept; create a replacement only if you choose to overwrite it.';}
}
function saveCustomLeague(value){
 customLeagueRun=value;
 try{const raw=JSON.stringify(value);if(customLeagueStorageBaselineKnown&&careerStorage.getItem('legend_customLeague')!==customLeagueStorageBaseline)throw Error('This Custom League changed in another tab. Reload before saving so one session does not replace the other.');careerStorage.setItem('legend_customLeague',raw);if(careerStorage.getItem('legend_customLeague')!==raw)throw Error('Saved data could not be verified.');customLeagueStorageBaseline=raw;customLeagueStorageBaselineKnown=true;customLeagueSaveVolatile=false;customLeagueSaveError='';customLeagueCorruptRaw=null;return true;}
 catch(error){customLeagueSaveVolatile=true;customLeagueSaveError=/changed in another tab/.test(error.message)?error.message:'Browser storage is unavailable or full. This Custom League is session-only and progress will be lost when this page closes.';console.warn('Custom League progress is session-only:',error.message);return false;}
}
loadCustomLeague();
let managerRegion='',managerCountry='';
const storedOptions=store.get('options',{}),opt={...DEFAULT_OPTIONS,...storedOptions};
if(!STADIUMS.some(v=>v.id===opt.stadium))opt.stadium=DEFAULT_OPTIONS.stadium;
// Respect the device's reduced-motion preference for high-energy flashes unless
// the player has already saved an explicit in-game preference.
if(typeof storedOptions?.reducedFlash!=='boolean'&&typeof matchMedia==='function')
 opt.reducedFlash=!!matchMedia('(prefers-reduced-motion: reduce)').matches;
opt.ballModel=VISUALFEEL.validBallModel(opt.ballModel);
opt.renderQuality=opt.renderQuality==='performance'?'performance':'high';renderer.setRenderQuality(opt.renderQuality);
input.setBindings(store.get('controllerBindings',input.getBindings()));
const kitSelections=(()=>{const k=store.get('kitSelections',null);return Array.isArray(k)?[k[0]==='away'?'away':'home',k[1]==='home'?'home':'away']:['home','away'];})();
let preTalkChoices=['none','none'];let home=0,away=9,homeCategory='all',awayCategory='all',mode='quick',humans=1,formation=opt.formation||'2-1-2',lineup=store.get('lineup',DEFAULT_LINEUP.slice()), edits=store.get('edits',{}),screen='home';
let arcadeShotId='',arcadeShotPlayerId='';
let activeMatchReceiptId=null,matchReceiptSequence=0;
let storeCategory='superShot',storeSearch='',storePage=0,storeNotice='',storeOwnedOnly=false,storeCatalogCache=null;
function newMatchReceiptId(){
 matchReceiptSequence++;
 const uuid=globalThis.crypto?.randomUUID?.();
 if(uuid)return `local-match-${uuid}`;
 const random=Math.random().toString(36).slice(2,14);
 return `local-match-${Date.now().toString(36)}-${matchReceiptSequence.toString(36)}-${random}`;
}
let teamPlans=store.get('teamPlans',{}),squadContext='home',squadSide=0,squadReturnAtHalf=false;
let league=store.get('league',{played:0,wins:0,draws:0,losses:0,points:0,playoff:0,stage:'qualifier',games:[]});
const audio=new ArcadeAudio({...AUDIO_DEFAULTS,...store.get('audioOptions',{}),...(opt.sfx===false?{mute:true}:{})});
const game=new GameEngine(opt,input),menu=$('menu'),hud=$('hud'),touch=$('mobile'),perfHud=$('perfHud');
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const button=(name,act,cls='',ariaLabel='')=>`<button class="btn ${cls}" data-action="${act}"${ariaLabel?` aria-label="${escapeHTML(ariaLabel)}"`:''}>${name}</button>`;
const slotActionButton=(label,action,kind,number)=>{
 const verb=label==='SAVE HERE'?'Save to':label.charAt(0)+label.slice(1).toLowerCase();
 return button(label,action,'',`${verb} ${kind} slot ${number}`);
};
const choice=(id,values,selected,ariaLabel='')=>`<select id="${id}" class="choice" ${ariaLabel?`aria-label="${escapeHTML(ariaLabel)}"`:''}>${values.map(([key,name])=>`<option value="${escapeHTML(key)}" ${String(key)===String(selected)?'selected':''}>${escapeHTML(name)}</option>`).join('')}</select>`;
const aiChoices=()=>AI_LEVELS.map(l=>[l.id,l.name]);
const difficultyHint=()=>`<p class="muted" id="difficultyHint">${escapeHTML(aiTuning(opt.difficulty).name)} CPU: reaction, shot accuracy, passing, pressure and keeper response all scale by difficulty. Human players are unaffected.</p>`;
const field=(name,id,values,selected)=>`<label class="fieldLabel" for="${id}">${name}</label>${choice(id,values,selected)}`;

// Native select remains keyboard-accessible; the adjacent icon browser displays
// actual team flags and original crests while searching and selecting a team.
const teamField=(name,id,values,selected)=>`${field(name,id,values,selected)}<div class="teamPickTools"><span class="teamPickCurrent" id="${id}Identity">${TEAMS[selected]?teamIdentity(TEAMS[selected]):''}</span><button type="button" class="btn minor teamBrowseToggle" data-team-browse="${id}" aria-expanded="false" aria-controls="${id}Browse">⚑ BROWSE FLAGS / CRESTS</button></div><div class="teamBrowsePanel hidden" id="${id}Browse"><label class="fieldLabel" for="${id}Search">SEARCH TEAM</label><input class="teamBrowseSearch" id="${id}Search" type="search" data-team-search="${id}" aria-controls="${id}Results" aria-describedby="${id}ResultsStatus" placeholder="Search by team or country" autocomplete="off"/><p class="teamBrowseStatus" id="${id}ResultsStatus" role="status" aria-live="polite" aria-atomic="true"></p><div class="teamBrowseResults" id="${id}Results" role="listbox" aria-label="Teams with flags and crests"></div></div>`;
function updateTeamPickerIcon(id){const target=$(id+'Identity'),team=TEAMS[Number($(id)?.value)];if(target)target.innerHTML=team?teamIdentity(team):'';}
function fillTeamBrowser(id){const select=$(id),panel=$(id+'Browse'),out=$(id+'Results'),status=$(id+'ResultsStatus');if(!select||!panel||!out)return;const query=($(id+'Search')?.value||'').trim().toLocaleLowerCase();const available=[...select.options].filter(o=>o.value!==''&&TEAMS[Number(o.value)]).map(o=>Number(o.value));const matching=available.filter(i=>!query||`${TEAMS[i].name} ${countryName(clubCountry(TEAMS[i]),TEAMS)} ${clubCountry(TEAMS[i])}`.toLocaleLowerCase().includes(query));const first=matching.slice(0,60),active=matching.includes(Number(select.value))?Number(select.value):first[0];out.innerHTML=first.map(i=>`<button type="button" class="teamPickItem ${String(i)===select.value?'selected':''}" role="option" aria-selected="${String(i)===select.value}" tabindex="${i===active?'0':'-1'}" data-pick-team="${id}" data-team-id="${i}">${teamIdentity(TEAMS[i])}<span>${escapeHTML(TEAMS[i].name)}<small>${escapeHTML(countryName(clubCountry(TEAMS[i]),TEAMS))}</small></span></button>`).join('')||'<p class="muted">No matching teams</p>';if(matching.length>60)out.innerHTML+=`<p class="muted">Showing 60 of ${matching.length}. Type to narrow your search.</p>`;if(status)status.textContent=matching.length===0?'No teams found.':matching.length>60?`${matching.length} teams found. Showing the first 60; refine your search to narrow the list.`:`${matching.length} ${matching.length===1?'team':'teams'} found.`;}
function showTeamBrowser(id){const target=$(id+'Browse'),toggle=menu.querySelector(`[data-team-browse="${id}"]`);if(!target)return;const open=target.classList.contains('hidden');menu.querySelectorAll('.teamBrowsePanel').forEach(x=>x.classList.add('hidden'));menu.querySelectorAll('[data-team-browse]').forEach(x=>x.setAttribute('aria-expanded','false'));if(open){target.classList.remove('hidden');if(toggle)toggle.setAttribute('aria-expanded','true');fillTeamBrowser(id);$(id+'Search')?.focus();}}
function teamBrowserKeydown(event){
 const panel=event.target.closest?.('.teamBrowsePanel');if(!panel||panel.classList.contains('hidden'))return false;
 const id=panel.id.replace(/Browse$/,''),options=[...panel.querySelectorAll('[role="option"]')];
 if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(closeNestedMenuLayer())menu.querySelector(`[data-team-browse="${id}"]`)?.focus({preventScroll:true});return true;}
 if(!options.length)return false;
 const current=options.indexOf(document.activeElement),fromSearch=event.target.matches?.('.teamBrowseSearch');let next=-1;
 if(fromSearch&&event.key==='ArrowDown')next=0;
 else if(current>=0){
  if(event.key==='ArrowDown'||event.key==='ArrowRight')next=Math.min(options.length-1,current+1);
  else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=Math.max(0,current-1);
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=options.length-1;
 }
 if(next<0||next===current)return false;
 event.preventDefault();options.forEach((option,index)=>option.tabIndex=index===next?0:-1);
 options[next].focus({preventScroll:true});options[next].scrollIntoView({block:'nearest'});return true;
}

const nations=()=>TEAMS.map((t,i)=>[i,`[${t.group==='bpw_worldcup'?'WC':t.group==='bpw_alltime'?'AT':countryCode(t)||'FC'}] ${t.group==='national26'?'NAT ':t.group==='club26'?'CLB ':t.group==='continental'?'CUP ':t.group==='bpw_worldcup'?'BPW WC ':t.group==='bpw_alltime'?'BPW LEG ':t.group==='legends'?'LEG ':'ARC '}${t.name} (${t.rank})`]);
const categoryOptions=[['all',`ALL ${TEAMS.length} TEAMS`],['arcade','1993 ARCADE TEAMS'],['national26','2026 NATIONAL TEAMS'],['club26','2026 FEATURED GLOBAL CLUBS'],['UEFA','EUROPE CHAMPIONS'],['AFC','ASIA CHAMPIONS'],['CAF','AFRICA CHAMPIONS'],['CONCACAF','NORTH AMERICA CHAMPIONS'],['CONMEBOL','SOUTH AMERICA CHAMPIONS'],['OFC','OCEANIA CHAMPIONS'],['legends','LEGENDARY TEAMS'],['bpw_worldcup','BPW WORLD CUP ALL-STARS (1998–2018)'],['bpw_alltime','BPW ALL-TIME LEGENDARY 12 ★']];
const filteredNations=cat=>nations().filter(([i])=>cat==='all'||cat==='arcade'&&TEAMS[i].group===undefined||cat==='club26'&&TEAMS[i].group==='club26'||cat==='national26'&&TEAMS[i].group==='national26'||cat==='legends'&&TEAMS[i].group==='legends'||cat==='bpw_worldcup'&&TEAMS[i].group==='bpw_worldcup'||cat==='bpw_alltime'&&TEAMS[i].group==='bpw_alltime'||['UEFA','AFC','CAF','CONCACAF','CONMEBOL','OFC'].includes(cat)&&TEAMS[i].continent===cat);
const roster=i=>(edits[TEAMS[i].id]||rosterFor(i)).map(withStats);
const playerOVR=(p,position=p?.role)=>overallForPosition(p,position);
const playerAbilityIcons=p=>ABILITY_ICONS.summary(p,SHOTS,ABILITIES.DEFENCE_MOVES,DRIBBLES.DRIBBLE_STYLES,STUDIO_MAGIC_TRICK_FULL_CATALOGUE);
// New specialist equipment is unlocked only by source-verified canonical tiers.
// Existing records remain visible and can still be kept or removed.
const studioEliteEligible=p=>['Gold','Star','Superstar'].includes(verifiedRatingTierForPlayer(p));
const studioMagicEligible=p=>!!p&&p.role!=='GK'&&['Star','Superstar'].includes(verifiedRatingTierForPlayer(p));
const studioVerifiedDribbleEligible=p=>['Gold','Star','Superstar'].includes(verifiedRatingTierForPlayer(p));
const studioSpinBumpEligible=p=>!!p&&p.role!=='GK'&&p.src?.role!=='GK'&&['Gold','Star','Superstar'].includes(verifiedRatingTierForPlayer(p));
const studioSandTrapEligible=p=>!!p&&p.role!=='GK'&&p.src?.role!=='GK'&&['Gold','Star','Superstar'].includes(verifiedRatingTierForPlayer(p));
const studioLightningEligible=p=>!!p&&p.role!=='GK'&&p.src?.role!=='GK'&&['Gold','Star','Superstar'].includes(verifiedRatingTierForPlayer(p));
const studioWindEligible=p=>!!p&&p.role!=='GK'&&p.src?.role!=='GK'&&['Gold','Star','Superstar'].includes(verifiedRatingTierForPlayer(p));
const studioMudEligible=p=>!!p&&p.role!=='GK'&&p.src?.role!=='GK'&&['Gold','Star','Superstar'].includes(verifiedRatingTierForPlayer(p));
const planFor=i=>safePlan(teamPlans[TEAMS[i].id],roster(i),i);
// Career tactics belong to the selected Career slot. The global teamPlans map
// remains the source for non-Career modes and is consulted only to migrate
// older Career saves that predate their embedded teamPlan field.
function careerPlanFor(c){if(!c||!Array.isArray(c.roster))return null;return safePlan(c.teamPlan??teamPlans[TEAMS[c.club]?.id],c.roster,c.club);}
function ensureCareerTeamPlan(c){if(!c||!Array.isArray(c.roster)||Object.hasOwn(c,'teamPlan'))return c;const migrated={...c,teamPlan:careerPlanFor(c)};try{careerSlots.save(careerSlots.active,migrated);store.put('managerCareer',migrated);}catch(error){console.warn('Career tactics migration could not be saved:',error.message);}return migrated;}
if(career)career=ensureCareerTeamPlan(career);
const identity=i=>teamIdentity(TEAMS[i]);
const menuVisible=()=>!menu.classList.contains('hidden');
const closeMenu=()=>{input.cancelAll();audio.sceneChange('match');menu.classList.add('hidden');hud.classList.remove('hidden');touch.classList.toggle('hidden',!matchMedia('(pointer:coarse)').matches)};
let lanLobbyDispose=null,lanRuntime=null,lanPeer=null,lanRole=null,lanFailureSince=0,lanFinish=null,lanPlayerNames=null,lanResultCleanupPending=false;
function stopLanMatch(){
  lanRuntime?.dispose();lanRuntime=null;
  lanPeer?.dispose();lanPeer=null;lanRole=null;lanPlayerNames=null;lanFailureSince=0;lanFinish=null;lanResultCleanupPending=false;
}
function stopOnlineServerMatch(){onlineMatchManualStop=true;try{onlineMatchClient?.disconnect();}finally{onlineMatchClient=null;onlineMatchSendAccumulator=0;onlineMatchSnapshotTick=-1;onlineMatchSequence=0;onlineMatchReported=false;onlineMatchFinalSnapshot=null;onlineMatchFinalMatchId=null;onlineMatchManualStop=false;lanRole=null;}}
const show=(html,id='home')=>{if(screen==='CONTROLS'&&id!=='CONTROLS')cancelControlsChargePractice();if(onlineMatchClient&&id!=='ONLINE MATCH')stopOnlineServerMatch();if(lanLobbyDispose){lanLobbyDispose();lanLobbyDispose=null;}if(lanRuntime){const resultPage=['FULL TIME','CAREER MATCH RESULT','CONTINENTAL RESULT'].includes(id),hostPending=lanRole==='host'&&resultPage&&['pending','failed'].includes(lanRuntime.resultAckStatus),guestAckPending=lanRole==='guest'&&resultPage&&lanRuntime.guestResultAckStatus==='pending';if(hostPending||guestAckPending)lanResultCleanupPending=true;else stopLanMatch();}audio.sceneChange(id==='HALF TIME'?'halftime':id==='PAUSED'?'silent':'menu');screen=id;menu.classList.remove('hidden','blank');const nameDialog=id==='SAVE SLOT NAME';menu.innerHTML=`<div class="menubox">${nameDialog?'':`<div class="screenTools">${button('⛶ FULLSCREEN','fullscreen','minor fullscreenTool')}</div>`}${html}${nameDialog?'':`<div class="copyright">INDEPENDENT HD SOCCER ENGINE • ORIGINAL CODE & GRAPHICS • NO EMULATOR • EARLY ACCESS BUILD</div>`}</div>`;hud.classList.add('hidden');touch.classList.add('hidden')};
function page(title,subtitle,body,returnAction='home'){if(screen==='CONTROLS'&&title!=='CONTROLS')cancelControlsChargePractice();if(returnAction==='home'&&menuEntryReturn!=='home')returnAction=menuEntryReturn;const routeChanged=screen!==title;menuBackAction=returnAction;show(`<div class="row space"><div><div class="topline">HIGH-DEFINITION CARTOON SOCCER</div><h1 class="heading" tabindex="-1">${title}</h1><div class="subtitle">${subtitle}</div></div>${button('← BACK',returnAction,'minor')}</div>${body}`,title);if(routeChanged)menu.querySelector('.heading')?.focus({preventScroll:true})}
const unsavedFormScreens=new Set(['PLAYER CUSTOMIZATION','MANAGER APPEARANCE','PLAYER DATA EDITOR','CUSTOM CLUB BUILDER','TEAM COMMAND CENTER','HALF TIME']);
function menuHasUnsavedFormChanges(){
 if(!unsavedFormScreens.has(screen))return false;
 return [...menu.querySelectorAll('input,select,textarea')].some(field=>{
  if(field.disabled||field.id==='customPose'||field.id==='studioGalleryPhase')return false;
  if(field.type==='file')return !!field.files?.length;
  if(field.tagName==='SELECT')return [...field.options].some(option=>option.selected!==option.defaultSelected);
  if(field.type==='checkbox'||field.type==='radio')return field.checked!==field.defaultChecked;
  return field.value!==field.defaultValue;
 });
}
function confirmDiscardBeforeBack(actionId){
 if(actionId!==menuBackAction||!menuHasUnsavedFormChanges())return true;
 return confirm('Discard unsaved changes and leave this screen? Choose Cancel to stay and keep editing.');
}
// v0.8.24.7 — Menu handoff: five primary categories, no new gameplay modes.
// Existing action handlers, saves, teams and engine remain the authority.
const menuParents={
 'nav-quick':'home','nav-device':'navQuick','nav-online':'home','nav-online-career':'navOnline','nav-online-ultimate':'navOnline','nav-career':'home',
 'nav-cups':'home','nav-international':'navCups','nav-clubs':'navCups',
 'nav-settings':'home','nav-settings-game':'navSettings','nav-settings-graphics':'navSettings',
 'nav-settings-sound':'navSettings','nav-customize':'navSettings','nav-input':'navSettings',
 'nav-saves':'navSettings','nav-about':'navSettings','nav-later':'navCups'
};
const navFocusMap={};let menuBackAction='home',menuEntryReturn='home',customizationReturn='home';
function restoreHomeMenuFocus(){const target=menu.querySelector(`[data-action="${navFocusMap.home||'navQuick'}"]`)||menu.querySelector('.navChoice');target?.focus({preventScroll:true});}
const navItem=(label,act,description='',availability='active',icon='⚽')=>({label,act,description,availability,icon});
// Child-route cards use the same crisp vector language as Home. These emblems
// are decorative; the existing button label remains the only spoken name.
const NAV_ROUTE_ICON_PATHS={
  navOnDevice:`<rect x="7" y="13" width="34" height="22" rx="6"/><path d="M15 19v10M10 24h10M32 20h.1M37 28h.1"/><circle cx="32" cy="20" r="2.2" class="iconFill"/><circle cx="37" cy="28" r="2.2" class="iconFill"/>`,
  navLan:`<circle cx="24" cy="34" r="3" class="iconFill"/><path d="M16 26a11 11 0 0 1 16 0M10 20a20 20 0 0 1 28 0M5 14a27 27 0 0 1 38 0M24 37v5M18 42h12"/>`,
  navOnlineP2P:`<circle cx="10" cy="24" r="5"/><circle cx="38" cy="12" r="5"/><circle cx="38" cy="36" r="5"/><path d="m15 22 18-8M15 26l18 8M24 20v8"/>`,
  quick:`<circle cx="24" cy="24" r="17"/><path d="m24 13 7 5-3 8h-8l-3-8 7-5ZM17 18l-7 2M17 26l-5 7M28 26l5 7M31 18l7 2"/>`,
  versus:`<circle cx="17" cy="15" r="6"/><circle cx="32" cy="17" r="5"/><path d="M6 39v-3c0-8 4-12 11-12s11 4 11 12v3M26 27c7-3 14 1 15 8v4H29"/>`,
  pk:`<path d="M7 8v32M41 8v32M7 24h34M15 16h18M15 32h18"/><circle cx="24" cy="24" r="5" class="iconFill"/>`,
  training:`<path d="M8 39h32M12 35l5-13 5 13M27 35l5-22 5 22"/><path d="m23 10 1.5 3.5L28 15l-3.5 1.5L23 20l-1.5-3.5L18 15l3.5-1.5L23 10Z" class="iconFill"/>`,
  laterUltimate:`<circle cx="24" cy="24" r="16"/><path d="m24 12 3.6 7.4 8.2 1.2-5.9 5.8 1.4 8.2-7.3-3.9-7.3 3.9 1.4-8.2-5.9-5.8 8.2-1.2L24 12Z" class="iconFill"/>`,
  laterOnlineCareer:`<path d="M9 38V15h30v23H9ZM16 15V9h16v6M15 24h18M15 30h11"/><circle cx="32" cy="31" r="5" class="iconFill"/>`,
  laterOnlineCup:`<path d="M15 8h18v10c0 8-4 13-9 13s-9-5-9-13V8ZM15 12H8v5c0 5 3 8 8 8M33 12h7v5c0 5-3 8-8 8M24 31v7M17 40h14"/><path d="m24 12 1.4 2.8 3.1.5-2.2 2.2.5 3.1-2.8-1.5-2.8 1.5.5-3.1-2.2-2.2 3.1-.5L24 12Z" class="iconFill"/>`,
  navNewCareer:`<path d="M8 39h32M11 34V24h7v10M21 34V18h7v16M31 34V10h7v24M9 13h11M14.5 7.5v11"/>`,
  manager:`<rect x="9" y="7" width="30" height="34" rx="4"/><circle cx="24" cy="19" r="6"/><path d="M15 35c1-6 4-9 9-9s8 3 9 9M15 12h4M29 12h4"/>`,
  navCareerSlots:`<path d="M8 10h32v30H8zM8 18h32M8 27h32M14 14h5M14 23h5M14 33h8"/><circle cx="34" cy="14" r="2" class="iconFill"/>`,
  navInternational:`<circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c5 5 7 10 7 17s-2 12-7 17M24 7c-5 5-7 10-7 17s2 12 7 17M10 15h28M10 33h28"/>`,
  navClubs:`<path d="M24 6 40 12v11c0 10-7 16-16 20C15 39 8 33 8 23V12L24 6Z"/><path d="M15 24h18M24 15v18M17 17l14 14M31 17 17 31"/>`,
  league:`<path d="M8 39h32M12 34V25h7v9M22 34V16h7v18M32 34V9h7v25"/><path d="m11 18 8-6 7 2 12-8M34 6h4v4"/>`,
  navCupSlots:`<path d="M8 9h32v31H8zM8 17h32M8 25h32M8 33h32"/><path d="M18 14h12M19 22h10M20 30h8M24 33v5"/>`,
  laterCustomCup:`<path d="M15 8h18v10c0 8-4 13-9 13s-9-5-9-13V8ZM15 12H8v5c0 5 3 8 8 8M33 12h7v5c0 5-3 8-8 8M24 31v7M17 40h14M35 7v8M31 11h8"/>`,
  laterCustomLeague:`<path d="M8 39h32M11 34V25h7v9M22 34V17h7v17M33 34V9h6v25M31 7h10"/><path d="m16 18 8-7 8 2"/>`,
  laterWorldCup:`<circle cx="24" cy="15" r="8"/><path d="M20 23 16 31h16l-4-8M18 31l-3 9h18l-3-9M8 22h8M32 22h8M24 7V4"/>`,
  laterAsian:`<path d="M24 7 28 18l12 1-9 7 3 12-10-7-10 7 3-12-9-7 12-1 4-11Z"/><path d="M24 7v24M12 19h24"/>`,
  laterEuro:`<circle cx="24" cy="24" r="17"/><path d="m24 10 3 9h9l-7 5 3 9-8-5-8 5 3-9-7-5h9l3-9Z" class="iconFill"/>`,
  laterCopa:`<path d="M14 9h20v12c0 7-4 11-10 11s-10-4-10-11V9ZM14 14H7v5c0 5 3 8 8 8M34 14h7v5c0 5-3 8-8 8M24 32v6M17 41h14"/><path d="M19 5h10v4H19z"/>`,
  laterAfrica:`<path d="m24 5 12 7-2 11-8 17-10-6-4-12 3-12 9-5Z"/><circle cx="25" cy="19" r="3" class="iconFill"/>`,
  laterConcacaf:`<path d="M13 8h22l6 16-6 16H13L7 24l6-16Z"/><path d="m17 16 14 16M31 16 17 32M24 11v26"/>`,
  continents:`<circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c5 5 7 10 7 17s-2 12-7 17M24 7c-5 5-7 10-7 17s2 12 7 17"/><path d="m18 12 3 3-2 4M30 27l4 2-1 5"/>`,
  laterChampions:`<path d="M24 6 40 12v11c0 10-7 16-16 20C15 39 8 33 8 23V12L24 6Z"/><path d="m24 13 2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8 2.4-5Z" class="iconFill"/>`,
  laterEuropa:`<path d="M10 12h28M13 12v24h22V12M19 18h10M19 24h10M19 30h6"/><circle cx="33" cy="32" r="5" class="iconFill"/>`,
  laterPremier:`<path d="M9 38h30L34 18l-7 8-4-17-6 16-7-5-1 18Z"/><circle cx="12" cy="14" r="3" class="iconFill"/>`,
  laterSerie:`<path d="M10 39h28M13 34V19h8v15M27 34V10h8v24"/><path d="M11 14h10M27 6h8"/>`,
  laterBundes:`<circle cx="24" cy="24" r="17"/><path d="M24 9v30M9 24h30M14 14l20 20M34 14 14 34"/><circle cx="24" cy="24" r="4" class="iconFill"/>`,
  laterLaLiga:`<circle cx="24" cy="24" r="17"/><path d="m24 8 4 10 11 2-8 7 2 11-9-6-9 6 2-11-8-7 11-2 4-10Z"/>`,
  laterLigue1:`<circle cx="24" cy="24" r="17"/><path d="M15 32c8 0 8-16 18-16M14 24h8M27 24h8M17 12l-4 4M35 32l-4 4"/>`,
  navGameSettings:`<path d="M8 13h32M8 24h32M8 35h32"/><circle cx="19" cy="13" r="4" class="iconFill"/><circle cx="31" cy="24" r="4" class="iconFill"/><circle cx="16" cy="35" r="4" class="iconFill"/>`,
  navGraphics:`<rect x="6" y="8" width="36" height="25" rx="3"/><path d="M18 40h12M24 33v7M10 28h28"/><circle cx="24" cy="19" r="5" class="iconFill"/>`,
  navSound:`<path d="M7 20h8l10-8v24l-10-8H7zM30 18a9 9 0 0 1 0 12M34 13a16 16 0 0 1 0 22"/>`,
  navCustomization:`<path d="M8 27c0-11 8-19 19-19 8 0 13 5 13 12 0 4-3 7-7 7h-4c-2 0-3 2-2 4 1 3-1 7-6 7-8 0-13-5-13-11Z"/><circle cx="17" cy="19" r="2" class="iconFill"/><circle cx="25" cy="14" r="2" class="iconFill"/><circle cx="32" cy="19" r="2" class="iconFill"/>`,
  navInput:`<rect x="7" y="13" width="34" height="22" rx="6"/><path d="M15 19v10M10 24h10M33 20h.1M37 28h.1M19 9l5 4 5-4"/>`,
  help:`<path d="M12 8h21a4 4 0 0 1 4 4v27H16a4 4 0 0 1-4-4V8ZM12 12H8v23a4 4 0 0 0 4 4"/><path d="M19 17c1-5 10-5 10 1 0 4-5 4-5 8M24 32h.1"/>`,
  playerStudio:`<circle cx="24" cy="16" r="8"/><path d="M9 41c1-10 6-15 15-15s14 5 15 15M16 16h.1M32 16h.1M21 21h6"/>`,
  editor:`<rect x="7" y="7" width="34" height="34" rx="3"/><path d="M18 7v34M29 7v34M7 18h34M7 29h34"/><circle cx="13" cy="13" r="2" class="iconFill"/>`,
  squad:`<path d="M24 8v8M13 21h22M13 21v14M24 21v14M35 21v14"/><circle cx="24" cy="9" r="4"/><circle cx="13" cy="37" r="4"/><circle cx="24" cy="37" r="4"/><circle cx="35" cy="37" r="4"/>`,
  gallery:`<path d="M8 10h32v28H8zM13 32l8-9 5 5 4-5 6 9"/><circle cx="17" cy="17" r="3" class="iconFill"/><path d="m30 8 2-4 2 4"/>`,
  controls:`<rect x="6" y="13" width="36" height="22" rx="6"/><path d="M15 19v10M10 24h10M32 20h.1M37 28h.1"/>`,
  navSaveManagement:`<path d="M9 7h25l5 5v29H9zM15 7v11h17V7M15 41V26h18v15"/><path d="M19 11h7"/>`,
  navAbout:`<circle cx="24" cy="24" r="17"/><path d="M24 21v12M24 15h.1"/>`,
  exportSave:`<path d="M24 7v23M16 22l8 8 8-8M9 34v7h30v-7"/><path d="M15 11h18"/>`,
  importSave:`<path d="M24 31V8M16 16l8-8 8 8M9 34v7h30v-7"/><path d="M15 11h18"/>`,
  careerBackupExport:`<path d="M9 7h25l5 5v29H9zM15 7v11h17V7M15 41V26h18v15"/><path d="M24 29v9M20 34l4 4 4-4"/>`,
  careerBackupImport:`<path d="M9 7h25l5 5v29H9zM15 7v11h17V7M15 41V26h18v15"/><path d="M24 38v-9M20 33l4-4 4 4"/>`
 };
const NAV_ROUTE_ICON_FALLBACKS={ '🎮':'navInput','📡':'navLan','🌐':'navInternational','⚽':'quick','🥅':'pk','💥':'training','⭐':'laterUltimate','💼':'manager','🏆':'navCupSlots','💾':'navCareerSlots','🌍':'navInternational','🌏':'laterAsian','🌎':'laterConcacaf','➕':'laterCustomCup','🖥':'navGraphics','🔊':'navSound','🎨':'navCustomization','📖':'help','👆':'controls','⬇':'exportSave','⬆':'importSave' };
function navRouteIconMarkup(action,fallback='⚽'){
 const paths=NAV_ROUTE_ICON_PATHS;
 const path=paths[action]||paths[NAV_ROUTE_ICON_FALLBACKS[fallback]||'quick'];
 return `<svg focusable="false" aria-hidden="true" class="modeIconSvg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}
function menuChoices(id,title,subtitle,entries,back='home',extra=''){
 menuBackAction=back;
 const cards=entries.map((e,i)=>{const descriptionId=`${id}-choice-description-${i}`;return `<button type="button" class="btn navChoice ${e.availability==='later'?'navLater':''}" data-action="${escapeHTML(e.act)}" ${i===0?'data-default-focus="true"':''} aria-label="${escapeHTML(e.label+(e.availability==='later'?' coming later':''))}" aria-describedby="${escapeHTML(descriptionId)}"><span class="navIcon modeGraphic navRouteGraphic" aria-hidden="true">${navRouteIconMarkup(e.act,e.icon)}</span><span class="navCopy"><strong>${escapeHTML(e.label)}</strong><small id="${escapeHTML(descriptionId)}">${escapeHTML(e.description)}</small></span><span class="navStatus">${e.availability==='later'?'COMING LATER':'›'}</span></button>`;}).join('');
 show(`<div class="navScreen"><div class="row space navHeader"><div><div class="topline">SUPERMAGIC FOOTBALL</div><h1 class="heading">${escapeHTML(title)}</h1><p class="subtitle">${escapeHTML(subtitle)}</p></div>${button('← BACK',back,'minor navBack')}</div><div class="arenaDirectoryLabel"><span>CHOOSE YOUR PATH</span><small>ALL MODES, ONE ARENA</small></div><div class="navList">${cards}</div>${extra}</div>`,id);
 // Restore the selected item in its parent after returning; do not steal focus from clicks.
 if(navFocusMap[id]){const match=menu.querySelector(`[data-action="${navFocusMap[id]}"]`);if(match){match.focus({preventScroll:true});return;}}
 menu.querySelector('.navChoice')?.focus({preventScroll:true});
}
const comingLater=(title,description,back='navCups')=>{
 menuBackAction=back;
 page(title,'Planned feature — not available in this version.',`<div class="panel navInfo"><h2>COMING LATER</h2><p>${escapeHTML(description)}</p><p>No substitute gameplay is launched. Existing saves are unchanged.</p>${button('← BACK',back,'gold')}</div>`,back);
};
function startLanQuickMatch(peer,role,opponentName,ownName){
  activeMatchReceiptId=null;
  if(lanRuntime)stopLanMatch();
  home=0;away=9;mode='versus';humans=2;
  game.init({home,away,mode,humans,rosters:[roster(home),roster(away)],
    lineups:[planFor(home).lineup.slice(),planFor(away).lineup.slice()],
    formations:[planFor(home).formation,planFor(away).formation],
    plans:[planFor(home),planFor(away)],
    options:{...opt,weather:opt.weather==='Random'?'Clear':opt.weather,kitChoices:kitSelections.slice()}});
  lanPeer=peer;lanRole=role;lanPlayerNames={home:role==='host'?ownName:opponentName,away:role==='host'?opponentName:ownName};
  try{lanRuntime=createLanLiveMatch({peer,role,game,input,field:ENGINE.WORLD.field,
    awardResult:payload=>awardLanResultWithWalletRetry(payload,{
      awardResult:receipt=>tokenWallet.awardCompletedMatch(receipt),
      retryWallet:()=>tokenWallet.retry()
    })});}
  catch(error){stopLanMatch();game.matchState='none';throw error;}
  closeMenu();drawHUD();toast((peer.relay?'RELAY BACKUP · ':'')+(role==='host'?'LAN HOST · HOME TEAM':'LAN GUEST · AWAY TEAM')+(opponentName?' · vs '+String(opponentName).slice(0,32):''),3000);
}
function returnLanHostToLobby(){
 stopLanMatch();input.cancelAll();game.matchState='none';
 // The lobby DOM and broker registration are still live; expose it again so
 // the host can explicitly approve the next guest without reusing old state.
 menu.classList.remove('hidden','blank');hud.classList.add('hidden');touch.classList.add('hidden');
 audio.sceneChange('menu');
}
function showLanLobby(back='navQuick'){
 page('LOCAL NETWORK','Two-player LAN Quick Match · host controls home, guest controls away.',
  '<div id="lanLobby"></div>',back);
 lanLobbyDispose=mountLanLobby($('lanLobby'),{onReady:startLanQuickMatch,onGuestLeft:returnLanHostToLobby});
}
function showOnlineP2PLobby(back='navQuick'){
 page('ONLINE P2P','Automatic internet room discovery or private manual WebRTC · host controls home, guest controls away.',
  '<div id="lanLobby"></div>',back);
 lanLobbyDispose=mountLanLobby($('lanLobby'),{internet:true,onReady:startLanQuickMatch,onGuestLeft:returnLanHostToLobby});
}
function showQuickMenu(){menuChoices('nav-quick','QUICK MATCH','Play on one device, LAN or internet peer-to-peer.',[
 navItem('On Device','navOnDevice','Single-player, two-player, penalties and training.','active','🎮'),
 navItem('Local Network · LAN Quick Match','navLan','Host a game or automatically find a friend on the same LAN game address.','active','📡'),
 navItem('Online P2P · Private Quick Match','navOnlineP2P','Discover internet P2P games automatically or use private manual exchange; some networks need TURN.','active','🌐')],'home');}
function showOnDevice(){menuChoices('nav-device','ON DEVICE','Use the existing playable match setups.',[
 navItem('Single Player vs CPU','quick','Existing team, kit and match setup.','active','⚽'),
 navItem('Two Players · Same Device','versus','Play a local head-to-head match.','active','🎮'),
 navItem('Penalty Shootout','pk','Standalone penalty challenge.','active','🥅'),
 navItem('Training Arena','training','Practice the four action buttons and combinations.','active','💥')],'navQuick');}
function showOnlineMenu(){menuChoices('nav-online','ONLINE MATCHES','Choose a private internet match or a local-network quick match.',[
 navItem('Online Server Match','navOnlineServerMatch','Play a server-simulated match with four-action controls and account sign-in.','active','🌐'),
 navItem('Online P2P · Private Quick Match','navOnlineP2P','Play online with a friend using room discovery or a private invite code.','active','🌐'),
 navItem('Local Network · LAN Quick Match','navLan','Host a game or find a friend on the same local network.','active','📡'),
 navItem('Ultimate Team · Collection','navOnlineUltimate','Acquire canonical teams and players with earned online tokens; local squads stay untouched.','active','⭐'),
 navItem('Online Career · Season','navOnlineCareer','Play a server-managed season, then review fixtures and standings.','active','💼'),
 navItem('Online Cup / League','laterOnlineCup','Multiplayer competitive tournaments.','later','🏆')],'home');}
function onlineMatchStatusText(state){return state==='connecting'?'Connected. Finding an opponent…':state==='queued'?'Searching for an opponent. Keep this screen open.':state==='matched'?'Opponent found. Loading the server match…':state==='resumed'?'Reconnected to the same match.':state==='finished'?'Match complete.':state==='aborted'?'The server stopped this match. No result or reward was recorded.':state==='rejected'?'The server could not add you to matchmaking. Try again shortly.':state==='disconnected'?'Connection lost. The server has paused this match briefly; reconnect or leave.':state==='input-rejected'?'The server rejected an action sample.':'';}
function onlineSelectableTeams(){const serverTeamIds=new Set(TEAMS.map(team=>team.id));return GAME_ASSETS.teams.filter(team=>typeof team?.id==='string'&&serverTeamIds.has(team.id)&&!team.id.startsWith('demo_')&&!['concept_demo','crown_royals_reference'].includes(team.group));}
function onlineMatchTeamOptions(){
 if(!onlineMatchTeamsLoaded)return '<option value="">VERIFYING ONLINE COLLECTION…</option>';
 const owned=new Set(onlineMatchOwnedTeamIds),teams=onlineSelectableTeams().filter(team=>owned.has(team.id));
 if(!teams.some(team=>team.id===onlineMatchTeamId))onlineMatchTeamId=teams.some(team=>team.id==='japan')?'japan':teams[0]?.id||'';
 return teams.map(team=>`<option value="${escapeHTML(team.id)}" ${team.id===onlineMatchTeamId?'selected':''}>${escapeHTML(team.name)}${team.id==='japan'?' · FREE STARTER':''}</option>`).join('');
}
function loadOnlineMatchTeamOwnership(focusAction='onlineMatchTeam'){
 if(onlineMatchTeamsLoading||!onlineAuthSession?.isSignedIn()||!onlineAccountClient)return;
 onlineMatchTeamsRefreshNeeded=false;onlineMatchTeamsLoaded=false;onlineMatchTeamsLoading=true;onlineMatchTeamsError='';
 showOnlineServerMatch();
 void (async()=>{
  try{
   const collection=await onlineAccountClient.loadUltimateTeamCollection();
   if(!onlineAuthSession?.isSignedIn())return;
   const owned=new Set(['japan',...collection.items.filter(item=>item.category==='team').map(item=>item.itemId)]);
   onlineMatchOwnedTeamIds=[...owned].filter(id=>onlineSelectableTeams().some(team=>team.id===id));
   onlineMatchTeamsLoaded=true;
   if(!onlineMatchOwnedTeamIds.includes(onlineMatchTeamId))onlineMatchTeamId=onlineMatchOwnedTeamIds.includes('japan')?'japan':onlineMatchOwnedTeamIds[0]||'';
   onlineMatchTeamsError='';
  }catch(error){
   onlineMatchTeamsLoaded=false;onlineMatchOwnedTeamIds=[];onlineMatchTeamsError=onlineSafeStatus(error);
  }finally{
   onlineMatchTeamsLoading=false;
   if(onlineAuthSession?.isSignedIn())showOnlineServerMatch(focusAction);
  }
 })();
}
function showOnlineServerMatch(focusAction){
 const signed=onlineAuthSession?.isSignedIn()===true,active=!!onlineMatchClient,playing=active&&!!onlineMatchClient?.matchId&&onlineMatchClient.connected&&game.matchState==='play',recoverable=active&&!!onlineMatchClient?.matchId&&!onlineMatchClient.connected&&!onlineMatchCareer;
 const pendingState=onlineHistoryController?.state,pendingRecoveryIds=Array.isArray(pendingState?.pendingMatchIds)?pendingState.pendingMatchIds:pendingState?.pendingMatchId?[pendingState.pendingMatchId]:[],pendingRecovery=!onlineMatchCareer&&pendingRecoveryIds.length>0,pendingCapacityReached=pendingState?.pendingMatchCapacityReached===true;
 const ownership=signed?`<p id="onlineMatchOwnershipStatus" role="status" aria-live="polite" aria-atomic="true">${escapeHTML(onlineMatchTeamsLoading?'Checking your online team collection…':onlineMatchTeamsLoaded?`Verified ${onlineMatchOwnedTeamIds.length} playable teams. Japan is always free.`:onlineMatchTeamsError||'Verify your online team collection before matchmaking.')}</p>${!onlineMatchTeamsLoaded&&!onlineMatchTeamsLoading?button('RETRY TEAM CHECK','onlineMatchTeamsRetry','minor'):''}<label class="fieldLabel" for="onlineMatchTeam">CHOOSE AN OWNED TEAM</label><select id="onlineMatchTeam" class="choice" ${onlineMatchTeamsLoaded?'':'disabled'}>${onlineMatchTeamOptions()}</select>`:'';
  const persistenceWarning=pendingRecovery&&!pendingState?.pendingMatchPersisted?'<p id="onlineMatchStorageWarning" role="status" aria-live="polite">This browser blocked session storage. Keep this tab open: pending match IDs may not survive a page reload.</p>':'';
  const corruptionWarning=pendingState?.pendingStorageInvalid||pendingState?.pendingStorageReadError?'<p id="onlineMatchStorageCorruption" role="alert" aria-live="assertive">Saved pending-match data is damaged or unreadable and has been preserved. Valid IDs that could be read can still be checked against this signed-in account’s server history. New PVP stays disabled until you explicitly discard the damaged data; discarding may strand an unclaimed result.</p>'+button('DISCARD DAMAGED DATA…','onlineMatchDiscardCorrupt','minor'):'';
  const capacityNotice=pendingState?.pendingMatchIds?.length>=pendingState?.pendingMatchCapacity?'<p id="onlineMatchCapacity" role="status" aria-live="polite" aria-atomic="true">Pending-result limit reached (4). Check and confirm a server receipt for a pending result before starting another match.</p>':'';
  const recovery=signed&&pendingRecovery&&!active?`<section class="panel" aria-label="Recover server match results"><h2 class="titleSmall">UNRESOLVED MATCH RESULTS · ${pendingRecoveryIds.length}/${pendingState.pendingMatchCapacity}</h2><p>Each opaque ID is checked only against the currently signed-in account. A missing or unknown status never clears a saved ID.</p>${persistenceWarning}${corruptionWarning}${capacityNotice}<p id="onlineMatchRecoveryStatus" role="status" aria-live="polite" aria-atomic="true">${escapeHTML(onlineMatchRecoveryStatus||onlineMatchStatus||'Checking whether the server confirmed an interrupted match…')}</p><div class="row">${button('VERIFY INTERRUPTED MATCHES','onlineMatchVerifyInterrupted','minor')}${pendingState?.pendingStorageReadError?'':pendingRecoveryIds.map(id=>button(`${onlineHistoryController?.state.recoveryLoading?'CHECKING':'CHECK RESULT'} · ${id.slice(0,8).toUpperCase()}`,'onlineMatchRecover_'+id,'minor')).join('')}</div></section>`:'';
  const controls=active?`<p id="onlineMatchStatus" role="status" aria-live="polite" aria-atomic="true">${escapeHTML(onlineMatchStatus||'Connecting…')}</p><p class="muted">Four actions: pass, shoot, dribble and jump. Move with your configured keyboard, touch or gamepad controls. The match is simulated by the server.</p>${onlineMatchRecoveryStatus?`<p id="onlineMatchStorageWarning" role="status" aria-live="polite">${escapeHTML(onlineMatchRecoveryStatus)}</p>`:''}<div class="row">${button(recoverable?'LEAVE MATCH':playing?'LEAVE ONLINE MATCH':'CANCEL SEARCH','onlineMatchLeave','minor')}${recoverable?button('RETRY CONNECTION','onlineMatchReconnect','gold'):playing?button('RESUME MATCH','onlineMatchResume','gold'):''}${recoverable&&pendingRecovery?button('CHECK LAST RESULT','onlineMatchRecover','minor'):''}</div>${recoverable&&pendingRecovery?`<p id="onlineMatchRecoveryStatus" role="status" aria-live="polite" aria-atomic="true">${escapeHTML(onlineMatchStatus)}</p>`:''}`:signed?`${recovery}${ownership}<p id="onlineMatchStatus" role="status" aria-live="polite" aria-atomic="true">${escapeHTML(onlineMatchStatus||'Ready when you are.')}</p><p class="muted">Quick matchmaking pairs signed-in players. The server owns the clock, score and match simulation. Completed results award server-side soft tokens. Online Career seasons are available from the Online Career menu.</p>${!pendingRecovery?corruptionWarning+capacityNotice:''}<div class="row"><button type="button" class="btn gold" data-action="onlineMatchStart" ${onlineMatchTeamsLoaded&&!pendingCapacityReached?'':'disabled'}>FIND OPPONENT</button></div>`:`${pendingRecovery?'<p id="onlineMatchRecoveryStatus" role="status" aria-live="polite">A previous server match may have a recoverable result. Sign in to check each ID against that account’s server history; no account ownership is inferred from an ID.</p>'+persistenceWarning:''}<p id="onlineMatchStatus" role="status" aria-live="polite" aria-atomic="true">Sign in to request a one-use matchmaking ticket.</p>${onlineAuthPanel('match')}`;
 page('ONLINE MATCH','Server-simulated quick match · sign-in is optional for every other game mode.',`${controls}<p class="muted">${escapeHTML(onlineIdentityError||'')}</p>`,'navOnline');restoreOnlineFocus(focusAction);
 if(signed&&onlineMatchTeamsRefreshNeeded&&!onlineMatchTeamsLoading)loadOnlineMatchTeamOwnership('onlineMatchTeam');
 if(signed&&!active&&pendingRecovery){const key=`${onlineAccountGeneration}:${pendingRecoveryIds.join(',')}`;if(key!==onlineMatchStatusCheckKey){onlineMatchStatusCheckKey=key;void verifyInterruptedPvpPending();}}
}
async function verifyInterruptedPvpPending(){
 if(!onlineHistoryController||!onlineAuthSession?.isSignedIn())return;
 const originScreen=screen;
 const checked=await onlineHistoryController.reconcileInterruptedPending();
 if(!onlineAuthSession?.isSignedIn()||screen!==originScreen)return;
 onlineMatchRecoveryStatus=checked.message||'';onlineMatchStatus=checked.message||onlineMatchStatus;
 showOnlineServerMatch('onlineMatchVerifyInterrupted');
}
function updateOnlineMatchStatus(update){
 const state=typeof update==='string'?update:update?.state;
 if(update&&typeof update==='object'&&update.mode==='career-ai')onlineMatchCareer=true;
 if(state==='matched'&&!onlineMatchCareer){
  const existing=onlineHistoryController?.state.pendingMatchId;
  const saved=onlineHistoryController?.rememberPendingMatch(update?.matchId)===true;
  if(!saved){const state=onlineHistoryController?.state;onlineMatchRecoveryStatus=state?.pendingMatchCapacityReached?'The pending-result limit was reached. This match ID could not be added safely; check the pending receipts before continuing.':state?.pendingStorageInvalid||state?.pendingStorageReadError?'Pending-result storage is unreadable. This match ID could not be added safely.':'Session storage is unavailable; this match ID is only held in memory and may not survive a reload.';}
  else onlineMatchRecoveryStatus='';
 }
 if(state==='aborted'){
  const failedMatchId=typeof update?.matchId==='string'?update.matchId:null,wasCareer=onlineMatchCareer;
  const pendingIds=onlineHistoryController?.state.pendingMatchIds||[];
  const markerClear=!wasCareer&&!failedMatchId||!pendingIds.includes(failedMatchId)||onlineHistoryController?.clearPendingMatch(failedMatchId)===true;
  stopOnlineServerMatch();game.matchState='none';onlineMatchCareer=false;onlineMatchInitialTeamIds=[];onlineCareerActiveFixtureNo=null;onlineMatchManualStop=false;
  if(wasCareer){
   onlineCareerProgressStatus='The fixture stopped after a server simulation error. No result or reward was recorded; the fixture remains available to retry.';
   showOnlineCareer('onlineCareerPlayNext');
  }else{
   onlineMatchStatus=markerClear?'The server stopped this match after a simulation error. No result or reward was recorded; you can try again.':'The server stopped this match without a result or reward, but this browser could not clear its pending-result marker. Check the signed-in account history before retrying.';
   showOnlineServerMatch('onlineMatchStart');
  }
  return;
 }
 onlineMatchStatus=onlineMatchStatusText(state);const status=$('onlineMatchStatus');if(status)status.textContent=onlineMatchStatus;
 if(state==='matched'&&onlineMatchRecoveryStatus)toast('RESULT RECOVERY WARNING · KEEP THIS TAB OPEN',4200);
 if(state==='finished'&&onlineMatchFinalSnapshot&&!onlineMatchReported){if(onlineMatchCareer){onlineCareerProgressLoaded=false;onlineCareerProgressRequested=false;onlineCareerProgressStatus='Career fixture recorded. Refresh the season to see updated standings.';}finishOnlineServerMatch(onlineMatchFinalSnapshot,onlineMatchFinalMatchId);return;}
 if(state==='resumed'){onlineMatchSequence=0;onlineMatchSendAccumulator=0;onlineMatchSnapshotTick=-1;onlineMatchReported=false;onlineMatchFinalSnapshot=null;onlineMatchFinalMatchId=null;game.matchState='play';closeMenu();drawHUD();toast('RECONNECTED · MATCH RESUMED',1800);return;}
 if(state==='matched'){
  resetPlayerSelectionAnnouncement();
  onlineMatchSequence=0;onlineMatchSnapshotTick=-1;onlineMatchReported=false;onlineMatchFinalSnapshot=null;onlineMatchFinalMatchId=null;
  lanRole=onlineMatchClient?.side===1?'guest':'host';
  const selected=onlineMatchCareer&&onlineMatchInitialTeamIds.length===2?onlineMatchInitialTeamIds:[onlineMatchTeamId,null];
  home=TEAMS.findIndex(team=>team.id===selected[0]);if(home<0)home=0;
  away=TEAMS.findIndex(team=>team.id===selected[1]);if(away<0||away===home)away=(home+1)%TEAMS.length;
  mode='versus';humans=onlineMatchCareer?1:2;const plans=[planFor(home),planFor(away)];
  game.init({home,away,mode,humans,rosters:[roster(home),roster(away)],lineups:plans.map(plan=>plan.lineup.slice()),formations:plans.map(plan=>plan.formation),plans,options:{...opt,weather:opt.weather==='Random'?'Clear':opt.weather,kitChoices:kitSelections.slice()}});
  game.matchState='play';closeMenu();drawHUD();toast(onlineMatchCareer?'ONLINE CAREER · FIXTURE '+(onlineCareerActiveFixtureNo||''):'ONLINE MATCH · '+(lanRole==='host'?'HOME TEAM':'AWAY TEAM'),2200);return;
 }
 if(state==='disconnected'&&!onlineMatchCareer&&onlineMatchClient?.matchId){game.matchState='none';onlineMatchStatus=onlineMatchStatusText('disconnected');showOnlineServerMatch('onlineMatchReconnect');return;}
 if(state==='rejected'||state==='disconnected'){
  const reason=state==='rejected'?'The server could not start this online match. Try again shortly.':'The server connection ended.';
  stopOnlineServerMatch();game.matchState='none';onlineMatchStatus=reason;
  if(onlineMatchCareer){onlineCareerProgressStatus=reason;showOnlineCareer('onlineCareerPlayNext');}
  else showOnlineServerMatch('onlineMatchStart');
 }
}
async function reconnectOnlineServerMatch(){
 if(!onlineMatchClient||onlineMatchCareer||onlineMatchClient.connected||!onlineMatchClient.matchId)return;
 onlineMatchStatus='Requesting a secure ticket to resume the paused match…';showOnlineServerMatch('onlineMatchReconnect');
 try{await onlineMatchClient.resume();}
 catch(error){onlineMatchStatus=`Could not resume this match: ${error?.message||'connection failed'}. Check for a result already recorded by the server, retry, or leave.`;showOnlineServerMatch('onlineMatchReconnect');}
}
 async function recoverOnlineServerMatchResult(requestedId=null){
  const pendingIds=onlineHistoryController?.state.pendingMatchIds||[];
  const target=onlineMatchClient?.matchId||(typeof requestedId==='string'?requestedId:pendingIds[0]);
 if(!target||!onlineHistoryController||!onlineAccountClient||!onlineAuthSession?.isSignedIn()){
  onlineMatchStatus='Sign in with the same account to check for this server-recorded result.';showOnlineServerMatch('onlineMatchRecover');return;
 }
 if(onlineMatchCareer){onlineMatchStatus='Online Career results are refreshed from the server season and are not recovered through PVP history.';showOnlineServerMatch('onlineMatchRecover');return;}
 onlineMatchStatus='Checking the signed-in account for this exact match ID…';showOnlineServerMatch('onlineMatchRecover');
 const recovered=await onlineHistoryController.recoverPendingMatch(target);
 if(recovered.status==='found'){
   if(!onlineAuthSession?.isSignedIn()||!onlineHistoryController.state.pendingMatchIds.includes(target)||onlineMatchClient?.matchId&&onlineMatchClient.matchId!==target)return;
  const snapshot={phase:'finished',matchState:'finished',terminal:true,teamIds:[recovered.item.teamId,recovered.item.opponentTeamId],score:recovered.item.score.slice()};
  onlineMatchCareer=false;onlineMatchFinalSnapshot=snapshot;onlineMatchFinalMatchId=target;onlineMatchReported=false;
  finishOnlineServerMatch(snapshot,target);return;
 }
 onlineMatchStatus=recovered.message;showOnlineServerMatch('onlineMatchRecover');
}
async function startOnlineServerMatch({career=false}={}){
 if(!onlineAuthSession?.isSignedIn()||!onlineAccountClient||!onlineConfig){onlineMatchStatus='Sign in with a configured online account before matchmaking.';return showOnlineServerMatch('onlineSignIn_match');}
 if(onlineMatchClient)return;
  if(!career&&(onlineHistoryController?.state.pendingMatchCapacityReached||onlineHistoryController?.state.pendingStorageInvalid||onlineHistoryController?.state.pendingStorageReadError)){onlineMatchStatus=onlineHistoryController?.state.pendingStorageInvalid||onlineHistoryController?.state.pendingStorageReadError?'Saved pending-match data is unreadable. Resolve the session storage issue before starting PVP.':'Pending-result limit reached. Check and confirm a server receipt before starting another PVP match.';return showOnlineServerMatch('onlineMatchRecover');}
 if(!onlineMatchTeamsLoaded){onlineMatchStatus=onlineMatchTeamsLoading?'Checking the online team collection. Please wait.':onlineMatchTeamsError||'Verify the online team collection before matchmaking.';if(!onlineMatchTeamsLoading)onlineMatchTeamsRefreshNeeded=true;return career?showOnlineCareer('onlineCareerPlayNext'):showOnlineServerMatch('onlineMatchTeamsRetry');}
 const teamId=career?onlineCareerSeason?.teamId:onlineMatchTeamId;
 if(career&&(!onlineCareerProgressLoaded||!onlineCareerSeason||onlineCareerSeason.status!=='active'||!onlineCareerSeason.fixtures.some(row=>row.status==='scheduled'))){onlineCareerProgressStatus='Load an active Online Career season before starting a fixture.';return showOnlineCareer('onlineCareerSeasonReload');}
 if(!onlineMatchOwnedTeamIds.includes(teamId)){onlineMatchStatus='Choose Japan or another team owned by this account.';if(career){onlineCareerProgressStatus=onlineMatchStatus;return showOnlineCareer('onlineCareerPlayNext');}return showOnlineServerMatch('onlineMatchTeam');}
 onlineMatchCareer=career;onlineMatchInitialTeamIds=[];onlineCareerActiveFixtureNo=null;onlineMatchTeamId=teamId;
 onlineMatchStatus=career?'Requesting your next server Career fixture…':'Requesting secure match ticket…';onlineIdentityError='';if(career)showOnlineCareer();else showOnlineServerMatch();
 const requestTicket=async()=>{
  if(!career)return onlineAccountClient.requestMatchTicket({teamId});
  const ticket=await onlineAccountClient.requestOnlineCareerTicket();
  if(ticket.teamIds[0]!==teamId)throw new Error('The next Career fixture does not match your owned season team. Refresh the season and retry.');
  onlineCareerActiveFixtureNo=ticket.fixtureNo;onlineMatchInitialTeamIds=ticket.teamIds.slice();return ticket;
 };
 try{
  const client=createOnlineMatchClient({requestTicket,requestResumeTicket:()=>onlineAccountClient.requestMatchResumeTicket(),apiBase:onlineConfig.apiOrigin,onStatus:value=>{if(onlineMatchManualStop)return;updateOnlineMatchStatus(value);},onSnapshot:result=>{
   if(!onlineMatchClient||result.tick<=onlineMatchSnapshotTick)return;onlineMatchSnapshotTick=result.tick;
   const ok=applyOnlineMatchSnapshot(game,ENGINE.WORLD.field,result.snapshot,onlineMatchClient.side,{teamIndexForId:id=>TEAMS.findIndex(team=>team.id===id),playerForId:assetId=>{const [teamId,playerId]=String(assetId).split('/');const player=GAME_ASSETS?.rosters?.[teamId]?.find(row=>row.id===playerId);return player?withStats(player):null;}});if(!ok)throw new Error('Invalid online snapshot');
   const indices=result.snapshot.teamIds.map(id=>TEAMS.findIndex(team=>team.id===id));if(indices.every(index=>index>=0)){home=indices[0];away=indices[1];}
   game.matchState=result.snapshot.phase;if(result.snapshot.phase==='finished'){onlineMatchFinalSnapshot=result.snapshot;onlineMatchFinalMatchId=result.matchId;}
  },onError:error=>{
   if(onlineMatchManualStop)return;onlineIdentityError=error?.message||'Online match connection failed.';
   if(error?.code==='team-not-owned'){onlineMatchTeamsLoaded=false;onlineMatchTeamsRefreshNeeded=true;}
   if(onlineMatchClient){stopOnlineServerMatch();game.matchState='none';if(career){onlineCareerProgressStatus=onlineIdentityError;showOnlineCareer('onlineCareerPlayNext');}else showOnlineServerMatch('onlineMatchStart');}
  }});
  onlineMatchClient=client;await client.connect();
 }catch(error){onlineMatchClient=null;game.matchState='none';onlineIdentityError=error?.message||'Could not connect to the match server.';onlineMatchStatus=onlineIdentityError;
  if(error?.code==='team-not-owned'){onlineMatchTeamsLoaded=false;onlineMatchTeamsRefreshNeeded=true;onlineMatchTeamsError=onlineIdentityError;}
  if(career){onlineCareerProgressStatus=onlineIdentityError;showOnlineCareer('onlineCareerPlayNext');}else showOnlineServerMatch('onlineMatchStart');
 }
}
async function playOnlineCareerNext(){
 if(onlineCareerMatchTicketing||onlineMatchClient)return;
 onlineCareerMatchTicketing=true;onlineCareerProgressStatus='Connecting to your next Online Career fixture…';
 try{await startOnlineServerMatch({career:true});}finally{onlineCareerMatchTicketing=false;}
}function renderOnlineServerResult(snapshot){
 const names=snapshot.teamIds.map(id=>TEAMS[TEAMS.findIndex(team=>team.id===id)]?.name||id);
 const reward=onlineRewardClaimStatus==='claiming'?'<p id="onlineRewardStatus" role="status" aria-live="polite">Confirming server match reward…</p>':onlineRewardClaimStatus.startsWith('claimed:')?'<p id="onlineRewardStatus" role="status" aria-live="polite">'+escapeHTML(onlineRewardClaimStatus.slice(8))+'</p>':'<p id="onlineRewardStatus" role="status" aria-live="polite">'+escapeHTML(onlineRewardClaimStatus||'Match result durably recorded by the server.')+'</p>'+(onlineRewardMatchId&&onlineAuthSession?.isSignedIn()?button('RETRY TOKEN CLAIM','onlineRewardRetry','minor'):'');
 const returnButton=button(onlineMatchCareer?'RETURN TO ONLINE CAREER':'RETURN TO ONLINE MENU',onlineMatchCareer?'navOnlineCareer':'navOnline',onlineMatchCareer?'gold':'gold');
 page('ONLINE MATCH RESULT',names[0]+' '+snapshot.score[0]+' — '+snapshot.score[1]+' '+names[1],'<div class="panel"><h2>MATCH COMPLETE</h2><p>The server confirmed and durably recorded this authoritative result.</p>'+(onlineMatchCareer?'<p>Career fixture '+(onlineCareerActiveFixtureNo||'')+' is complete. Refresh the season table to see the standings update.</p>':'')+reward+'</div>'+returnButton,'navOnline');
}async function claimOnlineMatchReward(){if(!onlineRewardMatchId||!onlineAccountClient||!onlineAuthSession?.isSignedIn()){onlineRewardClaimStatus='Sign in again to claim this server-recorded result.';if(onlineMatchFinalSnapshot)renderOnlineServerResult(onlineMatchFinalSnapshot);return;}onlineRewardClaimStatus='claiming';if(onlineMatchFinalSnapshot)renderOnlineServerResult(onlineMatchFinalSnapshot);try{const result=await onlineAccountClient.claimMatchReward(onlineRewardMatchId);const cleared=onlineHistoryController?.clearPendingMatch(onlineRewardMatchId)===true;onlineRewardClaimStatus='claimed:'+(result.duplicate?'Reward already claimed. ':'+'+result.receipt.reward+' ONLINE TOKENS · BALANCE '+result.balance+'.')+(!cleared?' The receipt is confirmed, but this browser could not clear its pending result marker; check it again before another match.':'');}catch(error){onlineRewardClaimStatus=onlineSafeStatus(error)+' You can retry this claim; the server receipt prevents duplicate credit.';}if(onlineMatchFinalSnapshot)renderOnlineServerResult(onlineMatchFinalSnapshot);}
function finishOnlineServerMatch(snapshot,matchId=onlineMatchFinalMatchId){if(onlineMatchReported)return;onlineMatchReported=true;const safeMatchId=typeof matchId==='string'&&/^[a-f0-9]{32}$/.test(matchId)?matchId:null;onlineRewardMatchId=safeMatchId;onlineRewardClaimStatus=safeMatchId?'claiming':'The server result was recorded, but no reward claim ID was available.';stopOnlineServerMatch();onlineMatchReported=true;game.matchState='none';onlineMatchFinalSnapshot=snapshot;onlineMatchFinalMatchId=safeMatchId;renderOnlineServerResult(snapshot);if(safeMatchId)void claimOnlineMatchReward();}
function leaveOnlineServerMatch(){const hadMatchId=!!(onlineMatchClient?.matchId||onlineHistoryController?.state.pendingMatchId),wasCareer=onlineMatchCareer;if(onlineMatchClient){try{onlineMatchClient.disconnect()}catch{};onlineMatchClient=null;}onlineMatchCareer=false;onlineMatchInitialTeamIds=[];onlineCareerActiveFixtureNo=null;onlineMatchManualStop=false;onlineMatchSendAccumulator=0;onlineMatchSnapshotTick=-1;lanRole=null;game.matchState='none';onlineMatchStatus=hadMatchId?'Connection left. The result is unresolved; check this account’s server history before starting another PVP match.':wasCareer?'Career connection left. Reopen Online Career to check the server-managed fixture status.':'Match search cancelled before a match was assigned.';showOnlineServerMatch(hadMatchId?'onlineMatchRecover':'onlineMatchStart');}
function normalizeOnlineConfig(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const {apiOrigin,issuer,clientId,audience='',redirectUri}=raw;
 if([apiOrigin,issuer,clientId,redirectUri].some(value=>typeof value!=='string'||!value.trim()))return null;
 try{
  const api=new URL(apiOrigin),identity=new URL(issuer),redirect=new URL(redirectUri);
  const localApi=['localhost','127.0.0.1','[::1]'].includes(api.hostname);
  if(!['https:'].includes(api.protocol)&&!(localApi&&api.protocol==='http:'))return null;
  if(api.origin!==apiOrigin.replace(/\/$/,''))return null;
  if(identity.protocol!=='https:'||identity.username||identity.password||identity.hash)return null;
  if(redirect.protocol!=='https:'||redirect.origin!==location.origin||redirect.username||redirect.password||redirect.hash)return null;
  if(typeof audience!=='string'||audience.length>256)return null;
  return Object.freeze({apiOrigin:api.origin,issuer:identity.href,clientId:clientId.trim(),audience,redirectUri:redirect.href});
 }catch{return null;}
}
function initializeOnlineAccount(){
 onlineConfig=normalizeOnlineConfig(window.SMF_ONLINE_CONFIG);
 if(!onlineConfig)return false;
 try{
  onlineAuthSession=createOnlineOidcSession({issuer:onlineConfig.issuer,clientId:onlineConfig.clientId,redirectUri:onlineConfig.redirectUri,audience:onlineConfig.audience});
  onlineAccountClient=createOnlineAccountClient({getAccessToken:()=>onlineAuthSession?.getAccessToken()||null,baseUrl:onlineConfig.apiOrigin});
  onlineHistoryController=createOnlineHistoryController({loadPage:options=>onlineAccountClient.loadMatchHistory(options),loadStatuses:ids=>onlineAccountClient.loadMatchStatuses(ids),isSignedIn:()=>onlineAuthSession?.isSignedIn()===true,describeError:onlineSafeStatus});
 }catch{onlineConfig=null;onlineIdentityError='Online sign-in configuration is invalid. Offline game modes remain available.';return false;}
  const generation=onlineAccountGeneration;
  const signOutGeneration=onlineAccountSignOutGeneration;
  onlineAuthSession.completeRedirect().then(result=>{
   if(generation!==onlineAccountGeneration){if(result.completed&&signOutGeneration!==onlineAccountSignOutGeneration&&onlineAccountGeneration===onlineAccountSignOutAtGeneration)onlineAuthSession?.signOut();return;}
  let returnRoute='';try{returnRoute=sessionStorage.getItem('smf.online.account.return.v1')||'';sessionStorage.removeItem('smf.online.account.return.v1')}catch{}
  const route=returnRoute==='online-ultimate'?'ultimate':returnRoute==='online-career'?'career':returnRoute==='online-match'?'match':'';
  if(result.completed){onlineIdentityError='';onlineCareerStatus='Signed in. Online features sync copies only; offline saves remain separate.';onlineUtStatus='Signed in. Online features sync copies only; offline saves remain separate.';if(route==='ultimate')showOnlineUltimateTeam();else if(route==='career')showOnlineCareer();else if(route==='match'){onlineMatchTeamsRefreshNeeded=true;showOnlineServerMatch();}else showOnlineMenu();}
  else if(result.error){onlineIdentityError='Sign-in was not completed. Check the identity configuration and try again.';if(route==='ultimate')showOnlineUltimateTeam();else if(route==='career')showOnlineCareer();else if(route==='match')showOnlineServerMatch();}
  }).catch(()=>{if(generation===onlineAccountGeneration)onlineIdentityError='Sign-in could not be completed. Check the identity configuration and try again.';});
 return true;
}
function onlineSafeStatus(error){
 if(error instanceof OnlineAccountError)return error.message;
 if(error?.code==='identity-sign-in-storage-unavailable')return 'Secure sign-in needs temporary session storage, which this browser blocked.';
 return 'The online request failed safely. Check the connection and account configuration, then retry.';
}
function onlineAuthPanel(route){
 if(!onlineConfig||!onlineAccountClient)return `<section class="panel" aria-label="Online account configuration"><h2 class="titleSmall">ONLINE ACCOUNT NOT CONFIGURED</h2><p>This build has no public account API and identity settings. Offline Career, saves, teams and matches remain available.</p><p class="muted">Online sign-in and account sync are unavailable until API origin, OIDC issuer, public client ID, audience and same-site redirect are configured.</p></section>`;
 const signedIn=onlineAuthSession?.isSignedIn()===true;
 return `<section class="panel" aria-label="Online account"><h2 class="titleSmall">${signedIn?'ACCOUNT SIGNED IN':'ACCOUNT SIGN IN'}</h2><p>${signedIn?'Your bearer token remains in memory for this tab only.':'Use the configured identity provider. Sign-in uses authorization code with PKCE.'}</p><div class="row">${signedIn?button('SIGN OUT','onlineSignOut','minor'):button('SIGN IN','onlineSignIn_'+route,'gold')}</div></section>`;
}
function onlineStatusMarkup(status){return `<p id="onlineAccountStatus" role="status" aria-live="polite" aria-atomic="true">${escapeHTML(status||'')}</p>`;}
function restoreOnlineFocus(actionId){if(!actionId)return;menu.querySelector(`[data-action="${actionId}"]`)?.focus({preventScroll:true});}
function setOnlineRouteStatus(route,status,focusAction){if(route==='career')onlineCareerStatus=status;else if(route==='ultimate')onlineUtStatus=status;else onlineIdentityError=status;if(route==='career')showOnlineCareer(focusAction);else if(route==='ultimate')showOnlineUltimateTeam(focusAction);else showOnlineServerMatch(focusAction);}
function localCareerSlotFromBackup(number){
 if(!Number.isInteger(number)||number<1||number>10)throw new Error('Choose a valid occupied local Career slot.');
 const backup=JSON.parse(careerSlots.exportBackup()),vault=JSON.parse(backup.payload),slot=vault.slots[number-1];
 if(!slot)throw new Error('That local Career slot is empty.');
 return JSON.parse(JSON.stringify(slot));
}
function currentRemoteCareer(){return onlineCareerRecord?.payload&&typeof onlineCareerRecord.payload==='object'?onlineCareerRecord.payload:null;}
function localCareerSlotOptions(){
 const occupied=careerSlots.list().filter(slot=>slot.occupied);
 if(!onlineCareerSourceSlotNumber||!occupied.some(slot=>slot.number===onlineCareerSourceSlotNumber))onlineCareerSourceSlotNumber=occupied[0]?.number??null;
 return occupied.map(slot=>`<option value="${slot.number}" ${slot.number===onlineCareerSourceSlotNumber?'selected':''}>SLOT ${slot.number} · ${escapeHTML(slot.name)} · Season ${escapeHTML(slot.season??'—')} · Week ${escapeHTML(slot.week??'—')}</option>`).join('');
}
function emptyCareerSlotOptions(){
 const empty=careerSlots.list().filter(slot=>!slot.occupied);
 if(!empty.some(slot=>slot.number===onlineCareerTargetSlotNumber))onlineCareerTargetSlotNumber=empty[0]?.number??null;
 return empty.map(slot=>`<option value="${slot.number}" ${slot.number===onlineCareerTargetSlotNumber?'selected':''}>EMPTY LOCAL SLOT ${slot.number}</option>`).join('');
}
function onlineCareerOwnedTeamOptions(){
 const owned=new Set(['japan',...onlineUtCollection.filter(item=>item.category==='team').map(item=>item.itemId)]);
 const teams=onlineSelectableTeams().filter(team=>owned.has(team.id));
 if(!teams.some(team=>team.id===onlineCareerTeamId))onlineCareerTeamId=teams.some(team=>team.id==='japan')?'japan':teams[0]?.id||'';
 return teams.map(team=>'<option value="'+escapeHTML(team.id)+'" '+(team.id===onlineCareerTeamId?'selected':'')+'>'+escapeHTML(team.name)+(team.id==='japan'?' · FREE STARTER':'')+'</option>').join('');
}
function onlineCareerSeasonMarkup(){
 const season=onlineCareerSeason;
 if(onlineCareerProgressLoading)return '<p id="onlineCareerSeasonStatus" role="status" aria-live="polite">Loading your server Career and team entitlements…</p>';
 if(!onlineCareerProgressLoaded)return '<p id="onlineCareerSeasonStatus" role="status" aria-live="polite">'+escapeHTML(onlineCareerProgressStatus||'Load your Online Career from the server.')+'</p>'+button('LOAD ONLINE CAREER','onlineCareerSeasonReload','minor');
 if(!season)return '<p id="onlineCareerSeasonStatus" role="status" aria-live="polite">'+escapeHTML(onlineCareerProgressStatus||'No Online Career season yet. Choose an owned team to begin.')+'</p><label class="fieldLabel" for="onlineCareerTeam">CHOOSE YOUR OWNED TEAM</label><select id="onlineCareerTeam" class="choice">'+onlineCareerOwnedTeamOptions()+'</select><p class="muted">Play an eight-fixture server-managed season against server-controlled teams. Results and standings update only after the server records each final match.</p>'+button('START ONLINE CAREER SEASON','onlineCareerSeasonStart','gold');
 const fixtures=season.fixtures.map(row=>{
  const home=TEAMS.find(team=>team.id===row.teamIds[0])?.name||row.teamIds[0],away=TEAMS.find(team=>team.id===row.teamIds[1])?.name||row.teamIds[1],score=row.score?' · '+row.score[0]+'–'+row.score[1]:'';
  return '<li><strong>FIXTURE '+row.fixtureNo+'</strong> · '+escapeHTML(home)+' vs '+escapeHTML(away)+' · '+(row.status==='completed'?'PLAYED'+score:'UP NEXT')+'</li>';
 }).join('');
 const standings=season.standings.length?'<div class="scroll"><table class="miniTable"><thead><tr><th>TEAM</th><th>PL</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th></tr></thead><tbody>'+season.standings.map(row=>'<tr><td>'+escapeHTML(TEAMS.find(team=>team.id===row.teamId)?.name||row.teamId)+'</td><td>'+row.played+'</td><td>'+row.wins+'</td><td>'+row.draws+'</td><td>'+row.losses+'</td><td>'+row.goalDifference+'</td><td>'+row.points+'</td></tr>').join('')+'</tbody></table></div>':'<p>Standings appear after the first completed fixture.</p>';
 const next=season.fixtures.find(row=>row.status==='scheduled');
 return '<p class="fixture">ONLINE SEASON · '+escapeHTML(season.status.toUpperCase())+' · '+season.playedCount+'/'+season.fixtureCount+' FIXTURES · '+escapeHTML(TEAMS.find(team=>team.id===season.teamId)?.name||season.teamId)+'</p><p id="onlineCareerSeasonStatus" role="status" aria-live="polite">'+escapeHTML(onlineCareerProgressStatus||'Server-owned season progress loaded.')+'</p><div class="row">'+button('REFRESH SEASON','onlineCareerSeasonReload','minor')+(next?button('PLAY FIXTURE '+next.fixtureNo,'onlineCareerPlayNext','gold'):button('START NEXT SEASON','onlineCareerSeasonStart','gold'))+'</div><h3 class="titleSmall">FIXTURES</h3><ol class="onlineMatchHistoryList">'+fixtures+'</ol><h3 class="titleSmall">STANDINGS</h3>'+standings;
}
function onlineCareerArchiveMarkup(){
 if(!onlineCareerProgressLoaded)return '';
 const archived=onlineCareerSeasons.slice(0,20);
 if(!archived.length)return '<section class="panel" aria-label="Online Career archives"><h2 class="titleSmall">PAST ONLINE SEASONS</h2><p>Completed season standings and fixtures will be saved here.</p></section>';
 const entries=archived.map((row,index)=>{
  const own=TEAMS.find(team=>team.id===row.teamId)?.name||row.teamId,standing=row.standings.find(item=>item.teamId===row.teamId),record=standing?`${standing.wins}W · ${standing.draws}D · ${standing.losses}L · ${standing.points} PTS`:'No played fixtures';
  const fixtures=row.fixtures.map(fixture=>{const opponent=TEAMS.find(team=>team.id===fixture.teamIds[1])?.name||fixture.teamIds[1],score=fixture.score?` · ${fixture.score[0]}–${fixture.score[1]}`:'';return `<li>FIXTURE ${fixture.fixtureNo} · ${escapeHTML(opponent)} · ${fixture.status==='completed'?'PLAYED'+score:'NOT PLAYED'}</li>`}).join('');
  const table=row.standings.length?'<div class="scroll"><table class="miniTable"><caption class="srOnly">Online Career season '+(index+1)+' final standings for '+escapeHTML(own)+'</caption><thead><tr><th scope="col">TEAM</th><th scope="col">PL</th><th scope="col">W</th><th scope="col">D</th><th scope="col">L</th><th scope="col">GD</th><th scope="col">PTS</th></tr></thead><tbody>'+row.standings.map(item=>'<tr><th scope="row">'+escapeHTML(TEAMS.find(team=>team.id===item.teamId)?.name||item.teamId)+'</th><td>'+item.played+'</td><td>'+item.wins+'</td><td>'+item.draws+'</td><td>'+item.losses+'</td><td>'+item.goalDifference+'</td><td>'+item.points+'</td></tr>').join('')+'</tbody></table></div>':'<p>No standings were recorded.</p>';
  return `<details><summary>PAST SEASON ${index+1} · ${escapeHTML(own)} · ${row.status==='complete'?'COMPLETE':'IN PROGRESS'} · ${row.playedCount}/${row.fixtureCount} · ${escapeHTML(record)}</summary><h3 class="titleSmall">FINAL STANDINGS</h3>${table}<h3 class="titleSmall">FIXTURE RECORD</h3><ol class="onlineMatchHistoryList">${fixtures}</ol></details>`;
 }).join('');
 return `<section class="panel" aria-label="Online Career archives"><h2 class="titleSmall">PAST ONLINE SEASONS</h2><p>Your most recent completed seasons are stored with server results, standings, and fixtures.</p><div class="onlineCareerArchiveList">${entries}</div></section>`;
}
function loadOnlineCareerProgress(focusAction='onlineCareerSeasonReload'){
 if(onlineCareerProgressLoading||!onlineAuthSession?.isSignedIn()||!onlineAccountClient)return;
 const generation=onlineAccountGeneration;
 onlineCareerProgressRequested=true;onlineCareerProgressLoading=true;onlineCareerProgressLoaded=false;
 onlineCareerProgressStatus='Loading the server season, archive and your owned teams…';showOnlineCareer();
 void (async()=>{try{
  const [season,collection,seasons]=await Promise.all([onlineAccountClient.loadOnlineCareerSeason(),onlineAccountClient.loadUltimateTeamCollection(),onlineAccountClient.loadOnlineCareerSeasons()]);
   if(!onlineAccountGenerationIsCurrent(generation))return;
  onlineCareerSeason=season;onlineCareerSeasons=seasons;onlineUtCollection=collection.items;onlineUtBalance=collection.balance;
  onlineMatchOwnedTeamIds=[...new Set(['japan',...collection.items.filter(item=>item.category==='team').map(item=>item.itemId)])].filter(id=>onlineSelectableTeams().some(team=>team.id===id));onlineMatchTeamsLoaded=true;onlineMatchTeamsError='';
  onlineCareerProgressLoaded=true;onlineCareerProgressStatus=season?'Season and team collection are current.':'No season yet. Japan is free; other teams must be owned.';
  }catch(error){if(onlineAccountGenerationIsCurrent(generation)){onlineCareerProgressStatus=onlineSafeStatus(error);onlineCareerProgressLoaded=false;}}
  finally{if(generation===onlineAccountGeneration){onlineCareerProgressLoading=false;if(onlineAuthSession?.isSignedIn())showOnlineCareer(focusAction);}}
 })();
}
async function createOnlineCareerSeason(){
 if(!onlineCareerProgressLoaded||onlineCareerMatchTicketing)return;
 const generation=onlineAccountGeneration;
 const select=$('onlineCareerTeam');if(select)onlineCareerTeamId=select.value;
 onlineCareerMatchTicketing=true;onlineCareerProgressStatus='Creating your server-managed season…';showOnlineCareer();
 try{const result=await onlineAccountClient.createOnlineCareerSeason(onlineCareerTeamId);if(!onlineAccountGenerationIsCurrent(generation))return;const seasons=await onlineAccountClient.loadOnlineCareerSeasons();if(!onlineAccountGenerationIsCurrent(generation))return;onlineCareerSeason=result.season;onlineCareerSeasons=seasons;onlineCareerProgressLoaded=true;onlineCareerProgressStatus='Season created. Your first fixture is ready.';}
 catch(error){if(onlineAccountGenerationIsCurrent(generation))onlineCareerProgressStatus=onlineSafeStatus(error);}
 finally{if(generation===onlineAccountGeneration){onlineCareerMatchTicketing=false;if(onlineAuthSession?.isSignedIn())showOnlineCareer('onlineCareerSeasonStart');}}
}
function showOnlineCareer(focusAction){
 const configured=!!onlineConfig&&!!onlineAccountClient,signed=onlineAuthSession?.isSignedIn()===true;
 const remote=onlineCareerLoaded?currentRemoteCareer():null;
 const occupied=careerSlots.list().some(slot=>slot.occupied),empty=careerSlots.firstEmpty()!==null;
 const copyStatus=onlineCareerLoaded?(remote?'A remote Career copy is loaded. Uploading replaces that remote snapshot only after confirmation.':'No remote Career exists yet. Upload will create one.'):'Load the remote Career before syncing so the expected version is current.';
 const copyForm=signed?`<section class="panel" aria-label="Online Career copy sync"><h2 class="titleSmall">REMOTE SAVE COPY</h2><p>This is manual save-copy sync only. It does not submit ranked Career results, award tokens, or unlock content.</p><p>${escapeHTML(copyStatus)}</p><div class="row">${button('LOAD REMOTE CAREER','onlineCareerReload','minor')}${button('SIGN OUT','onlineSignOut','minor')}</div>${onlineCareerLoaded&&remote?`<p class="fixture">REMOTE VERSION <strong>${onlineCareerRecord.version}</strong> · COPY LABEL <strong>${escapeHTML(remote.name||'Career copy')}</strong></p>`:''}</section>
  <section class="panel" aria-label="Copy a local Career save online"><h2 class="titleSmall">LOCAL → ONLINE</h2><label class="fieldLabel" for="onlineCareerSource">Choose an occupied local Career save</label><select id="onlineCareerSource" class="choice" ${occupied?'':'disabled'}>${localCareerSlotOptions()||'<option value="">No occupied local slots</option>'}</select><p class="muted">Your local slot and active Career stay unchanged. This is an explicit copy.</p>${button('UPLOAD COPY TO ONLINE CAREER','onlineCareerUpload','gold')}${occupied?'':'<p>No occupied local Career slots are available to copy.</p>'}</section>
  <section class="panel" aria-label="Copy online Career to local"><h2 class="titleSmall">ONLINE → LOCAL</h2>${remote?`<label class="fieldLabel" for="onlineCareerTarget">Choose an empty local slot</label><select id="onlineCareerTarget" class="choice" ${empty?'':'disabled'}>${emptyCareerSlotOptions()||'<option value="">No empty local slots</option>'}</select>${button('COPY REMOTE CAREER TO EMPTY SLOT','onlineCareerImport','gold')}${empty?'':'<p>All ten local Career slots are occupied. Remove or copy a local slot before importing.</p>'}`:'<p>Load an existing remote Career first. If none exists, upload an occupied local save to create the first remote copy.</p>'}<p class="muted">Import creates a separate local slot. It preserves the active slot and the legacy single-save bytes.</p></section>`:'';
 const form=signed?'<section class="panel" aria-label="Online Career season"><h2 class="titleSmall">SERVER CAREER SEASON</h2><p>Fixtures, opponents, results and standings are managed by the online server. Your offline Career and saves remain separate.</p>'+onlineCareerSeasonMarkup()+'</section>'+onlineCareerArchiveMarkup()+copyForm:'';
 const historyLoading=onlineHistoryController?.state.loading===true;
 const history=signed?`<section class="panel" aria-label="Online match history" aria-busy="${historyLoading?'true':'false'}"><h2 class="titleSmall">ONLINE MATCH HISTORY</h2><p>Server-recorded results for this signed-in account. These server-recorded results remain separate from your offline Career saves.</p><div class="row"><button type="button" class="btn minor" data-action="onlineHistoryReload" ${historyLoading?'disabled':''}>${historyLoading?'LOADING…':onlineMatchHistoryItems.length?'REFRESH HISTORY':'LOAD MATCH HISTORY'}</button>${onlineMatchHistoryCursor?`<button type="button" class="btn minor" data-action="onlineHistoryMore" ${historyLoading?'disabled':''}>LOAD MORE RESULTS</button>`:''}</div>${onlineMatchHistoryItems.length?`<ul class="onlineMatchHistoryList">${onlineMatchHistoryItems.map(item=>{const own=TEAMS.find(team=>team.id===item.teamId)?.name||item.teamId,opponent=TEAMS.find(team=>team.id===item.opponentTeamId)?.name||item.opponentTeamId;return `<li><strong>${escapeHTML(item.outcome.toUpperCase())}</strong> · ${escapeHTML(own)} ${item.score[0]}–${item.score[1]} ${escapeHTML(opponent)}<small>${escapeHTML(new Date(item.recordedAt).toLocaleString())}</small></li>`}).join('')}</ul>`:''}<p id="onlineHistoryStatus" role="status" aria-live="polite" aria-atomic="true">${escapeHTML(onlineMatchHistoryStatus)}</p></section>`:'';
 page('ONLINE CAREER','Server-managed season progress, plus optional local save-copy tools.',`${onlineAuthPanel('career')}${form}${history}${onlineStatusMarkup(onlineIdentityError||onlineCareerStatus)}`,'navOnline');
 restoreOnlineFocus(focusAction);
 if(signed&&!onlineCareerProgressLoaded&&!onlineCareerProgressLoading&&!onlineCareerProgressRequested)loadOnlineCareerProgress();
}
async function loadOnlineMatchHistory(append=false){if(!onlineHistoryController){onlineMatchHistoryStatus='Online account configuration is unavailable.';showOnlineCareer(append?'onlineHistoryMore':'onlineHistoryReload');return;}const refresh=()=>{const state=onlineHistoryController.state;onlineMatchHistoryItems=state.items.slice();onlineMatchHistoryCursor=state.cursor;onlineMatchHistoryStatus=state.status;};const request=onlineHistoryController.load({append});refresh();showOnlineCareer(append?'onlineHistoryMore':'onlineHistoryReload');await request;refresh();showOnlineCareer(append?'onlineHistoryMore':'onlineHistoryReload');}
function onlineUtOwnedTeamIds(){return [...new Set(['japan',...onlineUtCollection.filter(item=>item.category==='team').map(item=>item.itemId)])].filter(id=>GAME_ASSETS?.teams?.some(team=>team.id===id));}
function onlineUtLineupTeamOptions(){return onlineUtOwnedTeamIds().map(id=>{const team=GAME_ASSETS.teams.find(row=>row.id===id);return `<option value="${escapeHTML(id)}" ${id===onlineUtLineupTeamId?'selected':''}>${escapeHTML(team?.name||id)}</option>`;}).join('');}
function onlineUtLineupMarkup(){
 const ownedPlayers=new Set(onlineUtCollection.filter(item=>item.category==='player').map(item=>item.itemId));
 const teamRoster=GAME_ASSETS?.rosters?.[onlineUtLineupTeamId];
 const editable=onlineUtLineup&&onlineUtLineup.teamId===onlineUtLineupTeamId&&Array.isArray(teamRoster)&&teamRoster.length===12;
 const controls=editable?teamRoster.map((base,slot)=>{
  const options=[];
  for(const [teamId,roster] of Object.entries(GAME_ASSETS.rosters||{}))for(const player of roster||[]){
   const id=`${teamId}/${player.id}`;if(player.role!==base.role)continue;
   if(teamId!==onlineUtLineupTeamId&&!ownedPlayers.has(id))continue;
   options.push({id,label:`${player.name} · ${GAME_ASSETS.teams.find(team=>team.id===teamId)?.name||teamId}`});
  }
  return `<label class="fieldLabel" for="onlineUtLineupSlot${slot}">SLOT ${slot+1} · ${escapeHTML(base.role)}<select id="onlineUtLineupSlot${slot}" class="choice onlineUtLineupSlot">${options.map(row=>`<option value="${escapeHTML(row.id)}" ${onlineUtLineup.playerIds[slot]===row.id?'selected':''}>${escapeHTML(row.label)}</option>`).join('')}</select></label>`;
 }).join(''):'';
 return `<section class="panel" aria-label="Online Ultimate Team lineup"><h2 class="titleSmall">PLAYABLE ONLINE LINEUP</h2><p>Choose a team you own, then fill its twelve roster slots. Players from the base team are included; replacements from other teams must be in your online player collection. Player stats are loaded from the server’s canonical game catalog.</p><label class="fieldLabel" for="onlineUtLineupTeam">BASE TEAM<select id="onlineUtLineupTeam" class="choice" ${onlineUtOwnedTeamIds().length?'':'disabled'}>${onlineUtLineupTeamOptions()}</select></label><p id="onlineUtLineupStatus" class="muted" role="status" aria-live="polite" aria-atomic="true">${escapeHTML(onlineUtLineupLoading?'Loading saved lineup…':editable?`Lineup version ${onlineUtLineup.version}. Role-compatible slots are enforced.`:'Load this owned team’s server lineup before editing.')}</p><div class="row"><button type="button" class="btn minor" data-action="onlineUtLineupReload" ${onlineUtLineupLoading||onlineUtLineupSaving?'disabled':''}>${onlineUtLineupLoading?'LOADING…':'LOAD LINEUP'}</button></div>${controls?`<div class="grid" aria-label="Twelve player lineup slots">${controls}</div><p>Unique players only. Editing does not alter offline squads or local saves.</p><button type="button" class="btn gold" data-action="onlineUtLineupSave" ${onlineUtLineupSaving?'disabled':''}>${onlineUtLineupSaving?'SAVING…':'SAVE ONLINE LINEUP'}</button>`:''}</section>`;
}
function onlineTeamOptions(){return TEAMS.map((team,index)=>`<option value="${index}" ${index===onlineUtTeam?'selected':''}>${escapeHTML(team.name)}</option>`).join('');}
function buildOnlineTeamSnapshot(index){
 if(!Number.isInteger(index)||!TEAMS[index])throw new Error('Choose an available local squad.');
 const players=roster(index),plan=planFor(index);
 if(!Array.isArray(players)||!Array.isArray(plan?.lineup))throw new Error('The selected local squad is unavailable.');
 return {schemaVersion:1,teamId:TEAMS[index].id,formation:plan.formation,lineup:plan.lineup.slice(),playerIds:players.map(player=>player.id)};
}
function showOnlineUltimateTeam(focusAction){
 const signed=onlineAuthSession?.isSignedIn()===true,remote=onlineUtRecord?.payload;
 const owned=new Set(onlineUtCollection.map(item=>`${item.category}:${item.itemId}`));
 const lineupBuilder=signed?onlineUtLineupMarkup():'';
 const marketplace=signed?`<section class="panel" aria-label="Online Ultimate Team collection"><h2 class="titleSmall">ONLINE COLLECTION</h2><p>Own existing canonical teams and players in your online collection with tokens earned in server-recorded matches. Offline teams, players and saves remain unchanged.</p><p class="fixture">${onlineUtBalance===null?'TOKEN BALANCE · —':`TOKEN BALANCE · ${onlineUtBalance.toLocaleString()}`} · ${onlineUtCollection.length} ITEMS OWNED</p><div class="row">${button(onlineUtCatalogLoading?'LOADING COLLECTION…':'REFRESH CATALOG & COLLECTION','onlineUtCatalogReload','minor')}${button('SIGN OUT','onlineSignOut','minor')}</div><div class="tacticsGrid"><label class="fieldLabel" for="onlineUtCategory">CATEGORY<select id="onlineUtCategory" class="choice"><option value="player" ${onlineUtCategory==='player'?'selected':''}>PLAYERS</option><option value="team" ${onlineUtCategory==='team'?'selected':''}>TEAMS</option></select></label><label class="fieldLabel" for="onlineUtSearch">SEARCH<input id="onlineUtSearch" class="choice" type="search" value="${escapeHTML(onlineUtSearch)}" placeholder="Search current teams and players" autocomplete="off"></label></div><p id="onlineUtCatalogStatus" class="muted" role="status" aria-live="polite" aria-atomic="true">${escapeHTML(onlineUtCatalogLoading?'Loading server catalog and collection…':onlineUtCatalog?`${onlineUtCatalog.length} server catalog items loaded.`:'Load the server catalog to browse available items.')}</p><div id="onlineUtItems" class="grid" aria-label="Available Ultimate Team items">${onlineUtCatalog?onlineUtCatalogMarkup(owned):''}</div>${onlineUtCatalog&&onlineUtPage*24<onlineUtCatalog.filter(item=>item.category===onlineUtCategory).length?button('SHOW MORE','onlineUtMore','minor'):''}</section>`:'';
 const copyForm=signed?`<section class="panel" aria-label="Online Ultimate Team snapshot"><h2 class="titleSmall">VERSIONED SQUAD SNAPSHOT</h2><p>Load, create, or explicitly update an account copy of an existing local squad. This does not change any local roster identity or offline save.</p><div class="row">${button('LOAD REMOTE SQUAD','onlineUtReload','minor')}</div>${onlineUtLoaded?`<p class="fixture">${remote?'REMOTE SNAPSHOT LOADED · VERSION '+onlineUtRecord.version:'NO REMOTE SNAPSHOT · A new copy can be created.'}</p>`:'<p>Load the remote squad before saving so the expected version is current.</p>'}<label class="fieldLabel" for="onlineUtTeam">Choose an existing local team</label><select id="onlineUtTeam" class="choice">${onlineTeamOptions()}</select><p id="onlineUtPreview" class="muted">The saved copy contains the current formation and existing player IDs from this team.</p>${button('SAVE EXPLICIT SQUAD COPY','onlineUtSave','gold')}</section>`:'';
 page('ONLINE ULTIMATE TEAM','Build an account-owned collection while keeping local squads and offline saves intact.',`${onlineAuthPanel('ultimate')}${marketplace}${lineupBuilder}${copyForm}${onlineStatusMarkup(onlineIdentityError||onlineUtStatus)}`,'navOnline');
 restoreOnlineFocus(focusAction);
 if(signed&&!onlineUtCatalogRequested)loadOnlineUltimateTeamMarketplace();
}
function onlineUtItemName(item){
 if(item.category==='team')return GAME_ASSETS?.teams?.find(team=>team.id===item.id)?.name||item.id;
 const [teamId,playerId]=item.id.split('/');
 const team=GAME_ASSETS?.teams?.find(row=>row.id===teamId),player=GAME_ASSETS?.rosters?.[teamId]?.find(row=>row.id===playerId);
 return player?`${player.name} · ${team?.name||teamId}`:item.id;
}
function onlineUtCatalogMarkup(owned=new Set(onlineUtCollection.map(item=>`${item.category}:${item.itemId}`))){
 if(!Array.isArray(onlineUtCatalog))return '';
 const query=onlineUtSearch.trim().toLocaleLowerCase();
 const filtered=onlineUtCatalog.filter(item=>item.category===onlineUtCategory&&(!query||`${item.id} ${onlineUtItemName(item)}`.toLocaleLowerCase().includes(query)));
 const items=filtered.slice(0,(onlineUtPage+1)*24);
 return items.map(item=>{const own=owned.has(`${item.category}:${item.id}`),pending=onlineUtPendingPurchase?.category===item.category&&onlineUtPendingPurchase?.itemId===item.id;
  const label=own?'OWNED':pending?(onlineUtPurchaseInFlight?'PURCHASING…':'RETRY PURCHASE'):`BUY · ${item.price} TOKENS`;
  return `<article class="panel" data-online-ut-card><h3 class="titleSmall">${escapeHTML(onlineUtItemName(item))}</h3><p class="muted">${item.category==='player'?'PLAYER':'TEAM'} · ${escapeHTML(item.id)}</p><p>${item.price.toLocaleString()} TOKENS</p><button type="button" class="btn ${own?'minor':'gold'}" data-online-ut-buy="${item.category}" data-ut-item="${escapeHTML(item.id)}" ${own||onlineUtBalance===null||onlineUtPurchaseInFlight||onlineUtPendingPurchase&&!pending?'disabled':''}>${label}</button></article>`;
 }).join('')||'<p class="muted">No catalog entries match this search.</p>';
}
function refreshOnlineUtCatalog(){
 const out=$('onlineUtItems'),status=$('onlineUtCatalogStatus');if(!out)return;
 const items=onlineUtCatalog?.filter(item=>item.category===onlineUtCategory&&(!onlineUtSearch.trim()||`${item.id} ${onlineUtItemName(item)}`.toLocaleLowerCase().includes(onlineUtSearch.trim().toLocaleLowerCase())))||[];
 out.innerHTML=onlineUtCatalogMarkup();
 if(status)status.textContent=onlineUtCatalogLoading?'Loading server catalog and collection…':onlineUtCatalog?`${items.length} ${onlineUtCategory==='player'?'players':'teams'} match this filter. Showing ${Math.min(items.length,(onlineUtPage+1)*24)}.`:'Load the server catalog to browse available items.';
}
async function loadOnlineUltimateTeamMarketplace(focusAction='onlineUtCatalogReload'){
 if(!onlineAuthSession?.isSignedIn()||!onlineAccountClient)return;
 const generation=onlineAccountGeneration;
 onlineUtCatalogRequested=true;onlineUtCatalogLoading=true;refreshOnlineUtCatalog();
 try{
  const [catalog,collection]=await Promise.all([onlineAccountClient.loadUltimateTeamCatalog(),onlineAccountClient.loadUltimateTeamCollection()]);
   if(!onlineAccountGenerationIsCurrent(generation))return;
  onlineUtCatalog=catalog;onlineUtCollection=collection.items;onlineUtBalance=collection.balance;
  if(!onlineUtOwnedTeamIds().includes(onlineUtLineupTeamId))onlineUtLineupTeamId='japan';
  onlineUtLineupLoading=true;
   try{const lineup=await onlineAccountClient.loadUltimateTeamLineup(onlineUtLineupTeamId);if(!onlineAccountGenerationIsCurrent(generation))return;onlineUtLineup=lineup;onlineUtLineupPendingSave=null;}catch(error){if(onlineAccountGenerationIsCurrent(generation)){onlineUtLineup=null;onlineUtStatus=onlineSafeStatus(error);}}
   finally{if(generation===onlineAccountGeneration)onlineUtLineupLoading=false;}
   if(!onlineAccountGenerationIsCurrent(generation))return;
  onlineUtStatus='Online catalog and collection loaded. No offline squad or save was changed.';
  }catch(error){if(onlineAccountGenerationIsCurrent(generation))onlineUtStatus=onlineSafeStatus(error);}
  finally{if(generation===onlineAccountGeneration){onlineUtCatalogLoading=false;if(onlineAuthSession?.isSignedIn())showOnlineUltimateTeam(focusAction);}}
}
async function loadOnlineUtLineup(focusAction='onlineUtLineupReload'){
 if(!onlineAuthSession?.isSignedIn()||!onlineAccountClient)return;
 const generation=onlineAccountGeneration;
 if(!onlineUtOwnedTeamIds().includes(onlineUtLineupTeamId)){onlineUtStatus='Acquire the base team before editing its online lineup.';showOnlineUltimateTeam(focusAction);return;}
 onlineUtLineupLoading=true;onlineUtLineup=null;showOnlineUltimateTeam(focusAction);
 try{const lineup=await onlineAccountClient.loadUltimateTeamLineup(onlineUtLineupTeamId);if(!onlineAccountGenerationIsCurrent(generation))return;onlineUtLineup=lineup;onlineUtLineupPendingSave=null;onlineUtStatus='Online lineup loaded from the account service.';}
 catch(error){if(onlineAccountGenerationIsCurrent(generation))onlineUtStatus=onlineSafeStatus(error);}
 finally{if(generation===onlineAccountGeneration){onlineUtLineupLoading=false;if(onlineAuthSession?.isSignedIn())showOnlineUltimateTeam(focusAction);}}
}
async function saveOnlineUtLineup(){
 if(!onlineAuthSession?.isSignedIn()||!onlineAccountClient||!onlineUtLineup||onlineUtLineupSaving)return;
 const generation=onlineAccountGeneration;
 const base=GAME_ASSETS?.rosters?.[onlineUtLineupTeamId],playerIds=base?.map((_,slot)=>$(`onlineUtLineupSlot${slot}`)?.value);
 if(!Array.isArray(playerIds)||playerIds.length!==12||playerIds.some(id=>typeof id!=='string')){onlineUtStatus='Load the lineup and fill every roster slot before saving.';showOnlineUltimateTeam('onlineUtLineupSave');return;}
 const samePending=onlineUtLineupPendingSave&&onlineUtLineupPendingSave.teamId===onlineUtLineupTeamId&&onlineUtLineupPendingSave.expectedVersion===onlineUtLineup.version&&JSON.stringify(onlineUtLineupPendingSave.playerIds)===JSON.stringify(playerIds);
 if(!samePending)onlineUtLineupPendingSave={teamId:onlineUtLineupTeamId,playerIds:playerIds.slice(),expectedVersion:onlineUtLineup.version,idempotencyKey:makeOnlineIdempotencyKey('ut_lineup')};
 onlineUtLineupSaving=true;showOnlineUltimateTeam('onlineUtLineupSave');
 try{
   const result=await onlineAccountClient.saveUltimateTeamLineup({...onlineUtLineupPendingSave});if(!onlineAccountGenerationIsCurrent(generation))return;
  onlineUtLineup=result.lineup;onlineUtLineupPendingSave=null;onlineUtStatus='Online lineup saved. It will be used for this team in server matches.';
  }catch(error){if(onlineAccountGenerationIsCurrent(generation))onlineUtStatus=onlineSafeStatus(error);}
  finally{if(generation===onlineAccountGeneration){onlineUtLineupSaving=false;if(onlineAuthSession?.isSignedIn())showOnlineUltimateTeam('onlineUtLineupSave');}}
}
async function purchaseOnlineUltimateTeamItem(category,itemId){
 if(!onlineAuthSession?.isSignedIn()||!onlineAccountClient)return;
 const generation=onlineAccountGeneration;
 if(onlineUtPurchaseInFlight)return;
 if(onlineUtPendingPurchase&&(onlineUtPendingPurchase.category!==category||onlineUtPendingPurchase.itemId!==itemId)){
  onlineUtStatus='Retry or resolve the pending purchase before starting another item.';showOnlineUltimateTeam('onlineUtCatalogReload');return;
 }
 onlineUtPendingPurchase??={category,itemId,idempotencyKey:makeOnlineIdempotencyKey('ut_purchase')};
 onlineUtPurchaseInFlight=true;
 try{
   const result=await onlineAccountClient.purchaseUltimateTeamItem({...onlineUtPendingPurchase});if(!onlineAccountGenerationIsCurrent(generation))return;
  onlineUtBalance=result.balance;
  if(!onlineUtCollection.some(row=>row.category===category&&row.itemId===itemId))onlineUtCollection=[...onlineUtCollection,{category,itemId,acquiredAt:result.receipt.recordedAt}];
  if(category==='team'){onlineMatchTeamsLoaded=false;onlineMatchTeamsRefreshNeeded=true;}
  onlineUtStatus=result.status==='duplicate'?`${onlineUtItemName({category,id:itemId})} purchase confirmed from its original receipt.`:`${onlineUtItemName({category,id:itemId})} added to your online collection for ${result.receipt.price} tokens.`;
  onlineUtPendingPurchase=null;
  }catch(error){
   if(onlineAccountGenerationIsCurrent(generation)){onlineUtStatus=onlineSafeStatus(error);if(['already-owned','insufficient-balance','unknown-item','idempotency-conflict','invalid-request'].includes(error?.code))onlineUtPendingPurchase=null;}
  }finally{if(generation===onlineAccountGeneration){onlineUtPurchaseInFlight=false;if(onlineAuthSession?.isSignedIn())showOnlineUltimateTeam('onlineUtCatalogReload');}}
}
async function beginOnlineSignIn(route){
 if(!onlineAuthSession){setOnlineRouteStatus(route,'Online account is not configured for this build.');return;}
 const generation=++onlineAccountGeneration;
 try{sessionStorage.setItem('smf.online.account.return.v1',route==='ultimate'?'online-ultimate':route==='match'?'online-match':'online-career');await onlineAuthSession.beginSignIn();if(generation!==onlineAccountGeneration)return;}
 catch(error){if(generation!==onlineAccountGeneration)return;try{sessionStorage.removeItem('smf.online.account.return.v1')}catch{};setOnlineRouteStatus(route,onlineSafeStatus(error),route==='career'?'onlineSignIn_career':route==='ultimate'?'onlineSignIn_ultimate':'onlineSignIn_match');}
}
function signOutOnlineAccount(){onlineAccountGeneration++;onlineAccountSignOutGeneration++;onlineAccountSignOutAtGeneration=onlineAccountGeneration;onlineAuthSession?.signOut();onlineHistoryController?.reset();onlineCareerRecord=null;onlineCareerLoaded=false;onlineCareerStatus='Signed out. Local saves and squads are unchanged.';onlineCareerSeason=null;onlineCareerSeasons=[];onlineCareerProgressLoaded=false;onlineCareerProgressLoading=false;onlineCareerProgressRequested=false;onlineCareerProgressStatus='Signed out.';onlineCareerMatchTicketing=false;onlineUtRecord=null;onlineUtLoaded=false;onlineUtStatus='Signed out. Local saves and squads are unchanged.';onlineUtCatalog=null;onlineUtCollection=[];onlineUtBalance=null;onlineUtCatalogLoading=false;onlineUtCatalogRequested=false;onlineUtPendingPurchase=null;onlineUtPurchaseInFlight=false;onlineUtLineup=null;onlineUtLineupLoading=false;onlineUtLineupSaving=false;onlineUtLineupPendingSave=null;onlineMatchOwnedTeamIds=[];onlineMatchTeamsLoaded=false;onlineMatchTeamsLoading=false;onlineMatchTeamsRefreshNeeded=false;onlineMatchTeamsError='';onlineMatchHistoryItems=[];onlineMatchHistoryCursor=null;onlineMatchHistoryStatus='';if(screen==='ONLINE ULTIMATE TEAM')showOnlineUltimateTeam('onlineSignIn_ultimate');else if(screen==='ONLINE MATCH')showOnlineServerMatch('onlineSignIn_match');else showOnlineCareer('onlineSignIn_career');}
async function reloadOnlineCareer(){
 if(!onlineAuthSession?.isSignedIn()||!onlineAccountClient)return;const generation=onlineAccountGeneration;
 try{const record=await onlineAccountClient.loadCareer();if(!onlineAccountGenerationIsCurrent(generation))return;onlineCareerRecord=record;onlineCareerLoaded=true;onlineCareerStatus=onlineCareerRecord?'Remote Career loaded.':'No remote Career copy exists yet.';showOnlineCareer('onlineCareerReload');}
 catch(error){if(!onlineAccountGenerationIsCurrent(generation))return;onlineCareerLoaded=false;onlineCareerStatus=onlineSafeStatus(error);showOnlineCareer('onlineCareerReload');}
}
function makeOnlineIdempotencyKey(prefix){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);return prefix+'_'+Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('');}
async function uploadOnlineCareerCopy(){
 const generation=onlineAccountGeneration;if(!onlineAuthSession?.isSignedIn()||!onlineAccountClient)return;
 if(!onlineCareerLoaded){onlineCareerStatus='Load the remote Career first. This prevents overwriting a newer copy.';return showOnlineCareer('onlineCareerUpload');}
 try{
  const slot=localCareerSlotFromBackup(Number($('onlineCareerSource')?.value));
  const snapshot=copyOfflineCareerSlotToRemotePayload(slot);
  if(onlineCareerRecord&&!confirm('Replace the remote Career snapshot with an explicit copy of local slot “'+slot.name+'”? The local save will not change.'))return;
  const result=await onlineAccountClient.saveCareer(snapshot,{expectedVersion:onlineCareerRecord?.version??0,idempotencyKey:makeOnlineIdempotencyKey('career_copy')});
   if(!onlineAccountGenerationIsCurrent(generation))return;
  onlineCareerRecord=result.record;onlineCareerLoaded=true;onlineCareerStatus=result.status==='duplicate'?'This Career copy was already saved.':'Career copy uploaded. The local save and active slot were not changed.';
  }catch(error){if(!onlineAccountGenerationIsCurrent(generation))return;onlineCareerStatus=onlineSafeStatus(error);if(error?.code==='version-conflict')onlineCareerLoaded=false;}
  if(onlineAccountGenerationIsCurrent(generation))showOnlineCareer('onlineCareerUpload');
}
function buildRemoteCareerVaultBackup(vault){
 const data=new Map([['legend_careerSlots',JSON.stringify(vault)]]),tempStorage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
 return CAREER_SLOTS.create(tempStorage).exportBackup();
}
function importOnlineCareerCopy(){
 try{
  const payload=currentRemoteCareer(),destination=Number($('onlineCareerTarget')?.value);
  if(!onlineCareerLoaded||!payload)throw new Error('Load a remote Career copy before importing.');
  if(!CAREER_SLOTS.validCareer(payload.career))throw new Error('Remote Career snapshot is not compatible with local saves.');
  const backup=JSON.parse(careerSlots.exportBackup()),vault=JSON.parse(backup.payload),index=destination-1;
  if(!Number.isInteger(index)||index<0||index>=vault.slots.length||vault.slots[index]!==null)throw new Error('Choose an empty local slot.');
  const beforeActive=vault.active,legacyBefore=careerStorage.getItem('legend_managerCareer');
  const safeName=Array.from(String(payload.name||'Online Career copy').trim()||'Online Career copy').slice(0,60).join('');
  const savedAt=typeof payload.savedAt==='string'&&!Number.isNaN(Date.parse(payload.savedAt))?payload.savedAt:new Date().toISOString();
  vault.slots[index]={name:safeName,savedAt,career:JSON.parse(JSON.stringify(payload.career))};
  careerSlots.importBackup(buildRemoteCareerVaultBackup(vault),{overwrite:true});
  if(careerSlots.active!==beforeActive||careerStorage.getItem('legend_managerCareer')!==legacyBefore)throw new Error('Local active slot or legacy bytes changed unexpectedly.');
  onlineCareerStatus=`Remote Career copied into empty local slot ${destination}. The active local slot and legacy save are unchanged.`;
 }catch(error){onlineCareerStatus=error instanceof OnlineAccountError?error.message:'Could not copy this remote Career into local storage. No legacy save was intentionally changed.';}
 showOnlineCareer('onlineCareerImport');
}
async function reloadOnlineUltimateTeam(){
 if(!onlineAuthSession?.isSignedIn()||!onlineAccountClient)return;const generation=onlineAccountGeneration;
 try{const record=await onlineAccountClient.loadUltimateTeam();if(!onlineAccountGenerationIsCurrent(generation))return;onlineUtRecord=record;onlineUtLoaded=true;onlineUtStatus=onlineUtRecord?'Remote squad loaded.':'No remote squad copy exists yet.';showOnlineUltimateTeam('onlineUtReload');}
 catch(error){if(!onlineAccountGenerationIsCurrent(generation))return;onlineUtLoaded=false;onlineUtStatus=onlineSafeStatus(error);showOnlineUltimateTeam('onlineUtReload');}
}
async function saveOnlineUltimateTeam(){
 if(!onlineAuthSession?.isSignedIn()||!onlineAccountClient)return;const generation=onlineAccountGeneration;
 if(!onlineUtLoaded){onlineUtStatus='Load the remote squad first. Reload after a conflict before saving.';return showOnlineUltimateTeam('onlineUtSave');}
 try{
  const snapshot=buildOnlineTeamSnapshot(onlineUtTeam);
  const result=await onlineAccountClient.saveUltimateTeam(snapshot,{expectedVersion:onlineUtRecord?.version??0,idempotencyKey:makeOnlineIdempotencyKey('squad_copy')});
   if(!onlineAccountGenerationIsCurrent(generation))return;
  onlineUtRecord=result.record;onlineUtLoaded=true;onlineUtStatus=result.status==='duplicate'?'This squad copy was already saved.':'Existing squad copy saved. Local roster identities and player data were not modified.';
  }catch(error){if(!onlineAccountGenerationIsCurrent(generation))return;onlineUtStatus=onlineSafeStatus(error);if(error?.code==='version-conflict')onlineUtLoaded=false;}
  if(onlineAccountGenerationIsCurrent(generation))showOnlineUltimateTeam('onlineUtSave');
}
function refreshOnlineTeamPreview(){const target=$('onlineUtPreview');if(!target)return;try{const snapshot=buildOnlineTeamSnapshot(onlineUtTeam);target.textContent=`Ready to copy ${snapshot.playerIds.length} existing player IDs with the current ${snapshot.formation} formation. No local player data will be changed.`;}catch(error){target.textContent=error.message;}}
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
 navItem('Custom Cup','customCupSetup','Build a local knockout Cup from existing teams.','active','➕'),
 navItem('Custom League','customLeagueSetup','Play a local double round-robin season with 4–16 existing teams.','active','➕'),
 ...(customLeagueRun?[navItem('CONTINUE CUSTOM LEAGUE','customLeagueContinue','Resume '+(TEAMS[customLeagueRun.club]?.name||'your club')+' · Matchday '+(customLeagueRun.roundIdx+1),'active','▶')]:[])],'home');}
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
function showCustomCupSetup(){
 const clubs=TEAMS.map((team,id)=>({team,id})).filter(x=>x.team&&typeof x.team.name==='string');
 customCupEntrants=customCupEntrants.filter((id,index)=>Number.isSafeInteger(id)&&TEAMS[id]&&customCupEntrants.indexOf(id)===index).slice(0,16);
 if(!customCupEntrants.includes(customCupClub))customCupClub=customCupEntrants[0]??null;
 const options=clubs.filter(({id})=>!customCupEntrants.includes(id)).map(({team,id})=>`<option value="${id}">${escapeHTML(team.name)} · ${escapeHTML(countryCode(team)||'CLB')}</option>`).join('');
 const entrants=customCupEntrants.map(id=>`<li class="customCupEntrant"><span>${escapeHTML(TEAMS[id].name)}${id===customCupClub?' · YOUR CLUB':''}</span><span class="row">${id!==customCupClub?button('PLAY AS THIS CLUB','customCupClub_'+id,'minor'):''}${button('REMOVE','customCupRemove_'+id,'minor')}</span></li>`).join('');
 page('CUSTOM CUP','Create a local knockout tournament using 4–16 existing teams. Your current team choices and saves stay unchanged.',
  `<div class="twoCol"><section class="panel" aria-label="Custom Cup teams"><h2 class="titleSmall">ADD TEAMS · ${customCupEntrants.length}/16</h2><label class="fieldLabel" for="customCupTeam">EXISTING TEAM</label><select class="choice" id="customCupTeam" ${customCupEntrants.length>=16||!options?'disabled':''}>${options||'<option value="">All available teams added</option>'}</select><div class="row"><button type="button" class="btn gold" data-action="customCupAdd" ${customCupEntrants.length>=16||!options?'disabled':''}>ADD TEAM</button></div><p id="customCupStatus" role="status" aria-live="polite" aria-atomic="true">Add at least four different teams. Choose which entrant you will play.</p><ul class="customCupEntrants" aria-label="Selected tournament entrants">${entrants||'<li class="muted">No teams added yet.</li>'}</ul><div class="row"><button type="button" class="btn gold" data-action="customCupStart" ${customCupEntrants.length<4||!customCupEntrants.includes(customCupClub)?'disabled':''}>START CUSTOM CUP</button>${button('CANCEL','navCups','minor')}</div></section><section class="panel"><h2 class="titleSmall">KNOCKOUT FORMAT</h2><p>Single-match elimination. A draw in your match goes to penalties. The tournament automatically creates byes when the entrant count is not a power of two.</p><p>Only existing teams can enter. The selection is saved in a separate Cup slot; it does not change offline rosters or Career saves.</p><p class="muted">Cup slots provide progress persistence. If browser storage is unavailable, the campaign remains playable for this session and is clearly marked session-only.</p></section></div>`, 'navCups');
}
function startCustomCup(){
 const status=$('customCupStatus'),club=customCupClub,participants=customCupEntrants.slice();
 if(participants.length<4||participants.length>16||new Set(participants).size!==participants.length||!participants.includes(club)||participants.some(id=>!Number.isSafeInteger(id)||!TEAMS[id])){
  if(status)status.textContent='Choose 4–16 different existing teams, including your club.';return;
 }
 try{
  const fresh=createCustomKnockoutTournament(club,participants,TEAMS),slot=cupSlots.firstEmpty()??cupSlots.active;
  if(cupSlots.list()[slot-1].occupied&&!confirm('All ten Cup slots are full. Overwrite active Cup slot '+slot+'?'))return;
  writeCupSlot(slot,fresh,'Custom Cup');continentalRun=fresh;store.put('continentalRun',continentalRun);showTournament();
 }catch(error){if(status)status.textContent=error.message;}
}
function showCustomLeagueSetup(){
 const clubs=TEAMS.map((team,id)=>({team,id})).filter(x=>x.team&&typeof x.team.name==='string');
 customLeagueEntrants=customLeagueEntrants.filter((id,index)=>Number.isSafeInteger(id)&&TEAMS[id]&&customLeagueEntrants.indexOf(id)===index).slice(0,16);
 if(!customLeagueEntrants.includes(customLeagueClub))customLeagueClub=customLeagueEntrants[0]??null;
 const options=clubs.filter(({id})=>!customLeagueEntrants.includes(id)).map(({team,id})=>`<option value="${id}">${escapeHTML(team.name)} · ${escapeHTML(countryCode(team)||'CLB')}</option>`).join('');
 const entrants=customLeagueEntrants.map(id=>`<li class="customCupEntrant"><span>${escapeHTML(TEAMS[id].name)}${id===customLeagueClub?' · YOUR CLUB':''}</span><span class="row">${id!==customLeagueClub?button('PLAY AS THIS CLUB','customLeagueClub_'+id,'minor'):''}${button('REMOVE','customLeagueRemove_'+id,'minor')}</span></li>`).join('');
 const error=customLeagueSaveError?`<p role="${customLeagueCorruptRaw?'alert':'status'}" aria-live="${customLeagueCorruptRaw?'assertive':'polite'}" class="muted">${escapeHTML(customLeagueSaveError)}</p>`:'';
 const resume=customLeagueRun?button('CONTINUE SAVED LEAGUE','customLeagueContinue','gold'):'';
 page('CUSTOM LEAGUE','Create a local double round-robin season with 4–16 existing teams. All fixtures and results save separately from Career and Cup.',
  `<div class="twoCol"><section class="panel" aria-label="Custom League teams"><h2 class="titleSmall">ADD TEAMS · ${customLeagueEntrants.length}/16</h2><label class="fieldLabel" for="customLeagueTeam">EXISTING TEAM</label><select class="choice" id="customLeagueTeam" ${customLeagueEntrants.length>=16||!options?'disabled':''}>${options||'<option value="">All available teams added</option>'}</select><div class="row"><button type="button" class="btn gold" data-action="customLeagueAdd" ${customLeagueEntrants.length>=16||!options?'disabled':''}>ADD TEAM</button></div><p id="customLeagueStatus" role="status" aria-live="polite" aria-atomic="true">Add at least four different teams, then choose which club you will play as.</p><ul class="customCupEntrants" aria-label="Selected league entrants">${entrants||'<li class="muted">No teams added yet.</li>'}</ul><div class="row"><button type="button" class="btn gold" data-action="customLeagueStart" ${customLeagueEntrants.length<4||!customLeagueEntrants.includes(customLeagueClub)?'disabled':''}>START NEW CUSTOM LEAGUE</button>${resume}${button('CANCEL','navCups','minor')}</div>${error}</section><section class="panel"><h2 class="titleSmall">DOUBLE ROUND-ROBIN</h2><p>Every club plays every other club home and away. Odd-sized leagues include a bye on each matchday.</p><p>Only existing teams can enter. League results and progress use a separate local campaign key and never alter your Career or Cup saves.</p><p class="muted">After kickoff, use the existing Pass, Shoot, Dribble and Jump controls. CPU fixtures are simulated deterministically. Standings update when the whole matchday is recorded.</p>${customLeagueSaveVolatile?'<p class="muted" role="status" aria-live="polite">This browser cannot persist the league right now. A new campaign can still run for this session only.</p>':''}</section></div>`, 'navCups');
}
function startCustomLeague(){
 const status=$('customLeagueStatus'),participants=customLeagueEntrants.slice(),club=customLeagueClub;
 if(participants.length<4||participants.length>16||new Set(participants).size!==participants.length||!participants.includes(club)||participants.some(id=>!Number.isSafeInteger(id)||!TEAMS[id])){if(status)status.textContent='Choose 4–16 different existing teams, including your club.';return;}
 if(customLeagueRun&&!confirm('Start a new Custom League and replace the saved Custom League campaign?'))return;
 if(customLeagueCorruptRaw&&!confirm('The stored Custom League is damaged. Replace that saved Custom League only? Career and Cup data are not affected.'))return;
 try{const fresh=createCustomLeague(club,participants,TEAMS);fresh.teamKeys=Object.fromEntries(participants.map(id=>[String(id),TEAMS[id].id]));saveCustomLeague(fresh);showCustomLeague();}
 catch(error){if(status)status.textContent='Could not start league: '+error.message;}
}
function showCustomLeague(){
 const c=customLeagueRun;
 if(!c||!validateCustomLeague(c,TEAMS))return showCustomLeagueSetup();
 if(!customLeagueTeamReferencesValid(c)){
  page('CUSTOM LEAGUE SAVE UNAVAILABLE','The saved campaign references a team that was removed or reordered. Its stored data has been preserved.',`<div class="panel"><p role="alert" aria-live="assertive">${escapeHTML(customLeagueSaveError||'This campaign cannot safely continue with the current team list.')}</p><div class="row">${button('CREATE A NEW CUSTOM LEAGUE','customLeagueSetup','gold')}${button('BACK TO CUPS','navCups','minor')}</div></div>`,'navCups');return;
 }
 const current=customLeagueCurrent(c),table=customLeagueStandings(c),position=table.findIndex(row=>row.id===c.club)+1;
 const standingsHTML=table.map(row=>`<tr class="${row.id===c.club?'myTeam':''}"><td>${row.position}</td><td>${teamIdentity(TEAMS[row.id])} ${escapeHTML(TEAMS[row.id].name)}</td><td>${row.p}</td><td>${row.w}</td><td>${row.d}</td><td>${row.l}</td><td>${row.gd}</td><td>${row.pts}</td></tr>`).join('');
 const fixture=current?.bye?'BYE — REST MATCHDAY':current?`${TEAMS[c.club].name} VS ${TEAMS[current.opponent]?.name||'Unknown team'} · SCHEDULED ${current.home?'HOME':'AWAY'}`:'Season complete';
 const action=current?.bye?button('ADVANCE THROUGH BYE','customLeagueBye','gold'):current?button('KICK OFF MATCHDAY '+current.round,'customLeagueKickoff','gold'):'';
 const error=customLeagueSaveError?`<p role="${customLeagueCorruptRaw?'alert':'status'}" aria-live="${customLeagueCorruptRaw?'assertive':'polite'}" class="muted">${escapeHTML(customLeagueSaveError)}</p>`:'';
 const volatile=customLeagueSaveVolatile?'<p class="muted" role="status" aria-live="polite">SESSION-ONLY: browser storage is unavailable or full. This league will be lost when this page closes; other saves are unaffected.</p>':'';
 const history=c.history.slice().reverse().slice(0,30).map(row=>`<div class="stat"><strong>MATCHDAY ${row.round}</strong><span>${escapeHTML(TEAMS[row.home]?.name||'Unknown')} ${row.homeGoals}–${row.awayGoals} ${escapeHTML(TEAMS[row.away]?.name||'Unknown')}${row.userControlled?' · YOUR MATCH':' · CPU'}</span></div>`).join('')||'<p class="muted">No completed fixtures yet.</p>';
 const finished=c.phase==='finished';
 page('CUSTOM LEAGUE',`${escapeHTML(TEAMS[c.club]?.name||'Unknown club')} · ${finished?'SEASON COMPLETE':'MATCHDAY '+(c.roundIdx+1)+' / '+c.rounds.length}`,
  `<div class="careerTop"><div class="metric"><small>YOUR CLUB</small><strong>${escapeHTML(TEAMS[c.club]?.name||'Unknown')}</strong></div><div class="metric"><small>FORMAT</small><strong>HOME &amp; AWAY</strong></div><div class="metric"><small>POSITION</small><strong>#${position||'—'}</strong></div><div class="metric"><small>CHAMPION</small><strong>${finished?escapeHTML(TEAMS[c.winner]?.name||'Unknown'):'—'}</strong></div></div><div class="twoCol"><section class="panel"><div class="badge">${finished?'🏁 SEASON COMPLETE':'⚽ CURRENT FIXTURE'}</div><div class="fixture"><span>${finished?'FINAL STANDING':current?.bye?'BYE':'MATCHDAY '+(current?.round||'—')}</span><strong>${finished?`🏆 ${escapeHTML(TEAMS[c.winner]?.name||'Unknown')} WIN THE LEAGUE`:escapeHTML(fixture)}</strong></div>${volatile}${error}<div class="row">${finished?button('START ANOTHER LEAGUE','customLeagueSetup','gold'):action}${button('CUPS MENU','navCups','minor')}</div><h3 class="titleSmall">RECENT RESULTS</h3><div class="scroll" style="max-height:260px">${history}</div></section><section class="panel"><h3 class="titleSmall">LEAGUE TABLE</h3><div class="scroll continentTable"><table class="miniTable"><caption class="srOnly">Custom League standings after ${c.roundIdx} matchdays</caption><thead><tr><th scope="col">#</th><th scope="col">CLUB</th><th scope="col">P</th><th scope="col">W</th><th scope="col">D</th><th scope="col">L</th><th scope="col">GD</th><th scope="col">PTS</th></tr></thead><tbody>${standingsHTML}</tbody></table></div><p class="muted">Tie-breakers: points, goal difference, goals scored, wins, then starting order. CPU match scores are deterministic.</p></section></div>`, 'navCups');
}
function customLeagueBye(){
 try{const next=advanceCustomLeague(customLeagueRun,TEAMS,null);saveCustomLeague(next);showCustomLeague();}
 catch(error){customLeagueSaveError='Could not advance the league: '+error.message;showCustomLeague();}
}
function customLeagueKickoff(){
 const fixture=customLeagueCurrent(customLeagueRun);
 if(!fixture||fixture.bye||!customLeagueTeamReferencesValid(customLeagueRun))return showCustomLeague();
 mode='customLeague';home=customLeagueRun.club;away=fixture.opponent;start();
}
function showSettingsMenu(){menuChoices('nav-settings','SETTINGS','Adjust the game and manage your saved creations.',[
 navItem('Game Settings','navGameSettings','Difficulty, pace, duration, stadium and match conditions.','active','⚽'),
 navItem('Graphics','navGraphics','Camera, player names and fullscreen.','active','🖥'),
 navItem('Sound','navSound','Music, sound effects, crowd and mute.','active','🔊'),
 navItem('Player & Team Customization','navCustomization','Player studio, create club, squad tactics and roster editor.','active','🎨'),
 navItem('Input Settings','navInput','Keyboard and gamepad mappings, touch controls reference.','active','🎮'),
 navItem('Save Management','navSaveManagement','Export or import compatible saves.','active','💾'),
 navItem('How to Play','help','Four-button controls and combo guide.','active','📖'),
 navItem('About & Credits','navAbout','Game version, development notes and credits.','active','ⓘ')],'home');}
function showCustomizationMenu(){menuChoices('nav-customize','PLAYER & TEAM CUSTOMIZATION','Every existing team-management tool is still available.',[
 navItem('Player Studio','playerStudio','Edit player cartoon appearance.','active','🎨'),
 navItem('Create a Club','clubs','Design clubs and kits for matches.','active','🏟'),
 navItem('Roster Editor','editor','Edit 12-player team attributes.','active','🧩'),
 navItem('Squad & Tactics','squad','Lineups, formations and player instructions.','active','👥'),
 navItem('Super Shot Encyclopedia','gallery','Explore available Super Shots.','active','✨')],customizationReturn);}
function showInputMenu(){menuChoices('nav-input','INPUT SETTINGS','The game always uses four actions: Pass, Shoot, Dribble and Jump.',[
 navItem('Keyboard & Gamepad Mappings','controls','Remap both local players.','active','🎮'),
 navItem('Touch Controls & Combos','help','View the existing touch layout and combo reference.','active','👆')],'navSettings');}
function careerBackupTeamReferencesValid(saved){
 const validTeam=id=>Number.isInteger(id)&&id>=0&&id<TEAMS.length&&!!TEAMS[id]?.id;
 if(!saved||!validTeam(saved.club)||!Array.isArray(saved.members)||!saved.members.includes(saved.club)||!saved.members.every(validTeam))return false;
 const members=new Set(saved.members);
 if(!Array.isArray(saved.fixtures)||saved.fixtures.some(round=>!Array.isArray(round)||round.some(match=>!Array.isArray(match)||match.length!==2||!match.every(id=>validTeam(id)&&members.has(id)))))return false;
 if(!saved.table||typeof saved.table!=='object'||saved.members.some(id=>!Object.hasOwn(saved.table,id)))return false;
 if(Object.keys(saved.table).some(key=>!validTeam(Number(key))||!members.has(Number(key))))return false;
 const results=[...(Array.isArray(saved.history)?saved.history:[]),...(saved.lastResult?[saved.lastResult]:[])];
 if(results.some(result=>result?.against!==undefined&&(!validTeam(result.against)||!members.has(result.against))))return false;
 return true;
}
function renderCareerBackupPreview(preview,status=''){
 const target=$('careerBackupPreview');if(!target)return;
 const bySlot=new Map(preview.slots.map(slot=>[slot.number,slot]));
 const rows=Array.from({length:10},(_,i)=>{const slot=bySlot.get(i+1);return `<tr><td>${i+1}${preview.active===i+1?' · ACTIVE':''}</td><td>${slot?escapeHTML(slot.name):'Empty'}</td><td>${slot?escapeHTML(TEAMS[slot.club]?.name||'Unknown team'):'—'}</td><td>${slot?`Season ${escapeHTML(slot.season??'—')} · Week ${escapeHTML(slot.week??'—')}`:'—'}</td></tr>`}).join('');
 target.innerHTML=`<h2 class="titleSmall">CAREER BACKUP PREVIEW</h2><p>${preview.occupied} occupied slots · active slot ${preview.active}</p><div class="scroll"><table class="miniTable"><thead><tr><th>SLOT</th><th>NAME</th><th>CLUB</th><th>PROGRESS</th></tr></thead><tbody>${rows}</tbody></table></div>${status?`<p role="status" aria-live="polite">${escapeHTML(status)}</p>`:''}`;
 target.classList.remove('hidden');
}
function exportCareerBackup(){try{
 const recovery=careerSlots.hasRecoverySnapshot;
 const blob=new Blob([careerSlots.exportBackup()],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='Supermagic_Career_'+(recovery?'Recovery_':'')+'Backup_'+new Date().toISOString().slice(0,10)+'.json';link.click();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
 }catch(error){alert('Career backup export failed: '+error.message)}}
async function importCareerBackup(file){try{
 if(!file||file.size>2000000)throw Error('Career backup must be under 2 MB');
 const bytes=await file.text(),validator=careerBackupTeamReferencesValid;
 const preview=careerSlots.inspectBackup(bytes,validator);
 renderCareerBackupPreview(preview);await new Promise(resolve=>requestAnimationFrame(resolve));
 const hasData=careerSlots.list().some(slot=>slot.occupied);
 const occupied=careerSlots.list().filter(slot=>slot.occupied).length;
 const warning=hasData?`This will REPLACE all ${occupied} local Career saves.`:'No local Career saves will be overwritten.';
 if(!confirm(`Import ${preview.occupied} Career saves? Active slot: ${preview.active}. Review the slot preview, then confirm. ${warning} Export a backup first.`)){
  renderCareerBackupPreview(preview,'Import cancelled. Local Career saves were not changed.');return;
 }
 careerSlots.importBackup(bytes,{overwrite:hasData,validator});
 const restored=careerSlots.activeCareer();
 if(restored){career=ensureCareerTeamPlan(restored);store.put('managerCareer',career);}else career=null;
 renderCareerBackupPreview(preview,`Imported ${preview.occupied} Career saves. Active slot: ${preview.active}.`);
 }catch(error){alert('Career backup import failed: '+error.message)}finally{const input=$('careerBackupImportFile');if(input)input.value='';}}
function showCareerSlots(){
 const hasFree=careerSlots.firstEmpty()!==null;
  const rows=careerSlots.list().map(s=>`<div class="panel"><h3 class="titleSmall">SLOT ${s.number}${s.active?' · ACTIVE':''}</h3><p>${s.occupied?`${escapeHTML(s.name)} · ${escapeHTML(TEAMS[s.club]?.name||'Unknown club')} · Season ${s.season} · Week ${s.week}${s.leaguePosition!==null&&s.leaguePosition!==undefined?` · League #${s.leaguePosition}/${s.leagueSize} · ${s.leaguePoints} pts`:''} · ${escapeHTML(new Date(s.savedAt).toLocaleString())}`:'Empty slot'}</p><div class="row">${career?slotActionButton(s.occupied?'OVERWRITE':'SAVE HERE','careerSlotSave_'+s.number,'Career',s.number):''}${s.occupied?slotActionButton('LOAD','careerSlotLoad_'+s.number,'Career',s.number)+(hasFree?slotActionButton('COPY','careerSlotCopy_'+s.number,'Career',s.number):'')+slotActionButton('RENAME','careerSlotRename_'+s.number,'Career',s.number)+slotActionButton('DELETE','careerSlotDelete_'+s.number,'Career',s.number):''}</div></div>`).join('');
 page('CAREER SAVE SLOTS','10 independent local slots. Rename a saved career without changing its progress or active slot, or copy it to the first empty slot; overwrite and delete require confirmation.',`${careerSlots.error?`<p role="alert">Save storage is damaged: ${escapeHTML(careerSlots.error)}.${careerSlots.hasRecoverySnapshot?' The export action will download the last verified save snapshot.':' No verified in-memory recovery snapshot is available.'}</p>`:''}<div class="scroll">${rows}</div><p class="muted">Legacy single-save careers are copied into slot 1 without removing the old data. Use Settings → Save Management to export all slots.</p>`,'navCareer');
}
function showCupSlots(){
 const hasFree=cupSlots.list().some(slot=>!slot.occupied);
  const rows=cupSlots.list().map(s=>`<div class="panel"><h3 class="titleSmall">SLOT ${s.number}${s.active?' · ACTIVE':''}</h3><p>${s.occupied?`${escapeHTML(s.name)} · ${escapeHTML(s.compId||'Unknown competition')} · ${escapeHTML(TEAMS[s.club]?.name||'Unknown club')} · ${escapeHTML(s.phase)} · ${s.phase==='finished'?'Complete':'Round '+(s.roundIdx+1)} · Saved ${escapeHTML(new Date(s.savedAt).toLocaleString())}`:'Empty slot'}</p><div class="row">${continentalRun?slotActionButton(s.occupied?'OVERWRITE':'SAVE HERE','cupSlotSave_'+s.number,'Cup',s.number):''}${s.occupied?slotActionButton('LOAD','cupSlotLoad_'+s.number,'Cup',s.number)+(hasFree?slotActionButton('COPY','cupSlotCopy_'+s.number,'Cup',s.number):'')+slotActionButton('DELETE','cupSlotDelete_'+s.number,'Cup',s.number):''}</div></div>`).join('');
 page('CUP SAVE SLOTS','Ten independent continental championship slots. The active slot saves after every match or bye.',`${cupSlots.sessionOnly?'<p role="status" aria-live="polite" class="muted">Session-only Cup storage: progress works until this page closes and will then be lost.</p>':''}${cupSlots.error?`<p role="alert">Cup save storage is damaged: ${escapeHTML(cupSlots.error)}.${cupSlots.hasRecoverySnapshot?' The export action will download the last verified save snapshot.':' No verified in-memory recovery snapshot is available.'}</p>`:''}<div class="scroll">${rows}</div><p class="muted">Existing single-save championships are copied into slot 1 without deleting their original data. Back up your slots before importing another Cup vault.</p><div class="row">${button('EXPORT CUP BACKUP','cupBackupExport')}${button('IMPORT CUP BACKUP','cupBackupImport')}</div>`,'navCups');
}
function showSlotNameDialog(kind,operation,number){
 const isCareer=kind==='career',isRename=operation==='rename';
 const slots=isCareer?careerSlots:cupSlots,slot=slots.list()[number-1];
 if(!Number.isInteger(number)||number<1||number>10||isRename&&!slot?.occupied){
  alert(`${isCareer?'Career':'Cup'} slot ${number} is unavailable.`);
  return isCareer?showCareerSlots():showCupSlots();
 }
 const title=isRename?'Rename Career Save':`Save ${isCareer?'Career':'Cup'} to Slot ${number}`;
 const defaultName=slot?.name||(isCareer?TEAMS[career?.club]?.name:cupCompetitionName(continentalRun)||`Cup ${number}`)||`${isCareer?'Career':'Cup'} ${number}`;
 const replacing=operation==='save'&&slot?.occupied;
 const confirmAction=`slotNameConfirm_${kind}_${operation}_${number}`;
 const cancelAction=`slotNameCancel_${kind}_${operation}_${number}`;
 const prompt=replacing?`Saving will replace the existing ${isCareer?'Career':'Cup'} in slot ${number}. Cancel to keep its saved data.`:
  isRename?'Only the slot label will change; Career progress and its save time stay untouched.':
  `Choose a clear name for this ${isCareer?'Career':'Cup'} save.`;
 show(`<section id="slotNameDialog" class="panel saveSlotNameDialog" role="dialog" aria-modal="true" aria-labelledby="slotNameTitle" aria-describedby="slotNameDescription">
  <div class="row space"><h1 class="heading" id="slotNameTitle">${escapeHTML(title)}</h1>${button('CANCEL',cancelAction,'minor')}</div>
  <p id="slotNameDescription" class="subtitle">${escapeHTML(prompt)}</p>
  <form id="slotNameForm" data-slot-action="${escapeHTML(confirmAction)}" novalidate>
   <label class="fieldLabel" for="slotNameInput">${isRename?'CAREER SAVE NAME':'SAVE NAME'}</label>
   <input class="choice" id="slotNameInput" name="saveName" type="text" maxlength="60" required autocomplete="off" value="${escapeHTML(defaultName)}" aria-describedby="slotNameHint slotNameError"/>
   <p class="muted" id="slotNameHint">Enter 1–60 characters. Progress is saved only when you choose ${replacing?'Replace and Save':'Save'}.</p>
   <p class="muted" id="slotNameError" role="alert" aria-live="assertive" aria-atomic="true"></p>
   <div class="row slotNameActions"><button class="btn gold" type="submit">${replacing?'REPLACE AND SAVE':isRename?'SAVE NAME':'SAVE SLOT'}</button><button class="btn minor" type="button" data-action="${escapeHTML(cancelAction)}">CANCEL WITHOUT SAVING</button></div>
  </form>
 </section>`,'SAVE SLOT NAME');
 menuBackAction=cancelAction;
 const field=menu.querySelector('#slotNameInput');field?.focus({preventScroll:true});field?.select();
}
function returnFromSlotName(kind,number,focusAction){
 if(kind==='career')showCareerSlots();else showCupSlots();
 menu.querySelector(`[data-action="${focusAction}"]`)?.focus({preventScroll:true});
}
function reportSlotNameError(message){
 const field=menu.querySelector('#slotNameInput'),error=menu.querySelector('#slotNameError');
 if(error)error.textContent=message;
 if(field){field.setAttribute('aria-invalid','true');field.focus({preventScroll:true});field.select();}
}
function showSaveMenu(parent='navSettings'){menuChoices('nav-saves','SAVE MANAGEMENT','Safely back up or restore local progress.',[
 navItem('Export All Saves','exportSave','Download a JSON backup without changing progress.','active','⬇'),
 navItem('Import Save','importSave','Requires explicit confirmation before replacing progress.','active','⬆'),
 navItem('Export Career Slots','careerBackupExport','Back up all ten Career slots and the active slot.','active','💼'),
 navItem('Import Career Slots','careerBackupImport','Preview all slots and team references before replacing Career saves.','active','📥')],parent,`<input id="saveImportFile" type="file" accept=".json,application/json" class="hidden" aria-label="Import saved game"/><input id="careerBackupImportFile" type="file" accept=".json,application/json" class="hidden" aria-label="Import Career backup"/><section id="careerBackupPreview" class="panel hidden" aria-label="Career backup preview" aria-live="polite"></section>`);}
const STORE_CATEGORIES=Object.freeze([
 ['superShot','Super Shots'],['magicTrick','Magic Tricks'],['team','Teams'],
 ['player','Players'],['appearance','Appearance'],['accessory','Accessories']
]);
const STORE_PAGE_SIZE=12;
function tokenStoreCatalog(){
 if(storeCatalogCache)return storeCatalogCache;
 const appearances=[];
 const accessories=[];
 const teams=GAME_ASSETS.teams.map(team=>({category:'team',id:team.id,name:team.name,detail:`${team.group||'Club'} · ${team.country||'Team collection'}`,existing:true,availableForPurchase:true}));
 const players=[];
 const seenPlayers=new Set();
 for(const team of GAME_ASSETS.teams){
  for(const player of GAME_ASSETS.rosters[team.id]||[]){
   if(typeof player.id!=='string'||seenPlayers.has(player.id))continue;
   seenPlayers.add(player.id);
   players.push({category:'player',id:player.id,name:player.name,detail:`${player.role||'Player'} · ${team.name}`,existing:true,availableForPurchase:true});
  }
 }
 for(const family of ['style','face','eyes','brows','eyeColor','nose','lips','body','stature','exaggeration','beard','freckles','scar','tattoo'])
  for(const [index,name] of (STUDIO_ASSET_LABELS[family]||[]).entries())appearances.push({category:'appearance',id:`${family}:${index}`,name:`${family.replace(/[A-Z]/g,m=>' '+m).toUpperCase()} · ${name}`,existing:true,availableForPurchase:true});
 for(const [index,name] of (STUDIO_ASSET_LABELS.accessory||[]).entries())accessories.push({category:'accessory',id:`accessory:${index}`,name:`ACCESSORY · ${name}`,existing:true,availableForPurchase:true});
 for(const [index,[,name]] of NATURAL_SKIN_TONES.entries())appearances.push({category:'appearance',id:`skin:${index}`,name:`SKIN TONE · ${name}`,existing:true,availableForPurchase:true});
 for(const [index,[,name]] of NATURAL_HAIR_COLORS.entries())appearances.push({category:'appearance',id:`hair:${index}`,name:`HAIR COLOR · ${name}`,existing:true,availableForPurchase:true});
 storeCatalogCache={
  superShot:Object.entries(SHOTS).map(([id,shot])=>({category:'superShot',id,name:shot.name||id,detail:`${String(shot.behavior||'special').toUpperCase()} · impact ${Math.round((Number(shot.impact)||1)*100)}%`,existing:true,availableForPurchase:true})),
  magicTrick:STUDIO_MAGIC_TRICK_FULL_CATALOGUE.map(trick=>({category:'magicTrick',id:trick.id,name:trick.name,existing:true,availableForPurchase:true})),
  team:teams,player:players,appearance:appearances,accessory:accessories
 };
 return storeCatalogCache;
}
function storeCard(item){
 const owned=tokenWallet.owns(item.category,item.id),cost=ECONOMY.PRICES[item.category];
 const detail=item.detail||({superShot:'Unlocks the Studio option for an eligible player; existing role and verified-tier rules still apply.',magicTrick:'Unlocks the Studio option for an eligible outfield player; existing tier rules still apply.',team:'Adds this existing team to your local token collection. All current team choices remain playable for free.',player:'Adds this existing player to your local token collection. Existing rosters and Career saves remain unchanged.',appearance:'Unlocks this existing palette or character detail in Player Studio. Current saved looks remain available.',accessory:'Unlocks this existing accessory in Player Studio. Current saved looks remain available.'}[item.category]);
 const action=`storeBuy_${item.category}_${encodeURIComponent(item.id)}`;
 return `<article class="tokenStoreCard"><div class="tokenStoreCardTop"><span class="tokenStoreCategory">${escapeHTML(item.category==='superShot'?'SUPER SHOT':item.category==='magicTrick'?'MAGIC TRICK':item.category.toUpperCase())}</span><span class="tokenStorePrice">${owned?'OWNED':`${cost} TOKENS`}</span></div><h3>${escapeHTML(item.name)}</h3>${item.detail?`<p class="tokenStoreDetail">${escapeHTML(item.detail)}</p>`:''}<p class="muted">${escapeHTML(detail)}</p><button type="button" class="btn ${owned?'minor':'gold'} tokenStoreBuy" data-action="${escapeHTML(action)}" ${owned||tokenWallet.readOnly?'disabled aria-disabled="true"':''} aria-label="${owned?'Owned':tokenWallet.readOnly?'Purchases unavailable':'Buy '+escapeHTML(item.name)+' for '+cost+' tokens'}">${owned?'OWNED':tokenWallet.readOnly?'UNAVAILABLE':`BUY · ${cost} TOKENS`}</button></article>`;
}
function drawTokenStoreCards(){
 const host=$('tokenStoreCards'),status=$('tokenStoreRange'),previous=$('storePagePrev'),next=$('storePageNext');if(!host)return;
 if(!STORE_CATEGORIES.some(([id])=>id===storeCategory)){
  const label=STORE_CATEGORIES.find(([id])=>id===storeCategory)?.[1]||'This category';
  host.innerHTML=`<section class="panel tokenStoreComingSoon"><span class="badge">${escapeHTML(label.toUpperCase())}</span><h2>CATALOG UNAVAILABLE</h2><p class="muted">This catalog could not be loaded. No tokens were spent.</p></section>`;
  if(status)status.textContent='Catalog unavailable';if(previous)previous.hidden=true;if(next)next.hidden=true;
  const feedback=$('tokenStoreNotice');if(feedback)feedback.textContent=tokenWallet.error?`Wallet unavailable: ${tokenWallet.error}`:'';
  return;
 }
 if(previous)previous.hidden=false;if(next)next.hidden=false;
 const query=storeSearch.trim().toLocaleLowerCase(),items=(tokenStoreCatalog()[storeCategory]||[]).filter(item=>(!storeOwnedOnly||tokenWallet.owns(item.category,item.id))&&(!query||`${item.name} ${item.detail||''} ${item.id}`.toLocaleLowerCase().includes(query)));
 const pages=Math.max(1,Math.ceil(items.length/STORE_PAGE_SIZE));storePage=Math.max(0,Math.min(storePage,pages-1));
 host.innerHTML=items.slice(storePage*STORE_PAGE_SIZE,(storePage+1)*STORE_PAGE_SIZE).map(storeCard).join('')||'<div class="panel tokenStoreEmpty">No matching items. Try a shorter search.</div>';
 if(status)status.textContent=items.length?`Showing ${storePage*STORE_PAGE_SIZE+1}–${Math.min(items.length,(storePage+1)*STORE_PAGE_SIZE)} of ${items.length}`:'0 items';
 if(previous)previous.disabled=storePage===0;if(next)next.disabled=storePage+1>=pages;
 const feedback=$('tokenStoreNotice');if(feedback)feedback.textContent=storeNotice||tokenWallet.error&&`Wallet unavailable: ${tokenWallet.error}`||'';
 const wallet=tokenWallet.wallet();
 const balance=$('tokenStoreBalance');if(balance)balance.textContent=wallet?`${wallet.tokens.toLocaleString()} TOKENS`:'TOKENS UNAVAILABLE';
}
function showTokenStore(){
 const categoryLabel=STORE_CATEGORIES.find(([id])=>id===storeCategory)?.[1]||'Super Shots';
 const wallet=tokenWallet.wallet();
 page('STORE & TOKENS','Earn tokens in Career, Cups, tournaments and online matches. Unlock existing game items. Team/player purchases add to your collection; all current teams and players remain playable for free.',`<section class="tokenStoreWallet panel" aria-label="Token wallet"><div><span class="badge">YOUR WALLET</span><strong id="tokenStoreBalance">${wallet?`${wallet.tokens.toLocaleString()} TOKENS`:'TOKENS UNAVAILABLE'}</strong></div><p class="muted">No real-money purchases or token packs are available. Unlocks are saved locally and included in Export All Saves.</p></section>${tokenWallet.error?`<section class="panel" role="status"><p class="muted">${escapeHTML(tokenWallet.error)} Token rewards and purchases are paused until storage recovers. Offline matches remain available.</p>${button('RETRY WALLET STORAGE','walletRetry','minor')}</section>`:''}<p class="muted tokenStoreRules">Match rewards: ${ECONOMY.REWARDS.completion} tokens for completion, +${ECONOMY.REWARDS.winBonus} for a win, +${ECONOMY.REWARDS.drawBonus} for a draw. Losses still receive the completion reward. Online peer-match receipts are host-authoritative and pay each device's local soft-token wallet; they are not server-verified.</p><div class="panel tokenStoreControls"><label class="fieldLabel" for="storeCategory">SHOP CATEGORY</label><select class="choice" id="storeCategory" aria-label="Shop category">${STORE_CATEGORIES.map(([id,label])=>`<option value="${id}" ${id===storeCategory?'selected':''}>${label}</option>`).join('')}</select><label class="fieldLabel" for="storeSearch">SEARCH ${escapeHTML(categoryLabel.toUpperCase())}</label><input class="choice" type="search" id="storeSearch" value="${escapeHTML(storeSearch)}" placeholder="Search existing items" autocomplete="off" aria-controls="tokenStoreCards"/><label class="tokenStoreOwnedFilter"><input id="storeOwnedOnly" type="checkbox" ${storeOwnedOnly?'checked':''}/> SHOW OWNED ONLY</label><p id="tokenStoreRange" class="muted" role="status" aria-live="polite"></p><div class="row tokenStorePager"><button type="button" class="btn minor" id="storePagePrev" data-action="storePagePrev">← PREVIOUS</button><button type="button" class="btn minor" id="storePageNext" data-action="storePageNext">NEXT →</button></div></div><p id="tokenStoreNotice" class="tokenStoreNotice" role="status" aria-live="polite" aria-atomic="true"></p><div id="tokenStoreCards" class="tokenStoreCards" aria-label="Available store items"></div>`,`home`);
 menu.querySelector('#storeCategory')?.addEventListener('change',event=>{storeCategory=event.target.value;storePage=0;storeSearch='';storeNotice='';menu.querySelector('#storeSearch').value='';const label=STORE_CATEGORIES.find(([id])=>id===storeCategory)?.[1]||'Existing items';const searchLabel=menu.querySelector('label[for="storeSearch"]');if(searchLabel)searchLabel.textContent=`SEARCH ${label.toUpperCase()}`;drawTokenStoreCards();});
 menu.querySelector('#storeSearch')?.addEventListener('input',event=>{storeSearch=event.target.value;storePage=0;drawTokenStoreCards();});
 menu.querySelector('#storeOwnedOnly')?.addEventListener('change',event=>{storeOwnedOnly=event.target.checked;storePage=0;drawTokenStoreCards();});
 drawTokenStoreCards();
}
async function buyTokenStoreItem(category,id){
 const item=(tokenStoreCatalog()[category]||[]).find(entry=>entry.id===id);
 if(!item){storeNotice='That item is not in the existing content catalog.';showTokenStore();return;}
 try{
  const result=await tokenWallet.purchase({category,id},tokenStoreCatalog()[category]);
  storeNotice=result.ok?`${item.name} unlocked for ${result.cost} tokens.`:result.reason==='insufficient-tokens'?`Not enough tokens. ${result.cost} needed; ${result.wallet.tokens} available.`:result.reason==='already-owned'?`${item.name} is already owned.`:`This item is not available to buy (${result.reason}).`;
 }catch(error){storeNotice=`Purchase was not saved: ${error.message}`;}
 showTokenStore();
 const cards=[...menu.querySelectorAll('.tokenStoreCard')],boughtIndex=cards.findIndex(card=>card.querySelector(`[data-action="storeBuy_${category}_${encodeURIComponent(id)}"]`));
 const nextPurchase=cards.slice(Math.max(0,boughtIndex+1)).map(card=>card.querySelector('button:not([disabled])')).find(Boolean);
 (nextPurchase||menu.querySelector('#tokenStoreCards button:not([disabled])')||menu.querySelector('#storePageNext:not([disabled])')||$('storeSearch'))?.focus({preventScroll:true});
}
const LOCAL_TOKEN_RECOVERY_KEY='smf_pendingLocalTokenReward';
let pendingLocalTokenReward=null;
function readLocalTokenRecovery(){
 try{const raw=globalThis.sessionStorage?.getItem(LOCAL_TOKEN_RECOVERY_KEY);if(raw===null||raw===undefined)return pendingLocalTokenReward;const value=JSON.parse(raw);if(value&&Object.keys(value).length===4&&typeof value.receiptId==='string'&&['career','cup','tournament','continental'].includes(value.mode)&&value.status==='completed'&&['win','draw','loss'].includes(value.result))return value;return null;}catch{return pendingLocalTokenReward;}
}
function saveLocalTokenRecovery(value){pendingLocalTokenReward=value;try{globalThis.sessionStorage?.setItem(LOCAL_TOKEN_RECOVERY_KEY,JSON.stringify(value));return readLocalTokenRecovery()?.receiptId===value.receiptId;}catch{return false;}}
function clearLocalTokenRecovery(receiptId){const current=readLocalTokenRecovery();if(!current||current.receiptId!==receiptId)return !current;pendingLocalTokenReward=null;try{globalThis.sessionStorage?.removeItem(LOCAL_TOKEN_RECOVERY_KEY);return globalThis.sessionStorage?.getItem(LOCAL_TOKEN_RECOVERY_KEY)===null;}catch{return false;}}
async function retryLocalTokenReward(){
 const pending=readLocalTokenRecovery();if(!pending)return false;
 try{const result=await tokenWallet.awardCompletedMatch(pending);if(result.reason==='receipt-capacity')return 'capacity';const saved=result.ok||result.duplicate;if(saved)clearLocalTokenRecovery(pending.receiptId);return saved;}
 catch{return false;}
}
async function awardLocalMatchTokens(event,score){
 const modeKey=mode==='career'?'career':mode==='continental'?'continental':['league','customLeague'].includes(mode)?'tournament':null;
 if(!modeKey||!activeMatchReceiptId||lanRuntime||lanRole||!Array.isArray(score)||score.length!==2||!score.every(Number.isFinite))return '';
 if(modeKey==='continental'&&!lastCupResultCommitted)return '<p class="muted">No tournament tokens awarded because this result could not be committed to a Cup save slot.</p>';
 if(modeKey==='tournament'&&!(mode==='customLeague'?customLeagueResultCommitted:leagueResultCommitted))return '<p class="muted">No tournament tokens awarded because this result could not be committed to the local league save.</p>';
 const result=event?.penalties&&(event.winner===0||event.winner===1)?event.winner===0?'win':'loss':score[0]>score[1]?'win':score[0]<score[1]?'loss':'draw';
 const payload={receiptId:activeMatchReceiptId,mode:modeKey,status:'completed',result};
 saveLocalTokenRecovery(payload);
 try{
  const receipt=await tokenWallet.awardCompletedMatch(payload);
  if(receipt.ok||receipt.duplicate)clearLocalTokenRecovery(payload.receiptId);
  if(receipt.ok)return `<p class="tokenRewardNotice" role="status">+${receipt.reward} TOKENS · MATCH COMPLETE</p>`;
  if(receipt.duplicate)return '<p class="tokenRewardNotice" role="status">MATCH TOKENS ALREADY AWARDED</p>';
  if(receipt.reason==='receipt-capacity'){return `<section class="panel" aria-label="Token reward storage limit"><p class="muted" role="status">The exact local receipt ledger reached its safe backup-size limit, so this match was not credited. Your match receipt is kept in this tab. Exporting preserves the full ledger but does not create more space; local rewards can resume after a future account-ledger migration.</p>${button('OPEN SAVE MANAGEMENT','navSaveManagement','minor')}</section>`;}
  return '';
 }catch(error){
  console.warn('Completed match token reward could not be saved:',error.message);
  return `<section class="panel" id="localTokenRecovery" aria-label="Token reward recovery"><p class="muted" id="localTokenRecoveryStatus" role="status" aria-live="polite">${escapeHTML(tokenWallet.error||'Match complete, but token reward could not be saved.')}</p>${button('RETRY TOKEN REWARD','retryLocalTokenReward','minor')}</section>`;
 }
}
// A backup with an empty active slot must not destroy the previous legacy mirror.
// The slot vault remains authoritative after restore; the mirror is retained only
// as a recovery copy, matching Career backup behavior.
function applyImportedCupBackupState(){const restored=cupSlots.activeTournament();continentalRun=restored;if(restored)store.put('continentalRun',restored);showCupSlots();}
// The installed bundle supplies the version and release notes, including offline.
// Never substitute a remote dev commit for proof of the player's deployed game.
function showAbout(){
 const bundle=escapeHTML(RELEASE.version),date=escapeHTML(RELEASE.date);
 const notes=RELEASE.notes.map(note=>`<li>${escapeHTML(note)}</li>`).join('');
  page('ABOUT SUPERMAGIC FOOTBALL','Original offline cartoon arcade football.',
   `<div class="panel"><h2>GAME VERSION</h2><p id="aboutBundleVersion"><strong>${bundle}</strong></p><p class="muted">Release date · ${date}. This version is embedded in the game you opened and remains available offline.</p><h3>WHAT'S NEW</h3><ul id="aboutReleaseNotes">${notes}</ul><p><strong>Developer: Saeed</strong> · <a href="mailto:saeedmsalehi1990@gmail.com">saeedmsalehi1990@gmail.com</a></p><p class="muted">Four action buttons · ${TEAMS.length} teams · progress saved locally on your device.</p>${button('← SETTINGS','navSettings','gold')}</div>`,'navSettings');
}
// Decorative, original vector emblems for the five Home destinations. These
// are static inline shapes so they remain crisp at touch sizes and never add
// motion or spoken noise to the accessible button labels.
function homeModeIconMarkup(action){
 const common='focusable="false" aria-hidden="true"';
 const paths={
  navQuick:`<circle cx="24" cy="24" r="18"/><path d="m24 13 7 5-3 8h-8l-3-8 7-5ZM17 18l-7 2M17 26l-5 7M28 26l5 7M31 18l7 2"/><path d="m10 20-3-1M12 33l-2 3M36 33l2 3M38 20l3-1"/>`,
  navOnline:`<circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c5 5 7 11 7 18s-2 13-7 18M24 6c-5 5-7 11-7 18s2 13 7 18M9 15h30M9 33h30"/>`,
  navCareer:`<rect x="7" y="15" width="34" height="25" rx="3"/><path d="M17 15v-5h14v5M7 24h34M20 23v4h8v-4"/><path d="M11 33h7M30 33h7"/>`,
  navCups:`<path d="M15 8h18v10c0 8-4 13-9 13s-9-5-9-13V8Z"/><path d="M15 12H8v5c0 5 3 8 8 8M33 12h7v5c0 5-3 8-8 8M24 31v7M17 40h14"/><path d="M20 14h8"/>`,
  training:`<path d="m24 7-12 32h24L24 7Z"/><path d="M18 24h12M15 32h18M9 40h30"/>`,
  navSettings:`<path d="M9 13h30M9 24h30M9 35h30"/><circle cx="19" cy="13" r="4" class="iconFill"/><circle cx="31" cy="24" r="4" class="iconFill"/><circle cx="16" cy="35" r="4" class="iconFill"/>`,
  navStore:`<path d="M8 18h32v22H8z"/><path d="M12 18c0-7 5-12 12-12s12 5 12 12"/><path d="m24 23 2.2 4.5 5 .7-3.6 3.5.8 5-4.4-2.4-4.4 2.4.8-5-3.6-3.5 5-.7L24 23Z" class="iconFill"/>`
 };
 return `<svg ${common} class="modeIconSvg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${paths[action]||paths.navQuick}</svg>`;
}
function showHome(){
 menuBackAction='home';menuEntryReturn='home';customizationReturn='home';
 const wallet=tokenWallet.wallet(),tokens=wallet?wallet.tokens.toLocaleString():'UNAVAILABLE',fixture=career?currentCareerFixture(career):null;
 const tile=(label,action,icon,extra='')=>`<button type="button" class="btn homeActionTile ${extra}" data-action="${action}"><span class="homeTileIcon" aria-hidden="true">${icon}</span><span>${label}</span></button>`;
 const tileIcons={squad:`<circle cx="18" cy="17" r="6"/><circle cx="36" cy="18" r="5"/><path d="M5 43v-4c0-9 5-14 13-14s13 5 13 14v4H5ZM30 28c8-3 14 2 14 10v5H34"/>`,
  customize:`<path d="m16 8-10 6 5 8 6-3v20h14V19l6 3 5-8-10-6c-1 4-4 6-8 6s-7-2-8-6Z"/>`,
  shop:`<path d="M5 8h6l4 21h22l5-15H13"/><circle cx="19" cy="37" r="3"/><circle cx="34" cy="37" r="3"/>`,
  studio:`<path d="M24 6C13 6 6 14 6 24s5 17 13 17h3c2 0 3-2 2-4l-1-2c-1-2 1-4 3-4h4c7 0 11-5 11-11S34 6 24 6Z"/><circle cx="16" cy="19" r="2"/><circle cx="24" cy="14" r="2"/><circle cx="32" cy="19" r="2"/>`,
  settings:`<circle cx="24" cy="24" r="7"/><path d="m20 4 8 0 1 5 4 2 5-2 4 7-4 3v5l4 4-4 7-5-2-4 2-1 5h-8l-1-5-4-2-5 2-4-7 4-4v-5l-4-3 4-7 5 2 4-2 1-5Z"/>`};
 const actionIcon=(name)=>`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">${tileIcons[name]}</svg>`;
 const pendingLanRecovery=readLanHostResultRecovery(),pendingLocalRecovery=readLocalTokenRecovery();
 show(`<div class="homeReferenceShell">
 <header class="homeMasthead arcadeHomeHeader"><div class="arcadeIdentity"><div class="homeBrandLockup"><span class="homeBrandBall" aria-hidden="true"><svg viewBox="0 0 80 86" fill="none" focusable="false"><path d="M40 3 74 16v25c0 21-14 34-34 42C20 75 6 62 6 41V16L40 3Z" fill="#08224C" stroke="#FFE082" stroke-width="4"/><path d="M40 12 66 22v19c0 17-10 27-26 34-16-7-26-17-26-34V22l26-10Z" fill="#155292" stroke="#E9F6FF" stroke-width="2"/><circle cx="40" cy="42" r="17" fill="#F5FAFF" stroke="#12223E" stroke-width="3"/><path d="m40 32 7 5-3 8h-8l-3-8 7-5ZM26 40l-7-2M29 51l-4 7M49 51l4 7M54 40l7-2" stroke="#172642" stroke-width="3" stroke-linejoin="round"/><path d="m40 10 2 5 5 .4-4 3 1.5 5-4.5-2.8-4.5 2.8 1.5-5-4-3 5-.4 2-5Z" fill="#FFD15C"/></svg></span><div><h1 class="heading logoHeading">SUPER<br><em>MAGIC FOOTBALL</em></h1><p class="subtitle homeBrandTagline">BIG GOALS · WILD TRICKS · YOUR FOOTBALL UNIVERSE</p></div></div></div>
 <div class="arcadeHomeTools"><div class="arcadeProfile"><span class="arcadeProfileIcon" aria-hidden="true">01</span><span><strong>PLAYER 01</strong><small>LOCAL PROFILE</small></span></div><button type="button" class="btn arcadeWallet" data-action="navStore" aria-label="Open Shop. Token balance: ${tokens}"><span class="arcadeCoin" aria-hidden="true">$</span><span class="arcadeWalletCopy"><small> TOKENS</small><strong>${tokens}</strong></span><span class="arcadeWalletPlus" aria-hidden="true">＋</span></button><button type="button" class="btn homeGearButton" data-action="navSettings" aria-label="Settings">⚙</button></div></header>
 <div class="homeReferenceGrid"><main class="homeReferenceNav" aria-label="Main menu">${pendingLocalRecovery?`<section id="localTokenRecovery" class="panel" aria-label="Local match token reward recovery"><p id="localTokenRecoveryStatus" role="status" aria-live="polite">A completed offline match reward is waiting for local wallet storage. Its exact receipt is saved for a safe retry.</p><button type="button" class="btn gold" data-action="retryLocalTokenReward">RETRY TOKEN REWARD</button></section>`:''}${pendingLanRecovery?`<section id="lanHostReceiptRecovery" class="panel" aria-label="Online match token reward recovery"><p id="lanHostReceiptRecoveryStatus" role="status" aria-live="polite">An online match reward still needs to be saved on this device. This same-tab recovery uses its existing receipt and is not server-verified.</p><button type="button" class="btn gold" data-action="retryLanReceipt">RETRY TOKEN REWARD</button></section>`:''}<button type="button" class="btn homeKickoff" data-action="quick"><span class="homeKickoffCopy"><strong>KICK OFF</strong><small>Jump straight into the action!</small></span><span class="homeKickoffArrow" aria-hidden="true">›</span><span class="homeKickoffPlayer" aria-hidden="true"><img src="./assets/ui/home-hero-player.webp" alt=""/></span></button>
 <div class="navList navMainList" aria-label="Game modes">${[
 navItem('Quick Match','navQuick','Play locally or enter training.','active','⚽'),
 navItem('Online','navOnline','Play online matches and events.','active','🌐'),
 navItem('Career','navCareer','Build your team and make history.','active','★'),
 navItem('Leagues & Cups','navCups','Compete in major leagues and cups.','active','🏆'),
 navItem('Training','training','Master skills, moves and magic trick plays.','active','✦')
 ].map(e=>`<button type="button" class="btn navChoice" data-action="${e.act}"><span class="navIcon modeGraphic modeGraphic-${e.act}" aria-hidden="true">${homeModeIconMarkup(e.act)}</span><span class="navCopy"><strong>${e.label}</strong><small>${e.description}</small></span><span class="navStatus" aria-hidden="true">›</span></button>`).join('')}</div>
 <nav class="homeActionTiles" aria-label="Team and player"><span class="srOnly">Team and player</span>${tile('SQUAD','squad',actionIcon('squad'))}${tile('CUSTOMIZE','navCustomization',actionIcon('customize'))}${tile('SHOP','navStore',actionIcon('shop'),'homeShopTile')}${tile('PLAYER<br>STUDIO','playerStudio',actionIcon('studio'))}${tile('SETTINGS','navSettings',actionIcon('settings'))}</nav>
 </main>
 <section class="homeReferenceFeature" aria-label="Featured football action"><div class="homeStadiumScene"><div class="homeSceneLights" aria-hidden="true"></div><div class="homeCrowdBand" aria-hidden="true"></div><div class="homePitchMarks" aria-hidden="true"></div><canvas id="posterCanvas" width="900" height="650" aria-label="Animated football"></canvas></div><img class="homeHeroPlayer" src="./assets/ui/home-hero-player.webp" alt="" aria-hidden="true" decoding="async" fetchpriority="high">
 <div class="homeEventBar"><div class="homeEventTrophy" aria-hidden="true">🏆</div><div class="homeEventCopy"><small>FEATURED EVENT</small><strong>MAGIC CUP</strong><span>KNOCKOUT TOURNAMENT</span></div><div class="homeEventDivider" aria-hidden="true"></div><div class="homeNextMatch"><small>NEXT MATCH</small><div class="homeFixturePair" aria-hidden="true">${career&&fixture?identity(career.club):'<span class="homeFallbackCrest">⚽</span>'}<i>VS</i>${career&&fixture?identity(fixture.opponent):'<span class="homeFallbackCrest">★</span>'}</div><strong>${career&&fixture?`${escapeHTML(TEAMS[career.club]?.name||'Career club')} vs ${escapeHTML(TEAMS[fixture.opponent]?.name||'Opponent')}`:'READY TO PLAY'}</strong><span>${career&&fixture?`${escapeHTML(fixture.round||'Next fixture')} · Season ${career.season}`:'Select a cup or league.'}</span></div></div>
</section></div></div>`,'home');
 drawPoster();restoreHomeMenuFocus();
}
function drawPoster(){let canvas=$('posterCanvas');if(!canvas)return;let cx=canvas.getContext('2d');let t=performance.now()/1000;const w=canvas.width,h=canvas.height;cx.clearRect(0,0,w,h);
 const reduced=!!game.options?.reducedFlash,bx=w*.84+Math.cos(t*1.5)*w*.006,by=h*.72+Math.sin(t*2)*h*.012;
 if(!reduced){cx.save();cx.globalAlpha=.6;cx.shadowBlur=28;cx.lineWidth=5;for(const [color,offset] of [['#51dcff',0],['#fff0a0',Math.PI]]){cx.strokeStyle=color;cx.shadowColor=color;cx.beginPath();cx.ellipse(bx-w*.015,by+5,Math.min(w,h)*(.12+Math.sin(t*1.6+offset)*.012),Math.min(w,h)*(.052+Math.sin(t*1.6+offset)*.006),-.22+Math.sin(t)*.04,offset+t*.35,offset+t*.35+Math.PI*1.35);cx.stroke()}cx.restore()}
 cx.save();cx.translate(bx,by);cx.rotate(t*.22);cx.scale(h/112,h/112);renderer.drawSoccerBall(cx,0,0,15);cx.restore();
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
 <div class="clubList">${custom.map(({t,i})=>`<div class="clubRow">${identity(i)}<div><strong>${escapeHTML(t.name)}</strong><div class="rosterMeta">${escapeHTML(SHOTS[t.shot]?.name||'Super shot')} · ${t.rank} OVR</div></div><div class="row">${button('PLAY','selectClub'+i,'gold')}${button('EDIT PLAYERS','editClubPlayers'+i)}${button('EDIT ROSTER','editClubRoster'+i)}${button('×','deleteClub'+i,'minor')}</div></div>`).join('')||'<p class="muted">No custom clubs yet. Create one and use it in matches!</p>'}</div>
 </div></div>`);
}
function saveNewClub(){
 const name=$('clubName').value.trim().slice(0,25),flag=$('clubCode').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);
 if(name.length<2||flag.length<2){alert('Enter a club name and a 2–3 letter badge.');return}
 if(TEAMS.some(t=>t.name.toLowerCase()===name.toLowerCase())){alert('This team name already exists.');return}
 const rank=Number($('clubRank').value),shot=$('clubShot').value,slug='club_'+Date.now().toString(36);
 const newRoster=Array.from({length:12},(_,i)=>({id:slug+'_'+i,name:(['Ace','Buster','Dash','Flash','Rex','Zip','Boom','Sunny','Maverick','Rocket','Dashie','Glove'][i]),role:i===0||i===11?'GK':i<4?'DF':i<7?'MF':'FW',num:i+1,power:Math.min(65,35+Math.round(rank*.3)+i%9),shoot:15+Math.round(rank*.12)+(i%5),defense:15+Math.round(rank*.13)+(i%3),speed:['B','C','A','B','D'][i%5],shot,shotName:SHOTS[shot].name,skill:'Club Technique',level:1,xp:0,fictional:true}));
 const t={id:slug,index:TEAMS.length,name,flag:flag||'CL',primary:$('clubPrimary').value,secondary:$('clubSecondary').value,trim:$('clubThird').value,shot,rank,customRoster:newRoster};
 TEAMS.push(t);store.put('customClubs',TEAMS.filter(t=>t.id.startsWith('club_')));home=t.index;away=home===away?0:away;showClubs();
}
function deleteClub(idx){
 const t=TEAMS[idx];if(!t?.id.startsWith('club_')||!confirm(`Delete club ${t.name}?`))return;
 TEAMS.splice(idx,1);TEAMS.forEach((t,i)=>t.index=i);home=0;away=9;store.put('customClubs',TEAMS.filter(t=>t.id.startsWith('club_')));showClubs();
}

// CONTINENTAL CAMPAIGNS — six confederations, all documented participants, self-contained offline seasons.
const confed=id=>CONTINENTS.find(c=>c.id===id);
const cupCompetitionName=t=>t?.compId==='CUSTOM'?'Custom Cup':confed(t?.compId)?.name||(t?.compId?`Cup ${t.compId}`:'');
function showContinents(){
 const inProgress=continentalRun&&continentalRun.phase!=='finished';
 page('GLOBAL CLUB CHAMPIONSHIPS','Choose one of six confederation competitions. Play every match of a single-club championship run, or continue your saved campaign.',
 `<div class="confedGrid">${CONTINENTS.map(c=>`<div class="confedCard"><div class="confedTop"><span class="confedIcon">${{UEFA:'🏆',AFC:'🌏',CAF:'🌍',CONCACAF:'🌎',CONMEBOL:'🔥',OFC:'🌊'}[c.id]}</span><div><div class="badge">${c.id} · ${c.season}</div><h3>${c.name}</h3><span class="rosterMeta">${CONTINENTAL_TEAMS[c.id].length} PARTICIPANTS · ${c.region}</span></div></div><p class="muted"><strong>Top six:</strong> ${c.featured.split('|').map(escapeHTML).join(' · ')}</p>${button('BROWSE CLUBS & START','continentPick_'+c.id,'gold')}</div>`).join('')}</div>
 <div class="row">${button('💾 10 CUP SAVE SLOTS','navCupSlots','minor')}</div>
 ${continentalRun?`<div class="fixture"><strong>Saved: ${cupCompetitionName(continentalRun)} · ${escapeHTML(TEAMS[continentalRun.club]?.name||'Unknown club')}</strong><p>${escapeHTML(tournamentProgress(continentalRun))}</p>${button('▶ CONTINUE SAVED TOURNAMENT','continentContinue','gold')}</div>`:''}
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
let lastCupResultCommitted=false;
let leagueResultCommitted=false;
function persistLeagueResult(value){
 try{const raw=JSON.stringify(value);careerStorage.setItem('legend_league',raw);return careerStorage.getItem('legend_league')===raw;}
 catch(error){console.warn('League progress could not be committed:',error.message);return false;}
}
function writeCupSlot(slot,tournament,name){
 try{const result=cupSlots.save(slot,tournament,name);cupSaveVolatile=!!cupSlots.sessionOnly;return result;}
 catch(error){
  if(!/Persistent storage unavailable/.test(String(error?.message)))throw error;
  if(!cupSaveVolatile)console.warn('Cup progress is session-only: persistent storage unavailable.');
  cupSaveVolatile=true;
  return null;
 }
}
function startContinent(){const value=+$('continentClub').value;try{const fresh=createTournament(continentSelection,value,TEAMS,CONTINENTAL_TEAMS);const slot=cupSlots.firstEmpty()??cupSlots.active;if(cupSlots.list()[slot-1].occupied&&!confirm('All ten Cup slots are full. Overwrite active Cup slot '+slot+'?'))return;writeCupSlot(slot,fresh,confed(fresh.compId)?.name||'Cup '+slot);continentalRun=fresh;store.put('continentalRun',continentalRun);showTournament()}catch(e){alert('Could not start Cup: '+e.message)}}
function saveCup(){if(!continentalRun)return;writeCupSlot(cupSlots.active,continentalRun);store.put('continentalRun',continentalRun)}
// Apply a result to a detached campaign and commit it only after the active slot accepts the update.
function applyCupMatchResult(score,penaltyWinner=null){
 const next=JSON.parse(JSON.stringify(continentalRun));
 const result=tournamentAdvance(next,TEAMS,score,penaltyWinner);
 const committed=writeCupSlot(cupSlots.active,next);lastCupResultCommitted=!!committed;
 continentalRun=next;store.put('continentalRun',continentalRun);
 return result;
}
function formatCupHistoryScore(value){return Number.isSafeInteger(value)&&value>=0&&value<=999?String(value):'—'}
function showTournament(){if(!continentalRun)return showContinents();const t=continentalRun,c=confed(t.compId)||{id:'CUSTOM',name:'CUSTOM CUP',season:'Custom',featured:''},fx=tournamentCurrent(t),my=TEAMS[t.club],rank=tournamentStandings(t),position=rank.findIndex(x=>x.id===t.club)+1;
 const standingsHTML=rank.slice(0,Math.min(36,rank.length)).map((p,i)=>`<tr class="${p.id===t.club?'myTeam':''}"><td>${i+1}</td><td>${teamIdentity(TEAMS[p.id])} ${escapeHTML(TEAMS[p.id].name)}</td><td>${p.p}</td><td>${p.w}</td><td>${p.d}</td><td>${p.l}</td><td>${p.gf-p.ga}</td><td>${p.pts}</td></tr>`).join('');
 page(t.compId==='CUSTOM'?'CUSTOM CUP':'CONTINENTAL CAMPAIGN',`${c.name} · ${c.season} · ${my.name}`,
 `<div class="careerTop"><div class="metric"><small>YOUR CLUB</small><strong>${escapeHTML(my.name)}</strong></div><div class="metric"><small>COMPETITION</small><strong>${c.id}</strong></div><div class="metric"><small>LEAGUE POSITION</small><strong>#${position}</strong></div><div class="metric"><small>PRIZE EARNINGS</small><strong>${eur(t.earned)}</strong></div></div>
 <div class="twoCol"><div class="panel">${cupSaveVolatile?'<p role="status" class="muted">Temporary Cup session: browser storage is unavailable. Progress will be lost when this page closes.</p>':''}<div class="badge">${escapeHTML(tournamentProgress(t))}</div>
 <div class="fixture"><span>${t.phase==='finished'?'🏁 CAMPAIGN COMPLETE':fx?.bye?'🟢 BYE — AUTO ADVANCE':'⚽ NEXT MATCH'}</span><strong>${t.phase==='finished'?(t.winner===t.club?'🏆 CONTINENTAL CHAMPIONS!':'ELIMINATED — TRY AGAIN'):fx?.bye?'Automatic qualification':`${escapeHTML(my.name)} VS ${escapeHTML(TEAMS[fx?.opponent]?.name||'TBD')}`}</strong></div>
 <div class="row">${t.phase==='finished'?button('↻ NEW CAMPAIGN',t.compId==='CUSTOM'?'customCupSetup':'continentPick_'+t.compId,'gold'):fx?.bye?button('➜ ADVANCE THROUGH BYE','continentBye','gold'):button('▶ PLAY CHAMPIONSHIP MATCH','continentKickoff','gold')}${button(t.compId==='CUSTOM'?'ALL CUPS':'ALL CONTINENTS',t.compId==='CUSTOM'?'navCups':'continents','minor')}${button('SAVE SLOTS','navCupSlots','minor')}</div>
 ${c.featured?`<div class="stat"><strong>CONTINENT'S TOP SIX</strong><span>${c.featured.split('|').map(escapeHTML).join(', ')}</span></div>`:'<div class="stat"><strong>FORMAT</strong><span>Custom single-match knockout</span></div>'}<div class="scroll" style="max-height:190px;margin-top:12px">${t.history.slice(0,18).map(h=>`<div class="stat"><strong>${escapeHTML(h.stage||'MATCHDAY '+h.round||'MATCH')}</strong><span>${h.kind==='bye'?'BYE':(TEAMS[h.a]?.name||'')+' '+formatCupHistoryScore(h.scoreA)+'–'+formatCupHistoryScore(h.scoreB)+' '+(TEAMS[h.b]?.name||'')}</span></div>`).join('')||'<div class="muted">No completed fixtures yet.</div>'}</div>
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
 const trialLineup=planFor(home).lineup,trialPlayers=roster(home).filter((p,index)=>trialLineup.includes(index)&&['MF','FW'].includes(p.role)&&(!p.superAbility||p.superAbility.type==='shoot'));if(!trialPlayers.some(p=>p.id===arcadeShotPlayerId))arcadeShotPlayerId=trialPlayers[0]?.id||'';
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
 <div class="setupSubnav"><button class="btn setupSubButton" data-action="setupRules">⚙ Match rules <small>Weather, time, stadium, CPU</small></button><button class="btn setupSubButton" data-action="setupAppearance">🎨 Kits &amp; talks <small>Look and morale</small></button><button class="btn setupSubButton" data-action="setupTactics">♟ Team tactics <small>Formation &amp; lineup</small></button>${['quick','versus','training'].includes(mode)?'<button class="btn setupSubButton" data-action="setupArcadeShots">✨ Arcade Shot Trial <small>Try any catalog shot this match</small></button>':''}</div>
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
function refreshKitContrastUI(){
 const currentKitContrast=matchContrast(TEAMS[home],TEAMS[away],kitSelections);
 const status=$('kitContrastStatus');if(status)status.textContent=`Primary-kit contrast: ${currentKitContrast.toFixed(2)}:1${currentKitContrast>=2?' — good separation':' — similar colors may be hard to tell apart'}.`;
 const recommendation=$('kitContrastAction');if(recommendation)recommendation.innerHTML=currentKitContrast<2?button('↔ IMPROVE KIT CONTRAST','autoContrastKits','gold')+'<p class=\"muted\">This changes kit selections only when you choose it.</p>':'';
 for(const side of [0,1]){const dot=$(side?'awayKitDot':'homeKitDot');if(dot){const team=kitFor(TEAMS[side?away:home],kitSelections[side]);dot.style.background=team.primary;dot.style.borderColor=team.secondary;}}
}
function showSetupExtras(section){
 const talks=Object.entries(TEAM_TALKS).map(([k,v])=>[k,v.name]);
 if(section==='arcadeShots'){
  const players=roster(home).filter((p,index)=>planFor(home).lineup.includes(index)&&['MF','FW'].includes(p.role)&&(!p.superAbility||p.superAbility.type==='shoot')).map(p=>[p.id,'#'+p.num+' '+p.name]);
  const shots=[['','No trial (default)'],...Object.entries(SHOTS).map(([id,shot])=>[id,shot.name||id])];
  page('ARCADE SHOT TRIAL','Try one catalog Super Shot with a home-team midfielder or forward in this local match.',
   `<div class="panel setupExtras">${field('SUPER SHOT','arcadeShotPick',shots,arcadeShotId)}<canvas id="arcadeShotPreview" class="ballPreview" width="160" height="120" role="img" aria-label="Preview of selected Super Shot"></canvas>${field('HOME PLAYER','arcadeShotPlayerPick',players,arcadeShotPlayerId)}<p class="muted" role="status" aria-live="polite">This temporary loadout uses the existing Jump/Shoot combo and expires when the match ends. It does not edit roster, Career, online, or saved equipment. Other players and opponent equipment stay unchanged.</p><div class="row">${button('✓ DONE — BACK TO MATCH','returnSetup','gold')}</div></div>`, 'returnSetup');
 }else if(section==='rules'){
  page('MATCH RULES','Optional match conditions. Changes apply to your next kickoff.',
  `<div class="panel setupExtras">${field('WEATHER','weather',WEATHER.map(v=>[v,v]),opt.weather)}${field('PLAYING SURFACE','terrain',TERRAIN.map(v=>[v,v==='Classic'?'Classic · Weathered Famicom-style pitch':v]),opt.terrain)}${field('PITCH CONDITION','condition',CONDITIONS.map(v=>[v,v]),opt.condition)}${field('STADIUM','settingsStadium',STADIUMS.map(v=>[v.id,v.name+' · '+v.city]),opt.stadium)}${field('MATCH BALL · OPTIONAL COSMETIC','ballModel',VISUALFEEL.BALL_MODELS.map(v=>[v.id,v.name]),opt.ballModel)}<canvas id="ballPreview" class="ballPreview" width="100" height="76" aria-label="Preview of selected match ball"></canvas><p class="muted">The ball design applies to the whole match and is never assigned from player nationality.</p>${field('SECONDS PER HALF','halfSeconds',[60,120,180,300].map(v=>[v,v+' sec']),opt.halfSeconds)}${field('CPU DIFFICULTY','matchDifficulty',aiChoices(),opt.difficulty)}${field('CPU STRATEGY','aiStyle',['Balanced','Aggressive','Defensive'].map(v=>[v,v]),opt.aiStyle||'Balanced')}${difficultyHint()}<div class="row">${button('✓ DONE — BACK TO MATCH','returnSetup','gold')}</div></div>`, 'returnSetup');
 }else if(section==='appearance'){
  const kitContrastHint=`<p class=\"muted\" id=\"kitContrastStatus\" role=\"status\" aria-live=\"polite\"></p><div id=\"kitContrastAction\"></div>`;
  page('KITS & TEAM TALKS','Optional team colors and pre-match morale.',
  `<div class="panel setupExtras"><div class="kitChooser"><div class="kitSelector"><span class="kitDot" id="homeKitDot"></span>${field('HOME TEAM KIT','homeKit',[['home','HOME KIT'],['away','AWAY KIT']],kitSelections[0])}</div><div class="kitSelector"><span class="kitDot" id="awayKitDot"></span>${field('AWAY TEAM KIT','awayKit',[['home','HOME KIT'],['away','AWAY KIT']],kitSelections[1])}</div></div>${kitContrastHint}${field('MATCH BALL DESIGN · OPTIONAL COSMETIC','ballModel',VISUALFEEL.BALL_MODELS.map(v=>[v.id,v.name]),opt.ballModel)}<canvas id="ballPreview" class="ballPreview" width="100" height="76" aria-label="Preview of selected match ball"></canvas><p class="muted">The ball design applies to the whole match and is never assigned from player nationality.</p><h3 class="titleSmall">Pre-match talks</h3><p class="muted">One talk per team. Player personalities respond differently.</p><div class="tacticsGrid">${field('HOME TEAM TALK','preTalkHome',talks,preTalkChoices[0])}${field('AWAY TEAM TALK','preTalkAway',talks,preTalkChoices[1])}</div><div class="row">${button('✓ DONE — BACK TO MATCH','returnSetup','gold')}</div></div>`, 'returnSetup');
  // Update only the live contrast note and swatches; keep the user's select focused.
  refreshKitContrastUI();
 }else{
  page('TEAM TACTICS','Formation, lineup, captain, substitutions and tactical style are preserved.',
  `<div class="panel setupExtras"><p class="muted">Configure either team, then return to this match setup. Six approved formations remain available.</p><div class="row">${button('⚙ HOME TACTICS','prepHome')}${button('⚙ AWAY TACTICS','prepAway')}${button('← BACK TO MATCH','returnSetup','gold')}</div></div>`, 'returnSetup');
 }
 paintBallPreview();if(section==='arcadeShots')paintArcadeShotPreview();
}
function paintArcadeShotPreview(){const canvas=$('arcadeShotPreview');if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#092b3a';ctx.fillRect(0,0,canvas.width,canvas.height);const shot=SHOTS[arcadeShotId];if(!shot){ctx.fillStyle='#c5eaff';ctx.font='14px Arial';ctx.textAlign='center';ctx.fillText('Choose a shot',canvas.width/2,canvas.height/2);canvas.setAttribute('aria-label','Choose a Super Shot to preview');return;}ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.scale(1.4,1.4);renderer.drawTransformation(ctx,{...shot,id:arcadeShotId},performance.now()/1000);ctx.restore();canvas.setAttribute('aria-label','Preview of '+(shot.name||arcadeShotId));}
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
let announcedPlayerSelectionKey='',candidatePlayerSelectionKey='',candidatePlayerSelectionSince=0;
function resetPlayerSelectionAnnouncement(){announcedPlayerSelectionKey='';candidatePlayerSelectionKey='';candidatePlayerSelectionSince=0;const status=$('playerSelectionStatus');if(status)status.textContent='';}
function updatePlayerSelectionAnnouncement(player,energyPercent){
 if(!player?.src)return;
 const key=String(player.t)+':'+String(player.i)+':'+String(player.src.id||player.src.name),at=globalThis.performance?.now?.()??Date.now();
 if(key!==candidatePlayerSelectionKey){candidatePlayerSelectionKey=key;candidatePlayerSelectionSince=at;return;}
 if(key===announcedPlayerSelectionKey||at-candidatePlayerSelectionSince<280)return;
 const status=$('playerSelectionStatus');if(!status)return;
 status.textContent=`Selected player: ${player.src.name}. Energy ${energyPercent} percent.`;
 announcedPlayerSelectionKey=key;
}
function start(){resetPlayerSelectionAnnouncement();activeMatchReceiptId=newMatchReceiptId();lastCupResultCommitted=false;leagueResultCommitted=false;customLeagueResultCommitted=false;if(mode==='versus')humans=2;else humans=1;const homePlan=mode==='career'&&career?.club===home?careerPlanFor(career):planFor(home),awayPlan=planFor(away);game.init({home,away,mode,humans,rosters:[mode==='career'&&career?career.roster.map(p=>({...p})):roster(home),roster(away)],lineups:[homePlan.lineup.slice(),awayPlan.lineup.slice()],formations:[homePlan.formation,awayPlan.formation],plans:[homePlan,awayPlan],options:{...opt,kitChoices:kitSelections.slice(),arcadeShotId,arcadeShotPlayerId}});trainingCrossCoachState.reset(mode==='training');if(preTalkChoices[0]!=='none')game.applyTeamTalk(0,preTalkChoices[0],'pregame');if(preTalkChoices[1]!=='none')game.applyTeamTalk(1,preTalkChoices[1],'pregame');if(mode==='pk')game.startPK(false);closeMenu();drawHUD();updateTrainingCrossCoach()}
function drawHUD(){let p=game.controlledPlayer(lanRole==='guest'?1:0),s=game.score;$('homeflag').innerHTML=identity(home);$('awayflag').innerHTML=identity(away);$('homename').textContent=(lanPlayerNames?.home?lanPlayerNames.home+' · ':'')+TEAMS[home].name.toUpperCase();$('awayname').textContent=(lanPlayerNames?.away?lanPlayerNames.away+' · ':'')+TEAMS[away].name.toUpperCase();$('scoring').innerHTML=`${s[0]} <span>:</span> ${s[1]}`;$('weatherHud').textContent=game.weather.toUpperCase();let secs=Math.max(0,Math.ceil(game.matchSeconds-game.clock));$('timeHud').textContent=`${game.half===1?'1ST':'2ND'} • ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;if(p){const inPossession=game.ball.owner?.t===0;const ownBall=game.ball.owner===p;const goalkeeperHasBall=game.ball.owner?.t===0&&game.ball.owner?.keeper;// v0.8.25: keep the exact four approved action labels on screen; defensive / keeper functions remain contextual.
  for(const [key,text] of Object.entries({pass:'PASS',shoot:'SHOOT',dribble:'DRIBBLE',jump:'JUMP'})){const b=document.querySelector('[data-act="'+key+'"]');if(b){if(b.textContent!==text)b.textContent=text;b.title=key==='pass'?(goalkeeperHasBall?'Pass / goalkeeper clear':inPossession?'Tap nearest · direction aim · hold long · Jump then Pass cross':'Pass / tackle'):key==='shoot'?(inPossession?'Shoot':'Shoot / slide tackle'):key==='dribble'?(inPossession?'Dribble':'Dribble / switch player'):'Jump';}}const dribbleButton=document.querySelector('[data-act="dribble"]');if(dribbleButton){
   const cd=Math.max(0,p.dribbleCooldown||0),cooling=cd>.02&&game.ball.owner===p;
   dribbleButton.classList.toggle('cooling',cooling);
   dribbleButton.dataset.cooldown=cooling?cd.toFixed(1)+'s':'';
   if(cooling)dribbleButton.title='Dribble ready in '+cd.toFixed(1)+' seconds';
  }
  const playerTag=$('playerTag');playerTag.textContent=`#${p.src.num} ${p.src.name.toUpperCase()}  ·  ${(p.src.superAbility?.type==='defence'&&!game.ball.owner?p.src.superAbility.name:p.src.shotName).toUpperCase()}  · LV${abilityLevel(p,(p.src.superAbility?.type==='defence'&&!game.ball.owner)?'defence':'shot')}  ·  ${(p.src.superAbility?.type==='defence'&&!game.ball.owner?(p.abilityCd||0):p.specialCd)>0?'SUPER RECHARGING':'SUPER READY'}  ·  ${moodLabel(p.morale)} ${Math.round(p.morale)}%`;playerTag.title=playerTag.textContent;const energyPercent=Math.round(100*(1-(p.fatigue||0))),staminaHud=$('staminaHud');if(staminaHud){staminaHud.setAttribute('aria-label','Energy for '+p.src.name);staminaHud.setAttribute('aria-valuenow',String(energyPercent));staminaHud.setAttribute('aria-valuetext',`Energy ${energyPercent} percent`)}updatePlayerSelectionAnnouncement(p,energyPercent);const staminaBar=$('staminaFill');if(staminaBar)staminaBar.style.width=energyPercent+'%';const staminaText=$('staminaText');if(staminaText)staminaText.textContent=`ENERGY ${energyPercent}%`;const meter=$('powerFill');if(meter)meter.style.width=Math.max(0,Math.min(100,100*Math.max(p.charge||0,game.input.held(p.t,'pass')?(p.passHold||0):0)/1.2))+'%';const superLabel=$('specialMeter');if(superLabel){let defensive=p.src.superAbility?.type==='defence'&&!game.ball.owner;let abilityCooldown=defensive?(p.abilityCd||0):p.specialCd;superLabel.textContent=(game.input.held(p.t,'pass')&&game.ball.owner?.t===p.t)?'PASS • HOLD TO EXTEND':defensive?(abilityCooldown>0?'DEF CD '+abilityCooldown.toFixed(1)+'s':'★ DEF READY'):(abilityCooldown>0?'RECHARGE '+abilityCooldown.toFixed(1)+'s':'★ READY');superLabel.classList.toggle('charging',abilityCooldown>0)}}}
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
function squadEnergyPercent(player){
 if(!player)return 0;
 const ledger=game.fatigueLedger?.[squadSide]||{};
 const fatigue=squadContext==='pause'&&Number.isFinite(ledger[player.id])?ledger[player.id]:initialFatigue(player);
 return Math.round(100*(1-Math.max(0,Math.min(1,Number(fatigue)||0))));
}
function showSquad(side=0,origin='home'){
 squadReturnAtHalf=origin==='pause'&&screen==='HALF TIME';
 squadSide=side;squadContext=origin;
  // Both visible and keyboard/gamepad Back return to the actual entry menu.
 const squadBackAction=origin==='setup'?'returnSetup':origin==='pause'?'returnPause':origin==='career'?'careerSquad':origin==='customization'?'navCustomization':'home';
 const index=origin==='pause'?game.teamIds[side]:origin==='career'?career?.club:side===0?home:away;
 const team=TEAMS[index],players=origin==='pause'?game.rosters[side]:origin==='career'?career?.roster||[]:roster(index);
 const plan=origin==='pause'?safePlan(game.teamPlans[side],players,index):origin==='career'?careerPlanFor(career):planFor(index);
 const order=['GK','DF','DF','MF','FW','FW'];
 const memberOptions=players.map((p,i)=>[i,`#${p.num} ${p.name} · ${p.role} · OVR ${playerOVR(p)} · ENERGY ${squadEnergyPercent(p)}%${p.legendaryRating?` · LEG ${p.legendaryRating}`:''}`]);
 const fieldPlayerOptions=plan.lineup.map(i=>memberOptions[i]);
 const roleOptions=players.map((p,i)=>[i,`${plan.lineup.includes(i)?'●':'○'} #${p.num} ${p.name}`]);
 page('TEAM COMMAND CENTER',`${team.name} — edit formation, starting six, captain, set pieces and tactics ${origin==='pause'?'while the game is paused':'before kickoff'}.`,
 `<div class="squadHeader">${identity(index)}<strong>${escapeHTML(team.name)}</strong><span>${origin==='pause'?'LIVE TACTICS':'PREGAME PLAN'} · 6 ON FIELD / 6 BENCH</span></div><div class="twoCol"><div class="panel"><h3 class="titleSmall">FORMATION & LINEUP</h3>${field('FORMATION','formation',Object.keys(FORMATIONS).map(v=>[v,v]),plan.formation)}<div class="formationPitch" id="formationPitch" aria-label="Six-player formation with cartoon player faces"></div><p class="muted">OVR is the rounded mean of six position-relevant stats (1–100). Formation OVR is for the assigned position, not necessarily the player’s natural role. Five outfield players + goalkeeper.</p>
 ${plan.lineup.map((id,i)=>`<div class="lineupRow"><strong>${order[i]}</strong>${choice('pos'+i,(i===0?memberOptions.filter(([j])=>players[j].role==='GK'):memberOptions.filter(([j])=>players[j].role!=='GK')),id,'Starter '+(i+1)+', '+({GK:'goalkeeper',DF:'defender',MF:'midfielder',FW:'forward'}[order[i]]))}<span class="positionOvr lineupRatings" data-lineup-ovr="${i}" aria-label="Position overall ${playerOVR(players[id],order[i])}, Energy ${squadEnergyPercent(players[id])} percent"><span aria-hidden="true">OVR ${playerOVR(players[id],order[i])}</span><span class="lineupEnergy" data-lineup-energy="${i}" aria-hidden="true">ENERGY ${squadEnergyPercent(players[id])}%</span></span></div>`).join('')}
  <p id="lineupRoleFit" class="muted" role="status" aria-live="polite" aria-label="Lineup position fit guidance"></p>
 <p class="muted">${origin==='pause'?`SUBSTITUTIONS: <b>${game.substitutionsUsed[side]} / ${game.maxSubstitutions}</b> used. Only ${game.maxSubstitutions} changes allowed; substituted-off players cannot return.`:origin==='career'?'Select six distinct players from your current Career roster. Changes are saved only when you choose SAVE TACTICS; the saved Career roster remains unchanged.':'Before kickoff, choose any six starters. During play, use Pause to substitute up to three players.'} Substitutes enter with their own fitness; exhausted players lose speed, precision and tackling strength.</p>
 ${origin==='pause'?substitutionAdviceForPause(game,side,plan,players):''}
 <h3 class="titleSmall">LEADERSHIP & SET PIECES</h3><div class="tacticsGrid">${[['captain','CAPTAIN'],['penalty','PENALTY KICKS'],['freeKick','FREE KICKS'],['corner','CORNERS']].map(([key,label])=>`<div>${field(label,'role_'+key,key==='captain'?fieldPlayerOptions:roleOptions,plan[key])}</div>`).join('')}</div>
 <h3 class="titleSmall">TEAM INSTRUCTIONS</h3><div class="tacticsGrid"><div>${field('ATTACKING STYLE','attackStyle',ATTACK_STYLES.map(v=>[v,v]),plan.attack)}</div><div>${field('DEFENSIVE STYLE','defenceStyle',DEFENCE_STYLES.map(v=>[v,v]),plan.defence)}</div></div>
 <p class="muted">Possession prioritizes passes; Direct pushes forward and shoots earlier. High Press closes down faster; Deep Block holds positions. Captain boosts team passing slightly. Penalty taker accuracy affects shootouts. Corner kicks now restart from the correct corner; the saved taker takes it when on the field. A successful grounded slide from behind on a moving carrier awards a direct free kick, or a penalty when the foul is inside the defending penalty area. Other foul and card handling is not implemented.</p>
 <div class="row">${button('✓ SAVE TACTICS','saveSquad','gold')}${button('RESTORE DEFAULT','resetSquad')}${button('← BACK',squadBackAction)}</div></div><div class="panel"><h3 class="titleSmall">12-PLAYER ROSTER · POSITION OVR</h3><div class="roster">${players.map((p,i)=>`<div class="rosterCard ${plan.lineup.includes(i)?'startingPlayer':''}"><canvas class="portrait playerFaceCanvas" width="80" height="88" data-squad-avatar="${i}" role="img" aria-label="Cartoon face of ${escapeHTML(p.name)}"></canvas><div><div class="rosterName">${plan.lineup.includes(i)?'● STARTING ':'○ BENCH '}#${p.num} ${escapeHTML(p.name)}</div><div class="rosterMeta"><span class="ovrBadge" title="Calculated from six ${p.role} attributes">${p.role} OVR ${playerOVR(p)}</span>${p.legendaryRating?` · <span class="ovrBadge" title="User-selected all-time legendary card rating (not the calculated position OVR)">LEG ${p.legendaryRating}</span>`:''}${BPWPERSONALITY.profileFor(p)?` · <span class="personalityBadge" title="Individual arcade animation style (editorial, not historical motion capture)">✦ ${escapeHTML(BPWPERSONALITY.profileFor(p).label)}</span>`:''} · ${origin==='pause'?'':'CON '+(p.condition??100)+'% · '}ENERGY ${squadEnergyPercent(p)}% · STA ${p.stamina} · DEF ${p.defence} · SPD ${p.speedRating} · AGI ${p.agility} · DRB ${p.dribbling}</div>${playerAbilityIcons(p)}<div class="rosterMeta">SHOT ${p.shootPower}/${p.shootAccuracy} · HEAD ${p.heading} · PASS ${p.passing} · CROSS ${p.crossing} · STYLE ${escapeHTML(p.dribbleType||'sideStep')}</div><div class="rosterMeta">${p.role==='GK'?`GK DIVING ${p.gkDiving} · GK SKILL ${p.gkSkill} · `:''}ABILITY ${escapeHTML(p.superAbility?.name||'NONE')} · SUPER SHOT LV${abilityLevel(p,'shot')} · DEF LV${p.superAbility?.type==='defence'?abilityLevel(p,'defence'):'—'} · GK LV${p.gkSuperAbility?abilityLevel(p,'keeper'):'—'}</div></div></div>`).join('')}</div></div></div>`,squadBackAction);
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
function refreshFormationPreview(){const board=$('formationPitch');if(!board)return;const teamIndex=squadContext==='pause'?game.teamIds[squadSide]:squadContext==='career'?career?.club:squadSide===0?home:away;const players=squadContext==='pause'?game.rosters[squadSide]:squadContext==='career'?career?.roster||[]:roster(teamIndex);const key=$('formation')?.value||'2-1-2';const labels={'2-1-2':['GK','DF','DF','MF','FW','FW'],'1-2-2':['GK','DF','MF','MF','FW','FW'],'2-2-1':['GK','DF','DF','MF','MF','FW'],'1-3-1':['GK','DF','MF','MF','MF','FW'],'1-1-3':['GK','DF','MF','FW','FW','FW'],'3-1-1':['GK','DF','DF','DF','MF','FW']}[key]||['GK','DF','DF','MF','FW','FW'];menu.querySelectorAll('.lineupRow>strong').forEach((node,i)=>node.textContent=labels[i]||'MF');const positions=FORMATIONS[key]||FORMATIONS['2-1-2'];const slots=Array.from({length:6},(_,i)=>Number($('pos'+i)?.value));menu.querySelectorAll('[data-lineup-ovr]').forEach((badge,i)=>{const player=players[slots[i]],ovr=playerOVR(player,labels[i]),energy=squadEnergyPercent(player);badge.setAttribute('aria-label',`Position overall ${ovr}, Energy ${energy} percent`);badge.querySelector('[aria-hidden="true"]:first-child').textContent='OVR '+ovr;const energyBadge=badge.querySelector('[data-lineup-energy]');if(energyBadge)energyBadge.textContent='ENERGY '+energy+'%';badge.title='Position OVR and Energy percentage';});const guidance=$('lineupRoleFit');if(guidance)guidance.textContent=lineupRoleFitGuidance(players,slots,labels);const mobileLabels=matchMedia('(max-width:650px)').matches;const labelMaxWidth=mobileLabels?55:88;const baseFontSize=mobileLabels?9:10;board.innerHTML=positions.map((pos,i)=>{const player=players[slots[i]],playerName=player?.name||'Player';const surname=playerName.split(' ').slice(-1)[0];const labelFontSize=Math.max(6,Math.min(baseFontSize,labelMaxWidth/(surname.length*.58))),energy=squadEnergyPercent(player),ovr=playerOVR(player,labels[i]);return `<div class="formationSlot role${labels[i]}" data-role="${labels[i]}" style="left:${Math.round(pos.x*100)}%;top:${Math.round(pos.y*100)}%" title="${escapeHTML(playerName)} · ${labels[i]} · Energy ${energy}%"><canvas width="86" height="90" data-formation-avatar="${slots[i]}" aria-label="${escapeHTML(playerName)} face, ${labels[i]}, Energy ${energy} percent" role="img"></canvas><small style="font-size:${labelFontSize.toFixed(2)}px">${escapeHTML(surname)}</small><span class="formationOvr" aria-label="${labels[i]} overall rating ${ovr}">${labels[i]} ${ovr}</span><span class="formationEnergy" aria-label="${escapeHTML(playerName)} Energy ${energy} percent">ENE ${energy}%</span></div>`;}).join('');menu.querySelectorAll('[data-squad-avatar],[data-formation-avatar]').forEach(canvas=>{const j=Number(canvas.dataset.squadAvatar??canvas.dataset.formationAvatar);drawTeamFace(canvas,players[j],teamIndex)});}

const SAVE_KEYS=Object.freeze(['customClubs','managerCareer','careerSlots','cupSlots','continentalRun','options','league','lineup','edits','teamPlans','controllerBindings','kitSelections','audioOptions','tokenWallet']);
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
  if(key==='tokenWallet'&&!ECONOMY.validWallet(value))throw Error('Invalid token wallet');
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
async function commitSaveImport(changes,storage){
 // Keep a raw pre-image before any write; never trust autosave's silent errors.
 const walletChange=changes.find(([key])=>key==='tokenWallet'),localChanges=changes.filter(([key])=>key!=='tokenWallet');
 const previous=localChanges.map(([key])=>[key,storage.getItem('legend_'+key)]);
 const previousWallet=walletChange?await tokenWallet.exportWallet():null;
 let attempted=-1;
 try{
  for(let i=0;i<localChanges.length;i++){
   attempted=i;
   const [key,json]=localChanges[i],slot='legend_'+key;
   storage.setItem(slot,json);
   // Some storage shims silently discard writes. Readback avoids false success.
   if(storage.getItem(slot)!==json)throw Error('Save section not retained: '+key);
  }
  if(walletChange){
   const imported=JSON.parse(walletChange[1]);
   await tokenWallet.importWallet(imported);
   // Keep old clients usable while the complete receipt history fits schema 1.
   // Larger ledgers cannot be mirrored safely into the legacy wallet key.
   if(imported.receipts.length<=ECONOMY.MAX_RECEIPTS){
    const legacy={schema:1,tokens:imported.tokens,unlocks:imported.unlocks,receipts:imported.receipts};
    const raw=JSON.stringify(legacy);storage.setItem(ECONOMY.KEY,raw);
    if(storage.getItem(ECONOMY.KEY)!==raw)throw Error('Legacy wallet mirror could not be updated');
   }else{
    storage.removeItem(ECONOMY.KEY);
    if(storage.getItem(ECONOMY.KEY)!==null)throw Error('Obsolete legacy wallet mirror could not be cleared');
   }
  }
 }catch(e){let rollbackFailed=false;
  // Include the *failing* write: a storage adapter may mutate and then throw.
  for(let i=attempted;i>=0;i--){const [key,prior]=previous[i],slot='legend_'+key;
   try{if(prior===null)storage.removeItem(slot);else storage.setItem(slot,prior);}
   catch{
    // A storage adapter can throw after restoring the old bytes. Report the
    // rollback as incomplete only when the original value is still missing.
    try{if(storage.getItem(slot)!==prior)rollbackFailed=true;}catch{rollbackFailed=true}
    continue;
   }
   try{if(storage.getItem(slot)!==prior)rollbackFailed=true;}catch{rollbackFailed=true}
  }
  if(walletChange&&previousWallet){try{await tokenWallet.importWallet(previousWallet);}catch{rollbackFailed=true;}}
  throw Error('Save could not be stored'+(rollbackFailed?' and automatic rollback was incomplete':' (changes rolled back)'));
 }
 return changes.length;
}
async function collectSaveExportData(storage){
 const data={};
 for(const key of SAVE_KEYS){
  if(key==='tokenWallet'){
   try{data.tokenWallet=await tokenWallet.exportWallet();}
   catch(error){throw Error(`Save section "tokenWallet" could not be read: ${error?.message||'wallet storage unavailable'}`)}
   if(!ECONOMY.validWallet(data.tokenWallet))throw Error('Save section "tokenWallet" has an invalid wallet structure. No backup was downloaded.');
   continue;
  }
  let raw;
  try{raw=storage.getItem('legend_'+key)}
  catch(error){throw Error(`Save section "${key}" could not be read: ${error?.message||'storage unavailable'}`)}
  if(raw===null){data[key]=null;continue}
  try{data[key]=JSON.parse(raw)}
  catch{throw Error(`Save section "${key}" contains invalid JSON. No backup was downloaded and the stored data was left untouched.`)}
 }
 return data;
}
async function exportSave(){try{const data={product:'Supermagic Football',version:RELEASE.version,exportedAt:new Date().toISOString(),data:await collectSaveExportData(localStorage)},serialized=JSON.stringify(data,null,2),bytes=new TextEncoder().encode(serialized).byteLength;if(bytes>ECONOMY.MAX_SAVE_EXPORT_BYTES)throw Error('The complete save exceeds the 64 MiB backup limit. No sections were omitted or changed; reduce stored save data and retry.');const blob=new Blob([serialized],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Supermagic_Football_Save_'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),3000);return true}catch(error){alert('Could not export save: '+error.message);return false}}
async function importSave(file){try{
 if(!file||file.size>ECONOMY.MAX_SAVE_EXPORT_BYTES)throw Error('Save file missing or larger than the 64 MiB save limit');
 const text=await file.text();if(new TextEncoder().encode(text).byteLength>ECONOMY.MAX_SAVE_EXPORT_BYTES)throw Error('Save file exceeds the 64 MiB save limit');
 const changes=validateSaveImport(JSON.parse(text));
 if(!confirm(`Import ${changes.length} save sections? This will REPLACE matching local progress. Export a backup first. Continue?`))return;
 await commitSaveImport(changes,localStorage);
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
 game:{id:'nav-settings-game',title:'GAME SETTINGS',subtitle:'CPU, match rules and environment.',fields:`${field('CPU DIFFICULTY','difficulty',aiChoices(),opt.difficulty)}${difficultyHint()}${field('MATCH PACE','gameSpeed',[[0.8,'Relaxed / 80%'],[1,'Normal / 100%'],[1.15,'Fast / 115%']],opt.gameSpeed||1)}${field('HALF LENGTH','settingsDuration',[60,120,180,300].map(v=>[v,v+' sec']),opt.halfSeconds)}${field('WEATHER','settingsWeather',WEATHER.map(v=>[v,v]),opt.weather)}${field('TERRAIN','settingsTerrain',TERRAIN.map(v=>[v,v]),opt.terrain)}${field('CONDITION','settingsCondition',CONDITIONS.map(v=>[v,v]),opt.condition)}${field('STADIUM','settingsStadium',STADIUMS.map(v=>[v.id,v.name+' · '+v.city]),opt.stadium)}`},
 graphics:{id:'nav-settings-graphics',title:'GRAPHICS',subtitle:'Camera, display and rendering quality settings.',fields:`${field('CAMERA','camera',[['Follow','Follow the ball'],['Wide','Wider pitch view']],opt.camera)}<p class="muted">Wider pitch view shows more of the field around the ball. It does not change movement, scoring or hitboxes.</p>${field('RENDER QUALITY','renderQuality',[['high','High detail'],['performance','Performance']],opt.renderQuality)}<p class="muted">Performance mode renders the same game view at a lower canvas resolution to reduce pixel workload. It does not change gameplay or hitboxes.</p>${field('BALL DESIGN · OPTIONAL COSMETIC','ballModel',VISUALFEEL.BALL_MODELS.map(v=>[v.id,v.name]),opt.ballModel)}<canvas id="ballPreview" class="ballPreview" width="100" height="76" aria-label="Preview of selected match ball"></canvas><p class="muted">The ball design applies to the whole match and is never assigned from player nationality.</p>${field('SHOW PLAYER NAMES','showNames',[['true','Yes'],['false','No']],String(opt.showNames))}${field('PERFORMANCE HUD','showPerformance',[['false','Off (default)'],['true','Show live FPS / frame time']],String(opt.showPerformance===true))}<div class="row">${button('⛶ TOGGLE FULLSCREEN','fullscreen','minor')}</div><p class="muted">Fullscreen and screen rotation support depends on your browser and device.</p>`},
 sound:{id:'nav-settings-sound',title:'SOUND',subtitle:'Original offline music, sound effects and crowd.',fields:`${field('MASTER MUTE','audioMute',[['false','Sound on'],['true','Mute all']],String(audio.settings.mute))}${['master','music','sfx','ui','ambience'].map(k=>`<label class="fieldLabel" for="audio_${k}">${k.toUpperCase()} VOLUME <output id="audio_${k}Value">${audio.settings[k]}%</output></label><input type="range" id="audio_${k}" min="0" max="100" step="5" value="${audio.settings[k]}" aria-label="${k} volume" aria-valuetext="${audio.settings[k]}%" style="width:100%"/>`).join('')}<p class="muted">Audio begins after interacting with the page. No internet or external samples needed.</p>`}
 };
 const cfg=opts[section];if(!cfg)return showSettingsMenu();const back=menuEntryReturn==='returnPause'?'returnPause':'navSettings';menuBackAction=back;
 show(`<div class="navScreen"><div class="row space navHeader"><div><div class="topline">SUPERMAGIC FOOTBALL · SETTINGS</div><h1 class="heading">${cfg.title}</h1><p class="subtitle">${cfg.subtitle}</p></div>${button('← BACK',back,'minor')}</div><div class="panel navSettingsFields">${cfg.fields}<div class="row navSaveRow">${button('✓ SAVE CHANGES','saveSettings','gold')}</div></div></div>`,cfg.id);const heading=menu.querySelector('.heading');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}paintBallPreview();
}
function controlHelpBindingsFor(profile,slot){
 const keyBindings=profile?.[slot===0?'keyboard':'keyboard2']||[],padBindings=profile?.[slot===0?'gamepad':'gamepad2']||[];
 const actions=['PASS','SHOOT','DRIBBLE','JUMP'];
 const keyName=code=>({Space:'Space',ControlRight:'Right Ctrl',NumpadDecimal:'Keypad Decimal',Comma:'Comma',Period:'Period',Slash:'Slash'}[code]||(/^Key[A-Z]$/.test(code||'')?code.slice(3):/^Digit[0-9]$/.test(code||'')?code.slice(5):code||'Unbound'));
 const padName=button=>({0:'A',1:'B',2:'X',3:'Y'}[button]||`Button ${button}`);
 return Object.fromEntries(actions.map((action,index)=>[action,`${keyName(keyBindings[index])} / gamepad ${padName(padBindings[index])}`]));
}
function updateTouchHelpPractice(button){const action=button?.dataset?.helpPractice;if(!action)return false;button.setAttribute('aria-pressed','true');const tested=menu.querySelectorAll('[data-help-practice][aria-pressed="true"]').length,status=menu.querySelector('#touchHelpPracticeStatus'),label=action[0].toUpperCase()+action.slice(1);if(status)status.textContent=tested===4?'All 4 touch actions responded; touch input is ready.':`${label} touch button responded. ${tested} of 4 checked.`;return true;}
let guidedCrossStep=0;
function createTrainingCrossCoachState(){let stage='inactive';return{reset(active=false){stage=active?'jump':'inactive';return stage},update(player,hasBall){if(stage==='jump'&&player?.z>0&&hasBall)stage='pass';else if(stage==='pass'&&(!player||player.z<=0||!hasBall))stage='jump';return stage},observePass(event){if(stage==='pass'&&event?.team===0&&event?.loft==='cross'){stage='done';return true;}return false},stage(){return stage}}}
const trainingCrossCoachState=createTrainingCrossCoachState();
function updateTrainingCrossCoach(){const node=$('trainingCrossCoach');if(!node)return;const active=game.mode==='training'&&game.matchState==='play'&&!menuVisible();node.classList.toggle('hidden',!active);if(!active)return;const player=game.controlledPlayer(0),stage=trainingCrossCoachState.update(player,!!player&&game.ball.owner===player),p1=controlHelpBindingsFor(input.getBindings(),0),message=stage==='done'?'Cross complete! Jump while carrying the ball, then press Pass in the air to practice again.':stage==='pass'?`STEP 2 · You are airborne. Press ${p1.PASS} or PASS now to send the Cross.`:`TRAINING · STEP 1 · Carry the ball, then press ${p1.JUMP} or JUMP to get airborne.`;if(node.textContent!==message)node.textContent=message}
function updateGuidedHelpPractice(action){const status=menu.querySelector('#guidedCrossStatus');if(!status)return false;if(guidedCrossStep>=2)return true;if(guidedCrossStep===0){if(action==='jump'){guidedCrossStep=1;status.textContent=`JUMP registered. Step 2 of 2: PASS (${controlHelpBindingsFor(input.getBindings(),0).PASS}) while airborne.`;}else status.textContent='Step 1 of 2: start with JUMP, then use PASS while airborne.';return true;}if(action==='pass'){guidedCrossStep=2;status.textContent='Cross practice complete. In a match, press JUMP, then PASS while airborne.';}else if(action==='jump'){status.textContent=`JUMP is ready. Step 2 of 2: PASS (${controlHelpBindingsFor(input.getBindings(),0).PASS}) while airborne.`;}else status.textContent='That action did not complete the sequence. Use PASS next to practice the cross.';return true;}
function createPassChargePracticeState(){let held=null;return Object.freeze({start(source,token,now){if(held||!['keyboard','pointer'].includes(source)||token==null||!Number.isFinite(now))return false;held={source,token,startedAt:now};return true;},elapsed(now){return held&&Number.isFinite(now)?Math.max(0,now-held.startedAt)/1000:null;},finish(source,token,now){if(!held||held.source!==source||held.token!==token||!Number.isFinite(now))return null;const seconds=Math.max(0,now-held.startedAt)/1000;held=null;return seconds;},cancel(source,token){if(!held||source&&held.source!==source||token!=null&&held.token!==token)return false;held=null;return true;},active(){return held!==null;}});}
function createShootChargePracticeState(){let held=null;return Object.freeze({start(source,token,now){if(held||!['keyboard','pointer'].includes(source)||token==null||!Number.isFinite(now))return false;held={source,token,startedAt:now};return true;},elapsed(now){return held&&Number.isFinite(now)?Math.max(0,now-held.startedAt)/1000:null;},finish(source,token,now){if(!held||held.source!==source||held.token!==token||!Number.isFinite(now))return null;const seconds=Math.max(0,now-held.startedAt)/1000;held=null;return seconds;},cancel(source,token){if(!held||source&&held.source!==source||token!=null&&held.token!==token)return false;held=null;return true;},active(){return held!==null;}});}
const passChargePracticeState=createPassChargePracticeState(),shootChargePracticeState=createShootChargePracticeState();let passChargePracticeTimer=0,shootChargePracticeTimer=0;
function passChargePracticeNodes(){return {status:menu.querySelector('#passChargePracticeStatus'),elapsed:menu.querySelector('#passChargePracticeElapsed')};}
function shootChargePracticeNodes(){return {status:menu.querySelector('#shootChargePracticeStatus'),elapsed:menu.querySelector('#shootChargePracticeElapsed')};}
function startPassChargePractice(source,token){if(screen!=='CONTROLS'||shootChargePracticeState.active()||!passChargePracticeState.start(source,token,performance.now()))return false;const {status,elapsed}=passChargePracticeNodes();if(status)status.textContent='PASS practice started. Hold, then release to see your hold time. No pass will be sent.';if(elapsed)elapsed.textContent='0.00 s';clearInterval(passChargePracticeTimer);passChargePracticeTimer=setInterval(()=>{const value=passChargePracticeState.elapsed(performance.now()),output=passChargePracticeNodes().elapsed;if(value!==null&&output)output.textContent=`${value.toFixed(2)} s`;},100);return true;}
function finishPassChargePractice(source,token){if(screen!=='CONTROLS')return cancelPassChargePractice(source,token);const seconds=passChargePracticeState.finish(source,token,performance.now());if(seconds===null)return false;clearInterval(passChargePracticeTimer);passChargePracticeTimer=0;const {status,elapsed}=passChargePracticeNodes();if(elapsed)elapsed.textContent=`${seconds.toFixed(2)} s`;if(status)status.textContent=`PASS practice complete: held for ${seconds.toFixed(2)} seconds. Longer holds send a longer, faster pass in a match. No pass was sent here.`;return true;}
function cancelPassChargePractice(source,token){if(!passChargePracticeState.cancel(source,token))return false;clearInterval(passChargePracticeTimer);passChargePracticeTimer=0;const {status,elapsed}=passChargePracticeNodes();if(elapsed)elapsed.textContent='—';if(status)status.textContent='PASS practice cancelled; no pass was sent.';return true;}
function startShootChargePractice(source,token){if(screen!=='CONTROLS'||passChargePracticeState.active()||!shootChargePracticeState.start(source,token,performance.now()))return false;const {status,elapsed}=shootChargePracticeNodes();if(status)status.textContent='SHOOT practice started. Hold, then release to see your hold time. No shot will be sent.';if(elapsed)elapsed.textContent='0.00 s';clearInterval(shootChargePracticeTimer);shootChargePracticeTimer=setInterval(()=>{const value=shootChargePracticeState.elapsed(performance.now()),output=shootChargePracticeNodes().elapsed;if(value!==null&&output)output.textContent=`${value.toFixed(2)} s`;},100);return true;}
function finishShootChargePractice(source,token){if(screen!=='CONTROLS')return cancelShootChargePractice(source,token);const seconds=shootChargePracticeState.finish(source,token,performance.now());if(seconds===null)return false;clearInterval(shootChargePracticeTimer);shootChargePracticeTimer=0;const {status,elapsed}=shootChargePracticeNodes();if(elapsed)elapsed.textContent=`${seconds.toFixed(2)} s`;if(status)status.textContent=`SHOOT practice complete: held for ${seconds.toFixed(2)} seconds. Holding Shoot charges the shot up to 1.2 seconds in a match. No shot was sent here.`;return true;}
function cancelShootChargePractice(source,token){if(!shootChargePracticeState.cancel(source,token))return false;clearInterval(shootChargePracticeTimer);shootChargePracticeTimer=0;const {status,elapsed}=shootChargePracticeNodes();if(elapsed)elapsed.textContent='—';if(status)status.textContent='SHOOT practice cancelled; no shot was sent.';return true;}
function cancelControlsChargePractice(){cancelPassChargePractice();cancelShootChargePractice();}
function resetPassChargePractice(){passChargePracticeState.cancel();shootChargePracticeState.cancel();clearInterval(passChargePracticeTimer);clearInterval(shootChargePracticeTimer);passChargePracticeTimer=0;shootChargePracticeTimer=0;}
function showHelp(){const bindings=input.getBindings(),p1=controlHelpBindingsFor(bindings,0),p2=controlHelpBindingsFor(bindings,1);guidedCrossStep=0;resetPassChargePractice();page('CONTROLS','Exactly four football action buttons: Pass, Shoot, Dribble and Jump.',`<div class="twoCol"><div class="panel"><h3 class="titleSmall">PLAYER 1</h3>${[['Move','WASD / arrow keys in one-player mode / left stick'],['PASS',p1.PASS],['SHOOT',p1.SHOOT],['DRIBBLE',p1.DRIBBLE],['JUMP',p1.JUMP],['Pause (menu only)','Esc / P / controller Start']].map(([a,b])=>`<div class="stat"><strong>${a}</strong><span>${b}</span></div>`).join('')}</div><div class="panel"><h3 class="titleSmall">PLAYER 2</h3>${[['Move','Arrow keys or keypad 8-4-5-6 / second left stick'],['PASS',p2.PASS],['SHOOT',p2.SHOOT],['DRIBBLE',p2.DRIBBLE],['JUMP',p2.JUMP]].map(([a,b])=>`<div class="stat"><strong>${a}</strong><span>${b}</span></div>`).join('')}<p class="muted">There are NO separate Special, Switch, Sprint or goalkeeper-dive buttons. During normal matches goalkeepers defend automatically. In two-player penalty shootouts, the defending player steers the keeper and taps JUMP to dive. Remap the same four actions in Settings → Remap Controls.</p></div></div>
<section class="panel helpTouchPractice" aria-labelledby="touchHelpPracticeTitle"><h2 class="titleSmall" id="touchHelpPracticeTitle">TOUCH CONTROL CHECK</h2><p class="muted">Tap each action to confirm its on-screen button responds. This check does not start a match or send game actions.</p><div class="helpTouchPracticeGrid">${['pass','shoot','dribble','jump'].map(action=>`<button type="button" class="helpTouchPracticeButton" data-help-practice="${action}" aria-label="Test ${action.toUpperCase()} touch control" aria-pressed="false">${action.toUpperCase()}</button>`).join('')}</div><p class="muted" id="touchHelpPracticeStatus" role="status" aria-live="polite" aria-atomic="true">0 of 4 touch controls checked.</p></section>
<section class="panel guidedCrossPractice" aria-labelledby="guidedCrossTitle"><h2 class="titleSmall" id="guidedCrossTitle">GUIDED PRACTICE · MAKE A CROSS</h2><p class="muted">A Cross uses JUMP first, then PASS while airborne. Press your mapped keys (${p1.JUMP} then ${p1.PASS}) or activate the action buttons above. This practice will not start a match.</p><p class="muted" id="guidedCrossStatus" role="status" aria-live="polite" aria-atomic="true">Step 1 of 2: press JUMP, then PASS while airborne.</p></section>
<section class="panel passChargePractice" aria-labelledby="passChargePracticeTitle"><h2 class="titleSmall" id="passChargePracticeTitle">GUIDED PRACTICE · PASS CHARGE</h2><p class="muted">Hold the practice button with touch, or hold your mapped PASS key (${p1.PASS}), then release. Longer holds add power to a pass in a match. This lesson does not send a pass or start a match.</p><button type="button" class="btn minor" data-pass-charge-practice aria-label="Hold to practice a Pass charge" style="touch-action:none;user-select:none">HOLD PASS</button><output id="passChargePracticeElapsed" aria-live="off">0.00 s</output><p id="passChargePracticeStatus" class="muted" role="status" aria-live="polite" aria-atomic="true">Hold and release to measure your PASS hold. No pass will be sent.</p></section>
<section class="panel shootChargePractice" aria-labelledby="shootChargePracticeTitle"><h2 class="titleSmall" id="shootChargePracticeTitle">GUIDED PRACTICE · SHOOT CHARGE</h2><p class="muted">Hold the practice button with touch, or hold your mapped SHOOT key (${p1.SHOOT}), then release. Holding Shoot charges a match shot for up to 1.2 seconds. This lesson does not send a shot or start a match.</p><button type="button" class="btn minor" data-shoot-charge-practice aria-label="Hold to practice a Shoot charge" style="touch-action:none;user-select:none">HOLD SHOOT</button><output id="shootChargePracticeElapsed" aria-live="off">0.00 s</output><p id="shootChargePracticeStatus" class="muted" role="status" aria-live="polite" aria-atomic="true">Hold and release to measure your SHOOT hold. No shot will be sent.</p></section>
<div class="twoCol" style="margin-top:18px"><div class="panel"><h3 class="titleSmall">WHEN YOU HAVE THE BALL</h3>${[['Tap PASS (no direction)','Pass to closest teammate'],['PASS + direction','Kick in that exact direction'],['Hold PASS, then release','Longer, faster pass (hold duration sets power)'],['First JUMP; while airborne press PASS','Cross (sequence matters)'],['PASS first, then JUMP','NOT a cross. PASS release determines the pass; JUMP remains a jump'],['Tap SHOOT','Normal shot'],['Hold SHOOT, then release','Charged shot'],['JUMP then SHOOT while carrying','Elevated normal shot'],['Double JUMP then SHOOT while carrying','Super Shot (or stronger normal shot without ability)'],['Tap DRIBBLE','Dribble dash'],['Hold DRIBBLE for 1 second while carrying ball','Equipped Magic Trick (cooldown; can be countered)'],['Dribble near an opponent','Automatic personal trick; both moves have 2s cooldown'],['JUMP then DRIBBLE near a loose aerial ball','Normal bicycle kick'],['JUMP then two DRIBBLE taps near an aerial ball','Super Bicycle (same special power and ball visuals as Super Shot)'],['JUMP then SHOOT near a loose aerial ball','Normal header'],['JUMP then two SHOOT taps near an aerial ball','Super Header (same power and ball visuals as Super Shot)'],['Hold DRIBBLE 0.26s, then press JUMP','Lift ball above player without jumping'],['Release DRIBBLE; JUMP, then tap DRIBBLE twice','Super Bicycle from lifted ball; non-specialists use boosted ordinary shot'],['Tap JUMP','Jump / jump again while airborne'],['Hold JUMP + direction','Run with ball (no jump on a long hold)']].map(([a,b])=>`<div class="stat"><strong>${a}</strong><span>${b}</span></div>`).join('')}</div><div class="panel"><h3 class="titleSmall">WHEN YOU DO NOT HAVE THE BALL</h3>${[['Tap PASS','Standing tackle'],['Hold PASS','Chase opponent'],['Tap SHOOT','Short bounded slide tackle (max 148 field units); sliding across enemy Banana Peels or Ice Patches clears them before they trigger'],['Tap DRIBBLE','Change controlled player'],['Tap JUMP','Jump'],['Hold JUMP + direction','Sprint while defending'],['JUMP + SHOOT','Defensive flying kick'],['Second JUMP, then SHOOT','Defensive bicycle kick'],['Goalkeeper','Autonomously positions, dives and saves'],['Goalkeeper holding ball; safe teammates','Short accurate distribution'],['Goalkeeper under pressure / blocked pass','Automatic long clearance']].map(([a,b])=>`<div class="stat"><strong>${a}</strong><span>${b}</span></div>`).join('')}</div></div>
<p class="muted">Removed from normal-match human controls: teammate launch → flip kick, reverse-order PASS+JUMP cross, separate goalkeeper-dive, Special, Switch and Sprint buttons. In two-player penalties the existing JUMP controls the keeper dive. Now playable: Hold Dribble then Jump for a stationary loft; release Dribble, Jump, then tap Dribble twice near the airborne ball to execute Super Bicycle. Super Shot, Super Header and Super Bicycle share power and transformation effects for eligible players.</p>`)}

function showEditor(back=editorReturnAction){editorReturnAction=back;page('PLAYER DATA EDITOR','Edit your own 12-player team roster in JSON. Every player can change shot and stats.',`<div class="twoCol"><div class="panel">${teamField('SELECT TEAM','editTeam',nations(),home)}<label class="fieldLabel">TEAM PLAYER DEFINITIONS</label><textarea id="jsonRoster" style="width:100%;height:280px;padding:12px;background:#061625;color:#c5eaff;border:1px solid #90bbcb;border-radius:9px;touch-action:pan-y" spellcheck="false">${escapeHTML(JSON.stringify(roster(home),null,2))}</textarea><div class="row" style="margin-top:12px">${button('✓ APPLY','importRoster','gold')}${button('⬇ EXPORT','exportRoster')}</div></div><div class="panel"><h3 class="titleSmall">EDITABLE ENGINE</h3><p class="muted">Individual player data includes the fourteen 1–100 ratings: stamina, strength, aggression, defence, speedRating, agility, dribbling, shootPower, shootAccuracy, heading, passing, crossing, gkDiving, gkSkill. dribbleType selects one of ten gameplay-distinct tricks. superAbility and gkSuperAbility hold optional unique move definitions. superShotLevel, superDefenceLevel and gkSuperLevel can explicitly override arcade strength tiers (1–5); top tiers are reserved for a small editorial star shortlist. Existing legacy power, shoot, defense, speed are retained for compatibility. The same engine is intended to support new clubs, abilities and growth later.</p><p class="muted">Available super shots: ${Object.keys(SHOTS).join(', ')}.</p><p class="muted">The source code is included in the ZIP for extensions. Playable features include offline matches, Career, LAN and Online P2P Quick Match. A custom competition designer, shared Online Career and Online Cup/League are not playable yet.</p></div></div>`,back)}

const eur=n=>'€'+(n/1000000).toFixed(1)+'m';
const saveCareer=()=>{if(!career)return false;try{careerSlots.save(careerSlots.active,career);store.put('managerCareer',career);return true;}catch(error){alert('Career autosave failed: '+error.message);return false;}};
function saveCareerPlan(plan){if(!career)return false;const next={...career,teamPlan:plan};try{careerSlots.save(careerSlots.active,next);career=next;store.put('managerCareer',career);return true;}catch(error){alert('Career tactics save failed: '+error.message);return false;}}
// Pre-match natural-role suitability: advisory only; no plan/roster/save writes.
// Fixed starting-six slots reflect the game's existing six-player role assignment.
// Keep this independent from the existing injury/fitness replacement report.
function careerLineupRoleFitPanel(c){
 if(!Number.isInteger(c?.club)||!Array.isArray(c?.roster))return '';
 const lineup=careerPlanFor(c)?.lineup,slots=['GK','DF','DF','MF','FW','FW'];
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
// Read-only recent-form summary derived from the existing c.history (newest first) and table.
// League results follow the score (draws allowed); a cup tie level after play is a shootout and uses its stored win flag.
// Tolerates legacy/partial entries; never writes the career, plans or storage.
// A history score is usable only when it is a real number or a non-blank numeric string (null/''/objects are not 0).
const careerScoreOK=v=>(typeof v==='number'||(typeof v==='string'&&v.trim()!==''))&&Number.isFinite(+v);
// CAREER-HISTORY-ROBUST-01: latest-results rows tolerate legacy/partial history. Non-object entries and entries without a
// usable score are skipped; a missing kind shows MATCH and a missing/unknown opponent shows "unknown club". Read-only.
function careerLatestResultsHTML(c,limit=5){
 const hist=Array.isArray(c?.history)?c.history:[];
 const rows=hist.filter(r=>r&&typeof r==='object'&&careerScoreOK(r.a)&&careerScoreOK(r.b)).slice(0,Math.max(1,limit|0));
 return rows.map(r=>{
  const kind=typeof r.kind==='string'&&r.kind.trim()?r.kind.toUpperCase():'MATCH';
  const opp=Number.isInteger(r.against)&&TEAMS[r.against]&&TEAMS[r.against].name!=null?escapeHTML(String(TEAMS[r.against].name)):'unknown club';
  return `<div class="stat"><span>${escapeHTML(kind)} vs ${opp}</span><strong>${escapeHTML(String(r.a))}:${escapeHTML(String(r.b))}</strong></div>`;
 }).join('')||'<p class="muted">No matches played yet</p>';
}
function careerFormSummary(c,sorted,limit=5){
 const hist=Array.isArray(c?.history)?c.history:[];
 const valid=hist.filter(r=>r&&typeof r==='object'&&careerScoreOK(r.a)&&careerScoreOK(r.b)&&(r.kind==='league'||r.kind==='cup'));
 const code=r=>+r.a>+r.b?'W':+r.a<+r.b?'L':r.kind==='cup'?(r.win?'W':'L'):'D';
 const recent=valid.slice(0,Math.max(1,limit|0));
 const results=recent.map(code);
 const count=k=>results.filter(v=>v===k).length;
 let run=0;for(const v of results){if(v===results[0])run++;else break;}
 const rows=Array.isArray(sorted)?sorted:[];
 const mine=rows.findIndex(v=>v&&v.id===c?.club);
 let gap=null;
 if(mine>=0&&rows.length>1){
  const mp=Number(rows[mine].pts)||0;
  if(mine===0)gap={leader:true,other:rows[1].id,pts:mp-(Number(rows[1].pts)||0)};
  else gap={leader:false,other:rows[0].id,pts:(Number(rows[0].pts)||0)-mp};
 }
 return {results,w:count('W'),d:count('D'),l:count('L'),
  gf:recent.reduce((t,r)=>t+(+r.a),0),ga:recent.reduce((t,r)=>t+(+r.b),0),
  run:results.length?{code:results[0],length:run}:null,gap,played:results.length};
}
function careerFormPanel(c,sorted){
 const f=careerFormSummary(c,sorted);
 if(!f.played)return '<div id="careerForm" aria-label="Recent form"><h3 class="titleSmall">RECENT FORM</h3><p class="muted">Form appears after your first match.</p></div>';
 const word={W:'win',D:'draw',L:'defeat'},name={W:'win',D:'draw',L:'loss'};
 const badges=f.results.slice().reverse().map(v=>`<span class="formBadge form${v}" data-form="${v}" aria-hidden="true">${v}</span>`).join('');
 const spoken=f.results.slice().reverse().map(v=>name[v]).join(', ');
 const runText=f.run.length>1?`${f.run.length} ${word[f.run.code]}${f.run.length===1?'':'s'} in a row`:`Last result: ${name[f.run.code]}`;
 let gapText='';
 if(f.gap){
  const other=TEAMS[f.gap.other]?escapeHTML(TEAMS[f.gap.other].name):'the field';
  gapText=f.gap.leader?(f.gap.pts>0?`Top of the table, ${f.gap.pts} point${f.gap.pts===1?'':'s'} clear of ${other}.`:`Top of the table, level on points with ${other}.`)
   :(f.gap.pts>0?`${f.gap.pts} point${f.gap.pts===1?'':'s'} behind leaders ${other}.`:`Level on points with leaders ${other}.`);
 }
 return `<div id="careerForm" aria-label="Recent form"><h3 class="titleSmall">RECENT FORM</h3>
  <div class="formStrip" role="img" aria-label="Last ${f.played} result${f.played===1?'':'s'}, oldest to newest: ${spoken}">${badges}</div>
  <p class="muted" data-form-summary="1"><strong>LAST ${f.played}:</strong> ${f.w}W ${f.d}D ${f.l}L · goals ${f.gf}:${f.ga} · ${runText}.${gapText?' '+gapText:''}</p></div>`;
}
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
 const lineup=careerPlanFor(c)?.lineup;
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
function managerAvatarAppearance(c=career){return {...avatarFor({id:'supermagic-manager',name:'Supermagic Football Manager'}),...(c?.managerAppearance&&typeof c.managerAppearance==='object'&&!Array.isArray(c.managerAppearance)?c.managerAppearance:{})};}
function managerAvatarPlayer(c=career){const base=c?.roster?.[0]||roster(Number.isInteger(c?.club)?c.club:home)[0];return {...base,name:'Manager',appearance:managerAvatarAppearance(c)};}
function paintManagerAvatar(){const canvas=$('managerAvatarPreview'),p=managerAvatarPlayer();if(!canvas||!p)return;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#1b5460';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();const fit=portraitFit(canvas.width,canvas.height,p.appearance||{});ctx.translate(fit.x,fit.y);ctx.scale(fit.scale,fit.scale);renderer.drawPlayer(ctx,{...game.player(0,3),src:p,t:0,i:0,face:1,x:0,y:0,z:0,anim:0,dx:0,dy:0,action:'idle',controlled:false,preview:true},{getTeam:()=>TEAMS[career.club],options:{showNames:false}});ctx.restore();}
function careerSeasonArchivePanel(archive){
 if(!Array.isArray(archive)||!archive.length)return '<section id="careerSeasonArchive" role="status"><p class="muted">No completed seasons have been archived yet. Complete a season and choose Begin Next Season to add it here.</p></section>';
 const teamName=id=>Number.isSafeInteger(id)&&id>=0&&typeof TEAMS[id]?.name==='string'?TEAMS[id].name:Number.isSafeInteger(id)?`Unknown team (${id})`:'Unknown team';
 const count=value=>Number.isSafeInteger(value)&&value>=0?String(value):'—';
 const cupLabels={champion:'Won the Career Cup',eliminated:'Eliminated from the Career Cup',pending:'Career Cup fixture pending',in_progress:'Career Cup in progress',unknown:'Career Cup result unavailable'};
 const rows=archive.slice().reverse().map(row=>{
  const record=row?.clubRecord&&typeof row.clubRecord==='object'&&!Array.isArray(row.clubRecord)?row.clubRecord:{};
  const cup=row?.cup&&typeof row.cup==='object'&&!Array.isArray(row.cup)?row.cup:{};
  const season=count(row?.season),position=count(row?.clubPosition),teamCount=count(row?.teamCount);
  const recordText=`${count(record.wins)}-${count(record.draws)}-${count(record.losses)} · ${count(record.played)} played · GD ${count(record.goalDifference)} · ${count(record.points)} pts`;
  const cupLabel=cupLabels[cup.status]||cupLabels.unknown;
  const cupWins=Number.isSafeInteger(cup.wins)&&cup.wins>=0?` · ${cup.wins} win${cup.wins===1?'':'s'}`:'';
  return `<article class="panel" data-career-season-archive="${escapeHTML(season)}"><h2 class="titleSmall">SEASON ${escapeHTML(season)}</h2><div class="stat"><strong>LEAGUE CHAMPION</strong><span>${escapeHTML(teamName(row?.championId))}</span></div><div class="stat"><strong>YOUR CLUB</strong><span>${escapeHTML(teamName(row?.clubId))}</span></div><div class="stat"><strong>FINAL POSITION</strong><span>#${escapeHTML(position)} / ${escapeHTML(teamCount)}</span></div><div class="stat"><strong>FINAL RECORD</strong><span>${escapeHTML(recordText)}</span></div><div class="stat"><strong>CAREER CUP</strong><span>${escapeHTML(cupLabel+cupWins)}</span></div></article>`;
 }).join('');
 return `<section id="careerSeasonArchive" aria-label="Past Career seasons"><div class="stack">${rows}</div></section>`;
}
function showCareerSeasonArchive(){
 if(!career)return showManager();
 const archive=completedSeasonArchive(career);
 page('PAST SEASONS',`${archive.length} archived Career season${archive.length===1?'':'s'} · read only`,`${careerSeasonArchivePanel(archive)}<div class="row">${button('← BACK TO MANAGER','manager','minor')}</div>`,'manager');
}
function careerSeasonReviewPanel(review){
 if(!review?.available)return '<section id="careerSeasonReview" role="status" aria-label="Season review unavailable"><h2 class="titleSmall">SEASON REVIEW UNAVAILABLE</h2><p>This save does not contain a complete, readable season table. No progress was changed. Return to Manager to continue.</p></section>';
 const league=review.league,cup=review.cup||{},cupLabels={champion:'Won the Career Cup',eliminated:'Eliminated from the Career Cup',pending:'Career Cup fixture pending',in_progress:'Career Cup in progress',unknown:'Career Cup result unavailable'};
 const number=value=>Number.isFinite(value)?String(value):'—';
 const cupStatus=cupLabels[cup.status]||cupLabels.unknown;
 const cupRecord=Number.isFinite(cup.wins)?` · ${cup.wins} win${cup.wins===1?'':'s'}`:'';
 const rows=league.standings.map(row=>`<tr class="${row.id===review.clubId?'myTeam':''}"><td>${row.position}</td><td>${escapeHTML(row.name||`Team ${row.id}`)}</td><td>${number(row.played)}</td><td>${number(row.wins)}</td><td>${number(row.draws)}</td><td>${number(row.losses)}</td><td>${number(row.goalDifference)}</td><td><b>${number(row.points)}</b></td></tr>`).join('');
 return `<section id="careerSeasonReview" aria-label="Career season review"><div class="careerTop"><div class="metric"><small>SEASON</small><strong>${number(review.season)}</strong></div><div class="metric"><small>FINAL POSITION</small><strong>#${number(league.clubPosition)} / ${number(league.teamCount)}</strong></div><div class="metric"><small>LEAGUE CHAMPION</small><strong>${escapeHTML(league.championName||`Team ${league.championId}`)}</strong></div><div class="metric"><small>CAREER CUP</small><strong>${escapeHTML(cupStatus)}${escapeHTML(cupRecord)}</strong></div></div><div class="panel"><h3 class="titleSmall">FINAL LEAGUE TABLE</h3><div class="scroll"><table class="miniTable"><thead><tr><th>#</th><th>TEAM</th><th>PL</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th></tr></thead><tbody>${rows}</tbody></table></div><p class="muted">This review uses the current season save only. Starting the next season resets its league table and Career Cup progress.</p></div></section>`;
}
function showCareerSeasonReview(){
 const review=careerSeasonReview(career,TEAMS);
 page(review.available?'CAREER SEASON REVIEW':'SEASON REVIEW UNAVAILABLE',review.available?`Season ${review.season??'—'} · ${escapeHTML(review.clubName||'Manager Career')}`:'This season cannot be safely reviewed.',`${careerSeasonReviewPanel(review)}<div class="row">${button('← BACK TO MANAGER','manager','minor')}${review.available?button('BEGIN NEXT SEASON','careerSeasonConfirm','gold'):''}</div>`,'manager');
}
function beginCareerNextSeason(){
 if(!career)return showManager();
 const review=careerSeasonReview(career,TEAMS);
 if(!review.available)return showCareerSeasonReview();
 const next=JSON.parse(JSON.stringify(career));
 try{
  nextSeason(next);
  careerSlots.save(careerSlots.active,next);
  career=next;store.put('managerCareer',career);showManager();
 }catch(error){alert('Career season rollover failed: '+error.message);showCareerSeasonReview();}
}
function showManager(){if(!career||creatingCareer){const regions=availableRegions(TEAMS);if(!regions.includes(managerRegion))managerRegion=regions[0]||'UEFA';const countries=availableCountries(TEAMS,managerRegion);if(!countries.includes(managerCountry))managerCountry=countries[0]||'';const choices=clubsInCountry(TEAMS,managerRegion,managerCountry);page('MANAGER CAREER','Choose continent → country → club, then build your twelve-player squad.',`<div class="panel"><div class="managerRegionSelector">${field('1. CONTINENT','managerContinent',regions.map(k=>[k,CONTINENTS.find(x=>x.id===k)?.region||k]),managerRegion)}${field('2. COUNTRY','managerCountry',countries.map(k=>[k,countryName(k,TEAMS)]),managerCountry)}</div>${teamField('3. CLUB','managerClub',choices.map(i=>[i,TEAMS[i].name]),choices[0])}<p class="muted">Select a continent and country to narrow the list. Browse Flags / Crests to see team graphics while choosing.</p><div class="row" style="margin-top:15px">${button('START MANAGER CAREER','startManager','gold')}${button('CONTINENTAL CUPS','continents')}</div></div>`);return;}
 const c=career,fx=currentCareerFixture(c),sorted=standings(c),place=sorted.findIndex(v=>v.id===c.club)+1;
 page('MANAGER CAREER',`Season ${c.season} · ${TEAMS[c.club].name} · 12 active players · League & knockout cup`,`<div class="row" style="margin:10px 0">${CONTINENTS.filter(co=>CONTINENTAL_TEAMS[co.id].includes(c.club)).map(co=>button('🏆 '+co.id+' CHAMPIONSHIP','continentPick_'+co.id,'gold')).join('')}</div><div class="careerAvatar panel" style="display:flex;align-items:center;gap:14px"><canvas id="managerAvatarPreview" width="100" height="108" aria-label="Manager portrait"></canvas><div><h3 class="titleSmall">MANAGER LOOK</h3><p class="muted">Your portrait is saved separately from the twelve-player squad.</p>${button('🎨 EDIT MANAGER LOOK','editManagerAppearance')}</div></div><div class="careerTop"><div class="metric"><small>TRANSFER FUNDS</small><strong>${eur(c.cash)}</strong></div><div class="metric"><small>LEAGUE POSITION</small><strong>#${place} / 8</strong></div><div class="metric"><small>LEAGUE ROUND</small><strong>${c.week} / 14</strong></div><div class="metric"><small>CUP</small><strong>${c.cup.eliminated?'OUT':c.cup.stage===3?'🏆 WON':['QF','SF','FINAL'][c.cup.stage]}</strong></div></div>
 <div class="twoCol"><div class="panel"><h3 class="titleSmall">NEXT FIXTURE</h3><div class="fixture">${fx?`${fx.kind==='cup'?'🏆 '+fx.round:'🏟 LEAGUE WEEK '+fx.round}<br><strong>${TEAMS[c.club].name} <em>VS</em> ${TEAMS[fx.opponent].name}</strong>`:c.leagueFinished?'🏆 SEASON COMPLETE!':'No fixtures yet'}</div>
 ${careerOpponentScoutPanel(c,fx)}
 <div class="row">${fx?button('▶ PLAY NEXT MATCH','careerPlay','gold'):button('↻ REVIEW SEASON','careerSeason','gold')}${button('12-PLAYER SQUAD','careerSquad')}${button('PAST SEASONS ('+completedSeasonArchive(c).length+')','careerPastSeasons')}${button('TRANSFER MARKET','careerMarket')}${button('🔍 YOUTH ACADEMY','careerScout')}</div><hr><h3 class="titleSmall">CLUB FACILITIES</h3>
 ${Object.entries(c.facilities).map(([key,v])=>`<div class="facility"><span>🏟 ${key.toUpperCase()} LVL ${v}</span>${button('UPGRADE '+eur(v*12500000),'facility_'+key)}</div>`).join('')}
 <p class="muted">Academy scouts create fictional recruitable prospects with defined potential, and players have contract years and fitness. Wins generate income. Training improves player experience; upgraded training increases XP per match. Facilities and transfers persist in this browser.</p></div>
 <div class="panel"><h3 class="titleSmall">LEAGUE TABLE</h3><div class="scroll"><table class="miniTable"><thead><tr><th>TEAM</th><th>PL</th><th>W</th><th>D</th><th>GD</th><th>PTS</th></tr></thead><tbody>${sorted.map((r,i)=>`<tr class="${r.id===c.club?'myTeam':''}"><td>${i+1}. ${teamIdentity(TEAMS[r.id])} ${escapeHTML(TEAMS[r.id].name)}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.gf-r.ga}</td><td><b>${r.pts}</b></td></tr>`).join('')}</tbody></table></div>${careerFormPanel(c,sorted)}<h3 class="titleSmall">LATEST RESULTS</h3><div class="scroll">${careerLatestResultsHTML(c)}</div></div></div>`);paintManagerAvatar();
}
function careerPlay(){if(!career)return showManager();const fx=currentCareerFixture(career);if(!fx)return showManager();home=career.club;away=fx.opponent;mode='career';start()}
function careerAgeLabel(p,date){const dobAge=verifiedPlayerAgeOnDate(p,date),verified=dobAge!==null,age=verified?dobAge:p?.age!==undefined&&p.age!==null&&p.age!==''&&Number.isFinite(Number(p.age))?Math.round(Number(p.age)):'—';return `AGE ${age} · ${verified?'DOB VERIFIED':'PROVISIONAL'}`;}
function showCareerSquad(){if(!career)return showManager();home=career.club;const rows=career.roster.map((p,i)=>`<div class="squadEntry"><canvas class="miniAvatar" width="100" height="108" data-avatar="${i}" data-avatarcareer="1"></canvas><div><strong>#${p.num} ${escapeHTML(p.name)}</strong><small>${p.role} · ${careerAgeLabel(p,career.seasonDate)} · LV ${p.level} · ${p.xp} XP · OVR ${playerOVR(p)}</small><small>STR ${withStats(p).strength} · STA ${withStats(p).stamina} · SHOOT ${withStats(p).shootPower}/${withStats(p).shootAccuracy} · GK ${withStats(p).gkSkill}</small>${playerAbilityIcons(p)}<small>FIT ${p.condition??100}% · CONTRACT ${p.contractYears??2}Y ${p.injuryWeeks?' · OUT '+p.injuryWeeks+'w':''}</small>${p.fictional?'<small class="placeholder">Academy stand-in</small>':''}</div><div class="squadBtns">${button('🎨','editPlayer'+i)}<button class="btn" data-train="${i}">TRAIN €1.5m</button><button class="btn" data-careerrecover="${i}">RECOVER €0.5m</button><button class="btn" data-careerrenew="${i}">RENEW</button></div></div>`).join('');page('MANAGER SQUAD',`Twelve players · ${TEAMS[career.club].name}. Improve their stats, appearance and experience.`,`<div class="squadGrid">${rows}</div><div class="row" style="margin-top:12px">${button('STARTING SIX & TACTICS','careerTactics','gold')}${button('← MANAGER HUB','manager','gold')}${button('TRANSFER MARKET','careerMarket')}${button('YOUTH SCOUTING','careerScout')}</div>`,'manager');paintAvatars();}
function careerTrain(){const ix=Number(menu.dataset.trainPlayer);try{trainPlayer(career,ix);saveCareer();showCareerSquad()}catch(e){alert(e.message)}}

function showCareerScout(){if(!career)return showManager();const players=career.scouted||[];page('YOUTH ACADEMY & SCOUTING',`Your youth academy is level ${career.facilities.academy}. Discover and sign original rising talents. Scouted names are fictional, never presented as real 2026 players.`,
 `<div class="twoCol"><div class="panel"><h3 class="titleSmall">SCOUT NETWORK</h3><div class="fixture">SCOUTING COST <strong>€2.5 MILLION</strong><p>Talents scale with academy level; each prospect has a future potential ceiling.</p></div>${button('🔎 SCOUT NEW PROSPECT','careerScoutNew','gold')}<div class="stat"><strong>FUNDS</strong><span>${eur(career.cash)}</span></div><div class="stat"><strong>ACADEMY LEVEL</strong><span>${career.facilities.academy}</span></div>${button('BACK TO MANAGER','manager')}</div>
 <div class="panel"><h3 class="titleSmall">DISCOVERED TALENTS (${players.length})</h3><div class="scroll">${players.map((p,i)=>`<div class="scoutRow"><div><strong>${escapeHTML(p.name)}</strong><small>${p.role} · AGE ${p.age} · OVR ${playerOVR(p)} · POT ${p.potential}</small><small>Signing fee ${eur(Math.ceil(p.value*.55))}</small></div>${button('SIGN','careerSign'+i,'gold')}</div>`).join('')||'<p class="muted">No prospects discovered. Scout a new player to begin.</p>'}</div><p class="muted">Signing replaces a squad member, preserving the twelve-player roster limit.</p></div></div>`, 'manager')}
function tryCareerScout(){try{scoutAcademy(career);saveCareer();showCareerScout()}catch(e){alert(e.message)}}
function tryCareerSign(i){
 const prospect=career?.scouted?.[i];if(!prospect)return showCareerScout();
 selectedAcademyProspect=i;
 const outgoing=[['','Choose a player to replace'],...career.roster.map((p,index)=>[index,`#${p.num} ${p.name} · ${p.role}`])];
 page('SIGN ACADEMY PROSPECT',`Review the signing fee and choose a named squad member to replace. Your twelve-player limit stays unchanged.`,
  `<div class="twoCol"><section class="panel" aria-label="Academy prospect details"><h2 class="titleSmall">${escapeHTML(prospect.name)}</h2><p>${escapeHTML(prospect.role||'Player')} · Age ${escapeHTML(prospect.age??'—')} · OVR ${playerOVR(prospect)} · Potential ${escapeHTML(prospect.potential??'—')}</p><p class="fixture">SIGNING FEE <strong>${eur(Math.ceil(prospect.value*.55))}</strong></p><p class="muted">The prospect takes the outgoing player's squad number. The outgoing player leaves this Career squad.</p></section><section class="panel" aria-label="Choose outgoing squad player">${field('PLAYER TO REPLACE','academyOutgoing',outgoing,'')}<p id="academySigningSummary" class="fixture" role="status" aria-live="polite" aria-atomic="true">Choose a named squad member to preview the signing. Nothing is saved until you confirm.</p></section></div><div class="row">${button('CONFIRM SIGNING','careerSignConfirm','gold')}${button('CANCEL','careerSignCancel','minor')}</div>`, 'careerScout');
 refreshAcademySigningSummary();
}
function refreshAcademySigningSummary(){
 const summary=$('academySigningSummary'),selector=$('academyOutgoing'),prospect=career?.scouted?.[selectedAcademyProspect];
 if(!summary)return;
 if(!prospect){summary.textContent='This prospect is no longer available. Return to scouting and select another prospect.';return;}
 const raw=selector?.value,releaseIndex=raw==null||raw===''?NaN:Number(raw),outgoing=career?.roster?.[releaseIndex];
 if(!Number.isSafeInteger(releaseIndex)||releaseIndex<0||releaseIndex>=12||!outgoing){summary.textContent=`Signing ${prospect.name} costs ${eur(Math.ceil(prospect.value*.55))}. Choose one of your twelve squad members to replace. Nothing has been saved.`;return;}
 summary.textContent=`Signing ${prospect.name} costs ${eur(Math.ceil(prospect.value*.55))}. ${outgoing.name} will leave the squad, and ${prospect.name} will take shirt number ${outgoing.num}. Confirm to save this change.`;
}
function cancelCareerSign(){selectedAcademyProspect=-1;showCareerScout()}
function confirmCareerSign(){
 const index=selectedAcademyProspect,raw=$('academyOutgoing')?.value,releaseIndex=raw==null||raw===''?NaN:Number(raw);
 if(!career||!career.scouted?.[index]){selectedAcademyProspect=-1;showCareerScout();return;}
 if(!Number.isSafeInteger(releaseIndex)||releaseIndex<0||releaseIndex>=12||!career.roster?.[releaseIndex]){refreshAcademySigningSummary();$('academyOutgoing')?.focus({preventScroll:true});return;}
 try{
  // Validate the replacement on a copy, then commit the Career slot before
  // changing the live Career object or its legacy mirror.
  const next=JSON.parse(JSON.stringify(career));
  signAcademy(next,index,releaseIndex);
  careerSlots.save(careerSlots.active,next);
  career=next;store.put('managerCareer',career);selectedAcademyProspect=-1;showCareerSquad();
 }catch(error){const summary=$('academySigningSummary');if(summary)summary.textContent=`Signing was not saved. ${error.message}`;$('academyOutgoing')?.focus({preventScroll:true});}
}
function tryCareerContract(index){try{const fee=renewContract(career,index);saveCareer();showCareerSquad();toast(`RENEWED — ${eur(fee)}`)}catch(e){alert(e.message)}}
function tryCareerRecover(index){try{recoverPlayer(career,index);saveCareer();showCareerSquad()}catch(e){alert(e.message)}}

let selectedMarketTeam=-1,selectedMarketTarget=-1,selectedMarketOutgoing=11,selectedAcademyProspect=-1;
let careerMarketSearch='',careerMarketRole='ALL',careerMarketSort='ovr-desc';
function careerMarketView(players,search='',role='ALL',sort='ovr-desc'){
 const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const query=normalize(search),source=Array.isArray(players)?players:[];
 const rows=source.map((player,index)=>({player,index})).filter(({player})=>player&&typeof player==='object'&&
  (role==='ALL'||String(player.role??'')===role)&&(!query||normalize(`${player.name||''} ${player.role||''}`).includes(query)));
 rows.sort((a,b)=>{
  if(sort==='price-asc')return careerMarketPrice(a.player)-careerMarketPrice(b.player)||a.index-b.index;
  if(sort==='price-desc')return careerMarketPrice(b.player)-careerMarketPrice(a.player)||a.index-b.index;
  return playerOVR(b.player)-playerOVR(a.player)||a.index-b.index;
 });
 return rows;
}
function careerMarketPrice(player){const value=Number(player?.value);return Number.isFinite(value)&&value>0?value:5000000;}
function careerMarketListingMarkup(rows){return rows.map(({player:p,index:i})=>`<div class="marketRow" data-market-ovr="${playerOVR(p)}" data-market-price="${careerMarketPrice(p)}"><span>${escapeHTML(p.name)}<br><small>${escapeHTML(p.role||'Player')} · OVR ${playerOVR(p)}${p.fictional?' · ACADEMY STAND-IN':''}</small></span><span>${eur(careerMarketPrice(p))}</span><input type="radio" name="target" value="${i}" ${i===selectedMarketTarget?'checked':''} aria-label="Buy ${escapeHTML(p.name)}"/></div>`).join('');}
function refreshCareerMarketListing(){const team=TEAMS[selectedMarketTeam];if(!team)return;const rows=careerMarketView(team.customRoster,careerMarketSearch,careerMarketRole,careerMarketSort),list=$('careerMarketListing'),count=$('careerMarketResultCount');if(selectedMarketTarget>=0&&!rows.some(row=>row.index===selectedMarketTarget))selectedMarketTarget=-1;if(list)list.innerHTML=careerMarketListingMarkup(rows);if(count)count.textContent=rows.length===team.customRoster.length?`${rows.length} ${rows.length===1?'player':'players'} found.`:`${rows.length} of ${team.customRoster.length} players found.`;}
function showCareerMarket(requested){if(!career)return showManager();const previousTeam=selectedMarketTeam,indices=TEAMS.map((t,i)=>i).filter(i=>['club26','continental'].includes(TEAMS[i].group)&&i!==career.club);selectedMarketTeam=indices.includes(requested)?requested:(indices.includes(selectedMarketTeam)?selectedMarketTeam:indices[0]);const team=TEAMS[selectedMarketTeam];if(previousTeam!==selectedMarketTeam){selectedMarketTarget=team?.customRoster?.length?0:-1;careerMarketSearch='';careerMarketRole='ALL';careerMarketSort='ovr-desc';}if(!Number.isInteger(selectedMarketTarget)||!team?.customRoster?.[selectedMarketTarget])selectedMarketTarget=team?.customRoster?.length?0:-1;const roles=[...new Set(team.customRoster.map(p=>String(p.role||'Player')))].sort((a,b)=>a.localeCompare(b));if(careerMarketRole!=='ALL'&&!roles.includes(careerMarketRole))careerMarketRole='ALL';
 page('TRANSFER MARKET',`Transfer budget ${eur(career.cash)}. Buy a player by swapping one of your current twelve squad members.`,`<div class="twoCol"><div class="panel"><h3 class="titleSmall">SCOUT OTHER CLUBS</h3>${teamField('SELLING CLUB','marketTeam',indices.map(i=>[i,TEAMS[i].name]),selectedMarketTeam)}<label class="fieldLabel" for="careerMarketSearch">SEARCH PLAYERS</label><input id="careerMarketSearch" type="search" aria-label="Search market players" aria-controls="careerMarketListing" value="${escapeHTML(careerMarketSearch)}" placeholder="Search by player or role"/><label class="fieldLabel" for="careerMarketRole">FILTER BY ROLE</label><select id="careerMarketRole" aria-label="Filter market players by role"><option value="ALL" ${careerMarketRole==='ALL'?'selected':''}>All roles</option>${roles.map(role=>`<option value="${escapeHTML(role)}" ${careerMarketRole===role?'selected':''}>${escapeHTML(role)}</option>`).join('')}</select><label class="fieldLabel" for="careerMarketSort">SORT PLAYERS</label><select id="careerMarketSort" aria-label="Sort market players"><option value="ovr-desc" ${careerMarketSort==='ovr-desc'?'selected':''}>Overall · highest first</option><option value="price-asc" ${careerMarketSort==='price-asc'?'selected':''}>Price · lowest first</option><option value="price-desc" ${careerMarketSort==='price-desc'?'selected':''}>Price · highest first</option></select><p id="careerMarketResultCount" class="muted" role="status" aria-live="polite" aria-atomic="true">Players found.</p><div id="careerMarketListing" class="scroll">${careerMarketListingMarkup(careerMarketView(team.customRoster,careerMarketSearch,careerMarketRole,careerMarketSort))}</div></div><div class="panel"><h3 class="titleSmall">YOUR OUTGOING PLAYER</h3>${field('REPLACE','releasePlayer',career.roster.map((p,i)=>[i,`${p.name} · ${p.role}`]),selectedMarketOutgoing)}<p class="muted">Transferring replaces one squad member, keeping exactly twelve players. 35% of the outgoing player's estimated value is recovered.</p><p class="fixture" id="careerTransferQuote" role="status" aria-live="polite">Transfer quote loading…</p><div class="row">${button('BUY & SWAP PLAYER','careerBuy','gold')}${button('← MANAGER','manager')}</div><p class="muted">The club database mixes documented 2026 World Cup-affiliated names with clearly flagged academy stand-ins where a complete 2026/27 roster could not be verified.</p></div></div>`,'manager');refreshCareerMarketListing();refreshCareerTransferQuote();}
function refreshCareerTransferQuote(){const status=$('careerTransferQuote');if(!status||!career)return;const target=menu.querySelector('input[name="target"]:checked'),release=$('releasePlayer');selectedMarketTarget=target?Number(target.value):-1;selectedMarketOutgoing=release?Number(release.value):11;const quote=CAREER.careerTransferQuote(career,TEAMS,selectedMarketTeam,selectedMarketTarget,selectedMarketOutgoing);if(!quote.valid){status.textContent='Select a market player and outgoing squad member to preview the swap.';return;}const details=`Player fee ${eur(quote.price)} · outgoing credit ${eur(quote.credit)} · projected budget after swap ${eur(quote.projectedCash)}.`;status.textContent=quote.affordable?`${details} The full player fee is affordable before outgoing credit is applied.`:`${details} Not affordable yet: add ${eur(quote.shortfall)} to cover the full player fee before sale credit.`;}
function careerBuy(){const target=menu.querySelector('input[name="target"]:checked');selectedMarketTarget=target?Number(target.value):-1;selectedMarketOutgoing=Number($('releasePlayer')?.value);const quote=CAREER.careerTransferQuote(career,TEAMS,selectedMarketTeam,selectedMarketTarget,selectedMarketOutgoing);if(!quote.valid||!quote.affordable){refreshCareerTransferQuote();$('careerTransferQuote')?.focus?.({preventScroll:true});return;}showCareerPurchaseReview();}
function showCareerPurchaseReview(){const quote=CAREER.careerTransferQuote(career,TEAMS,selectedMarketTeam,selectedMarketTarget,selectedMarketOutgoing),club=TEAMS[selectedMarketTeam],incoming=club?.customRoster?.[selectedMarketTarget],outgoing=career?.roster?.[selectedMarketOutgoing];if(!quote.valid||!quote.affordable||!incoming||!outgoing)return showCareerMarket(selectedMarketTeam);page('CONFIRM TRANSFER','Review both named players and the full fee before saving this squad change.',`<div class="twoCol"><section class="panel" aria-label="Incoming player"><h2 class="titleSmall">INCOMING</h2><strong>${escapeHTML(incoming.name)}</strong><p>${escapeHTML(incoming.role||'Player')} · OVR ${playerOVR(incoming)}</p><p class="fixture">PLAYER FEE <strong>${eur(quote.price)}</strong></p></section><section class="panel" aria-label="Outgoing player"><h2 class="titleSmall">OUTGOING</h2><strong>#${escapeHTML(outgoing.num??'—')} ${escapeHTML(outgoing.name)}</strong><p>${escapeHTML(outgoing.role||'Player')} · OVR ${playerOVR(outgoing)}</p><p class="fixture">SALE CREDIT <strong>${eur(quote.credit)}</strong></p></section></div><p class="fixture" id="careerTransferConfirmStatus" role="status" aria-live="polite" aria-atomic="true">Projected budget after swap: ${eur(quote.projectedCash)}. Confirm to save the transfer, or cancel to keep your current squad and budget.</p><div class="row">${button('CONFIRM BUY & SWAP','careerBuyConfirm','gold')}${button('CANCEL','careerBuyCancel','minor')}</div>`,'careerMarket');}
function cancelCareerBuy(){showCareerMarket(selectedMarketTeam)}
function confirmCareerBuy(){
 const status=$('careerTransferConfirmStatus'),quote=CAREER.careerTransferQuote(career,TEAMS,selectedMarketTeam,selectedMarketTarget,selectedMarketOutgoing);
 if(!quote.valid||!quote.affordable){if(status)status.textContent='This transfer is no longer available at the quoted price. No changes were saved.';return;}
 let next;
 try{next=JSON.parse(JSON.stringify(career));purchase(next,TEAMS,selectedMarketTeam,selectedMarketTarget,selectedMarketOutgoing);careerSlots.save(careerSlots.active,next);}
 catch(error){if(status)status.textContent=`Transfer not saved. ${error.message}`;return;}
 career=next;
 try{store.put('managerCareer',career)}
 catch(error){if(status)status.textContent=`Transfer saved to the active Career slot, but the legacy compatibility mirror could not be refreshed. ${error.message}`;return;}
 showCareerSquad();
}
let avatarIndex=0;
// Explicit launch context prevents active Career from hijacking Settings Studio.
let studioCareerContext=false;
// Manager appearance is a separate Career field, never a roster-player selection.
let studioManagerContext=false;
function studioSubject(){if(studioManagerContext)return career?managerAvatarPlayer():null;const squad=(typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club?career.roster:roster(home);return squad?.[avatarIndex]||null;}
// Track the actual editor origin independently of a loaded Career or Cup.
let studioReturnAction='navCustomization',editorReturnAction='navCustomization';
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
function studioNumberOptions(key,selected){const category=key==='accessory'?'accessory':'appearance';return studioOptionTags((STUDIO_ASSET_LABELS[key]||[]).map((label,i)=>[String(i),label]).filter(([value])=>String(selected)===value||tokenWallet.owns(category,`${key}:${value}`)),selected)}
function studioAppearanceKey(key,value){
 if(key==='skin'||key==='hair'){
  const palette=key==='skin'?NATURAL_SKIN_TONES:NATURAL_HAIR_COLORS,index=palette.findIndex(([hex])=>String(hex).toLowerCase()===String(value).toLowerCase());
  return index<0?null:`${key}:${index}`;
 }
 const options=STUDIO_ASSET_LABELS[key],index=Number(value);
 return !Array.isArray(options)||!Number.isInteger(index)||index<0||index>=options.length?null:`${key}:${index}`;
}
function studioAppearanceUnlockIssues(previous,appearance){
 const issues=[];
 for(const key of Object.keys(appearance||{})){
  const value=appearance[key];if(Object.is(previous?.[key],value))continue;
  const unlock=studioAppearanceKey(key,value);if(!unlock) {issues.push(key);continue;}
  const category=key==='accessory'?'accessory':'appearance';if(!tokenWallet.owns(category,unlock))issues.push(key);
 }
 return issues;
}
const STUDIO_SKIN_SWATCH_NAMES=Object.freeze(['Soft Peach','Golden Sand','Warm Apricot','Honey Tan','Toasted Honey','Copper Bronze','Cinnamon','Chestnut','Deep Umber','Roasted Umber']);
function studioSafeColor(value){
 if(typeof value!=='string'||!value.trim()||value.length>64)return '';
 if(typeof CSS!=='undefined'&&typeof CSS.supports==='function')return CSS.supports('color',value)?value:'';
 return /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)?value:'';
}
function studioColorOptions(list,selected,kind='color',family=null){
 const values=list.map(([value,label],index)=>[value,`${kind==='skin'?STUDIO_SKIN_SWATCH_NAMES[index]||label:label} · ${value}`])
  .filter(([value],index)=>!family||String(value)===String(selected)||tokenWallet.owns('appearance',`${family}:${index}`));
 // Preserve every non-empty legacy value exactly, even when it is not a hex color
 // or one of the current presets. It stays selected until the user chooses another.
 if(typeof selected==='string'&&selected.length&&!values.some(([value])=>value===selected))
   values.unshift([selected,`Saved custom color · ${selected}`]);
 return studioOptionTags(values,selected);
}
function studioColorPreviewState(id){
 const select=$(id==='face_skin'?'face_skin':'face_hair'),value=select?.value||'',option=select?.selectedOptions?.[0]||Array.from(select?.options||[]).find(item=>item.value===value);
 const safe=studioSafeColor(value),label=String(option?.textContent||value||'No color selected').replace(/\s*·\s*#[0-9a-f]+$/i,'');
 return {safe,label,text:safe?`${label} — ${value}`:`${label} — saved value kept; preview unavailable`};
}
function studioUpdateColorPreview(id){
 const state=studioColorPreviewState(id),prefix=id==='face_skin'?'studioSkin':'studioHair',swatch=$(prefix+'Swatch'),text=$(prefix+'PreviewText');
 if(swatch){swatch.style.background=state.safe||'repeating-linear-gradient(135deg,#334 0 5px,#8aa 5px 10px)';swatch.classList.toggle('previewUnavailable',!state.safe);swatch.setAttribute('aria-label',state.safe?`${state.label} color preview`:`${state.label}; color preview unavailable`);}
 if(text)text.textContent=state.text;
 return state;
}
function studioColorField(id,title,list,selected,kind){
 const prefix=id==='face_skin'?'studioSkin':'studioHair',state={safe:studioSafeColor(selected),label:(list.find(([value])=>value===selected)?.[1])||'Saved custom color'};
 const label=kind==='skin'&&list.findIndex(([value])=>value===selected)>=0?STUDIO_SKIN_SWATCH_NAMES[list.findIndex(([value])=>value===selected)]:state.label;
 const valueText=state.safe?`${label} — ${selected}`:`Saved value kept — preview unavailable`;
 const family=id==='face_skin'?'skin':'hair';
 return `<label class="studioColorField">${title}<select class="choice" id="${id}" aria-label="${title} color" aria-describedby="${prefix}PreviewText ${prefix}ColorHelp">${studioColorOptions(list,selected,kind,family)}</select><span class="studioColorPreview${state.safe?'':' previewUnavailable'}" id="${prefix}Swatch" role="img" aria-label="${escapeHTML(state.safe?`${label} color preview`:'Saved color preview unavailable')}" style="display:inline-block;width:2.5rem;height:1.5rem;border:2px solid #d8f0f8;border-radius:6px;vertical-align:middle;background:${escapeHTML(state.safe||'repeating-linear-gradient(135deg,#334 0 5px,#8aa 5px 10px)')}"></span><span class="muted" id="${prefix}PreviewText" role="status" aria-live="polite">${escapeHTML(valueText)}</span><small id="${prefix}ColorHelp">Inclusive color choices. Buy palette unlocks in Store &amp; Tokens. Existing custom saved colors remain selected until you choose a replacement.</small></label>`;
}

let studioDirection=0,studioAction='idle',studioSpin=false,studioDragX=null,studioGalleryOpen=false,studioGallerySignature='',studioGalleryFrame=1;
setInterval(studioAnimationFrame,1150);
setInterval(()=>{if(['PLAYER CUSTOMIZATION','MANAGER APPEARANCE'].includes(screen) && $('customPortrait') && studioAction!=='idle')drawCustomizer()},90);
function studioRotate(step){studioDirection=((studioDirection+step)%8+8)%8;const label=$('customAngleLabel');if(label)label.textContent=STUDIO_DIRS[studioDirection].label;drawCustomizer()}
function studioAnimationFrame(){if(!studioSpin||!$('customPortrait')||!['PLAYER CUSTOMIZATION','MANAGER APPEARANCE'].includes(screen))return;studioDirection=(studioDirection+1)%8;drawCustomizer();}
// STUDIO-GALLERY-PICK-01: selecting an eight-view tile previews that heading
// without saving appearance changes or changing the gameplay input scheme.
function studioPickView(index){
 if(!studioGalleryOpen||!Number.isInteger(index)||index<0||index>=STUDIO_DIRS.length)return false;
 studioDirection=index;studioSpin=false;
 const spin=menu.querySelector('[data-action=studioSpin]');
 if(spin)spin.textContent='↻ AUTO ROTATE';
 drawCustomizer();
 return true;
}
// STUDIO-GALLERY-KEYS-01: keyboard navigation follows the responsive gallery grid.
// Arrow keys move through the existing eight buttons; Home/End jump to edges.
// Only the preview direction changes: no appearance persistence or game input.
function studioGalleryKeydown(event){
 // Preserve browser/system Alt+Arrow and Ctrl/Meta shortcuts.
 if(event.altKey||event.ctrlKey||event.metaKey)return false;
 const button=event.target?.closest?.('[data-studio-pick]');
 if(!studioGalleryOpen||!button)return false;
 const index=Number(button.dataset.studioPick);
 if(!Number.isInteger(index)||index<0||index>=STUDIO_DIRS.length)return false;
 const columns=typeof matchMedia==='function'&&matchMedia('(max-width:650px)').matches?2:4;
 const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-columns,ArrowDown:columns};
 let next;
 if(event.key==='Home')next=0;
 else if(event.key==='End')next=STUDIO_DIRS.length-1;
 else if(Object.prototype.hasOwnProperty.call(offsets,event.key))next=(index+offsets[event.key]+STUDIO_DIRS.length)%STUDIO_DIRS.length;
 else return false;
 event.preventDefault();
 if(!studioPickView(next))return false;
 menu.querySelector('[data-studio-pick="'+next+'"]')?.focus();
 return true;
}
// STUDIO-GALLERY-FRAME-STEP-01: accessible single-frame comparison controls.
// Gallery-only: no saved appearance writes and no additional match actions.
function studioStepGalleryFrame(step){
 if(!studioGalleryOpen||!Number.isInteger(step)||Math.abs(step)!==1)return false;
 studioGalleryFrame=(studioGalleryFrame+step+4)%4;
 const slider=$('studioGalleryPhase');
 if(slider)slider.value=String(studioGalleryFrame);
 drawCustomizer();
 return true;
}
// STUDIO-GALLERY-PICK-01 END
function studioEightViewMarkup(){
 return `<section id="studioEightViewGallery" class="studioEightViewGallery" aria-label="Eight-direction player action gallery"><p id="studioEightViewPoseLabel" class="muted" role="status" aria-live="polite">Comparing ${escapeHTML(studioAction.toUpperCase())} frame ${studioGalleryFrame+1} of 4 in eight directions</p><div class="row studioGalleryTimeline"><label for="studioGalleryPhase">ACTION FRAME</label><input id="studioGalleryPhase" class="choice" type="range" min="0" max="3" step="1" value="${studioGalleryFrame}" aria-label="Scrub motion phase across all eight player views" aria-valuetext="Frame ${studioGalleryFrame+1} of 4"><output id="studioGalleryPhaseLabel" for="studioGalleryPhase">FRAME ${studioGalleryFrame+1} / 4</output><button type="button" class="btn" data-action="studioGalleryPrev" aria-label="Previous animation frame">◀ FRAME</button><button type="button" class="btn" data-action="studioGalleryNext" aria-label="Next animation frame">FRAME ▶</button></div>${STUDIO_DIRS.map((dir,i)=>`<figure class="studioEightViewItem"><button type="button" class="studioViewPick" data-studio-pick="${i}" aria-pressed="${i===studioDirection}" aria-label="Show ${escapeHTML(dir.label)} in main player preview" aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home End"><canvas data-studio-view="${i}" width="144" height="152" role="img" aria-label="${escapeHTML(dir.label)} ${escapeHTML(studioAction)} pose"></canvas></button><figcaption>${escapeHTML(dir.label)}</figcaption></figure>`).join('')}</section>`;
}
// 0.8.25.32: Optional, cached eight-view comparison gallery for the selected
// Studio appearance. Idle frames are deterministic even while rotating/animating
// the large preview; update the sheet only when the edited character changes.
function drawStudioEightViewGallery(player,appearance){
 const root=$('studioEightViewGallery');if(!studioGalleryOpen||!root||!player)return;
 // Compare a user-selected action phase in all eight headings; the main portrait
 // remains the only animated preview, avoiding eight extra render loops.
 const pose=$('customPose')?.value||studioAction;
 const signature=JSON.stringify([home,avatarIndex,player.name,appearance,pose,studioGalleryFrame]);
 if(signature===studioGallerySignature&&root.querySelectorAll('canvas').length===8)return;
 studioGallerySignature=signature;
 const poseLabel=$('studioEightViewPoseLabel');
 if(poseLabel)poseLabel.textContent='Comparing '+pose.toUpperCase()+' frame '+(studioGalleryFrame+1)+' of 4 in eight directions';
 const frameLabel=$('studioGalleryPhaseLabel');if(frameLabel)frameLabel.textContent='FRAME '+(studioGalleryFrame+1)+' / 4';
 const slider=$('studioGalleryPhase');if(slider)slider.setAttribute('aria-valuetext','Frame '+(studioGalleryFrame+1)+' of 4');
 const phase=Math.max(0,Math.min(3,studioGalleryFrame|0));
 const actionTime=[.4,.28,.16,.04][phase],diveTime=[.06,.16,.28,.42][phase];
 const gameView={getTeam:()=>TEAMS[home],options:{showNames:false},celebrationStyle:0};
 const template=game.player(0,3)||{i:3,team:0};
 const action=pose==='run'?'idle':pose;
 const fit=portraitFit(144,152,appearance,action);
 for(let i=0;i<STUDIO_DIRS.length;i++){
  const canvas=root.querySelector('canvas[data-studio-view="'+i+'"]');if(!canvas)continue;
  // Keep both the focusable tile and its canvas accurate when action or phase changes.
  // Screen readers can compare poses without relying on the visual slider output.
  const phaseText='frame '+(phase+1)+' of 4';
  canvas.setAttribute('aria-label',STUDIO_DIRS[i].label+' '+pose+' pose, '+phaseText);
  canvas.closest?.('[data-studio-pick]')?.setAttribute('aria-label',
   'Show '+STUDIO_DIRS[i].label+' '+pose+' '+phaseText+' in main player preview');
  const ctx=canvas.getContext('2d');if(!ctx)continue;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const gr=ctx.createLinearGradient(0,0,144,152);
  gr.addColorStop(0,'#27666e');gr.addColorStop(1,'#102b3e');ctx.fillStyle=gr;ctx.fillRect(0,0,144,152);
  const dir=STUDIO_DIRS[i],moving=pose==='run';
  const dummy={...template,x:0,y:0,z:pose==='header'?[5,14,22,10][phase]:0,t:0,i:avatarIndex,src:{...player,appearance},
   keeper:player.role==='GK'||action.startsWith('keeper'),face:dir.view.side,
   dx:moving?dir.dx*.6:0,dy:moving?dir.dy*.6:0,
   visualFacing:dir.view,anim:moving?(phase+1)*.45:phase*.3,action,actionTimer:actionTime,
   diveElapsed:diveTime,diveDy:dir.dy<0?-1:1,controlled:false,preview:true,stun:0,cryTimer:0};
  ctx.save();ctx.translate(fit.x,fit.y);ctx.scale(fit.scale,fit.scale);
  renderer.drawPlayer(ctx,dummy,gameView);ctx.restore();
 }
}

// STUDIO-101: edit the exact 14 numeric attributes already used by the match
// engine. Keep legacy rating and player identity intact for older saves.
const STUDIO_STAT_NAMES=Object.freeze({stamina:'Stamina',strength:'Strength',aggression:'Aggression',defence:'Defence',speedRating:'Speed',agility:'Agility',dribbling:'Dribbling',shootPower:'Shot power',shootAccuracy:'Shot accuracy',heading:'Heading',jumping:'Jumping',passing:'Passing',crossing:'Crossing',gkDiving:'GK diving',gkSkill:'GK skill'});
function studioStatControls(player){const normalized=withStats(player);
 return `<details id="studioStatsEditor"><summary>EDIT PLAYER STATS · ${escapeHTML(player.role)} OVR ${overallForPosition(normalized)}</summary><p class="muted">Change any of the ${NUMERIC_STATS.length} match attributes (1–100). Jumping affects leap height and Energy cost, not the legacy overall rating or player ID.</p><div class="avatarControls">${NUMERIC_STATS.map(key=>`<label for="stat_${key}">${STUDIO_STAT_NAMES[key]||key}<input class="choice" type="number" inputmode="numeric" min="1" max="100" step="1" id="stat_${key}" value="${normalized[key]}" /></label>`).join('')}</div><p id="studioStatOVR" role="status">POSITION OVR: ${overallForPosition(normalized)}</p><p id="studioJumpPreview" class="muted" role="status" aria-live="polite">${studioJumpPreview(normalized.jumping)}</p><div class="row">${button('SAVE PLAYER STATS','saveStudioStats','gold')}${button('RESET UNSAVED STATS','resetStudioStats')}</div></details>`;
}
function readStudioStats(){const stats={};for(const key of NUMERIC_STATS){const node=$('stat_'+key),raw=node?.value??'';const value=Number(raw);if(raw.trim()===''||!Number.isInteger(value)||value<1||value>100)throw Error('Invalid '+(STUDIO_STAT_NAMES[key]||key)+': enter a whole number from 1 to 100');stats[key]=value;}return stats;}
// STUDIO-JUMP-PREVIEW-01: the editor and live engine use one Jumping formula.
function studioJumpPreview(jumping){
 const {rating,heightRatio,energyCostMultiplier}=jumpMetrics(jumping);
 return 'JUMPING '+rating+'/100 · LEAP HEIGHT '+Math.round(heightRatio*100)+'% · JUMP ENERGY COST ×'+energyCostMultiplier.toFixed(2)+' (relative to Jumping 100)';
}
function studioStatPreview(){
 const label=$('studioStatOVR'),jump=$('studioJumpPreview');if(!label)return;
 try{
  const player=((typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club?career.roster:roster(home))[avatarIndex];
  const stats=readStudioStats();
  label.textContent='POSITION OVR: '+overallForPosition({...player,...stats});
  if(jump)jump.textContent=studioJumpPreview(stats.jumping);
 }catch(error){label.textContent=error.message;if(jump)jump.textContent='Enter valid stats to preview Jumping performance.';}
}
function saveStudioStats(){try{const stats=readStudioStats(),inCareer=!!((typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club);const source=inCareer?career.roster.map(p=>({...p})):roster(home);if(!source[avatarIndex])throw Error('No player selected');source[avatarIndex]={...source[avatarIndex],...stats};if(inCareer){const updated={...career,roster:source};if(!storeCharacterChanges('managerCareer',updated))return;career=updated;saveCareer();showCareerSquad();}else{const updated={...edits,[TEAMS[home].id]:source};if(!storeCharacterChanges('edits',updated))return;edits=updated;showPlayerStudio(avatarIndex);}}catch(error){alert('Cannot save player stats: '+error.message)}}
// Read-only Super Shot level/selection guide. It never writes to the roster.
function studioShotPreviewGuide(choice,equipped,tier){
 const value=Number(tier),level=Number.isInteger(value)&&value>=1&&value<=5?value:1;
 const id=choice==='keep'?equipped:choice==='none'?null:choice;
 if(choice==='none')return 'Level '+level+': Super Shot will be removed only after SAVE SUPER SHOT.';
 if(!id)return 'Level '+level+': No equipped Super Shot. Select a shot or keep current; nothing changes until SAVE SUPER SHOT.';
 const shot=Object.hasOwn(SHOTS,id)?SHOTS[id]:null;
 const name=shot?.name|| (choice==='keep'?'Previously equipped Super Shot':id);
 return 'Level '+level+': '+name+'. '+(choice==='keep'?'Current selection retained. ':'Preview selection only. ')+'Press SAVE SUPER SHOT to apply.';
}
// STUDIO-SHOT-STATE-01: preview saveStudioShot's validated projection without writing saves.
function studioShotSaveState(choice,tier,player){
 const level=Number(tier);
 const currentLevel=Number(SPECIALS.abilityLevel(player,'shot'))||1;
 const hasExisting=player?.superAbility?.type==='shoot';
 const validRole=!!player&&(['MF','FW'].includes(player.role)||hasExisting);
 const validTier=Number.isInteger(level)&&level>=1&&level<=5;
 const validChoice=choice==='keep'||choice==='none'||Object.hasOwn(SHOTS,choice);
 const changesSpecialization=choice!=='none'&&(choice!=='keep'||hasExisting&&level!==currentLevel);
 const allowed=!changesSpecialization||ABILITIES.canEquipVerifiedFieldSpecial(player,{kind:'shot',level});
 if(!validRole||!validTier||!validChoice||!allowed)return {
  disabled:true,unchanged:false,invalid:true,message:'New Super Shots and level changes require a verified tier and an allowed level (Gold 1–2, Star 1–3, Superstar 1–5). Existing equipment can still be kept or removed.'
 };
 const updated={...player};
 if(choice==='none'){
  if(updated.superAbility?.type==='shoot')delete updated.superAbility;
  if(Object.hasOwn(updated,'shot'))updated.shot=null;
  if(Object.hasOwn(updated,'shotName'))updated.shotName='';
 }else if(choice==='keep'){
  if(updated.superAbility?.type==='shoot'&&level!==currentLevel){updated.superShotLevel=level;updated.superAbility={...updated.superAbility,level};}
 }else{
  updated.superShotLevel=level;
  updated.shot=choice;updated.shotName=SHOTS[choice].name||choice;
  updated.superAbility={type:'shoot',id:choice,name:updated.shotName,level};
 }
 const sameAbility=player.superAbility===updated.superAbility||(
  !!player.superAbility&&!!updated.superAbility&&
  Object.keys(player.superAbility).length===Object.keys(updated.superAbility).length&&
  Object.keys(player.superAbility).every(key=>Object.is(player.superAbility[key],updated.superAbility[key]))
 );
 const unchanged=Object.keys(player).every(key=>Object.is(player[key],updated[key]))&&Object.keys(updated).every(key=>Object.is(player[key],updated[key]))&&
  Object.is(player.shot,updated.shot)&&Object.is(player.shotName,updated.shotName)&&sameAbility;
 return {disabled:unchanged,unchanged,invalid:false,message:unchanged?
  'Super Shot already saved. No changes to apply.':changesSpecialization?'Verified specialization level accepted. Super Shot changes are ready to save.':'Super Shot changes are ready to save.'};
}
// STUDIO-DRIBBLE-STATE-01: a deterministic default is not yet an explicit saved choice.
function studioDribbleSaveState(choice,player,styles){
 const valid=choice==='keep'||choice==='none'||Array.isArray(styles)&&styles.some(style=>style.id===choice);
 const locked=valid&&choice!=='keep'&&choice!=='none'&&choice!=='sideStep'&&choice!==player?.dribbleType&&!studioVerifiedDribbleEligible(player);
 const unchanged=choice==='keep'||(choice==='none'&&!player?.dribbleType)||(valid&&player?.dribbleType===choice);
 return {disabled:!valid||locked||unchanged,unchanged,invalid:!valid||locked,locked,message:!valid?
  'Select a valid Dribble Style before saving.':locked?
  'Unique Dribble Styles require verified canonical Gold tier or higher. KEEP CURRENT and remove remain available.':
  unchanged?'Dribble Style already saved. No changes to apply.':
  'Dribble Style changes are ready to save.'};
}
// Dribble Style preview uses the shipped ten-style roster catalogue, not Magic Tricks.
// Previewing a style never writes the roster or Career save.
function studioDribblePreviewGuide(styleId,styles,player){
 if(styleId==='keep')return 'KEEP CURRENT preserves the saved style exactly. No Dribble Style change is saved unless you choose one and press SAVE DRIBBLE STYLE.';
 if(styleId==='none')return 'REMOVE selected. The saved Dribble Style will be cleared only after SAVE DRIBBLE STYLE; normal DRIBBLE controls stay available.';
 const style=Array.isArray(styles)?styles.find(entry=>entry.id===styleId):null;
 if(!style)return 'Unknown dribble style. The existing player remains unchanged until SAVE DRIBBLE STYLE.';
 if(style.id!=='sideStep'&&!studioVerifiedDribbleEligible(player))return 'Locked preview: '+(style.name||style.id)+' requires source-verified canonical Gold tier or higher. KEEP CURRENT and remove remain available.';
 const name=style.name||style.id;
 const effect=style.nutmeg?'Nutmeg works best against an approaching defender at medium range.':
  style.id==='rainbow'?'Rainbow Flick lifts the ball; an alert approaching defender can read its path.':
  'This style changes the normal ball-control evasion bonus against defenders.';
 return name+': '+effect+' It is an ordinary dribble style, not a Magic Trick, and has no ability level. Preview only; press SAVE DRIBBLE STYLE to apply.';
}
// STUDIO-DEFENCE-STATE-01: project the canonical update without writing to saves.
function studioDefenceSaveState(choice,tier,player){
 const level=Number(tier);
 const currentLevel=Number(SPECIALS.abilityLevel(player,'defence'))||1;
 const hasExisting=player?.superAbility?.type==='defence';
 const validRole=player?.role==='DF'||hasExisting,validTier=Number.isInteger(level)&&level>=1&&level<=5;
 const validChoice=typeof choice==='string'&&!!choice;
 const newMove=choice!=='keep'&&choice!=='none';
 const changesSpecialization=newMove||choice==='keep'&&hasExisting&&level!==currentLevel;
 const allowed=!changesSpecialization||ABILITIES.canEquipVerifiedFieldSpecial(player,{kind:'defence',level});
 const available=!newMove||ABILITIES.studioDefenceChoices(player,level).some(move=>move.id===choice);
 if(!validRole||!validTier||!validChoice||!allowed||!available)return {
  disabled:true,unchanged:false,invalid:true,message:'New Super Defence abilities and level changes require a verified tier and an allowed level (Gold 1–2, Star 1–3, Superstar 1–5). Existing equipment can still be kept or removed.'
 };
 let equipped;
 try{
  if(choice==='keep'&&(!hasExisting||level===currentLevel))equipped={...player};
  else if(choice==='none'&&!hasExisting&&!Object.hasOwn(player,'superDefenceLevel'))equipped={...player};
  else if(choice==='none'){
   equipped=ABILITIES.withStudioDefence(player,choice,currentLevel);
   if(!Object.hasOwn(player,'superDefenceLevel'))delete equipped.superDefenceLevel;
  }else equipped=ABILITIES.withStudioDefence(player,choice,level);
 }
 catch(error){return {disabled:true,unchanged:false,invalid:true,message:'Choose a valid Super Defence ability and tier before saving.'};}
 const sameAbility=player.superAbility===equipped.superAbility||(
  !!player.superAbility&&!!equipped.superAbility&&
  Object.keys(player.superAbility).length===Object.keys(equipped.superAbility).length&&
  Object.keys(player.superAbility).every(key=>Object.is(player.superAbility[key],equipped.superAbility[key]))
 );
 const unchanged=Object.keys(player).every(key=>Object.is(player[key],equipped[key]))&&Object.keys(equipped).every(key=>Object.is(player[key],equipped[key]))&&sameAbility;
 return {disabled:unchanged,unchanged,invalid:false,message:unchanged?
  'Super Defence already saved. No changes to apply.':changesSpecialization?'Verified specialization level accepted. Super Defence changes are ready to save.':'Super Defence changes are ready to save.'};
}
// Read-only Super Defence tier preview: higher tiers unlock Spin Bumper.
// No roster mutation occurs until SAVE DEFENCE ABILITY is pressed.
function studioDefenceTierGuide(tier,choices,player){
 const level=Number(tier);
 const cap=ABILITIES.verifiedSpecializationMaxLevel(player);
 const gate=' Verified tier cap: Gold 2, Star 3, Superstar 5; source tier is '+(cap||'unverified/locked')+'.';
 if(!Array.isArray(choices)||choices.length===0)return 'Tier '+level+': No new Super Defence moves available at this level. Existing equipment can still be kept or removed.'+gate;
 const spin=choices.some(a=>a.id==='spinBumper');
  return 'Tier '+level+': '+choices.length+' available '+(choices.length===1?'move':'moves')+'. '+(spin?'Spin Bumper unlocked. Its lavender ground ring warns for 0.42 seconds; jump or dash out before it resolves. Teammates are safe.':'Spin Bumper unlocks at tier 3.')+' Wall family unlocks: Magic at tier 1, Fire at tier 2, Ice at tier 3 and Demon at tier 4. All walls share one short-lived barrier and grounded SHOOT-slide counter; their Canvas art and particles differ.'+gate+' Preview only; press SAVE DEFENCE ABILITY to apply.';
}
// GK equipment occupies its own legacy field but shares the same exclusive,
// verified specialization slot as field Super Shot/Super Defence.
function studioKeeperDefenceSaveState(choice,tier,player){
 const level=Number(tier),currentLevel=Number(SPECIALS.abilityLevel(player,'keeper'))||1;
 const hasExisting=player?.gkSuperAbility?.type==='defence';
 const validRole=player?.role==='GK'||hasExisting,validTier=Number.isInteger(level)&&level>=1&&level<=5;
 const validChoice=typeof choice==='string'&&!!choice,newMove=choice!=='keep'&&choice!=='none';
 const changesSpecialization=newMove||choice==='keep'&&hasExisting&&level!==currentLevel;
 const allowed=!changesSpecialization||ABILITIES.canEquipVerifiedKeeperSpecial(player,{level});
 const available=!newMove||ABILITIES.studioKeeperChoices(player,level).some(move=>move.id===choice);
 if(!validRole||!validTier||!validChoice||!allowed||!available)return {
  disabled:true,unchanged:false,invalid:true,
  message:'New goalkeeper Super Defence and level changes require source-verified Gold 1–2, Star 1–3, or Superstar 1–5 eligibility, an available move, and no field Super Shot or Super Defence.'
 };
 let equipped;
 try{
  if(choice==='keep'&&(!hasExisting||level===currentLevel))equipped={...player};
  else if(choice==='none'&&!hasExisting&&!Object.hasOwn(player,'gkSuperLevel'))equipped={...player};
  else if(choice==='none'){
   equipped=ABILITIES.withStudioKeeper(player,choice,currentLevel);
   if(!Object.hasOwn(player,'gkSuperLevel'))delete equipped.gkSuperLevel;
  }else equipped=ABILITIES.withStudioKeeper(player,choice,level);
 }catch(error){return {disabled:true,unchanged:false,invalid:true,message:'Choose a valid goalkeeper Super Defence move and level before saving.'};}
 const sameAbility=player.gkSuperAbility===equipped.gkSuperAbility||(
  !!player.gkSuperAbility&&!!equipped.gkSuperAbility&&
  Object.keys(player.gkSuperAbility).length===Object.keys(equipped.gkSuperAbility).length&&
  Object.keys(player.gkSuperAbility).every(key=>Object.is(player.gkSuperAbility[key],equipped.gkSuperAbility[key]))
 );
 const unchanged=Object.keys(player).every(key=>Object.is(player[key],equipped[key]))&&Object.keys(equipped).every(key=>Object.is(player[key],equipped[key]))&&sameAbility;
 const cap=ABILITIES.verifiedSpecializationMaxLevel(player);
 return {disabled:unchanged,unchanged,invalid:false,message:unchanged?
  'Goalkeeper Super Defence already saved. No changes to apply.':changesSpecialization?'Verified goalkeeper specialization level accepted. Changes are ready to save.':
  cap?'Verified goalkeeper level cap: '+cap+'. Changes are ready to save.':'New goalkeeper moves are locked until source-verified Gold tier; existing equipment can still be kept or removed.'};
}
function studioKeeperDefenceTierGuide(tier,choices,player){
 const cap=ABILITIES.verifiedSpecializationMaxLevel(player),gate=' Verified cap: Gold 2, Star 3, Superstar 5; source tier is '+(cap||'unverified/locked')+'.';
 if(player?.superAbility!=null)return 'A field Super Shot or Super Defence already occupies this player’s one-specialization slot. Remove it before equipping goalkeeper Super Defence.'+gate;
 if(!Array.isArray(choices)||choices.length===0)return 'No new goalkeeper moves are available at this level. Existing equipment can still be kept or removed.'+gate;
 return 'Tier '+Number(tier)+': '+choices.length+' goalkeeper moves available. New moves require source-verified Gold or higher and respect the verified tier cap.'+gate+' Preview only; press SAVE GOALKEEPER DEFENCE to apply.';
}
function showPlayerStudio(index=0){studioLastRandomPreview=null;avatarIndex=studioManagerContext?0:Math.max(0,Math.min(11,Number(index)||0));const squad=studioManagerContext?(career?[managerAvatarPlayer()]:[]):((typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club?career.roster:roster(home));const player=squad[avatarIndex];if(!player){showHome();return;}const av={...avatarFor(player),...(player.appearance||{})};
 const colorControls=`<fieldset class="studioControlGroup"><legend>SKIN & HAIR COLOR</legend><div class="studioOptionGrid">${studioColorField('face_skin','SKIN TONE',NATURAL_SKIN_TONES,av.skin,'skin')+studioColorField('face_hair','HAIR COLOR',NATURAL_HAIR_COLORS,av.hair,'hair')}</div></fieldset>`;
 const assetControlGroups=[
  ['FACE & HAIR',[['style','HAIRSTYLE'],['face','FACE SHAPE'],['eyes','EYE SHAPE'],['brows','EYEBROWS'],['eyeColor','EYE COLOR'],['nose','NOSE'],['lips','LIPS'],['beard','FACIAL HAIR']]],
  ['BODY',[['body','BUILD'],['stature','HEIGHT STYLE'],['exaggeration','FUNNY SCALE']]],
  ['PERSONAL DETAILS',[['accessory','ACCESSORY'],['freckles','FRECKLES'],['scar','SCARS'],['tattoo','TATTOOS']]]
 ];
 const assetControls=assetControlGroups.map(([title,controls])=>`<fieldset class="studioControlGroup"><legend>${title}</legend><div class="studioOptionGrid">${controls.map(([id,name])=>`<label>${name}<select class="choice" id="face_${id}">${studioNumberOptions(id,av[id]??0)}</select></label>`).join('')}</div></fieldset>`).join('');
 const defenceTier=Math.max(1,Math.min(5,Number(SPECIALS.abilityLevel(player,'defence'))||1));
 const existingDefence=player.superAbility?.type==='defence';
 const verifiedSpecializationCap=ABILITIES.verifiedSpecializationMaxLevel(player);
 const defenceChoices=(player.role==='DF'||existingDefence)?ABILITIES.studioDefenceChoices(player,defenceTier).filter(move=>ABILITIES.canEquipVerifiedFieldSpecial(player,{kind:'defence',level:defenceTier})):[];
 const defenceSelector=!studioManagerContext&&(player.role==='DF'||existingDefence)? `<div class="panel"><h3>SUPER DEFENCE</h3><div id="studioDefIcon">${ABILITY_ICONS.icon('defence',existingDefence?player.superAbility.id:null)}</div><p class="muted">New Super Defence choices require source-verified Gold or higher and obey Gold 1–2, Star 1–3, Superstar 1–5. Existing equipment can be kept or removed. Wall families share one short-lived barrier and the grounded SHOOT-slide counter.</p><label>DEFENCE TIER<select class="choice" id="studioDefTier">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===defenceTier?'selected':''} ${n>verifiedSpecializationCap&&n!==defenceTier?'disabled':''}>${n}${n>verifiedSpecializationCap?' · verified tier required':''}</option>`).join('')}</select></label><label>ABILITY<select class="choice" id="studioDefAbility"><option value="keep">KEEP CURRENT${existingDefence?' · '+escapeHTML(player.superAbility.name||player.superAbility.id||'saved ability'):''}</option><option value="none">REMOVE DEFENCE</option>${defenceChoices.map(a=>`<option value="${escapeHTML(a.id)}">${escapeHTML(a.name)}</option>`).join('')}</select></label><p class="muted" id="studioDefTierGuide" role="status" aria-live="polite">${escapeHTML(studioDefenceTierGuide(defenceTier,defenceChoices,player))}</p><div class="row">${button('SAVE DEFENCE ABILITY','saveStudioDefence')}</div><p class="muted" id="studioDefSaveState" role="status" aria-live="polite">Super Defence changes are ready to save.</p></div>`:'';
 const keeperDefenceTier=Math.max(1,Math.min(5,Number(SPECIALS.abilityLevel(player,'keeper'))||1));
 const existingKeeperDefence=player.gkSuperAbility?.type==='defence';
 const keeperDefenceChoices=(player.role==='GK'||existingKeeperDefence)?ABILITIES.studioKeeperChoices(player,keeperDefenceTier).filter(move=>ABILITIES.canEquipVerifiedKeeperSpecial(player,{level:keeperDefenceTier})):[];
 const keeperDefenceSelector=!studioManagerContext&&(player.role==='GK'||existingKeeperDefence)?`<div class="panel"><h3>GOALKEEPER SUPER DEFENCE</h3><div id="studioKeeperDefIcon">${ABILITY_ICONS.icon('defence',existingKeeperDefence?player.gkSuperAbility.id:null)}</div><p class="muted">New goalkeeper moves require source-verified Gold or higher and obey Gold 1–2, Star 1–3, Superstar 1–5. Goalkeeper and field Super Shot/Super Defence share one exclusive specialization slot. Existing keeper equipment can be kept or removed; automatic basic saves remain available.</p><label for="studioKeeperDefTier">GOALKEEPER DEFENCE LEVEL<select class="choice" id="studioKeeperDefTier">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===keeperDefenceTier?'selected':''} ${n>verifiedSpecializationCap&&n!==keeperDefenceTier?'disabled':''}>${n}${n>verifiedSpecializationCap?' · verified tier required':''}</option>`).join('')}</select></label><label for="studioKeeperDefAbility">GOALKEEPER MOVE<select class="choice" id="studioKeeperDefAbility"><option value="keep">KEEP CURRENT${existingKeeperDefence?' · '+escapeHTML(player.gkSuperAbility.name||player.gkSuperAbility.id||'saved ability'):''}</option><option value="none">REMOVE GOALKEEPER DEFENCE</option>${keeperDefenceChoices.map(move=>`<option value="${escapeHTML(move.id)}">${escapeHTML(move.name)}</option>`).join('')}</select></label><p class="muted" id="studioKeeperDefTierGuide" role="status" aria-live="polite">${escapeHTML(studioKeeperDefenceTierGuide(keeperDefenceTier,keeperDefenceChoices,player))}</p><div class="row">${button('SAVE GOALKEEPER DEFENCE','saveStudioKeeperDefence')}</div><p class="muted" id="studioKeeperDefSaveState" role="status" aria-live="polite">Goalkeeper Super Defence changes are ready to save.</p></div>`:'';
 const currentShotLevel=SPECIALS.abilityLevel(player,'shot');
 const shotSelector=!studioManagerContext&&ABILITIES.studioShotEligibility(player,studioEliteEligible(player)).canManage?`<div class="panel"><h3>SUPER SHOT</h3><div id="studioShotIcon">${ABILITY_ICONS.icon('shot',player.superAbility?.type==='shoot'?player.shot:null)}</div><label>SHOT LEVEL<select class="choice" id="studioShotTier">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===currentShotLevel?'selected':''} ${n>verifiedSpecializationCap&&n!==currentShotLevel?'disabled':''}>${n}${n>verifiedSpecializationCap?' · verified tier required':''}</option>`).join('')}</select></label><label>SHOT TYPE<select class="choice" id="studioShotAbility"><option value="keep" selected>KEEP CURRENT${player.superAbility?.type==='shoot'?' · '+escapeHTML(player.superAbility.name||player.superAbility.id||player.shot||'saved shot'):''}</option><option value="none">REMOVE SUPER SHOT</option>${(ABILITIES.canEquipVerifiedFieldSpecial(player,{kind:'shot',level:1})?Object.entries(SHOTS).filter(([id])=>tokenWallet.owns('superShot',id)||player.shot===id):[]).map(([id,shot])=>`<option value="${escapeHTML(id)}">${escapeHTML(shot.name||id)}</option>`).join('')}</select></label><p class="muted">Buy shot unlocks in Store &amp; Tokens. Verified role/tier eligibility is still required.</p><p class="muted" id="studioShotGuide" role="status" aria-live="polite">${escapeHTML(studioShotPreviewGuide('keep',player.superAbility?.type==='shoot'?player.shot:null,currentShotLevel))}</p><div class="row">${button('SAVE SUPER SHOT','saveStudioShot')}</div><p class="muted" id="studioShotSaveState" role="status" aria-live="polite">Super Shot changes are ready to save.</p></div>`:'';
 const currentDribble=typeof player.dribbleType==='string'?player.dribbleType:DRIBBLES.assignedDribbleType(player);
 const currentDribbleName=DRIBBLES.DRIBBLE_STYLES.find(style=>style.id===currentDribble)?.name||currentDribble;
 const dribbleSelector=!studioManagerContext&&player.role!=='GK'?`<div class="panel"><h3>DRIBBLE STYLE</h3><div id="studioDribbleIcon">${ABILITY_ICONS.icon('dribble',currentDribble)}</div><p class="muted">Basic DRIBBLE remains available to every player. Unique Dribble Styles require source-verified canonical Gold or higher; existing and unknown saved styles can be kept or removed.</p><label>STYLE<select class="choice" id="studioDribble"><option value="keep" selected>KEEP CURRENT · ${escapeHTML(currentDribbleName)}</option><option value="none">REMOVE SAVED STYLE</option>${DRIBBLES.DRIBBLE_STYLES.map(a=>`<option value="${escapeHTML(a.id)}" ${a.id!=='sideStep'&&!studioVerifiedDribbleEligible(player)&&a.id!==player.dribbleType?'disabled':''}>${escapeHTML(a.name||a.id)}${a.id!=='sideStep'&&!studioVerifiedDribbleEligible(player)?' · verified Gold+ required':''}</option>`).join('')}</select></label><p class="muted" id="studioDribbleGuide" role="status" aria-live="polite">${escapeHTML(studioDribblePreviewGuide('keep',DRIBBLES.DRIBBLE_STYLES,player))}</p><div class="row">${button('SAVE DRIBBLE STYLE','saveStudioTrick')}</div><p class="muted" id="studioDribbleSaveState" role="status" aria-live="polite">Dribble Style changes are ready to save.</p></div>`:'';
 const magicSelector=studioManagerContext?'':player.role!=='GK'?`<div class="panel"><h3>TRICK — RARE MAGIC</h3><div id="studioMagicIcon">${ABILITY_ICONS.icon('trick',player.magicTrick)}</div><p class="muted">Tricks are distinct from dribble styles. With the ball, hold DRIBBLE for 1 second to activate an equipped Magic Trick. Defenders can counter; Tricks have cooldown and Energy cost. KEEP CURRENT is the default; removal requires an explicit choice. Buy new Trick options in Store &amp; Tokens; current tier and role rules remain active.</p><label>TRICK<select class="choice" id="studioMagic"><option value="keep" selected>KEEP CURRENT</option><option value="none">REMOVE MAGIC TRICK</option>${STUDIO_MAGIC_TRICKS.filter(a=>studioMagicEligible(player)&&tokenWallet.owns('magicTrick',a.id)||player.magicTrick===a.id).map(a=>`<option value="${a.id}">${a.name}</option>`).join('')}${studioSpinBumpEligible(player)&&(tokenWallet.owns('magicTrick','spinBump')||player.magicTrick==='spinBump')?'<option value="spinBump">Spin Bump</option>':''}${studioSandTrapEligible(player)&&(tokenWallet.owns('magicTrick','sandTrap')||player.magicTrick==='sandTrap')?'<option value="sandTrap">Sand Trap</option>':''}${studioLightningEligible(player)&&(tokenWallet.owns('magicTrick','lightning')||player.magicTrick==='lightning')?'<option value="lightning">Lightning</option>':''}${studioWindEligible(player)&&(tokenWallet.owns('magicTrick','wind')||player.magicTrick==='wind')?'<option value="wind">Wind</option>':''}${studioMudEligible(player)&&(tokenWallet.owns('magicTrick','mud')||player.magicTrick==='mud')?'<option value="mud">Mud</option>':''}</select></label><p class="muted" id="studioMagicEligibility">${escapeHTML(studioMagicEligibilityGuide(player))}</p><p class="muted" id="studioMagicUnlockProgress">${escapeHTML(studioMagicUnlockProgress(player))}</p><p class="muted" id="studioMagicGuide" role="status" aria-live="polite">${escapeHTML(studioMagicGuide('keep',player.magicTrick))}</p>${studioMagicCounterPlaybook()}<div class="row" id="studioMagicSaveRow">${button('SAVE TRICK SELECTION','saveStudioMagic')}</div><p class="muted" id="studioMagicSaveState" role="status" aria-live="polite">No Magic Trick change to save.</p></div>`:`<div class="panel"><h3>TRICK — READ-ONLY PREVIEW</h3><p class="muted">${escapeHTML(studioMagicEligibilityGuide(player))}</p><label>TRICK (PREVIEW ONLY)<select class="choice" id="studioGKMagicPreview"><option value="" selected>CHOOSE A TRICK TO PREVIEW</option>${STUDIO_MAGIC_TRICK_FULL_CATALOGUE.map(a=>`<option value="${escapeHTML(a.id)}">${escapeHTML(a.name)}</option>`).join('')}</select></label><div id="studioGKMagicIcon">${ABILITY_ICONS.icon('trick',null)}</div><p class="muted" id="studioGKMagicGuide" role="status" aria-live="polite">${escapeHTML(studioGoalkeeperMagicGuide(''))}</p>${studioMagicCounterPlaybook()}</div>`;
 studioGallerySignature='';
 page(studioManagerContext?'MANAGER APPEARANCE':'PLAYER CUSTOMIZATION',studioManagerContext?'Create a persistent manager portrait. It is stored separately from every player record.':'Every player has a persistent, editable HD caricature. Modify facial structure, funny exaggeration, hair, expressions and personal details.',`<p class="muted studioGamepadHint">Gamepad: D-pad or left stick moves focus. Left/right changes a focused selection or slider. A activates; B goes back.</p><div class="twoCol"><div class="panel">${studioManagerContext?'<p class="muted">MANAGER · career portrait</p>':studioCareerContext?'':teamField('SELECT CLUB / TEAM TO EDIT','customTeam',nations(),home)}${studioManagerContext?'':field('PLAYER','customPlayer',squad.map((p,i)=>[i,`#${p.num} ${p.name}`]),avatarIndex)}<div class="characterStage"><canvas id="customPortrait" width="300" height="260" role="img" aria-label="${studioManagerContext?'Rotatable manager preview':'Rotatable player preview'}"></canvas><div class="row studioRotateControls"><button type="button" class="btn" data-action="studioLeft" aria-label="Rotate character left 45 degrees">◀ ROTATE</button><strong id="customAngleLabel">${STUDIO_DIRS[studioDirection].label}</strong><button type="button" class="btn" data-action="studioRight" aria-label="Rotate character right 45 degrees">ROTATE ▶</button></div><p class="muted" style="margin:0">Drag the player horizontally to turn • eight views</p><div class="row studioMotionControls"><label class="fieldLabel" for="customPose">PREVIEW MOTION</label><select id="customPose" class="choice">${STUDIO_ACTIONS.map(a=>`<option value="${a}" ${a===studioAction?'selected':''}>${a.toUpperCase()}</option>`).join('')}</select><button type="button" class="btn" data-action="studioSpin">${studioSpin?'■ STOP TURN':'↻ AUTO ROTATE'}</button></div><div>${escapeHTML(studioManagerContext?'Manager':player.name)} · ${studioManagerContext?'CLUB REPRESENTATIVE':player.role}<p>${studioManagerContext?'Career portrait':escapeHTML(player.shotName||'Super shot')}</p></div></div><div class="row">${studioManagerContext?'':button(studioGalleryOpen?'HIDE 8-VIEW GALLERY':'COMPARE ALL 8 VIEWS','studioGalleryToggle')}</div>${!studioManagerContext&&studioGalleryOpen?studioEightViewMarkup():''}<div class="row">${button(studioManagerContext?'✓ SAVE MANAGER LOOK':'✓ SAVE CHARACTER','saveAppearance','gold')}${button('RANDOMIZE FULL LOOK','randomizeFace')}${button('RANDOMIZE HAIR','randomizeHair')}${button('RANDOMIZE FACE DETAILS','randomizeFaceDetails')}${button('RANDOMIZE BODY','randomizeBody')}${button('RANDOMIZE ACCESSORIES','randomizeAccessories')}${button('↶ UNDO RANDOMIZE','studioUndoRandomPreview')}${button('↶ RESET UNSAVED','studioResetAppearance')}${studioManagerContext?button('← MANAGER HUB','manager'):''}</div><p class="muted" id="studioAppearanceSaveState" role="status" aria-live="polite">Appearance changes are ready to save.</p></div><div class="panel"><div class="avatarControls">${colorControls}${assetControls}</div><p class="muted">Customization now uses curated natural skin and hair palettes, exposes every hairstyle and face asset used by the renderer, and adds tattoo choices so the editor matches the drawable character system.</p>${studioManagerContext?'':studioStatControls(player)}${shotSelector}${defenceSelector}${keeperDefenceSelector}${magicSelector}${dribbleSelector}</div></div>`,studioCareerContext?'careerSquad':studioReturnAction);
 const keeperTrickPreview=$('studioGKMagicPreview');
 if(keeperTrickPreview){
  const updateKeeperTrickPreview=()=>{
   const selected=keeperTrickPreview.value;
   const guide=$('studioGKMagicGuide'),icon=$('studioGKMagicIcon');
   if(guide)guide.textContent=studioGoalkeeperMagicGuide(selected);
   if(icon)icon.innerHTML=ABILITY_ICONS.icon('trick',selected||null);
  };
  keeperTrickPreview.addEventListener('change',updateKeeperTrickPreview);
  updateKeeperTrickPreview();
 }
 // Visual-only live previews; select values remain the sole saved source of truth.
 const previewUpdates=Object.create(null);
 for(const [selectId,previewId,category,current] of [
  ['studioShotAbility','studioShotIcon','shot',player.superAbility?.type==='shoot'?player.shot:null],
  ['studioDefAbility','studioDefIcon','defence',player.superAbility?.type==='defence'?player.superAbility.id:null],
  ['studioMagic','studioMagicIcon','trick',player.magicTrick],
  ['studioDribble','studioDribbleIcon','dribble',currentDribble]
 ]){
  const select=$(selectId),target=$(previewId);if(!select||!target)continue;
  const update=()=>{const chosen=select.value==='keep'?current:select.value==='none'?null:select.value;target.innerHTML=ABILITY_ICONS.icon(category,chosen);if(category==='defence'){const state=studioDefenceSaveState(select.value,$('studioDefTier')?.value,player);const save=menu.querySelector('[data-action="saveStudioDefence"]');if(save){save.disabled=state.disabled;save.setAttribute('aria-disabled',String(state.disabled));save.title=state.invalid?'Verified tier and level cap are required for a new Super Defence ability or tier change.':state.unchanged?'No Super Defence change to save.':'Save the selected Super Defence ability.';}const hint=$('studioDefSaveState');if(hint)hint.textContent=state.message;}if(category==='shot'){const guide=$('studioShotGuide');if(guide)guide.textContent=studioShotPreviewGuide(select.value,player.superAbility?.type==='shoot'?player.shot:null,$('studioShotTier')?.value);const state=studioShotSaveState(select.value,$('studioShotTier')?.value,player);const save=menu.querySelector('[data-action="saveStudioShot"]');if(save){save.disabled=state.disabled;save.setAttribute('aria-disabled',String(state.disabled));save.title=state.invalid?'Verified tier and level cap are required for a new Super Shot or tier change.':state.unchanged?'No Super Shot change to save.':'Save the selected Super Shot.';}const hint=$('studioShotSaveState');if(hint)hint.textContent=state.message;}if(category==='trick'){const state=studioMagicSaveState(select.value,current,studioMagicEligible(player));if(select.value==='spinBump')Object.assign(state,studioMagicSaveState(select.value,current,studioSpinBumpEligible(player)));if(select.value==='sandTrap')Object.assign(state,studioMagicSaveState(select.value,current,studioSandTrapEligible(player)));if(select.value==='lightning')Object.assign(state,studioMagicSaveState(select.value,current,studioLightningEligible(player)));if(select.value==='wind')Object.assign(state,studioMagicSaveState(select.value,current,studioWindEligible(player)));if(select.value==='mud')Object.assign(state,studioMagicSaveState(select.value,current,studioMudEligible(player)));const guide=$('studioMagicGuide');if(guide)guide.textContent=studioMagicGuide(select.value,current,!state.locked);const save=$('studioMagicSaveRow')?.querySelector('button');if(save){save.disabled=state.disabled;save.setAttribute('aria-disabled',String(state.disabled));save.title=state.locked?(select.value==='spinBump'||select.value==='sandTrap'||select.value==='lightning'||select.value==='wind'||select.value==='mud'?'Verified canonical Gold tier or higher is required.':'A source-verified canonical Star or Superstar tier is required to equip this Trick.'):state.unchanged?'No Magic Trick change to save.':'Save the selected Magic Trick.';}const hint=$('studioMagicSaveState');if(hint)hint.textContent=state.message;}if(category==='dribble'){const guide=$('studioDribbleGuide');if(guide)guide.textContent=studioDribblePreviewGuide(select.value,DRIBBLES.DRIBBLE_STYLES,player);const state=studioDribbleSaveState(select.value,player,DRIBBLES.DRIBBLE_STYLES);const save=menu.querySelector('[data-action="saveStudioTrick"]');if(save){save.disabled=state.disabled;save.setAttribute('aria-disabled',String(state.disabled));save.title=state.locked?'Verified Gold tier or higher is required for a new unique Dribble Style.':state.invalid?'Choose a valid Dribble Style.':state.unchanged?'No Dribble Style change to save.':'Save the selected Dribble Style.';}const hint=$('studioDribbleSaveState');if(hint)hint.textContent=state.message;}};
  previewUpdates[selectId]=update;
  select.addEventListener('change',update);update();
 }
 const keeperDefenceTierSelect=$('studioKeeperDefTier'),keeperDefenceAbilitySelect=$('studioKeeperDefAbility');
 const keeperDefencePreview=()=>{
  if(!keeperDefenceAbilitySelect)return;
  const choice=keeperDefenceAbilitySelect.value,current=player.gkSuperAbility?.type==='defence'?player.gkSuperAbility.id:null;
  const icon=$('studioKeeperDefIcon');if(icon)icon.innerHTML=ABILITY_ICONS.icon('defence',choice==='keep'?current:choice==='none'?null:choice);
  const state=studioKeeperDefenceSaveState(choice,keeperDefenceTierSelect?.value,player);
  const save=menu.querySelector('[data-action="saveStudioKeeperDefence"]');
  if(save){save.disabled=state.disabled;save.setAttribute('aria-disabled',String(state.disabled));save.title=state.invalid?'Verified goalkeeper tier, role and exclusive specialization eligibility are required.':state.unchanged?'No goalkeeper Super Defence change to save.':'Save the selected goalkeeper Super Defence move.';}
  const hint=$('studioKeeperDefSaveState');if(hint)hint.textContent=state.message;
  const guide=$('studioKeeperDefTierGuide');if(guide)guide.textContent=studioKeeperDefenceTierGuide(keeperDefenceTierSelect?.value,ABILITIES.studioKeeperChoices(player,Number(keeperDefenceTierSelect?.value)).filter(move=>ABILITIES.canEquipVerifiedKeeperSpecial(player,{level:Number(keeperDefenceTierSelect?.value)})),player);
 };
 let keeperDefenceOptionsInitialized=false;
 if(keeperDefenceAbilitySelect)keeperDefenceAbilitySelect.addEventListener('change',keeperDefencePreview);
 if(keeperDefenceTierSelect&&keeperDefenceAbilitySelect)keeperDefenceTierSelect.onchange=()=>{
  const previous=keeperDefenceAbilitySelect.value,level=Number(keeperDefenceTierSelect.value);
  const available=(player.role==='GK'||player.gkSuperAbility?.type==='defence')?ABILITIES.studioKeeperChoices(player,level).filter(move=>ABILITIES.canEquipVerifiedKeeperSpecial(player,{level})):[];
  keeperDefenceAbilitySelect.innerHTML='<option value="keep">KEEP CURRENT</option><option value="none">REMOVE GOALKEEPER DEFENCE</option>'+available.map(move=>`<option value="${escapeHTML(move.id)}">${escapeHTML(move.name)}</option>`).join('');
  if([...keeperDefenceAbilitySelect.options].some(option=>option.value===previous))keeperDefenceAbilitySelect.value=previous;
  else keeperDefenceAbilitySelect.value='keep';
  // Initial option rebuilding is part of rendering the saved state, not an edit.
  // Establish that selection as the form baseline so a clean editor can leave
  // without a false unsaved-changes prompt.
  if(!keeperDefenceOptionsInitialized){for(const option of keeperDefenceAbilitySelect.options)option.defaultSelected=option.selected;keeperDefenceOptionsInitialized=true;}
  keeperDefencePreview();
 };
 if(keeperDefenceTierSelect&&keeperDefenceAbilitySelect)keeperDefenceTierSelect.onchange();
 const shotTierSelect=$('studioShotTier');
 if(shotTierSelect)shotTierSelect.addEventListener('change',()=>previewUpdates.studioShotAbility?.());
 const tierSelect=$('studioDefTier'),abilitySelect=$('studioDefAbility');
 if(tierSelect&&abilitySelect)tierSelect.onchange=()=>{
  const previous=abilitySelect.value;
  const available=(player.role==='DF'||player.superAbility?.type==='defence')?ABILITIES.studioDefenceChoices(player,Number(tierSelect.value)).filter(move=>ABILITIES.canEquipVerifiedFieldSpecial(player,{kind:'defence',level:Number(tierSelect.value)})):[];
  abilitySelect.innerHTML='<option value="keep">KEEP CURRENT</option><option value="none">REMOVE DEFENCE</option>'+available.map(a=>`<option value="${escapeHTML(a.id)}">${escapeHTML(a.name)}</option>`).join('');
  if([...abilitySelect.options].some(o=>o.value===previous))abilitySelect.value=previous;
  else abilitySelect.value='keep'; // A newly locked move must never remain selected.
  previewUpdates.studioDefAbility?.(); // Keep the icon synchronized after rebuilding options.
  const guide=$('studioDefTierGuide');
  if(guide)guide.textContent=studioDefenceTierGuide(Number(tierSelect.value),available,player);
 };
 if(tierSelect&&abilitySelect)tierSelect.onchange(); // Initial options must match displayed tier.
 if(typeof studioUpdateColorPreview==='function'){studioUpdateColorPreview('face_skin');studioUpdateColorPreview('face_hair');}drawCustomizer();}
function getAppearance(){const numeric=['style','face','eyes','brows','eyeColor','nose','lips','body','stature','exaggeration','beard','accessory','freckles','scar','tattoo'];return Object.fromEntries(['skin','hair',...numeric].map(k=>[k,k==='skin'||k==='hair'?$('face_'+k).value:+$('face_'+k).value]))}
// STUDIO-APPEARANCE-RESET-01: revert only the current unsaved visual fields.
// Use the same merged defaults as the editor; never touch equipment, stats or saves.
function studioSavedAppearance(player){return {...avatarFor(player),...(player?.appearance||{})};}
function studioResetUnsavedAppearance(){
 studioLastRandomPreview=null;
 if(!['PLAYER CUSTOMIZATION','MANAGER APPEARANCE'].includes(screen))return false;
 const squad=(typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club?career.roster:roster(home);const player=typeof studioManagerContext!=='undefined'&&studioManagerContext?studioSubject():squad?.[avatarIndex];if(!player)return false;
 const saved=studioSavedAppearance(player),current=getAppearance();
 let changed=false;
 for(const key of Object.keys(current)){
  const field=$('face_'+key),value=saved[key];if(!field||value==null)continue;
  const target=String(value);
  // A legacy option may not be present in the current curated palette.
  if(!Array.from(field.options||[]).some(option=>option.value===target))continue;
  if(field.value!==target){field.value=target;changed=true;}
 }
 if(!changed)return false;
 studioGallerySignature='';if(typeof studioUpdateColorPreview==='function'){studioUpdateColorPreview('face_skin');studioUpdateColorPreview('face_hair');}drawCustomizer();
 const hint=$('studioAppearanceSaveState');
 if(hint)hint.textContent='Unsaved appearance edits reverted; nothing was saved.';
 return true;
}
// STUDIO-RANDOM-OPTIONS-01: choose real enabled option values, not numeric indexes.
// This is an unsaved preview only; SAVE CHARACTER remains the sole persistence action.
function studioRandomizeUnsavedAppearance(random=Math.random,keys=null){
 if(!['PLAYER CUSTOMIZATION','MANAGER APPEARANCE'].includes(screen))return false;
 const squad=(typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club?career.roster:roster(home);if(typeof studioManagerContext!=='undefined'&&studioManagerContext?!studioSubject():!squad?.[avatarIndex])return false;
 let changed=false;
 const changes=[];
 for(const key of keys||Object.keys(getAppearance())){
  const field=$('face_'+key);if(!field?.options)continue;
  const options=Array.from(field.options).filter(option=>!option.disabled&&!option.parentElement?.disabled&&option.value!==''&&option.value!==field.value);
  if(!options.length)continue;
  const roll=Number(random()),index=Math.min(options.length-1,Math.max(0,Math.floor((Number.isFinite(roll)?roll:0)*options.length)));
  const before=field.value;field.value=options[index].value;changes.push({key,before,after:field.value});changed=true;
 }
 if(!changed){
  const hint=$('studioAppearanceSaveState');
  if(hint)hint.textContent='No alternate appearance options available for this selection. Nothing saved yet.';
  return false;
 }
 studioLastRandomPreview={subjectId:String((typeof studioManagerContext!=='undefined'&&studioManagerContext?studioSubject():squad[avatarIndex])?.id??''),home,avatarIndex,manager:!!(typeof studioManagerContext!=='undefined'&&studioManagerContext),changes};
 studioGallerySignature='';if(typeof studioUpdateColorPreview==='function'){studioUpdateColorPreview('face_skin');studioUpdateColorPreview('face_hair');}drawCustomizer();
 const hint=$('studioAppearanceSaveState');
 if(hint)hint.textContent=(keys?'Selected appearance previewed':'Random look previewed')+'; press SAVE CHARACTER to keep it. Nothing saved yet.';
 return true;
}
let studioLastRandomPreview=null;
// STUDIO-HAIR-RANDOM-01: change hairstyle and hair color only; preserve face, skin,
// body, tattoos and all other appearance fields until an explicit save.
function studioRandomizeHairUnsaved(random=Math.random){
 return studioRandomizeUnsavedAppearance(random,['style','hair']);
}
// Change facial features only. Hair, skin, body and tattoos stay untouched until SAVE CHARACTER.
function studioRandomizeFaceDetailsUnsaved(random=Math.random){
 return studioRandomizeUnsavedAppearance(random,['face','eyes','brows','eyeColor','nose','lips','beard','freckles','scar']);
}
// STUDIO-BODY-RANDOM-01: change physique only; face, hair, skin and tattoos are preserved.
function studioRandomizeBodyUnsaved(random=Math.random){
 return studioRandomizeUnsavedAppearance(random,['body','stature','exaggeration']);
}
// STUDIO-ACCESSORY-RANDOM-01: unsaved accessory and tattoo preview only.
function studioRandomizeAccessoriesUnsaved(random=Math.random){
 return studioRandomizeUnsavedAppearance(random,['accessory','tattoo']);
}
// Restore only the last randomized fields, preserving manual edits made afterwards.
function studioUndoRandomPreview(){
 if(!['PLAYER CUSTOMIZATION','MANAGER APPEARANCE'].includes(screen)||!studioLastRandomPreview)return false;
 const squad=(typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club?career.roster:roster(home);
 const subject=typeof studioManagerContext!=='undefined'&&studioManagerContext?studioSubject():squad?.[avatarIndex];
 if(!subject||String(subject.id??'')!==studioLastRandomPreview.subjectId||home!==studioLastRandomPreview.home||avatarIndex!==studioLastRandomPreview.avatarIndex||!!(typeof studioManagerContext!=='undefined'&&studioManagerContext)!==studioLastRandomPreview.manager){studioLastRandomPreview=null;return false;}
 const last=studioLastRandomPreview;studioLastRandomPreview=null;
 let reverted=false;
 for(const {key,before,after} of last.changes){const field=$('face_'+key);if(field?.value===after){field.value=before;reverted=true;}}
 if(!reverted)return false;
 studioGallerySignature='';if(typeof studioUpdateColorPreview==='function'){studioUpdateColorPreview('face_skin');studioUpdateColorPreview('face_hair');}drawCustomizer();
 const hint=$('studioAppearanceSaveState');if(hint)hint.textContent='Last randomized preview undone; no changes saved.';
 return true;
}
function studioAppearanceSaveState(previous,appearance){
 const unchanged=!!(previous&&typeof previous==='object'&&!Array.isArray(previous)&&
  Object.keys(previous).length===Object.keys(appearance).length&&
  Object.keys(appearance).every(key=>Object.hasOwn(previous,key)&&Object.is(previous[key],appearance[key])));
 return {disabled:unchanged,message:unchanged?
  'Appearance already saved. No changes to apply.':
  'Appearance changes are ready to save.'};
}
function drawCustomizer(){
 const canvas=$('customPortrait');if(!canvas)return;
 const ctx=canvas.getContext('2d'),p=typeof studioManagerContext!=='undefined'&&studioManagerContext?studioSubject():((typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club?career.roster:roster(home))[avatarIndex];if(!p)return;
 const pose=$('customPose')?.value||studioAction;
 const dir=STUDIO_DIRS[studioDirection],action=pose==='run'?'idle':pose;
 const tm=performance.now()/1000,run=pose==='run',canvW=canvas.width,canvH=canvas.height;
 ctx.clearRect(0,0,canvW,canvH);
 const gr=ctx.createLinearGradient(0,0,canvW,canvH);gr.addColorStop(0,'#27666e');gr.addColorStop(1,'#0b2741');ctx.fillStyle=gr;ctx.fillRect(0,0,canvW,canvH);
 ctx.save();ctx.strokeStyle='#c5efed38';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(150,236,78,12,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 const appearance=getAppearance();
 const saveState=studioAppearanceSaveState(p.appearance,appearance),lockedAppearance=studioAppearanceUnlockIssues(studioSavedAppearance(p),appearance);
 const saveButton=menu.querySelector('[data-action="saveAppearance"]');
 if(saveButton){
  saveButton.disabled=saveState.disabled||lockedAppearance.length>0;
  saveButton.setAttribute('aria-disabled',String(saveButton.disabled));
  saveButton.title=lockedAppearance.length?`Locked appearance items: ${lockedAppearance.join(', ')}. Unlock them in Store & Tokens.`:saveState.disabled?'No appearance changes to save.':'Save appearance changes.';
 }
 const resetButton=menu.querySelector('[data-action="studioResetAppearance"]');
 if(resetButton){
  const saved=studioSavedAppearance(p);
  const dirty=Object.keys(appearance).some(key=>!Object.is(saved[key],appearance[key]));
  resetButton.disabled=!dirty;
  resetButton.setAttribute('aria-disabled',String(!dirty));
  resetButton.title=dirty?'Revert unsaved visual edits.':'Appearance matches the current player.';
 }
 const saveHint=$('studioAppearanceSaveState');
 if(saveHint)saveHint.textContent=lockedAppearance.length?`Unlock these selections in Store & Tokens before saving: ${lockedAppearance.join(', ')}.`:saveState.message;
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
 // Keep the active direction visible even during drag and auto-rotation.
 const gallery=$('studioEightViewGallery');
 gallery?.querySelectorAll('[data-studio-pick]').forEach(button=>{
  const pressed=String(Number(button.dataset.studioPick)===studioDirection);
  if(button.getAttribute('aria-pressed')!==pressed)button.setAttribute('aria-pressed',pressed);
 });
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
  const isCareer=!!((typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club);
  const source=isCareer?career.roster.map(p=>({...p})):roster(home);
  const player=source?.[avatarIndex],id=$('studioShotAbility')?.value,tier=Number($('studioShotTier')?.value);
  if(!player)throw Error('Super Shot player no longer exists');
  if(!id||!['keep','none'].includes(id)&&!Object.hasOwn(SHOTS,id))throw Error('Unknown Super Shot');
  if(id!=='keep'&&id!=='none'&&id!==player.shot&&!tokenWallet.owns('superShot',id))throw Error('Unlock this Super Shot in Store & Tokens before equipping it');
  const state=studioShotSaveState(id,tier,player);
  if(state.invalid)throw Error(state.message);
  if(state.unchanged){showPlayerStudio(avatarIndex);return;}
  const currentLevel=Number(SPECIALS.abilityLevel(player,'shot'))||1,nextTier=id==='none'?currentLevel:tier;
  if(id!=='none'&&(id!=='keep'||tier!==currentLevel)&&!ABILITIES.canEquipVerifiedFieldSpecial(player,{kind:'shot',level:tier}))
   throw Error('New Super Shots and level changes require verified Gold 1–2, Star 1–3, or Superstar 1–5 eligibility');
  const updated=ABILITIES.withStudioShot(player,id,nextTier,SHOTS,studioEliteEligible(player));
  if(id==='none'&&!Object.hasOwn(player,'superShotLevel'))delete updated.superShotLevel;
  // Validate first: unchanged explicit Shot equipment must not rewrite Career/club saves.
  // Missing legacy level, shot ID or name still persists on the first explicit selection.
  const sameAbility=player.superAbility===updated.superAbility||(
   !!player.superAbility&&!!updated.superAbility&&
   Object.keys(player.superAbility).length===Object.keys(updated.superAbility).length&&
   Object.keys(player.superAbility).every(key=>Object.is(player.superAbility[key],updated.superAbility[key]))
  );
  if(player.superShotLevel===updated.superShotLevel&&Object.is(player.shot,updated.shot)&&
     Object.is(player.shotName,updated.shotName)&&sameAbility){showPlayerStudio(avatarIndex);return;}
  source[avatarIndex]=updated;
  if(isCareer){const next={...career,roster:source};if(!storeCharacterChanges('managerCareer',next))return;career=next;saveCareer();}
  else{const next={...edits,[TEAMS[home].id]:source};if(!storeCharacterChanges('edits',next))return;edits=next;}
  showPlayerStudio(avatarIndex);
 }catch(error){alert('Cannot save Super Shot: '+error.message)}
}
const STUDIO_MAGIC_TRICKS=Object.freeze([
 {id:'banana',name:'Banana Peel'},{id:'ice',name:'Ice Patch'},{id:'bat',name:'Bat Strike'},
 {id:'fireball',name:'Fireball'},{id:'freeze',name:'Freeze'},{id:'scream',name:'Scream'},
 {id:'hideBall',name:'Hide Ball'},{id:'teleport',name:'Teleport'},{id:'shoulderRide',name:'Shoulder Ride'}
]);
const STUDIO_SPIN_BUMP_TRICK=Object.freeze({id:'spinBump',name:'Spin Bump'});
const STUDIO_SAND_TRAP_TRICK=Object.freeze({id:'sandTrap',name:'Sand Trap'});
const STUDIO_MAGIC_TRICK_CATALOGUE=Object.freeze([...STUDIO_MAGIC_TRICKS,STUDIO_SPIN_BUMP_TRICK]);
const STUDIO_MAGIC_TRICK_VISUAL_CATALOGUE=Object.freeze([...STUDIO_MAGIC_TRICK_CATALOGUE,STUDIO_SAND_TRAP_TRICK]);
const STUDIO_LIGHTNING_TRICK=Object.freeze({id:'lightning',name:'Lightning'});
const STUDIO_MAGIC_TRICK_SUMMARY_CATALOGUE=Object.freeze([...STUDIO_MAGIC_TRICK_VISUAL_CATALOGUE,STUDIO_LIGHTNING_TRICK]);
const STUDIO_WIND_TRICK=Object.freeze({id:'wind',name:'Wind'});
const STUDIO_MUD_TRICK=Object.freeze({id:'mud',name:'Mud'});
const STUDIO_MAGIC_TRICK_FULL_CATALOGUE=Object.freeze([...STUDIO_MAGIC_TRICK_SUMMARY_CATALOGUE,STUDIO_WIND_TRICK,STUDIO_MUD_TRICK]);
// Read-only, accessible Magic Trick preview. Descriptions mirror the current engine;
 // choosing KEEP CURRENT or REMOVE never mutates the roster until SAVE is pressed.
const STUDIO_MAGIC_TRICK_GUIDES=Object.freeze({
 banana:'Drops a peel behind the carrier. It arms after 0.25 seconds and trips a grounded rival; an opposing SHOOT-slide can clear it.',
 ice:'Leaves a short-lived ice patch behind the carrier. It arms after 0.30 seconds and briefly stuns a grounded rival; an opposing SHOOT-slide can clear it.',
 bat:'Briefly staggers the nearest opponent in close range. A timed defensive SHOOT-slide parries the bat while grounded; JUMP above the swing to evade it; a strong defender approaching and facing the carrier can also counter.',
 fireball:'Briefly staggers the nearest opponent at medium range. JUMP above the strike to dodge it, or time a grounded defensive SHOOT-slide to duck under it; a strong defender approaching and facing the carrier can also counter.',
 freeze:'Briefly freezes the nearest opponent in close range. JUMP above the freezing pulse to dodge it, or time a grounded defensive SHOOT-slide to cut through it; a strong defender approaching and facing the carrier can also counter.',
 scream:'Briefly staggers the nearest opponent in a wider radius. JUMP above the shockwave to dodge it, or time a grounded defensive SHOOT-slide to slide under it; a strong defender approaching and facing the carrier can also counter.',
 hideBall:'Briefly protects the carried ball. A nearby grounded defender facing the carrier can interrupt the cast with a timed PASS poke; a strong defender approaching and facing the carrier can also counter.',
 teleport:'Moves the carrier a short distance forward within the pitch. A timed grounded SHOOT-slide in the forward travel lane intercepts the teleport; a strong defender approaching and facing the carrier can also counter.',
 shoulderRide:'Carry a nearby non-goalkeeper teammate on your shoulder while moving the ball a short distance. Opponent contact, lost possession, or the touchline stops the move; normal player collisions remain active.',
 spinBump:'Briefly bumps a close opponent away and stuns them. A grounded defensive SHOOT-slide or JUMP counters it; a stronger defender closing in can also stop it. The Trick has a 6-second cooldown.',
 sandTrap:'Sinks a close opponent into a brief sand snare and stun. A grounded defensive SHOOT-slide or JUMP counters it; a stronger defender closing in can also stop the Trick. It shares the 6-second Magic Trick cooldown.',
 lightning:'After a short windup, jolts the nearest rival within 95 units and briefly stuns them. JUMP, an active grounded SHOOT-slide, or a facing and closing defender with enough defence can counter it. Stun interrupts the caster; cooldown is 6 seconds.',
 wind:'Pushes the nearest rival within 120 units 28 units away. A grounded defensive SHOOT-slide or JUMP counters it; a facing, closing defender with enough defence can also stop it. It shares the 6-second Magic Trick cooldown.',
 mud:'Slows the nearest rival within 100 units for 0.52 seconds. It cannot reapply while that rival is already slowed. A grounded defensive SHOOT-slide or JUMP counters it; a facing, closing defender with enough defence can also stop it. It shares the 6-second Magic Trick cooldown.'
});
// STUDIO-COUNTER-PLAYBOOK-01: read-only reference for outfield and GK Studio.
// Reuse the selected Trick guides so every counter description stays aligned.
function studioMagicCounterPlaybook(){
 return `<details id="studioMagicCounterPlaybook" class="studioCounterPlaybook"><summary>DEFENDER COUNTER PLAYBOOK · ${STUDIO_MAGIC_TRICK_FULL_CATALOGUE.length} TRICKS</summary><p class="muted">PASS, SHOOT, JUMP and physical contact provide the listed defensive counters; DRIBBLE activates an equipped Trick. No extra gameplay button or saved setting.</p><ul>${STUDIO_MAGIC_TRICK_FULL_CATALOGUE.map(trick=>`<li><strong>${escapeHTML(trick.name)}</strong> — ${escapeHTML(STUDIO_MAGIC_TRICK_GUIDES[trick.id])}</li>`).join('')}</ul></details>`;
}
// STUDIO-MAGIC-SAVE-STATE-01: no-op selections should never look actionable.
function studioMagicSaveState(choice,equipped,eligible){
 const locked=!eligible&&choice!=='keep'&&choice!=='none';
 const unchanged=choice==='keep'||(choice==='none'&&!equipped)||choice===equipped;
 return {locked,unchanged,disabled:locked||unchanged,message:locked?'Magic Trick locked: source-verified canonical Star or Superstar tier is required for this selection.':unchanged?'No Magic Trick change to save.':'Magic Trick change ready to save.'};
}
function studioMagicGuide(choice,equipped,eligible=true){
 if(choice==='none')return equipped
  ?'REMOVE selected. The equipped Magic Trick stays active until SAVE TRICK SELECTION is pressed.'
  :'No Magic Trick is equipped to remove. Saving this choice will not equip a Trick.';
 if(choice==='keep'&&!equipped)return 'No Magic Trick equipped. KEEP CURRENT leaves the player unchanged.';
 const id=choice==='keep'?equipped:choice;
 const guide=STUDIO_MAGIC_TRICK_GUIDES[id];
 if(!guide)return 'Unknown saved Trick. KEEP CURRENT preserves the existing equipment.';
 // STUDIO-TRICK-HELP-01: make the existing four-button activation discoverable
 // alongside the selected Trick and its counter, without introducing a fifth control.
 const instructions=' In a match, carry the ball and hold DRIBBLE for 1 second to trigger the equipped Trick (cooldown applies).';
 if(choice==='keep')return 'Equipped Trick: '+guide+instructions+' KEEP CURRENT leaves the player unchanged.';
 if(id==='spinBump'&&!eligible)return 'Locked preview: '+guide+instructions+' Spin Bump requires source-verified canonical-position Gold tier or higher. An OVR number alone does not unlock this Trick.';
 if(id==='sandTrap'&&!eligible)return 'Locked preview: '+guide+instructions+' Sand Trap requires source-verified canonical-position Gold tier or higher. An OVR number alone does not unlock this Trick.';
 if(id==='lightning'&&!eligible)return 'Locked preview: '+guide+instructions+' Lightning requires source-verified canonical-position Gold tier or higher. An OVR number alone does not unlock this Trick.';
 if(id==='wind'&&!eligible)return 'Locked preview: '+guide+instructions+' Wind requires source-verified canonical-position Gold tier or higher. An OVR number alone does not unlock this Trick.';
 if(id==='mud'&&!eligible)return 'Locked preview: '+guide+instructions+' Mud requires source-verified canonical-position Gold tier or higher. An OVR number alone does not unlock this Trick.';
 if(!eligible)return 'Locked preview: '+guide+instructions+' A source-verified canonical Star or Superstar tier is required to equip this Trick.';
 return 'Preview only: '+guide+instructions+' Press SAVE TRICK SELECTION to equip this Trick.';
}
function studioMagicEligibilityGuide(player){
 if(player?.role==='GK')return 'Goalkeepers cannot equip Magic Tricks. Trick previews are informational only; no Trick can be saved for this position.';
 if(typeof studioSpinBumpEligible==='function'&&studioSpinBumpEligible(player)||typeof studioSandTrapEligible==='function'&&studioSandTrapEligible(player)||typeof studioLightningEligible==='function'&&studioLightningEligible(player)||typeof studioWindEligible==='function'&&studioWindEligible(player)||typeof studioMudEligible==='function'&&studioMudEligible(player))return 'Spin Bump, Sand Trap, Lightning, Wind, and Mud require source-verified canonical Gold tier or higher; an OVR number alone never unlocks equipment. Other Magic Tricks require a source-verified Star or Superstar tier.';
 if(studioMagicEligible(player))return 'Eligible for older Magic Tricks: source-verified canonical Star or Superstar. Spin Bump, Sand Trap, Lightning, Wind, and Mud require source-verified canonical Gold tier or higher.';
 if(player?.magicTrick)return 'Existing equipped Trick is preserved for save compatibility. You may keep or remove it; new older Tricks require verified canonical Star or Superstar, while newer Tricks require verified canonical Gold or higher.';
 return 'Magic Tricks are locked for this player. Preview any Trick and its counter without equipping; older Tricks require source-verified canonical Star or Superstar, while Spin Bump, Sand Trap, Lightning, Wind, and Mud require source-verified canonical Gold or higher. Normal DRIBBLE controls remain available.';
}
// STUDIO-TRICK-PROGRESS-01: show both eligibility paths without modifying player data.
function studioMagicUnlockProgress(player){
 if(!player||player.role==='GK')return 'Magic Trick equipment is unavailable to goalkeepers.';
 const tier=verifiedRatingTierForPlayer(player);
 if(tier==='Gold'||tier==='Star'||tier==='Superstar')return 'Source-verified canonical tier: '+tier+'. Gold+ Tricks are available; older Magic Tricks require Star or Superstar.';
 return 'No verified canonical Gold tier is available. New Tricks are locked; any existing Trick can be kept or removed.';
}
function studioGoalkeeperMagicGuide(id){
 const description=Object.prototype.hasOwnProperty.call(STUDIO_MAGIC_TRICK_GUIDES,id)?STUDIO_MAGIC_TRICK_GUIDES[id]:null;
 return description
  ?'Goalkeeper preview only: '+description+' Outfield ball carriers hold DRIBBLE for 1 second to activate the Trick; goalkeepers cannot equip it.'
  :'Choose any Magic Trick to inspect its effect and counter. Goalkeepers cannot equip Magic Tricks.';
}
function saveStudioMagic(){
 try{
  const isCareer=!!((typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club),source=isCareer?career.roster.map(p=>({...p})):roster(home);
  const player=source?.[avatarIndex],id=$('studioMagic')?.value;
  if(!player||player.role==='GK')throw Error('Only eligible outfield players can equip Tricks');
  if(!id||id!=='keep'&&id!=='none'&&!STUDIO_MAGIC_TRICKS.some(t=>t.id===id)&&id!=='spinBump'&&id!=='sandTrap'&&id!=='lightning'&&id!=='wind'&&id!=='mud')throw Error('Unknown Trick');
  if(id!=='keep'&&id!=='none'&&id!==player.magicTrick&&!tokenWallet.owns('magicTrick',id))throw Error('Unlock this Trick in Store & Tokens before equipping it');
  if(id==='spinBump'||id==='sandTrap'||id==='lightning'||id==='wind'||id==='mud'){
   const eligible=id==='spinBump'?studioSpinBumpEligible(player):id==='sandTrap'?studioSandTrapEligible(player):id==='lightning'?studioLightningEligible(player):id==='wind'?studioWindEligible(player):studioMudEligible(player);if(!eligible)throw Error(({spinBump:'Spin Bump',sandTrap:'Sand Trap',lightning:'Lightning',wind:'Wind',mud:'Mud'})[id]+' requires source-verified canonical-position Gold tier or higher');
  }else if(id!=='keep'&&id!=='none'&&!studioMagicEligible(player))throw Error('Tricks require a source-verified canonical Star or Superstar tier');
  if(id==='keep'||(id==='none'&&!player.magicTrick)||id===player.magicTrick){showPlayerStudio(avatarIndex);return;} // Unchanged selections must not rewrite Career or club saves.
  const updated={...player};if(id==='none')delete updated.magicTrick;else updated.magicTrick=id;
  source[avatarIndex]=updated;
  if(isCareer){const next={...career,roster:source};if(!storeCharacterChanges('managerCareer',next))return;career=next;saveCareer();}
  else{const next={...edits,[TEAMS[home].id]:source};if(!storeCharacterChanges('edits',next))return;edits=next;}
  showPlayerStudio(avatarIndex);
 }catch(error){alert('Cannot save magic Trick: '+error.message)}
}
function saveStudioTrick(){
 try{
  const isCareer=!!((typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club);
  const source=isCareer?career.roster.map(p=>({...p})):roster(home);
  if(!source?.[avatarIndex])throw Error('No selected player');
  const prior=source[avatarIndex],id=$('studioDribble')?.value,state=studioDribbleSaveState(id,prior,DRIBBLES.DRIBBLE_STYLES);
  if(state.invalid)throw Error(state.message);
  if(state.unchanged){showPlayerStudio(avatarIndex);return;}
  let equipped;
  if(id==='keep'){showPlayerStudio(avatarIndex);return;}
  if(id==='none'){equipped={...prior};delete equipped.dribbleType;}
  else{
   if(id!=='sideStep'&&!studioVerifiedDribbleEligible(prior))throw Error('Unique Dribble Styles require source-verified canonical Gold tier or higher');
   equipped=DRIBBLES.withStudioDribble(prior,id);
  }
  // Validate first, then avoid rewriting Career/club saves for unchanged explicit equipment.
  // A legacy player without an explicit style still persists their first choice.
  if(equipped.dribbleType===source[avatarIndex].dribbleType){showPlayerStudio(avatarIndex);return;}
  source[avatarIndex]=equipped;
  if(isCareer){const updated={...career,roster:source};if(!storeCharacterChanges('managerCareer',updated))return;career=updated;saveCareer();}
  else{const updated={...edits,[TEAMS[home].id]:source};if(!storeCharacterChanges('edits',updated))return;edits=updated;}
  showPlayerStudio(avatarIndex);
 }catch(error){alert('Cannot save dribble style: '+error.message)}
}
function saveStudioDefence(){
 try{
  const isCareer=!!((typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club);
  const source=isCareer?career.roster.map(p=>({...p})):roster(home);
  if(!source?.[avatarIndex])throw Error('No selected player');
  const prior=source[avatarIndex],ability=$('studioDefAbility')?.value,tier=Number($('studioDefTier')?.value);
  if(!ability)throw Error('Select a defender ability');
  const state=studioDefenceSaveState(ability,tier,prior);
  if(state.invalid)throw Error(state.message);
  if(state.unchanged){showPlayerStudio(avatarIndex);return;}
  const currentLevel=Number(SPECIALS.abilityLevel(prior,'defence'))||1,nextTier=ability==='none'?currentLevel:tier;
  if(ability!=='none'&&(ability!=='keep'||prior.superAbility?.type==='defence'&&tier!==currentLevel)&&
    !ABILITIES.canEquipVerifiedFieldSpecial(prior,{kind:'defence',level:tier}))
   throw Error('New Super Defence abilities and level changes require verified Gold 1–2, Star 1–3, or Superstar 1–5 eligibility');
  if(ability!=='keep'&&ability!=='none'&&!ABILITIES.studioDefenceChoices(prior,nextTier).some(a=>a.id===ability))
   throw Error('This defender is not eligible for that ability');
  let equipped;
  if(ability==='keep'&&prior.superAbility?.type!=='defence')equipped={...prior};
  else if(ability==='none'){
   equipped=ABILITIES.withStudioDefence(prior,ability,nextTier);
   if(!Object.hasOwn(prior,'superDefenceLevel'))delete equipped.superDefenceLevel;
  }else equipped=ABILITIES.withStudioDefence(prior,ability,nextTier);
  // Validate first, then avoid redundant Career/club writes for unchanged explicit equipment.
  // A first-time tier selection must still persist.
  const sameAbility=prior.superAbility===equipped.superAbility||(
   !!prior.superAbility&&!!equipped.superAbility&&
   Object.keys(prior.superAbility).length===Object.keys(equipped.superAbility).length&&
   Object.keys(prior.superAbility).every(key=>Object.is(prior.superAbility[key],equipped.superAbility[key]))
  );
  if(prior.superDefenceLevel===equipped.superDefenceLevel&&sameAbility){showPlayerStudio(avatarIndex);return;}
  source[avatarIndex]=equipped;
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
function saveStudioKeeperDefence(){
 try{
  const isCareer=!!((typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club);
  const source=isCareer?career.roster.map(player=>({...player})):roster(home);
  if(!source?.[avatarIndex])throw Error('No selected player');
  const prior=source[avatarIndex],ability=$('studioKeeperDefAbility')?.value,tier=Number($('studioKeeperDefTier')?.value);
  if(!ability)throw Error('Select a goalkeeper Super Defence move');
  const state=studioKeeperDefenceSaveState(ability,tier,prior);
  if(state.invalid)throw Error(state.message);
  if(state.unchanged){showPlayerStudio(avatarIndex);return;}
  const currentLevel=Number(SPECIALS.abilityLevel(prior,'keeper'))||1,hasExisting=prior.gkSuperAbility?.type==='defence';
  if(ability!=='none'&&(ability!=='keep'||hasExisting&&tier!==currentLevel)&&
    !ABILITIES.canEquipVerifiedKeeperSpecial(prior,{level:tier}))
   throw Error('New goalkeeper Super Defence and level changes require verified Gold 1–2, Star 1–3, or Superstar 1–5 eligibility without a field Super Shot or Super Defence');
  if(ability!=='keep'&&ability!=='none'&&!ABILITIES.studioKeeperChoices(prior,tier).some(move=>move.id===ability))
   throw Error('This goalkeeper is not eligible for that move');
  let equipped;
  if(ability==='keep'&&!hasExisting)equipped={...prior};
  else if(ability==='none'){
   equipped=ABILITIES.withStudioKeeper(prior,ability,currentLevel);
   if(!Object.hasOwn(prior,'gkSuperLevel'))delete equipped.gkSuperLevel;
  }else equipped=ABILITIES.withStudioKeeper(prior,ability,tier);
  const sameAbility=prior.gkSuperAbility===equipped.gkSuperAbility||(
   !!prior.gkSuperAbility&&!!equipped.gkSuperAbility&&
   Object.keys(prior.gkSuperAbility).length===Object.keys(equipped.gkSuperAbility).length&&
   Object.keys(prior.gkSuperAbility).every(key=>Object.is(prior.gkSuperAbility[key],equipped.gkSuperAbility[key]))
  );
  if(prior.gkSuperLevel===equipped.gkSuperLevel&&sameAbility){showPlayerStudio(avatarIndex);return;}
  source[avatarIndex]=equipped;
  if(isCareer){const updated={...career,roster:source};if(!storeCharacterChanges('managerCareer',updated))return;career=updated;saveCareer();}
  else{const updated={...edits,[TEAMS[home].id]:source};if(!storeCharacterChanges('edits',updated))return;edits=updated;}
  showPlayerStudio(avatarIndex);
 }catch(error){alert('Cannot save goalkeeper Super Defence: '+error.message)}
}
function saveAppearance(){studioLastRandomPreview=null;
 if(typeof studioManagerContext!=='undefined'&&studioManagerContext){if(!career)return;const appearance=getAppearance(),previous={...avatarFor(managerAvatarPlayer()),...managerAvatarAppearance()},locked=studioAppearanceUnlockIssues(previous,appearance);if(locked.length){alert(`Unlock these appearance selections in Store & Tokens first: ${locked.join(', ')}.`);return;}if(Object.keys(previous).length===Object.keys(appearance).length&&Object.keys(appearance).every(key=>Object.hasOwn(previous,key)&&Object.is(previous[key],appearance[key]))){studioManagerContext=false;showManager();return;}const updated={...career,managerAppearance:appearance};if(!storeCharacterChanges('managerCareer',updated))return;career=updated;saveCareer();studioManagerContext=false;showManager();return;}
 const isCareer=!!((typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club);
 const source=isCareer?career.roster.map(p=>({...p})):roster(home);
 const player=source?.[avatarIndex];
 if(!player)return;
 const appearance=getAppearance(),previous=player.appearance,locked=studioAppearanceUnlockIssues(studioSavedAppearance(player),appearance);
 if(locked.length){const message=`Unlock these appearance selections in Store & Tokens first: ${locked.join(', ')}.`;const status=$('studioAppearanceSaveState');if(status)status.textContent=message;alert(message);return;}
 // Do not rewrite Career/club saves for a truly unchanged, fully explicit appearance.
 // Partial legacy appearances and obsolete extra fields still persist the normalized selection.
 const unchanged=previous&&typeof previous==='object'&&!Array.isArray(previous)&&
  Object.keys(previous).length===Object.keys(appearance).length&&
  Object.keys(appearance).every(key=>Object.hasOwn(previous,key)&&Object.is(previous[key],appearance[key]));
 if(unchanged){if(isCareer)showCareerSquad();else showPlayerStudio(avatarIndex);return;}
 source[avatarIndex]={...player,appearance};
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
function pause(){game.matchState='paused';page('PAUSED','Resume or change the computer opponent difficulty without restarting.',`<div class="panel">${field('CPU DIFFICULTY (LIVE)','liveDifficulty',aiChoices(),opt.difficulty)}${difficultyHint()}<p class="muted">Changes apply immediately on the next AI decision. In local 2-player Versus this does not affect either human.</p></div>${penaltyRoundScorecard(game)}${matchHighlightsPanel(game)}<div class="row">${quickTacticalPanel(0)}${humans>=2?quickTacticalPanel(1):''}</div><div class="row">${button('▶ RESUME','resume','gold')}${button('RESTART MATCH','confirmRestart')}${button('SETTINGS','navSound')}${button('HOME TACTICS','tacticHome')}${humans>=2?button('AWAY TACTICS','tacticAway'):''}${button('RETURN TO MAIN MENU','confirmQuit')}</div>`,'resume')}
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
function halftime(){game.matchState='paused';page('HALF TIME',`${TEAMS[home].name} ${game.score[0]} : ${game.score[1]} ${TEAMS[away].name}`,`<div class="panel"><h3 class="titleSmall">SECOND HALF STRATEGY</h3>${halftimeCoachPanel(game,0)}${humans>=2?halftimeCoachPanel(game,1):''}${matchHighlightsPanel(game)}${quickTacticalPanel(0)}${humans>=2?quickTacticalPanel(1):''}<p class="muted">Players regain 40% of their accumulated fatigue for the second half, and resting off the ball slowly restores stamina during play. CPU teams may make an automatic substitution. Use the command center for up to three substitutions; bench fatigue is remembered.</p><h3 class="titleSmall">🗣 HALF-TIME MANAGER TALK</h3><p class="muted">Talks can boost or reduce individual morale. One talk per team per halftime.</p><div class="tacticsGrid">${field('HOME TALK','halfTalkHome',Object.entries(TEAM_TALKS).map(([k,v])=>[k,v.name]),'encourage')}${humans>=2?field('AWAY TALK','halfTalkAway',Object.entries(TEAM_TALKS).map(([k,v])=>[k,v.name]),'focus'):''}</div><p class="muted">HOME MOOD: ${Math.round(game.teamMorale(0))}% · AWAY MOOD: ${Math.round(game.teamMorale(1))}%</p><div class="row">${!game.talksUsed[0].halftime?button('SPEAK TO HOME TEAM','talkHalfHome','gold'):''}${humans>=2&&!game.talksUsed[1].halftime?button('SPEAK TO AWAY TEAM','talkHalfAway'):''}</div><div class="row">${button('▶ SECOND HALF','resume','gold')}${button('HOME TACTICS','tacticHome')}${humans>=2?button('AWAY TACTICS','tacticAway'):''}${button('ADJUST CPU LEVEL','cpuPause')}</div></div>`,'resume')}
async function fulltime(ev){game.matchState='finished';let [a,b]=ev.score,win=lanRole==='guest'?b>a:a>b;if(mode==='league'){
 league.played++;league.wins+=a>b?1:0;league.draws+=a===b?1:0;league.losses+=a<b?1:0;league.points+=a>b?5:a===b?2:0;league.games.unshift({team:TEAMS[away].name,a,b});league.games=league.games.slice(0,80);
 if(league.stage==='qualifier'&&league.wins>=16&&league.points>=70)league.stage='finals';else if(league.stage==='finals'&&win){league.playoff=(league.playoff||0)+1;if(league.playoff>=4)league.stage='champion'}leagueResultCommitted=persistLeagueResult(league)}
 if(mode==='continental'&&continentalRun){try{applyCupMatchResult(ev.score,ev.penalties?ev.winner:null);if(continentalRun.compId!=='CUSTOM'&&career?.club===continentalRun.club){career.cash+=Math.max(0,continentalRun.earned-(continentalRun.lastCareerAward||0));continentalRun.lastCareerAward=continentalRun.earned;store.put('continentalRun',continentalRun);saveCareer()}saveCup();const tokenReward=await awardLocalMatchTokens(ev,ev.score);page('CONTINENTAL RESULT',`${TEAMS[home].name} ${a} : ${b} ${TEAMS[away].name}`,`<div class="panel careerResult"><div class="badge">${escapeHTML(cupCompetitionName(continentalRun))}</div><div class="megaScore">${a} : ${b}</div><p>${escapeHTML(tournamentProgress(continentalRun))} • ${continentalRun.earned/1000000}m prize earnings</p>${tokenReward}${button('CONTINUE CHAMPIONSHIP','continentContinue','gold')}</div>`)}catch(e){alert('Competition update failed: '+e.message);showTournament()}return;}
 if(mode==='career'&&career){recordMatchFitness(career,game.getFitnessReport(0));const outcome=advanceCareer(career,TEAMS,ev.score,ev.penalties?ev.winner:null),careerCommitted=saveCareer();const tokenReward=careerCommitted?await awardLocalMatchTokens(ev,ev.score):'<p class="muted">No Career tokens awarded because this match could not be committed to the active Career slot.</p>';page('CAREER MATCH RESULT',`${TEAMS[home].name} ${a} : ${b} ${TEAMS[away].name}`,`<div class="panel careerResult"><div class="titleSmall">${outcome.kind.toUpperCase()} • ${outcome.win?'WIN!':a===b?'DRAW':'DEFEAT'}</div><div class="megaScore">${a} : ${b}</div><p>Club cash: €${(career.cash/1000000).toFixed(1)}m • Current week ${career.week+1}</p>${tokenReward}${button('CONTINUE MANAGER CAREER','manager','gold')}</div>`);return;}
 if(mode==='customLeague'){
  try{
   if(!customLeagueRun||!customLeagueTeamReferencesValid(customLeagueRun))throw Error('The saved league team list changed before this result could be recorded.');
   const next=advanceCustomLeague(customLeagueRun,TEAMS,ev.score),lastRound=next.rounds[next.roundIdx-1],result=next.history.slice(-lastRound.matches.length).find(row=>row.userControlled),committed=saveCustomLeague(next);customLeagueResultCommitted=committed;
   const tokenReward=await awardLocalMatchTokens(ev,ev.score),outcome=result.homeGoals>result.awayGoals?result.home===next.club?'Your club won.':'The opponent won.':result.homeGoals<result.awayGoals?result.away===next.club?'Your club won.':'The opponent won.':'The match was a draw.';
   const notice=committed?'The full matchday result is saved locally.':`<span role="status" aria-live="polite">${escapeHTML(customLeagueSaveError||'This result is session-only; browser storage could not save it.')}</span>`;
   page('CUSTOM LEAGUE RESULT',`${TEAMS[home].name} ${a} : ${b} ${TEAMS[away].name}`,`<div class="panel careerResult"><div class="titleSmall">MATCHDAY ${result.round} · ${outcome}</div><div class="megaScore">${a} : ${b}</div><p>${notice}</p>${tokenReward}${next.phase==='finished'?`<p class="badge">🏆 ${escapeHTML(TEAMS[next.winner]?.name||'Unknown')} WIN THE CUSTOM LEAGUE</p>`:''}${button('CONTINUE CUSTOM LEAGUE','customLeagueContinue','gold')}</div>`);
  }catch(error){customLeagueResultCommitted=false;customLeagueSaveError='The match finished but the campaign result was not applied: '+error.message;page('CUSTOM LEAGUE RESULT NOT APPLIED',`${TEAMS[home].name} ${a} : ${b} ${TEAMS[away].name}`,`<div class="panel careerResult"><div class="megaScore">${a} : ${b}</div><p role="alert" aria-live="assertive">${escapeHTML(customLeagueSaveError)}</p>${button('RETURN TO CUSTOM LEAGUE','customLeagueContinue','gold')}${button('CUPS MENU','navCups','minor')}</div>`);}
  return;
 }
 const tokenReward=mode==='league'?await awardLocalMatchTokens(ev,ev.score):'';
 const lanReceiptRecovery=lanRole==='host'&&typeof lanRuntime?.retryResultAward==='function'?`<section id="lanHostReceiptRecovery" class="panel" aria-label="Online match token reward recovery" ${lanRuntime.resultAckStatus==='failed'?'':'hidden'}><p id="lanHostReceiptRecoveryStatus" role="status" aria-live="polite">The online match token reward could not be saved on this device. Free storage, then retry here. The receipt can also be retried from the main menu in this tab.</p><div class="row">${button('RETRY TOKEN REWARD','retryLanReceipt','gold')}</div></section>`:'';
 page('FULL TIME',`${ev.penalties&&(ev.winner===0||ev.winner===1)?(ev.winner===0?'VICTORY!':'DEFEAT'):win?'VICTORY!':a===b?'DRAW MATCH':'DEFEAT'}${ev.penalties?' • ON PENALTIES':''}`,`<div class="panel" style="text-align:center"><div class="badge">MATCH RESULT</div><div style="font-size:70px;color:#ffe17a;font-weight:1000">${a} : ${b}</div><p>${TEAMS[home].name} vs ${TEAMS[away].name}</p>${tokenReward}${lanReceiptRecovery}${ev.penalties?penaltyRoundScorecard(game,{finished:true,winner:ev.winner}):''}${matchHighlightsPanel(game)}<div class="row" style="justify-content:center">${button('↻ REMATCH','kickoff','gold')}${mode==='league'?button('🏆 LEAGUE','league'):button('MAIN MENU','home')}</div></div>`)}
function toast(message,duration=1600){let n=$('gameToast');n.textContent=message;n.classList.remove('hidden');toastTime=performance.now()+duration}
let toastTime=0;
game.onEvent=e=>{if(e.type==='passIntent'&&game.mode==='training'&&trainingCrossCoachState.observePass(e))updateTrainingCrossCoach();if(lanRuntime&&e.type==='halftime'){game.matchState='play';toast('SECOND HALF · LAN',1600);return;}
 if(lanRuntime&&e.type==='finished'){lanFinish=e;return;}
 if(lanRuntime&&e.type==='penaltyStart'){game.matchState='finished';lanFinish={type:'finished',score:game.score.slice()};return;}
 if(lanRuntime&&e.type==='pause'){game.matchState='play';return;}
audio.cue(e);if(e.type==='toast')toast(e.message,1800);if(e.type==='goal'){$('gameToast').classList.add('hidden');toastTime=0}if(e.type==='penaltyStart')toast(e.inMatch?'PENALTY KICK':'PENALTY SHOOTOUT',1500);if(e.type==='penaltyKick')toast(e.goal?'GOAL!':'SAVE!',1300);if(e.type==='pause')pause();if(e.type==='halftime')halftime();if(e.type==='finished')void fulltime(e)};
function action(a){if(a===menuBackAction&&!confirmDiscardBeforeBack(a))return;if(a==='kickoff'&&lanRuntime)stopLanMatch();audio.cue('ui');
 if(['navLan','navOnlineP2P'].includes(a)&&readLanHostResultRecovery()){
  const recoveryButton=menu.querySelector('#lanHostReceiptRecovery [data-action="retryLanReceipt"]'),status=$('lanHostReceiptRecoveryStatus');
  if(status)status.textContent='Save the pending online match token reward before starting another peer match. The existing receipt is kept in this tab.';
  recoveryButton?.focus({preventScroll:true});return;
 }
 const navTarget=menu.querySelector('[data-action="'+a+'"]');if(navTarget&&a!=='home'&&a!=='quit')navFocusMap[screen]=a;
 if(['quick','versus','pk','training','manager','league','continents','clubs','playerStudio','editor','gallery','squad','help','controls'].includes(a)&&screen.startsWith('nav-'))menuEntryReturn=({
 'nav-device':'navOnDevice','nav-career':'navCareer','nav-cups':'navCups','nav-clubs':'navClubs','nav-settings':'navSettings','nav-customize':'navCustomization','nav-input':'navInput','nav-saves':'navSaveManagement'
 })[screen]||'home';
 if(a==='retryLanReceipt'){
  void (async()=>{
   const recovered=lanRole==='host'&&lanRuntime?.retryResultAward?await lanRuntime.retryResultAward():await retryLanHostResultRecovery({storage:globalThis.sessionStorage,awardResult:payload=>tokenWallet.awardCompletedMatch(payload)});
   const recovery=$('lanHostReceiptRecovery'),status=$('lanHostReceiptRecoveryStatus');
   if(recovered){if(status)status.textContent='The online match token reward is saved. Your wallet now includes this receipt.';if(recovery)recovery.hidden=true;menu.querySelector('[data-action="home"]')?.focus({preventScroll:true});}
   else if(status)status.textContent='The reward still could not be saved. Free device storage, then retry again here. The recovery remains available in this tab.';
  })();
  return;
 }
 if(a==='retryLocalTokenReward'){
  void (async()=>{
   const status=$('localTokenRecoveryStatus'),section=$('localTokenRecovery');
   if(status)status.textContent='Checking wallet storage and retrying the exact match receipt…';
   const available=await tokenWallet.retry();
   if(!available.ok){if(status)status.textContent=available.error;return;}
   const saved=await retryLocalTokenReward();
   if(saved){if(status)status.textContent='The exact match receipt is saved. This reward cannot be credited a second time.';section?.querySelector('[data-action="retryLocalTokenReward"]')?.setAttribute('hidden','');}
   else if(status)status.textContent=saved==='capacity'?'The exact receipt ledger reached its supported capacity. This reward remains pending in this tab and no receipt was discarded. Offline play continues; another wallet-storage version is required before more rewards can be recorded.':tokenWallet.error||'The reward is still waiting for local storage. Free browser storage and retry again.';
  })();
  return;
 }
 if(a==='walletRetry'){
  void tokenWallet.retry().then(result=>{storeNotice=result.ok?'Wallet storage is available again. You can retry this match reward or purchase.':result.error;showTokenStore();});
  return;
 }
 else if(a==='confirmQuit'){if(confirm('Leave this match and return to the main menu? Match progress will be lost.')){stopLanMatch();game.matchState='none';showHome();}}else if(a==='confirmRestart'){if(confirm('Restart the match from kickoff? Current match progress will be lost.'))start();}
 else if(a==='navQuick')showQuickMenu();else if(a==='navLan')showLanLobby(screen==='nav-online'?'navOnline':'navQuick');else if(a==='navOnlineP2P')showOnlineP2PLobby(screen==='nav-online'?'navOnline':'navQuick');else if(a==='navOnDevice')showOnDevice();else if(a==='navOnline')showOnlineMenu();else if(a==='navOnlineServerMatch'){onlineMatchCareer=false;onlineMatchStatus='';onlineIdentityError='';onlineMatchTeamsRefreshNeeded=true;showOnlineServerMatch();}else if(a==='onlineSignIn_match')beginOnlineSignIn('match');else if(a==='onlineMatchTeamsRetry')loadOnlineMatchTeamOwnership('onlineMatchTeamsRetry');else if(a==='onlineMatchStart')startOnlineServerMatch();else if(a==='onlineMatchReconnect')reconnectOnlineServerMatch();else if(a==='onlineMatchRecover')recoverOnlineServerMatchResult();else if(a==='onlineMatchVerifyInterrupted'){onlineMatchStatusCheckKey='';verifyInterruptedPvpPending();}else if(a.startsWith('onlineMatchRecover_')){const id=a.slice('onlineMatchRecover_'.length);if(/^[a-f0-9]{32}$/.test(id))recoverOnlineServerMatchResult(id);}else if(a==='onlineMatchDiscardCorrupt'){if(confirm('Discard damaged pending-match data for this browser tab? Any unclaimed result represented only by that data may be stranded. This does not delete server match history or reverse an issued receipt.')){const discarded=onlineHistoryController?.discardCorruptPendingMatches({confirmed:true})===true;onlineMatchStatus=discarded?'Damaged pending-match data was explicitly discarded. Any result known only through it may no longer be recoverable.':'Damaged data could not be removed from session storage. PVP remains disabled.';showOnlineServerMatch('onlineMatchDiscardCorrupt');}}else if(a==='onlineMatchLeave')leaveOnlineServerMatch();else if(a==='onlineMatchResume'){closeMenu();drawHUD();}else if(a==='onlineRewardRetry')claimOnlineMatchReward();else if(a==='navOnlineCareer'){onlineCareerStatus='';onlineIdentityError='';onlineCareerProgressLoaded=false;onlineCareerProgressRequested=false;showOnlineCareer();}else if(a==='navOnlineUltimate'){onlineUtStatus='';onlineIdentityError='';onlineUtCatalogRequested=true;showOnlineUltimateTeam();loadOnlineUltimateTeamMarketplace();}else if(a==='onlineSignIn_career')beginOnlineSignIn('career');else if(a==='onlineSignIn_ultimate')beginOnlineSignIn('ultimate');else if(a==='onlineSignOut')signOutOnlineAccount();else if(a==='onlineHistoryReload')loadOnlineMatchHistory(false);else if(a==='onlineHistoryMore')loadOnlineMatchHistory(true);else if(a==='onlineCareerSeasonReload'){onlineCareerProgressRequested=false;loadOnlineCareerProgress();}else if(a==='onlineCareerSeasonStart')createOnlineCareerSeason();else if(a==='onlineCareerPlayNext')playOnlineCareerNext();else if(a==='onlineCareerReload')reloadOnlineCareer();else if(a==='onlineCareerUpload')uploadOnlineCareerCopy();else if(a==='onlineCareerImport')importOnlineCareerCopy();else if(a==='onlineUtReload')reloadOnlineUltimateTeam();else if(a==='onlineUtCatalogReload')loadOnlineUltimateTeamMarketplace();else if(a==='onlineUtMore'){onlineUtPage++;refreshOnlineUtCatalog();}else if(a==='onlineUtSave')saveOnlineUltimateTeam();else if(a==='navCareer'){creatingCareer=false;showCareerMenu();}else if(a==='navCups')showCupsMenu();else if(a==='navStore')showTokenStore();else if(a==='navInternational')showInternationalMenu();else if(a==='navClubs')showClubCompetitionsMenu();else if(a==='navSettings'||a==='settings')showSettingsMenu();else if(a==='navCustomization'){if(screen==='nav-settings')customizationReturn='navSettings';else if(screen==='home')customizationReturn='home';showCustomizationMenu();}else if(a==='navInput')showInputMenu();else if(a==='navSaveManagement')showSaveMenu('navSettings');else if(a==='navCareerSlots')showCareerSlots();else if(a==='navCupSlots')showCupSlots();
 else if(a==='storePagePrev'){storePage=Math.max(0,storePage-1);drawTokenStoreCards();const previous=$('storePagePrev'),next=$('storePageNext');(previous&&!previous.disabled?previous:next&&!next.disabled?next:menu.querySelector('#tokenStoreCards button:not([disabled])')||$('storeSearch'))?.focus({preventScroll:true});}
 else if(a==='storePageNext'){storePage++;drawTokenStoreCards();const next=$('storePageNext'),previous=$('storePagePrev');(next&&!next.disabled?next:previous&&!previous.disabled?previous:menu.querySelector('#tokenStoreCards button:not([disabled])')||$('storeSearch'))?.focus({preventScroll:true});}
 else if(a.startsWith('storeBuy_')){const match=a.match(/^storeBuy_(superShot|magicTrick|team|player|appearance|accessory)_(.*)$/);if(match)buyTokenStoreItem(match[1],decodeURIComponent(match[2]));}
 else if(a==='navGameSettings')showSettingsSection('game');else if(a==='navGraphics')showSettingsSection('graphics');else if(a==='navSound'){if(game.matchState==='paused'&&screen==='PAUSED')menuEntryReturn='returnPause';showSettingsSection('sound');}
 else if(a==='navAbout')showAbout();
 else if(a==='navNewCareer'){creatingCareer=true;showManager();}
 else if(a.startsWith('later')){const labels={laterLAN:'Local Network',laterOnlineMatch:'Online Match',laterUltimate:'Ultimate Team',laterOnlineCareer:'Online Career',laterOnlineCup:'Online Cup / League',laterWorldCup:'World Cup',laterAsian:'Asian Cup',laterEuro:'Euro',laterCopa:'Copa América',laterAfrica:'Africa Cup',laterConcacaf:'CONCACAF Cup',laterChampions:'Champions League',laterEuropa:'Europa League',laterPremier:'Premier League',laterSerie:'Serie A',laterBundes:'Bundesliga',laterLaLiga:'La Liga',laterLigue1:'Ligue 1',laterCustomCup:'Custom Cup',laterCustomLeague:'Custom League'};const parent=a==='laterLAN'?'navQuick':a.startsWith('laterOnline')||a==='laterUltimate'?'navOnline':['laterWorldCup','laterAsian','laterEuro','laterCopa','laterAfrica','laterConcacaf'].includes(a)?'navInternational':['laterCustomCup','laterCustomLeague'].includes(a)?'navCups':'navClubs';comingLater(labels[a]||'Coming Later','This feature is on the roadmap but is not yet playable.',parent);}
 else if(a==='home'||a==='quit'){game.matchState='none';showHome()}
 else if(a==='continents')showContinents();else if(a.startsWith('continentPick_'))showContinentSetup(a.slice(14));else if(a==='continentStart')startContinent();else if(a==='continentContinue')showTournament();else if(a==='continentKickoff')continentKickoff();else if(a==='continentBye')continentBye();
 else if(a==='customCupSetup'){customCupEntrants=[];customCupClub=null;showCustomCupSetup();}
 else if(a==='customCupAdd'){const id=Number($('customCupTeam')?.value);if(Number.isSafeInteger(id)&&TEAMS[id]&&!customCupEntrants.includes(id)&&customCupEntrants.length<16){customCupEntrants.push(id);if(customCupClub===null)customCupClub=id;}showCustomCupSetup();menu.querySelector('[data-action="customCupAdd"]')?.focus({preventScroll:true});}
 else if(a.startsWith('customCupRemove_')){const id=Number(a.slice('customCupRemove_'.length));customCupEntrants=customCupEntrants.filter(entry=>entry!==id);if(customCupClub===id)customCupClub=customCupEntrants[0]??null;showCustomCupSetup();(menu.querySelector('[data-action^="customCupRemove_"]')||$('customCupTeam'))?.focus({preventScroll:true});}
 else if(a.startsWith('customCupClub_')){const id=Number(a.slice('customCupClub_'.length));if(customCupEntrants.includes(id))customCupClub=id;showCustomCupSetup();menu.querySelector('[data-action="customCupStart"]')?.focus({preventScroll:true});}
 else if(a==='customCupStart')startCustomCup();
 else if(a==='customLeagueSetup'){customLeagueEntrants=[];customLeagueClub=null;showCustomLeagueSetup();}
 else if(a==='customLeagueContinue')showCustomLeague();
 else if(a==='customLeagueAdd'){const id=Number($('customLeagueTeam')?.value);if(Number.isSafeInteger(id)&&TEAMS[id]&&!customLeagueEntrants.includes(id)&&customLeagueEntrants.length<16){customLeagueEntrants.push(id);if(customLeagueClub===null)customLeagueClub=id;}showCustomLeagueSetup();menu.querySelector('[data-action="customLeagueAdd"]')?.focus({preventScroll:true});}
 else if(a.startsWith('customLeagueRemove_')){const id=Number(a.slice('customLeagueRemove_'.length));customLeagueEntrants=customLeagueEntrants.filter(entry=>entry!==id);if(customLeagueClub===id)customLeagueClub=customLeagueEntrants[0]??null;showCustomLeagueSetup();(menu.querySelector('[data-action^="customLeagueRemove_"]')||$('customLeagueTeam'))?.focus({preventScroll:true});}
 else if(a.startsWith('customLeagueClub_')){const id=Number(a.slice('customLeagueClub_'.length));if(customLeagueEntrants.includes(id))customLeagueClub=id;showCustomLeagueSetup();menu.querySelector('[data-action="customLeagueStart"]')?.focus({preventScroll:true});}
 else if(a==='customLeagueStart')startCustomLeague();
 else if(a==='customLeagueBye')customLeagueBye();
 else if(a==='customLeagueKickoff')customLeagueKickoff();
 else if(a==='manager'){creatingCareer=false;studioManagerContext=false;showManager();}else if(a==='startManager'){const v=+$('managerClub').value;const slot=careerSlots.firstEmpty()??careerSlots.active;if(careerSlots.list()[slot-1].occupied&&!confirm('All ten slots are full. Overwrite active Career slot '+slot+'?'))return;const fresh=createCareer(v,TEAMS);fresh.teamPlan=defaultPlan(v,fresh.roster);fresh.saveSchema=2;fresh.clubId=TEAMS[v].id;try{careerSlots.save(slot,fresh);career=fresh;creatingCareer=false;store.put('managerCareer',career);showManager();}catch(error){alert('Could not create Career save: '+error.message);}}
 else if(a==='careerPlay')careerPlay();else if(a==='careerSeason'){if(career)showCareerSeasonReview()}else if(a==='careerSeasonConfirm')beginCareerNextSeason();else if(a==='careerPastSeasons')showCareerSeasonArchive();
 else if(a==='careerTactics'){if(career){home=career.club;showSquad(0,'career')}}
 else if(a==='careerScout')showCareerScout();else if(a==='careerScoutNew')tryCareerScout();else if(a==='careerSignConfirm')confirmCareerSign();else if(a==='careerSignCancel')cancelCareerSign();else if(a.startsWith('careerSign'))tryCareerSign(+a.slice(10));
 else if(a==='careerMarket')showCareerMarket();else if(a==='careerSquad')showCareerSquad();else if(a==='careerBuy')careerBuy();else if(a==='careerBuyConfirm')confirmCareerBuy();else if(a==='careerBuyCancel')cancelCareerBuy();
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
 else if(a==='studioGalleryPrev')studioStepGalleryFrame(-1);else if(a==='studioGalleryNext')studioStepGalleryFrame(1);
  else if(a==='studioLeft')studioRotate(-1);else if(a==='studioRight')studioRotate(1);else if(a==='studioSpin'){studioSpin=!studioSpin;const btn=menu.querySelector('[data-action=studioSpin]');if(btn)btn.textContent=studioSpin?'■ STOP TURN':'↻ AUTO ROTATE';drawCustomizer()}
 else if(a==='editManagerAppearance'){if(!career)return showManager();home=career.club;studioManagerContext=true;studioCareerContext=false;studioReturnAction='manager';showPlayerStudio(0);}else if(a==='saveStudioStats')saveStudioStats();else if(a==='resetStudioStats'){const player=((typeof studioCareerContext==='undefined'||studioCareerContext)&&career&&home===career.club?career.roster:roster(home))[avatarIndex];if(player){const normalized=withStats(player);for(const key of NUMERIC_STATS)if($('stat_'+key))$('stat_'+key).value=String(normalized[key]);studioStatPreview();}}else if(a==='playerStudio'){studioManagerContext=false;studioCareerContext=false;studioReturnAction='navCustomization';showPlayerStudio();}
 else if(a.startsWith('editClubPlayers')){const ix=Number(a.slice('editClubPlayers'.length));if(TEAMS[ix]?.id.startsWith('club_')){home=ix;studioManagerContext=false;studioCareerContext=false;studioReturnAction='clubs';showPlayerStudio(0);}}
 else if(a.startsWith('editClubRoster')){const ix=Number(a.slice('editClubRoster'.length));if(TEAMS[ix]?.id.startsWith('club_')){home=ix;showEditor('clubs');}}
 else if(a.startsWith('editPlayer')){studioManagerContext=false;studioCareerContext=!!career&&screen==='MANAGER SQUAD';studioReturnAction=studioCareerContext?'careerSquad':'navCustomization';showPlayerStudio(+a.slice(10));}else if(a==='saveAppearance')saveAppearance();else if(a==='studioResetAppearance')studioResetUnsavedAppearance();else if(a==='saveStudioDefence')saveStudioDefence();else if(a==='saveStudioKeeperDefence')saveStudioKeeperDefence();else if(a==='saveStudioTrick')saveStudioTrick();else if(a==='saveStudioMagic')saveStudioMagic();else if(a==='saveStudioShot')saveStudioShot();else if(a==='randomizeFace')studioRandomizeUnsavedAppearance();else if(a==='randomizeHair')studioRandomizeHairUnsaved();else if(a==='randomizeFaceDetails')studioRandomizeFaceDetailsUnsaved();else if(a==='randomizeBody')studioRandomizeBodyUnsaved();else if(a==='randomizeAccessories')studioRandomizeAccessoriesUnsaved();else if(a==='studioUndoRandomPreview')studioUndoRandomPreview();
 else if(a==='conceptDemo'){home=TEAMS.findIndex(t=>t.id===CONCEPT_DEMO_ID);away=0;homeCategory='all';showSetup('quick');}
 else if(a==='quick'||a==='versus'||a==='training')showSetup(a);
 else if(a==='setupRules')showSetupExtras('rules');else if(a==='setupAppearance')showSetupExtras('appearance');else if(a==='setupArcadeShots')showSetupExtras('arcadeShots');else if(a==='autoContrastKits'){const fit=bestContrastSelections(TEAMS[home],TEAMS[away],kitSelections);kitSelections[0]=fit.homeChoice;kitSelections[1]=fit.awayChoice;store.put('kitSelections',kitSelections);showSetupExtras('appearance');$('homeKit')?.focus();}else if(a==='setupTactics')showSetupExtras('tactics');
 else if(a==='league')showLeague();else if(a==='gallery')showGallery();else if(a==='clubs')showClubs();else if(a==='saveClub')saveNewClub();else if(a.startsWith('selectClub')){home=+a.slice(10);away=home===away?0:away;showSetup('quick')}else if(a.startsWith('deleteClub'))deleteClub(+a.slice(10));else if(a==='pk'){mode='pk';showSetup('pk')}
 else if(a==='leagueKickoff'){mode='league';start()}
 else if(a==='kickoff')start();else if(a==='squad')showSquad(0,game.matchState==='paused'?'pause':screen==='nav-customize'?'customization':'home');else if(a==='prepHome')showSquad(0,'setup');else if(a==='prepAway')showSquad(1,'setup');else if(a==='tacticHome')showSquad(0,'pause');else if(a==='tacticAway'&&humans>=2)showSquad(1,'pause');else if(a==='returnSetup')showSetup(mode);else if(a==='returnPause'){menuEntryReturn='home';if(screen==='TEAM COMMAND CENTER'&&squadContext==='pause')returnFromPauseTactics();else pause();}else if(a==='controls')showControls();else if(a==='saveBindings'){const profile={keyboard:Array.from({length:4},(_,i)=>$('bindKey'+i).value),gamepad:Array.from({length:4},(_,i)=>+$('bindPad'+i).value),keyboard2:Array.from({length:4},(_,i)=>$('bindKey2'+i).value),gamepad2:Array.from({length:4},(_,i)=>+$('bindPad2'+i).value)};if(input.setBindings(profile)){store.put('controllerBindings',input.getBindings());showInputMenu();}else alert('Each player needs four unique keys and buttons. Keyboard keys cannot overlap across players.');}else if(a==='resetBindings'){input.setBindings({keyboard:['KeyK','KeyJ','KeyI','Space'],gamepad:[1,0,2,3],keyboard2:['Period','Comma','NumpadDecimal','ControlRight'],gamepad2:[1,0,2,3]});store.put('controllerBindings',input.getBindings());showControls();}else if(a==='help')showHelp();else if(a==='editor')showEditor('navCustomization');
 else if(/^quickTactic(Home|Away)(Attack|Control|Defend|Balanced)$/.test(a)){
  const match=a.match(/^quickTactic(Home|Away)(Attack|Control|Defend|Balanced)$/);
  quickTacticalCall(match[1]==='Home'?0:1,match[2].toLowerCase());
 }
 else if(a==='talkHalfHome'||a==='talkHalfAway'){const side=a==='talkHalfHome'?0:1;try{const response=game.applyTeamTalk(side,$(side?'halfTalkAway':'halfTalkHome')?.value||'encourage','halftime');halftime();toast(`${response.positive} INSPIRED · ${response.backfires} UPSET · TEAM MOOD ${response.morale}%`)}catch(err){alert(err.message)}}
 else if(a==='fullscreen')toggleFullscreen();else if(a==='cpuPause')pause();else if(a==='resume'){game.matchState=game.pk?'penalty':'play';closeMenu()}
 else if(a==='saveSquad'){
  const ix=squadContext==='pause'?game.teamIds[squadSide]:squadContext==='career'?career?.club:squadSide===0?home:away;
  const players=squadContext==='pause'?game.rosters[squadSide]:squadContext==='career'?career?.roster||[]:roster(ix);
  const raw={formation:$('formation').value,lineup:Array.from({length:6},(_,i)=>+$('pos'+i).value),captain:+$('role_captain').value,penalty:+$('role_penalty').value,freeKick:+$('role_freeKick').value,corner:+$('role_corner').value,attack:$('attackStyle').value,defence:$('defenceStyle').value};
  try{const plan=validatePlan(raw,players,ix);
   if(squadContext==='pause'){game.applyPlan(squadSide,plan);returnFromPauseTactics();return;}
   if(squadContext==='career'){if(saveCareerPlan(plan))showCareerSquad();return;}
   teamPlans[TEAMS[ix].id]=plan;store.put('teamPlans',teamPlans);
   if(squadContext==='setup')showSetup(mode);else showHome();
  }catch(e){alert(e.message)}
 }
 else if(a==='resetSquad'){
  const ix=squadContext==='pause'?game.teamIds[squadSide]:squadSide===0?home:away;
  const players=squadContext==='career'?career?.roster||[]:roster(ix),replacement=defaultPlan(ix,players);try{if(squadContext==='pause'){game.applyPlan(squadSide,replacement);returnFromPauseTactics();return;}if(squadContext==='career'){if(saveCareerPlan(replacement))showCareerSquad();return;}teamPlans[TEAMS[ix].id]=replacement;store.put('teamPlans',teamPlans);showSquad(squadSide,squadContext);}catch(e){alert(e.message)}
 }
 else if(a==='cupBackupExport'){try{
 const recovery=cupSlots.hasRecoverySnapshot;
 const blob=new Blob([cupSlots.exportBackup()],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='Supermagic_Cup_'+(recovery?'Recovery_':'')+'Backup_'+new Date().toISOString().slice(0,10)+'.json';link.click();
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
  applyImportedCupBackupState();
 }catch(error){alert('Cup backup import failed: '+error.message)}};
 picker.click();
 }
 else if(a.startsWith('cupSlotSave_')){showSlotNameDialog('cup','save',Number(a.slice('cupSlotSave_'.length)))}
 else if(a.startsWith('cupSlotLoad_')){const n=Number(a.slice('cupSlotLoad_'.length));if(continentalRun&&!confirm('Load Cup slot '+n+'? The current Cup campaign will be replaced.'))return;try{const loaded=cupSlots.load(n,saved=>validateTournament(saved,TEAMS));continentalRun=loaded;store.put('continentalRun',continentalRun);showTournament()}catch(error){alert(error.message)}}
 else if(a.startsWith('cupSlotCopy_')){const n=Number(a.slice('cupSlotCopy_'.length));try{cupSlots.duplicate(n);showCupSlots()}catch(error){alert(error.message)}}
 else if(a.startsWith('cupSlotDelete_')){const n=Number(a.slice('cupSlotDelete_'.length));if(!confirm('Permanently delete Cup slot '+n+'? Export a backup first if needed.'))return;try{const wasActive=cupSlots.active===n;cupSlots.remove(n);if(wasActive){continentalRun=null;store.put('continentalRun',null)}showCupSlots()}catch(error){alert(error.message)}}
 else if(a.startsWith('careerSlotSave_')){if(!career)return showCareerSlots();showSlotNameDialog('career','save',Number(a.slice('careerSlotSave_'.length)))}
  else if(a.startsWith('careerSlotLoad_')){const n=Number(a.slice(15));if(career&&!confirm('Load Career slot '+n+'? Unsaved progress in the current career will be lost.'))return;try{career=ensureCareerTeamPlan(careerSlots.load(n,careerBackupTeamReferencesValid));store.put('managerCareer',career);showManager();}catch(error){alert(error.message)}}
  else if(a.startsWith('careerSlotCopy_')){const n=Number(a.slice('careerSlotCopy_'.length));try{careerSlots.duplicate(n);showCareerSlots();}catch(error){alert(error.message)}}
  else if(a.startsWith('careerSlotRename_')){showSlotNameDialog('career','rename',Number(a.slice('careerSlotRename_'.length)))}
 else if(a.startsWith('slotNameCancel_')){const match=a.match(/^slotNameCancel_(career|cup)_(save|rename)_(\d+)$/);if(match){const [,kind,operation,rawNumber]=match,n=Number(rawNumber),focusAction=`${kind}Slot${operation==='rename'?'Rename':'Save'}_${n}`;returnFromSlotName(kind,n,focusAction)}}
 else if(a.startsWith('slotNameConfirm_')){const match=a.match(/^slotNameConfirm_(career|cup)_(save|rename)_(\d+)$/);if(!match)return;const [,kind,operation,rawNumber]=match,n=Number(rawNumber),name=$('slotNameInput')?.value??'';if(!name.trim())return reportSlotNameError('Enter a name for this save before continuing.');try{
   let focusAction;
   if(kind==='career'){
    if(operation==='save'){if(!career)throw Error('There is no active Career to save.');careerSlots.save(n,career,name);store.put('managerCareer',career);focusAction=`careerSlotSave_${n}`;}
    else{careerSlots.rename(n,name);focusAction=`careerSlotRename_${n}`;}
   }else{
    if(operation!=='save'||!continentalRun)throw Error('There is no active Cup campaign to save.');
    cupSlots.save(n,continentalRun,name);store.put('continentalRun',continentalRun);focusAction=`cupSlotSave_${n}`;
   }
   returnFromSlotName(kind,n,focusAction);
  }catch(error){reportSlotNameError(error.message)}}
  else if(a.startsWith('careerSlotDelete_')){const n=Number(a.slice(17));if(!confirm('Permanently delete Career slot '+n+'? Export a backup first if needed.'))return;try{careerSlots.remove(n);if(careerSlots.active===n){career=null;store.put('managerCareer',null);}showCareerSlots();}catch(error){alert(error.message)}}
  else if(a==='exportSave')exportSave();else if(a==='importSave')$('saveImportFile')?.click();
 else if(a==='careerBackupExport')exportCareerBackup();else if(a==='careerBackupImport')$('careerBackupImportFile')?.click();
 else if(a==='saveSettings'){
  const get=id=>$(id)?.value;
  const changes={};for(const [id,key,cast] of [['difficulty','difficulty',Number],['settingsDuration','halfSeconds',Number],['gameSpeed','gameSpeed',Number],['settingsWeather','weather',String],['settingsTerrain','terrain',String],['settingsCondition','condition',String],['settingsStadium','stadium',v=>STADIUMS.some(s=>s.id===v)?v:DEFAULT_OPTIONS.stadium],['camera','camera',String],['renderQuality','renderQuality',v=>v==='performance'?'performance':'high'],['ballModel','ballModel',VISUALFEEL.validBallModel],['showNames','showNames',v=>v==='true'],['showPerformance','showPerformance',v=>v==='true']]){if(get(id)!==undefined)changes[key]=cast(get(id));}
  Object.assign(opt,changes);
  renderer.setRenderQuality(opt.renderQuality);
  const values={};for(const k of ['master','music','sfx','ui','ambience'])if(get('audio_'+k)!==undefined)values[k]=+get('audio_'+k);
  if(get('audioMute')!==undefined)values.mute=get('audioMute')==='true';
  audio.configure(values);opt.sfx=!audio.settings.mute;
  game.options.difficulty=opt.difficulty;
  store.put('audioOptions',audio.settings);store.put('options',opt);if(menuEntryReturn==='returnPause'){menuEntryReturn='home';pause();}else showSettingsMenu();
 }
 else if(a==='clearLeague'){if(confirm('Reset all league wins and fixture results?')){league={played:0,wins:0,draws:0,losses:0,points:0,playoff:0,stage:'qualifier',games:[]};store.put('league',league);showLeague()}}
 else if(a==='importRoster'){try{let list=JSON.parse($('jsonRoster').value);if(!Array.isArray(list)||list.length!==12)throw Error('Need an array of 12 players');for(let p of list){if(!p.name||!['GK','DF','MF','FW'].includes(p.role)||!SHOTS[p.shot]||!['A','B','C','D'].includes(p.speed)||!Number.isFinite(+p.shoot)||!Number.isFinite(+p.power)||!Number.isFinite(+p.defense))throw Error('Invalid player record '+p.name)}edits[TEAMS[home].id]=list;store.put('edits',edits);showEditor(editorReturnAction);toast('ROSTER SAVED')}catch(e){alert('Cannot import roster: '+e.message)}}
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
let fullscreenHelpReturnFocus=null;
function fullscreenHelpFocusUsable(target){return !!target?.isConnected&&!target.matches?.(':disabled')&&!target.closest?.('.hidden,[hidden],[inert]')}
function fullscreenHelpFocusFallback(){
 if(menuVisible()){
  const heading=menu.querySelector('.heading');if(fullscreenHelpFocusUsable(heading)){heading.setAttribute?.('tabindex','-1');return heading;}
  return [...menu.querySelectorAll('button')].find(target=>fullscreenHelpFocusUsable(target))||null;
 }
 const control=$('pauseBtn');return fullscreenHelpFocusUsable(control)?control:null;
}
function restoreFullscreenHelpFocus(){const target=fullscreenHelpReturnFocus;fullscreenHelpReturnFocus=null;if(!target)return;(fullscreenHelpFocusUsable(target)?target:fullscreenHelpFocusFallback())?.focus?.({preventScroll:true});}
function fullscreenHelp(message){
 const dialog=$('fullscreenHelp');if(dialog.classList.contains('hidden')){const active=document.activeElement;fullscreenHelpReturnFocus=active?.matches?.('.fullscreenTool,#fullscreenMatch')?active:(menuVisible()?menu.querySelector('.fullscreenTool'):$('fullscreenMatch'));}
 $('fullscreenHelpText').textContent=message;
 dialog.classList.remove('hidden');$('fullscreenHelpClose').focus({preventScroll:true});
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
$('fullscreenHelp').addEventListener('keydown',event=>{
 if(event.key==='Escape'){event.preventDefault();event.stopPropagation();$('fullscreenHelp').classList.add('hidden');restoreFullscreenHelpFocus();return;}
 if(event.key==='Tab'){event.preventDefault();$('fullscreenHelpClose').focus({preventScroll:true});}
});
$('fullscreenHelpClose').addEventListener('click',()=>{$('fullscreenHelp').classList.add('hidden');restoreFullscreenHelpFocus();});

// Menu-only focus navigation; input handling inside matches remains unchanged.
const primaryNavScreens=new Set(['home','nav-quick','nav-device','nav-online','nav-career','nav-cups','nav-international','nav-clubs','nav-settings','nav-customize','nav-input','nav-saves','nav-settings-game','nav-settings-graphics','nav-settings-sound']);
const studioGamepadScreens=new Set(['PLAYER CUSTOMIZATION','MANAGER APPEARANCE']);
function menuButtons(){
 const selector=studioGamepadScreens.has(screen)
  ? 'button:not([disabled]),select:not([disabled]),input:not([disabled]),textarea:not([disabled]),summary'
  : '.navChoice';
 return [...menu.querySelectorAll(selector)].filter(el=>!el.disabled&&el.offsetParent!==null);
}
function navigateMenu(horizontal,direction){
 const items=menuButtons();if(!items.length)return;
 const current=items.includes(document.activeElement)?document.activeElement:items[0];
 const from=current.getBoundingClientRect(),fromX=from.left+from.width/2,fromY=from.top+from.height/2;
 let next=null,best=Infinity;
 for(const item of items){
  if(item===current)continue;
  const rect=item.getBoundingClientRect(),x=rect.left+rect.width/2-fromX,y=rect.top+rect.height/2-fromY;
  const primary=direction*(horizontal?x:y);
  if(primary<=1)continue;
  const score=primary+(horizontal?Math.abs(y):Math.abs(x))*1.5;
  if(score<best){best=score;next=item;}
 }
 if(!next){const index=items.indexOf(current);next=items[(index+direction+items.length)%items.length];}
 next.focus({preventScroll:true});next.scrollIntoView({block:'nearest',behavior:'instant'});
}
function stepFocusedStudioControl(direction){
 const control=document.activeElement;
 if(!studioGamepadScreens.has(screen))return false;
 if(control?.tagName==='SELECT'){
  const options=[...control.options].filter(option=>!option.disabled&&!option.parentElement?.disabled);
  if(options.length<2)return false;
  const current=options.findIndex(option=>option.value===control.value);
  const next=options[current+direction];
  if(current<0||!next)return false;
  control.value=next.value;
 }else if(control?.tagName==='INPUT'&&control.type==='range'){
  const before=control.value;
  if(direction>0)control.stepUp();else control.stepDown();
  if(control.value===before)return false;
 }else return false;
 control.dispatchEvent(new Event('input',{bubbles:true}));
 control.dispatchEvent(new Event('change',{bubbles:true}));
 control.focus({preventScroll:true});
 return true;
}
function closeNestedMenuLayer(){
 const fullscreenHelp=$('fullscreenHelp');if(fullscreenHelp&&!fullscreenHelp.classList.contains('hidden')){fullscreenHelp.classList.add('hidden');restoreFullscreenHelpFocus();return true;}
 if(screen==='PLAYER CUSTOMIZATION'&&studioGalleryOpen){action('studioGalleryToggle');menu.querySelector('[data-action="studioGalleryToggle"]')?.focus({preventScroll:true});return true;}
 const openBrowser=menu.querySelector('.teamBrowsePanel:not(.hidden)');if(openBrowser){openBrowser.classList.add('hidden');const id=openBrowser.id.replace(/Browse$/,'');menu.querySelector(`[data-team-browse="${id}"]`)?.setAttribute('aria-expanded','false');return true;}
 return false;
}
function backFromMenu(){if(typeof closeNestedMenuLayer==='function'&&closeNestedMenuLayer())return;if(['PAUSED','HALF TIME'].includes(screen)){action('resume');return;}if(screen==='TEAM COMMAND CENTER'){action(squadContext==='pause'?'returnPause':squadContext==='setup'?'returnSetup':menuBackAction||'home');return;}if(['MATCH RULES','KITS & TEAM TALKS','TEAM TACTICS'].includes(screen)){action('returnSetup');return;}const back=screen==='nav-settings-sound'&&menuEntryReturn==='returnPause'?'returnPause':screen==='nav-saves'?menuBackAction:menuParents[screen]||menuBackAction||'home';if(screen==='home')return;action(back);}
document.addEventListener('keydown',e=>{
 if(onlineMatchClient&&!menuVisible()&&e.code==='Escape'){e.preventDefault();e.stopPropagation();try{onlineMatchClient.sendInput(++onlineMatchSequence,{x:0,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}})}catch{};page('ONLINE MATCH','Match remains live on the server. Choose whether to resume or leave.',`<p id="onlineMatchStatus" role="status" aria-live="polite">${escapeHTML(onlineMatchStatus||'Connected to server.')}</p><div class="row">${button('RESUME MATCH','onlineMatchResume','gold')}${button('LEAVE ONLINE MATCH','onlineMatchLeave','minor')}</div>`,'navOnline');return;}
 if(!menuVisible())return;
 if((screen==='LOCAL NETWORK'||screen==='ONLINE P2P')&&e.code==='Escape'){e.preventDefault();backFromMenu();return;}
 if(e.code==='Escape'||e.code==='Backspace'){
  const escape=e.code==='Escape';
  if(escape){e.preventDefault();backFromMenu();input.cancelAll();return;}
  if(e.target?.matches?.('input,select,textarea,[contenteditable="true"]'))return;
  if(['PAUSED','HALF TIME'].includes(screen)){e.preventDefault();backFromMenu();return;}
  e.preventDefault();backFromMenu();input.cancelAll();return;
 }
 if(e.target?.matches?.('input,select,textarea,[contenteditable="true"]'))return;
 if(primaryNavScreens.has(screen)){
  if(e.code==='ArrowDown'||e.code==='ArrowUp'||e.code==='ArrowLeft'||e.code==='ArrowRight'){
   e.preventDefault();navigateMenu(e.code==='ArrowLeft'||e.code==='ArrowRight',e.code==='ArrowRight'||e.code==='ArrowDown'?1:-1);
  }
  else if((e.code==='Enter'||e.code==='Space')&&document.activeElement?.matches?.('.navChoice')){e.preventDefault();document.activeElement.click();}
 }
});
let lastPadNav=0,padWas={};
function pollMenuPad(now){
 if(!menuVisible()){padWas={};return;}const pad=navigator.getGamepads?.()?.[0];if(!pad)return;
 const pressed=i=>Boolean(pad.buttons?.[i]?.pressed);
 const down=pressed(13)||(pad.axes?.[1]||0)>.55,up=pressed(12)||(pad.axes?.[1]||0)<-.55;
 const right=pressed(15)||(pad.axes?.[0]||0)>.55,left=pressed(14)||(pad.axes?.[0]||0)<-.55;
 if((primaryNavScreens.has(screen)||studioGamepadScreens.has(screen))&&now-lastPadNav>180){
  if(down!==up&&(down||up)){navigateMenu(false,down?1:-1);lastPadNav=now;}
  else if(left!==right&&(left||right)){const direction=right?1:-1;if(!stepFocusedStudioControl(direction))navigateMenu(true,direction);lastPadNav=now;}
 }
 if(pressed(0)&&!padWas.a){const targets=menuButtons();const selected=targets.includes(document.activeElement)?document.activeElement:targets[0];selected?.click();}
 if(pressed(1)&&!padWas.b)backFromMenu();
 padWas={a:pressed(0),b:pressed(1)};
}
menu.addEventListener('change',e=>{if(e.target.id==='saveImportFile'){importSave(e.target.files?.[0]);}if(e.target.id==='careerBackupImportFile'){importCareerBackup(e.target.files?.[0]);}if(['face_skin','face_hair'].includes(e.target.id)){studioUpdateColorPreview(e.target.id);drawCustomizer();}});
menu.addEventListener('change',e=>{
 if(e.target.id==='onlineCareerSource'){onlineCareerSourceSlotNumber=Number(e.target.value);return;}
 if(e.target.id==='onlineCareerTarget'){onlineCareerTargetSlotNumber=Number(e.target.value);return;}
 if(e.target.id==='onlineUtTeam'){onlineUtTeam=Number(e.target.value);refreshOnlineTeamPreview();return;}
 if(e.target.id==='onlineUtLineupTeam'){onlineUtLineupTeamId=e.target.value;onlineUtLineupPendingSave=null;loadOnlineUtLineup();return;}
 const lineupSlot=/^onlineUtLineupSlot(\d+)$/.exec(e.target.id||'');
 if(lineupSlot&&onlineUtLineup){onlineUtLineup.playerIds[Number(lineupSlot[1])]=e.target.value;return;}
 if(e.target.id==='onlineUtCategory'&&['team','player'].includes(e.target.value)){onlineUtCategory=e.target.value;onlineUtPage=0;refreshOnlineUtCatalog();}
});

// Studio drag-to-rotate; pointer capture keeps rotation stable on touch screens.
menu.addEventListener('pointerdown',e=>{if(e.target.id==='customPortrait'){studioDragX=e.clientX;e.target.setPointerCapture?.(e.pointerId)}});
menu.addEventListener('pointermove',e=>{if(studioDragX===null||e.target.id!=='customPortrait')return;const delta=e.clientX-studioDragX;if(Math.abs(delta)>=22){studioRotate(delta>0?1:-1);studioDragX=e.clientX;}});
for(const eventName of ['pointerup','pointercancel','lostpointercapture'])menu.addEventListener(eventName,()=>{studioDragX=null});
menu.addEventListener('input',e=>{if(e.target.id==='onlineUtSearch'){onlineUtSearch=e.target.value;onlineUtPage=0;refreshOnlineUtCatalog();return;}if(e.target.id==='studioGalleryPhase'){const frame=Number(e.target.value);if(Number.isInteger(frame)&&frame>=0&&frame<=3){studioGalleryFrame=frame;drawCustomizer()}return;}if(e.target.id?.startsWith('stat_')){studioStatPreview();return;}if(e.target.dataset.teamSearch){fillTeamBrowser(e.target.dataset.teamSearch);return;}if(['face_skin','face_hair'].includes(e.target.id)){studioUpdateColorPreview(e.target.id);drawCustomizer();return;}if(e.target.id?.startsWith('face_')||e.target.id==='customPose'){if(e.target.id==='customPose')studioAction=e.target.value;drawCustomizer()}});
menu.addEventListener('change',e=>{if(e.target.id==='onlineMatchTeam'&&onlineMatchTeamsLoaded&&onlineMatchOwnedTeamIds.includes(e.target.value)){onlineMatchTeamId=e.target.value;return;}if(/^pos[0-5]$/.test(e.target.id)){const choiceEl=$('role_captain');if(!choiceEl)return;const current=+choiceEl.value;const ix=squadContext==='pause'?game.teamIds[squadSide]:squadSide===0?home:away;const players=squadContext==='pause'?game.rosters[squadSide]:roster(ix);const slots=Array.from({length:6},(_,i)=>+$('pos'+i).value);choiceEl.innerHTML=slots.map(i=>`<option value="${i}" ${i===current?'selected':''}>#${players[i].num} ${escapeHTML(players[i].name)}</option>`).join('');if(!slots.includes(current))choiceEl.value=String(slots[1]||slots[0]);refreshFormationPreview();}});

menu.addEventListener('input',e=>{if(e.target.id==='careerMarketSearch'){careerMarketSearch=e.target.value;refreshCareerMarketListing();refreshCareerTransferQuote();}});
menu.addEventListener('change',e=>{if(e.target.id==='careerMarketRole'){careerMarketRole=e.target.value;refreshCareerMarketListing();refreshCareerTransferQuote();}if(e.target.id==='careerMarketSort'){careerMarketSort=e.target.value;refreshCareerMarketListing();refreshCareerTransferQuote();}if(e.target.id==='releasePlayer'||e.target.name==='target')refreshCareerTransferQuote();if(e.target.id==='academyOutgoing')refreshAcademySigningSummary()});
menu.addEventListener('keydown',e=>{studioGalleryKeydown(e)});
menu.addEventListener('keydown',teamBrowserKeydown);
menu.addEventListener('click',e=>{const practice=e.target.closest?.('[data-help-practice]');if(practice){updateTouchHelpPractice(practice);updateGuidedHelpPractice(practice.dataset.helpPractice);}});
menu.addEventListener('click',e=>{const target=e.target.closest?.('[data-action="onlineUtLineupReload"],[data-action="onlineUtLineupSave"]');if(!target||target.disabled)return;if(target.dataset.action==='onlineUtLineupReload')loadOnlineUtLineup();else saveOnlineUtLineup();});
menu.addEventListener('submit',event=>{const form=event.target;if(form?.id!=='slotNameForm')return;event.preventDefault();action(form.dataset.slotAction)});
menu.addEventListener('input',event=>{if(event.target?.id==='slotNameInput'){event.target.removeAttribute('aria-invalid');const error=$('slotNameError');if(error)error.textContent='';}});
menu.addEventListener('keydown',event=>{
 if(screen!=='SAVE SLOT NAME'||event.key!=='Tab')return;
 const dialog=menu.querySelector('#slotNameDialog');
 const focusable=[...dialog.querySelectorAll('input:not([disabled]),button:not([disabled])')];
 if(!focusable.length)return;
 const first=focusable[0],last=focusable.at(-1),active=document.activeElement;
 if(event.shiftKey&&(active===first||!dialog.contains(active))){event.preventDefault();last.focus({preventScroll:true});}
 else if(!event.shiftKey&&(active===last||!dialog.contains(active))){event.preventDefault();first.focus({preventScroll:true});}
});
menu.addEventListener('pointerdown',event=>{const button=event.target.closest?.('[data-pass-charge-practice],[data-shoot-charge-practice]');if(!button||event.button!==0)return;event.preventDefault();const start=button.hasAttribute('data-shoot-charge-practice')?startShootChargePractice:startPassChargePractice;if(start('pointer',event.pointerId)){try{button.setPointerCapture?.(event.pointerId)}catch{}}});
document.addEventListener('pointerup',event=>{finishPassChargePractice('pointer',event.pointerId);finishShootChargePractice('pointer',event.pointerId);});
document.addEventListener('pointercancel',event=>{cancelPassChargePractice('pointer',event.pointerId);cancelShootChargePractice('pointer',event.pointerId);});
document.addEventListener('lostpointercapture',event=>{cancelPassChargePractice('pointer',event.pointerId);cancelShootChargePractice('pointer',event.pointerId);});
document.addEventListener('keyup',event=>{const keyboard=input.getBindings()?.keyboard||[],isPass=event.code===keyboard[0],isShoot=event.code===keyboard[1];if(!isPass&&!isShoot)return;if(screen!=='CONTROLS'){cancelPassChargePractice('keyboard',event.code);cancelShootChargePractice('keyboard',event.code);return;}if(isPass&&finishPassChargePractice('keyboard',event.code))updateGuidedHelpPractice('pass');if(isShoot)finishShootChargePractice('keyboard',event.code);});
window.addEventListener('blur',cancelControlsChargePractice);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelControlsChargePractice()});
document.addEventListener('keydown',event=>{
 if(screen!=='CONTROLS'||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.target?.closest?.('[data-help-practice]'))return;
 const bindings=input.getBindings(),actions=['pass','shoot','dribble','jump'];
 for(const [profileIndex,profile] of [bindings.keyboard,bindings.keyboard2].entries()){const index=profile?.indexOf(event.code)??-1;if(index>=0&&index<actions.length){event.preventDefault();if(profileIndex===0&&index===0){startPassChargePractice('keyboard',event.code);return;}if(profileIndex===0&&index===1){startShootChargePractice('keyboard',event.code);return;}updateGuidedHelpPractice(actions[index]);return;}}
});
menu.addEventListener('click',e=>{const galleryPick=e.target.closest?.('[data-studio-pick]');if(galleryPick){studioPickView(Number(galleryPick.dataset.studioPick));return;}const utBuy=e.target.closest('[data-online-ut-buy]');if(utBuy&&!utBuy.disabled){purchaseOnlineUltimateTeamItem(utBuy.dataset.onlineUtBuy,utBuy.dataset.utItem);return;}const browser=e.target.closest('[data-team-browse]');if(browser){showTeamBrowser(browser.dataset.teamBrowse);return;}const pick=e.target.closest('[data-pick-team]');if(pick){const select=$(pick.dataset.pickTeam);if(select){select.value=pick.dataset.teamId;select.dispatchEvent(new Event('change',{bubbles:true}));}return;}let train=e.target.closest('[data-train]');if(train){menu.dataset.trainPlayer=train.dataset.train;careerTrain();return}const renew=e.target.closest('[data-careerrenew]');if(renew){tryCareerContract(+renew.dataset.careerrenew);return}const recover=e.target.closest('[data-careerrecover]');if(recover){tryCareerRecover(+recover.dataset.careerrecover);return}let node=e.target.closest('[data-action]');if(node)action(node.dataset.action)});
menu.addEventListener('change',e=>{const id=e.target.id;switch(id){case 'managerContinent':managerRegion=e.target.value;managerCountry='';showManager();break;case 'managerCountry':managerCountry=e.target.value;showManager();break;case 'continentClub':updateTeamPickerIcon(id);break;case 'managerClub':updateTeamPickerIcon(id);break;case 'formation':refreshFormationPreview();break;case 'homeGroup':homeCategory=e.target.value;home=filteredNations(homeCategory)[0]?.[0]??home;away=home===away?(away+1)%TEAMS.length:away;showSetup(mode);break;case 'awayGroup':awayCategory=e.target.value;away=filteredNations(awayCategory).find(([i])=>i!==home)?.[0]??away;showSetup(mode);break;case 'homeTeam':home=+e.target.value;if(home===away)away=(away+1)%TEAMS.length;showSetup(mode);break;case 'awayTeam':away=+e.target.value;if(away===home)home=(home+1)%TEAMS.length;showSetup(mode);break;case 'arcadeShotPick':arcadeShotId=Object.hasOwn(SHOTS,e.target.value)?e.target.value:'';paintArcadeShotPreview();break;case 'arcadeShotPlayerPick':arcadeShotPlayerId=roster(home).some((p,index)=>p.id===e.target.value&&planFor(home).lineup.includes(index)&&['MF','FW'].includes(p.role)&&(!p.superAbility||p.superAbility.type==='shoot'))?e.target.value:'';break;case 'preTalkHome':preTalkChoices[0]=e.target.value;break;case 'preTalkAway':preTalkChoices[1]=e.target.value;break;case 'homeKit':case 'awayKit':{let side=id==='homeKit'?0:1;kitSelections[side]=e.target.value;store.put('kitSelections',kitSelections);if(screen==='KITS & TEAM TALKS')refreshKitContrastUI();else paintTeamPreviews();break;}case 'weather':opt.weather=e.target.value;break;case 'terrain':opt.terrain=e.target.value;break;case 'condition':opt.condition=e.target.value;break;case 'settingsStadium':opt.stadium=STADIUMS.some(v=>v.id===e.target.value)?e.target.value:DEFAULT_OPTIONS.stadium;store.put('options',opt);break;case 'halfSeconds':opt.halfSeconds=+e.target.value;break;case 'ballModel':opt.ballModel=VISUALFEEL.validBallModel(e.target.value);game.options.ballModel=opt.ballModel;store.put('options',opt);paintBallPreview();break;case 'aiStyle':opt.aiStyle=e.target.value;break;case 'matchDifficulty':case 'liveDifficulty':opt.difficulty=+e.target.value;game.options.difficulty=opt.difficulty;store.put('options',opt);{const hint=$('difficultyHint');if(hint)hint.textContent=aiTuning(opt.difficulty).name+' CPU: reaction, shot accuracy, passing, pressure and keeper response all scale by difficulty. Human players are unaffected.';}break;case 'marketTeam':showCareerMarket(+e.target.value);break;case 'customTeam':{const chosen=Number(e.target.value);if(!Number.isInteger(chosen)||!TEAMS[chosen])break;home=chosen;studioManagerContext=false;studioCareerContext=false;avatarIndex=0;showPlayerStudio(0);break;}case 'customPlayer':showPlayerStudio(+e.target.value);break;case 'editTeam':{const chosen=Number(e.target.value);if(!Number.isInteger(chosen)||!TEAMS[chosen])break;home=chosen;updateTeamPickerIcon(id);$('jsonRoster').value=JSON.stringify(roster(home),null,2);break;}}});
menu.addEventListener('change',e=>{if(e.target.id==='difficulty'){const hint=$('difficultyHint');if(hint)hint.textContent=aiTuning(+e.target.value).name+' CPU: reaction, shot accuracy, passing, pressure and keeper response all scale by difficulty. Human players are unaffected.';}});
menu.addEventListener('change',e=>{if(e.target.id==='releasePlayer'||e.target.name==='target')refreshCareerTransferQuote();if(e.target.id==='academyOutgoing')refreshAcademySigningSummary()});
$('pauseBtn').addEventListener('click',()=>{if(lanRuntime){if(confirm('Leave the LAN match? The connection will close.')){stopLanMatch();game.matchState='none';showHome();}return;}if(['play','penalty'].includes(game.matchState))pause()});
let rotateDismissed=false,rotatePromptReturnFocus=null;
function rotatePromptFocusFallback(){return menuVisible()?(menu.querySelector('.heading')||menu.querySelector('button:not([disabled])')):$('pauseBtn')}
function restoreRotatePromptFocus(forceFallback=false){const target=rotatePromptReturnFocus;rotatePromptReturnFocus=null;const style=target?.isConnected?getComputedStyle(target):null,visible=!!target?.isConnected&&!target.closest?.('.hidden,[hidden]')&&style?.display!=='none'&&style?.visibility!=='hidden'&&target.getClientRects().length>0&&!$('rotate').contains(target);(forceFallback||!visible?rotatePromptFocusFallback():target)?.focus?.({preventScroll:true})}
function setRotatePromptVisible(visible,forceFallback=false){const dialog=$('rotate'),wasVisible=!dialog.classList.contains('hidden');if(wasVisible===visible)return;if(visible){const active=document.activeElement;rotatePromptReturnFocus=active?.isConnected&&!dialog.contains(active)?active:null;dialog.classList.remove('hidden');$('dismissRotate').focus({preventScroll:true});return}dialog.classList.add('hidden');restoreRotatePromptFocus(forceFallback)}
function dismissRotatePrompt(){rotateDismissed=true;setRotatePromptVisible(false)}
$('dismissRotate').addEventListener('click',dismissRotatePrompt);
$('rotate').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismissRotatePrompt();return}if(event.key==='Tab'){event.preventDefault();event.stopPropagation();$('dismissRotate').focus({preventScroll:true});return}event.stopPropagation();if(event.key!=='Enter'&&event.key!==' ')event.preventDefault()});
function checkRotate(){let should=!rotateDismissed&&!menuVisible()&&matchMedia('(pointer:coarse)').matches&&innerHeight>innerWidth*1.12;setRotatePromptVisible(should,!should)}
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
function frame(now){pollMenuPad(now);const rawDelta=now-last;let dt=Math.min(.05,Math.max(0,rawDelta/1000||.016));last=now;updatePerformanceHUD(now,rawDelta);if(onlineMatchClient){if(onlineMatchClient.connected&&onlineMatchClient.matchId&&!menuVisible()&&game.matchState==='play'){onlineMatchSendAccumulator+=dt;while(onlineMatchSendAccumulator>=1/30){onlineMatchSendAccumulator-=1/30;try{onlineMatchClient.sendInput(++onlineMatchSequence,sampleOnlineActionInput(input));}catch(error){onlineIdentityError=error?.message||'Online input could not be sent.';break;}}}else onlineMatchSendAccumulator=0;}else if(lanRuntime){
  if(lanPeer?.ready){lanFailureSince=0;try{lanRuntime.step(dt);}catch(error){console.error('LAN match stopped:',error);stopLanMatch();game.matchState='none';page('LAN CONNECTION ERROR','Match stopped safely.',button('RETURN TO QUICK MATCH','navQuick','gold'),'navQuick');}}
  else if(!lanFailureSince)lanFailureSince=now;
  else if(now-lanFailureSince>4500&&!(lanRole==='host'&&screen==='FULL TIME'&&lanRuntime.resultAckStatus==='failed')){stopLanMatch();game.matchState='none';page('LAN MATCH ENDED','The remote player disconnected or the host ended the match.',button('RETURN TO QUICK MATCH','navQuick','gold'),'navQuick');}
  const receiptRecovery=$('lanHostReceiptRecovery');if(receiptRecovery)receiptRecovery.hidden=!(lanRole==='host'&&lanRuntime?.resultAckStatus==='failed');
  if(lanRole==='guest'&&game.matchState==='finished'&&!lanFinish)lanFinish={type:'finished',score:game.score.slice()};
 if(lanFinish&&(lanRole!=='host'||lanRuntime?.resultDelivered)){const result=lanFinish;lanFinish=null;void fulltime(result);}
 const hostReceiptSettled=lanRole==='host'&&['confirmed','unconfirmed'].includes(lanRuntime?.resultAckStatus),guestReceiptSettled=lanRole==='guest'&&lanRuntime?.guestResultAckStatus==='confirmed';
 if(lanResultCleanupPending&&(hostReceiptSettled||guestReceiptSettled))stopLanMatch();
 }else if(!onlineMatchClient&&game.matchState==='play'){game.update(dt);updateTrainingCrossCoach();}else if(game.matchState==='penalty')game.updatePK(dt);// The network simulation has two humans on both peers; only the local user's
 // selected player may receive a Breath ring. Local couch Versus stays dual-human.
 game.localBreathSide=lanRole==='host'?0:lanRole==='guest'?1:null;
 renderer.frame(game,dt,menuVisible());if(screen==='home'&&menuVisible())drawPoster();uiT-=dt;if(uiT<=0){uiT=.1;if(!menuVisible())drawHUD()}if(toastTime&&now>toastTime){$('gameToast').classList.add('hidden');toastTime=0}checkRotate();requestAnimationFrame(frame)}
game.init({home,away,options:opt});game.matchState='none';window.NekketsuHD={audio,version:RELEASE.version,game,renderer,input,teams:TEAMS,shots:SHOTS,aiLevels:AI_LEVELS,rosterFor,getCareer:()=>career,getContinental:()=>continentalRun,confederations:CONTINENTS,continentalMapping:CONTINENTAL_TEAMS,kitsFor:team=>KIT_CHOICES.map(k=>kitFor(team,k)),getKitChoices:()=>kitSelections.slice(),getTeamPlan:i=>planFor(i),getMorale:team=>game.teamMorale(team)};window.NekketsuHD.ballModels=VISUALFEEL.BALL_MODELS;window.NekketsuHD.facingView=VISUALFEEL.facingView;window.NekketsuHD.impactStun=VISUALFEEL.impactStun;window.NekketsuHD.rollDelta=VISUALFEEL.rollDelta;window.NekketsuHD.personalityFor=p=>BPWPERSONALITY.profileFor(p);window.NekketsuHD.personalityMotion=(p,params)=>BPWPERSONALITY.sampleMotion(BPWPERSONALITY.profileFor(p),params);window.SupermagicFootball=window.NekketsuHD;window.SupermagicFootball.conceptModularStatus=CONCEPT_MODULAR.status;window.SupermagicFootball.portraitFit=portraitFit;window.SupermagicFootball.studio={directions:STUDIO_DIRS,getDirection:()=>studioDirection,rotate:studioRotate,getAction:()=>studioAction,fitKeeperPose:drawFittedKeeperStudioPose};
initializeOnlineAccount();
menu.innerHTML='<div class="menubox"><p class="muted" role="status" aria-live="polite">Loading local progress…</p></div>';
void tokenWallet.ready.then(()=>{showHome();requestAnimationFrame(frame)});
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
menu.addEventListener('input',e=>{if(e.target?.matches?.('input[id^=audio_]')){const value=`${e.target.value}%`,output=$(e.target.id+'Value');if(output)output.textContent=value;e.target.setAttribute('aria-valuetext',value)}});
document.addEventListener('visibilitychange',()=>document.hidden?audio.suspend():audio.resume());
window.addEventListener('pagehide',()=>{stopLanMatch();audio.suspend()});
window.addEventListener('pageshow',()=>{if(!document.hidden)audio.resume()});

})();
