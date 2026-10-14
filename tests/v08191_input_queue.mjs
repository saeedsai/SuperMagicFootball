import assert from 'node:assert/strict';
import {Input} from '../src/input.js';
import {GameEngine} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';

const handlers=new Map();
globalThis.window={addEventListener:(event,handler)=>handlers.set(event,handler)};
globalThis.HTMLInputElement=class {};
globalThis.HTMLSelectElement=class {};
class Button{
 constructor(act){this.dataset={act};this.handlers=new Map();this.classList={toggle(){}};this.style={};}
 addEventListener(t,f){this.handlers.set(t,f)}
 setPointerCapture(){}
 getBoundingClientRect(){return {left:0,top:0,width:150,height:150}}
 event(type,pointerId,timeStamp){this.handlers.get(type)?.({type,pointerId,timeStamp,clientX:75,clientY:75,preventDefault(){}})}
}
const els=new Map(['joyZone','joyKnob','pass','shoot','dribble','jump'].map(k=>[k,new Button(k)]));
globalThis.document={querySelector:s=>els.get(s.slice(1)),querySelectorAll:()=>['pass','shoot','dribble','jump'].map(k=>els.get(k))};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[]}});
const input=new Input();
const key=(type,code,timeStamp)=>handlers.get(type)?.({type,code,timeStamp,target:{},preventDefault(){}});
const tap=(code,start,end)=>{key('keydown',code,start);key('keyup',code,end)};
const pointerTap=(act,id,start,end)=>{els.get(act).event('pointerdown',id,start);els.get(act).event('pointerup',id,end)};

// Three keyboard cycles inside one rendered frame are replayed once per frame.
tap('KeyK',100,110);tap('KeyK',120,135);tap('KeyK',145,170);
for(const duration of [.010,.015,.025]){
 input.poll();assert(input.just(0,'pass')&&input.released(0,'pass'));
 assert(Math.abs(input.tapDuration(0,'pass')-duration)<1e-7);
}
input.poll();assert(!input.just(0,'pass')&&!input.released(0,'pass'),'no duplicate ghost release');

// Several touch dribbles during a slow frame must not turn into a single dribble.
for(let i=0;i<4;i++)pointerTap('dribble',10+i,200+i*50,220+i*50);
for(let i=0;i<4;i++){input.poll();assert(input.just(0,'dribble')&&input.released(0,'dribble'));}
input.poll();assert(!input.just(0,'dribble'));

// A genuine 350ms held Pass that begins and ends inside a lag frame is long.
tap('KeyK',500,850);input.poll();assert(input.tapDuration(0,'pass')>.24);
const gameInput={state:[{},{}],poll(){},just(){return false},released(t,a){return a==='pass'},tapDuration(t,a){return a==='pass' ? .35 : 0}};
const game=new GameEngine({...DEFAULT_OPTIONS},gameInput);game.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});game.cooldown=0;game.driveAI=()=>{};game.humans=1;
const player=game.player(0,3);game.controlled[0]=player.i;game.ball.owner=player;player.passHold=0;player.passUsed=false;
let longPass=null;game.pass=(p,long)=>{longPass=long};game.updatePlayers(.016);
assert.equal(longPass,true,'long subframe Pass duration reaches gameplay');

// Long subframe Jump is a sprint gesture and must not jump on release.
const jumpInput={state:[{jump:1,x:1,y:0},{}],poll(){},just(t,a){return a==='jump'},released(t,a){return a==='jump'},tapDuration(t,a){return a==='jump' ? .32 : 0}};
const g2=new GameEngine({...DEFAULT_OPTIONS},jumpInput);g2.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});g2.cooldown=0;g2.driveAI=()=>{};g2.humans=1;
const p2=g2.player(0,3);g2.controlled[0]=p2.i;g2.ball.owner=p2;
g2.updatePlayers(.016);assert.equal(p2.jumpCount,0,'hold-to-run never becomes tap Jump at low FPS');

// Pointer cancellation before a poll must not launch an unintended action.
els.get('shoot').event('pointerdown',99,980);els.get('shoot').event('pointercancel',99,990);input.poll();assert(!input.just(0,'shoot'),'cancelled uncommitted tap must be discarded');

// The replay buffers must not survive focus loss.
tap('KeyJ',1000,1010);tap('KeyJ',1020,1030);input.poll();assert(input.just(0,'shoot'));handlers.get('blur')();input.poll();assert(!input.just(0,'shoot'));

// Rebinding player-one controls must honor queue-to-action mapping.
const bindings=input.getBindings();bindings.keyboard=['KeyL','KeyJ','KeyI','Space'];
assert(input.setBindings(bindings));tap('KeyL',1100,1115);tap('KeyL',1120,1135);
input.poll();assert(input.just(0,'pass'));input.poll();assert(input.just(0,'pass'));input.poll();assert(!input.just(0,'pass'));
console.log('v0.8.19.1 INPUT QUEUE PASS — 3 keyboard / 4 touch cycles, hold duration, sprint disambiguation, reset and remapping');
