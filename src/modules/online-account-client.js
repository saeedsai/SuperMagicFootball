const API_ROOT = '/api/v1';
const ROUTES = Object.freeze({
  me: `${API_ROOT}/me`,
  career: `${API_ROOT}/career/current`,
  squad: `${API_ROOT}/ultimate-team/squad`,
  ticket: `${API_ROOT}/matches/ticket`,
  resumeTicket: `${API_ROOT}/matches/resume-ticket`,
  history: `${API_ROOT}/matches/history`,
  claimReward: `${API_ROOT}/matches/rewards/claim`,
  tokenBalance: `${API_ROOT}/tokens/balance`,
  onlineCareer: `${API_ROOT}/online-career/current`,
  onlineCareerSeasons: `${API_ROOT}/online-career/seasons`,
  onlineCareerTicket: `${API_ROOT}/online-career/current/fixtures/next/ticket`,
  utCatalog: `${API_ROOT}/ultimate-team/catalog`,
  utCollection: `${API_ROOT}/ultimate-team/collection`,
  utLineup: `${API_ROOT}/ultimate-team/lineup`,
  utPurchases: `${API_ROOT}/ultimate-team/purchases`,
});
const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{8,128}$/;
const MAX_SNAPSHOT_BYTES = 512 * 1024;

export class OnlineAccountError extends Error {
  constructor(code, status = null) {
    const messages = {
      'auth-required': 'Sign in to use online features.',
      unauthorized: 'Your online session has expired. Sign in again.',
      'version-conflict': 'This online save changed elsewhere. Reload it before saving.',
      'idempotency-conflict': 'This save request conflicts with an earlier request.',
      'already-active': 'You already have a matchmaking request in progress.',
      'resume-unavailable': 'This online match is no longer available to resume. You can start another match.',
      'matchmaking-unavailable': 'Matchmaking is temporarily unavailable.',
      'reward-unavailable': 'No reward is available for this account and match.',
      'rewards-unavailable': 'Online rewards are temporarily unavailable.',
      'already-owned': 'This item is already in your Ultimate Team collection.',
      'insufficient-balance': 'You do not have enough online tokens for this item.',
      'unknown-item': 'This item is no longer available in the online catalog.',
      'team-not-owned': 'Acquire this team in your online collection before entering an online match. Japan is always available as a free starter team.',
      'player-not-owned': 'A replacement player must belong to the selected team or be in your online collection.',
      'stale-lineup-version': 'This online lineup changed elsewhere. Reload it before saving.',
      'invalid-lineup': 'The online lineup is invalid. Use twelve unique players with matching roles.',
      'online-career-unavailable': 'Online Career is temporarily unavailable. Your offline Career remains unchanged.',
      'online-career-season-not-found': 'No Online Career season is available yet. Create one to begin.',
      'online-career-fixture-not-found': 'The requested Online Career fixture is no longer available.',
      'online-career-season-conflict': 'An Online Career season already exists with different team settings.',
      'online-career-season-complete': 'This Online Career season has no remaining fixtures.',
      'online-career-match-unavailable': 'The next Online Career match could not be reserved. Retry in a moment.',
      'invalid-career-request': 'The Online Career request is invalid. Check the selected team and try again.',
      timeout: 'The online service took too long to respond.',
      aborted: 'The online request was cancelled.',
      'network-unavailable': 'The online service could not be reached.',
      'invalid-request': 'The online save request is invalid.',
      'invalid-response': 'The online service returned an invalid response.',
      'service-unavailable': 'The online service is temporarily unavailable.',
    };
    super(messages[code] || messages['service-unavailable']);
    this.name = 'OnlineAccountError';
    this.code = Object.hasOwn(messages, code) ? code : 'service-unavailable';
    this.status = Number.isInteger(status) ? status : null;
  }
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}
function exactKeys(value,keys){return isRecord(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));}

function validVersion(value) { return Number.isSafeInteger(value) && value >= 0; }

