'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');const s=fs.readFileSync('src/modules/ui.js','utf8');
test('settings studio back is customization not active career',()=>{assert.match(s,/studioCareerContext\?'careerSquad':studioReturnAction/);assert.match(s,/a==='playerStudio'\)\{studioCareerContext=false;studioReturnAction='navCustomization';showPlayerStudio\(\)/);});
test('club selector is enabled for settings studio and roster editor',()=>{assert.match(s,/studioCareerContext\?'':teamField\('SELECT CLUB \/ TEAM TO EDIT','customTeam'/);assert.match(s,/case 'customTeam':\{const chosen=Number\(e\.target\.value\)/);assert.match(s,/case 'editTeam':\{const chosen=Number\(e\.target\.value\)/);});
