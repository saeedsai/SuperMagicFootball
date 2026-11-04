import assert from 'node:assert/strict';
import {Input} from '../src/input.js';

const windowHandlers=new Map();
globalThis.window={addEventListener:(name,handler)=>windowHandlers.set(name,handler)};
globalThis.HTMLInputElement=class {};
globalThis.HTMLSelectElement=class {};

class Element {
 constructor(action){this.dataset={act:action};this.handlers=new Map();this.classList={toggle(){}};this.style={};}
 addEventListener(name,handler){this.handlers.set(name,handler)}
 setPointerCapture(){}
 getBoundingClientRect(){return {left:0,top:0,width:150,height:150}}
 emit(type,pointerId){this.handlers.get(type)?.({type,pointerId,clientX:75,clientY:75,timeStamp:100,preventDefault(){}})}
}
const elements=new Map(['joyZone','joyKnob','pass','shoot','dribble','jump'].map(id=>[id,new Element(id)]));
globalThis.document={
 querySelector:selector=>elements.get(selector.replace('#','')),
 querySelectorAll:()=>['pass','shoot','dribble','jump'].map(id=>elements.get(id)),
};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[]}});

const input=new Input(),dribble=elements.get('dribble');
dribble.emit('pointerdown',1);
input.poll();
assert(input.just(0,'dribble')&&input.held(0,'dribble'),'first touch should start a held dribble');

// The release and restart happen between animation polls. Deliver the completed
// tap first, then preserve a distinct press edge for the still-held new touch.
dribble.emit('pointerup',1);
dribble.emit('pointerdown',2);
input.poll();
assert(input.just(0,'dribble')&&!input.released(0,'dribble')&&input.held(0,'dribble'),
 'a release and re-press between polls must still produce a fresh edge');
input.poll();
assert(!input.just(0,'dribble')&&input.held(0,'dribble'),
 'the restarted touch must not repeat its edge during an uninterrupted hold');

dribble.emit('pointerup',2);
input.poll();
assert(!input.held(0,'dribble')&&input.released(0,'dribble'),'the restarted touch should release normally');

// An uninterrupted hold must not manufacture repeat press edges.
dribble.emit('pointerdown',3);
input.poll();
assert(input.just(0,'dribble'));
input.poll();
assert(!input.just(0,'dribble')&&input.held(0,'dribble'));

console.log('CT19 DRIBBLE RESTART PASS: sub-frame release/repress keeps a distinct edge without repeating an uninterrupted hold');
