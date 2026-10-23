'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
function section(a,b){const x=ui.indexOf(a);assert.ok(x>=0,'missing '+a);const y=ui.indexOf(b,x+a.length);assert.ok(y>x,'missing '+b);return ui.slice(x,y);}
test('custom clubs expose player/roster edit actions without editing canonical teams',()=>{
 const src=section('function showClubs(){','function saveNewClub(){');let shown=null;
 const context={TEAMS:[{id:'national',name:'National',rank:80},{id:'club_qa',name:'QA FC',rank:82,shot:'banana'}],
 SHOTS:{banana:{name:'Banana'}},identity:()=>'',escapeHTML:String,
 button:(label,action)=>'<button data-action="'+action+'">'+label+'</button>',
 page:(title,subtitle,body)=>{shown={title,body};}};
 vm.runInNewContext(src+'\nshowClubs();',context);
 assert.equal(shown.title,'CUSTOM CLUB BUILDER');
 assert.match(shown.body,/data-action="editClubPlayers1"/);
 assert.match(shown.body,/data-action="editClubRoster1"/);
 assert.doesNotMatch(shown.body,/data-action="editClubPlayers0"/);
});
test('edit dispatch guards custom ID and preserves builder route on Back and save',()=>{
 const block=section("else if(a==='studioGalleryToggle')","else if(a==='conceptDemo')");
 assert.equal((block.match(/id\.startsWith\('club_'\)/g)||[]).length,2);
 assert.match(block,/studioCareerContext=false;studioReturnAction='clubs';showPlayerStudio\(0\)/);
 assert.match(block,/showEditor\('clubs'\)/);
 assert.match(ui,/studioCareerContext\?'careerSquad':studioReturnAction/);
 assert.match(ui,/function showEditor\(back=editorReturnAction\)\{editorReturnAction=back;page\(/);
 assert.match(ui,/showEditor\(editorReturnAction\);toast\('ROSTER SAVED'\)/);
 assert.match(ui,/a==='playerStudio'\)\{studioCareerContext=false;studioReturnAction='navCustomization';showPlayerStudio\(\)/);
});
