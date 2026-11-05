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

test('pending PVP result survives controller recreation and recovers only the exact match from the signed-in account history',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 const target='d'.repeat(32),unrelated=row('c');let signedIn=true,calls=0;
 const first=createOnlineHistoryController({loadPage:async()=>({items:[unrelated],nextCursor:null}),isSignedIn:()=>signedIn,storage});
 assert.equal(first.rememberPendingMatch(target),true);assert.equal(first.state.pendingMatchId,target);
 const afterReload=createOnlineHistoryController({loadPage:async()=>{calls++;return{items:[unrelated,{...row('d'),matchId:target,teamId:'brazil',opponentTeamId:'japan',score:[3,2]}],nextCursor:null};},isSignedIn:()=>signedIn,storage});
 assert.equal(afterReload.state.pendingMatchId,target);
 const recovered=await afterReload.recoverPendingMatch();
 assert.equal(calls,1);assert.equal(recovered.status,'found');assert.equal(recovered.item.matchId,target);
 assert.deepEqual(recovered.item.score,[3,2]);assert.equal(recovered.item.outcome,'win');
 assert.equal(afterReload.state.pendingMatchId,target,'keep the marker until the idempotent server reward claim is confirmed');
 assert.equal(afterReload.clearPendingMatch('e'.repeat(32)),false,'an unrelated completion cannot clear the pending result');
 assert.equal(afterReload.clearPendingMatch(target),true);assert.equal(afterReload.state.pendingMatchId,null);
});

test('result recovery stays pending when exact match is absent and sign-out preserves its unresolved marker',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 const target='e'.repeat(32);let signedIn=true;
 const history=createOnlineHistoryController({loadPage:async()=>({items:[row('a')],nextCursor:null}),isSignedIn:()=>signedIn,storage});
 history.rememberPendingMatch(target);
 const missing=await history.recoverPendingMatch(target);
 assert.equal(missing.status,'pending');assert.equal(history.state.pendingMatchId,target);
 signedIn=false;history.reset();
 assert.equal(history.state.pendingMatchId,target);assert.equal((await history.recoverPendingMatch(target)).status,'signed-out');
 assert.equal(values.size,1,'sign-out clears account data but retains the unresolved match ID for a later same-account check');
});

test('history recovery refuses malformed rows and leaves the pending match available for retry',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 const target='f'.repeat(32),history=createOnlineHistoryController({loadPage:async()=>({items:[{...row('f'),matchId:target,score:[-1,0]}],nextCursor:null}),isSignedIn:()=>true,storage,describeError:()=> 'History could not be checked safely.'});
 history.rememberPendingMatch(target);
 assert.equal((await history.recoverPendingMatch()).status,'error');
 assert.equal(history.state.status,'History could not be checked safely.');assert.equal(history.state.pendingMatchId,target);
});

test('account reset invalidates a pending result lookup before it can cross into another signed-in account',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 const pending=deferred(),target='9'.repeat(32);let signedIn=true;
 const history=createOnlineHistoryController({loadPage:()=>pending.promise,isSignedIn:()=>signedIn,storage});
 history.rememberPendingMatch(target);const request=history.recoverPendingMatch();
 signedIn=false;history.reset();signedIn=true;
 pending.resolve({items:[{...row('9'),matchId:target}],nextCursor:null});
 assert.equal((await request).status,'stale');assert.equal(history.state.pendingMatchId,target);assert.equal(values.size,1);
});

test('stale recovery completion cannot clear a newer in-flight lookup after account reset',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 const first=deferred(),second=deferred(),target='8'.repeat(32);let signedIn=true,calls=0;
 const history=createOnlineHistoryController({loadPage:()=>++calls===1?first.promise:second.promise,isSignedIn:()=>signedIn,storage});
 history.rememberPendingMatch(target);const stale=history.recoverPendingMatch();
 signedIn=false;history.reset();signedIn=true;
 const current=history.recoverPendingMatch();await Promise.resolve();assert.equal(calls,2);assert.equal(history.state.recoveryLoading,true);
 first.resolve({items:[{...row('8'),matchId:target}],nextCursor:null});
 assert.equal((await stale).status,'stale');assert.equal(history.state.recoveryLoading,true);
 const duplicate=history.recoverPendingMatch();assert.equal(calls,2,'the old request did not clear the new single-flight guard');
 second.resolve({items:[{...row('8'),matchId:target}],nextCursor:null});
 assert.equal((await current).status,'found');assert.equal((await duplicate).status,'found');assert.equal(history.state.recoveryLoading,false);
});

