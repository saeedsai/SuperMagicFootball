// Snapshot payloads cap at 512 KiB in the PostgreSQL store; reserve space for
// the version/idempotency envelope and JSON syntax without accepting unbounded bodies.
const MAX_BODY_BYTES = 576 * 1024;
const ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
const METHODS = new Set(['GET', 'PUT', 'POST', 'OPTIONS']);
const ROUTES = new Map([
  ['/api/v1/me', new Set(['GET'])],
  ['/api/v1/career/current', new Set(['GET','PUT'])],
  ['/api/v1/ultimate-team/squad', new Set(['GET','PUT'])],
  ['/api/v1/ultimate-team/catalog', new Set(['GET'])],
  ['/api/v1/ultimate-team/collection', new Set(['GET'])],
  ['/api/v1/ultimate-team/lineup', new Set(['GET','PUT'])],
  ['/api/v1/ultimate-team/purchases', new Set(['POST'])],
  ['/api/v1/online-career/current', new Set(['GET','POST'])],
  ['/api/v1/online-career/seasons', new Set(['GET'])],
  ['/api/v1/online-career/current/fixtures/next/ticket', new Set(['POST'])],
  ['/api/v1/matches/ticket', new Set(['POST'])],
  ['/api/v1/matches/resume-ticket', new Set(['POST'])],
  ['/api/v1/matches/history', new Set(['GET'])],
  ['/api/v1/matches/rewards/claim', new Set(['POST'])],
  ['/api/v1/tokens/balance', new Set(['GET'])]
]);
const DEFAULT_RATE_LIMITS = Object.freeze({windowMs:60_000, read:120, write:30, maxAccounts:10_000});

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {status, headers:{'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', 'x-content-type-options':'nosniff', ...headers}});
}

function exactOrigin(value) {
  if (typeof value !== 'string') return null;
  try {
    const parsed = new URL(value);
    if (parsed.origin !== value || !['https:', 'http:'].includes(parsed.protocol)) return null;
    return parsed.origin;
  } catch { return null; }
}

function validateJsonTree(value, depth = 0, budget = {nodes:0}) {
  if (++budget.nodes > 15000 || depth > 32) throw new TypeError('invalid-snapshot');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') { if (!Number.isFinite(value)) throw new TypeError('invalid-snapshot'); return; }
  if (Array.isArray(value)) { for (const item of value) validateJsonTree(item, depth + 1, budget); return; }
  if (typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) throw new TypeError('invalid-snapshot');
  for (const [key, item] of Object.entries(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') throw new TypeError('invalid-snapshot');
    validateJsonTree(item, depth + 1, budget);
  }
}

async function readCommit(request) {
  const type = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (type !== 'application/json') throw Object.assign(new Error('content-type'), {status:415});
  const lengthHeader = request.headers.get('content-length');
  if (lengthHeader !== null && (!/^\d+$/.test(lengthHeader) || Number(lengthHeader) > MAX_BODY_BYTES)) throw Object.assign(new Error('too-large'), {status:413});
  const chunks = [];
  let size = 0;
  if (!request.body) throw Object.assign(new Error('invalid-json'), {status:400});
  const reader = request.body.getReader();
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => {});
        throw Object.assign(new Error('too-large'), {status:413});
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let body;
  try { body = JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(bytes)); }
  catch { throw Object.assign(new Error('invalid-json'), {status:400}); }
  if (!body || Array.isArray(body) || typeof body !== 'object' || Object.getPrototypeOf(body) !== Object.prototype ||
      !Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 0 ||
      typeof body.idempotencyKey !== 'string' || !ID_PATTERN.test(body.idempotencyKey) ||
      !body.snapshot || Array.isArray(body.snapshot) || typeof body.snapshot !== 'object') {
    throw Object.assign(new Error('invalid-commit'), {status:400});
  }
  try { validateJsonTree(body.snapshot); }
  catch { throw Object.assign(new Error('invalid-snapshot'), {status:400}); }
  return {expectedVersion:body.expectedVersion, idempotencyKey:body.idempotencyKey, snapshot:body.snapshot};
}

async function readTicketTeamId(request, matchmaking) {
  const contentLength=request.headers.get('content-length');
  if(contentLength!==null&&(!/^\d+$/.test(contentLength)||Number(contentLength)>1024))throw Object.assign(new Error('too-large'),{status:413});
  if(!request.body)return null;
  const contentType=request.headers.get('content-type')?.split(';',1)[0].trim().toLowerCase();
  if(contentType!=='application/json')throw Object.assign(new Error('content-type'),{status:415});
  const reader=request.body.getReader();let size=0;const chunks=[];
  try{
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;
      if(size>1024){await reader.cancel().catch(()=>{});throw Object.assign(new Error('too-large'),{status:413});}chunks.push(value);}
  }finally{reader.releaseLock();}
  let body;
  try{const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}
  catch(error){if(error?.status)throw error;throw Object.assign(new Error('invalid-json'),{status:400});}
  if(!body||Array.isArray(body)||typeof body!=='object'||Object.getPrototypeOf(body)!==Object.prototype||
      Object.keys(body).length!==1||Object.keys(body)[0]!=='teamId'||typeof body.teamId!=='string'||
      !/^[A-Za-z0-9_-]{1,64}$/.test(body.teamId))throw Object.assign(new Error('invalid-team'),{status:400});
  if(typeof matchmaking?.isValidTeamId!=='function'||!matchmaking.isValidTeamId(body.teamId))throw Object.assign(new Error('invalid-team'),{status:400});
  return body.teamId;
}

