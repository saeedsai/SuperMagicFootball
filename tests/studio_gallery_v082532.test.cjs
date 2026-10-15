const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const render=fs.readFileSync(path.join(root,'src/modules/render.js'),'utf8');
const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');

test('rear cap identity is painted after the generic rear ellipse that formerly hid 3 styles',()=>{
 const head=render.slice(render.indexOf('function artHead('),render.indexOf('function drawTattooMark('));
 const rear=head.indexOf('drawBackHair(ctx,av.style');
 assert.ok(rear>=0);
 assert.match(head.slice(rear,rear+450),/artEllipse\(ctx,0,-17,23,15,hair,dark,2\.1\);[\s\S]*studioRearCrownIdentity\(ctx,av\.style,hair,dark\)/);
 const helper=render.slice(render.indexOf('function studioRearCrownIdentity('),render.indexOf('function drawLips('));
 for(const style of ['v===0','v===9','v===12']) assert.ok(helper.includes(style),style);
});
test('eight-view gallery reuses the current studio direction contract and preserves unsaved edits',()=>{
 assert.match(ui,/STUDIO_DIRS\.map\(\(dir,i\)=>`<figure class="studioEightViewItem"/);
 assert.match(ui,/studioGalleryOpen=!studioGalleryOpen/);
 assert.match(ui,/insertAdjacentHTML\('afterend',studioEightViewMarkup\(\)\)/);
 assert.doesNotMatch(ui.slice(ui.indexOf("else if(a==='studioGalleryToggle')"),ui.indexOf("else if(a==='studioLeft')")),/showPlayerStudio\(/);
 assert.match(ui,/drawStudioEightViewGallery\(p,appearance\)/);
});
test('gallery uses cached idle portraits without changing gameplay controls, storage or player data',()=>{
 assert.match(ui,/if\(signature===studioGallerySignature&&root\.querySelectorAll\('canvas'\)\.length===8\)return/);
 assert.match(ui,/visualFacing:dir\.view,anim:0,action:'idle'/);
 assert.match(css,/\.studioEightViewGallery\{display:grid/);
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.equal((html.match(/<button data-act=/g)||[]).length,4);
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'data/teams.json'),'utf8')).length,223);
});