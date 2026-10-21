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
 // Randomized AI can pass immediately and later return to its home position.
 // Observe actual autonomous motion throughout play, not just one final coordinate.
 const attackers=[3,4,5].map(i=>game.player(0,i));
 const previous=attackers.map(p=>({x:p.x,y:p.y}));
 const travelled=attackers.map(()=>0);
 const observe=()=>attackers.forEach((p,i)=>{
  travelled[i]+=Math.hypot(p.x-previous[i].x,p.y-previous[i].y);
  previous[i]={x:p.x,y:p.y};
 });
 game.update(1/30);observe();
 assert.equal(game.players.filter(p=>p.controlled).length,humans,`correct number of controlled players with ${humans} humans`);
 assert.equal(target.controlled,humans>=1,`AI-only home player not hijacked when ${humans} humans`);
 if(humans===0){
  for(let tick=0;tick<60;tick++){game.update(1/30);observe();}
  assert(Math.max(...travelled)>10,
   'an AI home attacker must move autonomously during AI-vs-AI play, regardless of later passes or returns to home');
  assert.equal(game.cpuLevel(target),2,'AI-vs-AI still uses Normal difficulty');
 }
}
console.log('PASS v0.8.24.9 player-control ownership 0/1/2 humans and autonomous AI-vs-AI home player');
