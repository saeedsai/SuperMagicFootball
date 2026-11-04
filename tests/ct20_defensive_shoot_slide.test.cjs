const {test}=require('node:test');
const assert=require('node:assert/strict');

let GameEngine,DEFAULT_OPTIONS;
test.before(async()=>{
  ({GameEngine}=await import('../src/engine.js'));
  ({DEFAULT_OPTIONS}=await import('../src/data.js'));
});

function inputStub(){
  return {
    state:[{},{}],edges:[{},{}],
    poll(){},
    just(team,action){return !!this.edges[team]?.[action]},
    held(team,action){return !!this.state[team]?.[action]},
    released(){return false},
    tapDuration(){return 0},
    canceled(){return false},
  };
}

function setup({team=0,dx=1,dy=0,running=false,cooldown=0}={}){
  const input=inputStub();
  const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
  game.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
  game.humans=2;
  game.cooldown=0;
  game.driveAI=()=>{};
  game.coordinateAiCombos=()=>{};

  const tackler=game.player(team,3),carrier=game.player(1-team,3);
  const cx=1600,cy=650,offset=230;
  tackler.x=cx;tackler.y=cy;tackler.z=0;tackler.stun=0;tackler.cd=cooldown;
  tackler.slideTimer=0;tackler.action='idle';tackler.actionTimer=0;
  tackler.dashTimer=0;tackler.sprintCharge=0;tackler.moveVY=0;
  tackler.moveVX=running?game.playerSpeed(tackler)*.86:0;
  carrier.x=cx+dx*offset;carrier.y=cy+dy*offset;carrier.z=0;
  carrier.stun=0;carrier.invuln=0;carrier.cd=0;
  for(const player of game.players){
    if(player===tackler||player===carrier)continue;
    player.x=400;player.y=250;
  }
  game.take(carrier);
  game.controlled[team]=tackler.i;
  game.manualSwitchGrace[team]=1;
  input.state[team]={x:0,y:0,shoot:0,pass:0,dribble:0,jump:0};
  return {game,input,tackler,carrier};
}

function pressShoot(game,input,team){
  input.edges[team]={shoot:true};
  game.updatePlayers(1/60);
  input.edges[team]={};
}

const DIRECTIONS=[
  [1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],
].map(([x,y])=>{const length=Math.hypot(x,y);return [x/length,y/length]});

test('defensive Shoot edge starts a slide toward the opposing carrier for both human sides and all eight directions',()=>{
  for(const team of [0,1])for(const [dx,dy] of DIRECTIONS){
    const {game,input,tackler,carrier}=setup({team,dx,dy});
    pressShoot(game,input,team);
    const start=game.events.find(event=>event.type==='slideStart');
    assert.ok(start,`team ${team}, facing ${dx},${dy}: defensive Shoot must slide`);
    assert.equal(start.team,team);
    assert.equal(start.player,tackler.src.name);
    assert.equal(start.running,false);
    assert.ok(tackler.slideTimer>0);
    assert.ok(tackler.cd>0,'slide must start the tackle cooldown');
    assert.ok(Math.abs(tackler.slideDX-dx)<.01,`horizontal slide vector ${tackler.slideDX} vs ${dx}`);
    assert.ok(Math.abs(tackler.slideDY-dy)<.01,`vertical slide vector ${tackler.slideDY} vs ${dy}`);
    assert.equal(game.ball.owner,carrier,'a distant carrier remains in possession until the slide reaches contact');
  }
});

test('run-up increases the defensive Shoot slide reach over a standing tap',()=>{
  const stationary=setup({team:0,dx:1,dy:0});
  pressShoot(stationary.game,stationary.input,0);
  const standingEvent=stationary.game.events.find(event=>event.type==='slideStart');

  const moving=setup({team:0,dx:1,dy:0,running:true});
  pressShoot(moving.game,moving.input,0);
  const runningEvent=moving.game.events.find(event=>event.type==='slideStart');

  assert.ok(standingEvent&&runningEvent,'both defensive Shoot taps must start slides');
  assert.equal(standingEvent.running,false);
  assert.equal(runningEvent.running,true);
  assert.ok(runningEvent.reach>standingEvent.reach,
    `running reach ${runningEvent.reach} should exceed standing reach ${standingEvent.reach}`);
});

test('a repeated defensive Shoot edge is suppressed during tackle cooldown and works again when ready',()=>{
  const {game,input,tackler}=setup({team:0,dx:1,dy:0});
  pressShoot(game,input,0);
  assert.equal(game.events.filter(event=>event.type==='slideStart').length,1);
  assert.ok(tackler.cd>0);

  // Allow control processing again while retaining the cooldown under test.
  tackler.slideTimer=0;tackler.action='idle';tackler.actionTimer=0;
  pressShoot(game,input,0);
  assert.equal(game.events.filter(event=>event.type==='slideStart').length,1,
    'cooldown must prevent the same contextual Shoot from starting another slide');
  assert.ok(tackler.cd>0);

  tackler.cd=0;
  pressShoot(game,input,0);
  assert.equal(game.events.filter(event=>event.type==='slideStart').length,2,
    'the same input works again after cooldown is ready');
});
