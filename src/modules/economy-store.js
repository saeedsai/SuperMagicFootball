// Durable local token wallet. Wallet metadata and exact match receipt keys live
// in the same IndexedDB database so reward idempotency is transactional across
// tabs. The legacy localStorage record is retained as a migration/backup source.
const DB_NAME='smf-token-wallet';
const DB_VERSION=1;
const WALLET_STORE='wallet';
const RECEIPT_STORE='receipts';
const WALLET_ID='main';

const storeClone=value=>JSON.parse(JSON.stringify(value));
function requestValue(request){return new Promise((resolve,reject)=>{
 request.onsuccess=()=>resolve(request.result);
 request.onerror=()=>reject(request.error||Error('IndexedDB request failed'));
});}
function transactionDone(transaction){return new Promise((resolve,reject)=>{
 transaction.oncomplete=()=>resolve();
 transaction.onabort=()=>reject(transaction.error||Error('IndexedDB transaction aborted'));
 transaction.onerror=()=>reject(transaction.error||Error('IndexedDB transaction failed'));
});}
function idbError(error){return error?.name==='QuotaExceededError'?'Token wallet storage is full. Free browser storage, then retry.':`Token wallet storage is unavailable: ${error?.message||'IndexedDB failed'}`;}

function openDatabase(indexedDB){
 if(!indexedDB||typeof indexedDB.open!=='function')return Promise.reject(Error('IndexedDB is unavailable on this browser'));
 return new Promise((resolve,reject)=>{
  let settled=false;
  let request;
  try{request=indexedDB.open(DB_NAME,DB_VERSION)}catch(error){reject(error);return;}
  request.onupgradeneeded=()=>{
   const db=request.result;
   if(!db.objectStoreNames.contains(WALLET_STORE))db.createObjectStore(WALLET_STORE,{keyPath:'id'});
   if(!db.objectStoreNames.contains(RECEIPT_STORE))db.createObjectStore(RECEIPT_STORE,{keyPath:'id'});
  };
  request.onsuccess=()=>{if(settled){try{request.result.close()}catch{};return;}settled=true;resolve(request.result);};
  request.onerror=()=>{if(settled)return;settled=true;reject(request.error||Error('Could not open wallet database'));};
  request.onblocked=()=>{if(settled)return;settled=true;reject(Error('Wallet database upgrade is blocked by another open game tab. Close the older tab and retry.'));};
 });
}

