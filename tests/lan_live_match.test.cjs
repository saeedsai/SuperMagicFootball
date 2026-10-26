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

test('LAN-054 host publishes paused/finished transitions once without advancing frozen physics',async()=>{
  const {createLanLiveMatch,applyLanGameState}=await load();
  const input=controls(),host=game(input),guest=game(controls());
  let updates=0;
  const original=host.update;
  host.update=function(dt){updates++;return original.call(this,dt);};
  const peer={ready:true,frames:[],stepHostMatchFrame(frame,simulate){
    const state=simulate({buttons:['shoot'],dx:1,dy:0});
    this.frames.push(state);
    return {snapshotSent:true};
  }};
  const run=createLanLiveMatch({peer,role:'host',game:host,input,field});
  assert.equal(run.step(.02),true);
  assert.equal(updates,1);
  host.matchState='paused';
  assert.equal(run.step(.02),true,'host UI pause must reach guest even without physics');
  assert.equal(updates,1,'pause must not advance the game');
  assert.equal(peer.frames[1].tick,1);
  assert.equal(peer.frames[1].meta.phase,'paused');
  applyLanGameState(guest,field,peer.frames[1]);
  assert.equal(guest.matchState,'paused');
  assert.equal(run.step(.02),false,'same paused phase is not resent every RAF');
  host.matchState='play';
  assert.equal(run.step(.02),true);
  assert.equal(updates,2);
  applyLanGameState(guest,field,peer.frames[2]);
  assert.equal(guest.matchState,'play');
  host.matchState='finished';
  assert.equal(run.step(.02),true,'host finish outside physics must be sent');
  assert.equal(updates,2,'finished match remains frozen');
  assert.equal(peer.frames[3].meta.phase,'finished');
  assert.equal(run.step(.02),false);
  run.dispose();
});

test('LAN-054 failed paused snapshot retries without simulating extra physics',async()=>{
  const {createLanLiveMatch}=await load();
  const input=controls(),match=game(input);
  match.matchState='paused';
  let attempts=0;
  const peer={ready:true,stepHostMatchFrame(frame,simulate){
    simulate({buttons:['shoot'],dx:1,dy:0});
    attempts++;
    return {snapshotSent:attempts>1};
  }};
  const run=createLanLiveMatch({peer,role:'host',game:match,input,field});
  assert.equal(run.step(.02),true);
  assert.equal(run.step(.02),true,'failed transport send must not consume phase transition');
  assert.equal(run.step(.02),false,'successful phase send is sent once');
  assert.equal(attempts,2);
  assert.equal(match.clock,0);
  run.dispose();
});


test('LAN-056 guest recovers from an RTC send failure without skipping its input frame',async()=>{
  const {createLanLiveMatch}=await load();
  const input=controls(),match=game(input),sent=[];
  let fail=true;
  const peer={ready:true,
    subscribeGuestMatchState(fn){this.receive=fn;return {dispose(){}};},
    sendGuestInput(frame,buttons,dx,dy){
      sent.push({frame,buttons,dx,dy});
      if(fail){fail=false;throw new Error('LAN channel is not open');}
      return {frame};
    }
  };
  const run=createLanLiveMatch({peer,role:'guest',game:match,input,field});
  peer.receive({tick:20,clockMs:500,scores:{home:0,away:0},
    ball:{x:0,y:0,z:0},players:[]});
  assert.equal(run.step(.016),false,'failed RTC send must not crash the match loop');
  assert.equal(run.step(.016),true,'a subsequent ready channel retries the unsent input');
  assert.deepEqual(sent.slice(0,2).map(item=>item.frame),[24,24],
    'failed frame is not consumed or skipped');
  assert.deepEqual(sent[0].buttons,['pass']);
  assert.deepEqual([sent[1].dx,sent[1].dy],[1,0]);
  assert.equal(run.step(.016),true);
  assert.equal(sent[2].frame,25,'the next successful frame advances exactly once');
  peer.ready=false;
  assert.equal(run.step(.016),false,'disconnected channel never sends another frame');
  assert.equal(sent.length,3);
  run.dispose();
});


test('LAN-057 guest suppresses controls during host pause and finish, then resumes on host play',async()=>{
  const {createLanLiveMatch,captureLanGameState}=await load();
  const input=controls(),guest=game(input),host=game(controls()),sent=[];
  const peer={ready:true,
    subscribeGuestMatchState(fn){this.receive=fn;return {dispose(){}};},
    sendGuestInput(frame,buttons,dx,dy){sent.push({frame,buttons,dx,dy});return {frame};}
  };
  const run=createLanLiveMatch({peer,role:'guest',game:guest,input,field});
  const receive=(tick,phase)=>{
    host.matchState=phase;
    peer.receive(captureLanGameState(host,field,tick));
    assert.equal(guest.matchState,phase);
  };
  receive(20,'play');
  assert.equal(run.step(.016),true);
  assert.deepEqual(sent.map(p=>p.frame),[24]);
  receive(21,'paused');
  assert.equal(run.step(.016),false,'pause must not queue guest controls');
  receive(22,'finished');
  assert.equal(run.step(.016),false,'finish must not queue guest controls');
  assert.deepEqual(sent.map(p=>p.frame),[24]);
  receive(23,'play');
  assert.equal(run.step(.016),true,'only a host play snapshot resumes input');
  assert.deepEqual(sent.map(p=>p.frame),[24,27]);
  assert.deepEqual(sent[1].buttons,['pass']);
  run.dispose();
});


