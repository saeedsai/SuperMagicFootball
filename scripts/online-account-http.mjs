import http from 'node:http';
import {Readable} from 'node:stream';

const MAX_HEADERS = 64;
const MAX_SMALL_POST_BODY_BYTES = 1024;
const API_PATHS = new Set([
  '/api/v1/me',
  '/api/v1/career/current',
  '/api/v1/ultimate-team/squad',
  '/api/v1/ultimate-team/lineup',
  '/api/v1/ultimate-team/catalog',
  '/api/v1/ultimate-team/collection',
  '/api/v1/ultimate-team/purchases',
  '/api/v1/online-career/current',
  '/api/v1/online-career/seasons',
  '/api/v1/online-career/current/fixtures/next/ticket',
  '/api/v1/matches/ticket',
  '/api/v1/matches/resume-ticket',
  '/api/v1/matches/history',
  '/api/v1/matches/status',
  '/api/v1/matches/rewards/claim',
  '/api/v1/tokens/balance'
]);
const FORWARDED_REQUEST_HEADERS = [
  'authorization', 'origin', 'content-type', 'content-length',
  'access-control-request-method', 'access-control-request-headers', 'accept'
];
const FORWARDED_RESPONSE_HEADERS = [
  'content-type', 'cache-control', 'x-content-type-options', 'vary',
  'access-control-allow-origin', 'access-control-allow-methods',
  'access-control-allow-headers', 'access-control-max-age', 'allow', 'www-authenticate'
];

function sendJson(response, status, error) {
  if (response.destroyed || response.headersSent) return;
  const body = JSON.stringify({error});
  response.writeHead(status, {
    'content-type':'application/json; charset=utf-8',
    'cache-control':'no-store',
    'x-content-type-options':'nosniff',
    'content-length':Buffer.byteLength(body)
  });
  response.end(body);
}

function selectHeaders(incoming) {
  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = incoming.headers[name];
    if (typeof value === 'string') headers.set(name, value);
  }
  return headers;
}

function exactPath(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.startsWith('/') || rawUrl.startsWith('//') || rawUrl.length > 2048) return null;
  let parsed;
  try { parsed = new URL(rawUrl, 'http://online-account.invalid'); }
  catch { return null; }
  if (parsed.origin !== 'http://online-account.invalid' || parsed.username || parsed.password) return null;
  if (parsed.pathname === '/healthz') {
    if (parsed.search) return null;
  } else if (!API_PATHS.has(parsed.pathname)) return null;
  return parsed;
}

/**
 * Bridge Node HTTP to a Fetch Request handler without buffering request bodies.
 * Only health and account API routes are exposed; this never serves game/static files.
 */
