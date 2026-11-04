import {createHash,randomBytes} from 'node:crypto';

export const ONLINE_CAREER_AI_PARTICIPANT='smf_server_career_ai';
const ACCOUNT_ID=/^[A-Za-z0-9_-]{8,128}$/;
const TEAM_ID=/^[A-Za-z0-9_-]{1,64}$/;
const OPAQUE_ID=/^[a-f0-9]{32}$/;

/**
 * Build a server-owned single-account AI league schedule. The account ID must come
 * from verified server auth, and isTeamOwned must be backed by the server entitlement
 * store. Callers must never forward a fixture list or ownership answer from HTTP input.
 */
export function createOnlineCareerScheduleBuilder({canonicalTeamIds,isTeamOwned,defaultTeamId='japan',
  opponentsPerSeason=8,aiParticipantId=ONLINE_CAREER_AI_PARTICIPANT}={}){
  if(!Array.isArray(canonicalTeamIds)||canonicalTeamIds.length<3||canonicalTeamIds.length>512||
    canonicalTeamIds.some(id=>typeof id!=='string'||!TEAM_ID.test(id))||new Set(canonicalTeamIds).size!==canonicalTeamIds.length)
    throw new TypeError('Online Career requires a unique canonical team catalog');
  if(typeof isTeamOwned!=='function')throw new TypeError('Online Career requires a trusted team-ownership resolver');
  if(typeof defaultTeamId!=='string'||!canonicalTeamIds.includes(defaultTeamId))throw new TypeError('Online Career free team must be canonical');
  if(!Number.isSafeInteger(opponentsPerSeason)||opponentsPerSeason<2||opponentsPerSeason>32||opponentsPerSeason>canonicalTeamIds.length-1)
    throw new TypeError('Online Career opponent count must select multiple distinct canonical teams');
  if(typeof aiParticipantId!=='string'||!ACCOUNT_ID.test(aiParticipantId))throw new TypeError('Online Career AI participant ID is invalid');
  const teams=Object.freeze(canonicalTeamIds.slice().sort());
  async function buildSchedule(accountId,{teamId=null}={}){
    if(typeof accountId!=='string'||!ACCOUNT_ID.test(accountId)||accountId===aiParticipantId)throw Object.assign(new Error('Invalid authenticated Career account'),{code:'invalid-account'});
    const selected=teamId===null?defaultTeamId:teamId;
    if(typeof selected!=='string'||!teams.includes(selected))throw Object.assign(new Error('Career team is not in the canonical catalog'),{code:'invalid-team'});
    if(selected!==defaultTeamId){
      let owned=false;
      try{owned=await isTeamOwned(accountId,selected)}catch{}
      if(owned!==true)throw Object.assign(new Error('Career team is not owned by this account'),{code:'team-not-owned'});
    }
    const opponents=teams.filter(id=>id!==selected),rotation=Number.parseInt(createHash('sha256').update(accountId).digest('hex').slice(0,8),16)%opponents.length;
    const fixtures=[];
    for(let index=0;index<opponentsPerSeason;index++){
      fixtures.push(Object.freeze({fixtureNo:index+1,fixtureId:randomBytes(16).toString('hex'),matchId:randomBytes(16).toString('hex'),
        participants:Object.freeze([Object.freeze({userId:accountId,side:0}),Object.freeze({userId:aiParticipantId,side:1})]),
        teamIds:Object.freeze([selected,opponents[(rotation+index)%opponents.length]]),mode:'career-ai'}));
    }
    return Object.freeze(fixtures);
  }
  return Object.freeze({buildSchedule,defaultTeamId,aiParticipantId,opponentsPerSeason,canonicalTeamIds:teams});
}
