'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
const art=fs.readFileSync('src/modules/concepthero.js','utf8');
test('twelve Concept Royals identities have distinct faces and styles without changing base roster count',()=>{
 const block=ui.slice(ui.indexOf('const CONCEPT_DEMO_IDENTITIES='),ui.indexOf('const CONCEPT_DEMO_ROSTER='));
 const rows=[...block.matchAll(/^ \['([^']+)','(#[0-9a-f]{6})','(#[0-9a-f]{6})','([^']+)','([^']+)','([^']+)'\]/gm)];
 assert.equal(rows.length,12,'expected exactly 12 identities');
 assert.equal(new Set(rows.map(x=>x[1])).size,12,'all names unique');
 assert.equal(new Set(rows.map(x=>x[4])).size,12,'all hairstyles unique');
 assert.ok(new Set(rows.map(x=>x[2])).size>=9,'varied skin tones');
 assert.ok(new Set(rows.map(x=>x[3])).size>=10,'varied hair colors');
 assert.match(ui,/CONCEPT_DEMO_ROLES=\['GK','GK','DF','DF','DF','MF','MF','MF','MF','FW','FW','FW'\]/);
 assert.match(ui,/conceptHeroVariant:i/);
});
test('Concept Hero identity is painted on all five view types in both idle and running branches',()=>{
 assert.match(art,/\['front','quarterFront','side','quarterBack','back'\]/);
 assert.match(art,/paintIdentity\(ctx,person,kind,sw\)/);
 assert.equal((art.match(/paintIdentity\(ctx,person,kind,sw\);/g)||[]).length,2);
 assert.match(art,/identityStyles=Object\.freeze\(/);
 assert.match(art,/if\(!person\)return/);
 assert.match(art,/ctx\.drawImage\(painted\?\.body\|\|parts\.body,0,0\)/);
});

test('identity overlays preserve the original illustrated eyes and face instead of painting opaque masks',()=>{
 assert.match(art,/function tintedLayer\(source,person\)/);
 assert.match(art,/const isSkin=/);
 assert.match(art,/const isHair=/);
 assert.match(art,/painted\?\.body\|\|parts\.body/);
 assert.match(art,/if\(painted\)ctx\.drawImage\(painted\.full,0,0\)/);
 const accessories=art.slice(art.indexOf('function paintIdentity('),art.indexOf('function draw('));
 assert.doesNotMatch(accessories,/ctx\.ellipse\(/,'no opaque replacement face/head ellipse');
 assert.doesNotMatch(accessories,/headW|headY|headW\*|ctx\.fill\(\);ctx\.stroke\(\)/);
});