function createEconomyStore({storage,indexedDB=globalThis.indexedDB,validateLegacy,validateWallet,BroadcastChannelImpl=globalThis.BroadcastChannel,onChange=()=>{},maxReceipts=Infinity,maxReceiptBytes=Infinity,receiptStorageBytes=id=>new TextEncoder().encode(JSON.stringify(id)).byteLength+10,maxUnlocks=Infinity}={}){
 let db=null,blocked=null,cache=null,receiptsCount=0,closed=false;
 const channel=typeof BroadcastChannelImpl==='function'?new BroadcastChannelImpl('smf-token-wallet-v2'):null;
 const notify=()=>{try{channel?.postMessage({type:'wallet-changed'})}catch{}};
 const onMessage=event=>{if(event?.data?.type==='wallet-changed')void refresh().then(value=>onChange(storeClone(value))).catch(()=>{});};
 channel?.addEventListener?.('message',onMessage);

 function ensureDb(){if(closed||!db)throw Error(blocked||'Token wallet storage is closed');}
 async function readSnapshot(){
  ensureDb();
  const tx=db.transaction([WALLET_STORE,RECEIPT_STORE],'readonly'),done=transactionDone(tx);
  const [row,rows]=await Promise.all([
   requestValue(tx.objectStore(WALLET_STORE).get(WALLET_ID)),
   requestValue(tx.objectStore(RECEIPT_STORE).getAll())
  ]);
  await done;
  if(!row)return null;
  const wallet={schema:2,tokens:row.tokens,unlocks:row.unlocks,receipts:rows.map(receipt=>receipt.id)};
  if(!Number.isSafeInteger(row.receiptBytes))row.receiptBytes=rows.reduce((bytes,receipt)=>bytes+receiptStorageBytes(receipt.id),0);
  if(typeof validateWallet==='function'&&!validateWallet(wallet))throw Error('Stored wallet data failed validation');
  receiptsCount=rows.length;cache=wallet;
  return storeClone(wallet);
 }
 async function refresh(){return await readSnapshot();}

 async function initialize(){
  try{
   db=await openDatabase(indexedDB);
   db.onversionchange=()=>{try{db.close()}catch{};db=null;blocked='Wallet storage changed in another tab. Reload the game to reconnect.';};
   // Read and validate the old record before starting the atomic migration. It
   // is intentionally never deleted: an interrupted migration can be retried.
   let legacy=null;
   let raw;
   try{raw=storage?.getItem?.('legend_tokenWallet')??null;}catch(error){throw Error('Legacy wallet could not be read: '+error.message)}
   if(raw!==null){
    try{legacy=JSON.parse(raw)}catch(error){throw Error('Invalid legacy wallet JSON: '+error.message)}
    if(typeof validateLegacy==='function'&&!validateLegacy(legacy))throw Error('Invalid legacy wallet structure');
   }
   const migration={schema:2,tokens:legacy?.tokens??0,unlocks:legacy?.unlocks??[],receipts:legacy?.receipts??[]};
   const tx=db.transaction([WALLET_STORE,RECEIPT_STORE],'readwrite'),done=transactionDone(tx);
   const wallets=tx.objectStore(WALLET_STORE),receiptStore=tx.objectStore(RECEIPT_STORE);
   let migrated=false;
   const existing=wallets.get(WALLET_ID);
   existing.onsuccess=()=>{
    if(existing.result)return;
    migrated=true;
    wallets.add({id:WALLET_ID,schema:2,tokens:migration.tokens,unlocks:migration.unlocks,receiptBytes:migration.receipts.reduce((bytes,id)=>bytes+receiptStorageBytes(id),0)});
    for(const id of migration.receipts)receiptStore.add({id});
   };
   await done;
   const verified=await readSnapshot();
   if(!verified||migrated&&(verified.tokens!==migration.tokens||JSON.stringify(verified.unlocks)!==JSON.stringify(migration.unlocks)||
      verified.receipts.length!==migration.receipts.length||verified.receipts.some((id,index)=>!migration.receipts.includes(id))))
    throw Error('Wallet migration could not be verified');
   blocked=null;
   return {ok:true,wallet:verified};
  }catch(error){
   blocked=idbError(error);
   cache=null;receiptsCount=0;
   try{db?.close()}catch{};db=null;
   return {ok:false,error:blocked,wallet:null};
  }
 }
 let ready=initialize();

 async function transaction(work){
  await ready;ensureDb();
  return await new Promise((resolve,reject)=>{
   let tx,result,failure=false;
   try{tx=db.transaction([WALLET_STORE,RECEIPT_STORE],'readwrite');}catch(error){blocked=idbError(error);reject(error);return;}
   const wallets=tx.objectStore(WALLET_STORE),receiptStore=tx.objectStore(RECEIPT_STORE);
   const fail=error=>{failure=true;blocked=idbError(error);try{tx.abort()}catch{};};
   const setResult=value=>{result=value;};
   tx.oncomplete=async()=>{
    if(failure)return;
    try{const state=await readSnapshot();if(!state)throw Error('Token wallet disappeared after commit');blocked=null;onChange(storeClone(state));notify();resolve({result,wallet:state});}
    catch(error){blocked=idbError(error);reject(error);}
   };
   tx.onabort=()=>{blocked=blocked||idbError(tx.error);reject(tx.error||Error(blocked));};
   tx.onerror=()=>{blocked=blocked||idbError(tx.error);};
   // Work handlers set `result` before the transaction completes.
   Object.defineProperty(tx,'__smfSetResult',{value:setResult});
   try{work(tx,{wallets,receiptStore,fail});}
   catch(error){failure=true;blocked=idbError(error);try{tx.abort()}catch{};reject(error);}
  });
 }

 async function award(receiptId,{mode,result,reward}={}){
  return await transaction((tx,stores)=>{
    const {wallets,receiptStore,fail}=stores;
   const walletReq=wallets.get(WALLET_ID);
   walletReq.onsuccess=()=>{
    const row=walletReq.result;
    if(!row){fail(Error('Token wallet record is missing'));return;}
    const receiptReq=receiptStore.get(receiptId);
    receiptReq.onsuccess=()=>{
     if(receiptReq.result){tx.__smfSetResult({ok:false,duplicate:true,reason:'duplicate-receipt',reward:0});return;}
      const countReq=receiptStore.count();
      countReq.onsuccess=()=>{
       const commit=current=>{
        const size=receiptStorageBytes(receiptId);
        if(countReq.result>=maxReceipts||current+size>maxReceiptBytes){tx.__smfSetResult({ok:false,reason:'receipt-capacity',reward:0});return;}
        const amount=Math.min(reward,999999-row.tokens);
        row.tokens+=amount;row.receiptBytes=current+size;
        try{wallets.put(row);receiptStore.add({id:receiptId,mode,result});tx.__smfSetResult({ok:true,duplicate:false,mode,result,reward:amount});}
        catch(error){fail(error);}
       };
       if(Number.isSafeInteger(row.receiptBytes)){commit(row.receiptBytes);return;}
       const rowsReq=receiptStore.getAll();
       rowsReq.onsuccess=()=>commit(rowsReq.result.reduce((bytes,receipt)=>bytes+receiptStorageBytes(receipt.id),0));
       rowsReq.onerror=()=>fail(rowsReq.error||Error('Receipt ledger lookup failed'));
      };
     countReq.onerror=()=>fail(countReq.error||Error('Receipt count failed'));
    };
    receiptReq.onerror=()=>fail(receiptReq.error||Error('Receipt lookup failed'));
   };
   walletReq.onerror=()=>fail(walletReq.error||Error('Wallet lookup failed'));
  });
 }

 async function purchase({category,id,cost}){
  return await transaction((tx,stores)=>{
   const {wallets,fail}=stores,request=wallets.get(WALLET_ID);
   request.onsuccess=()=>{
    const row=request.result;if(!row){fail(Error('Token wallet record is missing'));return;}
    const key=`${category}:${id}`;
    if(row.unlocks.includes(key)){tx.__smfSetResult({ok:false,reason:'already-owned',cost:0});return;}
    if(row.tokens<cost){tx.__smfSetResult({ok:false,reason:'insufficient-tokens',cost});return;}
    if(row.unlocks.length>=maxUnlocks){tx.__smfSetResult({ok:false,reason:'unlock-capacity',cost:0});return;}
    row.tokens-=cost;row.unlocks.push(key);
    try{wallets.put(row);tx.__smfSetResult({ok:true,reason:'purchased',cost});}catch(error){fail(error);}
   };
   request.onerror=()=>fail(request.error||Error('Wallet lookup failed'));
  });
 }

 async function importWallet(wallet){
  if(typeof validateWallet==='function'&&!validateWallet(wallet))throw Error('Invalid token wallet');
  await ready;ensureDb();
  const tx=db.transaction([WALLET_STORE,RECEIPT_STORE],'readwrite'),done=transactionDone(tx);
  const wallets=tx.objectStore(WALLET_STORE),receiptStore=tx.objectStore(RECEIPT_STORE);
  receiptStore.clear();wallets.put({id:WALLET_ID,schema:2,tokens:wallet.tokens,unlocks:wallet.unlocks.slice(),receiptBytes:wallet.receipts.reduce((bytes,id)=>bytes+receiptStorageBytes(id),0)});
  for(const id of wallet.receipts)receiptStore.add({id});
  await done;
  const verified=await readSnapshot();
  if(!verified||verified.tokens!==wallet.tokens||JSON.stringify(verified.unlocks)!==JSON.stringify(wallet.unlocks)||
    verified.receipts.length!==wallet.receipts.length||verified.receipts.some(id=>!wallet.receipts.includes(id)))throw Error('Imported wallet could not be verified');
  blocked=null;onChange(storeClone(verified));notify();return verified;
 }

 async function exportWallet(){await ready;ensureDb();return await readSnapshot();}
 async function retry(){
  if(!db){blocked=null;ready=initialize();return await ready;}
  try{
   const tx=db.transaction([WALLET_STORE],'readwrite'),done=transactionDone(tx),store=tx.objectStore(WALLET_STORE),request=store.get(WALLET_ID);
   request.onsuccess=()=>{if(request.result)store.put(request.result);};
   await done;
   const wallet=await readSnapshot();blocked=null;return {ok:true,wallet};
  }catch(error){blocked=idbError(error);return {ok:false,error:blocked,wallet:cache?storeClone(cache):null};}
 }
 function close(){closed=true;try{channel?.removeEventListener?.('message',onMessage);channel?.close?.()}catch{};try{db?.close()}catch{};db=null;}
 return Object.freeze({ready,refresh,award,purchase,importWallet,exportWallet,retry,close,get error(){return blocked;},get receiptsCount(){return receiptsCount;}});
}

export {createEconomyStore};
