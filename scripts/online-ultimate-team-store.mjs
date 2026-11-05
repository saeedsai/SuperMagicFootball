import {createHash} from 'node:crypto';
import {ECONOMY} from '../src/modules/economy.js';
import {loadAssetsFromNode} from '../src/assets.js';

const ACCOUNT_ID=/^[A-Za-z0-9_-]{1,128}$/;
const IDEMPOTENCY_KEY=/^[A-Za-z0-9:_-]{8,128}$/;
const ITEM_ID=/^[A-Za-z0-9_-]{1,64}(?:\/[A-Za-z0-9_-]{1,64})?$/;
const CATEGORIES=new Set(['team','player']);
// Every Online UT account can field its existing Japan starter team without
// currency; buying more teams is a progression choice, never a match paywall.
const FREE_STARTER_TEAM_ID='japan';
const LINEUP_SIZE=12;

export class OnlineUltimateTeamStoreError extends Error {
  constructor(code,message){super(message);this.name='OnlineUltimateTeamStoreError';this.code=code;}
}
function fail(code,message){throw new OnlineUltimateTeamStoreError(code,message)}
function exactKeys(value,keys){return !!value&&typeof value==='object'&&!Array.isArray(value)&&
  (Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)&&
  Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));}
function validAccount(value){if(typeof value!=='string'||!ACCOUNT_ID.test(value)||value.trim()!==value)fail('invalid-account','Invalid account identifier');}
function validCategory(value){if(typeof value!=='string'||!CATEGORIES.has(value))fail('invalid-category','Only canonical team and player acquisitions are supported');}
function dateValue(value){const date=value instanceof Date?value:new Date(value);if(!Number.isFinite(date.getTime()))fail('invalid-clock','Store clock returned an invalid timestamp');return date.toISOString();}
function canonicalCatalog(assets){
  if(!assets||!Array.isArray(assets.teams)||!assets.rosters||typeof assets.rosters!=='object')throw new TypeError('Canonical game assets are unavailable');
  const catalog=new Map();
  for(const team of assets.teams){
    if(!team||typeof team.id!=='string'||!ITEM_ID.test(team.id)||catalog.has(`team:${team.id}`))throw new TypeError('Canonical team data is invalid');
    catalog.set(`team:${team.id}`,Object.freeze({category:'team',id:team.id,price:ECONOMY.PRICES.team}));
    const roster=assets.rosters[team.id];
    if(!Array.isArray(roster))throw new TypeError(`Canonical roster is unavailable for ${team.id}`);
    for(const player of roster){
      if(!player||typeof player.id!=='string'||!ITEM_ID.test(player.id))throw new TypeError(`Canonical player data is invalid for ${team.id}`);
      const id=`${team.id}/${player.id}`,key=`player:${id}`;
      if(catalog.has(key))throw new TypeError(`Duplicate canonical UT item: ${id}`);
      catalog.set(key,Object.freeze({category:'player',id,price:ECONOMY.PRICES.player}));
    }
  }
  return catalog;
}
function validVersion(value){return Number.isSafeInteger(value)&&value>=0&&value<2147483647;}
function lineupView(teamId,playerIds,version){return Object.freeze({teamId,playerIds:Object.freeze(playerIds.slice()),version});}

/**
 * Account-scoped online UT acquisitions. Prices/catalog entries are derived from
 * immutable in-game data and ECONOMY on the server; requests can provide only IDs.
 * Callers must derive accountId from the verified OIDC principal, never request data.
 * Acquired players form the account's UT player collection; existing offline content
 * and local saves are never read or modified by this store.
 */
