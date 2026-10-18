/** Keeper quick ground-roll: genuine extracted engine methods, no match physics changes. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const start=source.indexOf('\n rollKeeper(p){'),end=source.indexOf('\n command(p,a){',start);
assert(start>0&&end>start,'real keeper roll method absent from engine');
const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const roll=vm.runInNewContext('({'+source.slice(start,end)+'})',{distance:d,stat:()=>74}).rollKeeper;
const commandStart=source.indexOf('\n command(p,a){'),commandEnd=source.indexOf('\n autoSwitch(t,',commandStart);
const command=vm.runInNewContext('({'+source.slice(commandStart,commandEnd)+'})').command;
function setup(team=0) {
 const dir=team===0?1:-1,keeper={t:team,i:0,keeper:true,x:team===0?220:1580,y:640,z:0,stun:0,src:{id:'gk',name:'Keeper'},keeperHold:.31,cd:0};
 const near={t:team,i:1,keeper:false,x:keeper.x+dir*400,y:650,z:0,stun:0,src:{id:'safe',name:'Outlet'}};
 const far={t:team,i:2,keeper:false,x:keeper.x+dir*700,y:725,z:0,stun:0,src:{id:'far',name:'Wide'}};
 const enemy={t:1-team,i:1,keeper:false,x:keeper.x+dir*1000,y:900,z:0,stun:0,src:{id:'enemy',name:'Opposition'}};
 const ball={owner:keeper,pass:false,passTarget:null};
 const events=[],free=[];
 const g={players:[keeper,near,far,enemy],ball,events,free,matchState:'play',
   manualSwitchGrace:[0,0],inControl(t){return t===team;},hostOfBall(){return this.ball.owner;},
   keeperPassingLane(p,q){return {clear:q!==this.blocked,endpoint:320,interception:220};},
   freeBall(p,dx,dy,speed,opts){
     free.push({p,dx,dy,speed,opts});this.ball.owner=null;this.ball.pass=!!opts.pass;
     this.ball.passFrom=p.src.id;this.ball.passTeam=p.t;
   },
   emit(type,data){events.push({type,...data});},
   dribble(p){events.push({type:'normalDribble',player:p.src.id});},
   rollKeeper:roll,command};
 return {g,keeper,near,far,enemy};
}
test('home keeper DRIBBLE rolls low aimed pass to nearest safe outlet',()=>{
 const {g,keeper,near}=setup();
 assert.equal(g.rollKeeper(keeper),true);
 assert.equal(g.ball.owner,null);assert.equal(g.ball.pass,true);
 assert.equal(g.ball.passFrom,keeper.src.id);assert.equal(g.ball.passTeam,0);
 assert.equal(g.ball.passTarget,near.src.id);
 assert.equal(g.free.length,1);
 assert.equal(g.free[0].opts.z,10);assert.equal(g.free[0].opts.vz,0);
 assert(g.free[0].speed>300&&g.free[0].speed<460);
 assert.equal(keeper.action,'keeperThrow');assert.equal(keeper.keeperHold,0);
 assert.equal(g.events[0].type,'keeperDistribution');assert.equal(g.events[0].mode,'roll');
 assert.equal(g.events[1].type,'passIntent');assert.equal(g.events[1].loft,'ground');
 assert.equal(g.manualSwitchGrace[0],1.25);
});
test('away-side mirror selects the advancing short lane and correct team metadata',()=>{
 const {g,keeper,near}=setup(1);
 assert.equal(g.rollKeeper(keeper),true);
 assert(g.free[0].dx<0);assert.equal(g.ball.passTarget,near.src.id);
 assert.equal(g.events[0].team,1);assert.equal(g.events[1].target,near.src.id);
});
test('marked closest teammate is skipped, safe other outlet is selected',()=>{
 const {g,keeper,near,far}=setup();
 g.blocked=near;assert.equal(g.rollKeeper(keeper),true);
 assert.equal(g.ball.passTarget,far.src.id);
});
test('no open receiver retains catch, does not generate phantom pass or events',()=>{
 const {g,keeper}=setup();
 g.keeperPassingLane=()=>({clear:false});
 const before=JSON.stringify(g.ball);assert.equal(g.rollKeeper(keeper),false);
 assert.equal(JSON.stringify(g.ball),before);
 assert.equal(g.free.length,0);assert.equal(g.events.length,0);
 assert.equal(keeper.keeperHold,.31);
});
test('stunned, airborne, opposing, rear and distant outlets cannot receive roll',()=>{
 const {g,keeper,near,far}=setup();
 near.z=45;far.stun=.4;
 g.players.push({t:0,keeper:false,x:100,y:650,stun:0,z:0,src:{id:'behind'}});
 g.players.push({t:0,keeper:false,x:keeper.x+1100,y:650,stun:0,z:0,src:{id:'distant'}});
 assert.equal(g.rollKeeper(keeper),false);assert.equal(g.free.length,0);
});
test('only a live non-stunned human keeper with possession may initiate',()=>{
 const {g,keeper,near,enemy}=setup();
 const run=()=>g.rollKeeper(keeper);
 for(const field of [{matchState:'paused'},{matchState:'penalty'},{matchState:'finished'}]){
  g.matchState=field.matchState;assert.equal(run(),false);
 }
 g.matchState='play';keeper.stun=.5;assert.equal(run(),false);keeper.stun=0;
 g.inControl=()=>false;assert.equal(run(),false);g.inControl=()=>true;
 g.ball.owner=enemy;assert.equal(run(),false);g.ball.owner=keeper;
 assert.equal(g.rollKeeper(near),false);assert.equal(g.free.length,0);
});
test('human DRIBBLE routes keeper possession but ordinary outfield trick remains',()=>{
 const {g,keeper,near}=setup();
 g.command(near,'dribble');assert.equal(g.ball.passTarget,near.src.id);
 assert.equal(g.events[0].type,'keeperDistribution');
 g.ball.owner=near;g.command(near,'dribble');
 assert.equal(g.events.at(-1).type,'normalDribble');
});
test('unsafe keeper roll cannot cause outfield dribble or surrender goalkeeper possession',()=>{
 const {g,keeper,near}=setup();g.keeperPassingLane=()=>({clear:false});
 g.command(near,'dribble');
 assert.equal(g.ball.owner,keeper);assert.equal(g.free.length,0);
 assert.equal(g.events.length,0);
});
test('new mechanism preserves original pass/shoot and four-button command routing',()=>{
 const slice=source.slice(commandStart,commandEnd);
 assert.match(slice,/if\(a==='pass'\)/);
 assert.match(slice,/if\(a==='shoot'\)/);
 assert.match(slice,/if\(a==='special'\)/);
 assert.match(slice,/if\(a==='jump'\)/);
 assert.match(slice,/if\(a==='dribble'\)/);
 assert.match(source,/p\.keeperHold>=1\.35/,'AI keeper distribution timer unchanged');
 assert.match(source,/this\.rollKeeper\(holder\)/);
});
