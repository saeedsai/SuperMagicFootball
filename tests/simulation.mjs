import assert from 'node:assert/strict';
import {GameEngine,WORLD} from '../src/engine.js';
import {withStats} from '../src/stats.js';
import {JAPAN_ROSTER,SHOTS,TEAMS,rosterFor,DEFAULT_OPTIONS} from '../src/data.js';
const dummy={state:[{},{}],pressed:[{},{}],poll(){},just(){return false}};
assert.equal(JAPAN_ROSTER.length,12);
assert.equal(TEAMS.length,13);
const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},dummy);
g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
assert.equal(g.players.length,12);
assert.equal(g.ball.owner.src.name,'Kunio');
for(const p of JAPAN_ROSTER){
 const carrier=g.player(0,3);carrier.src=withStats(p);carrier.cd=0;carrier.specialCd=0;g.take(carrier);g.shoot(carrier,true);
 const hasShot=carrier.src.superAbility?.type==='shoot';
 assert.equal(!!g.ball.shot,hasShot,`Only a Super Shot specialist transforms: ${p.name}`);
 if(hasShot){assert.equal(g.ball.shot.id,p.shot);assert.ok(SHOTS[g.ball.shot.id].behavior);}
}
for(let t=1;t<13;t++){const r=rosterFor(t);assert.equal(r.length,12);assert.ok(r[0].fictional);assert.ok(SHOTS[TEAMS[t].shot])}
g.resetKickoff(0);g.ball.owner=null;g.ball.x=WORLD.field.x+WORLD.field.w+8;g.ball.y=(WORLD.goalTop+WORLD.goalBottom)/2;g.ball.z=0;g.ball.vx=250;g.ball.vy=0;g.ball.canCollect=0;g.updateBall(.016);assert.equal(g.score[0],1,'Goal detection failed');
g.startPK();assert.equal(g.matchState,'penalty');assert.equal(g.pk.kicks.length,2);
console.log('Simulation tests: PASS • 12 unique Japanese shots • 13 teams • match physics • goal • PK mode');