function cloneJsonRecord(value, {maxBytes = MAX_SNAPSHOT_BYTES} = {}) {
  const seen = new Set();
  let nodes = 0;
  function inspect(item, depth) {
    if (++nodes > 15000 || depth > 32) throw new OnlineAccountError('invalid-request');
    if (item === null || typeof item === 'string' || typeof item === 'boolean') return;
    if (typeof item === 'number') {
      if (!Number.isFinite(item)) throw new OnlineAccountError('invalid-request');
      return;
    }
    if (typeof item !== 'object' || seen.has(item)) throw new OnlineAccountError('invalid-request');
    seen.add(item);
    if (Array.isArray(item)) {
      for (const child of item) inspect(child, depth + 1);
    } else {
      if (!isRecord(item)) throw new OnlineAccountError('invalid-request');
      for (const [key, child] of Object.entries(item)) {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new OnlineAccountError('invalid-request');
        inspect(child, depth + 1);
      }
    }
    seen.delete(item);
  }
  if (!isRecord(value)) throw new OnlineAccountError('invalid-request');
  inspect(value, 0);
  let serialized;
  try { serialized = JSON.stringify(value); }
  catch { throw new OnlineAccountError('invalid-request'); }
  if (new TextEncoder().encode(serialized).byteLength > maxBytes) throw new OnlineAccountError('invalid-request');
  try { return JSON.parse(serialized); }
  catch { throw new OnlineAccountError('invalid-request'); }
}

