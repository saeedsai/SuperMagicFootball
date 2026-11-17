'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, 'lan_auto_two_browser_qa.py'), 'utf8');

test('two-browser LAN failures retain original exception and report both peers', () => {
  assert.match(source, /except Exception:\s*# Preserve the original failure/);
  assert.match(source, /for label, peer_page in \(\("host", host\), \("guest", guest\)\):/);
  for (const field of ['matchState', 'clock', 'selected', 'connection', 'ice', 'channels', 'packets']) {
    assert.ok(source.includes(field + ':'), 'missing failure diagnostic: ' + field);
  }
  assert.match(source, /LAN_FAILURE_DIAGNOSTIC_UNAVAILABLE/);
  assert.match(source, /\n\s+raise\n\s+finally:/, 'diagnostics must rethrow and never certify a failed match');
});

test('two-browser LAN timeout diagnostics identify the acceptance phase', () => {
  assert.match(source, /phase = 'open host and guest LAN menus'/);
  for (const phase of [
    'register host room',
    'discover and approve guest',
    'wait for two-client match start',
    'retry one refused guest jump input',
    'verify first guest movement and replication',
    'simulate transient ICE disconnect and recovery',
    'verify guest movement after ICE recovery',
    'verify brokerless direct WebRTC continuity',
  ]) {
    assert.ok(source.includes("phase = '" + phase + "'"), 'missing phase: ' + phase);
  }
  assert.match(source, /except Exception:\s*# Preserve the original failure[^\n]*\n\s*print\('LAN_FAILURE_PHASE', phase, flush=True\)/, 'phase logging must follow the preservation comment without swallowing the original error');
  assert.match(source, /\n\s+raise\n\s+finally:/);
});
