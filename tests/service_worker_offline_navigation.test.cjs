'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

async function offlineResponse(url,mode='navigate'){
 const listeners=new Map(),matchCalls=[],shell={body:'cached app shell'};
 const scope='https://game.test/app/';
 const caches={
  match:async request=>{const key=typeof request==='string'?request:request.url;matchCalls.push(key);return key===scope+'index.html'?shell:undefined;},
 };
 const self={location:{origin:'https://game.test'},registration:{scope},addEventListener(type,callback){listeners.set(type,callback)}};
 vm.runInNewContext(fs.readFileSync('sw.js','utf8'),{self,caches,URL,fetch:()=>Promise.reject(Error('offline')),Response:{error:()=>({body:'network error'})}});
 let responsePromise;
 listeners.get('fetch')({request:{url,method:'GET',mode},respondWith(promise){responsePromise=promise}});
 return {response:await responsePromise,matchCalls};
}

test('offline directory-root navigation falls back to the precached game shell',async()=>{
 const {response,matchCalls}=await offlineResponse('https://game.test/app/');
 assert.deepEqual(response,{body:'cached app shell'});
 assert.equal(matchCalls.at(-1),'https://game.test/app/index.html');
});

test('offline query-string navigation falls back to the precached game shell',async()=>{
 const {response}=await offlineResponse('https://game.test/app/index.html?conceptModularPreview=1');
 assert.deepEqual(response,{body:'cached app shell'});
});

test('offline non-navigation requests never receive the application HTML fallback',async()=>{
 const {response}=await offlineResponse('https://game.test/app/data/missing.json','same-origin');
 assert.deepEqual(response,{body:'network error'});
});
