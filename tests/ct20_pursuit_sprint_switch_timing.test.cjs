const {test}=require('node:test');
const assert=require('node:assert/strict');

let GameEngine,DEFAULT_OPTIONS;
test.before(async()=>{
  ({GameEngine}=await import('../src/engine.js'));
  ({DEFAULT_OPTIONS}=await import('../src/data.js'));
});

function inputStub(){
  return {
    state:[{},{}],edges:[{},{}],ups:[{},{}],
    poll(){},
    just(team,action){return !!this.edges[team]?.[action]},
    held(team,action){return !!this.state[team]?.[action]},
    released(team,action){return !!this.ups[team]?.[action]},
    tapDuration(){return 0;},canceled(){return false;},
  };
}

function makeGame({team=0,ownerTeam=1}={}){
  const input=inputStub();
  const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
  game.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
  game.humans=2;
  game.driveAI=()=>{};
  game.coordinateAiCombos=()=>{};
  game.cooldown=0;
  const player=game.player(team,3),owner=game.player(ownerTeam,3);
  game.take(owner);
  game.controlled[team]=player.i;
  game.manualSwitchGrace[team]=0;
  for(const p of game.players){
    if(p===player||p===owner)continue;
    p.x=450;p.y=260;
  }
  return {game,input,player,owner};
}

function frame(game,input,hz,team,state={},edge={},up={}){
  input.state[team]=state;
  input.edges[team]=edge;
  input.ups[team]=up;
  game.update(1/hz);
  input.edges[team]={};
  input.ups[team]={};
}

function runFrames(game,input,hz,seconds,team,state){
  const frames=Math.round(seconds*hz);
  for(let i=0;i<frames;i++)frame(game,input,hz,team,state);
}

test('Pass plus defensive Jump pursues without jumping and sprints for both human teams at 30/60/120 Hz',()=>{
  for(const hz of [30,60,120])for(const team of [0,1]){
    const {game,input,player,owner}=makeGame({team,ownerTeam:1-team});
    player.x=1100;player.y=650;owner.x=2040;owner.y=650;
    const initialDistance=Math.hypot(owner.x-player.x,owner.y-player.y);
    runFrames(game,input,hz,.52,team,{pass:true,jump:true});
    const finalDistance=Math.hypot(owner.x-player.x,owner.y-player.y);
    assert.ok(finalDistance<initialDistance-45,`team ${team} at ${hz} Hz should close during held Pass+Jump pursuit`);
    assert.equal(player.z,0,`team ${team} at ${hz} Hz must keep defensive Jump grounded`);
    assert.ok(player.chase>0,`team ${team} at ${hz} Hz should retain active pursuit while Pass is held`);
    assert.equal(game.ball.owner,owner,'pursuit input alone must not steal the ball from long range');
    assert.equal(game.controlled[team],player.i,'intentional pursuit must keep the selected defender');

    const walking=makeGame({team,ownerTeam:1-team});
    walking.player.x=1100;walking.player.y=650;walking.owner.x=2040;walking.owner.y=650;
    runFrames(walking.game,walking.input,hz,.52,team,{pass:true});
    const sprintGap=walking.player.x-player.x;
    assert.ok(Math.abs(sprintGap)>12,`Jump sprint should cover measurably more ground than Pass pursuit alone at ${hz} Hz`);
  }
});

test('moving carrier Jump distinguishes a short tap from sprint hold at 30/60/120 Hz',()=>{
  for(const hz of [30,60,120]){
    const short=makeGame({team:0,ownerTeam:0});
    short.game.take(short.player);
    short.player.x=1200;short.player.y=650;
    frame(short.game,short.input,hz,0,{x:1,jump:true},{jump:true});
    runFrames(short.game,short.input,hz,.1-1/hz,0,{x:1,jump:true});
    frame(short.game,short.input,hz,0,{x:1},{},{jump:true});
    assert.equal(short.player.jumpCount,1,`short moving Jump tap should jump once at ${hz} Hz`);
    assert.ok(short.player.z>0,`short moving Jump tap should leave the ground at ${hz} Hz`);

    const held=makeGame({team:0,ownerTeam:0});
    held.game.take(held.player);
    held.player.x=1200;held.player.y=650;
    const start=held.player.x;
    frame(held.game,held.input,hz,0,{x:1,jump:true},{jump:true});
    runFrames(held.game,held.input,hz,.3-1/hz,0,{x:1,jump:true});
    assert.equal(held.player.jumpCount,0,`sprint hold must not jump at ${hz} Hz`);
    assert.equal(held.player.z,0,`sprint hold must remain grounded at ${hz} Hz`);
    const sprintDistance=held.player.x-start;
    frame(held.game,held.input,hz,0,{x:1},{},{jump:true});
    runFrames(held.game,held.input,hz,.08,0,{x:1});
    assert.equal(held.player.jumpCount,0,`releasing sprint must not cause a delayed jump at ${hz} Hz`);
    assert.ok(held.player.x>start+sprintDistance,`player should continue moving after sprint release at ${hz} Hz`);
  }
});

test('manual defensive switch protects the choice before timed automatic switching resumes at 30/60/120 Hz',()=>{
  for(const hz of [30,60,120])for(const team of [0,1]){
    const {game,input,player,owner}=makeGame({team,ownerTeam:1-team});
    const preferred=game.player(team,4),closer=game.player(team,5);
    player.x=1100;player.y=650;owner.x=2200;owner.y=650;
    preferred.x=1850;preferred.y=650;
    closer.x=2050;closer.y=650;
    frame(game,input,hz,team,{dribble:true},{dribble:true});
    assert.equal(game.controlled[team],preferred.i,'defensive Dribble should manually select the nearest alternative defender');
    assert.ok(game.manualSwitchGrace[team]>.8,'manual choice should receive its grace period');
    runFrames(game,input,hz,.7,team,{});
    assert.equal(game.controlled[team],preferred.i,`automatic selection must respect manual grace for team ${team} at ${hz} Hz`);
    assert.equal(game.events.filter(event=>event.type==='autoSwitch').length,0);
    runFrames(game,input,hz,.6,team,{});
    assert.equal(game.controlled[team],closer.i,`automatic switch should resume after grace plus its timing window for team ${team} at ${hz} Hz`);
    assert.equal(game.events.filter(event=>event.type==='autoSwitch').length,1);
  }
});
