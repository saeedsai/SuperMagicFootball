'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const careerApi=()=>import('../src/modules/career_slots.js').then(m=>m.CAREER_SLOTS);
const cupApi=()=>import('../src/modules/cup_slots.js').then(m=>m.CUP_SLOTS);
const memory=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};};
const career=()=>({club:2,members:[2],fixtures:[[]],history:[],roster:Array.from({length:12},(_,id)=>({id})),table:{2:{}},facilities:{},cup:{},cash:0,week:0});
const cup=()=>({id:'cup_UEFA',compId:'UEFA',club:2,participants:[2,3,4,5],phase:'league',roundIdx:0,history:[],rounds:[],groups:[],table:{2:{},3:{},4:{},5:{}},earned:0,winner:null,knockout:null});

test('Career and Cup saved labels never split a supplementary Unicode character',async()=>{
 const overLimit='x'.repeat(59)+'😀',expected='x'.repeat(59);
 const careerSlots=(await careerApi()).create(memory()),cupSlots=(await cupApi()).create(memory());
 assert.equal(careerSlots.save(1,career(),overLimit).name,expected);
 assert.equal(cupSlots.save(1,cup(),overLimit).name,expected);
});

test('Career rename truncation keeps Unicode surrogate pairs intact',async()=>{
 const slots=(await careerApi()).create(memory());slots.save(1,career(),'Career');
 assert.equal(slots.rename(1,'x'.repeat(59)+'😀').name,'x'.repeat(59));
});

test('Career and Cup copy labels preserve Unicode at the suffix boundary',async()=>{
 const slots=(await careerApi()).create(memory()),cupSlots=(await cupApi()).create(memory());
 const source='x'.repeat(52)+'😀';
 slots.save(1,career(),source);cupSlots.save(1,cup(),source);
 slots.duplicate(1);cupSlots.duplicate(1);
 const expected='x'.repeat(52)+' (copy)';
 assert.equal(slots.list()[1].name,expected);
 assert.equal(cupSlots.list()[1].name,expected);
 assert.equal(JSON.parse(JSON.stringify(slots.list()[1].name)),expected);
 assert.equal(JSON.parse(JSON.stringify(cupSlots.list()[1].name)),expected);
});