export async function createOnlineUltimateTeamStore({db,now=()=>new Date()}={}){
  if(!db||typeof db.connect!=='function'||typeof db.query!=='function')throw new TypeError('Online UT store requires a PostgreSQL Pool-like client');
  if(typeof now!=='function')throw new TypeError('now must be a function');
  const assets=await loadAssetsFromNode();
  const catalog=canonicalCatalog(assets);
  const teamIds=new Set(assets.teams.map(team=>team.id));
  const canonicalPlayers=new Map([...catalog.values()].filter(item=>item.category==='player').map(item=>{
    const slash=item.id.indexOf('/');return [item.id,{teamId:item.id.slice(0,slash),playerId:item.id.slice(slash+1)}];
  }));

  async function transaction(work){
    const client=await db.connect();
    try{await client.query('BEGIN');const result=await work(client);await client.query('COMMIT');return result;}
    catch(error){try{await client.query('ROLLBACK')}catch{};throw error;}
    finally{client.release?.();}
  }
  function getItem(category,itemId){
    validCategory(category);
    if(typeof itemId!=='string'||!ITEM_ID.test(itemId))fail('invalid-item','Invalid catalog item identifier');
    const item=catalog.get(`${category}:${itemId}`);
    if(!item)fail('unknown-item','Item is not in the canonical game catalog');
    return item;
  }
  function baseRoster(teamId){
    if(!teamIds.has(teamId))fail('unknown-team','Team is not in the canonical game catalog');
    const roster=assets.rosters[teamId];
    if(!Array.isArray(roster)||roster.length!==LINEUP_SIZE||roster.some(player=>!player||typeof player.id!=='string'||typeof player.role!=='string'))
      fail('corrupt-catalog','Canonical team roster is unavailable or malformed');
    return roster;
  }
  async function ownsTeam(client,accountId,teamId){
    if(teamId===FREE_STARTER_TEAM_ID)return true;
    const response=await client.query('SELECT 1 FROM smf_online_ut_owned_items WHERE account_id=$1 AND category=$2 AND item_id=$3',[accountId,'team',teamId]);
    return !!response.rows?.length;
  }
  async function ownedTeams(client,accountId){
    const response=await client.query("SELECT item_id FROM smf_online_ut_owned_items WHERE account_id=$1 AND category='team' ORDER BY item_id",[accountId]);
    const result=new Set([FREE_STARTER_TEAM_ID]);
    for(const row of response.rows||[]){
      if(typeof row.item_id!=='string'||!teamIds.has(row.item_id))fail('corrupt-collection','Stored UT team ownership is not in the canonical catalog');
      result.add(row.item_id);
    }
    return result;
  }
  async function validateLineup(client,accountId,teamId,playerIds){
    const roster=baseRoster(teamId);
    if(!Array.isArray(playerIds)||playerIds.length!==LINEUP_SIZE)fail('invalid-lineup','Lineup must contain exactly twelve player IDs');
    if(new Set(playerIds).size!==LINEUP_SIZE)fail('duplicate-player','A lineup cannot contain the same player more than once');
    for(let index=0;index<LINEUP_SIZE;index++){
      const compoundId=playerIds[index];
      if(typeof compoundId!=='string'||!canonicalPlayers.has(compoundId))fail('unknown-player','Lineup contains a player outside the canonical game catalog');
      const player=canonicalPlayers.get(compoundId);
      const canonicalPlayer=assets.rosters[player.teamId]?.find(candidate=>candidate.id===player.playerId);
      if(!canonicalPlayer||canonicalPlayer.role!==roster[index].role)fail('role-mismatch','Player role does not match this lineup slot');
      if(player.teamId!==teamId&&!await ownsTeam(client,accountId,player.teamId)){
        const owned=await client.query('SELECT 1 FROM smf_online_ut_owned_items WHERE account_id=$1 AND category=$2 AND item_id=$3',[accountId,'player',compoundId]);
        if(!owned.rows?.length)fail('player-not-owned','Players from another team must be acquired before lineup use');
      }
    }
    return playerIds.slice();
  }
  async function validateStoredLineup(client,accountId,teamId,playerIds,code='corrupt-lineup'){
    try{return await validateLineup(client,accountId,teamId,playerIds);}
    catch(error){
      if(error instanceof OnlineUltimateTeamStoreError)fail(code,'Stored Online UT lineup is invalid');
      throw error;
    }
  }
  async function getLineup(accountId,teamId){
    validAccount(accountId);
    if(typeof teamId!=='string'||!teamIds.has(teamId))fail('unknown-team','Team is not in the canonical game catalog');
    const roster=baseRoster(teamId);
    if(!await ownsTeam(db,accountId,teamId))fail('team-not-owned','Account does not own this Online UT team');
    const response=await db.query('SELECT team_id,player_ids,version FROM smf_online_ut_lineups WHERE account_id=$1 AND team_id=$2',[accountId,teamId]);
    const row=response.rows?.[0];
    if(!row)return lineupView(teamId,roster.map(player=>`${teamId}/${player.id}`),0);
    if(row.team_id!==teamId||!Number.isSafeInteger(Number(row.version))||Number(row.version)<1||Number(row.version)>=2147483647)
      fail('corrupt-lineup','Stored Online UT lineup metadata is invalid');
    let stored;
    try{stored=typeof row.player_ids==='string'?JSON.parse(row.player_ids):row.player_ids;}catch{fail('corrupt-lineup','Stored Online UT lineup is malformed');}
    if(!Array.isArray(stored)||stored.length!==LINEUP_SIZE)fail('corrupt-lineup','Stored Online UT lineup has an invalid size');
    const validated=await validateStoredLineup(db,accountId,teamId,stored);
    return lineupView(teamId,validated,Number(row.version));
  }
  async function saveLineup(accountId,request){
    validAccount(accountId);
    if(!exactKeys(request,['teamId','playerIds','expectedVersion','idempotencyKey']))fail('invalid-request','Only team, player IDs, expected version, and idempotency key are accepted');
    const {teamId,playerIds,expectedVersion,idempotencyKey}=request;
    if(typeof teamId!=='string'||!teamIds.has(teamId))fail('unknown-team','Team is not in the canonical game catalog');
    if(!validVersion(expectedVersion))fail('invalid-version','Expected lineup version is invalid');
    if(typeof idempotencyKey!=='string'||!IDEMPOTENCY_KEY.test(idempotencyKey))fail('invalid-idempotency-key','Invalid lineup idempotency key');
    if(!Array.isArray(playerIds)||playerIds.length!==LINEUP_SIZE||playerIds.some(id=>typeof id!=='string'||id.length>129))
      fail('invalid-lineup','Lineup must contain exactly twelve canonical player IDs');
    const validatedInput=Array.isArray(playerIds)?playerIds.slice():playerIds;
    const requestHash=createHash('sha256').update(JSON.stringify({teamId,playerIds:validatedInput,expectedVersion})).digest('hex');
    return transaction(async client=>{
      // The idempotency ledger key is unique per account, not per team. Serialize
      // every lineup write for the account so identical keys cannot race across
      // two different team lineups and surface as a raw database unique violation.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`online-ut-lineup:${accountId}`]);
      if(!await ownsTeam(client,accountId,teamId))fail('team-not-owned','Account does not own this Online UT team');
      const replay=(await client.query('SELECT request_hash,team_id,player_ids,version FROM smf_online_ut_lineup_ledger WHERE account_id=$1 AND idempotency_key=$2 FOR UPDATE',[accountId,idempotencyKey])).rows?.[0];
      if(replay){
        if(replay.request_hash!==requestHash||replay.team_id!==teamId)fail('idempotency-conflict','Lineup key was already used for a different request');
        let replayIds;try{replayIds=typeof replay.player_ids==='string'?JSON.parse(replay.player_ids):replay.player_ids;}catch{fail('corrupt-lineup-ledger','Stored lineup receipt is malformed');}
        if(!Array.isArray(replayIds)||replayIds.length!==LINEUP_SIZE||!Number.isSafeInteger(Number(replay.version))||Number(replay.version)<1||Number(replay.version)>=2147483647)
          fail('corrupt-lineup-ledger','Stored lineup receipt is invalid');
        const validReplay=await validateStoredLineup(client,accountId,teamId,replayIds,'corrupt-lineup-ledger');
        return Object.freeze({duplicate:true,lineup:lineupView(teamId,validReplay,Number(replay.version))});
      }
      const validated=await validateLineup(client,accountId,teamId,validatedInput);
      const current=(await client.query('SELECT team_id,player_ids,version FROM smf_online_ut_lineups WHERE account_id=$1 AND team_id=$2 FOR UPDATE',[accountId,teamId])).rows?.[0];
      const currentVersion=current?Number(current.version):0;
      if(current){
        if(!Number.isSafeInteger(currentVersion)||currentVersion<1||currentVersion>=2147483647)fail('corrupt-lineup','Stored Online UT lineup version is invalid');
        if(current.team_id!==teamId)fail('corrupt-lineup','Stored Online UT lineup team is invalid');
        let oldIds;try{oldIds=typeof current.player_ids==='string'?JSON.parse(current.player_ids):current.player_ids;}catch{fail('corrupt-lineup','Stored Online UT lineup is malformed');}
        if(!Array.isArray(oldIds)||oldIds.length!==LINEUP_SIZE)fail('corrupt-lineup','Stored Online UT lineup has an invalid size');
        await validateStoredLineup(client,accountId,teamId,oldIds);
      }
      if(currentVersion!==expectedVersion)fail('stale-lineup-version','Online UT lineup changed; reload it before saving');
      if(currentVersion>=2147483646)fail('lineup-version-exhausted','Online UT lineup has reached its version limit');
      if(current){
        await client.query('UPDATE smf_online_ut_lineups SET player_ids=$3::jsonb,version=$4,updated_at=$5 WHERE account_id=$1 AND team_id=$2',[accountId,teamId,JSON.stringify(validated),currentVersion+1,dateValue(now())]);
      }else{
        await client.query('INSERT INTO smf_online_ut_lineups (account_id,team_id,player_ids,version,updated_at) VALUES ($1,$2,$3::jsonb,1,$4)',[accountId,teamId,JSON.stringify(validated),dateValue(now())]);
      }
      const version=currentVersion+1,recordedAt=dateValue(now());
      await client.query('INSERT INTO smf_online_ut_lineup_ledger (account_id,idempotency_key,request_hash,team_id,player_ids,version,recorded_at) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7)',[accountId,idempotencyKey,requestHash,teamId,JSON.stringify(validated),version,recordedAt]);
      return Object.freeze({duplicate:false,lineup:lineupView(teamId,validated,version)});
    });
  }
  function getCatalog(){return Object.freeze([...catalog.values()].filter(item=>!(item.category==='team'&&item.id===FREE_STARTER_TEAM_ID)).map(item=>Object.freeze({...item})));}
  async function getCollection(accountId){
    validAccount(accountId);
    const response=await db.query('SELECT category,item_id,acquired_at FROM smf_online_ut_owned_items WHERE account_id=$1 ORDER BY category,item_id',[accountId]);
    const teams=new Map([[FREE_STARTER_TEAM_ID,Object.freeze({category:'team',itemId:FREE_STARTER_TEAM_ID,acquiredAt:null})]]);
    const players=new Map();
    for(const row of response.rows||[]){
      if(!CATEGORIES.has(row.category)||!catalog.has(`${row.category}:${row.item_id}`))fail('corrupt-collection','Stored UT ownership is not in the canonical catalog');
      const item=Object.freeze({category:row.category,itemId:row.item_id,acquiredAt:dateValue(row.acquired_at)});
      if(row.category==='team'){
        if(row.item_id!==FREE_STARTER_TEAM_ID)teams.set(row.item_id,item);
      }else players.set(row.item_id,item);
    }
    const ownedTeamIds=await ownedTeams(db,accountId);
    for(const teamId of ownedTeamIds){
      const roster=assets.rosters[teamId];
      if(!Array.isArray(roster)||roster.length!==LINEUP_SIZE)fail('corrupt-catalog','Canonical team roster is unavailable or malformed');
      for(const player of roster){
        const compoundId=`${teamId}/${player.id}`;
        if(!players.has(compoundId))players.set(compoundId,Object.freeze({category:'player',itemId:compoundId,acquiredAt:null}));
      }
    }
    return Object.freeze([
      ...[...teams.values()].sort((a,b)=>a.itemId.localeCompare(b.itemId)),
      ...[...players.values()].sort((a,b)=>a.itemId.localeCompare(b.itemId)),
    ]);
  }
  async function isItemOwned(accountId,category,itemId){
    validAccount(accountId);getItem(category,itemId);
    if(category==='team'&&itemId===FREE_STARTER_TEAM_ID)return true;
    const response=await db.query('SELECT 1 FROM smf_online_ut_owned_items WHERE account_id=$1 AND category=$2 AND item_id=$3',[accountId,category,itemId]);
    if(response.rows?.length)return true;
    if(category==='player')return ownsTeam(db,accountId,canonicalPlayers.get(itemId).teamId);
    return false;
  }
  async function purchase(request){
    if(!exactKeys(request,['accountId','category','itemId','idempotencyKey']))fail('invalid-request','Only account, item, and idempotency identifiers are accepted');
    const {accountId,category,itemId,idempotencyKey}=request;
    validAccount(accountId);
    const item=getItem(category,itemId);
    if(typeof idempotencyKey!=='string'||!IDEMPOTENCY_KEY.test(idempotencyKey))fail('invalid-idempotency-key','Invalid purchase idempotency key');
    // Request hash binds a retry key to exactly one product. No client price is accepted.
    const requestHash=createHash('sha256').update(JSON.stringify({category:item.category,itemId:item.id,price:item.price})).digest('hex');
    return transaction(async client=>{
      // Share the exact lock namespace used by online rewards, so earnings and
      // purchases serialize even when the balance row is not yet present.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`online-token-balance:${accountId}`]);
      const replay=(await client.query(
        'SELECT request_hash,category,item_id,price,balance_after,recorded_at FROM smf_online_ut_purchase_ledger WHERE account_id=$1 AND idempotency_key=$2 FOR UPDATE',
        [accountId,idempotencyKey])).rows?.[0];
      if(replay){
        if(replay.request_hash!==requestHash||replay.category!==item.category||replay.item_id!==item.id||Number(replay.price)!==item.price)fail('idempotency-conflict','Purchase key was already used for a different item');
        const current=await client.query('SELECT balance FROM smf_online_token_balances WHERE account_id=$1 FOR UPDATE',[accountId]);
        const balance=Number(current.rows?.[0]?.balance??0);
        if(!Number.isSafeInteger(Number(replay.balance_after))||Number(replay.balance_after)<0||Number(replay.balance_after)>ECONOMY.MAX_TOKENS||!Number.isSafeInteger(balance)||balance<0||balance>ECONOMY.MAX_TOKENS)fail('corrupt-ledger','Stored UT purchase receipt is invalid');
        return Object.freeze({ok:true,duplicate:true,price:item.price,balance,
          receipt:Object.freeze({category:item.category,itemId:item.id,price:item.price,balanceAfter:Number(replay.balance_after),recordedAt:dateValue(replay.recorded_at)})});
      }
      const balanceRow=(await client.query('SELECT balance FROM smf_online_token_balances WHERE account_id=$1 FOR UPDATE',[accountId])).rows?.[0];
      const balance=Number(balanceRow?.balance??0);
      if(!Number.isSafeInteger(balance)||balance<0||balance>ECONOMY.MAX_TOKENS)fail('corrupt-balance','Stored token balance is invalid');
      const owned=(await client.query('SELECT item_id FROM smf_online_ut_owned_items WHERE account_id=$1 AND category=$2 AND item_id=$3 FOR UPDATE',[accountId,item.category,item.id])).rows?.[0];
      const includedWithTeam=item.category==='player'&&await ownsTeam(client,accountId,canonicalPlayers.get(item.id).teamId);
      if(owned||item.category==='team'&&item.id===FREE_STARTER_TEAM_ID||includedWithTeam)fail('already-owned','This account already owns the item');
      if(balance<item.price)fail('insufficient-balance','Not enough online tokens for this item');
      const balanceAfter=balance-item.price,recordedAt=dateValue(now());
      await client.query('UPDATE smf_online_token_balances SET balance=$2,updated_at=$3 WHERE account_id=$1',[accountId,balanceAfter,recordedAt]);
      await client.query('INSERT INTO smf_online_ut_owned_items (account_id,category,item_id,acquired_at) VALUES ($1,$2,$3,$4)',[accountId,item.category,item.id,recordedAt]);
      await client.query('INSERT INTO smf_online_ut_purchase_ledger (account_id,idempotency_key,request_hash,category,item_id,price,balance_after,recorded_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[accountId,idempotencyKey,requestHash,item.category,item.id,item.price,balanceAfter,recordedAt]);
      return Object.freeze({ok:true,duplicate:false,price:item.price,balance:balanceAfter,
        receipt:Object.freeze({category:item.category,itemId:item.id,price:item.price,balanceAfter,recordedAt})});
    });
  }
  return Object.freeze({getCatalog,getCollection,isItemOwned,purchase,getLineup,saveLineup,catalogSize:catalog.size});
}
