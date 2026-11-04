'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
const css=fs.readFileSync('style.css','utf8');
const home=ui.slice(ui.indexOf('function showHome(){'),ui.indexOf('function drawPoster(){'));

test('Home matches the five-mode menu and keeps the dock destinations available',()=>{
 const primary=['navQuick','navOnline','navCareer','navCups','training'];
 const dock=['squad','navCustomization','navStore','playerStudio','navSettings'];
 assert.equal((home.match(/navItem\('(Quick Match|Online|Career|Leagues & Cups|Training)'/g)||[]).length,5);
 for(const action of primary){assert.match(home,new RegExp(`navItem\\('[^']+','${action}'`),`primary route ${action}`)}
 for(const action of dock){assert.match(home,new RegExp(`tile\\('[^']+','${action}'`),`dock route ${action}`)}
 assert.match(home,/data-action="quick"/,'Kick Off remains the clear primary call to action');
 assert.match(home,/homeEventCopy[\s\S]*<strong>MAGIC CUP<\/strong>/,'featured panel mirrors the reference event label');
 assert.match(home,/navItem\('Leagues & Cups','navCups'/,'cup play remains available in the main routes');
 assert.match(home,/homeModeIconMarkup\(e\.act\)/);
 for(const action of ['navQuick','navOnline','navCareer','navCups']){assert.match(ui,new RegExp(action+':`<'))}
 assert.match(home,/class="navIcon modeGraphic modeGraphic-\$\{e\.act\}" aria-hidden="true"/);
 assert.match(ui,/function homeModeIconMarkup\(action\)/);
 assert.match(ui,/const common='focusable="false" aria-hidden="true"'/);
 assert.match(ui,/class="modeIconSvg" viewBox="0 0 48 48"/);
});

test('Mode emblems remain static, responsive, forced-color safe and motion neutral',()=>{
 assert.match(css,/\.navChoice \.modeGraphic\{/,'all Home route emblems share a consistent frame');
 assert.match(css,/\.navChoice \.modeIconSvg\{[^}]*max-width:100%;max-height:100%/);
 assert.match(css,/\.menu \.navChoice \.modeGraphic\{color:ButtonText!important;background:ButtonFace!important/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
