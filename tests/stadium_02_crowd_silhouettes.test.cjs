'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('src/modules/render.js','utf8');
const start=source.indexOf(' paintArenaAccents(ctx){');
const end=source.indexOf(' drawField(ctx,game){',start);
const paint=start>=0&&end>start?source.slice(start,end):'';

test('STADIUM-02 paints deterministic palette-driven crowd silhouettes inside existing stand tiers',()=>{
 assert.ok(paint.length>0,'venue accent painter exists');
 assert.match(paint,/for\(let side=0;side<2;side\+\+\)/,'crowd tiers remain on both stadium sides');
 assert.match(paint,/for\(let tier=0;tier<5;tier\+\+\)/,'existing five-tier stand layout is retained');
 assert.match(paint,/for\(let seat=0;seat<176;seat\+\+\)/,'existing crowd density/count is retained');
 assert.match(paint,/const crowdColor=\[venue\.palette\[1\],venue\.palette\[2\],venue\.palette\[3\],'#e7e3d3'\]\[hash%4\]/,'crowd color follows existing venue palette');
 assert.match(paint,/ctx\.arc\(x\+crowdW\*\.5,crowdY\+1\.5,1\.45,0,PI\*2\)/,'each marker receives a head silhouette');
 assert.match(paint,/ctx\.fillRect\(x,crowdY\+3,crowdW,3\)/,'each marker receives shoulders/body');
 assert.doesNotMatch(paint,/F\.(?:x|y|w|h)\s*=/,'stadium detail cannot change field bounds');
});
