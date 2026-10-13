import assert from 'node:assert/strict';
import {TEAMS,SHOTS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {countryCode,cartoonFlagSVG,crestSVG,teamIdentity,isClub} from '../src/identity.js';
const all=TEAMS.map(t=>({...t}));
const s=structuredClone(SHOTS);installExpansion(all,s);installContinentalClubs(all,s);
assert.equal(all.length,216);
const crestNames=new Set();let clubCount=0,nationCount=0,svgCount=0;
for(const team of all){
 const html=teamIdentity(team,true), flag=cartoonFlagSVG(team);
 assert.match(flag,/cartoonFlagSvg/);
 assert.match(flag,/viewBox="0 0 88 60"/);
 assert.ok(!html.includes('<img')&&!html.includes('data:image/'),team.name);
 assert.ok(!html.includes('url('),team.name);
 assert.ok(!html.includes('<script'),team.name);
 if(isClub(team)){clubCount++;assert.match(html,/cartoonCrestSvg/);const c=crestSVG(team);assert.match(c,/viewBox="0 0 80 100"/);assert.match(c,/paint-order=/);crestNames.add(c)}
 else{nationCount++;assert.doesNotMatch(html,/cartoonCrestSvg/)}
 assert.match(html,/role="img" aria-label=/);
 assert.equal(teamIdentity(team),teamIdentity(team));svgCount++;
}
assert.ok(clubCount>100&&nationCount>40);
assert.ok(crestNames.size>100,'clubs need varied rather than duplicated shields');
assert.match(cartoonFlagSVG({flag:'JPN'}),/#dc3545/);
assert.match(cartoonFlagSVG({flag:'ITA'}),/#21965e/);
assert.match(cartoonFlagSVG({flag:'ENG'}),/#cd3546/);
assert.match(cartoonFlagSVG({flag:'SCO'}),/#3266ac/);
assert.ok(countryCode({flag:'ITA'})==='IT');
assert.match(cartoonFlagSVG({flag:'XAB',primary:'#113355',secondary:'#fff2dc',trim:'#edce5a'}),/#113355/);
assert.ok(!cartoonFlagSVG({flag:'<script>alert(1)</script>',primary:'evil'}).includes('<script'));
console.log(`v0.8.10 CARTOON IDENTITIES PASS — ${svgCount} teams; ${clubCount} crests, ${nationCount} flags; offline deterministic SVG, safe fallback`);
