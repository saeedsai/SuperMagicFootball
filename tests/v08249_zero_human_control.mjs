import assert from 'node:assert/strict';
import {GameEngine} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
for(const humans of [0,1,2]){
 const options={...DEFAULT_OPTIONS,weather:'Clear',difficulty:4};
 const game=new GameEngine(options,input);game.init({home:0,away:9,options,humans});
 assert.deepEqual([game.inControl(0),game.inControl(1)], [humans>=1,humans>=2],`correct human sides for ${humans} humans`);
 const target=game.player(0,3);
 const x0=target.x,y0=target.y;
 game.update(1/30);
 assert.equal(game.players.filter(p=>p.controlled).length,humans,`correct number of controlled players with ${humans} humans`);
 assert.equal(target.controlled,humans>=1,`AI-only home player not hijacked when ${humans} humans`);
 if(humans===0){
  for(let tick=0;tick<60;tick++)game.update(1/30);
  assert(Math.hypot(target.x-x0,target.y-y0)>10,'home attacker must move autonomously in AI-vs-AI simulation');
  assert.equal(game.cpuLevel(target),2,'AI-vs-AI still uses Normal difficulty');
 }
}
console.log('PASS v0.8.24.9 player-control ownership 0/1/2 humans and autonomous AI-vs-AI home player');
