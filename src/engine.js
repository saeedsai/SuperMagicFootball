import {TEAMS,JAPAN_ROSTER,rosterFor,FORMATIONS,DEFAULT_LINEUP,SHOTS} from './data.js';
import {dribbleStyle, dribbleOdds} from './dribbles.js';
import {aiTuning,defensivePressers} from './ai.js';
import {withStats,stat,endurance,contest,shotError} from './stats.js';
import {kitFor} from './kits.js';
import {safePlan,validatePlan,tacticModifiers} from './tactics.js';
import {clampMorale, moraleFactor, reactToTalk, goalMorale, personalityOf, TEAM_TALKS, moodLabel} from './morale.js';
import {MAX_SUBSTITUTIONS,initialFatigue,fatigueTick,actionFatigue,substitutionChanges,recommendSubstitute,matchCondition} from './fitness.js';
import {fieldAbility,keeperAbility,abilityReady,keeperInReach} from './abilities.js';
import {abilityLevel,levelModifiers,shotVelocityModifier} from './special_levels.js';
export const WORLD={w:3640,h:1530,field:{x:150,y:155,w:3340,h:1220},goalTop:620,goalBottom:910,goalDepth:76};
export const SUPER_SHOT_TRANSFORM_SECONDS=1.65;
const F=WORLD.field, MID=F.x+F.w/2, CX=(t)=>t===0?F.x:F.x+F.w;
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));const norm=(x,y)=>{let d=Math.hypot(x,y)||1;return {x:x/d,y:y/d}};
function randomBetween(a,b){return a+Math.random()*(b-a)}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
export class GameEngine{
 constructor(options={},input){this.options=options;this.input=input;this.events=[];this.mode='quick';this.matchState='none';this.teamIds=[0,9];this.rosters=[[],[]];this.lineups=[DEFAULT_LINEUP.slice(),[0,1,2,3,5,9]];this.formation=['2-1-2','2-1-2'];this.teamPlans=[];this.controlled=[3,3,0,0];this.humans=1;this.score=[0,0];this.half=1;this.clock=0;this.matchSeconds=120;this.players=[];this.ball={};this.particles=[];this.shake=0;this.flash=0;this.weather='Clear';this.terrain='Grass';this.condition='Good';this.wind={x:0,y:0};this.stormTimer=0;this.tornado=null;this.celebration=0;this.pendingKickoff=null;this.goalHero=null;this.cooldown=0;this.pk=null;this.matchSerial=0;this.fatigueLedger=[{},{}];this.playerSeconds=[{},{}];this.substitutionsUsed=[0,0];this.subbedOut=[new Set(),new Set()];this.maxSubstitutions=MAX_SUBSTITUTIONS;this.moraleLedger=[{},{}];this.talksUsed=[{},{ }];this.celebrationStyle=0;this.onEvent=()=>{};this.aiComboNext=[0,0];this.aiComboThink=[0,0];this.autoSwitchAccum=[0,0];this.manualSwitchGrace=[0,0];}
 emit(type,data={}){const ev={type,...data};this.events.push(ev);this.onEvent(ev)}
 init({home=0,away=9,mode='quick',humans=1,rosters,formations,lineups,plans,options=this.options}={}){
 this.options=options;this.mode=mode;this.humans=humans;this.teamIds=[home,away];this.rosters=(rosters||[rosterFor(home),rosterFor(away)]).map(team=>team.map(withStats));this.lineups=lineups||[home===0?DEFAULT_LINEUP.slice():[0,1,2,3,5,9],away===0?DEFAULT_LINEUP.slice():[0,1,2,3,5,9]];this.formation=formations||[options.formation||'2-1-2','2-1-2'];this.teamPlans=[0,1].map(t=>safePlan(plans?.[t]||{formation:this.formation[t],lineup:this.lineups[t]},this.rosters[t],t===0?home:away));this.formation=this.teamPlans.map(p=>p.formation);this.lineups=this.teamPlans.map(p=>p.lineup.slice());this.score=[0,0];this.half=1;this.clock=0;this.matchSeconds=options.halfSeconds||120;this.weather=options.weather==='Random'?['Clear','Rain','Wind','Storm','Tornado'][Math.floor(Math.random()*5)]:options.weather||'Clear';this.terrain=options.terrain||'Grass';this.condition=options.condition||'Good';this.wind={x:0,y:0};this.ball={x:MID,y:F.y+F.h*.5,z:0,vx:0,vy:0,vz:0,owner:null,shot:null,trail:[],age:0,power:0,canCollect:0,targetY:0,attacker:-1};this.players=[];this.particles=[];this.events=[];this.controlled=[3,3,0,0];this.shake=0;this.flash=0;this.celebration=0;this.pendingKickoff=null;this.goalHero=null;this.cooldown=0;this.stormTimer=2;this.tornado=null;this.pk=null;this.matchSerial++;this.aiComboNext=[0,0];this.aiComboThink=[0,0];this.autoSwitchAccum=[0,0];this.manualSwitchGrace=[0,0];this.fatigueLedger=this.rosters.map(roster=>Object.fromEntries(roster.map(p=>[p.id,initialFatigue(p)])));this.moraleLedger=this.rosters.map(roster=>Object.fromEntries(roster.map(p=>[p.id,clampMorale(p.morale??55)])));this.talksUsed=[{},{}];this.celebrationStyle=0;this.playerSeconds=[{},{}];this.substitutionsUsed=[0,0];this.subbedOut=[new Set(),new Set()];this.spawnPlayers();this.resetKickoff(0);this.matchState='play';this.emit('start',{mode});}
 spawnPlayers(){const old=new Map(this.players.map(p=>[`${p.t}:${p.src.id}`,{fatigue:p.fatigue,stun:p.stun,morale:p.morale,cryTimer:p.cryTimer,abilityCd:p.abilityCd,dashCooldown:p.dashCooldown,diveCooldown:p.diveCooldown,comboCooldown:p.comboCooldown,contactCooldown:p.contactCooldown, trickCd:p.trickCd, trickGuard:p.trickGuard}]));this.players=[];for(let t=0;t<2;t++)for(let i=0;i<6;i++){
 const src=this.rosters[t][this.lineups[t][i]],home=FORMATIONS[this.formation[t]][i];let x=F.x+(t===0?home.x:1-home.x)*F.w,y=F.y+home.y*F.h;
 this.players.push({t,i,src,x,y,homeX:x,homeY:y,face:t===0?1:-1,dx:0,dy:0,z:0,vz:0,jumpCount:0,jumpHold:0,jumpTapPending:false,stun:0,anim:0,action:'idle',actionTimer:0,invuln:0,fatigue:old.get(`${t}:${src.id}`)?.fatigue??this.fatigueLedger[t][src.id]??initialFatigue(src),moveVX:0,moveVY:0,morale:old.get(`${t}:${src.id}`)?.morale??this.moraleLedger[t][src.id]??55,cryTimer:old.get(`${t}:${src.id}`)?.cryTimer??0,abilityCd:old.get(`${t}:${src.id}`)?.abilityCd??0,abilityFx:0,dashTimer:0,sprintCharge:0,dashCooldown:old.get(`${t}:${src.id}`)?.dashCooldown??0,diveCooldown:old.get(`${t}:${src.id}`)?.diveCooldown??0,comboCooldown:old.get(`${t}:${src.id}`)?.comboCooldown??0,contactCooldown:old.get(`${t}:${src.id}`)?.contactCooldown??0,trickCd:old.get(`${t}:${src.id}`)?.trickCd??0,trickGuard:old.get(`${t}:${src.id}`)?.trickGuard??0,trickFx:0,trickStyleId:null,comboWindow:0,comboActive:false,assistBy:null,assistFx:0,cd:0,specialCd:0,controlled:false,keeper:i===0,down:false,charge:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,aiComboGoal:null});}
 }
 applyPlan(t,raw){
  if(t!==0&&t!==1)throw Error('Invalid team');
  const next=validatePlan(raw,this.rosters[t],this.teamIds[t]);
  // Substitutions are only allowed during a stoppage, and are irreversible.
  if(this.matchState!=='paused')throw Error('Tactical changes and substitutions require a paused match');
  const changes=substitutionChanges(this.lineups[t],next.lineup);
  if(changes.out.length!==changes.in.length)throw Error('Invalid substitution');
  if(this.substitutionsUsed[t]+changes.out.length>this.maxSubstitutions)throw Error('Only '+this.maxSubstitutions+' substitutions permitted per team');
  if(changes.in.some(i=>this.subbedOut[t].has(this.rosters[t][i].id)))throw Error('A substituted-off player cannot return');
  if(changes.in.some(i=>(this.rosters[t][i].injuryWeeks||0)>0))throw Error('An injured player cannot enter');
  const prev=this.players.filter(p=>p.t===t);const existing=new Map(prev.map(p=>[p.src.id,{fatigue:p.fatigue,stun:p.stun,morale:p.morale,cryTimer:p.cryTimer,abilityCd:p.abilityCd,dashCooldown:p.dashCooldown,diveCooldown:p.diveCooldown,comboCooldown:p.comboCooldown,contactCooldown:p.contactCooldown,trickCd:p.trickCd,trickGuard:p.trickGuard}]));
  for(const player of prev)this.fatigueLedger[t][player.src.id]=player.fatigue;
  this.substitutionsUsed[t]+=changes.out.length;
  for(const id of changes.out)this.subbedOut[t].add(this.rosters[t][id].id);
  this.teamPlans[t]=next;this.lineups[t]=next.lineup.slice();this.formation[t]=next.formation;
  for(let i=0;i<6;i++){
   const p=this.player(t,i),src=this.rosters[t][next.lineup[i]],kept=existing.get(src.id);
   const pos=FORMATIONS[next.formation][i],targetX=F.x+(t===0?pos.x:1-pos.x)*F.w,targetY=F.y+pos.y*F.h;
   if(p.src.id!==src.id){
    if(this.ball.owner===p){this.ball.owner=null;this.ball.vx=0;this.ball.vy=0;this.ball.canCollect=.3;}
    p.src=src;p.fatigue=kept?.fatigue??this.fatigueLedger[t][src.id]??initialFatigue(src);p.morale=kept?.morale??this.moraleLedger[t][src.id]??55;p.cryTimer=kept?.cryTimer??0;p.abilityCd=kept?.abilityCd??0;p.abilityFx=0;p.dashTimer=0;p.sprintCharge=0;p.dashCooldown=kept?.dashCooldown??0;p.diveCooldown=kept?.diveCooldown??0;p.comboCooldown=kept?.comboCooldown??0;p.contactCooldown=kept?.contactCooldown??0;p.trickCd=kept?.trickCd??0;p.trickGuard=kept?.trickGuard??0;p.trickFx=0;p.trickStyleId=null;p.comboWindow=0;p.comboActive=false;p.assistBy=null;p.assistFx=0;p.stun=0;p.cd=0;p.charge=0;
   }
   p.homeX=targetX;p.homeY=targetY;p.keeper=i===0;
   // New players join near their assigned position; old ones keep moving to new positions.
   if(!kept){p.x=targetX;p.y=targetY;p.moveVX=p.moveVY=0;}
  }
  if(this.controlled[t]>=6||this.controlled[t]<0)this.controlled[t]=3;
  this.emit('substitution',{team:t,count:changes.out.length,used:this.substitutionsUsed[t],max:this.maxSubstitutions});
  this.toast(TEAMS[this.teamIds[t]].name+' tactics updated'+(changes.out.length?' · '+this.substitutionsUsed[t]+'/'+this.maxSubstitutions+' subs':''));return next;
 }
 getTeam(t){return kitFor(TEAMS[this.teamIds[t]],this.options.kitChoices?.[t]|| (t===0?'home':'away'))}
 player(t,i){return this.players.find(p=>p.t===t&&p.i===i)}
 controlledPlayer(t){return this.player(t,this.controlled[t])}
 // Talk choices are allowed once before kick-off and once at halftime, per team.
 applyTeamTalk(team,choice='none',phase='pregame'){
  if(![0,1].includes(team))throw Error('Invalid team talk side');
  if(!['pregame','halftime'].includes(phase)||!TEAM_TALKS[choice])throw Error('Invalid team talk');
  if(phase==='pregame'&&(this.half!==1||this.clock>0.001))throw Error('Pregame talk window closed');
  if(phase==='halftime'&&(this.half!==2||this.matchState!=='paused'||this.clock>0.001))throw Error('Halftime talk window closed');
  if(this.talksUsed[team][phase])throw Error('This team already had a '+phase+' talk');
  this.talksUsed[team][phase]=true;
  const results=[];
  for(const src of this.rosters[team]){
   const response=reactToTalk(this.moraleLedger[team][src.id]??55,src,choice,phase==='halftime'?2:1);
   this.moraleLedger[team][src.id]=response.after;results.push(response);
  }
  for(const p of this.players.filter(p=>p.t===team))p.morale=this.moraleLedger[team][p.src.id];
  const backfires=results.filter(r=>r.backfire).length;
  const positive=results.filter(r=>r.delta>0).length;
  this.emit('teamTalk',{team,choice,phase,backfires,positive,morale:Math.round(this.teamMorale(team))});
  return {team,choice,phase,backfires,positive,morale:Math.round(this.teamMorale(team))};
 }
 teamMorale(team){const values=Object.values(this.moraleLedger[team]);return values.reduce((a,b)=>a+b,0)/Math.max(1,values.length)}
 onGoalMorale(scored){
  this.celebrationStyle=(this.matchSerial*3+this.score[0]*5+this.score[1]*7+scored)%5;
  for(const p of this.players){const value=goalMorale(this.moraleLedger[p.t][p.src.id]??55,p.t===scored);p.morale=value;this.moraleLedger[p.t][p.src.id]=value;p.cryTimer=p.t===scored?0:3.3;p.action=p.t===scored?'celebrate':'cry';p.actionTimer=3.3;}
  for(let t=0;t<2;t++)for(const src of this.rosters[t]){
   if(this.players.some(p=>p.t===t&&p.src.id===src.id))continue;
   this.moraleLedger[t][src.id]=goalMorale(this.moraleLedger[t][src.id]??55,t===scored);
  }
 }
 cpuLevel(p){return p.t===1&&this.humans===1?this.options.difficulty??2:2}
 playerSpeed(p){return (191+stat(p,'speedRating')*1.24)*(this.options.gameSpeed||1)*endurance(p)*moraleFactor(p.morale)}
 // Speed rating controls top speed, agility controls acceleration, stopping and turns.
 moveAgile(p,dx,dy,maxSpeed,dt){
  const mag=Math.hypot(dx,dy),n=mag>1?1/mag:1;
  const targetVX=dx*n*maxSpeed,targetVY=dy*n*maxSpeed;
  const turn=Math.max(0,Math.min(1,(3.0+stat(p,'agility')*.13)*dt));
  p.moveVX=(p.moveVX||0)+(targetVX-(p.moveVX||0))*turn;
  p.moveVY=(p.moveVY||0)+(targetVY-(p.moveVY||0))*turn;
  const move=Math.hypot(p.moveVX,p.moveVY);
  if(move>maxSpeed&&move>0){p.moveVX=p.moveVX/move*maxSpeed;p.moveVY=p.moveVY/move*maxSpeed;}
  p.x+=p.moveVX*dt;p.y+=p.moveVY*dt;
  p.dx=maxSpeed?p.moveVX/maxSpeed:0;p.dy=maxSpeed?p.moveVY/maxSpeed:0;
 }

