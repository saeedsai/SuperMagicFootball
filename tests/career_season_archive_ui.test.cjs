'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8');
const begin=ui.indexOf('function careerSeasonArchivePanel(');
const end=ui.indexOf('function careerSeasonReviewPanel(',begin);
assert.ok(begin>=0&&end>begin,'Past Seasons panel and route exist');
const archiveUi=ui.slice(begin,end);
const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function render(archive,teams){
 return vm.runInNewContext(archiveUi+';careerSeasonArchivePanel(archive);',{archive,TEAMS:teams,escapeHTML});
}

test('Past Seasons renders archived champion, current team names, club finish/record and cup result',()=>{
 const html=render([{season:4,clubId:7,championId:2,clubPosition:3,teamCount:8,
  clubRecord:{played:14,wins:8,draws:3,losses:3,goalDifference:9,points:27},
  cup:{status:'eliminated',wins:2}}],Array.from({length:8},(_,i)=>({name:`Current Team ${i}`})));
 for(const text of ['SEASON 4','Current Team 2','Current Team 7','#3 / 8','8-3-3 · 14 played · GD 9 · 27 pts','Eliminated from the Career Cup · 2 wins'])
  assert.ok(html.includes(text),`missing ${text}`);
 assert.match(html,/data-career-season-archive="4"/);
});

test('Past Seasons is a safe read-only route and empty/legacy archives do not mutate Career',async()=>{
 const {CAREER}=await import('../src/modules/career.js');
 const career={season:5,club:7,seasonArchive:[{season:4,clubId:7,championId:2,clubPosition:3,teamCount:8,
  clubRecord:{played:14,wins:8,draws:3,losses:3,goalDifference:9,points:27},cup:{status:'champion',wins:3}}]};
 const before=JSON.stringify(career),routes=[];
 vm.runInNewContext(archiveUi+';showCareerSeasonArchive();',{
  career,TEAMS:Array.from({length:8},(_,i)=>({name:`Team ${i}`})),
  completedSeasonArchive:CAREER.completedSeasonArchive,escapeHTML,
  button:(label,action)=>`<button data-action="${action}">${label}</button>`,
  page:(...args)=>routes.push(args),showManager:()=>routes.push(['manager']),
 });
 assert.equal(JSON.stringify(career),before,'opening the archive does not alter the active Career object');
 assert.equal(routes.length,1);assert.equal(routes[0][0],'PAST SEASONS');
 assert.match(routes[0][2],/Won the Career Cup/);
 assert.match(routes[0][2],/data-action="manager"/);
 assert.doesNotMatch(routes[0][2],/BEGIN NEXT SEASON|careerSeasonConfirm/);

 const empty=render([],[]);
 assert.match(empty,/No completed seasons have been archived yet/);
 assert.match(ui,/completedSeasonArchive\(c\)\.length/,'Manager route shows archive entry point');
 assert.match(ui,/a==='careerPastSeasons'\)showCareerSeasonArchive\(\)/,'action dispatch opens the list');
});

test('malformed legacy archive rows render escaped placeholders instead of throwing',()=>{
 const html=render([{season:'<img src=x>',clubId:99,championId:'bad',clubPosition:-1,teamCount:null,
  clubRecord:null,cup:{status:'unexpected',wins:'not-a-count'}}],[]);
 assert.doesNotMatch(html,/<img/,'malformed season metadata must not become markup');
 assert.match(html,/SEASON —/);
 assert.match(html,/Unknown team \(99\)/);
 assert.match(html,/Unknown team/);
 assert.match(html,/#— \/ —/);
 assert.match(html,/Career Cup result unavailable/);
});