function validTimestamp(value) { return value === null || (typeof value === 'string' && !Number.isNaN(Date.parse(value))); }
function validIsoTimestamp(value) { return typeof value==='string'&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString()===value; }
const UT_CATEGORIES=new Set(['team','player']);
const UT_ITEM_ID=/^[A-Za-z0-9_-]{1,64}(?:\/[A-Za-z0-9_-]{1,64})?$/;
function validateUtCatalog(value){
 if(!isRecord(value)||Object.keys(value).length!==1||!Object.hasOwn(value,'catalog')||!Array.isArray(value.catalog)||value.catalog.length>10000)
  throw new OnlineAccountError('invalid-response');
 const seen=new Set();
 const catalog=value.catalog.map(row=>{
  if(!isRecord(row)||Object.keys(row).length!==3||!Object.hasOwn(row,'category')||!Object.hasOwn(row,'id')||!Object.hasOwn(row,'price')||
   !UT_CATEGORIES.has(row.category)||typeof row.id!=='string'||!UT_ITEM_ID.test(row.id)||
   row.category==='team'&&row.id.includes('/')||row.category==='player'&&!row.id.includes('/')||
   !Number.isSafeInteger(row.price)||row.price<1||row.price>999999)throw new OnlineAccountError('invalid-response');
  const key=`${row.category}:${row.id}`;if(seen.has(key))throw new OnlineAccountError('invalid-response');seen.add(key);
  return {category:row.category,id:row.id,price:row.price};
 });
 return catalog;
}
function validateUtCollection(value){
 if(!isRecord(value)||Object.keys(value).length!==2||!Object.hasOwn(value,'items')||!Object.hasOwn(value,'balance')||
  !Array.isArray(value.items)||value.items.length>10000||!Number.isSafeInteger(value.balance)||value.balance<0||value.balance>999999)
  throw new OnlineAccountError('invalid-response');
 const seen=new Set();
 const items=value.items.map(row=>{
  if(!isRecord(row)||Object.keys(row).length!==3||!Object.hasOwn(row,'category')||!Object.hasOwn(row,'itemId')||!Object.hasOwn(row,'acquiredAt')||
   !UT_CATEGORIES.has(row.category)||typeof row.itemId!=='string'||!UT_ITEM_ID.test(row.itemId)||
   row.category==='team'&&row.itemId.includes('/')||row.category==='player'&&!row.itemId.includes('/')||(row.acquiredAt!==null&&!validTimestamp(row.acquiredAt)))
   throw new OnlineAccountError('invalid-response');
  const key=`${row.category}:${row.itemId}`;if(seen.has(key))throw new OnlineAccountError('invalid-response');seen.add(key);
  return {category:row.category,itemId:row.itemId,acquiredAt:row.acquiredAt};
 });
 return {items,balance:value.balance};
}
function validateUtLineup(value){
 if(!isRecord(value)||Object.keys(value).length!==1||!Object.hasOwn(value,'lineup'))throw new OnlineAccountError('invalid-response');
 const row=value.lineup;
 if(!isRecord(row)||Object.keys(row).length!==3||typeof row.teamId!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(row.teamId)||
   !Array.isArray(row.playerIds)||row.playerIds.length!==12||!row.playerIds.every(id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,64}\/[A-Za-z0-9_-]{1,64}$/.test(id))||
   new Set(row.playerIds).size!==12||!Number.isSafeInteger(row.version)||row.version<0)throw new OnlineAccountError('invalid-response');
 return {teamId:row.teamId,playerIds:row.playerIds.slice(),version:row.version};
}
const TEAM_ID=/^[A-Za-z0-9_-]{1,64}$/;
const CAREER_FIXTURE_MAX=64;
function validateOnlineCareerSeason(value,{allowNull=false}={}){
 if(value===null&&allowNull)return null;
 const keys=['version','status','fixtureCount','playedCount','teamId','fixtures','standings'];
 if(!isRecord(value)||Object.keys(value).length!==keys.length||!keys.every(key=>Object.hasOwn(value,key))||
  !Number.isSafeInteger(value.version)||value.version<1||!['active','complete'].includes(value.status)||
  !Number.isSafeInteger(value.fixtureCount)||value.fixtureCount<1||value.fixtureCount>CAREER_FIXTURE_MAX||
  !Number.isSafeInteger(value.playedCount)||value.playedCount<0||value.playedCount>value.fixtureCount||
  typeof value.teamId!=='string'||!TEAM_ID.test(value.teamId)||!Array.isArray(value.fixtures)||value.fixtures.length!==value.fixtureCount||
  !Array.isArray(value.standings)||value.standings.length>128||
  value.playedCount!==value.fixtures.filter(row=>row?.status==='completed').length||
  (value.status==='complete')!==(value.playedCount===value.fixtureCount))throw new OnlineAccountError('invalid-response');
 const fixtures=value.fixtures.map((row,index)=>{
  if(!isRecord(row)||Object.keys(row).length!==5||!['fixtureNo','status','teamIds','score','recordedAt'].every(key=>Object.hasOwn(row,key))||
   row.fixtureNo!==index+1||!['scheduled','completed'].includes(row.status)||!Array.isArray(row.teamIds)||row.teamIds.length!==2||
   !row.teamIds.every(id=>typeof id==='string'&&TEAM_ID.test(id))||row.teamIds[0]===row.teamIds[1]||row.teamIds[0]!==value.teamId||
   row.status==='scheduled'&&(row.score!==null||row.recordedAt!==null)||
   row.status==='completed'&&(!Array.isArray(row.score)||row.score.length!==2||!row.score.every(score=>Number.isSafeInteger(score)&&score>=0&&score<=999)||
    !validIsoTimestamp(row.recordedAt)))throw new OnlineAccountError('invalid-response');
  return {fixtureNo:row.fixtureNo,status:row.status,teamIds:row.teamIds.slice(),score:row.score===null?null:row.score.slice(),recordedAt:row.recordedAt};
 });
 const expected=new Map();
 const add=(teamId,played,wins,draws,losses,goalsFor,goalsAgainst,points)=>{
  const prior=expected.get(teamId)||{teamId,played:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,points:0};
  prior.played+=played;prior.wins+=wins;prior.draws+=draws;prior.losses+=losses;prior.goalsFor+=goalsFor;prior.goalsAgainst+=goalsAgainst;prior.points+=points;expected.set(teamId,prior);
 };
 for(const fixture of fixtures){
  if(fixture.status!=='completed')continue;
  const [home,away]=fixture.teamIds,[homeScore,awayScore]=fixture.score;
  add(home,1,homeScore>awayScore?1:0,homeScore===awayScore?1:0,homeScore<awayScore?1:0,homeScore,awayScore,homeScore>awayScore?3:homeScore===awayScore?1:0);
  add(away,1,awayScore>homeScore?1:0,homeScore===awayScore?1:0,awayScore<homeScore?1:0,awayScore,homeScore,awayScore>homeScore?3:awayScore===homeScore?1:0);
 }
 const ordered=[...expected.values()].map(row=>({...row,goalDifference:row.goalsFor-row.goalsAgainst}))
  .sort((a,b)=>b.points-a.points||b.goalDifference-a.goalDifference||b.goalsFor-a.goalsFor||a.teamId.localeCompare(b.teamId));
 if(value.standings.length!==ordered.length)throw new OnlineAccountError('invalid-response');
 const standings=value.standings.map((row,index)=>{
  const standingKeys=['teamId','played','wins','draws','losses','goalsFor','goalsAgainst','points','goalDifference'];
  if(!isRecord(row)||Object.keys(row).length!==standingKeys.length||!standingKeys.every(key=>Object.hasOwn(row,key))||
   typeof row.teamId!=='string'||!TEAM_ID.test(row.teamId)||
   !['played','wins','draws','losses','goalsFor','goalsAgainst','points'].every(key=>Number.isSafeInteger(row[key])&&row[key]>=0&&row[key]<=CAREER_FIXTURE_MAX*999)||
   !Number.isSafeInteger(row.goalDifference)||row.goalDifference< -CAREER_FIXTURE_MAX*999||row.goalDifference>CAREER_FIXTURE_MAX*999||
   row.teamId!==ordered[index]?.teamId||['played','wins','draws','losses','goalsFor','goalsAgainst','points','goalDifference'].some(key=>row[key]!==ordered[index]?.[key]))
   throw new OnlineAccountError('invalid-response');
  return {...row};
 });
 return {version:value.version,status:value.status,fixtureCount:value.fixtureCount,playedCount:value.playedCount,teamId:value.teamId,fixtures,standings};
}