 staminaTick(p,dt,intensity=0){p.fatigue=fatigueTick(p.fatigue,stat(p,'stamina'),dt,intensity);this.fatigueLedger[p.t][p.src.id]=p.fatigue;}
 spendStamina(p,kind){const levelKind=kind==='super'||kind==='comboSuper'?'shot':kind==='defenceSuper'?'defence':kind==='keeperSuper'?'keeper':null;const multiplier=levelKind?levelModifiers(abilityLevel(p,levelKind)).fatigue:1;p.fatigue=actionFatigue(p.fatigue,stat(p,'stamina'),kind,multiplier);this.fatigueLedger[p.t][p.src.id]=p.fatigue;}
 halftimeRecovery(){for(const p of this.players)this.fatigueLedger[p.t][p.src.id]=p.fatigue;for(let t=0;t<2;t++)for(const src of this.rosters[t])this.fatigueLedger[t][src.id]=Math.max(0,(this.fatigueLedger[t][src.id]??initialFatigue(src))-.13);for(const p of this.players){p.fatigue=this.fatigueLedger[p.t][p.src.id];p.stun=0;}}
 autoSubstituteCpu(){if(this.humans!==1||this.substitutionsUsed[1]>=this.maxSubstitutions)return false;const t=1,next=recommendSubstitute(this.teamPlans[t],this.rosters[t],this.fatigueLedger[t],this.subbedOut[t]);if(!next)return false;const lineup=this.lineups[t].slice(),slot=lineup.indexOf(next.out);if(slot<1)return false;lineup[slot]=next.in;const roles=['captain','penalty','freeKick','corner'];const plan={...this.teamPlans[t],lineup};for(const role of roles)if(plan[role]===next.out)plan[role]=next.in;this.applyPlan(t,plan);this.emit('cpuSubstitution',{team:t,out:this.rosters[t][next.out].name,in:this.rosters[t][next.in].name});return true;}
 getFitnessReport(team=0){return this.rosters[team].map(src=>{const fatigue=this.fatigueLedger[team][src.id]??initialFatigue(src),seconds=this.playerSeconds[team][src.id]||0;return {id:src.id,fatigue,seconds,condition:matchCondition(src.condition??100,fatigue,seconds),stamina:stat(src,'stamina'),subbedOut:this.subbedOut[team].has(src.id)};});}
 inControl(t){return t===0||t===1&&this.humans>=2}
 hostOfBall(){return this.ball.owner}
 toast(msg){this.emit('toast',{message:msg})}
 resetKickoff(which=0){this.spawnPlayers();this.ball={x:MID,y:F.y+F.h*.5,z:0,vx:0,vy:0,vz:0,owner:null,shot:null,trail:[],age:0,power:0,canCollect:0,targetY:0,attacker:-1};const starter=this.player(which,3);starter.x=MID+(which===0?-26:26);starter.y=F.y+F.h*.5;this.take(starter);this.controlled[0]=3;this.controlled[1]=3;this.cooldown=.9;}
 take(p){if(this.inControl(p.t)&&!p.keeper)this.controlled[p.t]=p.i;let b=this.ball;b.owner=p;b.x=p.x+p.face*17;b.y=p.y+10;b.z=0;b.vx=b.vy=b.vz=0;b.shot=null;b.age=0;b.canCollect=0;}
 freeBall(p,dx,dy,speed=500,opts={}){
 const b=this.ball,v=norm(dx,dy);speed*=this.options.gameSpeed||1;b.owner=null;b.x=p.x+p.face*21;b.y=p.y-5;b.vx=v.x*speed;b.vy=v.y*speed;// Airborne transformed shots must descend into the goal mouth rather than
 // retaining the jump's original height. Ordinary aerial kicks remain lofted.
 const superFromJump=!!opts.shot&&p.z>60;
 b.z=superFromJump?Math.min(62,opts.z||34):Math.max(p.z,opts.z||13);
 b.vz=superFromJump?-Math.max(28,Math.min(125,p.z*.48)):opts.vz||0;
 b.shot=opts.shot||null;b.power=opts.power||p.src.shoot;b.attacker=p.t;b.canCollect=.17;b.trail=[];b.age=0;b.shooter=p.src.name;p.action=opts.shot?'super':opts.pass?'pass':'kick';p.actionTimer=opts.shot?.6:.30;p.cd=.28;this.spendStamina(p,opts.shot?'super':opts.pass?'pass':'shoot');this.emit('kick',{player:p,super:!!opts.shot});if(opts.shot){this.shake=.19;this.flash=.23;this.burst(b.x,b.y,opts.shot.color,22)}else this.burst(b.x,b.y,'#fff',6);
 }
 shoot(p,special=false,alternate=false,charged=0){if(this.ball.owner!==p)return;if(special&&p.specialCd>0)return;const t=p.t,dir=t===0?1:-1,goalY=(WORLD.goalTop+WORLD.goalBottom)/2;const spread=shotError(p,!this.inControl(p.t)?aiTuning(this.cpuLevel(p)).aimError:18)/moraleFactor(p.morale);
 const keeper=this.players.find(q=>q.t!==t&&q.keeper);
 const accuracy=stat(p,'shootAccuracy'),goalHeight=WORLD.goalBottom-WORLD.goalTop;
 // High precision identifies the farther open corner; poor precision is noisy.
 const openTop=WORLD.goalTop+goalHeight*.19,openBottom=WORLD.goalBottom-goalHeight*.19;
 const corner=keeper?(Math.abs(keeper.y-openTop)>Math.abs(keeper.y-openBottom)?openTop:openBottom):goalY;
 const intelligence=clamp((accuracy-20)/80,0,1);
 const ideal=goalY+(corner-goalY)*intelligence+(p.dy||0)*30*(1-intelligence);
 const noise=spread*(1.35-intelligence*.75)+(100-accuracy)*.62;
 let aim=clamp(ideal+(Math.random()-.5)*noise*2,WORLD.goalTop-95,WORLD.goalBottom+95);const dx=(t===0?F.x+F.w:F.x)-p.x,dy=aim-p.y;const magnitude=Math.hypot(dx,dy);if(special){let spec=SHOTS[p.src.shot]||SHOTS.nuts;this.freeBall(p,dx,dy,850*spec.speed*shotVelocityModifier(p.src.shot,abilityLevel(p,'shot'))*(.72+stat(p,'shootPower')*.004)*endurance(p)*moraleFactor(p.morale),{shot:{...spec,id:p.src.shot,phase:0,startY:p.y,direction:dir,aimY:aim,alternate},power:((stat(p,'shootPower')*.59+9)*spec.impact*endurance(p)+18)*levelModifiers(abilityLevel(p,'shot')).power,z:29,vz:alternate?190:45});p.specialCd=3.4;}else{let speed=(450+stat(p,'shootPower')*4.0)*(1+Math.min(1.2,charged)*.32)*endurance(p)*moraleFactor(p.morale)*(alternate?(.82+stat(p,'heading')*.003):1);this.freeBall(p,dx,dy,speed,{power:stat(p,'shootPower')*.64*endurance(p),z:p.z+14,vz:alternate?160:Math.random()*90})}}
 pass(p,long=false,cross=false){
 const mates=this.players.filter(q=>q.t===p.t&&q!==p&&!q.stun&&(!q.keeper||p.keeper));
 if(!mates.length)return;
 const dir=p.t===0?1:-1,lookX=Math.abs(p.dx)>.22?p.dx:dir,lookY=p.dy||0;
 const scored=mates.map(q=>{const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1;const facing=(dx/d)*lookX+(dy/d)*lookY;const advance=dx*dir;return {q,score:facing*420+advance*.18-d*.43+(d<100?-600:0)+(d>1200?-1100:0)}});
 scored.sort((a,b)=>b.score-a.score);const target=scored[0].q;
 const wide=Math.abs(p.y-(F.y+F.h/2))>F.h*.31;const leader=this.rosters[p.t][this.teamPlans[p.t]?.captain];const captainOnField=this.players.some(q=>q.t===p.t&&q.src.id===leader?.id);const quality=Math.min(100,stat(p,wide?'crossing':'passing')+(captainOnField?4:0));const miss=(100-quality)*1.45*(1+.85*p.fatigue);const ex=(Math.random()-.5)*miss,ey=(Math.random()-.5)*miss;this.freeBall(p,target.x-p.x+(target.dx||0)*(long?150:90)+ex,target.y-p.y+(target.dy||0)*(long?150:90)+ey,(445+quality*2.6)*(long?1.38:1),{power:5,z:p.z+8,vz:cross?245:long?160:wide?105:65,pass:true});
 if(this.inControl(p.t)&&p.i===this.controlled[p.t])this.controlled[p.t]=target.i;
 }
 // Holding Sprint while moving builds toward a short, stamina-limited hyperdash.
 triggerHyperdash(p){
  if(p.keeper||p.stun>0||p.z>45||p.dashCooldown>0||p.dashTimer>0||p.fatigue>.78)return false;
  p.dashTimer=.62;p.dashCooldown=4.3;p.sprintCharge=0;
  p.action='hyperdash';p.actionTimer=.35;
  this.spendStamina(p,'hyperdash');this.burst(p.x,p.y,'#87e7ff',12);
  this.emit('hyperdash',{team:p.t,player:p.src.name});return true;
 }
 // Intentional cooperative jump: hold PASS while pressing JUMP next to a grounded teammate.
 // No teammate stacking is triggered by a normal jump or while carrying the ball.
 tryTeammateLaunch(p){
  if(!p||p.keeper||p.stun>0||p.z>0||p.vz>0||p.comboCooldown>0||p.fatigue>.78||this.ball.owner===p)return false;
  const ally=this.players.filter(q=>q.t===p.t&&q!==p&&!q.keeper&&q.z===0&&q.stun<=0&&q.fatigue<.78&&q.cd<=0&&distance(p,q)<115)
      .sort((a,b)=>distance(p,a)-distance(p,b))[0];
  if(!ally)return false;
  p.comboCooldown=4.8;p.comboWindow=1.55;p.comboActive=true;p.assistBy=ally.src.name;p.chase=0;
  p.z=48;p.vz=650;p.action='comboJump';p.actionTimer=.78;p.cd=.14;
  ally.action='assistBoost';ally.actionTimer=.72;ally.cd=.9;ally.assistFx=.72;
  this.spendStamina(p,'comboJump');this.spendStamina(ally,'assistBoost');
  this.burst((p.x+ally.x)*.5,p.y,'#ffe180',20);
  this.emit('teamLaunch',{team:p.t,player:p.src.name,assistant:ally.src.name});return true;
 }
 // An aerial flip kick works on any sufficiently high jump, while a stacked jump
 // additionally enables a transformed special at the apex (abs(vz) <= 260).
 tryFlipKick(p,wantsSpecial=false){
  const b=this.ball;
  if(!p||p.keeper||p.stun>0||p.cd>0||p.z<95||b.owner||b.z<55)return false;
  if(distance(p,b)>110||Math.abs(b.z-(p.z+38))>125)return false;
  const assisted=!!p.comboActive&&p.comboWindow>0;
  const apex=assisted&&Math.abs(p.vz)<=260&&p.z>=145;
  const special=wantsSpecial&&apex&&p.specialCd<=0;
  const heading=stat(p,'heading'),accuracy=stat(p,'shootAccuracy'),power=stat(p,'shootPower');
  const goalX=p.t===0?F.x+F.w:F.x,goalY=(WORLD.goalTop+WORLD.goalBottom)*.5;
  const v=norm(goalX-p.x,goalY-p.y+(Math.random()-.5)*(100-accuracy)*1.8);
  const shot=special?(SHOTS[p.src.shot]||SHOTS.nuts):null;
  const velocity=(special?845*(shot?.speed||1)*shotVelocityModifier(p.src.shot,abilityLevel(p,'shot')):495+power*3.8)*(assisted?1.19:1)*endurance(p)*moraleFactor(p.morale);
  b.owner=null;b.vx=v.x*velocity;b.vy=v.y*velocity;b.vz=special?-85:185;
  b.z=special?Math.min(63,p.z+38):Math.max(b.z,p.z+38);b.attacker=p.t;b.shooter=p.src.name;b.power=(power*.66+heading*.18)*(assisted?1.2:1)*(special?(shot?.impact||1)*levelModifiers(abilityLevel(p,'shot')).power:1);
  b.shot=special?{...shot,id:p.src.shot,phase:0,startY:p.y,direction:p.t===0?1:-1,aimY:goalY,alternate:true}:null;
  b.age=0;b.canCollect=.24;b.trail=[];p.action=special?'comboSuper':'flipKick';p.actionTimer=.62;p.cd=.52;
  this.spendStamina(p,special?'comboSuper':'flipKick');if(special)p.specialCd=3.8;
  // Shot ends the assist window and prevents the same airborne ball being kicked twice.
  p.comboWindow=0;this.shake=special?.24:.10;this.burst(b.x,b.y,special?(shot?.color||'#fff39a'):'#f9d8ff',special?29:16);
  this.emit('flipKick',{team:p.t,player:p.src.name,assistant:assisted?p.assistBy:null,special,apex});return true;
 }
 // Ground contact after a launched aerial move can knock over one nearby opponent.
 landCombo(p){
  if(!p.comboActive)return;
  p.comboActive=false;p.comboWindow=0;
  const target=this.players.filter(q=>q.t!==p.t&&!q.keeper&&q.stun<=0&&q.invuln<=0&&distance(p,q)<60)
    .sort((a,b)=>distance(p,a)-distance(p,b))[0];
  if(!target)return;
  const resistance=stat(target,'strength')*.004;
  target.stun=Math.max(target.stun,Math.max(.24,.78-resistance));target.invuln=.85;
  target.action='hurt';target.actionTimer=.5;
  if(this.ball.owner===target){this.ball.owner=null;this.ball.x=target.x;this.ball.y=target.y;this.ball.vx=p.face*180;this.ball.vy=75;this.ball.vz=140;this.ball.z=26;this.ball.canCollect=.22;}
  p.action='comboLand';p.actionTimer=.35;
  this.burst(target.x,target.y,'#f5cb70',18);
  this.emit('comboLanding',{team:p.t,player:p.src.name,target:target.src.name});
 }
 // Loose aerial ball can be headed toward goal if jump timing and height line up.
 tryHeader(p){
  const b=this.ball;
  if(!p||p.keeper||p.stun>0||p.cd>0||p.z<30||b.owner||b.z<30)return false;
  if(Math.hypot(p.x-b.x,p.y-b.y)>92||Math.abs(b.z-(p.z+42))>90)return false;
  const toGoal=p.t===0?F.x+F.w:F.x,goalY=(WORLD.goalTop+WORLD.goalBottom)*.5;
  const heading=stat(p,'heading'),accuracy=stat(p,'shootAccuracy');
  const aimY=goalY+(Math.random()-.5)*(100-accuracy)*2.3;
  const vec=norm(toGoal-p.x,aimY-p.y),speed=(390+heading*4.8)*endurance(p)*moraleFactor(p.morale);
  b.owner=null;b.shot=null;b.vx=vec.x*speed;b.vy=vec.y*speed;b.vz=130+heading*.65;
  b.z=Math.max(b.z,p.z+55);b.power=heading*.57;b.attacker=p.t;b.shooter=p.src.name;b.age=0;b.canCollect=.22;b.trail=[];
  p.action='header';p.actionTimer=.5;p.cd=.42;this.spendStamina(p,'header');
  this.burst(b.x,b.y,'#fff1a0',14);this.emit('header',{team:p.t,player:p.src.name,heading});return true;
 }
 // Ordinary goalkeeper dives, separate from rare supernatural goalkeeper saves.
 // Direction and reach depend on keeper jumping and skill attributes.
 tryKeeperDive(p,manual=false){
  const b=this.ball;
  if(!p?.keeper||p.stun>0||p.diveCooldown>0||b.owner||b.attacker!==1-p.t)return false;
  const jump=stat(p,'gkJump'),skill=stat(p,'gkSkill');
  const reachX=105+jump*1.35,reachY=48+jump*1.08;
  const dx=b.x-p.x,dy=b.y-p.y;
  if(Math.abs(dx)>reachX||Math.abs(dy)>reachY||b.z>(45+jump*1.7))return false;
  // Reject shots already travelling away from the goalkeeper.
  if(b.vx*(p.t===0?1:-1)>0)return false;
  p.diveCooldown=2.4;p.action='keeperDive';p.actionTimer=.64;p.z=Math.max(12,p.z);
  p.x=clamp(p.x+clamp(dx,-58,58),F.x+12,F.x+F.w-12);
  p.y=clamp(p.y+clamp(dy,-64,64),F.y+12,F.y+F.h-12);
  const sign=p.t===0?1:-1;
  const force=Math.hypot(b.vx,b.vy)/50+(b.power||0),saveQuality=24+skill*.55+jump*.28;
  // Even a strong shot can be deflected; high-quality keepers catch slower shots.
  if(force<saveQuality*.62){this.take(p);this.emit('save',{player:p,type:'dive'});}
  else {b.owner=null;b.shot=null;b.vx=sign*(290+skill*4.1);b.vy=dy*4+Math.sign(dy||1)*115;b.vz=150+jump*.6;b.power=0;b.attacker=p.t;b.age=0;b.trail=[];b.canCollect=.32;this.emit('save',{player:p,type:'dive',deflected:true});}
  this.spendStamina(p,'keeperDive');this.burst(p.x,p.y,'#ccf9ff',16);
  this.emit('keeperDive',{team:p.t,player:p.src.name,manual});return true;
 }
 requestKeeperDive(team){return this.tryKeeperDive(this.player(team,0),true);}
 jump(p){
  if(p.stun>0)return false;
  if(p.z>10){if(p.jumpCount>=2||p.vz>275||p.fatigue>.86)return false;
   this.spendStamina(p,'jump');p.vz=Math.max(p.vz,535);p.z+=14;p.jumpCount=2;p.action='doubleJump';p.actionTimer=.5;this.emit('doubleJump',{team:p.t,player:p.src.name});return true;}
  this.spendStamina(p,'jump');p.z=2;p.vz=420;p.jumpCount=1;p.action='jump';p.actionTimer=.5;return true;
 }

