'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

let ECONOMY;
async function api(){return ECONOMY??=(await import('../src/modules/economy.js')).ECONOMY;}
function memory(seed={}){
 const values=new Map(Object.entries(seed));
 return {values,getItem:key=>values.has(key)?values.get(key):null,
  setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
}
function memoryIndexedDB(){
 const databases=new Map();let failNextQuota=false;
 const copy=value=>value===undefined?undefined:structuredClone(value);
 function request(execute,tx=null){
  const req={result:undefined,error:null,onsuccess:null,onerror:null};
  if(tx)tx.queue.push({req,execute});
  else queueMicrotask(()=>{try{req.result=execute();req.onsuccess?.({target:req});}catch(error){req.error=error;req.onerror?.({target:req});}});
  return req;
 }
 function makeDatabase(name){
  const database={name,stores:new Map(),tail:Promise.resolve(),objectStoreNames:{contains:key=>database.stores.has(key)},
   createObjectStore(storeName,{keyPath}={}){database.stores.set(storeName,{keyPath,map:new Map()});return {};},
   close(){},
   transaction(names,mode='readonly'){
    if(!Array.isArray(names))names=[names];
    const tx={mode,error:null,oncomplete:null,onabort:null,onerror:null,aborted:false,queue:[],maps:null,
     objectStore(storeName){if(!names.includes(storeName))throw Error('Store outside transaction');const store=database.stores.get(storeName);if(!store)throw Error('Store missing');
      const map=()=>tx.maps?.get(storeName)||store.map;
      const enqueue=execute=>request(execute,tx);
      return {
       get:key=>enqueue(()=>copy(map().get(key))),
       getAll:()=>enqueue(()=>[...map().values()].map(copy)),
       count:()=>enqueue(()=>map().size),
       put:value=>enqueue(()=>{if(failNextQuota){failNextQuota=false;const error=Error('disk full');error.name='QuotaExceededError';throw error;}const row=copy(value),key=row?.[store.keyPath];map().set(key,row);return key;}),
       add:value=>enqueue(()=>{const row=copy(value),key=row?.[store.keyPath];if(map().has(key)){const error=Error('duplicate key');error.name='ConstraintError';throw error;}map().set(key,row);return key;}),
       clear:()=>enqueue(()=>{map().clear();return undefined;})
      };
     },
     abort(){if(tx.aborted)return;tx.aborted=true;tx.error=tx.error||Error('Transaction aborted');}
    };
    const previous=database.tail;let release;database.tail=new Promise(resolve=>release=resolve);
    queueMicrotask(async()=>{
     await previous;
     tx.maps=new Map(names.map(storeName=>{const store=database.stores.get(storeName);return [storeName,mode==='readwrite'?new Map([...store.map].map(([key,value])=>[key,copy(value)])):store.map];}));
     try{
      while(tx.queue.length&&!tx.aborted){const item=tx.queue.shift();try{item.req.result=item.execute();item.req.onsuccess?.({target:item.req});}catch(error){item.req.error=error;tx.error=error;item.req.onerror?.({target:item.req});if(!tx.aborted)tx.aborted=true;}await Promise.resolve();}
      if(tx.aborted){tx.onabort?.({target:tx});}
      else{if(mode==='readwrite')for(const [storeName,map] of tx.maps)database.stores.get(storeName).map=map;tx.oncomplete?.({target:tx});}
     }finally{release();}
    });
    return tx;
   }
  };
  return database;
 }
 return {failQuota(){failNextQuota=true;},open(name,version){
  const req={result:null,error:null,onsuccess:null,onerror:null,onupgradeneeded:null,onblocked:null};
  queueMicrotask(()=>{let db=databases.get(name),fresh=!db;if(!db){db=makeDatabase(name);databases.set(name,db);}req.result=db;
   if(fresh)req.onupgradeneeded?.({target:req});req.onsuccess?.({target:req});});
  return req;
 }};
}
async function createWallet(economy,storage=memory(),indexedDB=memoryIndexedDB()){
 const wallet=economy.create(storage,{indexedDB,BroadcastChannel:null});
 const ready=await wallet.ready;return {wallet,storage,indexedDB,ready};
}
const receipt=(id='receipt-0001',mode='career',result='win',status='completed')=>({receiptId:id,mode,result,status});

test('new durable wallet is additive and pays fixed rewards across supported match modes',async()=>{
 const economy=await api(),career={club:12,roster:[{id:'existing-player'}]},storage=memory({'legend_managerCareer':JSON.stringify(career)});
 const {wallet}=await createWallet(economy,storage);assert.equal((await wallet.ready).ok,true);
 assert.deepEqual(wallet.wallet(),{schema:2,tokens:0,unlocks:[],receipts:[]});
 for(const mode of ['career','cup','tournament','continental','online'])assert.equal((await wallet.awardCompletedMatch(receipt('receipt-'+mode+'-001',mode,'win'))).reward,economy.REWARDS.completion+economy.REWARDS.winBonus);
 assert.equal(wallet.wallet().tokens,150);
 assert.deepEqual(JSON.parse(storage.getItem('legend_managerCareer')),career,'wallet writes must not rewrite Career saves');
 assert.equal(storage.getItem(economy.KEY),null,'new IDB wallet does not rewrite or remove legacy bytes');
 assert.equal(economy.TOKEN_PACKS_ENABLED,false);wallet.close();
});

test('wins draws and losses pay their documented fixed rewards',async()=>{
 const {REWARDS}=await api(),{wallet}=await createWallet(await api());
 assert.equal((await wallet.awardCompletedMatch(receipt('result-win-001'))).reward,REWARDS.completion+REWARDS.winBonus);
 assert.equal((await wallet.awardCompletedMatch(receipt('result-draw-001','cup','draw'))).reward,REWARDS.completion+REWARDS.drawBonus);
 assert.equal((await wallet.awardCompletedMatch(receipt('result-loss-001','online','loss'))).reward,REWARDS.completion+REWARDS.lossBonus);
 assert.equal(wallet.wallet().tokens,REWARDS.completion*3+REWARDS.winBonus+REWARDS.drawBonus);wallet.close();
});

test('unfinished unsupported malformed and short receipts never award tokens',async()=>{
 const {wallet}=await createWallet(await api()),before=wallet.wallet();
 for(const input of [receipt('unfinished-001','career','win','abandoned'),receipt('bad-result-0001','career','forfeit'),receipt('unknown-mode-01','arcade','win'),receipt('short'),null])
  assert.equal((await wallet.awardCompletedMatch(input)).ok,false);
 assert.deepEqual(wallet.wallet(),before);wallet.close();
});

test('duplicate receipts remain exact and idempotent across reload and mode changes',async()=>{
 const economy=await api(),storage=memory(),indexedDB=memoryIndexedDB(),firstWallet=economy.create(storage,{indexedDB,BroadcastChannel:null});
 await firstWallet.ready;assert.equal((await firstWallet.awardCompletedMatch(receipt('same-result-0001','career','win'))).reward,30);
 const secondWallet=economy.create(storage,{indexedDB,BroadcastChannel:null});await secondWallet.ready;
 const replay=await secondWallet.awardCompletedMatch(receipt('same-result-0001','online','win'));
 assert.equal(replay.duplicate,true);assert.equal(replay.reward,0);assert.equal(secondWallet.wallet().tokens,30);
 assert.equal(secondWallet.wallet().receipts.length,1);firstWallet.close();secondWallet.close();
});

test('cross-tab same-receipt race commits one reward and one exact receipt',async()=>{
 const economy=await api(),storage=memory(),indexedDB=memoryIndexedDB(),left=economy.create(storage,{indexedDB,BroadcastChannel:null}),right=economy.create(storage,{indexedDB,BroadcastChannel:null});
 await Promise.all([left.ready,right.ready]);
 const results=await Promise.all([left.awardCompletedMatch(receipt('race-result-0001')),right.awardCompletedMatch(receipt('race-result-0001','online','win'))]);
 assert.equal(results.filter(value=>value.ok).length,1);assert.equal(results.filter(value=>value.duplicate).length,1);
 assert.equal((await left.exportWallet()).tokens,30);assert.deepEqual((await right.exportWallet()).receipts,['race-result-0001']);left.close();right.close();
});

test('schema1 wallet migrates atomically to IDB without deleting its old bytes',async()=>{
 const economy=await api(),legacy={schema:1,tokens:42,unlocks:['appearance:skin:3'],receipts:['old-receipt-0001']},legacyBytes=JSON.stringify(legacy),storage=memory({[economy.KEY]:legacyBytes}),indexedDB=memoryIndexedDB();
 const {wallet}=await createWallet(economy,storage,indexedDB);
 assert.deepEqual(wallet.wallet(),{schema:2,tokens:legacy.tokens,unlocks:legacy.unlocks,receipts:legacy.receipts});assert.equal(storage.getItem(economy.KEY),legacyBytes);
 const reloaded=economy.create(storage,{indexedDB,BroadcastChannel:null});await reloaded.ready;
 assert.equal((await reloaded.awardCompletedMatch(receipt('old-receipt-0001','cup'))).duplicate,true);
 assert.equal(reloaded.wallet().tokens,42);assert.equal(storage.getItem(economy.KEY),legacyBytes);wallet.close();reloaded.close();
});

test('corrupt legacy wallet fails closed and preserves all source bytes',async()=>{
 const economy=await api(),storage=memory({[economy.KEY]:'{bad',legend_managerCareer:'{"club":4}'}),{wallet}=await createWallet(economy,storage);
 assert.equal(wallet.wallet(),null);assert.match(wallet.error,/Invalid legacy wallet JSON/);assert.equal(wallet.readOnly,true);
 await assert.rejects(wallet.awardCompletedMatch(receipt('blocked-result-01')),/read-only/);
 assert.equal(storage.getItem(economy.KEY),'{bad');assert.equal(storage.getItem('legend_managerCareer'),' {"club":4}'.trim());wallet.close();
});

test('IDB quota failure is atomic, visible, and retryable after storage is freed',async()=>{
 const economy=await api(),storage=memory(),indexedDB=memoryIndexedDB(),{wallet}=await createWallet(economy,storage,indexedDB);
 indexedDB.failQuota();await assert.rejects(wallet.awardCompletedMatch(receipt('quota-result-001')),/storage is full/i);
 assert.equal(wallet.wallet().tokens,0);assert.equal(wallet.wallet().receipts.length,0);assert.equal(wallet.readOnly,true);
 const retry=await wallet.retry();assert.equal(retry.ok,true);assert.equal(wallet.readOnly,false);
 assert.equal((await wallet.awardCompletedMatch(receipt('quota-result-001'))).ok,true);assert.equal(wallet.wallet().tokens,30);wallet.close();
});

test('wallet is fail-closed when IndexedDB is unavailable without blocking offline game boot',async()=>{
 const economy=await api(),{wallet,ready}=await createWallet(economy,memory(),null);
 assert.equal(ready.ok,false);assert.equal(wallet.wallet(),null);assert.equal(wallet.readOnly,true);
 await assert.rejects(wallet.purchase({category:'team',id:'team-1'},[{category:'team',id:'team-1',existing:true,availableForPurchase:true}]),/read-only/);wallet.close();
});

test('schema2 full-fidelity import/export supports more than the old 4096 receipt ceiling',async()=>{
 const economy=await api(),source=await createWallet(economy),receipts=Array.from({length:5000},(_,index)=>'match-receipt-'+String(index).padStart(6,'0'));
 assert.equal(economy.MAX_RECEIPTS_V2,409600,'short generated receipts have an explicit 100× legacy count ceiling');
 const imported={schema:2,tokens:456,unlocks:['superShot:banana'],receipts};assert.equal(economy.validWallet(imported),true);
 await source.wallet.importWallet(imported);const exported=await source.wallet.exportWallet();assert.deepEqual(exported,imported);source.wallet.close();
});

test('schema2 IDs with heavy JSON escaping still fit the full-save byte ceiling',async()=>{
 const {validWallet}=await api();
 const receipts=Array.from({length:215000},(_,index)=>'\\'.repeat(75)+'"'.repeat(75)+String(index).padStart(10,'0'));
 assert.equal(receipts.every(id=>id.length===160),true);
 assert.equal(validWallet({schema:2,tokens:0,unlocks:[],receipts}),false,'byte limit rejects a full-fidelity archive larger than the shared 64 MiB ceiling');
});

test('schema1 imports remain bounded and schema2 validates all IDs and uniqueness',async()=>{
 const economy=await api(),oldReceipts=Array.from({length:economy.MAX_RECEIPTS+1},(_,i)=>'old-receipt-'+String(i).padStart(6,'0'));
 assert.equal(economy.validWallet({schema:1,tokens:1,unlocks:[],receipts:oldReceipts}),false);
 assert.equal(economy.validWallet({schema:2,tokens:1,unlocks:[],receipts:['bad\nreceipt']}),false);
 assert.equal(economy.validWallet({schema:2,tokens:1,unlocks:[],receipts:['same-receipt-01','same-receipt-01']}),false);
 assert.equal(economy.validWallet({schema:2,tokens:-1,unlocks:[],receipts:[]}),false);
 assert.equal(economy.validWallet({schema:2,tokens:1.5,unlocks:[],receipts:[]}),false);
 assert.equal(economy.validWallet({...economy.emptyWallet(),unlocks:['team:club-1','team:club-1']}),false);
});

test('receipt-byte capacity is checked atomically inside the same IDB wallet transaction',async()=>{
 const {createEconomyStore}=await import('../src/modules/economy-store.js'),indexedDB=memoryIndexedDB(),storage=memory();
 const store=createEconomyStore({storage,indexedDB,BroadcastChannelImpl:null,validateLegacy:()=>false,validateWallet:()=>true,
  maxReceipts:409600,maxReceiptBytes:35,receiptStorageBytes:id=>id.length+10});
 await store.ready;
 assert.equal((await store.award('receipt-one-001',{mode:'career',result:'win',reward:30})).result.ok,true);
 const rejected=await store.award('receipt-two-002',{mode:'cup',result:'win',reward:30});
 assert.equal(rejected.result.reason,'receipt-capacity');assert.equal(rejected.wallet.tokens,30);
 assert.deepEqual(rejected.wallet.receipts,['receipt-one-001']);store.close();
});

test('wallet unlock purchase atomically enforces the 4096 collection limit across tabs',async()=>{
 const economy=await api(),storage=memory(),indexedDB=memoryIndexedDB(),initial={schema:2,tokens:1000,unlocks:Array.from({length:economy.MAX_UNLOCKS-1},(_,i)=>`team:club-${i}`),receipts:[]};
 const left=economy.create(storage,{indexedDB,BroadcastChannel:null}),right=economy.create(storage,{indexedDB,BroadcastChannel:null});
 await Promise.all([left.ready,right.ready]);await left.importWallet(initial);await Promise.all([left.retry(),right.retry()]);
 const catalog=[{id:'new-a',category:'team',existing:true,availableForPurchase:true},{id:'new-b',category:'team',existing:true,availableForPurchase:true}];
 const results=await Promise.all([left.purchase(catalog[0],catalog),right.purchase(catalog[1],catalog)]);
 assert.equal(results.filter(row=>row.ok).length,1);assert.equal(results.filter(row=>row.reason==='unlock-capacity').length,1);
 assert.equal((await left.exportWallet()).unlocks.length,economy.MAX_UNLOCKS);left.close();right.close();
});

test('store buys allowlisted existing items at category prices with no caller-set price',async()=>{
 const economy=await api(),catalog=[
  {id:'shot-dolphin',category:'superShot',existing:true,availableForPurchase:true},{id:'trick-rainbow',category:'magicTrick',existing:true,availableForPurchase:true},
  {id:'club-existing-1',category:'team',existing:true,availableForPurchase:true},{id:'player-existing-1',category:'player',existing:true,availableForPurchase:true},
  {id:'hair-style-4',category:'appearance',existing:true,availableForPurchase:true},{id:'headband-1',category:'accessory',existing:true,availableForPurchase:true}
 ];
 const {wallet}=await createWallet(economy,memory({[economy.KEY]:JSON.stringify({schema:1,tokens:2000,unlocks:[],receipts:[]})}));
 for(const item of catalog){const first=await wallet.purchase({...item,cost:0},catalog);assert.equal(first.ok,true,item.category);assert.equal(first.cost,economy.PRICES[item.category]);assert.equal((await wallet.purchase(item,catalog)).reason,'already-owned');assert.equal(wallet.owns(item.category,item.id),true);}
 const expected=2000-catalog.reduce((sum,item)=>sum+economy.PRICES[item.category],0);assert.equal(wallet.wallet().tokens,expected);assert.equal(wallet.wallet().unlocks.length,catalog.length);wallet.close();
});

test('store rejects synthetic, unlisted, locked, invalid and unaffordable entries without spending',async()=>{
 const economy=await api(),catalog=[{id:'existing-shot-1',category:'superShot',existing:true,availableForPurchase:true},{id:'locked-for-later',category:'accessory',existing:true,availableForPurchase:false},{id:'invented-shot',category:'superShot',existing:false,availableForPurchase:true}],{wallet}=await createWallet(economy,memory({[economy.KEY]:JSON.stringify({schema:1,tokens:10,unlocks:[],receipts:[]})}));
 for(const item of catalog)assert.equal((await wallet.purchase(item,catalog)).ok,false);
 assert.equal((await wallet.purchase({category:'superShot',id:'not-listed'},catalog)).reason,'not-in-existing-store-catalog');
 assert.equal((await wallet.purchase({category:'newTeam',id:'club'},catalog)).reason,'invalid-item');assert.equal(wallet.wallet().tokens,10);wallet.close();
});

test('legacy Career choices remain free when token purchases add bonus collection entries',async()=>{
 const economy=await api(),legacyCareer={teamId:'club-free-01',selectedPlayerId:'player-free-01',roster:[{id:'player-free-01',role:'FW'}]},careerBytes=JSON.stringify(legacyCareer),
  catalog=[{id:'club-free-01',category:'team',existing:true,availableForPurchase:false},{id:'club-bonus-02',category:'team',existing:true,availableForPurchase:true},{id:'player-free-01',category:'player',existing:true,availableForPurchase:false},{id:'player-bonus-02',category:'player',existing:true,availableForPurchase:true}],
  storage=memory({legend_managerCareer:careerBytes,[economy.KEY]:JSON.stringify({schema:1,tokens:1000,unlocks:[],receipts:[]})}),{wallet}=await createWallet(economy,storage);
 assert.equal((await wallet.purchase(catalog[0],catalog)).reason,'not-in-existing-store-catalog');assert.equal((await wallet.purchase(catalog[2],catalog)).reason,'not-in-existing-store-catalog');
 assert.equal((await wallet.purchase(catalog[1],catalog)).ok,true);assert.equal((await wallet.purchase(catalog[3],catalog)).ok,true);
 assert.equal(wallet.owns('team','club-bonus-02'),true);assert.equal(wallet.owns('player','player-bonus-02'),true);
 assert.equal(storage.getItem('legend_managerCareer'),careerBytes);assert.equal(wallet.wallet().tokens,1000-economy.PRICES.team-economy.PRICES.player);wallet.close();
});

test('legacy save opens an additive wallet without rewriting its original selection bytes',async()=>{
 const economy=await api(),legacyCareer={teamId:'club-legacy-04',players:['player-legacy-01','player-legacy-02'],formation:'4-3-3'},careerBytes=JSON.stringify(legacyCareer),storage=memory({legend_managerCareer:careerBytes}),{wallet}=await createWallet(economy,storage);
 assert.deepEqual(wallet.wallet(),economy.emptyCurrentWallet());assert.equal(storage.getItem(economy.KEY),null);
 assert.equal((await wallet.awardCompletedMatch(receipt('legacy-save-match-0001'))).ok,true);assert.equal(storage.getItem(economy.KEY),null);assert.equal(storage.getItem('legend_managerCareer'),careerBytes);wallet.close();
});

test('failed IDB transaction rolls back reward and leaves wallet snapshot unchanged',async()=>{
 const economy=await api(),indexedDB=memoryIndexedDB(),{wallet}=await createWallet(economy,memory(),indexedDB),before=wallet.wallet();indexedDB.failQuota();
 await assert.rejects(wallet.awardCompletedMatch(receipt('failed-write-001')),/storage is full/i);
 assert.deepEqual(wallet.wallet(),before);assert.equal((await wallet.exportWallet()).tokens,0);wallet.close();
});
