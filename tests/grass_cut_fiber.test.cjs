'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('src/modules/render.js','utf8');
const start=source.indexOf(' drawFieldArtwork(ctx,game){');
const end=source.indexOf('\n drawGoal(ctx,side,foreground)',start);
const field=start>=0&&end>start?source.slice(start,end):'';

test('natural grass fibers are sparse, static, clipped, and presentation-only',()=>{
 assert.ok(field.length>0,'production field painter exists');
 assert.match(field,/if\(terrain==='Grass'\)\{[\s\S]*?const x=F\.x\+\(\(i\*167\+23\)%997\)\/997\*F\.w,y=F\.y\+\(\(i\*347\+47\)%991\)\/991\*F\.h/,
  'fiber positions are deterministic and apply only to the natural Grass terrain');
 const layer=field.slice(field.indexOf("if(terrain==='Grass')"),field.indexOf("if(terrain==='Classic')"));
 assert.match(layer,/ctx\.rect\(F\.x,F\.y,F\.w,F\.h\);ctx\.clip\(\)/,'all fibers remain clipped to the existing field rectangle');
 assert.match(layer,/for\(let i=0;i<320;i\+\+\)/,'the cached static texture has a bounded number of tufts');
 assert.doesNotMatch(layer,/random\(|Math\.random|game\.(?:players|ball|clock|score)|F\.(?:x|y|w|h)\s*=/,'texture has no random, simulation, or geometry writes');
 assert.ok(source.indexOf('this.drawFieldArtwork(c,game)')<source.indexOf('this.fieldCache=cache'),'fiber painting stays inside the existing cached surface path');
});
