'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const careerImport=import('../src/modules/career.js');
const blockStart=source.indexOf('function careerSeasonReviewPanel(');
const blockEnd=source.indexOf('\nfunction showManager(){',blockStart);
assert(blockStart>=0&&blockEnd>blockStart,'production review UI helpers exist');
const reviewBlock=source.slice(blockStart,blockEnd);
const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function career(){return {club:0,season:4,week:14,leagueFinished:true,fixtures:Array.from({length:14},()=>[]),members:[0,1],
 table:{0:{p:14,w:11,d:2,l:1,gf:29,ga:9,pts:35},1:{p:14,w:10,d:1,l:3,gf:24,ga:13,pts:31}},
 cup:{stage:2,eliminated:false,pending:false,wins:2},cash:123456,roster:[{id:'p',age:24}],history:[]};}

function harness(c,reviewSeason){
 const events={pages:[],next:0,saves:0,manager:0,alerts:[]};
 const ctx=vm.createContext({career:c,TEAMS:[{name:'Home FC'},{name:'Rivals <b>United</b>'}],
  careerSeasonReview:reviewSeason,
  escapeHTML,
  page:(title,subtitle,body,returnAction)=>events.pages.push({title,subtitle,body,returnAction}),
  button:(label,action,style)=>`<button data-action="${action}" data-style="${style||''}">${label}</button>`,
  nextSeason:()=>events.next++,
  careerSlots:{active:1,save:()=>events.saves++},store:{put(){}},
  alert:message=>events.alerts.push(message),
  showManager:()=>events.manager++});
 // Keep the production UI route and panel in the VM, substituting only the real season-review API at call time.
 const api=vm.runInContext(`(()=>{${reviewBlock};return {panel:careerSeasonReviewPanel,show:showCareerSeasonReview,begin:beginCareerNextSeason}})()`,ctx);
 return {api,events,ctx};
}

test('review panel shows champion, final table and Cup result as escaped read-only markup',async()=>{
 const C=(await careerImport).CAREER,c=career(),review=C.careerSeasonReview(c,[{name:'Home FC'},{name:'Rivals <b>United</b>'}]);
 const {api}=harness(c,(value,teams)=>C.careerSeasonReview(value,teams)),markup=api.panel(review);
 assert(markup.includes('id="careerSeasonReview"'));
 assert(markup.includes('LEAGUE CHAMPION')&&markup.includes('Home FC'));
 assert(markup.includes('11')&&markup.includes('35')&&markup.includes('Rivals &lt;b&gt;United&lt;/b&gt;'));
 assert(markup.includes('Career Cup in progress')&&markup.includes('2 wins'));
 assert(!/<button|<a\s/i.test(markup),'summary panel itself cannot edit or navigate');
});

test('opening and backing out of review do not mutate or save the Career',async()=>{
 const C=(await careerImport).CAREER,c=career(),before=structuredClone(c),h=harness(c,(value,teams)=>C.careerSeasonReview(value,teams));
 h.api.show();
 assert.equal(h.events.pages.length,1);assert.equal(h.events.pages[0].returnAction,'manager');
 assert.equal(h.events.next,0);assert.equal(h.events.saves,0);
 assert.match(h.events.pages[0].body,/data-action="careerSeasonConfirm"/);
 assert.match(source,/else if\(a==='careerSeason'\)\{if\(career\)showCareerSeasonReview\(\)\}else if\(a==='careerSeasonConfirm'\)beginCareerNextSeason\(\);/);
 // Back is a return to the same Manager action and has no save or rollover handler.
 assert.deepEqual(c,before);assert.equal(C.careerSeasonReview(c,[{name:'Home FC'},{name:'Rivals <b>United</b>'}]).available,true);
});

test('explicit begin action revalidates before rollover; unavailable legacy data never rolls forward',async()=>{
 const C=(await careerImport).CAREER,review=(value,teams)=>C.careerSeasonReview(value,teams);
 const ready=career(),h=harness(ready,review);
 h.api.begin();
 assert.equal(h.events.next,1);assert.equal(h.events.saves,1);assert.equal(h.events.manager,1);
 assert.deepEqual(h.events.alerts,[]);
 const incomplete=career();incomplete.leagueFinished=false;
 const bad=harness(incomplete,review),before=structuredClone(incomplete);
 bad.api.show();
 assert.equal(bad.events.pages[0].title,'SEASON REVIEW UNAVAILABLE');
 assert.doesNotMatch(bad.events.pages[0].body,/careerSeasonConfirm/);
 bad.api.begin();
 assert.equal(bad.events.next,0);assert.equal(bad.events.saves,0);assert.deepEqual(incomplete,before);
});
