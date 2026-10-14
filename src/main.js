import {ArcadeAudio,AUDIO_DEFAULTS} from './audio.js';
import {TEAM_TALKS,moodLabel} from './morale.js';
import {JAPAN_ROSTER,TEAMS,rosterFor,SHOTS,DEFAULT_OPTIONS,DEFAULT_LINEUP,WEATHER,TERRAIN,CONDITIONS,FORMATIONS} from './data.js';
import {Input} from './input.js';
import {GameEngine,WORLD} from './engine.js';
import {Renderer} from './render.js';
import {installExpansion,avatarFor} from './expanded.js';
import {installBPWWorldCups,BPW_YEARS} from './bpw_world_cups.js';
import {installBPWAllTime} from './bpw_alltime.js';
import {createCareer,currentCareerFixture,advanceCareer,standings,nextSeason,purchase,upgradeFacility,trainPlayer,scoutAcademy,signAcademy,renewContract,recoverPlayer,careerCoverage,recordMatchFitness} from './career.js';
import {CONTINENTS,SIX_TOP_BY_CONTINENT,installContinentalClubs} from './continental.js';
import {createTournament,tournamentCurrent,tournamentAdvance,tournamentStandings,tournamentProgress,validateTournament} from './tournaments.js';
import {AI_LEVELS,aiTuning} from './ai.js';
import {withStats,NUMERIC_STATS,overallForPosition} from './stats.js';
import {abilityLevel} from './special_levels.js';
import {kitFor,KIT_CHOICES} from './kits.js';
import {teamIdentity,countryFlag,countryCode,isClub} from './identity.js';
import {careerClubIds,clubRegion,clubCountry,countryName,availableRegions,availableCountries,clubsInCountry} from './club_filters.js';
import {defaultPlan,safePlan,validatePlan,ATTACK_STYLES,DEFENCE_STYLES} from './tactics.js';
const $=id=>document.getElementById(id), input=new Input(), renderer=new Renderer($('field'));
const store={get(k,v){try{return JSON.parse(localStorage.getItem('legend_'+k))??v}catch{return v}},put(k,v){try{localStorage.setItem('legend_'+k,JSON.stringify(v))}catch{}}};
installExpansion(TEAMS,SHOTS);
const CONTINENTAL_TEAMS=installContinentalClubs(TEAMS,SHOTS);
for(const team of TEAMS)if(team.customRoster)team.customRoster=rosterFor(team.index).map(withStats);
const clubs=store.get('customClubs',[]);
for(const club of clubs){if(club&&String(club.id||'').startsWith('club_')&&typeof club.name==='string'&&/^#[0-9a-fA-F]{6}$/.test(club.primary||'')&&Array.isArray(club.customRoster)&&club.customRoster.length===12){club.index=TEAMS.length;TEAMS.push(club)}}
// Append after loaded user clubs: six original World Cup BPW indexes and
// all legacy saved-team indices remain stable; the all-time squad is last.
installBPWWorldCups(TEAMS,SHOTS,avatarFor);
installBPWAllTime(TEAMS,SHOTS,avatarFor);
let career=store.get('managerCareer',null);
// Migrate pre-0.6 custom-club index saves: v0.5 appended user clubs at index 83.
if(career&&!career.saveSchema&&clubs.length){const oldToNew=id=>Number.isInteger(id)&&id>=83&&id<83+clubs.length?(TEAMS.findIndex(t=>t.id===clubs[id-83].id)):id;
 if(career.club>=83&&career.club<83+clubs.length){career.club=oldToNew(career.club);career.members=career.members.map(oldToNew);career.fixtures=career.fixtures.map(r=>r.map(pair=>pair.map(oldToNew)));career.table=Object.fromEntries(Object.entries(career.table).map(([id,v])=>[oldToNew(+id),v]));career.history.forEach(r=>r.against=oldToNew(r.against));if(career.lastResult)career.lastResult.against=oldToNew(career.lastResult.against);career.saveSchema=2;store.put('managerCareer',career)}
}
let continentalRun=store.get('continentalRun',null);if(!validateTournament(continentalRun,TEAMS))continentalRun=null;
let continentSelection='UEFA';
let managerRegion='',managerCountry='';
const opt={...DEFAULT_OPTIONS,...store.get('options',{})};
input.setBindings(store.get('controllerBindings',input.getBindings()));
const kitSelections=(()=>{const k=store.get('kitSelections',null);return Array.isArray(k)?[k[0]==='away'?'away':'home',k[1]==='home'?'home':'away']:['home','away'];})();
let preTalkChoices=['none','none'];let home=0,away=9,homeCategory='all',awayCategory='all',mode='quick',humans=1,formation=opt.formation||'2-1-2',lineup=store.get('lineup',DEFAULT_LINEUP.slice()), edits=store.get('edits',{}),screen='home';
let teamPlans=store.get('teamPlans',{}),squadContext='home',squadSide=0;
let league=store.get('league',{played:0,wins:0,draws:0,losses:0,points:0,playoff:0,stage:'qualifier',games:[]});
const audio=new ArcadeAudio({...AUDIO_DEFAULTS,...store.get('audioOptions',{}),...(opt.sfx===false?{mute:true}:{})});
const game=new GameEngine(opt,input),menu=$('menu'),hud=$('hud'),touch=$('mobile');
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
const planFor=i=>safePlan(teamPlans[TEAMS[i].id],roster(i),i);
const identity=i=>teamIdentity(TEAMS[i]);
const menuVisible=()=>!menu.classList.contains('hidden');
const closeMenu=()=>{input.cancelAll();audio.sceneChange('match');menu.classList.add('hidden');hud.classList.remove('hidden');touch.classList.toggle('hidden',!matchMedia('(pointer:coarse)').matches)};
const show=(html,id='home')=>{audio.sceneChange(id==='HALF TIME'?'halftime':id==='PAUSED'?'silent':'menu');screen=id;menu.classList.remove('hidden','blank');menu.innerHTML=`<div class="menubox"><div class="screenTools">${button('⛶ FULLSCREEN','fullscreen','minor fullscreenTool')}</div>${html}<div class="copyright">INDEPENDENT HD SOCCER ENGINE • ORIGINAL CODE & GRAPHICS • NO EMULATOR • EARLY ACCESS BUILD</div></div>`;hud.classList.add('hidden');touch.classList.add('hidden')};
function page(title,subtitle,body,returnAction='home'){if(returnAction==='home'&&menuEntryReturn!=='home')returnAction=menuEntryReturn;show(`<div class="row space"><div><div class="topline">HIGH-DEFINITION CARTOON SOCCER • VERSION 0.8.24.12</div><h1 class="heading">${title}</h1><div class="subtitle">${subtitle}</div></div>${button('← BACK',returnAction,'minor')}</div>${body}`,title)}
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
 show(`<div class="navScreen"><div class="row space navHeader"><div><div class="topline">SUPERMAGIC FOOTBALL · 0.8.24.12</div><h1 class="heading">${escapeHTML(title)}</h1><p class="subtitle">${escapeHTML(subtitle)}</p></div>${button('← BACK',back,'minor navBack')}</div><div class="navList">${cards}</div>${extra}</div>`,id);
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
 navItem('Manage Career Saves','navSaveManagement','Export or import a save backup.','active','💾')],'home');}
