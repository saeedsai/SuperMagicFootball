'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.resolve('src/modules/engine.js'),'utf8').replace(/\r\n/g,'\n');
const start=source.indexOf(' startCornerRestart(team,top){');
const end=source.indexOf('\n take(p){',start);
assert(start>=0&&end>start,'corner and goal-kick restart methods must exist in GameEngine');
const methods=vm.runInNewContext('({'+source.slice(start,end).replace(/\n (?=startGoalKick|startFreeKick|isInPenaltyArea|handleEndlineRestart)/g,',\n ')+'})',{
 F:{x:100,y:200,w:2000,h:1000},
 clamp:(value,min,max)=>Math.max(min,Math.min(max,value))
});

function fixture(){
 const rosters=[0,1].map(t=>Array.from({length:12},(_,i)=>({id:`${t}-${i}`,name:`P${t}-${i}`})));
 const players=[];
 for(let t=0;t<2;t++)for(let i=0;i<6;i++){
  const rosterIndex=[0,1,2,3,4,5][i];
  players.push({t,i,src:rosters[t][rosterIndex],keeper:i===0,stun:0,face:t===0?1:-1,
   x:400+t*900+i*30,y:450+i*40,dx:0,dy:0,moveVX:0,moveVY:0,action:'run',actionTimer:.2});
 }
 const events=[],game={
  players,rosters,teamPlans:[{corner:4},{corner:4}],controlled:[3,3],
  ball:{owner:null,x:700,y:500,z:8,vx:90,vy:80,vz:20,age:2,shot:{id:'old'},strike:{},
   ordinaryShot:true,trail:[{}],lastTouchTeam:1},
  magicHazards:[{}],magicWalls:[{}],supernova:{team:1},
  cancelPendingAbilityActions(){},
  player(t,i){return players.find(p=>p.t===t&&p.i===i)},
  take(player){this.ball.owner=player;this.ball.x=player.x+player.face*17;this.ball.y=player.y+10;
   this.ball.z=0;this.ball.vx=this.ball.vy=this.ball.vz=0;this.ball.lastTouchTeam=player.t;
   if(!player.keeper)this.controlled[player.t]=player.i;},
  emit(type,data){events.push({type,...data})},
  events
 };
 Object.assign(game,methods);
 return game;
}

test('corner restart uses the configured active taker and correct attacking corner',()=>{
 const g=fixture();g.teamPlans[0].corner=4;
 const taker=g.players.find(p=>p.t===0&&p.src.id==='0-4');
 assert.equal(g.startCornerRestart(0,true),true);
 assert.equal(g.ball.owner,taker);assert.equal(g.controlled[0],taker.i);
 assert.equal(taker.x,100+2000-35);assert.equal(taker.y,200+15);assert.equal(taker.face,-1);
 assert.equal(g.ball.lastTouchTeam,0);assert.equal(g.ball.shot,null);assert.equal(g.ball.strike,null);
 assert.deepEqual(g.events,[{type:'cornerRestart',team:0,player:taker.src.name,side:'top'}]);
 assert.equal(g.magicHazards.length,0);assert.equal(g.magicWalls.length,0);assert.equal(g.supernova,null);
});

test('corner restart mirrors to the opposite side and falls back from a benched role taker',()=>{
 const g=fixture();g.teamPlans[1].corner=10;
 const taker=g.players.find(p=>p.t===1&&!p.keeper);taker.stun=0;
 assert.equal(g.startCornerRestart(1,false),true);
 assert.equal(g.ball.owner,taker);assert.equal(taker.x,100+35);assert.equal(taker.y,200+1000-25);
 assert.equal(taker.face,1);assert.equal(g.events[0].side,'bottom');
});

test('endline deflections award mirrored corners to the attacking team',()=>{
 const right=fixture();right.ball.x=100+2000-4;right.ball.y=240;right.ball.lastTouchTeam=1;
 assert.equal(right.handleEndlineRestart(),true);
 assert.equal(right.events[0].type,'cornerRestart');assert.equal(right.events[0].team,0);assert.equal(right.events[0].side,'top');
 const left=fixture();left.ball.x=100+4;left.ball.y=1150;left.ball.lastTouchTeam=0;
 assert.equal(left.handleEndlineRestart(),true);
 assert.equal(left.events[0].type,'cornerRestart');assert.equal(left.events[0].team,1);assert.equal(left.events[0].side,'bottom');
});

test('attacking last touch awards the defending goalkeeper a goal kick',()=>{
 const g=fixture();g.ball.x=2205;g.ball.y=700;g.ball.lastTouchTeam=0;
 const keeper=g.player(1,0);
 assert.equal(g.handleEndlineRestart(),true);assert.equal(g.ball.owner,keeper);
 assert.equal(keeper.x,100+2000-55);assert.equal(keeper.keeperHold,0);
 assert.deepEqual(g.events,[{type:'goalKickRestart',team:1,player:keeper.src.name}]);
});

test('live endline integration preserves goals and banks without restart calls',()=>{
 const out=source.slice(source.indexOf(' // Scoring: ball must cross'),source.indexOf(' if(b.canCollect>0)return;',source.indexOf(' // Scoring: ball must cross')));
 assert.match(out,/if\(b\.y>WORLD\.goalTop&&b\.y<WORLD\.goalBottom&&b\.z<125\)\{scoring\(/);
 assert.match(out,/const bankPending=/);
 assert.doesNotMatch(out,/this\.handleEndlineRestart\(\)/);
 assert.match(out,/b\.vx\*=-\.72/);
 assert.match(source,/b\.lastTouchTeam=p\.t/);
});
