const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Protect the real canvas draw path, not only the standalone ownership predicate.
// A future refactor must not draw a gauge for an unselected player after
// shouldShowBreathRing itself continues passing its isolated unit tests.
test('Breath gauge and low-Breath warning stay inside selected-player draw guard', () => {
  const render = fs.readFileSync(path.join(__dirname, '../src/modules/render.js'), 'utf8');
  // The separate selection halo must obey the same ownership predicate.
  // Otherwise CPU/remote players could still get a selected-looking marker
  // even when the Breath fill and warning remain correctly guarded.
  const halo = render.match(/if\(shouldShowBreathRing\(p,game,this\.inMatchDraw\)\)\{ctx\.strokeStyle=p\.t===0\?'#ffe675':'#74f2ff';[\s\S]*?ctx\.ellipse\(0,5,28,12/);
  assert.ok(halo, 'selected-player halo is gated by Breath ownership');
  assert.equal((render.match(/ctx\.ellipse\(0,5,28,12/g) || []).length, 1,
    'selected-player halo is drawn exactly once, not duplicated by another path');
  // Keep ownership checks centralized: one predicate definition, one halo, one gauge.
  // A second draw site can leak a ring even if the original guarded site stays correct.
  const uses = [...render.matchAll(/shouldShowBreathRing\s*\(/g)];
  assert.equal(uses.length, 3, 'Breath ownership predicate has exactly two guarded render sites');
  assert.equal((render.match(/ctx\.ellipse\(0,4,34,15/g) || []).length, 2,
    'Breath gauge background and fill are not duplicated elsewhere');
  assert.equal((render.match(/ctx\.ellipse\(0,4,39,19/g) || []).length, 1,
    'low-Breath warning pulse is not duplicated outside the ownership guard');
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
