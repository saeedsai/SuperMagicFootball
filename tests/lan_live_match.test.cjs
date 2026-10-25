'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=()=>import('../src/modules/lan-live-match.js');
const field={x:100,y:50,w:800,h:400};
function game(input){
  return {matchState:'play',clock:0,half:1,controlled:[3,3],score:[0,0],
    players:[{t:0,i:0,x:300,y:100,face:1,anim:0},
             {t:1,i:0,x:700,y:350,face:-1,anim:0}],
    ball:{x:500,y:250,z:0,owner:null},
    update(dt){input.poll(true);this.clock+=dt;this.players[1].x+=(input.state[1].x||0)*80*dt;}
  };
}
function controls(){
  return {state:[{x:1,y:0,pass:1,shoot:0,dribble:0,jump:0},{},{},{}],
    pressed:[{pass:true},{},{},{}],releases:[{},{},{},{}],
    prev:[{},{},{},{}],tapDurations:[{},{},{},{}],
    poll(){this.state[0]={x:1,y:0,pass:1,shoot:0,dribble:0,jump:0};this.pressed[0]={pass:true};},
    held(slot,action){return !!this.state[slot]?.[action]},
    just(slot,action){return !!this.pressed[slot]?.[action]}
  };
}
test('LAN-044 live state converts real engine coordinates and restores them',async()=>{
  const {captureLanGameState,applyLanGameState}=await load();
  const input=controls(),host=game(input),guest=game(input);
  host.clock=15.75;host.score=[2,1];host.ball.z=50;
  const state=captureLanGameState(host,field,7);
  assert.equal(state.players.length,2);
  assert.deepEqual(state.players.map(p=>p.slot),[0,11]);
  assert.equal(state.ball.z,.25);
  assert.equal(state.clockMs,15750);
  assert.equal(state.meta.half,1);
  assert.equal(state.meta.ballOwnerSlot,-1);
  applyLanGameState(guest,field,state);
  assert.deepEqual(guest.score,[2,1]);
  assert.equal(guest.ball.z,50);
  assert.equal(guest.clock,15.75);
  assert.deepEqual(guest.controlled,[3,3]);
  assert.equal(guest.players[1].x,host.players[1].x);
  assert.throws(()=>captureLanGameState(host,{x:0,y:0,w:0,h:1},0),/field/);
});
test('LAN-044 host simulates only through authoritative peer and remote 4-button input',async()=>{
  const {createLanLiveMatch}=await load();
  const input=controls(),match=game(input),oldPoll=input.poll;
  const peer={ready:true,
    inputs:new Map([[0,{buttons:['shoot','pass'],dx:-1,dy:1}]]),
    stepHostMatchFrame(frame,simulate){
      const state=simulate(this.inputs.get(frame)??{buttons:[],dx:0,dy:0});
      this.frames??=[];this.frames.push({frame,state});return {frame};
    }
  };
  const run=createLanLiveMatch({peer,role:'host',game:match,input,field});
  assert.equal(run.step(.02),true);
  assert.equal(peer.frames[0].frame,0);
  assert.equal(peer.frames[0].state.tick,0);
  assert.equal(input.state[1].shoot,1);
  assert.equal(input.pressed[1].shoot,true);
  assert.ok(Math.abs(input.state[1].x+Math.SQRT1_2)<1e-12);
  assert.ok(Math.abs(input.state[1].y-Math.SQRT1_2)<1e-12);
  assert.ok(Math.abs(Math.hypot(input.state[1].x,input.state[1].y)-1)<1e-12);
  assert.equal(match.players[1].x<700,true);
  assert.equal(run.step(.02),true);
  assert.equal(input.pressed[1].shoot,false,'missing frame never replays old press');
  assert.equal(input.state[1].shoot,0,'missing frame releases a held network action');
  assert.equal(input.releases[1].shoot,true);
  assert.deepEqual([input.state[1].x,input.state[1].y],[0,0]);
  peer.inputs.set(2,{buttons:['dribble'],dx:1,dy:0});
  assert.equal(run.step(.02),true);
  assert.equal(input.state[1].dribble,1,'later input applies only at its own frame');
  assert.equal(input.pressed[1].dribble,true);
  assert.equal(run.latestTick,2);
  run.dispose();
  assert.equal(input.poll,oldPoll,'offline input polling is restored');
});
test('LAN-044 guest applies authorized snapshots and sends bounded four-button input',async()=>{
  const {createLanLiveMatch}=await load();
  const input=controls(),match=game(input);
  let observe=null,receivedDisposed=false;
  const peer={ready:true,
    subscribeGuestMatchState(fn){observe=fn;return {dispose(){receivedDisposed=true;}};},
    sendGuestInput(frame,buttons,dx,dy){this.last={frame,buttons,dx,dy};return this.last;}
  };
  const run=createLanLiveMatch({peer,role:'guest',game:match,input,field});
  assert.equal(run.step(.016),false,'guest waits for authoritative initial frame');
  observe({tick:10,clockMs:1000,scores:{home:1,away:0},
    ball:{x:0,y:0,z:0},players:[{slot:11,x:.25,y:0}]});
  assert.equal(run.step(.016),true);
  assert.equal(peer.last.frame,14);
  assert.deepEqual(peer.last.buttons,['pass']);
  assert.deepEqual([peer.last.dx,peer.last.dy],[1,0]);
  assert.equal(match.score[0],1);
  assert.equal(match.players[1].x,600);
  assert.equal(run.latestTick,10);
  run.dispose();
  assert.equal(receivedDisposed,true);
  assert.equal(run.step(.016),false);
});

