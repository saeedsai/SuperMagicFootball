// Additive local token wallet. The game supplies a catalogue built from existing content;
// this module owns prices, rewards, persistence, and duplicate-result protection only.
const ECONOMY=(()=>{
const KEY='legend_tokenWallet';
const MAX_TOKENS=999999;
const MAX_RECEIPTS=4096;
const MAX_UNLOCKS=4096;
const MAX_ITEM_ID_LENGTH=120;
const RECEIPT_ID_MIN=8;
const RECEIPT_ID_MAX=160;
const CATEGORIES=Object.freeze(['superShot','magicTrick','team','player','appearance','accessory']);
const MODES=Object.freeze(['career','cup','tournament','continental','online']);
const REWARDS=Object.freeze({completion:20,winBonus:10,drawBonus:5,lossBonus:0});
const PRICES=Object.freeze({superShot:120,magicTrick:160,team:300,player:250,appearance:80,accessory:60});
const TOKEN_PACKS_ENABLED=false;
const emptyWallet=()=>({schema:1,tokens:0,unlocks:[],receipts:[]});
const clone=value=>JSON.parse(JSON.stringify(value));
const validId=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max&&value.trim()===value&&!/[\u0000-\u001f\u007f\u2028\u2029]/.test(value);
const unlockKey=(category,id)=>`${category}:${id}`;
function validWallet(wallet){
 if(!wallet||typeof wallet!=='object'||Array.isArray(wallet)||wallet.schema!==1||
  !Number.isSafeInteger(wallet.tokens)||wallet.tokens<0||wallet.tokens>MAX_TOKENS||
  !Array.isArray(wallet.unlocks)||wallet.unlocks.length>MAX_UNLOCKS||
  !Array.isArray(wallet.receipts)||wallet.receipts.length>MAX_RECEIPTS)return false;
 const unlockPattern=/^(superShot|magicTrick|team|player|appearance|accessory):(.{1,120})$/;
 return wallet.unlocks.every(value=>validId(value,MAX_ITEM_ID_LENGTH+16)&&unlockPattern.test(value))&&
  new Set(wallet.unlocks).size===wallet.unlocks.length&&
  wallet.receipts.every(value=>validId(value,RECEIPT_ID_MAX)&&value.length>=RECEIPT_ID_MIN)&&
  new Set(wallet.receipts).size===wallet.receipts.length;
}
function create(storage){
 if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||typeof storage.removeItem!=='function')
  throw Error('Token wallet requires a local storage adapter');
 let state=emptyWallet(),blocked=null;
 try{
  const raw=storage.getItem(KEY);
  if(raw!==null){
   try{state=JSON.parse(raw)}catch(error){throw Error('Invalid token wallet JSON: '+error.message)}
   if(!validWallet(state))throw Error('Invalid token wallet structure');
  }
 }catch(error){blocked=error;state=emptyWallet();}
 const ensureUsable=()=>{if(blocked)throw Error('Token wallet is read-only: '+blocked.message);};
 function persist(next){
  ensureUsable();if(!validWallet(next))throw Error('Invalid token wallet update');
  const raw=JSON.stringify(next),previous=storage.getItem(KEY);
  try{
   storage.setItem(KEY,raw);
   if(storage.getItem(KEY)!==raw)throw Error('Token wallet was not retained by storage');
  }catch(error){
   try{if(previous===null)storage.removeItem(KEY);else storage.setItem(KEY,previous);}catch{}
   try{if(storage.getItem(KEY)!==previous)blocked=Error('Token wallet rollback could not be verified');}
   catch{blocked=Error('Token wallet rollback readback failed');}
   throw Error('Token wallet save failed'+(blocked?'; '+blocked.message:'')+': '+error.message);
  }
  state=next;
 }
 function wallet(){return clone(state);}
 function awardCompletedMatch(payload={}){
  ensureUsable();
  if(!payload||typeof payload!=='object'||Array.isArray(payload))return {ok:false,reason:'invalid-result',reward:0,wallet:wallet()};
  const {receiptId,mode,status,result}=payload;
  if(!validId(receiptId,RECEIPT_ID_MAX)||receiptId.length<RECEIPT_ID_MIN)return {ok:false,reason:'invalid-receipt',reward:0,wallet:wallet()};
  if(!MODES.includes(mode))return {ok:false,reason:'invalid-mode',reward:0,wallet:wallet()};
  if(status!=='completed'||!['win','draw','loss'].includes(result))return {ok:false,reason:'match-not-complete',reward:0,wallet:wallet()};
  if(state.receipts.includes(receiptId))return {ok:false,duplicate:true,reason:'duplicate-receipt',reward:0,wallet:wallet()};
  if(state.receipts.length>=MAX_RECEIPTS)return {ok:false,reason:'receipt-capacity',reward:0,wallet:wallet()};
  const outcomeBonus=result==='win'?REWARDS.winBonus:result==='draw'?REWARDS.drawBonus:REWARDS.lossBonus;
  const reward=Math.min(REWARDS.completion+outcomeBonus,MAX_TOKENS-state.tokens);
  const next=clone(state);next.tokens+=reward;next.receipts.push(receiptId);persist(next);
  return {ok:true,duplicate:false,mode,result,reward,wallet:wallet()};
 }
 function owns(category,id){return CATEGORIES.includes(category)&&validId(id,MAX_ITEM_ID_LENGTH)&&state.unlocks.includes(unlockKey(category,id));}
 function purchase(item,catalog){
  ensureUsable();
  if(!item||typeof item!=='object'||Array.isArray(item)||!CATEGORIES.includes(item.category)||!validId(item.id,MAX_ITEM_ID_LENGTH))
   return {ok:false,reason:'invalid-item',cost:0,wallet:wallet()};
  const catalogItem=Array.isArray(catalog)?catalog.find(entry=>entry&&entry.id===item.id&&entry.category===item.category):null;
  if(!catalogItem||catalogItem.existing!==true||catalogItem.availableForPurchase!==true)
   return {ok:false,reason:'not-in-existing-store-catalog',cost:0,wallet:wallet()};
  const key=unlockKey(item.category,item.id),cost=PRICES[item.category];
  if(state.unlocks.includes(key))return {ok:false,reason:'already-owned',cost:0,wallet:wallet()};
  if(state.tokens<cost)return {ok:false,reason:'insufficient-tokens',cost,wallet:wallet()};
  if(state.unlocks.length>=MAX_UNLOCKS)return {ok:false,reason:'unlock-capacity',cost:0,wallet:wallet()};
  const next=clone(state);next.tokens-=cost;next.unlocks.push(key);persist(next);
  return {ok:true,reason:'purchased',cost,wallet:wallet()};
 }
 return {get error(){return blocked?.message||null},wallet,owns,awardCompletedMatch,purchase};
}
return Object.freeze({KEY,MAX_TOKENS,MAX_RECEIPTS,MAX_UNLOCKS,CATEGORIES,MODES,REWARDS,PRICES,TOKEN_PACKS_ENABLED,emptyWallet,validWallet,create});
})();
export {ECONOMY};
