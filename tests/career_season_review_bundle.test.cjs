'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const built=path.join(root,'tests/.generated/game.js');

test('generated bundle retains careerSeasonReview in the CAREER public API',()=>{
 assert.ok(fs.existsSync(built),'run python scripts/build.py before this built-bundle contract');
 const source=fs.readFileSync(built,'utf8');
 const start=source.indexOf('const CAREER=(()=>');
 const nextModule=source.indexOf('// Independent, atomic, local-only Career slots.',start);
 assert.ok(start>=0&&nextModule>start,'generated bundle contains the Career module');
 const careerModule=source.slice(start,nextModule);
 assert.match(careerModule,/function careerSeasonReview\(c,teams=\[\]\)/,'generated bundle includes the helper implementation');
 assert.match(careerModule,/function completedSeasonArchive\(c\)/,'generated bundle includes the read-only archive accessor');
 assert.match(careerModule,/function archiveCompletedSeason\(c\)/,'generated rollover archives verified completed seasons');
 const returnStart=careerModule.lastIndexOf('return {');
 const returnEnd=careerModule.indexOf('};})();',returnStart);
 assert.ok(returnStart>=0&&returnEnd>returnStart,'Career module has a public return object');
 assert.match(careerModule.slice(returnStart,returnEnd),/\bcareerSeasonReview\b/,'helper is exported on CAREER');
 assert.match(careerModule.slice(returnStart,returnEnd),/\bcompletedSeasonArchive\b/,'archive accessor is exported on CAREER');
 const html=fs.readFileSync(path.join(root,'tests/.generated/play.html'),'utf8');
 assert.ok(html.includes('function careerSeasonReview(c,teams=[])'),'generated browser fixture contains the helper');
 assert.ok(html.includes('function completedSeasonArchive(c)'),'generated browser fixture contains archive support');
});
