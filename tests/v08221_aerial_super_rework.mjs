import assert from 'node:assert/strict';
import {GameEngine,AERIAL_DOUBLE_TAP_SECONDS} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],press:{},release:{},poll(){},just(t,k){return !!this.press[k]},released(t,k){return !!this.release[k]},tapDuration(){return 0},canceled(){return false}};
function setup({team=0,possessed=false,special=true}={}){
 input.state=[{},{}];input.press={};input.release={};
 const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
 g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
 g.autoSwitch=()=>false;g.driveAI=()=>{};g.cooldown=0;g.humans=team?2:1;
 const p=g.player(team,3);g.controlled[team]=p.i;
 for(const q of g.players)if(q!==p){q.x=q.t?3240:340;q.y=1120;}
 p.x=team?1990:1660;p.y=755;p.cd=0;p.stun=0;p.z=0;p.vz=0;p.jumpCount=0;p.specialCd=0;p.fatigue=0;
 p.src={...p.src,superAbility:special?p.src.superAbility:null};
 if(possessed)g.take(p);
 else {g.ball.owner=null;g.ball.liftOwner=null;g.ball.x=p.x+25;g.ball.y=p.y;g.ball.z=152;g.ball.vx=0;g.ball.vy=0;g.ball.vz=0;g.ball.attacker=-1;g.ball.canCollect=2;}
 g.events.length=0;
 return {g,p,team};
}
function step(g,team,state={},pressed={},released={},dt=.016){input.state[team]={x:0,y:0,...state};input.press=pressed;input.release=released;g.updatePlayers(dt);input.press={};input.release={};}
function jumpForAerial(g,p,team){assert(g.jump(p));assert(p.z>0);step(g,team,{}, {},{},.09);assert(p.z>20);}
const rng=Math.random;
try{
 Math.random=()=>.5;
 assert(AERIAL_DOUBLE_TAP_SECONDS>=.25&&AERIAL_DOUBLE_TAP_SECONDS<=.42);
 for(const team of [0,1])for(const kind of ['header','bicycle'])for(const special of [true,false]){
  const {g,p}=setup({team,special});jumpForAerial(g,p,team);
  const key=kind==='header'?'shoot':'dribble';
  step(g,team,{[key]:1},{[key]:true});
  assert.equal(g.ball.shot,null,'first aerial tap only primes a potential double');
  assert.equal(p.aerialComboAction,kind);
  step(g,team,{}, {},{[key]:true});
  step(g,team,{[key]:1},{[key]:true});
  assert.equal(p.aerialComboAction,null,'second tap consumes queued move');
  assert.equal(g.ball.owner,null);
  const expected=kind==='header'?'superHead':'superBicycle';
  assert.equal(p.action,expected);
  const event=kind==='header'?'superHeadShot':'superBicycleShot';
  assert.equal(g.events.filter(e=>e.type===event).length,1);
  assert.equal(!!g.ball.shot,special,'players without shoot ability retain normal ball graphics');
  assert.equal(g.ball.shot?.id,special?p.src.shot:undefined);
  assert(Math.hypot(g.ball.vx,g.ball.vy)>580,'boosted non-special and true Super attacks are powerful');
  assert(Math.sign(g.ball.vx) === (team===0?1:-1),'attacks go toward correct goal');
  step(g,team,{[key]:1});
  assert.equal(g.events.filter(e=>e.type===event).length,1,'held button cannot duplicate super');
 }
 for(const kind of ['header','bicycle']){
  const {g,p,team}=setup();jumpForAerial(g,p,team);
  const key=kind==='header'?'shoot':'dribble';
  step(g,team,{[key]:1},{[key]:true});
  step(g,team,{}, {},{[key]:true});
  for(let i=0;i<27;i++)step(g,team,{}, {},{},.016);
  assert.equal(p.action,kind==='header'?'header':'bicycle');
  assert.equal(g.ball.shot,null,'single tap is always ordinary');
  assert(!g.events.some(e=>['superHeadShot','superBicycleShot'].includes(e.type)));
 }
 // Ground first jump: elevated regular shot. Ground double jump: unified super.
 for(const hasSuper of [true,false]){
  const {g,p,team}=setup({possessed:true,special:hasSuper});
  assert(g.jump(p));step(g,team,{}, {},{},.06);
  step(g,team,{shoot:1},{shoot:true});
  assert.equal(g.ball.shot,null,'one jump and shoot must NOT transform');
  assert(g.ball.z>15,'jump shot must be elevated');
  const {g:double,p:dp,team:t}=setup({possessed:true,special:hasSuper});
  assert(double.jump(dp));step(double,t,{}, {},{},.14);
  dp.vz=80;assert(double.jump(dp));
  step(double,t,{shoot:1},{shoot:true});
  assert.equal(!!double.ball.shot,hasSuper,'double jump grants transformation only with shoot ability');
  assert.equal(double.ball.shooter,dp.src.name);
 }
 // Three special variants must have the same velocity, hit strength and ball shape
 // for the same player attributes and shot RNG.
 const specials=[];
 for(const kind of ['ground','header','bicycle']){
  const {g,p,team}=setup({possessed:kind==='ground'});
  p.z=95;p.jumpCount=2;p.vz=0;
  if(kind==='ground')g.shoot(p,true);
  else {g.ball.owner=null;g.ball.x=p.x+25;g.ball.y=p.y;g.ball.z=142;g.ball.vx=0;g.ball.vy=0;g.ball.canCollect=2;assert(g.tryAerialStrike(p,kind,true));}
  specials.push({speed:Math.hypot(g.ball.vx,g.ball.vy),power:g.ball.power,id:g.ball.shot?.id,behavior:g.ball.shot?.behavior,color:g.ball.shot?.color,level:g.ball.shot?.level});
 }
 assert.deepEqual(specials[0],specials[1]);assert.deepEqual(specials[1],specials[2]);
 // No super ability => no transformation for any move; defensive specialist excluded.
 {const {g,p}=setup({possessed:true,special:false});p.src.superAbility={type:'defence',id:'drill'};g.shoot(p,true);assert.equal(g.ball.shot,null);assert(Math.hypot(g.ball.vx,g.ball.vy)>600);}
 // Out-of-range airborne balls should not hijack player swap or defensive kick.
 {const {g,p,team}=setup();jumpForAerial(g,p,team);g.ball.x=p.x+700;step(g,team,{dribble:1},{dribble:true});assert.equal(p.aerialComboAction,null);}
 // No action on expiry after possession is lost or player is stunned.
 {const {g,p,team}=setup();jumpForAerial(g,p,team);step(g,team,{shoot:1},{shoot:true});g.take(g.player(1,3));step(g,team,{}, {},{},.4);assert(!g.events.some(e=>e.type==='header'));}
 console.log('PASS v0.8.22.1: six input variants, both directions, two taps, single-tap timeout, double jump, non-specialists, unified special shot physics/graphics, cancellation, no repeated shots');
}finally{Math.random=rng;}