async function readRewardMatchId(request){
  const length=request.headers.get('content-length');
  if(length!==null&&(!/^\d+$/.test(length)||Number(length)>1024))throw Object.assign(new Error('too-large'),{status:413});
  if(!request.body)throw Object.assign(new Error('invalid-json'),{status:400});
  if(request.headers.get('content-type')?.split(';',1)[0].trim().toLowerCase()!=='application/json')throw Object.assign(new Error('content-type'),{status:415});
  const reader=request.body.getReader();let size=0;const chunks=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024){await reader.cancel().catch(()=>{});throw Object.assign(new Error('too-large'),{status:413});}chunks.push(value)}}finally{reader.releaseLock()}
  let body;try{const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))}catch(error){if(error?.status)throw error;throw Object.assign(new Error('invalid-json'),{status:400})}
  if(!body||Array.isArray(body)||Object.getPrototypeOf(body)!==Object.prototype||Object.keys(body).length!==1||Object.keys(body)[0]!=='matchId'||typeof body.matchId!=='string'||!/^[a-f0-9]{32}$/.test(body.matchId))throw Object.assign(new Error('invalid-match'),{status:400});
  return body.matchId;
}

async function readUltimateTeamPurchase(request){
  const length=request.headers.get('content-length');
  if(length!==null&&(!/^\d+$/.test(length)||Number(length)>1024))throw Object.assign(new Error('too-large'),{status:413});
  if(!request.body)throw Object.assign(new Error('invalid-json'),{status:400});
  if(request.headers.get('content-type')?.split(';',1)[0].trim().toLowerCase()!=='application/json')throw Object.assign(new Error('content-type'),{status:415});
  const reader=request.body.getReader();let size=0;const chunks=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024){await reader.cancel().catch(()=>{});throw Object.assign(new Error('too-large'),{status:413});}chunks.push(value)}}finally{reader.releaseLock()}
  let body;try{const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))}catch(error){if(error?.status)throw error;throw Object.assign(new Error('invalid-json'),{status:400})}
  const keys=['category','itemId','idempotencyKey'];
  if(!body||Array.isArray(body)||Object.getPrototypeOf(body)!==Object.prototype||Object.keys(body).length!==keys.length||keys.some(key=>!Object.hasOwn(body,key))||
    !['team','player'].includes(body.category)||typeof body.itemId!=='string'||!/^[A-Za-z0-9_-]{1,64}(?:\/[A-Za-z0-9_-]{1,64})?$/.test(body.itemId)||
    typeof body.idempotencyKey!=='string'||!/^[A-Za-z0-9:_-]{8,128}$/.test(body.idempotencyKey))throw Object.assign(new Error('invalid-purchase'),{status:400});
  return {category:body.category,itemId:body.itemId,idempotencyKey:body.idempotencyKey};
}

async function readUltimateTeamLineupCommit(request){
  const length=request.headers.get('content-length');
  if(length!==null&&(!/^\d+$/.test(length)||Number(length)>4096))throw Object.assign(new Error('too-large'),{status:413});
  if(!request.body)throw Object.assign(new Error('invalid-json'),{status:400});
  if(request.headers.get('content-type')?.split(';',1)[0].trim().toLowerCase()!=='application/json')throw Object.assign(new Error('content-type'),{status:415});
  const reader=request.body.getReader();let size=0;const chunks=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4096){await reader.cancel().catch(()=>{});throw Object.assign(new Error('too-large'),{status:413});}chunks.push(value)}}finally{reader.releaseLock()}
  let body;try{const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))}catch(error){if(error?.status)throw error;throw Object.assign(new Error('invalid-json'),{status:400})}
  const keys=['teamId','playerIds','expectedVersion','idempotencyKey'];
  if(!body||Array.isArray(body)||Object.getPrototypeOf(body)!==Object.prototype||Object.keys(body).length!==keys.length||keys.some(key=>!Object.hasOwn(body,key))||
    typeof body.teamId!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(body.teamId)||!Array.isArray(body.playerIds)||body.playerIds.length!==12||
    !body.playerIds.every(id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,64}\/[A-Za-z0-9_-]{1,64}$/.test(id))||
    !Number.isSafeInteger(body.expectedVersion)||body.expectedVersion<0||typeof body.idempotencyKey!=='string'||!/^[A-Za-z0-9:_-]{8,128}$/.test(body.idempotencyKey))
    throw Object.assign(new Error('invalid-lineup'),{status:400});
  return {teamId:body.teamId,playerIds:body.playerIds.slice(),expectedVersion:body.expectedVersion,idempotencyKey:body.idempotencyKey};
}

