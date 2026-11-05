const test = require('node:test');
const assert = require('node:assert/strict');
const {once} = require('node:events');

let createOnlineAccountHttpServer;
test('online account HTTP adapter module imports', async () => {
  ({createOnlineAccountHttpServer} = await import('../scripts/online-account-http.mjs'));
  assert.equal(typeof createOnlineAccountHttpServer, 'function');
});

async function fixture(handler, options={}) {
  const server = createOnlineAccountHttpServer({handler, host:'127.0.0.1', port:0, maxConnections:16, ...options});
  await once(server, 'listening');
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;
  return {
    server, base,
    async close() { server.closeAllConnections?.(); await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
  };
}

test('server factory validates configuration', () => {
  assert.throws(() => createOnlineAccountHttpServer({handler:null}), /Fetch handler/);
  assert.throws(() => createOnlineAccountHttpServer({handler:async()=>new Response(), maxConnections:0}), /maxConnections/);
  assert.throws(() => createOnlineAccountHttpServer({handler:async()=>new Response(), port:70000}), /port/);
  assert.throws(() => createOnlineAccountHttpServer({handler:async()=>new Response(), handlerTimeoutMs:0}), /handlerTimeoutMs/);
});

test('health is exact, no-store, and only serves the health route', async t => {
  const f = await fixture(async () => { throw new Error('health must not reach API handler'); });
  t.after(() => f.close());
  const health = await fetch(`${f.base}/healthz`);
  assert.equal(health.status, 200);
  assert.equal(await health.text(), 'ok');
  assert.equal(health.headers.get('cache-control'), 'no-store');
  assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
  assert.equal((await fetch(`${f.base}/healthz?extra=1`)).status, 404);
  assert.equal((await fetch(`${f.base}/index.html`)).status, 404);
  assert.equal((await fetch(`${f.base}/`)).status, 404);
  assert.equal((await fetch(`${f.base}/healthz`, {method:'POST'})).status, 405);
});

test('API request body and security headers are forwarded; response headers are preserved', async t => {
  const seen = [];
  const f = await fixture(async request => {
    seen.push({method:request.method, path:new URL(request.url).pathname, origin:request.headers.get('origin'), authorization:request.headers.get('authorization'), body:await request.text()});
    return new Response(JSON.stringify({ok:true}), {status:201, headers:{'content-type':'application/json', 'cache-control':'no-store', 'x-content-type-options':'nosniff', 'access-control-allow-origin':'https://game.example.test', 'access-control-allow-credentials':'true', 'set-cookie':'should-not-forward=1'}});
  });
  t.after(() => f.close());
  const body = JSON.stringify({expectedVersion:0, snapshot:{season:2}});
  const response = await fetch(`${f.base}/api/v1/career/current?slot=main`, {method:'PUT', headers:{authorization:'Bearer sample-access-token-0123456789', origin:'https://game.example.test', 'content-type':'application/json'}, body});
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {ok:true});
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://game.example.test');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(seen.length, 1);
  assert.deepEqual(seen[0], {method:'PUT', path:'/api/v1/career/current', origin:'https://game.example.test', authorization:'Bearer sample-access-token-0123456789', body});
});

test('preflight reaches API handler and only exact account routes are exposed', async t => {
  const seen = [];
  const f = await fixture(async request => {
    seen.push([request.method, new URL(request.url).pathname]);
    return new Response(null, {status:204, headers:{'access-control-allow-origin':'https://game.example.test', 'access-control-allow-methods':'GET, PUT, OPTIONS', 'vary':'Origin'}});
  });
  t.after(() => f.close());
  const response = await fetch(`${f.base}/api/v1/ultimate-team/squad`, {method:'OPTIONS', headers:{origin:'https://game.example.test', 'access-control-request-method':'PUT', 'access-control-request-headers':'authorization,content-type'}});
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://game.example.test');
  assert.deepEqual(seen, [['OPTIONS','/api/v1/ultimate-team/squad']]);
  assert.equal((await fetch(`${f.base}/api/v1/not-real`)).status, 404);
  assert.equal((await fetch(`${f.base}/data/teams.json`)).status, 404);
  assert.equal((await fetch(`${f.base}//elsewhere.test/api/v1/me`)).status, 404);
});

