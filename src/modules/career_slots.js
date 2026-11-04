// Independent, atomic, local-only Career slots. Never discard a legacy save.
const KEY='legend_careerSlots';
const count=10;
const clone=value=>JSON.parse(JSON.stringify(value));
// Copy and rename must use the same visual label uniqueness rule.
const labelKey=name=>name.trim().normalize('NFKC').toLowerCase();
// Slot labels are capped in UTF-16 code units; never split an emoji/supplementary character.
const limitLabel=(text,max)=>{let result='';for(const point of text){if(result.length+point.length>max)break;result+=point;}return result;};
const slotNumber=n=>Number.isInteger(n)&&n>=1&&n<=count;
const validRoster=roster=>Array.isArray(roster)&&roster.length===12&&
 roster.every(player=>player&&typeof player==='object'&&!Array.isArray(player)&&
  ((typeof player.id==='string'&&player.id.trim().length>0)||(Number.isSafeInteger(player.id)&&player.id>=0)))&&
 new Set(roster.map(player=>String(player.id))).size===12;
const validCareer=c=>Boolean(c&&typeof c==='object'&&!Array.isArray(c)&&Number.isInteger(c.club)&&c.club>=0&&
 Array.isArray(c.members)&&c.members.length>0&&c.members.includes(c.club)&&
 c.members.every(id=>Number.isInteger(id)&&id>=0)&&new Set(c.members).size===c.members.length&&
 Array.isArray(c.fixtures)&&Array.isArray(c.history)&&validRoster(c.roster)&&
 c.table&&typeof c.table==='object'&&c.facilities&&typeof c.facilities==='object'&&
 c.cup&&typeof c.cup==='object'&&Number.isFinite(c.cash)&&Number.isSafeInteger(c.week)&&c.week>=0);
