from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'src/engine.js';s=p.read_text()
s=s.replace("import {kitFor} from './kits.js';","import {kitFor} from './kits.js';\nimport {safePlan,tacticModifiers} from './tactics.js';")
s=s.replace("this.formation=['2-1-2','2-1-2'];","this.formation=['2-1-2','2-1-2'];this.teamPlans=[];",1)
s=s.replace('rosters,formations,lineups,options=this.options','rosters,formations,lineups,plans,options=this.options')
needle="this.formation=formations||[options.formation||'2-1-2','2-1-2'];"
s=s.replace(needle,needle+"this.teamPlans=[0,1].map(t=>safePlan(plans?.[t]||{formation:this.formation[t],lineup:this.lineups[t]},this.rosters[t],t===0?home:away));this.formation=this.teamPlans.map(p=>p.formation);this.lineups=this.teamPlans.map(p=>p.lineup.slice());")
anchor=' getTeam(t){return kitFor(TEAMS[this.teamIds[t]],this.options.kitChoices?.[t]|| (t===0?\'home\':\'away\'))}'
insert=''' applyPlan(t,raw){
  if(t!==0&&t!==1)throw Error('Invalid team');
  const {validatePlan}=null||{}; // validation is performed by caller through safePlan/validation helper.
  const next=safePlan(raw,this.rosters[t],this.teamIds[t]);
  // Match must remain paused while the command center is open.
  if(!['paused','play','penalty'].includes(this.matchState))throw Error('Cannot change tactics outside a match');
  const prev=this.players.filter(p=>p.t===t);const existing=new Map(prev.map(p=>[p.src.id,p]));
  this.teamPlans[t]=next;this.lineups[t]=next.lineup.slice();this.formation[t]=next.formation;
  for(let i=0;i<6;i++){
   const p=this.player(t,i),src=this.rosters[t][next.lineup[i]],kept=existing.get(src.id);
   const pos=FORMATIONS[next.formation][i],targetX=F.x+(t===0?pos.x:1-pos.x)*F.w,targetY=F.y+pos.y*F.h;
   if(p.src.id!==src.id){
    if(this.ball.owner===p){this.ball.owner=null;this.ball.vx=0;this.ball.vy=0;this.ball.canCollect=.3;}
    p.src=src;p.fatigue=kept?.fatigue??Math.max(0,(100-(src.condition??100))*.003);p.stun=0;p.cd=0;p.charge=0;
   }
   p.homeX=targetX;p.homeY=targetY;p.keeper=i===0;
   // New players join near their assigned position; old ones keep moving to new positions.
   if(!kept){p.x=targetX;p.y=targetY;p.moveVX=p.moveVY=0;}
  }
  if(!this.lineups[t].includes(this.controlled[t]))this.controlled[t]=3;
  this.toast(TEAMS[this.teamIds[t]].name+' tactics updated');return next;
 }
'''
insert=insert.replace("  const {validatePlan}=null||{}; // validation is performed by caller through safePlan/validation helper.\n",'')
s=s.replace(anchor,insert+anchor)
# use validate instead of silent fallback for applyPlan
s=s.replace("safePlan,tacticModifiers", "safePlan,validatePlan,tacticModifiers")
s=s.replace("const next=safePlan(raw,this.rosters[t],this.teamIds[t]);","const next=validatePlan(raw,this.rosters[t],this.teamIds[t]);")
# tactical movement / pass/super effects
s=s.replace("const quality=stat(p,wide?'crossing':'passing');", "const leader=this.rosters[p.t][this.teamPlans[p.t]?.captain];const captainOnField=this.players.some(q=>q.t===p.t&&q.src.id===leader?.id);const quality=Math.min(100,stat(p,wide?'crossing':'passing')+(captainOnField?4:0));")
s=s.replace("const aiStyle=this.options.aiStyle||'Balanced';", "const aiStyle=this.options.aiStyle||'Balanced';const tactical=tacticModifiers(this.teamPlans[t]||{attack:'Balanced',defence:'Balanced'});")
s=s.replace("tx=clamp(p.x+dir*(180+ai.anticipation*210)","tx=clamp(p.x+dir*(180+ai.anticipation*210)*tactical.advance")
s=s.replace("Math.random()<ai.passRate){this.pass(p)","Math.random()<ai.passRate*tactical.pass){this.pass(p)")
s=s.replace("Math.random()<ai.shootRate){this.shoot(p", "Math.random()<ai.shootRate*tactical.shoot){this.shoot(p")
s=s.replace("p.homeX+dir*(220+ai.anticipation*280)","p.homeX+dir*(220+ai.anticipation*280)*tactical.advance")
s=s.replace("distance(p,target)<ai.pressure", "distance(p,target)<ai.pressure*tactical.press")
s=s.replace("tx=p.homeX+(bx-MID)*(.12+ai.anticipation*.12);", "tx=p.homeX+(bx-MID)*(.12+ai.anticipation*.12)*tactical.defensiveDepth;")
s=s.replace("Math.random()<ai.tackleRate){", "Math.random()<ai.tackleRate*tactical.press){")
# penalty-taker accuracy influences kick dispersion and goalkeeper captain bonus
s=s.replace("pk.shotTargetY=controlledShooter?pk.aim:clamp(cy+randomBetween(-aimBand,aimBand),WORLD.goalTop+10,WORLD.goalBottom-10);", "const taker=this.rosters[at][this.teamPlans[at]?.penalty??4]||this.player(at,4)?.src;const error=(100-(taker?.shootAccuracy||65))*.33;pk.shotTargetY=controlledShooter?clamp(pk.aim+randomBetween(-error,error),WORLD.goalTop+10,WORLD.goalBottom-10):clamp(cy+randomBetween(-aimBand,aimBand)+randomBetween(-error,error),WORLD.goalTop+10,WORLD.goalBottom-10);")
p.write_text(s)