async function readOnlineCareerTeam(request,matchmaking){
  return readTicketTeamId(request,matchmaking);
}
async function requireEmptyCareerTicketBody(request){
  const length=request.headers.get('content-length');
  if(length!==null&&(!/^\d+$/.test(length)||Number(length)>1024))throw Object.assign(new Error('too-large'),{status:413});
  if(!request.body)return;
  const reader=request.body.getReader();let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024){await reader.cancel().catch(()=>{});throw Object.assign(new Error('too-large'),{status:413});}}}
  finally{reader.releaseLock();}
  if(size>0)throw Object.assign(new Error('invalid-career-request'),{status:400});
}
async function requireEmptyResumeTicketRequest(request){
  if(new URL(request.url).search)throw Object.assign(new Error('invalid-query'),{status:400});
  const length=request.headers.get('content-length');
  if(length!==null&&(!/^\d+$/.test(length)||Number(length)>1024))throw Object.assign(new Error('too-large'),{status:413});
  if(!request.body)return;
  const reader=request.body.getReader();let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024){await reader.cancel().catch(()=>{});throw Object.assign(new Error('too-large'),{status:413});}}}
  finally{reader.releaseLock();}
  if(size>0)throw Object.assign(new Error('invalid-request'),{status:400});
}
function publicOnlineCareerSeason(season){
  if(!season)return null;
  if(!/^[a-f0-9]{32}$/.test(season.seasonId||'')||!Number.isSafeInteger(season.version)||season.version<1||
    !['active','complete'].includes(season.status)||!Number.isSafeInteger(season.fixtureCount)||season.fixtureCount<1||season.fixtureCount>64||
    !Number.isSafeInteger(season.playedCount)||season.playedCount<0||season.playedCount>season.fixtureCount||
    typeof season.teamId!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(season.teamId)||!Array.isArray(season.fixtures)||season.fixtures.length!==season.fixtureCount||
    !Array.isArray(season.standings)||season.standings.length>128)throw new Error('invalid-career-season');
  const fixtures=season.fixtures.map((row,index)=>{
    if(!row||row.fixtureNo!==index+1||!['scheduled','completed'].includes(row.status)||!Array.isArray(row.teamIds)||row.teamIds.length!==2||
      !row.teamIds.every(id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(id))||row.teamIds[0]===row.teamIds[1]||
      !(row.status==='scheduled'&&row.score===null&&row.recordedAt===null||row.status==='completed'&&Array.isArray(row.score)&&row.score.length===2&&row.score.every(value=>Number.isSafeInteger(value)&&value>=0&&value<=999)&&
        typeof row.recordedAt==='string'&&Number.isFinite(Date.parse(row.recordedAt))))throw new Error('invalid-career-fixture');
    return {fixtureNo:row.fixtureNo,status:row.status,teamIds:row.teamIds.slice(),score:row.score===null?null:row.score.slice(),recordedAt:row.recordedAt};
  });
  const standings=season.standings.map(row=>{
    if(!row||typeof row.teamId!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(row.teamId)||
      !['played','wins','draws','losses','goalsFor','goalsAgainst','points'].every(key=>Number.isSafeInteger(row[key])&&row[key]>=0)||
      !Number.isSafeInteger(row.goalDifference))throw new Error('invalid-career-standings');
    return {...row};
  });
  return {version:season.version,status:season.status,fixtureCount:season.fixtureCount,playedCount:season.playedCount,
    teamId:season.teamId,fixtures,standings};
}

/**
 * Create a same-origin/bearer-authenticated API for remote Career and UT data.
 * Store contract: getProfile(userId), getSnapshot(userId, kind),
 * putSnapshot(userId, kind, snapshot, {expectedVersion,idempotencyKey}). Snapshot reads
 * return a versioned record or null; writes return that record with duplicate:true/false,
 * and throw an error with code "version-conflict" or "idempotency-conflict" on conflict.
 * `authenticate(request)` must validate the bearer credential and return {userId}, or null.
 */
function normalizeRateLimits(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some(key => !Object.hasOwn(DEFAULT_RATE_LIMITS, key))) throw new TypeError('Invalid online API rate limits');
  const limits = {...DEFAULT_RATE_LIMITS, ...value};
  if (!Number.isSafeInteger(limits.windowMs) || limits.windowMs < 1000 || limits.windowMs > 3_600_000 ||
      !Number.isSafeInteger(limits.read) || limits.read < 1 || limits.read > 100_000 ||
      !Number.isSafeInteger(limits.write) || limits.write < 1 || limits.write > 100_000 ||
      !Number.isSafeInteger(limits.maxAccounts) || limits.maxAccounts < 1 || limits.maxAccounts > 1_000_000) {
    throw new TypeError('Invalid online API rate limits');
  }
  return Object.freeze(limits);
}

/**
 * Create a same-origin/bearer-authenticated API for remote Career and UT data.
 * The in-memory per-account rate limiter is process-local: multi-instance deploys
 * also need an edge or shared-store limit. Its identity map never evicts live rows.
 */
