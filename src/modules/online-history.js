/** Account-scoped, single-flight pagination for the online match archive. */
const ONLINE_HISTORY_MATCH_ID=/^[a-f0-9]{32}$/;
const PENDING_MATCH_KEY='smf.online.pending-match-result.v1';
const PENDING_MATCH_CAPACITY=4;
function safePendingStorage(storage){
 if(storage!==undefined)return storage;
 try{return globalThis.sessionStorage||null}catch{return null;}
}
function validHistoryItem(item){
 return !!item&&typeof item==='object'&&!Array.isArray(item)&&Object.keys(item).length===6&&
  typeof item.matchId==='string'&&ONLINE_HISTORY_MATCH_ID.test(item.matchId)&&typeof item.recordedAt==='string'&&Number.isFinite(Date.parse(item.recordedAt))&&
  typeof item.teamId==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(item.teamId)&&typeof item.opponentTeamId==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(item.opponentTeamId)&&
  item.teamId!==item.opponentTeamId&&Array.isArray(item.score)&&item.score.length===2&&item.score.every(value=>Number.isSafeInteger(value)&&value>=0&&value<=999)&&
  ['win','draw','loss'].includes(item.outcome);
}
export function createOnlineHistoryController({loadPage,isSignedIn,describeError=error=>error?.message||'Could not load online match history.',storage}={}){
 if(typeof loadPage!=='function'||typeof isSignedIn!=='function'||typeof describeError!=='function')
  throw new TypeError('Online match history requires page, session, and error handlers');
 const pendingStorage=safePendingStorage(storage);
 let generation=0,loading=false,recoveryLoading=false,recoveryPromise=null,recoveryTarget=null,pendingMatchIds=[],pendingMatchPersisted=true,pendingStorageInvalid=false,pendingStorageReadError=false,pendingStorageLoaded=false;
 let items=[],cursor=null,status='';
 function readPendingMatches(){
  if(pendingStorageLoaded)return pendingMatchIds.slice();
  pendingStorageLoaded=true;
  try{
   const stored=pendingStorage?.getItem(PENDING_MATCH_KEY);
   if(typeof stored!=='string'||!stored){pendingMatchPersisted=!!pendingStorage;return [];}
   let candidates;
   if(ONLINE_HISTORY_MATCH_ID.test(stored))candidates=[stored];
   else{
    let decoded;try{decoded=JSON.parse(stored)}catch{pendingStorageInvalid=true;pendingMatchPersisted=false;return [];}
    if(!Array.isArray(decoded)){pendingStorageInvalid=true;pendingMatchPersisted=false;return [];}
    candidates=decoded;
   }
   if(candidates.some(value=>typeof value!=='string'||!ONLINE_HISTORY_MATCH_ID.test(value)))pendingStorageInvalid=true;
   const unique=[...new Set(candidates.filter(value=>typeof value==='string'&&ONLINE_HISTORY_MATCH_ID.test(value)))];
   if(unique.length>PENDING_MATCH_CAPACITY)pendingStorageInvalid=true;
   pendingMatchIds=unique.slice(0,PENDING_MATCH_CAPACITY);pendingMatchPersisted=!pendingStorageInvalid;
  }catch{pendingStorageReadError=true;pendingMatchPersisted=false;}
  return pendingMatchIds.slice();
 }
 function persistPendingMatches(next){
  if(!pendingStorage){pendingMatchPersisted=false;return false;}
  try{if(next.length)pendingStorage.setItem(PENDING_MATCH_KEY,JSON.stringify(next));else pendingStorage.removeItem(PENDING_MATCH_KEY);pendingMatchPersisted=true;pendingStorageInvalid=false;return true;}
  catch{pendingMatchPersisted=false;return false;}
 }
 function rememberPendingMatch(matchId){
  if(typeof matchId!=='string'||!ONLINE_HISTORY_MATCH_ID.test(matchId)||!isSignedIn())return false;
  const current=readPendingMatches();
  if(current.includes(matchId))return persistPendingMatches(current);
  if(current.length>=PENDING_MATCH_CAPACITY||pendingStorageInvalid||pendingStorageReadError)return false;
  const next=[...current,matchId];pendingMatchIds=next;
  return persistPendingMatches(next);
 }
 function clearPendingMatch(matchId){
  const current=readPendingMatches(),target=typeof matchId==='string'?matchId:current[0];
  if(!target||!current.includes(target)||pendingStorageReadError)return false;
  if(pendingStorageInvalid){pendingMatchIds=current.filter(value=>value!==target);pendingMatchPersisted=false;return false;}
  const next=current.filter(value=>value!==target);
  if(pendingStorage){
   try{if(next.length)pendingStorage.setItem(PENDING_MATCH_KEY,JSON.stringify(next));else pendingStorage.removeItem(PENDING_MATCH_KEY);}
   catch{pendingMatchPersisted=false;return false;}
  }
  pendingMatchIds=next;pendingMatchPersisted=next.length?!!pendingStorage:true;pendingStorageInvalid=false;return true;
 }
 const snapshot=()=>{const ids=readPendingMatches();return Object.freeze({items:Object.freeze(items.slice()),cursor,status,loading,recoveryLoading,pendingMatchId:ids[0]||null,pendingMatchIds:Object.freeze(ids),pendingMatchCapacity:PENDING_MATCH_CAPACITY,pendingMatchCapacityReached:ids.length>=PENDING_MATCH_CAPACITY||pendingStorageInvalid||pendingStorageReadError,pendingStorageInvalid,pendingStorageReadError,pendingMatchPersisted});};
 async function load({append=false}={}){
  if(loading)return false;
  if(!isSignedIn()){status='Sign in to view server-recorded results.';return false;}
  if(append&&!cursor){status='All available match results are already loaded.';return false;}
  const requestId=++generation;
  loading=true;status=append?'Loading more match results…':'Loading match history…';
  try{
   const page=await loadPage({limit:20,...(append?{cursor}:{})});
   if(requestId!==generation||!isSignedIn())return false;
   if(!page||!Array.isArray(page.items)||!(page.nextCursor===null||typeof page.nextCursor==='string'))
    throw new Error('The match history response was invalid.');
   if(append){
    const seen=new Set(items.map(item=>item.matchId));
    items=[...items,...page.items.filter(item=>{if(seen.has(item.matchId))return false;seen.add(item.matchId);return true;})];
   }else items=page.items.slice();
   cursor=page.nextCursor;
   status=items.length?`Loaded ${items.length} server-recorded results.`:'No completed online matches are recorded for this account yet.';
   return true;
  }catch(error){
   if(requestId===generation&&isSignedIn())status=describeError(error);
   return false;
  }finally{
   if(requestId===generation)loading=false;
  }
 }
 async function recoverPendingMatch(matchId=readPendingMatches()[0]){
  const target=typeof matchId==='string'&&ONLINE_HISTORY_MATCH_ID.test(matchId)?matchId:null;
  if(recoveryPromise){if(recoveryTarget===target)return recoveryPromise;return Object.freeze({status:'busy',item:null,message:'Another pending match result is already being checked.'});}
  if(pendingStorageReadError)return Object.freeze({status:'corrupt',item:null,message:'The saved pending-match list could not be read. New PVP remains paused until storage is repaired or explicitly discarded.'});
  if(!target||!readPendingMatches().includes(target))return Object.freeze({status:pendingStorageInvalid?'corrupt':'unavailable',item:null,message:pendingStorageInvalid?'The saved list is corrupt; only valid match IDs already recovered from it can be checked.':'There is no pending server match result to recover.'});
  if(!isSignedIn())return Object.freeze({status:'signed-out',item:null,message:'Sign in to check this account for its server-recorded match result.'});
  const requestId=generation;
  recoveryLoading=true;recoveryTarget=target;status='Checking this account for the finished match…';
  const operation=Promise.resolve().then(async()=>{
   try{
    const page=await loadPage({limit:20});
    if(requestId!==generation||!isSignedIn()||!readPendingMatches().includes(target))return Object.freeze({status:'stale',item:null,message:'The account changed before the match result could be checked.'});
    if(!page||!Array.isArray(page.items)||!(page.nextCursor===null||typeof page.nextCursor==='string')||page.items.some(item=>!validHistoryItem(item)))
     throw new Error('The match history response was invalid.');
    const item=page.items.find(row=>row.matchId===target)||null;
    if(item){status='Recovered the server-recorded result for this match.';return Object.freeze({status:'found',item:Object.freeze({...item,score:Object.freeze(item.score.slice())}),message:status});}
    status='No finished result is recorded for this match yet. The server may still be completing it; retry shortly.';
    return Object.freeze({status:'pending',item:null,message:status});
   }catch(error){
    if(requestId!==generation||!isSignedIn())return Object.freeze({status:'stale',item:null,message:'The account changed before the match result could be checked.'});
    status=describeError(error);return Object.freeze({status:'error',item:null,message:status});
   }finally{if(recoveryPromise===operation){recoveryLoading=false;recoveryPromise=null;recoveryTarget=null;}}
  });
  recoveryPromise=operation;
  return operation;
 }
 function discardCorruptPendingMatches({confirmed=false}={}){
  if(!confirmed||(!pendingStorageInvalid&&!pendingStorageReadError)||!pendingStorage)return false;
  try{pendingStorage.removeItem(PENDING_MATCH_KEY);}catch{pendingMatchPersisted=false;return false;}
  pendingMatchIds=[];pendingStorageInvalid=false;pendingStorageReadError=false;pendingMatchPersisted=true;
  status='Unreadable pending-match data was explicitly discarded. Any unclaimed result represented only by that data may no longer be recoverable.';
  return true;
 }
 function reset(){generation++;loading=false;recoveryLoading=false;recoveryPromise=null;recoveryTarget=null;items=[];cursor=null;status='';}
 return Object.freeze({load,reset,rememberPendingMatch,clearPendingMatch,recoverPendingMatch,discardCorruptPendingMatches,get state(){return snapshot();}});
}
