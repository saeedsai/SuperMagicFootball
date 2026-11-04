'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('src/modules/ui.js','utf8');
const start=source.indexOf('function tryCareerSign(i){'),end=source.indexOf('\nfunction tryCareerContract(',start);
assert.ok(start>=0&&end>start,'Academy sign and confirmation UI handlers are present');
const handlers=source.slice(start,end);
const confirm=handlers.slice(handlers.indexOf('function confirmCareerSign(){'));

test('Academy signing uses a labelled named-player selector and explicit confirmation/cancel',()=>{
 assert.match(handlers,/field\('PLAYER TO REPLACE','academyOutgoing',outgoing,''\)/);
 assert.match(handlers,/\['','Choose a player to replace'\]/);
 assert.match(handlers,/id="academySigningSummary"[^>]*role="status" aria-live="polite"/);
 assert.match(handlers,/button\('CONFIRM SIGNING','careerSignConfirm'/);
 assert.match(handlers,/button\('CANCEL','careerSignCancel'/);
 assert.doesNotMatch(handlers,/prompt\(/);
});

test('empty or invalid replacement fails before cloning, signing or saving the Career',()=>{
 const invalid=confirm.indexOf('if(!Number.isSafeInteger(releaseIndex)');
 const clone=confirm.indexOf('const next=JSON.parse(JSON.stringify(career))');
 const sign=confirm.indexOf('signAcademy(next,index,releaseIndex)');
 const save=confirm.indexOf('careerSlots.save(careerSlots.active,next)');
 assert.ok(invalid>=0&&clone>invalid&&sign>clone&&save>sign);
 assert.match(confirm,/releaseIndex<0\|\|releaseIndex>=12\|\|!career\.roster\?\.\[releaseIndex\]/);
});

test('cancel returns to scouting without calling the signing API or persistence',()=>{
 const cancel=handlers.slice(handlers.indexOf('function cancelCareerSign(){'),handlers.indexOf('\nfunction confirmCareerSign(){'));
 assert.match(cancel,/selectedAcademyProspect=-1;showCareerScout\(\)/);
 assert.doesNotMatch(cancel,/signAcademy|careerSlots\.save|saveCareer|store\.put/);
});

test('UI dispatch and select-change announcement are wired to the new flow',()=>{
 assert.match(source,/a==='careerSignConfirm'\)confirmCareerSign\(\)/);
 assert.match(source,/a==='careerSignCancel'\)cancelCareerSign\(\)/);
 assert.match(source,/e\.target\.id==='academyOutgoing'\)refreshAcademySigningSummary\(\)/);
});
