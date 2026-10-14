/** v0.8.24.10 penalty fairness: keeper commits to a lane on kick; sudden death respects equal attempts. */
import assert from 'node:assert/strict';
import {GameEngine,WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
const options={...DEFAULT_OPTIONS,weather:'Clear',difficulty:2};
function engine(){const g=new GameEngine(options,input);g.init({home:0,away:9,options,humans:1});g.startPK(true);return g;}
const mid=(WORLD.goalTop+WORLD.goalBottom)/2;
// The goalkeeper must not track a known shot target while the ball is in flight.
{
 const g=engine(),pk=g.pk;
 pk.turn=1;pk.kicks=[[false],[false]];pk.shotTimer=.70;pk.shotMax=.80;
 pk.shotTargetY=mid+80;pk.saveY=mid-15;
 const committed=pk.saveY;
 for(let i=0;i<8;i++){g.updatePK(1/30);assert.equal(pk.saveY,committed,'goalkeeper shot-time decision is fixed in flight');}
}
// After five tied kicks apiece, the sixth team-0 attempt cannot instantly win.
{
 const g=engine(),pk=g.pk;
 pk.turn=10;pk.kicks=[[true,true,false,false,false],[true,true,false,false,false]];
 pk.ready=0;pk.shotTimer=.001;pk.shotMax=.8;pk.shotTargetY=mid+70;pk.saveY=mid;
 g.updatePK(1/30);
 assert.equal(pk.kicks[0].length,6);
 assert.equal(pk.kicks[1].length,5);
 assert.equal(g.matchState,'penalty','team 1 must receive matching sudden-death kick');
 pk.ready=0;pk.shotTimer=.001;pk.shotTargetY=mid;pk.saveY=mid;
 g.updatePK(1/30);
 assert.equal(pk.kicks[1].length,6);
 assert.equal(g.matchState,'finished','once both have six kicks, unequal scores determine winner');
}
// A side can still clinch within the first five if the opponent cannot catch it.
{
 const g=engine(),pk=g.pk;
 pk.turn=6;pk.kicks=[[true,true,true],[false,false,false]];
 pk.ready=0;pk.shotTimer=.001;pk.shotTargetY=mid;pk.saveY=mid;
 g.updatePK(1/30);
 assert.equal(g.matchState,'finished','mathematically clinched penalties end without unnecessary kicks');
}
console.log('PASS v0.8.24.10 committed goalkeeper lane and fair sudden-death pairs');
