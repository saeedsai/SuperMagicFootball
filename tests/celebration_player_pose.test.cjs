'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const art=fs.readFileSync('src/modules/characterart.js','utf8');
const renderer=fs.readFileSync('src/modules/render.js','utf8');
const appRenderer=fs.readFileSync('src/render.js','utf8');
const arm=art.slice(art.indexOf(' function arm('),art.indexOf('\n function jersey(',art.indexOf(' function arm(')));

test('twenty-five goal-call styles map to distinct arm-only celebration poses',()=>{
 for(const label of ['champion dance','human-pyramid brace','victory-lap pump','superstar pose','goal party','team wave parade','victory V','fan parade','respectful bow','kickoff spin','one-knee prayer','shoulder surf','double fist pump','wave to crowd','heart hands','elbow pump','calm it','sky point','badge kiss','open arms','side shuffle','salute to fans','cross-chest fist','sideline point','victory spread'])assert.ok(arm.includes(label),label);
 assert.match(arm,/const cheering=!!opt\.celebrate&&!p\.keeper/);
 assert.match(arm,/style===0[\s\S]*?style===1[\s\S]*?style===2[\s\S]*?style===3[\s\S]*?style===4[\s\S]*?style===5[\s\S]*?style===6[\s\S]*?style===7[\s\S]*?style===8[\s\S]*?style===9[\s\S]*?style===10[\s\S]*?style===11[\s\S]*?style===12[\s\S]*?style===13[\s\S]*?style===14[\s\S]*?style===15[\s\S]*?style===16[\s\S]*?style===17[\s\S]*?style===18[\s\S]*?style===19[\s\S]*?style===20[\s\S]*?style===21[\s\S]*?style===22[\s\S]*?style===23[\s\S]*?else cheerPose=/);
 for(const label of ['elbow','hand'])assert.ok(arm.includes(label));
});

test('fifteen opponent disappointment styles map to varied arm-only reactions',()=>{
 for(const label of ['hands to head','shoulders dropped','wipe away tears','palms up','arms folded','turn away','frustrated clap','point to ground','cover face','protest to referee','clutch chest','disbelief spread','hands on hips','one-arm shrug','temple press'])assert.ok(arm.includes(label),label);
 assert.match(arm,/crying=!!opt\.cry&&!p\.keeper/);
 assert.match(arm,/reaction===0[\s\S]*?reaction===1[\s\S]*?reaction===2[\s\S]*?reaction===3[\s\S]*?reaction===4[\s\S]*?reaction===5[\s\S]*?reaction===6[\s\S]*?reaction===7[\s\S]*?reaction===8[\s\S]*?reaction===9[\s\S]*?reaction===10[\s\S]*?reaction===11[\s\S]*?reaction===12[\s\S]*?reaction===13[\s\S]*?else cheerPose=/);
});

test('actual draw path varies celebration poses deterministically by player index',()=>{
 assert.match(renderer,/CHARACTER_ART\.draw\(ctx,p,av,team,view,\{[^}]*celebrate:p\.action==='celebrate',celebrationStyle:\(game\.celebrationStyle\+\(Number\.isInteger\(p\.i\)\?p\.i:0\)\)%25/);
 assert.match(appRenderer,/const styles=\['CHAMPION DANCE!','THE HUMAN PYRAMID!','SILLY VICTORY LAP!','SUPER STAR POSE!','GOAL PARTY!','TEAM WAVE!','VICTORY V!','FAN PARADE!','RESPECTFUL BOW!','KICKOFF SPIN!','ONE-KNEE PRAYER!','SHOULDER SURF!','DOUBLE FIST PUMP!','WAVE TO THE CROWD!','HEART HANDS!','ELBOW PUMP!','CALM IT!','SKY POINT!','BADGE KISS!','OPEN ARMS!','SIDE SHUFFLE!','SALUTE TO FANS!','CROSS-CHEST FIST!','SIDELINE POINT!','VICTORY SPREAD!'\]/);
});

test('gesture implementation does not add gameplay controls or mutate player/ball state',()=>{
 assert.doesNotMatch(arm,/p\.[A-Za-z_$][\w$]*\s*=/);
 assert.doesNotMatch(arm,/game\.|ball|hitbox|physics/i);
 const html=fs.readFileSync('index.html','utf8');
 assert.deepEqual([...html.matchAll(/<button data-act="(pass|shoot|dribble|jump)"/g)].map(m=>m[1]).sort(),['dribble','jump','pass','shoot']);
});
