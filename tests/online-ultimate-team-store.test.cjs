'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

let createOnlineUltimateTeamStore;
const ACCOUNT='account_alpha',OTHER='account_bravo';
const KEY='purchase_test_0001';

function makeDb({balances={},failLedger=false}={}){
 const state={balances:new Map(Object.entries(balances)),owned:new Map(),purchases:new Map()},locks=new Map();
 function acquire(key){
  const previous=locks.get(key)||Promise.resolve();let release;
  const current=new Promise(resolve=>{release=resolve});locks.set(key,current);
  return previous.then(()=>()=>{release();if(locks.get(key)===current)locks.delete(key)});
 }
 return {state,
  async query(sql,params){
   const normalized=sql.replace(/\s+/g,' ').trim().toLowerCase();
   if(normalized.startsWith('select category,item_id,acquired_at from smf_online_ut_owned_items')){
    return {rows:[...state.owned.values()].filter(row=>row.account_id===params[0]).map(row=>structuredClone(row))};
   }
   if(normalized.startsWith('select 1 from smf_online_ut_owned_items')){
    return {rows:state.owned.has(`${params[0]}:${params[1]}:${params[2]}`)?[{'?column?':1}]:[]};
   }
   if(normalized.startsWith("select item_id from smf_online_ut_owned_items where account_id=$1 and category='team'")){
    return {rows:[...state.owned.values()].filter(row=>row.account_id===params[0]&&row.category==='team').map(row=>({item_id:row.item_id}))};
   }
   throw Error(`Unexpected pool query: ${sql}`);
  },
  async connect(){
   let unlock=null,account=null,balanceNext,ownedNext=null,purchaseNext=null;
   return {async query(sql,params){
    const q=sql.replace(/\s+/g,' ').trim().toLowerCase();
    if(q==='begin')return {rows:[]};
    if(q==='commit'){
     if(balanceNext!==undefined)state.balances.set(account,balanceNext);
     if(ownedNext)state.owned.set(`${account}:${ownedNext.category}:${ownedNext.item_id}`,ownedNext);
     if(purchaseNext)state.purchases.set(`${account}:${purchaseNext.idempotency_key}`,purchaseNext);
     unlock?.();unlock=null;return {rows:[]};
    }
    if(q==='rollback'){balanceNext=undefined;ownedNext=null;purchaseNext=null;unlock?.();unlock=null;return {rows:[]};}
    if(q.startsWith('select pg_advisory_xact_lock')){
     const lockKey=String(params[0]);account=lockKey.slice('online-token-balance:'.length);unlock=await acquire(account);return {rows:[{}]};
    }
    if(q.startsWith('select request_hash,category,item_id,price,balance_after,recorded_at from smf_online_ut_purchase_ledger')){
     const row=state.purchases.get(`${params[0]}:${params[1]}`);return {rows:row?[structuredClone(row)]:[]};
    }
    if(q.startsWith('select balance from smf_online_token_balances')){
     const value=balanceNext!==undefined?balanceNext:state.balances.get(params[0]);return {rows:value===undefined?[]:[{balance:value}]};
    }
    if(q.startsWith('select 1 from smf_online_ut_owned_items')){
     const row=ownedNext&&ownedNext.account_id===params[0]&&ownedNext.category===params[1]&&ownedNext.item_id===params[2]
      ?ownedNext:state.owned.get(`${params[0]}:${params[1]}:${params[2]}`);
     return {rows:row?[{'?column?':1}]:[]};
    }
    if(q.startsWith('select item_id from smf_online_ut_owned_items')){
     if(q.includes("category='team'"))return {rows:[...state.owned.values()].filter(row=>row.account_id===params[0]&&row.category==='team').map(row=>({item_id:row.item_id}))};
     const row=ownedNext&&ownedNext.account_id===params[0]&&ownedNext.category===params[1]&&ownedNext.item_id===params[2]
      ?ownedNext:state.owned.get(`${params[0]}:${params[1]}:${params[2]}`);
     return {rows:row?[{item_id:row.item_id}]:[]};
    }
    if(q.startsWith('update smf_online_token_balances')){account=params[0];balanceNext=params[1];return {rows:[]};}
    if(q.startsWith('insert into smf_online_ut_owned_items')){
     const [user,category,itemId,acquiredAt]=params,key=`${user}:${category}:${itemId}`;
     if(state.owned.has(key)||ownedNext) {const error=Error('duplicate item');error.code='23505';throw error;}
     ownedNext={account_id:user,category,item_id:itemId,acquired_at:acquiredAt};return {rows:[]};
    }
    if(q.startsWith('insert into smf_online_ut_purchase_ledger')){
     if(failLedger)throw Error('injected ledger insert failure');
     const [user,idempotencyKey,requestHash,category,itemId,price,balanceAfter,recordedAt]=params,key=`${user}:${idempotencyKey}`;
     if(state.purchases.has(key)){const error=Error('duplicate key');error.code='23505';throw error;}
     purchaseNext={account_id:user,idempotency_key:idempotencyKey,request_hash:requestHash,category,item_id:itemId,price,balance_after:balanceAfter,recorded_at:recordedAt};return {rows:[]};
    }
    throw Error(`Unexpected client query: ${sql}`);
   },release(){unlock?.();unlock=null;}};
  }
 };
}
async function setup(options={}){
 ({createOnlineUltimateTeamStore}=await import('../scripts/online-ultimate-team-store.mjs'));
 const db=makeDb(options),store=await createOnlineUltimateTeamStore({db,now:()=>new Date('2026-11-04T14:00:00.000Z')});
 return {db,store};
}

