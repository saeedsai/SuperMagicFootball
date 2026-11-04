'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');

function browserHarness(){
 let active=0,focused=null,closed=false,toggleFocused=false;
 const options=Array.from({length:4},(_,index)=>({
  tabIndex:index===0?0:-1,
  focus(){active=index;focused=options[index];},scrollIntoView(){},
 }));
 focused=options[0];
 const panel={id:'homeTeamBrowse',classList:{contains:()=>false},querySelectorAll:()=>options};
 const menu={querySelector:()=>({focus(){toggleFocused=true;}})};
 const context={document:{get activeElement(){return focused;}},menu,closeNestedMenuLayer(){closed=true;return true;}};
 const start=ui.indexOf('function teamBrowserKeydown('),end=ui.indexOf('\n\nconst nations',start);
 assert.ok(start>=0&&end>start,'team browser keyboard handler exists');
 vm.runInNewContext(ui.slice(start,end)+'\nthis.teamBrowserKeydown=teamBrowserKeydown;',context);
 const fire=(key,target={matches:()=>false,closest:()=>panel})=>{
  let prevented=false,stopped=false;
  const handled=context.teamBrowserKeydown({key,target,preventDefault(){prevented=true;},stopPropagation(){stopped=true;}});
  return {handled,prevented,stopped};
 };
 return {options,active:()=>active,fire,panel,setFocus:element=>{focused=element;},closed:()=>closed,toggleFocused:()=>toggleFocused};
}

test('VIZ-02 team browser arrow keys and Home/End use a single roving keyboard stop',()=>{
 const h=browserHarness();
 assert.equal(h.options.filter(option=>option.tabIndex===0).length,1);
 let result=h.fire('ArrowDown');assert.equal(result.handled,true);assert.equal(result.prevented,true);assert.equal(h.active(),1);
 assert.deepEqual(h.options.map(option=>option.tabIndex),[-1,0,-1,-1]);
 h.fire('ArrowRight');assert.equal(h.active(),2,'Right advances through list options');
 h.fire('End');assert.equal(h.active(),3,'End selects the last option');
 h.fire('ArrowDown');assert.equal(h.active(),3,'focus stays bounded at the final result');
 h.fire('Home');assert.equal(h.active(),0,'Home returns to the first result');
 h.fire('ArrowLeft');assert.equal(h.active(),0,'focus stays bounded at the first result');
});

test('VIZ-02 team browser search enters results with Down and Escape returns to its toggle',()=>{
 const h=browserHarness(),search={matches:selector=>selector==='.teamBrowseSearch',closest:()=>h.panel};
 h.setFocus(search);
 const down=h.fire('ArrowDown',search);assert.equal(down.handled,true);assert.equal(h.active(),0);
 const escape=h.fire('Escape');assert.equal(escape.handled,true);assert.equal(escape.prevented,true);assert.equal(escape.stopped,true);
 assert.equal(h.closed(),true);assert.equal(h.toggleFocused(),true,'closing the picker restores focus to its opener');
});

test('VIZ-02 team browser exposes one option tab stop and installs its keyboard handler',()=>{
 assert.match(ui,/tabindex="\$\{i===active\?'0':'-1'\}"/);
 assert.match(ui,/menu\.addEventListener\('keydown',teamBrowserKeydown\)/);
 assert.match(ui,/role="listbox" aria-label="Teams with flags and crests"/);
});

test('VIZ-02 team browser announces filtered, empty, and capped result counts',()=>{
 const teams=Array.from({length:70},(_,index)=>({name:`Team ${index}`,group:'test'}));
 const select={value:'0',options:teams.map((_,index)=>({value:String(index)}))};
 const search={value:''},panel={},out={innerHTML:''},status={textContent:''};
 const elements={club:select,clubBrowse:panel,clubResults:out,clubSearch:search,clubResultsStatus:status};
 const context={
  $:id=>elements[id],TEAMS:teams,countryName:()=> 'Example Country',clubCountry:()=> 'EX',
  teamIdentity:()=>'<i>crest</i>',escapeHTML:value=>String(value),
 };
 const start=ui.indexOf('function fillTeamBrowser('),end=ui.indexOf('\nfunction showTeamBrowser(',start);
 assert.ok(start>=0&&end>start,'team browser renderer exists');
 vm.runInNewContext(ui.slice(start,end)+'\nthis.fillTeamBrowser=fillTeamBrowser;',context);
 context.fillTeamBrowser('club');
 assert.equal(status.textContent,'70 teams found. Showing the first 60; refine your search to narrow the list.');
 assert.match(out.innerHTML,/Showing 60 of 70/);
 search.value='team 69';context.fillTeamBrowser('club');
 assert.equal(status.textContent,'1 team found.');
 search.value='missing';context.fillTeamBrowser('club');
 assert.equal(status.textContent,'No teams found.');
 assert.match(ui,/aria-live="polite" aria-atomic="true"/);
});

