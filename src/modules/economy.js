// Additive token wallet. The game supplies catalogue entries from existing
// content; this module owns prices, rewards, durable storage, and deduplication.
import {createEconomyStore} from './economy-store.js';

const ECONOMY=(()=>{
const KEY='legend_tokenWallet';
const MAX_TOKENS=999999;
// Schema 1 was bounded at 4096. New schema 2 stores the exact receipt ledger
// in IndexedDB; its export limit is enforced by save management, not by count.
const MAX_RECEIPTS=4096;
const MAX_SAVE_EXPORT_BYTES=64*1024*1024;
const MAX_UNLOCKS=4096;
const MAX_ITEM_ID_LENGTH=120;
const RECEIPT_ID_MIN=8;
const RECEIPT_ID_MAX=160;
// The exact ledger is byte bounded, with an additional count ceiling to bound
// validation and IDB reads. At typical generated receipt sizes this permits
// 100x the legacy schema-1 count; long imported IDs consume the byte budget
// faster and fail atomically before the save can exceed the shared 64 MiB cap.
const MAX_RECEIPTS_V2=409600;
const MAX_RECEIPT_LEDGER_BYTES=MAX_SAVE_EXPORT_BYTES-1024*1024;
const receiptStorageBytes=id=>new TextEncoder().encode(JSON.stringify(id)).byteLength+10;
function receiptLedgerBytes(receipts){let bytes=0;for(const id of receipts){bytes+=receiptStorageBytes(id);if(bytes>MAX_RECEIPT_LEDGER_BYTES)return bytes;}return bytes;}
const CATEGORIES=Object.freeze(['superShot','magicTrick','team','player','appearance','accessory']);
const MODES=Object.freeze(['career','cup','tournament','continental','online']);
const REWARDS=Object.freeze({completion:20,winBonus:10,drawBonus:5,lossBonus:0});
const PRICES=Object.freeze({superShot:120,magicTrick:160,team:300,player:250,appearance:80,accessory:60});
const TOKEN_PACKS_ENABLED=false;
const emptyWallet=()=>({schema:1,tokens:0,unlocks:[],receipts:[]});
const emptyCurrentWallet=()=>({schema:2,tokens:0,unlocks:[],receipts:[]});
const clone=value=>value===null?null:JSON.parse(JSON.stringify(value));
const validId=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max&&value.trim()===value&&!/[\u0000-\u001f\u007f\u2028\u2029]/.test(value);
const unlockKey=(category,id)=>`${category}:${id}`;
function validWallet(wallet){
 if(!wallet||typeof wallet!=='object'||Array.isArray(wallet)||![1,2].includes(wallet.schema)||
  !Number.isSafeInteger(wallet.tokens)||wallet.tokens<0||wallet.tokens>MAX_TOKENS||
  !Array.isArray(wallet.unlocks)||wallet.unlocks.length>MAX_UNLOCKS||
  !Array.isArray(wallet.receipts)||wallet.schema===1&&wallet.receipts.length>MAX_RECEIPTS||
  wallet.schema===2&&wallet.receipts.length>MAX_RECEIPTS_V2)return false;
 const unlockPattern=/^(superShot|magicTrick|team|player|appearance|accessory):(.{1,120})$/;
 if(!wallet.unlocks.every(value=>validId(value,MAX_ITEM_ID_LENGTH+16)&&unlockPattern.test(value))||
   new Set(wallet.unlocks).size!==wallet.unlocks.length)return false;
 // Bound work before constructing the set. Schema 2 imports are also bounded
 // by the shared save-file byte ceiling before this function is called there.
 if(wallet.receipts.some(value=>!validId(value,RECEIPT_ID_MAX)||value.length<RECEIPT_ID_MIN))return false;
 return new Set(wallet.receipts).size===wallet.receipts.length&&receiptLedgerBytes(wallet.receipts)<=MAX_RECEIPT_LEDGER_BYTES;
}
function create(storage,options={}){
 let state=null,blocked='Token wallet is loading.',writeBlocked=false;
 const persistence=createEconomyStore({storage,indexedDB:options.indexedDB,validateLegacy:value=>value?.schema===1&&validWallet(value),validateWallet:validWallet,BroadcastChannelImpl:options.BroadcastChannel,onChange:value=>{if(state&&value){state=value;blocked=null;writeBlocked=false;}},maxReceipts:MAX_RECEIPTS_V2,maxReceiptBytes:MAX_RECEIPT_LEDGER_BYTES,receiptStorageBytes,maxUnlocks:MAX_UNLOCKS});
 const ready=persistence.ready.then(result=>{
  if(!result.ok){blocked=result.error;writeBlocked=true;state=null;return Object.freeze({ok:false,error:blocked});}
  state=result.wallet;blocked=null;writeBlocked=false;return Object.freeze({ok:true,wallet:wallet()});
 });
 const ensureUsable=()=>{if(!state)throw Error('Token wallet is read-only: '+(blocked||'wallet has not loaded'));};
 function wallet(){return clone(state);}
 function owns(category,id){return !!state&&CATEGORIES.includes(category)&&validId(id,MAX_ITEM_ID_LENGTH)&&state.unlocks.includes(unlockKey(category,id));}
 async function awardCompletedMatch(payload={}){
  await ready;ensureUsable();
  if(!payload||typeof payload!=='object'||Array.isArray(payload))return {ok:false,reason:'invalid-result',reward:0,wallet:wallet()};
  const {receiptId,mode,status,result}=payload;
  if(!validId(receiptId,RECEIPT_ID_MAX)||receiptId.length<RECEIPT_ID_MIN)return {ok:false,reason:'invalid-receipt',reward:0,wallet:wallet()};
  if(!MODES.includes(mode))return {ok:false,reason:'invalid-mode',reward:0,wallet:wallet()};
  if(status!=='completed'||!['win','draw','loss'].includes(result))return {ok:false,reason:'match-not-complete',reward:0,wallet:wallet()};
  const bonus=result==='win'?REWARDS.winBonus:result==='draw'?REWARDS.drawBonus:REWARDS.lossBonus;
  try{
   const saved=await persistence.award(receiptId,{mode,result,reward:REWARDS.completion+bonus});
   state=saved.wallet;blocked=null;writeBlocked=false;
   return {...saved.result,wallet:wallet()};
  }catch(error){blocked=persistence.error||error?.message||'Token wallet could not save this reward';writeBlocked=true;throw Error(blocked);}
 }
 async function purchase(item,catalog){
  await ready;ensureUsable();
  if(!item||typeof item!=='object'||Array.isArray(item)||!CATEGORIES.includes(item.category)||!validId(item.id,MAX_ITEM_ID_LENGTH))
   return {ok:false,reason:'invalid-item',cost:0,wallet:wallet()};
  const found=Array.isArray(catalog)?catalog.find(entry=>entry&&entry.id===item.id&&entry.category===item.category):null;
  if(!found||found.existing!==true||found.availableForPurchase!==true)
   return {ok:false,reason:'not-in-existing-store-catalog',cost:0,wallet:wallet()};
  const cost=PRICES[item.category],key=unlockKey(item.category,item.id);
  if(state.unlocks.includes(key))return {ok:false,reason:'already-owned',cost:0,wallet:wallet()};
  if(state.tokens<cost)return {ok:false,reason:'insufficient-tokens',cost,wallet:wallet()};
  if(state.unlocks.length>=MAX_UNLOCKS)return {ok:false,reason:'unlock-capacity',cost:0,wallet:wallet()};
  try{
   const saved=await persistence.purchase({category:item.category,id:item.id,cost});
   state=saved.wallet;blocked=null;writeBlocked=false;
   return {...saved.result,wallet:wallet()};
  }catch(error){blocked=persistence.error||error?.message||'Token wallet could not save this purchase';writeBlocked=true;throw Error(blocked);}
 }
 async function exportWallet(){await ready;ensureUsable();const result=await persistence.exportWallet();state=result;return clone(result);}
 async function importWallet(value){
  await ready;if(!validWallet(value))throw Error('Invalid token wallet');
  try{state=await persistence.importWallet(value);blocked=null;writeBlocked=false;return wallet();}
  catch(error){blocked=persistence.error||error?.message||'Token wallet import failed';writeBlocked=true;throw Error(blocked);}
 }
 async function retry(){
  try{
   const result=await persistence.retry();
   if(result?.ok&&result.wallet){state=result.wallet;blocked=null;writeBlocked=false;return Object.freeze({ok:true,wallet:wallet()});}
   blocked=result?.error||persistence.error||'Token wallet remains unavailable';writeBlocked=true;
   return Object.freeze({ok:false,error:blocked});
  }catch(error){blocked=error?.message||'Token wallet remains unavailable';writeBlocked=true;return Object.freeze({ok:false,error:blocked});}
 }
 return Object.freeze({get error(){return blocked;},get readOnly(){return !state||writeBlocked;},ready,wallet,owns,awardCompletedMatch,purchase,exportWallet,importWallet,retry,close:persistence.close});
}
return Object.freeze({KEY,MAX_TOKENS,MAX_RECEIPTS,MAX_RECEIPTS_V2,MAX_SAVE_EXPORT_BYTES,MAX_UNLOCKS,CATEGORIES,MODES,REWARDS,PRICES,TOKEN_PACKS_ENABLED,emptyWallet,emptyCurrentWallet,validWallet,create});
})();
export {ECONOMY};