 tackle(p,slide=false){if(p.cd>0||p.stun>0)return;p.cd=.57;this.spendStamina(p,slide?'slide':'tackle');p.action=slide?'slide':'punch';p.actionTimer=.4;const target=this.players.filter(q=>q.t!==p.t&&!q.stun).sort((a,b)=>distance(p,a)-distance(p,b))[0];let dir=target?norm(target.x-p.x,target.y-p.y):{x:p.face,y:0};p.x+=dir.x*(slide?26:16);p.y+=dir.y*(slide?26:16);
 if(target&&distance(p,target)<(slide?83:62)&&target.invuln<=0&&!target.keeper&&Math.random()<Math.min(.96,contest(p,target,slide).knockChance*moraleFactor(p.morale)/moraleFactor(target.morale)*(1-Math.min(.57,(target.trickGuard||0)*(1+stat(target,'dribbling')/200))))){target.stun=(slide?.63:.47)+contest(p,target,slide).duration*.35;target.action='hurt';target.actionTimer=.55;target.invuln=1.1;target.x+=dir.x*36;target.y+=dir.y*21;this.burst(target.x,target.y,'#ffdf81',11);this.shake=.12;if(this.ball.owner===target){this.ball.owner=null;this.ball.x=target.x;this.ball.y=target.y;this.ball.z=23;this.ball.vx=dir.x*150;this.ball.vy=dir.y*150;this.ball.vz=115;this.ball.canCollect=.15;}}
 }
 // Defensive abilities are only available to explicitly assigned characters.
 activateDefence(p){
  const move=fieldAbility(p.src);if(!abilityReady(p,move)||this.ball.owner===p||p.keeper)return false;
  const opponents=this.players.filter(q=>q.t!==p.t&&q.stun<=0&&q.invuln<=0&&!q.keeper);
  const targets=opponents.filter(q=>Math.hypot(p.x-q.x,p.y-q.y)<(move.id==='drill'?move.range:move.radius));
  if(!targets.length)return false; // no wasted cooldown if no target is close
  const target=targets.sort((a,b)=>distance(p,a)-distance(p,b))[0];
  if(move.id==='drill'){
    const v=norm(target.x-p.x,target.y-p.y);p.face=v.x>=0?1:-1;
    p.x=clamp(target.x-v.x*35,F.x+22,F.x+F.w-22);p.y=clamp(target.y-v.y*35,F.y+22,F.y+F.h-22);
  }
  const hits=move.id==='drill'?[target]:targets;
  for(const q of hits){if(distance(p,q)>move.radius+(move.id==='drill'?7:0))continue;
    const resistance=stat(q,'strength')*.40+stat(q,'defence')*.15;
    const force=stat(p,'aggression')*.42+stat(p,'defence')*.31+36;
    // Guaranteed stagger; strength/defence reduce stun duration.
    q.stun=Math.max(q.stun,Math.max(.3,(move.stun+(force-resistance)/145)*levelModifiers(abilityLevel(p,'defence')).stun));q.invuln=1.1;
    q.action='hurt';q.actionTimer=q.stun;
    if(this.ball.owner===q){this.ball.owner=null;this.ball.x=q.x;this.ball.y=q.y;this.ball.z=24;this.ball.vx=p.face*280;this.ball.vy=(q.y-p.y)*1.3;this.ball.vz=155;this.ball.canCollect=.23;}
  }
  p.abilityCd=move.cooldown;p.cd=Math.max(p.cd,.55);p.abilityFx=.75;p.action='defenceSuper';p.actionTimer=.6;
  this.spendStamina(p,'defenceSuper');this.burst(p.x,p.y,move.color,32);this.shake=.23;
  this.emit('defenceSuper',{team:p.t,player:p.src.name,id:move.id,level:abilityLevel(p,'defence'),hits:hits.length,cooldown:move.cooldown});return true;
 }
 activateKeeperSuper(p,manual=false){
   const move=keeperAbility(p?.src);const b=this.ball;
   if(!p?.keeper||!abilityReady(p,move)||!keeperInReach(p,b,{...move,reachX:move.reachX*levelModifiers(abilityLevel(p,'keeper')).reach,reachY:move.reachY*levelModifiers(abilityLevel(p,'keeper')).reach}))return false;
   if(b.attacker!==1-p.t)return false;
   const sign=p.t===0?1:-1;
   b.owner=null;b.shot=null;b.vx=sign*move.power*levelModifiers(abilityLevel(p,'keeper')).power;b.vy=(b.y-p.y)*3+(move.id==='tornadoPunch'?sign*115:0);b.vz=move.id==='tornadoPunch'?265:145;
   b.power=0;b.canCollect=.35;b.attacker=p.t;b.age=0;b.trail=[];
   p.abilityCd=move.cooldown;p.abilityFx=.85;p.action='keeperSuper';p.actionTimer=.75;
   p.z=Math.max(p.z,11);this.spendStamina(p,'keeperSuper');this.burst(p.x,p.y,move.color,48);this.shake=.36;
   this.emit('keeperSuper',{team:p.t,player:p.src.name,id:move.id,level:abilityLevel(p,'keeper'),manual,cooldown:move.cooldown});return true;
 }
 requestKeeperSuper(t){const keeper=this.player(t,0);return this.activateKeeperSuper(keeper,true);}
 dribble(p){
  if(this.ball.owner===p){if(p.cd>0||p.stun>0)return false;
   const dx=p.dx||p.face,dy=p.dy||0,n=norm(dx,dy);
   p.x=clamp(p.x+n.x*19,F.x+25,F.x+F.w-25);p.y=clamp(p.y+n.y*19,F.y+25,F.y+F.h-25);
   p.cd=.43;p.action='dribble';p.actionTimer=.44;this.spendStamina(p,'sprint');this.emit('dribble',{team:p.t,player:p.src.name});return true;
  }
  this.swap(p.t);return true;
 }
 // v0.8.6: two deliberate contextual tricks without additional touch buttons.
 // Jump + Dribble while carrying the ball triggers an arcing bicycle shot.
 tryBicycleShot(p){
  if(!p||p.keeper||p.stun>0||p.cd>0||this.ball.owner!==p||p.fatigue>.94)return false;
  const goalX=p.t===0?F.x+F.w:F.x,goalY=(WORLD.goalTop+WORLD.goalBottom)/2;
  const accuracy=stat(p,'shootAccuracy'),power=stat(p,'shootPower');
  const err=(Math.random()-.5)*(105-accuracy)*3.2;
  const dir=norm(goalX-p.x,goalY-p.y+err);
  const ballSpeed=(500+power*3.35)*endurance(p)*moraleFactor(p.morale)*(this.options.gameSpeed||1);
  this.ball.owner=null;this.ball.shot=null;this.ball.x=p.x+p.face*25;this.ball.y=p.y;
  this.ball.z=Math.max(45,p.z+48);this.ball.vx=dir.x*ballSpeed;this.ball.vy=dir.y*ballSpeed;
  this.ball.vz=255;this.ball.attacker=p.t;this.ball.shooter=p.src.name;
  this.ball.power=power*.72;this.ball.age=0;this.ball.canCollect=.24;this.ball.trail=[];
  p.z=Math.max(p.z,18);p.vz=Math.max(p.vz,210);p.action='bicycle';p.actionTimer=.65;p.cd=.64;
  this.spendStamina(p,'bicycle');this.burst(p.x,p.y,'#d9a7ff',15);
  this.emit('bicycleShot',{team:p.t,player:p.src.name,speed:ballSpeed});return true;
 }
 // Without possession, Jump+Shoot uses a flying kick, unless a rare super defence
 // or ordinary aerial ball interception is available. The attacker and defender
 // are both affected by strength/aggression and collision immunity.
 tryFlyingKick(p,spinning=false){
  if(!p||p.keeper||p.stun>0||p.cd>0||p.fatigue>.94)return false;
  if(spinning&&p.jumpCount<2)return false;
  if(p.z<12)this.jump(p);
  p.action=spinning?'defensiveBicycle':'flyingKick';p.actionTimer=spinning?.78:.60;p.cd=spinning?.88:.62;
  this.spendStamina(p,spinning?'bicycle':'flyingKick');
  const opponent=this.players.filter(q=>q.t!==p.t&&!q.keeper&&!q.stun&&q.invuln<=0&&distance(p,q)<(spinning?123:100))
   .sort((a,b)=>distance(p,a)-distance(p,b))[0];
  if(opponent){const direction=norm(opponent.x-p.x,opponent.y-p.y);
   const strengthGap=stat(p,'aggression')*.55+stat(p,'strength')*.45-stat(opponent,'strength')*.65;
   opponent.stun=Math.max(opponent.stun,Math.max(.18,(spinning?.52:.35)+strengthGap/240));opponent.invuln=.70;
   opponent.action='hurt';opponent.actionTimer=.50;
   opponent.x=clamp(opponent.x+direction.x*(spinning?51:35),F.x+22,F.x+F.w-22);
   opponent.y=clamp(opponent.y+direction.y*(spinning?43:30),F.y+23,F.y+F.h-23);
   if(this.ball.owner===opponent){this.ball.owner=null;this.ball.x=opponent.x;this.ball.y=opponent.y;
    this.ball.z=20;this.ball.vx=direction.x*180;this.ball.vy=direction.y*180;this.ball.vz=120;this.ball.canCollect=.24;}
   this.burst(opponent.x,opponent.y,'#ffce81',13);
  }
  this.emit(spinning?'defensiveBicycle':'flyingKick',{team:p.t,player:p.src.name,hit:!!opponent});return true;
 }
 // v0.8.7: ten individual dribble types. Only the second DRIBBLE tap triggers
 // a special trick; the first tap keeps the standard feint. Against an alert
 // defender a trick may fail. DEF, AGG, AGI, DRB, stamina and style all matter.
 tryDribbleTrick(p,byAI=false){
  if(!p||this.ball.owner!==p||p.keeper||p.stun>0||p.trickCd>0||p.fatigue>.92)return false;
  const style=dribbleStyle(p.src.dribbleType), opponents=this.players.filter(q=>q.t!==p.t&&!q.keeper&&q.stun<=0&&q.z<25)
    .sort((a,b)=>distance(p,a)-distance(p,b));
  const rival=opponents[0],close=!!rival&&distance(p,rival)<105;
  const skill={dribbling:stat(p,'dribbling'),agility:stat(p,'agility'),fatigue:p.fatigue};
  const threat=close?{defence:stat(rival,'defence'),aggression:stat(rival,'aggression')}:null;
  const success=!threat||Math.random()<dribbleOdds(skill,threat,style);
  // Face/movement determines forward axis. Escape toward the side *away* from
  // the closest defender, so style-specific movement is purposeful, not random.
  const forward=norm(p.dx||p.face,p.dy||0),lateral={x:-forward.y,y:forward.x};
  const relativeY=rival?(rival.x-p.x)*lateral.x+(rival.y-p.y)*lateral.y:0;
  const side=close?(relativeY>=0?-1:1):(p.dy<-0.05?-1:1);
  const quality=(.69+stat(p,'dribbling')*.006)*endurance(p);
  const factor=success?1:.22;
  p.x=clamp(p.x+(forward.x*style.forward+lateral.x*style.lateral*side)*quality*factor,F.x+23,F.x+F.w-23);
  p.y=clamp(p.y+(forward.y*style.forward+lateral.y*style.lateral*side)*quality*factor,F.y+24,F.y+F.h-24);
  if(style.turn)p.face*=-1;
  if(style.nutmeg&&success&&close&&distance(p,rival)<75){rival.stun=Math.max(rival.stun,.16);rival.action='hurt';rival.actionTimer=.22;}
  p.trickCd=style.cooldown*(1.15-stat(p,'agility')*.003)* (1+p.fatigue*.2);
  p.cd=success?.27:.43;p.trickGuard=success?style.guard*(.7+stat(p,'agility')/170):0;
  p.trickFx=success?.52:.25;p.trickStyleId=style.id;
  p.action='dribbleTrick';p.actionTimer=.53;
  p.fatigue=Math.min(1,p.fatigue+(.014*style.stamina)*(1.3-stat(p,'stamina')*.003));this.fatigueLedger[p.t][p.src.id]=p.fatigue;
  // Failed challenges can spill the ball, but do not magically award ownership.
  if(!success&&close&&distance(p,rival)<60){this.ball.owner=null;this.ball.shot=null;this.ball.x=p.x+forward.x*16;this.ball.y=p.y+forward.y*16;this.ball.vx=forward.x*85;this.ball.vy=forward.y*85;this.ball.canCollect=.2;}
  else if(style.loft&&success){this.ball.z=Math.max(this.ball.z,style.loft);}
  this.burst(p.x,p.y,success?style.color:'#ff9a93',success?13:6);
  this.emit('dribbleTrick',{team:p.t,player:p.src.name,style:style.id,name:style.name,success,ai:byAI});
  return true;
 }
 // Goalkeeper distribution always chooses an on-field non-GK teammate, otherwise
 // punts to a safe forward lane. This also prevents keeper possession deadlocks.
 distributeKeeper(p,mode='auto'){
  if(!p?.keeper||this.ball.owner!==p||p.stun>0)return false;
  const dir=p.t===0?1:-1;
  const mates=this.players.filter(q=>q.t===p.t&&!q.keeper&&q.stun<=0);
  const nearest=mates.slice().sort((a,b)=>distance(p,a)-distance(p,b))[0]||null;
  const forwards=mates.slice().sort((a,b)=>((b.x-a.x)*dir)||distance(p,a)-distance(p,b));
  const forward=forwards[0]||nearest;
  const pressured=this.players.some(q=>q.t!==p.t&&!q.keeper&&q.stun<=0&&distance(p,q)<180);
  const long=mode==='long'||(mode==='auto'&&(pressured||!nearest||distance(p,nearest)>930));
  const target=long?forward:nearest;
  if(target){const quality=stat(p,'passing');const miss=(100-quality)*(long?1.2:.55);
   const ex=(Math.random()-.5)*miss,ey=(Math.random()-.5)*miss;
   this.freeBall(p,target.x-p.x+ex+(target.moveVX||0)*(long?.35:.18),target.y-p.y+ey+(target.moveVY||0)*.18,
    long?690+quality*1.4:450+quality*1.9,{power:long?16:8,z:long?29:18,vz:long?215:80,pass:true});
  }else this.freeBall(p,dir,0,690,{power:12,z:23,vz:175,pass:true});
  p.keeperHold=0;
  this.emit('keeperDistribution',{team:p.t,player:p.src.name,target:target?.src?.name||null,mode:long?'long':'short'});
  return true;
 }

