'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
function careerFixture(){return {club:1,season:1,week:0,members:[1],fixtures:[],history:[],roster:Array.from({length:12},(_,i)=>({id:'player-'+i,name:'Player '+i,role:i?'MF':'GK',appearance:{face:i},magicTrick:i?'banana':undefined})),table:{},facilities:{training:1},cup:{stage:0},cash:0};}
function memory(){const data=new Map();return {data,getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};}
function section(start,end){const a=ui.indexOf(start),b=ui.indexOf(end,a);assert(a>=0&&b>a,`source section ${start}`);return ui.slice(a,b);}
test('manager appearance save changes only career.managerAppearance and verifies the Career write',()=>{
 const career=careerFixture(),before=JSON.stringify(career.roster),store=memory(),writes=[];
 const appearance={skin:'#123456',hair:'#654321',face:8};
 const context={career,studioManagerContext:true,getAppearance:()=>appearance,managerAvatarAppearance:()=>({skin:'#abcdef'}),managerAvatarPlayer:()=>({id:'manager'}),avatarFor:()=>({skin:'#123456'}),tokenWallet:{owns:()=>true},studioAppearanceUnlockIssues:()=>[],
  storeCharacterChanges:(key,payload)=>{writes.push([key,JSON.parse(JSON.stringify(payload))]);store.setItem('legend_'+key,JSON.stringify(payload));return store.getItem('legend_'+key)===JSON.stringify(payload);},
  saveCareer:()=>{},showManager:()=>{context.hub=true;},showCareerSquad:()=>{context.squad=true;},studioReturnAction:'manager'};
 vm.runInNewContext(section('function saveAppearance(){','function paintAvatars(){')+';this.save=saveAppearance;',context);
 context.save();
 assert.equal(context.career.managerAppearance.face,8);assert.equal(JSON.stringify(context.career.roster),before,'player roster is unchanged');
 assert.equal(writes.length,1);assert.equal(writes[0][0],'managerCareer');assert.equal(writes[0][1].managerAppearance.skin,'#123456');
 assert.equal(context.squad,undefined);assert.equal(context.hub,true);assert.equal(context.studioManagerContext,false);
});
test('legacy Career gets deterministic manager defaults without rewriting the save',()=>{
 const defaults={skin:'#aabbcc',hair:'#112233',face:3},legacy=careerFixture();
 const context={career:legacy,avatarFor:()=>defaults};vm.runInNewContext(section('function managerAvatarAppearance(', 'function showManager(){')+';this.manager=managerAvatarAppearance;',context);
 assert.deepEqual(JSON.parse(JSON.stringify(context.manager())),defaults);assert.equal(Object.hasOwn(legacy,'managerAppearance'),false);
 assert.match(ui,/id="managerAvatarPreview"/);assert.match(ui,/EDIT MANAGER LOOK/);
});
test('manager slots copy/load and backup import/export retain the separate appearance field',async()=>{
 const api=(await import('../src/modules/career_slots.js')).CAREER_SLOTS,db=memory(),vault=api.create(db),career=careerFixture();
 career.managerAppearance={skin:'#123456',face:4};vault.save(1,career,'Manager career');const copy=vault.duplicate(1);
 assert.deepEqual(vault.load(copy).managerAppearance,career.managerAppearance);
 assert.deepEqual(api.create(db).load(1).managerAppearance,career.managerAppearance);
 const start=ui.indexOf('function validateSaveImport('),end=ui.indexOf('async function exportSave(',start);
 const context={SAVE_KEYS:['managerCareer'],CAREER_SLOTS:{validVault:()=>true},CUP_SLOTS:{validVault:()=>true}};
 vm.runInNewContext(ui.slice(start,end)+';this.validate=validateSaveImport;this.commit=commitSaveImport;',context);
 const changes=context.validate({product:'Supermagic Football',data:{managerCareer:career}}),backup=memory();
 context.commit(changes,backup);
 assert.deepEqual(JSON.parse(backup.getItem('legend_managerCareer')).managerAppearance,career.managerAppearance);
 assert.match(ui,/const SAVE_KEYS=Object\.freeze\(\[[^\]]*'managerCareer'/,'existing backup export includes managerCareer');
 assert.match(ui,/data:await collectSaveExportData\(localStorage\)/,'backup export uses the validated raw-storage collector');
 const legacy=careerFixture();assert.doesNotThrow(()=>context.validate({product:'Supermagic Football',data:{managerCareer:legacy}}));
});
test('manager studio uses existing appearance editing without player or gameplay controls',()=>{
 assert.match(ui,/function studioSubject\(\)\{if\(studioManagerContext\)return career\?managerAvatarPlayer\(\):null/);
 assert.match(ui,/const magicSelector=studioManagerContext\?'':/);assert.match(ui,/studioManagerContext\?'':studioStatControls\(player\)/);
 assert.match(ui,/if\(typeof studioManagerContext!=='undefined'&&studioManagerContext\)\{if\(!career\)return;const appearance=getAppearance\(\)/);
 assert.match(ui,/function studioResetUnsavedAppearance\(\)[\s\S]*typeof studioManagerContext!=='undefined'&&studioManagerContext\?studioSubject\(\)/);
});
