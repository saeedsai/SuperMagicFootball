import assert from 'node:assert/strict';
import {GameEngine,WORLD} from '../src/engine.js';
import {Input} from '../src/input.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const c={state:[{},{}],p:{},r:{},poll(){},just(t,k){return !!this.p[k]},released(t,k){return !!this.r[k]}};
function start(){c.state=[{},{}];c.p={};c.r={};const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},c);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});g.cooldown=0;g.realDriveAI=g.driveAI.bind(g);g.driveAI=()=>{};const p=g.player(0,3);g.take(p);g.controlled[0]=p.i;p.cd=0;p.stun=0;return {g,p};}
function tick(g,s={},pressed={},released={}){c.state[0]={x:0,y:0,...s};c.p=pressed;c.r=released;g.updatePlayers(.016);}
// Strict order: jumping must happen BEFORE Pass is first pressed.
{const {g,p}=start();tick(g,{jump:1},{jump:true});tick(g,{},{},{jump:true});assert(p.z>0);tick(g,{pass:1},{pass:true});assert.equal(g.ball.owner,null);assert(g.ball.vz>=240,'airborne Pass is a cross');assert.equal(g.events.filter(e=>e.type==='kick').length,1);tick(g,{},{},{pass:true});assert.equal(g.events.filter(e=>e.type==='kick').length,1);}
// Pass before Jump is never an auto cross, and normal long pass is release based.
{const {g,p}=start();tick(g,{pass:1},{pass:true});tick(g,{pass:1,jump:1},{jump:true});assert.equal(g.ball.owner,p,'Pass first + Jump does not execute a cross');assert(!g.events.some(e=>e.type==='teamLaunch'),'Pass+Jump must not launch a teammate');tick(g,{pass:1});for(let i=0;i<23;i++)tick(g,{pass:1});tick(g,{}, {},{pass:true});assert.equal(g.ball.owner,null);assert(g.ball.vz>=150&&g.ball.vz<245,'long Pass is lofted but not cross');}
{const {g,p}=start();tick(g,{pass:1,jump:1},{jump:true,pass:true});assert.equal(g.ball.owner,p,'simultaneous Pass+Jump is not a cross');tick(g,{}, {},{pass:true,jump:true});assert.equal(g.ball.owner,null);assert.equal(g.events.filter(e=>e.type==='kick').length,1);}
{const {g,p}=start();tick(g,{pass:1},{pass:true});tick(g,{}, {},{pass:true});assert.equal(g.ball.owner,null,'normal Pass must still work');assert(g.ball.vz<150,'short pass has flatter arc');}
// Safety: if the goalkeeper is pressured, even an explicitly requested short pass clears long.
for(const t of [0,1]){const {g}=start(),k=g.player(t,0);g.take(k);const attacker=g.player(1-t,3);attacker.x=k.x+(t===0?90:-90);attacker.y=k.y;const result=g.distributeKeeper(k,'short');assert(result);const ev=g.events.filter(e=>e.type==='keeperDistribution').at(-1);assert.equal(ev.mode,'long');assert(ev.pressured);assert(g.ball.vz>=245);}
// With a clean safe lane, goalkeeper may distribute short.
{const {g}=start(),k=g.player(0,0);g.take(k);for(const foe of g.players.filter(p=>p.t!==k.t)){foe.x=3400;foe.y=1100;}const mate=g.player(0,2);mate.x=k.x+280;mate.y=k.y;assert(g.distributeKeeper(k,'auto'));assert.equal(g.events.filter(e=>e.type==='keeperDistribution').at(-1).mode,'short');}
// Automatic dives for *both* human and CPU teams, no defender Jump action.
for(const team of [0,1]){const {g}=start(),k=g.player(team,0),b=g.ball;g.humans=2;g.ball.owner=null;b.attacker=1-team;b.shot=null;b.power=40;b.x=k.x+(team===0?80:-80);b.y=k.y+15;b.z=30;b.vx=team===0?-600:600;b.vy=0;b.vz=0;k.diveCooldown=0;k.stun=0;g.updateBall(.005);assert(k.diveCooldown>0,`team ${team} GK must dive without user input`);assert(g.events.some(e=>e.type==='keeperDive'&&e.team===team&&e.manual===false));}
// In standard match, human GK also runs its own AI distribution on possession.
{const {g}=start(),k=g.player(0,0);g.take(k);k.cd=0;k.keeperHold=.7;g.realDriveAI(k,.016);assert.equal(g.ball.owner,null);}
// No fifth/sixth gameplay control exists on any default device.
globalThis.window={addEventListener(){}};globalThis.document={querySelector(){return null},querySelectorAll(){return []}};
let pads=[];Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>pads}});
const inp=new Input();
for(const code of ['KeyL','Tab','ShiftLeft','Slash','NumpadEnter','ShiftRight']){inp.keys.clear();inp.keys.add(code);inp.poll(true);for(let t=0;t<2;t++)for(const extra of ['special','sprint','switch'])assert(!inp.state[t][extra],`${code} must not activate ${extra}`);}
pads=[{buttons:Array.from({length:16},(_,i)=>({pressed:i===4||i===5||i===6})),axes:[0,0]}];inp.keys.clear();inp.poll(false);for(const action of ['special','switch','sprint'])assert(!inp.state[0][action]);
console.log('v0.8.18.1 FOUR-ACTION INPUT / CROSS ORDER / AUTONOMOUS KEEPER / SAFE CLEARANCES: PASS');
