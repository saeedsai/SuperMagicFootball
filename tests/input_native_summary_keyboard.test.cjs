const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/input.js'),'utf8').replace(/export \{INPUT\};\s*$/,'globalThis.__INPUT=INPUT;');
function inputHarness(){
 const listeners={};
 const window={addEventListener:(type,fn)=>{(listeners[type]??=[]).push(fn)}};
 const document={addEventListener:()=>{},querySelector:()=>null,querySelectorAll:()=>[]};
 const sandbox={window,document,console,Date,Number,Set,Map,Array,Object,Math};
 vm.runInNewContext(source,sandbox,{filename:'input.js'});
 const input=new sandbox.__INPUT.Input();
 const send=(type,code,target)=>{let prevented=false;const event={code,target,timeStamp:10,preventDefault(){prevented=true}};for(const fn of listeners[type]??[])fn(event);return prevented;};
 return {input,send};
}
test('focused native summary keeps Space activation and never queues gameplay Jump',()=>{
 const {input,send}=inputHarness();
 const summary={tagName:'SUMMARY',isContentEditable:false,closest:selector=>selector.includes('summary')?summary:null};
 assert.equal(send('keydown','Space',summary),false);
 assert.equal(input.keys.has('Space'),false);
 assert.equal(input.keyPending.has('Space'),false);
 assert.equal(send('keyup','Space',summary),false);
 assert.equal(input.keyPulsePending.has('Space'),false);
});
test('unfocused gameplay Space remains captured and prevents page scrolling',()=>{
 const {input,send}=inputHarness();
 const canvas={tagName:'CANVAS',isContentEditable:false,closest:()=>null};
 assert.equal(send('keydown','Space',canvas),true);
 assert.equal(input.keys.has('Space'),true);
 assert.equal(send('keyup','Space',canvas),false);
 assert.equal(input.keys.has('Space'),false);
 assert.equal(input.keyPulsePending.has('Space'),true);
});
test('native buttons and editable fields do not consume Space as gameplay',()=>{
 const {input,send}=inputHarness();
 const button={tagName:'BUTTON',closest:selector=>selector.includes('button')?button:null};
 const field={tagName:'INPUT',closest:()=>null};
 assert.equal(send('keydown','Space',button),false);
 assert.equal(send('keydown','Space',field),false);
 assert.equal(input.keys.has('Space'),false);
});

test('data-act control without closest selector match never triggers global Jump',()=>{
 const {input,send}=inputHarness();
 const action={dataset:{act:'shoot'},closest:()=>null};
 assert.equal(send('keydown','Space',action),false);
 assert.equal(send('keyup','Space',action),false);
 assert.equal(input.keys.has('Space'),false);
 assert.equal(input.keyPulsePending.has('Space'),false);
});

test('nested action labels and accessible role buttons preserve Space without ghost Jump',()=>{
 const {input,send}=inputHarness();
 const action={tagName:'BUTTON',dataset:{act:'pass'}};
 const nested={tagName:'SPAN',closest:selector=>selector.includes('[data-act]')?action:null};
 const role={tagName:'DIV',closest:selector=>selector.includes('[role="button"]')?role:null};
 for(const target of [nested,role]){
  assert.equal(send('keydown','Space',target),false);
  assert.equal(send('keyup','Space',target),false);
  assert.equal(input.keys.has('Space'),false);
  assert.equal(input.keyPending.has('Space'),false);
  assert.equal(input.keyPulsePending.has('Space'),false);
 }
 const canvas={tagName:'CANVAS',closest:()=>null};
 assert.equal(send('keydown','Space',canvas),true,'canvas retains the gameplay binding');
 assert.equal(input.keys.has('Space'),true);
 assert.equal(send('keyup','Space',canvas),false);
 assert.equal(input.keyPulsePending.has('Space'),true,'subsequent gameplay tap still reaches Jump');
});
