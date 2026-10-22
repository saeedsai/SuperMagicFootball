// SAVE-102: independent, atomic, local-only Cup slots. Legacy save is never deleted during migration.
const CUP_SLOTS=(()=>{
const KEY='legend_cupSlots',COUNT=10;
const clone=x=>JSON.parse(JSON.stringify(x));
const slotNumber=n=>Number.isInteger(n)&&n>=1&&n<=COUNT;
const COMPS=new Set(['UEFA','AFC','CAF','CONCACAF','CONMEBOL','OFC']);
const validTournament=t=>Boolean(t&&typeof t==='object'&&!Array.isArray(t)&&
 COMPS.has(t.compId)&&t.id==='cup_'+t.compId&&Number.isInteger(t.club)&&
 Array.isArray(t.participants)&&t.participants.length>=4&&t.participants.length<=64&&
 t.participants.every(n=>Number.isInteger(n)&&n>=0)&&new Set(t.participants).size===t.participants.length&&
 t.participants.includes(t.club)&&['league','knockout','finished'].includes(t.phase)&&
 Number.isInteger(t.roundIdx)&&t.roundIdx>=0&&t.roundIdx<=100&&
 Array.isArray(t.history)&&t.history.length<=90&&
 Array.isArray(t.rounds)&&Array.isArray(t.groups)&&
 t.table&&typeof t.table==='object'&&!Array.isArray(t.table)&&
 t.participants.every(id=>t.table[id]&&typeof t.table[id]==='object')&&
 Number.isFinite(t.earned)&&t.earned>=0&&
 (t.winner===null||Number.isInteger(t.winner))&&
 (t.knockout===null||(t.knockout&&Array.isArray(t.knockout.matches)&&
 Array.isArray(t.knockout.byes)&&typeof t.knockout.stage==='string'))&&
 (t.phase!=='knockout'||t.knockout!==null));
const validVault=v=>Boolean(v&&v.schema===1&&slotNumber(v.active)&&
 Array.isArray(v.slots)&&v.slots.length===COUNT&&v.slots.every(s=>s===null||
 (s&&typeof s.name==='string'&&s.name.length>0&&s.name.length<=60&&
 typeof s.savedAt==='string'&&!Number.isNaN(Date.parse(s.savedAt))&&
 validTournament(s.tournament))));
const empty=()=>({schema:1,active:1,slots:Array(COUNT).fill(null)});
function create(storage){
 let state=empty(),blocked=null,exists=false;
 try{const raw=storage.getItem(KEY);exists=raw!==null;
  if(exists){state=JSON.parse(raw);if(!validVault(state))throw Error('Invalid Cup save-slot structure');}
 }catch(error){blocked=error;state=empty();}
 const check=()=>{if(blocked)throw Error('Cup slots cannot be modified: '+blocked.message+'. Export a backup before recovery.');};
 const get=n=>{if(!slotNumber(n))throw Error('Cup slot must be 1–10');return state.slots[n-1];};
 function persist(next){check();if(!validVault(next))throw Error('Invalid Cup save-slot update');
  const raw=JSON.stringify(next),previous=storage.getItem(KEY);
  try{
   storage.setItem(KEY,raw);
   if(storage.getItem(KEY)!==raw)throw Error('Cup slots were not retained by storage');
  }catch(error){
   // Restore previous bytes even when a storage adapter writes before throwing.
   try{
    if(previous===null)storage.removeItem(KEY);else storage.setItem(KEY,previous);
    if(storage.getItem(KEY)!==previous)throw Error('previous Cup save bytes were not restored');
   }catch(rollbackError){
    blocked=Error('Cup save rollback failed: '+rollbackError.message);
    throw Error('Cup save failed and rollback failed: '+error.message+'; rollback: '+rollbackError.message);
   }
   throw error;
  }
  state=next;exists=true;
 }
 function save(n,tournament,name){check();get(n);if(!validTournament(tournament))throw Error('Cannot save an invalid Cup campaign');
  const prior=get(n),label=String(name??prior?.name??('Cup '+n)).trim().slice(0,60)||('Cup '+n);
  const next=clone(state);next.active=n;next.slots[n-1]={name:label,savedAt:new Date().toISOString(),tournament:clone(tournament)};
  persist(next);return clone(next.slots[n-1]);
 }
 function load(n,validator){check();const slot=get(n);if(!slot)throw Error('Cup slot '+n+' is empty');
  if(validator!==undefined&&typeof validator!=='function')throw Error('Cup load validator must be a function');
  // Validate before changing the active slot. A validator cannot mutate saved or returned data.
  const tournament=clone(slot.tournament);
  if(validator&&!validator(clone(tournament)))throw Error('Cup save refers to unavailable teams');
  if(state.active!==n)persist({...state,active:n});return tournament;
 }
 function duplicate(n){check();const source=get(n);if(!source)throw Error('Cup slot '+n+' is empty');
  const index=state.slots.findIndex(s=>s===null);
  if(index<0)throw Error('All ten Cup save slots are occupied');
  const next=clone(state);
  next.slots[index]={name:(source.name+' (copy)').slice(0,60),savedAt:new Date().toISOString(),tournament:clone(source.tournament)};
  // Copying a campaign must neither overwrite another slot nor switch the active one.
  persist(next);return index+1;
 }
 function remove(n){check();if(!get(n))throw Error('Cup slot '+n+' is empty');
  const next=clone(state);next.slots[n-1]=null;persist(next);
 }

 // SAVE-103 backup transport deliberately changes no save schema or stored slot on export.
 // The backup payload is checked before any imported data is committed.
 function exportBackup(){
  check();
  const payload=JSON.stringify(state);
  let checksum=2166136261;
  for(let i=0;i<payload.length;i++){checksum^=payload.charCodeAt(i);checksum=Math.imul(checksum,16777619)>>>0;}
  return JSON.stringify({format:'smf-cup-backup',version:1,payload,checksum:checksum.toString(16).padStart(8,'0')});
 }
 function importBackup(text,{overwrite=false,validator}={}){
  check();
  if(typeof text!=='string'||text.length>2000000)throw Error('Cup backup must be text under 2 MB');
  let envelope;
  try{envelope=JSON.parse(text);}catch{throw Error('Invalid Cup backup JSON');}
  if(!envelope||envelope.format!=='smf-cup-backup'||envelope.version!==1||
   typeof envelope.payload!=='string'||!/^[0-9a-f]{8}$/.test(envelope.checksum||''))
   throw Error('Unsupported Cup backup format');
  let checksum=2166136261;
  for(let i=0;i<envelope.payload.length;i++){checksum^=envelope.payload.charCodeAt(i);checksum=Math.imul(checksum,16777619)>>>0;}
  if(checksum.toString(16).padStart(8,'0')!==envelope.checksum)throw Error('Cup backup integrity check failed');
  let restored;
  try{restored=JSON.parse(envelope.payload);}catch{throw Error('Cup backup payload is not JSON');}
  if(!validVault(restored))throw Error('Invalid Cup backup slots or tournament data');
  if(validator!==undefined&&typeof validator!=='function')throw Error('Cup backup validator must be a function');
  if(validator&&restored.slots.some(slot=>slot&&!validator(clone(slot.tournament))))throw Error('Cup backup refers to unavailable teams');
  if(!overwrite&&state.slots.some(s=>s!==null))throw Error('Cup slots contain data; explicitly confirm overwrite');
  persist(clone(restored));
  return state.slots.filter(Boolean).length;
 }
 function importLegacy(tournament){check();if(exists||!validTournament(tournament))return false;
  save(1,tournament,'Imported legacy Cup');return true;
 }
 return {get active(){return state.active},get error(){return blocked?.message||null},
  get hasVault(){return exists},
  list:()=>state.slots.map((s,i)=>({number:i+1,active:state.active===i+1,
   name:s?.name||'',savedAt:s?.savedAt||'',compId:s?.tournament?.compId??null,
   club:s?.tournament?.club??null,phase:s?.tournament?.phase??null,
   roundIdx:s?.tournament?.roundIdx??null,occupied:Boolean(s)})),
  firstEmpty:()=>{const i=state.slots.findIndex(s=>s===null);return i<0?null:i+1;},
  activeTournament:()=>blocked?null:(get(state.active)?clone(get(state.active).tournament):null),
  save,load,duplicate,remove,importLegacy,exportBackup,importBackup};
}
return {create,validTournament,validVault};
})();
export {CUP_SLOTS};