p=root/'src/main.js';s=p.read_text()
s=s.replace("import {kitFor,KIT_CHOICES} from './kits.js';", "import {kitFor,KIT_CHOICES} from './kits.js';\nimport {teamIdentity,countryFlag,isClub} from './identity.js';\nimport {defaultPlan,safePlan,validatePlan,ATTACK_STYLES,DEFENCE_STYLES} from './tactics.js';")
s=s.replace("let league=store.get('league'", "let teamPlans=store.get('teamPlans',{}),squadContext='home',squadSide=0;\nlet league=store.get('league'")
s=s.replace("const nations=()=>TEAMS.map((t,i)=>[i,`${t.flag}","const nations=()=>TEAMS.map((t,i)=>[i,`${countryFlag(t)}")
s=s.replace("const roster=i=>(edits[TEAMS[i].id]||rosterFor(i)).map(withStats);", "const roster=i=>(edits[TEAMS[i].id]||rosterFor(i)).map(withStats);\nconst planFor=i=>safePlan(teamPlans[TEAMS[i].id],roster(i),i);\nconst identity=i=>teamIdentity(TEAMS[i]);")
s=s.replace('VERSION 0.6.3','VERSION 0.7.0')
s=s.replace('function showSquad(fromPause=false)',"function showSquad(side=0,origin='home')")
# substitute entire showSquad line (one long line)
start=s.index("function showSquad(side=0,origin='home')")
end=s.index("\nfunction exportSave",start)
s=s[:start]+'''function showSquad(side=0,origin='home'){
 squadSide=side;squadContext=origin;
 const index=origin==='pause'?game.teamIds[side]:side===0?home:away;
 const team=TEAMS[index],players=origin==='pause'?game.rosters[side]:roster(index);
 const plan=origin==='pause'?safePlan(game.teamPlans[side],players,index):planFor(index);
 const order=['GK','DF','DF','MF','FW','FW'];
 const memberOptions=players.map((p,i)=>[i,`#${p.num} ${p.name} · ${p.role}`]);
 const fieldPlayerOptions=plan.lineup.map(i=>memberOptions[i]);
 const roleOptions=players.map((p,i)=>[i,`${plan.lineup.includes(i)?'●':'○'} #${p.num} ${p.name}`]);
 page('TEAM COMMAND CENTER',`${team.name} — edit formation, starting six, captain, set pieces and tactics ${origin==='pause'?'while the game is paused':'before kickoff'}.`,
 `<div class="squadHeader">${identity(index)}<strong>${escapeHTML(team.name)}</strong><span>${origin==='pause'?'LIVE TACTICS':'PREGAME PLAN'} · 6 ON FIELD / 6 BENCH</span></div><div class="twoCol"><div class="panel"><h3 class="titleSmall">FORMATION & LINEUP</h3>${field('FORMATION','formation',Object.keys(FORMATIONS).map(v=>[v,v]),plan.formation)}
 ${plan.lineup.map((id,i)=>`<div class="lineupRow"><strong>${order[i]}</strong>${choice('pos'+i,(i===0?memberOptions.filter(([j])=>players[j].role==='GK'):memberOptions.filter(([j])=>players[j].role!=='GK')),id)}<span class="pill">#${players[id]?.num||'?'}</span></div>`).join('')}
 <p class="muted">Choose an unused player from the bench to make a substitution. Existing players keep their stamina; new substitutes enter with their own fitness.</p>
 <h3 class="titleSmall">LEADERSHIP & SET PIECES</h3><div class="tacticsGrid">${[['captain','CAPTAIN'],['penalty','PENALTY KICKS'],['freeKick','FREE KICKS'],['corner','CORNERS']].map(([key,label])=>`<div>${field(label,'role_'+key,key==='captain'?fieldPlayerOptions:roleOptions,plan[key])}</div>`).join('')}</div>
 <h3 class="titleSmall">TEAM INSTRUCTIONS</h3><div class="tacticsGrid"><div>${field('ATTACKING STYLE','attackStyle',ATTACK_STYLES.map(v=>[v,v]),plan.attack)}</div><div>${field('DEFENSIVE STYLE','defenceStyle',DEFENCE_STYLES.map(v=>[v,v]),plan.defence)}</div></div>
 <p class="muted">Possession prioritizes passes; Direct pushes forward and shoots earlier. High Press closes down faster; Deep Block holds positions. Captain boosts team passing slightly. Penalty taker accuracy affects shootouts. Free-kick/corner roles are saved, but those restart mechanics are not yet playable.</p>
 <div class="row">${button('✓ SAVE TACTICS','saveSquad','gold')}${button('RESTORE DEFAULT','resetSquad')}${button('← BACK',origin==='setup'?'returnSetup':origin==='pause'?'returnPause':'home')}</div></div><div class="panel"><h3 class="titleSmall">12-PLAYER ROSTER</h3><div class="roster">${players.map((p,i)=>`<div class="rosterCard ${plan.lineup.includes(i)?'startingPlayer':''}"><div class="portrait">${p.role==='GK'?'🧤':'⚽'}</div><div><div class="rosterName">${plan.lineup.includes(i)?'● STARTING ':'○ BENCH '}#${p.num} ${escapeHTML(p.name)}</div><div class="rosterMeta">${p.role} · STA ${p.stamina} · DEF ${p.defence} · SPD ${p.speedRating} · AGI ${p.agility}</div><div class="rosterMeta">SHOT ${p.shootPower}/${p.shootAccuracy} · PASS ${p.passing} · GK ${p.gkSkill}</div></div></div>`).join('')}</div></div></div>`,origin==='setup'?'returnSetup':origin==='pause'?'returnPause':'home');
}
''' +s[end:]
# start engine plans now (include away)
old="lineups:[home===0&&mode!=='career'?lineup.slice():[0,1,2,3,4,5],[0,1,2,3,4,5]],formations:[formation,'2-1-2'],options:"
new="lineups:[planFor(home).lineup.slice(),planFor(away).lineup.slice()],formations:[planFor(home).formation,planFor(away).formation],plans:[planFor(home),planFor(away)],options:"
assert old in s;s=s.replace(old,new)
# setup team badge and buttons
s=s.replace('<canvas class="teamPortrait" id="homePortrait"', '${identity(home)}<canvas class="teamPortrait" id="homePortrait"')
s=s.replace('<canvas class="teamPortrait" id="awayPortrait"', '${identity(away)}<canvas class="teamPortrait" id="awayPortrait"')
s=s.replace('<div class="row space setupFoot"><span class="muted">', '<div class="row setupManagerActions">${button(\'⚙ HOME TACTICS\',\'prepHome\')}${button(\'⚙ AWAY TACTICS\',\'prepAway\')}<span class="muted">Set formation, captain, starters, substitutions and tactical style before kickoff.</span></div>\n <div class="row space setupFoot"><span class="muted">')
s=s.replace("${button('▶ RESUME','resume','gold')}${button('TEAM TACTICS','squad')}","${button('▶ RESUME','resume','gold')}${button('HOME TACTICS','tacticHome')}${humans>=2?button('AWAY TACTICS','tacticAway'):''}")
s=s.replace("${button('▶ SECOND HALF','resume','gold')}${button('SQUAD & TACTICS','squad')}","${button('▶ SECOND HALF','resume','gold')}${button('HOME TACTICS','tacticHome')}${humans>=2?button('AWAY TACTICS','tacticAway'):''}")
# action handler
s=s.replace("else if(a==='kickoff')start();else if(a==='squad')showSquad(game.matchState==='paused');", "else if(a==='kickoff')start();else if(a==='squad')showSquad(0,game.matchState==='paused'?'pause':'home');else if(a==='prepHome')showSquad(0,'setup');else if(a==='prepAway')showSquad(1,'setup');else if(a==='tacticHome')showSquad(0,'pause');else if(a==='tacticAway'&&humans>=2)showSquad(1,'pause');else if(a==='returnSetup')showSetup(mode);else if(a==='returnPause')pause();")
start=s.index(" else if(a==='saveSquad')")
end=s.index(" else if(a==='exportSave')",start)
s=s[:start]+''' else if(a==='saveSquad'){
  const ix=squadContext==='pause'?game.teamIds[squadSide]:squadSide===0?home:away;
  const players=squadContext==='pause'?game.rosters[squadSide]:roster(ix);
  const raw={formation:$('formation').value,lineup:Array.from({length:6},(_,i)=>+$('pos'+i).value),captain:+$('role_captain').value,penalty:+$('role_penalty').value,freeKick:+$('role_freeKick').value,corner:+$('role_corner').value,attack:$('attackStyle').value,defence:$('defenceStyle').value};
  try{const plan=validatePlan(raw,players,ix);teamPlans[TEAMS[ix].id]=plan;store.put('teamPlans',teamPlans);
   if(squadContext==='pause'){game.applyPlan(squadSide,plan);pause();}else if(squadContext==='setup')showSetup(mode);else showHome();
  }catch(e){alert(e.message)}
 }
 else if(a==='resetSquad'){
  const ix=squadContext==='pause'?game.teamIds[squadSide]:squadSide===0?home:away;
  teamPlans[TEAMS[ix].id]=defaultPlan(ix);store.put('teamPlans',teamPlans);
  if(squadContext==='pause'){game.applyPlan(squadSide,teamPlans[TEAMS[ix].id]);pause();}else showSquad(squadSide,squadContext);
 }
''' +s[end:]
# Save export/import
s=s.replace("'kitSelections','options'", "'kitSelections','teamPlans','options'") # unknown export list separate
s=s.replace("'options','league','lineup','edits'", "'options','league','lineup','edits','teamPlans'")
# never change camera while paused? okay
s=s.replace("version:'0.6.3-alpha'", "version:'0.7.0-alpha'")
s=s.replace("getKitChoices:()=>kitSelections.slice()", "getKitChoices:()=>kitSelections.slice(),getTeamPlan:i=>planFor(i)")
p.write_text(s)
# styles
p=root/'style.css';s=p.read_text();s+='''
/* v0.7.0 — offline club emblems, flags and tactical command center */
.teamIdentity{display:inline-flex;align-items:center;justify-content:center;position:relative;vertical-align:middle;min-height:33px;min-width:42px;gap:2px;flex:none}
.flagGlyph{font-size:25px;line-height:1.2;filter:drop-shadow(0 1px 2px #0008)}
.crestGraphic{width:32px;height:38px;display:inline-flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 2px #0007)}
.crestGraphic svg{width:100%;height:100%}
.nationCard>.teamIdentity{position:absolute;z-index:2;align-self:flex-start;min-width:36px;min-height:38px;background:#0a2939c5;border-radius:7px;padding:1px;top:3px;left:3px}
.nationCard{position:relative}
.nationCard>.teamIdentity .crestGraphic{width:28px;height:34px}.nationCard>.teamIdentity .flagGlyph{font-size:18px}
.squadHeader{display:flex;align-items:center;gap:10px;border:1px solid #67a7b9;padding:9px 12px;border-radius:12px;background:#163e50;margin:12px 0}.squadHeader>strong{font-size:21px;color:#ffdea0}.squadHeader>span:last-child{font-size:11px;color:#b6d7d9;margin-left:auto}
.tacticsGrid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:8px 0 12px}.tacticsGrid>div{min-width:0}.tacticsGrid .choice{width:100%}.rosterCard.startingPlayer{border-color:#ecca6e;background:#24536380}
.setupManagerActions{align-items:center;gap:8px;margin-top:10px}.setupManagerActions .muted{font-size:11px}
@media(max-width:650px){.tacticsGrid{grid-template-columns:1fr}.squadHeader{flex-wrap:wrap}.squadHeader>span:last-child{margin-left:0}.setupManagerActions .muted{display:none}.setupManagerActions .btn{font-size:10px;padding:7px}.nationCard>.teamIdentity{min-height:23px}.nationCard>.teamIdentity .crestGraphic{height:25px;width:20px}.nationCard>.teamIdentity .flagGlyph{font-size:15px}}
''';p.write_text(s)
# test/build modifications; keep no incompatible import expression
p=root/'tests/build.py';s=p.read_text();s=s.replace("['kits','stats','data'", "['kits','stats','data','identity','tactics'")
s=s.replace(" 'const AI=(()=>{", " 'const IDENTITY=(()=>{'+modules['identity']+'\\nreturn {countryCode,countryFlag,isClub,crestText,crestSVG,teamIdentity};})();',\n 'const TACTICS=(()=>{const {FORMATIONS,DEFAULT_LINEUP}=DATA;'+modules['tactics']+'\\nreturn {ATTACK_STYLES,DEFENCE_STYLES,ROLES,defaultPlan,validatePlan,safePlan,tacticModifiers};})();',\n 'const AI=(()=>{")
s=s.replace("const {kitFor}=KITS;'+modules['engine']", "const {kitFor}=KITS;const {safePlan,validatePlan,tacticModifiers}=TACTICS;'+modules['engine']")
s=s.replace("const {kitFor,KIT_CHOICES}=KITS;const {GameEngine}=ENGINE;", "const {kitFor,KIT_CHOICES}=KITS;const {teamIdentity,countryFlag,isClub}=IDENTITY;const {defaultPlan,safePlan,validatePlan,ATTACK_STYLES,DEFENCE_STYLES}=TACTICS;const {GameEngine}=ENGINE;")
p.write_text(s)
