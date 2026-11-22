'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('src/modules/engine.js','utf8');
test('Magic Trick resolution uses the best active visible counter-reader, including a first-touch lane screen',()=>{
 const start=src.indexOf('tryDribbleTrick(p,byAI=false)'),end=src.indexOf('const forward=norm(',start);
 assert.ok(start>=0&&end>start,'trick resolution available');
 const body=src.slice(start,end);
 assert.match(body,/const counterRead=defensiveMagicTrickReadTarget\(p,opponents,true\)/);
 assert.match(body,/const readBonus=counterRead\?Math\.min\(\.24,\.07\+stat\(counterRead\.defender,'defence'\)\*\.0017\):0/);
 assert.match(body,/Math\.max\(\.08,dribbleOdds\(skill,threat,style\)-readBonus\)/);
 assert.match(body,/const success=!threat/);
});
