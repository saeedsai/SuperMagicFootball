const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const memory=()=>{const data=new Map();return {getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}};
const campaign=(club=2)=>({id:'cup_UEFA',compId:'UEFA',club,participants:[club,3,4,5],phase:'league',roundIdx:0,history:[],rounds:[],groups:[],table:{[club]:{},3:{},4:{},5:{}},earned:0,winner:null,knockout:null});
async function api(){return (await import('../src/modules/cup_slots.js')).CUP_SLOTS;}
test('SAVE-102 stores ten independent Cup campaigns and preserves active selection',async()=>{
 const db=memory(),vault=(await api()).create(db);
 assert.equal(vault.list().length,10);
 for(let n=1;n<=10;n++)vault.save(n,campaign(n+10),'Cup '+n);
 assert.equal(vault.firstEmpty(),null);
 const reopened=(await api()).create(db);
 assert.equal(reopened.active,10);
 assert.equal(reopened.load(4).club,14);
 assert.equal(reopened.active,4);
 const snapshot=reopened.activeTournament();snapshot.club=99;
 assert.equal(reopened.activeTournament().club,14,'saved campaigns must be cloned');
 assert.equal((await api()).create(db).load(10).club,20);
});
test('SAVE-102 legacy import does not erase old Cup or overwrite existing slots',async()=>{
 const db=memory(),legacy=campaign(8);
 db.setItem('legend_continentalRun',JSON.stringify(legacy));
 const vault=(await api()).create(db);
 assert.equal(vault.importLegacy(legacy),true);
 assert.equal(vault.load(1).club,8);
 assert.equal(JSON.parse(db.getItem('legend_continentalRun')).club,8);
 assert.equal((await api()).create(db).importLegacy(campaign(9)),false);
});
test('SAVE-102 delete, validation, corruption and failed writes are safe',async()=>{
 const mod=await api(),db=memory(),vault=mod.create(db);
 vault.save(1,campaign(10));vault.save(2,campaign(11));
 vault.remove(1);
 assert.equal(vault.list()[0].occupied,false);
 assert.equal(vault.load(2).club,11);
 assert.throws(()=>vault.load(1),/empty/);
 assert.throws(()=>vault.save(0,campaign()),/1–10/);
 assert.equal(mod.validTournament({...campaign(),phase:'nonsense'}),false);
 const original=db.getItem('legend_cupSlots');
 const failure={getItem:db.getItem,setItem(){throw Error('QuotaExceededError')}};
 assert.throws(()=>mod.create(failure).save(3,campaign(12)),/QuotaExceededError/);
 assert.equal(db.getItem('legend_cupSlots'),original);
 db.setItem('legend_cupSlots','{bad json');
 const blocked=mod.create(db);
 assert.ok(blocked.error);
 assert.throws(()=>blocked.save(1,campaign()),/cannot be modified/);
 assert.equal(db.getItem('legend_cupSlots'),'{bad json');
});
test('SAVE-102 UI, autosave, import validation and offline fixture are wired',()=>{
 const ui=readFileSync('src/modules/ui.js','utf8');
 const build=readFileSync('scripts/build.py','utf8');
 const sw=readFileSync('sw.js','utf8');
 for(const token of ['navCupSlots','cupSlotSave_','cupSlotLoad_','cupSlotDelete_','CUP_SLOTS.create(careerStorage)','cupSlots.importLegacy(','cupSlots.save(','cupSlots.load(','cupSlots.remove(','function saveCup()','saveCup();page(\'CONTINENTAL RESULT\''])assert.ok(ui.includes(token),token);
 assert.match(ui,/const SAVE_KEYS=Object\.freeze\(\[[^\n]*'cupSlots'/);
 assert.match(ui,/if\(key==='cupSlots'&&!CUP_SLOTS\.validVault\(value\)\)/);
 assert.match(build,/['"]cup_slots['"]/);
 assert.match(sw,/['"]cup_slots['"]/);
});

test('SAVE-102 restricted storage permits Cup autosave flow in memory but never conceals quota failures',()=>{
 const vm=require('node:vm'),ui=readFileSync('src/modules/ui.js','utf8');
 const match=ui.match(/let cupSaveVolatile=false;[\s\S]*?(?=function startContinent\()/);
 assert.ok(match,'use the real Cup write helper from the game UI');
 let warnings=0,attempts=0,fail='Persistent storage unavailable';
 const context={cupSlots:{save(){attempts++;if(fail)throw Error(fail);return {name:'saved'};}},console:{warn(){warnings++;}}};
 vm.runInNewContext(match[0]+';globalThis.save=writeCupSlot;globalThis.volatile=()=>cupSaveVolatile;',context);
 assert.equal(context.save(1,campaign(3),'Continental'),null,'initial Cup can begin without localStorage');
 assert.equal(context.volatile(),true);
 assert.equal(context.save(1,campaign(3)),null,'match-end Cup autosave must not abort the results screen');
 assert.equal(attempts,2);
 assert.equal(warnings,1,'warn once rather than on each match');
 fail='QuotaExceededError';
 assert.throws(()=>context.save(1,campaign(3)),/QuotaExceededError/,'full/failed storage must not silently discard Cup progress');
 fail=null;
 assert.equal(context.save(1,campaign(3)).name,'saved','a later recovered origin must write normally');
 assert.equal(context.volatile(),false);
});