test('server store builds its team and player offers only from canonical shipped game data',async()=>{
 const {store}=await setup(),catalog=store.getCatalog();
 assert.ok(store.catalogSize>=2200);
 assert.ok(catalog.some(row=>row.category==='team'&&row.id==='brazil'&&row.price===300));
 assert.ok(!catalog.some(row=>row.category==='team'&&row.id==='japan'),'the free starter is never offered for purchase');
 assert.ok(catalog.some(row=>row.category==='player'&&row.id==='japan/jp0'&&row.price===250));
 assert.ok(catalog.every(row=>['team','player'].includes(row.category)&&Number.isSafeInteger(row.price)&&row.price>0));
});

test('the canonical free starter and its full canonical roster are available without charge',async()=>{
 const {db,store}=await setup({balances:{[ACCOUNT]:1200}});
 const collection=await store.getCollection(ACCOUNT);
 assert.deepEqual(collection[0],{category:'team',itemId:'japan',acquiredAt:null});
 assert.equal(collection.filter(row=>row.category==='player').length,12);
 assert.equal(collection.find(row=>row.itemId==='japan/jp0').acquiredAt,null);
 assert.equal(await store.isItemOwned(ACCOUNT,'team','japan'),true);
 assert.equal(await store.isItemOwned(ACCOUNT,'player','japan/jp0'),true);
 assert.equal(await store.isItemOwned(ACCOUNT,'team','brazil'),false);
 await assert.rejects(()=>store.purchase({accountId:ACCOUNT,category:'team',itemId:'japan',idempotencyKey:KEY}),error=>error.code==='already-owned');
 await assert.rejects(()=>store.purchase({accountId:ACCOUNT,category:'player',itemId:'japan/jp0',idempotencyKey:'purchase_test_0002'}),error=>error.code==='already-owned');
 assert.equal(db.state.balances.get(ACCOUNT),1200);assert.equal(db.state.purchases.size,0);
});

test('team and player purchases atomically debit the durable online balance and create account-scoped collection rows',async()=>{
 const {db,store}=await setup({balances:{[ACCOUNT]:1000}});
 const club=await store.purchase({accountId:ACCOUNT,category:'team',itemId:'brazil',idempotencyKey:KEY});
 const player=await store.purchase({accountId:ACCOUNT,category:'player',itemId:'argentina/argentina_0',idempotencyKey:'purchase_test_0002'});
 assert.equal(club.price,300);assert.equal(club.balance,700);
 assert.equal(player.price,250);assert.equal(player.balance,450);
 assert.equal(db.state.balances.get(ACCOUNT),450);assert.equal(db.state.owned.size,2);assert.equal(db.state.purchases.size,2);
 const collection=await store.getCollection(ACCOUNT);
 assert.deepEqual(collection.filter(row=>row.category==='team').map(row=>row.itemId),['brazil','japan']);
 assert.equal(collection.filter(row=>row.category==='player').length,25);
 assert.ok(collection.some(row=>row.category==='player'&&row.itemId==='argentina/argentina_0'&&row.acquiredAt==='2026-11-04T14:00:00.000Z'));
 assert.equal((await store.getCollection(OTHER)).length,13);
});

test('team acquisition grants implicit roster-player ownership without duplicating prior explicit acquisitions',async()=>{
 const {db,store}=await setup({balances:{[ACCOUNT]:1000}}),playerId='brazil/brazil_0';
 const player=await store.purchase({accountId:ACCOUNT,category:'player',itemId:playerId,idempotencyKey:KEY});
 const acquiredAt=player.receipt.recordedAt;
 assert.equal(await store.isItemOwned(ACCOUNT,'player',playerId),true);
 await store.purchase({accountId:ACCOUNT,category:'team',itemId:'brazil',idempotencyKey:'purchase_test_0002'});
 assert.equal(await store.isItemOwned(ACCOUNT,'player','brazil/brazil_1'),true);
 const collection=await store.getCollection(ACCOUNT),matches=collection.filter(row=>row.category==='player'&&row.itemId===playerId);
 assert.equal(matches.length,1);assert.equal(matches[0].acquiredAt,acquiredAt);
 assert.equal(collection.filter(row=>row.category==='player'&&row.itemId.startsWith('brazil/')).length,12);
 await assert.rejects(()=>store.purchase({accountId:ACCOUNT,category:'player',itemId:'brazil/brazil_1',idempotencyKey:'purchase_test_0003'}),error=>error.code==='already-owned');
 assert.equal(db.state.balances.get(ACCOUNT),450);
});

