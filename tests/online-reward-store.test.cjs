'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

let createOnlineRewardStore,OnlineRewardStoreError;
test('online reward store module imports',async()=>{
 ({createOnlineRewardStore,OnlineRewardStoreError}=await import('../scripts/online-reward-store.mjs'));
 assert.equal(typeof createOnlineRewardStore,'function');
});

const A='account_alpha',B='account_bravo',C='account_charlie';
const matchId=(number)=>String(number).padStart(32,'0');
function finalResult(id,score=[2,1],participants=[A,B]){
 return {schemaVersion:1,matchId:id,status:'finished',terminal:true,half:2,clock:120,tick:3600,
  participants:participants.map((userId,side)=>({userId,side})),teamIds:['japan','brazil'],score,recordedAt:'2026-11-04T12:00:00.000Z',duplicate:false};
}
function makeDb({balances={}}={}){
 const state={balances:new Map(Object.entries(balances)),ledger:new Map()},locks=new Map();
 function lock(key){
  const previous=locks.get(key)||Promise.resolve();let release;
  const current=new Promise(resolve=>{release=resolve});locks.set(key,current);
  return previous.then(()=>()=>{release();if(locks.get(key)===current)locks.delete(key);});
 }
 const pool={state,
  async query(sql,params){
   const normalized=sql.replace(/\s+/g,' ').trim().toLowerCase();
   if(normalized.startsWith('select balance from smf_online_token_balances')){
    const value=state.balances.get(params[0]);return {rows:value===undefined?[]:[{balance:value}]};
   }
   throw Error(`Unexpected pool query: ${sql}`);
  },
  async connect(){
   let unlock=null,accountId=null,stagedBalance,stagedLedger=null;
   return {async query(sql,params){
    const normalized=sql.replace(/\s+/g,' ').trim().toLowerCase();
    if(normalized==='begin')return {rows:[]};
    if(normalized==='commit'){
     if(stagedBalance!==undefined)state.balances.set(accountId,stagedBalance);
     if(stagedLedger)state.ledger.set(`${accountId}:${stagedLedger.matchId}`,stagedLedger.row);
     unlock?.();unlock=null;return {rows:[]};
    }
    if(normalized==='rollback'){unlock?.();unlock=null;return {rows:[]};}
    if(normalized.startsWith('select pg_advisory_xact_lock')){
     accountId=String(params[0]).slice('online-token-balance:'.length);unlock=await lock(accountId);return {rows:[{}]};
    }
    if(normalized.startsWith('select balance from smf_online_token_balances')){
     const value=stagedBalance??state.balances.get(params[0]);return {rows:value===undefined?[]:[{balance:value}]};
    }
    if(normalized.startsWith('select side,outcome,reward,balance_after,result_hash,recorded_at from smf_online_reward_ledger')){
     const row=state.ledger.get(`${params[0]}:${params[1]}`);return {rows:row?[structuredClone(row)]:[]};
    }
    if(normalized.startsWith('insert into smf_online_token_balances')){
     accountId=params[0];stagedBalance=params[1];return {rows:[{balance:stagedBalance}]};
    }
    if(normalized.startsWith('insert into smf_online_reward_ledger')){
     const [user,match,side,outcome,reward,balanceAfter,resultHash,recordedAt]=params;
     const key=`${user}:${match}`;if(state.ledger.has(key)){const error=Error('duplicate key');error.code='23505';throw error;}
     stagedLedger={matchId:match,row:{side,outcome,reward,balance_after:balanceAfter,result_hash:resultHash,recorded_at:recordedAt}};
     return {rows:[]};
    }
    throw Error(`Unexpected client query: ${sql}`);
   },release(){unlock?.();unlock=null;}};
  }
 };
 return pool;
}
function fixture({results=[],balances={},now=()=>new Date('2026-11-04T12:01:00.000Z')}={}){
 const db=makeDb({balances}),calls=[],stored=new Map(results.map(row=>[row.matchId,row]));
 const resultStore={async getFinalResult(id){calls.push(id);const row=stored.get(id);return row?structuredClone(row):null;}};
 const rewards=createOnlineRewardStore({db,resultStore,now});
 return {db,calls,stored,rewards};
}

test('win, draw, and loss rewards derive from durable result side and use the established soft-token schedule',async()=>{
 const r1=matchId(1),r2=matchId(2),r3=matchId(3);
 const {rewards,calls}=fixture({results:[finalResult(r1,[3,1]),finalResult(r2,[2,2]),finalResult(r3,[0,2])]});
 const win=await rewards.claimMatchReward({accountId:A,matchId:r1});
 const draw=await rewards.claimMatchReward({accountId:A,matchId:r2});
 const loss=await rewards.claimMatchReward({accountId:A,matchId:r3});
 assert.deepEqual([win.receipt.outcome,win.receipt.reward],[ 'win',30]);
 assert.deepEqual([draw.receipt.outcome,draw.receipt.reward],[ 'draw',25]);
 assert.deepEqual([loss.receipt.outcome,loss.receipt.reward],[ 'loss',20]);
 assert.equal(loss.balance,75);assert.deepEqual(calls,[r1,r2,r3]);
});

