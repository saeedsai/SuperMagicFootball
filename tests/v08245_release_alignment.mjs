import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const release=JSON.parse(read('package.json')).version;
const semver=release.replace(/-alpha$/,'');
assert(read('src/main.js').includes(`version:'${release}'`));
assert(read('src/main.js').includes(`version:'${semver}'`),'save export version matches release');
assert(read('sw.js').includes(`supermagic-football-v${semver.replaceAll('.','')}`));
let count=0;
for(const file of fs.readdirSync(new URL('tests/',root)).filter(f=>f.endsWith('.py'))){
 const src=read('tests/'+file);
 for(const match of src.matchAll(/(?:version\s*===?\s*|version\s*==\s*|\['version'\]\s*==\s*)[\"'](0\.8\.\d+(?:\.\d+)?(?:-alpha)?)[\"']/g)){
  assert([semver,release].includes(match[1]),`${file} stale release reference: ${match[1]}`);count++;
 }
}
assert(count>=20,'version assertions are actually checked');
console.log('PASS release/browser alignment',release,count,'checks');
