'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = rel => fs.readFileSync(path.join(__dirname,'..',rel),'utf8');

test('owner-directed central developer requires no feature lock handshake', () => {
  const agents = read('AGENTS.md');
  const policy = read('docs/agent_coordination/README.md');
  const memory = read('docs/memory/README.md');
  const catalog = JSON.parse(read('docs/agent_coordination/FEATURE_REGISTRY.json'));
  assert.match(agents,/sole ongoing implementer and maintainer/i);
  assert.match(agents,/retired as a blocking gate/i);
  assert.match(policy,/do not claim, renew, verify or release a lock/i);
  assert.match(memory,/no project-context feature lock/i);
  assert.equal(catalog.development_mode,'single_developer');
  assert.equal(catalog.lock_enforcement,'retired');
  assert.equal(catalog.current_maintainer,'smf-hourly-dev-20261019');
});

test('no legacy feature claim remains an active reservation after the owner takeover', () => {
  const claimPath = path.join(__dirname,'..','docs','agent_coordination','claims');
  const files = fs.readdirSync(claimPath).filter(name=>name.endsWith('.json'));
  assert.ok(files.length>=10,'historical claim audit was lost');
  for(const name of files){
    const record=JSON.parse(read('docs/agent_coordination/claims/'+name));
    assert.notEqual(record.status,'active',name+' still incorrectly blocks centralized development');
    assert.ok(record.lock_key && record.owner && record.scope,'preserve provenance for '+name);
  }
});
