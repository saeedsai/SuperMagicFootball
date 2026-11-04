'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
const start=ui.indexOf('function closeNestedMenuLayer(){');
const end=ui.indexOf('\nfunction backFromMenu(',start);
assert.ok(start>=0&&end>start,'nested layer close helper exists');

test('UX26 Escape from Studio gallery closes it and restores the gallery opener focus',()=>{
 let active=null,open=true,actions=0,focused=0;
 const opener={focus(options){focused++;active=this;assert.deepEqual({...options},{preventScroll:true});}};
 const menu={querySelector(selector){if(selector==='[data-action="studioGalleryToggle"]')return opener;if(selector==='.teamBrowsePanel:not(.hidden)')return null;return null;}};
 const dialog={classList:{contains:()=>true}};
 const context={$:()=>dialog,menu,screen:'PLAYER CUSTOMIZATION',studioGalleryOpen:open,action(action){assert.equal(action,'studioGalleryToggle');actions++;open=false;context.studioGalleryOpen=false;}};
 vm.runInNewContext(ui.slice(start,end)+'\nthis.close=closeNestedMenuLayer;',context);
 assert.equal(context.close(),true);
 assert.equal(actions,1);
 assert.equal(focused,1);
 assert.equal(active,opener);
 assert.equal(context.studioGalleryOpen,false);
});
