'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

const field={x:100,y:50,w:800,h:400};
function input(){return {state:[{x:0,y:0,pass:0,shoot:0,dribble:0,jump:0},{},{},{}],
 pressed:[{},{},{},{}],releases:[{},{},{},{}],prev:[{},{},{},{}],tapDurations:[{},{},{},{}],
 poll(){},held(){return false;},just(){return false;}};}
function game(controls){return {matchState:'play',clock:0,half:1,controlled:[3,3],score:[0,0],players:[],
 ball:{x:500,y:250,z:0,owner:null},update(dt){controls.poll(true);this.clock+=dt;}};}
function fakeTimers(){
 const timers=[];
 return {timers,setTimer(fn,delay){const timer={fn,delay,cleared:false};timers.push(timer);return timer;},
  clearTimer(timer){if(timer)timer.cleared=true;},run(timer=timers[0]){assert.ok(timer);if(!timer.cleared){timer.cleared=true;timer.fn();}}};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));

test('LAN host can manually recover an exhausted result receipt save exactly once',async()=>{
 const {createLanLiveMatch}=await import('../src/modules/lan-live-match.js');
 const identity={roomId:'room001',hostId:'host001'},timers=fakeTimers();
 let ackListener=null,matchId=null,automaticWriteFailures=2,writeAttempts=0,tokens=0;
 const receipts=new Set(),controls=input(),match=game(controls);match.onEvent=()=>{};
 const peer={ready:true,snapshotIdentity:identity,
  subscribeHostResultAck(fn){ackListener=fn;return ()=>{ackListener=null;};},
  stepHostMatchFrame(frame,simulate){const state=simulate({buttons:[],dx:0,dy:0},{received:true});
   matchId=state.meta.matchId;return {snapshotSent:true};}};
 const run=createLanLiveMatch({peer,role:'host',game:match,input:controls,field,
  setTimer:timers.setTimer,clearTimer:timers.clearTimer,
  awardResult:receipt=>{
   writeAttempts++;
   if(automaticWriteFailures>0){automaticWriteFailures--;return false;}
   if(receipts.has(receipt.receiptId))return {ok:false,duplicate:true};
   receipts.add(receipt.receiptId);tokens+=30;return {ok:true};
  }});
 match.update=function(){this.score=[1,0];this.matchState='finished';this.onEvent({type:'finished',score:[1,0]});};
 assert.equal(run.step(.02),true);
 const receiptId=`lan:${identity.roomId}:${identity.hostId}:${matchId}`;
 ackListener({type:'result-ack',receiptId});
 await settle();
 assert.equal(writeAttempts,1,'matching ACK makes one automatic host write attempt');
 assert.equal(run.resultAckStatus,'pending','ACK alone is not reported as settled');
 ackListener({type:'result-ack',receiptId});
 assert.equal(writeAttempts,1,'duplicate ACK cannot add another automatic write attempt');
 timers.run();
 await settle();
 assert.equal(writeAttempts,2,'the existing timeout supplies exactly one bounded fallback attempt');
 assert.equal(run.resultAckStatus,'failed','exhausted storage attempts are visible as recoverable failure');
 assert.equal(receipts.size,0);assert.equal(tokens,0);
 assert.equal(await run.retryResultAward(),true,'one explicit recovery activation retries the captured final receipt');
 assert.equal(writeAttempts,3);assert.equal(run.resultAckStatus,'confirmed');
 assert.equal(receipts.size,1);assert.equal(tokens,30);
 assert.equal(await run.retryResultAward(),false,'a saved receipt cannot be awarded a second time');
 ackListener({type:'result-ack',receiptId});
 assert.equal(writeAttempts,3);assert.equal(receipts.size,1);assert.equal(tokens,30);
 run.dispose();assert.equal(run.disposed,true);
});

test('LAN host same-tab receipt recovery survives reload and retries the same idempotent award',async()=>{
 const {createLanLiveMatch,readLanHostResultRecovery,retryLanHostResultRecovery}=await import('../src/modules/lan-live-match.js');
 const identity={roomId:'room002',hostId:'host002'},timers=fakeTimers(),session=new Map();
 const recoveryStorage={getItem:key=>session.get(key)??null,setItem:(key,value)=>session.set(key,value),removeItem:key=>session.delete(key)};
 let ackListener=null,matchId=null,automaticWriteFailures=2,walletWrites=0,tokens=0;
 const receipts=new Set(),controls=input(),match=game(controls);match.onEvent=()=>{};
 const peer={ready:true,snapshotIdentity:identity,subscribeHostResultAck(fn){ackListener=fn;return ()=>{};},
  stepHostMatchFrame(frame,simulate){const state=simulate({buttons:[],dx:0,dy:0},{received:true});matchId=state.meta.matchId;return {snapshotSent:true};}};
 const awardResult=receipt=>{
  walletWrites++;
  if(automaticWriteFailures-->0)return false;
  if(receipts.has(receipt.receiptId))return {ok:false,duplicate:true};
  receipts.add(receipt.receiptId);tokens+=receipt.result==='win'?30:receipt.result==='draw'?25:20;return {ok:true};
 };
 const run=createLanLiveMatch({peer,role:'host',game:match,input:controls,field,recoveryStorage,
  setTimer:timers.setTimer,clearTimer:timers.clearTimer,awardResult});
 match.update=function(){this.score=[1,0];this.matchState='finished';this.onEvent({type:'finished',score:[1,0]});};
 run.step(.02);const receiptId=`lan:${identity.roomId}:${identity.hostId}:${matchId}`;
 ackListener({type:'result-ack',receiptId});timers.run();await settle();
 const pending=readLanHostResultRecovery(recoveryStorage);
 assert.deepEqual(pending,{receiptId,amount:30,role:'host'});
 run.dispose(); // page is reloaded; no live match/result object remains
 automaticWriteFailures=0; // the wallet storage is available again after reload
 assert.equal(await retryLanHostResultRecovery({storage:recoveryStorage,awardResult:()=>{walletWrites++;return false;}}),false);
 assert.deepEqual(readLanHostResultRecovery(recoveryStorage),pending,'failed storage retry must retain the recovery record');
 assert.equal(await retryLanHostResultRecovery({storage:recoveryStorage,awardResult}),true);
 assert.equal(walletWrites>=2,true);assert.equal(tokens,30);assert.equal(receipts.size,1);
 assert.equal(readLanHostResultRecovery(recoveryStorage),null,'recovery metadata clears after the durable receipt write');
 const writesAfterDurableAward=walletWrites;
 assert.equal(await retryLanHostResultRecovery({storage:recoveryStorage,awardResult}),false);
 assert.equal(walletWrites,writesAfterDurableAward);assert.equal(tokens,30);
});

test('LAN recovery storage denial fails closed without breaking app startup or the wallet award',async()=>{
 const {readLanHostResultRecovery,retryLanHostResultRecovery}=await import('../src/modules/lan-live-match.js');
 const prior=Object.getOwnPropertyDescriptor(globalThis,'sessionStorage');
 Object.defineProperty(globalThis,'sessionStorage',{configurable:true,get(){throw new DOMException('storage denied','SecurityError');}});
 try{
  assert.doesNotThrow(()=>readLanHostResultRecovery());
  assert.equal(readLanHostResultRecovery(),null);
  let writes=0;
  assert.equal(await retryLanHostResultRecovery({awardResult(){writes++;return {ok:true};}}),false);
  assert.equal(writes,0);
 }finally{
  if(prior)Object.defineProperty(globalThis,'sessionStorage',prior);
  else delete globalThis.sessionStorage;
 }
});
