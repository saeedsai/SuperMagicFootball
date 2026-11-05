const test=require('node:test');
const assert=require('node:assert/strict');

function memory(){
 const data=new Map();
 return {getItem:key=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
}
function campaign(club){
 return {id:'cup_UEFA',compId:'UEFA',club,participants:[club,3,4,5],phase:'league',roundIdx:0,history:[],rounds:[],groups:[],table:{[club]:{},3:{},4:{},5:{}},earned:0,winner:null,knockout:null};
}

test('SAVE-103 stale tab cannot overwrite a Cup save written after its snapshot',async()=>{
 const {CUP_SLOTS}=await import('../src/modules/cup_slots.js');
 const storage=memory(),current=CUP_SLOTS.create(storage),stale=CUP_SLOTS.create(storage);
 current.save(1,campaign(2),'Current tab');
 const committed=storage.getItem('legend_cupSlots');

 assert.throws(()=>stale.save(2,campaign(9),'Stale tab'),/changed elsewhere/);
 assert.equal(storage.getItem('legend_cupSlots'),committed,'rejected stale write leaves the newer bytes intact');
 assert.match(stale.error,/another tab/,'the stale vault is blocked with an actionable error');
 const reopened=CUP_SLOTS.create(storage);
 assert.deepEqual(reopened.list().filter(slot=>slot.occupied).map(slot=>[slot.number,slot.name]),[[1,'Current tab']]);
});
