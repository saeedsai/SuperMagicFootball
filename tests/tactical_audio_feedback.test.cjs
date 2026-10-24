'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');

async function fixture(t){
 const {AUDIO}=await import('../src/modules/audio.js');
 class FakeCtx{constructor(){this.currentTime=5;this.state='running'}resume(){return Promise.resolve()}close(){this.state='closed';return Promise.resolve()}}
 const a=new AUDIO.ArcadeAudio({},FakeCtx),notes=[];
 a.tone=(frequency,duration,kind='sfx')=>notes.push({frequency,kind});
 t.after(()=>a.dispose());return {a,notes};
}
test('real substitutions play a distinct two-note confirmation on the UI fader',async t=>{
 const {a,notes}=await fixture(t);
 assert.equal(a.unlock(),true);
 a.cue({type:'substitution',team:0,count:1,used:1,max:3});
 assert.deepEqual(notes.map(n=>n.frequency),[330,494]);
 assert(notes.every(n=>n.kind==='ui'));
});
test('zero-count tactical edits and malformed substitutions are always silent',async t=>{
 const {a,notes}=await fixture(t);a.unlock();
 for(const count of [0,-1,1.5,Infinity,NaN,'2',13,undefined]){
  a.cue({type:'substitution',team:0,count});
 }
 a.cue('substitution');
 assert.deepEqual(notes,[]);
 a.cue({type:'substitution',count:2});
 assert.deepEqual(notes.map(n=>n.frequency),[330,494]);
});
test('positive, backfired and tied coaching feedback have three distinct melodies',async t=>{
 const {a,notes}=await fixture(t);a.unlock();
 a.cue({type:'teamTalk',team:0,positive:6,backfires:1,choice:'motivate'});
 assert.deepEqual(notes.splice(0).map(n=>n.frequency),[440,554,659]);
 a.ctx.currentTime+=.25;
 a.cue({type:'teamTalk',team:0,positive:1,backfires:5});
 assert.deepEqual(notes.splice(0).map(n=>n.frequency),[294,220]);
 a.ctx.currentTime+=.25;
 a.cue({type:'teamTalk',team:1,positive:2,backfires:2});
 assert.deepEqual(notes.map(n=>n.frequency),[392]);
 assert(notes.every(n=>n.kind==='ui'));
});
test('invalid coaching payloads make no new tone and do not consume debounce',async t=>{
 const {a,notes}=await fixture(t);a.unlock();
 for(const v of [{positive:1,backfires:-1},{positive:Infinity,backfires:0},
  {positive:'5',backfires:0},{positive:13,backfires:1},{positive:1},
  {backfires:1},{positive:1.5,backfires:0}]){
  a.cue({type:'teamTalk',...v});
 }
 a.cue('teamTalk');
 assert.deepEqual(notes,[]);
 a.cue({type:'teamTalk',positive:3,backfires:0});
 assert.deepEqual(notes.map(n=>n.frequency),[440,554,659]);
});
test('mute, silence, visibility and actual repeated-event debounce remain enforced',async t=>{
 const {a,notes}=await fixture(t);
 a.cue({type:'substitution',count:1});assert.equal(notes.length,0);
 a.unlock();a.configure({mute:true});
 a.cue({type:'substitution',count:1});assert.equal(notes.length,0);
 a.configure({master:100,ui:0,sfx:50});
 a.cue({type:'teamTalk',positive:2,backfires:0});assert.equal(notes.length,0);
 a.configure({master:100,ui:80,sfx:0});
 a.cue({type:'teamTalk',positive:2,backfires:0});
 a.cue({type:'teamTalk',positive:2,backfires:0});
 assert.equal(notes.length,3);
 a.ctx.currentTime+=.2;a.cue({type:'teamTalk',positive:2,backfires:0});
 assert.equal(notes.length,6);
 a.visibilityPaused=true;a.ctx.currentTime+=1;a.cue({type:'substitution',count:1});
 assert.equal(notes.length,6);
});
test('existing gameplay sound events and engine-to-audio bridge are preserved',async t=>{
 const {a,notes}=await fixture(t);a.unlock();
 a.cue({type:'goal'});assert.deepEqual(notes.splice(0).map(n=>n.frequency),[523,659,784,1046]);
 a.ctx.currentTime+=.3;
 a.cue({type:'penaltyKick',goal:false});assert.deepEqual(notes.splice(0).map(n=>n.frequency),[392,294,220]);
 a.ctx.currentTime+=.3;
 a.cue({type:'passReceived',friendly:false,accurate:false});
 assert(notes.length>0,'existing pass-interception audio intact');
 const engine=readFileSync(join(__dirname,'../src/modules/engine.js'),'utf8');
 const ui=readFileSync(join(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(engine,/this\.emit\('teamTalk',\{team,choice,phase,backfires,positive,morale:/);
 assert.match(engine,/if\(changes\.out\.length>0\)this\.emit\('substitution'/);
 assert.match(ui,/game\.onEvent=e=>\{[\s\S]{0,700}audio\.cue\(e\)/);
});
