'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const begin=ui.indexOf('const STUDIO_MAGIC_TRICKS=');
const end=ui.indexOf('function studioMagicSaveState(',begin);
assert.ok(begin>=0&&end>begin,'use shipped Studio catalogue and descriptions');
const {render,guides}=vm.runInNewContext('(()=>{'+ui.slice(begin,end)+';return {render:studioMagicCounterPlaybook,guides:STUDIO_MAGIC_TRICK_GUIDES};})()',{
 escapeHTML:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
});
test('all fourteen Tricks appear in a collapsible read-only defender counter reference',()=>{
 const html=render();
 assert.match(html,/<details id="studioMagicCounterPlaybook"/);
 assert.match(html,/DEFENDER COUNTER PLAYBOOK · 14 TRICKS/);
 assert.equal((html.match(/<li>/g)||[]).length,14);
 for(const name of ['Banana Peel','Ice Patch','Bat Strike','Fireball','Freeze','Scream','Hide Ball','Teleport','Shoulder Ride','Spin Bump','Sand Trap','Lightning','Wind','Mud'])assert.ok(html.includes('<strong>'+name+'</strong>'),name);
 assert.match(html,/PASS for a timed close-range poke/);
 assert.match(html,/SHOOT for a grounded slide/);
 assert.match(html,/JUMP to avoid airborne-clearable attacks/);
 assert.match(html,/hold DRIBBLE for 1 second while carrying the ball/);
 assert.match(html,/not every counter works against every Trick/);
 assert.match(html,/DRIBBLE activates an equipped Trick/);
 assert.doesNotMatch(html,/<button|data-action=|<input|<select/);
});
test('Hide Ball guide matches the actual grounded timed PASS-poke counter',()=>{
 assert.match(guides.hideBall,/grounded defender facing the carrier.*timed PASS poke/);
 assert.match(render(),/Hide Ball<\/strong>[^<]*timed PASS poke/);
 assert.match(engine,/const hideBallPoked=id==='hideBall'/);
 assert.match(engine,/rival\.action==='punch'&&Number\.isFinite\(rival\.actionTimer\)/);
 assert.match(engine,/Number\.isFinite\(rival\.z\)&&rival\.z<20/);
});
test('outfield and goalkeeper Studio share the same playbook without a new action',()=>{
 const start=ui.indexOf('const magicSelector=');
 const end=ui.indexOf("studioGallerySignature='';",start);
 assert.ok(start>0&&end>start);
 const selector=ui.slice(start,end);
 assert.equal((selector.match(/\$\{studioMagicCounterPlaybook\(\)\}/g)||[]).length,2);
 assert.match(selector,/id="studioGKMagicPreview"/);
 assert.match(selector,/id="studioMagicGuide"/);
 assert.match(ui,/Tricks have cooldown and Energy cost/);
});

test('counter guide remains safe read-only HTML and matches existing four-button control vocabulary',()=>{
 const html=render();
 assert.equal((html.match(/<details /g)||[]).length,1);
 assert.equal((html.match(/<summary>/g)||[]).length,1);
 assert.match(html,/Read the individual entries below/);
 assert.doesNotMatch(html,/<button|<input|<select|data-action=|onclick=/i);
 assert.doesNotMatch(html,/fifth button|new action/i);
});