export function createOnlineAccountHttpServer({handler, maxConnections = 128, host = '127.0.0.1', port = 0, handlerTimeoutMs = 20_000, healthCheck, healthTimeoutMs = 1_000} = {}) {
  if (typeof handler !== 'function') throw new TypeError('Online HTTP server requires a Fetch handler');
  if (!Number.isInteger(maxConnections) || maxConnections < 1 || maxConnections > 10000) throw new RangeError('maxConnections must be an integer from 1 to 10000');
  if (typeof host !== 'string' || !host || host.length > 255) throw new TypeError('host must be a non-empty host name');
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new RangeError('port must be an integer from 0 to 65535');
  if (!Number.isInteger(handlerTimeoutMs) || handlerTimeoutMs < 1 || handlerTimeoutMs > 120_000) throw new RangeError('handlerTimeoutMs must be from 1 to 120000 milliseconds');
  if (healthCheck !== undefined && typeof healthCheck !== 'function') throw new TypeError('healthCheck must be a function');
  if (!Number.isInteger(healthTimeoutMs) || healthTimeoutMs < 1 || healthTimeoutMs > 10_000) throw new RangeError('healthTimeoutMs must be from 1 to 10000 milliseconds');

  const server = http.createServer({maxHeaderSize:16 * 1024}, (incoming, outgoing) => {
    void (async () => {
      if (incoming.headersDistinct && Object.keys(incoming.headersDistinct).length > MAX_HEADERS) {
        sendJson(outgoing, 431, 'headers-too-large');
        incoming.resume();
        return;
      }
      const parsed = exactPath(incoming.url);
      if (!parsed) {
        sendJson(outgoing, 404, 'not-found');
        incoming.resume();
        return;
      }
      if (parsed.pathname === '/healthz') {
        incoming.resume();
        if (incoming.method !== 'GET') { sendJson(outgoing, 405, 'method-not-allowed'); return; }
        if (outgoing.destroyed) return;
        let healthy = true;
        if (healthCheck) {
          const controller = new AbortController();
          let timeout;
          try {
            const timedOut = new Promise((_, reject) => {
              timeout = setTimeout(() => { controller.abort(new Error('health-check-timeout')); reject(new Error('health-check-timeout')); }, healthTimeoutMs);
            });
            healthy = await Promise.race([Promise.resolve().then(() => healthCheck(controller.signal)), timedOut]).then(value => value === true, () => false);
          } finally { if (timeout) clearTimeout(timeout); }
        }
        const body = healthy ? 'ok' : 'unavailable';
        const bytes = Buffer.byteLength(body);
        outgoing.writeHead(healthy ? 200 : 503, {'content-type':'text/plain; charset=utf-8', 'cache-control':'no-store', 'x-content-type-options':'nosniff', 'content-length':String(bytes)});
        outgoing.end(body);
        return;
      }
      const method = incoming.method || 'GET';
      if (!['GET','PUT','POST','OPTIONS'].includes(method)) {
        incoming.resume();
        sendJson(outgoing, 405, 'method-not-allowed');
        return;
      }
      if (method === 'POST') {
        const length=incoming.headers['content-length'];
        if(length!==undefined&&(!/^\d+$/.test(length)||Number(length)>MAX_SMALL_POST_BODY_BYTES)){
          incoming.resume();sendJson(outgoing,413,'too-large');return;
        }
      }
      const abortController = new AbortController();
      let timedOut = false;
      let timeout;
      const abort = () => { if (!abortController.signal.aborted) abortController.abort(new Error('client-disconnected')); };
      incoming.once('aborted', abort);
      outgoing.once('close', () => { if (!outgoing.writableEnded) abort(); });
      try {
        const init = {method, headers:selectHeaders(incoming), signal:abortController.signal};
        if (method === 'PUT' || method === 'POST' && (incoming.headers['transfer-encoding']!==undefined || Number(incoming.headers['content-length']||0)>0)) {
          // Readable.toWeb preserves backpressure; the Fetch handler enforces its
          // byte cap while consuming the stream and cancels as soon as it is exceeded.
          init.body = Readable.toWeb(incoming);
          init.duplex = 'half';
        } else incoming.resume();
        const request = new Request(`http://online-account.invalid${parsed.pathname}${parsed.search}`, init);
        timeout = setTimeout(() => {
          timedOut = true;
          if (!abortController.signal.aborted) abortController.abort(new Error('handler-timeout'));
        }, handlerTimeoutMs);
        const aborted = new Promise((_, reject) => abortController.signal.addEventListener('abort', () => reject(abortController.signal.reason || new Error('aborted')), {once:true}));
        const response = await Promise.race([Promise.resolve().then(() => handler(request)), aborted]);
        if (!response) { sendJson(outgoing, 404, 'not-found'); return; }
        if (outgoing.destroyed || abortController.signal.aborted) return;
        const headers = {};
        for (const name of FORWARDED_RESPONSE_HEADERS) {
          const value = response.headers.get(name);
          if (value !== null) headers[name] = value;
        }
        outgoing.writeHead(response.status, headers);
        if (!response.body) { outgoing.end(); return; }
        const reader = response.body.getReader();
        try {
          while (true) {
            const {done, value} = await reader.read();
            if (done || outgoing.destroyed) break;
            if (!outgoing.write(Buffer.from(value))) await new Promise(resolve => outgoing.once('drain', resolve));
          }
          if (!outgoing.destroyed) outgoing.end();
        } finally { reader.releaseLock(); }
      } catch (error) {
        if (outgoing.destroyed || incoming.aborted) return;
        if (timedOut) {
          if (!incoming.complete) outgoing.shouldKeepAlive = false;
          sendJson(outgoing, 504, 'request-timeout');
        } else if (!abortController.signal.aborted) sendJson(outgoing, 400, 'invalid-request');
      } finally {
        if (timeout) clearTimeout(timeout);
        incoming.removeListener('aborted', abort);
      }
    })();
  });
  server.maxConnections = maxConnections;
  server.maxHeadersCount = MAX_HEADERS;
  server.headersTimeout = 10_000;
  server.requestTimeout = 30_000;
  server.keepAliveTimeout = 5_000;
  server.listen(port, host);
  return server;
}
