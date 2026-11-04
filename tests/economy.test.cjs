'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

let ECONOMY;
async function api(){return ECONOMY??=(await import('../src/modules/economy.js')).ECONOMY;}
function memory(seed={}){
 const values=new Map(Object.entries(seed));
 return {values,getItem:key=>values.has(key)?values.get(key):null,
  setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
}
const receipt=(id='receipt-0001',mode='career',result='win',status='completed')=>({receiptId:id,mode,result,status});

test('new token wallet is additive and reward payouts are fixed across supported match modes',async()=>{
 const economy=await api(),career={club:12,roster:[{id:'existing-player'}]},storage=memory({'legend_managerCareer':JSON.stringify(career)});
 const wallet=economy.create(storage);
 assert.deepEqual(wallet.wallet(),{schema:1,tokens:0,unlocks:[],receipts:[]});
 for(const mode of ['career','cup','tournament','continental','online']){
  const outcome=wallet.awardCompletedMatch(receipt('receipt-'+mode+'-001',mode,'win'));
  assert.equal(outcome.reward,economy.REWARDS.completion+economy.REWARDS.winBonus);
 }
 assert.equal(wallet.wallet().tokens,150);
 assert.deepEqual(JSON.parse(storage.getItem('legend_managerCareer')),career,'wallet writes must not rewrite the roster or Career save');
 assert.equal(storage.getItem(economy.KEY)!==null,true,'the wallet persists under its own additive key');
 assert.equal(economy.TOKEN_PACKS_ENABLED,false);
});

test('completed wins, draws and losses use the documented balanced reward amounts',async()=>{
 const {REWARDS,create}=await api(),wallet=create(memory());
 assert.equal(wallet.awardCompletedMatch(receipt('result-win-001')).reward,REWARDS.completion+REWARDS.winBonus);
 assert.equal(wallet.awardCompletedMatch(receipt('result-draw-001','cup','draw')).reward,REWARDS.completion+REWARDS.drawBonus);
 assert.equal(wallet.awardCompletedMatch(receipt('result-loss-001','online','loss')).reward,REWARDS.completion+REWARDS.lossBonus);
 assert.equal(wallet.wallet().tokens,REWARDS.completion*3+REWARDS.winBonus+REWARDS.drawBonus);
});

test('incomplete, unsupported, and malformed result receipts never award tokens',async()=>{
 const wallet=(await api()).create(memory()),before=wallet.wallet();
 for(const input of [
  receipt('unfinished-001','career','win','abandoned'),
  receipt('bad-result-0001','career','forfeit'),
  receipt('unknown-mode-01','arcade','win'),
  receipt('short','career','win'),
  null,
 ])assert.equal(wallet.awardCompletedMatch(input).ok,false);
 assert.deepEqual(wallet.wallet(),before);
});

test('duplicate result receipts never pay twice, including when replayed under another mode',async()=>{
 const wallet=(await api()).create(memory());
 const first=wallet.awardCompletedMatch(receipt('same-result-0001','career','win'));
 const replay=wallet.awardCompletedMatch(receipt('same-result-0001','online','win'));
 assert.equal(first.reward,30);
 assert.equal(replay.duplicate,true);
 assert.equal(replay.reward,0);
 assert.equal(wallet.wallet().tokens,30);
 assert.equal(wallet.wallet().receipts.length,1);
});

test('receipt history stays bounded and fails closed rather than evicting dedupe IDs',async()=>{
 const economy=await api(),receipts=Array.from({length:economy.MAX_RECEIPTS},(_,i)=>'old-receipt-'+String(i).padStart(6,'0'));
 const initial={schema:1,tokens:42,unlocks:[],receipts};
 const storage=memory({[economy.KEY]:JSON.stringify(initial)}),wallet=economy.create(storage);
 const before=storage.getItem(economy.KEY);
 const rejected=wallet.awardCompletedMatch(receipt('new-receipt-0001'));
 assert.equal(rejected.reason,'receipt-capacity');
 assert.equal(rejected.reward,0);
 assert.equal(storage.getItem(economy.KEY),before,'full bounded history must not evict an old receipt and make it payable again');
 assert.equal(wallet.wallet().tokens,42);
});

test('token cap clamps payout but still records the receipt so later replays stay free',async()=>{
 const economy=await api(),storage=memory({[economy.KEY]:JSON.stringify({schema:1,tokens:economy.MAX_TOKENS-4,unlocks:[],receipts:[]})});
 const wallet=economy.create(storage);
 const first=wallet.awardCompletedMatch(receipt('cap-result-0001','cup','win'));
 assert.equal(first.reward,4);
 assert.equal(wallet.wallet().tokens,economy.MAX_TOKENS);
 assert.equal(wallet.awardCompletedMatch(receipt('cap-result-0001','cup','win')).duplicate,true);
});

test('store buys only allowlisted existing items at category prices with no caller-set price',async()=>{
 const economy=await api(),catalog=[
  {id:'shot-dolphin',category:'superShot',existing:true,availableForPurchase:true},
  {id:'trick-rainbow',category:'magicTrick',existing:true,availableForPurchase:true},
  {id:'club-existing-1',category:'team',existing:true,availableForPurchase:true},
  {id:'player-existing-1',category:'player',existing:true,availableForPurchase:true},
  {id:'hair-style-4',category:'appearance',existing:true,availableForPurchase:true},
  {id:'headband-1',category:'accessory',existing:true,availableForPurchase:true},
 ];
 const wallet=economy.create(memory({[economy.KEY]:JSON.stringify({schema:1,tokens:2000,unlocks:[],receipts:[]})}));
 for(const item of catalog){
  const first=wallet.purchase({...item,cost:0},catalog);
  assert.equal(first.ok,true,item.category);
  assert.equal(first.cost,economy.PRICES[item.category]);
  const replay=wallet.purchase(item,catalog);
  assert.equal(replay.reason,'already-owned');
  assert.equal(wallet.owns(item.category,item.id),true);
 }
 const expected=2000-catalog.reduce((sum,item)=>sum+economy.PRICES[item.category],0);
 assert.equal(wallet.wallet().tokens,expected);
 assert.equal(wallet.wallet().unlocks.length,catalog.length);
});

test('store rejects synthetic, unlisted, already-owned, invalid, and unaffordable entries without spending',async()=>{
 const economy=await api(),catalog=[
  {id:'existing-shot-1',category:'superShot',existing:true,availableForPurchase:true},
  {id:'locked-for-later',category:'accessory',existing:true,availableForPurchase:false},
  {id:'invented-shot',category:'superShot',existing:false,availableForPurchase:true},
 ];
 const wallet=economy.create(memory({[economy.KEY]:JSON.stringify({schema:1,tokens:10,unlocks:[],receipts:[]})}));
 for(const item of catalog)assert.equal(wallet.purchase(item,catalog).ok,false);
 assert.equal(wallet.purchase({category:'superShot',id:'not-listed'},catalog).reason,'not-in-existing-store-catalog');
 assert.equal(wallet.purchase({category:'newTeam',id:'club'},catalog).reason,'invalid-item');
 assert.equal(wallet.wallet().tokens,10);
});

test('bonus team and player unlocks are additive and leave legacy free Career choices untouched',async()=>{
 const economy=await api();
 const legacyCareer={teamId:'club-free-01',selectedPlayerId:'player-free-01',roster:[{id:'player-free-01',role:'FW'}]};
 const careerBytes=JSON.stringify(legacyCareer);
 const bonusCatalog=[
  {id:'club-free-01',category:'team',existing:true,availableForPurchase:false},
  {id:'club-bonus-02',category:'team',existing:true,availableForPurchase:true},
  {id:'player-free-01',category:'player',existing:true,availableForPurchase:false},
  {id:'player-bonus-02',category:'player',existing:true,availableForPurchase:true},
 ];
 const storage=memory({legend_managerCareer:careerBytes,[economy.KEY]:JSON.stringify({schema:1,tokens:1000,unlocks:[],receipts:[]})});
 const wallet=economy.create(storage);
 assert.equal(wallet.purchase(bonusCatalog[0],bonusCatalog).reason,'not-in-existing-store-catalog');
 assert.equal(wallet.purchase(bonusCatalog[2],bonusCatalog).reason,'not-in-existing-store-catalog');
 assert.equal(wallet.purchase(bonusCatalog[1],bonusCatalog).ok,true);
 assert.equal(wallet.purchase(bonusCatalog[3],bonusCatalog).ok,true);
 assert.equal(wallet.owns('team','club-bonus-02'),true);
 assert.equal(wallet.owns('player','player-bonus-02'),true);
 assert.deepEqual(JSON.parse(storage.getItem('legend_managerCareer')),legacyCareer);
 assert.equal(storage.getItem('legend_managerCareer'),careerBytes,'unlock purchases must not rewrite an existing Career team, player, or roster');
 const reloaded=economy.create(storage);
 assert.equal(reloaded.owns('team','club-bonus-02'),true,'bonus collection persists in the additive wallet key');
 assert.equal(reloaded.owns('player','player-bonus-02'),true);
 assert.equal(reloaded.wallet().tokens,1000-economy.PRICES.team-economy.PRICES.player);
});

test('unaffordable team and player bonus purchases fail without debiting or changing unlock state',async()=>{
 const economy=await api(),catalog=[
  {id:'club-bonus-03',category:'team',existing:true,availableForPurchase:true},
  {id:'player-bonus-03',category:'player',existing:true,availableForPurchase:true},
 ];
 const wallet=economy.create(memory({[economy.KEY]:JSON.stringify({schema:1,tokens:economy.PRICES.player-1,unlocks:[],receipts:[]})}));
 for(const item of catalog){
  const result=wallet.purchase(item,catalog);
  assert.equal(result.ok,false,item.category);
  assert.equal(result.reason,'insufficient-tokens',item.category);
  assert.equal(result.cost,economy.PRICES[item.category]);
 }
 assert.equal(wallet.wallet().tokens,economy.PRICES.player-1);
 assert.deepEqual(wallet.wallet().unlocks,[]);
});

test('a pre-wallet legacy save opens a fresh additive wallet without rewriting its saved team or players',async()=>{
 const economy=await api(),legacyCareer={teamId:'club-legacy-04',players:['player-legacy-01','player-legacy-02'],formation:'4-3-3'};
 const careerBytes=JSON.stringify(legacyCareer),storage=memory({legend_managerCareer:careerBytes});
 const wallet=economy.create(storage);
 assert.deepEqual(wallet.wallet(),economy.emptyWallet());
 assert.equal(storage.getItem(economy.KEY),null,'opening a legacy save does not eagerly rewrite it or create a wallet');
 assert.equal(wallet.awardCompletedMatch(receipt('legacy-save-match-0001')).ok,true);
 assert.equal(storage.getItem(economy.KEY)!==null,true,'earned wallet state uses its own additive storage key');
 assert.equal(storage.getItem('legend_managerCareer'),careerBytes);
 assert.deepEqual(JSON.parse(storage.getItem('legend_managerCareer')),legacyCareer);
});

test('corrupt wallet fails closed without resetting bytes or changing other save sections',async()=>{
 const economy=await api(),career='{"club":4}',storage=memory({[economy.KEY]:'{bad',legend_managerCareer:career});
 const wallet=economy.create(storage);
 assert.match(wallet.error,/Invalid token wallet JSON/);
 assert.throws(()=>wallet.awardCompletedMatch(receipt('blocked-result-01')),/read-only/);
 assert.equal(storage.getItem(economy.KEY),'{bad');
 assert.equal(storage.getItem('legend_managerCareer'),career);
});

test('failed wallet writes roll back bytes and the public balance remains unchanged',async()=>{
 const economy=await api(),initial={schema:1,tokens:9,unlocks:[],receipts:[]};
 const storage=memory({[economy.KEY]:JSON.stringify(initial)});let failed=false;
 const original=storage.setItem;
 storage.setItem=(key,value)=>{storage.values.set(key,String(value));if(!failed){failed=true;throw Error('post-write quota error')}original(key,value)};
 const wallet=economy.create(storage);
 assert.throws(()=>wallet.awardCompletedMatch(receipt('failed-write-001')),/Token wallet save failed/);
 assert.deepEqual(JSON.parse(storage.getItem(economy.KEY)),initial);
 assert.equal(wallet.wallet().tokens,9);
});

test('wallet validation rejects duplicate receipts/unlocks and out-of-range values',async()=>{
 const {validWallet,emptyWallet}=await api();
 assert.equal(validWallet(emptyWallet()),true);
 assert.equal(validWallet({...emptyWallet(),tokens:-1}),false);
 assert.equal(validWallet({...emptyWallet(),tokens:1.5}),false);
 assert.equal(validWallet({...emptyWallet(),receipts:['result-id-0001','result-id-0001']}),false);
 assert.equal(validWallet({...emptyWallet(),unlocks:['team:club-1','team:club-1']}),false);
});
