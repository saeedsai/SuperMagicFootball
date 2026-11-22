'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('src/modules/engine.js','utf8');
test('named Magic Trick resolution uses the visible first-touch screen reader; ordinary Dribble Styles stay separate',()=>{
 const magicStart=src.indexOf('tryMagicTrick(p){'),magicEnd=src.indexOf('updateSpinBumpFx(p,dt){',magicStart);
 const dribbleStart=src.indexOf('tryDribbleTrick(p,byAI=false){'),dribbleEnd=src.indexOf('// Safety is evaluated at release time;',dribbleStart);
 assert.ok(magicStart>=0&&magicEnd>magicStart,'named Magic Trick resolver available');
 assert.ok(dribbleStart>=0&&dribbleEnd>dribbleStart,'ordinary Dribble Style resolver available');
 const magic=src.slice(magicStart,magicEnd),dribble=src.slice(dribbleStart,dribbleEnd);
 assert.match(magic,/const counterRead=typeof defensiveMagicTrickReadTarget==='function'\?defensiveMagicTrickReadTarget\(p,rivals,true\):null/);
 assert.match(magic,/const screenReadChance=counterRead\?\.screened\?Math\.min\(\.24,\.07\+stat\(counterRead\.defender,'defence'\)\*\.0017\):0/);
 assert.match(magic,/screenRead/);
 assert.match(magic,/if\(screenRead&&counterRead\?\.defender\)counterRead\.defender\.magicReadCueTimer/);
 assert.doesNotMatch(dribble,/defensiveMagicTrickReadTarget|readBonus/);
});