test('assigned away-side result is calculated relative to the authenticated account',async()=>{
 const id=matchId(4),{rewards}=fixture({results:[finalResult(id,[1,4])]});
 const outcome=await rewards.claimMatchReward({accountId:B,matchId:id});
 assert.equal(outcome.receipt.side,1);assert.equal(outcome.receipt.outcome,'win');assert.equal(outcome.receipt.reward,30);
});

test('missing, malformed, nonterminal, and nonparticipant results never change a wallet',async()=>{
 const id=matchId(5),notFinished={...finalResult(matchId(6)),terminal:false};
 const {rewards,db}=fixture({results:[finalResult(id),notFinished]});
 await assert.rejects(()=>rewards.claimMatchReward({accountId:C,matchId:id}),e=>e.code==='not-participant');
 await assert.rejects(()=>rewards.claimMatchReward({accountId:A,matchId:matchId(7)}),e=>e.code==='result-not-found');
 await assert.rejects(()=>rewards.claimMatchReward({accountId:A,matchId:matchId(6)}),e=>e.code==='invalid-result');
 assert.equal(db.state.balances.size,0);assert.equal(db.state.ledger.size,0);
});

test('request cannot supply reward, outcome, account context, or a forged result',async()=>{
 const id=matchId(8),{rewards,calls,db}=fixture({results:[finalResult(id)]});
 await assert.rejects(()=>rewards.claimMatchReward({accountId:A,matchId:id,reward:999999}),e=>e.code==='invalid-request');
 await assert.rejects(()=>rewards.claimMatchReward({accountId:'../other',matchId:id}),e=>e.code==='invalid-account');
 await assert.rejects(()=>rewards.claimMatchReward({accountId:A,matchId:'../../x'}),e=>e.code==='invalid-match-id');
 assert.deepEqual(calls,[]);assert.equal(db.state.ledger.size,0);
});

test('a duplicate claim returns its original receipt and does not award twice',async()=>{
 const id=matchId(9),{rewards,db}=fixture({results:[finalResult(id)]});
 const first=await rewards.claimMatchReward({accountId:A,matchId:id});
 const retry=await rewards.claimMatchReward({accountId:A,matchId:id});
 assert.equal(first.duplicate,false);assert.equal(retry.duplicate,true);
 assert.deepEqual(retry.receipt,first.receipt);assert.equal(retry.balance,30);
 assert.equal(db.state.ledger.size,1);assert.equal(await rewards.getBalance(A),30);
});

test('concurrent same-result retries are idempotent and concurrent matches serialize account balance updates',async()=>{
 const one=matchId(10),two=matchId(11);
 const {rewards,db}=fixture({results:[finalResult(one),finalResult(two)]});
 const duplicate=await Promise.all(Array.from({length:12},()=>rewards.claimMatchReward({accountId:A,matchId:one})));
 assert.equal(duplicate.filter(row=>!row.duplicate).length,1);
 assert.equal(db.state.ledger.size,1);assert.equal(await rewards.getBalance(A),30);
 const parallel=await Promise.all([rewards.claimMatchReward({accountId:A,matchId:two}),rewards.claimMatchReward({accountId:B,matchId:two})]);
 assert.equal(parallel[0].receipt.outcome,'win');assert.equal(parallel[1].receipt.outcome,'loss');
 assert.equal(await rewards.getBalance(A),60);assert.equal(await rewards.getBalance(B),20);
 assert.equal(db.state.ledger.size,3);
});

test('balance saturates at the established local wallet ceiling without exceeding it',async()=>{
 const id=matchId(12),{rewards,db}=fixture({results:[finalResult(id)],balances:{[A]:999_990}});
 const result=await rewards.claimMatchReward({accountId:A,matchId:id});
 assert.equal(result.receipt.reward,9);assert.equal(result.balance,999_999);
 assert.equal(db.state.balances.get(A),999_999);
});

test('durable result mutation after receipt conflicts instead of changing an existing award',async()=>{
 const id=matchId(13),{rewards,stored,db}=fixture({results:[finalResult(id)]});
 await rewards.claimMatchReward({accountId:A,matchId:id});
 stored.set(id,finalResult(id,[0,4]));
 await assert.rejects(()=>rewards.claimMatchReward({accountId:A,matchId:id}),e=>e.code==='immutable-conflict');
 assert.equal(await rewards.getBalance(A),30);assert.equal(db.state.ledger.size,1);
});

test('schema and API bounds align with token wallet maximum and receipt uniqueness',async()=>{
 const fs=require('node:fs/promises');
 const schema=await fs.readFile(require('node:path').resolve(__dirname,'../scripts/online-rewards-schema.sql'),'utf8');
 assert.match(schema,/balance BETWEEN 0 AND 999999/);
 assert.match(schema,/PRIMARY KEY \(account_id, match_id\)/);
 const {rewards}=fixture();assert.equal(rewards.maxBalance,999999);
 assert.equal(rewards.rewardSchedule.completion,20);assert.equal(rewards.rewardSchedule.winBonus,10);assert.equal(rewards.rewardSchedule.drawBonus,5);
});
