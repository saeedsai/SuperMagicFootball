import assert from 'node:assert/strict';
import {GameEngine,WORLD,SUPER_SHOT_TRANSFORM_SECONDS} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
import {fatigueTick,actionFatigue} from '../src/fitness.js';
const state=[{},{}];const input={state,just(){return false},poll(){}};
const g=new GameEngine(DEFAULT_OPTIONS,input);g.init({home:0,away:9,options:DEFAULT_OPTIONS});
assert.ok(WORLD.field.w>2980&&WORLD.field.h>1050,'pitch expanded in both dimensions');
g.autoSwitch=()=>false;g.cooldown=0;g.driveAI=()=>{}; // Isolate human chase controls; AI pressing has its own dedicated regression suite.
const chaser=g.controlledPlayer(0),carrier=g.player(1,3);
for(const p of g.players.filter(p=>p.t===0&&p!==chaser)){p.x=500;p.y=300;}
chaser.x=900;chaser.y=820;carrier.x=1140;carrier.y=820;carrier.stun=0;carrier.invuln=0;g.take(carrier);
state[0]={pass:true,jump:true,x:0,y:0};let dist0=carrier.x-chaser.x;
for(let n=0;n<42;n++)g.updatePlayers(1/60);
assert.ok(chaser.x>900,'holding pass+jump should chase opposing ball carrier');
assert.equal(chaser.z,0,'defensive Jump is sprint, not jump');
assert.ok(carrier.x-chaser.x<dist0,'distance to ball carrier should decrease');
// Place carrier within tackle radius and continue holding, tackle must trigger.
carrier.x=chaser.x+41;carrier.y=chaser.y;chaser.cd=0;chaser.chase=.3;g.updatePlayers(1/60);
assert.ok(chaser.cd>0,'defensive chase must auto-tackle on approach');
assert.ok(actionFatigue(0,60,'super')>actionFatigue(0,60,'shoot')*3,'super uses substantially more stamina');
assert.ok(fatigueTick(0,60,10,1)>fatigueTick(0,60,10,.45),'running drains more stamina than walking');
assert.equal(SUPER_SHOT_TRANSFORM_SECONDS,1.65,'super transformation reset preserved');
console.log('v0.8.11.2 PITCH/PRESS/SPRINT/FATIGUE PASSED');