function showCupsMenu(){menuChoices('nav-cups','LEAGUES & CUPS','Choose an existing competition or explore planned tournaments.',[
 navItem('International','navInternational','World Cup and future national cups.','active','🌍'),
 navItem('Clubs','navClubs','Existing continental championships and future leagues.','active','🏆'),
 navItem('World League · Arcade','league','The original playable World League challenge.','active','⚽'),
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
function showSaveMenu(parent='navSettings'){menuChoices('nav-saves','SAVE MANAGEMENT','Safely back up or restore local progress.',[
 navItem('Export All Saves','exportSave','Download a JSON backup without changing progress.','active','⬇'),
 navItem('Import Save','importSave','Requires explicit confirmation before replacing progress.','active','⬆')],parent,`<input id="saveImportFile" type="file" accept=".json,application/json" class="hidden" aria-label="Import saved game"/>`);}
function showAbout(){page('ABOUT SUPERMAGIC FOOTBALL','Original offline cartoon arcade football.',`<div class="panel"><p>Alpha v0.8.24.12 · Independent football game with original graphics and audio.</p><p class="muted">Four action buttons · ${TEAMS.length} teams · saved locally on your device.</p>${button('← MAIN MENU','home','gold')}</div>`,'home');}
function showHome(){
 menuBackAction='home';menuEntryReturn='home';
 show(`<header class="homeMasthead"><div><div class="topline">ARCADE FOOTBALL · SUPER SHOTS · YOUR FOOTBALL UNIVERSE</div><h1 class="heading logoHeading">SUPERMAGIC <em>FOOTBALL</em></h1><p class="subtitle">Pick a mode. All original gameplay and editing tools remain accessible.</p></div><span class="homeVersion">ALPHA 0.8.24.12</span></header>
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
 <p class="muted" style="margin-top:12px">Starting a new tournament overwrites the previous continental save. Manager career is preserved.</p>
 <div class="stat"><strong>COMPETITION SYSTEM</strong><span>${{league:'36 teams · eight matches · playoffs · knockout','regional-league':'32 teams · East and West league phases · knockout',groups:'Group matches · top-two qualifiers · knockout','short-groups':'Two groups of four · semifinals · final',knockout:'27-team seeded knockout · five byes'}[comp.format]}</span></div>
 <div class="stat"><strong>ROSTER STATUS</strong><span>12 players each · placeholders explicitly labelled</span></div>
 </div><div class="panel"><h3 class="titleSmall">FEATURED CLUBS</h3><div class="continentClubList">${ids.filter(i=>TEAMS[i].topSix).map(i=>`<div class="clubRow">${identity(i)}<div><strong>${escapeHTML(TEAMS[i].name)}</strong><div class="rosterMeta">${escapeHTML(countryCode(TEAMS[i])||'CLB')} · ${TEAMS[i].rank} OVERALL · ${roster(i).filter(p=>p.fictional).length} academy stand-ins</div></div></div>`).join('')}</div></div></div>`, 'continents');
}
function startContinent(){const value=+$('continentClub').value;try{continentalRun=createTournament(continentSelection,value,TEAMS,CONTINENTAL_TEAMS);store.put('continentalRun',continentalRun);showTournament()}catch(e){alert(e.message)}}
function showTournament(){if(!continentalRun)return showContinents();const t=continentalRun,c=confed(t.compId),fx=tournamentCurrent(t),my=TEAMS[t.club],rank=tournamentStandings(t),position=rank.findIndex(x=>x.id===t.club)+1;
 const standingsHTML=rank.slice(0,Math.min(36,rank.length)).map((p,i)=>`<tr class="${p.id===t.club?'myTeam':''}"><td>${i+1}</td><td>${teamIdentity(TEAMS[p.id])} ${escapeHTML(TEAMS[p.id].name)}</td><td>${p.p}</td><td>${p.w}</td><td>${p.d}</td><td>${p.l}</td><td>${p.gf-p.ga}</td><td>${p.pts}</td></tr>`).join('');
 page('CONTINENTAL CAMPAIGN',`${c.name} · ${c.season} · ${my.name}`,
 `<div class="careerTop"><div class="metric"><small>YOUR CLUB</small><strong>${escapeHTML(my.name)}</strong></div><div class="metric"><small>COMPETITION</small><strong>${c.id}</strong></div><div class="metric"><small>LEAGUE POSITION</small><strong>#${position}</strong></div><div class="metric"><small>PRIZE EARNINGS</small><strong>${eur(t.earned)}</strong></div></div>
 <div class="twoCol"><div class="panel"><div class="badge">${escapeHTML(tournamentProgress(t))}</div>
 <div class="fixture"><span>${t.phase==='finished'?'🏁 CAMPAIGN COMPLETE':fx?.bye?'🟢 BYE — AUTO ADVANCE':'⚽ NEXT MATCH'}</span><strong>${t.phase==='finished'?(t.winner===t.club?'🏆 CONTINENTAL CHAMPIONS!':'ELIMINATED — TRY AGAIN'):fx?.bye?'Automatic qualification':`${escapeHTML(my.name)} VS ${escapeHTML(TEAMS[fx?.opponent]?.name||'TBD')}`}</strong></div>
 <div class="row">${t.phase==='finished'?button('↻ NEW CAMPAIGN','continentPick_'+t.compId,'gold'):fx?.bye?button('➜ ADVANCE THROUGH BYE','continentBye','gold'):button('▶ PLAY CHAMPIONSHIP MATCH','continentKickoff','gold')}${button('ALL CONTINENTS','continents','minor')}</div>
 <div class="stat"><strong>CONTINENT'S TOP SIX</strong><span>${c.featured.split('|').map(escapeHTML).join(', ')}</span></div><div class="scroll" style="max-height:190px;margin-top:12px">${t.history.slice(0,18).map(h=>`<div class="stat"><strong>${escapeHTML(h.stage||'MATCHDAY '+h.round||'MATCH')}</strong><span>${h.kind==='bye'?'BYE':(TEAMS[h.a]?.name||'')+' '+(h.scoreA??'')+'–'+(h.scoreB??'')+' '+(TEAMS[h.b]?.name||'')}</span></div>`).join('')||'<div class="muted">No completed fixtures yet.</div>'}</div>
 </div><div class="panel"><h3 class="titleSmall">CONTINENTAL STANDINGS</h3><div class="scroll continentTable"><table class="miniTable"><thead><tr><th>#</th><th>CLUB</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th></tr></thead><tbody>${standingsHTML}</tbody></table></div><p class="muted">${t.phase==='league'?'Standings update after every complete arcade matchday.':'Knockout results determine elimination and trophy winners.'}</p></div></div>`, 'continents');
}
function continentKickoff(){const fx=tournamentCurrent(continentalRun);if(!fx||fx.bye)return showTournament();mode='continental';home=continentalRun.club;away=fx.opponent;start()}
function continentBye(){try{tournamentAdvance(continentalRun,TEAMS);store.put('continentalRun',continentalRun);showTournament()}catch(e){alert(e.message)}}

function showGallery(){
 const japan=roster(0),ids=Object.entries(SHOTS);page('SUPER SHOT ENCYCLOPEDIA','Explore all 12 Japanese signature moves and the opposing countries’ team shots.',
 `<div class="shotGrid">${ids.map(([id,shot],i)=>{let hero=japan.find(p=>p.shot===id);let team=TEAMS.find(t=>t.shot===id);return `<div class="shotCard"><canvas class="shotArt" data-shot="${id}" width="120" height="95"></canvas><div><div class="rosterName">${escapeHTML(shot.name)}</div><div class="rosterMeta">${escapeHTML(hero?hero.name:team?team.name:'Special move')}</div><div class="rosterMeta">${escapeHTML(shot.behavior.toUpperCase())} · POWER ${Math.round(shot.impact*100)}%</div></div></div>`}).join('')}</div><p class="muted">Special-shot designs and physics are reconstructed and remain subject to reference-game fidelity work.</p>`);
 drawGallery();
}
function drawGallery(){document.querySelectorAll('.shotArt').forEach(c=>{let x=c.getContext('2d'),id=c.dataset.shot,shot=SHOTS[id];x.clearRect(0,0,c.width,c.height);let g=x.createRadialGradient(60,45,3,60,45,70);g.addColorStop(0,shot.color+'66');g.addColorStop(1,'#092b3a');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);x.save();x.translate(60,46);x.scale(1.15,1.15);renderer.drawTransformation(x,{...shot,id},performance.now()/1000);x.restore()})}
function showSetup(newMode='quick'){
 mode=newMode;if(mode==='league')home=0;
 if(home===away)away=(away+1)%TEAMS.length;
 if(!filteredNations(homeCategory).some(([i])=>i===home))homeCategory='all';if(!filteredNations(awayCategory).some(([i])=>i===away))awayCategory='all';
 const label=mode==='versus'?'TWO-PLAYER VERSUS':mode==='training'?'TRAINING ARENA':mode==='pk'?'PENALTY SHOWDOWN':'MATCH SETUP';
 page(label,'Select your nations, weather, pitch, team tactics and match conditions.',
 `<div class="twoCol setupCols"><div class="panel">
 <div class="row space"><span class="badge">CLASSIC / 2026 NATIONS / CLUBS / LEGENDS</span><span class="pill">${mode==='versus'?'TWO LOCAL PLAYERS':'VS CPU'}</span></div>
 <div class="previewCombat"><div class="nationCard">
 ${identity(home)}<canvas class="teamPortrait" id="homePortrait" width="190" height="175"></canvas><strong id="homePreviewName">${TEAMS[home].name}</strong><span class="nationSub" id="homeKitCaption">HOME • ATTACK →</span>
 </div><div class="versusBadge">VS</div><div class="nationCard">${identity(away)}<canvas class="teamPortrait" id="awayPortrait" width="190" height="175"></canvas><strong id="awayPreviewName">${TEAMS[away].name}</strong><span class="nationSub" id="awayKitCaption">← ATTACK • AWAY</span></div></div>
 <div class="selectors"><div>${field('HOME CATEGORY','homeGroup',categoryOptions,homeCategory)}${teamField('HOME TEAM','homeTeam',filteredNations(homeCategory),home)}</div><div>${field('AWAY CATEGORY','awayGroup',categoryOptions,awayCategory)}${teamField('AWAY TEAM','awayTeam',filteredNations(awayCategory),away)}</div></div>
 <div class="kitChooser"><div class="kitSelector"><span class="kitDot" id="homeKitDot"></span>${field('HOME TEAM KIT','homeKit',[['home','HOME KIT'],['away','AWAY KIT']],kitSelections[0])}</div><div class="kitSelector"><span class="kitDot" id="awayKitDot"></span>${field('AWAY TEAM KIT','awayKit',[['home','HOME KIT'],['away','AWAY KIT']],kitSelections[1])}</div></div>
 <div class="matchupInfo"><span>HOME SPECIAL: <b>${TEAMS[home].shot.toUpperCase()}</b></span><span>AWAY SPECIAL: <b>${TEAMS[away].shot.toUpperCase()}</b></span></div>
 </div><div class="panel setupOptions"><div class="badge">MATCH RULES & ENVIRONMENT</div>
 ${field('WEATHER','weather',WEATHER.map(v=>[v,v]),opt.weather)}
 ${field('PLAYING SURFACE','terrain',TERRAIN.map(v=>[v,v==='Classic'?'Classic · Weathered Famicom-style pitch':v]),opt.terrain)}
 ${field('PITCH CONDITION','condition',CONDITIONS.map(v=>[v,v]),opt.condition)}
 ${field('SECONDS PER HALF','halfSeconds',[60,120,180,300].map(v=>[v,v+' sec']),opt.halfSeconds)}
 ${field('CPU DIFFICULTY','matchDifficulty',aiChoices(),opt.difficulty)}${field('CPU STRATEGY','aiStyle',['Balanced','Aggressive','Defensive'].map(v=>[v,v]),opt.aiStyle||'Balanced')}${difficultyHint()}
 <p class="muted">Classic pitch uses uneven, ochre-colored ground patches. Other surfaces change running speed and ball friction.</p>
 </div></div>
 <div class="panel" style="margin-top:12px"><h3 class="titleSmall">🗣 PRE-MATCH TEAM TALKS</h3><p class="muted">Players react differently depending on personality. Talks can help or backfire. Each can be given once before kickoff.</p><div class="tacticsGrid">${field('HOME TEAM TALK','preTalkHome',Object.entries(TEAM_TALKS).map(([k,v])=>[k,v.name]),preTalkChoices[0])}${field('AWAY TEAM TALK','preTalkAway',Object.entries(TEAM_TALKS).map(([k,v])=>[k,v.name]),preTalkChoices[1])}</div></div>
 <div class="row setupManagerActions">${button('⚙ HOME TACTICS','prepHome')}${button('⚙ AWAY TACTICS','prepAway')}<span class="muted">Set formation, captain, starters, substitutions and tactical style before kickoff.</span></div>
 <div class="row space setupFoot"><span class="muted">P1 MOVE WASD · J SHOOT (HOLD TO CHARGE) · K PASS · I DRIBBLE · SPACE JUMP${mode==='versus'?' / P2 ARROWS, COMMA, PERIOD, KEYPAD DECIMAL, RIGHT CTRL':''}</span>${button('▶ KICK OFF','kickoff','gold')}</div>`);
 paintTeamPreviews();
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
function drawHUD(){let p=game.controlledPlayer(0),s=game.score;$('homeflag').innerHTML=identity(home);$('awayflag').innerHTML=identity(away);$('homename').textContent=TEAMS[home].name.toUpperCase();$('awayname').textContent=TEAMS[away].name.toUpperCase();$('scoring').innerHTML=`${s[0]} <span>:</span> ${s[1]}`;$('weatherHud').textContent=game.weather.toUpperCase();let secs=Math.max(0,Math.ceil(game.matchSeconds-game.clock));$('timeHud').textContent=`${game.half===1?'1ST':'2ND'} • ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;if(p){const inPossession=game.ball.owner?.t===0;const ownBall=game.ball.owner===p;const goalkeeperHasBall=game.ball.owner?.t===0&&game.ball.owner?.keeper;for(const [key,text] of Object.entries(inPossession?{shoot:'SHOOT',pass:'PASS',dribble:'DRIBBLE',jump:'JUMP'}:{shoot:'SLIDE',pass:'TACKLE',dribble:'SWITCH',jump:'JUMP'})){const b=document.querySelector('[data-act="'+key+'"]');if(b&&b.textContent!==(goalkeeperHasBall&&key==='pass'?'CLEAR':text))b.textContent=goalkeeperHasBall&&key==='pass'?'CLEAR':text;}$('playerTag').textContent=`#${p.src.num} ${p.src.name.toUpperCase()}  ·  ${(p.src.superAbility?.type==='defence'&&!game.ball.owner?p.src.superAbility.name:p.src.shotName).toUpperCase()}  · LV${abilityLevel(p,(p.src.superAbility?.type==='defence'&&!game.ball.owner)?'defence':'shot')}  ·  ${(p.src.superAbility?.type==='defence'&&!game.ball.owner?(p.abilityCd||0):p.specialCd)>0?'SUPER RECHARGING':'SUPER READY'}  ·  ${moodLabel(p.morale)} ${Math.round(p.morale)}%`;const staminaBar=$('staminaFill');if(staminaBar)staminaBar.style.width=Math.round(100*(1-(p.fatigue||0)))+'%';const staminaText=$('staminaText');if(staminaText)staminaText.textContent=`STAMINA ${Math.round(100*(1-(p.fatigue||0)))}%`;const meter=$('powerFill');if(meter)meter.style.width=Math.max(0,Math.min(100,100*(p.charge||0)/1.2))+'%';const superLabel=$('specialMeter');if(superLabel){let defensive=p.src.superAbility?.type==='defence'&&!game.ball.owner;let abilityCooldown=defensive?(p.abilityCd||0):p.specialCd;superLabel.textContent=defensive?(abilityCooldown>0?'DEF CD '+abilityCooldown.toFixed(1)+'s':'★ DEF READY'):(abilityCooldown>0?'RECHARGE '+abilityCooldown.toFixed(1)+'s':'★ READY');superLabel.classList.toggle('charging',abilityCooldown>0)}}}
function showLeague(){home=0;mode='league';let list=[10,9,11,12];away=league.stage==='finals'?list[Math.min(league.playoff||0,3)]:(league.played%12)+1;
 page('WORLD LEAGUE','Win at least 16 games and accumulate 70 points to qualify for four championship finals.',`<div class="twoCol"><div class="panel"><div class="titleSmall">JAPAN • ${league.stage.toUpperCase()}</div><div class="tripleCol">${[['WINS',league.wins],['POINTS',league.points],['GAMES',league.played]].map(([a,b])=>`<div class="panel" style="text-align:center"><div class="badge">${a}</div><div style="font-size:34px;color:#ffdd76;font-weight:900">${b}</div></div>`).join('')}</div><p class="muted">Qualification: 16 wins / 70 points. Finals: ${league.playoff||0} / 4 victories.</p><div class="stat"><span>NEXT OPPONENT</span><strong>${TEAMS[away].name}</strong></div><div class="row" style="margin-top:15px">${league.stage==='champion'?'<strong>🏆 CUP WON — CHAMPIONS!</strong>':button('▶ NEXT MATCH','leagueKickoff','gold')}${button('RESET SEASON','clearLeague')}</div></div><div class="panel"><div class="titleSmall">MATCH HISTORY</div><div class="scroll"><table class="miniTable"><thead><tr><th>Opponent</th><th>Result</th></tr></thead><tbody>${(league.games||[]).slice(0,20).map(g=>`<tr><td>${escapeHTML(g.team)}</td><td>${g.a} - ${g.b}</td></tr>`).join('')||'<tr><td colspan="2">No results yet.</td></tr>'}</tbody></table></div></div></div>`)}
function showSquad(side=0,origin='home'){
 squadSide=side;squadContext=origin;
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
 <p class="muted">${origin==='pause'?`SUBSTITUTIONS: <b>${game.substitutionsUsed[side]} / ${game.maxSubstitutions}</b> used. Only ${game.maxSubstitutions} changes allowed; substituted-off players cannot return.`:'Before kickoff, choose any six starters. During play, use Pause to substitute up to three players.'} Substitutes enter with their own fitness; exhausted players lose speed, precision and tackling strength.</p>
 <h3 class="titleSmall">LEADERSHIP & SET PIECES</h3><div class="tacticsGrid">${[['captain','CAPTAIN'],['penalty','PENALTY KICKS'],['freeKick','FREE KICKS'],['corner','CORNERS']].map(([key,label])=>`<div>${field(label,'role_'+key,key==='captain'?fieldPlayerOptions:roleOptions,plan[key])}</div>`).join('')}</div>
 <h3 class="titleSmall">TEAM INSTRUCTIONS</h3><div class="tacticsGrid"><div>${field('ATTACKING STYLE','attackStyle',ATTACK_STYLES.map(v=>[v,v]),plan.attack)}</div><div>${field('DEFENSIVE STYLE','defenceStyle',DEFENCE_STYLES.map(v=>[v,v]),plan.defence)}</div></div>
 <p class="muted">Possession prioritizes passes; Direct pushes forward and shoots earlier. High Press closes down faster; Deep Block holds positions. Captain boosts team passing slightly. Penalty taker accuracy affects shootouts. Free-kick/corner roles are saved, but those restart mechanics are not yet playable.</p>
 <div class="row">${button('✓ SAVE TACTICS','saveSquad','gold')}${button('RESTORE DEFAULT','resetSquad')}${button('← BACK',origin==='setup'?'returnSetup':origin==='pause'?'returnPause':'home')}</div></div><div class="panel"><h3 class="titleSmall">12-PLAYER ROSTER · POSITION OVR</h3><div class="roster">${players.map((p,i)=>`<div class="rosterCard ${plan.lineup.includes(i)?'startingPlayer':''}"><canvas class="portrait playerFaceCanvas" width="80" height="88" data-squad-avatar="${i}" role="img" aria-label="Cartoon face of ${escapeHTML(p.name)}"></canvas><div><div class="rosterName">${plan.lineup.includes(i)?'● STARTING ':'○ BENCH '}#${p.num} ${escapeHTML(p.name)}</div><div class="rosterMeta"><span class="ovrBadge" title="Calculated from six ${p.role} attributes">${p.role} OVR ${playerOVR(p)}</span>${p.legendaryRating?` · <span class="ovrBadge" title="User-selected all-time legendary card rating (not the calculated position OVR)">LEG ${p.legendaryRating}</span>`:''} · ${origin==='pause'?`FIT ${Math.round(100*(1-(game.fatigueLedger[side][p.id]??0)))}% · `:`CON ${p.condition??100}% · `}STA ${p.stamina} · DEF ${p.defence} · SPD ${p.speedRating} · AGI ${p.agility} · DRB ${p.dribbling}</div><div class="rosterMeta">SHOT ${p.shootPower}/${p.shootAccuracy} · HEAD ${p.heading} · PASS ${p.passing} · CROSS ${p.crossing} · STYLE ${escapeHTML(p.dribbleType||'sideStep')}</div><div class="rosterMeta">${p.role==='GK'?`GK DIVING ${p.gkDiving} · GK SKILL ${p.gkSkill} · `:''}ABILITY ${escapeHTML(p.superAbility?.name||'NONE')} · SUPER SHOT LV${abilityLevel(p,'shot')} · DEF LV${p.superAbility?.type==='defence'?abilityLevel(p,'defence'):'—'} · GK LV${p.gkSuperAbility?abilityLevel(p,'keeper'):'—'}</div></div></div>`).join('')}</div></div></div>`,origin==='setup'?'returnSetup':origin==='pause'?'returnPause':'home');
 refreshFormationPreview();
}
function drawTeamFace(canvas,player,teamIndex){if(!canvas||!player)return;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);const gradient=ctx.createLinearGradient(0,0,0,canvas.height);gradient.addColorStop(0,'#347885');gradient.addColorStop(1,'#102d44');ctx.fillStyle=gradient;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(canvas.width/2,canvas.height*1.26);const z=Math.min(canvas.width/108,canvas.height/98)*1.08;ctx.scale(z,z);renderer.drawPlayer(ctx,{...game.player(0,3),src:player,team:0,i:0,x:0,y:0,z:0,t:0,face:1,dx:0,dy:0,anim:0,action:'idle',controlled:false},{getTeam:()=>TEAMS[teamIndex],options:{showNames:false}});ctx.restore();}
function refreshFormationPreview(){const board=$('formationPitch');if(!board)return;const teamIndex=squadContext==='pause'?game.teamIds[squadSide]:squadSide===0?home:away;const players=squadContext==='pause'?game.rosters[squadSide]:roster(teamIndex);const key=$('formation')?.value||'2-1-2';const labels={'2-1-2':['GK','DF','DF','MF','FW','FW'],'1-2-2':['GK','DF','MF','MF','FW','FW'],'2-2-1':['GK','DF','DF','MF','MF','FW'],'1-3-1':['GK','DF','MF','MF','MF','FW'],'1-1-3':['GK','DF','MF','FW','FW','FW'],'3-1-1':['GK','DF','DF','DF','MF','FW']}[key]||['GK','DF','DF','MF','FW','FW'];menu.querySelectorAll('.lineupRow>strong').forEach((node,i)=>node.textContent=labels[i]||'MF');const positions=FORMATIONS[key]||FORMATIONS['2-1-2'];const slots=Array.from({length:6},(_,i)=>Number($('pos'+i)?.value));menu.querySelectorAll('[data-lineup-ovr]').forEach((badge,i)=>{badge.textContent='OVR '+playerOVR(players[slots[i]],labels[i]);badge.title='Calculated for '+labels[i]+' position';});board.innerHTML=positions.map((pos,i)=>`<div class="formationSlot" style="left:${Math.round(pos.x*100)}%;top:${Math.round(pos.y*100)}%" title="${escapeHTML(players[slots[i]]?.name||'Player')}"><canvas width="86" height="90" data-formation-avatar="${slots[i]}" aria-label="${escapeHTML(players[slots[i]]?.name||'Player')} face" role="img"></canvas><small>${escapeHTML((players[slots[i]]?.name||'Player').split(' ').slice(-1)[0])}</small><span class="formationOvr" aria-label="${labels[i]} overall rating ${playerOVR(players[slots[i]],labels[i])}">${labels[i]} ${playerOVR(players[slots[i]],labels[i])}</span></div>`).join('');menu.querySelectorAll('[data-squad-avatar],[data-formation-avatar]').forEach(canvas=>{const j=Number(canvas.dataset.squadAvatar??canvas.dataset.formationAvatar);drawTeamFace(canvas,players[j],teamIndex)});}

function exportSave(){const keys=['customClubs','managerCareer','continentalRun','options','league','lineup','edits','teamPlans','controllerBindings','kitSelections','audioOptions'];const data={product:'Supermagic Football',version:'0.8.24.12',exportedAt:new Date().toISOString(),data:Object.fromEntries(keys.map(k=>[k,store.get(k,null)]))};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Supermagic_Football_Save_'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}
async function importSave(file){try{if(!file||file.size>5_000_000)throw Error('Save file missing or larger than 5MB');const parsed=JSON.parse(await file.text());if(!['Supermagic Football','Nekketsu Legends HD'].includes(parsed.product)||!parsed.data||typeof parsed.data!=='object')throw Error('Not a Supermagic Football save file');const allow=['customClubs','managerCareer','continentalRun','options','league','lineup','edits','teamPlans','controllerBindings','kitSelections','audioOptions'];if(!confirm('Importing this save will REPLACE local progress on this device. Continue?'))return;for(const key of allow){if(Object.hasOwn(parsed.data,key)&&parsed.data[key]!==null)store.put(key,parsed.data[key]);}alert('Save imported. Game will reload to apply the new progress.');location.reload()}catch(e){alert('Could not import save: '+e.message)}}

function showControls(){
 const bindings=input.getBindings(),codes=['KeyJ','KeyK','KeyI','KeyL','KeyQ','KeyE','KeyF','KeyG','KeyH','KeyU','KeyO','Space','Digit1','Digit2','Numpad0','Numpad1','Numpad2','Numpad3','NumpadDecimal','ControlRight','Comma','Period','Slash'];
 const names={Space:'SPACE',ControlRight:'RIGHT CTRL',NumpadDecimal:'NUMPAD DECIMAL'};
 const actions=['pass','shoot','dribble','jump'];
 const keyFields=(suffix,values)=>actions.map((a,i)=>field(a.toUpperCase(),'bindKey'+suffix+i,codes.map(k=>[k,names[k]||k.replace('Key','')]),values[i])).join('');
 const padFields=(suffix,values)=>actions.map((a,i)=>field(a.toUpperCase(),'bindPad'+suffix+i,Array.from({length:8},(_,n)=>[n,'BUTTON '+n+(n===0?' / A':n===1?' / B':n===2?' / X':n===3?' / Y':'')]),values[i])).join('');
 page('CONTROLLER MAPPING','Each player can remap four actions separately. The phone touchscreen stays a fixed four-button cross.',`<div class="twoCol"><div class="panel"><h3 class="titleSmall">PLAYER 1 · KEYBOARD</h3>${keyFields('',bindings.keyboard)}<h3 class="titleSmall">PLAYER 1 · GAMEPAD</h3>${padFields('',bindings.gamepad)}</div><div class="panel"><h3 class="titleSmall">PLAYER 2 · KEYBOARD</h3>${keyFields('2',bindings.keyboard2)}<h3 class="titleSmall">PLAYER 2 · GAMEPAD</h3>${padFields('2',bindings.gamepad2)}<p class="muted">Keys cannot overlap between players. Movement directions remain fixed. Connect two controllers for local versus.</p></div></div><div class="row">${button('SAVE BINDINGS','saveBindings','gold')}${button('RESTORE DEFAULTS','resetBindings')}${button('BACK TO SETTINGS','settings')}</div>`,'settings');
}
function showSettingsSection(section){
 const opts={
 game:{id:'nav-settings-game',title:'GAME SETTINGS',subtitle:'CPU, match rules and environment.',fields:`${field('CPU DIFFICULTY','difficulty',aiChoices(),opt.difficulty)}${difficultyHint()}${field('MATCH PACE','gameSpeed',[[0.8,'Relaxed / 80%'],[1,'Normal / 100%'],[1.15,'Fast / 115%']],opt.gameSpeed||1)}${field('HALF LENGTH','settingsDuration',[60,120,180,300].map(v=>[v,v+' sec']),opt.halfSeconds)}${field('WEATHER','settingsWeather',WEATHER.map(v=>[v,v]),opt.weather)}${field('TERRAIN','settingsTerrain',TERRAIN.map(v=>[v,v]),opt.terrain)}${field('CONDITION','settingsCondition',CONDITIONS.map(v=>[v,v]),opt.condition)}`},
 graphics:{id:'nav-settings-graphics',title:'GRAPHICS',subtitle:'Camera and display settings.',fields:`${field('CAMERA','camera',[['Follow','Follow the ball'],['Wide','Wide center view']],opt.camera)}${field('SHOW PLAYER NAMES','showNames',[['true','Yes'],['false','No']],String(opt.showNames))}<div class="row">${button('⛶ TOGGLE FULLSCREEN','fullscreen','minor')}</div><p class="muted">Fullscreen and screen rotation support depends on your browser and device. Visual effects remain built into the game.</p>`},
 sound:{id:'nav-settings-sound',title:'SOUND',subtitle:'Original offline music, sound effects and crowd.',fields:`${field('MASTER MUTE','audioMute',[['false','Sound on'],['true','Mute all']],String(audio.settings.mute))}${['master','music','sfx','ui','ambience'].map(k=>`<label class="fieldLabel" for="audio_${k}">${k.toUpperCase()} VOLUME <output id="audio_${k}Value">${audio.settings[k]}%</output></label><input type="range" id="audio_${k}" min="0" max="100" step="5" value="${audio.settings[k]}" aria-label="${k} volume" style="width:100%"/>`).join('')}<p class="muted">Audio begins after interacting with the page. No internet or external samples needed.</p>`}
 };
 const cfg=opts[section];if(!cfg)return showSettingsMenu();const back=menuEntryReturn==='returnPause'?'returnPause':'navSettings';menuBackAction=back;
 show(`<div class="navScreen"><div class="row space navHeader"><div><div class="topline">SUPERMAGIC FOOTBALL · SETTINGS</div><h1 class="heading">${cfg.title}</h1><p class="subtitle">${cfg.subtitle}</p></div>${button('← BACK',back,'minor')}</div><div class="panel navSettingsFields">${cfg.fields}<div class="row navSaveRow">${button('✓ SAVE CHANGES','saveSettings','gold')}</div></div></div>`,cfg.id);
}
function showHelp(){page('CONTROLS','Exactly four football action buttons: Pass, Shoot, Dribble and Jump.',`<div class="twoCol"><div class="panel"><h3 class="titleSmall">PLAYER 1</h3>${[['Move','WASD / arrow keys in one-player mode / left stick'],['PASS','K / gamepad B'],['SHOOT','J / gamepad A'],['DRIBBLE','I / gamepad X'],['JUMP','Space / gamepad Y'],['Pause (menu only)','Esc / P / controller Start']].map(([a,b])=>`<div class="stat"><strong>${a}</strong><span>${b}</span></div>`).join('')}</div><div class="panel"><h3 class="titleSmall">PLAYER 2</h3>${[['Move','Arrow keys or keypad 8-4-5-6 / second left stick'],['PASS','Period / gamepad B'],['SHOOT','Comma / gamepad A'],['DRIBBLE','Keypad Decimal / gamepad X'],['JUMP','Right Ctrl / gamepad Y']].map(([a,b])=>`<div class="stat"><strong>${a}</strong><span>${b}</span></div>`).join('')}<p class="muted">There are NO separate Special, Switch, Sprint or goalkeeper-dive buttons. Goalkeepers defend and dive automatically. Remap the same four actions in Settings → Remap Controls.</p></div></div>
<div class="twoCol" style="margin-top:18px"><div class="panel"><h3 class="titleSmall">WHEN YOU HAVE THE BALL</h3>${[['Tap PASS','Short pass'],['Hold PASS, then release','Long high pass / lofted ball'],['First JUMP; while airborne press PASS','Cross (sequence matters)'],['PASS first, then JUMP','NOT a cross. PASS release determines the pass; JUMP remains a jump'],['Tap SHOOT','Normal shot'],['Hold SHOOT, then release','Charged shot'],['JUMP then SHOOT while carrying','Elevated normal shot'],['Double JUMP then SHOOT while carrying','Super Shot (or stronger normal shot without ability)'],['Tap DRIBBLE','Dribble dash'],['Double tap DRIBBLE','Personal trick'],['JUMP then DRIBBLE near a loose aerial ball','Normal bicycle kick'],['JUMP then two DRIBBLE taps near an aerial ball','Super Bicycle (same special power and ball visuals as Super Shot)'],['JUMP then SHOOT near a loose aerial ball','Normal header'],['JUMP then two SHOOT taps near an aerial ball','Super Header (same power and ball visuals as Super Shot)'],['Hold DRIBBLE 0.26s, then press JUMP','Lift ball above player without jumping'],['Release DRIBBLE; JUMP, then tap DRIBBLE twice','Super Bicycle from lifted ball; non-specialists use boosted ordinary shot'],['Tap JUMP','Jump / jump again while airborne'],['Hold JUMP + direction','Run with ball (no jump on a long hold)']].map(([a,b])=>`<div class="stat"><strong>${a}</strong><span>${b}</span></div>`).join('')}</div><div class="panel"><h3 class="titleSmall">WHEN YOU DO NOT HAVE THE BALL</h3>${[['Tap PASS','Standing tackle'],['Hold PASS','Chase opponent'],['Tap SHOOT','Travelling slide tackle'],['Tap DRIBBLE','Change controlled player'],['Tap JUMP','Jump'],['Hold JUMP + direction','Sprint while defending'],['JUMP + SHOOT','Defensive flying kick'],['Second JUMP, then SHOOT','Defensive bicycle kick'],['Goalkeeper','Autonomously positions, dives and saves'],['Goalkeeper holding ball; safe teammates','Short accurate distribution'],['Goalkeeper under pressure / blocked pass','Automatic long clearance']].map(([a,b])=>`<div class="stat"><strong>${a}</strong><span>${b}</span></div>`).join('')}</div></div>
<p class="muted">Removed from active human controls: teammate launch → flip kick, reverse-order PASS+JUMP cross, manual goalkeeper dive, separate Special, Switch and Sprint actions. Now playable: Hold Dribble then Jump for a stationary loft; release Dribble, Jump, then tap Dribble twice near the airborne ball to execute Super Bicycle. Super Shot, Super Header and Super Bicycle share power and transformation effects for eligible players.</p>`)}

function showEditor(){page('PLAYER DATA EDITOR','Edit your own 12-player team roster in JSON. Every player can change shot and stats.',`<div class="twoCol"><div class="panel">${teamField('SELECT TEAM','editTeam',nations(),home)}<label class="fieldLabel">TEAM PLAYER DEFINITIONS</label><textarea id="jsonRoster" style="width:100%;height:280px;padding:12px;background:#061625;color:#c5eaff;border:1px solid #90bbcb;border-radius:9px;touch-action:pan-y" spellcheck="false">${escapeHTML(JSON.stringify(roster(home),null,2))}</textarea><div class="row" style="margin-top:12px">${button('✓ APPLY','importRoster','gold')}${button('⬇ EXPORT','exportRoster')}</div></div><div class="panel"><h3 class="titleSmall">EDITABLE ENGINE</h3><p class="muted">Individual player data includes the fourteen 1–100 ratings: stamina, strength, aggression, defence, speedRating, agility, dribbling, shootPower, shootAccuracy, heading, passing, crossing, gkDiving, gkSkill. dribbleType selects one of ten gameplay-distinct tricks. superAbility and gkSuperAbility hold optional unique move definitions. superShotLevel, superDefenceLevel and gkSuperLevel can explicitly override arcade strength tiers (1–5); top tiers are reserved for a small editorial star shortlist. Existing legacy power, shoot, defense, speed are retained for compatibility. The same engine is intended to support new clubs, abilities and growth later.</p><p class="muted">Available super shots: ${Object.keys(SHOTS).join(', ')}.</p><p class="muted">The source code is included in the ZIP for extensions. Online play, the career economy and custom competition designer are future work—not currently playable.</p></div></div>`)}

const eur=n=>'€'+(n/1000000).toFixed(1)+'m';
const saveCareer=()=>{if(career)store.put('managerCareer',career)};
function showManager(){if(!career){const regions=availableRegions(TEAMS);if(!regions.includes(managerRegion))managerRegion=regions[0]||'UEFA';const countries=availableCountries(TEAMS,managerRegion);if(!countries.includes(managerCountry))managerCountry=countries[0]||'';const choices=clubsInCountry(TEAMS,managerRegion,managerCountry);page('MANAGER CAREER','Choose continent → country → club, then build your twelve-player squad.',`<div class="panel"><div class="managerRegionSelector">${field('1. CONTINENT','managerContinent',regions.map(k=>[k,CONTINENTS.find(x=>x.id===k)?.region||k]),managerRegion)}${field('2. COUNTRY','managerCountry',countries.map(k=>[k,countryName(k,TEAMS)]),managerCountry)}</div>${teamField('3. CLUB','managerClub',choices.map(i=>[i,TEAMS[i].name]),choices[0])}<p class="muted">Select a continent and country to narrow the list. Browse Flags / Crests to see team graphics while choosing.</p><div class="row" style="margin-top:15px">${button('START MANAGER CAREER','startManager','gold')}${button('CONTINENTAL CUPS','continents')}</div></div>`);return;}
 const c=career,fx=currentCareerFixture(c),sorted=standings(c),place=sorted.findIndex(v=>v.id===c.club)+1;
 page('MANAGER CAREER',`Season ${c.season} · ${TEAMS[c.club].name} · 12 active players · League & knockout cup`,`<div class="row" style="margin:10px 0">${CONTINENTS.filter(co=>CONTINENTAL_TEAMS[co.id].includes(c.club)).map(co=>button('🏆 '+co.id+' CHAMPIONSHIP','continentPick_'+co.id,'gold')).join('')}</div><div class="careerTop"><div class="metric"><small>TRANSFER FUNDS</small><strong>${eur(c.cash)}</strong></div><div class="metric"><small>LEAGUE POSITION</small><strong>#${place} / 8</strong></div><div class="metric"><small>LEAGUE ROUND</small><strong>${c.week} / 14</strong></div><div class="metric"><small>CUP</small><strong>${c.cup.eliminated?'OUT':c.cup.stage===3?'🏆 WON':['QF','SF','FINAL'][c.cup.stage]}</strong></div></div>
 <div class="twoCol"><div class="panel"><h3 class="titleSmall">NEXT FIXTURE</h3><div class="fixture">${fx?`${fx.kind==='cup'?'🏆 '+fx.round:'🏟 LEAGUE WEEK '+fx.round}<br><strong>${TEAMS[c.club].name} <em>VS</em> ${TEAMS[fx.opponent].name}</strong>`:c.leagueFinished?'🏆 SEASON COMPLETE!':'No fixtures yet'}</div>
 <div class="row">${fx?button('▶ PLAY NEXT MATCH','careerPlay','gold'):button('↻ BEGIN NEW SEASON','careerSeason','gold')}${button('12-PLAYER SQUAD','careerSquad')}${button('TRANSFER MARKET','careerMarket')}${button('🔍 YOUTH ACADEMY','careerScout')}</div><hr><h3 class="titleSmall">CLUB FACILITIES</h3>
 ${Object.entries(c.facilities).map(([key,v])=>`<div class="facility"><span>🏟 ${key.toUpperCase()} LVL ${v}</span>${button('UPGRADE '+eur(v*12500000),'facility_'+key)}</div>`).join('')}
 <p class="muted">Academy scouts create fictional recruitable prospects with defined potential, and players have contract years and fitness. Wins generate income. Training improves player experience; upgraded training increases XP per match. Facilities and transfers persist in this browser.</p></div>
 <div class="panel"><h3 class="titleSmall">LEAGUE TABLE</h3><div class="scroll"><table class="miniTable"><thead><tr><th>TEAM</th><th>PL</th><th>W</th><th>D</th><th>GD</th><th>PTS</th></tr></thead><tbody>${sorted.map((r,i)=>`<tr class="${r.id===c.club?'myTeam':''}"><td>${i+1}. ${teamIdentity(TEAMS[r.id])} ${escapeHTML(TEAMS[r.id].name)}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.gf-r.ga}</td><td><b>${r.pts}</b></td></tr>`).join('')}</tbody></table></div><h3 class="titleSmall">LATEST RESULTS</h3><div class="scroll">${c.history.slice(0,5).map(r=>`<div class="stat"><span>${r.kind.toUpperCase()} vs ${escapeHTML(TEAMS[r.against].name)}</span><strong>${r.a}:${r.b}</strong></div>`).join('')||'<p class="muted">No matches played yet</p>'}</div></div></div>`);
}
function careerPlay(){if(!career)return showManager();const fx=currentCareerFixture(career);if(!fx)return showManager();home=career.club;away=fx.opponent;mode='career';start()}
function showCareerSquad(){if(!career)return showManager();home=career.club;const rows=career.roster.map((p,i)=>`<div class="squadEntry"><canvas class="miniAvatar" width="100" height="108" data-avatar="${i}" data-avatarcareer="1"></canvas><div><strong>#${p.num} ${escapeHTML(p.name)}</strong><small>${p.role} · LV ${p.level} · ${p.xp} XP · OVR ${playerOVR(p)}</small><small>STR ${withStats(p).strength} · STA ${withStats(p).stamina} · SHOOT ${withStats(p).shootPower}/${withStats(p).shootAccuracy} · GK ${withStats(p).gkSkill}</small><small>FIT ${p.condition??100}% · CONTRACT ${p.contractYears??2}Y ${p.injuryWeeks?' · OUT '+p.injuryWeeks+'w':''}</small>${p.fictional?'<small class="placeholder">Academy stand-in</small>':''}</div><div class="squadBtns">${button('🎨','editPlayer'+i)}<button class="btn" data-train="${i}">TRAIN €1.5m</button><button class="btn" data-careerrecover="${i}">RECOVER €0.5m</button><button class="btn" data-careerrenew="${i}">RENEW</button></div></div>`).join('');page('MANAGER SQUAD',`Twelve players · ${TEAMS[career.club].name}. Improve their stats, appearance and experience.`,`<div class="squadGrid">${rows}</div><div class="row" style="margin-top:12px">${button('← MANAGER HUB','manager','gold')}${button('TRANSFER MARKET','careerMarket')}${button('YOUTH SCOUTING','careerScout')}</div>`,'manager');paintAvatars();}
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
function showPlayerStudio(index=0){avatarIndex=Math.max(0,Math.min(11,Number(index)||0));const squad=career&&home===career.club?career.roster:roster(home);const player=squad[avatarIndex];if(!player){showHome();return;}const av={...avatarFor(player),...(player.appearance||{})};
 page('PLAYER CUSTOMIZATION','Every player has a persistent, editable HD caricature. Modify facial structure, funny exaggeration, hair, expressions and personal details.',`<div class="twoCol"><div class="panel">${career?'':teamField('SELECT TEAM','customTeam',nations(),home)}${field('PLAYER','customPlayer',squad.map((p,i)=>[i,`#${p.num} ${p.name}`]),avatarIndex)}<div class="characterStage"><canvas id="customPortrait" width="300" height="260"></canvas><div>${escapeHTML(player.name)} · ${player.role}<p>${escapeHTML(player.shotName||'Super shot')}</p></div></div><div class="row">${button('✓ SAVE CHARACTER','saveAppearance','gold')}${button('RANDOMIZE FACE','randomizeFace')}</div></div><div class="panel"><div class="avatarControls">${[['skin','SKIN COLOR'],['hair','HAIR COLOR']].map(([id,title])=>`<label>${title}<input type="color" id="face_${id}" value="${av[id]}"/></label>`).join('')}${[['style',13,'HAIRSTYLE'],['face',5,'FACE SHAPE'],['eyes',20,'EYE SHAPE'],['brows',20,'EYEBROWS'],['eyeColor',6,'EYE COLOR'],['nose',6,'NOSE'],['lips',8,'LIPS'],['body',5,'BUILD'],['stature',5,'HEIGHT STYLE'],['exaggeration',3,'FUNNY SCALE'],['beard',5,'FACIAL HAIR'],['accessory',6,'ACCESSORY'],['freckles',4,'FRECKLES'],['scar',6,'SCARS']].map(([id,total,name])=>`<label>${name}<select class="choice" id="face_${id}">${Array.from({length:total},(_,i)=>`<option value="${i}" ${av[id]===i?'selected':''}>STYLE ${i+1}</option>`).join('')}</select></label>`).join('')}</div><p class="muted">Original cartoon caricatures are deterministic and individually configurable; not licensed photos or exact facial replicas. This phase adds 20 eye shapes, 20 eyebrow styles, 6 eye colors, 6 noses, 8 lips and exaggerated body silhouettes.</p></div></div>`,career?'careerSquad':'home');drawCustomizer();}
function getAppearance(){const numeric=['style','face','eyes','brows','eyeColor','nose','lips','body','stature','exaggeration','beard','accessory','freckles','scar'];return Object.fromEntries(['skin','hair',...numeric].map(k=>[k,k==='skin'||k==='hair'?$('face_'+k).value:+$('face_'+k).value]))}
function drawCustomizer(){const canvas=$('customPortrait');if(!canvas)return;const x=canvas.getContext('2d'),p=(career&&home===career.club?career.roster:roster(home))[avatarIndex];if(!p)return;x.clearRect(0,0,300,260);let gg=x.createLinearGradient(0,0,300,260);gg.addColorStop(0,'#266b70');gg.addColorStop(1,'#0e243a');x.fillStyle=gg;x.fillRect(0,0,300,260);x.save();x.translate(150,240);x.scale(2.05,2.05);renderer.drawPlayer(x,{...game.player(0,3),x:0,y:0,z:0,t:0,i:avatarIndex,src:{...p,appearance:getAppearance()},face:1,dx:0,dy:0,anim:performance.now()/1000,action:'idle',controlled:false},{getTeam:()=>TEAMS[home],options:{showNames:false}});x.restore()}
function saveAppearance(){const source=career&&home===career.club?career.roster:roster(home);source[avatarIndex].appearance=getAppearance();if(career&&home===career.club){career.roster=source;saveCareer();showCareerSquad()}else{edits[TEAMS[home].id]=source;store.put('edits',edits);showPlayerStudio(avatarIndex)} }
function paintAvatars(){menu.querySelectorAll('[data-avatar]').forEach(canvas=>{const i=+canvas.dataset.avatar,p=career?.roster?.[i];if(!p)return;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,100,108);ctx.fillStyle='#1b5460';ctx.fillRect(0,0,100,108);ctx.save();ctx.translate(49,124);ctx.scale(.93,.93);renderer.drawPlayer(ctx,{...game.player(0,3),src:p,t:0,i,face:1,x:0,y:0,z:0,anim:0,dx:0,dy:0,action:'idle',controlled:false},{getTeam:()=>TEAMS[career.club],options:{showNames:false}});ctx.restore()})}

function pause(){game.matchState='paused';page('PAUSED','Resume or change the computer opponent difficulty without restarting.',`<div class="panel">${field('CPU DIFFICULTY (LIVE)','liveDifficulty',aiChoices(),opt.difficulty)}${difficultyHint()}<p class="muted">Changes apply immediately on the next AI decision. In local 2-player Versus this does not affect either human.</p></div><div class="row">${button('▶ RESUME','resume','gold')}${button('RESTART MATCH','confirmRestart')}${button('SETTINGS','navSound')}${button('HOME TACTICS','tacticHome')}${humans>=2?button('AWAY TACTICS','tacticAway'):''}${button('RETURN TO MAIN MENU','confirmQuit')}</div>`)}
function halftime(){game.matchState='paused';page('HALF TIME',`${TEAMS[home].name} ${game.score[0]} : ${game.score[1]} ${TEAMS[away].name}`,`<div class="panel"><h3 class="titleSmall">SECOND HALF STRATEGY</h3><p class="muted">Players have recovered some stamina, not all. CPU teams may make an automatic substitution. Use the command center for up to three substitutions; bench fatigue is remembered.</p><h3 class="titleSmall">🗣 HALF-TIME MANAGER TALK</h3><p class="muted">Talks can boost or reduce individual morale. One talk per team per halftime.</p><div class="tacticsGrid">${field('HOME TALK','halfTalkHome',Object.entries(TEAM_TALKS).map(([k,v])=>[k,v.name]),'encourage')}${humans>=2?field('AWAY TALK','halfTalkAway',Object.entries(TEAM_TALKS).map(([k,v])=>[k,v.name]),'focus'):''}</div><p class="muted">HOME MOOD: ${Math.round(game.teamMorale(0))}% · AWAY MOOD: ${Math.round(game.teamMorale(1))}%</p><div class="row">${!game.talksUsed[0].halftime?button('SPEAK TO HOME TEAM','talkHalfHome','gold'):''}${humans>=2&&!game.talksUsed[1].halftime?button('SPEAK TO AWAY TEAM','talkHalfAway'):''}</div><div class="row">${button('▶ SECOND HALF','resume','gold')}${button('HOME TACTICS','tacticHome')}${humans>=2?button('AWAY TACTICS','tacticAway'):''}${button('ADJUST CPU LEVEL','cpuPause')}</div></div>`)}
function fulltime(ev){game.matchState='finished';let [a,b]=ev.score,win=a>b;if(mode==='league'){
 league.played++;league.wins+=a>b?1:0;league.draws+=a===b?1:0;league.losses+=a<b?1:0;league.points+=a>b?5:a===b?2:0;league.games.unshift({team:TEAMS[away].name,a,b});league.games=league.games.slice(0,80);
 if(league.stage==='qualifier'&&league.wins>=16&&league.points>=70)league.stage='finals';else if(league.stage==='finals'&&win){league.playoff=(league.playoff||0)+1;if(league.playoff>=4)league.stage='champion'}store.put('league',league)}
 if(mode==='continental'&&continentalRun){try{const result=tournamentAdvance(continentalRun,TEAMS,ev.score,ev.penalties?ev.winner:null);store.put('continentalRun',continentalRun);if(career?.club===continentalRun.club){career.cash+=Math.max(0,continentalRun.earned-(continentalRun.lastCareerAward||0));continentalRun.lastCareerAward=continentalRun.earned;store.put('continentalRun',continentalRun);store.put('managerCareer',career)}page('CONTINENTAL RESULT',`${TEAMS[home].name} ${a} : ${b} ${TEAMS[away].name}`,`<div class="panel careerResult"><div class="badge">${escapeHTML(confed(continentalRun.compId).name)}</div><div class="megaScore">${a} : ${b}</div><p>${escapeHTML(tournamentProgress(continentalRun))} • ${continentalRun.earned/1000000}m prize earnings</p>${button('CONTINUE CHAMPIONSHIP','continentContinue','gold')}</div>`)}catch(e){alert('Competition update failed: '+e.message);showTournament()}return;}
 if(mode==='career'&&career){recordMatchFitness(career,game.getFitnessReport(0));const outcome=advanceCareer(career,TEAMS,ev.score,ev.penalties?ev.winner:null);store.put('managerCareer',career);page('CAREER MATCH RESULT',`${TEAMS[home].name} ${a} : ${b} ${TEAMS[away].name}`,`<div class="panel careerResult"><div class="titleSmall">${outcome.kind.toUpperCase()} • ${outcome.win?'WIN!':a===b?'DRAW':'DEFEAT'}</div><div class="megaScore">${a} : ${b}</div><p>Club cash: €${(career.cash/1000000).toFixed(1)}m • Current week ${career.week+1}</p>${button('CONTINUE MANAGER CAREER','manager','gold')}</div>`);return;}
 page('FULL TIME',`${win?'VICTORY!':a===b?'DRAW MATCH':'DEFEAT'}${ev.penalties?' • ON PENALTIES':''}`,`<div class="panel" style="text-align:center"><div class="badge">MATCH RESULT</div><div style="font-size:70px;color:#ffe17a;font-weight:1000">${a} : ${b}</div><p>${TEAMS[home].name} vs ${TEAMS[away].name}</p><div class="row" style="justify-content:center">${button('↻ REMATCH','kickoff','gold')}${mode==='league'?button('🏆 LEAGUE','league'):button('MAIN MENU','home')}</div></div>`)}
function toast(message,duration=1600){let n=$('gameToast');n.textContent=message;n.classList.remove('hidden');toastTime=performance.now()+duration}
let toastTime=0;
game.onEvent=e=>{audio.cue(e);if(e.type==='toast')toast(e.message,1800);if(e.type==='goal'){$('gameToast').classList.add('hidden');toastTime=0}if(e.type==='penaltyStart')toast('PENALTY SHOOTOUT',1500);if(e.type==='penaltyKick')toast(e.goal?'GOAL!':'SAVE!',1300);if(e.type==='pause')pause();if(e.type==='halftime')halftime();if(e.type==='finished')fulltime(e)};
function action(a){audio.cue('ui');
 const navTarget=menu.querySelector('[data-action="'+a+'"]');if(navTarget&&a!=='home'&&a!=='quit')navFocusMap[screen]=a;
 if(['quick','versus','pk','training','manager','league','continents','clubs','playerStudio','editor','gallery','squad','help','controls'].includes(a)&&screen.startsWith('nav-'))menuEntryReturn=({
 'nav-device':'navOnDevice','nav-career':'navCareer','nav-cups':'navCups','nav-clubs':'navClubs','nav-settings':'navSettings','nav-customize':'navCustomization','nav-input':'navInput','nav-saves':'navSaveManagement'
 })[screen]||'home';
 if(a==='confirmQuit'){if(confirm('Leave this match and return to the main menu? Match progress will be lost.')){game.matchState='none';showHome();}}else if(a==='confirmRestart'){if(confirm('Restart the match from kickoff? Current match progress will be lost.'))start();}
 else if(a==='navQuick')showQuickMenu();else if(a==='navOnDevice')showOnDevice();else if(a==='navOnline')showOnlineMenu();else if(a==='navCareer')showCareerMenu();else if(a==='navCups')showCupsMenu();else if(a==='navInternational')showInternationalMenu();else if(a==='navClubs')showClubCompetitionsMenu();else if(a==='navSettings'||a==='settings')showSettingsMenu();else if(a==='navCustomization')showCustomizationMenu();else if(a==='navInput')showInputMenu();else if(a==='navSaveManagement')showSaveMenu(screen==='nav-career'?'navCareer':'navSettings');
 else if(a==='navGameSettings')showSettingsSection('game');else if(a==='navGraphics')showSettingsSection('graphics');else if(a==='navSound'){if(game.matchState==='paused'&&screen==='PAUSED')menuEntryReturn='returnPause';showSettingsSection('sound');}
 else if(a==='navAbout')showAbout();
 else if(a==='navNewCareer'){if(career&&!confirm('Start a new career? Your current manager career will be replaced. Export a backup first if needed.'))return;career=null;store.put('managerCareer',null);showManager();}
 else if(a.startsWith('later')){const labels={laterLAN:'Local Network',laterOnlineMatch:'Online Match',laterUltimate:'Ultimate Team',laterOnlineCareer:'Online Career',laterOnlineCup:'Online Cup / League',laterWorldCup:'World Cup',laterAsian:'Asian Cup',laterEuro:'Euro',laterCopa:'Copa América',laterAfrica:'Africa Cup',laterConcacaf:'CONCACAF Cup',laterChampions:'Champions League',laterEuropa:'Europa League',laterPremier:'Premier League',laterSerie:'Serie A',laterBundes:'Bundesliga',laterLaLiga:'La Liga',laterLigue1:'Ligue 1',laterCustomCup:'Custom Cup',laterCustomLeague:'Custom League'};const parent=a==='laterLAN'?'navQuick':a.startsWith('laterOnline')||a==='laterUltimate'?'navOnline':['laterWorldCup','laterAsian','laterEuro','laterCopa','laterAfrica','laterConcacaf'].includes(a)?'navInternational':['laterCustomCup','laterCustomLeague'].includes(a)?'navCups':'navClubs';comingLater(labels[a]||'Coming Later','This feature is on the roadmap but is not yet playable.',parent);}
 else if(a==='home'||a==='quit'){game.matchState='none';showHome()}
 else if(a==='continents')showContinents();else if(a.startsWith('continentPick_'))showContinentSetup(a.slice(14));else if(a==='continentStart')startContinent();else if(a==='continentContinue')showTournament();else if(a==='continentKickoff')continentKickoff();else if(a==='continentBye')continentBye();
 else if(a==='manager')showManager();else if(a==='startManager'){const v=+$('managerClub').value;career=createCareer(v,TEAMS);career.saveSchema=2;career.clubId=TEAMS[v].id;store.put('managerCareer',career);showManager()}
 else if(a==='careerPlay')careerPlay();else if(a==='careerSeason'){if(career){nextSeason(career);store.put('managerCareer',career);showManager()}}
 else if(a==='careerScout')showCareerScout();else if(a==='careerScoutNew')tryCareerScout();else if(a.startsWith('careerSign'))tryCareerSign(+a.slice(10));
 else if(a==='careerMarket')showCareerMarket();else if(a==='careerSquad')showCareerSquad();else if(a==='careerBuy')careerBuy();
 else if(a==='careerTrain')careerTrain();else if(a.startsWith('facility_')){try{upgradeFacility(career,a.slice(9));store.put('managerCareer',career);showManager()}catch(e){alert(e.message)}}
 else if(a==='playerStudio')showPlayerStudio();else if(a.startsWith('editPlayer'))showPlayerStudio(+a.slice(10));else if(a==='saveAppearance')saveAppearance();else if(a==='randomizeFace'){const el=$('face_style');if(el){for(const k of ['style','face','eyes','brows','eyeColor','nose','lips','body','stature','exaggeration','beard','accessory','freckles','scar']){const node=$('face_'+k);node.value=Math.floor(Math.random()*node.options.length)}drawCustomizer()}}
 else if(a==='quick'||a==='versus'||a==='training')showSetup(a);
 else if(a==='league')showLeague();else if(a==='gallery')showGallery();else if(a==='clubs')showClubs();else if(a==='saveClub')saveNewClub();else if(a.startsWith('selectClub')){home=+a.slice(10);away=home===away?0:away;showSetup('quick')}else if(a.startsWith('deleteClub'))deleteClub(+a.slice(10));else if(a==='pk'){mode='pk';showSetup('pk')}
 else if(a==='leagueKickoff'){mode='league';start()}
 else if(a==='kickoff')start();else if(a==='squad')showSquad(0,game.matchState==='paused'?'pause':'home');else if(a==='prepHome')showSquad(0,'setup');else if(a==='prepAway')showSquad(1,'setup');else if(a==='tacticHome')showSquad(0,'pause');else if(a==='tacticAway'&&humans>=2)showSquad(1,'pause');else if(a==='returnSetup')showSetup(mode);else if(a==='returnPause'){menuEntryReturn='home';pause();}else if(a==='controls')showControls();else if(a==='saveBindings'){const profile={keyboard:Array.from({length:4},(_,i)=>$('bindKey'+i).value),gamepad:Array.from({length:4},(_,i)=>+$('bindPad'+i).value),keyboard2:Array.from({length:4},(_,i)=>$('bindKey2'+i).value),gamepad2:Array.from({length:4},(_,i)=>+$('bindPad2'+i).value)};if(input.setBindings(profile)){store.put('controllerBindings',input.getBindings());showInputMenu();}else alert('Each player needs four unique keys and buttons. Keyboard keys cannot overlap across players.');}else if(a==='resetBindings'){input.setBindings({keyboard:['KeyK','KeyJ','KeyI','Space'],gamepad:[1,0,2,3],keyboard2:['Period','Comma','NumpadDecimal','ControlRight'],gamepad2:[1,0,2,3]});store.put('controllerBindings',input.getBindings());showControls();}else if(a==='help')showHelp();else if(a==='editor')showEditor();
 else if(a==='talkHalfHome'||a==='talkHalfAway'){const side=a==='talkHalfHome'?0:1;try{const response=game.applyTeamTalk(side,$(side?'halfTalkAway':'halfTalkHome')?.value||'encourage','halftime');halftime();toast(`${response.positive} INSPIRED · ${response.backfires} UPSET · TEAM MOOD ${response.morale}%`)}catch(err){alert(err.message)}}
 else if(a==='fullscreen')toggleFullscreen();else if(a==='cpuPause')pause();else if(a==='resume'){game.matchState=game.pk?'penalty':'play';closeMenu()}
 else if(a==='saveSquad'){
  const ix=squadContext==='pause'?game.teamIds[squadSide]:squadSide===0?home:away;
  const players=squadContext==='pause'?game.rosters[squadSide]:roster(ix);
  const raw={formation:$('formation').value,lineup:Array.from({length:6},(_,i)=>+$('pos'+i).value),captain:+$('role_captain').value,penalty:+$('role_penalty').value,freeKick:+$('role_freeKick').value,corner:+$('role_corner').value,attack:$('attackStyle').value,defence:$('defenceStyle').value};
  try{const plan=validatePlan(raw,players,ix);
   if(squadContext==='pause')game.applyPlan(squadSide,plan);
   teamPlans[TEAMS[ix].id]=plan;store.put('teamPlans',teamPlans);
   if(squadContext==='pause')pause();else if(squadContext==='setup')showSetup(mode);else showHome();
  }catch(e){alert(e.message)}
 }
 else if(a==='resetSquad'){
  const ix=squadContext==='pause'?game.teamIds[squadSide]:squadSide===0?home:away;
  const replacement=defaultPlan(ix,roster(ix));try{if(squadContext==='pause')game.applyPlan(squadSide,replacement);teamPlans[TEAMS[ix].id]=replacement;store.put('teamPlans',teamPlans);if(squadContext==='pause')pause();else showSquad(squadSide,squadContext);}catch(e){alert(e.message)}
 }
 else if(a==='exportSave')exportSave();else if(a==='importSave')$('saveImportFile')?.click();
 else if(a==='saveSettings'){
  const get=id=>$(id)?.value;
  const changes={};for(const [id,key,cast] of [['difficulty','difficulty',Number],['settingsDuration','halfSeconds',Number],['gameSpeed','gameSpeed',Number],['settingsWeather','weather',String],['settingsTerrain','terrain',String],['settingsCondition','condition',String],['camera','camera',String],['showNames','showNames',v=>v==='true']]){if(get(id)!==undefined)changes[key]=cast(get(id));}
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
function backFromMenu(){const back=screen==='nav-settings-sound'&&menuEntryReturn==='returnPause'?'returnPause':screen==='nav-saves'?menuBackAction:menuParents[screen]||menuBackAction||'home';if(screen==='home')return;action(back);}
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
menu.addEventListener('input',e=>{if(e.target.dataset.teamSearch){fillTeamBrowser(e.target.dataset.teamSearch);return;}if(e.target.id?.startsWith('face_'))drawCustomizer()});
menu.addEventListener('change',e=>{if(/^pos[0-5]$/.test(e.target.id)){const choiceEl=$('role_captain');if(!choiceEl)return;const current=+choiceEl.value;const ix=squadContext==='pause'?game.teamIds[squadSide]:squadSide===0?home:away;const players=squadContext==='pause'?game.rosters[squadSide]:roster(ix);const slots=Array.from({length:6},(_,i)=>+$('pos'+i).value);choiceEl.innerHTML=slots.map(i=>`<option value="${i}" ${i===current?'selected':''}>#${players[i].num} ${escapeHTML(players[i].name)}</option>`).join('');if(!slots.includes(current))choiceEl.value=String(slots[1]||slots[0]);refreshFormationPreview();}});

menu.addEventListener('click',e=>{const browser=e.target.closest('[data-team-browse]');if(browser){showTeamBrowser(browser.dataset.teamBrowse);return;}const pick=e.target.closest('[data-pick-team]');if(pick){const select=$(pick.dataset.pickTeam);if(select){select.value=pick.dataset.teamId;select.dispatchEvent(new Event('change',{bubbles:true}));}return;}let train=e.target.closest('[data-train]');if(train){menu.dataset.trainPlayer=train.dataset.train;careerTrain();return}const renew=e.target.closest('[data-careerrenew]');if(renew){tryCareerContract(+renew.dataset.careerrenew);return}const recover=e.target.closest('[data-careerrecover]');if(recover){tryCareerRecover(+recover.dataset.careerrecover);return}let node=e.target.closest('[data-action]');if(node)action(node.dataset.action)});
menu.addEventListener('change',e=>{const id=e.target.id;switch(id){case 'managerContinent':managerRegion=e.target.value;managerCountry='';showManager();break;case 'managerCountry':managerCountry=e.target.value;showManager();break;case 'continentClub':updateTeamPickerIcon(id);break;case 'managerClub':updateTeamPickerIcon(id);break;case 'formation':refreshFormationPreview();break;case 'homeGroup':homeCategory=e.target.value;home=filteredNations(homeCategory)[0]?.[0]??home;away=home===away?(away+1)%TEAMS.length:away;showSetup(mode);break;case 'awayGroup':awayCategory=e.target.value;away=filteredNations(awayCategory).find(([i])=>i!==home)?.[0]??away;showSetup(mode);break;case 'homeTeam':home=+e.target.value;if(home===away)away=(away+1)%TEAMS.length;showSetup(mode);break;case 'awayTeam':away=+e.target.value;if(away===home)home=(home+1)%TEAMS.length;showSetup(mode);break;case 'preTalkHome':preTalkChoices[0]=e.target.value;break;case 'preTalkAway':preTalkChoices[1]=e.target.value;break;case 'homeKit':case 'awayKit':{let side=id==='homeKit'?0:1;kitSelections[side]=e.target.value;store.put('kitSelections',kitSelections);paintTeamPreviews();break;}case 'weather':opt.weather=e.target.value;break;case 'terrain':opt.terrain=e.target.value;break;case 'condition':opt.condition=e.target.value;break;case 'halfSeconds':opt.halfSeconds=+e.target.value;break;case 'aiStyle':opt.aiStyle=e.target.value;break;case 'matchDifficulty':case 'liveDifficulty':opt.difficulty=+e.target.value;game.options.difficulty=opt.difficulty;store.put('options',opt);{const hint=$('difficultyHint');if(hint)hint.textContent=aiTuning(opt.difficulty).name+' CPU: reaction, shot accuracy, passing, pressure and keeper response all scale by difficulty. Human players are unaffected.';}break;case 'marketTeam':showCareerMarket(+e.target.value);break;case 'customTeam':home=+e.target.value;showPlayerStudio();break;case 'customPlayer':showPlayerStudio(+e.target.value);break;case 'editTeam':home=+e.target.value;updateTeamPickerIcon(id);$('jsonRoster').value=JSON.stringify(roster(home),null,2);break;}});
menu.addEventListener('change',e=>{if(e.target.id==='difficulty'){const hint=$('difficultyHint');if(hint)hint.textContent=aiTuning(+e.target.value).name+' CPU: reaction, shot accuracy, passing, pressure and keeper response all scale by difficulty. Human players are unaffected.';}});
$('pauseBtn').addEventListener('click',()=>{if(['play','penalty'].includes(game.matchState))pause()});
$('dismissRotate').addEventListener('click',()=>{$('rotate').classList.add('hidden');rotateDismissed=true});let rotateDismissed=false;function checkRotate(){let should=!rotateDismissed&&!menuVisible()&&matchMedia('(pointer:coarse)').matches&&innerHeight>innerWidth*1.12;$('rotate').classList.toggle('hidden',!should)}
let last=performance.now(),uiT=0;
function frame(now){pollMenuPad(now);let dt=Math.min(.05,(now-last)/1000||.016);last=now;if(game.matchState==='play')game.update(dt);else if(game.matchState==='penalty')game.updatePK(dt);renderer.frame(game,dt,menuVisible());if(screen==='home'&&menuVisible())drawPoster();uiT-=dt;if(uiT<=0){uiT=.1;if(!menuVisible())drawHUD()}if(toastTime&&now>toastTime){$('gameToast').classList.add('hidden');toastTime=0}checkRotate();requestAnimationFrame(frame)}
game.init({home,away,options:opt});game.matchState='none';window.NekketsuHD={audio,version:'0.8.24.12-alpha',game,renderer,input,teams:TEAMS,shots:SHOTS,aiLevels:AI_LEVELS,rosterFor,getCareer:()=>career,getContinental:()=>continentalRun,confederations:CONTINENTS,continentalMapping:CONTINENTAL_TEAMS,kitsFor:team=>KIT_CHOICES.map(k=>kitFor(team,k)),getKitChoices:()=>kitSelections.slice(),getTeamPlan:i=>planFor(i),getMorale:team=>game.teamMorale(team)};window.SupermagicFootball=window.NekketsuHD;showHome();requestAnimationFrame(frame);
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});

// Browser audio can only be unlocked by a deliberate user gesture.
document.addEventListener('pointerdown',()=>audio.unlock(),{passive:true});
document.addEventListener('keydown',()=>audio.unlock());
// iOS Safari can require touchstart rather than pointerdown to resume Web Audio.
document.addEventListener('touchstart',()=>audio.unlock(),{passive:true});
menu.addEventListener('input',e=>{if(e.target?.matches?.('input[id^=audio_]')){const output=$(e.target.id+'Value');if(output)output.textContent=e.target.value+'%'}});
document.addEventListener('visibilitychange',()=>document.hidden?audio.suspend():audio.resume());
window.addEventListener('pagehide',()=>audio.suspend());
window.addEventListener('pageshow',()=>{if(!document.hidden)audio.resume()});
