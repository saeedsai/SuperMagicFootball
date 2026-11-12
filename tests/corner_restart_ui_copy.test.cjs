'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ui=fs.readFileSync('src/modules/ui.js','utf8');

test('Team Command Center only offers captain and shootout roles',()=>{
 assert.match(ui,/LEADERSHIP & PENALTY SHOOTOUTS/);
 assert.match(ui,/\['captain','CAPTAIN'\],\['penalty','PENALTY SHOOTOUTS'\]/);
 assert.doesNotMatch(ui,/\['freeKick','FREE KICKS'\]|\['corner','CORNERS'\]/);
 assert.match(ui,/Arcade play has no fouls, free kicks, corners, goal kicks or throw-ins/);
 assert.match(ui,/freeKick:previous\.freeKick,corner:previous\.corner/,'legacy saved plan keys remain compatible');
});