export function createOnlineAccountApi({authenticate, store, resultStore, rewardStore, ultimateTeamStore, onlineCareerService, allowedOrigins = [], matchmaking, now = Date.now, limits} = {}) {
  if (typeof authenticate !== 'function' || !store || typeof store !== 'object') throw new TypeError('Online API requires auth and store adapters');
  if (typeof now !== 'function') throw new TypeError('Online API requires a clock');
  const rateLimits = normalizeRateLimits(limits);
  for (const method of ['getProfile','getSnapshot','putSnapshot']) if (typeof store[method] !== 'function') throw new TypeError(`Online API store is missing ${method}`);
  if (!Array.isArray(allowedOrigins) || allowedOrigins.some(origin => exactOrigin(origin) !== origin)) throw new TypeError('allowedOrigins must contain exact HTTP(S) origins');
  const origins = new Set(allowedOrigins);
  const rateWindows = new Map();
  let lastCapacitySweep = -Infinity;

  function takeRateToken(userId, method) {
    const current = now();
    if (!Number.isFinite(current)) return {ok:false, retryAfter:1, unavailable:true};
    let row = rateWindows.get(userId);
    if (!row) {
      if (rateWindows.size >= rateLimits.maxAccounts) {
        // Sweep only on capacity pressure, at most once per second, so the normal
        // request path stays O(1) while expired identities can eventually free slots.
        if (current - lastCapacitySweep >= 1000) {
          lastCapacitySweep = current;
          for (const [id, active] of rateWindows) {
            if (active.read && active.read.resetAt <= current) active.read = null;
            if (active.write && active.write.resetAt <= current) active.write = null;
            if (!active.read && !active.write) rateWindows.delete(id);
          }
        }
      }
      if (rateWindows.size >= rateLimits.maxAccounts) {
        let nextExpiry = Infinity;
        for (const active of rateWindows.values()) {
          const expiresAt = Math.max(active.read?.resetAt ?? current, active.write?.resetAt ?? current);
          nextExpiry = Math.min(nextExpiry, expiresAt);
        }
        return {ok:false, retryAfter:Math.max(1, Math.ceil((nextExpiry - current) / 1000))};
      }
      row = {read:null, write:null};
      rateWindows.set(userId, row);
    }
    const category = method === 'GET' ? 'read' : 'write';
    let bucket = row[category];
    if (!bucket || bucket.resetAt <= current) bucket = row[category] = {count:0, resetAt:current + rateLimits.windowMs};
    if (bucket.count >= rateLimits[category]) return {ok:false, retryAfter:Math.max(1, Math.ceil((bucket.resetAt - current) / 1000))};
    bucket.count++;
    return {ok:true};
  }

  return async function handleOnlineAccountApi(request) {
    if (!(request instanceof Request)) throw new TypeError('Expected a Fetch Request');
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/v1/')) return null;
    const origin = request.headers.get('origin');
    if (origin !== null && (!exactOrigin(origin) || !origins.has(origin))) return json({error:'origin-not-allowed'}, 403);
    const cors = origin ? {'access-control-allow-origin':origin, 'vary':'Origin'} : {};
    const allowedMethods = ROUTES.get(url.pathname);
    if (request.method === 'OPTIONS') {
      if (origin === null) return json({error:'origin-required'}, 403);
      if (!allowedMethods) return json({error:'not-found'}, 404, cors);
      const requestedMethod = request.headers.get('access-control-request-method');
      const requestedHeaders = (request.headers.get('access-control-request-headers') || '').toLowerCase().split(',').map(v => v.trim()).filter(Boolean);
      if (!allowedMethods.has(requestedMethod) || requestedHeaders.some(h => !['authorization','content-type'].includes(h))) return json({error:'preflight-not-allowed'}, 403, cors);
      return new Response(null, {status:204, headers:{...cors, 'access-control-allow-methods':[...allowedMethods,'OPTIONS'].join(', '), 'access-control-allow-headers':'Authorization, Content-Type', 'access-control-max-age':'300', 'cache-control':'no-store', 'vary':'Origin, Access-Control-Request-Method, Access-Control-Request-Headers'}});
    }
    if (!METHODS.has(request.method)) return json({error:'method-not-allowed'}, 405, {...cors, allow:'GET, PUT, POST, OPTIONS'});
    const route = `${request.method} ${url.pathname}`;
    if (!allowedMethods) return json({error:'not-found'}, 404, cors);
    if (!allowedMethods.has(request.method)) return json({error:'method-not-allowed'}, 405, {...cors, allow:[...allowedMethods,'OPTIONS'].join(', ')});
    const authorization = request.headers.get('authorization') || '';
    if (!/^Bearer [\x21-\x7e]{16,512}$/.test(authorization)) return json({error:'unauthorized'}, 401, {...cors, 'www-authenticate':'Bearer'});
    let identity;
    try { identity = await authenticate(request); }
    catch { return json({error:'unauthorized'}, 401, {...cors, 'www-authenticate':'Bearer'}); }
    if (!identity || typeof identity.userId !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(identity.userId)) return json({error:'unauthorized'}, 401, {...cors, 'www-authenticate':'Bearer'});
    const userId = identity.userId;
    const rate = takeRateToken(userId, request.method);
    if (rate.unavailable) return json({error:'service-unavailable'}, 503, cors);
    if (!rate.ok) return json({error:'rate-limited'}, 429, {...cors, 'retry-after':String(rate.retryAfter)});
    try {
      if (route === 'GET /api/v1/matches/history') {
        if (!resultStore || typeof resultStore.listMatchResults !== 'function') return json({error:'match-history-unavailable'}, 503, cors);
        const allowed = new Set(['limit','cursor']);
        if ([...url.searchParams.keys()].some(key=>!allowed.has(key)) || url.searchParams.getAll('limit').length>1 || url.searchParams.getAll('cursor').length>1)
          return json({error:'invalid-query'},400,cors);
        const rawLimit=url.searchParams.get('limit');
        const limit=rawLimit===null?20:/^(?:[1-9]|[1-4][0-9]|50)$/.test(rawLimit)?Number(rawLimit):NaN;
        const cursor=url.searchParams.has('cursor')?url.searchParams.get('cursor'):undefined;
        if (!Number.isSafeInteger(limit) || (cursor!==undefined && (cursor.length<1 || cursor.length>512 || !/^[A-Za-z0-9_-]+$/.test(cursor))))
          return json({error:'invalid-query'},400,cors);
        const page=await resultStore.listMatchResults(userId,{limit,...(cursor===undefined?{}:{cursor})});
        if (!page || !Array.isArray(page.items) || (page.nextCursor!==null && (typeof page.nextCursor!=='string' || page.nextCursor.length>512 || !/^[A-Za-z0-9_-]+$/.test(page.nextCursor)))) throw new Error('invalid-result-page');
        const items=page.items.map(item=>{
          if (!item || !/^[a-f0-9]{32}$/.test(item.matchId||'') || item.status!=='finished' || item.terminal!==true || item.half!==2 ||
              !Array.isArray(item.participants) || item.participants.length!==2 || !Array.isArray(item.teamIds) || item.teamIds.length!==2 ||
              !Array.isArray(item.score) || item.score.length!==2 || !item.score.every(value=>Number.isSafeInteger(value)&&value>=0&&value<=999) ||
              typeof item.recordedAt!=='string' || !Number.isFinite(Date.parse(item.recordedAt))) throw new Error('invalid-result-page');
          const side=item.participants.findIndex(row=>row?.userId===userId);
          if (side<0 || item.participants[side]?.side!==side || item.participants[1-side]?.side!==1-side) throw new Error('invalid-result-page');
          const score=[item.score[side],item.score[1-side]];
          return {matchId:item.matchId,recordedAt:item.recordedAt,teamId:item.teamIds[side],opponentTeamId:item.teamIds[1-side],score,
            outcome:score[0]>score[1]?'win':score[0]<score[1]?'loss':'draw'};
        });
        return json({items,nextCursor:page.nextCursor},200,cors);
      }
      if(route==='GET /api/v1/tokens/balance'){
        if(!rewardStore||typeof rewardStore.getBalance!=='function')return json({error:'rewards-unavailable'},503,cors);
        const balance=await rewardStore.getBalance(userId);
        if(!Number.isSafeInteger(balance)||balance<0||balance>999999)throw new Error('invalid-reward-balance');
        return json({balance,maxBalance:999999},200,cors);
      }
      if(route==='GET /api/v1/ultimate-team/catalog'){
        if(!ultimateTeamStore||typeof ultimateTeamStore.getCatalog!=='function')return json({error:'ultimate-team-unavailable'},503,cors);
        const catalog=ultimateTeamStore.getCatalog();
        if(!Array.isArray(catalog)||catalog.length<1||catalog.length>10000)throw new Error('invalid-ut-catalog');
        const seen=new Set();
        for(const item of catalog){
          if(!item||!['team','player'].includes(item.category)||typeof item.id!=='string'||!/^[A-Za-z0-9_-]{1,64}(?:\/[A-Za-z0-9_-]{1,64})?$/.test(item.id)||
            !Number.isSafeInteger(item.price)||item.price<1||item.price>999999)throw new Error('invalid-ut-catalog-item');
          const key=`${item.category}:${item.id}`;if(seen.has(key))throw new Error('duplicate-ut-catalog-item');seen.add(key);
        }
        return json({catalog},200,cors);
      }
      if(route==='GET /api/v1/ultimate-team/collection'){
        if(!ultimateTeamStore||typeof ultimateTeamStore.getCollection!=='function'||!rewardStore||typeof rewardStore.getBalance!=='function')return json({error:'ultimate-team-unavailable'},503,cors);
        const [items,balance]=await Promise.all([ultimateTeamStore.getCollection(userId),rewardStore.getBalance(userId)]);
        if(!Array.isArray(items)||items.length>10000||!Number.isSafeInteger(balance)||balance<0||balance>999999)throw new Error('invalid-ut-collection');
        for(const item of items)if(!item||!['team','player'].includes(item.category)||typeof item.itemId!=='string'||!/^[A-Za-z0-9_-]{1,64}(?:\/[A-Za-z0-9_-]{1,64})?$/.test(item.itemId)||
          !(item.acquiredAt===null||typeof item.acquiredAt==='string'&&Number.isFinite(Date.parse(item.acquiredAt))))throw new Error('invalid-ut-collection-item');
        return json({items,balance},200,cors);
      }
      if(route==='GET /api/v1/ultimate-team/lineup'){
        if(!ultimateTeamStore||typeof ultimateTeamStore.getLineup!=='function')return json({error:'ultimate-team-unavailable'},503,cors);
        if([...url.searchParams.keys()].some(key=>key!=='teamId')||url.searchParams.getAll('teamId').length>1)return json({error:'invalid-query'},400,cors);
        const teamId=url.searchParams.get('teamId')??'japan';
        if(!/^[A-Za-z0-9_-]{1,64}$/.test(teamId))return json({error:'invalid-lineup'},400,cors);
        const lineup=await ultimateTeamStore.getLineup(userId,teamId);
        if(!lineup||lineup.teamId!==teamId||!Array.isArray(lineup.playerIds)||lineup.playerIds.length!==12||!Number.isSafeInteger(lineup.version)||lineup.version<0||
          !lineup.playerIds.every(id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,64}\/[A-Za-z0-9_-]{1,64}$/.test(id)))throw new Error('invalid-ut-lineup-result');
        return json({lineup},200,cors);
      }
      if(route==='PUT /api/v1/ultimate-team/lineup'){
        if(!ultimateTeamStore||typeof ultimateTeamStore.saveLineup!=='function')return json({error:'ultimate-team-unavailable'},503,cors);
        const commit=await readUltimateTeamLineupCommit(request);
        const result=await ultimateTeamStore.saveLineup(userId,commit),lineup=result?.lineup;
        if(typeof result?.duplicate!=='boolean'||!lineup||lineup.teamId!==commit.teamId||!Array.isArray(lineup.playerIds)||lineup.playerIds.length!==12||
          !Number.isSafeInteger(lineup.version)||lineup.version<1||!lineup.playerIds.every(id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,64}\/[A-Za-z0-9_-]{1,64}$/.test(id)))throw new Error('invalid-ut-lineup-result');
        return json({status:result.duplicate?'duplicate':'saved',lineup},result.duplicate?200:201,cors);
      }
      if(route==='POST /api/v1/ultimate-team/purchases'){
        if(!ultimateTeamStore||typeof ultimateTeamStore.purchase!=='function')return json({error:'ultimate-team-unavailable'},503,cors);
        const requestBody=await readUltimateTeamPurchase(request);
        const result=await ultimateTeamStore.purchase({accountId:userId,...requestBody});
        const receipt=result?.receipt;
        if(result?.ok!==true||typeof result.duplicate!=='boolean'||!Number.isSafeInteger(result.balance)||result.balance<0||result.balance>999999||
          !receipt||Object.keys(receipt).length!==5||!['category','itemId','price','balanceAfter','recordedAt'].every(key=>Object.hasOwn(receipt,key))||
          receipt.category!==requestBody.category||receipt.itemId!==requestBody.itemId||!Number.isSafeInteger(receipt.price)||receipt.price<1||receipt.price>999999||
          !Number.isSafeInteger(receipt.balanceAfter)||receipt.balanceAfter<0||receipt.balanceAfter>result.balance||
          (!result.duplicate&&receipt.balanceAfter!==result.balance)||!Number.isFinite(Date.parse(receipt.recordedAt)))throw new Error('invalid-ut-purchase-result');
        return json({status:result.duplicate?'duplicate':'purchased',balance:result.balance,receipt},result.duplicate?200:201,cors);
      }
      if(route==='GET /api/v1/online-career/current'){
        if(!onlineCareerService||typeof onlineCareerService.getCurrentSeason!=='function')return json({error:'online-career-unavailable'},503,cors);
        const season=await onlineCareerService.getCurrentSeason(userId);
        return json({season:publicOnlineCareerSeason(season)},200,cors);
      }
      if(route==='GET /api/v1/online-career/seasons'){
        if(!onlineCareerService||typeof onlineCareerService.listSeasons!=='function')return json({error:'online-career-unavailable'},503,cors);
        if(url.search)return json({error:'invalid-query'},400,cors);
        const seasons=await onlineCareerService.listSeasons(userId,20);
        if(!Array.isArray(seasons)||seasons.length>20)throw new Error('invalid-career-season-history');
        const current=typeof onlineCareerService.getCurrentSeason==='function'?await onlineCareerService.getCurrentSeason(userId):null;
        return json({seasons:seasons.filter(row=>row?.seasonId!==current?.seasonId).map(row=>{
          if(!row||typeof row.seasonId!=='string'||!/^[a-f0-9]{32}$/.test(row.seasonId))throw new Error('invalid-career-season-history-item');
          return {seasonId:row.seasonId,season:publicOnlineCareerSeason(row)};
        })},200,cors);
      }
      if(route==='POST /api/v1/online-career/current'){
        if(!onlineCareerService||typeof onlineCareerService.createSeason!=='function')return json({error:'online-career-unavailable'},503,cors);
        const selectedTeamId=await readOnlineCareerTeam(request,matchmaking)??'japan';
        if(!ultimateTeamStore||typeof ultimateTeamStore.isItemOwned!=='function')return json({error:'online-career-unavailable'},503,cors);
        if(!await ultimateTeamStore.isItemOwned(userId,'team',selectedTeamId))return json({error:'team-not-owned'},403,cors);
        const season=await onlineCareerService.createSeason(userId,selectedTeamId);
        return json({season:publicOnlineCareerSeason(season)},200,cors);
      }
      if(route==='POST /api/v1/online-career/current/fixtures/next/ticket'){
        if(!onlineCareerService||typeof onlineCareerService.getCurrentSeason!=='function'||typeof onlineCareerService.claimNextFixtureBinding!=='function'||typeof onlineCareerService.releaseFixtureReservation!=='function'||
          !matchmaking||typeof matchmaking.reserveCareerFixture!=='function'||typeof matchmaking.issueCareerTicket!=='function')return json({error:'online-career-unavailable'},503,cors);
        await requireEmptyCareerTicketBody(request);
        const season=await onlineCareerService.getCurrentSeason(userId);
        if(!season)return json({error:'online-career-season-not-found'},404,cors);
        const claim=await onlineCareerService.claimNextFixtureBinding(userId,season.seasonId);
        if(!claim)return json({error:'online-career-season-complete'},409,cors);
        if(claim.ok!==true||!claim.binding||typeof claim.reservationId!=='string'||!/^[a-f0-9]{32}$/.test(claim.reservationId))return json({error:claim.reason==='fixture-reserved'?'already-active':'online-career-match-unavailable'},claim.reason==='fixture-reserved'?409:503,cors);
        const {binding,reservationId}=claim;
        let localReserved=false,durableReleaseAttempted=false;
        const releaseClaim=async()=>{
          let releaseError=null;
          if(!durableReleaseAttempted){
            durableReleaseAttempted=true;
            try{await onlineCareerService.releaseFixtureReservation(userId,season.seasonId,binding.matchId,reservationId);}catch(error){releaseError=error;}
          }
          if(localReserved){
            try{matchmaking.releaseCareerFixture?.(binding.matchId,userId);}catch(error){releaseError??=error;}
            localReserved=false;
          }
          if(releaseError)throw releaseError;
        };
        try{
          const lineup=typeof ultimateTeamStore?.getLineup==='function'?await ultimateTeamStore.getLineup(userId,binding.teamIds[0]):null;
          const playerIds=lineup?.playerIds;
          const reserved=matchmaking.reserveCareerFixture(binding,playerIds);
          if(!reserved?.ok){await releaseClaim();return json({error:reserved?.reason==='fixture-user-busy'?'already-active':'online-career-match-unavailable'},reserved?.reason==='fixture-user-busy'?409:503,cors);}
          localReserved=true;
          const ticket=matchmaking.issueCareerTicket(binding.matchId,userId,playerIds);
          if(!ticket?.ok){
            await releaseClaim();
            return json({error:ticket?.reason==='duplicate-active-user'?'already-active':'online-career-match-unavailable'},ticket?.reason==='duplicate-active-user'?409:503,cors);
          }
          return json({ticket:ticket.ticket,expiresAt:ticket.expiresAt,fixtureNo:binding.fixtureNo,teamIds:binding.teamIds},201,cors);
        }catch(error){
          try{await releaseClaim();}catch{}
          throw error;
        }
      }
      if(route==='POST /api/v1/matches/rewards/claim'){
        if(!rewardStore||typeof rewardStore.claimMatchReward!=='function')return json({error:'rewards-unavailable'},503,cors);
        const matchId=await readRewardMatchId(request);
        const result=await rewardStore.claimMatchReward({accountId:userId,matchId});
        if(!result||result.ok!==true||typeof result.duplicate!=='boolean'||!Number.isSafeInteger(result.balance)||result.balance<0||result.balance>999999||
          !result.receipt||Object.keys(result.receipt).length!==6||result.receipt.matchId!==matchId||![0,1].includes(result.receipt.side)||
          !Number.isSafeInteger(result.receipt.reward)||result.receipt.reward<0||result.receipt.reward>30||!Number.isSafeInteger(result.receipt.balanceAfter)||result.receipt.balanceAfter<0||result.receipt.balanceAfter>result.balance||
          !Number.isFinite(Date.parse(result.receipt.recordedAt))||!['win','draw','loss'].includes(result.receipt.outcome))throw new Error('invalid-reward-result');
        return json({duplicate:result.duplicate,balance:result.balance,maxBalance:999999,receipt:result.receipt},result.duplicate?200:201,cors);
      }
      if (route === 'POST /api/v1/matches/ticket') {
        if (!matchmaking || typeof matchmaking.issueTicket !== 'function') return json({error:'matchmaking-unavailable'}, 503, cors);
        const teamId=await readTicketTeamId(request,matchmaking)??'japan';
        if(ultimateTeamStore){
          if(typeof ultimateTeamStore.isItemOwned!=='function')return json({error:'ultimate-team-unavailable'},503,cors);
          if(!await ultimateTeamStore.isItemOwned(userId,'team',teamId))return json({error:'team-not-owned'},403,cors);
        }
        const lineup=typeof ultimateTeamStore?.getLineup==='function'?await ultimateTeamStore.getLineup(userId,teamId):null;
        const result=await matchmaking.issueTicket(userId,teamId,lineup?.playerIds);
        if (result?.ok === true && typeof result.ticket === 'string' && /^[a-f0-9]{64}$/.test(result.ticket) && Number.isSafeInteger(result.expiresAt) && result.expiresAt > 0)
          return json({ticket:result.ticket, expiresAt:result.expiresAt}, 201, cors);
        if (result?.reason === 'duplicate-active-user') return json({error:'already-active'}, 409, cors);
        if (result?.reason === 'invalid-team') return json({error:'invalid-team'},400,cors);
        return json({error:'matchmaking-unavailable'}, 503, cors);
      }
      if (route === 'POST /api/v1/matches/resume-ticket') {
        if (!matchmaking || typeof matchmaking.issueResumeTicket !== 'function') return json({error:'matchmaking-unavailable'}, 503, cors);
        await requireEmptyResumeTicketRequest(request);
        const result=await matchmaking.issueResumeTicket(userId);
        if(result?.ok===true&&typeof result.ticket==='string'&&/^[a-f0-9]{64}$/.test(result.ticket)&&
          Number.isSafeInteger(result.expiresAt)&&result.expiresAt>now()&&Number.isFinite(new Date(result.expiresAt).getTime()))
          return json({ticket:result.ticket,expiresAt:result.expiresAt},201,cors);
        if(result?.reason==='resume-unavailable')return json({error:'resume-unavailable'},409,cors);
        return json({error:'matchmaking-unavailable'},503,cors);
      }
      if (route === 'GET /api/v1/me') {
        const saved = await store.getProfile(userId);
        if (saved === null) return json({profile:null, version:0, updatedAt:null}, 200, cors);
        if (!saved || !Number.isSafeInteger(saved.version) || saved.version < 1 || !Object.hasOwn(saved, 'profile')) throw new Error('invalid-store-result');
        return json({profile:saved.profile, version:saved.version, updatedAt:saved.updatedAt ?? null}, 200, cors);
      }
      const kind = url.pathname === '/api/v1/career/current' ? 'career' : 'ultimate-team';
      if (request.method === 'GET') {
        const saved = await store.getSnapshot(userId, kind);
        if (saved === null) return json({record:null}, 200, cors);
        if (!saved || !Number.isSafeInteger(saved.version) || saved.version < 1 || !Object.hasOwn(saved, 'payload')) throw new Error('invalid-store-result');
        return json({record:{kind, payload:saved.payload, version:saved.version, updatedAt:saved.updatedAt ?? null}}, 200, cors);
      }
      const commit = await readCommit(request);
      const result = await store.putSnapshot(userId, kind, commit.snapshot, {expectedVersion:commit.expectedVersion, idempotencyKey:commit.idempotencyKey});
      if (!result || !Number.isSafeInteger(result.version) || result.version < 1 || (result.kind !== undefined && result.kind !== kind) || (result.accountId !== undefined && result.accountId !== userId) || !Object.hasOwn(result, 'payload')) throw new Error('invalid-store-result');
      return json({status:result.duplicate ? 'duplicate' : 'saved', version:result.version, record:{kind, payload:result.payload, version:result.version, updatedAt:result.updatedAt ?? null}}, 200, cors);
    } catch (error) {
      if ([400,413,415].includes(error?.status)) return json({error:error.message}, error.status, cors);
      if(error?.code==='invalid-match-id'||error?.code==='invalid-request')return json({error:'invalid-match'},400,cors);
      if(error?.code==='not-participant'||error?.code==='result-not-found')return json({error:'reward-unavailable'},404,cors);
      if(error?.code==='result-unavailable')return json({error:'rewards-unavailable'},503,cors);
      if(error?.code==='season-not-found')return json({error:'online-career-season-not-found'},404,cors);
      if(error?.code==='fixture-not-found')return json({error:'online-career-fixture-not-found'},404,cors);
      if(error?.code==='season-team-conflict'||error?.code==='active-season-team-conflict'||error?.code==='active-season-exists')return json({error:'online-career-season-conflict'},409,cors);
      if(error?.code==='team-not-owned')return json({error:'team-not-owned'},403,cors);
      if(error?.code==='fixture-not-schedulable'||error?.code==='season-not-active'||error?.code==='fixture-user-busy')return json({error:'online-career-match-unavailable'},409,cors);
      if(error?.code==='invalid-schedule'||error?.code==='invalid-team'||error?.code==='invalid-season'||error?.code==='invalid-fixture')return json({error:'invalid-career-request'},400,cors);
      if(error?.code==='career-unavailable'||error?.code==='service-unavailable'||error?.code==='corrupt-season'||error?.code==='corrupt-fixture')return json({error:'online-career-unavailable'},503,cors);
      if(error?.code==='team-not-owned'||error?.code==='player-not-owned')return json({error:error.code},403,cors);
      if(error?.code==='stale-lineup-version')return json({error:'stale-lineup-version'},409,cors);
      if(error?.code==='idempotency-conflict')return json({error:'idempotency-conflict'},409,cors);
      if(['invalid-lineup','duplicate-player','unknown-player','role-mismatch','invalid-version','unknown-team'].includes(error?.code))return json({error:'invalid-lineup'},400,cors);
      if(['corrupt-lineup','corrupt-lineup-ledger'].includes(error?.code))return json({error:'ultimate-team-unavailable'},503,cors);
      if(error?.code==='invalid-category'||error?.code==='invalid-item'||error?.code==='invalid-idempotency-key'||error?.code==='invalid-request')return json({error:'invalid-purchase'},400,cors);
      if(error?.code==='unknown-item')return json({error:'unknown-item'},404,cors);
      if(error?.code==='already-owned')return json({error:'already-owned'},409,cors);
      if(error?.code==='insufficient-balance')return json({error:'insufficient-balance'},409,cors);
      if(error?.code==='not-owned')return json({error:'team-not-owned'},403,cors);
      if(error?.code==='idempotency-conflict')return json({error:'idempotency-conflict'},409,cors);
      if(error?.code==='corrupt-balance'||error?.code==='corrupt-ledger'||error?.code==='corrupt-collection')return json({error:'ultimate-team-unavailable'},503,cors);
      if (error?.code === 'invalid-cursor' || error?.code === 'invalid-limit' || error?.code === 'invalid-account') return json({error:'invalid-query'},400,cors);
      if (error?.code === 'version-conflict') return json({error:'version-conflict'}, 409, cors);
      if (error?.code === 'idempotency-conflict') return json({error:'idempotency-conflict'}, 409, cors);
      return json({error:'service-unavailable'}, 503, cors);
    }
  };
}
