'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/render.js'),'utf8');
const field=source.slice(source.indexOf(' drawFieldArtwork(ctx,game){'),source.indexOf('\n drawGoal(ctx,side,foreground)'));

test('ground broadcast polish stays cached, subtle, bounded to turf, and geometry-neutral',()=>{
 assert.ok(field.includes('this.drawVenueSurface(ctx,game)'));
 assert.ok(field.includes('this.drawVenueMarkings(ctx,game)'));
 assert.ok(field.includes('ctx.rect(F.x,F.y,F.w,F.h);ctx.clip()'));
 assert.ok(field.includes('const passes=18,passW=F.w/passes'));
 assert.ok(field.includes('rgba(255,246,207,0.075)'));
 assert.ok(field.includes('rgba(7,25,22,0.085)'));
 assert.ok(field.indexOf('light.addColorStop')<field.indexOf('this.drawVenueSurface(ctx,game)'));
 assert.ok(field.indexOf('this.drawVenueSurface(ctx,game)')<field.indexOf('this.drawVenueMarkings(ctx,game)'));
 assert.match(source,/drawField\(ctx,game\)\{[\s\S]*?this\.fieldCacheKey=key;[\s\S]*?ctx\.drawImage\(this\.fieldCache,F\.x,F\.y\)/);
 // Field paint still uses the canonical terrain palette and unchanged official line coordinates.
 assert.match(field,/terrain==='Classic'\?\['#33844a','#3e9955'\]:terrain==='Grass'\?\['#357e40','#448e49'\]:terrain==='Dirt'\?\['#9e6b42','#ac7650'\]:\['#c7ab68','#d8bc75'\]/);
 assert.match(field,/ctx\.strokeRect\(left\+4,top\+4,F\.w-8,F\.h-8\)/);
 assert.match(field,/line\(ctx,\[\[center,top\],\[center,bot\]\],'#f7f6dcdc',4\)/);
});
