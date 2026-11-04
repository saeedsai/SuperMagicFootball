const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

test('CT19 does not route keyboard action keys from editable fields into gameplay',async t=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document,oldNavigator=globalThis.navigator;
 const events=new Map();
 globalThis.window={addEventListener:(name,fn)=>events.set(name,fn)};
 globalThis.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[]}});
 t.after(()=>{
  if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
  if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;
  if(oldNavigator===undefined)delete globalThis.navigator;else Object.defineProperty(globalThis,'navigator',{configurable:true,value:oldNavigator});
 });
 const {Input}=await import('../src/input.js');
 const input=new Input();
 const dispatch=(code,target)=>events.get('keydown')({code,target,timeStamp:10,preventDefault(){throw new Error('editable key was intercepted');}});
 dispatch('KeyJ',{tagName:'textarea'});
 dispatch('KeyK',{tagName:'DIV',isContentEditable:true});
 input.poll();
 for(const action of ['shoot','pass']){
  assert.equal(input.just(0,action),false,`${action} should not fire while editing text`);
  assert.equal(input.held(0,action),false,`${action} should not remain held while editing text`);
 }
 const source=fs.readFileSync(path.join(__dirname,'../src/modules/input.js'),'utf8');
 assert.match(source,/\['INPUT','SELECT','TEXTAREA'\]\.includes\(tag\)\|\|target\?\.isContentEditable/,'shipped input module must preserve the editable-field filter');
});