test('LAN-058 ignores delayed and duplicate snapshots without rewinding phase, score or input',async()=>{
 const {createLanLiveMatch,captureLanGameState}=await load();
 const input=controls(),host=game(controls()),guest=game(input),sent=[];
 const peer={ready:true,subscribeGuestMatchState(fn){this.receive=fn;return {dispose(){}};},
  sendGuestInput(frame,buttons,dx,dy){sent.push({frame,buttons,dx,dy});}};
 const run=createLanLiveMatch({peer,role:'guest',game:guest,input,field});
 const receive=(tick,phase,score)=>{host.matchState=phase;host.score=[score,0];peer.receive(captureLanGameState(host,field,tick));};
 receive(20,'play',0);
 assert.equal(run.step(.016),true);assert.equal(sent[0].frame,24);
 receive(21,'paused',1);assert.equal(run.step(.016),false);
 receive(20,'play',9);receive(21,'play',8);
 assert.equal(guest.matchState,'paused');assert.deepEqual(guest.score,[1,0]);
 assert.equal(run.latestTick,21);assert.equal(run.step(.016),false);
 receive(22,'play',2);
 assert.equal(guest.matchState,'play');assert.deepEqual(guest.score,[2,0]);
 assert.equal(run.step(.016),true);assert.deepEqual(sent.map(item=>item.frame),[24,26]);
 receive(21,'finished',7);
 assert.equal(guest.matchState,'play');assert.deepEqual(guest.score,[2,0]);assert.equal(run.latestTick,22);
 run.dispose();receive(23,'finished',3);
 assert.equal(guest.matchState,'play','disposed observer cannot mutate game');
});

test('LAN-059 guest restores jump pose, transformed Super Shot and effect cleanup',async()=>{
 const {captureLanGameState,applyLanGameState}=await load();
 const host=game(controls()),guest=game(controls());
 Object.assign(host.players[1],{z:192,face:-1,action:'doubleJump',actionTimer:.42,anim:2.5});
 host.ball.shot={id:'nuts',color:'#ffc15f',trail:'#ed763c'};
 host.ball.age=.2;host.ball.vx=950;host.ball.vy=-90;
 applyLanGameState(guest,field,captureLanGameState(host,field,100));
 assert.equal(guest.players[1].action,'doubleJump');
 assert.equal(guest.players[1].z,192);assert.equal(guest.players[1].actionTimer,.42);
 assert.equal(guest.ball.shot.id,'nuts');assert.equal(guest.ball.shot.color,'#ffc15f');
 host.players[1].action='super';host.players[1].z=0;host.ball.x+=30;host.ball.age=.3;
 applyLanGameState(guest,field,captureLanGameState(host,field,101));
 assert.equal(guest.players[1].action,'super');assert.equal(guest.players[1].z,0);
 assert.ok(guest.ball.trail.length>=2);
 host.ball.shot=null;applyLanGameState(guest,field,captureLanGameState(host,field,102));
 assert.equal(guest.ball.shot,null);assert.deepEqual(guest.ball.trail,[]);
});

test('LAN-060 guest mirrors host Banana Peel and Ice Patch countdowns and clears disarmed traps',async()=>{
 const {captureLanGameState,applyLanGameState}=await load();
 const host=game(controls()),guest=game(controls());
 host.magicHazards=[
  {kind:'banana',team:0,x:340,y:180,life:2.5,arm:.15},
  {kind:'ice',team:1,x:690,y:320,life:1.2,arm:0}
 ];
 const first=captureLanGameState(host,field,40);
 assert.equal(first.hazards.length,2);
 applyLanGameState(guest,field,first);
 assert.deepEqual(guest.magicHazards,host.magicHazards,
   'guest receives the exact drawable trap kind, team, position and countdown');
 host.magicHazards=[{...host.magicHazards[1],life:.8}];
 applyLanGameState(guest,field,captureLanGameState(host,field,41));
 assert.equal(guest.magicHazards.length,1,'disarmed banana disappears');
 assert.equal(guest.magicHazards[0].life,.8);
 host.magicHazards=[];
 applyLanGameState(guest,field,captureLanGameState(host,field,42));
 assert.deepEqual(guest.magicHazards,[],'expired ice disappears');
 applyLanGameState(guest,field,{...first,hazards:undefined});
 assert.deepEqual(guest.magicHazards,[],'legacy snapshots never invent traps');
});

test('LAN-060 maximal roster and trap snapshots fit bounded wire budget',async()=>{
 const {captureLanGameState}=await load();
 const {encodeLanSnapshot,MAX_SNAPSHOT_BYTES}=await import('../src/modules/lan-state-snapshot.js');
 const host=game(controls());
 host.players=Array.from({length:22},(_,slot)=>({
  t:Math.floor(slot/11),i:slot%11,
  x:100.00000000000001,y:449.99999999999994,z:399.99999999999994,
  face:-1,action:'doubleJumpSuperBicycle',actionTimer:9.99999999999999,
  anim:35999.9999999999,stun:9.9999999999999,
  slideTimer:9.9999999999999,diveElapsed:9.9999999999999
 }));
 host.magicHazards=Array.from({length:24},(_,i)=>({
  kind:i%2?'banana':'ice',team:i%2,
  x:100.00000000000001,y:449.99999999999994,
  life:2.99999999999999,arm:.299999999999999
 }));
 const state=captureLanGameState(host,field,100);
 const wire=encodeLanSnapshot({type:'snapshot',version:1,
  roomId:'room001',hostId:'host001',...state});
 assert.ok(Buffer.byteLength(wire)<=MAX_SNAPSHOT_BYTES,
  'full player pose plus maximum traps must not overflow RTC snapshot codec');
});