test('LAN-047 authoritative metadata updates half, selection, possession and finish',async()=>{
  const {captureLanGameState,applyLanGameState}=await load();
  const host=game(controls()),guest=game(controls());
  host.half=2;host.matchState='finished';host.controlled=[4,2];
  host.ball.owner=host.players[1];
  const state=captureLanGameState(host,field,27);
  assert.deepEqual(state.meta,{half:2,phase:'finished',
    controlled:{home:4,away:2},ballOwnerSlot:11});
  applyLanGameState(guest,field,state);
  assert.equal(guest.half,2);
  assert.equal(guest.matchState,'finished');
  assert.deepEqual(guest.controlled,[4,2]);
  assert.equal(guest.ball.owner,guest.players[1]);
});

test('LAN-048 guest obeys host pause, resume and finish snapshots',async()=>{
  const {captureLanGameState,applyLanGameState}=await load();
  const input=controls(),host=game(input),guest=game(input);
  host.half=2;host.matchState='paused';host.controlled=[2,4];
  host.ball.owner=host.players[1];
  let state=captureLanGameState(host,field,10);
  applyLanGameState(guest,field,state);
  assert.equal(guest.matchState,'paused');
  assert.equal(guest.half,2);
  assert.deepEqual(guest.controlled,[2,4]);
  assert.equal(guest.ball.owner,guest.players[1]);
  host.matchState='play';host.ball.owner=null;
  applyLanGameState(guest,field,captureLanGameState(host,field,11));
  assert.equal(guest.matchState,'play');
  assert.equal(guest.ball.owner,null);
  host.matchState='finished';
  applyLanGameState(guest,field,captureLanGameState(host,field,12));
  assert.equal(guest.matchState,'finished');
});

test('LAN-053 guest sends proportional analog tilt without losing digital directions',async()=>{
  const {createLanLiveMatch}=await load();
  const input=controls(),match=game(input);
  input.poll=()=>{};
  input.state[0]={x:0.25,y:-0.5,pass:1,shoot:0,dribble:0,jump:0};
  const peer={ready:true,
    subscribeGuestMatchState(fn){this.observe=fn;return {dispose(){}};},
    sendGuestInput(frame,buttons,dx,dy){this.sent={frame,buttons,dx,dy};}
  };
  const run=createLanLiveMatch({peer,role:'guest',game:match,input,field});
  peer.observe({tick:10,clockMs:1000,scores:{home:0,away:0},
    ball:{x:0,y:0,z:0},players:[]});
  assert.equal(run.step(.016),true);
  assert.deepEqual([peer.sent.dx,peer.sent.dy],[0.25,-0.5],
    'partial gamepad tilt must not become full-speed digital input');
  assert.deepEqual(peer.sent.buttons,['pass']);
  input.state[0].x=Infinity;input.state[0].y=-4;
  assert.equal(run.step(.016),true);
  assert.deepEqual([peer.sent.dx,peer.sent.dy],[0,-1],
    'malformed or over-range device values are bounded before sending');
  input.state[0].x=1;input.state[0].y=0;
  assert.equal(run.step(.016),true);
  assert.deepEqual([peer.sent.dx,peer.sent.dy],[1,0],
    'keyboard full-strength direction is unchanged');
  run.dispose();
});
