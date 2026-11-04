const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8');
const helper=ui.slice(ui.indexOf('function studioAppearanceKey('),ui.indexOf('function studioColorField('));

function appearanceTools(owned=[]){
 const ctx={
  NATURAL_SKIN_TONES:[['#f5d5bd','soft'],['#b57b57','deep']],
  NATURAL_HAIR_COLORS:[['#332211','dark'],['#eabb31','gold']],
  STUDIO_ASSET_LABELS:{style:['one','two','three'],accessory:['none','cap'],scar:['none','line']},
  tokenWallet:{owns:(category,id)=>owned.includes(`${category}/${id}`)}
 };
 return vm.runInNewContext(`${helper};({key:studioAppearanceKey,issues:studioAppearanceUnlockIssues})`,ctx);
}

test('grandfathers current appearance and accessory values but rejects unowned changes',()=>{
 const tools=appearanceTools();
 const saved={skin:'#f5d5bd',hair:'#332211',style:0,accessory:0,scar:1};
 assert.deepEqual(Array.from(tools.issues(saved,{...saved})),[]);
 assert.deepEqual(Array.from(tools.issues(saved,{...saved,style:2})),['style']);
 assert.deepEqual(Array.from(tools.issues(saved,{...saved,accessory:1})),['accessory']);
 assert.deepEqual(Array.from(tools.issues(saved,{...saved,skin:'#b57b57'})),['skin']);
});

test('purchased appearance and accessory ids match selector gating',()=>{
 const tools=appearanceTools(['appearance/style:2','accessory/accessory:1','appearance/skin:1']);
 assert.deepEqual(Array.from(tools.issues({style:0,accessory:0,skin:'#f5d5bd'},{style:2,accessory:1,skin:'#b57b57'})),[]);
 assert.equal(tools.key('accessory',1),'accessory:1');
 assert.equal(tools.key('skin','#b57b57'),'skin:1');
 assert.equal(tools.key('style','NaN'),null);
 assert.equal(tools.key('style',999),null);
});

test('Studio renders only owned or current appearance options and validates saves',()=>{
 const selector=ui.slice(ui.indexOf('function studioNumberOptions('),ui.indexOf('const STUDIO_SKIN_SWATCH_NAMES'));
 const colors=ui.slice(ui.indexOf('function studioColorOptions('),ui.indexOf('let studioDirection='));
 const save=ui.slice(ui.indexOf('function saveAppearance(){'),ui.indexOf('function paintAvatars()'));
 assert.match(selector,/tokenWallet\.owns\(category,`\$\{key\}:\$\{value\}`\)/);
 assert.match(colors,/tokenWallet\.owns\('appearance',`\$\{family\}:\$\{index\}`\)/);
 assert.match(selector,/key==='accessory'\?'accessory':'appearance'/);
 assert.match(colors,/family=id==='face_skin'\?'skin':'hair'/);
 assert.match(save,/studioAppearanceUnlockIssues\(studioSavedAppearance\(player\),appearance\)/);
 assert.match(save,/if\(locked\.length\)\{const message=`Unlock these appearance selections in Store & Tokens first:/);
});

test('Store offers existing appearance/accessory ids and leaves teams/players unavailable',()=>{
 const catalog=ui.slice(ui.indexOf('function tokenStoreCatalog()'),ui.indexOf('function storeCard('));
 assert.match(catalog,/appearance:appearances,accessory:accessories/);
 assert.match(catalog,/category:'accessory',id:`accessory:\$\{index\}`/);
 assert.match(catalog,/team:\[\],player:\[\]/);
 assert.match(ui,/if\(!\['superShot','magicTrick','appearance','accessory'\]\.includes\(storeCategory\)\)/);
});
