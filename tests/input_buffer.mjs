import assert from 'node:assert/strict';
import {Input} from '../src/input.js';
const handlers=new Map();const win={addEventListener:(n,cb)=>handlers.set(n,cb)};
globalThis.window=win;
globalThis.HTMLInputElement=class {}; globalThis.HTMLSelectElement=class {};
const elements=new Map();
class El{
 constructor(key){this.key=key;this.dataset={act:key};this.handlers=new Map();this.captured=new Set();this.classList={toggle(){},add(){},remove(){}};this.style={};}
 addEventListener(n,cb){this.handlers.set(n,cb)};
 setPointerCapture(id){this.captured.add(id)};
 getBoundingClientRect(){return {left:0,top:0,width:150,height:150}}
 emit(type,id,x=75,y=75){const e={pointerId:id,clientX:x,clientY:y,preventDefault(){},target:this};this.handlers.get(type)?.(e);if(type==='pointerup'||type==='pointercancel'){this.captured.delete(id);this.handlers.get('lostpointercapture')?.(e)}}
}
for(const key of ['joyZone','joyKnob','pass','shoot','dribble','jump'])elements.set(key,new El(key));
globalThis.document={querySelector:s=>elements.get(s.replace('#','')),querySelectorAll:()=>['pass','shoot','dribble','jump'].map(k=>elements.get(k))};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[]}});
const input=new Input();const emit=(type,code)=>handlers.get(type)?.({code,target:{},preventDefault(){}});
// Key press/release between animation polls is buffered exactly once.
emit('keydown','KeyK');emit('keyup','KeyK');input.poll();assert(input.just(0,'pass'));assert(input.held(0,'pass'));input.poll();assert(!input.held(0,'pass'));assert(!input.just(0,'pass'));
// Continuous key hold stays held across polls, not retriggered each frame.
emit('keydown','Space');input.poll();assert(input.just(0,'jump'));input.poll();assert(input.held(0,'jump')&&!input.just(0,'jump'));emit('keyup','Space');input.poll();assert(!input.held(0,'jump'));
// Two simultaneous touches survive same-frame taps in correct action channels.
const press=(k,id)=>elements.get(k).emit('pointerdown',id),release=(k,id)=>elements.get(k).emit('pointerup',id);
press('jump',1);press('shoot',2);release('jump',1);release('shoot',2);input.poll();assert(input.just(0,'jump')&&input.just(0,'shoot'));input.poll();assert(!input.held(0,'jump')&&!input.held(0,'shoot'));
// Quick dribble taps remain visible with a poll between taps.
press('dribble',3);release('dribble',3);input.poll();assert(input.just(0,'dribble'));input.poll();press('dribble',4);release('dribble',4);input.poll();assert(input.just(0,'dribble'));
// Two pointers on one action: releasing one does not drop the other.
press('pass',5);input.poll();press('pass',6);release('pass',5);input.poll();assert(input.held(0,'pass'));release('pass',6);input.poll();assert(!input.held(0,'pass'));
// Joystick pointer release cannot cancel another active joystick pointer.
const joy=elements.get('joyZone');joy.emit('pointerdown',7,120,75);joy.emit('pointerdown',8,20,75);joy.emit('pointerup',7,120,75);assert(input.touch.x<0,'remaining joystick pointer must still steer');joy.emit('pointerup',8,20,75);assert.equal(input.touch.x,0);
// Blur clears queued events so they cannot surprise the player upon focus return.
press('shoot',9);release('shoot',9);handlers.get('blur')();input.poll();assert(!input.held(0,'shoot'));
console.log('INPUT BUFFER PASS: keyboard/touch quick taps, simultaneous buttons, held keys, multi-pointer, joystick handoff, blur cleanup');