test('unknown products, invalid/forged account identifiers, and client-supplied prices are rejected',async()=>{
 const {db,store}=await setup({balances:{[ACCOUNT]:500}});
 await assert.rejects(()=>store.purchase({accountId:ACCOUNT,category:'player',itemId:'unknown_team/no_player',idempotencyKey:KEY}),e=>e.code==='unknown-item');
 await assert.rejects(()=>store.purchase({accountId:'../../victim',category:'team',itemId:'japan',idempotencyKey:KEY}),e=>e.code==='invalid-account');
 await assert.rejects(()=>store.purchase({accountId:ACCOUNT,category:'team',itemId:'brazil',price:1,idempotencyKey:KEY}),e=>e.code==='invalid-request');
 assert.equal(db.state.balances.get(ACCOUNT),500);assert.equal(db.state.owned.size,0);
});

test('insufficient balance, duplicate ownership, and replay with a different item do not debit twice',async()=>{
 const {db,store}=await setup({balances:{[ACCOUNT]:200}});
 await assert.rejects(()=>store.purchase({accountId:ACCOUNT,category:'team',itemId:'brazil',idempotencyKey:KEY}),e=>e.code==='insufficient-balance');
 db.state.balances.set(ACCOUNT,300);
 const first=await store.purchase({accountId:ACCOUNT,category:'team',itemId:'brazil',idempotencyKey:KEY});
 const retry=await store.purchase({accountId:ACCOUNT,category:'team',itemId:'brazil',idempotencyKey:KEY});
 assert.equal(retry.duplicate,true);assert.deepEqual(retry.receipt,first.receipt);
 await assert.rejects(()=>store.purchase({accountId:ACCOUNT,category:'team',itemId:'korea',idempotencyKey:KEY}),e=>e.code==='idempotency-conflict');
 await assert.rejects(()=>store.purchase({accountId:ACCOUNT,category:'team',itemId:'brazil',idempotencyKey:'purchase_test_0003'}),e=>e.code==='already-owned');
 assert.equal(db.state.balances.get(ACCOUNT),0);assert.equal(db.state.owned.size,1);assert.equal(db.state.purchases.size,1);
});

test('concurrent retries and concurrent attempts to buy the same product commit once',async()=>{
 const {db,store}=await setup({balances:{[ACCOUNT]:1000}});
 const same=await Promise.all(Array.from({length:16},()=>store.purchase({accountId:ACCOUNT,category:'player',itemId:'brazil/brazil_0',idempotencyKey:KEY})));
 assert.equal(same.filter(row=>!row.duplicate).length,1);assert.equal(db.state.balances.get(ACCOUNT),750);
 const differentKeys=await Promise.allSettled([
  store.purchase({accountId:ACCOUNT,category:'player',itemId:'brazil/brazil_0',idempotencyKey:'purchase_test_0002'}),
  store.purchase({accountId:ACCOUNT,category:'player',itemId:'brazil/brazil_0',idempotencyKey:'purchase_test_0003'}),
 ]);
 assert.equal(differentKeys.filter(row=>row.status==='fulfilled').length,0);
 assert.equal(differentKeys.filter(row=>row.status==='rejected'&&row.reason.code==='already-owned').length,2);
 assert.equal(db.state.balances.get(ACCOUNT),750);assert.equal(db.state.owned.size,1);assert.equal(db.state.purchases.size,1);
});

test('different accounts cannot observe or spend one another’s balance or ownership',async()=>{
 const {db,store}=await setup({balances:{[ACCOUNT]:300,[OTHER]:0}});
 await store.purchase({accountId:ACCOUNT,category:'team',itemId:'brazil',idempotencyKey:KEY});
 assert.equal(db.state.balances.get(ACCOUNT),0);assert.equal(db.state.balances.get(OTHER),0);
 assert.equal((await store.getCollection(OTHER)).length,13);
 await assert.rejects(()=>store.purchase({accountId:OTHER,category:'team',itemId:'brazil',idempotencyKey:'purchase_test_0002'}),e=>e.code==='insufficient-balance');
 assert.equal(db.state.owned.size,1);assert.equal(db.state.purchases.size,1);
});

test('a failure after debit rolls back balance, ownership, and purchase receipt together',async()=>{
 const {db,store}=await setup({balances:{[ACCOUNT]:500},failLedger:true});
 await assert.rejects(()=>store.purchase({accountId:ACCOUNT,category:'team',itemId:'brazil',idempotencyKey:KEY}),/injected ledger insert failure/);
 assert.equal(db.state.balances.get(ACCOUNT),500);assert.equal(db.state.owned.size,0);assert.equal(db.state.purchases.size,0);
});

test('schema enforces ownership, receipt idempotency, and one acquisition per account item',async()=>{
 const fs=require('node:fs/promises'),path=require('node:path');
 const schema=await fs.readFile(path.resolve(__dirname,'../scripts/online-ultimate-team-schema.sql'),'utf8');
 assert.match(schema,/PRIMARY KEY \(account_id, category, item_id\)/);
 assert.match(schema,/PRIMARY KEY \(account_id, idempotency_key\)/);
 assert.match(schema,/UNIQUE \(account_id, category, item_id\)/);
 assert.match(schema,/FOREIGN KEY \(account_id, category, item_id\)/);
});
