const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ui=fs.readFileSync(path.join(__dirname,'..','src','modules','ui.js'),'utf8');

test('Home Online exposes implemented LAN and internet quick matches',()=>{
 assert.match(ui,/navItem\('Online','navOnline','Play online matches and events\.',\s*'active'/);
 assert.match(ui,/navItem\('Online P2P · Private Quick Match','navOnlineP2P'.*'active'/);
 assert.match(ui,/navItem\('Local Network · LAN Quick Match','navLan'.*'active'/);
 assert.match(ui,/showOnlineP2PLobby\(screen==='nav-online'\?'navOnline':'navQuick'\)/);
 assert.match(ui,/showLanLobby\(screen==='nav-online'\?'navOnline':'navQuick'\)/);
});

test('Player Data Editor describes implemented modes accurately',()=>{
 assert.match(ui,/Playable features include offline matches, Career, LAN and Online P2P Quick Match\./);
 assert.doesNotMatch(ui,/Online play, the career economy and custom competition designer are future work/);
});
