const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
function runAward(block,context,score='[1,0]'){return vm.runInNewContext(`(async()=>{${block};return await awardLocalMatchTokens({type:'finished'},${score})})()`,context);}

test('match starts mint unique receipts independent of save slot or mode',()=>{
 const block=ui.slice(ui.indexOf('let activeMatchReceiptId='),ui.indexOf('let teamPlans='));
 const context={globalThis:{crypto:{randomUUID:(()=>{let id=0;return()=>`test-${++id}-unique-receipt`;})()}},Date,Math};
 const ids=vm.runInNewContext(`${block};[newMatchReceiptId(),newMatchReceiptId(),newMatchReceiptId()]`,context);
 assert.equal(new Set(ids).size,3);
 assert.ok(ids.every(id=>id.startsWith('local-match-')));
});

test('online and generic quick/versus modes never reach the wallet reward operation',async()=>{
 const block=ui.slice(ui.indexOf('async function awardLocalMatchTokens('),ui.indexOf('// A backup with an empty active slot'));
 let awards=0;const context={mode:'quick',activeMatchReceiptId:'local-match-12345678',lanRuntime:null,lanRole:null,lastCupResultCommitted:true,
  tokenWallet:{awardCompletedMatch(){awards++;return {ok:true,reward:20};}},console};
 for(const mode of ['quick','versus','online']){
  context.mode=mode;
  const run=await runAward(block,context);
  assert.equal(run,'');assert.equal(awards,0);
 }
 context.mode='career';context.lanRole='host';
 assert.equal(await runAward(block,context),'');
 assert.equal(awards,0);
 context.lanRole=null;context.activeMatchReceiptId=null;
 await runAward(block,context);
 assert.equal(awards,0);
});

test('Cup rewards require a successful durable Cup slot commit',async()=>{
 const block=ui.slice(ui.indexOf('async function awardLocalMatchTokens('),ui.indexOf('// A backup with an empty active slot'));
 let awards=0;const context={mode:'continental',activeMatchReceiptId:'local-match-12345678',lanRuntime:null,lanRole:null,lastCupResultCommitted:false,
  saveLocalTokenRecovery(){},clearLocalTokenRecovery(){},
  tokenWallet:{awardCompletedMatch(){awards++;return {ok:true,reward:30};}},console};
 const blocked=await runAward(block,context,'[2,0]');
 assert.equal(awards,0);assert.match(blocked,/could not be committed to a Cup save slot/);
 context.lastCupResultCommitted=true;
 await runAward(block,context,'[2,0]');
 assert.equal(awards,1);
});

test('full-time local rewards follow committed Career/Cup result paths only',()=>{
 const start=ui.indexOf('async function fulltime(ev){'),end=ui.indexOf('\nfunction toast(',start),handler=ui.slice(start,end);
 assert.ok(start>=0&&end>start);
 const career=handler.indexOf('careerCommitted=saveCareer()');
 const careerReward=handler.indexOf('careerCommitted?await awardLocalMatchTokens');
 const cup=handler.indexOf('applyCupMatchResult(ev.score,ev.penalties?ev.winner:null)');
 const cupReward=handler.indexOf('const tokenReward=await awardLocalMatchTokens(ev,ev.score)',cup);
 assert.ok(career>=0&&careerReward>career);
 assert.ok(cup>=0&&cupReward>cup);
 assert.match(handler,/mode==='career'&&career/);
 assert.match(handler,/mode==='continental'&&continentalRun/);
 assert.match(handler,/mode==='league'/);
 assert.match(handler,/leagueResultCommitted=persistLeagueResult\(league\)/);
 assert.match(handler,/mode==='league'\?await awardLocalMatchTokens\(ev,ev\.score\):''/);
});
