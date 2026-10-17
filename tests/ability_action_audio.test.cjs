'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

async function fixture(t){
 const {AUDIO}=await import('../src/modules/audio.js');
 class StubContext{
  constructor(){this.currentTime=12;this.state='running'}
  resume(){this.state='running';return Promise.resolve()}
  close(){this.state='closed';return Promise.resolve()}
 }
 const audio=new AUDIO.ArcadeAudio({},StubContext),notes=[];
 audio.tone=(frequency,duration,kind='sfx',wave='sine',delay=0)=>notes.push({frequency,duration,kind,wave,delay});
 t.after(()=>audio.dispose());
 return {audio,notes};
}
const dash={type:'hyperdash',team:0,player:'Striker'};
const launch={type:'teamLaunch',team:1,player:'Forward',assistant:'Midfield'};

test('hyperdash starts a short original rising acceleration cue after user gesture',async t=>{
 const {audio,notes}=await fixture(t);
 audio.cue(dash);assert.equal(notes.length,0,'autoplay gate');
 assert.equal(audio.unlock(),true);
 audio.cue(dash);
 assert.deepEqual(notes.map(n=>n.frequency),[196,294,392]);
 assert(notes.every(n=>n.kind==='sfx'&&n.wave==='sawtooth'));
 assert(notes[0].delay<notes[1].delay&&notes[1].delay<notes[2].delay);
});
test('cooperative teammate launch has its own distinct higher sound',async t=>{
 const {audio,notes}=await fixture(t);audio.unlock();
 audio.cue(launch);
 assert.deepEqual(notes.map(n=>n.frequency),[392,494,659]);
 assert(notes.every(n=>n.kind==='sfx'&&n.wave==='triangle'));
});
test('only correctly shaped real activation events produce sounds',async t=>{
 const {audio,notes}=await fixture(t);audio.unlock();
 for(const type of ['hyperdash','teamLaunch']){
  for(const event of [type,{type},{type,team:2,player:'One'},
   {type,team:0,player:''},{type,team:0,player:'  '},{type,team:'0',player:'Hero'},
   {type,team:0,player:null}]){
   audio.cue(event);
  }
 }
 assert.deepEqual(notes,[]);
 audio.cue({type:'hyperdash',team:1,player:'Away Defender'});
 assert.equal(notes.length,3,'away-side activation remains allowed');
});
test('per-ability debounce filters repeated events without hiding the other ability',async t=>{
 const {audio,notes}=await fixture(t);audio.unlock();
 audio.cue(dash);audio.cue(dash);assert.equal(notes.length,3);
 audio.cue(launch);assert.equal(notes.length,6);
 audio.cue(launch);assert.equal(notes.length,6);
 audio.ctx.currentTime+=.41;
 audio.cue(dash);assert.equal(notes.length,9);
 audio.cue(launch);assert.equal(notes.length,9,'team launch still within longer throttle');
 audio.ctx.currentTime+=.15;
 audio.cue(launch);assert.equal(notes.length,12);
});
test('mute, effects-only volume, sleep state and disposal silence ability cues',async t=>{
 const {audio,notes}=await fixture(t);
 audio.unlock();audio.configure({mute:true});audio.cue(dash);assert.equal(notes.length,0);
 audio.configure({master:70,ui:80,sfx:0});audio.cue(launch);assert.equal(notes.length,0);
 audio.configure({master:70,sfx:65,ui:0});audio.cue(launch);assert.equal(notes.length,3);
 audio.visibilityPaused=true;audio.ctx.currentTime+=1;audio.cue(dash);assert.equal(notes.length,3);
 audio.dispose();audio.cue(dash);assert.equal(notes.length,3);
});
test('legacy gameplay effects and authoritative match engine/UI event bridge are preserved',async t=>{
 const {audio,notes}=await fixture(t);audio.unlock();
 audio.cue({type:'goal'});assert.deepEqual(notes.splice(0).map(n=>n.frequency),[523,659,784,1046]);
 audio.ctx.currentTime+=.35;audio.cue({type:'penaltyKick',goal:false});
 assert.deepEqual(notes.splice(0).map(n=>n.frequency),[392,294,220]);
 audio.ctx.currentTime+=.35;audio.cue({type:'dribbleTrick',ai:false,success:true});
 assert.deepEqual(notes.splice(0).map(n=>n.frequency),[440,659]);
 const root=path.join(__dirname,'..');
 const engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8');
 const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
 assert.match(engine,/this\.emit\('hyperdash',\{team:p\.t,player:p\.src\.name\}\)/);
 assert.match(engine,/this\.emit\('teamLaunch',\{team:p\.t,player:p\.src\.name,assistant:ally\.src\.name\}\)/);
 assert.match(ui,/game\.onEvent=e=>\{audio\.cue\(e\)/);
});
