'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ui=fs.readFileSync(path.resolve('src/modules/ui.js'),'utf8');
const heading=ui.indexOf('<h3 class="titleSmall">LEADERSHIP & SET PIECES</h3>');
const start=ui.indexOf('Corner kicks now restart from the correct corner',heading);
const end=ui.indexOf('</p>',start);
assert(heading>=0&&start>heading&&end>start,'Team Command Center set-piece status copy must exist');
const section=ui.slice(heading,end);

test('Team Command Center describes the limited free-kick and penalty triggers and remaining rule gaps',()=>{
 assert.match(section,/Corner kicks now restart from the correct corner/);
 assert.match(section,/saved taker takes it when on the field/);
 assert.match(section,/A successful grounded slide from behind on a moving carrier awards a direct free kick/);
 assert.match(section,/or a penalty when the foul is inside the defending penalty area/);
 assert.match(section,/Other foul and card handling is not implemented/);
 assert.doesNotMatch(section,/Free-kick\/corner roles are saved, but those restart mechanics are not yet playable/);
 assert.doesNotMatch(section,/direct free-kick restarts are not playable yet/);
});
