'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

const row=(id)=>({matchId:id.repeat(32),recordedAt:'2026-11-04T12:00:00.000Z',teamId:'japan',opponentTeamId:'brazil',score:[2,1],outcome:'win'});
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return{promise,resolve,reject};};

test('online match-history pagination is single-flight and duplicate pages are idempotent',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const pages=[{items:[row('a')],nextCursor:'next'},{items:[row('a'),row('b')],nextCursor:null}];
 let calls=0;
 const history=createOnlineHistoryController({loadPage:async()=>pages[calls++],isSignedIn:()=>true});
 const first=history.load(),duplicate=history.load();
 assert.equal(history.state.loading,true);assert.match(history.state.status,/Loading/);
 assert.equal(await duplicate,false);assert.equal(calls,1);assert.equal(await first,true);
 assert.deepEqual(history.state.items.map(item=>item.matchId),[row('a').matchId]);
 assert.equal(history.state.cursor,'next');
 assert.equal(await history.load({append:true}),true);
 assert.deepEqual(history.state.items.map(item=>item.matchId),[row('a').matchId,row('b').matchId]);
 assert.equal(history.state.cursor,null);assert.equal(await history.load({append:true}),false);assert.equal(calls,2);
});

test('sign-out invalidates an in-flight history response before another account can see it',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const pending=deferred();let signedIn=true;
 const history=createOnlineHistoryController({loadPage:()=>pending.promise,isSignedIn:()=>signedIn});
 const request=history.load();assert.equal(history.state.loading,true);
 signedIn=false;history.reset();pending.resolve({items:[row('c')],nextCursor:null});
 assert.equal(await request,false);assert.deepEqual(history.state.items,[]);assert.equal(history.state.loading,false);
});

test('history request failures remain retryable and expose only the safe message',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 let calls=0;
 const history=createOnlineHistoryController({loadPage:async()=>{if(!calls++)throw new Error('private database detail');return{items:[],nextCursor:null};},isSignedIn:()=>true,describeError:()=> 'The online request failed safely.'});
 assert.equal(await history.load(),false);assert.equal(history.state.status,'The online request failed safely.');assert.equal(history.state.loading,false);
 assert.equal(await history.load(),true);assert.match(history.state.status,/No completed online matches/);
});