test('a history load superseding recovery clears the stale recovery loading state',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 const recoveryPage=deferred();let calls=0;
 const history=createOnlineHistoryController({loadPage:()=>++calls===1?recoveryPage.promise:Promise.resolve({items:[],nextCursor:null}),isSignedIn:()=>true,storage});
 const target='2'.repeat(32);history.rememberPendingMatch(target);
 const recovery=history.recoverPendingMatch(target);await Promise.resolve();
 assert.equal(history.state.recoveryLoading,true);
 assert.equal(await history.load(),true,'a normal history refresh may supersede recovery');
 recoveryPage.resolve({items:[],nextCursor:null});
 assert.equal((await recovery).status,'stale');
 assert.equal(history.state.recoveryLoading,false,'the stale operation must release its own loading state');
 assert.equal((await history.recoverPendingMatch(target)).status,'pending','the recovery action is available again');
});

test('session storage failure is visible while the in-memory result remains guarded',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const storage={getItem(){return null},setItem(){throw new Error('blocked')},removeItem(){}};
 const history=createOnlineHistoryController({loadPage:async()=>({items:[],nextCursor:null}),isSignedIn:()=>true,storage});
 const target='7'.repeat(32);
 assert.equal(history.rememberPendingMatch(target),false);
 assert.equal(history.state.pendingMatchId,target);
 assert.equal(history.state.pendingMatchPersisted,false);
 assert.equal(await history.recoverPendingMatch().then(result=>result.status),'pending');
});

test('a failed storage removal keeps the reconciled ID guarded instead of silently forgetting it',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const values=new Map(),target='6'.repeat(32),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem(){throw new Error('blocked')}};
 const history=createOnlineHistoryController({loadPage:async()=>({items:[row('a')],nextCursor:null}),isSignedIn:()=>true,storage});
 history.rememberPendingMatch(target);
 assert.equal(history.clearPendingMatch(target),false);
 assert.equal(history.state.pendingMatchId,target);
});

test('bounded pending list survives account switches and removes only the exact receipted item',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 let account='A',rows=[];
 const history=createOnlineHistoryController({loadPage:async()=>({items:rows,nextCursor:null}),isSignedIn:()=>!!account,storage});
 const a='a'.repeat(32),b='b'.repeat(32);
 assert.equal(history.rememberPendingMatch(a),true);assert.equal(history.state.pendingMatchIds.length,1);
 account=null;history.reset();account='B';rows=[row('c')];
 assert.equal((await history.recoverPendingMatch(a)).status,'pending','opaque ID absent from B history does not assert ownership or discard A’s marker');
 assert.equal(history.rememberPendingMatch(b),true,'a second account may start and preserve its own unresolved match');
 assert.deepEqual(history.state.pendingMatchIds,[a,b]);
 rows=[{...row('b'),matchId:b}];assert.equal((await history.recoverPendingMatch(b)).status,'found');
 assert.equal(history.clearPendingMatch(b),true);assert.deepEqual(history.state.pendingMatchIds,[a]);
 assert.deepEqual(JSON.parse(values.get('smf.online.pending-match-result.v1')),[a]);
});

test('pending IDs deduplicate and enforce a four-item capacity without overwriting',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 const history=createOnlineHistoryController({loadPage:async()=>({items:[],nextCursor:null}),isSignedIn:()=>true,storage});
 const ids=['1','2','3','4','5'].map(char=>char.repeat(32));
 assert.equal(history.rememberPendingMatch(ids[0]),true);assert.equal(history.rememberPendingMatch(ids[0]),true);
 for(const id of ids.slice(1,4))assert.equal(history.rememberPendingMatch(id),true);
 assert.equal(history.state.pendingMatchIds.length,4);assert.equal(history.state.pendingMatchCapacityReached,true);
 assert.equal(history.rememberPendingMatch(ids[4]),false);assert.deepEqual(history.state.pendingMatchIds,ids.slice(0,4));
 assert.deepEqual(JSON.parse(values.get('smf.online.pending-match-result.v1')),ids.slice(0,4));
});

test('malformed persisted pending JSON fails closed and reports corruption',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const values=new Map([['smf.online.pending-match-result.v1','{"not":"a list"}']]);
 const storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 const history=createOnlineHistoryController({loadPage:async()=>({items:[],nextCursor:null}),isSignedIn:()=>true,storage});
 assert.equal(history.state.pendingStorageInvalid,true);assert.equal(history.state.pendingMatchCapacityReached,true);
 assert.equal(history.rememberPendingMatch('9'.repeat(32)),false);
 assert.equal((await history.recoverPendingMatch('9'.repeat(32))).status,'corrupt');
 assert.equal(values.get('smf.online.pending-match-result.v1'),' {"not":"a list"}'.trim(),'fail-closed policy preserves malformed bytes for diagnosis; it does not silently discard possible IDs');
 assert.equal(history.discardCorruptPendingMatches(),false,'discard requires explicit confirmation');
 assert.equal(history.discardCorruptPendingMatches({confirmed:true}),true);
 assert.equal(values.has('smf.online.pending-match-result.v1'),false);
 assert.equal(history.state.pendingMatchCapacityReached,false);
 assert.equal(history.rememberPendingMatch('9'.repeat(32)),true);
});

