const MATCH_ID=/^[a-f0-9]{32}$/;
const USER_ID=/^[A-Za-z0-9_-]{8,64}$/;
const TEAM_ID=/^[A-Za-z0-9_-]{1,64}$/;
const ACCOUNT_ID=/^[A-Za-z0-9_-]{8,128}$/;
const MAX_ACTIVE=64;
function invalid(code){const error=new Error(code);error.code=code;throw error;}
function validateAssignment(value){
 if(!value||!MATCH_ID.test(value.matchId||'')||!Array.isArray(value.participants)||value.participants.length!==2||
  !value.participants.every(id=>typeof id==='string'&&USER_ID.test(id))||value.participants[0]===value.participants[1]||
  !Array.isArray(value.teamIds)||value.teamIds.length!==2||!value.teamIds.every(id=>typeof id==='string'&&TEAM_ID.test(id))||value.teamIds[0]===value.teamIds[1])invalid('invalid-lifecycle-assignment');
 return {matchId:value.matchId,participants:value.participants.slice(),teamIds:value.teamIds.slice()};
}
export function createOnlineMatchLifecycleStore({db,now=()=>new Date()}={}){
 if(!db||typeof db.query!=='function'||typeof db.connect!=='function'||typeof now!=='function')throw new TypeError('Online match lifecycle store requires PostgreSQL and a clock');
 async function transaction(work){const client=await db.connect();try{await client.query('BEGIN');const value=await work(client);await client.query('COMMIT');return value;}catch(error){try{await client.query('ROLLBACK')}catch{}throw error;}finally{client.release?.();}}
 async function recordAssigned(raw){
  const value=validateAssignment(raw),stamp=new Date(now()).toISOString();
  return transaction(async client=>{
   await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[value.matchId]);
   const existing=await client.query('SELECT participant_0,participant_1,team_0,team_1,status FROM smf_online_match_lifecycle WHERE match_id=$1 FOR UPDATE',[value.matchId]);
   if(existing.rows?.[0]){const row=existing.rows[0];if(row.participant_0!==value.participants[0]||row.participant_1!==value.participants[1]||row.team_0!==value.teamIds[0]||row.team_1!==value.teamIds[1])invalid('lifecycle-conflict');if(row.status!=='active')invalid('lifecycle-not-active');return Object.freeze({matchId:value.matchId,duplicate:true});}
   await client.query(`INSERT INTO smf_online_match_lifecycle(match_id,participant_0,participant_1,team_0,team_1,status,assigned_at,updated_at)
    VALUES($1,$2,$3,$4,$5,'active',$6,$6)`,[value.matchId,...value.participants,...value.teamIds,stamp]);
   return Object.freeze({matchId:value.matchId,duplicate:false});
  });
 }
 async function markCompletedInTransaction(client,raw){
  const value=validateAssignment({matchId:raw.matchId,participants:raw.participants.map(row=>row.userId),teamIds:raw.teamIds});
  const result=await client.query('SELECT participant_0,participant_1,team_0,team_1,status FROM smf_online_match_lifecycle WHERE match_id=$1 FOR UPDATE',[value.matchId]);
  const row=result.rows?.[0];if(!row)return false; // Career and non-PVP rows are not lifecycle records.
  if(row.participant_0!==value.participants[0]||row.participant_1!==value.participants[1]||row.team_0!==value.teamIds[0]||row.team_1!==value.teamIds[1])invalid('lifecycle-result-mismatch');
  if(row.status==='active')await client.query("UPDATE smf_online_match_lifecycle SET status='completed',updated_at=$2 WHERE match_id=$1",[value.matchId,new Date(now()).toISOString()]);
  else if(row.status!=='completed')invalid('lifecycle-already-interrupted');
  return true;
 }
 async function reconcileAfterRestart(resultStore){
  if(!resultStore||typeof resultStore.getFinalResult!=='function')throw new TypeError('PVP startup reconciliation requires the immutable result store');
  const pending=await db.query("SELECT match_id FROM smf_online_match_lifecycle WHERE status='active' ORDER BY assigned_at LIMIT $1",[MAX_ACTIVE+1]);
  if((pending.rows||[]).length>MAX_ACTIVE)throw new Error('PVP lifecycle active-row bound was exceeded');
  let completed=0,interrupted=0;
  for(const entry of pending.rows||[]){
   const result=await resultStore.getFinalResult(entry.match_id);
   await transaction(async client=>{
    const current=await client.query('SELECT participant_0,participant_1,team_0,team_1,status FROM smf_online_match_lifecycle WHERE match_id=$1 FOR UPDATE',[entry.match_id]);
    const lifecycle=current.rows?.[0];if(lifecycle?.status!=='active')return;
    if(result){
     const assignment=validateAssignment({matchId:result.matchId,participants:result.participants?.map(row=>row.userId),teamIds:result.teamIds});
     if(assignment.matchId!==entry.match_id||assignment.participants[0]!==lifecycle.participant_0||assignment.participants[1]!==lifecycle.participant_1||assignment.teamIds[0]!==lifecycle.team_0||assignment.teamIds[1]!==lifecycle.team_1)invalid('lifecycle-result-mismatch');
     await client.query("UPDATE smf_online_match_lifecycle SET status='completed',updated_at=$2 WHERE match_id=$1",[entry.match_id,new Date(now()).toISOString()]);completed++;
    }
    else {await client.query("UPDATE smf_online_match_lifecycle SET status='interrupted',updated_at=$2 WHERE match_id=$1",[entry.match_id,new Date(now()).toISOString()]);interrupted++;}
   });
  }
  return Object.freeze({completed,interrupted});
 }
 async function listStatuses(accountId,matchIds){
  if(typeof accountId!=='string'||!ACCOUNT_ID.test(accountId))invalid('invalid-account');
  if(!Array.isArray(matchIds)||matchIds.length<1||matchIds.length>4||!matchIds.every(id=>typeof id==='string'&&MATCH_ID.test(id))||new Set(matchIds).size!==matchIds.length)invalid('invalid-match-ids');
  const response=await db.query(`SELECT match_id,status FROM smf_online_match_lifecycle
    WHERE match_id=ANY($1::char(32)[]) AND (participant_0=$2 OR participant_1=$2)`,[matchIds,accountId]);
  const owned=new Map((response.rows||[]).map(row=>[String(row.match_id).trim(),row.status]));
  return Object.freeze({items:Object.freeze(matchIds.map(matchId=>Object.freeze({matchId,status:['active','completed','interrupted'].includes(owned.get(matchId))?owned.get(matchId):'unknown'})))});
 }
 return Object.freeze({recordAssigned,markCompletedInTransaction,reconcileAfterRestart,listStatuses});
}
