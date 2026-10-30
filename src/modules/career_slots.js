// Independent, atomic, local-only Career slots. Never discard a legacy save.
const KEY='legend_careerSlots';
const count=10;
const clone=value=>JSON.parse(JSON.stringify(value));
// Copy and rename must use the same visual label uniqueness rule.
const labelKey=name=>name.trim().normalize('NFKC').toLowerCase();
const slotNumber=n=>Number.isInteger(n)&&n>=1&&n<=count;
const validCareer=c=>Boolean(c&&typeof c==='object'&&!Array.isArray(c)&&Number.isInteger(c.club)&&Array.isArray(c.members)&&Array.isArray(c.fixtures)&&Array.isArray(c.history)&&Array.isArray(c.roster)&&c.roster.length===12&&c.table&&typeof c.table==='object'&&c.facilities&&typeof c.facilities==='object'&&c.cup&&typeof c.cup==='object'&&Number.isFinite(c.cash)&&Number.isInteger(c.week));
const validVault=v=>Boolean(v&&v.schema===1&&slotNumber(v.active)&&Array.isArray(v.slots)&&v.slots.length===count&&v.slots.every(s=>s===null||(s&&typeof s.name==='string'&&s.name.length<=60&&typeof s.savedAt==='string'&&!Number.isNaN(Date.parse(s.savedAt))&&validCareer(s.career))));
const empty=()=>({schema:1,active:1,slots:Array(count).fill(null)});
function create(storage){
 let state=empty(),blocked=null,exists=false;
 try{const raw=storage.getItem(KEY);exists=raw!==null;if(exists){state=JSON.parse(raw);if(!validVault(state))throw Error('Invalid Career save-slot structure');}}
 catch(error){blocked=error;state=empty();}
 const check=()=>{if(blocked)throw Error('Career slots cannot be modified: '+blocked.message+'. Export your saves before recovery.');};
 function persist(next){check();if(!validVault(next))throw Error('Invalid Career save-slot update');storage.setItem(KEY,JSON.stringify(next));state=next;exists=true;}
 const get=n=>{if(!slotNumber(n))throw Error('Career slot must be 1–10');return state.slots[n-1];};
 function save(n,career,name){check();get(n);if(!validCareer(career))throw Error('Cannot save an invalid Career');const previous=get(n),label=String(name??previous?.name??('Career '+n)).trim().slice(0,60)||('Career '+n);const next=clone(state);next.active=n;next.slots[n-1]={name:label,savedAt:new Date().toISOString(),career:clone(career)};persist(next);return clone(next.slots[n-1]);}
 function load(n){check();const slot=get(n);if(!slot)throw Error('Career slot '+n+' is empty');persist({...state,active:n});return clone(slot.career);}
 // Copy a saved Career without changing the active game or overwriting another slot.
 function duplicate(n){check();const source=get(n);if(!source)throw Error('Career slot '+n+' is empty');
  const index=state.slots.findIndex(s=>s===null);
  if(index<0)throw Error('All ten Career save slots are occupied');
  const next=clone(state);
  // Keep the copy suffix visible even for 60-character names, and disambiguate repeated copies.
  let copyNumber=1,label;
  do{
   const suffix=copyNumber===1?' (copy)':` (copy ${copyNumber})`;
   const base=source.name.trim().slice(0,60-suffix.length).trimEnd()||('Career '+n);
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
  const label=name.trim().slice(0,60).trim();
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
 function importLegacy(career){check();if(exists||!validCareer(career))return false;save(1,career,'Imported legacy Career');return true;}
 return {get active(){return state.active},get error(){return blocked?.message||null},get hasVault(){return exists},list:()=>state.slots.map((s,i)=>({number:i+1,active:state.active===i+1,name:s?.name||'',savedAt:s?.savedAt||'',club:s?.career?.club??null,season:s?.career?.season??null,week:s?.career?.week??null,occupied:Boolean(s)})),firstEmpty:()=>{const i=state.slots.findIndex(s=>s===null);return i<0?null:i+1;},activeCareer:()=>blocked?null:(get(state.active)?clone(get(state.active).career):null),save,load,duplicate,rename,remove,importLegacy};
}
export const CAREER_SLOTS={create,validCareer,validVault};
