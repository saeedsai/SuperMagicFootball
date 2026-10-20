const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
function section(start,end){const a=source.indexOf(start);assert(a>=0,'missing start '+start);const b=source.indexOf(end,a+start.length);assert(b>a,'missing end '+end);return source.slice(a,b)}
const page=section('function page(', '// v0.8.24.7');
const nav=section('const menuParents=', 'const comingLater=');
const back=section('function backFromMenu()', "document.addEventListener('keydown',");
function harness(){
 const code=\`(()=>{let screen='home',squadContext='home',html='',calls=[];
  const show=(markup,id='home')=>{html=markup;screen=id};
  const button=(label,action)=>'<button data-action="'+action+'">'+label+'</button>';
  const escapeHTML=v=>String(v);
  const menu={querySelector:()=>null};
  const action=a=>calls.push(a);
  \${page}\n\${nav}\n\${back}
  return {page,menuChoices,backFromMenu,setEntry:a=>menuEntryReturn=a,
   setScreen:a=>screen=a,setSquad:a=>squadContext=a,setBack:a=>menuBackAction=a,
   calls:()=>calls.slice(),clear:()=>calls=[],html:()=>html};})()\`;
 return vm.runInNewContext(code,{});
}
const last=h=>h.calls().at(-1);
test('Customization child page Back is identical for visible and keyboard/gamepad route',()=>{
 for(const title of ['PLAYER CUSTOMIZATION','CUSTOM CLUB BUILDER','PLAYER DATA EDITOR','SUPER SHOT ENCYCLOPEDIA']){
  const h=harness();h.menuChoices('nav-customize','Customization','',[],'navSettings');h.setEntry('navCustomization');
  h.page(title,'','<div></div>','home');
  assert.match(h.html(),/data-action="navCustomization"/,title+' visible Back');
  h.backFromMenu();assert.equal(last(h),'navCustomization',title+' keyboard/gamepad Back');
 }
});
test('Controller mapping and other explicit pages return to their declared parent',()=>{
 const h=harness();h.menuChoices('nav-input','Input','',[],'navSettings');h.setEntry('navInput');
 h.page('CONTROLLER MAPPING','','','navInput');
 assert.match(h.html(),/data-action="navInput"/);h.backFromMenu();assert.equal(last(h),'navInput');
});
test('Team Command Center respects customization origin without breaking setup/pause',()=>{
 const h=harness();h.setEntry('navCustomization');h.page('TEAM COMMAND CENTER','','','home');h.setSquad('home');
 h.backFromMenu();assert.equal(last(h),'navCustomization');
 h.clear();h.setSquad('setup');h.backFromMenu();assert.equal(last(h),'returnSetup');
 h.clear();h.setSquad('pause');h.backFromMenu();assert.equal(last(h),'returnPause');
 const squad=section('function showSquad(', '// v0.8.25.22:');
 assert.match(squad,/const squadBackAction=/);assert.equal((squad.match(/squadBackAction/g)||[]).length,3);
});
test('Save Management preserves dynamic Career and Settings parents',()=>{
 for(const parent of ['navCareer','navSettings']){
  const h=harness();h.menuChoices('nav-saves','Saves','',[],parent);h.backFromMenu();assert.equal(last(h),parent);
 }
});
test('Paused sound and coming-later screens preserve their explicit Back routes',()=>{
 const h=harness();h.setEntry('returnPause');h.menuChoices('nav-settings-sound','Sound','',[],'returnPause');
 h.backFromMenu();assert.equal(last(h),'returnPause');
 h.clear();h.setEntry('navClubs');h.page('COMING LATER','','','navClubs');h.backFromMenu();assert.equal(last(h),'navClubs');
});
test('Controller mapping footer does not skip Input Settings',()=>{
 const controls=section('function showControls(){','function showSettingsSection(');
 assert.match(controls,/button\('BACK TO INPUT SETTINGS','navInput'\)/);
 assert.match(controls,/\x60,'navInput'\);/);
});