test('ticket POST preserves legacy empty requests and forwards bounded selected-team JSON', async t => {
  const seen=[];
  const f=await fixture(async request=>{
    seen.push({method:request.method,path:new URL(request.url).pathname,body:request.body?await request.text():null,authorization:request.headers.get('authorization')});
    return new Response(JSON.stringify({ticket:'c'.repeat(64),expiresAt:1794000030000}),{status:201,headers:{'content-type':'application/json','cache-control':'no-store'}});
  });
  t.after(()=>f.close());
  const response=await fetch(`${f.base}/api/v1/matches/ticket?userId=account_spoofed`,{method:'POST',headers:{authorization:'Bearer opaque-access-token-0123456789'}});
  assert.equal(response.status,201);
  const payload=await response.json();
  assert.deepEqual(payload,{ticket:'c'.repeat(64),expiresAt:1794000030000});
  assert.equal(JSON.stringify(payload).includes('account_'),false);
  assert.deepEqual(seen,[{method:'POST',path:'/api/v1/matches/ticket',body:null,authorization:'Bearer opaque-access-token-0123456789'}]);
  const selected=await fetch(`${f.base}/api/v1/matches/ticket`,{method:'POST',headers:{authorization:'Bearer opaque-access-token-0123456789','content-type':'application/json'},body:'{"teamId":"brazil"}'});
  assert.equal(selected.status,201);
  assert.equal(seen[1].body,'{"teamId":"brazil"}');
  const oversized=await fetch(`${f.base}/api/v1/matches/ticket`,{method:'POST',headers:{authorization:'Bearer opaque-access-token-0123456789','content-type':'application/json'},body:JSON.stringify({teamId:'x'.repeat(1100)})});
  assert.equal(oversized.status,413);
  assert.deepEqual(await oversized.json(),{error:'too-large'});
});

test('authenticated match history is exposed through the exact HTTP account-route allowlist',async t=>{
 const seen=[];const f=await fixture(async request=>{seen.push([request.method,new URL(request.url).pathname]);return new Response(JSON.stringify({items:[],nextCursor:null}),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}})});t.after(()=>f.close());
 const response=await fetch(`${f.base}/api/v1/matches/history?limit=10`,{headers:{authorization:'Bearer sample-access-token-0123456789'}});
 assert.equal(response.status,200);assert.deepEqual(await response.json(),{items:[],nextCursor:null});assert.deepEqual(seen,[['GET','/api/v1/matches/history']]);
 assert.equal((await fetch(`${f.base}/api/v1/matches/history/other`)).status,404);
});

test('authenticated PVP status path is exact-allowlisted through HTTP',async t=>{
 const seen=[];const f=await fixture(async request=>{seen.push([request.method,new URL(request.url).pathname,await request.text()]);return new Response('{"items":[]}',{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}})});t.after(()=>f.close());
 const body=JSON.stringify({matchIds:['a'.repeat(32)]});
 const response=await fetch(`${f.base}/api/v1/matches/status`,{method:'POST',headers:{authorization:'Bearer sample-access-token-0123456789','content-type':'application/json'},body});
 assert.equal(response.status,200);assert.deepEqual(seen,[['POST','/api/v1/matches/status',body]]);
 assert.equal((await fetch(`${f.base}/api/v1/matches/status/other`,{method:'POST',headers:{authorization:'Bearer sample-access-token-0123456789','content-type':'application/json'},body})).status,404);
});

test('resume-ticket POST is exposed through the bounded HTTP route allowlist',async t=>{
 const seen=[];const f=await fixture(async request=>{seen.push([request.method,new URL(request.url).pathname,request.body?await request.text():null]);return new Response(JSON.stringify({ticket:'f'.repeat(64),expiresAt:1794000030000}),{status:201,headers:{'content-type':'application/json','cache-control':'no-store'}})});t.after(()=>f.close());
 const auth={authorization:'Bearer sample-access-token-0123456789'};
 const response=await fetch(`${f.base}/api/v1/matches/resume-ticket`,{method:'POST',headers:auth});
 assert.equal(response.status,201);assert.deepEqual(await response.json(),{ticket:'f'.repeat(64),expiresAt:1794000030000});
 assert.deepEqual(seen,[['POST','/api/v1/matches/resume-ticket',null]]);
 assert.equal((await fetch(`${f.base}/api/v1/matches/resume-ticket/other`,{method:'POST',headers:auth})).status,404);
});

