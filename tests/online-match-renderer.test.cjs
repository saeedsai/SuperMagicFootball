const test=require('node:test');
const assert=require('node:assert/strict');

function snapshot(){return {tick:9,phase:'play',matchState:'play',terminal:false,half:1,clock:12.5,clockRemaining:107.5,clockProgress:.104,score:[2,1],
 teamIds:['japan','brazil'],controlled:[1,2],ballModel:'ice',
 ball:{x:.75,y:.25,height:.5,velocity:{x:.2,y:-.1,height:0},owner:{team:1,slot:4,index:4},shot:{id:'silverCarp',behavior:'underground',color:'#fff',trail:'#acf',underground:true,level:2,phase:1,transformSeconds:2,age:.5},roll:.25},
 players:Array.from({length:12},(_,index)=>{const team=index<6?0:1,slot=index%6;return {slot,team,index:slot,assetId:`${team===0?'japan':'brazil'}/${team===0?`jp${slot}`:`brazil_${slot}`}`,position:{x:team?.8:.25,y:team?.2:.75,height:.4},view:{kind:'quarterFront',side:1},facing:1,
  animation:{phase:.25,actionTime:.2,progress:.1},action:slot===2?'slide':'run',stun:slot===3?.5:0,keeper:slot===0,
  visual:{knockdown:slot===3?.4:0,confused:0,crying:0,airborne:false}}}),
 hazards:{magic:[{kind:'banana',team:0,x:.1,y:.2,life:2,arm:.1}],walls:[{id:'magicWall',team:1,x:.4,y:.5,halfLength:.1,thickness:.01,height:.4,duration:3,arm:.2,color:'#72e8ff'}],
  nova:{team:0,x:.3,y:.6,radius:.2,remaining:1,telegraph:0},tornado:{x:.4,y:.5,life:2,totalLife:4,radius:.1},lightning:{phase:'warning',x:.2,y:.8,radius:.1,remaining:.5,duration:1},weather:'Storm'}};}
function game(){return {rosters:[Array.from({length:12},(_,i)=>({id:`jp${i}`,role:'MF'})),Array.from({length:12},(_,i)=>({id:`brazil_${i}`,role:'MF'}))],players:Array.from({length:12},(_,index)=>({t:index<6?0:1,i:index%6,x:500,y:300,z:0,face:1,action:'idle',actionTimer:0,anim:0,stun:0,controlled:false})),
 ball:{x:500,y:300,z:0,owner:null,shot:null,trail:[],age:0,vx:0,vy:0},score:[0,0],half:1,clock:0,matchState:'play',controlled:[0,0],magicHazards:[],magicWalls:[],options:{ballModel:'classic'}};}

test('online renderer maps authoritative snapshot through the production remote-pose renderer',async()=>{
 const {applyOnlineMatchSnapshot}=await import('../src/modules/online-match-renderer.js');
 const target=game(),field={x:0,y:0,w:1000,h:600};
 const resolve=id=>({japan:0,brazil:9})[id]??-1;
 assert.equal(applyOnlineMatchSnapshot(target,field,snapshot(),1,{teamIndexForId:resolve,playerForId:id=>({id:id.split('/')[1],role:'MF'})}),true);
 assert.deepEqual(target.teamIds,[0,9]);assert.equal(target.options.ballModel,'ice');assert.equal(target.weather,'Storm');
 assert.deepEqual(target.score,[2,1]);assert.equal(target.clock,12.5);assert.equal(target.players.find(p=>p.t===1&&p.i===2).controlled,true);
 assert.equal(target.players.find(p=>p.t===0&&p.i===2).controlled,false);
 assert.equal(target.players.find(p=>p.t===0&&p.i===2).x,250);assert.equal(target.players.find(p=>p.t===0&&p.i===2).y,450);
 assert.ok(Math.abs(target.players.find(p=>p.t===0&&p.i===3).shotImpactKnockdownTimer-1.2)<1e-9);
 assert.equal(target.ball.x,750);assert.equal(target.ball.y,150);assert.equal(target.ball.z,100);assert.equal(target.ball.owner,target.players.find(p=>p.t===1&&p.i===4));
 assert.equal(target.ball.shot.id,'silverCarp');assert.equal(target.ball.shot.behavior,'underground');assert.equal(target.ball.shot.underground,true);
 assert.equal(target.ball.shot.transformSeconds,2);assert.equal(target.ball.shot.phase,1);
 assert.equal(target.magicHazards[0].kind,'banana');assert.equal(target.magicWalls[0].id,'magicWall');
 assert.equal(target.supernova.team,0);assert.equal(target.tornado.life,2);assert.equal(target.weatherLightning.phase,'warning');
});

test('online renderer retains behavior cues used by the production transformed-ball renderer',async()=>{
 const {applyOnlineMatchSnapshot}=await import('../src/modules/online-match-renderer.js');
 const target=game(),state=snapshot();state.ball.shot={...state.ball.shot,id:'warpOrb',behavior:'warp',underground:false};
 assert.equal(applyOnlineMatchSnapshot(target,{x:0,y:0,w:1000,h:600},state,1,
  {teamIndexForId:id=>({japan:0,brazil:9})[id]??-1,playerForId:id=>({id:id.split('/')[1],role:'MF'})}),true);
 assert.equal(target.ball.shot.behavior,'warp');
 assert.equal(target.ball.shot.underground,false);
 assert.equal(target.ball.shot.transformSeconds,2);
});

test('online renderer rejects unknown teams and missing side before touching the game state',async()=>{
 const {applyOnlineMatchSnapshot}=await import('../src/modules/online-match-renderer.js');
 const target=game(),before=JSON.stringify(target),state=snapshot();state.teamIds=['nope','brazil'];
 assert.throws(()=>applyOnlineMatchSnapshot(target,{x:0,y:0,w:1000,h:600},state,0,{teamIndexForId:id=>({brazil:9})[id]??-1}),/unavailable team/);
 assert.equal(JSON.stringify(target),before);
 assert.throws(()=>applyOnlineMatchSnapshot(target,{x:0,y:0,w:1000,h:600},snapshot(),2,{teamIndexForId:()=>0,playerForId:()=>({})}),/Invalid online match/);
});

test('authoritative engine snapshot reaches the renderer without local simulation or team-ID drift',async()=>{
 const [{createOnlineGameEngine},{applyOnlineMatchSnapshot},{loadAssetsFromNode}]=await Promise.all([
  import('../scripts/online-game-engine.mjs'),import('../src/modules/online-match-renderer.js'),import('../src/assets.js')]);
 const engine=await createOnlineGameEngine({home:0,away:9,halfSeconds:60,seed:21}),serverState=engine.snapshot;
 const before=engine.snapshot,assets=await loadAssetsFromNode(),target=game();target.rosters=[assets.rosters.japan,assets.rosters.brazil];
 const playerForId=id=>{const [teamId,playerId]=id.split('/');return assets.rosters[teamId]?.find(row=>row.id===playerId);};
 assert.equal(applyOnlineMatchSnapshot(target,{x:0,y:0,w:1000,h:600},serverState,1,{teamIndexForId:id=>({japan:0,brazil:9})[id]??-1,playerForId}),true);
 assert.deepEqual(target.teamIds,[0,9]);assert.equal(target.players.length,12);assert.equal(target.score[0],serverState.score[0]);
 assert.equal(target.clock,serverState.clock);assert.equal(engine.snapshot.tick,before.tick);assert.equal(engine.snapshot.clock,before.clock);
});
