import {createHash} from 'node:crypto';
import {ECONOMY} from '../src/modules/economy.js';

const ACCOUNT_ID=/^[A-Za-z0-9_-]{1,128}$/;
const MATCH_ID=/^[a-f0-9]{32}$/;
const TEAM_ID=/^[A-Za-z0-9_-]{1,64}$/;
const SCORE_MAX=999;
const MAX_TOKENS=ECONOMY.MAX_TOKENS;
const REWARDS=ECONOMY.REWARDS;

export class OnlineRewardStoreError extends Error {
  constructor(code,message){super(message);this.name='OnlineRewardStoreError';this.code=code;}
}

function fail(code,message){throw new OnlineRewardStoreError(code,message);}
function exactKeys(value,keys){return !!value&&typeof value==='object'&&!Array.isArray(value)&&
  (Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)&&
  Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));}
function validateAccount(value){if(typeof value!=='string'||!ACCOUNT_ID.test(value)||value.trim()!==value)fail('invalid-account','Invalid account identifier');}
function validateMatchId(value){if(typeof value!=='string'||!MATCH_ID.test(value))fail('invalid-match-id','Invalid match identifier');}
function dateValue(value){
  const date=value instanceof Date?value:new Date(value);
  if(!Number.isFinite(date.getTime()))fail('invalid-clock','Reward store clock returned an invalid timestamp');
  return date.toISOString();
}
function rewardFor(outcome){
  const bonus=outcome==='win'?REWARDS.winBonus:outcome==='draw'?REWARDS.drawBonus:REWARDS.lossBonus;
  return REWARDS.completion+bonus;
}
function normalizeStoredResult(value,matchId,accountId){
  const keys=['schemaVersion','matchId','status','terminal','half','clock','tick','participants','teamIds','score','recordedAt','duplicate'];
  if(!exactKeys(value,keys)||value.schemaVersion!==1||value.matchId!==matchId||value.status!=='finished'||
    value.terminal!==true||value.half!==2||!Number.isSafeInteger(value.tick)||value.tick<1||
    !Number.isFinite(value.clock)||value.clock<0||value.clock>1800||
    typeof value.recordedAt!=='string'||!Number.isFinite(Date.parse(value.recordedAt))||
    new Date(value.recordedAt).toISOString()!==value.recordedAt||typeof value.duplicate!=='boolean'||
    !Array.isArray(value.participants)||value.participants.length!==2||
    !value.participants.every((row,side)=>exactKeys(row,['userId','side'])&&typeof row.userId==='string'&&ACCOUNT_ID.test(row.userId)&&row.side===side)||
    value.participants[0].userId===value.participants[1].userId||
    !Array.isArray(value.teamIds)||value.teamIds.length!==2||!value.teamIds.every(teamId=>typeof teamId==='string'&&TEAM_ID.test(teamId))||
    value.teamIds[0]===value.teamIds[1]||
    !Array.isArray(value.score)||value.score.length!==2||!value.score.every(score=>Number.isSafeInteger(score)&&score>=0&&score<=SCORE_MAX))
    fail('invalid-result','Durable match result failed validation');
  const stable={schemaVersion:1,matchId:value.matchId,status:'finished',terminal:true,half:2,clock:value.clock,tick:value.tick,
    participants:value.participants.map(row=>({userId:row.userId,side:row.side})),teamIds:value.teamIds.slice(),score:value.score.slice(),recordedAt:value.recordedAt};
  const side=value.participants.findIndex(row=>row.userId===accountId);
  return {stable,resultHash:createHash('sha256').update(JSON.stringify(stable)).digest('hex'),side};
}

function checkedBalance(value){
  const balance=Number(value);
  if(!Number.isSafeInteger(balance)||balance<0||balance>MAX_TOKENS)fail('corrupt-balance','Stored token balance is invalid');
  return balance;
}
function checkedLedgerRow(row){
  if(!row||![0,1].includes(Number(row.side))||!['win','draw','loss'].includes(row.outcome)||
    !Number.isSafeInteger(Number(row.reward))||Number(row.reward)<0||Number(row.reward)>REWARDS.completion+REWARDS.winBonus||
    !Number.isSafeInteger(Number(row.balance_after))||Number(row.balance_after)<0||Number(row.balance_after)>MAX_TOKENS||
    typeof row.result_hash!=='string'||!/^[a-f0-9]{64}$/.test(row.result_hash))fail('corrupt-ledger','Stored token receipt is invalid');
  return {side:Number(row.side),outcome:row.outcome,reward:Number(row.reward),balanceAfter:Number(row.balance_after),resultHash:row.result_hash,
    recordedAt:row.recorded_at instanceof Date?row.recorded_at.toISOString():dateValue(row.recorded_at)};
}

