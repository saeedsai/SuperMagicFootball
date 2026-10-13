import assert from 'node:assert/strict';
import {GameEngine, WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const state=[{},{}], pulses=[{},{}];
const input={state,poll(){},just(t,k){return !!pulses[t]?.[k]},held(t,k){return !!state[t]?.[k]}};
const game=new GameEngine(DEFAULT_OPTIONS,input);
game.init({home:0,away:9,options:DEFAULT_OPTIONS});game.humans=2;game.startPK();game.pk.ready=0;
const px=game.pk.ballX,py=game.pk.ballY;
state[0]={x:1,y:.7};game.updatePK(.04);
assert.ok(game.pk.ballX>px,'Penalty dribble moves the ball forward');assert.ok(game.pk.ballY>py,'Penalty dribble can steer sideways');
pulses[0]={dribble:true};game.updatePK(.04);
assert.equal(game.pk.dribbles,1);assert.ok(game.events.some(e=>e.type==='penaltyDribble'));
for(let i=0;i<20;i++)game.updatePK(.04);
assert.ok(game.pk.ballX<=px+150+1e-9,'Penalty dribble must stay near the mark');
// GK jump is a bounded reactive dive, not an automatic save.
state[1]={y:-1,jump:1};pulses[1]={jump:true};game.updatePK(.04);
assert.ok(game.pk.diveBoost>0);assert.ok(game.events.some(e=>e.type==='penaltyDive'));
const startY=game.pk.saveY; pulses[1]={};game.updatePK(.04);
assert.ok(game.pk.saveY<startY,'Keeper dive accelerates repositioning');
// Shooter's current position must anchor the shot rather than resetting to the mark.
state[0]={x:0,y:0,shoot:1};pulses[0]={shoot:true};game.updatePK(.04);
assert.equal(game.pk.stage,'shooting');assert.equal(game.pk.startX,game.pk.ballX);
const shotOrigin=game.pk.startX;game.updatePK(.04);assert.ok(game.pk.ballX>shotOrigin);
// Keep the 2v2 state and match scores sane through a complete shootout.
for(let tick=0;tick<1400&&game.matchState==='penalty';tick++){
 for(let t=0;t<2;t++){state[t]={shoot:1};pulses[t]={shoot:true}}
 game.updatePK(.04);
}
assert.ok(['finished','penalty'].includes(game.matchState));assert.ok(game.pk.kicks.every(side=>side.every(v=>typeof v==='boolean')));
// Input profile tests run with a minimal DOM-like shell.
globalThis.window={addEventListener(){}};
globalThis.document={querySelector(){return null},querySelectorAll(){return []}};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[]}});
const {Input}=await import('../src/input.js');
const controls=new Input();
assert.equal(controls.setBindings({keyboard:['KeyU','KeyO','KeyF','Space'],gamepad:[4,5,6,7]}),true);
assert.deepEqual(controls.getBindings().gamepad,[4,5,6,7]);
assert.equal(controls.setBindings({keyboard:['KeyU','KeyU','KeyF','Space'],gamepad:[4,5,6,7]}),false,'Duplicate buttons rejected');
assert.equal(controls.setBindings({keyboard:['KeyU','KeyO','KeyF','Space'],gamepad:[4,4,6,7]}),false,'Duplicate gamepad buttons rejected');
controls.keys.add('KeyU');controls.poll();assert.equal(controls.state[0].pass,1,'New keyboard binding active');
controls.keys.clear();controls.keys.add('KeyK');controls.poll();assert.equal(controls.state[0].pass,0,'Old keyboard binding disabled');
navigator.getGamepads=()=>[{buttons:Array.from({length:12},(_,i)=>({pressed:i===5})),axes:[0,0]}];
controls.keys.clear();controls.poll();assert.equal(controls.state[0].shoot,1,'New gamepad button active');
assert.equal(controls.state[0].pass,0,'Old gamepad button does not leak into mapping');
console.log('v0.8.8 PENALTY & BINDING PASS — movement, dribble, keeper dive, shooting origin, safe profiles, real polling');