function validateSnapshotRecord(value, kind) {
  if (!isRecord(value) || value.kind !== kind || !isRecord(value.payload) || !Number.isSafeInteger(value.version) || value.version < 1 || !validTimestamp(value.updatedAt)) {
    throw new OnlineAccountError('invalid-response');
  }
  return {kind, payload:cloneJsonRecord(value.payload), version:value.version, updatedAt:value.updatedAt};
}

function joinUrl(baseUrl, route) {
  if (typeof baseUrl !== 'string' || !baseUrl.trim()) throw new TypeError('baseUrl must be a non-empty string');
  if (baseUrl.startsWith('/')) return `${baseUrl.replace(/\/$/, '')}${route.slice(API_ROOT.length)}`;
  let parsed;
  try { parsed = new URL(baseUrl); } catch { throw new TypeError('baseUrl must be an absolute URL or a root-relative API path'); }
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new TypeError('baseUrl must use HTTP(S)');
  const prefix = parsed.pathname.replace(/\/$/, '');
  parsed.pathname = `${prefix}${route}`;
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString();
}

export function copyOfflineCareerSlotToRemotePayload(slot) {
  if (!isRecord(slot) || !isRecord(slot.career) || typeof slot.name !== 'string' || typeof slot.savedAt !== 'string' || Number.isNaN(Date.parse(slot.savedAt))) {
    throw new OnlineAccountError('invalid-request');
  }
  // This is an explicit, pure copy operation. It never reads or writes browser storage.
  return cloneJsonRecord({schemaVersion:1, name:slot.name, savedAt:slot.savedAt, career:slot.career});
}

