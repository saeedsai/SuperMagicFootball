'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('src/modules/ui.js');
const releaseSource=read('src/modules/release.js');
const start=source.indexOf('function showAbout(){');
const end=source.indexOf('function showHome(){',start);
assert.ok(start>=0&&end>start,'the actual About screen remains part of the playable UI');
const block=source.slice(start,end);
function fixture(meta={version:'0.9.2.0',date:'2026-10-22',notes:['Career saves','Original soccer art']}){
 let shown=null;
 const context={
  RELEASE:meta,
  escapeHTML:v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  TEAMS:Array(223),
  button:(label,action)=>'<button data-action="'+action+'">'+label+'</button>',
  page:(...args)=>{shown=args;}
 };
 const api=vm.runInNewContext('(()=>{'+block+';return {showAbout};})()',context);
 return {api,shown:()=>shown};
}
test('About alone shows the installed four-field 0.9.2.0 release and date offline',()=>{
 const app=fixture();app.api.showAbout();
 const [title,subtitle,html]=app.shown();
 assert.equal(title,'ABOUT SUPERMAGIC FOOTBALL');
 assert.match(subtitle,/offline cartoon arcade football/);
 assert.match(html,/id="aboutBundleVersion"><strong>0\.9\.2\.0<\/strong>/);
 assert.match(html,/Release date · 2026-10-22/);
 assert.match(html,/available offline/);
 assert.match(html,/id="aboutReleaseNotes"/);
 assert.match(html,/Career saves/);
 assert.match(html,/Original soccer art/);
 assert.match(html,/Developer: Saeed/);
 assert.match(html,/href="mailto:saeedmsalehi1990@gmail\.com"/);
 assert.match(html,/Four action buttons · 223 teams/);
 assert.match(html,/data-action="home"/);
 assert.doesNotMatch(html,/Latest GitHub development commit|CURRENT DEVELOPMENT VERSION|\+dev\.|aboutDevRevision|RECENT CHANGES/);
});
test('About escape-encodes release notes and version, never inserts user-shaped HTML',()=>{
 const app=fixture({version:'0.9.2.0',date:'2026-10-22',notes:['Career saves','<img src=x onerror=alert(1)>']});
 app.api.showAbout();
 const html=app.shown()[2];
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.doesNotMatch(html,/<img src=x/);
});
test('bundled version is canonical across UI, offline metadata and package, without remote SHA',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.version,'0.9.2.0');
 assert.match(releaseSource,/version:'0\.9\.2\.0'/);
 assert.match(source,/import \{RELEASE\} from "\.\/release\.js"/);
 assert.match(source,/version:RELEASE\.version,game/);
 assert.match(source,/version:RELEASE\.version,exportedAt/);
 assert.doesNotMatch(source,/https:\/\/api\.github\.com\/repos\/saeedsai\/SuperMagicFootball\/commits/);
 assert.doesNotMatch(read('index.html'),/<title>[^<]*0\.9\.2\.0/);
 assert.doesNotMatch(read('index.html'),/<title>[^<]*0\.8\.25\.32/);
});
test('About release identity is local and requires no browser network, storage or fetch',()=>{
 assert.doesNotMatch(block,/\bfetch\s*\(|\blocalStorage\b|aboutRecentChanges|aboutLatestChange/);
 const app=fixture();assert.doesNotThrow(()=>app.api.showAbout());
 assert.equal(app.shown()[2].match(/0\.9\.2\.0/g).length,1);
});
