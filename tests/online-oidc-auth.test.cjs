const test = require('node:test');
const assert = require('node:assert/strict');
const {generateKeyPairSync, sign} = require('node:crypto');
const {pathToFileURL} = require('node:url');

const {privateKey, publicKey} = generateKeyPairSync('rsa', {modulusLength:2048});
const jwk = {...publicKey.export({format:'jwk'}), kid:'key_1', use:'sig', alg:'RS256'};
const now = 1_800_000_000_000;
const issuer = 'https://identity.example.test/';
const audience = 'supermagic-football';
function token(claimOverrides={}, headerOverrides={}) {
  const enc=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
  const head=enc({alg:'RS256',kid:'key_1',typ:'JWT',...headerOverrides});
  const claims=enc({iss:issuer,sub:'provider-subject-123',aud:audience,iat:(now-1000)/1000,exp:(now+60000)/1000,...claimOverrides});
  const data=`${head}.${claims}`;
  return `${data}.${sign('RSA-SHA256',Buffer.from(data),privateKey).toString('base64url')}`;
}
function request(value) { return {headers:{get:name=>name.toLowerCase()==='authorization'?value:null}}; }
function response(body, status=200) { return {ok:status>=200&&status<300,text:async()=>JSON.stringify(body)}; }
async function verifier() {
  const {createOidcBearerVerifier}=await import(pathToFileURL(require.resolve('../scripts/online-oidc-auth.mjs')).href);
  let fetches=0;
  const authenticate=createOidcBearerVerifier({issuer,audience,jwksUrl:'https://identity.example.test/keys',now:()=>now,fetchImpl:async()=>{fetches++;return response({keys:[jwk]});}});
  return {authenticate,get fetches(){return fetches;}};
}

test('OIDC verifier authenticates the signed subject as an opaque stable account ID', async()=>{
  const context=await verifier();
  const {authenticate}=context;
  const principal=await authenticate(request(`Bearer ${token()}`));
  assert.ok(principal);
  assert.match(principal.userId,/^[A-Za-z0-9_-]{43}$/);
  assert.equal(principal.subjectHash,principal.userId);
  assert.equal(principal.issuer,issuer);
  assert.deepEqual(await authenticate(request(`Bearer ${token()}`)),principal);
  assert.equal(context.fetches,1);
});

test('OIDC verifier rejects invalid issuer, audience, expiry, algorithm, signature and bearer syntax', async()=>{
  const {authenticate}=await verifier();
  for(const bad of [
    token({iss:'https://attacker.test/'}),
    token({aud:'another-service'}),
    token({exp:(now-120000)/1000}),
    token({iat:null}),
    token({iat:(now-90000000)/1000,exp:(now+60000)/1000}),
    token({iat:(now-1000)/1000,exp:(now+90000000)/1000}),
    token({}, {alg:'none'}),
    `${token().slice(0,-4)}AAAA`,
    'Basic opaque-token',
    'Bearer a.b.c'
  ]) assert.equal(await authenticate(request(bad)),null);
});

test('OIDC verifier refreshes keys for rotation and refuses weak/non-RSA provider keys', async()=>{
  const {createOidcBearerVerifier}=await import(pathToFileURL(require.resolve('../scripts/online-oidc-auth.mjs')).href);
  let count=0;
  const rotated={...jwk,kid:'key_2'};
  const auth=createOidcBearerVerifier({issuer,audience,jwksUrl:'https://identity.example.test/keys',now:()=>now,fetchImpl:async()=>response({keys:count++===0?[jwk]:[{kty:'EC',kid:'bad'},{...rotated,n:'AA'} ,rotated]})});
  const p=await auth(request(`Bearer ${token({}, {kid:'key_2'})}`));
  assert.ok(p);
  assert.equal(count,2);
  assert.equal(await auth(request(`Bearer ${token({}, {kid:'key_3'})}`)),null);
  assert.equal(count,2,'unknown-key bursts are bounded during the refresh cooldown');
});

test('OIDC verifier rejects insecure JWKS configuration before requests', async()=>{
  const {createOidcBearerVerifier}=await import(pathToFileURL(require.resolve('../scripts/online-oidc-auth.mjs')).href);
  assert.throws(()=>createOidcBearerVerifier({issuer,audience,jwksUrl:'http://identity.example.test/keys'}),/Invalid OIDC/);
  assert.throws(()=>createOidcBearerVerifier({issuer:'http://identity.example.test/',audience,jwksUrl:'https://identity.example.test/keys'}),/Invalid OIDC/);
  assert.throws(()=>createOidcBearerVerifier({issuer:'https://identity.example.test/?tenant=x',audience,jwksUrl:'https://identity.example.test/keys'}),/Invalid OIDC/);
});
