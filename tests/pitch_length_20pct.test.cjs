// Match-field longitudinal extension: one canonical JSON geometry for gameplay and rendering.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const m=JSON.parse(read('data/mechanics/gameplay.json'));
const w=m.world,f=w.field,near=(a,b)=>Math.abs(a-b)<1e-7;
test('field extends exactly 20% lengthwise; original width and margins remain',()=>{
 assert.ok(near(f.w,1884*1.2),'field length must be 120% of prior version');
 assert.equal(f.h,1220);assert.equal(f.y,155);assert.equal(f.x,150);
 assert.ok(near(w.w,2560.8));assert.equal(w.h,1530);
 assert.ok(near(w.w-(f.x+f.w),f.x),'goal-side world margins must match');
 assert.ok(near(f.x+f.w/2,w.w/2),'kickoff/center circle stays centered');
 assert.equal(w.goalTop,620);assert.equal(w.goalBottom,910);assert.equal(w.goalDepth,76);
});
test('modular game engine derives both goals, midfield and formations from shared field',()=>{
 const source=read('src/modules/engine.js');
 assert.match(source,/const WORLD=GAME_ASSETS\.mechanics\.world/);
 assert.match(source,/const F=WORLD\.field,\s*MID=F\.x\+F\.w\/2/);
 assert.match(source,/CX=\(t\)=>t===0\?F\.x:F\.x\+F\.w/);
 assert.match(source,/F\.x\+\(t===0\?home\.x:1-home\.x\)\*F\.w/);
 assert.match(source,/x:MID,y:F\.y\+F\.h\*\.5/);
});
test('live field artwork, goalposts, minimap and camera share geometry',()=>{
 const src=read('src/modules/render.js');
 assert.match(src,/const F=WORLD\.field/);
 assert.match(src,/cache\.width=Math\.ceil\(F\.w\)/);
 assert.match(src,/F\.x\+F\.w-this\.screenW/);
 assert.match(src,/let x=side\?F\.x\+F\.w:F\.x/);
 assert.match(src,/WORLD\.w-this\.screenW/);
 assert.match(src,/center=\(left\+right\)\/2/);
});
test('gameplay options, rosters and player index schema stay untouched by this geometry release',()=>{
 assert.equal(Object.keys(m.formations).length,6);
 assert.equal((read('index.html').match(/data-act="/g)||[]).length,4);
 assert.equal(m.world.field.h,1220);
});
test('updated offline shell version includes the new mechanics file',()=>{
 const sw=read('sw.js');
 assert.match(sw,/smf-082534-physics-tuning-v1/);
 assert.match(sw,/mechanics\/gameplay\.json/);
 assert.match(sw,/characterart/);
});
