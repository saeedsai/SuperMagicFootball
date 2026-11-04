const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const render=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/render.js'),'utf8');
const characterArt=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/characterart.js'),'utf8');
test('slide pose enters, extends and recovers with travel progress',()=>{
 assert.match(render,/const entry=clamp\(\(1-remaining\)\/\.22,0,1\)/);
 assert.match(render,/const recovery=p\.slideTimer>0\?1:clamp/);
 assert.match(render,/ctx\.translate\(8\*pose,15\*pose\);ctx\.rotate\(-\.62\*pose\)/);
});
test('turf spray is match-only and uses actual slide heading',()=>{
 assert.match(render,/if\(sliding&&this\.inMatchDraw&&!p\.preview&&p\.slideTimer>0\)/);
 assert.match(render,/const dx=p\.slideDX\|\|p\.face\|\|1,dy=p\.slideDY\|\|0/);
 assert.match(render,/game\.terrain==='Dirt'/);
});

test('slide direction follows committed tackle vector for all eight headings',()=>{
 assert.match(render,/let faceDX=p\.action==='slide'\?\(p\.slideDX\|\|0\):\(p\.dx\|\|0\),faceDY=p\.action==='slide'\?\(p\.slideDY\|\|0\):\(p\.dy\|\|0\)/);
 assert.match(render,/const moving=Math\.hypot\(p\.action==='slide'\?\(p\.slideDX\|\|0\):\(p\.dx\|\|0\),p\.action==='slide'\?\(p\.slideDY\|\|0\):\(p\.dy\|\|0\)\)>\.2/);
 for(const [dx,dy] of [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]){
  const p={action:'slide',slideDX:dx,slideDY:dy,dx:-dx,dy:-dy};
  const facing=[p.action==='slide'?p.slideDX:p.dx,p.action==='slide'?p.slideDY:p.dy];
  assert.deepEqual(facing,[dx,dy]);
 }
});

test('tackle facing bypasses walking heading interpolation and updates heading cache',()=>{
 assert.match(render,/if\(this\.inMatchDraw&&moving&&!p\.preview&&p\.action!=='slide'\)/);
 assert.match(render,/if\(this\.inMatchDraw&&p\.action==='slide'&&!p\.preview&&moving\)this\.poseHeadings\.set\(p,Math\.atan2\(faceDY,faceDX\)\)/);
});

test('sliding players do not cycle running gait while tackling',()=>{
 assert.match(render,/const gaitMoving=moving&&knockdownTimer<=0&&p\.action!=='slide'&&p\.action!=='receive'/);
 assert.match(render,/ARTPOSE\.settleStride\(this\.poseCycles\.get\(p\),oscillator,gaitMoving,this\.frameDelta\)/);
});


test('keeper ball-handling and hurt/cry states do not animate a running gait',()=>{
 assert.match(render,/p\.action!=='hurt'&&p\.action!=='cry'&&!\(p\.stun>\.2\)/);
 const gaitMatch=render.match(/const gaitMoving=([^;]+);/);
 assert.ok(gaitMatch,'renderer has locomotion predicate');
 const gait=new Function('p','moving','knockdownTimer',`return ${gaitMatch[1]}`);
 for(const action of ['keeperDive','keeperDiveCatch','keeperRecover','keeperCatch','keeperThrow','keeperPunt'])
  assert.equal(gait({action,stun:0},true,0),false,action);
 for(const action of ['keeperCatch','keeperThrow','keeperPunt','keeperDive','keeperRecover','hurt','cry']){
  const p={action,stun:0};const gaitMoving=true&&p.action!=='slide'&&p.action!=='receive'&&p.action!=='pass'&&p.action!=='hurt'&&p.action!=='cry'&&!(p.stun>.2)&&!['keeperDive','keeperDiveCatch','keeperRecover','keeperCatch','keeperThrow','keeperPunt'].includes(p.action);
  assert.equal(gaitMoving,false,`${action} must not step while posed`);
 }
 const running={action:'run',stun:0};assert.equal(running.action!=='hurt'&&running.action!=='cry'&&!(running.stun>.2)&&!['keeperCatch','keeperThrow','keeperPunt'].includes(running.action),true);
 assert.equal(gait({action:'run',stun:0},true,.8),false,'players remain grounded during knockdown');
 const stunned={action:'run',stun:.4};assert.equal(!(stunned.stun>.2),false);
});

test('shot and aerial action poses freeze locomotion gait while regular running stays animated',()=>{
 assert.match(render,/!\(\(p\.cryTimer\|\|0\)>\.05\)/);
 const actions=['kick','super','header','superHead','flipKick','comboSuper','bicycle','superBicycle','flyingKick','defensiveBicycle'];
 const match=render.match(/const gaitMoving=([^;]+);/);
 assert.ok(match,'live gait condition must exist');
 const gait=new Function('p','moving','knockdownTimer',`return ${match[1]}`);
 for(const action of actions)assert.equal(gait({action,stun:0},true,0),false,action);
 assert.equal(gait({action:'run',stun:0,cryTimer:0},true,0),true);
 assert.equal(gait({action:'run',stun:0,cryTimer:.4},true,0),false,'cry timer overrides stale run action');
 assert.equal(gait({action:'run',stun:0,cryTimer:0},false,0),false,'standing players do not run');
});

test('keeper catch and hold keep the ball at padded chest-level gloves',()=>{
 const source=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/artpose.js'),'utf8').replace(/^export \{[^\n]+\};?\s*$/m,'');
 const context=vm.createContext({});vm.runInContext(source+'\nthis.grip=ARTPOSE.keeperGrip;',context);
 const grip=(action,face)=>context.grip(action,face);
 assert.deepEqual(JSON.parse(JSON.stringify(grip('keeperCatch',1))),{x:5,y:-59});
 assert.deepEqual(JSON.parse(JSON.stringify(grip('keeperHold',-1))),{x:-5,y:-59});
 assert.equal(grip('keeperThrow',1),null,'released keeper balls return to physical coordinates');
 assert.match(render,/ARTPOSE\.keeperGrip\(b\.owner\.action,b\.owner\.face\)/);
 assert.match(render,/ctx\.translate\(ballX,ballY\)/);
 assert.match(render,/if\(!grip\)this\.drawBallShadow\(ctx,b\.x,b\.y,b\.z,underground\?\.2:concealed/,'held balls do not cast a false ground shadow; underground balls dim theirs');
 const arm=characterArt.slice(characterArt.indexOf('function arm('),characterArt.indexOf('function jersey('));
 assert.match(arm,/holding=p\.keeper&&\['keeperCatch','keeperHold'\]/);
 assert.match(arm,/hand=holding\?\[elbow\[0\]-sign\*5,-59\]/);
 assert.match(arm,/const catchingGlove=\['keeperDive','keeperDiveCatch','keeperCatch','keeperHold','keeperSuper'\]/);
});
