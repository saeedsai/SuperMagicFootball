/** Account-scoped, single-flight pagination for the online match archive. */
export function createOnlineHistoryController({loadPage,isSignedIn,describeError=error=>error?.message||'Could not load online match history.'}={}){
 if(typeof loadPage!=='function'||typeof isSignedIn!=='function'||typeof describeError!=='function')
  throw new TypeError('Online match history requires page, session, and error handlers');
 let generation=0,loading=false;
 let items=[],cursor=null,status='';
 const snapshot=()=>Object.freeze({items:Object.freeze(items.slice()),cursor,status,loading});
 async function load({append=false}={}){
  if(loading)return false;
  if(!isSignedIn()){status='Sign in to view server-recorded results.';return false;}
  if(append&&!cursor){status='All available match results are already loaded.';return false;}
  const requestId=++generation;
  loading=true;status=append?'Loading more match results…':'Loading match history…';
  try{
   const page=await loadPage({limit:20,...(append?{cursor}:{})});
   if(requestId!==generation||!isSignedIn())return false;
   if(!page||!Array.isArray(page.items)||!(page.nextCursor===null||typeof page.nextCursor==='string'))
    throw new Error('The match history response was invalid.');
   if(append){
    const seen=new Set(items.map(item=>item.matchId));
    items=[...items,...page.items.filter(item=>{if(seen.has(item.matchId))return false;seen.add(item.matchId);return true;})];
   }else items=page.items.slice();
   cursor=page.nextCursor;
   status=items.length?`Loaded ${items.length} server-recorded results.`:'No completed online matches are recorded for this account yet.';
   return true;
  }catch(error){
   if(requestId===generation&&isSignedIn())status=describeError(error);
   return false;
  }finally{
   if(requestId===generation)loading=false;
  }
 }
 function reset(){generation++;loading=false;items=[];cursor=null;status='';}
 return Object.freeze({load,reset,get state(){return snapshot();}});
}
