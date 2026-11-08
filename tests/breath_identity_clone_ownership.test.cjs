const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../src/modules/render.js'), 'utf8');
const match = source.match(/function shouldShowBreathRing\(p,game,inMatchDraw\)\{[\s\S]*?\n\}/);
test('Breath ownership uses object identity, not duplicated player indices or stale flags', () => {
  assert.ok(match, 'production ring predicate exists');
  const visible = vm.runInNewContext('(' + match[0] + ')');
  const selected = {t:0,i:4,controlled:false};
  const stale = {t:0,i:4,controlled:true};
  const remote = {t:1,i:4,controlled:true};
  const game = {
    localBreathSide:0,
    inControl(t) { return t===0; },
    controlledPlayer(t) { return t===0 ? selected : remote; }
  };
  assert.equal(visible(selected,game,true),true);
  assert.equal(visible(stale,game,true),false, 'cloned roster identity cannot inherit selection');
  assert.equal(visible(remote,game,true),false, 'remote player never receives local ring');
  game.localBreathSide=1;
  assert.equal(visible(selected,game,true),false, 'old local seat is hidden immediately');
  assert.equal(visible(remote,game,true),false, 'CPU remains excluded after handoff');
  game.localBreathSide=0;
  assert.equal(visible(selected,game,false),false, 'preview/menu excluded');
  selected.preview=true;
  assert.equal(visible(selected,game,true),false, 'Studio preview excluded');
});
