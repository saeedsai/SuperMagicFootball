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

test('wet pitch reflections are shallow, deterministic, and static for reduced-flash safety',()=>{
 assert.match(field,/if\(damp&&condition==='Wet'\)\{/,'wet-only surface highlights never appear on dry turf');
 assert.match(field,/ctx\.rotate\(random\(i\+52,-\.45,\.45\)\)/,'reflection arc angle is deterministic per puddle');
 assert.match(field,/rgba\(218,242,247,\.20\)/,'grass sheen is restrained');
 assert.match(field,/rgba\(255,229,189,\.22\)/,'dirt sheen reflects the ground tint');
 assert.match(field,/bezierCurveTo\(-rx\*\.34,-ry\*\.48,rx\*\.08,-ry\*\.46,rx\*\.40,-ry\*\.29\)/,'broken arcs follow each seeded puddle shape');
 assert.doesNotMatch(field,/Date\.now|Math\.random|reducedFlash|requestAnimationFrame/,'cached water highlights do not animate or depend on reduced-flash state');
});
