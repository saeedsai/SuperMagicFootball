import assert from 'node:assert/strict';
import {ArcadeAudio,sanitizeAudioOptions} from '../src/audio.js';
import {readFileSync} from 'node:fs';
let stats={osc:0,oscStopped:0,crowds:0,crowdsStopped:0,disconnected:0,resumes:0,suspends:0,closes:0};
class Param{constructor(value=0){this.value=value;this.ramps=[]}cancelScheduledValues(){}setValueAtTime(v){this.value=v}linearRampToValueAtTime(v,t){this.value=v;this.ramps.push([v,t])}exponentialRampToValueAtTime(v){this.value=v}}
class Conn{connect(){return this}disconnect(){stats.disconnected++}}
class Gain extends Conn{constructor(){super();this.gain=new Param()}}
class Osc extends Conn{constructor(){super();this.frequency=new Param();this.type='sine'}start(){stats.osc++}stop(){stats.oscStopped++}}
class Source extends Conn{start(){stats.crowds++}stop(){stats.crowdsStopped++}}
class Filter extends Conn{constructor(){super();this.frequency=new Param();this.type='lowpass'}}
class Ctx{
 constructor(){this.state='suspended';this.currentTime=1;this.destination={};this.sampleRate=8000}
 resume(){stats.resumes++;this.state='running';return Promise.resolve()}
 suspend(){stats.suspends++;this.state='suspended';return Promise.resolve()}
 close(){stats.closes++;this.state='closed';return Promise.resolve()}
 createOscillator(){return new Osc()}
 createGain(){return new Gain()}
 createBuffer(channels,length,rate){assert.equal(channels,1);assert.equal(rate,8000);return {getChannelData:()=>new Float32Array(length)}}
 createBufferSource(){return new Source()}
 createBiquadFilter(){return new Filter()}
}
assert.equal(sanitizeAudioOptions({mute:'false',master:'bad'}).mute,false,'literal false must not become true');
assert.equal(sanitizeAudioOptions({mute:'true',music:NaN}).mute,true);
assert.equal(sanitizeAudioOptions({master:'bad'}).master,70,'invalid setting recovers to default');
assert.equal(sanitizeAudioOptions({music:150,ambience:-10}).music,100);
const audio=new ArcadeAudio({},Ctx);
audio.sceneChange('menu');assert.equal(audio.ctx,null,'No AudioContext before a gesture');
audio.cue('goal');assert.equal(stats.osc,0,'No implicit autoplay');
assert(audio.unlock());assert.equal(audio.ctx.state,'running');assert(audio.voice,'Menu audio on unlock');
const menuVoice=audio.voice;assert(stats.osc>0);
audio.sceneChange('halftime');assert(audio.voice&&audio.voice!==menuVoice);assert.equal(audio.retiring.size,1,'crossfade retains outgoing music voice');
assert(menuVoice.bus.gain.ramps.some(([v])=>v===0),'old song must fade to silence');
assert(audio.voice.bus.gain.ramps.some(([v])=>v===1),'incoming song must fade in');
const beforeOverlap=stats.osc;await new Promise(resolve=>setTimeout(resolve,340));
assert(stats.osc>=beforeOverlap+2,'two themes continue scheduling notes during crossfade');
audio.sceneChange('match');assert.equal(audio.voice,null);assert(audio.ambienceNode,'Match crowd starts');
assert.equal(stats.crowds,1,'One looping crowd only');
audio.startAmbience();assert.equal(stats.crowds,1,'No overlapping crowd loops');
const g=audio.ambienceGain;audio.configure({...audio.settings,ambience:80});assert(g.gain.value>0);
audio.configure({...audio.settings,mute:true});assert.equal(audio.ambienceNode,null,'mute stops crowd source');assert.equal(audio.voice,null);
audio.configure({...audio.settings,mute:false});assert(audio.ambienceNode,'unmuting restarts crowd');
audio.suspend();assert.equal(audio.ambienceNode,null);assert.equal(audio.voice,null);
audio.resume();assert(audio.ambienceNode,'resume restores crowd');
audio.sceneChange('menu');assert.equal(audio.ambienceNode,null);assert(audio.voice);
const soundCount=stats.osc;audio.configure({...audio.settings,sfx:0});audio.cue('kick');assert.equal(stats.osc,soundCount,'sfx zero prevents kicks');
audio.configure({...audio.settings,music:0});assert.equal(audio.voice,null,'music zero stops scene timer');
audio.configure({...audio.settings,music:60});assert(audio.voice,'music resumes with slider');
audio.dispose();assert.equal(audio.ctx,null);assert.equal(audio.interval,null);assert.equal(audio.retiring.size,0);assert.equal(stats.crowds,stats.crowdsStopped,'crowd sources cleaned up');
const main=readFileSync(new URL('../src/modules/ui.js',import.meta.url),'utf8');
assert(main.includes("opt.sfx=!audio.settings.mute"),'SFX option must follow explicit master mute in current UI module');
assert(main.includes("document.addEventListener('touchstart'"),'touch gesture unlock exists');
assert(main.includes("window.addEventListener('pagehide'"),'page lifecycle pause exists');
console.log('PASS v0.8.23.2 audio reliability: no autoplay, scene music crossfade, crowd volume and loop, mute/unmute, suspend/resume, cleanup, preference sanitation and touch lifecycle');
