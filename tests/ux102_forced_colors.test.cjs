'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('style.css','utf8').replace(/\r\n/g,'\n');
test('UX-102 forced-colors mode maps menus, form fields, match controls and focus to system colors',()=>{
 assert.match(css,/@media\s*\(forced-colors:\s*active\)/);
 assert.match(css,/\.menu input\[type=range\]\s*\{accent-color:Highlight!important\}/,'menu sliders use the system highlight accent in forced-colors mode');
 assert.match(css,/\.menu\s*\{[^}]*background:\s*Canvas;[^}]*color:\s*CanvasText/s);
 assert.match(css,/\.menu \.btn,\.hud button,#touchButtons \.round\s*\{[^}]*color:ButtonText!important;[^}]*background:ButtonFace!important/s);
 assert.match(css,/\.menu input:focus-visible,\.menu select:focus-visible,\.menu textarea:focus-visible,[\s\S]*?#touchButtons \.round:focus-visible\{outline:3px solid Highlight!important/s);
 assert.match(css,/#touchButtons \.round\.active\s*\{border:3px solid Highlight!important/);
});
