const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const load = () => import('../scripts/lan-pending-expiry.mjs');

test('expired request rejects guest and clears the corresponding host approval', async () => {
  const {expireLanPending} = await load();
  const host = {}, guest = {}, otherHost = {}, otherGuest = {};
  const pending = new Map([
    ['old_request', {roomId:'room_a',host,guest,time:1000}],
    ['fresh_request', {roomId:'room_b',host:otherHost,guest:otherGuest,time:2000}]
  ]);
  const events = [];
  const send = (to,packet) => events.push({to,...packet});
  assert.equal(expireLanPending(pending,send,31000,30000),0);
  assert.equal(expireLanPending(pending,send,31001,30000),1);
  assert.deepEqual([...pending.keys()],['fresh_request']);
  assert.deepEqual(events, [
    {to:guest,type:'join-reject',roomId:'room_a',requestId:'old_request',reason:'timeout'},
    {to:host,type:'join-cancel',roomId:'room_a',requestId:'old_request',reason:'timeout'}
  ]);
});

test('expiry is idempotent and does not touch a still-live request', async () => {
  const {expireLanPending} = await load();
  const host = {}, guest = {}, events = [];
  const pending = new Map([['req',{roomId:'room_a',host,guest,time:0}]]);
  const send = (to,packet) => events.push({to,...packet});
  assert.equal(expireLanPending(pending,send,30000),0);
  assert.equal(expireLanPending(pending,send,30001),1);
  assert.equal(expireLanPending(pending,send,40000),0);
  assert.equal(events.length,2);
  assert.equal(pending.size,0);
});

test('server periodically expires pending joins and host UI already handles join-cancel', () => {
  const server = fs.readFileSync('scripts/lan-server.mjs','utf8');
  const lobby = fs.readFileSync('src/modules/lan-auto-lobby.js','utf8');
  assert.match(server,/import \{expireLanPending\} from '\.\/lan-pending-expiry\.mjs'/);
  assert.match(server,/setInterval\(\(\)=>expireLanPending\(pending,send\),5000\)\.unref\(\)/);
  assert.match(lobby,/m\.type==='join-cancel'/);
});
