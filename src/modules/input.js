// Supermagic Football v0.8.25.30 | INPUT | independently editable module
const INPUT=(()=>{const MAPPINGS=[
 {KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right',ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyJ:'shoot',KeyK:'pass',KeyI:'dribble',Space:'jump',Escape:'pause',KeyP:'pause',Enter:'confirm'},
 {ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Numpad8:'up',Numpad5:'down',Numpad4:'left',Numpad6:'right',Comma:'shoot',Period:'pass',NumpadDecimal:'dribble',ControlRight:'jump',Backslash:'pause'}
];
const REMAPPABLE_ACTIONS=['pass','shoot','dribble','jump'];
const DEFAULT_BINDINGS={keyboard:['KeyK','KeyJ','KeyI','Space'],gamepad:[1,0,2,3],keyboard2:['Period','Comma','NumpadDecimal','ControlRight'],gamepad2:[1,0,2,3]};
const LEGACY_P2_ACTION_KEYS=new Set(['Comma','Period','NumpadDecimal','ControlRight']);
const GAMEPAD_BUTTONS={0:'shoot',1:'pass',2:'dribble',3:'jump',9:'pause'};
// A stalled render loop must not replay an unbounded stream of historical taps.
const MAX_BUFFERED_TAPS=12;
const deadzone=v=>Math.abs(v)<.16?0:Math.max(-1,Math.min(1,v));
class Input{
 constructor(){this.keys=new Set();this.keyPending=new Set();this.keyReleasePending=new Set();this.keyPulsePending=new Map();this.keyDownTimes=new Map();this.touchPulsePending=new Map();this.touchDownTimes=new Map();this.touchReplayHeldPending=new Set();this.touchReplayTapDurations=new Map();this.pulseBacklog=Array.from({length:4},()=>({}));this.pulseDurations=Array.from({length:4},()=>({}));this.tapDurations=Array.from({length:4},()=>({}));this.touchPending=new Set();this.touchReleasePending=new Set();this.touchPointers=new Map();this.joyPointers=new Map();this.touchCanceled=new Set();this.globalCancelPending=false;this.canceledActions=Array.from({length:4},()=>({}));this.bindings=Object.fromEntries(Object.entries(DEFAULT_BINDINGS).map(([k,v])=>[k,v.slice()]));this.prev=[{}, {}, {}, {}];this.touch={x:0,y:0};this.touchButtons=new Set();this.gamepads=[];this.state=Array.from({length:4},()=>({}));this.pressed=Array.from({length:4},()=>({}));this.releases=Array.from({length:4},()=>({}));this.enabled=true;
 const stopCodes=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab']);
 window.addEventListener('keydown',e=>{if((e.target instanceof HTMLInputElement)||(e.target instanceof HTMLSelectElement))return;if(stopCodes.has(e.code))e.preventDefault();if(!this.keys.has(e.code)){this.keyPending.add(e.code);this.keyDownTimes.set(e.code,Number.isFinite(e.timeStamp)?e.timeStamp:Date.now());}this.keys.add(e.code)});
 window.addEventListener('keyup',e=>{if(this.keys.has(e.code)||this.keyPending.has(e.code)){this.keyReleasePending.add(e.code);if(this.keyPending.has(e.code)){const duration=Math.max(0,(Number.isFinite(e.timeStamp)?e.timeStamp:Date.now())-(this.keyDownTimes.get(e.code)||0));const arr=this.keyPulsePending.get(e.code)||[];arr.push(duration/1000);this.keyPulsePending.set(e.code,arr);}}this.keys.delete(e.code);this.keyDownTimes.delete(e.code)});window.addEventListener('blur',()=>this.cancelAll());
 // Mobile browsers can background without firing window.blur (app switch, call overlay).
 // Never replay an old held action or queued short tap when a tab becomes visible.
 document.addEventListener?.('visibilitychange',()=>{if(document.hidden)this.cancelAll()});
 // A disconnected gamepad is released by the next poll; do not reset held
 // keyboard actions here or they will create spurious 'just pressed' edges.
 window.addEventListener('gamepaddisconnected',()=>{this.gamepads=[]});
 this.bindTouch();}
 // Cancel every transient input state, including already buffered taps. Keep remappings.
 cancelAll(){
  this.keys.clear();this.keyPending.clear();this.keyReleasePending.clear();this.keyPulsePending.clear();this.keyDownTimes.clear();
  this.touchPulsePending.clear();this.touchDownTimes.clear();this.touchReplayHeldPending.clear();this.touchReplayTapDurations.clear();this.touchCanceled.clear();this.touchButtons.clear();this.touchPending.clear();this.touchReleasePending.clear();
  this.touchPointers.clear();this.joyPointers.clear();this.touch.x=this.touch.y=0;this.globalCancelPending=true;
  const knob=document.querySelector?.('#joyKnob');if(knob)knob.style.transform='translate(0,0)';
  document.querySelectorAll?.('[data-act]').forEach(b=>b.classList?.toggle('active',false));
  this.state=Array.from({length:4},()=>({}));this.reset();
 }
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
  zone.addEventListener('pointerdown',e=>{e.preventDefault();try{zone.setPointerCapture(e.pointerId)}catch{};this.joyPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});updateJoy()});
  zone.addEventListener('pointermove',e=>{if(this.joyPointers.has(e.pointerId)){this.joyPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});updateJoy()}});
  const joyOff=e=>{if(this.joyPointers.delete(e.pointerId))updateJoy()};
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])zone.addEventListener(ev,joyOff);
  document.querySelectorAll('[data-act]').forEach(b=>{
   const act=b.dataset.act;
   const refresh=()=>{const active=[...this.touchPointers.values()].includes(act);if(active)this.touchButtons.add(act);else this.touchButtons.delete(act);b.classList.toggle('active',active)};
   b.addEventListener('pointerdown',e=>{
    e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch{};
    if(!this.touchPointers.has(e.pointerId)){
     if(!this.touchButtons.has(act)){this.touchPending.add(act);this.touchDownTimes.set(act,Number.isFinite(e.timeStamp)?e.timeStamp:Date.now());}
     this.touchPointers.set(e.pointerId,act);
    }
    refresh();
   });
   const off=e=>{if(this.touchPointers.get(e.pointerId)===act){this.touchPointers.delete(e.pointerId);if(![...this.touchPointers.values()].includes(act)){if(e.type&&e.type!=='pointerup'){this.touchPending.delete(act);this.touchDownTimes.delete(act);this.touchReplayHeldPending.delete(act);this.touchReplayTapDurations.delete(act);this.touchCanceled.add(act);refresh();return;}this.touchReleasePending.add(act);if(this.touchPending.has(act)||this.touchReplayHeldPending.has(act)){const duration=Math.max(0,(Number.isFinite(e.timeStamp)?e.timeStamp:Date.now())-(this.touchDownTimes.get(act)||0))/1000;if(this.touchPending.has(act)){const arr=this.touchPulsePending.get(act)||[];arr.push(duration);this.touchPulsePending.set(act,arr);}else this.touchReplayTapDurations.set(act,duration);}this.touchDownTimes.delete(act);}}refresh()};
   for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,off);
  });
 }
 poll(multiplayer=false){const gps=navigator.getGamepads?.()||[];const gp=Array.from(gps);for(let slot=0;slot<4;slot++){
 const pad=(slot===0||multiplayer)?(gp[slot]||null):null;
 const keys=MAPPINGS[slot]||{};let s={up:0,down:0,left:0,right:0,shoot:0,pass:0,dribble:0,jump:0,pause:0,confirm:0,x:0,y:0};
 if(slot===0||multiplayer){for(let code of new Set([...this.keys,...this.keyPending])){if(multiplayer&&slot===0&&code.startsWith('Arrow'))continue;let a=keys[code];if(slot<=1){const custom=this.bindings[slot===0?'keyboard':'keyboard2'].indexOf(code);if(custom>=0)a=REMAPPABLE_ACTIONS[custom];else if(REMAPPABLE_ACTIONS.includes(a)&&(slot===0?DEFAULT_BINDINGS.keyboard.includes(code):LEGACY_P2_ACTION_KEYS.has(code)))a=null;}if(a)s[a]=1}}
 if(slot===0){for(const a of this.touchButtons)s[a]=1;for(const a of this.touchPending)s[a]=1;}
 if(pad){for(let i=0;i<Math.min(16,pad.buttons.length);i++){
  const a=GAMEPAD_BUTTONS[i];
  const remapIndex=slot<=1?this.bindings[slot===0?'gamepad':'gamepad2'].indexOf(i):-1;
  const action=remapIndex>=0?REMAPPABLE_ACTIONS[remapIndex]:(slot<=1&&REMAPPABLE_ACTIONS.includes(a)?null:a);
  if(action&&pad.buttons[i]?.pressed)s[action]=1;
 }const x=deadzone(pad.axes[0]||0),y=deadzone(pad.axes[1]||0);if(Math.abs(x)>.1){s.left=x<0?1:0;s.right=x>0?1:0}if(Math.abs(y)>.1){s.up=y<0?1:0;s.down=y>0?1:0}if(pad.buttons[12]?.pressed)s.up=1;if(pad.buttons[13]?.pressed)s.down=1;if(pad.buttons[14]?.pressed)s.left=1;if(pad.buttons[15]?.pressed)s.right=1}
 let x=(s.right?1:0)-(s.left?1:0),y=(s.down?1:0)-(s.up?1:0);if(slot===0&&(Math.abs(this.touch.x)+Math.abs(this.touch.y)>.06)){x=this.touch.x;y=this.touch.y}const norm=Math.max(1,Math.hypot(x,y));s.x=x/norm;s.y=y/norm;
 // Collect every completed press/release cycle before the poll. A Set alone loses
 // a second (or third) rapid tap in the same animation frame.
 const incoming={};
 const enqueue=(action,durations)=>{if(!action||!durations?.length)return;(incoming[action]??=[]).push(...durations);};
 if(slot===0)for(const [action,durations] of this.touchPulsePending)enqueue(action,durations);
 for(const [code,durations] of this.keyPulsePending){
  if(multiplayer&&slot===0&&code.startsWith('Arrow'))continue;
  let a=keys[code];
  if(slot<=1){const custom=this.bindings[slot===0?'keyboard':'keyboard2'].indexOf(code);
   if(custom>=0)a=REMAPPABLE_ACTIONS[custom];
   else if(REMAPPABLE_ACTIONS.includes(a)&&(slot===0?DEFAULT_BINDINGS.keyboard.includes(code):LEGACY_P2_ACTION_KEYS.has(code)))a=null;
  }
  enqueue(a,durations);
 }
 for(const [action,durations] of Object.entries(incoming)){
  const available=Math.max(0,MAX_BUFFERED_TAPS-(this.pulseBacklog[slot][action]||0));
  const accepted=durations.slice(0,available);
  this.pulseBacklog[slot][action]=(this.pulseBacklog[slot][action]||0)+accepted.length;
  (this.pulseDurations[slot][action]??=[]).push(...accepted);
 }
 const releasedActions=new Set(slot===0?this.touchReleasePending:[]);
 for(const code of this.keyReleasePending){
  if(multiplayer&&slot===0&&code.startsWith('Arrow'))continue;
  let a=keys[code];
  if(slot<=1){const custom=this.bindings[slot===0?'keyboard':'keyboard2'].indexOf(code);
   if(custom>=0)a=REMAPPABLE_ACTIONS[custom];
   else if(REMAPPABLE_ACTIONS.includes(a)&&(slot===0?DEFAULT_BINDINGS.keyboard.includes(code):LEGACY_P2_ACTION_KEYS.has(code)))a=null;
  }
  if(a)releasedActions.add(a);
 }
 this.pressed[slot]={};this.releases[slot]={};this.tapDurations[slot]={};this.canceledActions[slot]={};
 const nextPrev={...s};
 for(let k of ['shoot','pass','dribble','jump','pause','confirm']){
  this.canceledActions[slot][k]=!!this.globalCancelPending||(slot===0&&this.touchCanceled.has(k)&&!s[k]);
  const queued=this.pulseBacklog[slot][k]||0;
  // A completed tap gets one press+release pulse per poll. Remaining taps
  // replay on subsequent polls even when hardware was already released.
  if(queued){
   // A completed tap can be followed by a NEW still-held touch before
   // this poll. Replay the completed tap first and preserve the held
   // press for a later poll instead of swallowing the second press edge.
   if(slot===0&&k==='dribble'&&this.touchPending.has(k)&&this.touchButtons.has(k))this.touchReplayHeldPending.add(k);
   this.pulseBacklog[slot][k]=queued-1;
   const duration=this.pulseDurations[slot][k]?.shift()??0;
   this.tapDurations[slot][k]=duration;
   this.pressed[slot][k]=true;this.releases[slot][k]=true;s[k]=1;
   // Released tap must not manufacture an extra release next frame.
   // Real physical hold still wins if a separate key remains down.
   nextPrev[k]=!!([...this.keys].some(code=>{
    const custom=slot<=1?this.bindings[slot===0?'keyboard':'keyboard2'].indexOf(code):-1;
    return custom>=0?REMAPPABLE_ACTIONS[custom]===k:keys[code]===k;
   })||(slot===0&&this.touchButtons.has(k)));
  }else if(slot===0&&this.touchCanceled.has(k)&&!s[k]){
   this.touchReplayHeldPending.delete(k);this.touchReplayTapDurations.delete(k);
   // Cancel/lost capture aborts a held gesture; do not commit its release as
   // a charged shot or long pass. Other live sources keep their own state.
   this.pressed[slot][k]=false;this.releases[slot][k]=false;nextPrev[k]=false;
  }else{
   // A rapid touch DRIBBLE release and re-press can happen entirely between
   // two animation frames. The previous frame still says "held", but this
   // is a real second press edge (rainbow/other chained dribble gestures).
   // Do not synthesize repeat edges for an uninterrupted hold or for two
   // pointers still holding the same button. Completed taps use the pulse
   // backlog above; this branch handles the new press that remains held.
   const restartedTouchDribble=slot===0&&k==='dribble'&&
     this.touchReleasePending.has(k)&&this.touchPending.has(k)&&
     this.touchButtons.has(k);
   const deferredTouchDribble=slot===0&&k==='dribble'&&this.touchReplayHeldPending.has(k);
   if(deferredTouchDribble){
    this.touchReplayHeldPending.delete(k);
    this.pressed[slot][k]=true;
    // If the new touch was released while earlier taps were replaying,
    // deliver its own short press/release, not a phantom held control.
    if(!s[k]){this.releases[slot][k]=true;s[k]=1;nextPrev[k]=false;this.tapDurations[slot][k]=this.touchReplayTapDurations.get(k)||0;}
    else this.releases[slot][k]=false;
    this.touchReplayTapDurations.delete(k);
   }else{
    this.pressed[slot][k]=!!s[k]&&(!this.prev[slot][k]||restartedTouchDribble);
    this.releases[slot][k]=!s[k]&&(releasedActions.has(k)||!!this.prev[slot][k]);
    if(this.releases[slot][k]&&!this.keys.size&&!(slot===0&&this.touchButtons.has(k)))nextPrev[k]=false;
   }
  }
 }
 this.prev[slot]=nextPrev;this.state[slot]=s;}
 this.keyPending.clear();this.keyReleasePending.clear();this.keyPulsePending.clear();this.touchPulsePending.clear();this.touchPending.clear();this.touchReleasePending.clear();this.touchCanceled.clear();this.globalCancelPending=false;
 }
 held(i,a){return !!this.state[i]?.[a]}
 just(i,a){return !!this.pressed[i]?.[a]}
 released(i,a){return !!this.releases[i]?.[a]}
 tapDuration(i,a){return this.tapDurations[i]?.[a]??0}
 canceled(i,a){return !!this.canceledActions[i]?.[a]}
 reset(){this.prev=Array.from({length:4},()=>({}));this.releases=Array.from({length:4},()=>({}));this.pressed=Array.from({length:4},()=>({}));this.tapDurations=Array.from({length:4},()=>({}));this.pulseBacklog=Array.from({length:4},()=>({}));this.pulseDurations=Array.from({length:4},()=>({}));this.touchReplayHeldPending.clear();this.touchReplayTapDurations.clear();this.canceledActions=Array.from({length:4},()=>({}));}
}

return {Input};})();
// v0.8.25.12 visual orientation, independently selectable ball skins and bounded knockouts.

export {INPUT};
