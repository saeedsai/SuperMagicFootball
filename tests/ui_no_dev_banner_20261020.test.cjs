'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
function part(begin,end){
 const start=ui.indexOf(begin);
 assert.ok(start>=0,'missing '+begin);
 const finish=ui.indexOf(end,start+begin.length);
 assert.ok(finish>start,'missing '+end);
 return ui.slice(start,finish);
}
test('home screen no longer displays dev / version hint, About stays reachable',()=>{
 const home=part('function showHome(){','function drawPoster(){');
 assert.doesNotMatch(home,/homeVersion|DEV\s*[→>-]\s*ABOUT|DEV VERSION IN ABOUT|LATEST DEV VERSION/i);
 assert.match(home,/CREDITS\s*\/\s*ABOUT/);
 assert.match(home,/navAbout/);
 assert.match(home,/navQuick/);
});
test('ordinary page header remains usable without dev version hint',()=>{
 const header=part('function page(title,subtitle,body,returnAction=', '// v0.8.24.7');
 assert.doesNotMatch(header,/DEV VERSION IN ABOUT|LATEST DEV VERSION/i);
 assert.match(header,/HIGH-DEFINITION CARTOON SOCCER/);
 assert.match(header,/button\('← BACK',returnAction/);
});
test('ordinary submenus never show dev version label',()=>{
 const menu=part('function menuChoices(', 'const comingLater=');
 assert.doesNotMatch(menu,/DEV VERSION IN ABOUT|DEV → ABOUT|LATEST DEV VERSION/i);
 assert.match(menu,/SUPERMAGIC FOOTBALL/);
 assert.match(menu,/button\('← BACK',back/);
});
test('About shows offline release notes without a remote dev SHA',()=>{
 const about=part('function showAbout(){', 'function showHome(){');
 assert.match(about,/aboutBundleVersion/);
 assert.match(about,/aboutReleaseNotes/);
 assert.match(ui,/RELEASE\.version/);
 assert.doesNotMatch(ui,/sha\.slice\(0,12\)/);
 assert.match(about,/WHAT'S NEW/);
});
test('four controls and gameplay-specific screens remain present',()=>{
 assert.match(ui,/const actions=\['pass','shoot','dribble','jump'\]/);
 assert.match(ui,/function showControls\(\)/);
 assert.match(ui,/function showSquad\(/);
});