/**
 * Server-authoritative soft-token ledger. The only reward source is the immutable,
 * already-persisted result returned by `resultStore.getFinalResult(matchId)`.
 * This store does not accept reward amounts and does not sell tokens.
 */
export function createOnlineRewardStore({db,resultStore,now=()=>new Date()}={}){
  if(!db||typeof db.connect!=='function'||typeof db.query!=='function')throw new TypeError('Online reward store requires a PostgreSQL Pool-like client');
  if(!resultStore||typeof resultStore.getFinalResult!=='function')throw new TypeError('Online reward store requires a durable result store');
  if(typeof now!=='function')throw new TypeError('now must be a function');

  async function transaction(work){
    const client=await db.connect();
    try{await client.query('BEGIN');const value=await work(client);await client.query('COMMIT');return value;}
    catch(error){try{await client.query('ROLLBACK')}catch{};throw error;}
    finally{client.release?.();}
  }

  async function getBalance(accountId){
    validateAccount(accountId);
    const result=await db.query('SELECT balance FROM smf_online_token_balances WHERE account_id=$1',[accountId]);
    const row=result.rows?.[0];return row?checkedBalance(row.balance):0;
  }

  async function claimMatchReward(request){
    if(!exactKeys(request,['accountId','matchId']))fail('invalid-request','Only accountId and matchId are accepted');
    const {accountId,matchId}=request;
    validateAccount(accountId);validateMatchId(matchId);
    let raw;
    try{raw=await resultStore.getFinalResult(matchId);}catch{fail('result-unavailable','The durable match result could not be verified');}
    if(!raw)fail('result-not-found','No durable completed match exists for this match ID');
    const normalized=normalizeStoredResult(raw,matchId,accountId);
    if(normalized.side<0)fail('not-participant','This account did not participate in the completed match');
    const side=normalized.side,score=normalized.stable.score;
    const outcome=score[side]>score[1-side]?'win':score[side]<score[1-side]?'loss':'draw';
    const nominalReward=rewardFor(outcome);
    const resultHash=normalized.resultHash;

    return transaction(async client=>{
      // One per-account xact lock serializes first balance creation and all matches;
      // unlike a row lock, it also protects the not-yet-existing balance row.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`online-token-balance:${accountId}`]);
      const balanceRow=(await client.query('SELECT balance FROM smf_online_token_balances WHERE account_id=$1 FOR UPDATE',[accountId])).rows?.[0];
      const balance=balanceRow?checkedBalance(balanceRow.balance):0;
      const existing=(await client.query(
        'SELECT side,outcome,reward,balance_after,result_hash,recorded_at FROM smf_online_reward_ledger WHERE account_id=$1 AND match_id=$2 FOR UPDATE',
        [accountId,matchId])).rows?.[0];
      if(existing){
        const receipt=checkedLedgerRow(existing);
        if(receipt.side!==side||receipt.outcome!==outcome||receipt.resultHash!==resultHash||receipt.reward>nominalReward||balance<receipt.balanceAfter)
          fail('immutable-conflict','A reward receipt conflicts with the durable match result');
        return Object.freeze({ok:true,duplicate:true,balance,receipt:Object.freeze({matchId,side,outcome,reward:receipt.reward,balanceAfter:receipt.balanceAfter,recordedAt:receipt.recordedAt})});
      }
      const reward=Math.min(nominalReward,MAX_TOKENS-balance),balanceAfter=balance+reward,recordedAt=dateValue(now());
      await client.query(
        `INSERT INTO smf_online_token_balances (account_id,balance,created_at,updated_at)
         VALUES ($1,$2,$3,$3) ON CONFLICT (account_id) DO UPDATE SET balance=EXCLUDED.balance,updated_at=EXCLUDED.updated_at`,
        [accountId,balanceAfter,recordedAt]);
      await client.query(
        `INSERT INTO smf_online_reward_ledger (account_id,match_id,side,outcome,reward,balance_after,result_hash,recorded_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [accountId,matchId,side,outcome,reward,balanceAfter,resultHash,recordedAt]);
      return Object.freeze({ok:true,duplicate:false,balance:balanceAfter,
        receipt:Object.freeze({matchId,side,outcome,reward,balanceAfter,recordedAt})});
    });
  }

  return Object.freeze({getBalance,claimMatchReward,get maxBalance(){return MAX_TOKENS;},get rewardSchedule(){return REWARDS;}});
}
