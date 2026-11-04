'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const field={x:100,y:50,w:800,h:400};

function game(){
 const player=(t,i,x,y)=>({t,i,x,y,face:t===0?1:-1,anim:0,stun:0,
  z:0,action:'idle',actionTimer:0,slideTimer:0,diveElapsed:0,diveDy:0,
  shotImpactConfusedTimer:0});
 return {clock:5,half:1,score:[0,0],controlled:[3,3],matchState:'play',
  players:[player(0,0,300,100),player(1,0,700,350)],ball:{x:500,y:250,z:0,owner:null},
  magicHazards:[]};
}

test('LAN guest mirrors the authoritative stun cue and clears it on recovery',async()=>{
 const {captureLanGameState,applyLanGameState}=await import('../src/modules/lan-live-match.js');
 const host=game(),guest=game(),target=host.players[1],remote=guest.players[1];
 target.stun=1.25;target.action='hurt';target.actionTimer=1.25;
 const stunned=captureLanGameState(host,field,1);
 applyLanGameState(guest,field,stunned);
 assert.equal(remote.stun,1.25,'remote gameplay visual follows host stun');
 assert.equal(remote.shotImpactConfusedTimer,1.25,
  'renderer receives the confusion timer used for comic eyes and birds');

 target.stun=0;target.action='idle';target.actionTimer=0;
 applyLanGameState(guest,field,captureLanGameState(host,field,2));
 assert.equal(remote.shotImpactConfusedTimer,0,'authoritative recovery clears the cue');

 remote.shotImpactConfusedTimer=.8;
 const legacy={...stunned,players:stunned.players.map(({slot,x,y})=>({slot,x,y}))};
 applyLanGameState(guest,field,legacy);
 assert.equal(remote.shotImpactConfusedTimer,0,
  'legacy position-only state cannot leave a stale reaction on screen');
});