const validVault=v=>Boolean(v&&v.schema===1&&slotNumber(v.active)&&Array.isArray(v.slots)&&v.slots.length===count&&v.slots.every(s=>s===null||(s&&typeof s.name==='string'&&s.name.length<=60&&typeof s.savedAt==='string'&&!Number.isNaN(Date.parse(s.savedAt))&&validCareer(s.career))));
// Read-only standings for save-slot previews. Mirror CAREER.standings tie breaks;
// malformed legacy tables simply omit the preview rather than blocking saves.
function leagueSnapshot(c){
 const members=c?.members,table=c?.table;
 if(!Array.isArray(members)||!members.length||!members.includes(c.club)||!table||typeof table!=='object')return null;
 const rows=members.map((id,index)=>{
  const row=table[id];
  if(!row||!['pts','gf','ga'].every(key=>Number.isFinite(row[key])))return null;
  return {id,index,pts:row.pts,gd:row.gf-row.ga,gf:row.gf};
 });
 if(rows.some(row=>row===null))return null;
 rows.sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.index-b.index);
 return {position:rows.findIndex(row=>row.id===c.club)+1,size:rows.length,points:table[c.club].pts};
}
const empty=()=>({schema:1,active:1,slots:Array(count).fill(null)});
function create(storage){
 let state=empty(),blocked=null,exists=false,recoverySnapshot=null;
 try{const raw=storage.getItem(KEY);exists=raw!==null;if(exists){state=JSON.parse(raw);if(!validVault(state))throw Error('Invalid Career save-slot structure');}}
 catch(error){blocked=error;state=empty();}
 const check=()=>{if(blocked)throw Error('Career slots cannot be modified: '+blocked.message+'. Export your saves before recovery.');};
 function persist(next){
  check();if(!validVault(next))throw Error('Invalid Career save-slot update');
  const raw=JSON.stringify(next),previous=storage.getItem(KEY);
  try{
   storage.setItem(KEY,raw);
   if(storage.getItem(KEY)!==raw)throw Error('Career slots were not retained by storage');
  }catch(error){
   // Restore previous bytes even for a storage adapter that mutates before throwing.
   let rollbackError=null;
   try{if(previous===null)storage.removeItem(KEY);else storage.setItem(KEY,previous);}
   catch(restoreError){rollbackError=restoreError;}
   try{
    if(storage.getItem(KEY)!==previous)throw Error('previous Career save bytes were not restored');
   }catch(verifyError){
    recoverySnapshot=clone(state);
    const detail=rollbackError?rollbackError.message+'; readback: '+verifyError.message:verifyError.message;
    blocked=Error('Career save rollback failed: '+detail);
    throw Error('Career save failed and rollback failed: '+error.message+'; rollback: '+detail);
   }
   throw error;
  }
  state=next;exists=true;
 }
 const get=n=>{if(!slotNumber(n))throw Error('Career slot must be 1–10');return state.slots[n-1];};
 function save(n,career,name){check();get(n);if(!validCareer(career))throw Error('Cannot save an invalid Career');const previous=get(n),label=limitLabel(String(name??previous?.name??('Career '+n)).trim(),60)||('Career '+n);const next=clone(state);next.active=n;next.slots[n-1]={name:label,savedAt:new Date().toISOString(),career:clone(career)};persist(next);return clone(next.slots[n-1]);}
 function load(n,validator){check();const slot=get(n);if(!slot)throw Error('Career slot '+n+' is empty');
  if(validator!==undefined&&typeof validator!=='function')throw Error('Career load validator must be a function');
  const career=clone(slot.career);
  if(validator&&!validator(clone(career)))throw Error('Career save refers to unavailable teams');
  persist({...state,active:n});return career;
 }
 // Copy a saved Career without changing the active game or overwriting another slot.
 function duplicate(n){check();const source=get(n);if(!source)throw Error('Career slot '+n+' is empty');
  const index=state.slots.findIndex(s=>s===null);
  if(index<0)throw Error('All ten Career save slots are occupied');
  const next=clone(state);
  // Keep the copy suffix visible even for 60-character names, and disambiguate repeated copies.
  let copyNumber=1,label;
  do{
   const suffix=copyNumber===1?' (copy)':` (copy ${copyNumber})`;
   const base=limitLabel(source.name.trim(),60-suffix.length).trimEnd()||('Career '+n);
   label=base+suffix;copyNumber++;
  }while(state.slots.some(slot=>slot&&labelKey(slot.name)===labelKey(label)));
  next.slots[index]={name:label,savedAt:new Date().toISOString(),career:clone(source.career)};
  persist(next);return index+1;
 }
 // Rename an occupied slot without loading, overwriting, or touching career progress.
 // The original save timestamp remains the time of the last gameplay save.
 function rename(n,name){
  check();const previous=get(n);
  if(!previous)throw Error('Career slot '+n+' is empty');
  if(typeof name!=='string')throw Error('Career slot name must be text');
  const label=limitLabel(name.trim(),60).trim();
  if(!label)throw Error('Career slot name cannot be empty');
  if(label===previous.name)return clone(previous);
  // Keep slot labels unambiguous after trimming/truncation and Unicode normalization.
  // Existing imported vaults with duplicate labels remain readable and unchanged.
  const candidateKey=labelKey(label);
  if(state.slots.some((slot,index)=>index!==n-1&&slot&&labelKey(slot.name)===candidateKey)){
   throw Error('Another Career slot already uses this name');
  }
  const next=clone(state);
  next.slots[n-1].name=label;
  persist(next);
  return clone(next.slots[n-1]);
 }
 function remove(n){check();if(!get(n))throw Error('Career slot '+n+' is empty');const next=clone(state);next.slots[n-1]=null;persist(next);}
 // SAVE-103 backup transport preserves the save schema and never mutates state on export.
 function encodeBackup(vault){
  const payload=JSON.stringify(vault);
  let checksum=2166136261;
  for(let i=0;i<payload.length;i++){checksum^=payload.charCodeAt(i);checksum=Math.imul(checksum,16777619)>>>0;}
  return JSON.stringify({format:'smf-career-backup',version:1,payload,checksum:checksum.toString(16).padStart(8,'0')});
 }
 function exportBackup(){
  if(blocked&&!recoverySnapshot)check();
  return encodeBackup(recoverySnapshot||state);
 }
 function parseBackup(text,validator){
  check();
  if(typeof text!=='string'||text.length>2000000)throw Error('Career backup must be text under 2 MB');
  let envelope;
  try{envelope=JSON.parse(text);}catch{throw Error('Invalid Career backup JSON');}
  if(!envelope||envelope.format!=='smf-career-backup'||envelope.version!==1||
   typeof envelope.payload!=='string'||envelope.payload.length>2000000||!/^[0-9a-f]{8}$/.test(envelope.checksum||''))
   throw Error('Unsupported Career backup format');
  let checksum=2166136261;
  for(let i=0;i<envelope.payload.length;i++){checksum^=envelope.payload.charCodeAt(i);checksum=Math.imul(checksum,16777619)>>>0;}
  if(checksum.toString(16).padStart(8,'0')!==envelope.checksum)throw Error('Career backup integrity check failed');
  let restored;
  try{restored=JSON.parse(envelope.payload);}catch{throw Error('Career backup payload is not JSON');}
  if(!validVault(restored))throw Error('Invalid Career backup slots or career data');
  if(validator!==undefined&&typeof validator!=='function')throw Error('Career backup validator must be a function');
  if(validator&&restored.slots.some(slot=>slot&&!validator(clone(slot.career))))throw Error('Career backup refers to unavailable teams');
  return restored;
 }
 function inspectBackup(text,validator){
  const restored=parseBackup(text,validator);
  return {active:restored.active,occupied:restored.slots.filter(Boolean).length,
   slots:restored.slots.flatMap((item,i)=>item?[{number:i+1,name:item.name,club:item.career.club,season:item.career.season??null,week:item.career.week}]:[])};
 }
 function importBackup(text,options={}){
  if(!options||typeof options!=='object'||Array.isArray(options))throw Error('Career backup options must be an object');
  const {overwrite=false,validator}=options;
  if(typeof overwrite!=='boolean')throw Error('Career backup overwrite confirmation must be boolean');
  const restored=parseBackup(text,validator);
  if(!overwrite&&state.slots.some(s=>s!==null))throw Error('Career slots contain data; explicitly confirm overwrite');
  persist(clone(restored));
  return state.slots.filter(Boolean).length;
 }
 function importLegacy(career){check();if(exists||!validCareer(career))return false;save(1,career,'Imported legacy Career');return true;}
 return {get active(){return state.active},get error(){return blocked?.message||null},get hasVault(){return exists},get hasRecoverySnapshot(){return recoverySnapshot!==null},list:()=>state.slots.map((s,i)=>{const league=s?leagueSnapshot(s.career):null;return {number:i+1,active:state.active===i+1,name:s?.name||'',savedAt:s?.savedAt||'',club:s?.career?.club??null,season:s?.career?.season??null,week:s?.career?.week??null,leaguePosition:league?.position??null,leagueSize:league?.size??null,leaguePoints:league?.points??null,occupied:Boolean(s)};}),firstEmpty:()=>{const i=state.slots.findIndex(s=>s===null);return i<0?null:i+1;},activeCareer:()=>blocked?null:(get(state.active)?clone(get(state.active).career):null),save,load,duplicate,rename,remove,importLegacy,exportBackup,inspectBackup,importBackup};
}
export const CAREER_SLOTS={create,validCareer,validVault};