export function createOnlineAccountClient({getAccessToken, fetchImpl = globalThis.fetch, baseUrl = API_ROOT, timeoutMs = 10000} = {}) {
  if (typeof getAccessToken !== 'function') throw new TypeError('getAccessToken callback is required');
  if (typeof fetchImpl !== 'function') throw new TypeError('fetch implementation is required');
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) throw new TypeError('timeoutMs must be between 1 and 120000');

  async function request(route, {method = 'GET', body, signal, query} = {}) {
    const controller = new AbortController();
    let timedOut = false;
    let externalAbort = false;
    let timer;
    let removeExternalAbort = () => {};
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
        reject(new OnlineAccountError('timeout'));
      }, timeoutMs);
    });
    if (signal) {
      if (signal.aborted) {
        externalAbort = true;
        controller.abort();
      } else {
        const onAbort = () => { externalAbort = true; controller.abort(); };
        signal.addEventListener('abort', onAbort, {once:true});
        removeExternalAbort = () => signal.removeEventListener('abort', onAbort);
      }
    }
    const operation = (async () => {
      let accessToken;
      try { accessToken = await getAccessToken(); }
      catch { throw new OnlineAccountError('auth-required'); }
      if (typeof accessToken !== 'string' || !/^[\x21-\x7e]{16,512}$/.test(accessToken)) throw new OnlineAccountError('auth-required');
      const headers = {authorization:`Bearer ${accessToken}`, accept:'application/json'};
      const init = {method, headers, signal:controller.signal, cache:'no-store', credentials:'omit'};
      if (externalAbort) throw new OnlineAccountError('aborted');
      if (body !== undefined) {
        headers['content-type'] = 'application/json';
        init.body = JSON.stringify(body);
      }
      let response;
      const url=joinUrl(baseUrl, route),queryText=query instanceof URLSearchParams?query.toString():'';
      try { response = await fetchImpl(queryText?`${url}?${queryText}`:url, init); }
      catch {
        if (timedOut) throw new OnlineAccountError('timeout');
        if (externalAbort) throw new OnlineAccountError('aborted');
        throw new OnlineAccountError('network-unavailable');
      }
      let payload;
      try {
        const contentType = response.headers?.get?.('content-type') || '';
        if (!/^application\/json(?:\s*;|$)/i.test(contentType)) throw new Error('content-type');
        payload = await response.json();
      } catch {
        if (!response.ok) throw responseError(response.status, null);
        throw new OnlineAccountError('invalid-response', response.status);
      }
      if (!response.ok) throw responseError(response.status, payload);
      if (!isRecord(payload)) throw new OnlineAccountError('invalid-response', response.status);
      return payload;
    })();
    try {
      if (externalAbort) throw new OnlineAccountError('aborted');
      return await Promise.race([operation, timeout]);
    } catch (error) {
      if (error instanceof OnlineAccountError) throw error;
      if (timedOut) throw new OnlineAccountError('timeout');
      if (externalAbort) throw new OnlineAccountError('aborted');
      throw new OnlineAccountError('service-unavailable');
    } finally {
      clearTimeout(timer);
      removeExternalAbort();
    }
  }

  async function getSnapshot(route, kind, options) {
    const result = await request(route, options);
    if (!Object.hasOwn(result, 'record')) throw new OnlineAccountError('invalid-response');
    if (result.record === null) return null;
    return validateSnapshotRecord(result.record, kind);
  }

  async function putSnapshot(route, kind, snapshot, {expectedVersion, idempotencyKey, signal} = {}) {
    if (!validVersion(expectedVersion) || typeof idempotencyKey !== 'string' || !IDEMPOTENCY_KEY.test(idempotencyKey)) throw new OnlineAccountError('invalid-request');
    const copy = cloneJsonRecord(snapshot);
    const result = await request(route, {method:'PUT', body:{expectedVersion, idempotencyKey, snapshot:copy}, signal});
    if (!['saved','duplicate'].includes(result.status) || !Number.isSafeInteger(result.version) || result.version < 1 || !Object.hasOwn(result, 'record')) throw new OnlineAccountError('invalid-response');
    const record = validateSnapshotRecord(result.record, kind);
    if (record.version !== result.version || JSON.stringify(record.payload) !== JSON.stringify(copy)) throw new OnlineAccountError('invalid-response');
    if (result.status === 'saved' && result.version !== expectedVersion + 1) throw new OnlineAccountError('invalid-response');
    if (result.status === 'duplicate' && result.version < expectedVersion) throw new OnlineAccountError('invalid-response');
    return {status:result.status, version:result.version, record};
  }

  return Object.freeze({
    async loadMe(options) {
      const result = await request(ROUTES.me, options);
      if (!Object.hasOwn(result, 'profile') || !validVersion(result.version) || !validTimestamp(result.updatedAt)) throw new OnlineAccountError('invalid-response');
      if (result.version === 0 && (result.profile !== null || result.updatedAt !== null)) throw new OnlineAccountError('invalid-response');
      if (result.version > 0 && !isRecord(result.profile)) throw new OnlineAccountError('invalid-response');
      return {profile:result.profile === null ? null : cloneJsonRecord(result.profile), version:result.version, updatedAt:result.updatedAt};
    },
    loadCareer(options) { return getSnapshot(ROUTES.career, 'career', options); },
    saveCareer(snapshot, options) { return putSnapshot(ROUTES.career, 'career', snapshot, options); },
    async loadOnlineCareerSeason(options={}){
      if(!exactKeys(options,[])&&!exactKeys(options,['signal']))throw new OnlineAccountError('invalid-request');
      const result=await request(ROUTES.onlineCareer,options);
      if(!exactKeys(result,['season']))throw new OnlineAccountError('invalid-response');
      return validateOnlineCareerSeason(result.season,{allowNull:true});
    },
    async loadOnlineCareerSeasons(options={}){
      if(!exactKeys(options,[])&&!exactKeys(options,['signal']))throw new OnlineAccountError('invalid-request');
      const result=await request(ROUTES.onlineCareerSeasons,options);
      if(!exactKeys(result,['seasons'])||!Array.isArray(result.seasons)||result.seasons.length>20)throw new OnlineAccountError('invalid-response');
      const seen=new Set();
      return result.seasons.map(row=>{
        if(!isRecord(row)||Object.keys(row).length!==2||typeof row.seasonId!=='string'||!/^[a-f0-9]{32}$/.test(row.seasonId)||seen.has(row.seasonId))throw new OnlineAccountError('invalid-response');
        seen.add(row.seasonId);
        const season=validateOnlineCareerSeason(row.season);
        return {seasonId:row.seasonId,...season};
      });
    },
    async createOnlineCareerSeason(teamId,options={}){
      if(!exactKeys(options,[])&&!exactKeys(options,['signal']))throw new OnlineAccountError('invalid-request');
      if(teamId!==undefined&&(typeof teamId!=='string'||!TEAM_ID.test(teamId)))throw new OnlineAccountError('invalid-request');
      const body=teamId===undefined?undefined:{teamId};
      const result=await request(ROUTES.onlineCareer,{method:'POST',body,signal:options.signal});
      if(!exactKeys(result,['season']))throw new OnlineAccountError('invalid-response');
      return {season:validateOnlineCareerSeason(result.season)};
    },
    async requestOnlineCareerTicket(options={}){
      if(!exactKeys(options,[])&&!exactKeys(options,['signal']))throw new OnlineAccountError('invalid-request');
      const result=await request(ROUTES.onlineCareerTicket,{method:'POST',signal:options.signal});
      if(!exactKeys(result,['ticket','expiresAt','fixtureNo','teamIds'])||typeof result.ticket!=='string'||!/^[a-f0-9]{64}$/.test(result.ticket)||
       !Number.isSafeInteger(result.expiresAt)||result.expiresAt<=Date.now()||!Number.isFinite(new Date(result.expiresAt).getTime())||
       !Number.isSafeInteger(result.fixtureNo)||result.fixtureNo<1||result.fixtureNo>CAREER_FIXTURE_MAX||
       !Array.isArray(result.teamIds)||result.teamIds.length!==2||!result.teamIds.every(id=>typeof id==='string'&&TEAM_ID.test(id))||result.teamIds[0]===result.teamIds[1])
        throw new OnlineAccountError('invalid-response');
      return {ticket:result.ticket,expiresAt:result.expiresAt,fixtureNo:result.fixtureNo,teamIds:result.teamIds.slice()};
    },
    loadUltimateTeam(options) { return getSnapshot(ROUTES.squad, 'ultimate-team', options); },
    saveUltimateTeam(snapshot, options) { return putSnapshot(ROUTES.squad, 'ultimate-team', snapshot, options); },
    async requestMatchTicket(options) {
      const teamId=options?.teamId;
      if(teamId!==undefined&&(typeof teamId!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(teamId)))throw new OnlineAccountError('invalid-request');
      const result = await request(ROUTES.ticket, {method:'POST', ...(teamId===undefined?{}:{body:{teamId}}), signal:options?.signal});
      if (typeof result.ticket !== 'string' || !/^[a-f0-9]{64}$/.test(result.ticket) ||
          !Number.isSafeInteger(result.expiresAt) || result.expiresAt <= Date.now() ||
          !Number.isFinite(new Date(result.expiresAt).getTime())) {
        throw new OnlineAccountError('invalid-response');
      }
      return {ticket:result.ticket, expiresAt:result.expiresAt};
    },
    async requestMatchResumeTicket(options={}) {
      if(!exactKeys(options,[])&&!exactKeys(options,['signal']))throw new OnlineAccountError('invalid-request');
      const result=await request(ROUTES.resumeTicket,{method:'POST',signal:options.signal});
      if(!exactKeys(result,['ticket','expiresAt'])||typeof result.ticket!=='string'||!/^[a-f0-9]{64}$/.test(result.ticket)||
        !Number.isSafeInteger(result.expiresAt)||result.expiresAt<=Date.now()||!Number.isFinite(new Date(result.expiresAt).getTime()))
        throw new OnlineAccountError('invalid-response');
      return {ticket:result.ticket,expiresAt:result.expiresAt};
    },
    async loadMatchHistory({limit=20,cursor,signal}={}) {
      if(!Number.isSafeInteger(limit)||limit<1||limit>50||cursor!==undefined&&
        (typeof cursor!=='string'||cursor.length<1||cursor.length>512||!/^[A-Za-z0-9_-]+$/.test(cursor)))
        throw new OnlineAccountError('invalid-request');
      const query=new URLSearchParams({limit:String(limit)});if(cursor!==undefined)query.set('cursor',cursor);
      const result=await request(ROUTES.history,{signal,query});
      if(!Object.keys(result).every(key=>['items','nextCursor'].includes(key))||Object.keys(result).length!==2||
        !Array.isArray(result.items)||result.items.length>limit||
        !(result.nextCursor===null||typeof result.nextCursor==='string'&&result.nextCursor.length<=512&&/^[A-Za-z0-9_-]+$/.test(result.nextCursor)))
        throw new OnlineAccountError('invalid-response');
      const items=result.items.map(item=>{
        if(!isRecord(item)||Object.keys(item).length!==6||!['matchId','recordedAt','teamId','opponentTeamId','score','outcome'].every(key=>Object.hasOwn(item,key))||
          typeof item.matchId!=='string'||!/^[a-f0-9]{32}$/.test(item.matchId)||!validTimestamp(item.recordedAt)||
          typeof item.teamId!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(item.teamId)||typeof item.opponentTeamId!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(item.opponentTeamId)||
          !Array.isArray(item.score)||item.score.length!==2||!item.score.every(value=>Number.isSafeInteger(value)&&value>=0&&value<=999)||
          !['win','draw','loss'].includes(item.outcome))throw new OnlineAccountError('invalid-response');
        const outcome=item.score[0]>item.score[1]?'win':item.score[0]<item.score[1]?'loss':'draw';
        if(item.outcome!==outcome)throw new OnlineAccountError('invalid-response');
        return {matchId:item.matchId,recordedAt:item.recordedAt,teamId:item.teamId,opponentTeamId:item.opponentTeamId,score:item.score.slice(),outcome};
      });
      return {items,nextCursor:result.nextCursor};
    },
    async getOnlineTokenBalance(options){
      const result=await request(ROUTES.tokenBalance,options);
      if(Object.keys(result).length!==2||!Object.keys(result).every(key=>['balance','maxBalance'].includes(key))||!Object.hasOwn(result,'balance')||!Object.hasOwn(result,'maxBalance')||
        !Number.isSafeInteger(result.balance)||result.balance<0||result.balance>999999||result.maxBalance!==999999)
        throw new OnlineAccountError('invalid-response');
      return {balance:result.balance,maxBalance:result.maxBalance};
    },
    async claimMatchReward(matchId,options){
      if(typeof matchId!=='string'||!/^[a-f0-9]{32}$/.test(matchId))throw new OnlineAccountError('invalid-request');
      const result=await request(ROUTES.claimReward,{method:'POST',body:{matchId},signal:options?.signal});
      const receipt=result.receipt;
      if(Object.keys(result).length!==4||typeof result.duplicate!=='boolean'||!Number.isSafeInteger(result.balance)||result.balance<0||result.balance>999999||result.maxBalance!==999999||
        !isRecord(receipt)||Object.keys(receipt).length!==6||receipt.matchId!==matchId||![0,1].includes(receipt.side)||!['win','draw','loss'].includes(receipt.outcome)||
        !Number.isSafeInteger(receipt.reward)||receipt.reward<0||receipt.reward>30||!Number.isSafeInteger(receipt.balanceAfter)||receipt.balanceAfter<0||receipt.balanceAfter>999999||
        !validTimestamp(receipt.recordedAt)||receipt.balanceAfter>result.balance)
        throw new OnlineAccountError('invalid-response');
      return {duplicate:result.duplicate,balance:result.balance,maxBalance:result.maxBalance,receipt:{...receipt}};
    },
    async loadUltimateTeamCatalog(options){
      const result=await request(ROUTES.utCatalog,options);
      return validateUtCatalog(result);
    },
    async loadUltimateTeamCollection(options){
      const result=await request(ROUTES.utCollection,options);
      return validateUtCollection(result);
    },
    async loadUltimateTeamLineup(teamId='japan',options={}){
      if(typeof teamId!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(teamId)||!exactKeys(options,[])&&!exactKeys(options,['signal']))throw new OnlineAccountError('invalid-request');
      const result=await request(ROUTES.utLineup,{query:new URLSearchParams({teamId}),signal:options.signal});
      const lineup=validateUtLineup(result);if(lineup.teamId!==teamId)throw new OnlineAccountError('invalid-response');return lineup;
    },
    async saveUltimateTeamLineup(options={}){
      if(!exactKeys(options,['teamId','playerIds','expectedVersion','idempotencyKey'])&&!exactKeys(options,['teamId','playerIds','expectedVersion','idempotencyKey','signal']))throw new OnlineAccountError('invalid-request');
      const {teamId,playerIds,expectedVersion,idempotencyKey,signal}=options;
      if(typeof teamId!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(teamId)||!Array.isArray(playerIds)||playerIds.length!==12||
       !playerIds.every(id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,64}\/[A-Za-z0-9_-]{1,64}$/.test(id))||new Set(playerIds).size!==12||
       !Number.isSafeInteger(expectedVersion)||expectedVersion<0||typeof idempotencyKey!=='string'||!IDEMPOTENCY_KEY.test(idempotencyKey))throw new OnlineAccountError('invalid-request');
      const result=await request(ROUTES.utLineup,{method:'PUT',signal,body:{teamId,playerIds,expectedVersion,idempotencyKey}});
      if(!exactKeys(result,['status','lineup'])||!['saved','duplicate'].includes(result.status))throw new OnlineAccountError('invalid-response');
      const lineup=validateUtLineup({lineup:result.lineup});if(lineup.teamId!==teamId||lineup.version<1)throw new OnlineAccountError('invalid-response');
      return {status:result.status,lineup};
    },
    async purchaseUltimateTeamItem(options={}){
      if(!exactKeys(options,['category','itemId','idempotencyKey'])&&!exactKeys(options,['category','itemId','idempotencyKey','signal']))throw new OnlineAccountError('invalid-request');
      const {category,itemId,idempotencyKey,signal}=options;
      if(!UT_CATEGORIES.has(category)||typeof itemId!=='string'||!UT_ITEM_ID.test(itemId)||
       category==='team'&&itemId.includes('/')||category==='player'&&!itemId.includes('/')||
       typeof idempotencyKey!=='string'||!IDEMPOTENCY_KEY.test(idempotencyKey))throw new OnlineAccountError('invalid-request');
      const result=await request(ROUTES.utPurchases,{method:'POST',signal,body:{category,itemId,idempotencyKey}});
      if(Object.keys(result).length!==3||!['purchased','duplicate'].includes(result.status)||
       !Number.isSafeInteger(result.balance)||result.balance<0||result.balance>999999||!isRecord(result.receipt)||
       Object.keys(result.receipt).length!==5||result.receipt.category!==category||result.receipt.itemId!==itemId||
       !Number.isSafeInteger(result.receipt.price)||result.receipt.price<1||result.receipt.price>999999||
       !Number.isSafeInteger(result.receipt.balanceAfter)||result.receipt.balanceAfter<0||result.receipt.balanceAfter>999999||
       !validTimestamp(result.receipt.recordedAt))throw new OnlineAccountError('invalid-response');
      return {status:result.status,balance:result.balance,receipt:{category,itemId,price:result.receipt.price,balanceAfter:result.receipt.balanceAfter,recordedAt:result.receipt.recordedAt}};
    },
  });
}

