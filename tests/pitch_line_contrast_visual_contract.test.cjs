'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('src/modules/render.js','utf8');
const start=source.indexOf(' drawFieldArtwork(ctx,game){');
const end=source.indexOf('\n drawGoal(ctx,side,foreground)',start);
const field=start>=0&&end>start?source.slice(start,end):'';

test('pitch chalk uses a restrained contrast halo without moving official line geometry',()=>{
 assert.ok(field.length>0,'production pitch painter exists');
 assert.match(field,/ctx\.shadowColor='rgba\(8,22,18,\.52\)';ctx\.shadowBlur=2;ctx\.shadowOffsetX=0;ctx\.shadowOffsetY=1;/,
  'chalk has a subtle dark edge over varied turf palettes');
 assert.ok(field.indexOf('ctx.shadowColor=')<field.indexOf('ctx.strokeRect(left+4,top+4,F.w-8,F.h-8)'),
  'contrast treatment is applied before the existing marking paths');
 assert.match(field,/ctx\.strokeRect\(left\+4,top\+4,F\.w-8,F\.h-8\)/,'touchline rectangle remains fixed');
 assert.match(field,/line\(ctx,\[\[center,top\],\[center,bot\]\],'#f7f6dcdc',4\)/,'halfway line remains fixed');
 assert.match(field,/ctx\.arc\(center,cy,156,0,PI\*2\)/,'center-circle radius remains fixed');
 assert.match(field,/ctx\.strokeRect\(x\+\(side\?-310:4\),cy-230,306,460\)/,'penalty-box geometry remains fixed');
 assert.doesNotMatch(field,/F\.(?:x|y|w|h)\s*=/,'pitch extents remain read-only');
});
