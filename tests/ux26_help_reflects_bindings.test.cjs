'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
const start=ui.indexOf('function controlHelpBindingsFor(');
const end=ui.indexOf('\nfunction showHelp(',start);
assert.ok(start>=0&&end>start,'control help binding formatter exists');
const context={};
vm.runInNewContext(ui.slice(start,end)+'\nthis.format=controlHelpBindingsFor;',context);

test('UX26 control help labels match the default Player 1 and Player 2 bindings',()=>{
 const profile={keyboard:['KeyK','KeyJ','KeyI','Space'],gamepad:[1,0,2,3],keyboard2:['Period','Comma','NumpadDecimal','ControlRight'],gamepad2:[1,0,2,3]};
 assert.deepEqual({...context.format(profile,0)},{PASS:'K / gamepad B',SHOOT:'J / gamepad A',DRIBBLE:'I / gamepad X',JUMP:'Space / gamepad Y'});
 assert.deepEqual({...context.format(profile,1)},{PASS:'Period / gamepad B',SHOOT:'Comma / gamepad A',DRIBBLE:'Keypad Decimal / gamepad X',JUMP:'Right Ctrl / gamepad Y'});
});

test('UX26 control help updates both players after keyboard and gamepad remapping',()=>{
 const profile={keyboard:['KeyQ','KeyL','Digit1','Slash'],gamepad:[4,5,6,7],keyboard2:['KeyU','KeyO','Numpad0','Numpad1'],gamepad2:[7,6,5,4]};
 assert.deepEqual({...context.format(profile,0)},{PASS:'Q / gamepad Button 4',SHOOT:'L / gamepad Button 5',DRIBBLE:'1 / gamepad Button 6',JUMP:'Slash / gamepad Button 7'});
 assert.deepEqual({...context.format(profile,1)},{PASS:'U / gamepad Button 7',SHOOT:'O / gamepad Button 6',DRIBBLE:'Numpad0 / gamepad Button 5',JUMP:'Numpad1 / gamepad Button 4'});
});

test('UX26 Controls help reads the saved profile for both player panels',()=>{
 const help=ui.slice(ui.indexOf('function showHelp('),ui.indexOf('\nfunction showEditor(',ui.indexOf('function showHelp(')));
 assert.match(help,/const bindings=input\.getBindings\(\),p1=controlHelpBindingsFor\(bindings,0\),p2=controlHelpBindingsFor\(bindings,1\)/);
 for(const action of ['PASS','SHOOT','DRIBBLE','JUMP'])assert.ok(help.includes(`p1.${action}`)&&help.includes(`p2.${action}`),`${action} help must use the mapped labels`);
});
