// Minimal RS256 OIDC access-token verifier. Configure a trusted issuer, audience
// and HTTPS JWKS URL from the selected identity provider; never trust client IDs.
import {createHash, createPublicKey, verify as verifySignature} from 'node:crypto';

const TOKEN_LIMIT = 8192;
const JWKS_LIMIT = 262144;
const MAX_KEYS = 32;
const CLOCK_SKEW_MS = 30000;
const MAX_ACCESS_TOKEN_AGE_SECONDS = 86400;
const SUBJECT_LIMIT = 256;
const encoder = new TextEncoder();
const decodeSegment = value => {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try { return Buffer.from(value, 'base64url'); } catch { return null; }
};
const jsonSegment = bytes => {
  try {
    const value = JSON.parse(bytes.toString('utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch { return null; }
};
const validHttps = value => {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && !url.hash; }
  catch { return false; }
};
const validIssuer = value => {
  if(!validHttps(value))return false;
  try{const url=new URL(value);return !url.search&&url.href===value;}catch{return false;}
};

export function createOidcBearerVerifier({issuer, audience, jwksUrl, fetchImpl=globalThis.fetch, now=Date.now, cacheMs=300000}={}) {
  if (typeof issuer !== 'string' || issuer.length > 512 || !validIssuer(issuer) || typeof audience !== 'string' || !audience || audience.length > 256 ||
      !validHttps(jwksUrl) || typeof fetchImpl !== 'function' || typeof now !== 'function' || !Number.isFinite(cacheMs) || cacheMs < 1000 || cacheMs > 3600000) {
    throw new TypeError('Invalid OIDC verifier configuration');
  }
  let cached = null;
  let cacheUntil = 0;
  let pending = null;
  let lastForcedRefresh = -Infinity;

  async function loadKeys(force=false) {
    const time = now();
    if (!force && cached && time < cacheUntil) return cached;
    // Unknown kid floods must not turn arbitrary bearer traffic into unbounded
    // provider fetches. Normal cache expiry still refreshes on schedule.
    if (force && cached && time - lastForcedRefresh < 5000) return cached;
    if (pending) return pending;
    if (force) lastForcedRefresh=time;
    pending = (async () => {
      try {
        const response = await fetchImpl(jwksUrl, {headers:{accept:'application/json'}, signal:AbortSignal.timeout(5000)});
        if (!response?.ok) return null;
        const text = await response.text();
        if (encoder.encode(text).byteLength > JWKS_LIMIT) return null;
        const value = JSON.parse(text);
        if (!value || !Array.isArray(value.keys) || value.keys.length < 1 || value.keys.length > MAX_KEYS) return null;
        const keys = new Map();
        for (const jwk of value.keys) {
          if (!jwk || jwk.kty !== 'RSA' || typeof jwk.kid !== 'string' || !/^[A-Za-z0-9._-]{1,128}$/.test(jwk.kid) ||
              (jwk.use !== undefined && jwk.use !== 'sig') || (jwk.alg !== undefined && jwk.alg !== 'RS256') || keys.has(jwk.kid)) continue;
          try {
            const key = createPublicKey({key:jwk, format:'jwk'});
            if (key.asymmetricKeyType !== 'rsa' || (key.asymmetricKeyDetails?.modulusLength || 0) < 2048) continue;
            keys.set(jwk.kid, key);
          } catch { /* ignore malformed provider key */ }
        }
        if (!keys.size) return null;
        cached = keys;
        cacheUntil = now() + cacheMs;
        return keys;
      } catch { return null; }
      finally { pending = null; }
    })();
    return pending;
  }

  return async function authenticate(request) {
    const header = request?.headers?.get?.('authorization') ?? request?.headers?.authorization ?? request?.headers?.Authorization;
    if (typeof header !== 'string' || header.length > TOKEN_LIMIT + 16 || !header.startsWith('Bearer ')) return null;
    const token = header.slice(7);
    if (token.length < 32 || token.length > TOKEN_LIMIT) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const headerBytes = decodeSegment(parts[0]), payloadBytes = decodeSegment(parts[1]), signature = decodeSegment(parts[2]);
    if (!headerBytes || !payloadBytes || !signature || signature.length < 128) return null;
    const protectedHeader = jsonSegment(headerBytes), claims = jsonSegment(payloadBytes);
    if (!protectedHeader || protectedHeader.alg !== 'RS256' || typeof protectedHeader.kid !== 'string' ||
        protectedHeader.typ !== undefined && protectedHeader.typ !== 'JWT' || protectedHeader.crit !== undefined ||
        !claims || claims.iss !== issuer || typeof claims.sub !== 'string' || claims.sub.length < 1 || claims.sub.length > SUBJECT_LIMIT ||
        (typeof claims.aud !== 'string' && !Array.isArray(claims.aud)) ||
        !(typeof claims.aud === 'string' ? claims.aud === audience : claims.aud.includes(audience)) ||
        !Number.isFinite(claims.exp) || claims.exp * 1000 <= now() - CLOCK_SKEW_MS ||
        !Number.isFinite(claims.iat) || claims.iat * 1000 > now() + CLOCK_SKEW_MS ||
        claims.iat * 1000 < now() - MAX_ACCESS_TOKEN_AGE_SECONDS * 1000 - CLOCK_SKEW_MS ||
        claims.exp <= claims.iat || claims.exp - claims.iat > MAX_ACCESS_TOKEN_AGE_SECONDS ||
        claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf * 1000 > now() + CLOCK_SKEW_MS) ||
        claims.iat > claims.exp) return null;

    let keys = await loadKeys();
    let key = keys?.get(protectedHeader.kid);
    if (!key) { keys = await loadKeys(true); key = keys?.get(protectedHeader.kid); }
    if (!key) return null;
    const signed = Buffer.from(`${parts[0]}.${parts[1]}`, 'ascii');
    if (!verifySignature('RSA-SHA256', signed, key, signature)) return null;
    const userId = createHash('sha256').update(issuer).update('\n').update(claims.sub).digest('base64url');
    return Object.freeze({userId, issuer, subjectHash:userId});
  };
}
