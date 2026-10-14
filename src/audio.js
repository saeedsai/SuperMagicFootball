// v0.8.23.2 module (retained in v0.8.24) — Original procedural music, SFX and crowd texture. No licensed samples or downloads.
// A user gesture is mandatory before AudioContext creation. All nodes are cleaned up on mute/dispose.
export const AUDIO_DEFAULTS=Object.freeze({mute:false,master:70,music:45,sfx:75,ui:50,ambience:25});
export const AUDIO_CUES=Object.freeze({kick:'kick',save:'save',keeperCatch:'save',goal:'goal',tackleHit:'tackle',slideStart:'slide',superShotLaunch:'stun',superShotKnockback:'stun',defenceSuper:'super',flipKick:'super',halftime:'halftime',finished:'finished',penaltyKick:'kick',lightning:'stun'});
const clamp=(v,fallback)=>{if(v===null||v===''||!Number.isFinite(Number(v)))return fallback;return Math.min(100,Math.max(0,Number(v)))};
export function sanitizeAudioOptions(v={}){
 if(!v||typeof v!=='object'||Array.isArray(v))v={};
 return Object.fromEntries(Object.entries(AUDIO_DEFAULTS).map(([k,d])=>k==='mute'?[k,v[k]===true||v[k]==='true'||v[k]===1]:[k,clamp(v[k]??d,d)]));
}
const MUSIC={menu:[261.63,329.63,392,523.25,392,329.63,293.66,349.23],halftime:[392,440,523,440,349,392,330,392]};
const FADE_SECONDS=.85;
export class ArcadeAudio{
 constructor(settings={},contextFactory=null){
  this.settings=sanitizeAudioOptions(settings);this.factory=contextFactory;this.ctx=null;
  this.unlocked=false;this.scene='silent';this.interval=null;this.noteIndex=0;this.last=new Map();
  this.visibilityPaused=false;this.voice=null;this.retiring=new Set();this.ambienceNode=null;this.ambienceGain=null;
 }
 _gain(param,value,seconds=0){
  const t=this.ctx?.currentTime??0;
  try{param.cancelScheduledValues?.(t);param.setValueAtTime?.(param.value??0,t);
   if(seconds>0&&param.linearRampToValueAtTime)param.linearRampToValueAtTime(value,t+seconds);
   else param.setValueAtTime?.(value,t);
  }catch{try{param.value=value}catch{}}
 }
 _audible(kind){return !this.settings.mute&&!this.visibilityPaused&&(this.settings.master>0)&&(this.settings[kind]>0)}
 configure(options){
  const previous=this.settings;this.settings=sanitizeAudioOptions(options);
  if(this.settings.mute||this.settings.music===0||this.settings.master===0)this.stopMusic(false);
  else if(this.unlocked&&!this.visibilityPaused&&!this.voice)this.startMusic();
  if(this.settings.mute||this.settings.master===0||this.settings.ambience===0)this.stopAmbience();
  else if(this.unlocked&&this.scene==='match'&&!this.visibilityPaused)this.startAmbience();
  else this._updateAmbience();
  // Volume changes take effect on the next music note and on the currently playing crowd bus.
  return previous.mute!==this.settings.mute;
 }
 unlock(){
  try{
   const C=this.factory||(typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext));
   if(!C)return false;
   if(this.ctx?.state==='closed'){this.ctx=null;this.unlocked=false}
   this.ctx??=new C();this.unlocked=true;
   // Safari can reject resume outside a user gesture. Swallow rejection and retry on subsequent gestures.
   if(this.ctx.state!=='running')this.ctx.resume?.()?.catch?.(()=>{});
   if(!this.visibilityPaused){if(!this.voice)this.startMusic();if(this.scene==='match')this.startAmbience()}
   return true;
  }catch{return false}
 }
 tone(freq,duration=.12,kind='sfx',wave='sine',delay=0,bus=null){
  if(!this.ctx||!this.unlocked||!this._audible(kind))return;
  const amplitude=(this.settings.master/100)*(this.settings[kind]/100)*.085;
  try{
   const start=this.ctx.currentTime+delay,osc=this.ctx.createOscillator(),gain=this.ctx.createGain();
   osc.type=wave;osc.frequency.setValueAtTime(freq,start);
   gain.gain.setValueAtTime(Math.max(.00001,amplitude),start);
   gain.gain.exponentialRampToValueAtTime(.00001,start+duration);
   osc.connect(gain);gain.connect(bus||this.ctx.destination);osc.start(start);osc.stop(start+duration+.005);
  }catch{}
 }
 cue(event){
  const type=typeof event==='string'?event:event?.type;
  const cue=type==='kick'&&event?.super?'super':type==='flipKick'&&!event?.special?'kick':AUDIO_CUES[type]||type;
  if(!cue||!this._audible(cue==='ui'||cue==='halftime'||cue==='finished'?'ui':'sfx')||!this.unlocked||!this.ctx)return;
  const now=this.ctx.currentTime;
  if(this.last.has(cue)&&now-this.last.get(cue)<(cue==='kick'?.07:.17))return;
  this.last.set(cue,now);
  switch(cue){
   case 'kick':this.tone(230,.11);break;
   case 'save':this.tone(340,.15);this.tone(190,.21,'sfx','triangle',.08);break;
   case 'goal':[523,659,784,1046].forEach((f,i)=>this.tone(f,.27,'sfx','triangle',i*.095));break;
   case 'tackle':this.tone(130,.16,'sfx','sawtooth');break;
   case 'slide':this.tone(110,.08);break;
   case 'stun':this.tone(95,.3,'sfx','sawtooth');break;
   case 'super':[392,587,784].forEach((f,i)=>this.tone(f,.22,'sfx','triangle',i*.065));break;
   case 'halftime':[392,494,587].forEach((f,i)=>this.tone(f,.25,'ui','triangle',i*.12));break;
   case 'finished':[587,494,392].forEach((f,i)=>this.tone(f,.28,'ui','triangle',i*.13));break;
   case 'ui':this.tone(630,.055,'ui');break;
  }
 }
 _release(voice,fade){
  if(!voice)return;
  if(this.interval===voice.interval)this.interval=null;
  if(voice.timer)clearTimeout(voice.timer);
  if(fade&&this.ctx&&this.ctx.state!=='closed'){
   this._gain(voice.bus.gain,0,FADE_SECONDS);
   this.retiring.add(voice);
   voice.timer=setTimeout(()=>{clearInterval(voice.interval);this.retiring.delete(voice);voice.bus.disconnect?.()},(FADE_SECONDS+.07)*1000);
   voice.timer?.unref?.();
  }else{clearInterval(voice.interval);this.retiring.delete(voice);this._gain(voice.bus.gain,0);voice.bus.disconnect?.()}
 }
 sceneChange(scene){
  if(this.scene===scene)return;
  const old=this.scene;this.scene=scene;
  this.stopMusic(old in MUSIC && scene in MUSIC && this._audible('music'));
  if(this.scene!=='match')this.stopAmbience();
  if(this.unlocked&&!this.visibilityPaused&&!this.settings.mute){this.startMusic();if(this.scene==='match')this.startAmbience()}
 }
 startMusic(){
  if(this.voice||!this.unlocked||!this.ctx||!this._audible('music')||!(this.scene in MUSIC)||this.ctx.state==='closed')return;
  const bus=this.ctx.createGain();bus.gain.value=0;bus.connect(this.ctx.destination);
  this._gain(bus.gain,1,FADE_SECONDS);
  const voice={bus,scene:this.scene,interval:null,timer:null,n:0};this.voice=voice;this.noteIndex=0;
  const theme=MUSIC[this.scene];const step=()=>{
   if(this.visibilityPaused||(this.voice!==voice&&!this.retiring.has(voice)))return;
   const n=voice.n++%theme.length;this.noteIndex=voice.n;
   this.tone(theme[n],.19,'music','triangle',0,bus);
   if(n%4===0)this.tone(theme[n]/2,.38,'music','sine',0,bus);
  };
  step();voice.interval=setInterval(step,this.scene==='halftime'?310:230);voice.interval?.unref?.();this.interval=voice.interval;
 }
 stopMusic(fade=false){
  if(this.voice){const old=this.voice;this.voice=null;this._release(old,fade)}
  for(const old of [...this.retiring])if(!fade){this._release(old,false)}
  this.interval=null;
 }
 _updateAmbience(){
  if(!this.ambienceGain||!this.ctx)return;
  const amount=this._audible('ambience')&&this.scene==='match'?.027*(this.settings.master/100)*(this.settings.ambience/100):0;
  this._gain(this.ambienceGain.gain,amount,.15);
 }
 startAmbience(){
  if(!this.unlocked||!this.ctx||this.scene!=='match'||!this._audible('ambience')||this.ctx.state==='closed')return;
  if(this.ambienceNode){this._updateAmbience();return}
  try{
   // Two seconds of seeded soft crowd hiss: no external media, pseudo-random with fixed seed.
   const rate=this.ctx.sampleRate||44100,buffer=this.ctx.createBuffer(1,Math.ceil(rate*2),rate),samples=buffer.getChannelData(0);
   let seed=0x5F3759DF;for(let i=0;i<samples.length;i++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    samples[i]=((seed/4294967296)*2-1)*.65;
   }
   const src=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();
   src.buffer=buffer;src.loop=true;filter.type='lowpass';filter.frequency.value=690;
   gain.gain.value=0;src.connect(filter);filter.connect(gain);gain.connect(this.ctx.destination);
   this.ambienceNode=src;this.ambienceGain=gain;src.start();this._updateAmbience();
  }catch{this.stopAmbience()}
 }
 stopAmbience(){
  const source=this.ambienceNode,gain=this.ambienceGain;this.ambienceNode=null;this.ambienceGain=null;
  try{source?.stop?.()}catch{}try{source?.disconnect?.()}catch{}try{gain?.disconnect?.()}catch{}
 }
 suspend(){
  this.visibilityPaused=true;
  this.stopMusic(false);this.stopAmbience();
  try{this.ctx?.suspend?.()?.catch?.(()=>{})}catch{}
 }
 resume(){
  this.visibilityPaused=false;
  if(!this.unlocked)return;
  try{this.ctx?.resume?.()?.catch?.(()=>{})}catch{}
  this.startMusic();if(this.scene==='match')this.startAmbience();
 }
 dispose(){
  this.stopMusic(false);this.stopAmbience();this.unlocked=false;
  try{this.ctx?.close?.()?.catch?.(()=>{})}catch{}
  this.ctx=null;this.scene='silent';this.last.clear();
 }
}
