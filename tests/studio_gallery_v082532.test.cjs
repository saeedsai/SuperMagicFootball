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
test('STUDIO-101 editor exposes every match stat and a live position OVR',()=>{
 for(const token of ['studioStatControls(player)','id="studioStatsEditor"','saveStudioStats','resetStudioStats','studioStatPreview()','storeCharacterChanges(\'edits\'','storeCharacterChanges(\'managerCareer\''])assert.ok(ui.includes(token),token);
 assert.match(ui,/type="number" inputmode="numeric" min="1" max="100" step="1"/);
 assert.match(ui,/POSITION OVR:/);
});
test('STUDIO-101 validates all 14 attributes and saves atomically without changing player identity',()=>{
 const vm=require('node:vm');
 const source=ui.slice(ui.indexOf('// STUDIO-101: edit'),ui.indexOf('function showPlayerStudio('));
 assert.ok(source.includes('function saveStudioStats()'));
 const keys=['stamina','strength','aggression','defence','speedRating','agility','dribbling','shootPower','shootAccuracy','heading','passing','crossing','gkDiving','gkSkill'];
 const fields=Object.fromEntries(keys.map(key=>['stat_'+key,{value:'65'}]));
 fields.studioStatOVR={textContent:''};
 const alerts=[],writes=[],original={id:'stable-player',role:'FW',appearance:{style:4},rating:94},ctx={
   NUMERIC_STATS:keys,$:id=>fields[id],career:null,home:0,avatarIndex:0,
   edits:{},TEAMS:[{id:'stable-team'}],roster:()=>[original],
   withStats:p=>p,overallForPosition:p=>p.shootAccuracy,
   escapeHTML:String,button:(a,b)=>a+b,alert:message=>alerts.push(message),
   storeCharacterChanges:(key,payload)=>{writes.push({key,payload});return ctx.writable},
   showPlayerStudio:()=>{},showCareerSquad:()=>{},saveCareer:()=>{},writable:true
 };
 vm.runInNewContext(source+';globalThis.read=readStudioStats;globalThis.save=saveStudioStats;globalThis.preview=studioStatPreview;',ctx);
 assert.equal(Object.keys(ctx.read()).length,14);
 fields.stat_shootAccuracy.value='91';ctx.preview();assert.equal(fields.studioStatOVR.textContent,'POSITION OVR: 91');
 for(const bad of ['0','101','4.5','', 'abc']){fields.stat_agility.value=bad;assert.throws(()=>ctx.read(),/Invalid Agility/);}
 fields.stat_agility.value='65';
 ctx.writable=false;ctx.save();assert.equal(ctx.edits['stable-team'],undefined,'failed storage cannot alter live roster');
 ctx.writable=true;ctx.save();
 assert.equal(writes.at(-1).key,'edits');
 const player=ctx.edits['stable-team'][0];
 assert.equal(player.id,'stable-player');
 assert.equal(player.rating,94,'old rating stays save-compatible');
 assert.equal(player.appearance.style,4);
 assert.equal(player.shootAccuracy,91);
 assert.equal(player.gkSkill,65);
 assert.equal(alerts.length,0);
});
