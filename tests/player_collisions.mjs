import assert from 'node:assert/strict';
import {GameEngine,WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false}};
function game(){const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});g.cooldown=0;return g;}
const apart=(g,a,b)=>{for(const p of g.players)if(p!==a&&p!==b){p.x=WORLD.field.x+100+p.i*75;p.y=WORLD.field.y+120+p.t*115;}a.x=1550;a.y=680;b.x=1579;b.y=680;a.moveVX=250;a.moveVY=0;b.moveVX=-250;b.moveVY=0;a.z=b.z=0;a.stun=b.stun=0;a.contactCooldown=b.contactCooldown=0;};
{
 const g=game(),a=g.player(0,3),b=g.player(1,3);
 apart(g,a,b);const startA=a.x,startB=b.x;
 g.resolvePlayerContacts(.016);
 assert.ok(Math.hypot(b.x-a.x,b.y-a.y)>=49.99,'contact must physically separate players');
 assert.ok(a.x<startA&&b.x>startB,'pushback moves BOTH players away');
 assert.ok(a.stun>0&&b.stun>0,'both get brief stun');
 assert.ok(a.contactCooldown>0&&b.contactCooldown>0);
 const n=g.events.filter(x=>x.type==='playerCollision').length;
 g.resolvePlayerContacts(.016);
 assert.equal(g.events.filter(x=>x.type==='playerCollision').length,n,'cooldown prevents repetitive hits');
}
{
 const g=game(),a=g.player(0,3),b=g.player(1,3);
 apart(g,a,b);g.take(a);
 g.resolvePlayerContacts(.016);
 assert.equal(g.ball.owner,null,'heavy body collision spills possession');
 assert.ok(g.ball.canCollect>0,'dropped ball has short safe pickup window');
}
{
 const g=game(),a=g.player(0,3),b=g.player(0,4);
 apart(g,a,b);a.moveVX=30;b.moveVX=-30;
 g.resolvePlayerContacts(.016);
 assert.ok(Math.hypot(b.x-a.x,b.y-a.y)>=49.99,'allied players do not overlap');
 assert.equal(a.stun,0,'normal friendly spacing does not repeatedly stun');
}
{
 const g=game(),a=g.player(0,3),b=g.player(1,3);
 apart(g,a,b);b.z=120;
 g.resolvePlayerContacts(.016);
 assert.equal(a.stun,0,'ground player not hit by an airborne player');
 assert.equal(b.stun,0);
}
{
 const g=game(),a=g.player(0,3),b=g.player(1,3);
 apart(g,a,b);a.x=b.x=1700;a.y=b.y=500;
 g.resolvePlayerContacts(.016);
 assert.ok(Number.isFinite(a.x)&&Number.isFinite(b.x),'identical coordinates must not produce NaN');
 assert.ok(Math.hypot(b.x-a.x,b.y-a.y)>=49.9,'zero-distance collision separates pair');
}
{
 const g=game();g.ball.owner=null;g.ball.x=2300;g.ball.y=650;
 for(let n=0;n<600;n++)g.update(.016);
 for(const p of g.players)assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.stun),'long collision simulation stable');
}
{
 const g=game();for(const p of g.players){p.x=1500;p.y=680;p.moveVX=p.moveVY=0;p.contactCooldown=1;}
 g.resolvePlayerContacts(.016);
 for(let i=0;i<g.players.length;i++)for(let j=i+1;j<g.players.length;j++)
  assert.ok(Math.hypot(g.players[i].x-g.players[j].x,g.players[i].y-g.players[j].y)>49.2,'crowded pile should disperse without overlapping');
}
console.log('v0.8.5 COLLISIONS PASS: symmetric pushback, short stun, cooldown, ball drops, teammate spacing, airborne separation, zero-distance safety, long simulation');
