import assert from 'node:assert/strict';
import {GameEngine,WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
import {defensivePressers} from '../src/ai.js';
const input={state:[{},{}],poll(){},just(){return false}};
const G=()=>{let g=new GameEngine({...DEFAULT_OPTIONS,difficulty:3},input);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,difficulty:3}});g.cooldown=0;return g;};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Always designate a real AI teammate; never consume all press assignments
// with the player currently using human controls.
{
 const g=G(),selected=g.controlledPlayer(0),carrier=g.player(1,3);
 g.take(carrier);
 const plan=defensivePressers(g.players,0,carrier,selected);
 assert(plan.primary&&plan.primary!==selected&&plan.primary.t===0,'AI teammate must be designated to press');
 assert(plan.support&&plan.support!==plan.primary,'second defender covers');
 for(const q of g.players.filter(q=>q.t===0&&!q.keeper)){
  q.x=carrier.x-(q.i+1)*100;q.y=carrier.y+q.i*35;q.aiTimer=0;
 }
 const pressing=defensivePressers(g.players,0,carrier,selected).primary;
 const before=dist(pressing,carrier);g.driveAI(pressing,0.08);
 assert(dist(pressing,carrier)<before,'AI teammate runs toward opponent ball carrier');
}
// CPU opponent must pursue immediately when the human owns the ball.
{
 const g=G(),carrier=g.player(0,3);g.take(carrier);
 const press=defensivePressers(g.players,1,carrier).primary;
 press.x=carrier.x+280;press.y=carrier.y;press.aiTimer=100;
 const before=dist(press,carrier);g.driveAI(press,0.09);
 assert(dist(press,carrier)<before,'CPU opponent moves toward the ball even during a long think timer');
 press.x=carrier.x+51;press.y=carrier.y;press.cd=0;press.stun=0;carrier.stun=0;
 g.driveAI(press,0.02);
 assert(press.cd>0,'closest CPU presser automatically tackles within reach');
}
// Normal jump-based super shots must angle back toward a reachable goal mouth.
{
 const g=G(),p=g.player(0,3);g.take(p);p.z=220;p.specialCd=0;
 g.shoot(p,true,true);
 assert(g.ball.shot,'transformed shot metadata remains active');
 assert(g.ball.z<100,'transformed shot descends from jump height');
 assert(g.ball.vz<0,'transformed shot heads down immediately');
 assert(g.ball.vx>0,'shot still targets attacking goal');
}
// Airborne teammate supers must also fall toward goal, unlike ordinary flip kicks.
{
 const g=G(),p=g.player(0,3),b=g.ball;
 b.owner=null;b.x=p.x+12;b.y=p.y;b.z=230;p.z=195;p.vz=20;p.cd=0;p.stun=0;
 p.comboActive=true;p.comboWindow=1;p.specialCd=0;p.fatigue=0;
 assert(g.tryFlipKick(p,true),'apex transforming combo is still available');
 assert(b.shot&&b.z<110&&b.vz<0,'aerial combo super ball is kicked down');
}
// Keeper distribution must prefer safe passing lanes, not blindly nearest/furthest.
{
 const g=G(),keeper=g.player(0,0),mates=g.players.filter(q=>q.t===0&&!q.keeper);
 keeper.x=WORLD.field.x+45;keeper.y=(WORLD.goalTop+WORLD.goalBottom)/2;
 mates.forEach((p,i)=>{p.x=keeper.x+170+i*240;p.y=keeper.y+(i%2)*70;});
 g.take(keeper);g.distributeKeeper(keeper,'short');
 let ev=g.events.filter(e=>e.type==='keeperDistribution').at(-1);
 assert(mates.some(q=>q.src.name===ev.target),'keeper targets a real teammate');
 assert(['short','long'].includes(ev.mode),'short request must clear long if defenders block the lane');
 g.take(keeper);g.distributeKeeper(keeper,'long');
 ev=g.events.filter(e=>e.type==='keeperDistribution').at(-1);
 assert(mates.some(q=>q.src.name===ev.target),'long clearance has a real on-field target');assert.equal(ev.mode,'long');
}
console.log('v0.8.15 ACTIVE AI / GK DISTRIBUTION / AIRBORNE SUPER TRAJECTORY PASS');
