'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
const html=fs.readFileSync('index.html','utf8').replace(/\r\n/g,'\n');
const start=ui.indexOf('let rotateDismissed=false,rotatePromptReturnFocus=null;');
const end=ui.indexOf('\nlet last=performance.now()',start);
assert.ok(start>=0&&end>start,'orientation prompt behavior exists');

function harness(){
 const handlers={};let hidden=true,width=390,height=844,coarse=true,rotateDismissed;
 const focus=(id,hiddenAncestor=false)=>({id,isConnected:true,hiddenAncestor,focus(){context.document.activeElement=this},getClientRects(){return this.hiddenAncestor?[]:[{}]},closest(selector){return selector.includes('.hidden')&&this.hiddenAncestor?{}:null}});
 const dialog={classList:{contains(name){return name==='hidden'&&hidden},remove(name){if(name==='hidden')hidden=false},add(name){if(name==='hidden')hidden=true}},contains(target){return target?.parent==='rotate'},addEventListener(name,fn){handlers[`rotate:${name}`]=fn}};
 const dismiss=focus('dismissRotate');dismiss.parent='rotate';dismiss.addEventListener=(name,fn)=>{handlers[`dismiss:${name}`]=fn};
 const pause=focus('pauseBtn');
 const opener=focus('kickoff',true);
 const context={document:{activeElement:opener},getComputedStyle:target=>({display:target?.hiddenAncestor?'none':'block',visibility:'visible'}),menuVisible:()=>false,menu:{querySelector:()=>null},handlers,$:id=>id==='rotate'?dialog:id==='dismissRotate'?dismiss:id==='pauseBtn'?pause:null,matchMedia:()=>({matches:coarse}),get innerWidth(){return width},get innerHeight(){return height}};
 vm.runInNewContext(ui.slice(start,end)+'\nthis.checkRotate=checkRotate;this.dismissRotatePrompt=dismissRotatePrompt;this.isRotateDismissed=()=>rotateDismissed;this.handlers=handlers;',context);
 return {context,dialog,dismiss,pause,opener,handlers,setViewport(w,h){width=w;height=h},setCoarse(v){coarse=v},isHidden(){return hidden}};
}

test('UX26 portrait recommendation has dialog name and description semantics',()=>{
 const node=html.slice(html.indexOf('<div id="rotate"'),html.indexOf('</button></div>',html.indexOf('<div id="rotate"'))+'</button></div>'.length);
 assert.match(node,/role="dialog"/);
 assert.match(node,/aria-modal="true"/);
 assert.match(node,/aria-labelledby="rotateTitle"/);
 assert.match(node,/aria-describedby="rotateDescription"/);
 assert.match(node,/<strong id="rotateTitle">LANDSCAPE RECOMMENDED<\/strong>/);
 assert.match(node,/<span id="rotateDescription">[^<]*still playable vertically/);
 assert.match(node,/<button type="button" id="dismissRotate">PLAY ANYWAY<\/button>/);
});

test('UX26 orientation prompt focuses on entry, contains Tab, restores safely, and preserves dismissal semantics',()=>{
 const h=harness();
 h.context.checkRotate();
 assert.equal(h.isHidden(),false);
 assert.equal(h.context.document.activeElement,h.dismiss,'showing the prompt focuses its only action');
 const tab={key:'Tab',preventDefault(){this.prevented=true},stopPropagation(){}};
 h.handlers['rotate:keydown'](tab);
 assert.equal(tab.prevented,true);
 assert.equal(h.context.document.activeElement,h.dismiss,'Tab remains in the modal');
 const gameplayKey={key:'KeyK',preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true}};
 h.handlers['rotate:keydown'](gameplayKey);
 assert.equal(gameplayKey.prevented,true);assert.equal(gameplayKey.stopped,true,'gameplay keys must not escape the modal');
 const escape={key:'Escape',preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true}};
 h.handlers['rotate:keydown'](escape);
 assert.equal(escape.prevented,true);assert.equal(escape.stopped,true);
 assert.equal(h.isHidden(),true);
 assert.equal(h.context.document.activeElement,h.pause,'a hidden menu opener is not refocused');
 assert.equal(h.context.isRotateDismissed(),true,'Escape has the same once-per-session dismissal as the button');
 h.setViewport(844,390);h.context.checkRotate();h.setViewport(390,844);h.context.checkRotate();
 assert.equal(h.isHidden(),true,'dismissal persists for the current page session');
});

test('UX26 automatic landscape hide restores focus without marking the prompt dismissed',()=>{
 const h=harness();
 h.context.checkRotate();
 assert.equal(h.context.document.activeElement,h.dismiss);
 h.setViewport(844,390);h.context.checkRotate();
 assert.equal(h.isHidden(),true);
 assert.equal(h.context.document.activeElement,h.pause,'focus moves to a visible game control when the opener is hidden');
 assert.equal(h.context.isRotateDismissed(),false,'automatic orientation changes do not count as user dismissal');
 h.setViewport(390,844);h.context.checkRotate();
 assert.equal(h.isHidden(),false,'the prompt can appear again if portrait returns without dismissal');
 assert.equal(h.context.document.activeElement,h.dismiss);
});
