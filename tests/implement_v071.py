from pathlib import Path
p=Path(__file__).resolve().parents[1]
def change(filename,old,new,n=1):
 path=p/filename;s=path.read_text()
 if old not in s: raise ValueError(f'missing {filename}: {old[:140]}')
 if n>0 and s.count(old)!=n: raise ValueError(f'count {filename} found {s.count(old)} expected {n}: {old[:120]}')
 path.write_text(s.replace(old,new))
change('src/engine.js',"import {safePlan,validatePlan,tacticModifiers} from './tactics.js';", "import {safePlan,validatePlan,tacticModifiers} from './tactics.js';\nimport {MAX_SUBSTITUTIONS,initialFatigue,fatigueTick,actionFatigue,substitutionChanges,recommendSubstitute,matchCondition} from './fitness.js';")
change('src/engine.js',"this.matchSerial=0;this.onEvent=()=>{};", "this.matchSerial=0;this.fatigueLedger=[{},{}];this.playerSeconds=[{},{}];this.substitutionsUsed=[0,0];this.subbedOut=[new Set(),new Set()];this.maxSubstitutions=MAX_SUBSTITUTIONS;this.onEvent=()=>{};")
change('src/engine.js',"this.pk=null;this.matchSerial++;this.spawnPlayers();", "this.pk=null;this.matchSerial++;this.fatigueLedger=this.rosters.map(roster=>Object.fromEntries(roster.map(p=>[p.id,initialFatigue(p)])));this.playerSeconds=[{},{}];this.substitutionsUsed=[0,0];this.subbedOut=[new Set(),new Set()];this.spawnPlayers();")
change('src/engine.js',"old.get(`${t}:${src.id}`)?.fatigue??Math.max(0,(100-(src.condition??100))*.003)", "old.get(`${t}:${src.id}`)?.fatigue??this.fatigueLedger[t][src.id]??initialFatigue(src)")
change('src/engine.js',"  // Match must remain paused while the command center is open.\n  if(!['paused','play','penalty'].includes(this.matchState))throw Error('Cannot change tactics outside a match');", "  // Substitutions are only allowed during a stoppage, and are irreversible.\n  if(this.matchState!=='paused')throw Error('Tactical changes and substitutions require a paused match');\n  const changes=substitutionChanges(this.lineups[t],next.lineup);\n  if(changes.out.length!==changes.in.length)throw Error('Invalid substitution');\n  if(this.substitutionsUsed[t]+changes.out.length>this.maxSubstitutions)throw Error('Only '+this.maxSubstitutions+' substitutions permitted per team');\n  if(changes.in.some(i=>this.subbedOut[t].has(this.rosters[t][i].id)))throw Error('A substituted-off player cannot return');\n  if(changes.in.some(i=>(this.rosters[t][i].injuryWeeks||0)>0))throw Error('An injured player cannot enter');")
change('src/engine.js',"  const prev=this.players.filter(p=>p.t===t);const existing=new Map(prev.map(p=>[p.src.id,{fatigue:p.fatigue,stun:p.stun}]));\n  this.teamPlans[t]=next;", "  const prev=this.players.filter(p=>p.t===t);const existing=new Map(prev.map(p=>[p.src.id,{fatigue:p.fatigue,stun:p.stun}]));\n  for(const player of prev)this.fatigueLedger[t][player.src.id]=player.fatigue;\n  this.substitutionsUsed[t]+=changes.out.length;\n  for(const id of changes.out)this.subbedOut[t].add(this.rosters[t][id].id);\n  this.teamPlans[t]=next;")
change('src/engine.js',"kept?.fatigue??Math.max(0,(100-(src.condition??100))*.003)","kept?.fatigue??this.fatigueLedger[t][src.id]??initialFatigue(src)")
change('src/engine.js',"  this.toast(TEAMS[this.teamIds[t]].name+' tactics updated');return next;", "  this.emit('substitution',{team:t,count:changes.out.length,used:this.substitutionsUsed[t],max:this.maxSubstitutions});\n  this.toast(TEAMS[this.teamIds[t]].name+' tactics updated'+(changes.out.length?' · '+this.substitutionsUsed[t]+'/'+this.maxSubstitutions+' subs':''));return next;")
change('src/engine.js'," staminaTick(p,dt,intensity=0){const cap=stat(p,'stamina');const cost=(.0012+.0088*intensity)*(110-cap)/55;p.fatigue=clamp(p.fatigue+dt*cost-dt*(intensity<.08?.0018:.00016),0,1)}", " staminaTick(p,dt,intensity=0){p.fatigue=fatigueTick(p.fatigue,stat(p,'stamina'),dt,intensity);this.fatigueLedger[p.t][p.src.id]=p.fatigue;}\n spendStamina(p,kind){p.fatigue=actionFatigue(p.fatigue,stat(p,'stamina'),kind);this.fatigueLedger[p.t][p.src.id]=p.fatigue;}\n halftimeRecovery(){for(let t=0;t<2;t++)for(const src of this.rosters[t])this.fatigueLedger[t][src.id]=Math.max(0,(this.fatigueLedger[t][src.id]??initialFatigue(src))-.13);for(const p of this.players){p.fatigue=this.fatigueLedger[p.t][p.src.id];p.stun=0;}}\n autoSubstituteCpu(){if(this.humans!==1||this.substitutionsUsed[1]>=this.maxSubstitutions)return false;const t=1,next=recommendSubstitute(this.teamPlans[t],this.rosters[t],this.fatigueLedger[t],this.subbedOut[t]);if(!next)return false;const lineup=this.lineups[t].slice(),slot=lineup.indexOf(next.out);if(slot<1)return false;lineup[slot]=next.in;const roles=['captain','penalty','freeKick','corner'];const plan={...this.teamPlans[t],lineup};for(const role of roles)if(plan[role]===next.out)plan[role]=next.in;this.applyPlan(t,plan);this.emit('cpuSubstitution',{team:t,out:this.rosters[t][next.out].name,in:this.rosters[t][next.in].name});return true;}\n getFitnessReport(team=0){return this.rosters[team].map(src=>{const fatigue=this.fatigueLedger[team][src.id]??initialFatigue(src),seconds=this.playerSeconds[team][src.id]||0;return {id:src.id,fatigue,seconds,condition:matchCondition(src.condition??100,fatigue,seconds),stamina:stat(src,'stamina'),subbedOut:this.subbedOut[team].has(src.id)};});}")
change('src/engine.js',"p.cd=.28;this.emit('kick'", "p.cd=.28;this.spendStamina(p,opts.shot?'super':opts.pass?'pass':'shoot');this.emit('kick'")
change('src/engine.js',"jump(p){if(p.z>0||p.stun>0)return;p.z=2;", "jump(p){if(p.z>0||p.stun>0)return;this.spendStamina(p,'jump');p.z=2;")
change('src/engine.js',"p.cd=.57;p.fatigue=Math.min(1,p.fatigue+.012*(110-stat(p,'stamina'))/65);", "p.cd=.57;this.spendStamina(p,slide?'slide':'tackle');")
change('src/engine.js',"if(this.half===1){this.half=2;this.clock=0;for(let p of this.players){p.stun=0;p.fatigue=Math.max(0,p.fatigue-.18)}this.resetKickoff(1);this.emit('halftime')}", "if(this.half===1){this.half=2;this.clock=0;this.halftimeRecovery();this.resetKickoff(1);this.matchState='paused';this.autoSubstituteCpu();this.emit('halftime')}")
change('src/engine.js'," updatePlayers(dt){const b=this.ball;for(let p of this.players){p.anim+=dt;", " updatePlayers(dt){const b=this.ball;for(let p of this.players){this.playerSeconds[p.t][p.src.id]=(this.playerSeconds[p.t][p.src.id]||0)+dt;p.anim+=dt;")
change('src/engine.js',"this.staminaTick(p,dt,d>8?.46:0);", "this.staminaTick(p,dt,d>8?(this.teamPlans[t]?.defence==='High Press'&&owner?.t!==t?.69:.46):0);")
# stamina drives shot contests, passing precision and goalkeeping
change('src/engine.js',"const miss=(100-quality)*1.45;", "const miss=(100-quality)*1.45*(1+.85*p.fatigue);")
change('src/engine.js',"p.keeper?26+stat(p,'gkSkill')*.18:27", "p.keeper?(26+stat(p,'gkSkill')*.18)*(1-.18*p.fatigue):27")
change('src/engine.js',"p.keeper?63+stat(p,'gkJump')*1.12:45", "p.keeper?(63+stat(p,'gkJump')*1.12)*(1-.15*p.fatigue):45")
change('src/stats.js',"const atk=stat(attacker,'aggression')*.60+stat(attacker,'defence')*.40+(slide?8:0);", "const atk=(stat(attacker,'aggression')*.60+stat(attacker,'defence')*.40+(slide?8:0))*(1-.27*(attacker.fatigue||0));")
# Recover fatigue for new bench after halftime and scores without reset, look kept ledger.
change('src/render.js',"  if(variant%4===2){ellipse(ctx,-31,21,3,6,'#a4efff');", "  if((p.fatigue||0)>.50){\n   const breath=Math.sin(this.time*(5+((p.fatigue||0)*5))+p.i);\n   ellipse(ctx,-27,18,4+Math.max(0,breath)*1.5,6+Math.max(0,breath)*2,'#b3f2ffaa');\n   if((p.fatigue||0)>.75){ctx.fillStyle='#e9ffff';ctx.font='bold 18px sans-serif';ctx.fillText('💦',20,-51);}\n  }\n  if(variant%4===2){ellipse(ctx,-31,21,3,6,'#a4efff');")
# career module persistence, keep deterministic injury rather than unseeded randomness.
addon="""
// v0.7.1: after an actual played career fixture, preserve fatigue-driven fitness.
// A low-condition, heavily exhausted athlete has a deterministic small risk of a
// short injury. Academy/bench players recover slightly if they did not play.
export function recordMatchFitness(c,report){
 const lookup=new Map(report.map(r=>[r.id,r]));const incidents=[];
 for(const p of c.roster){const r=lookup.get(p.id);if(!r)continue;
  const old=Number.isFinite(+p.condition)?+p.condition:100;
  if(r.seconds>0){p.condition=Math.max(25,Math.min(100,Math.round(r.condition)));}
  else p.condition=Math.min(100,old+2);
  const exposure=r.seconds>5&&(r.fatigue>.68||p.condition<48);
  const injuryRoll=seed(p.id,c.season,c.week,c.history.length)%1000;
  if(exposure&&injuryRoll<Math.min(85,Math.round((r.fatigue*.6+(100-p.condition)/200)*55))){p.injuryWeeks=Math.max(p.injuryWeeks||0,1+injuryRoll%2);incidents.push(p.name);}
 }
 c.lastFitnessReport={players:report.length,injuries:incidents,averageCondition:Math.round(c.roster.reduce((s,p)=>s+(p.condition??100),0)/c.roster.length)};
 return c.lastFitnessReport;
}
"""
(path:=p/'src/career.js').write_text(path.read_text()+addon)
change('src/main.js',"recoverPlayer,careerCoverage} from './career.js';", "recoverPlayer,careerCoverage,recordMatchFitness} from './career.js';")
change('src/main.js',"if(mode==='career'&&career){const outcome=advanceCareer(career,TEAMS,ev.score,ev.penalties?ev.winner:null);", "if(mode==='career'&&career){recordMatchFitness(career,game.getFitnessReport(0));const outcome=advanceCareer(career,TEAMS,ev.score,ev.penalties?ev.winner:null);")
change('src/main.js',"function halftime(){game.matchState='paused';page('HALF TIME'", "function halftime(){game.matchState='paused';page('HALF TIME'") # noop sentinel
change('src/main.js',"<p class=\"muted\">Choose an unused player from the bench to make a substitution. Existing players keep their stamina; new substitutes enter with their own fitness.</p>", "<p class=\"muted\">${origin==='pause'?`SUBSTITUTIONS: <b>${game.substitutionsUsed[side]} / ${game.maxSubstitutions}</b> used. Only ${game.maxSubstitutions} changes allowed; substituted-off players cannot return.`:'Before kickoff, choose any six starters. During play, use Pause to substitute up to three players.'} Substitutes enter with their own fitness; exhausted players lose speed, precision and tackling strength.</p>")
change('src/main.js',"${p.role} · STA ${p.stamina} · DEF ${p.defence}", "${p.role} · ${origin==='pause'?`FIT ${Math.round(100*(1-(game.fatigueLedger[side][p.id]??0)))}% · `:`CON ${p.condition??100}% · `}STA ${p.stamina} · DEF ${p.defence}")
change('src/main.js',"<p class=\"muted\">Players recover from knockdown. Adjust your starting roster from the squad menu before the second half.</p>", "<p class=\"muted\">Players have recovered some stamina, not all. CPU teams may make an automatic substitution. Use the command center for up to three substitutions; bench fatigue is remembered.</p>")
# Avoid silently persisting rejected squad. Store only when successful applying plan.
change('src/main.js',"try{const plan=validatePlan(raw,players,ix);teamPlans[TEAMS[ix].id]=plan;store.put('teamPlans',teamPlans);\n   if(squadContext==='pause'){game.applyPlan(squadSide,plan);pause();}else if(squadContext==='setup')showSetup(mode);else showHome();", "try{const plan=validatePlan(raw,players,ix);\n   if(squadContext==='pause')game.applyPlan(squadSide,plan);\n   teamPlans[TEAMS[ix].id]=plan;store.put('teamPlans',teamPlans);\n   if(squadContext==='pause')pause();else if(squadContext==='setup')showSetup(mode);else showHome();")
change('src/main.js',"teamPlans[TEAMS[ix].id]=defaultPlan(ix);store.put('teamPlans',teamPlans);\n  if(squadContext==='pause'){game.applyPlan(squadSide,teamPlans[TEAMS[ix].id]);pause();}else showSquad(squadSide,squadContext);", "const replacement=defaultPlan(ix);try{if(squadContext==='pause')game.applyPlan(squadSide,replacement);teamPlans[TEAMS[ix].id]=replacement;store.put('teamPlans',teamPlans);if(squadContext==='pause')pause();else showSquad(squadSide,squadContext);}catch(e){alert(e.message)}")
change('src/main.js',"version:'0.7.0-alpha'", "version:'0.7.2-alpha'")
change('package.json','"version": "0.7.0-alpha"','"version": "0.7.2-alpha"')
change('package.json','"description": "Independent HD arcade soccer with procedural club badges, flags and editable match tactics"','"description": "Independent HD arcade soccer with match fitness and limited substitutions"')
# single script module for HTML builder
builder=p/'tests/build.py';s=builder.read_text();s=s.replace("for name in ['kits','stats','data'", "for name in ['kits','stats','fitness','data'")
s=s.replace(" 'const DATA=(()=>{'+modules['data']", " 'const FITNESS=(()=>{'+modules['fitness']+'\\nreturn {MAX_SUBSTITUTIONS,initialFatigue,fatigueTick,actionFatigue,staminaPercent,matchCondition,fatigueStatus,substitutionChanges,recommendSubstitute};})();',\n 'const DATA=(()=>{'+modules['data']")
s=s.replace('recoverPlayer,careerCoverage};})();', 'recoverPlayer,careerCoverage,recordMatchFitness};})();')
s=s.replace('const {safePlan,validatePlan,tacticModifiers}=TACTICS;\'+modules[\'engine\']', 'const {safePlan,validatePlan,tacticModifiers}=TACTICS;const {MAX_SUBSTITUTIONS,initialFatigue,fatigueTick,actionFatigue,substitutionChanges,recommendSubstitute,matchCondition}=FITNESS;\'+modules[\'engine\']')
s=s.replace('recoverPlayer,careerCoverage}=CAREER;\'+modules[\'main\']','recoverPlayer,careerCoverage,recordMatchFitness}=CAREER;\'+modules[\'main\']')
builder.write_text(s)
print('v071 modules patched')