test('Online UT catalog, collection, purchase, and preflight routes pass through the exact HTTP allowlist',async t=>{
 const seen=[];const f=await fixture(async request=>{const path=new URL(request.url).pathname;seen.push([request.method,path,request.body?await request.text():null]);return new Response(JSON.stringify({ok:true}),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}})});t.after(()=>f.close());
 const auth={authorization:'Bearer sample-access-token-0123456789'};
 for(const path of ['/api/v1/ultimate-team/catalog','/api/v1/ultimate-team/collection'])assert.equal((await fetch(`${f.base}${path}`,{headers:auth})).status,200);
 const purchase='/api/v1/ultimate-team/purchases',body='{"category":"team","itemId":"brazil","idempotencyKey":"purchase-key-0001"}';
 assert.equal((await fetch(`${f.base}${purchase}`,{method:'POST',headers:{...auth,'content-type':'application/json'},body})).status,200);
 assert.equal((await fetch(`${f.base}${purchase}`,{method:'POST',headers:{...auth,'content-type':'application/json'},body:'x'.repeat(1025)})).status,413);
 assert.equal((await fetch(`${f.base}/api/v1/ultimate-team/catalog`,{method:'OPTIONS',headers:{origin:'https://game.example.test','access-control-request-method':'GET','access-control-request-headers':'authorization'}})).status,200);
 assert.deepEqual(seen,[['GET','/api/v1/ultimate-team/catalog',null],['GET','/api/v1/ultimate-team/collection',null],['POST',purchase,body],['OPTIONS','/api/v1/ultimate-team/catalog',null]]);
 assert.equal((await fetch(`${f.base}/api/v1/ultimate-team/purchases/other`,{method:'POST',headers:auth})).status,404);
});