function responseError(status, payload) {
 const code = payload && isRecord(payload) && ['version-conflict','idempotency-conflict','already-active','resume-unavailable','matchmaking-unavailable','reward-unavailable','rewards-unavailable','already-owned','insufficient-balance','unknown-item','team-not-owned','player-not-owned','stale-lineup-version','invalid-lineup','online-career-unavailable','online-career-season-not-found','online-career-fixture-not-found','online-career-season-conflict','online-career-season-complete','online-career-match-unavailable','invalid-career-request'].includes(payload.error) ? payload.error : null;
  if (status === 401) return new OnlineAccountError('unauthorized', status);
  if (status === 409 && ['version-conflict','idempotency-conflict','already-active'].includes(code)) return new OnlineAccountError(code, status);
  if (status === 409 && code === 'resume-unavailable') return new OnlineAccountError(code,status);
  if (status === 503 && code === 'matchmaking-unavailable') return new OnlineAccountError(code, status);
  if (status === 404 && code === 'reward-unavailable') return new OnlineAccountError(code,status);
  if (status === 503 && code === 'rewards-unavailable') return new OnlineAccountError(code,status);
  if (status === 409 && ['already-owned','idempotency-conflict'].includes(code)) return new OnlineAccountError(code,status);
  if ((status === 409||status===422) && code === 'insufficient-balance') return new OnlineAccountError(code,status);
  if (status === 404 && code === 'unknown-item') return new OnlineAccountError(code,status);
  if (status === 403 && code === 'team-not-owned') return new OnlineAccountError(code,status);
  if (status === 403 && code === 'player-not-owned') return new OnlineAccountError(code,status);
  if (status === 409 && code === 'stale-lineup-version') return new OnlineAccountError(code,status);
  if (status === 400 && code === 'invalid-lineup') return new OnlineAccountError(code,status);
  if (status === 400 && code === 'invalid-career-request') return new OnlineAccountError(code,status);
  if (status === 404 && ['online-career-season-not-found','online-career-fixture-not-found'].includes(code)) return new OnlineAccountError(code,status);
  if (status === 409 && ['online-career-season-conflict','online-career-season-complete','online-career-match-unavailable','already-active'].includes(code)) return new OnlineAccountError(code,status);
  if (status === 503 && ['online-career-unavailable','online-career-match-unavailable'].includes(code)) return new OnlineAccountError(code,status);
  if (status >= 500) return new OnlineAccountError('service-unavailable', status);
  return new OnlineAccountError('invalid-request', status);
}
