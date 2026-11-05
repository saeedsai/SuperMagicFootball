// SAVE-102: independent, atomic, local-only Cup slots. Legacy save is never deleted during migration.
const CUP_SLOTS=(()=>{
const KEY='legend_cupSlots',COUNT=10;
const clone=x=>JSON.parse(JSON.stringify(x));
const slotNumber=n=>Number.isInteger(n)&&n>=1&&n<=COUNT;
const labelKey=name=>name.trim().normalize('NFKC').toLowerCase();
// Slot labels are capped in UTF-16 code units; never split an emoji/supplementary character.
const limitLabel=(text,max)=>{let result='';for(const point of text){if(result.length+point.length>max)break;result+=point;}return result;};
const COMPS=new Set(['UEFA','AFC','CAF','CONCACAF','CONMEBOL','OFC']);
const CUP_TABLE_FIELDS=['p','w','d','l','gf','ga','pts'];
const validCupTableRow=row=>{
 if(!row||typeof row!=='object'||Array.isArray(row))return false;
 const present=CUP_TABLE_FIELDS.filter(key=>Object.hasOwn(row,key));
 // Empty rows remain valid for legacy/placeholder saves; once a standings row
 // has data, require its complete schema before checking arithmetic consistency.
 if(present.length!==0&&present.length!==CUP_TABLE_FIELDS.length)return false;
 if(present.some(key=>!Number.isSafeInteger(row[key])||row[key]<0))return false;
 return present.length!==CUP_TABLE_FIELDS.length||
  row.p===row.w+row.d+row.l&&row.pts===row.w*3+row.d;
};
const validCupHistoryRow=(row,participants)=>{
 if(!row||typeof row!=='object'||Array.isArray(row))return false;
 if(row.kind==='bye')return typeof row.stage==='string'&&row.stage.trim().length>0&&
  Number.isSafeInteger(row.winner)&&participants.has(row.winner);
 if(!Number.isSafeInteger(row.a)||!Number.isSafeInteger(row.b)||row.a===row.b||
  !participants.has(row.a)||!participants.has(row.b)||
  !Number.isSafeInteger(row.scoreA)||row.scoreA<0||row.scoreA>999||
  !Number.isSafeInteger(row.scoreB)||row.scoreB<0||row.scoreB>999)return false;
 if(row.kind==='league')return Number.isSafeInteger(row.round)&&row.round>=1&&row.round<=100;
 return row.kind==='knockout'&&typeof row.stage==='string'&&row.stage.trim().length>0&&
  Number.isSafeInteger(row.winner)&&(row.winner===row.a||row.winner===row.b);
};
const validCupLeagueRounds=t=>{
 if(t.phase!=='league'||t.rounds.length===0||t.rounds.every(round=>Array.isArray(round)&&round.length===0))return true;
 const participants=new Set(t.participants);
 const groups=t.groups.length?t.groups:[t.participants];
 return t.rounds.every(round=>{
  if(!Array.isArray(round))return false;
  const played=new Set();
  if(!round.every(pair=>{
   if(!Array.isArray(pair)||pair.length!==2||pair[0]===pair[1])return false;
   for(const id of pair){if(!participants.has(id)||played.has(id))return false;played.add(id);}
   return true;
  }))return false;
  return groups.every(group=>group.reduce((count,id)=>count+(played.has(id)?1:0),0)===group.length-group.length%2);
 });
};
const validCupGroups=t=>{
 // Empty grouping metadata is retained for legacy/placeholder saves. When a
 // campaign does contain groups, they must form an exact participant partition
 // and every scheduled league fixture must stay within one group.
 if(t.groups.length===0)return true;
 const participants=new Set(t.participants),assigned=new Set(),groupFor=new Map();
 for(let groupIndex=0;groupIndex<t.groups.length;groupIndex++){
  const group=t.groups[groupIndex];if(!Array.isArray(group)||group.length===0)return false;
  for(const id of group){if(!participants.has(id)||assigned.has(id))return false;assigned.add(id);groupFor.set(id,groupIndex);}
 }
 if(assigned.size!==participants.size)return false;
 if(t.phase==='league')for(const round of t.rounds){if(!Array.isArray(round))return false;for(const pair of round){if(!Array.isArray(pair)||pair.length!==2)return false;const [a,b]=pair;if(groupFor.get(a)!==groupFor.get(b))return false;}}
 return true;
};
const validCupBracket=t=>{
 if(t.knockout===null)return t.phase!=='knockout';
 const bracket=t.knockout,participants=new Set(t.participants);
 if(!bracket||typeof bracket!=='object'||Array.isArray(bracket)||!Array.isArray(bracket.matches)||
  !Array.isArray(bracket.byes)||typeof bracket.stage!=='string'||!bracket.stage.trim())return false;
 const active=new Set();
 for(const id of bracket.byes){if(!participants.has(id)||active.has(id))return false;active.add(id);}
 for(const pair of bracket.matches){
  if(!Array.isArray(pair)||pair.length!==2||pair[0]===pair[1]||!pair.every(id=>participants.has(id))||pair.some(id=>active.has(id)))return false;
  for(const id of pair)active.add(id);
 }
 return t.phase!=='knockout'||Number.isInteger(t.roundIdx)&&t.roundIdx>=0&&active.has(t.club);
};
const validCupLeagueCursor=t=>t.phase!=='league'||t.rounds.length===0||t.roundIdx<t.rounds.length;
const validTournament=t=>Boolean(t&&typeof t==='object'&&!Array.isArray(t)&&
 COMPS.has(t.compId)&&t.id==='cup_'+t.compId&&Number.isInteger(t.club)&&
 Array.isArray(t.participants)&&t.participants.length>=4&&t.participants.length<=64&&
 t.participants.every(n=>Number.isSafeInteger(n)&&n>=0)&&new Set(t.participants).size===t.participants.length&&
 t.participants.includes(t.club)&&['league','knockout','finished'].includes(t.phase)&&
 Number.isInteger(t.roundIdx)&&t.roundIdx>=0&&t.roundIdx<=100&&
 Array.isArray(t.history)&&t.history.length<=90&&t.history.every(row=>validCupHistoryRow(row,new Set(t.participants)))&&
 Array.isArray(t.rounds)&&Array.isArray(t.groups)&&validCupGroups(t)&&
 t.table&&typeof t.table==='object'&&!Array.isArray(t.table)&&
 t.participants.every(id=>validCupTableRow(t.table[id]))&&
 Number.isFinite(t.earned)&&t.earned>=0&&
 (t.winner===null||(Number.isInteger(t.winner)&&t.participants.includes(t.winner)))&&
 (t.phase==='finished'||t.winner===null)&&
 validCupBracket(t)&&validCupLeagueCursor(t)&&validCupLeagueRounds(t));
const validVault=v=>Boolean(v&&v.schema===1&&slotNumber(v.active)&&
 Array.isArray(v.slots)&&v.slots.length===COUNT&&v.slots.every(s=>s===null||
 (s&&typeof s.name==='string'&&s.name.length>0&&s.name.length<=60&&
 typeof s.savedAt==='string'&&!Number.isNaN(Date.parse(s.savedAt))&&
 validTournament(s.tournament))));
const empty=()=>({schema:1,active:1,slots:Array(COUNT).fill(null)});
function create(storage){
 let state=empty(),blocked=null,exists=false,recoverySnapshot=null,sessionOnly=false,baselineRaw=null;
 let raw;
 try{raw=storage.getItem(KEY);baselineRaw=raw;}
 catch{sessionOnly=true;}
 // A denied read (for example, a privacy-restricted origin) is different from
 // readable but corrupt save data. Keep the former playable in this page's
 // memory; fail closed for the latter so it can be exported/repaired safely.
 if(!sessionOnly){
  exists=raw!==null;
  if(exists){try{state=JSON.parse(raw);if(!validVault(state))throw Error('Invalid Cup save-slot structure');}
   catch(error){blocked=error;state=empty();}}
 }
 const check=()=>{if(blocked)throw Error('Cup slots cannot be modified: '+blocked.message+'. Export a backup before recovery.');};
 const get=n=>{if(!slotNumber(n))throw Error('Cup slot must be 1–10');return state.slots[n-1];};
 function persist(next){check();if(!validVault(next))throw Error('Invalid Cup save-slot update');
  if(sessionOnly){state=next;exists=true;return;}
  const raw=JSON.stringify(next),previous=storage.getItem(KEY);
  // Local storage is shared between tabs while this vault's state is a
  // per-tab snapshot. Never let an older tab silently replace a newer Cup
  // save or backup import that it did not read.
  if(previous!==baselineRaw){
   recoverySnapshot=clone(state);
   blocked=Error('Cup save changed in another tab; export this copy before recovery.');
   throw Error('Cup slots changed elsewhere; reload before saving');
  }
  try{
   storage.setItem(KEY,raw);
   if(storage.getItem(KEY)!==raw)throw Error('Cup slots were not retained by storage');
  }catch(error){
   // Restore previous bytes even when a storage adapter writes before throwing.
   let rollbackError=null;
   try{if(previous===null)storage.removeItem(KEY);else storage.setItem(KEY,previous);}
   catch(restoreError){rollbackError=restoreError;}
   try{
    if(storage.getItem(KEY)!==previous)throw Error('previous Cup save bytes were not restored');
   }catch(verifyError){
     recoverySnapshot=clone(state);
    const detail=rollbackError?rollbackError.message+'; readback: '+verifyError.message:verifyError.message;
    blocked=Error('Cup save rollback failed: '+detail);
    throw Error('Cup save failed and rollback failed: '+error.message+'; rollback: '+detail);
   }
   throw error;
  }
  state=next;exists=true;baselineRaw=raw;
 }
 function save(n,tournament,name){check();get(n);if(!validTournament(tournament))throw Error('Cannot save an invalid Cup campaign');
  const prior=get(n),label=limitLabel(String(name??prior?.name??('Cup '+n)).trim(),60)||('Cup '+n);
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
  let copyNumber=1,label;
  do{
   const suffix=copyNumber===1?' (copy)':` (copy ${copyNumber})`;
   const base=limitLabel(source.name.trim(),60-suffix.length).trimEnd()||('Cup '+n);
   label=base+suffix;copyNumber++;
  }while(state.slots.some(slot=>slot&&labelKey(slot.name)===labelKey(label)));
  next.slots[index]={name:label,savedAt:new Date().toISOString(),tournament:clone(source.tournament)};
  // Copying a campaign must neither overwrite another slot nor switch the active one.
  persist(next);return index+1;
 }
 function remove(n){check();if(!get(n))throw Error('Cup slot '+n+' is empty');
  const next=clone(state);next.slots[n-1]=null;persist(next);
 }

 // SAVE-103 backup transport deliberately changes no save schema or stored slot on export.
 // The backup payload is checked before any imported data is committed.
 function encodeBackup(vault){
  const payload=JSON.stringify(vault);
  let checksum=2166136261;
  for(let i=0;i<payload.length;i++){checksum^=payload.charCodeAt(i);checksum=Math.imul(checksum,16777619)>>>0;}
  return JSON.stringify({format:'smf-cup-backup',version:1,payload,checksum:checksum.toString(16).padStart(8,'0')});
 }
 function exportBackup(){
  if(blocked&&!recoverySnapshot)check();
  return encodeBackup(recoverySnapshot||state);
 }
 function parseBackup(text,validator){
  check();
  if(typeof text!=='string'||text.length>2000000)throw Error('Cup backup must be text under 2 MB');
  let envelope;
  try{envelope=JSON.parse(text);}catch{throw Error('Invalid Cup backup JSON');}
  if(!envelope||envelope.format!=='smf-cup-backup'||envelope.version!==1||
   typeof envelope.payload!=='string'||envelope.payload.length>2000000||!/^[0-9a-f]{8}$/.test(envelope.checksum||''))
   throw Error('Unsupported Cup backup format');
  let checksum=2166136261;
  for(let i=0;i<envelope.payload.length;i++){checksum^=envelope.payload.charCodeAt(i);checksum=Math.imul(checksum,16777619)>>>0;}
  if(checksum.toString(16).padStart(8,'0')!==envelope.checksum)throw Error('Cup backup integrity check failed');
  let restored;
  try{restored=JSON.parse(envelope.payload);}catch{throw Error('Cup backup payload is not JSON');}
  if(!validVault(restored))throw Error('Invalid Cup backup slots or tournament data');
  if(validator!==undefined&&typeof validator!=='function')throw Error('Cup backup validator must be a function');
  if(validator&&restored.slots.some(slot=>slot&&!validator(clone(slot.tournament))))throw Error('Cup backup refers to unavailable teams');
  return restored;
 }
 function inspectBackup(text,validator){
  const restored=parseBackup(text,validator);
  return {active:restored.active,occupied:restored.slots.filter(Boolean).length,
   slots:restored.slots.flatMap((item,i)=>item?[{number:i+1,name:item.name,compId:item.tournament.compId,club:item.tournament.club}]:[])};
 }
 function importBackup(text,options={}){
  if(!options||typeof options!=='object'||Array.isArray(options))throw Error('Cup backup options must be an object');
  const {overwrite=false,validator}=options;
  if(typeof overwrite!=='boolean')throw Error('Cup backup overwrite confirmation must be boolean');
  const restored=parseBackup(text,validator);
  if(!overwrite&&state.slots.some(s=>s!==null))throw Error('Cup slots contain data; explicitly confirm overwrite');
  persist(clone(restored));
  return state.slots.filter(Boolean).length;
 }
 function importLegacy(tournament){check();if(exists||!validTournament(tournament))return false;
  save(1,tournament,'Imported legacy Cup');return true;
 }
 return {get active(){return state.active},get error(){return blocked?.message||null},get sessionOnly(){return sessionOnly},
  get hasVault(){return exists},
  get hasRecoverySnapshot(){return recoverySnapshot!==null},
  list:()=>state.slots.map((s,i)=>({number:i+1,active:state.active===i+1,
   name:s?.name||'',savedAt:s?.savedAt||'',compId:s?.tournament?.compId??null,
   club:s?.tournament?.club??null,phase:s?.tournament?.phase??null,
   roundIdx:s?.tournament?.roundIdx??null,occupied:Boolean(s)})),
  firstEmpty:()=>{const i=state.slots.findIndex(s=>s===null);return i<0?null:i+1;},
  activeTournament:()=>blocked?null:(get(state.active)?clone(get(state.active).tournament):null),
  save,load,duplicate,remove,importLegacy,exportBackup,inspectBackup,importBackup};
}
return {create,validTournament,validVault};
})();
export {CUP_SLOTS};