test('Online UT lineup and Career seasons routes pass through the exact HTTP allowlist',async t=>{
 const seen=[];const f=await fixture(async request=>{
  const path=new URL(request.url).pathname,body=request.body?await request.text():null;seen.push([request.method,path,body]);
  const result=path==='/api/v1/ultimate-team/lineup'?{lineup:{teamId:'japan',playerIds:Array(12).fill('japan/player'),version:1}}:{seasons:[]};
  return new Response(JSON.stringify(result),{status:request.method==='PUT'?201:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
 });t.after(()=>f.close());
 const auth={authorization:'Bearer sample-access-token-0123456789'};
 const lineup='/api/v1/ultimate-team/lineup';
 const loaded=await fetch(`${f.base}${lineup}?teamId=japan`,{headers:auth});
 assert.equal(loaded.status,200);assert.equal((await loaded.json()).lineup.teamId,'japan');
 const body='{"teamId":"japan","playerIds":[],"expectedVersion":0,"idempotencyKey":"lineup-save-0001"}';
 const saved=await fetch(`${f.base}${lineup}`,{method:'PUT',headers:{...auth,'content-type':'application/json'},body});
 assert.equal(saved.status,201);assert.deepEqual(await saved.json(),{lineup:{teamId:'japan',playerIds:Array(12).fill('japan/player'),version:1}});
 const archive=await fetch(`${f.base}/api/v1/online-career/seasons`,{headers:auth});
 assert.equal(archive.status,200);assert.deepEqual(await archive.json(),{seasons:[]});
 assert.deepEqual(seen,[['GET',lineup,null],['PUT',lineup,body],['GET','/api/v1/online-career/seasons',null]]);
 assert.equal((await fetch(`${f.base}${lineup}/unknown`,{headers:auth})).status,404);
 assert.equal(seen.length,3,'unknown nested paths are rejected before reaching the handler');
});

test('reward claim traverses HTTP, authenticated API and account-scoped reward service',async t=>{
 const {createOnlineAccountApi}=await import('../scripts/online-account-api.mjs');const id='f'.repeat(32),claims=[];
 const handler=createOnlineAccountApi({authenticate:async request=>request.headers.get('authorization')==='Bearer sample-access-token-0123456789'?{userId:'account_http'}:null,
  store:{getProfile:async()=>null,getSnapshot:async()=>null,putSnapshot:async()=>null},allowedOrigins:['https://game.example.test'],
  rewardStore:{getBalance:async accountId=>accountId==='account_http'?30:0,claimMatchReward:async value=>{claims.push(value);return {ok:true,duplicate:false,balance:60,receipt:{matchId:id,side:1,outcome:'win',reward:30,balanceAfter:60,recordedAt:'2026-11-04T12:00:00.000Z'}};}}});
 const f=await fixture(handler);t.after(()=>f.close());
 const balance=await fetch(`${f.base}/api/v1/tokens/balance`,{headers:{authorization:'Bearer sample-access-token-0123456789'}});assert.deepEqual(await balance.json(),{balance:30,maxBalance:999999});
 const response=await fetch(`${f.base}/api/v1/matches/rewards/claim`,{method:'POST',headers:{authorization:'Bearer sample-access-token-0123456789','content-type':'application/json'},body:JSON.stringify({matchId:id})});
 assert.equal(response.status,201);assert.equal((await response.json()).receipt.side,1);assert.deepEqual(claims,[{accountId:'account_http',matchId:id}]);
});

test('real account handler receives bounded streamed requests and oversized bodies return 413', async t => {
  const {createOnlineAccountApi} = await import('../scripts/online-account-api.mjs');
  const api = createOnlineAccountApi({
    authenticate:async request => request.headers.get('authorization') === 'Bearer sample-access-token-0123456789' ? {userId:'account_0001'} : null,
    allowedOrigins:['https://game.example.test'],
    store:{
      async getProfile(){return null;},
      async getSnapshot(){return null;},
      async putSnapshot(accountId,kind,payload,{expectedVersion,idempotencyKey}) {return {accountId,kind,payload,version:1,updatedAt:'2026-11-04T00:00:00.000Z',duplicate:false};}
    }
  });
  const f = await fixture(api);
  t.after(() => f.close());
  const oversized = await fetch(`${f.base}/api/v1/career/current`, {method:'PUT', headers:{authorization:'Bearer sample-access-token-0123456789', 'content-type':'application/json', origin:'https://game.example.test'}, body:JSON.stringify({expectedVersion:0,idempotencyKey:'oversize_commit_01',snapshot:{data:'x'.repeat(600 * 1024)}})});
  assert.equal(oversized.status, 413);
  assert.deepEqual(await oversized.json(), {error:'too-large'});
  assert.equal(oversized.headers.get('cache-control'), 'no-store');
});

test('handler timeout aborts in-flight request and returns a bounded 504 response', async t => {
  let observedAbort = false;
  const f = await fixture(request => new Promise(resolve => {
    request.signal.addEventListener('abort', () => { observedAbort = true; }, {once:true});
    setTimeout(() => resolve(new Response('late')), 1000).unref?.();
  }), {handlerTimeoutMs:50});
  t.after(() => f.close());
  const response = await fetch(`${f.base}/api/v1/me`, {headers:{authorization:'Bearer sample-access-token-0123456789'}});
  assert.equal(response.status, 504);
  assert.deepEqual(await response.json(), {error:'request-timeout'});
  assert.equal(observedAbort, true);
});

test('optional health check reports healthy, unhealthy, rejected, and timed-out states without details', async t => {
  const healthy = await fixture(async () => new Response(), {healthCheck:async () => true, healthTimeoutMs:100});
  t.after(() => healthy.close());
  const ok = await fetch(`${healthy.base}/healthz`);
  assert.equal(ok.status, 200);
  assert.equal(await ok.text(), 'ok');
  assert.equal(ok.headers.get('cache-control'), 'no-store');

  const unhealthy = await fixture(async () => new Response(), {healthCheck:async () => false, healthTimeoutMs:100});
  t.after(() => unhealthy.close());
  const down = await fetch(`${unhealthy.base}/healthz`);
  assert.equal(down.status, 503);
  assert.equal(await down.text(), 'unavailable');
  assert.equal(down.headers.get('cache-control'), 'no-store');

  const rejected = await fixture(async () => new Response(), {healthCheck:async () => {throw Error('private database detail');}, healthTimeoutMs:100});
  t.after(() => rejected.close());
  const error = await fetch(`${rejected.base}/healthz`);
  assert.equal(error.status, 503);
  assert.equal(await error.text(), 'unavailable');

  const hanging = await fixture(async () => new Response(), {healthCheck:() => new Promise(() => {}), healthTimeoutMs:40});
  t.after(() => hanging.close());
  const timedOut = await fetch(`${hanging.base}/healthz`);
  assert.equal(timedOut.status, 503);
  assert.equal(await timedOut.text(), 'unavailable');
});
