import assert from 'node:assert/strict';
import {GameEngine} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
import {AI_LEVELS} from '../src/ai.js';
const input={state:[{},{}],poll(){},just(){return false},held(){return false}};
function scenario(level=4){
 const game=new GameEngine({...DEFAULT_OPTIONS,difficulty:level,weather:'Clear'},input);
 game.init({home:0,away:9,options:{...DEFAULT_OPTIONS,difficulty:level,weather:'Clear'}});
 const jumper=game.player(1,3),assistant=game.player(1,4),b=game.ball;
 for(const p of game.players.filter(p=>p.t===1&&p!==jumper&&p!==assistant)){p.x=2900;p.y=1110;}
 jumper.x=1690;jumper.y=680;jumper.z=0;jumper.stun=0;jumper.cd=0;jumper.fatigue=0;jumper.comboCooldown=0;
 assistant.x=1748;assistant.y=675;assistant.z=0;assistant.stun=0;assistant.cd=0;assistant.fatigue=0;
 b.owner=null;b.x=1720;b.y=680;b.z=215;b.vx=0;b.vy=0;b.vz=70;b.canCollect=0;b.attacker=0;
 return {game,jumper,assistant,b};
}
assert.deepEqual(AI_LEVELS.map(a=>a.comboAwareness),[0,.25,.55,.82,1]);
assert.ok(AI_LEVELS.every(a=>a.comboTiming>=0&&a.comboTiming<=1));
const rookie=scenario(0);rookie.game.coordinateAiCombos(.016);
assert.equal(rookie.game.events.filter(e=>e.type==='aiComboSetup').length,0,'rookie does not auto-launch');
assert.equal(rookie.jumper.comboCooldown,0);
const {game:g,b}=scenario(4);g.coordinateAiCombos(.016);
const setup=g.events.find(e=>e.type==='aiComboSetup');
assert.ok(setup,'expert CPU coordinates a teammate jump');
const flyer=g.players.find(p=>p.src.name===setup.player&&p.t===1);
assert.ok(flyer?.comboActive&&flyer.comboCooldown>4);
assert.ok(g.aiComboNext[1]>4,'one team-level cooldown starts');
// A queued chase action cannot auto-tackle in midair and steal the SPECIAL input.
const control=scenario(4).game;const human=control.player(0,3),partner=control.player(0,4);human.x=1500;human.y=680;human.stun=0;human.z=0;human.cd=0;human.fatigue=0;human.comboCooldown=0;partner.x=1550;partner.y=680;partner.z=0;partner.stun=0;partner.fatigue=0;partner.cd=0;control.ball.owner=null;human.chase=1.8;assert.equal(control.tryTeammateLaunch(human),true);assert.equal(human.chase,0,'launch clears queued chase');human.chase=1.8;control.updatePlayers(.016);assert.equal(human.chase,0,'in-flight input prevents auto tackle');
const launches=g.events.filter(e=>e.type==='teamLaunch').length;
g.coordinateAiCombos(.016);assert.equal(g.events.filter(e=>e.type==='teamLaunch').length,launches,'prevents combo spam');
flyer.z=220;flyer.vz=0;flyer.cd=0;flyer.comboWindow=.9;flyer.specialCd=0;
b.owner=null;b.x=flyer.x+24;b.y=flyer.y+3;b.z=250;b.vx=0;b.vy=0;b.vz=0;
g.driveAI(flyer,.016);
assert.equal(flyer.action,'comboSuper','AI apex shot uses proper physics');
assert.ok(b.shot?.id,'real transformation metadata present');
assert.ok(g.events.some(e=>e.type==='flipKick'&&e.special),'records super shot');
// If ball is out of reach, AI may not synthesize a remote kick.
const no= scenario(4);no.b.x=2800;no.game.coordinateAiCombos(.016);
assert.ok(!no.game.events.some(e=>e.type==='aiComboSetup'),'no telekinetic jumps');
// The helper coordinates in from a reachable but initially too-large separation.
const rendezvous=scenario(4);rendezvous.assistant.x=rendezvous.jumper.x+150;
rendezvous.game.coordinateAiCombos(.016);
assert.ok(rendezvous.assistant.aiAssistTarget,'helper receives supporting run target');
const starting=rendezvous.assistant.x;
rendezvous.game.driveAI(rendezvous.assistant,.1);
assert.ok(rendezvous.assistant.x<starting,'AI teammate runs toward launch position');
// A human-controlled player cannot be auto-launched even on Expert.
const humanProtected=scenario(4);humanProtected.game.controlled[1]=3;humanProtected.game.humans=2;
humanProtected.game.coordinateAiCombos(.016);
assert.equal(humanProtected.jumper.comboCooldown,0,'manual user never hijacked');
console.log('v0.8.3 AI COMBO PASS: all 5 profiles, auto setup, apex shots, cooldown, distance gates, support runs, human control safety');
