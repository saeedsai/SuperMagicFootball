'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Crown Royals first sprite is literal transparent PNG with 3 source views',()=>{
 const buf=fs.readFileSync(path.join(root,'assets/crown_royals/alex_three_views.png'));
 assert.equal(buf.subarray(1,4).toString(),'PNG');
 assert.equal(buf.readUInt32BE(16),132);assert.equal(buf.readUInt32BE(20),90);
 const s=read('src/modules/crownroyals.js');
 for(const direction of ['front','quarterFront','side','quarterBack','back'])assert.ok(s.includes(direction));
 assert.match(s,/paintedViews:3/);assert.match(s,/quarterViews:'Alex and Leo authored; others nearest-view placeholders'/);
 assert.match(s,/const sprite=authoredQuarter\?quarter\.image:/);
 assert.match(s,/ctx\.drawImage\(sprite,/);
});
test('new team does not replace old Concept Hero and preserves canonical assets',()=>{
 const ui=read('src/modules/ui.js'),render=read('src/modules/render.js');
 assert.match(ui,/id:CONCEPT_DEMO_ID,index:TEAMS\.length,name:'Concept Royals FC'/);
 assert.match(ui,/id:CROWN_ROYALS_ID,index:TEAMS\.length,name:'Crown Royals \(Art WIP\)'/);
 assert.match(ui,/crown_royals_reference_alex/);
 assert.match(ui,/crown_royals_reference_leo/);
 assert.match(render,/CROWN_ROYALS\.draw\(ctx,p,view/);
 assert.match(read('scripts/build.py'),/'conceptmodular','crownroyals','render'/);
 assert.match(read('sw.js'),/'conceptmodular','crownroyals','render'/);
 assert.match(read('sw.js'),/assets\/crown_royals\/alex_three_views\.png/);
 assert.match(read('sw.js'),/assets\/crown_royals\/leo_three_views\.png/);
 assert.match(read('sw.js'),/assets\/crown_royals\/alex_quarter_views\.svg/);
 assert.match(read('sw.js'),/assets\/crown_royals\/leo_quarter_views\.svg/);
 assert.match(read('scripts/build.py'),/CROWN_ROYALS_ALEX_QUARTER_INLINE/);
 assert.match(read('scripts/build.py'),/CROWN_ROYALS_LEO_QUARTER_INLINE/);
});

test('new reference team keeps twelve unique 1–12 jerseys and 2/3/4/3 roles',()=>{
 const ui=read('src/modules/ui.js'),start=ui.indexOf("const CROWN_ROYALS_ID=");
 const end=ui.indexOf("const careerStorage=",start);
 assert.ok(start>0&&end>start,'new team roster source must exist');
 const vm=require('node:vm'),context={TEAMS:[]};
 vm.runInNewContext(ui.slice(start,end),context,{timeout:1000});
 const team=context.TEAMS[0],roster=team.customRoster;
 assert.equal(roster.length,12);
 assert.deepEqual(Array.from(roster,p=>p.num).sort((a,b)=>a-b),Array.from({length:12},(_,i)=>i+1));
 assert.deepEqual(['GK','DF','MF','FW'].map(role=>roster.filter(p=>p.role===role).length),[2,3,4,3]);
 assert.equal(roster.filter(p=>p.renderModel==='crown_royals_reference').length,4);
 assert.equal(roster.find(p=>p.name==='Leo').num,2);
 assert.equal(roster.find(p=>p.name==='Leo').id,'crown_royals_reference_leo');
 assert.equal(roster.find(p=>p.name==='Kwame').id,'crown_royals_reference_kwame');
 assert.equal(roster.find(p=>p.name==='Diego').id,'crown_royals_reference_diego');
 assert.equal(roster.find(p=>p.name==='Alex').num,1);
});

test('match actions feed Crown sprite transforms rather than preview-only aliases',()=>{
 const render=read('src/modules/render.js'),sprite=read('src/modules/crownroyals.js');
 assert.match(render,/CROWN_ROYALS\.draw\(ctx,p,view,\{run,action:p\.action,phase:/);
 assert.match(sprite,/action==='kick'\|\|action==='super'\?'shoot'/);
 assert.match(sprite,/action==='slide'\|\|action==='jumpTackle'\?'tackle'/);
});


test('Crown Super Shot is visually distinct and jump lift works in both phase directions',()=>{
 const src=read('src/modules/crownroyals.js').replace('export {CROWN_ROYALS};','').replace(/new URL\([^\n]*import\.meta\.url\)\.href/,"'test-sprite.png'");
 class FakeImage{constructor(){this.complete=true;this.naturalWidth=132;}set src(v){this.onload?.();}}
 const vm=require('node:vm'),art=vm.runInNewContext(src+';CROWN_ROYALS',{Image:FakeImage,Object});
 const p={src:{id:'crown_royals_reference_alex',renderModel:'crown_royals_reference'}};
 const trace=(action,phase)=>{const calls=[];const ctx={save(){},restore(){},drawImage(){},scale(...v){calls.push(['scale',...v]);},translate(...v){calls.push(['translate',...v]);},rotate(v){calls.push(['rotate',v]);}};
  assert.equal(art.draw(ctx,p,{kind:'front'},{action,phase}),true);return calls;};
 assert.equal(trace('shoot',.8).filter(x=>x[0]==='rotate').length,1);
 assert.equal(trace('super',.8).filter(x=>x[0]==='rotate').length,2);
 assert.ok(trace('super',.8).some(x=>x[0]==='translate'&&Math.abs(x[2]+6.4)<1e-8));
 for(const phase of [-.8,.8])assert.ok(trace('jump',phase).some(x=>x[0]==='translate'&&Math.abs(x[2]+12)<1e-8));
 assert.equal(trace('idle',0).filter(x=>x[0]==='rotate').length,0);
});
