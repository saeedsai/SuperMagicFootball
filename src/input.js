const MAPPINGS=[
 {KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right',ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyJ:'shoot',KeyK:'pass',KeyL:'special',KeyI:'dribble',Space:'jump',Tab:'switch',ShiftLeft:'sprint',ShiftRight:'sprint',Escape:'pause',KeyP:'pause',Enter:'confirm'},
 {ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Numpad8:'up',Numpad5:'down',Numpad4:'left',Numpad6:'right',Comma:'shoot',Period:'pass',Slash:'special',NumpadDecimal:'dribble',Numpad1:'shoot',Numpad2:'pass',Numpad3:'special',Numpad0:'jump',ControlRight:'jump',NumpadEnter:'switch',ShiftRight:'sprint',Backslash:'pause'}
];
export const REMAPPABLE_ACTIONS=['pass','shoot','dribble','jump'];
export const DEFAULT_BINDINGS={keyboard:['KeyK','KeyJ','KeyI','Space'],gamepad:[1,0,2,3],keyboard2:['Period','Comma','NumpadDecimal','ControlRight'],gamepad2:[1,0,2,3]};
const LEGACY_P2_ACTION_KEYS=new Set(['Comma','Period','Slash','NumpadDecimal','Numpad1','Numpad2','Numpad3','Numpad0','ControlRight']);
const GAMEPAD_BUTTONS={0:'shoot',1:'pass',2:'dribble',3:'jump',4:'switch',5:'sprint',6:'special',9:'pause'};
const deadzone=v=>Math.abs(v)<.16?0:Math.max(-1,Math.min(1,v));
export class Input{
 constructor(){this.keys=new Set();this.keyPending=new Set();this.touchPending=new Set();this.touchPointers=new Map();this.joyPointers=new Map();this.bindings=Object.fromEntries(Object.entries(DEFAULT_BINDINGS).map(([k,v])=>[k,v.slice()]));this.prev=[{}, {}, {}, {}];this.touch={x:0,y:0};this.touchButtons=new Set();this.gamepads=[];this.state=Array.from({length:4},()=>({}));this.pressed=Array.from({length:4},()=>({}));this.enabled=true;
 const stopCodes=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab']);
 window.addEventListener('keydown',e=>{if((e.target instanceof HTMLInputElement)||(e.target instanceof HTMLSelectElement))return;if(stopCodes.has(e.code))e.preventDefault();if(!this.keys.has(e.code))this.keyPending.add(e.code);this.keys.add(e.code)});
 window.addEventListener('keyup',e=>this.keys.delete(e.code));window.addEventListener('blur',()=>{this.keys.clear();this.keyPending.clear();this.touchButtons.clear();this.touchPending.clear();this.touchPointers.clear();this.joyPointers.clear();this.touch.x=this.touch.y=0;this.reset()});
 this.bindTouch();}
 setBindings(profile){
  if(!profile||!Array.isArray(profile.keyboard)||!Array.isArray(profile.gamepad))return false;
  // Old saves contain only player-one fields. Preserve the second player's defaults.
  const next={keyboard:profile.keyboard,gamepad:profile.gamepad,
   keyboard2:profile.keyboard2??DEFAULT_BINDINGS.keyboard2,gamepad2:profile.gamepad2??DEFAULT_BINDINGS.gamepad2};
  const validCode=code=>typeof code==='string'&&/^(Key[A-Z]|Digit[0-9]|Space|Numpad(?:[0-9]|Decimal)|ControlRight|Comma|Period|Slash)$/.test(code)
   &&!['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Numpad4','Numpad5','Numpad6','Numpad8'].includes(code);
  for(const key of ['keyboard','keyboard2'])if(!Array.isArray(next[key])||next[key].length!==4||!next[key].every(validCode)||new Set(next[key]).size!==4)return false;
  for(const key of ['gamepad','gamepad2'])if(!Array.isArray(next[key])||next[key].length!==4||!next[key].every(n=>Number.isInteger(n)&&n>=0&&n<=7)||new Set(next[key]).size!==4)return false;
  if(next.keyboard.some(k=>next.keyboard2.includes(k)))return false; // No action-key ambiguity in local versus
  this.bindings=Object.fromEntries(Object.entries(next).map(([k,v])=>[k,v.slice()]));this.reset();return true;
 }
 getBindings(){return Object.fromEntries(Object.entries(this.bindings).map(([k,v])=>[k,v.slice()]));}
 bindTouch(){
  const zone=document.querySelector('#joyZone');if(!zone)return;
  const knob=document.querySelector('#joyKnob');
  const updateJoy=()=>{
   const active=this.joyPointers.values().next().value;
   if(!active){this.touch.x=this.touch.y=0;if(knob)knob.style.transform='translate(0,0)';return;}
   const b=zone.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;
   let dx=(active.x-cx)/(b.width*.38),dy=(active.y-cy)/(b.height*.38),r=Math.hypot(dx,dy);
   if(r>1){dx/=r;dy/=r}this.touch.x=dx;this.touch.y=dy;
   if(knob)knob.style.transform=`translate(${dx*34}px,${dy*34}px)`;
  };
  zone.addEventListener('pointerdown',e=>{e.preventDefault();zone.setPointerCapture(e.pointerId);this.joyPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});updateJoy()});
  zone.addEventListener('pointermove',e=>{if(this.joyPointers.has(e.pointerId)){this.joyPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});updateJoy()}});
  const joyOff=e=>{if(this.joyPointers.delete(e.pointerId))updateJoy()};
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])zone.addEventListener(ev,joyOff);
  document.querySelectorAll('[data-act]').forEach(b=>{
   const act=b.dataset.act;
   const refresh=()=>{const active=[...this.touchPointers.values()].includes(act);if(active)this.touchButtons.add(act);else this.touchButtons.delete(act);b.classList.toggle('active',active)};
   b.addEventListener('pointerdown',e=>{
    e.preventDefault();b.setPointerCapture(e.pointerId);
    if(!this.touchPointers.has(e.pointerId)){
     if(!this.touchButtons.has(act))this.touchPending.add(act);
     this.touchPointers.set(e.pointerId,act);
    }
    refresh();
   });
   const off=e=>{if(this.touchPointers.get(e.pointerId)===act)this.touchPointers.delete(e.pointerId);refresh()};
   for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,off);
  });
 }
 poll(multiplayer=false){const gps=navigator.getGamepads?.()||[];const gp=Array.from(gps);for(let slot=0;slot<4;slot++){
 const pad=(slot===0||multiplayer)?(gp[slot]||null):null;
 const keys=MAPPINGS[slot]||{};let s={up:0,down:0,left:0,right:0,shoot:0,pass:0,dribble:0,special:0,jump:0,switch:0,sprint:0,pause:0,confirm:0,x:0,y:0};
 if(slot===0||multiplayer){for(let code of new Set([...this.keys,...this.keyPending])){if(multiplayer&&slot===0&&code.startsWith('Arrow'))continue;let a=keys[code];if(slot<=1){const custom=this.bindings[slot===0?'keyboard':'keyboard2'].indexOf(code);if(custom>=0)a=REMAPPABLE_ACTIONS[custom];else if(REMAPPABLE_ACTIONS.includes(a)&&(slot===0?DEFAULT_BINDINGS.keyboard.includes(code):LEGACY_P2_ACTION_KEYS.has(code)))a=null;}if(a)s[a]=1}}
 if(slot===0){for(const a of this.touchButtons)s[a]=1;for(const a of this.touchPending)s[a]=1;}
 if(pad){for(const [i,a] of Object.entries(GAMEPAD_BUTTONS)){
  const remapIndex=slot<=1?this.bindings[slot===0?'gamepad':'gamepad2'].indexOf(+i):-1;
  const action=remapIndex>=0?REMAPPABLE_ACTIONS[remapIndex]:(slot<=1&&REMAPPABLE_ACTIONS.includes(a)?null:a);
  if(action&&pad.buttons[+i]?.pressed)s[action]=1;
 }const x=deadzone(pad.axes[0]||0),y=deadzone(pad.axes[1]||0);if(Math.abs(x)>.1){s.left=x<0?1:0;s.right=x>0?1:0}if(Math.abs(y)>.1){s.up=y<0?1:0;s.down=y>0?1:0}if(pad.buttons[12]?.pressed)s.up=1;if(pad.buttons[13]?.pressed)s.down=1;if(pad.buttons[14]?.pressed)s.left=1;if(pad.buttons[15]?.pressed)s.right=1}
 let x=(s.right?1:0)-(s.left?1:0),y=(s.down?1:0)-(s.up?1:0);if(slot===0&&(Math.abs(this.touch.x)+Math.abs(this.touch.y)>.06)){x=this.touch.x;y=this.touch.y}const norm=Math.max(1,Math.hypot(x,y));s.x=x/norm;s.y=y/norm;
 this.pressed[slot]={};for(let k of ['shoot','pass','dribble','special','jump','switch','sprint','pause','confirm'])this.pressed[slot][k]=!!s[k]&&!this.prev[slot][k];this.prev[slot]=s;this.state[slot]=s;}
 this.keyPending.clear();this.touchPending.clear();
 }
 held(i,a){return !!this.state[i]?.[a]}
 just(i,a){return !!this.pressed[i]?.[a]}
 reset(){this.prev=Array.from({length:4},()=>({}));}
}
