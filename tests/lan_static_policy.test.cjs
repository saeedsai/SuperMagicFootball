'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../scripts/lan-server.mjs'),'utf8');
test('LAN HTTP server serves only intended game assets',async()=>{
 const {isPublicLanPath}=await import('../scripts/lan-static-policy.mjs');
 for(const p of ['/','/index.html','/style.css','/sw.js','/icon-180.png','/src/main.js','/src/modules/lan-auto-lobby.js','/data/players/national26.json','/assets/concept_hero/hero_atlas.webp','/assets/characters/concept_modular_v1/source/face_front_front.svg'])
  assert.equal(isPublicLanPath(p),true,p);
});
test('LAN HTTP server rejects repository internals, traversal and symlink escapes',async()=>{
 const {isPublicLanPath}=await import('../scripts/lan-static-policy.mjs');
 for(const p of ['/.git/config','/.env','/package.json','/package-lock.json','/scripts/lan-server.mjs','/tests/lan_lobby.test.cjs','/docs/memory/SHARED.md','/node_modules/ws/index.js','/src/.secret.js','/src/modules/../private.js','/src/modules/%2e%2e/private.js','/assets/private.key','/assets/credentials.json','/src/modules/ui.js.map','/src\\modules\\ui.js','/src//main.js','/data/../package.json','/favicon.ico'])
  assert.equal(isPublicLanPath(p),false,p);
 assert.match(source,/isPublicLanPath\(pathname\)/,'HTTP route must enforce allowlist');
 assert.match(source,/realpath\(file\)/,'symlink escapes must be checked');
});
