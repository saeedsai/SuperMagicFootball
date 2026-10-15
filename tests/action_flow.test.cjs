const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),js=fs.readFileSync(path.join(root,'tests','.generated','game.js'),'utf8');
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const from=(a,b)=>js.slice(js.indexOf(a),js.indexOf(b,js.indexOf(a)+a.length));
test('pass release routes possession through team carrier even if manual selection lags',()=>{
 const code=from('performTeamPass(p,long=false,cross=false,direction=null,hold=0)', '// Holding Sprint');
 assert.match(code,/carrier\.t!==p\.t/);assert.match(code,/distributeKeeper\(carrier/);assert.match(code,/this\.pass\(carrier,long,cross,\{direction,hold,human:true\}\)/);
 assert.match(js,/if\(this\.ball\.owner\?\.t===p\.t\)this\.performTeamPass\(p,longPass,false,direction,held\)/);
});
test('short pass tap during restart cooldown is temporarily queued and canceled safely',()=>{
 assert.match(js,/this\.cooldown>0&&this\.input\.released\?\.\(p\.t,'pass'\)/);
 assert.match(js,/queuedPass=\{hold:/);
 assert.match(js,/if\(this\.clock<=pending\.until&&this\.ball\.owner\?\.t===p\.t\)/);
 assert.match(js,/if\(this\.input\.canceled\?\.\(p\.t,'pass'\)\)\{[^}]*queuedPass=null/);
});
test('pre-match primary screen has kickoff and three advanced submenus, no sprawling rule controls',()=>{
 const primary=from("function showSetup(newMode='quick')",'function showSetupExtras(section)');
 for(const act of ['setupRules','setupAppearance','setupTactics','kickoff'])assert.match(primary,new RegExp(act));
 for(const opt of ["field('WEATHER'","field('PITCH CONDITION'","field('HOME TEAM TALK'"])assert.ok(!primary.includes(opt));
 assert.match(css,/\.setupSubnav/);
});
test('all six formations, four gameplay controls and five main menu categories remain',()=>{
 assert.equal((html.match(/<button data-act=/g)||[]).length,4);
 for(const act of ['pass','shoot','dribble','jump'])assert.ok(html.includes(`data-act="${act}"`));
 const formations=require('./../data/mechanics/gameplay.json').formations;for(const f of ['2-1-2','1-2-2','2-2-1','1-3-1','1-1-3','3-1-1'])assert.equal(formations[f].length,6);
 for(const route of ['navQuick','navOnline','navCareer','navCups','navSettings'])assert.ok(js.includes(route));
});

test('offline shell cache revision matches current build without altering saved progress',()=>{
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.match(sw,/smf-082533-concept-hero-demo-v1/);
 assert.match(sw,/MODULES\.map/);assert.match(sw,/players\//);
 assert.match(sw,/event\.request\.method!=='GET'/);
 assert.match(js,/version:'0\.8\.25\.32',exportedAt/);
});