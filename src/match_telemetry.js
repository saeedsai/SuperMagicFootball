/** v0.8.24.11 diagnostic sidecar. Does not modify gameplay or player/ball data.
 * Measures event-backed attempts and separates scoring outcomes from activity.
 * Unobserved outcomes are explicitly classified, never assumed to be keeper saves.
 */
const OPPOSITE=t=>1-t;
const finite=(n)=>typeof n==='number'&&Number.isFinite(n);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const rounded=n=>Math.round(n*100)/100;
/** Diagnostic release snapshot only. No xG model, no gameplay mutation.
 * Missing/stunned opponents are excluded from active defensive-pressure readings.
 * Distances use game world coordinates (not metres).
 */
export function shotReleaseContext(e,game){
 if(!game||!Array.isArray(game.players)||!e?.origin||![0,1].includes(e.player?.t))return null;
 const origin=e.origin,team=e.player.t;
 if(!finite(origin.x)||!finite(origin.y))return null;
 const opponents=game.players.filter(p=>p&&p.t===1-team&&finite(p.x)&&finite(p.y)&&!(p.stun>0));
 const defenders=opponents.filter(p=>!p.keeper);
 const keeper=opponents.find(p=>p.keeper)||null;
 const field=game.world?.field||{x:150,w:3340};
 const goalX=team===0?field.x+field.w:field.x;
 const closest=defenders.length?Math.min(...defenders.map(p=>dist(p,origin))):null;
 const keeperDistance=keeper?dist(keeper,origin):null;
 const keeperLateralOffset=keeper?Math.abs(keeper.y-(finite(e.targetY)?e.targetY:origin.y)):null;
 const ball=game.ball;
 const speed=ball&&finite(ball.vx)&&finite(ball.vy)?Math.hypot(ball.vx,ball.vy):null;
 return {
  goalDistance:rounded(Math.abs(goalX-origin.x)),
  nearestDefenderDistance:closest===null?null:rounded(closest),
  pressureBand:closest===null?'no_active_defender':closest<90?'close':closest<230?'medium':'open',
  nearbyDefenders:defenders.filter(p=>dist(p,origin)<230).length,
  keeperDistance:keeperDistance===null?null:rounded(keeperDistance),
  keeperLateralOffset:keeperLateralOffset===null?null:rounded(keeperLateralOffset),
  keeperFatigue:keeper&&finite(keeper.fatigue)?rounded(keeper.fatigue):null,
  ballSpeed:speed===null?null:rounded(speed),
  releaseHeight:finite(origin.z)?rounded(origin.z):null
 };
}

export class MatchOpportunityTracker {
 constructor(){this.attempts=[];this.active=null;this.events={};this.ownership=[0,0,0];this.possessionChanges=0;this.lastHolder=null;this.elapsed=0;this.unlinkedSaves=0;}
 onEvent(e,game=null){
  this.events[e.type]=(this.events[e.type]||0)+1;
  if(e.type==='kick'){
   if(this.active)this.finish('superseded');
   const team=e.player?.t;
   if(team!==0&&team!==1)return;
   const kind=['shot','superShot','pass','clearance'].includes(e.kind)?e.kind:'unknown_kick';
   const attempt={id:this.attempts.length+1,team,kind,origin:e.origin?{...e.origin}:null,targetY:e.targetY??null,startedAt:Number(this.elapsed.toFixed(3)),outcome:null,saveType:null,deflected:false,elapsedFlight:null,releaseContext:shotReleaseContext(e,game)};
   this.attempts.push(attempt);this.active=attempt;
  }
  if(e.type==='save'){
   if(this.active&&(this.active.kind==='shot'||this.active.kind==='superShot')&&e.player?.t===OPPOSITE(this.active.team)){
    this.active.saveType=e.saveType||'unknown';this.active.deflected=!!e.deflected;
    this.finish(e.deflected?'keeper_deflection':'keeper_save');
   }else this.unlinkedSaves++;
  }
  if(e.type==='goal'&&this.active){this.finish(e.team===this.active.team?'goal':'opponent_goal');}
  if(e.type==='halftime'||e.type==='penaltyStart'||e.type==='finished'){if(this.active)this.finish('period_end');}
 }
 finish(outcome){if(!this.active)return;this.active.outcome=outcome;this.active.elapsedFlight=Number((this.elapsed-this.active.startedAt).toFixed(3));this.active=null;}
 observe(game,dt=1/30){
  this.elapsed+=dt;
  const owner=game.ball?.owner,holder=owner?.t??2;
  this.ownership[holder]++;
  if(this.lastHolder!==null&&this.lastHolder!==holder)this.possessionChanges++;
  this.lastHolder=holder;
  const a=this.active;if(!a)return;
  if(owner){
   if(a.kind==='pass')this.finish(owner.t===a.team?'pass_completed':'pass_intercepted');
   else if(owner.keeper){this.finish(owner.t===a.team?'friendly_keeper_collection':'opponent_keeper_collection_without_save_event');}
   else this.finish(owner.t===a.team?'teammate_recovery':'defender_interception');
  }else if(this.elapsed-a.startedAt>5)this.finish('unresolved_after_5s');
 }
 finalize(){this.finish('simulation_end');return this.report();}
 report(){
  const counts={},byKind={};for(const a of this.attempts){counts[a.outcome||'open']=(counts[a.outcome||'open']||0)+1;byKind[a.kind]??={total:0,outcomes:{}};byKind[a.kind].total++;const outcome=a.outcome||'open';byKind[a.kind].outcomes[outcome]=(byKind[a.kind].outcomes[outcome]||0)+1;}
  const shots=this.attempts.filter(a=>a.kind==='shot'||a.kind==='superShot');
  const contextCounts={close:0,medium:0,open:0,no_active_defender:0,unobserved:0};
  for(const a of shots)contextCounts[a.releaseContext?.pressureBand||'unobserved']++;
  return {attempts:this.attempts.length,counts,byKind,shotReleasePressureCounts:contextCounts,events:{...this.events},unlinkedSaves:this.unlinkedSaves,ownershipFrames:this.ownership.slice(),possessionChanges:this.possessionChanges,records:this.attempts.map(a=>({...a}))};
 }
}
