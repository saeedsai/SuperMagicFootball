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
 assert.equal(writeAttempts,1,'matching ACK makes one automatic host write attempt');
 assert.equal(run.resultAckStatus,'pending','ACK alone is not reported as settled');
 ackListener({type:'result-ack',receiptId});
 assert.equal(writeAttempts,1,'duplicate ACK cannot add another automatic write attempt');
 timers.run();
 assert.equal(writeAttempts,2,'the existing timeout supplies exactly one bounded fallback attempt');
 assert.equal(run.resultAckStatus,'failed','exhausted storage attempts are visible as recoverable failure');
 assert.equal(receipts.size,0);assert.equal(tokens,0);
 assert.equal(run.retryResultAward(),true,'one explicit recovery activation retries the captured final receipt');
 assert.equal(writeAttempts,3);assert.equal(run.resultAckStatus,'confirmed');
 assert.equal(receipts.size,1);assert.equal(tokens,30);
 assert.equal(run.retryResultAward(),false,'a saved receipt cannot be awarded a second time');
 ackListener({type:'result-ack',receiptId});
 assert.equal(writeAttempts,3);assert.equal(receipts.size,1);assert.equal(tokens,30);
 run.dispose();assert.equal(run.disposed,true);
});
