/** Regression: mixed-source hold/release, lost touch capture, blur cancellation,
 * and bounded/stamina-limited non-transforming super bicycle behavior.
 */
import assert from 'node:assert/strict';
import {Input} from '../src/input.js';
import {GameEngine,SUPER_BICYCLE_SPEED_CAP} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
import {actionFatigue} from '../src/fitness.js';
const handlers=new Map();
globalThis.window={addEventListener:(name,fn)=>handlers.set(name,fn)};
globalThis.HTMLInputElement=class {};
globalThis.HTMLSelectElement=class {};
class FakeElement{
 constructor(act){this.dataset={act};this.events={};this.style={};this.classList={toggle(){}};}
 addEventListener(name,fn){this.events[name]=fn}
 setPointerCapture(){}
 getBoundingClientRect(){return {left:0,top:0,width:180,height:180}}
 fire(type,id,t){this.events[type]?.({pointerId:id,type,timeStamp:t,clientX:80,clientY:85,preventDefault(){}})}
}
const elements=new Map(['joyZone','joyKnob','pass','shoot','dribble','jump'].map(name=>[name,new FakeElement(name)]));
const documentEvents=new Map();
globalThis.document={hidden:false,addEventListener:(key,fn)=>documentEvents.set(key,fn),querySelector:q=>elements.get(q.substring(1)),querySelectorAll:()=>['pass','shoot','dribble','jump'].map(x=>elements.get(x))};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[]}});
const input=new Input();
const key=(type,code,t)=>handlers.get(type)({code,timeStamp:t,target:{},preventDefault(){}});
// A touch can be released while a real keyboard key for SAME action is held.
// It must not prematurely commit a long pass.
key('keydown','KeyK',100);input.poll();assert(input.held(0,'pass'));
elements.get('pass').fire('pointerdown',10,150);input.poll();
elements.get('pass').fire('pointerup',10,280);input.poll();
assert(input.held(0,'pass'),'keyboard pass still held');
assert(!input.released(0,'pass'),'touch release must not release keyboard hold');
key('keyup','KeyK',320);input.poll();assert(input.released(0,'pass'),'final source releases normally');
// A canceled held charge cannot turn into a shot, even when engine charge exists.
const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
game.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
game.autoSwitch=()=>false;game.driveAI=()=>{};game.cooldown=0;
const player=game.player(0,3);game.take(player);
for(const q of game.players)if(q!==player){q.x=q.t?3300:320;q.y=1100;}
player.x=1500;player.y=760;player.cd=0;
const begin=()=>{game.take(player);player.cd=0;game.events.length=0;};
begin();
elements.get('shoot').fire('pointerdown',20,450);input.poll();game.updatePlayers(.08);
assert(player.charge>0,'shoot charging before cancel');
elements.get('shoot').fire('pointercancel',20,550);input.poll();assert(input.canceled(0,'shoot'));
game.updatePlayers(.016);
assert.equal(player.charge,0,'cancellation clears charged shot state');
assert.equal(game.ball.owner,player,'cancel must not fire a charged shot');
assert(!game.events.some(e=>e.type==='kick'),'no ghost kick event');
// Aborting a long pass should not pass or tackle (including when backgrounded).
begin();elements.get('pass').fire('pointerdown',21,700);input.poll();game.updatePlayers(.12);
assert(player.passHold>0);
elements.get('pass').fire('lostpointercapture',21,850);input.poll();game.updatePlayers(.016);
assert.equal(player.passHold,0);assert.equal(game.ball.owner,player);
begin();elements.get('shoot').fire('pointerdown',22,900);input.poll();game.updatePlayers(.12);
document.hidden=true;documentEvents.get('visibilitychange')();document.hidden=false;
input.poll();assert(input.canceled(0,'shoot')&&input.canceled(0,'pass'));
game.updatePlayers(.016);
assert.equal(player.charge,0);assert.equal(game.ball.owner,player);
// Input still operates normally immediately after cancellation.
elements.get('pass').fire('pointerdown',23,1200);elements.get('pass').fire('pointerup',23,1220);
input.poll();assert(input.just(0,'pass')&&input.released(0,'pass')&&!input.canceled(0,'pass'));
// New super bicycle is stronger than an ordinary bicycle but has bounded
// speed and a greater stamina cost. Ordinary ball shape is retained.
const dummy={...player,fatigue:.02};
assert(actionFatigue(dummy.fatigue,70,'superBicycle')>actionFatigue(dummy.fatigue,70,'bicycle'));
assert(SUPER_BICYCLE_SPEED_CAP>=1200&&SUPER_BICYCLE_SPEED_CAP<=1800);
begin();player.fatigue=.02;player.dribbleHold=.31;
assert(game.tryBallLift(player));player.z=36;player.jumpCount=1;player.vz=120;
const before=player.fatigue;const oldRandom=Math.random;
try{Math.random=()=>.5;assert(game.trySuperBicycle(player));}finally{Math.random=oldRandom;}
assert(game.ball.shot,'specialist super bicycle transforms with standard Super Shot metadata');assert(Math.hypot(game.ball.vx,game.ball.vy)>700);
assert(player.fatigue>before);assert.equal(game.events.filter(e=>e.type==='superBicycleShot').length,1);
console.log('PASS v0.8.22: mixed keyboard/touch release, cancel hold Shoot/Pass, background abort, recovery, unified transforming and fatigue-costly super bicycle');
