'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const shotSource=fs.readFileSync(path.join(root,'src/modules/shotpaths.js'),'utf8');
const engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8');
const render=fs.readFileSync(path.join(root,'src/modules/render.js'),'utf8');
const helper=import('data:text/javascript;base64,'+Buffer.from(shotSource).toString('base64'));
function close(a,b,eps=1e-7){assert.ok(Math.abs(a-b)<=eps,`${a} ~= ${b}`);}
async function simulate(shot,fps,end){
 const {SHOTPATHS}=await helper;let y=0,vy=0,t=0;
 while(t<end-1e-12){const next=Math.min(end,t+1/fps),dt=next-t,turn=SHOTPATHS.warpStep(shot,t,next);vy+=turn.deltaVy;y+=vy*dt+turn.correctionY;t=next;}
 return {y,vy};
}
test('Omega warp profile stays bounded, mirrors, and settles at the launch lane',async()=>{
 const {SHOTPATHS}=await helper;
 for(const direction of [-1,1]){
  const shot={id:'omega',direction};
  for(let t=0;t<=1.65;t+=.002){const s=SHOTPATHS.warpSample(shot,t);assert.ok(Number.isFinite(s.offset)&&Number.isFinite(s.velocity));assert.ok(Math.abs(s.offset)<=28+1e-8);assert.ok(Math.abs(s.velocity)<=330+1e-6);}
  close(SHOTPATHS.warpSample(shot,0).offset,0);close(SHOTPATHS.warpSample(shot,0).velocity,0);
  close(SHOTPATHS.warpSample(shot,1.65).offset,0);close(SHOTPATHS.warpSample(shot,1.65).velocity,0);
  for(const t of [.2,.4,.8,1.2,1.5]){const a=SHOTPATHS.warpSample(shot,t),b=SHOTPATHS.warpSample({id:'omega',direction:-direction},t);close(a.offset,-b.offset);close(a.velocity,-b.velocity);}
 }
});
test('Omega warp path matches at 30/60/120 Hz and carries no post-transform drift',async()=>{
 const {SHOTPATHS}=await helper;
 for(const direction of [-1,1])for(const end of [.2,.4,.8,1.2,1.5,1.65,1.9]){
  const shot={id:'omega',direction},sample=SHOTPATHS.warpSample(shot,end);
  for(const fps of [30,60,120]){const got=await simulate(shot,fps,end);close(got.y,sample.offset);close(got.vy,sample.velocity);}
 }
});
test('live engine and keeper prediction share warp physics; phase retains ordinary collision paths',()=>{
 assert.equal((engine.match(/SHOTPATHS\.warpStep\(/g)||[]).length,2);
 assert.match(engine,/if\(shot\?\.behavior==='warp'\).*SHOTPATHS\.warpStep\(/);
 assert.match(engine,/if\(b\.shot\?\.behavior==='warp'\)\{const turn=SHOTPATHS\.warpStep\(/);
 assert.doesNotMatch(engine,/Math\.sin\((?:v|b)\.age\*19\).*500/);
 assert.match(render,/phase shots retain the same swept keeper and/);
 assert.match(engine,/if\(this\.trySweptKeeperDive\(previousBall\)\)return/);
 assert.match(engine,/if\(b\.x<F\.x\+5\|\|b\.x>F\.x\+F\.w-5\)/);
 assert.match(engine,/reducedSH06=!!this\.options\?\.reducedFlash/);
 assert.match(engine,/this\.shake=reducedSH06\?0:\.19;this\.flash=reducedSH06\?0:\.23/);
});
test('each SH06 family gets its own tell and reduced-flash rendering stays steady',()=>{
 assert.match(render,/drawShotTell\(ctx,b,shot,reducedFlash=false\)/);
 assert.match(render,/shot\.behavior==='burrow'/);assert.match(render,/shot\.behavior==='phase'/);assert.match(render,/shot\.behavior==='warp'/);
 assert.match(render,/ctx\.setLineDash\(reducedFlash\?\[7,7\]:\[13,6\]\)/);
 assert.match(render,/ctx\.globalAlpha=reducedFlash\?\.22/);
 assert.match(render,/ctx\.globalAlpha=reducedFlash\?\.17/);
 assert.match(render,/ctx\.shadowBlur=reducedFlash\?12:38/);
});
