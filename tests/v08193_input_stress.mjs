import assert from 'node:assert/strict';
import {Input,MAX_BUFFERED_TAPS} from '../src/input.js';

const wh=new Map();
globalThis.window={addEventListener:(e,fn)=>wh.set(e,fn)};
globalThis.HTMLInputElement=class {};
globalThis.HTMLSelectElement=class {};
class Node{
 constructor(act){this.dataset={act};this.handlers=new Map();this.classList={toggle(){}};this.style={};}
 addEventListener(name,fn){this.handlers.set(name,fn)}
 setPointerCapture(){}
 getBoundingClientRect(){return {left:0,top:0,width:180,height:180}}
 ev(type,id,timeStamp){this.handlers.get(type)?.({type,pointerId:id,timeStamp,clientX:100,clientY:100,preventDefault(){}})}
}
const names=['joyZone','joyKnob','pass','shoot','dribble','jump'];
const elems=new Map(names.map(n=>[n,new Node(n)]));
globalThis.document={hidden:false,addEventListener(){},querySelector:s=>elems.get(s.slice(1)),querySelectorAll:()=>names.slice(2).map(n=>elems.get(n))};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[]}});
const input=new Input();
const tap=(code,t,elapsed=18)=>{wh.get('keydown')({code,timeStamp:t,target:{},preventDefault(){}});wh.get('keyup')({code,timeStamp:t+elapsed,target:{},preventDefault(){}})};
const touch=(name,id,t,duration=12,kind='pointerup')=>{elems.get(name).ev('pointerdown',id,t);elems.get(name).ev(kind,id,t+duration)};

// 12 rapid presses within one 500ms frame should each emerge once, in order.
for(let n=0;n<MAX_BUFFERED_TAPS;n++)tap('KeyK',100+n*35,10+n);
for(let n=0;n<MAX_BUFFERED_TAPS;n++){
 input.poll();assert(input.just(0,'pass')&&input.released(0,'pass'));
 assert(Math.abs(input.tapDuration(0,'pass')-(10+n)/1000)<1e-6);
}
input.poll();assert(!input.just(0,'pass')&&!input.released(0,'pass'));

// Limit stale catch-up after a long background stall; never flood later frames.
for(let n=0;n<100;n++)tap('KeyJ',2000+n*20);
let count=0;for(let n=0;n<MAX_BUFFERED_TAPS+5;n++){input.poll();if(input.just(0,'shoot'))count++}
assert.equal(count,MAX_BUFFERED_TAPS,'bounded backlog avoids dozens of delayed actions');

// Interrupted touch after a rendered press is canceled rather than released.
elems.get('shoot').ev('pointerdown',7,5500);input.poll();assert(input.just(0,'shoot'));
elems.get('shoot').ev('pointercancel',7,5600);input.poll();
assert(!input.released(0,'shoot')&&!input.held(0,'shoot'),'canceled hold must not fire charged release');
input.poll();assert(!input.released(0,'shoot'));

// Capture loss is also cancellation; a valid touchup afterwards remains usable.
elems.get('pass').ev('pointerdown',8,6000);input.poll();
elems.get('pass').ev('lostpointercapture',8,6220);input.poll();assert(!input.released(0,'pass'));
touch('pass',9,6300,12);input.poll();assert(input.just(0,'pass')&&input.released(0,'pass'));

// Keyboard source must not be canceled by an unrelated aborted touch on same action.
wh.get('keydown')({code:'KeyK',timeStamp:7000,target:{},preventDefault(){}});input.poll();
elems.get('pass').ev('pointerdown',12,7050);elems.get('pass').ev('pointercancel',12,7070);
input.poll();assert(input.held(0,'pass')&&!input.released(0,'pass'),'held physical key survives separate touch cancellation');
wh.get('keyup')({code:'KeyK',timeStamp:7100,target:{},preventDefault(){}});input.poll();assert(input.released(0,'pass'));

// Some mobile engines may reject pointer capture; input must still be usable.
elems.get('jump').setPointerCapture=()=>{throw Error('not attached')};
touch('jump',98,8000,17);input.poll();
assert(input.just(0,'jump')&&input.released(0,'jump'),'pointer-capture failure must not crash and drop the touch');

// Short gamepad events between Gamepad API samples cannot be recovered.
// This test records that limitation rather than claiming nonexistent telemetry.
assert.equal(typeof navigator.getGamepads,'function');
console.log('v0.8.19.3 INPUT STRESS PASS: 12 ordered taps, 100-tap cap, canceled held touch, lost capture, mixed input sources');
