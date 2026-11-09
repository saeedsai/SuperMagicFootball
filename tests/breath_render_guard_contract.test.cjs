const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Protect the real canvas draw path, not only the standalone ownership predicate.
// A future refactor must not draw a gauge for an unselected player after
// shouldShowBreathRing itself continues passing its isolated unit tests.
test('Breath gauge and low-Breath warning stay inside selected-player draw guard', () => {
  const render = fs.readFileSync(path.join(__dirname, '../src/modules/render.js'), 'utf8');
  const anchor = render.indexOf('// Circular Breath gauge at the feet.');
  assert.ok(anchor >= 0, 'production gauge anchor exists');
  const tail = render.slice(anchor);
  assert.match(tail, /^\/\/ Circular Breath gauge[^\n]*\n\s*if\(shouldShowBreathRing\(p,game,this\.inMatchDraw\)\)\{\s*const stamina=STATS\.stat\(p,'stamina'\)/);
  const guardEnd = tail.indexOf('\n  }\n', tail.indexOf('if(shouldShowBreathRing'));
  assert.ok(guardEnd > 0, 'guard closes explicitly');
  const guarded = tail.slice(0, guardEnd);
  assert.match(guarded, /const ratio=clamp\(/, 'gauge fill is guarded');
  assert.match(guarded, /ctx\.ellipse\(0,4,34,15/, 'gauge arc is guarded');
  assert.match(guarded, /if\(ratio<\.2\)/, 'low-Breath warning is guarded');
  assert.match(guarded, /ctx\.ellipse\(0,4,39,19/, 'warning pulse is guarded');
});