test('pending-storage read exceptions fail closed with explicit state for accessible recovery guidance',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const history=createOnlineHistoryController({loadPage:async()=>({items:[],nextCursor:null}),isSignedIn:()=>true,storage:{getItem(){throw new Error('blocked read')},setItem(){},removeItem(){}}});
 assert.equal(history.state.pendingStorageReadError,true);
 assert.equal(history.state.pendingMatchCapacityReached,true);
 assert.equal(history.state.pendingMatchPersisted,false);
 assert.equal(history.rememberPendingMatch('5'.repeat(32)),false);
 assert.equal((await history.recoverPendingMatch()).status,'corrupt');
});

test('mixed corrupt list preserves readable exact IDs for recovery and requires explicit cleanup for damaged remainder',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const target='a'.repeat(32),other='b'.repeat(32),values=new Map([['smf.online.pending-match-result.v1',JSON.stringify([target,'bad-entry',other])]]);
 const storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 const history=createOnlineHistoryController({loadPage:async()=>({items:[{...row('a'),matchId:target}],nextCursor:null}),isSignedIn:()=>true,storage});
 assert.equal(history.state.pendingStorageInvalid,true);assert.deepEqual(history.state.pendingMatchIds,[target,other]);
 assert.equal((await history.recoverPendingMatch(target)).status,'found','readable IDs remain checkable against account-scoped history');
 assert.equal(history.clearPendingMatch(target),false,'do not rewrite storage and silently lose the malformed entry');
 assert.deepEqual(history.state.pendingMatchIds,[other]);
 assert.equal(values.has('smf.online.pending-match-result.v1'),true);
 assert.equal(history.discardCorruptPendingMatches({confirmed:true}),true);
 assert.deepEqual(history.state.pendingMatchIds,[]);assert.equal(history.state.pendingMatchCapacityReached,false);
});

test('failed removal of damaged data leaves matchmaking fail-closed',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const storage={getItem:()=>'{broken',setItem(){},removeItem(){throw new Error('blocked')}};
 const history=createOnlineHistoryController({loadPage:async()=>({items:[],nextCursor:null}),isSignedIn:()=>true,storage});
 assert.equal(history.state.pendingStorageInvalid,true);
 assert.equal(history.discardCorruptPendingMatches({confirmed:true}),false);
 assert.equal(history.state.pendingStorageInvalid,true);assert.equal(history.state.pendingMatchCapacityReached,true);
});

test('pending IDs clear only on exact server-confirmed interrupted status; other statuses stay pending',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const ids=['1','2','3','4'].map(x=>x.repeat(32)),values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
 const history=createOnlineHistoryController({loadPage:async()=>({items:[],nextCursor:null}),loadStatuses:async matchIds=>({items:matchIds.map((matchId,index)=>({matchId,status:['interrupted','unknown','active','completed'][index]}))}),isSignedIn:()=>true,storage});
 for(const id of ids)assert.equal(history.rememberPendingMatch(id),true);
 const result=await history.reconcileInterruptedPending();
 assert.equal(result.status,'interrupted-cleared');assert.deepEqual(result.cleared,[ids[0]]);assert.deepEqual(history.state.pendingMatchIds,ids.slice(1));
 assert.match(result.message,/No score or reward was created/);
});

test('failed, malformed and stale status checks preserve pending IDs',async()=>{
 const {createOnlineHistoryController}=await import('../src/modules/online-history.js');
 const id='a'.repeat(32),values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};let signed=true;
 const failing=createOnlineHistoryController({loadPage:async()=>({items:[],nextCursor:null}),loadStatuses:async()=>{throw Error('offline')},isSignedIn:()=>signed,storage});
 failing.rememberPendingMatch(id);assert.equal((await failing.reconcileInterruptedPending()).status,'error');assert.deepEqual(failing.state.pendingMatchIds,[id]);
 const malformed=createOnlineHistoryController({loadPage:async()=>({items:[],nextCursor:null}),loadStatuses:async()=>({items:[]}),isSignedIn:()=>signed,storage});
 assert.equal((await malformed.reconcileInterruptedPending()).status,'error');assert.deepEqual(malformed.state.pendingMatchIds,[id]);
 const pending=deferred(),stale=createOnlineHistoryController({loadPage:async()=>({items:[],nextCursor:null}),loadStatuses:()=>pending.promise,isSignedIn:()=>signed,storage});
 const request=stale.reconcileInterruptedPending();signed=false;stale.reset();pending.resolve({items:[{matchId:id,status:'interrupted'}]});
 assert.equal((await request).status,'stale');assert.deepEqual(stale.state.pendingMatchIds,[id]);
});