 command(p,a){if(a==='dribble'){this.dribble(p);return}if(a==='shoot'){if(this.tryFlipKick(p,false)||this.tryHeader(p))return;const mate=this.hostOfBall();if(mate&&mate.t===p.t&&mate!==p){if(mate.keeper)this.distributeKeeper(mate,'long');else this.shoot(mate,false)}else if(this.ball.owner===p){if(p.keeper)this.distributeKeeper(p,'long');else this.shoot(p,false,p.z>65)}else this.tackle(p,true)}
 if(a==='pass'){const mate=this.hostOfBall();if(mate&&mate.t===p.t&&mate!==p){if(mate.keeper)this.distributeKeeper(mate,'short');else this.pass(mate);}else if(this.ball.owner===p){if(p.keeper)this.distributeKeeper(p,'short');else this.pass(p);}else {if(distance(p,this.ball)<140)this.tackle(p,true);else{p.chase=1.8;p.action='sprint';p.actionTimer=.3}}}
 if(a==='special'){if(this.tryFlipKick(p,true))return;const mate=this.hostOfBall();if(mate&&mate.t===p.t&&mate!==p)this.shoot(mate,true);else if(this.ball.owner===p)this.shoot(p,true,p.z>60);else if(!this.requestKeeperSuper(p.t)&&!this.activateDefence(p))this.tackle(p,true)}
 if(a==='jump'){if(!this.requestKeeperDive(p.t)){const wantsAssist=this.inControl(p.t)&&!!this.input.held?.(p.t,'pass');if(!wantsAssist||!this.tryTeammateLaunch(p))this.jump(p);}}
 }
 autoSwitch(t,dt=.016){
  if(!this.inControl(t)||this.ball.owner?.t===t||this.matchState!=='play'){this.autoSwitchAccum[t]=0;return false;}
  if((this.manualSwitchGrace[t]||0)>0){this.autoSwitchAccum[t]=0;return false;}
  const selected=this.controlledPlayer(t),ball=this.ball.owner||this.ball;
  const input=this.input.state[t]||{};
  // Preserve intentional chases and aerial moves, but DO NOT disable automatic
  // selection merely because a player steers the joystick while defending.
  if(!selected||selected.z>15||selected.comboActive||selected.dashTimer>0||input.sprint||input.pass||selected.chase>0){this.autoSwitchAccum[t]=0;return false;}
  const d=distance(selected,ball);
  const candidates=this.players.filter(q=>q.t===t&&!q.keeper&&q.stun<=0&&q.z<=15);
  candidates.sort((a,b)=>distance(a,ball)-distance(b,ball));
  const best=candidates[0];
  if(!best||best===selected||d<310||distance(best,ball)+130>=d){this.autoSwitchAccum[t]=0;return false;}
  this.autoSwitchAccum[t]=(this.autoSwitchAccum[t]||0)+dt;
  if(this.autoSwitchAccum[t]<.32)return false;
  this.controlled[t]=best.i;this.autoSwitchAccum[t]=0;
  this.emit('autoSwitch',{team:t,player:best.src.name});return true;
 }
 swap(t){const b=this.ball,goal=b.owner?.t===t?b.owner:b;
  const arr=this.players.filter(p=>p.t===t&&!p.keeper&&p.stun<=0).sort((a,b)=>distance(a,goal)-distance(b,goal));
  const next=arr.find(p=>p.i!==this.controlled[t]);
  if(next){this.controlled[t]=next.i;this.manualSwitchGrace[t]=.85;this.autoSwitchAccum[t]=0;this.emit('switch',{team:t,player:next.src.name});return true}return false;
 }
 update(dt){if(this.matchState!=='play')return;dt=Math.min(.034,Math.max(0,dt));this.input.poll(this.humans>=2);if(this.celebration>0){this.celebration=Math.max(0,this.celebration-dt);this.updateEffects(dt);
   for(const p of this.players){p.anim+=dt;if(p.t===this.pendingKickoff?.scorer){p.action='celebrate';p.actionTimer=.25}else{p.action='cry';p.actionTimer=.25;p.cryTimer=this.celebration;}}
   if(this.celebration===0&&this.pendingKickoff){const k=this.pendingKickoff;this.pendingKickoff=null;this.resetKickoff(1-k.scorer);}return}
 this.clock+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.shake=Math.max(0,this.shake-dt*2.5);this.flash=Math.max(0,this.flash-dt*2);this.stormTimer-=dt;this.updateWeather(dt);if(this.input.just(0,'pause')||this.input.just(1,'pause')){this.matchState='paused';this.emit('pause');return}
 if(this.clock>=this.matchSeconds){if(this.half===1){this.half=2;this.clock=0;this.halftimeRecovery();this.resetKickoff(1);this.matchState='paused';this.autoSubstituteCpu();this.emit('halftime')}else if(this.score[0]===this.score[1]&&this.mode!=='training'){this.startPK(true)}else{this.matchState='finished';this.emit('finished',{score:this.score.slice()})}return}
 this.coordinateAiCombos(dt);this.manualSwitchGrace=this.manualSwitchGrace.map(v=>Math.max(0,v-dt));this.updatePlayers(dt);this.resolvePlayerContacts(dt);this.updateBall(dt);this.updateEffects(dt);
 }
 // v0.8.5 grounded player collision: unlike tackle/special attacks this is an
 // always-on physical constraint. Resolve every pair after movement, before ball
 // handling, so teammates/opponents cannot pass through or remain overlapping.
 resolvePlayerContacts(dt){
  const radius=25,diameter=radius*2,players=this.players;
  // Multiple relaxation sweeps handle crowded goalmouths. Stop immediately once
  // separated to avoid the extra work for normal open-field movement.
  for(let sweep=0;sweep<72;sweep++){
   let overlaps=0;
   for(let i=0;i<players.length;i++){
   const a=players[i];if(a.z>22)continue;
   for(let j=i+1;j<players.length;j++){
    const b=players[j];if(b.z>22)continue;
    let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
    if(d>=diameter)continue;
    overlaps++;
    // Deterministic direction when coordinates coincide; avoids NaN / randomness
    // across repeated simulation runs and ensures equal/opposite displacement.
    if(d<.0001){dx=a.t===b.t?(i%2?1:-1):a.t===0?1:-1;dy=(i+j)%2?.5:-.5;d=Math.hypot(dx,dy);}
    const nx=dx/d,ny=dy/d;
    const closing=Math.max(0,((a.moveVX||0)-(b.moveVX||0))*nx+((a.moveVY||0)-(b.moveVY||0))*ny);
    const same=a.t===b.t;
    // Always separate, including slow crowd movement; actual knockback occurs
    // only for sufficiently forceful impacts, with pair-level cooldown.
    const impact=closing>=75 && a.contactCooldown<=0 && b.contactCooldown<=0;
    const overshoot=impact?Math.min(10,(closing-75)*.027):0;
    const push=(diameter-d+0.03+overshoot)/2;
    a.x=clamp(a.x-nx*push,F.x+22,F.x+F.w-22);
    a.y=clamp(a.y-ny*push,F.y+23,F.y+F.h-23);
    b.x=clamp(b.x+nx*push,F.x+22,F.x+F.w-22);
    b.y=clamp(b.y+ny*push,F.y+23,F.y+F.h-23);
    // Kill the approach velocity, never reverse a sprint into perpetual impact.
    const av=(a.moveVX||0)*nx+(a.moveVY||0)*ny;
    const bv=(b.moveVX||0)*nx+(b.moveVY||0)*ny;
    if(av>0){a.moveVX-=av*nx*.85;a.moveVY-=av*ny*.85;}
    if(bv<0){b.moveVX-=bv*nx*.85;b.moveVY-=bv*ny*.85;}
    if(!impact)continue;
    a.contactCooldown=b.contactCooldown=.55;
    const severity=Math.min(1,(closing-75)/360);
    for(const p of [a,b]){
     const strength=stat(p,'strength');
     const stun=(same?.09:.16)+(same?.10:.24)*severity*(1-(strength-50)/140);
     p.stun=Math.max(p.stun,stun);
     p.action='hurt';p.actionTimer=Math.max(p.actionTimer,stun+.08);
    }
    if(!same&&closing>260&&this.ball.owner&&(this.ball.owner===a||this.ball.owner===b)){
     const owner=this.ball.owner;
     // A heavy collision can spill the ball, allowing another player to recover.
     this.ball.owner=null;this.ball.shot=null;this.ball.x=owner.x+owner.face*24;
     this.ball.y=owner.y;this.ball.z=19;this.ball.vz=85;
     this.ball.vx=nx*115*(owner===a?1:-1);this.ball.vy=ny*115*(owner===a?1:-1);
     this.ball.canCollect=.24;
    }
    this.emit('playerCollision',{teams:[a.t,b.t],players:[a.src.id,b.src.id],closingSpeed:Math.round(closing)});
    if(closing>170)this.burst((a.x+b.x)/2,(a.y+b.y)/2,'#fff0ad',5);
   }
   }
   if(overlaps===0)break;
  }
 }
 updateWeather(dt){if(this.weather==='Wind'||this.weather==='Storm'||this.weather==='Tornado'){let time=this.clock*1.4;this.wind.x=Math.sin(time/7)*220;this.wind.y=Math.cos(time/4)*85}else{this.wind.x=0;this.wind.y=0}
 if(this.stormTimer<=0){this.stormTimer=randomBetween(4,9);if(this.weather==='Storm'){
 let x=randomBetween(F.x+50,F.x+F.w-50),y=randomBetween(F.y,F.y+F.h);this.burst(x,y,'#faff9a',38);this.emit('lightning',{x,y});for(let p of this.players)if(Math.hypot(p.x-x,p.y-y)<110&&!p.keeper){p.stun=.95;p.action='hurt';p.actionTimer=.75}if(Math.hypot(this.ball.x-x,this.ball.y-y)<75){this.ball.vx*=1.5;this.ball.vz+=180;}}
 if(this.weather==='Tornado'){this.tornado={x:randomBetween(F.x+150,F.x+F.w-150),y:randomBetween(F.y+100,F.y+F.h-100),life:5}}}
 if(this.tornado){this.tornado.life-=dt;this.tornado.x+=this.wind.x*dt*.32;this.tornado.y+=Math.sin(this.clock*2)*35*dt;if(this.tornado.life<=0)this.tornado=null;else{for(let p of this.players){let d=distance(p,this.tornado);if(d<150&&!p.keeper){p.x+=(this.tornado.x-p.x)/(d||1)*110*dt;p.y+=(this.tornado.y-p.y)/(d||1)*110*dt;p.z=Math.max(p.z,Math.sin(this.clock*3)*32+38)}}let d=distance(this.ball,this.tornado);if(d<140&&this.ball.owner===null){this.ball.vx+=(this.tornado.x-this.ball.x)/(d||1)*290*dt;this.ball.vy+=(this.tornado.y-this.ball.y)/(d||1)*290*dt;this.ball.vz+=90*dt}}}
 }
 // Coordinated NPC aerial play: one team-level decision at a time, using the same
 // stamina, cooldown, collision and apex rules as the human teammate launch.
 // The side's manually controlled player is never auto-launched.
 coordinateAiCombos(dt){
  const b=this.ball;
  if(b.owner||b.z<80||b.z>380||b.canCollect>.6)return;
  for(let t=0;t<2;t++){
   if(this.clock<(this.aiComboThink[t]||0)||this.clock<(this.aiComboNext[t]||0))continue;
   const ai=aiTuning(this.cpuLevel({t}));
   this.aiComboThink[t]=this.clock+Math.max(.15,ai.reaction+.12);
   if(!ai.comboAwareness)continue;
   const preview=.16+ai.anticipation*.38;
   const future={x:clamp(b.x+(b.vx||0)*preview,F.x+25,F.x+F.w-25),
     y:clamp(b.y+(b.vy||0)*preview,F.y+25,F.y+F.h-25),
     z:Math.max(0,b.z+(b.vz||0)*preview-540*preview*preview)};
   if(future.z<70||future.z>385)continue;
   const available=this.players.filter(q=>q.t===t&&!q.keeper&&!q.stun&&q.z===0&&q.comboCooldown<=0&&q.fatigue<.72&&(!this.inControl(t)||q!==this.controlledPlayer(t)));
   // Being the human team's assistant is fine; controlling the HUMAN player isn't.
   const candidates=[];
   for(const jumper of available){
    const d=distance(jumper,future);
    if(d>145+ai.comboAwareness*115)continue;
    for(const assistant of this.players){
     if(assistant===jumper||assistant.t!==t||assistant.keeper||assistant.stun>0||assistant.z!==0||assistant.fatigue>.72||assistant.cd>0||(this.inControl(t)&&assistant===this.controlledPlayer(t)))continue;
     const pair=distance(jumper,assistant);
     if(pair>210||pair<1)continue;
     candidates.push({jumper,assistant,pair,score:d+pair*.40-stat(jumper,'heading')*.40});
    }
   }
   candidates.sort((a,b)=>a.score-b.score);
   if(!candidates.length)continue;
   const best=candidates[0];
   if(best.pair>108){
    best.assistant.aiAssistTarget={x:best.jumper.x+Math.sign(best.assistant.x-best.jumper.x||1)*64,
      y:best.jumper.y,expires:this.clock+1.4};
    // Retry shortly after the helper has had time to move into position.
    this.aiComboThink[t]=this.clock+.20;
   }else if(this.tryTeammateLaunch(best.jumper)){
    best.jumper.aiComboGoal={x:future.x,y:future.y};best.assistant.aiAssistTarget=null;
    this.aiComboNext[t]=this.clock+5.3;
    this.emit('aiComboSetup',{team:t,player:best.jumper.src.name,assistant:best.assistant.src.name,difficulty:ai.name});
   }
  }
 }
 // While airborne, NPC players track the loose ball and attempt the transformed
 // special only in the real apex window. Too-late balls get a normal flip kick.
 driveAiCombo(p,dt,ai){
  if(!p.comboActive||p.z<=0)return false;
  const b=this.ball;
  const speed=this.playerSpeed(p)*(.37+ai.comboAwareness*.28);
  const preview=.065;
  const target=b.owner?null:{x:b.x+(b.vx||0)*preview,y:b.y+(b.vy||0)*preview};
  const dx=target?target.x-p.x:0,dy=target?target.y-p.y:0,d=Math.hypot(dx,dy);
  if(d>10){this.moveAgile(p,dx/d,dy/d,speed,dt);if(Math.abs(p.dx)>.04)p.face=p.dx>0?1:-1;}
  else this.moveAgile(p,0,0,speed,dt);
  this.staminaTick(p,dt,d>10?.16:0);
  // No AI shortcut to bypass the original v0.8.2 special eligibility.
  if(!b.owner&&p.cd<=0&&p.z>=95&&distance(p,b)<=110&&Math.abs(b.z-(p.z+38))<=125){
   const timing=ai.comboTiming||0;
   if(p.comboWindow>0&&p.specialCd<=0&&p.z>=145&&Math.abs(p.vz)<=260*timing){
    this.tryFlipKick(p,true);
   }else if((p.vz<-230||p.comboWindow<.2)&&p.z>=95){this.tryFlipKick(p,false);}
  }
  return true;
 }
 updatePlayers(dt){const b=this.ball;
 for(let t=0;t<(this.humans>=2?2:1);t++)this.autoSwitch(t,dt);
 // Snapshot controllers: an in-frame swap must not make the next player consume the same tap.
 const selectedAtStart=this.controlled.slice();
 for(let p of this.players){this.playerSeconds[p.t][p.src.id]=(this.playerSeconds[p.t][p.src.id]||0)+dt;p.anim+=dt;p.cd=Math.max(0,p.cd-dt);p.invuln=Math.max(0,p.invuln-dt);p.specialCd=Math.max(0,p.specialCd-dt);p.abilityCd=Math.max(0,(p.abilityCd||0)-dt);p.abilityFx=Math.max(0,(p.abilityFx||0)-dt);p.dashCooldown=Math.max(0,(p.dashCooldown||0)-dt);p.diveCooldown=Math.max(0,(p.diveCooldown||0)-dt);p.comboCooldown=Math.max(0,(p.comboCooldown||0)-dt);p.contactCooldown=Math.max(0,(p.contactCooldown||0)-dt);p.trickCd=Math.max(0,(p.trickCd||0)-dt);p.trickGuard=Math.max(0,(p.trickGuard||0)-dt);p.trickFx=Math.max(0,(p.trickFx||0)-dt);p.comboWindow=Math.max(0,(p.comboWindow||0)-dt);p.assistFx=Math.max(0,(p.assistFx||0)-dt);p.dashTimer=Math.max(0,(p.dashTimer||0)-dt);p.actionTimer=Math.max(0,p.actionTimer-dt);p.cryTimer=Math.max(0,(p.cryTimer||0)-dt);if(p.actionTimer===0&&p.action!=='idle')p.action='idle';if(p.z>0||p.vz>0){p.z+=p.vz*dt;p.vz-=1080*dt;if(p.z<=0){const wasCombo=p.comboActive;p.z=0;p.vz=0;p.jumpCount=0;if(wasCombo)this.landCombo(p)}}
 if(p.stun>0){p.stun-=dt;p.moveVX=0;p.moveVY=0;this.staminaTick(p,dt,0);continue}
 const controlled=(p.t===0||p.t===1&&this.humans>=2)&&p.i===selectedAtStart[p.t];p.controlled=controlled;
 if(controlled){let s=this.input.state[p.t]||{},dx=s.x||0,dy=s.y||0;p.dx=dx;p.dy=dy;const elapsedJump=p.jumpHold||0;p.jumpHold=s.jump?elapsedJump+dt:0;const defensiveSprint=this.ball.owner!==p&&!!s.jump;const running=s.sprint||defensiveSprint||(this.ball.owner===p&&p.jumpHold>.16);let spd=this.playerSpeed(p)*(running?1.37:1)*(p.dashTimer>0?1.7:1)*(.88+p.src.power*.0015)*(this.terrain==='Sand'?.69:1)*(this.condition==='Wet'?.86:1);
 if((p.chase||0)>0&&this.ball.owner!==p&&p.z<=0){p.chase=Math.max(0,p.chase-dt);const target=this.ball.owner||this.ball,dist=Math.hypot(target.x-p.x,target.y-p.y);if(dist>57){dx=(target.x-p.x)/dist;dy=(target.y-p.y)/dist;}else if(p.cd<=0&&(!this.ball.owner||this.ball.owner.t!==p.t)){this.tackle(p,false);p.chase=0}}else p.chase=0;
 // Sustained movement + sprint is deliberate to prevent accidental hyperdash.
 if(running&&Math.hypot(dx,dy)>.52&&this.ball.owner!==p){p.sprintCharge=(p.sprintCharge||0)+dt;if(p.sprintCharge>.56)this.triggerHyperdash(p);}else p.sprintCharge=0;
 this.moveAgile(p,dx,dy,spd,dt);if(p.dashTimer>0){p.action='hyperdash';p.actionTimer=.17;}
 if(Math.abs(p.dx)>.04)p.face=p.dx>0?1:-1;this.staminaTick(p,dt,Math.hypot(dx,dy)>.14?(p.dashTimer>0?1.7:running?1.0:.45):0);if(this.cooldown===0){
  // Resolve simultaneous button chords before their constituent tap/release actions.
  // Either press order must yield one cross or bicycle, never two actions.
  if(!s.pass||!s.jump)p.crossChordLatched=false;
  if(!s.dribble||!s.jump)p.bicycleChordLatched=false;
  const crossChord=this.ball.owner===p&&s.pass&&s.jump&&!p.crossChordLatched&&
    (this.input.just(p.t,'pass')||this.input.just(p.t,'jump'));
  if(crossChord){this.pass(p,false,true);p.crossChordLatched=true;p.passUsed=true;p.passHold=0;p.jumpTapPending=false;}
  const bicycleChord=this.ball.owner===p&&s.jump&&s.dribble&&!p.bicycleChordLatched&&
    (this.input.just(p.t,'dribble')||this.input.just(p.t,'jump'));
  const bicycleFired=bicycleChord&&this.tryBicycleShot(p);
  if(bicycleFired){p.bicycleChordLatched=true;p.jumpTapPending=false;p.dribbleTapAt=-10;}
  if(this.input.just(p.t,'switch'))this.swap(p.t);
  const shootDown=this.input.just(p.t,'shoot');
  const shotCombo=shootDown&&(s.jump||p.z>20)&&(this.ball.owner===p||this.ball.owner?.t!==p.t);
  if(shotCombo){
   if(this.ball.owner===p){this.shoot(p,p.jumpCount>=2,p.z>18);}
   else if(!this.tryFlipKick(p,true)&&!this.tryHeader(p)&&!this.requestKeeperSuper(p.t)&&!(p.keeper&&this.tryKeeperDive(p,true))&&!this.activateDefence(p))this.tryFlyingKick(p,p.jumpCount>=2&&p.z>10);
   p.charge=0;p.comboShotHeld=true;
  }
  else if(this.ball.owner===p && s.shoot&&!p.comboShotHeld){p.charge=Math.min(1.2,(p.charge||0)+dt);p.action='windup';p.actionTimer=.1;}
  else if(p.charge>0){if(this.ball.owner===p)this.shoot(p,false,p.z>65,p.charge);p.charge=0;}
  if(!s.shoot)p.comboShotHeld=false;
  // A fast Shoot tap can start and finish between two input polls.
  if(shootDown&&this.ball.owner===p&&!s.shoot&&!shotCombo)this.shoot(p,false,p.z>65);
  if(shootDown&&this.ball.owner!==p&&!shotCombo)this.command(p,'shoot');
  // Four-button PASS is contextual: short tap, longer aerial pass, or defensive chase.
  if(s.pass&&!p.crossChordLatched){p.passHold=(p.passHold||0)+dt;
   if(this.ball.owner!==p&&!(this.ball.owner?.t===p.t&&this.ball.owner.keeper)&&p.passHold>.24){p.chase=Math.max(p.chase||0,0.36);p.passUsed=true;}}
  else if((p.passHold||0)>0||this.input.released?.(p.t,'pass')){
   if(!p.passUsed){if(this.ball.owner===p){if(p.keeper)this.distributeKeeper(p);else this.pass(p,p.passHold>.24,false);}else if(this.ball.owner?.t===p.t&&this.ball.owner.keeper)this.distributeKeeper(this.ball.owner);else this.tackle(p,false);}
   p.passHold=0;p.passUsed=false;
  }
  const dribbleDown=this.input.just(p.t,'dribble');
  if(dribbleDown&&!bicycleFired){
   if(s.jump&&this.ball.owner===p){this.tryBicycleShot(p);p.dribbleTapAt=-10;}
   else if(this.ball.owner===p&&this.clock-(p.dribbleTapAt??-10)<.30){
    if(!this.tryDribbleTrick(p))this.dribble(p);
    p.dribbleTapAt=-10;
   }else{this.dribble(p);p.dribbleTapAt=this.clock;}
  }
  // Jump held and Dribble tapped is accepted in either input order.
  const bicycleFromJump=bicycleFired;
  // A moving ball carrier holds Jump to sprint; a short tap still jumps.
  // Defer the ordinary jump until release to distinguish the two gestures.
  if(this.input.just(p.t,'jump')&&this.ball.owner===p&&!s.pass&&!s.shoot&&!s.dribble&&p.z<=0)p.jumpTapPending=true;
  let tapJumpResolved=false;
  if(this.input.released?.(p.t,'jump')&&p.jumpTapPending){if(elapsedJump<.18&&!s.pass&&!s.shoot&&!s.dribble){this.jump(p);tapJumpResolved=true;}p.jumpTapPending=false;}
  if(!s.jump&&p.jumpTapPending&&!this.input.just(p.t,'jump')){if(elapsedJump>0&&elapsedJump<.18&&!s.pass&&!s.shoot&&!s.dribble){this.jump(p);tapJumpResolved=true;}p.jumpTapPending=false;}

  for(let a of ['special','jump'])if(this.input.just(p.t,a)){
   if(a==='jump'&&(bicycleFromJump||p.crossChordLatched||p.jumpTapPending||tapJumpResolved))continue;
   if(a==='jump'&&this.ball.owner!==p&&!p.keeper&&!s.shoot&&!s.pass){this.requestKeeperDive(p.t);continue;} // defensive Jump sprints; keeper may dive
   if(a==='jump'&&s.pass&&this.ball.owner===p){this.pass(p,false,true);p.passUsed=true;continue;}
   if(a==='jump'&&s.pass&&this.ball.owner!==p)p.passUsed=true;
   this.command(p,a);
  }
 }
 }else this.driveAI(p,dt);
 p.x=clamp(p.x,F.x+22,F.x+F.w-22);p.y=clamp(p.y,F.y+23,F.y+F.h-23);
 }
 }
 driveAI(p,dt){
  // Game difficulty is a behaviour preset, not an arcade game-speed multiplier.
  const b=this.ball, owner=b.owner, t=p.t, dir=t===0?1:-1;
  const ai=aiTuning(this.cpuLevel(p));
  const aiStyle=this.options.aiStyle||'Balanced';const tactical=tacticModifiers(this.teamPlans[t]||{attack:'Balanced',defence:'Balanced'});
  // Always reserve a real AI defender; the human-controlled player must not
  // swallow the team pursuit assignment. The next closest AI supplies cover.
  const pressing=(!owner||owner.t!==t)?defensivePressers(this.players,t,owner||b,
   this.inControl(t)?this.controlledPlayer(t):null):null;
  const styleSpeed=t===1?(aiStyle==='Aggressive'?1.09:aiStyle==='Defensive'?.96:1):1;
  if(p.keeper&&owner===p){
   p.keeperHold=(p.keeperHold||0)+dt;
   if(p.keeperHold>=.65&&p.cd<=0){this.distributeKeeper(p);return;}
  }else if(p.keeper){p.keeperHold=0;}
  if(this.driveAiCombo(p,dt,ai))return;
  const speed=this.playerSpeed(p)*ai.speed*styleSpeed*(this.terrain==='Sand'?.75:1);
  if(p.aiAssistTarget){
   if(p.aiAssistTarget.expires<this.clock||this.ball.owner||p.stun>0||p.z>0){p.aiAssistTarget=null;}
   else{
    const target=p.aiAssistTarget,dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy);
    if(d>12)this.moveAgile(p,dx/d,dy/d,speed,dt);else this.moveAgile(p,0,0,speed,dt);
    this.staminaTick(p,dt,d>12?.36:0);
    return;
   }
  }
  p.aiTimer=(p.aiTimer??0)-dt;
  const decide=p.aiTimer<=0||!p.aiTarget;
  if(decide){
   // Reaction/awareness delay applies to positioning, keeper tracking and actions.
   p.aiTimer=ai.reaction;
   let tx=p.homeX,ty=p.homeY;
   const goalY=(WORLD.goalTop+WORLD.goalBottom)/2;
   const target=owner||b;
   const lead=owner?0:ai.anticipation;
   const bx=clamp(target.x+(b.vx||0)*lead,F.x+22,F.x+F.w-22);
   const by=clamp(target.y+(b.vy||0)*lead,F.y+23,F.y+F.h-23);
   if(p.keeper){
    const side=t===0?F.x+34:F.x+F.w-34;
    tx=side;
    ty=clamp(b.y+(b.vy||0)*ai.keeperRead,WORLD.goalTop+15,WORLD.goalBottom-15);
    if(!owner&&Math.abs(b.x-side)<175)tx=clamp(bx,side-35,side+35);
    if(owner===p&&p.cd<=0&&p.keeperHold>.30)this.distributeKeeper(p);
   }else if(owner===p){
    tx=clamp(p.x+dir*(180+ai.anticipation*210)*tactical.advance,F.x+100,F.x+F.w-100);
    ty=goalY+(p.y-goalY)*.38;
    const nearGoal=t===0?p.x>F.x+F.w*(.88-ai.anticipation*.32):p.x<F.x+F.w*(.12+ai.anticipation*.32);
    const defenders=this.players.filter(q=>q.t!==t&&!q.stun&&distance(p,q)<230);
    const pressured=defenders.length>0;
    if(p.cd<=0&&pressured&&p.trickCd<=0&&Math.random()<(.04+ai.anticipation*.62)&&this.tryDribbleTrick(p,true)){}
    else if(p.cd<=0&&pressured&&Math.random()<ai.passRate*tactical.pass){this.pass(p)}
    else if(p.cd<=0&&nearGoal&&Math.random()<ai.shootRate*tactical.shoot){this.shoot(p,Math.random()<ai.superRate)}
    else if(p.cd<=0&&Math.random()<ai.passRate*.10){this.pass(p)}
   }else{
    const pursuers=this.players.filter(q=>q.t===t&&!q.keeper&&!q.stun).sort((a,c)=>distance(a,target)-distance(c,target));
    if(owner&&owner.t===t){
     tx=clamp(p.homeX+dir*(220+ai.anticipation*280)*tactical.advance,F.x+24,F.x+F.w-24);
     ty=p.homeY+(owner.y-p.homeY)*.25;
    }else if(pursuers[0]===p||(pursuers[1]===p&&distance(p,target)<Math.max(390,ai.pressure*tactical.press))){
     tx=bx+dir*12;ty=by;
    }else{
     tx=p.homeX+(bx-MID)*(.23+ai.anticipation*.15)*tactical.defensiveDepth;
     ty=p.homeY+(by-(F.y+F.h/2))*.33;
    }
    if(owner&&owner.t!==t&&p.cd<=0&&fieldAbility(p.src)&&Math.random()<ai.tackleRate*.17*tactical.press){
      this.activateDefence(p);
    }
    if(owner&&owner.t!==t&&distance(p,owner)<68&&p.cd<=0&&Math.random()<ai.tackleRate*tactical.press){
      this.tackle(p,Math.random()<(.24+ai.anticipation*.4));
    }
   }
   p.aiTarget={x:tx,y:ty};
  }
  if(pressing&&p===pressing.primary){
   // Update pursuit every frame instead of waiting for the full AI think timer.
   const lead=owner?0:ai.anticipation*.36;
   p.aiTarget={x:clamp((owner||b).x+(b.vx||0)*lead,F.x+22,F.x+F.w-22),
    y:clamp((owner||b).y+(b.vy||0)*lead,F.y+23,F.y+F.h-23)};
   p.aiDetour=null;
   if(owner&&owner.t!==t&&distance(p,owner)<74&&p.cd<=0&&p.stun<=0){
    this.tackle(p,Math.random()<(.17+ai.anticipation*.35));
   }
  }else if(pressing&&p===pressing.support){
   const target=owner||b,spread=p.y>target.y?95:-95;
   p.aiTarget={x:clamp(target.x-(t===0?1:-1)*110,F.x+22,F.x+F.w-22),
    y:clamp(target.y+spread,F.y+23,F.y+F.h-23)};
  }
  let {x:tx,y:ty}=p.aiTarget;
  // Detect stalled movement after collision resolution, then choose a temporary
  // lateral route around the closest grounded player blocking the pursuit line.
  const distanceMoved=Math.hypot(p.x-(p.aiLastX??p.x),p.y-(p.aiLastY??p.y));
  const targetDist=Math.hypot(tx-p.x,ty-p.y);
  if(!p.keeper&&targetDist>95&&distanceMoved<Math.max(.35,dt*43))p.aiStuckTime=(p.aiStuckTime||0)+dt;
  else p.aiStuckTime=Math.max(0,(p.aiStuckTime||0)-dt*1.1);
  if(p.aiStuckTime>.32){
   const vx=(tx-p.x)/(targetDist||1),vy=(ty-p.y)/(targetDist||1);
   const blocker=this.players.filter(q=>q!==p&&q.z<18&&distance(p,q)<105)
    .filter(q=>((q.x-p.x)*vx+(q.y-p.y)*vy)>-6)
    .sort((a,b)=>distance(p,a)-distance(p,b))[0];
   if(blocker){const side=((p.i+p.t)%2?1:-1);
    p.aiDetour={x:clamp(blocker.x-vy*100*side+vx*55,F.x+23,F.x+F.w-23),
     y:clamp(blocker.y+vx*100*side+vy*55,F.y+24,F.y+F.h-24),expires:this.clock+1.1};
    this.emit('aiDetour',{team:p.t,player:p.src.name});
   }
   p.aiStuckTime=0;
  }
  if(p.aiDetour){if(this.clock>p.aiDetour.expires||Math.hypot(p.x-p.aiDetour.x,p.y-p.aiDetour.y)<28)p.aiDetour=null;
    else {tx=p.aiDetour.x;ty=p.aiDetour.y;}}
  p.aiLastX=p.x;p.aiLastY=p.y;
  const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);
  p.dx=0;p.dy=0;
  if(d>8){const step=Math.min(speed,d/Math.max(dt,.001));this.moveAgile(p,dx/d,dy/d,step,dt);if(Math.abs(p.dx)>.04)p.face=p.dx>0?1:-1}else this.moveAgile(p,0,0,speed,dt);this.staminaTick(p,dt,d>8?(this.teamPlans[t]?.defence==='High Press'&&owner?.t!==t ? .69 : .46):0);
 }
 updateBall(dt){let b=this.ball;if(b.owner){const p=b.owner;b.x=p.x+p.face*17;b.y=p.y+12;b.z=p.z+12+((p.trickFx||0)>0?((dribbleStyle(p.trickStyleId).loft||0)*Math.min(1,p.trickFx*2)):0);if(p.stun>0){b.owner=null;b.vx=p.face*115;b.vy=0;b.vz=130;b.canCollect=.2;}return}
 b.canCollect=Math.max(0,b.canCollect-dt);b.age+=dt;
 // A super-shot transformation lasts only for its active window. A loose ball
 // must never stay a fish/banana/etc. forever if nobody collects it.
 if(b.shot&&b.age>=SUPER_SHOT_TRANSFORM_SECONDS){
  b.shot=null;
  b.trail=[]; // clear the previous transformation-colored trail
  this.emit('shotTransformEnd',{age:b.age});
 }
 if(b.shot){const s=b.shot,phase=b.age*11;s.phase=phase;
 if(s.behavior==='curve'){b.vy+=Math.sin(b.age*3.2)*180*dt+(s.direction||0)*100*dt}
 if(s.behavior==='swim'||s.behavior==='zigzag'){b.vy+=Math.sin(b.age*(s.behavior==='swim'?18:11))*840*dt}
 if(s.behavior==='spiral'){b.vy+=Math.sin(b.age*28)*640*dt;b.vz+=Math.cos(b.age*21)*130*dt}
 if(s.behavior==='ricochet'){b.vy+=Math.sin(b.age*17)*420*dt}
 if(s.behavior==='homing'){b.vy+=clamp((s.aimY-b.y)*1.2,-220,220)*dt}
 if(s.behavior==='clone'){b.vy+=Math.sin(b.age*20)*250*dt}
 if(s.behavior==='burrow'){if(b.age>.12)b.z=Math.max(3,Math.min(b.z,9));b.vz=0}
 if(s.behavior==='warp'){b.vy+=Math.sin(b.age*19)*500*dt}
 if(s.behavior==='lightning'){b.vy+=Math.sin(b.age*30)*380*dt}
 }
 b.vx+=this.wind.x*dt*.24;b.vy+=this.wind.y*dt*.24;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.vz-=500*dt;if(b.z<0){b.z=0;b.vz=Math.abs(b.vz)*(.3+(this.terrain==='Grass'?.15:.05));b.vx*=this.condition==='Wet'?.80:.96;b.vy*=.92;if(Math.abs(b.vz)<47)b.vz=0}
 if(!b.shot){let friction=this.terrain==='Sand'?.94:this.condition==='Wet'?.96:.986;b.vx*=Math.pow(friction,dt*60);b.vy*=Math.pow(friction,dt*60)}
 if(b.shot||Math.hypot(b.vx,b.vy)>190){b.trail.push({x:b.x,y:b.y,z:b.z});if(b.trail.length>22)b.trail.shift()}
 if(b.y<F.y+3){b.y=F.y+3;b.vy=Math.abs(b.vy)*.65}if(b.y>F.y+F.h-3){b.y=F.y+F.h-3;b.vy=-Math.abs(b.vy)*.65}
 // All keepers can perform an ordinary dive; high difficulty reacts earlier.
 if(b.attacker>=0&&!b.owner){const keeper=this.player(1-b.attacker,0);if(keeper&&!this.inControl(keeper.t)){
   const ai=aiTuning(this.cpuLevel(keeper));const chance=(.08+stat(keeper,'gkSkill')*.004+ai.keeperRead*.21)*dt*24;
   if(Math.random()<chance)this.tryKeeperDive(keeper,false);
 }}
 // Active keeper abilities: computer GKs may react to dangerous incoming super shots.
 if(b.shot&&b.attacker>=0){const keeper=this.player(1-b.attacker,0);if(keeper&&(!this.inControl(keeper.t)||Math.random()<.035)){const chance=this.inControl(keeper.t)?.13:Math.min(.78,.12+stat(keeper,'gkSkill')*.006+aiTuning(this.cpuLevel(keeper)).keeperRead*.3);if(Math.random()<chance*dt*20)this.activateKeeperSuper(keeper,false);}}
 // Scoring: ball must cross the appropriate end line between goalposts, below crossbar.
 if(b.x<F.x+5||b.x>F.x+F.w-5){let scoring=t=>{this.score[t]++;this.shake=.45;this.flash=.2;this.burst(b.x,b.y,'#ffdf79',60);const scorers=this.players.filter(p=>p.t===t).sort((p,q)=>distance(p,b)-distance(q,b));this.goalHero=b.attacker===t&&b.shooter?b.shooter:scorers[0]?.src?.name||this.getTeam(t).name;this.pendingKickoff={scorer:t,hero:this.goalHero};this.celebration=3.3;this.onGoalMorale(t);this.ball.owner=null;this.ball.vx=this.ball.vy=this.ball.vz=0;this.emit('goal',{team:t,hero:this.goalHero,score:this.score.slice()});this.cooldown=3.3};if(b.y>WORLD.goalTop&&b.y<WORLD.goalBottom&&b.z<125){scoring(b.x>F.x+F.w-5?0:1);return}b.x=clamp(b.x,F.x+6,F.x+F.w-6);b.vx*=-.72;b.vy*=.95}
 if(b.canCollect>0)return;
 const byDistance=this.players.filter(p=>p.stun<=0).map(p=>({p,d:Math.hypot(p.x-b.x,p.y-b.y)})).sort((a,c)=>a.d-c.d);for(let {p,d} of byDistance){if(d> (p.keeper?(26+stat(p,'gkSkill')*.18)*(1-.18*p.fatigue):27)||b.z>(p.keeper?(63+stat(p,'gkJump')*1.12)*(1-.15*p.fatigue):45))break;if(b.shot){let force=b.power + Math.hypot(b.vx,b.vy)/50,def=stat(p,'defence')*.38+stat(p,'strength')*.10+(p.keeper?stat(p,'gkSkill')*.40:0);if(force>def+(p.keeper?14:0)&&Math.random()<clamp((force-def)/90,.02,.94)){p.stun=.8;p.action='hurt';p.actionTimer=.65;this.burst(p.x,p.y,'#ffffaa',17);b.vx*=.68;b.vy*=1.1;this.shake=.15;continue}if(!p.keeper&&Math.random()<.5){p.stun=.4;continue}}
 if(p.keeper&&b.attacker===p.t&&Math.hypot(b.vx,b.vy)>480)continue;
 this.take(p);if(p.keeper)this.emit('save',{player:p});break;
 }
 }
 burst(x,y,color,count=10){for(let i=0;i<count;i++){let a=Math.random()*Math.PI*2,spd=randomBetween(35,210);this.particles.push({x,y,z:randomBetween(3,80),vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,vz:randomBetween(10,150),life:randomBetween(.25,.8),max:.8,color,r:randomBetween(2,6)})}}
 updateEffects(dt){for(let f of this.particles){f.x+=f.vx*dt;f.y+=f.vy*dt;f.z+=f.vz*dt;f.vz-=180*dt;f.life-=dt;}this.particles=this.particles.filter(f=>f.life>0).slice(-450)}
 startPK(afterDraw=false){
  const cy=(WORLD.goalTop+WORLD.goalBottom)/2;
  this.matchState='penalty';this.pk={afterDraw,kicks:[[],[]],turn:0,aim:cy,saveY:cy,shotTargetY:cy,ready:1.25,timer:8,shotTimer:0,shotMax:.8,ballX:F.x+F.w*.76,ballY:cy,startX:F.x+F.w*.76,startY:cy,dribbles:0,diveBoost:0,diveCooldown:0,stage:'ready'};this.emit('penaltyStart')}
 updatePK(dt){
  if(this.matchState!=='penalty')return;dt=Math.min(.04,dt);this.input.poll(this.humans>=2);
  const pk=this.pk,at=pk.turn%2,defender=1-at,cy=(WORLD.goalTop+WORLD.goalBottom)/2,spot=F.x+F.w*.76;
  const controlledShooter=at===0||this.humans>=2,shooter=controlledShooter?this.input.state[at]||{}:null;
  const controlledKeeper=defender===0||this.humans>=2,keeper=controlledKeeper?this.input.state[defender]||{}:null;
  pk.diveBoost=Math.max(0,(pk.diveBoost||0)-dt);pk.diveCooldown=Math.max(0,(pk.diveCooldown||0)-dt);
  if(pk.ready>0){pk.ready-=dt;return}
  if(pk.shotTimer>0){
   pk.shotTimer-=dt;let fraction=clamp(1-pk.shotTimer/pk.shotMax,0,1);
   pk.ballX=pk.startX+(F.x+F.w-pk.startX)*fraction;
   pk.ballY=pk.startY+(pk.shotTargetY-pk.startY)*fraction;
   if(keeper){if(this.input.just(defender,'jump')&&pk.diveCooldown<=0){pk.diveBoost=.38;pk.diveCooldown=.8;this.emit('penaltyDive',{team:defender});}pk.saveY=clamp(pk.saveY+(keeper.y||0)*(pk.diveBoost>0?550:240)*dt,WORLD.goalTop+10,WORLD.goalBottom-10)}
   else {const botGK=this.player(defender,0);pk.saveY+=(pk.shotTargetY-pk.saveY)*dt*(.8+(botGK?stat(botGK,'gkSkill')/100:0)+aiTuning(this.options.difficulty??2).keeperRead*3.5);}
   if(pk.shotTimer<=0){
    const success=Math.abs(pk.shotTargetY-pk.saveY)>31;
    pk.kicks[at].push(success);this.emit('penaltyKick',{team:at,goal:success});pk.turn++;
    const totals=pk.kicks.map(a=>a.filter(Boolean).length),remaining=pk.kicks.map(a=>Math.max(0,5-a.length));
    const canDecide=(pk.kicks[0].length>=5&&pk.kicks[1].length>=5&&totals[0]!==totals[1])||(pk.kicks[0].length>=3&&pk.kicks[1].length>=3&&(totals[0]>totals[1]+remaining[1]||totals[1]>totals[0]+remaining[0]));
    if(canDecide){this.matchState='finished';const score=pk.afterDraw?this.score.slice():totals.slice();if(!pk.afterDraw)this.score=totals.slice();this.emit('finished',{score,penalties:true,pkScore:totals,winner:totals[0]>totals[1]?0:1});return}
    pk.shotTimer=0;pk.ready=1.25;pk.timer=8;pk.aim=cy;pk.saveY=cy;pk.ballY=cy;pk.ballX=spot;pk.startX=spot;pk.startY=cy;pk.dribbles=0;pk.diveBoost=0;pk.diveCooldown=0;pk.stage='ready';
   }return;
  }
  pk.timer-=dt;
  // The penalty taker can move with the ball before committing to the kick.
  // The position remains near the mark; the dribble button performs a short feint.
  if(controlledShooter){
   const steerX=Number(shooter.x)||0,steerY=Number(shooter.y)||0;
   pk.ballX=clamp(pk.ballX+steerX*140*dt,spot-86,spot+150);
   pk.ballY=clamp(pk.ballY+steerY*140*dt,cy-135,cy+135);
   if(this.input.just(at,'dribble')&&pk.dribbles<3){pk.dribbles++;pk.ballX=clamp(pk.ballX+28,spot-86,spot+150);pk.ballY=clamp(pk.ballY+(steerY||((pk.dribbles%2)?1:-1))*13,cy-135,cy+135);this.emit('penaltyDribble',{team:at,count:pk.dribbles});}
  }else {pk.ballX=clamp(pk.ballX+45*dt,spot,spot+115);pk.ballY=clamp(pk.ballY+Math.sin(pk.timer*3.7)*11*dt,cy-75,cy+75);}
  if(keeper&&this.input.just(defender,'jump')&&pk.diveCooldown<=0){pk.diveBoost=.38;pk.diveCooldown=.8;this.emit('penaltyDive',{team:defender});}
  if(controlledShooter)pk.aim=clamp(pk.aim+(shooter.y||0)*100*dt,WORLD.goalTop+9,WORLD.goalBottom-9);
  else pk.aim=clamp(pk.aim+(Math.sin(pk.timer*2.3)*110)*dt,WORLD.goalTop+9,WORLD.goalBottom-9);
  if(keeper)pk.saveY=clamp(pk.saveY+(keeper.y||0)*(pk.diveBoost>0?440:175)*dt,WORLD.goalTop+9,WORLD.goalBottom-9);
  if(!controlledShooter&&pk.timer<6.2||controlledShooter&&(this.input.just(at,'shoot')||this.input.just(at,'special'))||pk.timer<=0){
   const brain=aiTuning(this.options.difficulty??2);
   const aimBand=40+brain.id*14;
   const taker=this.rosters[at][this.teamPlans[at]?.penalty??4]||this.player(at,4)?.src;const error=(100-(taker?.shootAccuracy||65))*.33;pk.shotTargetY=controlledShooter?clamp(pk.aim+randomBetween(-error,error),WORLD.goalTop+10,WORLD.goalBottom-10):clamp(cy+randomBetween(-aimBand,aimBand)+randomBetween(-error,error),WORLD.goalTop+10,WORLD.goalBottom-10);
   // An expert CPU keeper reads the shooter; Rookie guesses farther away.
   if(!controlledKeeper){const miss=95-brain.keeperRead*165;pk.saveY=clamp(pk.shotTargetY+randomBetween(-miss,miss),WORLD.goalTop+10,WORLD.goalBottom-10)}
   pk.startX=pk.ballX;pk.startY=pk.ballY;pk.shotTimer=pk.shotMax;pk.stage='shooting';this.burst(pk.ballX,pk.ballY,'#ffe284',10)
  }
 }
}
